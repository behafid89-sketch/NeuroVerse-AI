import React, { useEffect, useRef } from 'react';
import { Animated, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useNav } from '../nav';
import { useStore } from '../store';
import { t } from '../i18n';
import { say } from '../speech';
import { WORLDS } from '../data/worlds';
import { HoloButton, usePalette, useAnimationsOn } from '../components/ui';
import { TopBar } from '../components/TopBar';

/** Carte « planète » avec légère rotation en perspective (effet pseudo-3D). */
function Planet({ index, children }: { index: number; children: React.ReactNode }) {
  const anim = useAnimationsOn();
  const v = useRef(new Animated.Value(0)).current;
  const enter = useRef(new Animated.Value(anim ? 0 : 1)).current;
  useEffect(() => {
    if (!anim) return;
    Animated.timing(enter, { toValue: 1, duration: 500, delay: index * 70, useNativeDriver: true }).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 3000 + index * 200, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 3000 + index * 200, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);
  const rotateY = v.interpolate({ inputRange: [0, 1], outputRange: ['-6deg', '6deg'] });
  const translateY = enter.interpolate({ inputRange: [0, 1], outputRange: [40, 0] });
  return (
    <Animated.View style={{ flex: 1, opacity: enter, transform: [{ perspective: 800 }, { rotateY }, { translateY }] }}>
      {children}
    </Animated.View>
  );
}

export default function WorldsScreen() {
  const s = useStore();
  const p = usePalette();
  const nav = useNav();
  const { width } = useWindowDimensions();
  const lang = s.settings.lang;
  const cols = width > 700 ? 3 : 2;
  const worlds = WORLDS.filter((w) => !s.disabledWorlds.includes(w.id));
  const rows: (typeof worlds)[] = [];
  for (let i = 0; i < worlds.length; i += cols) rows.push(worlds.slice(i, i + cols));

  return (
    <View style={{ flex: 1 }}>
      <TopBar title={t(lang).chooseWorld} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 130, gap: 14 }}>
        {rows.map((row, r) => (
          <View key={r} style={{ flexDirection: 'row', gap: 14 }}>
            {row.map((w, i) => (
              <Planet key={w.id} index={r * cols + i}>
                <HoloButton
                  colors={w.hue}
                  style={{ minHeight: 160 }}
                  onPress={() => {
                    say(w[lang]);
                    nav.go({ name: 'world', id: w.id });
                  }}
                  accessibilityLabel={w[lang]}
                >
                  <Text style={{ fontSize: 60 }}>{w.icon}</Text>
                  <Text style={{ color: p.text, fontSize: 19, fontWeight: '800', marginTop: 6, textAlign: 'center' }}>{w[lang]}</Text>
                  <View style={{ flexDirection: 'row', gap: 4, marginTop: 6 }}>
                    {Array.from({ length: 5 }).map((_, k) => (
                      <View
                        key={k}
                        style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: k < (s.worlds[w.id]?.level || 1) ? w.hue[0] : 'rgba(255,255,255,0.15)' }}
                      />
                    ))}
                  </View>
                </HoloButton>
              </Planet>
            ))}
            {row.length < cols && Array.from({ length: cols - row.length }).map((_, k) => <View key={'e' + k} style={{ flex: 1 }} />)}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
