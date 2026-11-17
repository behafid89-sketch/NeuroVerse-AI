import React from 'react';
import { Text, View } from 'react-native';
import { useNav } from '../nav';
import { useStore } from '../store';
import { t } from '../i18n';
import { say } from '../speech';
import { getWorld } from '../data/worlds';
import { HoloButton, usePalette } from '../components/ui';
import { TopBar } from '../components/TopBar';

export default function WorldMenuScreen({ id }: { id: string }) {
  const s = useStore();
  const p = usePalette();
  const nav = useNav();
  const w = getWorld(id);
  const L = t(s.settings.lang);
  const modes = [
    { key: 'explore' as const, icon: '🔭', label: L.explore },
    { key: 'find' as const, icon: '🎯', label: L.find },
    { key: 'match' as const, icon: '🧲', label: L.match },
  ];
  return (
    <View style={{ flex: 1 }}>
      <TopBar title={`${w.icon}  ${w[s.settings.lang]}`} />
      <View style={{ flex: 1, padding: 18, gap: 16, paddingBottom: 130 }}>
        {modes.map((m) => (
          <HoloButton
            key={m.key}
            colors={w.hue}
            style={{ flex: 1, maxHeight: 170 }}
            onPress={() => {
              say(m.label);
              nav.go({ name: m.key, id });
            }}
            accessibilityLabel={m.label}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
              <Text style={{ fontSize: 56 }}>{m.icon}</Text>
              <Text style={{ color: p.text, fontSize: 28, fontWeight: '800' }}>{m.label}</Text>
            </View>
          </HoloButton>
        ))}
      </View>
    </View>
  );
}
