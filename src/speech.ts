import * as Speech from 'expo-speech';
import { getState } from './store';
import type { Lang } from './i18n';

const LOCALE: Record<Lang, string> = { fr: 'fr-FR', ar: 'ar-SA' };

/**
 * Synthèse vocale du téléphone (moteur TTS d'Android / iOS), hors ligne si la
 * voix est installée sur l'appareil. Pour l'arabe, la voix doit être
 * téléchargée dans les réglages « Synthèse vocale » du téléphone.
 */
export function say(text: string, opts: { lang?: Lang; force?: boolean } = {}) {
  const { settings } = getState();
  if (!settings.voice && !opts.force) return;
  const lang = opts.lang || settings.lang;
  Speech.stop();
  Speech.speak(text, {
    language: LOCALE[lang],
    rate: settings.speechRate,
    pitch: 1.05,
  });
}

export const stopSpeech = () => Speech.stop();

export const label = (x: { fr: string; ar: string }, lang?: Lang) =>
  x[lang || getState().settings.lang];
