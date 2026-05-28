import { motion } from 'motion/react';

interface Props {
  onNovice: () => void;
  onOperator: () => void;
}

export function PedemScreen1({ onNovice, onOperator }: Props) {
  return (
    <div className="min-h-[70vh] flex flex-col justify-center max-w-5xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="grid md:grid-cols-2 gap-12 items-center"
      >
        {/* Left Column: Title & Context */}
        <div className="space-y-6">
          <div className="text-6xl md:text-8xl mb-4 animate-float w-fit">🧭</div>
          
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-[1.1] text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50">
              MI PRIMER<br />PEDEM
            </h1>
            <p className="text-brand-text-muted font-medium text-lg leading-relaxed max-w-md">
              Hay dos caminos. Uno es para quien apenas construye la base. El otro es para quien ya tiene trades activos.
            </p>
          </div>
          
          <div className="glass-card p-5 border-l-[3px] border-l-[#00D2FF]/30 text-left hidden md:block mt-8">
            <p className="text-sm text-white/70 italic leading-relaxed">
              "El PEDEM no es solo para trading. Es una metodología para pensar. Empezamos donde estés hoy."
            </p>
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#00D2FF] font-bold font-mono mt-2">— Juan Villegas</p>
          </div>
        </div>

        {/* Right Column: Choices */}
        <div className="grid gap-4 w-full">
          <button onClick={onNovice} className="glass-card p-8 text-left border-l-[3px] border-l-[#00FF94]/40 hover:border-l-[#00FF94] hover:bg-[#00FF94]/[0.03] transition-all group cursor-pointer h-full flex flex-col justify-center">
            <span className="text-4xl mb-4 block group-hover:scale-110 transition-transform origin-left">🌱</span>
            <div className="text-2xl font-black uppercase tracking-tight mb-2">
              Aún <span className="text-[#00FF94]">no opero.</span>
            </div>
            <p className="text-sm text-brand-text-muted leading-relaxed">Estoy construyendo la base. Quiero aprender a pensar como trader antes de entrar al mercado.</p>
          </button>

          <button onClick={onOperator} className="glass-card p-8 text-left border-l-[3px] border-l-[#00D2FF]/40 hover:border-l-[#00D2FF] hover:bg-[#00D2FF]/[0.03] transition-all group cursor-pointer h-full flex flex-col justify-center">
            <span className="text-4xl mb-4 block group-hover:scale-110 transition-transform origin-left">📊</span>
            <div className="text-2xl font-black uppercase tracking-tight mb-2">
              Ya <span className="text-[#00D2FF]">opero.</span>
            </div>
            <p className="text-sm text-brand-text-muted leading-relaxed mb-3">Tengo trades activos o he operado antes. Quiero estructurar mejor lo que hago.</p>
            <div className="flex items-start gap-2 px-3 py-2 bg-[#00D2FF]/10 border border-[#00D2FF]/20 rounded-lg">
              <span className="text-[#00D2FF] text-xs mt-0.5">⚠️</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">Solo selecciona esta opción si operas con <strong className="text-[#00D2FF]">capital real</strong>. Si operas en demo o aún no operas, elige <strong className="text-[#00FF94]">la otra ruta</strong>.</p>
            </div>
          </button>
          
          <div className="glass-card p-5 border-l-[3px] border-l-[#00D2FF]/30 text-left md:hidden mt-4">
            <p className="text-sm text-white/70 italic leading-relaxed">
              "El PEDEM no es solo para trading. Es una metodología para pensar. Empezamos donde estés hoy."
            </p>
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#00D2FF] font-bold font-mono mt-2">— Juan Villegas</p>
          </div>
        </div>
        
      </motion.div>
    </div>
  );
}
