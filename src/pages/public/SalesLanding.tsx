// @ts-nocheck
// GENY LAB — High-Conversion Sales Page V4
// Strategy: PAS framework + Identity shift + Future pacing + Risk reversal
// Source material: VSL script — NOT a copy-paste, but strategically restructured
import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'motion/react';
import {
  Play, CheckCircle2, ArrowRight, ChevronDown, ChevronUp,
  ArrowDown, Lock, Zap, Shield, Star, Clock, Users, Gift,
  AlertTriangle, TrendingDown, X, Eye, Target, Flame
} from 'lucide-react';
import { Footer } from '../../components/Footer';

/* ── Utilities ─────────────────────────────────────────────────────────── */

function FadeIn({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 28 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay, ease: 'easeOut' }} className={className}>
      {children}
    </motion.div>
  );
}

const CTA_URL = 'https://whop.com/ingresarios/geny-lab/';

function CTAButton({ large = false, className = '', text = 'QUIERO MI ACCESO AHORA' }: { large?: boolean; className?: string; text?: string }) {
  return (
    <a href={CTA_URL} target="_blank" rel="noopener noreferrer"
      className={`group relative inline-flex items-center justify-center gap-3 font-black uppercase tracking-wider rounded-2xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] ${large ? 'px-10 py-5 text-base md:text-lg' : 'px-8 py-4 text-sm md:text-base'} bg-gradient-to-r from-[#00D1FF] to-[#00E676] text-[#05080f] shadow-[0_0_40px_rgba(0,209,255,0.3)] hover:shadow-[0_0_60px_rgba(0,209,255,0.5)] ${className}`}>
      <span>{text}</span>
      <ArrowRight size={large ? 22 : 18} className="group-hover:translate-x-1 transition-transform" />
      <span className="absolute inset-0 rounded-2xl border-2 border-[#00D1FF]/40 animate-ping opacity-20 pointer-events-none" />
    </a>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-4 p-5 md:p-6 text-left">
        <h4 className="text-base md:text-lg font-bold text-white pr-4">{q}</h4>
        {open ? <ChevronUp size={20} className="text-[#00D1FF] shrink-0" /> : <ChevronDown size={20} className="text-white/40 shrink-0" />}
      </button>
      {open && (
        <div className="px-5 md:px-6 pb-5 md:pb-6 -mt-1">
          <p className="text-white/60 text-sm md:text-base leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

/* ── Highlight callout ─────────────────────────────────────────────────── */
function Callout({ children, color = '#00D1FF' }: { children: React.ReactNode; color?: string }) {
  return (
    <div className="rounded-xl p-5 md:p-6 my-6" style={{ background: `${color}08`, borderLeft: `3px solid ${color}40` }}>
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   MAIN
   ════════════════════════════════════════════════════════════════════════ */

export default function SalesLanding() {
  const [timeLeft, setTimeLeft] = useState({ h: 47, m: 59, s: 59 });
  const [showStickyBar, setShowStickyBar] = useState(false);
  const pricingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('geny_landing_timer');
    let end: number;
    if (saved) { end = parseInt(saved); }
    else { end = Date.now() + 48 * 60 * 60 * 1000; localStorage.setItem('geny_landing_timer', end.toString()); }
    const tick = () => {
      const diff = Math.max(0, end - Date.now());
      setTimeLeft({ h: Math.floor(diff / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) });
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const h = () => { if (pricingRef.current) setShowStickyBar(pricingRef.current.getBoundingClientRect().bottom < 0); };
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');
  const [spots] = useState(() => {
    const s = localStorage.getItem('geny_spots');
    if (s) return parseInt(s);
    const n = Math.floor(Math.random() * 15) + 12;
    localStorage.setItem('geny_spots', n.toString());
    return n;
  });

  return (
    <div className="min-h-screen bg-[#05080f] text-white overflow-hidden relative">
      {/* Background Decorative Tech Grid & Glow Blobs */}
      <div className="absolute top-0 left-0 right-0 h-[100vh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/15 via-[#05080f]/80 to-[#05080f] -z-10 pointer-events-none" />
      <div className="absolute top-[10%] left-[5%] w-[400px] h-[400px] bg-[#00D1FF]/[0.03] rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute top-[30%] right-[5%] w-[500px] h-[500px] bg-[#00E676]/[0.02] rounded-full blur-[140px] -z-10 pointer-events-none" />

      {/* 🚨 Warning Top Bar */}
      <div className="bg-[#fe0443]/10 border-b border-[#fe0443]/20 py-3 text-center text-xs sm:text-sm font-mono tracking-widest text-[#fe0443] font-bold flex items-center justify-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-[#fe0443] animate-pulse" />
        ATENCIÓN: COHORTE EXCLUSIVA LIMITADA A 100 CUPOS · SÓLO QUEDAN {spots} DISPONIBLES HOY
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          HERO — Pattern Interrupt + Video
          Technique: Identity-based headline that makes them feel SEEN
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative pt-12 pb-16 md:pt-16 md:pb-24">
        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center mb-10 md:mb-12">
            <img src="/images/78.png" alt="GENY LAB" className="w-56 md:w-72 mx-auto object-contain drop-shadow-[0_0_20px_rgba(0,209,255,0.25)]" />
          </div>

          {/* Video VSL Player mockup */}
          <div className="relative w-full max-w-4xl mx-auto mb-12 md:mb-16">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#00D1FF]/30 via-[#00E676]/20 to-[#00D1FF]/30 -z-10 blur-md opacity-75" />
            <div className="aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(0,209,255,0.18)] bg-[#070b13] relative group cursor-pointer hover:scale-[1.01] transition-transform duration-300">
              <div className="w-full h-full flex flex-col items-center justify-center gap-5 bg-gradient-to-br from-[#0a0f1d] via-[#05080f] to-[#0a0f1d]">
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-24 h-24 rounded-full bg-[#00D1FF]/20 animate-ping opacity-60 pointer-events-none" />
                  <div className="absolute w-20 h-20 rounded-full bg-[#00E676]/10 animate-pulse border border-[#00E676]/30 pointer-events-none" />
                  <div className="w-20 h-20 rounded-full bg-[#00D1FF]/15 border border-[#00D1FF]/55 flex items-center justify-center shadow-[0_0_40px_rgba(0,209,255,0.4)] relative z-10 hover:bg-[#00D1FF]/25 hover:scale-105 transition-all duration-300">
                    <Play size={32} className="text-[#00D1FF] ml-1 fill-[#00D1FF]/20" />
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-white/80 font-mono text-xs uppercase tracking-[0.25em] font-bold">MIRA EL VIDEO EXPLICATIVO (4 MIN)</p>
                  <p className="text-white/35 text-xs">Asegúrate de encender tu volumen 🔊 · El video comenzará a reproducirse</p>
                </div>
              </div>
            </div>
            
            {/* Secure payment logos below video */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-5 text-white/35 text-xs font-mono uppercase tracking-[0.15em]">
              <span className="flex items-center gap-1.5"><Lock size={12} className="text-[#00D1FF]" /> Conexión Segura SSL</span>
              <span className="flex items-center gap-1.5"><Shield size={12} className="text-[#00E676]" /> Garantía Total 15 Días</span>
              <span className="flex items-center gap-1.5"><Clock size={12} className="text-[#f59e0b]" /> Acceso de por vida</span>
            </div>
          </div>

          {/* HEADLINE — Identity-based pattern interrupt (HUGE TYPOGRAPHY) */}
          <div className="text-center max-w-5xl mx-auto mt-6">
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-[4rem] xl:text-[4.6rem] font-black leading-[1.08] tracking-tight mb-8">
              Sabes exactamente lo que tienes que hacer…<br />
              <span className="bg-gradient-to-r from-red-500 via-red-400 to-[#FF6321] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(239,68,68,0.25)]">
                y aún así lo haces mal.
              </span>
            </h1>
            <p className="text-white/60 text-lg sm:text-xl md:text-2xl leading-relaxed max-w-3xl mx-auto mb-10">
              Si esa frase te dolió al leerla, felicidades: eres parte del 95% de los traders que opera bajo el caos. Esto es para ti.
            </p>
            <div className="animate-bounce inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 text-white/40">
              <ArrowDown size={18} />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          AGITATION — Make them FEEL the pain (not just read it)
          Technique: Comparison between Chaos & Control
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 relative bg-[#070b14]/50 border-y border-white/5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:30px_30px]" />
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto mb-14">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-tight mb-4">
                ¿Por qué sigues <span className="text-red-400">saboteando</span> tu cuenta?
              </h2>
              <p className="text-white/50 text-base md:text-lg">
                Haces un plan perfecto. Sabes dónde entrar. Pero cuando el mercado se mueve, entras en pánico, mueves el stop o cierras antes de tiempo. Esto es lo que está pasando:
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 items-stretch">
            {/* Left Column: Chaos (The Pain) */}
            <FadeIn>
              <div className="rounded-3xl p-6 md:p-8 h-full border border-red-500/20 bg-gradient-to-b from-red-950/[0.08] to-transparent shadow-[0_0_50px_rgba(239,68,68,0.03)] space-y-6 flex flex-col justify-between">
                <div className="space-y-5">
                  <div className="flex items-center gap-3 border-b border-red-500/10 pb-4">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                      <AlertTriangle size={18} />
                    </div>
                    <h3 className="text-base md:text-lg font-black uppercase tracking-wider text-red-400">EL TRADING DEL CAOS (EL 95%)</h3>
                  </div>

                  <p className="text-white/70 text-sm md:text-base leading-relaxed">
                    Operas desde el caos mental. Tu cerebro no está entrenado para sostener el riesgo, por lo que entra en modo de supervivencia. No piensas: reaccionas.
                  </p>

                  <div className="flex flex-col gap-3.5">
                    {[
                      'Dudas de tus setups y entras tarde o dejas pasar la oportunidad.',
                      'Mueves el stop-loss en pánico creyendo que el mercado se recuperará.',
                      'Cierras operaciones ganadoras antes de tiempo por miedo a perderlas.',
                      'Operas por venganza para recuperar lo que perdiste en el trade anterior.'
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="mt-1 w-5 h-5 rounded-md bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                          <span className="text-red-400 text-xs font-black">✕</span>
                        </div>
                        <p className="text-white/50 text-sm md:text-base">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-red-500/10 mt-6">
                  <p className="text-red-300/80 text-xs md:text-sm font-semibold italic">
                    "Eso no es estupidez. Es tu cerebro llegando a su límite biológico de tolerancia al riesgo."
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* Right Column: Control (The Solution Reframe) */}
            <FadeIn delay={0.15}>
              <div className="rounded-3xl p-6 md:p-8 h-full border border-[#00E676]/20 bg-gradient-to-b from-[#00E676]/[0.08] to-transparent shadow-[0_0_50px_rgba(0,230,118,0.03)] space-y-6 flex flex-col justify-between">
                <div className="space-y-5">
                  <div className="flex items-center gap-3 border-b border-[#00E676]/10 pb-4">
                    <div className="w-8 h-8 rounded-lg bg-[#00E676]/10 border border-[#00E676]/30 flex items-center justify-center text-[#00E676] shrink-0">
                      <Target size={18} />
                    </div>
                    <h3 className="text-base md:text-lg font-black uppercase tracking-wider text-[#00E676]">EL TRADER SISTEMÁTICO (EL 5%)</h3>
                  </div>

                  <p className="text-white/70 text-sm md:text-base leading-relaxed">
                    Operas como una terminal matemática. Conoces tus emociones, sabes medir tu termostato financiero y ejecutas el plan sin drama ni dilemas mentales.
                  </p>

                  <div className="flex flex-col gap-3.5">
                    {[
                      'Ejecutas con confianza porque sabes qué estilo encaja con tu ADN.',
                      'Mantienes el stop-loss fijo, aceptando las pérdidas como parte del negocio.',
                      'Dejas correr las ganancias hasta tu objetivo técnico planificado.',
                      'Apagas las pantallas después de tu límite de pérdidas diario, sin dudar.'
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="mt-1 w-5 h-5 rounded-md bg-[#00E676]/10 border border-[#00E676]/20 flex items-center justify-center shrink-0">
                          <CheckCircle2 size={12} className="text-[#00E676]" />
                        </div>
                        <p className="text-white/60 text-sm md:text-base">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#00E676]/10 mt-6">
                  <p className="text-[#00E676] text-xs md:text-sm font-semibold italic">
                    "La consistencia real no está en la gráfica, está en cómo calibras tu propio sistema de ejecución."
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.3}>
            <p className="text-[#00D1FF] text-lg md:text-2xl font-black text-center mt-12 uppercase tracking-wide">
              Si te identificaste con el caos, sigue leyendo. Lo que viene va a reconfigurar tu forma de operar.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          POLARIZATION — Filter & elevate the reader
          Technique: Exclusion creates desire. "Not for you" = "I NEED this"
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-12 md:py-16 relative">
        <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8">
          <FadeIn>
            <div className="rounded-3xl p-8 md:p-10 border border-red-500/15 bg-red-500/[0.03] backdrop-blur-xl relative overflow-hidden shadow-[inset_0_0_30px_rgba(239,68,68,0.05)]">
              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-red-500/[0.04] rounded-full blur-[80px]" />
              <p className="text-red-400 text-xs md:text-sm font-mono font-bold uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
                ⛔ LEER ANTES DE CONTINUAR:
              </p>
              <h3 className="text-xl md:text-2xl font-black uppercase text-white mb-3">Esto NO es para todo el mundo</h3>
              <p className="text-white/60 text-sm md:text-base leading-relaxed mb-4">
                Si buscas un grupo de señales de Telegram para copiar setups, un robot automático que opere milagrosamente por ti, o el secreto para hacerte millonario este fin de semana... <strong>por favor, cierra esta pestaña.</strong>
              </p>
              <p className="text-white/65 text-sm md:text-base leading-relaxed">
                GENY LAB es un sistema de entrenamiento estricto para traders que ya se cansaron de perder capital por indisciplina y están listos para profesionalizar su mentalidad. <strong>Si eres de los que hacen el trabajo duro, bienvenido.</strong>
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          THE SHIFT — Reframe the problem
          Technique: "The real problem isn't what you think"
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00D1FF]/[0.02] to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs md:text-sm font-mono tracking-[0.25em] uppercase text-[#00D1FF] mb-3 block">EL GRAN REVELADOR</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-white">
                El problema nunca fue<br />
                <span className="bg-gradient-to-r from-[#00D1FF] to-[#00E676] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(0,209,255,0.15)]">la estrategia.</span>
              </h2>
            </div>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="space-y-6 max-w-4xl mx-auto">
              <p className="text-white/80 text-lg md:text-xl leading-relaxed text-center">
                Todos los mentores y cursos que has comprado hasta hoy te enseñaron a operar <em>como ellos operan</em>. No como tú.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                {[
                  {
                    q: "¿Qué emoción específica te hace romper tus reglas?",
                    desc: "La mayoría te da reglas rígidas, pero ignoran la emoción exacta que las destruye en segundos."
                  },
                  {
                    q: "¿Cuál es tu tolerancia real al riesgo?",
                    desc: "Te dicen 'arriesga el 1%', pero tu cerebro entra en pánico biológico mucho antes."
                  },
                  {
                    q: "¿Cuáles son tus patrones subconscientes?",
                    desc: "Tus reacciones automáticas al gráfico vienen programadas de tu infancia y finanzas personales."
                  }
                ].map((item, idx) => (
                  <div key={idx} className="rounded-2xl p-6 border border-white/5 bg-[#080d17]/60 hover:border-[#00D1FF]/20 transition-all duration-300">
                    <p className="text-[#00D1FF] text-base md:text-lg font-black mb-3">{item.q}</p>
                    <p className="text-white/50 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="text-center py-6">
                <p className="text-3xl sm:text-4xl font-black text-white">Ninguno.</p>
                <p className="text-white/50 text-sm md:text-base mt-2">Porque todos vendían <em>su</em> método rígido. No tu calibración personalizada.</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          THE SOLUTION — GENY LAB
          Technique: Gamification and Interactive Mockups
      ══════════════════════════════════════════════════════════════════ */}
      <section id="solucion" className="py-20 md:py-28 relative border-t border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00E676]/[0.02] to-transparent pointer-events-none" />
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <span className="text-xs md:text-sm font-mono tracking-[0.25em] uppercase text-[#00E676] mb-3 block">PRESENTAMOS EL NÚCLEO</span>
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight bg-gradient-to-r from-white via-white to-[#00D1FF] bg-clip-text text-transparent">
                GENY LAB
              </h2>
              <p className="text-white/40 text-sm font-mono uppercase tracking-[0.2em] mt-3">Sistema de Calibración Nodal para Traders</p>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="max-w-4xl mx-auto">
              <Callout color="#00E676">
                <p className="text-white/90 text-base sm:text-lg md:text-xl leading-relaxed">
                  Imagina abrir tu plataforma sabiendo <strong className="text-white">exactamente</strong> qué emoción te autosabotea hoy, conociendo tu termostato real de riesgo y usando un sistema interactivo que te frena <em>antes</em> de cometer tu clásico error recurrente.
                </p>
                <p className="text-[#00E676] font-bold text-sm sm:text-base tracking-wider uppercase mt-4">
                  → Eso es lo que construyes en menos de 15 minutos en GENY LAB.
                </p>
              </Callout>
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="space-y-6 max-w-4xl mx-auto mt-10">
              <p className="text-white/70 text-base md:text-lg leading-relaxed text-center">
                Esto no es un curso pasivo de videos infinitos. Es un <strong className="text-[#00E676]">Laboratorio Interactivo Gamificado</strong> donde completas validaciones prácticas, desbloqueas nodos y calibras tu ADN financiero con Inteligencia Artificial.
              </p>
            </div>
          </FadeIn>

          {/* Gamified Mockups as Sleek Browser Mockups */}
          <FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch mt-16 max-w-5xl mx-auto">
              {/* Mockup 1 */}
              <div className="rounded-3xl border border-white/10 bg-[#080d16] overflow-hidden shadow-[0_0_80px_rgba(0,209,255,0.1)] hover:shadow-[0_0_80px_rgba(0,209,255,0.25)] hover:border-[#00D1FF]/40 transition-all duration-500 flex flex-col justify-between group">
                <div className="bg-[#0c1220] px-4 py-3 border-b border-white/5 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                  <span className="text-[10px] font-mono text-white/30 ml-4">GENY LAB - MAPA NODAL</span>
                </div>
                <div className="p-4 flex-1 flex items-center justify-center bg-gradient-to-b from-transparent to-[#0c1220]/40">
                  <img src="/images/landing/app_mockup.png" alt="Mapa de progreso de GENY LAB" className="rounded-xl border border-white/5 shadow-2xl max-w-full max-h-[300px] object-contain group-hover:scale-[1.02] transition-transform duration-500" />
                </div>
                <div className="p-5 border-t border-white/5 bg-[#0a0f1b]/50">
                  <p className="text-white/80 font-bold text-sm">Validaciones Gamificadas por Nodos</p>
                  <p className="text-white/40 text-xs mt-1">Completa desafíos, avanza por las etapas y monitorea tu progreso real.</p>
                </div>
              </div>

              {/* Mockup 2 */}
              <div className="rounded-3xl border border-white/10 bg-[#080d16] overflow-hidden shadow-[0_0_80px_rgba(0,230,118,0.08)] hover:shadow-[0_0_80px_rgba(0,230,118,0.2)] hover:border-[#00E676]/40 transition-all duration-500 flex flex-col justify-between group">
                <div className="bg-[#0c1220] px-4 py-3 border-b border-white/5 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                  <span className="text-[10px] font-mono text-white/30 ml-4">GENY LAB - SIMULADOR</span>
                </div>
                <div className="p-4 flex-1 flex items-center justify-center bg-gradient-to-b from-transparent to-[#0c1220]/40">
                  <img src="/images/landing/simulator_preview.png" alt="Simulador interactivo de mercado" className="rounded-xl border border-white/5 shadow-2xl max-w-full max-h-[300px] object-contain group-hover:scale-[1.02] transition-transform duration-500" />
                </div>
                <div className="p-5 border-t border-white/5 bg-[#0a0f1b]/50">
                  <p className="text-white/80 font-bold text-sm">Simulador de Mercado e Indicadores</p>
                  <p className="text-white/40 text-xs mt-1">Mide tu termostato financiero en tiempo real bajo condiciones de mercado simuladas.</p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="py-20 md:py-28 relative">
        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-xs md:text-sm font-mono tracking-[0.25em] uppercase text-[#00D1FF] mb-3 block">ECOSISTEMA DE CALIBRACIÓN</span>
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-black leading-[1.1] mb-4">
                6 laboratorios diseñados para<br />
                <span className="bg-gradient-to-r from-[#00D1FF] to-[#00E676] bg-clip-text text-transparent">auditar tu psicología</span> y estructura
              </h2>
              <p className="text-white/40 text-sm md:text-base max-w-xl mx-auto">Cada uno ataca un ángulo diferente de los patrones invisibles que destruyen tus ganancias.</p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
            {[
              {
                emoji: '🧠', title: 'Investor DNA Blueprint', hook: 'LAB 1: ¿POR QUÉ OPERAS COMO OPERAS?', color: '#00D1FF', num: '01',
                desc: 'Descubre qué tipo de trader eres realmente, cuál es tu perfil de riesgo ideal y qué estilo operativo se alinea con tu ADN financiero. Deja de forzar estrategias de otros y calibra la tuya.'
              },
              {
                emoji: '🐜', title: 'Money Leak Projection', hook: 'LAB 2: ¿A DÓNDE SE VA TU CAPITAL?', color: '#f59e0b', num: '02',
                desc: 'Identifica las fugas de dinero invisibles que destruyen tu capital sin que te des cuenta. Calcula la proyección real de pérdidas a 5-10 años si sigues cometiendo el mismo error hoy.'
              },
              {
                emoji: '🤯', title: 'Shadow Money Code', hook: 'LAB 3: OPERACIÓN SUBCONSCIENTE', color: '#8b5cf6', num: '03',
                desc: 'Desmantela las creencias ocultas que sabotean tus decisiones en pleno mercado. Elimina el impulso irracional de sobreoperar para recuperar o cerrar antes por miedo.'
              },
              {
                emoji: '🌡️', title: 'Financial Thermostat', hook: 'LAB 4: CAPACIDAD DE ABSORCIÓN', color: '#ef4444', num: '04',
                desc: 'Mide y expande tu tolerancia biológica a la pérdida antes de que tu cerebro entre en pánico. Si no calibras este termostato, seguirás rompiendo tus stops sistemáticamente.'
              },
              {
                emoji: '🚫', title: 'Money Traps Classifier', hook: 'LAB 5: SESGOS COGNITIVOS', color: '#f97316', num: '05',
                desc: 'Detecta y aisla los sesgos emocionales y trampas mentales específicas en las que caes cuando estás bajo presión. Reconócelas antes de que afecten tu saldo.'
              },
              {
                emoji: '🎯', title: 'Geny Options Lab', hook: 'LAB 6: SIMULACIÓN AVANZADA', color: '#00E676', num: '06',
                desc: 'Practica operaciones en tiempo real con $25,000 en capital virtual guiado por un coach de Inteligencia Artificial que audita y califica cada una de tus decisiones antes del mercado real.'
              },
            ].map((lab, i) => (
              <FadeIn key={i} delay={i * 0.08} className="h-full">
                <div className="rounded-3xl p-6 md:p-8 h-full border border-white/5 bg-[#080d16]/70 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between group hover:border-white/15 hover:shadow-[0_0_50px_rgba(255,255,255,0.02)] transition-all duration-300">
                  {/* Neon top-left accent */}
                  <div className="absolute top-0 left-0 w-24 h-[2px] transition-all duration-300 group-hover:w-full" style={{ backgroundColor: lab.color }} />
                  {/* Massive background label */}
                  <span className="text-7xl sm:text-8xl font-black absolute top-2 right-4 text-white/[0.02] select-none pointer-events-none group-hover:text-white/[0.04] transition-all duration-300">
                    {lab.num}
                  </span>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                        {lab.emoji}
                      </div>
                      <div>
                        <p className="text-[10px] font-mono tracking-widest uppercase font-bold" style={{ color: lab.color }}>{lab.hook}</p>
                        <h4 className="font-black text-white text-base uppercase tracking-tight">{lab.title}</h4>
                      </div>
                    </div>
                    <p className="text-white/50 text-sm leading-relaxed">{lab.desc}</p>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-white/30">
                    <span>ESTADO: CALIBRADO</span>
                    <span className="flex items-center gap-1.5"><Zap size={10} className="text-[#00E676]" /> 100% LISTO</span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn>
            <div className="rounded-3xl p-6 md:p-8 border border-[#00D1FF]/15 bg-gradient-to-r from-[#00D1FF]/5 via-transparent to-transparent text-center max-w-4xl mx-auto mt-12 shadow-[0_0_50px_rgba(0,209,255,0.02)]">
              <p className="text-white/70 text-sm md:text-base leading-relaxed">
                Todo el ecosistema está unificado bajo un <strong className="text-white">Mapa de Progreso Nodal</strong>. La Inteligencia Artificial audita tu rendimiento práctico y desbloquea el siguiente nivel solo cuando demuestras que has asimilado la competencia. <strong className="text-[#00D1FF]">No avanzas viendo videos; avanzas aplicando.</strong>
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          OBJECTIONS REFRAME — Empathy + Call to test
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 relative bg-[#070b14]/30 border-y border-white/5">
        <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 text-center space-y-6">
          <FadeIn>
            <p className="text-[#00D1FF] text-xs font-mono uppercase tracking-[0.25em] mb-4">ENTIENDO TU FRUSTRACIÓN</p>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight text-white/90">
              "Ya he probado demasiados cursos y nada funciona. ¿Por qué esto sería diferente?"
            </h3>
          </FadeIn>
          
          <FadeIn delay={0.15}>
            <div className="rounded-3xl p-8 border border-white/5 bg-[#090f1a]/80 backdrop-blur-xl space-y-5 text-left max-w-3xl mx-auto relative overflow-hidden shadow-[0_0_50px_rgba(0,209,255,0.02)]">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#00D1FF]/[0.02] rounded-full blur-2xl" />
              <p className="text-white/60 text-sm sm:text-base leading-relaxed">
                Es un escepticismo completamente sano. De hecho, si yo estuviera en tu lugar, pensaría exactamente lo mismo.
              </p>
              <p className="text-white/60 text-sm sm:text-base leading-relaxed">
                Pero analízalo de esta manera: todos los mentores anteriores te pidieron que te adaptaras a <em>su</em> estrategia, forzándote a ejecutar setups que van en contra de tu límite emocional y termostato biológico.
              </p>
              <p className="text-white/80 text-base sm:text-lg font-bold leading-relaxed">
                GENY LAB es el único ecosistema que empieza por diagnosticarte a TI antes de enseñarte a operar. No puedes arreglar lo que no mides.
              </p>
              <p className="text-[#00E676] text-sm font-black uppercase tracking-wider">
                ✓ No te pedimos fe. Te pedimos 15 minutos en el Lab 1 para que lo compruebes por ti mismo.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          TESTIMONIALS — Social Proof
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 relative">
        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-xs md:text-sm font-mono tracking-[0.25em] uppercase text-[#00D1FF] mb-3 block">TESTIMONIOS REALES</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight">
                Mira lo que pasa cuando un trader deja de operar{' '}
                <span className="bg-gradient-to-r from-[#00D1FF] to-[#00E676] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(0,209,255,0.2)]">emocionalmente</span>
              </h2>
              <p className="text-white/40 text-sm max-w-xl mx-auto mt-3">Miembros activos de nuestra comunidad compartiendo sus resultados reales.</p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {[
              {
                name: 'Carlos M.', handle: '@carlos_m_trader', country: 'Colombia', rating: 5,
                quote: 'Pensaba que era otro curso más. Ya había comprado 3 entrenamientos de $500 USD y seguía perdiendo dinero. En 15 minutos del Lab 1 descubrí que estaba operando con un tamaño de lote 4 veces mayor a mi tolerancia biológica real al riesgo. Ajusté eso y por fin dejé de sobreoperar en pánico. Totalmente recomendado.'
              },
              {
                name: 'Luis P.', handle: '@luisp_fx', country: 'México', rating: 5,
                quote: 'Siempre me quejaba de mi falta de disciplina. Con el Financial Thermostat de GENY LAB entendí que mi cerebro entraba en modo supervivencia por el tamaño del stop. Expandir mi termostato de forma guiada con la IA cambió todo. $67 es literalmente un regalo frente a lo que perdía operando.'
              },
              {
                name: 'Andrea G.', handle: '@andrea_options', country: 'España', rating: 5,
                quote: 'La parálisis por exceso de información me tenía paralizada. Tenía 5 indicadores y 3 estrategias en la cabeza. Las simulaciones del Options Lab con feedback del coach IA me ayudaron a simplificar mi pantalla al mínimo. En dos semanas recuperé la claridad mental y la confianza para tomar posiciones.'
              }
            ].map((t, i) => (
              <FadeIn key={i} delay={i * 0.1} className="h-full">
                <div className="rounded-3xl p-6 md:p-8 h-full border border-white/5 bg-[#080d16]/50 backdrop-blur-xl flex flex-col justify-between hover:border-[#00D1FF]/20 transition-all duration-300">
                  <div className="space-y-4">
                    <div className="flex gap-1">
                      {Array.from({ length: t.rating }).map((_, s) => (
                        <Star key={s} size={14} className="text-[#f59e0b] fill-[#f59e0b]" />
                      ))}
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed italic">"{t.quote}"</p>
                  </div>
                  <div className="flex items-center gap-3 mt-6 pt-4 border-t border-white/5 w-full">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00D1FF] to-[#00E676] p-[1px]">
                      <div className="w-full h-full rounded-full bg-[#05080f] flex items-center justify-center text-xs font-mono font-bold text-[#00D1FF]">
                        {t.name.split(' ')[0][0]}
                      </div>
                    </div>
                    <div>
                      <p className="text-white text-sm font-black">{t.name}</p>
                      <p className="text-white/30 text-xs font-mono">{t.handle} · {t.country}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          BONUSES — The Value Stack
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 relative bg-[#070b14]/40 border-y border-white/5">
        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8">
          <FadeIn>
            <div className="text-center mb-14">
              <span className="text-xs md:text-sm font-mono tracking-[0.25em] uppercase text-[#00E676] mb-3 block">ACCESO COMPLEMENTARIO</span>
              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-none mb-3">
                Y además... Te llevas estos<br />
                <span className="bg-gradient-to-r from-[#00D1FF] to-[#00E676] bg-clip-text text-transparent">Bonos de Regalo Inmediatos</span>
              </h2>
              <p className="text-white/40 text-sm max-w-lg mx-auto">Herramientas de acompañamiento exclusivas para asegurar tu consistencia.</p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Bono 1 */}
            <FadeIn>
              <div className="rounded-3xl p-8 h-full border border-white/5 bg-[#080d16]/70 relative overflow-hidden group hover:border-[#f59e0b]/20 transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#f59e0b]/[0.02] rounded-full blur-xl" />
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#f59e0b] font-bold flex items-center gap-1.5 mb-4">
                  <Gift size={14} /> BONO EXCLUSIVO #1
                </p>
                <h3 className="text-xl font-black uppercase tracking-tight text-white mb-2">Trading Room Elite</h3>
                <p className="text-xs font-mono text-white/30 uppercase tracking-widest mb-4">Sesiones en Vivo — Sábados 11:00 AM EST</p>
                <p className="text-sm text-white/60 leading-relaxed mb-6">
                  Únete a nuestras mentorías en vivo semanales. Analizamos los resultados de tus labs, revisamos operaciones reales y calibramos tu estructura operativa en directo con otros miembros.
                </p>
                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-white/30">
                  <span>Valor Comercial: <span className="line-through">$800 USD</span></span>
                  <span className="text-[#00E676] font-bold font-mono">GRATIS EN TU REGISTRO</span>
                </div>
              </div>
            </FadeIn>

            {/* Bono 2 */}
            <FadeIn delay={0.1}>
              <div className="rounded-3xl p-8 h-full border border-white/5 bg-[#080d16]/70 relative overflow-hidden group hover:border-[#8b5cf6]/20 transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#8b5cf6]/[0.02] rounded-full blur-xl" />
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#8b5cf6] font-bold flex items-center gap-1.5 mb-4">
                  <Gift size={14} /> BONO EXCLUSIVO #2
                </p>
                <h3 className="text-xl font-black uppercase tracking-tight text-white mb-2">Diagnóstico Privado de Consistencia</h3>
                <p className="text-xs font-mono text-white/30 uppercase tracking-widest mb-4">Análisis Personalizado 1-a-1</p>
                <p className="text-sm text-white/60 leading-relaxed mb-6">
                  Una sesión de auditoría digital donde analizamos la radiografía de tu ADN financiero y tus métricas del simulador. Identificamos tu principal trampa mental y te trazamos un plan de salida.
                </p>
                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-white/30">
                  <span>Valor Comercial: <span className="line-through">$1,000 USD</span></span>
                  <span className="text-[#00E676] font-bold font-mono">GRATIS EN TU REGISTRO</span>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          PRICING BLOCK — The Offer Terminal
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 relative" id="precio" ref={pricingRef}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#00E676]/[0.02] rounded-full blur-[150px] pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8">
          <FadeIn>
            <div className="rounded-[2.5rem] overflow-hidden border border-[#00E676]/20 shadow-[0_0_100px_rgba(0,230,118,0.12)] bg-[#080d16] backdrop-blur-xl relative">
              <div className="h-2 bg-gradient-to-r from-[#00D1FF] via-[#00E676] to-[#f59e0b]" />

              <div className="p-8 md:p-14">
                {/* Real-time Urgency Badge */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm mb-10">
                  <span className="flex items-center gap-1.5 text-[#f59e0b] font-mono font-bold bg-[#f59e0b]/5 border border-[#f59e0b]/15 px-4 py-2 rounded-full uppercase tracking-wider text-xs">
                    <Clock size={14} className="animate-pulse" /> EL TIEMPO EXPIRA: {pad(timeLeft.h)}:{pad(timeLeft.m)}:{pad(timeLeft.s)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono font-bold uppercase tracking-wider">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    {spots} DE 100 CUPOS DISPONIBLES
                  </span>
                </div>

                <h3 className="text-center text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mb-8">
                  CALIBRA TU EJECUCIÓN HOY MISMO
                </h3>

                <div className="space-y-1 mb-10">
                  {[
                    ['Ecosistema GENY LAB — 6 Laboratorios Interactivos + IA', '$1,200 USD'],
                    ['Bono #1 — Mentorías del Trading Room Elite (Semanales)', '$800 USD'],
                    ['Bono #2 — Diagnóstico Privado 1-a-1 de tu Consistencia', '$1,000 USD'],
                  ].map(([item, val], i) => (
                    <div key={i} className="flex items-center justify-between gap-4 py-4 border-b border-white/5 text-sm sm:text-base">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 size={18} className="text-[#00E676] shrink-0" />
                        <span className="text-white/80 font-medium">{item}</span>
                      </div>
                      <span className="text-white/30 font-mono text-xs shrink-0">{val}</span>
                    </div>
                  ))}
                </div>

                <div className="text-center py-6 border-t border-white/10 space-y-1">
                  <p className="text-white/30 text-xs uppercase tracking-widest font-mono">VALOR REAL DEL PAQUETE COMPLETO:</p>
                  <p className="text-3xl sm:text-4xl font-black text-white/20 line-through decoration-red-500 decoration-2 font-mono">$3,000 USD</p>
                </div>

                <p className="text-white/50 text-sm text-center leading-relaxed max-w-lg mx-auto py-4">
                  Si este sistema lo único que lograra fuera <strong className="text-white">detener tu próxima operación impulsiva por venganza</strong> y evitar que quemes tu cuenta de fondeo... ¿valdría la pena? <strong className="text-[#00E676]">Recuperas esto con una sola decisión inteligente.</strong>
                </p>

                <div className="text-center py-6 space-y-3">
                  <p className="text-white/70 text-base uppercase tracking-wider font-mono">PAGO ÚNICO HOY (SIN SUSCRIPCIONES):</p>
                  <div className="flex items-baseline justify-center gap-2 pt-2">
                    <span className="text-8xl sm:text-9xl font-black bg-gradient-to-r from-[#00D1FF] via-[#00E676] to-[#00D1FF] bg-clip-text text-transparent leading-none drop-shadow-[0_0_40px_rgba(0,209,255,0.3)] font-mono">$67</span>
                    <span className="text-xl sm:text-2xl text-white/40 font-bold font-mono">USD</span>
                  </div>
                </div>

                <div className="text-center pt-2 pb-8">
                  <CTAButton large text="SÍ, QUIERO MI ACCESO AHORA — $67 USD" className="w-full max-w-lg mx-auto" />
                </div>

                {/* 🛡️ Guarantee Box */}
                <div className="rounded-3xl p-6 md:p-8 border border-[#00D1FF]/15 bg-[#00D1FF]/[0.02] backdrop-blur-md relative overflow-hidden shadow-[inset_0_0_30px_rgba(0,209,255,0.05)]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#00D1FF]/[0.02] rounded-full blur-2xl" />
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#00D1FF]/10 border border-[#00D1FF]/20 flex items-center justify-center shrink-0 text-[#00D1FF]">
                      <Shield size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-white text-sm uppercase tracking-wide mb-1.5">Garantía Incondicional de 15 Días</h4>
                      <p className="text-sm text-white/50 leading-relaxed">
                        Entra, haz los labs, prueba el simulador, asiste al trading room en vivo. Si en 15 días sientes que no te revela patrones mentales de trading que te valen miles de dólares, nos mandas un correo y te devolvemos el <strong className="text-white">100% de tu dinero</strong>. Sin explicaciones ni condiciones. El riesgo es todo nuestro.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ⚠️ Warning Cohorte Limitada */}
      <section className="py-10 relative">
        <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FadeIn>
              <div className="rounded-3xl p-7 h-full border border-red-500/10 bg-red-500/[0.01] space-y-3">
                <h4 className="font-black uppercase tracking-tight text-sm text-red-400 flex items-center gap-2">
                  <Users size={16} /> Cohorte limitada a 100 cupos
                </h4>
                <p className="text-sm text-white/50 leading-relaxed">
                  Para poder revisar los perfiles de riesgo y dar feedback de calidad 1-a-1, limitamos el acceso estrictamente. Una vez llenado el cupo, las inscripciones se bloquean hasta la siguiente temporada.
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="rounded-3xl p-7 h-full border border-[#f59e0b]/10 bg-[#f59e0b]/[0.01] space-y-3">
                <h4 className="font-black uppercase tracking-tight text-sm text-[#f59e0b] flex items-center gap-2">
                  <Clock size={16} /> Entrada sincronizada
                </h4>
                <p className="text-sm text-white/50 leading-relaxed">
                  Todos los miembros de esta cohorte inician al mismo tiempo para poder coordinar las mentorías y los diagnósticos iniciales. Si no entras hoy, deberás esperar meses.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ⏱️ Proceso de Onboarding */}
      <section className="py-14 md:py-20 relative">
        <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8">
          <FadeIn>
            <div className="rounded-[2rem] p-8 md:p-12 border border-[#00E676]/15 bg-[#00E676]/[0.01] space-y-8">
              <h3 className="text-2xl sm:text-3xl font-black text-center text-white">
                Tu plan de acción para los próximos <span className="text-[#00E676]">2 minutos</span>:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  'Completas tu inscripción segura en la pasarela SSL.',
                  'Recibes tus credenciales de acceso instantáneo en tu correo.',
                  'Entras al mapa nodal y desbloqueas tu ADN Financiero.',
                  'Asistes al próximo Trading Room en vivo el sábado.'
                ].map((text, i) => (
                  <div key={i} className="space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/20 flex items-center justify-center text-[#00E676] font-mono font-bold text-sm">
                      {i + 1}
                    </div>
                    <p className="text-white/60 text-sm leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          FAQ — Frequently Asked Questions
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 relative border-t border-white/5">
        <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-xs md:text-sm font-mono tracking-[0.25em] uppercase text-[#00D1FF] mb-3 block">RESOLVIENDO DUDAS</span>
              <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
                Preguntas <span className="bg-gradient-to-r from-[#00D1FF] to-[#00E676] bg-clip-text text-transparent">Frecuentes</span>
              </h2>
              <p className="text-white/40 text-sm max-w-sm mx-auto mt-2">Todo lo que necesitas saber antes de asegurar tu cupo.</p>
            </div>
          </FadeIn>
          
          <div className="space-y-4 max-w-4xl mx-auto">
            <FadeIn><FAQItem q="¿Necesito experiencia en trading?" a="GENY LAB está optimizado para traders de cualquier nivel. Si estás empezando, te ayuda a formar hábitos correctos desde el día uno. Si eres experimentado, te ayuda a diagnosticar y extirpar las trampas psicológicas que te impiden escalar tus resultados." /></FadeIn>
            <FadeIn delay={0.05}><FAQItem q="¿Es una estrategia o señales de trading?" a="Ninguna de las dos. GENY LAB no te da señales ni te vende una fórmula mágica de velas japonesas. Es una terminal interactiva que diagnostica tus sesgos cognitivos, mide tu límite real de riesgo e integra retroalimentación de Inteligencia Artificial para pulir tu disciplina." /></FadeIn>
            <FadeIn delay={0.1}><FAQItem q="¿Cuánto tiempo al día requiere?" a="Cada uno de los 6 laboratorios se puede completar en unos 15 a 30 minutos. Está diseñado para que avances a tu propio ritmo. La mentoría en vivo del Trading Room Elite es de 1 hora los sábados y queda grabada si no puedes asistir." /></FadeIn>
            <FadeIn delay={0.15}><FAQItem q="He comprado otros cursos de trading antes. ¿Por qué funcionaría este?" a="Los cursos tradicionales asumen que tu cerebro reacciona igual que el del profesor. GENY LAB es único porque te mide a ti primero: diagnostica tu aversión al riesgo, calcula tus fugas de capital y mapea tu perfil específico para darte un plan personalizado." /></FadeIn>
            <FadeIn delay={0.2}><FAQItem q="¿Cómo funciona la garantía de 15 días?" a="Es simple: entras al panel, utilizas el simulador, asistes a la sesión en vivo y completas los módulos. Si no sientes que el ecosistema te da la claridad que necesitas, nos escribes un correo y te reembolsamos el 100% de tu pago. Cero preguntas incómodas." /></FadeIn>
            <FadeIn delay={0.25}><FAQItem q="¿Cómo accedo tras realizar el pago?" a="El sistema te enviará automáticamente tus credenciales a tu correo en menos de 60 segundos. Podrás ingresar a tu panel de inmediato y empezar con el Lab 1 hoy mismo." /></FadeIn>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          FINAL CLOSE — Short, direct, emotional
          Technique: Mirror the opening pain + offer the exit
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-24 md:py-32 relative border-t border-white/5">
        <div className="absolute inset-0 bg-gradient-to-t from-[#00D1FF]/[0.03] to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 text-center space-y-8">
          <FadeIn>
            <img src="/images/78.png" alt="GENY LAB" className="w-48 md:w-56 mx-auto object-contain opacity-75 mb-4" />
            <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              La próxima vez que abras una operación en tu cuenta real, puedes hacerlo desde el mismo caos e indisciplina de siempre... o puedes hacerlo calibrado, con control total y el respaldo del ecosistema.
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight text-white mb-8">
              Tu consistencia te espera del{' '}
              <span className="bg-gradient-to-r from-[#00D1FF] to-[#00E676] bg-clip-text text-transparent">otro lado.</span>
            </h2>
            <CTAButton large text="SÍ, QUIERO MI ACCESO — $67 USD" />
            <p className="text-white/15 text-xs font-mono uppercase tracking-widest mt-4">
              Pago único · Garantía 15 días · Acceso inmediato
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── STICKY BAR — Only after scrolling past pricing ── */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} transition={{ duration: 0.3 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-[#05080f]/95 backdrop-blur-xl border-t border-white/10 py-3 px-4">
            <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
              <div className="hidden sm:flex items-center gap-3">
                <span className="text-white/25 text-sm line-through">$3,000</span>
                <span className="text-2xl font-black bg-gradient-to-r from-[#00D1FF] to-[#00E676] bg-clip-text text-transparent">$67</span>
                <span className="text-xs text-[#f59e0b] font-mono font-bold">{pad(timeLeft.h)}:{pad(timeLeft.m)}:{pad(timeLeft.s)}</span>
              </div>
              <a href={CTA_URL} target="_blank" rel="noopener noreferrer"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black uppercase tracking-wider text-sm bg-gradient-to-r from-[#00D1FF] to-[#00E676] text-[#05080f] hover:scale-[1.02] active:scale-[0.98] transition-transform">
                QUIERO MI ACCESO <ArrowRight size={16} />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
