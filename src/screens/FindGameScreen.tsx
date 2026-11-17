// Jeu « Trouver » : une consigne vocale, l'enfant touche la bonne image.
// Pas de son d'échec, pas de punition. Après 2 erreurs, la bonne réponse
// s'illumine (apprentissage sans erreur).
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getState, useStore, worldStat } from '../store';
import { t } from '../i18n';
import { say } from '../speech';
import { getWorld, itemsFor, type Item } from '../data/worlds';
import { choicesForLevel, distractors, pickTarget, shuffle } from '../engine/adaptive';
import { recordAttempt, useWorldSession } from '../engine/session';
import { ItemVisual, usePalette, useAnimationsOn } from '../components/ui';
import { TopBar } from '../components/TopBar';
import { Companion, type Mood } from '../components/Companion';
import { RoundEnd } from '../components/RoundEnd';

type Trial = { target: Item; options: Item[] };

export function promptFor(item: Item, lang: 'fr' | 'ar') {
  return lang === 'ar' ? `${t('ar').findPrompt} ${item.ar}` : `${t('fr').findPrompt} : ${item.fr}`;
}

export default function FindGameScreen({ id }: { id: string }) {
  const s = useStore();
  const p = usePalette();
  const anim = useAnimationsOn();
  const { width } = useWindowDimensions();
  const lang = s.settings.lang;
  const L = t(lang);
  const w = getWorld(id);
  useWorldSession(id);

  const [count, setCount] = useState(0);
  const [trial, setTrial] = useState<Trial | null>(null);
  const [errors, setErrors] = useState(0);
  const [done, setDone] = useState(false);
  const [mood, setMood] = useState<Mood>('idle');
  const [msg, setMsg] = useState('');
  const [solved, setSolved] = useState(false);
  const prev = useRef<string | undefined>(undefined);
  const glow = useRef(new Animated.Value(0)).current;

  const newTrial = useCallback(() => {
    const items = itemsFor(w, getState().settings.lang);
    const history = getState().attempts.filter((a) => a.world === id);
    const n = Math.min(items.length, choicesForLevel(worldStat(id).level));
    const target = pickTarget(items, history, prev.current);
    prev.current = target.id;
    const options = shuffle([target, ...distractors(items, target, n - 1)]);
    setTrial({ target, options });
    setErrors(0);
    setSolved(false);
    setMood('idle');
    const pr = promptFor(target, getState().settings.lang);
    setMsg(pr);
    setTimeout(() => say(pr), 350);
  }, [id]);

  useEffect(() => {
    newTrial();
  }, []);

  useEffect(() => {
    if (errors >= 2 && anim) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(glow, { toValue: 1, duration: 600, useNativeDriver: false }),
          Animated.timing(glow, { toValue: 0, duration: 600, useNativeDriver: false }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    }
    glow.setValue(errors >= 2 ? 1 : 0);
  }, [errors, anim]);

  if (done)
    return (
      <View style={{ flex: 1 }}>
        <TopBar title={`${L.find} · ${w[lang]}`} />
        <RoundEnd onAgain={() => { setDone(false); setCount(0); newTrial(); }} />
      </View>
    );
  if (!trial) return null;

  const onTap = (item: Item) => {
    if (solved) return;
    if (item.id === trial.target.id) {
      setSolved(true);
      recordAttempt({ world: id, item: trial.target.id, ok: errors === 0, mode: 'find' });
      const bravo = L.bravo[Math.floor(Math.random() * L.bravo.length)];
      setMood('happy');
      setMsg(bravo);
      if (getState().settings.praise) say(`${bravo} ${item[lang]}`);
      else say(item[lang]);
      setTimeout(() => {
        const next = count + 1;
        setCount(next);
        if (next >= getState().settings.roundLength) setDone(true);
        else newTrial();
      }, 1700);
    } else {
      // Pas de pénalité : l'essai sera simplement noté « pas du premier coup ».
      setErrors((e) => e + 1);
      setMsg(L.tryAgain);
      say(`${L.tryAgain} ${promptFor(trial.target, lang)}`);
    }
  };

  const n = trial.options.length;
  const cols = n <= 2 ? 2 : n <= 4 ? 2 : 3;
  const size = Math.min(220, (width - 40 - (cols - 1) * 14) / cols);
  const borderColor = glow.interpolate({ inputRange: [0, 1], outputRange: [w.hue[0] + '66', '#FFFFFF'] });

  return (
    <View style={{ flex: 1 }}>
      <TopBar title={`${L.find} · ${w[lang]}`} />
      <View style={{ alignItems: 'center', marginTop: 8 }}>
        <Pressable onPress={() => say(promptFor(trial.target, lang))} accessibilityLabel="Répéter la consigne">
          <Companion size={80} mood={mood} message={`🔊 ${msg}`} />
        </Pressable>
        <Progress count={count} total={s.settings.roundLength} color={w.hue[0]} />
      </View>
      <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignContent: 'center', gap: 14, padding: 16, paddingBottom: 120 }}>
        {trial.options.map((item) => {
          const isTarget = item.id === trial.target.id;
          const hinted = isTarget && errors >= 2;
          const faded = solved && !isTarget;
          return (
            <Pressable key={item.id} onPress={() => onTap(item)} accessibilityLabel={item[lang]} style={{ opacity: faded ? 0.25 : 1 }}>
              <Animated.View
                style={{
                  width: size,
                  height: size,
                  borderRadius: 28,
                  borderWidth: hinted ? 4 : 1.5,
                  borderColor: hinted ? borderColor : solved && isTarget ? p.success : w.hue[0] + '66',
                  overflow: 'hidden',
                }}
              >
                <LinearGradient colors={[w.hue[0] + '40', w.hue[1] + '14']} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <ItemVisual item={item} size={size * 0.48} />
                  {solved && isTarget && <Text style={{ position: 'absolute', top: 8, right: 12, fontSize: 30 }}>⭐</Text>}
                </LinearGradient>
              </Animated.View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function Progress({ count, total, color }: { count: number; total: number; color: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={{ width: 22, height: 8, borderRadius: 4, backgroundColor: i < count ? color : 'rgba(255,255,255,0.15)' }} />
      ))}
    </View>
  );
}
