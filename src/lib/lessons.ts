// Trader Mapp — Lesson definitions & gamification config

export interface Lesson {
  id: string;
  order: number;
  emoji: string;
  title: string;
  subtitle: string;
  description: string;
  videoUrl: string; // YouTube embed URL (to be filled)
  activityRoute: string; // Route to the interactive activity
  xpVideo: number;
  xpActivity: number;
  xpBonus: number; // Bonus XP for completing both in one session
  phase: 'despertar' | 'dominio' | 'integracion';
}

export interface Level {
  id: number;
  name: string;
  emoji: string;
  minXp: number;
  maxXp: number;
  color: string;
}

// ============================================
// LEVELS
// ============================================

export const LEVELS: Level[] = [
  { id: 1, name: 'Novato',     emoji: '🌱', minXp: 0,   maxXp: 300,  color: '#94A3B8' },
  { id: 2, name: 'Explorador', emoji: '🧭', minXp: 300, maxXp: 650,  color: '#00D1FF' },
  { id: 3, name: 'Estratega',  emoji: '♟️', minXp: 650, maxXp: 1100, color: '#00E676' },
  { id: 4, name: 'Graduado',   emoji: '🎓', minXp: 1100, maxXp: 1500, color: '#F2C500' },
];

export const getLevelForXp = (xp: number): Level => {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) return LEVELS[i];
  }
  return LEVELS[0];
};

export const getXpProgressInLevel = (xp: number): { current: number; max: number; percent: number } => {
  const level = getLevelForXp(xp);
  const current = xp - level.minXp;
  const max = level.maxXp - level.minXp;
  return { current, max, percent: Math.min((current / max) * 100, 100) };
};

// ============================================
// LESSONS (7 total — one per existing activity)
// ============================================

export const LESSONS: Lesson[] = [
  {
    id: 'adn',
    order: 1,
    emoji: '🧬',
    title: 'Tu ADN Financiero',
    subtitle: 'Descubre qué tipo de inversionista eres',
    description: 'Cada persona tiene un perfil financiero único. Este test revela el tuyo para que tomes decisiones alineadas con tu naturaleza.',
    videoUrl: '', // To be filled
    activityRoute: '/app/adn',
    xpVideo: 30,
    xpActivity: 100,
    xpBonus: 20,
    phase: 'despertar',
  },
  {
    id: 'gastos',
    order: 2,
    emoji: '🐜',
    title: 'Gastos Hormiga',
    subtitle: 'Las fugas invisibles que devoran tu capital',
    description: 'Descubre cuánto dinero pierdes al año en gastos que ni sabías que tenías. El resultado te va a sorprender.',
    videoUrl: '',
    activityRoute: '/app/gastos',
    xpVideo: 30,
    xpActivity: 100,
    xpBonus: 20,
    phase: 'despertar',
  },
  {
    id: 'termostato',
    order: 3,
    emoji: '🌡️',
    title: 'Termostato Financiero',
    subtitle: 'Tu techo invisible de riqueza',
    description: 'Todos tenemos un "termostato" que limita cuánto dinero podemos ganar y conservar. Descubre dónde está el tuyo.',
    videoUrl: '',
    activityRoute: '/app/termostato',
    xpVideo: 30,
    xpActivity: 100,
    xpBonus: 20,
    phase: 'despertar',
  },
  {
    id: 'trampas',
    order: 4,
    emoji: '🧠',
    title: 'Trampas del Dinero',
    subtitle: '5 sesgos cognitivos que te cuestan dinero',
    description: 'Tu cerebro te engaña con el dinero. Identifica los sesgos que sabotean tus decisiones financieras.',
    videoUrl: '',
    activityRoute: '/app/trampas',
    xpVideo: 30,
    xpActivity: 100,
    xpBonus: 20,
    phase: 'despertar',
  },
  {
    id: 'pedem',
    order: 5,
    emoji: '📋',
    title: 'Mi Primer PEDEM',
    subtitle: 'El método que separa al 5% del 95%',
    description: 'PEDEM es el framework de planificación que usan los traders consistentes. Construye el tuyo paso a paso.',
    videoUrl: '',
    activityRoute: '/app/pedem',
    xpVideo: 30,
    xpActivity: 100,
    xpBonus: 20,
    phase: 'dominio',
  },
  {
    id: 'sombra',
    order: 6,
    emoji: '🤯',
    title: 'Mis Emociones',
    subtitle: 'Tu saboteador interior: detectarlo y desactivarlo',
    description: 'El mayor obstáculo entre tú y la consistencia no es la estrategia — son tus emociones. Es hora de enfrentarlas.',
    videoUrl: '',
    activityRoute: '/app/emociones',
    xpVideo: 30,
    xpActivity: 100,
    xpBonus: 20,
    phase: 'dominio',
  },
  {
    id: 'flow',
    order: 7,
    emoji: '⚡',
    title: 'Reto del Flow',
    subtitle: 'El estado de máximo rendimiento financiero',
    description: 'El Flow es el estado mental donde todo fluye. Aprende a activarlo cada vez que operas.',
    videoUrl: '',
    activityRoute: '/app/flow',
    xpVideo: 30,
    xpActivity: 100,
    xpBonus: 20,
    phase: 'integracion',
  },
];

export const TOTAL_LESSONS = LESSONS.length;

export const XP_PER_LESSON = 150; // video + activity + bonus
export const MAX_XP = LESSONS.reduce((sum, l) => sum + l.xpVideo + l.xpActivity + l.xpBonus, 0);

// Phase labels
export const PHASE_LABELS: Record<Lesson['phase'], string> = {
  despertar: 'Fase 1: Despertar',
  dominio: 'Fase 2: Dominio',
  integracion: 'Fase 3: Integración',
};
