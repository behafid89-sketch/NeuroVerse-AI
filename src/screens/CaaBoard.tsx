// Tableau de Communication Alternative et Améliorée (CAA).
// Accessible à tout moment, jamais conditionné à la réussite d'un exercice.
import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { getState, logCaa, useStore } from '../store';
import { t } from '../i18n';
import { say } from '../speech';
import { CARDS, CATEGORIES, CORE, type Card } from '../data/vocabulary';
import { usePalette } from '../components/ui';

function CardTile({ card, size, color, onPress }: { card: Card; size: number; color: string; onPress: () => void }) {
  const p = usePalette();
  const lang = useStore().settings.lang;
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={card[lang]}
      style={({ pressed }) => ({
        width: size,
        height: size * 1.12,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: color + 'AA',
        backgroundColor: pressed ? color + '55' : p.cardStrong,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 6,
        transform: [{ scale: pressed ? 0.95 : 1 }],
      })}
    >
      {card.photo ? (
        <Image source={{ uri: card.photo }} style={{ width: size * 0.66, height: size * 0.66, borderRadius: 14 }} />
      ) : (
        <Text style={{ fontSize: size * 0.46 }}>{card.emoji}</Text>
      )}
      <Text numberOfLines={2} style={{ color: p.text, fontSize: Math.max(13, size * 0.13), fontWeight: '700', textAlign: 'center', marginTop: 4 }}>
        {card[lang]}
      </Text>
    </Pressable>
  );
}

export default function CaaBoard({ onClose }: { onClose: () => void }) {
  const s = useStore();
  const p = usePalette();
  const { width } = useWindowDimensions();
  const lang = s.settings.lang;
  const L = t(lang);
  const [cat, setCat] = useState('besoins');
  const [sentence, setSentence] = useState<Card[]>([]);

  const cards = useMemo(
    () => [...CARDS, ...s.customCards].filter((c) => c.category === cat && !s.hiddenCards.includes(c.id)),
    [cat, s.customCards, s.hiddenCards],
  );
  const catColor = CATEGORIES.find((c) => c.id === cat)?.color || p.accent;
  const cols = width > 900 ? 6 : width > 600 ? 5 : 3;
  const size = (width - 24 - (cols - 1) * 10) / cols;
  const coreSize = Math.min(96, (width - 24 - 7 * 8) / 8 > 70 ? (width - 24 - 7 * 8) / 8 : (width - 24 - 3 * 8) / 4);

  const add = (c: Card) => {
    say(c[lang], { force: true });
    logCaa([c.id]);
    setSentence((st) => (st.length >= 10 ? st : [...st, c]));
  };
  const speakAll = () => {
    if (!sentence.length) return;
    const text = sentence.map((c) => c[getState().settings.lang]).join(' ');
    say(text, { force: true });
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Bande-phrase */}
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, gap: 8 }}>
        <Pressable
          onPress={onClose}
          accessibilityLabel={L.back}
          style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: p.cardStrong, borderWidth: 1.5, borderColor: p.border, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ color: p.text, fontSize: 26 }}>✕</Text>
        </Pressable>
        <Pressable
          onPress={speakAll}
          style={{ flex: 1, minHeight: 78, borderRadius: 20, borderWidth: 2, borderColor: p.accent, backgroundColor: p.card, justifyContent: 'center' }}
        >
          <ScrollView horizontal contentContainerStyle={{ alignItems: 'center', paddingHorizontal: 8, gap: 6, flexDirection: lang === 'ar' ? 'row-reverse' : 'row' }}>
            {sentence.length === 0 ? (
              <Text style={{ color: p.textDim, fontSize: 16 }}>💬 …</Text>
            ) : (
              sentence.map((c, i) => (
                <View key={i} style={{ alignItems: 'center', paddingHorizontal: 4 }}>
                  {c.photo ? <Image source={{ uri: c.photo }} style={{ width: 38, height: 38, borderRadius: 8 }} /> : <Text style={{ fontSize: 32 }}>{c.emoji}</Text>}
                  <Text style={{ color: p.text, fontSize: 12, fontWeight: '700' }}>{c[lang]}</Text>
                </View>
              ))
            )}
          </ScrollView>
        </Pressable>
      </View>
      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 10 }}>
        <Pressable onPress={speakAll} style={{ flex: 2, height: 62, borderRadius: 18, backgroundColor: p.accent, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}>
          <Text style={{ fontSize: 26 }}>🔊</Text>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#07102A' }}>{L.speakSentence}</Text>
        </Pressable>
        <Pressable onPress={() => setSentence((st) => st.slice(0, -1))} accessibilityLabel="Effacer le dernier mot" style={{ flex: 1, height: 62, borderRadius: 18, backgroundColor: p.cardStrong, borderWidth: 1.5, borderColor: p.border, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 26, color: p.text }}>⌫</Text>
        </Pressable>
        <Pressable onPress={() => setSentence([])} accessibilityLabel={L.clear} style={{ flex: 1, height: 62, borderRadius: 18, backgroundColor: p.cardStrong, borderWidth: 1.5, borderColor: p.border, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 24 }}>🗑️</Text>
        </Pressable>
      </View>

      {/* Mots noyau toujours visibles */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 10, justifyContent: 'center' }}>
        {CORE.map((c) => (
          <CardTile key={c.id} card={c} size={coreSize} color="#FFD666" onPress={() => add(c)} />
        ))}
      </View>

      {/* Catégories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 10, paddingBottom: 8 }}>
        {CATEGORIES.map((c) => {
          const on = c.id === cat;
          return (
            <Pressable
              key={c.id}
              onPress={() => {
                setCat(c.id);
                say(c[lang], { force: true });
              }}
              style={{
                paddingHorizontal: 14,
                height: 58,
                borderRadius: 29,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                borderWidth: 2,
                borderColor: on ? c.color : p.border,
                backgroundColor: on ? c.color + '44' : p.card,
              }}
            >
              <Text style={{ fontSize: 26 }}>{c.icon}</Text>
              <Text style={{ color: p.text, fontWeight: '800', fontSize: 15 }}>{c[lang]}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 12, paddingBottom: 40 }}>
        {cards.length === 0 ? (
          <Text style={{ color: p.textDim, fontSize: 15, padding: 10 }}>
            {cat === 'perso' ? 'Ajoutez des photos personnelles depuis l’espace Parents → Pictos.' : '—'}
          </Text>
        ) : (
          cards.map((c) => <CardTile key={c.id} card={c} size={size} color={catColor} onPress={() => add(c)} />)
        )}
      </ScrollView>
    </View>
  );
}
