// Contenu des 7 mondes. Les visuels sont des émojis système (aucune licence
// d'image tierce à gérer) ou des formes générées (couleurs, nombres).

export type Item = {
  id: string;
  fr: string;
  ar: string;
  emoji?: string;
  color?: string; // monde des couleurs
  glyph?: string; // chiffres et lettres
  dots?: number; // monde des chiffres
  lang?: 'fr' | 'ar'; // lettres propres à une langue
};

export type World = {
  id: string;
  fr: string;
  ar: string;
  icon: string;
  hue: [string, string];
  items: Item[];
};

const it = (id: string, emoji: string, fr: string, ar: string): Item => ({ id, emoji, fr, ar });

export const WORLDS: World[] = [
  {
    id: 'animaux',
    fr: 'Animaux',
    ar: 'الحيوانات',
    icon: '🦁',
    hue: ['#1FA2FF', '#12D8FA'],
    items: [
      it('chien', '🐶', 'le chien', 'الكلب'),
      it('chat', '🐱', 'le chat', 'القطة'),
      it('vache', '🐮', 'la vache', 'البقرة'),
      it('cheval', '🐴', 'le cheval', 'الحصان'),
      it('lion', '🦁', 'le lion', 'الأسد'),
      it('elephant', '🐘', "l'éléphant", 'الفيل'),
      it('poisson', '🐟', 'le poisson', 'السمكة'),
      it('oiseau', '🐦', "l'oiseau", 'العصفور'),
      it('lapin', '🐰', 'le lapin', 'الأرنب'),
      it('mouton', '🐑', 'le mouton', 'الخروف'),
      it('poule', '🐔', 'la poule', 'الدجاجة'),
      it('singe', '🐵', 'le singe', 'القرد'),
    ],
  },
  {
    id: 'couleurs',
    fr: 'Couleurs',
    ar: 'الألوان',
    icon: '🎨',
    hue: ['#FF6B9A', '#FFB86B'],
    items: [
      { id: 'rouge', color: '#E53935', fr: 'rouge', ar: 'أحمر' },
      { id: 'bleu', color: '#1E88E5', fr: 'bleu', ar: 'أزرق' },
      { id: 'vert', color: '#43A047', fr: 'vert', ar: 'أخضر' },
      { id: 'jaune', color: '#FDD835', fr: 'jaune', ar: 'أصفر' },
      { id: 'orange', color: '#FB8C00', fr: 'orange', ar: 'برتقالي' },
      { id: 'violet', color: '#8E24AA', fr: 'violet', ar: 'بنفسجي' },
      { id: 'rose', color: '#F48FB1', fr: 'rose', ar: 'وردي' },
      { id: 'noir', color: '#151515', fr: 'noir', ar: 'أسود' },
      { id: 'blanc', color: '#FAFAFA', fr: 'blanc', ar: 'أبيض' },
      { id: 'marron', color: '#6D4C41', fr: 'marron', ar: 'بني' },
    ],
  },
  {
    id: 'chiffres',
    fr: 'Chiffres',
    ar: 'الأرقام',
    icon: '🔢',
    hue: ['#7F7FD5', '#86A8E7'],
    items: [
      ['1', 'un', 'واحد'],
      ['2', 'deux', 'اثنان'],
      ['3', 'trois', 'ثلاثة'],
      ['4', 'quatre', 'أربعة'],
      ['5', 'cinq', 'خمسة'],
      ['6', 'six', 'ستة'],
      ['7', 'sept', 'سبعة'],
      ['8', 'huit', 'ثمانية'],
      ['9', 'neuf', 'تسعة'],
      ['10', 'dix', 'عشرة'],
    ].map(([g, f, a]) => ({ id: 'n' + g, glyph: g, dots: Number(g), fr: f, ar: a })),
  },
  {
    id: 'lettres',
    fr: 'Lettres',
    ar: 'الحروف',
    icon: '🔤',
    hue: ['#00C9A7', '#4D8076'],
    items: [
      ...'ABCDEFGHIJKLMNOPRSTUVZ'.split('').map((l) => ({
        id: 'fr-' + l,
        glyph: l,
        fr: 'la lettre ' + l,
        ar: l,
        lang: 'fr' as const,
      })),
      ...[
        ['ا', 'ألف'], ['ب', 'باء'], ['ت', 'تاء'], ['ث', 'ثاء'], ['ج', 'جيم'], ['ح', 'حاء'],
        ['خ', 'خاء'], ['د', 'دال'], ['ر', 'راء'], ['س', 'سين'], ['ش', 'شين'], ['ع', 'عين'],
        ['ف', 'فاء'], ['ق', 'قاف'], ['ك', 'كاف'], ['ل', 'لام'], ['م', 'ميم'], ['ن', 'نون'],
        ['ه', 'هاء'], ['و', 'واو'], ['ي', 'ياء'],
      ].map(([g, name]) => ({ id: 'ar-' + name, glyph: g, fr: g, ar: 'حرف ' + name, lang: 'ar' as const })),
    ],
  },
  {
    id: 'emotions',
    fr: 'Émotions',
    ar: 'المشاعر',
    icon: '😊',
    hue: ['#F7971E', '#FFD200'],
    items: [
      it('content', '😊', 'content', 'سعيد'),
      it('triste', '😢', 'triste', 'حزين'),
      it('colere', '😠', 'en colère', 'غاضب'),
      it('peur', '😨', 'qui a peur', 'خائف'),
      it('surpris', '😮', 'surpris', 'متفاجئ'),
      it('fatigue', '😴', 'fatigué', 'متعب'),
      it('calme', '😌', 'calme', 'هادئ'),
      it('malade', '🤒', 'malade', 'مريض'),
    ],
  },
  {
    id: 'quotidien',
    fr: 'Vie quotidienne',
    ar: 'الحياة اليومية',
    icon: '🏠',
    hue: ['#56AB2F', '#A8E063'],
    items: [
      it('dents', '🪥', 'se brosser les dents', 'تنظيف الأسنان'),
      it('bain', '🛁', 'prendre le bain', 'الاستحمام'),
      it('habiller', '👕', "s'habiller", 'ارتداء الملابس'),
      it('dormir', '🛏️', 'dormir', 'النوم'),
      it('manger', '🍽️', 'manger', 'الأكل'),
      it('boire', '🥤', 'boire', 'الشرب'),
      it('toilettes', '🚽', 'aller aux toilettes', 'الذهاب إلى الحمام'),
      it('mains', '🧼', 'se laver les mains', 'غسل اليدين'),
      it('ecole', '🏫', "aller à l'école", 'الذهاب إلى المدرسة'),
      it('chaussures', '👟', 'mettre ses chaussures', 'لبس الحذاء'),
    ],
  },
  {
    id: 'objets',
    fr: 'Objets et actions',
    ar: 'الأشياء والأفعال',
    icon: '⚽',
    hue: ['#B57CFF', '#5EE7FF'],
    items: [
      it('ballon', '⚽', 'le ballon', 'الكرة'),
      it('livre', '📖', 'le livre', 'الكتاب'),
      it('voiture', '🚗', 'la voiture', 'السيارة'),
      it('telephone', '📱', 'le téléphone', 'الهاتف'),
      it('chaise', '🪑', 'la chaise', 'الكرسي'),
      it('cuillere', '🥄', 'la cuillère', 'الملعقة'),
      it('courir', '🏃', 'courir', 'يجري'),
      it('sauter', '🤸', 'sauter', 'يقفز'),
      it('dessiner', '🎨', 'dessiner', 'يرسم'),
      it('chanter', '🎤', 'chanter', 'يغني'),
      it('ouvrir', '🚪', 'ouvrir la porte', 'يفتح الباب'),
      it('cle', '🔑', 'la clé', 'المفتاح'),
    ],
  },
];

export const getWorld = (id: string) => WORLDS.find((w) => w.id === id)!;

/** Les éléments visibles dans la langue active (les lettres dépendent de la langue). */
export const itemsFor = (w: World, lang: 'fr' | 'ar') =>
  w.items.filter((i) => !i.lang || i.lang === lang);
