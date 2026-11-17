import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useNav } from '../nav';
import { useStore } from '../store';
import { t } from '../i18n';
import { say } from '../speech';
import { usePalette } from './ui';

/**
 * Barre du haut des écrans enfant : retour, titre, et bouton « Je ne veux pas »
 * qui respecte le refus de l'enfant (retour à l'accueil, sans pénalité).
 */
export function TopBar({ title, showStop = true }: { title?: string; showStop?: boolean }) {
  const p = usePalette();
  const nav = useNav();
  const lang = useStore().settings.lang;
  const L = t(lang);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: 6, gap: 10 }}>
      <Pressable
        onPress={nav.back}
        accessibilityLabel={L.back}
        style={{ width: 58, height: 58, borderRadius: 29, backgroundColor: p.cardStrong, borderWidth: 1.5, borderColor: p.border, alignItems: 'center', justifyContent: 'center' }}
      >
        <Text style={{ fontSize: 28, color: p.text }}>←</Text>
      </Pressable>
      <Text numberOfLines={1} style={{ flex: 1, color: p.text, fontSize: 22, fontWeight: '800' }}>
        {title}
      </Text>
      {showStop && (
        <Pressable
          onPress={() => {
            say(L.okPause);
            nav.home();
          }}
          accessibilityLabel={L.stop}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, height: 58, borderRadius: 29, backgroundColor: p.cardStrong, borderWidth: 1.5, borderColor: p.border }}
        >
          <Text style={{ fontSize: 24 }}>✋</Text>
          <Text style={{ color: p.text, fontWeight: '700', fontSize: 15 }}>{L.stop}</Text>
        </Pressable>
      )}
    </View>
  );
}
