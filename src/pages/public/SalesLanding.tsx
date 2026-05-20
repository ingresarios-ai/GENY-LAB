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
    <div className="min-h-screen bg-[#05080f] text-white overflow-hidden">

      {/* ══════════════════════════════════════════════════════════════════
          HERO — Pattern Interrupt + Video
          Technique: Identity-based headline that makes them feel SEEN
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative pt-8 pb-16 md:pt-12 md:pb-24">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-[#00D1FF]/[0.04] rounded-full blur-[150px] -translate-y-1/2" />

        <div className="relative z-10 max-w-5xl mx-auto px-4">
          <div className="text-center mb-8 md:mb-10">
            <img src="/images/78.png" alt="GENY LAB" className="w-48 md:w-64 mx-auto object-contain" />
          </div>

          {/* Video */}
          <div className="relative w-full max-w-4xl mx-auto mb-10 md:mb-14">
            <div className="aspect-video rounded-2xl overflow-hidden border-2 border-[#00D1FF]/20 shadow-[0_0_80px_rgba(0,209,255,0.12)] bg-[#0a0e18]">
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#0a0e18] to-[#05080f]">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#00D1FF]/10 border-2 border-[#00D1FF]/40 flex items-center justify-center shadow-[0_0_40px_rgba(0,209,255,0.3)] cursor-pointer hover:scale-110 transition-transform">
                  <Play size={36} className="text-[#00D1FF] ml-1" fill="rgba(0,209,255,0.3)" />
                </div>
                <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Video próximamente</p>
              </div>
            </div>
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-[#00D1FF]/20 via-transparent to-[#00E676]/20 -z-10 blur-sm" />
          </div>

          {/* HEADLINE — Identity-based pattern interrupt */}
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-black leading-[1.1] mb-6">
              Sabes exactamente lo que tienes que hacer…<br />
              <span className="bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent">
                y aún así lo haces mal.
              </span>
            </h1>
            <p className="text-white/60 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-8">
              Si esa frase te dolió, esta página es para ti.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          AGITATION — Make them FEEL the pain (not just read it)
          Technique: Scenario-based agitation + micro-commitments ("¿Te suena?")
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 relative">
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <FadeIn>
            <div className="space-y-6">
              <p className="text-white/70 text-base md:text-lg leading-relaxed">
                Abriste la operación con un plan claro. Sabías dónde entrar, dónde poner el stop, dónde tomar ganancias.
              </p>
              <p className="text-white/70 text-base md:text-lg leading-relaxed">
                Pero el mercado se movió en tu contra y algo <em>cambió</em> dentro de ti. El plan desapareció. Moviste el stop. O cerraste antes de tiempo. O peor: abriste otra operación para "recuperar".
              </p>
              <p className="text-white/80 text-lg md:text-xl leading-relaxed font-medium">
                Y después, viendo el gráfico en frío, te preguntaste: <strong className="text-white">"¿Cómo puedo ser tan estúpido si sabía lo que tenía que hacer?"</strong>
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <Callout color="#ef4444">
              <p className="text-red-300/80 text-sm md:text-base leading-relaxed">
                <strong className="text-red-300">Eso no es estupidez. Es algo completamente diferente.</strong><br />
                Tu cerebro llegó a su límite de tolerancia al riesgo. Y cuando eso pasa, dejas de razonar y empiezas a <em>sobrevivir</em>. No piensas. Reaccionas.
              </p>
            </Callout>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="text-white/60 text-base md:text-lg leading-relaxed">
              El <strong className="text-white">95% de los traders pierde dinero</strong> no por falta de estrategia, sino porque operan desde el <strong className="text-[#00D1FF]">caos mental</strong>. Pierden el control emocional, dudan de sus setups, y nunca logran construir consistencia real.
            </p>
          </FadeIn>

          <FadeIn delay={0.25}>
            <div className="flex flex-col gap-3 mt-8">
              {[
                'Tienes más estrategias guardadas de las que puedes contar',
                'Sabes la regla, pero la rompes cuando el mercado te presiona',
                'Ya gastaste dinero en cursos que no cambiaron nada',
                'Sientes que el problema eres tú, no el método',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-md bg-red-500/15 border border-red-500/25 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={12} className="text-red-400" />
                  </div>
                  <p className="text-white/60 text-sm md:text-base">{item}</p>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.3}>
            <p className="text-[#00D1FF] text-lg md:text-xl font-bold text-center mt-10">
              Si marcaste aunque sea uno, sigue leyendo. Lo que viene después te va a cambiar la perspectiva.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          POLARIZATION — Filter & elevate the reader
          Technique: Exclusion creates desire. "Not for you" = "I NEED this"
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-12 md:py-16 relative">
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <FadeIn>
            <div className="rounded-2xl p-7 md:p-8 border border-red-500/15 bg-red-500/[0.03] backdrop-blur-sm">
              <p className="text-red-400 text-sm font-bold uppercase tracking-widest mb-4">⛔ Antes de seguir:</p>
              <p className="text-white/70 text-sm md:text-base leading-relaxed mb-3">
                Si estás buscando <strong className="text-white/90">señales de Telegram</strong>, un <strong className="text-white/90">bot que opere por ti</strong>, o el secreto para hacerte millonario este viernes…  cierra esta página. En serio.
              </p>
              <p className="text-white/70 text-sm md:text-base leading-relaxed">
                Esto es para traders que ya están <em>hartos</em> de perder dinero por indisciplina y están listos para hacer el trabajo real de profesionalizarse. <strong className="text-white">Si ese eres tú, bienvenido.</strong>
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
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00D1FF]/[0.015] to-transparent" />
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <FadeIn>
            <p className="text-xs font-mono uppercase tracking-[0.3em] text-[#00D1FF]/60 mb-8 text-center">EL DESCUBRIMIENTO</p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight text-center mb-8">
              El problema nunca fue<br />la estrategia.
            </h2>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="space-y-5">
              <p className="text-white/70 text-base md:text-lg leading-relaxed">
                Todos esos cursos que compraste te enseñaron a operar <em>como su autor</em>. No como tú.
              </p>
              <p className="text-white/70 text-base md:text-lg leading-relaxed">
                ¿Alguno te preguntó qué <strong className="text-white">emoción específica</strong> te hace romper tus propias reglas? ¿Alguno midió tu <strong className="text-white">tolerancia real al riesgo</strong> antes de enseñarte una estrategia? ¿Alguno diagnosticó los <strong className="text-white">patrones subconscientes</strong> que controlan tus decisiones?
              </p>
              <p className="text-xl md:text-2xl font-black text-white text-center py-4">
                Ninguno.
              </p>
              <p className="text-white/70 text-base md:text-lg leading-relaxed">
                Porque todos vendían <em>su</em> método. No el tuyo.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          THE SOLUTION — Identity-based reveal
          Technique: Don't describe the product. Describe who they BECOME.
      ══════════════════════════════════════════════════════════════════ */}
      <section id="solucion" className="py-20 md:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00D1FF]/[0.02] to-transparent" />
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-10">
              <p className="text-xs font-mono uppercase tracking-[0.3em] text-[#00D1FF]/60 mb-3">LA SOLUCIÓN</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight">
                <span className="text-[#00D1FF]">GENY LAB</span>
              </h2>
              <p className="text-white/40 text-sm font-mono uppercase tracking-widest mt-2">Sistema Operativo para Traders Consistentes</p>
            </div>
          </FadeIn>

          {/* Future Pacing — make them visualize the transformation */}
          <FadeIn delay={0.1}>
            <Callout color="#00E676">
              <p className="text-white/80 text-base md:text-lg leading-relaxed">
                Imagina entrar a tu siguiente operación sabiendo <strong className="text-white">exactamente</strong> qué emoción te sabotea, cuál es tu límite real de riesgo, y teniendo un sistema que te avisa <em>antes</em> de que tu cerebro entre en modo pánico.
              </p>
              <p className="text-[#00E676] font-bold mt-3">Eso es lo que construyes dentro de GENY LAB.</p>
            </Callout>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="space-y-5 max-w-3xl mx-auto mt-6">
              <p className="text-white/70 text-base md:text-lg leading-relaxed">
                No es otro curso de análisis técnico. <strong className="text-white">No es una estrategia mágica.</strong>
              </p>
              <p className="text-white/70 text-base md:text-lg leading-relaxed">
                GENY LAB te ayuda a detectar qué está destruyendo tu consistencia mientras operas — <strong className="text-[#00D1FF]">antes de que el mercado vuelva a cobrarte por el mismo error.</strong>
              </p>
              <p className="text-white/70 text-base md:text-lg leading-relaxed">
                No vas a ver videos aburridos de 2 horas. Vas a entrar a un <strong className="text-[#00E676]">laboratorio gamificado</strong> donde interactúas con Inteligencia Artificial para diagnosticar tu perfil real como trader. Barras de progreso, nodos que desbloqueas, feedback inmediato.
              </p>
              <p className="text-white text-xl md:text-2xl font-black text-center py-4">
                Es como un videojuego, pero donde el premio<br />es tu consistencia financiera.
              </p>
            </div>
          </FadeIn>

          {/* Mockups */}
          <FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mt-12">
              <div className="text-center">
                <img src="/images/landing/app_mockup.png" alt="Mapa de progreso gamificado de GENY LAB" className="rounded-2xl shadow-[0_0_60px_rgba(0,209,255,0.1)] border border-white/10 mx-auto max-w-sm w-full" />
                <p className="text-white/30 text-xs font-mono mt-3 uppercase tracking-widest">Tu mapa de progreso</p>
              </div>
              <div className="text-center">
                <img src="/images/landing/simulator_preview.png" alt="Simulador de opciones de GENY LAB" className="rounded-2xl shadow-[0_0_60px_rgba(0,230,118,0.1)] border border-white/10 mx-auto w-full" />
                <p className="text-white/30 text-xs font-mono mt-3 uppercase tracking-widest">Simulador de mercado</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          QUICK WIN — Lower the perceived effort
          Technique: "You'll know in 15 minutes" reduces commitment anxiety
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-12 md:py-16 relative">
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <FadeIn>
            <div className="rounded-2xl p-7 md:p-8 border border-[#00E676]/15 bg-[#00E676]/[0.02] backdrop-blur-sm text-center">
              <p className="text-white/70 text-base md:text-lg leading-relaxed">
                ¿Lo mejor? No necesitas estudiar 6 meses para ver resultados. El primer módulo — <strong className="text-white">"ADN Financiero"</strong> — toma menos de <strong className="text-[#00E676]">15 minutos</strong>. Y te garantizo que te revelará errores mentales que llevas cometiendo <em>años</em> sin darte cuenta.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          THE SYSTEM — What's inside (Desire building)
          Technique: Each lab positioned as solving a SPECIFIC painful scenario
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 relative">
        <div className="relative z-10 max-w-5xl mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-10">
              <p className="text-xs font-mono uppercase tracking-[0.3em] text-[#00D1FF]/60 mb-3">QUÉ HAY DENTRO</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight mb-3">
                6 laboratorios diseñados para<br />
                <span className="text-[#00D1FF]">auditar tu psicología</span> y estructura
              </h2>
              <p className="text-white/40 text-sm max-w-xl mx-auto">Cada uno ataca un ángulo diferente de lo que te está frenando.</p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                emoji: '🧠', title: 'Investor DNA Blueprint', hook: '¿Por qué operas como operas?', color: '#3b82f6',
                desc: 'Descubre qué tipo de trader eres realmente, cuál es tu perfil de riesgo ideal y qué estilo operativo tiene más probabilidades de darte consistencia a largo plazo. No el que viste en un video — el tuyo.'
              },
              {
                emoji: '🐜', title: 'Money Leak Projection', hook: '¿A dónde se va tu dinero sin que lo notes?', color: '#f59e0b',
                desc: 'Descubre las fugas invisibles que están destruyendo tu capacidad financiera. Visualiza cuánto dinero podrías acumular en 10-20 años si rediriges ese capital estratégicamente. Los números te van a asustar.'
              },
              {
                emoji: '🤯', title: 'Shadow Money Code', hook: '¿Qué creencias ocultas te controlan?', color: '#8b5cf6',
                desc: 'Descubre los bloqueos subconscientes y patrones emocionales que están controlando tus decisiones financieras. Estos son los que te hacen cerrar antes de tiempo o vengar operaciones perdidas.'
              },
              {
                emoji: '🌡️', title: 'Financial Thermostat System', hook: '¿Cuánto riesgo puedes realmente sostener?', color: '#ef4444',
                desc: 'Aprende a medir y expandir tu capacidad mental para sostener más dinero, más riesgo y más responsabilidad sin colapsar emocionalmente. Este es tu termostato — y la mayoría nunca lo ha calibrado.'
              },
              {
                emoji: '🚫', title: 'Money Traps', hook: '¿Qué sesgos te mantienen atrapado?', color: '#f97316',
                desc: 'Detecta los sesgos mentales y hábitos invisibles que mantienen a la mayoría de traders atrapados en la carrera de la rata. Reemplázalos por patrones financieros inteligentes que funcionan a tu favor.'
              },
              {
                emoji: '🎯', title: 'Geny Options Lab', hook: '¿Listo para practicar sin arriesgar tu capital?', color: '#00E676',
                desc: 'Practica operaciones en escenarios reales con $25,000 virtuales y un coach IA que analiza cada decisión. Desarrolla criterio operativo avanzado antes de arriesgar un solo dólar real.'
              },
            ].map((lab, i) => (
              <FadeIn key={i} delay={i * 0.06}>
                <div className="rounded-2xl p-6 h-full border border-white/5 bg-white/[0.02] backdrop-blur-sm border-l-[3px]" style={{ borderLeftColor: lab.color }}>
                  <div className="flex items-start gap-4">
                    <span className="text-3xl shrink-0 mt-0.5">{lab.emoji}</span>
                    <div>
                      <p className="text-sm font-bold mb-0.5" style={{ color: lab.color }}>{lab.hook}</p>
                      <h4 className="font-black text-white text-sm uppercase tracking-tight mb-2">{lab.title}</h4>
                      <p className="text-sm text-white/50 leading-relaxed">{lab.desc}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn>
            <div className="rounded-xl p-5 border border-[#00D1FF]/15 bg-[#00D1FF]/[0.02] text-center max-w-2xl mx-auto mt-8">
              <p className="text-white/70 text-sm md:text-base leading-relaxed">
                Todo conectado por <strong className="text-[#00D1FF]">Nodos de Validación</strong> — el sistema te obliga a aplicar lo aprendido para desbloquear el siguiente nivel. <strong className="text-white">No avanzas hasta que demuestras que lo entendiste.</strong>
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          OBJECTION BRIDGE — "Ya probé demasiadas cosas"
          Technique: Damaging admission + identity resonance
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 relative">
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <FadeIn>
            <p className="text-white/40 text-lg md:text-xl italic mb-4">
              Y sé lo que estás pensando:
            </p>
            <blockquote className="text-2xl md:text-3xl font-black text-white/80 leading-tight mb-6">
              "Ya probé demasiadas cosas<br />y ninguna me funcionó."
            </blockquote>
            <p className="text-white/60 text-base md:text-lg leading-relaxed mb-4">
              Es completamente válido. No voy a pedirte que ignores esa voz.
            </p>
            <p className="text-white/60 text-base md:text-lg leading-relaxed mb-4">
              Pero hazte una pregunta honesta: todos esos cursos que no funcionaron, <strong className="text-white">¿alguno empezó diagnosticándote a TI antes de enseñarte algo?</strong>
            </p>
            <p className="text-[#00D1FF] text-lg md:text-xl font-bold leading-relaxed">
              Por eso no quiero que me creas.<br />
              Quiero que lo compruebes.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          TESTIMONIALS (Placeholder)
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-12 md:py-16 relative">
        <div className="relative z-10 max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="rounded-2xl p-6 border border-white/5 bg-white/[0.02] backdrop-blur-sm flex flex-col items-center text-center gap-4">
                  <div className="flex gap-1">{[1,2,3,4,5].map(s => <Star key={s} size={14} className="text-[#f59e0b] fill-[#f59e0b]" />)}</div>
                  <p className="text-white/25 text-sm italic">"Testimonio próximamente..."</p>
                  <div className="flex items-center gap-3 mt-auto pt-3 border-t border-white/5 w-full justify-center">
                    <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10" />
                    <div className="text-left">
                      <p className="text-white/20 text-sm font-bold">Nombre</p>
                      <p className="text-white/10 text-xs">País</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          BONUSES — Perceived value amplifiers
          Technique: Position bonuses as solving ADDITIONAL pain points
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 relative">
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <FadeIn>
            <p className="text-xs font-mono uppercase tracking-[0.3em] text-[#f59e0b]/60 text-center mb-8">PERO ESO NO ES TODO</p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FadeIn>
              <div className="rounded-2xl p-7 h-full border-t-[3px] border-t-[#f59e0b] bg-white/[0.02] backdrop-blur-sm border border-white/5 space-y-4">
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#f59e0b] font-bold flex items-center gap-2"><Gift size={14} /> BONO #1</p>
                <h3 className="text-lg font-black uppercase tracking-tight text-white">Trading Room Elite</h3>
                <p className="text-xs font-mono text-white/30 uppercase tracking-widest">Sesiones en Vivo — Sábados 11am</p>
                <p className="text-sm text-white/60 leading-relaxed">
                  Acompañamiento en tiempo real con traders activos. Corrige errores de ejecución <strong className="text-white/80">antes</strong> de volver a perder dinero por lo mismo de siempre.
                </p>
                <p className="text-sm text-white/30">Valor: <span className="line-through">$800 USD</span> <span className="text-[#00E676] font-bold ml-1">INCLUIDO</span></p>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="rounded-2xl p-7 h-full border-t-[3px] border-t-[#8b5cf6] bg-white/[0.02] backdrop-blur-sm border border-white/5 space-y-4">
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#8b5cf6] font-bold flex items-center gap-2"><Gift size={14} /> BONO #2</p>
                <h3 className="text-lg font-black uppercase tracking-tight text-white">Diagnóstico Privado de Consistencia</h3>
                <p className="text-xs font-mono text-white/30 uppercase tracking-widest">1 a 1 con Juan</p>
                <p className="text-sm text-white/60 leading-relaxed">
                  Sesión personalizada para identificar <strong className="text-white/80">exactamente</strong> qué hábito psicológico o técnico está frenando tu consistencia. Ruta de mejora basada en <em>tu</em> perfil real.
                </p>
                <p className="text-sm text-white/30">Valor: <span className="line-through">$1,000 USD</span> <span className="text-[#00E676] font-bold ml-1">INCLUIDO</span></p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          THE OFFER — Single price reveal moment
          Technique: Anchor high → justify → reveal → philosophy → urgency
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-32 relative" id="precio" ref={pricingRef}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00E676]/[0.02] to-transparent" />
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <FadeIn>
            <div className="rounded-3xl overflow-hidden border border-[#00E676]/20 shadow-[0_0_80px_rgba(0,230,118,0.08)] bg-white/[0.02] backdrop-blur-sm">
              <div className="h-1.5 bg-gradient-to-r from-[#00D1FF] via-[#00E676] to-[#f59e0b]" />

              <div className="p-8 md:p-12">
                {/* Scarcity */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm mb-8">
                  <span className="flex items-center gap-1.5 text-[#f59e0b] font-mono font-bold">
                    <Clock size={16} /> {pad(timeLeft.h)}:{pad(timeLeft.m)}:{pad(timeLeft.s)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/20 text-red-400 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    {spots} de 100 cupos disponibles
                  </span>
                </div>

                {/* Value Stack */}
                <div className="space-y-0 mb-6">
                  {[
                    ['GENY LAB — 6 Laboratorios Interactivos + IA', '$1,200'],
                    ['Trading Room Elite — Sesiones en Vivo', '$800'],
                    ['Diagnóstico Privado 1-a-1 con Juan', '$1,000'],
                  ].map(([item, val], i) => (
                    <div key={i} className="flex items-center justify-between gap-4 py-3.5 border-b border-white/5">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 size={16} className="text-[#00E676] shrink-0" />
                        <span className="text-sm md:text-base text-white/80">{item}</span>
                      </div>
                      <span className="text-sm text-white/30 font-mono shrink-0">{val}</span>
                    </div>
                  ))}
                </div>

                {/* Anchor */}
                <div className="text-center py-4 border-t border-white/10">
                  <p className="text-white/40 text-sm mb-2">Valor total del ecosistema:</p>
                  <p className="text-3xl font-black text-white/25 line-through decoration-red-400/40 decoration-2">$3,000 USD</p>
                </div>

                {/* Justify — why it WOULD be worth $3K */}
                <p className="text-white/50 text-sm text-center leading-relaxed max-w-lg mx-auto py-4">
                  Si lo único que lograra este sistema fuera <strong className="text-white/70">detener tus pérdidas emocionales</strong> y volverte un trader que cierra en verde todas las semanas… ¿valdría $3,000? <strong className="text-[#00E676]">Recuperarías eso en unos cuantos buenos trades.</strong>
                </p>

                {/* The Drop — dramatic price reveal */}
                <div className="text-center py-6 space-y-3">
                  <p className="text-white/70 text-lg">Pero hoy no vas a pagar $3,000.</p>
                  <p className="text-white/50">Ni $1,000. Ni siquiera la mitad.</p>

                  {/* THE PHILOSOPHY — this is the KEY conversion copy */}
                  <div className="py-4">
                    <p className="text-white/60 text-sm leading-relaxed max-w-md mx-auto">
                      Porque el objetivo de GENY LAB <strong className="text-white">no es venderte otro curso aburrido para que lo dejes a medias.</strong> El objetivo es darte la estructura que te falta para que dejes de adivinar y empieces a <strong className="text-[#00D1FF]">ejecutar con precisión.</strong>
                    </p>
                  </div>

                  <p className="text-white/50 text-sm">Todo. Por un pago único de:</p>
                  <div className="flex items-baseline justify-center gap-2 pt-2">
                    <span className="text-7xl md:text-8xl font-black bg-gradient-to-r from-[#00D1FF] to-[#00E676] bg-clip-text text-transparent leading-none">$67</span>
                    <span className="text-xl text-white/40 font-bold">USD</span>
                  </div>
                </div>

                {/* CTA */}
                <div className="text-center pt-2 pb-6">
                  <CTAButton large text="SÍ, QUIERO MI ACCESO — $67 USD" className="w-full max-w-md mx-auto" />
                </div>

                {/* Guarantee — Risk Reversal as HERO element */}
                <div className="rounded-xl p-5 border border-[#00D1FF]/15 bg-[#00D1FF]/[0.03] mb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#00D1FF]/10 border border-[#00D1FF]/25 flex items-center justify-center shrink-0">
                      <Shield size={20} className="text-[#00D1FF]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm uppercase tracking-wide mb-1">Garantía sin riesgo — 15 Días</h4>
                      <p className="text-sm text-white/50 leading-relaxed">
                        Entra, explora todo, interactúa con los nodos. Si en 15 días sientes que no es para ti, nos escribes y te devolvemos el <strong className="text-white">100%</strong>. Sin preguntas. Sin letra chica. <strong className="text-[#00D1FF]">El riesgo real no es entrar. Es seguir operando como hasta ahora.</strong>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-6 text-xs text-white/25">
                  <span className="flex items-center gap-1.5"><Lock size={12} /> Pago seguro</span>
                  <span className="flex items-center gap-1.5"><Zap size={12} /> Acceso inmediato</span>
                  <span className="flex items-center gap-1.5"><Shield size={12} /> Garantía 15 días</span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          URGENCY — Real reasons, not just timers
          Technique: Logical urgency (cohort-based) > fake countdown
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20 relative">
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FadeIn>
              <div className="rounded-2xl p-6 h-full border border-red-500/10 bg-red-500/[0.02] space-y-3">
                <h4 className="font-black uppercase tracking-tight text-sm text-red-400 flex items-center gap-2">
                  <Users size={16} /> Solo 100 cupos por cohorte
                </h4>
                <p className="text-sm text-white/50 leading-relaxed">
                  Limitamos cada cohorte para poder revisar perfiles, mantener calidad en el acompañamiento y hacer seguimiento real a cada trader. Cuando se llena, se cierra hasta la siguiente apertura.
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="rounded-2xl p-6 h-full border border-[#f59e0b]/10 bg-[#f59e0b]/[0.02] space-y-3">
                <h4 className="font-black uppercase tracking-tight text-sm text-[#f59e0b] flex items-center gap-2">
                  <Clock size={16} /> Las sesiones son sincronizadas
                </h4>
                <p className="text-sm text-white/50 leading-relaxed">
                  Cada cohorte entra junta. Si entras después, pierdes el onboarding, el diagnóstico inicial y las primeras sesiones de corrección en vivo. <strong className="text-white/70">No hay replays.</strong>
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          FUTURE IMMEDIATE — Reduce gap between "pay" and "use"
          Technique: Visualize the NEXT 2 MINUTES after clicking
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20 relative">
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <FadeIn>
            <div className="rounded-2xl p-8 md:p-10 border border-[#00E676]/15 bg-[#00E676]/[0.02] space-y-5">
              <h3 className="text-xl md:text-2xl font-black text-center">
                En los próximos <span className="text-[#00E676]">2 minutos</span>:
              </h3>
              <div className="space-y-3 max-w-lg mx-auto">
                {[
                  'Completas tu inscripción de forma segura.',
                  'Recibes tus credenciales exclusivas al correo.',
                  'Entras a tu terminal de GENY LAB.',
                  'Desbloqueas tu primer reto "ADN Financiero" — hoy mismo, antes de nuestra primera sesión en vivo.',
                ].map((t, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#00E676]/10 border border-[#00E676]/25 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[#00E676] font-black text-xs">{i + 1}</span>
                    </div>
                    <p className="text-white/70 text-sm md:text-base">{t}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          FAQ — Objection handling
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 relative">
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black">
                Preguntas <span className="text-[#00D1FF]">frecuentes</span>
              </h2>
            </div>
          </FadeIn>
          <div className="space-y-3">
            <FadeIn><FAQItem q="¿Necesito experiencia en trading?" a="GENY LAB funciona para todos los niveles. Si eres principiante, te diagnostica desde cero. Si ya tienes experiencia, te revelará los patrones mentales que ningún curso de análisis técnico te enseñó — los que realmente están frenando tu consistencia." /></FadeIn>
            <FadeIn delay={0.05}><FAQItem q="¿Es otro curso de análisis técnico?" a="No. GENY LAB no te enseña otra estrategia. Es un sistema de autoconocimiento para traders. Diagnostica tu psicología, tu perfil de riesgo, tus patrones emocionales y te da herramientas prácticas para dejar de sabotearte cuando operas." /></FadeIn>
            <FadeIn delay={0.1}><FAQItem q="¿Cuánto tiempo necesito?" a="Cada laboratorio toma 15-30 minutos. Avanzas a tu ritmo. Las sesiones en vivo del Trading Room Elite son los sábados a las 11am — pero todo queda grabado si no puedes asistir." /></FadeIn>
            <FadeIn delay={0.15}><FAQItem q="Ya gasté dinero en cursos y nada funcionó. ¿Por qué esto sería diferente?" a="Porque todos esos cursos te enseñaron SU método. GENY LAB empieza diagnosticándote a TI. Tu perfil, tus emociones, tus sesgos. No puedes arreglar lo que no mides. Y tienes 15 días de garantía para comprobarlo sin riesgo." /></FadeIn>
            <FadeIn delay={0.2}><FAQItem q="¿Cómo accedo después de pagar?" a="Inmediatamente. Recibes un correo con tu enlace de acceso, estableces tu contraseña y entras a tu terminal. Todo en menos de 2 minutos." /></FadeIn>
            <FadeIn delay={0.25}><FAQItem q="¿Qué pasa si no es para mí?" a="Nos escribes dentro de los primeros 15 días y te devolvemos el 100%. Sin preguntas. Sin complicaciones. El riesgo es cero." /></FadeIn>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          FINAL CLOSE — Short, direct, emotional
          Technique: Mirror the opening pain + offer the exit
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-[#00D1FF]/[0.03] to-transparent" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <FadeIn>
            <img src="/images/78.png" alt="GENY LAB" className="w-36 md:w-48 mx-auto object-contain opacity-70 mb-8" />
            <p className="text-white/50 text-base md:text-lg mb-6 max-w-xl mx-auto">
              La próxima vez que abras una operación, puedes hacerlo desde el mismo caos de siempre… o puedes hacerlo con la estructura que te falta.
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight mb-8">
              Nos vemos del{' '}
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
