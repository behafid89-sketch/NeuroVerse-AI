import { useEffect } from 'react';
import { getState, patchWorld, setState, worldStat, type Attempt } from '../store';
import { nextLevel } from './adaptive';

/** Mesure le temps passé dans un monde (sert à repérer les activités préférées). */
export function useWorldSession(worldId: string) {
  useEffect(() => {
    const start = Date.now();
    const st = worldStat(worldId);
    patchWorld(worldId, { sessions: st.sessions + 1, lastPlayed: start });
    return () => {
      const cur = worldStat(worldId);
      patchWorld(worldId, { timeMs: cur.timeMs + (Date.now() - start) });
    };
  }, [worldId]);
}

/** Enregistre un essai puis laisse le moteur adaptatif ajuster le niveau. */
export function recordAttempt(a: Omit<Attempt, 't' | 'level'>): { level: number; changed: number } {
  const st = worldStat(a.world);
  const attempt: Attempt = { ...a, t: Date.now(), level: st.level };
  setState((s) => ({ attempts: [...s.attempts, attempt] }));
  const since = getState().attempts.filter((x) => x.world === a.world && x.t > st.levelSince);
  const lvl = nextLevel(st.level, since);
  if (lvl !== st.level) patchWorld(a.world, { level: lvl, levelSince: Date.now() });
  return { level: lvl, changed: lvl - st.level };
}
