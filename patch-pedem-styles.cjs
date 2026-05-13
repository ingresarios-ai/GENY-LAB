const fs = require('fs');
const file = '/Users/josuegarcia/Antigravity/APP RETO V3 - VSL/src/pages/app/pedem/PedemScreen1.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldHero = `<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-3 text-[10px] tracking-[0.25em] uppercase text-brand-text-muted font-bold font-mono">
        <span className="w-2 h-2 rounded-full bg-[#00D2FF]" />
        ANTES DE EMPEZAR
      </div>
      <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight leading-none">
        ¿Dónde estás <span className="title-highlight">hoy?</span>
      </h1>
      <p className="text-brand-text-muted text-base leading-relaxed">
        Hay dos caminos. Uno es para quien apenas está construyendo la base. El otro es para quien ya tiene trades activos. Escoge con honestidad.
      </p>

      <div className="grid gap-4">
        <button onClick={onNovice} className="glass-card p-6 text-left border-l-[3px] border-l-[#00FF94]/40 hover:border-l-[#00FF94] hover:bg-[#00FF94]/[0.03] transition-all group cursor-pointer">
          <span className="text-3xl mb-3 block">🌱</span>
          <div className="text-xl font-black uppercase tracking-tight mb-1">
            Aún <span className="text-[#00FF94]">no opero.</span>
          </div>
          <p className="text-sm text-brand-text-muted">Estoy construyendo la base. Quiero aprender a pensar como trader antes de entrar al mercado.</p>
        </button>

        <button onClick={onOperator} className="glass-card p-6 text-left border-l-[3px] border-l-[#00D2FF]/40 hover:border-l-[#00D2FF] hover:bg-[#00D2FF]/[0.03] transition-all group cursor-pointer">
          <span className="text-3xl mb-3 block">📊</span>
          <div className="text-xl font-black uppercase tracking-tight mb-1">
            Ya <span className="text-[#00D2FF]">opero.</span>
          </div>
          <p className="text-sm text-brand-text-muted">Tengo trades activos o he operado antes. Quiero estructurar mejor lo que hago.</p>
        </button>
      </div>

      <div className="glass-card p-5 border-l-[3px] border-l-[#00D2FF]/30">
        <p className="text-sm text-white/70 italic leading-relaxed">
          "El PEDEM no es solo para trading. Es una metodología para pensar. Empezamos donde estés hoy."
        </p>
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#00D2FF] font-bold font-mono mt-2">— Juan Villegas</p>
      </div>
    </motion.div>`;

const newHero = `<div className="min-h-[70vh] flex flex-col items-center justify-center text-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg w-full space-y-8">
        
        <div className="text-8xl mb-4 animate-float">🧭</div>
        
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-[1.1] text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50">
            MI PRIMER<br />PEDEM
          </h1>
          <p className="text-brand-text-muted font-medium text-lg md:text-xl leading-relaxed">
            Hay dos caminos. Uno es para quien apenas construye la base. El otro es para quien ya tiene trades activos.
          </p>
        </div>

        <div className="grid gap-4 mt-8">
          <button onClick={onNovice} className="glass-card p-6 text-left border-l-[3px] border-l-[#00FF94]/40 hover:border-l-[#00FF94] hover:bg-[#00FF94]/[0.03] transition-all group cursor-pointer">
            <span className="text-3xl mb-3 block">🌱</span>
            <div className="text-xl font-black uppercase tracking-tight mb-1">
              Aún <span className="text-[#00FF94]">no opero.</span>
            </div>
            <p className="text-sm text-brand-text-muted">Estoy construyendo la base. Quiero aprender a pensar como trader antes de entrar al mercado.</p>
          </button>

          <button onClick={onOperator} className="glass-card p-6 text-left border-l-[3px] border-l-[#00D2FF]/40 hover:border-l-[#00D2FF] hover:bg-[#00D2FF]/[0.03] transition-all group cursor-pointer">
            <span className="text-3xl mb-3 block">📊</span>
            <div className="text-xl font-black uppercase tracking-tight mb-1">
              Ya <span className="text-[#00D2FF]">opero.</span>
            </div>
            <p className="text-sm text-brand-text-muted">Tengo trades activos o he operado antes. Quiero estructurar mejor lo que hago.</p>
          </button>
        </div>

        <div className="glass-card p-5 border-l-[3px] border-l-[#00D2FF]/30 text-left">
          <p className="text-sm text-white/70 italic leading-relaxed">
            "El PEDEM no es solo para trading. Es una metodología para pensar. Empezamos donde estés hoy."
          </p>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#00D2FF] font-bold font-mono mt-2">— Juan Villegas</p>
        </div>
      </motion.div>
    </div>`;

content = content.replace(oldHero, newHero);
fs.writeFileSync(file, content);
