import { useState, useEffect } from 'react';
import { TempLevel } from './types';

export const TEMP_LEVELS: TempLevel[] = [
  { max: 20, label: 'Congelado', color: '#3b82f6', range: '0–20°' },
  { max: 40, label: 'Frío', color: '#06b6d4', range: '21–40°' },
  { max: 60, label: 'Templado', color: '#10b981', range: '41–60°' },
  { max: 75, label: 'Cálido', color: '#FFD700', range: '61–75°' },
  { max: 90, label: 'Caliente', color: '#f97316', range: '76–90°' },
  { max: 100, label: 'Hirviendo', color: '#ef4444', range: '91–100°' },
];

export function getTempLevel(score: number): TempLevel {
  return TEMP_LEVELS.find(l => score <= l.max) || TEMP_LEVELS[0];
}

export const CAT_LABELS: Record<string, string> = {
  programacion: 'Programación de Origen',
  setpoint: 'Setpoint Emocional',
  neuronas_espejo: 'Neuronas Espejo',
  adaptacion: 'Adaptación Hedónica',
  merecimiento: 'Merecimiento',
  disciplina: 'Disciplina y Hábitos',
};

export const RADAR_KEYS = ['programacion', 'setpoint', 'neuronas_espejo', 'adaptacion', 'merecimiento', 'disciplina'];

export function Thermometer3D({ score = 0, color = '#00D4FF', height = 320, animated = true, idle = false }: { score?: number; color?: string; height?: number; animated?: boolean; idle?: boolean }) {
  const [animScore, setAnimScore] = useState(0);
  useEffect(() => {
    if (!animated) { setAnimScore(score); return; }
    const duration = 1500, startTime = Date.now();
    const tick = () => {
      const t = Math.min((Date.now() - startTime) / duration, 1);
      setAnimScore(score * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [score, animated]);

  const [idleOffset, setIdleOffset] = useState(0);
  useEffect(() => {
    if (!idle) return;
    let raf: number;
    const animate = () => { setIdleOffset(Math.sin(Date.now() / 800) * 3); raf = requestAnimationFrame(animate); };
    animate();
    return () => cancelAnimationFrame(raf);
  }, [idle]);

  const finalScore = idle ? 35 + idleOffset : animScore;
  const fillHeight = (finalScore / 100) * 200;

  return (
    <svg viewBox="0 0 140 360" width={height * 0.39} height={height} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mercGrad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="tubeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1a2030" />
          <stop offset="50%" stopColor="#0a0e1a" />
          <stop offset="100%" stopColor="#1a2030" />
        </linearGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <rect x="54" y="20" width="32" height="260" rx="16" fill="url(#tubeGrad)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <rect x="60" y="26" width="20" height="252" rx="10" fill="#04060c" />
      <rect x="60" y={278 - fillHeight} width="20" height={fillHeight} fill="url(#mercGrad)" filter="url(#glow)" />
      <circle cx="70" cy="306" r="34" fill="#04060c" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <circle cx="70" cy="306" r="28" fill={color} opacity="0.9" filter="url(#glow)" />
      <circle cx="70" cy="306" r="22" fill={color} />
      <circle cx="65" cy="300" r="6" fill="rgba(255,255,255,0.3)" />
      {[0, 25, 50, 75, 100].map(tick => {
        const y = 278 - (tick / 100) * 252;
        return (<g key={tick}><line x1="90" y1={y} x2="100" y2={y} stroke="#4b5563" strokeWidth="1" /><text x="104" y={y + 4} fontSize="10" fill="#9ca3af" fontFamily="monospace">{tick}°</text></g>);
      })}
    </svg>
  );
}
