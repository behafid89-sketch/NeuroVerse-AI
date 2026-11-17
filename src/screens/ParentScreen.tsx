import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Share, Switch, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useNav } from '../nav';
import { exportData, resetAll, setState, updateSettings, useStore, patchWorld } from '../store';
import { say } from '../speech';
import { WORLDS } from '../data/worlds';
import { CARDS, CATEGORIES, type Card } from '../data/vocabulary';
import { last7Days, observations, worldInsights } from '../engine/adaptive';
import { usePalette } from '../components/ui';
import type { SensoryMode } from '../theme';

type Tab = 'apercu' | 'reglages' | 'mondes' | 'pictos' | 'donnees';
const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'apercu', label: 'Aperçu', icon: '📊' },
  { id: 'reglages', label: 'Réglages', icon: '⚙️' },
  { id: 'mondes', label: 'Mondes', icon: '🪐' },
  { id: 'pictos', label: 'Pictos', icon: '🖼️' },
  { id: 'donnees', label: 'Données', icon: '🔐' },
];

export default function ParentScreen() {
  const p = usePalette();
  const nav = useNav();
  const [tab, setTab] = useState<Tab>('apercu');
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 }}>
        <Pressable onPress={nav.back} style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16, borderWidth: 1, borderColor: p.border, backgroundColor: p.card }}>
          <Text style={{ color: p.text, fontWeight: '700' }}>← Espace enfant</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ color: p.textDim, fontSize: 12, letterSpacing: 2, fontWeight: '700' }}>NEUROVERSE · PARENTS</Text>
          <Text style={{ color: p.text, fontSize: 22, fontWeight: '800' }}>Tableau de bord</Text>
        </View>
      </View>
      <ScrollView horizontal style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 14, paddingBottom: 10 }} showsHorizontalScrollIndicator={false}>
        {TABS.map((t) => (
          <Pressable
            key={t.id}
            onPress={() => setTab(t.id)}
            style={{
              flexDirection: 'row',
              gap: 6,
              alignItems: 'center',
              paddingHorizontal: 14,
              height: 44,
              borderRadius: 22,
              borderWidth: 1.5,
              borderColor: tab === t.id ? p.accent : p.border,
              backgroundColor: tab === t.id ? p.glow : p.card,
            }}
          >
            <Text>{t.icon}</Text>
            <Text style={{ color: p.text, fontWeight: '700' }}>{t.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 60, gap: 14 }}>
        {tab === 'apercu' && <Overview />}
        {tab === 'reglages' && <SettingsTab />}
        {tab === 'mondes' && <WorldsTab />}
        {tab === 'pictos' && <PictosTab />}
        {tab === 'donnees' && <DataTab />}
      </ScrollView>
    </View>
  );
}

/* --------------------------------- Éléments --------------------------------- */

function Panel({ title, children }: { title?: string; children: React.ReactNode }) {
  const p = usePalette();
  return (
    <View style={{ borderRadius: 22, borderWidth: 1, borderColor: p.border, backgroundColor: p.card, padding: 16, gap: 10 }}>
      {title ? <Text style={{ color: p.text, fontSize: 17, fontWeight: '800' }}>{title}</Text> : null}
      {children}
    </View>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  const p = usePalette();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, minHeight: 44 }}>
      <Text style={{ color: p.text, fontSize: 15, flex: 1 }}>{label}</Text>
      {children}
    </View>
  );
}

function Chip({ on, label, onPress }: { on: boolean; label: string; onPress: () => void }) {
  const p = usePalette();
  return (
    <Pressable
      onPress={onPress}
      style={{ paddingHorizontal: 14, paddingVertical: 9, borderRadius: 18, borderWidth: 1.5, borderColor: on ? p.accent : p.border, backgroundColor: on ? p.glow : 'transparent' }}
    >
      <Text style={{ color: p.text, fontWeight: '700' }}>{label}</Text>
    </Pressable>
  );
}

function Stepper({ value, onChange, step, min, max, format }: { value: number; onChange: (v: number) => void; step: number; min: number; max: number; format?: (v: number) => string }) {
  const p = usePalette();
  const btn = { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: p.border, alignItems: 'center' as const, justifyContent: 'center' as const };
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Pressable style={btn} onPress={() => onChange(Math.max(min, +(value - step).toFixed(2)))}>
        <Text style={{ color: p.text, fontSize: 20 }}>−</Text>
      </Pressable>
      <Text style={{ color: p.text, fontWeight: '800', minWidth: 44, textAlign: 'center' }}>{format ? format(value) : value}</Text>
      <Pressable style={btn} onPress={() => onChange(Math.min(max, +(value + step).toFixed(2)))}>
        <Text style={{ color: p.text, fontSize: 20 }}>+</Text>
      </Pressable>
    </View>
  );
}

function Input(props: React.ComponentProps<typeof TextInput>) {
  const p = usePalette();
  return (
    <TextInput
      placeholderTextColor={p.textDim}
      {...props}
      style={[{ borderWidth: 1, borderColor: p.border, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, color: p.text, fontSize: 16, minWidth: 150 }, props.style]}
    />
  );
}

/* --------------------------------- Aperçu --------------------------------- */

function Overview() {
  const s = useStore();
  const p = usePalette();
  const days = last7Days(s);
  const max = Math.max(1, ...days.map((d) => d.tries + d.caa));
  const ins = worldInsights(s);
  return (
    <>
      <Panel>
        <Text style={{ color: p.textDim, fontSize: 13, lineHeight: 19 }}>
          ℹ️ Ces observations décrivent uniquement l’utilisation de l’application. Elles ne constituent ni une évaluation
          médicale, ni un diagnostic. Pour toute question sur le développement de votre enfant, adressez-vous à un professionnel de santé.
        </Text>
      </Panel>

      <Panel title="Observations">
        {observations(s).map((o, i) => (
          <Text key={i} style={{ color: p.text, fontSize: 15, lineHeight: 22 }}>
            • {o}
          </Text>
        ))}
      </Panel>

      <Panel title="Activité des 7 derniers jours">
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 140, gap: 8 }}>
          {days.map((d) => (
            <View key={d.key} style={{ flex: 1, alignItems: 'center' }}>
              <View style={{ width: '70%', height: 110, justifyContent: 'flex-end' }}>
                <View style={{ height: (d.caa / max) * 110, backgroundColor: '#FFD666', borderTopLeftRadius: 6, borderTopRightRadius: 6 }} />
                <View style={{ height: (d.tries / max) * 110, backgroundColor: p.accent }} />
              </View>
              <Text style={{ color: p.textDim, fontSize: 12, marginTop: 4 }}>{d.label}</Text>
            </View>
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <Text style={{ color: p.textDim, fontSize: 12 }}>
            <Text style={{ color: p.accent }}>■</Text> essais de jeu
          </Text>
          <Text style={{ color: p.textDim, fontSize: 12 }}>
            <Text style={{ color: '#FFD666' }}>■</Text> pictogrammes utilisés
          </Text>
        </View>
      </Panel>

      <Panel title="Compétences travaillées">
        {ins.map((w) => (
          <View key={w.id} style={{ paddingVertical: 10, borderTopWidth: 1, borderColor: p.border, gap: 4 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: p.text, fontWeight: '800', fontSize: 15 }}>
                {w.icon} {WORLDS.find((x) => x.id === w.id)?.fr}
              </Text>
              <Text style={{ color: p.textDim }}>niveau {w.level}/5</Text>
            </View>
            <Text style={{ color: p.textDim, fontSize: 13 }}>
              {w.sessions} séance(s) · {w.minutes} min · {w.attempts} essai(s)
              {w.successRate !== null ? ` · ${Math.round(w.successRate * 100)} % réussis du 1er coup (récents)` : ''}
            </Text>
            {w.mastered.length > 0 && <Text style={{ color: p.success, fontSize: 13 }}>✓ Souvent réussis : {w.mastered.join(', ')}</Text>}
            {w.toReview.length > 0 && <Text style={{ color: '#FFB86B', fontSize: 13 }}>↻ À revoir : {w.toReview.join(', ')}</Text>}
          </View>
        ))}
      </Panel>

      <Panel title="Comment fonctionne l’adaptation ?">
        <Text style={{ color: p.textDim, fontSize: 13, lineHeight: 19 }}>
          Le moteur adaptatif de cette version est un algorithme à règles, entièrement local (aucune donnée envoyée) :{'\n'}
          • 4 réussites sur les 5 derniers essais → un choix de plus est proposé (niveau +1).{'\n'}
          • 1 réussite ou moins sur les 4 derniers essais → un choix de moins (niveau −1).{'\n'}
          • Les éléments ratés récemment reviennent plus souvent ; ceux réussis 3 fois de suite reviennent moins souvent.{'\n'}
          • Le compagnon propose en alternance un monde souvent choisi et un monde peu exploré.
        </Text>
      </Panel>
    </>
  );
}

/* --------------------------------- Réglages --------------------------------- */

function SettingsTab() {
  const s = useStore();
  const p = usePalette();
  const st = s.settings;
  const modes: { id: SensoryMode; label: string }[] = [
    { id: 'calme', label: '🌙 Apaisé' },
    { id: 'standard', label: '✨ Standard' },
    { id: 'vif', label: '🌈 Vif' },
  ];
  return (
    <>
      <Panel title="Enfant">
        <Row label="Prénom">
          <Input value={st.childName} onChangeText={(v) => updateSettings({ childName: v })} placeholder="Prénom" />
        </Row>
        <Row label="Nom du compagnon">
          <Input value={st.companionName} onChangeText={(v) => updateSettings({ companionName: v })} />
        </Row>
      </Panel>

      <Panel title="Langue">
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Chip on={st.lang === 'fr'} label="🇫🇷 Français" onPress={() => updateSettings({ lang: 'fr' })} />
          <Chip on={st.lang === 'ar'} label="العربية" onPress={() => updateSettings({ lang: 'ar' })} />
        </View>
        <Text style={{ color: p.textDim, fontSize: 13 }}>
          Pour la voix arabe, installez la voix « Arabe » dans Réglages du téléphone → Gestion globale → Synthèse vocale (moteur Google ou Samsung).
        </Text>
      </Panel>

      <Panel title="Profil sensoriel">
        <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
          {modes.map((m) => (
            <Chip key={m.id} on={st.sensory === m.id} label={m.label} onPress={() => updateSettings({ sensory: m.id })} />
          ))}
        </View>
        <Text style={{ color: p.textDim, fontSize: 13 }}>« Apaisé » : couleurs douces, animations décoratives coupées.</Text>
        <Row label="Animations">
          <Switch value={st.animations} onValueChange={(v) => updateSettings({ animations: v })} />
        </Row>
      </Panel>

      <Panel title="Voix et sons">
        <Row label="Voix des activités">
          <Switch value={st.voice} onValueChange={(v) => updateSettings({ voice: v })} />
        </Row>
        <Text style={{ color: p.textDim, fontSize: 13 }}>Le tableau de communication parle toujours, même si cette option est coupée.</Text>
        <Row label="Félicitations vocales">
          <Switch value={st.praise} onValueChange={(v) => updateSettings({ praise: v })} />
        </Row>
        <Row label="Vitesse de la voix">
          <Stepper value={st.speechRate} step={0.05} min={0.5} max={1.2} onChange={(v) => updateSettings({ speechRate: v })} format={(v) => `${Math.round(v * 100)}%`} />
        </Row>
        <Pressable
          onPress={() => say(st.lang === 'ar' ? `مرحبا، أنا ${st.companionName}.` : `Bonjour, je suis ${st.companionName}.`, { force: true })}
          style={{ alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16, backgroundColor: p.accent }}
        >
          <Text style={{ color: '#07102A', fontWeight: '800' }}>🔊 Tester la voix</Text>
        </Pressable>
      </Panel>

      <Panel title="Activités">
        <Row label="Essais par partie">
          <Stepper value={st.roundLength} step={1} min={3} max={12} onChange={(v) => updateSettings({ roundLength: v })} />
        </Row>
      </Panel>
    </>
  );
}

/* --------------------------------- Mondes --------------------------------- */

function WorldsTab() {
  const s = useStore();
  const p = usePalette();
  return (
    <Panel title="Mondes visibles par l’enfant">
      {WORLDS.map((w) => {
        const on = !s.disabledWorlds.includes(w.id);
        const lvl = s.worlds[w.id]?.level || 1;
        return (
          <View key={w.id} style={{ borderTopWidth: 1, borderColor: p.border, paddingTop: 8, gap: 6 }}>
            <Row label={`${w.icon}  ${w.fr}`}>
              <Switch
                value={on}
                onValueChange={(v) =>
                  setState((st) => ({
                    disabledWorlds: v ? st.disabledWorlds.filter((x) => x !== w.id) : [...st.disabledWorlds, w.id],
                  }))
                }
              />
            </Row>
            <Row label="Niveau actuel (ajustable)">
              <Stepper value={lvl} step={1} min={1} max={5} onChange={(v) => patchWorld(w.id, { level: v, levelSince: Date.now() })} />
            </Row>
          </View>
        );
      })}
    </Panel>
  );
}

/* --------------------------------- Pictos --------------------------------- */

function PictosTab() {
  const s = useStore();
  const p = usePalette();
  const [fr, setFr] = useState('');
  const [ar, setAr] = useState('');
  const [cat, setCat] = useState('perso');
  const [photo, setPhoto] = useState<string | undefined>();

  const pick = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Autorisation refusée', 'L’accès aux photos est nécessaire pour créer un pictogramme personnel.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.6 });
    if (res.canceled || !res.assets?.[0]) return;
    // Copie dans le dossier privé de l'appli pour qu'elle ne disparaisse pas.
    const dir = FileSystem.documentDirectory + 'pictos/';
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true }).catch(() => {});
    const dest = dir + Date.now() + '.jpg';
    await FileSystem.copyAsync({ from: res.assets[0].uri, to: dest });
    setPhoto(dest);
  };

  const save = () => {
    if (!fr.trim() && !ar.trim()) {
      Alert.alert('Nom manquant', 'Indiquez au moins un nom (français ou arabe).');
      return;
    }
    const card: Card = {
      id: 'c' + Date.now(),
      fr: fr.trim() || ar.trim(),
      ar: ar.trim() || fr.trim(),
      category: cat,
      photo,
      emoji: photo ? undefined : '⭐',
      custom: true,
    };
    setState((st) => ({ customCards: [...st.customCards, card] }));
    setFr('');
    setAr('');
    setPhoto(undefined);
    Alert.alert('Ajouté', 'Le pictogramme est disponible dans le tableau de communication.');
  };

  const remove = (c: Card) =>
    Alert.alert('Supprimer ?', c.fr, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => {
          if (c.photo) FileSystem.deleteAsync(c.photo, { idempotent: true }).catch(() => {});
          setState((st) => ({ customCards: st.customCards.filter((x) => x.id !== c.id) }));
        },
      },
    ]);

  return (
    <>
      <Panel title="Nouveau pictogramme personnel">
        <Pressable
          onPress={pick}
          style={{ alignSelf: 'center', width: 140, height: 140, borderRadius: 24, borderWidth: 2, borderStyle: 'dashed', borderColor: p.accent, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
        >
          {photo ? <Image source={{ uri: photo }} style={{ width: 140, height: 140 }} /> : <Text style={{ color: p.text, textAlign: 'center' }}>📷{'\n'}Choisir une photo</Text>}
        </Pressable>
        <Input value={fr} onChangeText={setFr} placeholder="Mot en français (ex. : mon doudou)" />
        <Input value={ar} onChangeText={setAr} placeholder="الكلمة بالعربية" style={{ textAlign: 'right' }} />
        <Text style={{ color: p.textDim }}>Catégorie</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {CATEGORIES.map((c) => (
            <Chip key={c.id} on={cat === c.id} label={`${c.icon} ${c.fr}`} onPress={() => setCat(c.id)} />
          ))}
        </View>
        <Pressable onPress={save} style={{ marginTop: 6, paddingVertical: 14, borderRadius: 16, backgroundColor: p.accent, alignItems: 'center' }}>
          <Text style={{ color: '#07102A', fontWeight: '800', fontSize: 16 }}>Ajouter au tableau</Text>
        </Pressable>
      </Panel>

      <Panel title={`Mes pictogrammes (${s.customCards.length})`}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {s.customCards.map((c) => (
            <Pressable key={c.id} onLongPress={() => remove(c)} onPress={() => say(c[s.settings.lang], { force: true })} style={{ width: 90, alignItems: 'center' }}>
              {c.photo ? <Image source={{ uri: c.photo }} style={{ width: 80, height: 80, borderRadius: 14 }} /> : <Text style={{ fontSize: 50 }}>{c.emoji}</Text>}
              <Text numberOfLines={1} style={{ color: p.text, fontSize: 12 }}>{c.fr}</Text>
            </Pressable>
          ))}
        </View>
        {s.customCards.length > 0 && <Text style={{ color: p.textDim, fontSize: 12 }}>Appui long sur un pictogramme pour le supprimer.</Text>}
      </Panel>

      <Panel title="Pictogrammes de base affichés">
        <Text style={{ color: p.textDim, fontSize: 13 }}>Touchez un mot pour le masquer ou l’afficher (pour simplifier le tableau).</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {CARDS.map((c) => {
            const hidden = s.hiddenCards.includes(c.id);
            return (
              <Pressable
                key={c.id}
                onPress={() =>
                  setState((st) => ({ hiddenCards: hidden ? st.hiddenCards.filter((x) => x !== c.id) : [...st.hiddenCards, c.id] }))
                }
                style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, borderWidth: 1, borderColor: p.border, opacity: hidden ? 0.35 : 1 }}
              >
                <Text style={{ color: p.text }}>
                  {c.emoji} {c.fr}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Panel>
    </>
  );
}

/* --------------------------------- Données --------------------------------- */

function DataTab() {
  const p = usePalette();
  return (
    <>
      <Panel title="Confidentialité">
        <Text style={{ color: p.text, fontSize: 14, lineHeight: 21 }}>
          • Toutes les données restent sur cet appareil (stockage local).{'\n'}
          • Aucun compte, aucune publicité, aucun traceur, aucun envoi sur Internet.{'\n'}
          • Les photos ajoutées sont copiées dans le dossier privé de l’application.{'\n'}
          • Vous pouvez exporter ou effacer toutes les données à tout moment (droits d’accès et d’effacement RGPD).{'\n'}
          • La synchronisation entre appareils n’est pas encore disponible dans cette version.
        </Text>
      </Panel>
      <Panel title="Exporter">
        <Pressable
          onPress={() => Share.share({ title: 'NeuroVerse – export', message: exportData() })}
          style={{ paddingVertical: 14, borderRadius: 16, backgroundColor: p.accent, alignItems: 'center' }}
        >
          <Text style={{ color: '#07102A', fontWeight: '800' }}>📤 Exporter les données (JSON)</Text>
        </Pressable>
      </Panel>
      <Panel title="Tout effacer">
        <Pressable
          onPress={() =>
            Alert.alert('Tout effacer ?', 'Réglages, progression et pictogrammes personnels seront supprimés définitivement.', [
              { text: 'Annuler', style: 'cancel' },
              {
                text: 'Effacer',
                style: 'destructive',
                onPress: async () => {
                  await FileSystem.deleteAsync(FileSystem.documentDirectory + 'pictos/', { idempotent: true }).catch(() => {});
                  await resetAll();
                },
              },
            ])
          }
          style={{ paddingVertical: 14, borderRadius: 16, borderWidth: 1.5, borderColor: '#FF6B6B', alignItems: 'center' }}
        >
          <Text style={{ color: '#FF8A8A', fontWeight: '800' }}>🗑️ Effacer toutes les données</Text>
        </Pressable>
      </Panel>
    </>
  );
}
