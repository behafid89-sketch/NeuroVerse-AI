# NeuroVerse AI — MVP v0.1

Application d'accompagnement pour les enfants autistes, notamment non verbaux :
communication sans parole (CAA), 7 mondes d'apprentissage, compagnon virtuel,
coin calme et tableau de bord parental. React Native / Expo / TypeScript.

## Ce qui fonctionne réellement dans cette version

| Module | État |
|---|---|
| **CAA** : 8 mots noyau toujours visibles, 8 catégories, ~55 pictogrammes, bande-phrase, synthèse vocale FR/AR | ✅ |
| **Photos personnelles** transformées en pictogrammes (stockées dans l'appli) | ✅ |
| **CAA accessible partout** (bouton 💬 sur tous les écrans enfant, jamais bloqué par un exercice) | ✅ |
| **7 mondes** : animaux, couleurs, chiffres, lettres (FR ou AR), émotions, vie quotidienne, objets et actions | ✅ |
| **3 modes de jeu** par monde : Explorer (sans échec), Trouver (toucher), Associer (glisser-déposer) | ✅ |
| **Moteur adaptatif** (règles locales, détaillé ci-dessous) | ✅ |
| **Compagnon « Nova »** animé : accueille, propose un monde, encourage, répète la consigne | ✅ |
| **Refus respecté** : bouton « Je ne veux pas » sur chaque activité, choix « Encore / Pause » en fin de partie | ✅ |
| **Coin calme** : guide de respiration | ✅ |
| **Profils sensoriels** Apaisé / Standard / Vif + coupure des animations et de la voix | ✅ |
| **Tableau de bord parental** (accès par appui 3 s) : observations, graphique 7 jours, compétences, réglages, mondes, pictos, export/effacement | ✅ |
| Hors ligne, aucune donnée envoyée | ✅ |
| Vrai moteur 3D (Three.js / Filament) | ❌ pas dans le MVP — effets pseudo-3D (perspective, rotations) |
| Synchronisation entre appareils | ❌ pas encore |
| IA par apprentissage automatique (réseau de neurones) | ❌ pas encore — le moteur actuel est à règles, voir ci-dessous |

## Le moteur adaptatif (honnêtement)

`src/engine/adaptive.ts` — un algorithme à règles explicites, 100 % local :

- 4 réussites sur les 5 derniers essais → niveau +1 (plus d'images proposées) ;
- ≤ 1 réussite sur les 4 derniers essais → niveau −1 ;
- les éléments ratés récemment reviennent plus souvent, ceux réussis 3 fois de suite moins souvent ;
- les mondes préférés sont repérés par le nombre de séances et le temps passé ;
- les observations pour les parents sont factuelles et **ne sont jamais un diagnostic**.

Le module est isolé pour pouvoir être remplacé plus tard par un modèle statistique.

## Installer sur un téléphone Android (sans ordinateur)

L'APK est fabriqué automatiquement par GitHub à chaque modification :

1. Ouvrir le dépôt GitHub → onglet **Actions** → attendre la coche verte (15–25 min).
2. Onglet **Releases** (ou page d'accueil du dépôt, à droite) → télécharger `NeuroVerse-AI.apk`.
3. Ouvrir le fichier téléchargé → autoriser « Installer des applis inconnues » pour le navigateur → **Installer**.

Voix arabe : Réglages du téléphone → Gestion globale → Langue et saisie → Synthèse vocale → installer la voix arabe.

## Lancer avec un ordinateur (développeurs)

```bash
npm install
npx expo install --fix
npx expo start          # puis scanner le QR code avec Expo Go
```

## Structure

```
App.tsx                      navigation, bouton CAA global
src/nav.ts                   routes
src/store.ts                 stockage local (AsyncStorage)
src/speech.ts                synthèse vocale FR/AR
src/theme.ts                 3 profils sensoriels
src/i18n.ts                  textes FR/AR
src/data/worlds.ts           contenu des 7 mondes
src/data/vocabulary.ts       vocabulaire CAA
src/engine/adaptive.ts       moteur adaptatif + observations
src/engine/session.ts        enregistrement des essais et du temps
src/components/              fond spatial, boutons holographiques, compagnon
src/screens/                 écrans enfant + espace parents
```

## Données et RGPD

Aucun compte, aucun serveur, aucune publicité, aucun traceur. Les données restent
sur l'appareil ; export et effacement complets dans Parents → Données.
Visuels : émojis du système et formes générées (pas d'images sous licence tierce).
Pour ajouter plus tard les pictogrammes ARASAAC, respecter leur licence
CC BY-NC-SA (attribution, usage non commercial).
