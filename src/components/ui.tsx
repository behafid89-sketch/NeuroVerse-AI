import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { palettes, radius, type Palette } from '../theme';
import { useStore } from '../store';
import type { Item } from '../data/worlds';

export function usePalette(): Palette {
  return palettes[useStore().settings.sensory];
}

export function useAnimationsOn(): boolean {
  const s = useStore().settings;
  return s.animations && s.sensory !== 'calme';
}

/* ---------------- Fond spatial : dégradé + étoiles scintillantes ---------------- */

export function SpaceBackground({ children }: { children: React.ReactNode }) {
  const p = usePalette();
  const anim = useAnimationsOn();
  const { width, height } = useWindowDimensions();
  const stars = useMemo(
    () =>
      Array.from({ length: 46 }, (_, i) => ({
        key: i,
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.4 + 0.8,
        delay: Math.random() * 3000,
      })),
    [width, height],
  );
  return (
    <LinearGradient colors={[p.bg1, p.bg2, p.bg3]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {stars.map((s) => (
          <Star key={s.key} {...s} color={p.star} animate={anim} />
        ))}
        <View style={[styles.nebula, { backgroundColor: p.glow, top: -120, right: -100 }]} />
        <View style={[styles.nebula, { backgroundColor: p.glow, bottom: -160, left: -120, opacity: 0.5 }]} />
      </View>
      {children}
    </LinearGradient>
  );
}

function Star({ x, y, size, delay, color, animate }: { x: number; y: number; size: number; delay: number; color: string; animate: boolean }) {
  const o = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    if (!animate) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(o, { toValue: 1, duration: 1600, useNativeDriver: true }),
        Animated.timing(o, { toValue: 0.25, duration: 1600, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [animate]);
  return (
    <Animated.View
      style={{ position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: size, backgroundColor: color, opacity: o }}
    />
  );
}

/* ---------------- Bouton holographique géant ---------------- */

type HoloProps = {
  onPress?: () => void;
  onLongPress?: () => void;
  delayLongPress?: number;
  style?: StyleProp<ViewStyle>;
  colors?: [string, string];
  children: React.ReactNode;
  accessibilityLabel?: string;
  disabled?: boolean;
};

export function HoloButton({ onPress, onLongPress, delayLongPress, style, colors, children, accessibilityLabel, disabled }: HoloProps) {
  const p = usePalette();
  const anim = useAnimationsOn();
  const scale = useRef(new Animated.Value(1)).current;
  const to = (v: number) => Animated.spring(scale, { toValue: v, useNativeDriver: true, speed: 30, bounciness: 8 }).start();
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={delayLongPress}
      onPressIn={() => anim && to(0.94)}
      onPressOut={() => anim && to(1)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={style}
    >
      <Animated.View style={{ transform: [{ scale }], flex: 1 }}>
        <LinearGradient
          colors={colors ? [colors[0] + '55', colors[1] + '22'] : [p.cardStrong, p.card]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.holo, { borderColor: colors ? colors[0] + 'AA' : p.border, shadowColor: colors ? colors[0] : p.accent }]}
        >
          <View style={[styles.sheen]} pointerEvents="none" />
          {children}
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

export function Title({ children, size = 26 }: { children: React.ReactNode; size?: number }) {
  const p = usePalette();
  return <Text style={{ color: p.text, fontSize: size, fontWeight: '800', letterSpacing: 0.3 }}>{children}</Text>;
}

export function Dim({ children, style }: { children: React.ReactNode; style?: any }) {
  const p = usePalette();
  return <Text style={[{ color: p.textDim, fontSize: 15 }, style]}>{children}</Text>;
}

/* ---------------- Visuel d'un élément (émoji, couleur, chiffre, lettre) ---------------- */

export function ItemVisual({ item, size = 72 }: { item: Item; size?: number }) {
  if (item.color) {
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: item.color,
          borderWidth: 3,
          borderColor: 'rgba(255,255,255,0.55)',
        }}
      />
    );
  }
  if (item.dots) {
    return (
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: size * 0.8, fontWeight: '900', color: '#fff' }}>{item.glyph}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: size * 1.3, justifyContent: 'center' }}>
          {Array.from({ length: item.dots }).map((_, i) => (
            <View key={i} style={{ width: size / 7, height: size / 7, borderRadius: size, backgroundColor: '#FFD666', margin: 2 }} />
          ))}
        </View>
      </View>
    );
  }
  if (item.glyph) {
    return <Text style={{ fontSize: size, fontWeight: '900', color: '#fff' }}>{item.glyph}</Text>;
  }
  return <Text style={{ fontSize: size }}>{item.emoji}</Text>;
}

const styles = StyleSheet.create({
  nebula: { position: 'absolute', width: 340, height: 340, borderRadius: 340, opacity: 0.35 },
  holo: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    overflow: 'hidden',
    shadowOpacity: 0.6,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
});

export { Easing };
