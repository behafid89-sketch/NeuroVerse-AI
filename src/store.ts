// Stockage 100 % local (AsyncStorage). Aucune donnée ne quitte l'appareil.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useReducer } from 'react';
import type { Lang } from './i18n';
import type { SensoryMode } from './theme';
import type { Card } from './data/vocabulary';

export type Settings = {
  childName: string;
  companionName: string;
  lang: Lang;
  sensory: SensoryMode;
  animations: boolean;
  voice: boolean;
  speechRate: number; // 0.6 – 1.1
  praise: boolean; // félicitations vocales
  roundLength: number; // nombre d'essais par partie
};

export type Attempt = {
  t: number; // horodatage
  world: string;
  item: string;
  ok: boolean; // réussi du premier coup
  level: number;
  mode: 'find' | 'match';
};

export type WorldStat = {
  level: number; // 1..5
  levelSince: number; // horodatage du dernier changement de niveau
  sessions: number;
  timeMs: number;
  lastPlayed: number;
};

export type State = {
  ready: boolean;
  settings: Settings;
  attempts: Attempt[];
  worlds: Record<string, WorldStat>;
  disabledWorlds: string[];
  customCards: Card[];
  hiddenCards: string[];
  caaUsage: Record<string, number>; // nombre d'utilisations par carte
  caaDays: Record<string, number>; // messages CAA par jour (AAAA-MM-JJ)
};

export const defaultSettings: Settings = {
  childName: '',
  companionName: 'Nova',
  lang: 'fr',
  sensory: 'standard',
  animations: true,
  voice: true,
  speechRate: 0.85,
  praise: true,
  roundLength: 6,
};

const initial: State = {
  ready: false,
  settings: defaultSettings,
  attempts: [],
  worlds: {},
  disabledWorlds: [],
  customCards: [],
  hiddenCards: [],
  caaUsage: {},
  caaDays: {},
};

const KEY = 'neuroverse/v1';
const MAX_ATTEMPTS = 3000;

let state: State = initial;
const listeners = new Set<() => void>();
let saveTimer: ReturnType<typeof setTimeout> | null = null;

export const getState = () => state;

export function setState(update: (s: State) => Partial<State>) {
  state = { ...state, ...update(state) };
  if (state.attempts.length > MAX_ATTEMPTS) state.attempts = state.attempts.slice(-MAX_ATTEMPTS);
  listeners.forEach((l) => l());
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(persist, 400);
}

async function persist() {
  const { ready, ...data } = state;
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // stockage plein ou indisponible : l'appli continue en mémoire
  }
}

export async function loadState() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      state = { ...initial, ...saved, settings: { ...defaultSettings, ...saved.settings }, ready: true };
    } else {
      state = { ...initial, ready: true };
    }
  } catch {
    state = { ...initial, ready: true };
  }
  listeners.forEach((l) => l());
}

export async function resetAll() {
  await AsyncStorage.removeItem(KEY);
  state = { ...initial, ready: true };
  listeners.forEach((l) => l());
}

export function exportData() {
  const { ready, ...data } = state;
  return JSON.stringify(data, null, 2);
}

export function useStore(): State {
  const [, force] = useReducer((x: number) => x + 1, 0);
  useEffect(() => {
    listeners.add(force);
    return () => {
      listeners.delete(force);
    };
  }, []);
  return state;
}

export const updateSettings = (patch: Partial<Settings>) =>
  setState((s) => ({ settings: { ...s.settings, ...patch } }));

export const today = () => new Date().toISOString().slice(0, 10);

export function logCaa(cardIds: string[]) {
  setState((s) => {
    const usage = { ...s.caaUsage };
    cardIds.forEach((id) => (usage[id] = (usage[id] || 0) + 1));
    const d = today();
    return { caaUsage: usage, caaDays: { ...s.caaDays, [d]: (s.caaDays[d] || 0) + 1 } };
  });
}

export function worldStat(id: string): WorldStat {
  return state.worlds[id] || { level: 1, levelSince: 0, sessions: 0, timeMs: 0, lastPlayed: 0 };
}

export function patchWorld(id: string, patch: Partial<WorldStat>) {
  setState((s) => ({ worlds: { ...s.worlds, [id]: { ...worldStat(id), ...patch } } }));
}
