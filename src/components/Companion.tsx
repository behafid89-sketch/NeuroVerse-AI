// Nova : le compagnon. Une sphère holographique avec des yeux qui clignent,
// qui flotte doucement et parle avec des phrases courtes.
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { usePalette, useAnimationsOn } from './ui';

export type Mood = 'idle' | 'happy' | 'calm';

export function Companion({ size = 120, message, mood = 'idle' }: { size?: number; message?: string; mood?: Mood }) {
  const p = usePalette();
  const anim = useAnimationsOn();
  const float = useRef(new Animated.Value(0)).current;
  const blink = useRef(new Animated.Value(1)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const bounce = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!anim) return;
    const f = Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    const b = Animated.loop(
      Animated.sequence([
        Animated.delay(2800),
        Animated.timing(blink, { toValue: 0.1, duration: 90, useNativeDriver: true }),
        Animated.timing(blink, { toValue: 1, duration: 120, useNativeDriver: true }),
      ]),
    );
    const pl = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ]),
    );
    f.start();
    b.start();
    pl.start();
    return () => {
      f.stop();
      b.stop();
      pl.stop();
    };
  }, [anim]);

  useEffect(() => {
    if (mood === 'happy' && anim) {
      Animated.sequence([
        Animated.spring(bounce, { toValue: 1.18, useNativeDriver: true, speed: 20 }),
        Animated.spring(bounce, { toValue: 1, useNativeDriver: true, speed: 12 }),
      ]).start();
    }
  }, [mood, message]);

  const translateY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });
  const haloScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] });
  const haloOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0.15] });
  const eye = size * 0.11;

  return (
    <View style={{ alignItems: 'center' }}>
      {message ? (
        <View style={[styles.bubble, { backgroundColor: p.cardStrong, borderColor: p.border }]}>
          <Text style={{ color: p.text, fontSize: 19, fontWeight: '700', textAlign: 'center' }}>{message}</Text>
        </View>
      ) : null}
      <Animated.View style={{ transform: [{ translateY }, { scale: bounce }], alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View
          style={{
            position: 'absolute',
            width: size * 1.3,
            height: size * 1.3,
            borderRadius: size,
            backgroundColor: p.glow,
            opacity: haloOpacity,
            transform: [{ scale: haloScale }],
          }}
        />
        <LinearGradient
          colors={[p.accent, p.accent2]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}
        >
          <View style={[styles.shine, { width: size * 0.35, height: size * 0.18, borderRadius: size, top: size * 0.12, left: size * 0.2 }]} />
          <View style={{ flexDirection: 'row', gap: size * 0.18, marginTop: -size * 0.04 }}>
            <Animated.View style={{ width: eye, height: eye * 1.4, borderRadius: eye, backgroundColor: '#0B1030', transform: [{ scaleY: blink }] }} />
            <Animated.View style={{ width: eye, height: eye * 1.4, borderRadius: eye, backgroundColor: '#0B1030', transform: [{ scaleY: blink }] }} />
          </View>
          <View
            style={{
              marginTop: size * 0.07,
              width: mood === 'happy' ? size * 0.3 : size * 0.2,
              height: mood === 'happy' ? size * 0.14 : size * 0.06,
              borderBottomLeftRadius: size,
              borderBottomRightRadius: size,
              backgroundColor: '#0B1030',
            }}
          />
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    borderWidth: 1.5,
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 18,
    maxWidth: 320,
  },
  shine: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.45)', transform: [{ rotate: '-20deg' }] },
});
