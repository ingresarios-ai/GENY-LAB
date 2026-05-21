// @ts-nocheck
// InlineResult — Viral curiosity-generating share pages
// Route: /resultado/:data  (base64-encoded inline data)
import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Lock } from 'lucide-react';

const ACTIVITY_TITLES: Record<string, string> = {
  adn: 'ADN Financiero', termostato: 'Termóstato Financiero', gastos: 'Gastos Hormiga',
  trampas: 'Trampas del Dinero', pedem: 'Mi Primer PEDEM', sombra: 'Mis Emociones', flow: 'Reto del Flow',
};
const ACTIVITY_EMOJI: Record<string, string> = {
  adn: '🧬', termostato: '🌡️', gastos: '🐜', trampas: '🧠',
  pedem: '📋', sombra: '🎭', flow: '⚡',
};

/* ── Curiosity CTA Block ── */
function CuriosityCTA({ hook, ctaText, emoji }: { hook: string; ctaText: string; emoji: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="mt-10 space-y-6"
    >
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
      </div>
    </div>
  );
}

/* ── Activity Renderers ── */

function GastosResult({ d }: { d: any }) {
  const fmt = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;
  const total = d.total || 0;
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-8xl">🐜</motion.div>
        <p className="text-xs font-black uppercase tracking-widest text-[#FFD700]">Gastos Hormiga</p>
        <h1 className="text-5xl md:text-6xl font-black text-white">{fmt(total)}<span className="text-lg text-white/40">/mes</span></h1>
        <p className="text-lg text-red-400 font-bold">Eso es {fmt(total * 12)} al año que desaparece</p>
        {d.n && <p className="text-slate-400 text-sm"><span className="text-white font-bold">{d.n}</span> acaba de descubrir sus fugas invisibles</p>}
      </div>
      <div className="glass-card p-8 text-center border-t-2 border-t-emerald-500/40">
        <p className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-2">Si inviertes eso en el mercado...</p>
        <p className="text-4xl font-black text-emerald-400">{fmt(d.proj || total * 120)}</p>
        <p className="text-xs text-slate-400 mt-1">en 10 años con interés compuesto</p>
      </div>
      <BlurredSection label="Desglose completo de tus fugas" />
      <CuriosityCTA
        emoji="💸"
        hook="¿Cuánto dinero se te escapa sin darte cuenta cada mes? La mayoría pierde más de $3,000. ¿Y tú?"
        ctaText="Calcular MIS Gastos"
      />
    </div>
  );
}

function TrampaResult({ d }: { d: any }) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-8xl">🧠</motion.div>
        <p className="text-xs font-black uppercase tracking-widest text-amber-500">Trampas del Dinero</p>
        <h1 className="text-3xl md:text-4xl font-black text-white uppercase">Reto Completado</h1>
        {d.n && <p className="text-slate-400 text-sm"><span className="text-white font-bold">{d.n}</span> descubrió sus trampas mentales</p>}
      </div>
      <div className="glass-card p-6 border-l-4 border-l-amber-500">
        <p className="text-xs font-black uppercase tracking-widest text-amber-500 mb-3">¿Sabías que...?</p>
        <p className="text-base text-white leading-relaxed">El <span className="text-amber-500 font-black">87% de los traders</span> activan al menos 3 trampas mentales por sesión sin darse cuenta. Cada trampa puede costarte entre el 2% y el 15% de tu cuenta.</p>
      </div>
      {d.s !== undefined && (
        <div className="glass-card p-6 text-center">
          <p className="text-xs font-mono uppercase tracking-widest text-amber-500 mb-2">Puntuación</p>
          <p className="text-5xl font-black text-amber-500">{d.s}<span className="text-lg text-slate-400">/{d.c || '?'}</span></p>
        </div>
      )}
      <BlurredSection label="Análisis completo de sesgos" />
      <CuriosityCTA
        emoji="🪤"
        hook="¿Cuántas trampas mentales activas en cada trade? Descúbrelo en 5 minutos."
        ctaText="Descubrir MIS Trampas"
      />
    </div>
  );
}

function SombraResult({ d }: { d: any }) {
  const day = d.d || 1;
  const phaseColor = day <= 3 ? '#f97316' : day <= 7 ? '#f59e0b' : '#10b981';
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-8xl">🎭</motion.div>
        <p className="text-xs font-black uppercase tracking-widest" style={{ color: phaseColor }}>Reto del Saboteador Interior · Día {day}/10</p>
        <h1 className="text-3xl md:text-4xl font-black text-white uppercase leading-tight">
          {d.n ? `${d.n} está enfrentando a su Saboteador` : 'Reto del Saboteador Interior'}
        </h1>
        <p className="text-slate-400 text-base max-w-md mx-auto">Todos tenemos un <span className="text-white font-bold">Saboteador Interior</span> — la voz que te hace cerrar trades ganadores, mover el stop loss, o entrar por venganza.</p>
      </div>
      <div className="glass-card p-8 text-center border-t-2" style={{ borderTopColor: phaseColor }}>
        <p className="text-6xl font-black text-red-500 mb-2">80%</p>
        <p className="text-base text-white font-medium">de los traders pierden por sus emociones,<br /><span className="text-slate-400">no por su estrategia.</span></p>
      </div>
      <BlurredSection label="Perfil de Saboteador · Diario emocional" />
      <CuriosityCTA
        emoji="🎭"
        hook="¿Quién es el trader que te hace perder dinero? No es el mercado. Eres TÚ. Descúbrelo en 10 días."
        ctaText="Empezar MI Reto"
      />
    </div>
  );
}

function FlowResult({ d }: { d: any }) {
  const day = d.d || 1;
  const phaseColor = day <= 3 ? '#3b82f6' : day <= 6 ? '#f59e0b' : '#10b981';
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-8xl">⚡</motion.div>
        <p className="text-xs font-black uppercase tracking-widest" style={{ color: phaseColor }}>Reto del Flow · Día {day}/10</p>
        <h1 className="text-3xl md:text-4xl font-black text-white uppercase leading-tight">
          {d.n ? `${d.n} está activando su estado de Flow` : 'Estado de Flow Activado'}
        </h1>
        <p className="text-slate-400 text-base max-w-md mx-auto">El <span className="text-white font-bold">estado de Flow</span> es cuando tu mente opera a su máximo — sin miedo, sin ego, concentración absoluta.</p>
      </div>
      <div className="glass-card p-8 text-center border-t-2" style={{ borderTopColor: phaseColor }}>
        <p className="text-6xl font-black text-brand-blue mb-2">5%</p>
        <p className="text-base text-white font-medium">de los traders operan en Flow.<br /><span className="text-slate-400">El resto opera en miedo, ego o aburrimiento.</span></p>
      </div>
      <BlurredSection label="Perfil de Flow · Ritual pre-trading" />
      <CuriosityCTA
        emoji="⚡"
        hook="¿Operas en Flow o en caos? Los traders élite entrenan su mente como atletas. ¿Y tú?"
        ctaText="Activar MI Flow"
      />
    </div>
  );
}

function PedemResult({ d }: { d: any }) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-8xl">📋</motion.div>
        <p className="text-xs font-black uppercase tracking-widest text-brand-blue">Mi Primer PEDEM</p>
        <h1 className="text-3xl md:text-4xl font-black text-white uppercase">Plan Estructurado de Trading</h1>
        {d.n && <p className="text-slate-400 text-sm"><span className="text-white font-bold">{d.n}</span> ya tiene su plan listo</p>}
        <p className="text-slate-400 text-base max-w-sm mx-auto">El PEDEM es el plan que separa a los traders que improvisan de los que son consistentes.</p>
      </div>
      <BlurredSection label="Plan completo · Estrategia · Risk Management" />
      <CuriosityCTA
        emoji="📋"
        hook="¿Operas sin un plan? El 92% de los traders que pierden no tienen un PEDEM. Crea el tuyo en 10 minutos."
        ctaText="Crear MI PEDEM"
      />
    </div>
  );
}

function GenericResult({ d, activity }: { d: any; activity: string }) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="text-8xl">{ACTIVITY_EMOJI[activity] || '📊'}</div>
        <h1 className="text-3xl font-black text-white uppercase">Actividad Completada</h1>
      </div>
      <CuriosityCTA
        emoji="🚀"
        hook="GENY LAB es el laboratorio que transforma la psicología de tu trading. ¿Listo para descubrirte?"
        ctaText="Entrar a GENY LAB"
      />
    </div>
  );
}

/* ── Main Component ── */

export default function InlineResult() {
  const { data: rawData } = useParams();

  const parsed = useMemo(() => {
    if (!rawData) return null;
    try {
      return JSON.parse(atob(rawData));
    } catch {
      try {
        return JSON.parse(decodeURIComponent(escape(atob(rawData))));
      } catch {
        return null;
      }
    }
  }, [rawData]);

  if (!parsed) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
        <div className="text-center space-y-6">
          <div className="text-6xl">🔍</div>
          <h1 className="text-2xl font-black uppercase">Enlace inválido</h1>
          <p className="text-brand-text-muted">Los datos del resultado no pudieron ser decodificados.</p>
          <Link to="/" className="inline-block px-6 py-3 rounded-xl bg-brand-blue/10 border border-brand-blue/30 text-brand-blue text-sm font-bold uppercase tracking-wider hover:bg-brand-blue/20 transition-all">Ir a GENY LAB</Link>
        </div>
      </div>
    );
  }

  const activity = parsed.t || 'unknown';

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
            Probar gratis <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto px-4 py-10"
      >
        {activity === 'gastos' && <GastosResult d={parsed} />}
        {activity === 'trampas' && <TrampaResult d={parsed} />}
        {activity === 'sombra' && <SombraResult d={parsed} />}
        {activity === 'flow' && <FlowResult d={parsed} />}
        {activity === 'pedem' && <PedemResult d={parsed} />}
        {!['gastos', 'trampas', 'sombra', 'flow', 'pedem'].includes(activity) && <GenericResult d={parsed} activity={activity} />}
      </motion.div>
    </div>
  );
}
