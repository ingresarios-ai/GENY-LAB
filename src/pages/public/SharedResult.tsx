// @ts-nocheck
// SharedResult — Viral curiosity-generating share pages
// Route: /compartir/:shareCode  (Supabase-backed)
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { supabase } from '../../lib/supabase';
import { ArrowRight, Lock } from 'lucide-react';

/* ── Helpers ── */
const CAT_LABELS: Record<string, string> = {
  programacion: 'Programación', setpoint: 'Setpoint', neuronas_espejo: 'Neuronas Espejo',
  adaptacion: 'Adaptación', merecimiento: 'Merecimiento', disciplina: 'Disciplina',
};
function getTempColor(score: number): string {
  if (score <= 20) return '#3b82f6';
  if (score <= 40) return '#06b6d4';
  if (score <= 60) return '#10b981';
  if (score <= 75) return '#FFD700';
  if (score <= 90) return '#f97316';
  return '#ef4444';
}

/* ── Curiosity CTA Block (shared across all activities) ── */
function CuriosityCTA({ hook, ctaText, emoji }: { hook: string; ctaText: string; emoji: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="mt-10 space-y-6"
    >
      {/* Curiosity Hook */}
      <div className="relative overflow-hidden rounded-3xl p-8 md:p-10 text-center bg-gradient-to-br from-brand-blue/10 via-purple-500/5 to-brand-green/10 border border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,209,255,0.08),transparent_70%)]" />
        <div className="relative space-y-5">
          <div className="text-5xl">{emoji}</div>
          <p className="text-lg md:text-xl font-bold text-white leading-snug max-w-md mx-auto">{hook}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-brand-blue to-cyan-500 text-white font-black uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(0,209,255,0.4)] hover:shadow-[0_0_50px_rgba(0,209,255,0.6)] hover:scale-[1.02] transition-all"
          >
            {ctaText}
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-[10px] text-white/30 uppercase tracking-widest">Gratis · 5 minutos · Sin tarjeta</p>
        </div>
      </div>

      {/* Social proof */}
      <div className="flex items-center justify-center gap-4">
        <div className="flex -space-x-2">
          {['🧑‍💼', '👩‍💻', '🧑‍🎓', '👨‍💼'].map((e, i) => (
            <div key={i} className="w-8 h-8 rounded-full bg-white/10 border-2 border-brand-bg flex items-center justify-center text-sm">{e}</div>
          ))}
        </div>
        <p className="text-xs text-slate-400"><span className="text-white font-bold">+2,400 traders</span> ya lo descubrieron</p>
      </div>

      <p className="text-[9px] font-mono text-white/15 uppercase tracking-widest text-center">INGRESARIOS · GENY LAB</p>
    </motion.div>
  );
}

/* ── Blurred teaser section ── */
function BlurredSection({ label }: { label: string }) {
  return (
    <div className="relative glass-card p-6 overflow-hidden">
      <div className="absolute inset-0 backdrop-blur-xl bg-white/5 z-10 flex items-center justify-center">
        <div className="flex items-center gap-2 text-white/60 text-xs font-black uppercase tracking-widest">
          <Lock className="w-4 h-4" />
          {label}
        </div>
      </div>
      <div className="space-y-3 blur-sm select-none" aria-hidden>
        <div className="h-3 bg-white/10 rounded w-3/4" />
        <div className="h-3 bg-white/10 rounded w-1/2" />
        <div className="h-3 bg-white/10 rounded w-2/3" />
        <div className="h-3 bg-white/10 rounded w-1/3" />
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   ACTIVITY RENDERERS — Viral / Curiosity-driven
   ────────────────────────────────────────────────────────── */

function getName(d: any) { return d.userName || d.n || d.name || null; }

function ADNResult({ d }: { d: any }) {
  const color = '#00D4FF';
  const name = getName(d);
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-8xl">{d.emoji || '🧬'}</motion.div>
        <p className="text-xs font-black uppercase tracking-widest text-[#FFD700]">Test de ADN Financiero</p>
        <h1 className="text-4xl md:text-5xl font-black uppercase">{name ? `El ADN de ${name}:` : 'Mi ADN es'} <span style={{ color }}>{d.adn}</span></h1>
        <p className="text-slate-400 text-base max-w-sm mx-auto">Cada trader tiene un perfil genético financiero único que define cómo gana, cómo pierde y cómo se sabotea.</p>
      </div>
      {/* Show just the teaser — enough to intrigue */}
      <div className="glass-card p-6 border-l-4" style={{ borderLeftColor: color }}>
        <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color }}>Lectura de perfil</p>
        <p className="text-base text-slate-300 leading-relaxed line-clamp-3">{d.lecturaCore}</p>
        <p className="text-xs text-brand-blue mt-3 font-bold">... continúa en el análisis completo</p>
      </div>
      {/* Blur the rest */}
      <BlurredSection label="Descubre tu sombra financiera" />
      <BlurredSection label="Patrón de sabotaje · Fortaleza real" />
      <CuriosityCTA
        emoji="🧬"
        hook="¿Cuál es TU ADN Financiero? Hay 5 perfiles. Solo uno es el tuyo."
        ctaText="Descubrir MI ADN"
      />
    </div>
  );
}

function TermostatoResult({ d }: { d: any }) {
  const color = getTempColor(d.puntaje_global);
  const radarData = Object.entries(d.categorias || {}).map(([k, v]) => ({ axis: CAT_LABELS[k] || k, value: v }));
  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-8xl">🌡️</motion.div>
        <p className="text-xs font-black uppercase tracking-widest" style={{ color }}>Termóstato Financiero</p>
        <div className="flex items-baseline justify-center gap-3">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-7xl font-black font-mono" style={{ color }}>{d.puntaje_global}°</motion.span>
        </div>
        <p className="text-2xl font-bold" style={{ color }}>{d.temperatura_label}</p>
        <p className="text-slate-400 text-sm max-w-sm mx-auto">Tu "temperatura" determina cuánto dinero estás programado para ganar. Si no la cambias, siempre volverás al mismo nivel.</p>
      </div>
      {/* Show radar — this is visually intriguing */}
      {radarData.length > 0 && (
        <div className="glass-card p-6">
          <p className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color }}>Mapa de Dimensiones</p>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="axis" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <Radar dataKey="value" stroke={color} fill={color} fillOpacity={0.25} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {/* Blur the diagnosis */}
      <BlurredSection label="Diagnóstico completo · Arquetipo" />
      <BlurredSection label="Fortalezas · Sombras · Plan de acción" />
      <CuriosityCTA
        emoji="🌡️"
        hook="¿A qué temperatura está TU termostato? El 90% de los traders están calibrados en modo supervivencia."
        ctaText="Medir MI Temperatura"
      />
    </div>
  );
}

function GastosHormigaResult({ d }: { d: any }) {
  const fmt = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;
  const name = getName(d);
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-8xl">🐜</motion.div>
        <p className="text-xs font-black uppercase tracking-widest text-[#FFD700]">Gastos Hormiga</p>
        {name && <p className="text-slate-400 text-sm"><span className="text-white font-bold">{name}</span> acaba de descubrir sus fugas invisibles</p>}
        <h1 className="text-5xl md:text-6xl font-black text-white">{fmt(d.total)}<span className="text-lg text-white/40">/mes</span></h1>
        <p className="text-lg text-red-400 font-bold">Eso es {fmt((d.total || 0) * 12)} al año que desaparece sin darte cuenta</p>
      </div>
      <div className="glass-card p-6 text-center border-t-2 border-t-emerald-500/40">
        <p className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-2">Si inviertes eso en el mercado...</p>
        <p className="text-4xl font-black text-emerald-400">{fmt(d.proyeccion || (d.total || 0) * 120)}</p>
        <p className="text-xs text-slate-400 mt-1">en 10 años con interés compuesto</p>
      </div>
      <BlurredSection label="Desglose completo de tus fugas" />
      <CuriosityCTA
        emoji="💸"
        hook="¿Cuánto dinero se te escapa sin darte cuenta cada mes? La mayoría pierde más de $3,000. ¿Y tú?"
        ctaText="Calcular MIS Gastos Hormiga"
      />
    </div>
  );
}

function TrampasDineroResult({ d }: { d: any }) {
  const totalResponses = Object.keys(d.responses || {}).length;
  const name = getName(d);
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-8xl">🧠</motion.div>
        <p className="text-xs font-black uppercase tracking-widest text-amber-500">Trampas del Dinero</p>
        <h1 className="text-3xl md:text-4xl font-black text-white uppercase">{name ? `${name} completó` : 'Reto de'} {totalResponses} Preguntas</h1>
        <p className="text-slate-400 text-base max-w-sm mx-auto">Tu cerebro tiene trampas mentales que te hacen tomar decisiones financieras irracionales. Cada una te cuesta dinero real.</p>
      </div>
      <div className="glass-card p-6 border-l-4 border-l-amber-500">
        <p className="text-xs font-black uppercase tracking-widest text-amber-500 mb-3">¿Sabías que...?</p>
        <p className="text-base text-white leading-relaxed">El <span className="text-amber-500 font-black">87% de los traders</span> activan al menos 3 trampas mentales por sesión sin darse cuenta. Cada trampa puede costarte entre el 2% y el 15% de tu cuenta.</p>
      </div>
      <BlurredSection label="Tus respuestas · Análisis de sesgos" />
      <CuriosityCTA
        emoji="🪤"
        hook="¿Cuántas trampas mentales activas en cada trade? Descúbrelo en 5 minutos."
        ctaText="Descubrir MIS Trampas"
      />
    </div>
  );
}

function PedemResultView({ d }: { d: any }) {
  const entries = Object.entries(d.data || {});
  const preview = entries.slice(0, 2);
  const name = getName(d);
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-8xl">📋</motion.div>
        <p className="text-xs font-black uppercase tracking-widest text-brand-blue">Mi Primer PEDEM</p>
        <h1 className="text-3xl md:text-4xl font-black text-white uppercase">{name ? `${name} ya tiene su` : ''} Plan Estructurado de Trading</h1>
        <p className="text-slate-400 text-base max-w-sm mx-auto">El PEDEM es el plan que separa a los traders que improvisan de los que son consistentes.</p>
      </div>
      {preview.length > 0 && (
        <div className="glass-card p-6 border-l-4 border-l-brand-blue">
          <p className="text-xs font-black uppercase tracking-widest text-brand-blue mb-3">Vista previa</p>
          {preview.map(([key, val], i) => (
            <div key={i} className="flex justify-between items-start py-2 border-b border-dashed border-white/10 last:border-b-0">
              <span className="text-xs tracking-[0.15em] uppercase text-slate-400 font-bold">{key}</span>
              <span className="text-sm font-medium text-right text-white max-w-[60%]">{String(val)}</span>
            </div>
          ))}
        </div>
      )}
      <BlurredSection label="Plan completo · Estrategia · Risk Management" />
      <CuriosityCTA
        emoji="📋"
        hook="¿Operas sin un plan? El 92% de los traders que pierden no tienen un PEDEM. Crea el tuyo en 10 minutos."
        ctaText="Crear MI PEDEM"
      />
    </div>
  );
}

const SOMBRA_TRACKS: Record<string, string> = {
  novato: "Principiante / No Operador",
  operador: "Trader Activo / Operador",
};

const SOMBRA_DIAG_R: Record<string, Record<string, { title: string; color: string; message: string }>> = {
  operador: {
    silencio: {
      title: "Saboteador en Silencio",
      color: "#10b981",
      message: "Pero está esperando. Cada trader exitoso lo descubrió tarde — y pagó caro. Tú tienes la oportunidad de blindarte antes de que despierte.",
    },
    acechando: {
      title: "Saboteador al Acecho",
      color: "#f59e0b",
      message: "Ya hace ruido. Aún no controla — pero está ganando terreno. Detenerlo ahora cuesta días. En 6 meses costará miles.",
    },
    operando: {
      title: "Saboteador Operando Contigo",
      color: "#f97316",
      message: "Y tú estás pagando la cuenta. Cada trade es 50% tuyo, 50% suyo. La diferencia entre perder y ganar consistentemente está en desactivarlo. AHORA.",
    },
    alMando: {
      title: "Saboteador al Mando",
      color: "#ea580c",
      message: "Esto es una emergencia. No es tu culpa — pero SÍ es tu responsabilidad. Cada día que esperas, le das más poder.",
    },
  },
  novato: {
    silencio: {
      title: "Saboteador en Silencio",
      color: "#10b981",
      message: "La impulsividad y el autosabotaje financiero suelen despertarse en momentos inesperados. Tienes la oportunidad de blindar tu mente y tu relación con el dinero antes de empezar a arriesgar capital.",
    },
    acechando: {
      title: "Saboteador al Acecho",
      color: "#f59e0b",
      message: "Ya hace ruido en tus finanzas. Pequeños gastos emocionales o la procrastinación para tomar decisiones clave están ganando terreno.",
    },
    operando: {
      title: "Saboteador Tomando las Riendas",
      color: "#f97316",
      message: "La impulsividad o el miedo al fracaso dictan tus pasos, afectando tu capacidad de ahorro y tu libertad financiera. Es hora de desactivarlo.",
    },
    alMando: {
      title: "Saboteador con el Control",
      color: "#ea580c",
      message: "Esto requiere tu atención inmediata. Sientes parálisis ante las oportunidades o tomas decisiones por puro impulso emocional.",
    },
  }
};

const FLOW_TRACKS: Record<string, { nombre: string; emoji: string; tagline: string; desc: string }> = {
  novato: {
    nombre: "Novato al Flow",
    emoji: "🌱",
    tagline: "No necesitas saber de trading. Solo necesitas conocerte.",
    desc: "Para personas que quieren dominar su mente y emociones antes de operar.",
  },
  trader: {
    nombre: "Trader en Flow",
    emoji: "⚡",
    tagline: "Ya operas. Ahora hazlo desde el estado óptimo.",
    desc: "Para traders activos que quieren activar su zona de máximo rendimiento.",
  },
};

const FLOW_ARQUETIPOS: Record<string, { nombre: string; emoji: string; desc: string }> = {
  explorador: { nombre: "El Explorador", emoji: "🧭", desc: "Tu flow llega con la novedad y el descubrimiento. Aprendes haciendo." },
  estratega:  { nombre: "El Estratega",  emoji: "♟️", desc: "Tu flow emerge cuando el plan se ejecuta con precisión." },
  artesano:   { nombre: "El Artesano",   emoji: "⚒️", desc: "Tu flow vive en la práctica deliberada y el dominio progresivo." },
  guardian:   { nombre: "El Guardián",   emoji: "🛡️", desc: "Tu flow viene de la consistencia y la disciplina sostenida." },
  visionario: { nombre: "El Visionario", emoji: "🔭", desc: "Tu flow surge en la síntesis y la visión de largo plazo." },
};

function SombraResult({ d }: { d: any }) {
  const day = d.selDay || d.d || 1;
  const phase = day <= 3 ? 'Detectar' : day <= 7 ? 'Desactivar' : 'Dominar';
  const phaseColor = day <= 3 ? '#f97316' : day <= 7 ? '#f59e0b' : '#10b981';
  const name = getName(d);

  const routeName = d.route ? SOMBRA_TRACKS[d.route] : null;
  const diagInfo = d.route && d.diagLevel && SOMBRA_DIAG_R[d.route] ? SOMBRA_DIAG_R[d.route][d.diagLevel] : null;
  const showScore = typeof d.diagScore === 'number';

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-8xl">🎭</motion.div>
        <p className="text-xs font-black uppercase tracking-widest" style={{ color: phaseColor }}>Reto del Saboteador Interior · Día {day}/10</p>
        <h1 className="text-3xl md:text-4xl font-black text-white uppercase leading-tight text-balance">
          {name ? `${name} completó el Reto de la Sombra` : (d.title ? `"${d.title}"` : `Fase ${phase} Activada`)}
        </h1>
        <p className="text-slate-400 text-base max-w-md mx-auto">Todos tenemos un <span className="text-white font-bold">Saboteador Interior</span> — una voz que nos hace cerrar trades ganadores antes de tiempo, mover el stop loss, o entrar por venganza.</p>
      </div>

      {/* Sombra Diagnostic info */}
      {(routeName || showScore || diagInfo) && (
        <div className="glass-card p-6 border-t-2 border-t-red-500/50 space-y-6 bg-gradient-to-b from-red-500/10 to-transparent">
          <p className="text-xs font-black uppercase tracking-widest text-red-400">Diagnóstico de Autosabotaje</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {routeName && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Ruta del Estudiante</p>
                <p className="text-base font-black text-white">{routeName}</p>
              </div>
            )}
            
            {showScore && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Nivel de Sabotaje Detectado</p>
                <p className="text-base font-black text-red-400">{d.diagScore}%</p>
              </div>
            )}
          </div>

          {diagInfo && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: diagInfo.color }} />
                <p className="text-sm font-black uppercase tracking-wider text-white">{diagInfo.title}</p>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{diagInfo.message}</p>
            </div>
          )}
        </div>
      )}

      {/* The shocking stat */}
      <div className="glass-card p-8 text-center border-t-2" style={{ borderTopColor: phaseColor }}>
        <p className="text-6xl font-black text-red-500 mb-2">80%</p>
        <p className="text-base text-white font-medium">de los traders pierden por sus emociones,<br /><span className="text-slate-400">no por su estrategia.</span></p>
      </div>

      {/* What they discovered */}
      <div className="glass-card p-6 border-l-4" style={{ borderLeftColor: phaseColor }}>
        <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: phaseColor }}>{name ? `Lo que descubrió ${name}` : 'Lo que descubrió'}</p>
        <p className="text-base text-white leading-relaxed">
          {name || 'Este trader'} completó con éxito <span className="font-black" style={{ color: phaseColor }}>los 10 días de entrenamiento</span> del Reto de la Sombra. Enfrentando y domesticando su propia psicología de trading.
        </p>
      </div>

      <BlurredSection label="Tu perfil de Saboteador · Diario emocional" />

      <CuriosityCTA
        emoji="🎭"
        hook="¿Quién es el trader que te hace perder dinero? No es el mercado. Eres TÚ. Descúbrelo en 10 días."
        ctaText="Empezar MI Reto"
      />
    </div>
  );
}

function FlowResult({ d }: { d: any }) {
  const day = d.selDay || d.d || 1;
  const phaseColor = day <= 3 ? '#3b82f6' : day <= 6 ? '#f59e0b' : '#10b981';
  const name = getName(d);

  const routeInfo = d.route ? FLOW_TRACKS[d.route] : null;
  const arqInfo = d.arquetipo ? FLOW_ARQUETIPOS[d.arquetipo] : null;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-8xl">⚡</motion.div>
        <p className="text-xs font-black uppercase tracking-widest" style={{ color: phaseColor }}>Reto del Flow · Día {day}/10</p>
        <h1 className="text-3xl md:text-4xl font-black text-white uppercase leading-tight text-balance">
          {name ? `${name} completó el Reto del Flow` : (d.title ? `"${d.title}"` : 'Estado de Flow Activado')}
        </h1>
        <p className="text-slate-400 text-base max-w-md mx-auto">El <span className="text-white font-bold">estado de Flow</span> es cuando tu mente opera a su máximo rendimiento — sin miedo, sin ego, concentración absoluta.</p>
      </div>

      {/* Track & Archetype Information if available */}
      {(routeInfo || arqInfo) && (
        <div className="glass-card p-6 border-t-2 border-t-brand-blue/50 space-y-6 bg-gradient-to-b from-brand-blue/10 to-transparent">
          <p className="text-xs font-black uppercase tracking-widest text-brand-blue">Perfil de Rendimiento</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {routeInfo && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{routeInfo.emoji}</span>
                  <span className="text-sm font-black uppercase tracking-wider text-white">{routeInfo.nombre}</span>
                </div>
                <p className="text-xs text-brand-yellow font-medium italic">"{routeInfo.tagline}"</p>
                <p className="text-xs text-slate-400 leading-relaxed">{routeInfo.desc}</p>
              </div>
            )}
            
            {arqInfo && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{arqInfo.emoji}</span>
                  <span className="text-sm font-black uppercase tracking-wider text-white">{arqInfo.nombre}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{arqInfo.desc}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="glass-card p-8 text-center border-t-2" style={{ borderTopColor: phaseColor }}>
        <p className="text-6xl font-black text-brand-blue mb-2">5%</p>
        <p className="text-base text-white font-medium">de los traders operan en Flow.<br /><span className="text-slate-400">El resto opera en miedo, ego o aburrimiento.</span></p>
      </div>

      <div className="glass-card p-6 border-l-4" style={{ borderLeftColor: phaseColor }}>
        <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: phaseColor }}>{name ? `Lo que descubrió ${name}` : 'Lo que descubrió'}</p>
        <p className="text-base text-white leading-relaxed">
          {name || 'Este trader'} completó con éxito <span className="font-black" style={{ color: phaseColor }}>el entrenamiento de 10 días</span> del Reto del Flow. 
          {routeInfo ? ` Siguió la ruta de ${routeInfo.nombre} para integrar la mentalidad óptima.` : ''}
          {arqInfo ? ` Operando desde su arquetipo de personalidad natural: ${arqInfo.nombre}.` : ''}
        </p>
      </div>

      <BlurredSection label="Tu perfil de Flow · Ritual pre-trading" />

      <CuriosityCTA
        emoji="⚡"
        hook="¿Operas en Flow o en caos? Los traders élite entrenan su mente como atletas. ¿Y tú?"
        ctaText="Activar MI Flow"
      />
    </div>
  );
}

function GenericResult({ d, activity }: { d: any; activity: string }) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="text-8xl">📊</div>
        <h1 className="text-3xl font-black text-white uppercase">Actividad Completada</h1>
        <p className="text-slate-400">Un trader completó una actividad en GENY LAB.</p>
      </div>
      <CuriosityCTA
        emoji="🚀"
        hook="GENY LAB es el laboratorio que transforma la psicología de tu trading. ¿Listo para descubrirte?"
        ctaText="Entrar a GENY LAB"
      />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   MAIN COMPONENT
   ────────────────────────────────────────────────────────── */

const ACTIVITY_TITLES: Record<string, string> = {
  adn: 'ADN Financiero', termostato: 'Termóstato Financiero', gastos: 'Gastos Hormiga',
  trampas: 'Trampas del Dinero', pedem: 'Mi Primer PEDEM', sombra: 'Mis Emociones', flow: 'Reto del Flow',
};
const ACTIVITY_EMOJI: Record<string, string> = { adn: '🧬', termostato: '🌡️', gastos: '🐜', trampas: '🧠', pedem: '📋', sombra: '🎭', flow: '⚡' };

export default function SharedResult() {
  const { shareCode } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: row, error } = await supabase.from('shared_results').select('*').eq('share_code', shareCode).single();
      if (error || !row) { setNotFound(true); setLoading(false); return; }
      setData(row);
      setLoading(false);
    })();
  }, [shareCode]);

  if (loading) return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center">
      <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-brand-blue font-black text-sm uppercase tracking-widest">
        Cargando...
      </motion.div>
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
      <div className="text-center space-y-6">
        <div className="text-6xl">🔍</div>
        <h1 className="text-2xl font-black uppercase">Resultado no encontrado</h1>
        <p className="text-brand-text-muted">Este enlace no existe o ha expirado.</p>
        <Link to="/" className="inline-block px-6 py-3 rounded-xl bg-brand-blue/10 border border-brand-blue/30 text-brand-blue text-sm font-bold uppercase tracking-wider hover:bg-brand-blue/20 transition-all">Ir a GENY LAB</Link>
      </div>
    </div>
  );

  const { activity, result_data: d } = data;

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Header */}
      <div className="border-b border-white/10 bg-brand-bg/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex flex-col items-center">
              <img src="/images/78.png" alt="GENY LAB" className="h-8 md:h-10 w-auto object-contain" />
              <span className="text-[7px] font-bold uppercase tracking-[0.3em] text-white mt-0.5">by Ingresarios</span>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-lg">{ACTIVITY_EMOJI[activity] || '📊'}</span>
              <p className="text-xs font-bold text-white uppercase tracking-wider">{ACTIVITY_TITLES[activity] || activity}</p>
            </div>
          </div>
          <Link
            to="/"
            className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-blue/10 border border-brand-blue/30 text-brand-blue text-[10px] font-black uppercase tracking-widest hover:bg-brand-blue/20 transition-all"
          >
            Conocer Geny Lab <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto px-4 py-10"
      >
        {activity === 'adn' && <ADNResult d={d} />}
        {activity === 'termostato' && <TermostatoResult d={d} />}
        {activity === 'gastos' && <GastosHormigaResult d={d} />}
        {activity === 'trampas' && <TrampasDineroResult d={d} />}
        {activity === 'pedem' && <PedemResultView d={d} />}
        {activity === 'sombra' && <SombraResult d={d} />}
        {activity === 'flow' && <FlowResult d={d} />}
        {!['adn', 'termostato', 'gastos', 'trampas', 'pedem', 'sombra', 'flow'].includes(activity) && <GenericResult d={d} activity={activity} />}
      </motion.div>
    </div>
  );
}
