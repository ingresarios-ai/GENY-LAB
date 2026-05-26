import { motion } from 'motion/react';

interface Props {
  onRoutine: () => void;
  onTrade: () => void;
  onBack: () => void;
}

export function PedemScreen2a({ onRoutine, onTrade, onBack }: Props) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-3 text-[10px] tracking-[0.25em] uppercase text-brand-text-muted font-bold font-mono">
        <span className="w-2 h-2 rounded-full bg-[#00D2FF]" />
        CAMINO DEL OPERADOR
      </div>
      <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight leading-none">
        ¿Qué quieres <span className="title-highlight">diseñar hoy?</span>
      </h1>
      <p className="text-brand-text-muted text-base leading-relaxed">
        Como operador tienes dos herramientas críticas. Puedes armar una ahora — la otra queda para otro día.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button onClick={onRoutine} className="glass-card p-6 text-center hover:border-[#00D2FF]/30 transition-all cursor-pointer">
          <span className="text-3xl mb-3 block">🌅</span>
          <div className="text-base font-black uppercase tracking-tight mb-1">Mi rutina<br/>pre-mercado</div>
          <p className="text-xs text-brand-text-muted">Los 30 min antes de abrir el mercado. Protocolo de preparación.</p>
        </button>
        <button onClick={onTrade} className="glass-card p-6 text-center hover:border-[#00D2FF]/30 transition-all cursor-pointer">
          <span className="text-3xl mb-3 block">🎯</span>
          <div className="text-base font-black uppercase tracking-tight mb-1">Mi plan<br/>de trade</div>
          <p className="text-xs text-brand-text-muted">Un trade específico con setup (configuración o patrón gráfico de entrada), entrada, stop y target.</p>
        </button>
      </div>

      <button onClick={onBack} className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 text-sm text-brand-text-muted hover:bg-white/10 hover:text-white transition-all font-bold cursor-pointer">
        ← Atrás
      </button>
    </motion.div>
  );
}
