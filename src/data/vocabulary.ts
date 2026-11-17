// Vocabulaire de base du module CAA (Communication Alternative et Améliorée).

export type Card = {
  id: string;
  fr: string;
  ar: string;
  emoji?: string;
  photo?: string; // URI locale d'une photo personnelle
  category: string;
  custom?: boolean;
};

export type Category = { id: string; fr: string; ar: string; icon: string; color: string };

export const CATEGORIES: Category[] = [
  { id: 'besoins', fr: 'Besoins', ar: 'احتياجات', icon: '🙋', color: '#5EE7FF' },
  { id: 'nourriture', fr: 'Manger', ar: 'طعام', icon: '🍎', color: '#FFB86B' },
  { id: 'personnes', fr: 'Personnes', ar: 'أشخاص', icon: '👪', color: '#B57CFF' },
  { id: 'actions', fr: 'Actions', ar: 'أفعال', icon: '🏃', color: '#6CF2B0' },
  { id: 'emotions', fr: 'Je ressens', ar: 'أشعر', icon: '😊', color: '#FFD666' },
  { id: 'lieux', fr: 'Lieux', ar: 'أماكن', icon: '📍', color: '#FF6B9A' },
  { id: 'jeux', fr: 'Jouer', ar: 'ألعاب', icon: '🧸', color: '#86A8E7' },
  { id: 'perso', fr: 'Mes photos', ar: 'صوري', icon: '📷', color: '#A9C6A4' },
];

// Mots « noyau » toujours visibles : la communication n'est jamais bloquée.
export const CORE: Card[] = [
  { id: 'veux', fr: 'je veux', ar: 'أريد', emoji: '👉', category: 'core' },
  { id: 'suis', fr: 'je suis', ar: 'أنا', emoji: '🙂', category: 'core' },
  { id: 'oui', fr: 'oui', ar: 'نعم', emoji: '✅', category: 'core' },
  { id: 'non', fr: 'non', ar: 'لا', emoji: '❌', category: 'core' },
  { id: 'encore', fr: 'encore', ar: 'مرة أخرى', emoji: '🔁', category: 'core' },
  { id: 'stop', fr: 'stop', ar: 'توقف', emoji: '✋', category: 'core' },
  { id: 'aide', fr: "aide-moi", ar: 'ساعدني', emoji: '🆘', category: 'core' },
  { id: 'fini', fr: 'fini', ar: 'انتهيت', emoji: '🏁', category: 'core' },
];

const c = (category: string, id: string, emoji: string, fr: string, ar: string): Card => ({
  id,
  category,
  emoji,
  fr,
  ar,
});

export const CARDS: Card[] = [
  c('besoins', 'faim', '🍽️', "j'ai faim", 'أنا جائع'),
  c('besoins', 'soif', '🥤', "j'ai soif", 'أنا عطشان'),
  c('besoins', 'toilettes', '🚽', 'toilettes', 'الحمام'),
  c('besoins', 'mal', '🤕', "j'ai mal", 'أشعر بألم'),
  c('besoins', 'dormir', '😴', 'dormir', 'أنام'),
  c('besoins', 'pause', '⏸️', 'pause', 'استراحة'),
  c('besoins', 'calin', '🤗', 'câlin', 'عناق'),
  c('besoins', 'calme', '🎧', 'besoin de calme', 'أحتاج هدوءا'),
  c('nourriture', 'eau', '💧', "de l'eau", 'ماء'),
  c('nourriture', 'lait', '🥛', 'du lait', 'حليب'),
  c('nourriture', 'pain', '🍞', 'du pain', 'خبز'),
  c('nourriture', 'pomme', '🍎', 'une pomme', 'تفاحة'),
  c('nourriture', 'banane', '🍌', 'une banane', 'موزة'),
  c('nourriture', 'gateau', '🍰', 'un gâteau', 'كعكة'),
  c('nourriture', 'pates', '🍝', 'des pâtes', 'معكرونة'),
  c('nourriture', 'jus', '🧃', 'du jus', 'عصير'),
  c('nourriture', 'yaourt', '🥣', 'un yaourt', 'زبادي'),
  c('nourriture', 'poulet', '🍗', 'du poulet', 'دجاج'),
  c('personnes', 'maman', '👩', 'maman', 'ماما'),
  c('personnes', 'papa', '👨', 'papa', 'بابا'),
  c('personnes', 'moi', '🧒', 'moi', 'أنا'),
  c('personnes', 'frere', '👦', 'mon frère', 'أخي'),
  c('personnes', 'soeur', '👧', 'ma sœur', 'أختي'),
  c('personnes', 'mamie', '👵', 'mamie', 'جدتي'),
  c('personnes', 'papi', '👴', 'papi', 'جدي'),
  c('personnes', 'maitresse', '🧑‍🏫', 'la maîtresse', 'المعلمة'),
  c('actions', 'manger', '🍴', 'manger', 'آكل'),
  c('actions', 'boire', '🥤', 'boire', 'أشرب'),
  c('actions', 'jouer', '🎲', 'jouer', 'ألعب'),
  c('actions', 'sortir', '🚶', 'sortir', 'أخرج'),
  c('actions', 'regarder', '📺', 'regarder', 'أشاهد'),
  c('actions', 'ecouter', '🎵', 'écouter', 'أسمع'),
  c('actions', 'dessiner', '🖍️', 'dessiner', 'أرسم'),
  c('actions', 'aller', '➡️', 'aller', 'أذهب'),
  c('emotions', 'content', '😊', 'content', 'سعيد'),
  c('emotions', 'triste', '😢', 'triste', 'حزين'),
  c('emotions', 'colere', '😠', 'en colère', 'غاضب'),
  c('emotions', 'peur', '😨', "j'ai peur", 'خائف'),
  c('emotions', 'fatigue', '🥱', 'fatigué', 'متعب'),
  c('emotions', 'calme', '😌', 'calme', 'هادئ'),
  c('lieux', 'maison', '🏠', 'la maison', 'البيت'),
  c('lieux', 'ecole', '🏫', "l'école", 'المدرسة'),
  c('lieux', 'parc', '🌳', 'le parc', 'الحديقة'),
  c('lieux', 'voiture', '🚗', 'la voiture', 'السيارة'),
  c('lieux', 'chambre', '🛏️', 'la chambre', 'الغرفة'),
  c('lieux', 'dehors', '☀️', 'dehors', 'الخارج'),
  c('jeux', 'ballon', '⚽', 'le ballon', 'الكرة'),
  c('jeux', 'tablette', '📱', 'la tablette', 'اللوحة'),
  c('jeux', 'musique', '🎶', 'la musique', 'الموسيقى'),
  c('jeux', 'bulles', '🫧', 'les bulles', 'الفقاعات'),
  c('jeux', 'puzzle', '🧩', 'le puzzle', 'الأحجية'),
  c('jeux', 'livre', '📚', 'un livre', 'كتاب'),
  c('jeux', 'voiturejouet', '🏎️', 'les petites voitures', 'السيارات الصغيرة'),
  c('jeux', 'balancoire', '🛝', 'le toboggan', 'الزحليقة'),
];
