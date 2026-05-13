const fs = require('fs');
const file = '/Users/josuegarcia/Antigravity/APP RETO V3 - VSL/src/pages/app/termostato-financiero/TermostatoFinanciero.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldHero = `<div className="text-center space-y-6">
              <div className="w-24 h-24 bg-brand-yellow/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <Thermometer className="w-12 h-12 text-brand-yellow" />
              </div>
              <h1 className="text-5xl font-black uppercase tracking-tight leading-none">
                Tu <span className="title-highlight">Termostato</span> <br />
                Financiero
              </h1>
              <p className="text-brand-text-muted text-xl font-medium max-w-2xl mx-auto">
                ¿Por qué algunos traders ganan 10k y los pierden al día siguiente, mientras otros escalan a 100k con calma? 
                La respuesta no está en la técnica, sino en tu capacidad mental de retener capital.
              </p>
            </div>`;

const newHero = `<div className="min-h-[70vh] flex flex-col items-center justify-center text-center">
              <div className="max-w-lg w-full space-y-8">
                <div className="text-8xl mb-4 animate-float">🌡️</div>
                
                <div className="space-y-2">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-[1.1] text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50">
                    TERMOSTATO<br />FINANCIERO
                  </h1>
                  <p className="text-brand-text-muted font-medium text-lg md:text-xl leading-relaxed">
                    ¿Por qué algunos ganan 10k y los pierden, mientras otros escalan a 100k? <br />
                    Mide tu capacidad de retener capital.
                  </p>
                </div>`;

// We also need to fix the closing tags of newHero to match the old container structure
// wait, the old structure is:
/*
<motion.div
  key="onboarding"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  className="max-w-4xl mx-auto space-y-12 py-10"
>
  <div className="text-center space-y-6"> ... </div>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6"> ... </div>
  <button ...>
</motion.div>
*/

// Let's rewrite the old onboarding entirely to match Gastos Hormiga's style better.
const oldOnboarding = `<motion.div
            key="onboarding"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto space-y-12 py-10"
          >
            <div className="text-center space-y-6">
              <div className="w-24 h-24 bg-brand-yellow/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <Thermometer className="w-12 h-12 text-brand-yellow" />
              </div>
              <h1 className="text-5xl font-black uppercase tracking-tight leading-none">
                Tu <span className="title-highlight">Termostato</span> <br />
                Financiero
              </h1>
              <p className="text-brand-text-muted text-xl font-medium max-w-2xl mx-auto">
                ¿Por qué algunos traders ganan 10k y los pierden al día siguiente, mientras otros escalan a 100k con calma? 
                La respuesta no está en la técnica, sino en tu capacidad mental de retener capital.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: <Target />, title: 'Diagnóstico', desc: 'Mide tu capacidad actual de gestión emocional y financiera.' },
                { icon: <BarChart3 />, title: 'Análisis', desc: 'Identifica tus techos de cristal y fugas de energía.' },
                { icon: <Zap />, title: 'Expansión', desc: 'Un reto de 10 días para elevar tu nivel de merecimiento.' }
              ].map((item, i) => (
                <div key={i} className="glass-card p-8 space-y-4 border-white/5 bg-white/[0.02]">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-brand-yellow">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight">{item.title}</h3>
                  <p className="text-brand-text-muted text-sm font-medium leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep('quiz')}
              className="w-full py-6 bg-brand-yellow text-black font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(254,221,4,0.3)]"
            >
              Comenzar Diagnóstico
              <ChevronRight className="w-6 h-6" />
            </button>
          </motion.div>`;

const newOnboarding = `<div className="max-w-5xl mx-auto space-y-10 pb-12">
            <button onClick={() => navigate('/app/actividades')} className="inline-flex items-center gap-2 text-brand-text-muted hover:text-white transition-colors uppercase font-black text-xs tracking-[0.2em] mb-6">
              <ArrowLeft className="w-4 h-4" /> Volver a Actividades
            </button>

            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-lg w-full space-y-8"
              >
                <div className="text-8xl mb-4 animate-float">🌡️</div>

                <div className="space-y-2">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-[1.1] text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50">
                    TERMOSTATO<br />FINANCIERO
                  </h1>
                  <p className="text-brand-text-muted font-medium text-lg md:text-xl leading-relaxed">
                    ¿Por qué algunos ganan 10k y los pierden, mientras otros escalan a 100k con calma? <br />
                    Mide tu capacidad mental de retener capital.
                  </p>
                </div>

                <div className="glass-card p-8 text-left space-y-5">
                  {[
                    { num: '01', color: 'text-brand-yellow', t: 'Diagnóstico', s: 'Mide tu capacidad emocional y financiera' },
                    { num: '02', color: 'text-brand-yellow', t: 'Análisis', s: 'Identifica tus techos de cristal' },
                    { num: '03', color: 'text-brand-yellow', t: 'Expansión', s: 'Reto de 10 días para elevar tu nivel' },
                  ].map((r, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <span className={\`\${r.color} font-black text-2xl min-w-[36px]\`}>{r.num}</span>
                      <div>
                        <div className="font-black uppercase tracking-tight text-base">{r.t}</div>
                        <div className="text-brand-text-muted text-sm font-medium mt-1">{r.s}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setStep('quiz')}
                  className="btn-primary w-full py-5 rounded-2xl text-sm font-black uppercase tracking-[0.15em] flex items-center justify-center gap-3"
                  style={{ backgroundColor: 'var(--brand-yellow)', color: '#000' }}
                >
                  Comenzar diagnóstico
                  <ChevronRight className="w-5 h-5" />
                </button>
              </motion.div>
            </div>
          </div>`;

content = content.replace(oldOnboarding, newOnboarding);
fs.writeFileSync(file, content);
