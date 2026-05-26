import { Category, Currency, Recommendation } from './types';

export const CATEGORIES: Category[] = [
  { id: 'cafe',       icon: '☕', label: 'Café / bebidas',            hint: 'Café, jugos, gaseosas fuera de casa' },
  { id: 'delivery',   icon: '🍔', label: 'Delivery / comida rápida',  hint: 'Rappi, UberEats, combos de paso...' },
  { id: 'streaming',  icon: '📺', label: 'Suscripciones digitales',   hint: 'Netflix, Spotify, YouTube Premium...' },
  { id: 'snacks',     icon: '🍫', label: 'Snacks / mecatos',          hint: 'Dulces, chips, bebidas energéticas' },
  { id: 'transporte', icon: '🚗', label: 'Transporte extra',          hint: 'Uber/InDriver no planeados' },
  { id: 'salidas',    icon: '🎬', label: 'Salidas / entretenimiento', hint: 'Cine, bares, eventos, rumba' },
  { id: 'compras',    icon: '🛍️', label: 'Compras impulsivas',        hint: 'Ropa, accesorios, gadgets sin plan' },
  { id: 'tabaco',     icon: '💨', label: 'Cigarrillos / vapeadores',  hint: 'Tabaco, vapes y similares' },
  { id: 'belleza',    icon: '💄', label: 'Cuidado personal extra',    hint: 'Salón, spa, cosméticos impulso' },
  { id: 'apps',       icon: '🎮', label: 'Apps / juegos digitales',   hint: 'Compras en apps y microtransacciones' },
];

export const CURRENCIES: Currency[] = [
  { id: 'cop', name: 'Pesos Colombianos', symbol: '$', flag: '🇨🇴', locale: 'es-CO' },
  { id: 'mxn', name: 'Pesos Mexicanos',   symbol: '$', flag: '🇲🇽', locale: 'es-MX' },
  { id: 'usd', name: 'Dólares',           symbol: '$', flag: '🇺🇸', locale: 'en-US' },
];

export const ANNUAL_RATE = 0.07; // 7% ETF promedio

export function getRecommendation(monthlyTotal: number, currencyId: string): Recommendation {
  // Normalize thresholds based on currency
  const thresholds = currencyId === 'usd'
    ? { low: 12, mid: 50 }      // USD
    : currencyId === 'mxn'
    ? { low: 200, mid: 900 }    // MXN
    : { low: 50000, mid: 200000 }; // COP default

  if (monthlyTotal < thresholds.low) {
    return {
      title: 'ETF de bajo costo — disciplina ante todo',
      instruments: ['SCHD', 'VTI'],
      desc: `Con este monto lo clave es consistencia. Un ETF como SCHD o VTI te da exposición global con costos mínimos. El hábito vale más que el monto.`,
      highlight: 'Incluso pequeñas cantidades invertidas por 20 años superan millones gracias al interés compuesto.',
    };
  }
  if (monthlyTotal < thresholds.mid) {
    return {
      title: 'Dividendos + crecimiento: el combo GENY LAB',
      instruments: ['JEPQ', 'SCHD', 'VCIT'],
      desc: 'En este rango puedes combinar ingresos (JEPQ paga dividendos mensuales), crecimiento de calidad (SCHD) y algo de renta fija (VCIT) para estabilidad.',
      highlight: 'Con disciplina, este portafolio puede empezar a generarte ingresos pasivos reales en 3-5 años.',
    };
  }
  return {
    title: 'Portafolio de ingresos completo — metodología GENY LAB',
    instruments: ['JEPQ', 'SCHD', 'VCIT', 'BTAL'],
    desc: 'Cada activo cumple un rol dentro del sistema, y con este capital puedes construir el portafolio que Juan Fernando Villegas enseña.',
    highlight: 'Este es el portafolio real de GENY LAB. Únete para aprenderlo paso a paso con el método PEDEM.',
  };
}
