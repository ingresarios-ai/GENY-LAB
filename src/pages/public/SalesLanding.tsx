// @ts-nocheck
// GENY LAB — Sales Landing Page V3 — Faithful to official VSL script
// Voice: Juan speaking directly. Price revealed ONLY in offer section.
import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'motion/react';
import {
  Play, CheckCircle2, ArrowRight, ChevronDown, ChevronUp,
  ArrowDown, Lock, Zap, Shield, Star, Clock, Users, Gift
} from 'lucide-react';
import { Footer } from '../../components/Footer';

/* ────────────────────────────────────────────────────────────────────────────
   UTILITIES
   ──────────────────────────────────────────────────────────────────────────── */

function FadeIn({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const CTA_URL = 'https://whop.com/ingresarios/geny-lab/';

function CTAButton({ large = false, className = '', text = 'COMPRAR AHORA — $67 USD' }: { large?: boolean; className?: string; text?: string }) {
  return (
    <a
      href={CTA_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative inline-flex items-center justify-center gap-3 font-black uppercase tracking-wider rounded-2xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] ${
        large ? 'px-10 py-5 text-base md:text-lg' : 'px-8 py-4 text-sm md:text-base'
      } bg-gradient-to-r from-[#00D1FF] to-[#00E676] text-[#05080f] shadow-[0_0_40px_rgba(0,209,255,0.3)] hover:shadow-[0_0_60px_rgba(0,209,255,0.5)] ${className}`}
    >
      <span>{text}</span>
      <ArrowRight size={large ? 22 : 18} className="group-hover:translate-x-1 transition-transform" />
      <span className="absolute inset-0 rounded-2xl border-2 border-[#00D1FF]/40 animate-ping opacity-20 pointer-events-none" />
    </a>
  );
}

function SectionLabel({ emoji, text, color = 'white/40' }: { emoji: string; text: string; color?: string }) {
  return <p className={`text-xs font-mono uppercase tracking-[0.3em] text-[${color}] mb-3`}>{emoji} {text}</p>;
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
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="px-5 md:px-6 pb-5 md:pb-6 -mt-1">
          <p className="text-white/60 text-sm md:text-base leading-relaxed">{a}</p>
        </motion.div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════════════════════ */

export default function SalesLanding() {
  // Countdown timer (48h from first visit)
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
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // Show sticky bar only after pricing section has been scrolled past
  useEffect(() => {
    const handleScroll = () => {
      if (pricingRef.current) {
        const rect = pricingRef.current.getBoundingClientRect();
        setShowStickyBar(rect.bottom < 0);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  // Scarcity: persistent spots count
  const [spots] = useState(() => {
    const saved = localStorage.getItem('geny_spots');
    if (saved) return parseInt(saved);
    const n = Math.floor(Math.random() * 15) + 12;
    localStorage.setItem('geny_spots', n.toString());
    return n;
  });

  return (
    <div className="min-h-screen bg-[#05080f] text-white overflow-hidden">

      {/* ══════════════════════════════════════════════════════════════════════
          1. HERO — Logo + Video + EL PROBLEMA (no CTA de compra aquí)
          Script: "El 95% de los traders pierde dinero..."
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative pt-8 pb-16 md:pt-12 md:pb-24">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#00D1FF]/5 rounded-full blur-[120px] -translate-y-1/2" />

        <div className="relative z-10 max-w-5xl mx-auto px-4">
          {/* Logo */}
          <div className="text-center mb-8 md:mb-12">
            <img src="/images/78.png" alt="GENY LAB" className="w-52 md:w-72 mx-auto object-contain" />
          </div>

          {/* Video */}
          <div className="relative w-full max-w-4xl mx-auto mb-10 md:mb-14">
            <div className="aspect-video rounded-2xl overflow-hidden border-2 border-[#00D1FF]/20 shadow-[0_0_80px_rgba(0,209,255,0.15)] bg-[#0a0e18]">
              {/* ========== REEMPLAZA CON TU VIDEO IFRAME ========== */}
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#0a0e18] to-[#05080f]">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#00D1FF]/10 border-2 border-[#00D1FF]/40 flex items-center justify-center shadow-[0_0_40px_rgba(0,209,255,0.3)] cursor-pointer hover:scale-110 transition-transform">
                  <Play size={36} className="text-[#00D1FF] ml-1" fill="rgba(0,209,255,0.3)" />
                </div>
                <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Video próximamente</p>
              </div>
            </div>
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-[#00D1FF]/20 via-transparent to-[#00E676]/20 -z-10 blur-sm" />
          </div>

          {/* EL PROBLEMA — Copy verbatim del script */}
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[1.1]">
              El 95% de los traders{' '}
              <span className="bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent">
                pierde dinero
              </span>
            </h1>
            <p className="text-white/70 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
              No porque les falte una "estrategia mágica", sino porque operan desde el <strong className="text-white">caos mental</strong>. Pierden el control emocional, dudan de sus setups, y nunca logran construir <strong className="text-[#00D1FF]">consistencia real.</strong>
            </p>

            {/* Scroll indicator — NOT a buy button */}
            <div className="pt-6">
              <a href="#solucion" className="inline-flex flex-col items-center gap-2 text-white/30 hover:text-white/50 transition-colors group">
                <span className="text-xs font-mono uppercase tracking-widest">Descubre la solución</span>
                <ArrowDown size={20} className="animate-bounce" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          2. POLARIZACIÓN — "Para quién NO es esto"
          Script línea 6-7: Verbatim
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 relative">
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <FadeIn>
            <div className="rounded-2xl p-8 md:p-10 border border-red-500/15 bg-red-500/[0.03] backdrop-blur-sm space-y-5">
              <h2 className="text-lg md:text-xl font-black uppercase tracking-tight text-red-400">
                ⛔ Quiero ser muy claro antes de seguir:
              </h2>
              <p className="text-white/70 text-sm md:text-base leading-relaxed">
                Si estás buscando un <strong className="text-white">grupo de señales de Telegram</strong>, un <strong className="text-white">bot automático que opere por ti</strong>, o el secreto para hacerte millonario este viernes… <span className="text-red-400 font-bold">por favor cierra esta página.</span>
              </p>
              <p className="text-white/70 text-sm md:text-base leading-relaxed">
                Esto es un <strong className="text-[#00D1FF]">sistema de trabajo estricto</strong> para traders que ya se cansaron de perder dinero por indisciplina y están listos para <strong className="text-white">profesionalizarse de verdad.</strong>
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          3. LA SOLUCIÓN — GENY LAB
          Script líneas 9-14: Voz de Juan, primera persona
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="solucion" className="py-20 md:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00D1FF]/[0.02] to-transparent" />
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-8">
              <p className="text-xs font-mono uppercase tracking-[0.3em] text-[#00D1FF]/80 mb-3">💡 LA SOLUCIÓN</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight">
                <span className="text-[#00D1FF]">GENY LAB</span>
              </h2>
            </div>
          </FadeIn>

          {/* Copy directo del script — voz de Juan */}
          <FadeIn delay={0.1}>
            <div className="max-w-3xl mx-auto space-y-6 text-center">
              <p className="text-white/80 text-lg md:text-xl leading-relaxed">
                Eso es exactamente lo que hace GENY LAB.
              </p>
              <p className="text-white/80 text-lg md:text-xl leading-relaxed">
                <strong className="text-white">No es otro curso de análisis técnico ni una estrategia mágica.</strong><br />
                GENY LAB te ayuda a detectar qué está destruyendo tu consistencia mientras operas… <span className="text-[#00D1FF] font-bold">antes de que el mercado vuelva a cobrarte por el mismo error.</span>
              </p>
              <p className="text-white/80 text-lg md:text-xl leading-relaxed">
                No vas a entrar a ver videos aburridos de 2 horas. Vas a entrar a un <strong className="text-[#00E676]">laboratorio gamificado</strong>. Vas a interactuar con nuestra Inteligencia Artificial para diagnosticar tu perfil, verás barras de progreso, desbloquearás nodos y recibirás feedback inmediato.
              </p>
              <p className="text-xl md:text-2xl font-black text-white">
                Es como un videojuego, pero donde el premio es tu consistencia financiera.
              </p>
            </div>
          </FadeIn>

          {/* Mockups */}
          <FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mt-14">
              <div className="text-center">
                <img src="/images/landing/app_mockup.png" alt="GENY LAB - Mapa de progreso" className="rounded-2xl shadow-[0_0_60px_rgba(0,209,255,0.1)] border border-white/10 mx-auto max-w-sm w-full" />
                <p className="text-white/30 text-xs font-mono mt-3 uppercase tracking-widest">Mapa de Progreso Gamificado</p>
              </div>
              <div className="text-center">
                <img src="/images/landing/simulator_preview.png" alt="GENY LAB - Simulador de opciones" className="rounded-2xl shadow-[0_0_60px_rgba(0,230,118,0.1)] border border-white/10 mx-auto w-full" />
                <p className="text-white/30 text-xs font-mono mt-3 uppercase tracking-widest">Geny Options Lab</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          4. PUENTE EMOCIONAL — Objeción anticipada
          Script líneas 16-19: "Ya probé demasiadas cosas..."
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 relative">
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <FadeIn>
            <div className="text-center space-y-5">
              <p className="text-white/50 text-lg md:text-xl leading-relaxed italic">
                Y sé lo que quizás estás pensando:
              </p>
              <blockquote className="text-2xl md:text-3xl font-black text-white/80 leading-tight">
                "Ya probé demasiadas cosas<br />y nada me funcionó."
              </blockquote>
              <p className="text-white/60 text-lg md:text-xl leading-relaxed">
                Por eso <strong className="text-white">no quiero que me creas.</strong>
              </p>
              <p className="text-[#00D1FF] text-lg md:text-xl font-bold leading-relaxed">
                Quiero que veas lo que pasa cuando un trader deja de operar emocionalmente… y empieza a ejecutar con estructura real.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          5. TESTIMONIOS (Placeholder)
          Script línea 21: "[Insertar Testimonios aquí]"
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 relative">
        <div className="relative z-10 max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="rounded-2xl p-6 border border-white/5 bg-white/[0.02] backdrop-blur-sm flex flex-col items-center text-center gap-4">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(s => <Star key={s} size={16} className="text-[#f59e0b] fill-[#f59e0b]" />)}
                  </div>
                  <p className="text-white/30 text-sm italic leading-relaxed">"Testimonio próximamente..."</p>
                  <div className="flex items-center gap-3 mt-auto pt-4 border-t border-white/5 w-full justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10" />
                    <div className="text-left">
                      <p className="text-white/25 text-sm font-bold">Nombre</p>
                      <p className="text-white/15 text-xs">País</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          6. QUICK WIN — "Tu primer resultado en 15 minutos"
          Script líneas 23-24: Verbatim
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 relative">
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <FadeIn>
            <div className="rounded-2xl p-8 md:p-10 border border-[#00E676]/15 bg-[#00E676]/[0.02] backdrop-blur-sm text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-14 h-14 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/25 flex items-center justify-center">
                  <Zap size={28} className="text-[#00E676]" />
                </div>
              </div>
              <p className="text-white/70 text-base md:text-lg leading-relaxed max-w-xl mx-auto">
                Y lo mejor de todo: no necesitas estudiar durante 6 meses para ver qué estás haciendo mal. Solo el primer módulo de <strong className="text-white">"ADN Financiero"</strong> te tomará menos de 15 minutos completarlo, y te garantizo que <strong className="text-[#00D1FF]">te revelará errores mentales que llevas cometiendo años sin darte cuenta.</strong>
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          7. EL BUNDLE — Lo que incluye el ecosistema
          Script líneas 28-51: Plataforma + 6 Labs + 2 Bonos
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00D1FF]/[0.015] to-transparent" />
        <div className="relative z-10 max-w-5xl mx-auto px-4">

          <FadeIn>
            <div className="text-center mb-6">
              <p className="text-xs font-mono uppercase tracking-[0.3em] text-[#00D1FF]/80 mb-3">📦 LO QUE INCLUYE EL ECOSISTEMA</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight mb-4">
                GENY LAB — Sistema Operativo<br className="hidden md:block" />
                <span className="text-[#00D1FF]">para Traders Consistentes</span>
              </h2>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <p className="text-white/70 text-base md:text-lg leading-relaxed text-center max-w-3xl mx-auto mb-12">
              Más que un curso en video, es tu nueva <strong className="text-white">terminal de ejecución interactiva</strong>. Al ingresar a la plataforma, no verás módulos aburridos; accederás a un mapa de progreso gamificado con laboratorios diseñados para auditar tu psicología y estructura.
            </p>
          </FadeIn>

          {/* Sub-header */}
          <FadeIn>
            <p className="text-xs font-mono uppercase tracking-[0.3em] text-[#00E676]/80 text-center mb-8">
              🧪 Dentro de tu terminal tendrás acceso inmediato a estos 6 laboratorios:
            </p>
          </FadeIn>

          {/* 6 Labs — copy verbatim del script */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
            {[
              {
                emoji: '🧠', title: 'Investor DNA Blueprint', subtitle: 'ADN Inversionista', color: '#3b82f6',
                desc: 'Descubre qué tipo de trader eres realmente, cuál es tu perfil de riesgo ideal y qué estilo operativo tiene más probabilidades de darte consistencia a largo plazo.'
              },
              {
                emoji: '🐜', title: 'Money Leak Projection', subtitle: 'Gastos Hormiga', color: '#f59e0b',
                desc: 'Descubre las fugas invisibles que están destruyendo tu capacidad financiera y visualiza cuánto dinero podrías acumular en los próximos 10 a 20 años si rediriges ese capital estratégicamente.'
              },
              {
                emoji: '🤯', title: 'Shadow Money Code', subtitle: 'La Sombra', color: '#8b5cf6',
                desc: 'Descubre las creencias ocultas, bloqueos subconscientes y patrones emocionales que están controlando tus decisiones financieras y destruyendo tu capacidad de ejecutar con claridad.'
              },
              {
                emoji: '🌡️', title: 'Financial Thermostat System', subtitle: 'Termostato', color: '#ef4444',
                desc: 'Aprende a medir y expandir tu capacidad mental para sostener más dinero, más riesgo y más responsabilidad sin colapsar emocionalmente cuando el mercado te presione.'
              },
              {
                emoji: '🚫', title: 'Money Traps', subtitle: 'Trampas del Dinero', color: '#f97316',
                desc: 'Detecta los sesgos mentales y hábitos invisibles que mantienen a la mayoría de traders atrapados en la carrera de la rata y reemplázalos por patrones financieros mucho más inteligentes.'
              },
              {
                emoji: '🎯', title: 'Geny Options Lab', subtitle: 'Simulador de Mercado', color: '#00E676',
                desc: 'Practica operaciones en escenarios reales de mercado y desarrolla criterio operativo avanzado antes de arriesgar capital importante en estrategias más complejas.'
              },
            ].map((lab, i) => (
              <FadeIn key={i} delay={i * 0.07}>
                <div className="rounded-2xl p-6 h-full border-l-2 bg-white/[0.02] backdrop-blur-sm border border-white/5" style={{ borderLeftColor: lab.color }}>
                  <div className="flex items-start gap-4">
                    <span className="text-3xl shrink-0">{lab.emoji}</span>
                    <div>
                      <h4 className="font-black text-white text-base uppercase tracking-tight">{lab.title}</h4>
                      <p className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: lab.color }}>{lab.subtitle}</p>
                      <p className="text-sm text-white/50 leading-relaxed">{lab.desc}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Nodos de Validación */}
          <FadeIn>
            <div className="rounded-2xl p-6 border border-[#00D1FF]/15 bg-[#00D1FF]/[0.02] backdrop-blur-sm text-center max-w-2xl mx-auto mb-6">
              <p className="text-white/70 text-sm md:text-base leading-relaxed">
                Todo está conectado por <strong className="text-[#00D1FF]">Nodos de Validación</strong>: el sistema te obliga a aplicar lo aprendido en cada simulador para poder desbloquear el siguiente nivel. <strong className="text-white">Es práctica pura.</strong>
              </p>
            </div>
          </FadeIn>

          <FadeIn>
            <p className="text-center text-white/30 text-sm font-mono mb-16">Valor total de la Plataforma y sus 6 Laboratorios: <span className="text-white/50 font-bold">$1,200 USD</span></p>
          </FadeIn>

          {/* ── BONOS ── */}
          <FadeIn>
            <p className="text-xs font-mono uppercase tracking-[0.3em] text-[#f59e0b]/80 text-center mb-8">🎁 BONOS EXCLUSIVOS</p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <FadeIn>
              <div className="rounded-2xl p-7 h-full border-t-2 border-t-[#f59e0b]/50 bg-white/[0.02] backdrop-blur-sm border border-white/5 space-y-4">
                <div className="flex items-center gap-2">
                  <Gift size={18} className="text-[#f59e0b]" />
                  <p className="text-[10px] font-mono uppercase tracking-widest text-[#f59e0b] font-bold">BONO #1</p>
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight text-white">
                  Trading Room Elite
                </h3>
                <p className="text-xs font-mono text-white/30 uppercase tracking-widest">Sesiones Estratégicas en Vivo — Sábados 11am</p>
                <p className="text-sm text-white/60 leading-relaxed">
                  Recibe acompañamiento en tiempo real, resuelve dudas directamente con traders activos y corrige errores de ejecución antes de volver a perder dinero innecesariamente.
                </p>
                <p className="text-sm font-bold text-white/30">Valor: <span className="line-through">$800 USD</span></p>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="rounded-2xl p-7 h-full border-t-2 border-t-[#8b5cf6]/50 bg-white/[0.02] backdrop-blur-sm border border-white/5 space-y-4">
                <div className="flex items-center gap-2">
                  <Gift size={18} className="text-[#8b5cf6]" />
                  <p className="text-[10px] font-mono uppercase tracking-widest text-[#8b5cf6] font-bold">BONO #2</p>
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight text-white">
                  Diagnóstico Privado de Consistencia
                </h3>
                <p className="text-xs font-mono text-white/30 uppercase tracking-widest">1 a 1 con Juan</p>
                <p className="text-sm text-white/60 leading-relaxed">
                  Identifica exactamente qué hábito psicológico, técnico o financiero está frenando tu consistencia y recibe una ruta personalizada de mejora basada en tu perfil como trader.
                </p>
                <p className="text-sm font-bold text-white/30">Valor: <span className="line-through">$1,000 USD</span></p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          8. LA OFERTA Y EL CIERRE — Único lugar del precio
          Script líneas 55-76: Copy completo verbatim
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-32 relative" id="precio" ref={pricingRef}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00E676]/[0.02] to-transparent" />
        <div className="relative z-10 max-w-3xl mx-auto px-4">

          <FadeIn>
            <div className="rounded-3xl overflow-hidden border border-[#00E676]/20 shadow-[0_0_80px_rgba(0,230,118,0.08)] bg-white/[0.02] backdrop-blur-sm">
              <div className="h-1.5 bg-gradient-to-r from-[#00D1FF] via-[#00E676] to-[#f59e0b]" />

              <div className="p-8 md:p-12 space-y-8">

                {/* Timer + Scarcity */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm">
                  <span className="flex items-center gap-1.5 text-[#f59e0b] font-mono font-bold">
                    <Clock size={16} />
                    {pad(timeLeft.h)}:{pad(timeLeft.m)}:{pad(timeLeft.s)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/20 text-red-400 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    Solo {spots} de 100 cupos disponibles
                  </span>
                </div>

                {/* Value Stack — verbatim del script */}
                <div className="space-y-3">
                  {[
                    ['GENY LAB — Plataforma + 6 Laboratorios Interactivos', '$1,200'],
                    ['BONO: Trading Room Elite — Sesiones en Vivo', '$800'],
                    ['BONO: Diagnóstico Privado de Consistencia 1-a-1', '$1,000'],
                  ].map(([item, val], i) => (
                    <div key={i} className="flex items-center justify-between gap-4 py-3 border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 size={16} className="text-[#00E676] shrink-0" />
                        <span className="text-sm md:text-base text-white/80">{item}</span>
                      </div>
                      <span className="text-sm text-white/30 font-mono shrink-0">{val}</span>
                    </div>
                  ))}
                </div>

                {/* Total value */}
                <div className="text-center pt-4 border-t border-white/10">
                  <p className="text-white/40 text-sm mb-2">Valor total real:</p>
                  <p className="text-3xl font-black text-white/30 line-through decoration-red-400/50 decoration-2">$3,000 USD</p>
                </div>

                {/* Anchor copy — VERBATIM del script (líneas 61-63) */}
                <p className="text-white/60 text-sm md:text-base text-center leading-relaxed max-w-lg mx-auto">
                  Y siendo completamente honesto... si cobráramos $3,000 dólares, y lo único que lograra este sistema fuera <strong className="text-white">detener tus pérdidas actuales</strong> y volverte un trader que por fin cierra en verde todas las semanas… ¿valdría la pena la inversión? <strong className="text-[#00E676]">Por supuesto que sí.</strong> Recuperarías esos $3,000 en unos cuantos buenos trades.
                </p>

                {/* Price reveal — VERBATIM (líneas 65-74) */}
                <div className="text-center space-y-3 py-4">
                  <p className="text-white/70 text-base md:text-lg">Pero hoy no vas a pagar $3,000 USD.</p>
                  <p className="text-white/60 text-base">Ni $1,000 USD. Ni siquiera vas a pagar la mitad.</p>
                  <div className="py-2">
                    <p className="text-white/50 text-sm mb-1">
                      Porque el objetivo de GENY LAB no es venderte otro curso aburrido para que lo dejes a medias.<br />
                      <strong className="text-white">El objetivo es darte la estructura que te falta para que dejes de adivinar y empieces a ejecutar con precisión.</strong>
                    </p>
                  </div>
                  <p className="text-white/60 text-sm">Si tomas acción <strong className="text-white">hoy mismo</strong> antes de que se cierren las puertas, puedes llevarte absolutamente todo por un pago único de:</p>
                  <div className="flex items-baseline justify-center gap-2 pt-4">
                    <span className="text-7xl md:text-8xl font-black bg-gradient-to-r from-[#00D1FF] to-[#00E676] bg-clip-text text-transparent">$67</span>
                    <span className="text-xl text-white/40 font-bold">USD</span>
                  </div>
                </div>

                {/* CTA — "Dale clic ahora mismo al botón y compra ahora" */}
                <div className="text-center pt-2">
                  <CTAButton large text="COMPRAR AHORA — $67 USD" className="w-full max-w-md mx-auto" />
                </div>

                {/* Garantía — VERBATIM (líneas 78-79) */}
                <div className="rounded-2xl p-5 border border-[#00D1FF]/10 bg-[#00D1FF]/[0.02]">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#00D1FF]/10 border border-[#00D1FF]/25 flex items-center justify-center shrink-0">
                      <Shield size={20} className="text-[#00D1FF]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm uppercase tracking-wide mb-1">Garantía Total — 15 Días</h4>
                      <p className="text-sm text-white/50 leading-relaxed">
                        Tienes 15 días completos para entrar a GENY LAB, explorar el contenido, interactuar con los nodos y vivir la experiencia por dentro. Y si sientes que no es para ti, simplemente nos escribes y te devolvemos el <strong className="text-white">100% de tu dinero</strong>. Sin riesgo. Sin complicaciones.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-6 text-xs text-white/30">
                  <span className="flex items-center gap-1.5"><Lock size={12} /> Pago seguro</span>
                  <span className="flex items-center gap-1.5"><Zap size={12} /> Acceso inmediato</span>
                  <span className="flex items-center gap-1.5"><Shield size={12} /> Garantía 15 días</span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          9. ESCASEZ + URGENCIA
          Script líneas 81-88: Verbatim
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 relative">
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FadeIn>
              <div className="rounded-2xl p-6 h-full border border-red-500/10 bg-red-500/[0.02] backdrop-blur-sm space-y-3">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-red-400" />
                  <h4 className="font-black uppercase tracking-tight text-sm text-red-400">Solo 100 cupos</h4>
                </div>
                <p className="text-sm text-white/50 leading-relaxed">
                  Solo aceptaremos 100 traders en esta cohorte de GENY LAB. Una vez los cupos se completen, las inscripciones se cerrarán hasta la próxima apertura. Esto nos permite <strong className="text-white">revisar perfiles, mantener la calidad del acompañamiento</strong>, responder preguntas en vivo, y hacer un seguimiento real a cada trader dentro del sistema.
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="rounded-2xl p-6 h-full border border-[#f59e0b]/10 bg-[#f59e0b]/[0.02] backdrop-blur-sm space-y-3">
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-[#f59e0b]" />
                  <h4 className="font-black uppercase tracking-tight text-sm text-[#f59e0b]">Puertas por tiempo limitado</h4>
                </div>
                <p className="text-sm text-white/50 leading-relaxed">
                  Cada cohorte entra junta porque los entrenamientos en vivo y las sesiones de ejecución están sincronizadas semanalmente. Si entras después, <strong className="text-white">perderás el onboarding, el diagnóstico inicial</strong> y las primeras sesiones de corrección de errores en vivo. Por eso las puertas se abren solo por tiempo limitado.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          10. FUTURO INMEDIATO — "Qué pasa al hacer clic"
          Script líneas 90-91: Verbatim
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 relative">
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <FadeIn>
            <div className="rounded-2xl p-8 md:p-10 border border-[#00E676]/15 bg-[#00E676]/[0.02] backdrop-blur-sm space-y-6">
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-center">
                ¿Qué pasa al hacer <span className="text-[#00E676]">clic</span>?
              </h3>
              <p className="text-white/60 text-sm md:text-base leading-relaxed text-center">
                En cuanto hagas clic y completes tu inscripción:
              </p>
              <div className="space-y-4 max-w-lg mx-auto">
                {[
                  'Recibirás tus credenciales exclusivas.',
                  'Podrás entrar de inmediato a tu terminal de GENY LAB.',
                  'Verás tu barra de progreso y desbloquearás tu primer reto de "ADN Financiero" hoy mismo.',
                  'Todo antes de nuestra primera sesión en vivo.',
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-[#00E676]/10 border border-[#00E676]/25 flex items-center justify-center shrink-0">
                      <span className="text-[#00E676] font-black text-sm">{i + 1}</span>
                    </div>
                    <p className="text-white/70 text-sm md:text-base pt-1">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          11. FAQ
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 relative">
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-14">
              <p className="text-xs font-mono uppercase tracking-[0.3em] text-white/40 mb-3">❓ PREGUNTAS FRECUENTES</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight">
                Resolvemos tus <span className="text-[#00D1FF]">dudas</span>
              </h2>
            </div>
          </FadeIn>
          <div className="space-y-3">
            <FadeIn><FAQItem q="¿Necesito experiencia previa en trading?" a="GENY LAB está diseñado para traders de todos los niveles. Si eres principiante, el sistema te diagnostica desde cero. Si ya tienes experiencia, los laboratorios te revelarán los patrones mentales que están frenando tu consistencia — cosas que ningún curso de análisis técnico te enseñó." /></FadeIn>
            <FadeIn delay={0.05}><FAQItem q="¿Es otro curso de análisis técnico?" a="No. GENY LAB no te enseña otra estrategia más. Es un sistema de autoconocimiento para traders. Diagnostica tu psicología, tu perfil de riesgo, tus patrones emocionales y te da herramientas prácticas para dejar de sabotearte cuando operas." /></FadeIn>
            <FadeIn delay={0.1}><FAQItem q="¿Cuánto tiempo necesito dedicarle?" a="Cada laboratorio toma entre 15-30 minutos. Puedes avanzar a tu ritmo. El sistema de gamificación te motiva con rachas diarias, pero no hay presión. Las sesiones en vivo son los sábados a las 11am." /></FadeIn>
            <FadeIn delay={0.15}><FAQItem q="¿Funciona en celular?" a="Sí, GENY LAB es 100% responsive. Funciona en celular, tablet y computadora. Solo necesitas un navegador web — no hay apps que descargar." /></FadeIn>
            <FadeIn delay={0.2}><FAQItem q="¿Cómo accedo después de pagar?" a="Inmediatamente después de tu pago recibes un correo con tu enlace de acceso personalizado. Haces clic, estableces tu contraseña y entras directo a tu terminal. Todo en menos de 2 minutos." /></FadeIn>
            <FadeIn delay={0.25}><FAQItem q="¿Qué pasa si no me funciona?" a="Tienes 15 días completos de garantía. Entras, exploras todo, interactúas con los laboratorios. Si sientes que no es para ti, nos escribes y te devolvemos el 100% de tu dinero. Sin preguntas. Sin complicaciones." /></FadeIn>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          12. CIERRE FINAL — "Nos vemos del otro lado"
          Script línea 93: Verbatim
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-[#00D1FF]/[0.03] to-transparent" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <FadeIn>
            <div className="space-y-6">
              <img src="/images/78.png" alt="GENY LAB" className="w-40 md:w-52 mx-auto object-contain opacity-80" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight">
                Nos vemos del{' '}
                <span className="bg-gradient-to-r from-[#00D1FF] to-[#00E676] bg-clip-text text-transparent">otro lado</span>
              </h2>
              <p className="text-white/50 text-lg md:text-xl">
                Haz clic en el botón ahora.
              </p>
              <div className="pt-4 space-y-4">
                <CTAButton large text="COMPRAR AHORA — $67 USD" />
                <p className="text-white/20 text-xs font-mono uppercase tracking-widest">
                  Pago único · Garantía 15 días · Acceso inmediato
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          STICKY BOTTOM BAR — Aparece SOLO después de scrollear pasado el pricing
      ══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-[#05080f]/95 backdrop-blur-xl border-t border-white/10 py-3 px-4"
          >
            <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
              <div className="hidden sm:flex items-center gap-3">
                <span className="text-white/30 text-sm line-through">$3,000</span>
                <span className="text-2xl font-black bg-gradient-to-r from-[#00D1FF] to-[#00E676] bg-clip-text text-transparent">$67 USD</span>
                <span className="text-xs text-[#f59e0b] font-mono font-bold">{pad(timeLeft.h)}:{pad(timeLeft.m)}:{pad(timeLeft.s)}</span>
              </div>
              <a
                href={CTA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black uppercase tracking-wider text-sm bg-gradient-to-r from-[#00D1FF] to-[#00E676] text-[#05080f] hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                COMPRAR AHORA <ArrowRight size={16} />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
