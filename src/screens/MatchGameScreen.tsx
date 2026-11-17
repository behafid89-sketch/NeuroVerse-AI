// Jeu « Associer » : glisser l'objet identique dans la boîte lumineuse.
// L'appariement d'images identiques est une compétence de base très utilisée
// dans l'accompagnement des enfants autistes.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, PanResponder, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getState, useStore, worldStat } from '../store';
import { t } from '../i18n';
import { say } from '../speech';
import { getWorld, itemsFor, type Item } from '../data/worlds';
import { distractors, matchChoicesForLevel, pickTarget, shuffle } from '../engine/adaptive';
import { recordAttempt, useWorldSession } from '../engine/session';
import { ItemVisual, usePalette, useAnimationsOn } from '../components/ui';
import { TopBar } from '../components/TopBar';
import { Companion, type Mood } from '../components/Companion';
import { RoundEnd } from '../components/RoundEnd';
import { Progress } from './FindGameScreen';

type Rect = { x: number; y: number; w: number; h: number };

function Draggable({
  item,
  size,
  hue,
  hinted,
  onDrop,
  onTap,
}: {
  item: Item;
  size: number;
  hue: [string, string];
  hinted: boolean;
  onDrop: (x: number, y: number) => 'accept' | 'reject' | 'miss';
  onTap: () => void;
}) {
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const dropRef = useRef(onDrop);
  dropRef.current = onDrop;
  const tapRef = useRef(onTap);
  tapRef.current = onTap;

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        Animated.spring(scale, { toValue: 1.12, useNativeDriver: false }).start();
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (_, g) => {
        Animated.spring(scale, { toValue: 1, useNativeDriver: false }).start();
        if (Math.abs(g.dx) < 8 && Math.abs(g.dy) < 8) {
          tapRef.current();
          pan.setValue({ x: 0, y: 0 });
          return;
        }
        const res = dropRef.current(g.moveX, g.moveY);
        if (res === 'accept') {
          Animated.parallel([
            Animated.timing(opacity, { toValue: 0, duration: 350, useNativeDriver: false }),
            Animated.timing(scale, { toValue: 0.6, duration: 350, useNativeDriver: false }),
          ]).start();
        } else {
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false, friction: 6 }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
      },
    }),
  ).current;

  return (
    <Animated.View
      {...responder.panHandlers}
      style={{ transform: [...pan.getTranslateTransform(), { scale }], opacity, zIndex: 10, elevation: 10 }}
    >
      <LinearGradient
        colors={[hue[0] + '55', hue[1] + '22']}
        style={{
          width: size,
          height: size,
          borderRadius: 26,
          borderWidth: hinted ? 4 : 1.5,
          borderColor: hinted ? '#FFFFFF' : hue[0] + 'AA',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ItemVisual item={item} size={size * 0.5} />
      </LinearGradient>
    </Animated.View>
  );
}

export default function MatchGameScreen({ id }: { id: string }) {
  const s = useStore();
  const p = usePalette();
  const anim = useAnimationsOn();
  const { width } = useWindowDimensions();
  const lang = s.settings.lang;
  const L = t(lang);
  const w = getWorld(id);
  useWorldSession(id);

  const [count, setCount] = useState(0);
  const [trialKey, setTrialKey] = useState(0);
  const [target, setTarget] = useState<Item | null>(null);
  const [options, setOptions] = useState<Item[]>([]);
  const [errors, setErrors] = useState(0);
  const [solved, setSolved] = useState(false);
  const [done, setDone] = useState(false);
  const [mood, setMood] = useState<Mood>('idle');
  const [msg, setMsg] = useState('');
  const boxRef = useRef<View>(null);
  const box = useRef<Rect | null>(null);
  const prev = useRef<string | undefined>(undefined);
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!anim) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  const newTrial = useCallback(() => {
    const items = itemsFor(w, getState().settings.lang);
    const history = getState().attempts.filter((a) => a.world === id && a.mode === 'match');
    const n = Math.min(items.length, matchChoicesForLevel(worldStat(id).level));
    const tg = pickTarget(items, history, prev.current);
    prev.current = tg.id;
    setTarget(tg);
    setOptions(shuffle([tg, ...distractors(items, tg, n - 1)]));
    setErrors(0);
    setSolved(false);
    setMood('idle');
    setTrialKey((k) => k + 1);
    const pr = t(getState().settings.lang).matchPrompt;
    setMsg(pr);
    setTimeout(() => say(pr), 350);
  }, [id]);

  useEffect(() => {
    newTrial();
  }, []);

  const measureBox = () => {
    boxRef.current?.measureInWindow((x, y, bw, bh) => {
      box.current = { x, y, w: bw, h: bh };
    });
  };

  if (done)
    return (
      <View style={{ flex: 1 }}>
        <TopBar title={`${L.match} · ${w[lang]}`} />
        <RoundEnd onAgain={() => { setDone(false); setCount(0); newTrial(); }} />
      </View>
    );
  if (!target) return null;

  const onDrop = (item: Item) => (x: number, y: number): 'accept' | 'reject' | 'miss' => {
    if (solved) return 'miss';
    measureBox();
    const b = box.current;
    const margin = 40;
    const inside = !!b && x > b.x - margin && x < b.x + b.w + margin && y > b.y - margin && y < b.y + b.h + margin;
    if (!inside) return 'miss';
    if (item.id === target.id) {
      setSolved(true);
      recordAttempt({ world: id, item: target.id, ok: errors === 0, mode: 'match' });
      const bravo = L.bravo[Math.floor(Math.random() * L.bravo.length)];
      setMood('happy');
      setMsg(bravo);
      say(getState().settings.praise ? `${bravo} ${item[lang]}` : item[lang]);
      setTimeout(() => {
        const next = count + 1;
        setCount(next);
        if (next >= getState().settings.roundLength) setDone(true);
        else newTrial();
      }, 1500);
      return 'accept';
    }
    setErrors((e) => e + 1);
    setMsg(L.tryAgain);
    say(L.tryAgain);
    return 'reject';
  };

  const size = Math.min(150, (width - 60) / Math.max(2, options.length));
  const boxScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });

  return (
    <View style={{ flex: 1 }}>
      <TopBar title={`${L.match} · ${w[lang]}`} />
      <View style={{ alignItems: 'center', marginTop: 6 }}>
        <Pressable onPress={() => say(`${L.matchPrompt}. ${target[lang]}`)}>
          <Companion size={70} mood={mood} message={`🔊 ${msg}`} />
        </Pressable>
        <Progress count={count} total={s.settings.roundLength} color={w.hue[0]} />
      </View>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-evenly', paddingBottom: 110 }}>
        <View ref={boxRef} onLayout={() => setTimeout(measureBox, 50)} collapsable={false}>
        <Animated.View
          style={{
            width: size * 1.6,
            height: size * 1.6,
            borderRadius: 36,
            borderWidth: 3,
            borderStyle: 'dashed',
            borderColor: solved ? p.success : w.hue[0],
            backgroundColor: 'rgba(255,255,255,0.05)',
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ scale: boxScale }],
          }}
        >
          <View style={{ opacity: solved ? 1 : 0.3 }}>
            <ItemVisual item={target} size={size * 0.7} />
          </View>
          {solved && <Text style={{ position: 'absolute', top: 8, right: 14, fontSize: 32 }}>⭐</Text>}
        </Animated.View>
        </View>

        <View key={trialKey} style={{ flexDirection: 'row', gap: 18, justifyContent: 'center' }}>
          {options.map((item) => (
            <Draggable
              key={item.id}
              item={item}
              size={size}
              hue={w.hue}
              hinted={errors >= 2 && item.id === target.id}
              onDrop={onDrop(item)}
              onTap={() => say(item[lang])}
            />
          ))}
        </View>
      </View>
    </View>
  );
}
