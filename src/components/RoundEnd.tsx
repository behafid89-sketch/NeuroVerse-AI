import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { useNav } from '../nav';
import { useStore } from '../store';
import { t } from '../i18n';
import { say } from '../speech';
import { Companion } from './Companion';
import { HoloButton, usePalette } from './ui';

/** Fin de partie : l'enfant choisit librement de continuer ou de faire une pause. */
export function RoundEnd({ onAgain }: { onAgain: () => void }) {
  const p = usePalette();
  const nav = useNav();
  const L = t(useStore().settings.lang);
  useEffect(() => {
    say(L.roundDone);
  }, []);
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 26, paddingBottom: 120 }}>
      <Companion size={130} mood="happy" message={L.roundDone} />
      <View style={{ flexDirection: 'row', gap: 16, alignSelf: 'stretch' }}>
        <HoloButton style={{ flex: 1, height: 140 }} colors={['#6CF2B0', '#5EE7FF']} onPress={() => { say(L.again); onAgain(); }}>
          <Text style={{ fontSize: 48 }}>🔁</Text>
          <Text style={{ color: p.text, fontSize: 22, fontWeight: '800' }}>{L.again}</Text>
        </HoloButton>
        <HoloButton style={{ flex: 1, height: 140 }} colors={['#A9C6A4', '#6CA6C1']} onPress={() => { say(L.pause); nav.home(); }}>
          <Text style={{ fontSize: 48 }}>🌙</Text>
          <Text style={{ color: p.text, fontSize: 22, fontWeight: '800' }}>{L.pause}</Text>
        </HoloButton>
      </View>
    </View>
  );
}
