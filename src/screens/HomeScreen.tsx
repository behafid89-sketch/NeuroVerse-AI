import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useNav } from '../nav';
import { useStore, getState } from '../store';
import { t } from '../i18n';
import { say } from '../speech';
import { Companion } from '../components/Companion';
import { HoloButton, usePalette } from '../components/ui';
import { suggestWorld } from '../engine/adaptive';
import { getWorld } from '../data/worlds';

let greetedThisLaunch = false;

export default function HomeScreen() {
  const s = useStore();
  const p = usePalette();
  const nav = useNav();
  const { width } = useWindowDimensions();
  const L = t(s.settings.lang);
  const lang = s.settings.lang;
  const name = s.settings.childName;
  const [suggest] = useState(() => suggestWorld(getState()));
  const world = getWorld(suggest);
  const greeting = `${L.hello}${name ? ' ' + name : ''} !`;

  useEffect(() => {
    if (!greetedThisLaunch) {
      greetedThisLaunch = true;
      setTimeout(() => say(`${greeting} ${L.welcome}`), 500);
    }
  }, []);

  const wide = width > 700;
  const tile = { flex: 1, minHeight: wide ? 170 : 140 };

  return (
    <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 130 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: p.textDim, fontSize: 14, fontWeight: '700', letterSpacing: 3 }}>NEUROVERSE</Text>
        <ParentGate onOpen={() => nav.go({ name: 'parent' })} />
      </View>

      <Pressable onPress={() => say(`${greeting} ${L.welcome}`, { force: false })} style={{ alignItems: 'center', marginVertical: 18 }}>
        <Companion size={wide ? 150 : 120} message={greeting} />
      </Pressable>

      {!s.disabledWorlds.includes(world.id) && (
        <HoloButton
          colors={world.hue}
          style={{ minHeight: 110, marginBottom: 14 }}
          onPress={() => {
            say(`${L.suggestion} ${world[lang]}`);
            nav.go({ name: 'world', id: world.id });
          }}
          accessibilityLabel={world[lang]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <Text style={{ fontSize: 54 }}>{world.icon}</Text>
            <View>
              <Text style={{ color: p.textDim, fontSize: 15 }}>{L.suggestion}</Text>
              <Text style={{ color: p.text, fontSize: 26, fontWeight: '800' }}>{world[lang]}</Text>
            </View>
          </View>
        </HoloButton>
      )}

      <View style={{ flexDirection: 'row', gap: 14, marginBottom: 14 }}>
        <HoloButton style={tile} colors={['#5EE7FF', '#3D7BFF']} onPress={() => { say(L.worlds); nav.go({ name: 'worlds' }); }}>
          <Text style={{ fontSize: 56 }}>🪐</Text>
          <Text style={{ color: p.text, fontSize: 22, fontWeight: '800', marginTop: 6 }}>{L.worlds}</Text>
        </HoloButton>
        <HoloButton style={tile} colors={['#FFD666', '#FF8A5B']} onPress={() => { say(L.talk); nav.openCaa(); }}>
          <Text style={{ fontSize: 56 }}>💬</Text>
          <Text style={{ color: p.text, fontSize: 22, fontWeight: '800', marginTop: 6 }}>{L.talk}</Text>
        </HoloButton>
      </View>
      <HoloButton style={{ minHeight: 100 }} colors={['#A9C6A4', '#6CA6C1']} onPress={() => { say(L.calm); nav.go({ name: 'calm' }); }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Text style={{ fontSize: 46 }}>🌙</Text>
          <Text style={{ color: p.text, fontSize: 22, fontWeight: '800' }}>{L.calm}</Text>
        </View>
      </HoloButton>
    </ScrollView>
  );
}

/** Accès parents : appui maintenu 3 secondes (évite les ouvertures accidentelles). */
function ParentGate({ onOpen }: { onOpen: () => void }) {
  const p = usePalette();
  const lang = useStore().settings.lang;
  const progress = useRef(new Animated.Value(0)).current;
  const [holding, setHolding] = useState(false);
  const start = () => {
    setHolding(true);
    Animated.timing(progress, { toValue: 1, duration: 3000, useNativeDriver: false }).start(({ finished }) => {
      setHolding(false);
      progress.setValue(0);
      if (finished) onOpen();
    });
  };
  const cancel = () => {
    progress.stopAnimation();
    progress.setValue(0);
    setHolding(false);
  };
  return (
    <Pressable onPressIn={start} onPressOut={cancel} accessibilityLabel="Espace parents" style={{ alignItems: 'flex-end' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: p.border, backgroundColor: p.card, overflow: 'hidden' }}>
        <Animated.View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            backgroundColor: p.glow,
            width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
          }}
        />
        <Text style={{ fontSize: 16 }}>🔒</Text>
        <Text style={{ color: p.textDim, fontSize: 13, fontWeight: '700' }}>
          {holding ? t(lang).holdToOpen : t(lang).parents}
        </Text>
      </View>
    </Pressable>
  );
}
