// Mode Explorer : aucune consigne, aucun échec possible. L'enfant touche,
// l'objet tourne en 3D (perspective) et son nom est prononcé.
import React, { useRef } from 'react';
import { Animated, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../store';
import { t } from '../i18n';
import { say } from '../speech';
import { getWorld, itemsFor, type Item } from '../data/worlds';
import { ItemVisual, usePalette, useAnimationsOn } from '../components/ui';
import { TopBar } from '../components/TopBar';
import { useWorldSession } from '../engine/session';

function ExploreCard({ item, hue, size }: { item: Item; hue: [string, string]; size: number }) {
  const p = usePalette();
  const anim = useAnimationsOn();
  const lang = useStore().settings.lang;
  const spin = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const onPress = () => {
    say(item[lang]);
    if (!anim) return;
    spin.setValue(0);
    Animated.parallel([
      Animated.timing(spin, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.15, useNativeDriver: true, speed: 30 }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 12 }),
      ]),
    ]).start();
  };
  const rotateY = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <Pressable onPress={onPress} accessibilityLabel={item[lang]} style={{ width: size, height: size + 34, alignItems: 'center' }}>
      <Animated.View style={{ transform: [{ perspective: 600 }, { rotateY }, { scale }] }}>
        <LinearGradient
          colors={[hue[0] + '44', hue[1] + '18']}
          style={{ width: size, height: size, borderRadius: 26, borderWidth: 1.5, borderColor: hue[0] + '99', alignItems: 'center', justifyContent: 'center' }}
        >
          <ItemVisual item={item} size={size * 0.5} />
        </LinearGradient>
      </Animated.View>
      <Text numberOfLines={1} style={{ color: p.text, fontSize: 15, fontWeight: '700', marginTop: 6 }}>
        {item[lang]}
      </Text>
    </Pressable>
  );
}

export default function ExploreScreen({ id }: { id: string }) {
  const s = useStore();
  const { width } = useWindowDimensions();
  const w = getWorld(id);
  const lang = s.settings.lang;
  useWorldSession(id);
  const cols = width > 700 ? 4 : 3;
  const size = Math.min(170, (width - 32 - (cols - 1) * 12) / cols);
  return (
    <View style={{ flex: 1 }}>
      <TopBar title={`${t(lang).explore} · ${w[lang]}`} />
      <ScrollView contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: 16, paddingBottom: 130 }}>
        {itemsFor(w, lang).map((item) => (
          <ExploreCard key={item.id} item={item} hue={w.hue} size={size} />
        ))}
      </ScrollView>
    </View>
  );
}
