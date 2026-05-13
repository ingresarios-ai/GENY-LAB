// PEDEM Activity Constants

export type PedemPath = 'novice' | 'routine' | 'trade';

export const PATH_LABELS: Record<PedemPath, string> = {
  novice: 'Estudiante',
  routine: 'Operador · Rutina',
  trade: 'Operador · Plan de Trade',
};

export const HABIT_LABELS: Record<string, string> = {
  sueno: 'Dormir mínimo 7h',
  horario: 'Horario fijo de estudio',
  gasto: 'Identifico gasto hormiga',
  objetivo: 'Objetivo financiero claro',
  accountability: 'Rendir cuentas',
};

export const NOVICE_HABITS = [
  { id: 'sueno', label: 'Duermo mínimo 7 horas por noche' },
  { id: 'horario', label: 'Tengo un horario fijo para estudiar trading' },
  { id: 'gasto', label: 'Identifico mi "gasto hormiga" diario' },
  { id: 'objetivo', label: 'Tengo un objetivo financiero claro escrito' },
  { id: 'accountability', label: 'Tengo alguien con quien rendir cuentas' },
];

export const ROUTINE_CHECKS = [
  { id: 'sueno', label: 'Dormí menos de 6 horas → no opero hoy' },
  { id: 'emocional', label: 'Estoy enojado, ansioso o eufórico → no opero' },
  { id: 'perdida', label: 'Ayer perdí y todavía quiero "recuperar" → no opero' },
  { id: 'plan', label: 'No tengo mi plan escrito antes de la apertura → no opero' },
];

export const TRADE_CHECKS = [
  { id: 'size', label: 'Calculé mi tamaño de posición (max 2% del capital)' },
  { id: 'stop', label: 'Mi stop está basado en estructura, no en "cuánto quiero perder"' },
  { id: 'rr', label: 'El R:R es mínimo 1:1.5' },
  { id: 'sombra', label: 'Observé mi estado emocional. No estoy operando desde sombra.' },
];

export const SHADOW_OPTIONS = [
  { id: 'controlador', name: 'Controlador', desc: 'Todo movimiento, en todo' },
  { id: 'saboteador', name: 'Saboteador', desc: 'Cambio el plan al último' },
  { id: 'apostador', name: 'Apostador', desc: 'Una más y recupero todo' },
  { id: 'perfeccionista', name: 'Perfeccionista', desc: 'Espero el setup perfecto' },
];

export const ASSET_OPTIONS = [
  { value: 'SPX', label: 'SPX · S&P 500' },
  { value: 'SPY', label: 'SPY · ETF S&P 500' },
  { value: 'ES', label: 'ES · Futuros S&P 500' },
  { value: 'QQQ', label: 'QQQ · Nasdaq 100' },
  { value: 'NQ', label: 'NQ · Futuros Nasdaq' },
];

export const DIRECTION_OPTIONS = [
  { value: 'alcista', label: '↑ Alcista', color: '#00FF94' },
  { value: 'bajista', label: '↓ Bajista', color: '#FF3EB0' },
  { value: 'neutral', label: '↔ Neutral', color: '#FFD93D' },
];

export const SHADOW_MAP: Record<string, string> = {
  controlador: 'Controlador',
  saboteador: 'Saboteador',
  apostador: 'Apostador',
  perfeccionista: 'Perfeccionista',
};

export const DIRECTION_MAP: Record<string, string> = {
  alcista: '↑ Alcista',
  bajista: '↓ Bajista',
  neutral: '↔ Neutral',
};
