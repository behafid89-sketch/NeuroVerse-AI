// Coin calme : un cercle qui grandit et rétrécit pour guider la respiration.
// Aucune consigne obligatoire, aucune limite de temps.
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../store';
import { t } from '../i18n';
import { say } from '../speech';
import { usePalette } from '../components/ui';
import { TopBar } from '../components/TopBar';

export default function CalmScreen() {
  const p = usePalette();
  const L = t(useStore().settings.lang);
  const v = useRef(new Animated.Value(0)).current;
  const [phase, setPhase] = useState<'in' | 'out'>('in');

  useEffect(() => {
    say(L.breathe);
    let alive = true;
    const cycle = () => {
      if (!alive) return;
      setPhase('in');
      Animated.timing(v, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }).start(() => {
        if (!alive) return;
        setPhase('out');
        Animated.timing(v, { toValue: 0, duration: 5000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }).start(cycle);
      });
    };
    cycle();
    return () => {
      alive = false;
      v.stopAnimation();
    };
  }, []);

  const scale = v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.15] });
  const opacity = v.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0.95] });

  return (
    <View style={{ flex: 1 }}>
      <TopBar title={L.calm} showStop={false} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 100 }}>
        <Animated.View style={{ transform: [{ scale }], opacity }}>
          <LinearGradient
            colors={[p.accent, p.accent2]}
            style={{ width: 240, height: 240, borderRadius: 120, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ fontSize: 26, fontWeight: '800', color: '#0B1030' }}>{phase === 'in' ? L.breatheIn : L.breatheOut}</Text>
          </LinearGradient>
        </Animated.View>
        <Text style={{ color: p.textDim, fontSize: 18, marginTop: 50 }}>{L.breathe}</Text>
      </View>
    </View>
  );
}
