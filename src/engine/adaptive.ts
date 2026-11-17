/**
 * MOTEUR D'APPRENTISSAGE ADAPTATIF — version 1 (MVP)
 *
 * Ce moteur est un algorithme à règles explicites, transparent et vérifiable.
 * Il n'utilise PAS de réseau de neurones ni de service d'IA distant.
 * Il fonctionne entièrement hors ligne, à partir de l'historique des essais.
 *
 * Ce qu'il fait réellement :
 *  - ajuste le niveau (nombre de choix proposés) selon les réussites récentes ;
 *  - revient plus souvent sur les éléments récemment ratés (répétition) ;
 *  - introduit progressivement les éléments jamais vus ;
 *  - repère les mondes les plus choisis spontanément par l'enfant ;
 *  - produit des observations factuelles pour les parents (jamais un diagnostic).
 *
 * Le module est isolé : il pourra être remplacé par un modèle statistique plus
 * avancé sans toucher à l'interface.
 */
import type { Attempt, State } from '../store';
import { WORLDS, type Item } from '../data/worlds';
import { CARDS, CORE } from '../data/vocabulary';

export const MIN_LEVEL = 1;
export const MAX_LEVEL = 5;

/** Niveau → nombre d'images proposées dans « Trouver ». */
export const choicesForLevel = (level: number) => [2, 2, 3, 4, 6][Math.max(0, Math.min(4, level - 1))];

/** Niveau → nombre d'objets proposés dans « Associer ». */
export const matchChoicesForLevel = (level: number) => [1, 2, 2, 3, 3][Math.max(0, Math.min(4, level - 1))];

/**
 * Décide du nouveau niveau d'un monde à partir des essais depuis le dernier
 * changement de niveau.
 *  - 5 derniers essais avec au moins 4 réussites → niveau + 1
 *  - 4 derniers essais avec au plus 1 réussite → niveau − 1
 */
export function nextLevel(level: number, sinceChange: Attempt[]): number {
  const last5 = sinceChange.slice(-5);
  const last4 = sinceChange.slice(-4);
  if (last5.length === 5 && last5.filter((a) => a.ok).length >= 4) return Math.min(MAX_LEVEL, level + 1);
  if (last4.length === 4 && last4.filter((a) => a.ok).length <= 1) return Math.max(MIN_LEVEL, level - 1);
  return level;
}

/**
 * Choisit le prochain élément à travailler, par tirage pondéré :
 *  - raté récemment : poids 4 (on le revoit plus souvent)
 *  - jamais vu : poids 2
 *  - réussi 3 fois de suite : poids 0,5 (acquis, on le revoit moins)
 *  - sinon : poids 1
 */
export function pickTarget(items: Item[], history: Attempt[], avoidId?: string): Item {
  const byItem = new Map<string, Attempt[]>();
  history.forEach((a) => {
    const arr = byItem.get(a.item) || [];
    arr.push(a);
    byItem.set(a.item, arr);
  });
  const pool = items.filter((i) => i.id !== avoidId);
  const weights = pool.map((i) => {
    const h = byItem.get(i.id);
    if (!h || h.length === 0) return 2;
    const recent = h.slice(-3);
    if (recent.some((a) => !a.ok)) return 4;
    if (recent.length === 3 && recent.every((a) => a.ok)) return 0.5;
    return 1;
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let k = 0; k < pool.length; k++) {
    r -= weights[k];
    if (r <= 0) return pool[k];
  }
  return pool[pool.length - 1];
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Distracteurs : différents de la cible, tirés au hasard. */
export function distractors(items: Item[], target: Item, n: number): Item[] {
  return shuffle(items.filter((i) => i.id !== target.id)).slice(0, n);
}

/* ------------------------------------------------------------------------ */
/*  Observations pour les parents                                            */
/* ------------------------------------------------------------------------ */

export type WorldInsight = {
  id: string;
  name: string;
  icon: string;
  level: number;
  sessions: number;
  minutes: number;
  attempts: number;
  successRate: number | null;
  toReview: string[]; // libellés des éléments à retravailler
  mastered: string[];
};

export function worldInsights(s: State): WorldInsight[] {
  const lang = s.settings.lang;
  return WORLDS.map((w) => {
    const st = s.worlds[w.id];
    const att = s.attempts.filter((a) => a.world === w.id);
    const recent = att.slice(-40);
    const byItem = new Map<string, Attempt[]>();
    att.forEach((a) => byItem.set(a.item, [...(byItem.get(a.item) || []), a]));
    const toReview: string[] = [];
    const mastered: string[] = [];
    byItem.forEach((h, id) => {
      const item = w.items.find((i) => i.id === id);
      if (!item) return;
      const last = h.slice(-3);
      if (last.some((a) => !a.ok)) toReview.push(item[lang]);
      else if (last.length === 3) mastered.push(item[lang]);
    });
    return {
      id: w.id,
      name: w[lang],
      icon: w.icon,
      level: st?.level || 1,
      sessions: st?.sessions || 0,
      minutes: Math.round((st?.timeMs || 0) / 60000),
      attempts: att.length,
      successRate: recent.length ? recent.filter((a) => a.ok).length / recent.length : null,
      toReview: toReview.slice(0, 6),
      mastered: mastered.slice(0, 8),
    };
  });
}

/** Mondes préférés : ceux où l'enfant revient le plus et passe le plus de temps. */
export function favoriteWorlds(s: State, n = 2): string[] {
  return Object.entries(s.worlds)
    .filter(([id]) => !s.disabledWorlds.includes(id))
    .map(([id, w]) => ({ id, score: w.sessions * 2 + w.timeMs / 60000 }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((x) => x.id);
}

/**
 * Suggestion du compagnon : alterne entre un monde préféré (motivation) et un
 * monde peu exploré (découverte).
 */
export function suggestWorld(s: State): string {
  const enabled = WORLDS.filter((w) => !s.disabledWorlds.includes(w.id));
  if (enabled.length === 0) return WORLDS[0].id;
  const fav = favoriteWorlds(s, 1)[0];
  const least = [...enabled].sort(
    (a, b) => (s.worlds[a.id]?.sessions || 0) - (s.worlds[b.id]?.sessions || 0),
  )[0];
  const day = new Date().getDate();
  return fav && day % 2 === 0 ? fav : least.id;
}

/** Activité des 7 derniers jours (essais de jeu + messages CAA). */
export function last7Days(s: State) {
  const days: { key: string; label: string; tries: number; ok: number; caa: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({
      key,
      label: d.toLocaleDateString('fr-FR', { weekday: 'short' }).slice(0, 3),
      tries: 0,
      ok: 0,
      caa: s.caaDays[key] || 0,
    });
  }
  s.attempts.forEach((a) => {
    const key = new Date(a.t).toISOString().slice(0, 10);
    const day = days.find((x) => x.key === key);
    if (day) {
      day.tries++;
      if (a.ok) day.ok++;
    }
  });
  return days;
}

/** Phrases d'observation en langage simple, sans interprétation médicale. */
export function observations(s: State): string[] {
  const out: string[] = [];
  const ins = worldInsights(s).filter((w) => w.attempts > 0);
  const fav = favoriteWorlds(s, 2).map((id) => WORLDS.find((w) => w.id === id)?.fr).filter(Boolean);
  if (fav.length) out.push(`Mondes choisis le plus souvent : ${fav.join(' et ')}.`);
  ins
    .filter((w) => w.successRate !== null && w.attempts >= 8 && w.successRate >= 0.8)
    .forEach((w) => out.push(`${w.name} : réussites fréquentes récemment (niveau ${w.level}/5).`));
  ins
    .filter((w) => w.toReview.length)
    .slice(0, 3)
    .forEach((w) => out.push(`${w.name} : à revoir en douceur — ${w.toReview.slice(0, 3).join(', ')}.`));
  const topCaa = Object.entries(s.caaUsage).sort((a, b) => b[1] - a[1]).slice(0, 3);
  if (topCaa.length) {
    const all = [...CORE, ...CARDS, ...s.customCards];
    const names = topCaa.map(([id]) => all.find((c) => c.id === id)?.fr || id);
    out.push(`Pictogrammes les plus utilisés : ${names.join(', ')}.`);
  }
  if (!out.length) out.push("Pas encore assez d'activité pour faire des observations.");
  return out;
}
