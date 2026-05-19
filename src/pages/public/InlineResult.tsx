// @ts-nocheck
// InlineResult — Renders shared results from base64-encoded URL data
// Route: /resultado/:data
import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';

const ACTIVITY_TITLES: Record<string, string> = {
  adn: 'ADN Financiero',
  termostato: 'Termóstato Financiero',
  gastos: 'Gastos Hormiga',
  trampas: 'Trampas del Dinero',
  pedem: 'Mi Primer PEDEM',
  sombra: 'Mis Emociones',
  flow: 'Reto del Flow',
};

const ACTIVITY_EMOJI: Record<string, string> = {
  adn: '🧬', termostato: '🌡️', gastos: '🐜', trampas: '🧠',
  pedem: '📋', sombra: '🤯', flow: '⚡',
};

/* ── Activity-specific renderers ── */

function GastosResult({ d }: { d: any }) {
  const fmt = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;
  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="text-7xl">🐜</div>
        <p className="text-xs font-black uppercase tracking-widest text-[#FFD700]">Gastos Hormiga</p>
        <div className="text-5xl font-black text-white">{fmt(d.total || 0)}<span className="text-lg text-white/50">/mes</span></div>
        {d.proj && <p className="text-sm text-brand-green font-medium">Proyección a 10 años: {fmt(d.proj)}</p>}
      </div>
      {d.name && (
        <div className="glass-card p-6 text-center">
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Trader</p>
          <p className="text-lg font-black text-white">{d.name}</p>
        </div>
      )}
      {d.gastos && Array.isArray(d.gastos) && d.gastos.length > 0 && (
        <div className="glass-card p-6 space-y-3 border-t-2 border-t-[#FFD700]/40">
          <p className="text-xs font-mono uppercase tracking-widest text-[#FFD700] mb-2">Fugas Detectadas</p>
          {d.gastos.map((g: any, i: number) => (
            <div key={i} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
              <span className="text-sm text-white/80">{g.desc || g.name || `Gasto ${i + 1}`}</span>
              {g.amount && <span className="text-sm font-mono text-[#FFD700]">{fmt(g.amount)}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TrampaResult({ d }: { d: any }) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="text-7xl">🧠</div>
        <p className="text-xs font-black uppercase tracking-widest text-brand-green">Trampas del Dinero</p>
        <h2 className="text-3xl font-black text-white uppercase">Reto Completado</h2>
        {d.n && <p className="text-slate-300">por <span className="text-white font-bold">{d.n}</span></p>}
      </div>
      {d.s !== undefined && (
        <div className="glass-card p-6 text-center border-t-2 border-t-brand-green/40">
          <p className="text-xs font-mono uppercase tracking-widest text-brand-green mb-2">Puntuación</p>
          <p className="text-5xl font-black text-brand-green">{d.s}<span className="text-lg text-slate-400">/{d.c || '?'}</span></p>
        </div>
      )}
    </div>
  );
}

function SombraResult({ d }: { d: any }) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="text-7xl">🤯</div>
        <p className="text-xs font-black uppercase tracking-widest text-orange-500">Mis Emociones</p>
        <h2 className="text-3xl font-black text-white uppercase">Progreso del Reto</h2>
        {d.n && <p className="text-slate-300">Trader: <span className="text-white font-bold">{d.n}</span></p>}
      </div>
      <div className="glass-card p-6 text-center border-t-2 border-t-orange-500/40">
        <p className="text-xs font-mono uppercase tracking-widest text-orange-500 mb-2">Días Completados</p>
        <p className="text-5xl font-black text-orange-500">{d.d || 0}<span className="text-lg text-slate-400">/10</span></p>
        {d.r && <p className="text-sm text-slate-400 mt-2">Ruta: <span className="text-white font-medium capitalize">{d.r}</span></p>}
      </div>
    </div>
  );
}

function FlowResult({ d }: { d: any }) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="text-7xl">⚡</div>
        <p className="text-xs font-black uppercase tracking-widest text-brand-green">Reto del Flow</p>
        <h2 className="text-3xl font-black text-white uppercase">Progreso del Reto</h2>
        {d.n && <p className="text-slate-300">Trader: <span className="text-white font-bold">{d.n}</span></p>}
      </div>
      <div className="glass-card p-6 text-center border-t-2 border-t-brand-green/40">
        <p className="text-xs font-mono uppercase tracking-widest text-brand-green mb-2">Días Completados</p>
        <p className="text-5xl font-black text-brand-green">{d.d || 0}<span className="text-lg text-slate-400">/10</span></p>
        {d.r && <p className="text-sm text-slate-400 mt-2">Ruta: <span className="text-white font-medium capitalize">{d.r}</span></p>}
      </div>
    </div>
  );
}

function PedemResult({ d }: { d: any }) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="text-7xl">📋</div>
        <p className="text-xs font-black uppercase tracking-widest text-brand-blue">Mi Primer PEDEM</p>
        <h2 className="text-2xl font-black text-white uppercase">Plan Estructurado</h2>
        {d.n && <p className="text-slate-300">por <span className="text-white font-bold">{d.n}</span></p>}
      </div>
      {d.data && typeof d.data === 'object' && (
        <div className="glass-card p-6 border-t-2 border-t-brand-blue/40 space-y-3">
          {Object.entries(d.data).map(([key, val], i) => (
            <div key={i} className="flex justify-between items-start py-2 border-b border-dashed border-white/10 last:border-b-0">
              <span className="text-xs tracking-[0.15em] uppercase text-slate-400 font-bold">{key}</span>
              <span className="text-sm font-medium text-right text-white max-w-[60%]">{String(val)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GenericResult({ d, activity }: { d: any; activity: string }) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="text-7xl">{ACTIVITY_EMOJI[activity] || '📊'}</div>
        <p className="text-xs font-black uppercase tracking-widest text-brand-blue">{ACTIVITY_TITLES[activity] || activity}</p>
        <h2 className="text-2xl font-black text-white uppercase">Resultado Compartido</h2>
        {d.n && <p className="text-slate-300">por <span className="text-white font-bold">{d.n}</span></p>}
      </div>
      <div className="glass-card p-6">
        <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap break-words">{JSON.stringify(d, null, 2)}</pre>
      </div>
    </div>
  );
}

/* ── Main Component ── */

export default function InlineResult() {
  const { data: rawData } = useParams();

  const parsed = useMemo(() => {
    if (!rawData) return null;
    try {
      // Try standard atob first
      const json = atob(rawData);
      return JSON.parse(json);
    } catch {
      try {
        // Try URI-decoded base64
        const json = decodeURIComponent(escape(atob(rawData)));
        return JSON.parse(json);
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
          <Link to="/" className="inline-block px-6 py-3 rounded-xl bg-brand-blue/10 border border-brand-blue/30 text-brand-blue text-sm font-bold uppercase tracking-wider hover:bg-brand-blue/20 transition-all">
            Ir a GENY LAB
          </Link>
        </div>
      </div>
    );
  }

  const activity = parsed.t || 'unknown';

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Header */}
      <div className="border-b border-white/10 bg-brand-bg/95 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/images/78.png" alt="GENY LAB" className="h-8 md:h-10 w-auto object-contain" />
            <div className="h-6 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-xl">{ACTIVITY_EMOJI[activity] || '📊'}</span>
              <p className="text-sm font-bold text-white">{ACTIVITY_TITLES[activity] || activity}</p>
            </div>
          </div>
          <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted hover:text-white transition-colors">
            Descubrir mi resultado →
          </Link>
        </div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto px-4 py-10"
      >
        {activity === 'gastos' && <GastosResult d={parsed} />}
        {activity === 'trampas' && <TrampaResult d={parsed} />}
        {activity === 'sombra' && <SombraResult d={parsed} />}
        {activity === 'flow' && <FlowResult d={parsed} />}
        {activity === 'pedem' && <PedemResult d={parsed} />}
        {!['gastos', 'trampas', 'sombra', 'flow', 'pedem'].includes(activity) && <GenericResult d={parsed} activity={activity} />}

        {/* CTA */}
        <div className="mt-12 text-center space-y-4">
          <div className="h-px bg-white/10 mb-8" />
          <p className="text-brand-text-muted text-sm">¿Quieres descubrir tu propio resultado?</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-blue to-cyan-500 text-white font-black uppercase tracking-widest text-sm shadow-[0_0_25px_rgba(0,209,255,0.3)] hover:shadow-[0_0_40px_rgba(0,209,255,0.5)] transition-all"
          >
            Entrar a GENY LAB 🚀
          </Link>
          <p className="text-[9px] font-mono text-white/15 uppercase tracking-widest mt-6">INGRESARIOS · GENY LAB</p>
        </div>
      </motion.div>
    </div>
  );
}
