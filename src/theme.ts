export type SensoryMode = 'calme' | 'standard' | 'vif';

export type Palette = {
  bg1: string;
  bg2: string;
  bg3: string;
  card: string;
  cardStrong: string;
  border: string;
  accent: string;
  accent2: string;
  success: string;
  text: string;
  textDim: string;
  glow: string;
  star: string;
};

export const palettes: Record<SensoryMode, Palette> = {
  // Couleurs désaturées, faible contraste lumineux : pour les enfants hypersensibles
  calme: {
    bg1: '#0E1B26',
    bg2: '#13283A',
    bg3: '#1A3243',
    card: 'rgba(255,255,255,0.05)',
    cardStrong: 'rgba(255,255,255,0.09)',
    border: 'rgba(170,200,220,0.16)',
    accent: '#8DB8CF',
    accent2: '#A9C6A4',
    success: '#A9C6A4',
    text: '#E4ECF1',
    textDim: '#93A8B6',
    glow: 'rgba(141,184,207,0.18)',
    star: 'rgba(220,235,245,0.35)',
  },
  // Univers spatial premium par défaut
  standard: {
    bg1: '#060A22',
    bg2: '#140E4A',
    bg3: '#0B2A5C',
    card: 'rgba(120,160,255,0.08)',
    cardStrong: 'rgba(120,160,255,0.14)',
    border: 'rgba(110,220,255,0.28)',
    accent: '#5EE7FF',
    accent2: '#B57CFF',
    success: '#6CF2B0',
    text: '#F2F6FF',
    textDim: '#A6B3D9',
    glow: 'rgba(94,231,255,0.35)',
    star: 'rgba(255,255,255,0.8)',
  },
  // Plus de couleur et de contraste : pour les enfants qui recherchent la stimulation
  vif: {
    bg1: '#0A0626',
    bg2: '#2A0B5E',
    bg3: '#00476B',
    card: 'rgba(255,255,255,0.10)',
    cardStrong: 'rgba(255,255,255,0.18)',
    border: 'rgba(255,214,102,0.45)',
    accent: '#FFD666',
    accent2: '#FF6BD5',
    success: '#4DFFA1',
    text: '#FFFFFF',
    textDim: '#D2C8F5',
    glow: 'rgba(255,214,102,0.45)',
    star: 'rgba(255,255,255,0.95)',
  },
};

export const radius = { sm: 14, md: 22, lg: 32, xl: 44 };
