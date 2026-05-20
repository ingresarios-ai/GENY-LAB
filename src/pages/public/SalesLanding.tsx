// @ts-nocheck
// GENY LAB — Sales Landing Page (VSL)
import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import {
  Play, CheckCircle2, ArrowRight, ChevronDown, ChevronUp,
  TrendingDown, Brain, ShieldAlert, Zap, Target, BarChart3,
  GraduationCap, Gamepad2, Bot, Lock, Flame, Award, Star,
  Clock, Users, BookOpen, Sparkles, X
} from 'lucide-react';
import { Footer } from '../../components/Footer';

// ─── Animate on scroll wrapper ────────────────────────────────────────────
function FadeIn({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── CTA Button ───────────────────────────────────────────────────────────
const CTA_URL = 'https://whop.com/ingresarios/geny-lab/';

function CTAButton({ large = false, className = '' }: { large?: boolean; className?: string }) {
  return (
    <a
      href={CTA_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative inline-flex items-center justify-center gap-3 font-black uppercase tracking-wider rounded-2xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] ${
        large
          ? 'px-10 py-5 text-base md:text-lg'
          : 'px-8 py-4 text-sm md:text-base'
      } bg-gradient-to-r from-[#00D1FF] to-[#00E676] text-[#05080f] shadow-[0_0_40px_rgba(0,209,255,0.3)] hover:shadow-[0_0_60px_rgba(0,209,255,0.5)] ${className}`}
    >
      <span>QUIERO ACCESO A GENY LAB</span>
      <ArrowRight size={large ? 22 : 18} className="group-hover:translate-x-1 transition-transform" />
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-2xl border-2 border-[#00D1FF]/40 animate-ping opacity-20" />
    </a>
  );
}

// ─── FAQ Item ─────────────────────────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 p-5 md:p-6 text-left"
      >
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

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function SalesLanding() {
  // Countdown timer (48h from first visit)
  const [timeLeft, setTimeLeft] = useState({ h: 47, m: 59, s: 59 });

  useEffect(() => {
    const saved = localStorage.getItem('geny_landing_timer');
    let end: number;
    if (saved) {
      end = parseInt(saved);
    } else {
      end = Date.now() + 48 * 60 * 60 * 1000;
      localStorage.setItem('geny_landing_timer', end.toString());
    }

    const tick = () => {
      const diff = Math.max(0, end - Date.now());
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ h, m, s });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#05080f] text-white overflow-hidden">

      {/* ═══════ SECTION 1: HERO ═══════ */}
      <section className="relative pt-8 pb-16 md:pt-12 md:pb-24">
        {/* Background effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#00D1FF]/5 rounded-full blur-[120px] -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#00E676]/3 rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-5xl mx-auto px-4">
          {/* Logo */}
          <div className="text-center mb-8 md:mb-12">
            <img src="/images/78.png" alt="GENY LAB" className="w-52 md:w-72 mx-auto object-contain" />
          </div>

          {/* Video Placeholder */}
          <div className="relative w-full max-w-4xl mx-auto mb-10 md:mb-14">
            <div className="aspect-video rounded-2xl overflow-hidden border-2 border-[#00D1FF]/20 shadow-[0_0_80px_rgba(0,209,255,0.15)] bg-[#0a0e18]">
              {/* Replace this div with your video iframe when ready */}
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#0a0e18] to-[#05080f]">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#00D1FF]/10 border-2 border-[#00D1FF]/40 flex items-center justify-center shadow-[0_0_40px_rgba(0,209,255,0.3)] cursor-pointer hover:scale-110 transition-transform">
                  <Play size={36} className="text-[#00D1FF] ml-1" fill="rgba(0,209,255,0.3)" />
                </div>
                <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Video próximamente</p>
              </div>
            </div>
            {/* Glow border effect */}
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-[#00D1FF]/20 via-transparent to-[#00E676]/20 -z-10 blur-sm" />
          </div>

          {/* Headline */}
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[1.1]">
              Aprende a invertir desde cero{' '}
              <span className="bg-gradient-to-r from-[#00D1FF] to-[#00E676] bg-clip-text text-transparent">
                — aunque nunca hayas tocado un gráfico
              </span>
            </h1>
            <p className="text-white/60 text-base md:text-xl leading-relaxed max-w-2xl mx-auto">
              El laboratorio interactivo que te transforma de <strong className="text-white">principiante total</strong> a <strong className="text-white">inversionista con mentalidad profesional</strong> en 7 retos prácticos.
            </p>

            {/* CTA */}
            <div className="pt-4">
              <CTAButton large />
              <p className="text-white/30 text-xs font-mono mt-4 uppercase tracking-widest">
                Acceso inmediato · Sin conocimientos previos
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ SECTION 2: PAIN POINTS ═══════ */}
      <section className="py-20 md:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/[0.02] to-transparent" />
        <div className="relative z-10 max-w-5xl mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-14">
              <p className="text-xs font-mono uppercase tracking-[0.3em] text-red-400/80 mb-3">⚠️ EL PROBLEMA</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight">
                Tu dinero pierde valor<br />
                <span className="text-red-400">cada día que no inviertes</span>
              </h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { icon: TrendingDown, color: '#ef4444', title: 'La inflación te roba silenciosamente', desc: 'Mientras tu dinero duerme en una cuenta de ahorro, pierde entre un 5% y 10% de poder adquisitivo cada año. En 10 años, tus ahorros valen la mitad.' },
              { icon: Brain, color: '#f59e0b', title: 'La información contradictoria te paraliza', desc: 'Un video dice "compra cripto", otro dice "invierte en bienes raíces", otro dice "ahorra en dólares". Demasiado ruido, cero claridad.' },
              { icon: ShieldAlert, color: '#ef4444', title: 'El miedo a perder te frena', desc: 'Sabes que deberías invertir, pero el miedo a equivocarte te mantiene estancado. Cada mes que pasa es una oportunidad perdida.' },
              { icon: Lock, color: '#f59e0b', title: 'Los cursos tradicionales no funcionan', desc: 'Videos largos, teoría aburrida, cero práctica. Terminas con información pero sin transformación real en tu comportamiento financiero.' },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="flex gap-5 p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
                  <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}>
                    <item.icon size={22} style={{ color: item.color }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1.5">{item.title}</h3>
                    <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn>
            <p className="text-center text-white/40 text-lg md:text-xl mt-14 max-w-2xl mx-auto font-medium italic">
              "¿Y si existiera un sistema paso a paso, interactivo y práctico que te enseñe a invertir <span className="text-[#00D1FF] not-italic font-bold">haciendo</span>, no solo <span className="text-white/60 not-italic">escuchando</span>?"
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══════ SECTION 3: SOLUTION — QUÉ ES GENY LAB ═══════ */}
      <section className="py-20 md:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00D1FF]/[0.02] to-transparent" />
        <div className="relative z-10 max-w-5xl mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-14">
              <p className="text-xs font-mono uppercase tracking-[0.3em] text-[#00D1FF]/80 mb-3">💡 LA SOLUCIÓN</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight mb-4">
                Bienvenido a <span className="text-[#00D1FF]">GENY LAB</span>
              </h2>
              <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                Un laboratorio interactivo donde aprendes finanzas e inversiones <strong className="text-white">jugando</strong>. Cada módulo tiene un video + una actividad práctica que transforma tu mentalidad financiera en tiempo real.
              </p>
            </div>
          </FadeIn>

          {/* 3 Phases */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              {
                phase: 'FASE 1', title: 'DESPERTAR', color: '#3b82f6', emoji: '🧬',
                modules: ['Tu ADN Financiero', 'Gastos Hormiga', 'Termostato Financiero', 'Trampas del Dinero'],
                desc: 'Descubre tu perfil, identifica fugas invisibles de dinero y rompe los sesgos que te sabotean.'
              },
              {
                phase: 'FASE 2', title: 'DOMINIO', color: '#8b5cf6', emoji: '📋',
                modules: ['Mi Primer PEDEM', 'Mis Emociones'],
                desc: 'Construye tu framework de planificación profesional y domina tu psicología financiera.'
              },
              {
                phase: 'FASE 3', title: 'INTEGRACIÓN', color: '#00E676', emoji: '⚡',
                modules: ['Reto del Flow'],
                desc: 'Activa el estado de máximo rendimiento y desbloquea el simulador de opciones avanzado.'
              },
            ].map((p, i) => (
              <FadeIn key={i} delay={i * 0.15}>
                <div className="glass-panel p-6 rounded-2xl h-full flex flex-col border-t-2" style={{ borderTopColor: `${p.color}60` }}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{p.emoji}</span>
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: p.color }}>{p.phase}</p>
                      <h3 className="text-lg font-black uppercase tracking-tight text-white">{p.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-white/50 leading-relaxed mb-4 flex-1">{p.desc}</p>
                  <div className="space-y-2">
                    {p.modules.map((m, j) => (
                      <div key={j} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 size={14} style={{ color: p.color }} />
                        <span className="text-white/70">{m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* App Mockup + Simulator Preview */}
          <FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="text-center">
                <img
                  src="/images/landing/app_mockup.png"
                  alt="GENY LAB - Ruta de aprendizaje gamificada"
                  className="rounded-2xl shadow-[0_0_60px_rgba(0,209,255,0.1)] border border-white/10 mx-auto max-w-sm w-full"
                />
                <p className="text-white/30 text-xs font-mono mt-3 uppercase tracking-widest">Ruta Gamificada</p>
              </div>
              <div className="text-center">
                <img
                  src="/images/landing/simulator_preview.png"
                  alt="GENY LAB - Simulador de opciones"
                  className="rounded-2xl shadow-[0_0_60px_rgba(0,230,118,0.1)] border border-white/10 mx-auto w-full"
                />
                <p className="text-white/30 text-xs font-mono mt-3 uppercase tracking-widest">Simulador de Opciones</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════ SECTION 4: QUÉ INCLUYE ═══════ */}
      <section className="py-20 md:py-32 relative">
        <div className="relative z-10 max-w-5xl mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-14">
              <p className="text-xs font-mono uppercase tracking-[0.3em] text-[#00E676]/80 mb-3">📦 QUÉ INCLUYE</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight">
                Todo lo que obtienes <span className="text-[#00E676]">hoy</span>
              </h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Target, title: '7 Módulos Interactivos', desc: 'Videos + actividades prácticas que transforman tu mentalidad financiera paso a paso.', color: '#00D1FF' },
              { icon: BarChart3, title: 'Simulador de Opciones', desc: 'Practica trading de opciones con dinero virtual y un coach IA que te guía en cada operación.', color: '#00E676' },
              { icon: Bot, title: 'Coach IA Personalizado', desc: 'Inteligencia artificial que analiza cada decisión y te da feedback en tiempo real.', color: '#8b5cf6' },
              { icon: Gamepad2, title: 'Gamificación Completa', desc: 'XP, niveles, racha, logros y misiones. Aprender inversiones nunca fue tan adictivo.', color: '#f59e0b' },
              { icon: BookOpen, title: '11 Lecciones de Opciones', desc: 'Desde "¿Qué es una opción?" hasta spreads verticales y cash-secured puts.', color: '#3b82f6' },
              { icon: GraduationCap, title: 'Diagnóstico Financiero', desc: 'Al completar todo, desbloqueas tu diagnóstico financiero completo personalizado.', color: '#00E676' },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div className="glass-panel p-6 rounded-2xl h-full">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: `${item.color}12`, border: `1px solid ${item.color}25` }}>
                    <item.icon size={20} style={{ color: item.color }} />
                  </div>
                  <h3 className="font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ SECTION 5: DIFERENCIADORES ═══════ */}
      <section className="py-20 md:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00D1FF]/[0.015] to-transparent" />
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-14">
              <p className="text-xs font-mono uppercase tracking-[0.3em] text-[#00D1FF]/80 mb-3">🔥 LA DIFERENCIA</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight">
                Esto no es otro curso <span className="text-[#00D1FF]">aburrido</span>
              </h2>
            </div>
          </FadeIn>

          <div className="space-y-4">
            {[
              ['Ver videos de 3 horas sin práctica', 'Actividades interactivas que haces en tu celular'],
              ['Teoría genérica que no aplicas', 'Retos personalizados basados en TU perfil financiero'],
              ['Motivación que dura 3 días', 'Sistema gamificado con XP, niveles y rachas diarias'],
              ['Dudas sin resolver', 'Coach IA que responde en tiempo real'],
              ['Miedo a practicar con dinero real', 'Simulador con $25,000 virtuales para operar sin riesgo'],
            ].map(([bad, good], i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-0">
                  <div className="flex items-center gap-3 px-5 py-4 rounded-xl md:rounded-r-none bg-red-500/[0.06] border border-red-500/10">
                    <X size={16} className="text-red-400 shrink-0" />
                    <span className="text-sm text-red-300/80 line-through decoration-red-400/30">{bad}</span>
                  </div>
                  <div className="flex items-center gap-3 px-5 py-4 rounded-xl md:rounded-l-none bg-[#00E676]/[0.06] border border-[#00E676]/10">
                    <CheckCircle2 size={16} className="text-[#00E676] shrink-0" />
                    <span className="text-sm text-white/80 font-medium">{good}</span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ SECTION 6: TESTIMONIOS (Placeholder) ═══════ */}
      <section className="py-20 md:py-32 relative">
        <div className="relative z-10 max-w-5xl mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-14">
              <p className="text-xs font-mono uppercase tracking-[0.3em] text-[#f59e0b]/80 mb-3">⭐ RESULTADOS</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight">
                Lo que dicen nuestros <span className="text-[#f59e0b]">estudiantes</span>
              </h2>
            </div>
          </FadeIn>

          {/* Placeholder testimonials - replace with real ones */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col items-center text-center gap-4">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(s => <Star key={s} size={16} className="text-[#f59e0b] fill-[#f59e0b]" />)}
                  </div>
                  <p className="text-white/40 text-sm italic leading-relaxed">"Testimonio próximamente..."</p>
                  <div className="flex items-center gap-3 mt-auto pt-4 border-t border-white/5 w-full justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10" />
                    <div className="text-left">
                      <p className="text-white/30 text-sm font-bold">Nombre</p>
                      <p className="text-white/20 text-xs">País</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ SECTION 7: PRICING / OFERTA ═══════ */}
      <section className="py-20 md:py-32 relative" id="precio">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00E676]/[0.02] to-transparent" />
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-10">
              <p className="text-xs font-mono uppercase tracking-[0.3em] text-[#00E676]/80 mb-3">🎁 OFERTA ESPECIAL</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight">
                Acceso completo a <span className="text-[#00E676]">GENY LAB</span>
              </h2>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="glass-panel rounded-3xl overflow-hidden border border-[#00E676]/20 shadow-[0_0_80px_rgba(0,230,118,0.08)]">
              {/* Top gradient bar */}
              <div className="h-1 bg-gradient-to-r from-[#00D1FF] via-[#00E676] to-[#f59e0b]" />

              <div className="p-8 md:p-12 space-y-8">
                {/* Timer */}
                <div className="flex items-center justify-center gap-2 text-sm">
                  <Clock size={16} className="text-[#f59e0b]" />
                  <span className="text-[#f59e0b] font-mono font-bold">
                    Oferta termina en: {String(timeLeft.h).padStart(2, '0')}:{String(timeLeft.m).padStart(2, '0')}:{String(timeLeft.s).padStart(2, '0')}
                  </span>
                </div>

                {/* Value Stack */}
                <div className="space-y-3">
                  {[
                    ['7 Módulos Interactivos de Educación Financiera', '$500'],
                    ['Simulador de Opciones con $25,000 virtuales', '$800'],
                    ['Coach IA Personalizado', '$500'],
                    ['11 Lecciones de Opciones Financieras', '$400'],
                    ['Sistema de Gamificación + Logros', '$200'],
                    ['Diagnóstico Financiero Completo', '$300'],
                    ['Acceso de por vida + actualizaciones', '$300'],
                  ].map(([item, val], i) => (
                    <div key={i} className="flex items-center justify-between gap-4 py-2 border-b border-white/5 last:border-0">
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
                  <p className="text-white/40 text-sm mb-2">Valor total:</p>
                  <p className="text-3xl font-black text-white/30 line-through decoration-red-400/50 decoration-2">$3,000 USD</p>
                </div>

                {/* Real price */}
                <div className="text-center">
                  <p className="text-white/60 text-sm mb-1">Hoy obtienes todo por solo:</p>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-6xl md:text-7xl font-black bg-gradient-to-r from-[#00D1FF] to-[#00E676] bg-clip-text text-transparent">$67</span>
                    <span className="text-xl text-white/40 font-bold">USD</span>
                  </div>
                  <p className="text-[#00E676] font-mono text-sm font-bold mt-2">Ahorras $2,933 USD (97% de descuento)</p>
                </div>

                {/* CTA */}
                <div className="text-center pt-4">
                  <CTAButton large className="w-full max-w-md mx-auto" />
                  <div className="flex items-center justify-center gap-6 mt-6 text-xs text-white/30">
                    <span className="flex items-center gap-1.5"><Lock size={12} /> Pago seguro</span>
                    <span className="flex items-center gap-1.5"><Zap size={12} /> Acceso inmediato</span>
                    <span className="flex items-center gap-1.5"><Users size={12} /> +100 alumnos</span>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════ SECTION 8: FAQ ═══════ */}
      <section className="py-20 md:py-32 relative">
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
            <FadeIn><FAQItem q="¿Necesito experiencia previa en inversiones?" a="No, absolutamente ninguna. GENY LAB está diseñado desde cero para personas que nunca han tocado un gráfico. Empezamos por descubrir tu perfil financiero y te llevamos paso a paso hasta que domines conceptos avanzados como opciones financieras." /></FadeIn>
            <FadeIn delay={0.05}><FAQItem q="¿Cuánto tiempo necesito dedicarle?" a="Cada módulo toma entre 15-30 minutos. Puedes avanzar a tu ritmo. El sistema de gamificación te motiva con rachas diarias, pero no hay presión. Todo el contenido está disponible 24/7." /></FadeIn>
            <FadeIn delay={0.1}><FAQItem q="¿Es solo teoría o puedo practicar?" a="GENY LAB es 100% práctico. Cada lección tiene una actividad interactiva, y al completar todos los módulos desbloqueas un simulador de trading de opciones con $25,000 virtuales y un coach IA que te guía en tiempo real." /></FadeIn>
            <FadeIn delay={0.15}><FAQItem q="¿Funciona en celular?" a="Sí, GENY LAB es 100% responsive. Funciona perfectamente en celular, tablet y computadora. Solo necesitas un navegador web — no hay apps que descargar." /></FadeIn>
            <FadeIn delay={0.2}><FAQItem q="¿Cómo accedo después de pagar?" a="Inmediatamente después de tu pago, recibirás un correo con tu enlace de acceso personalizado. Haces clic, estableces tu contraseña y entras directo al laboratorio. Todo en menos de 2 minutos." /></FadeIn>
            <FadeIn delay={0.25}><FAQItem q="¿El acceso es de por vida?" a="Sí, pagas una sola vez y tienes acceso permanente a todo el contenido actual y futuras actualizaciones. Sin suscripciones mensuales ni cargos adicionales." /></FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════ SECTION 9: FINAL CTA ═══════ */}
      <section className="py-20 md:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-[#00D1FF]/[0.03] to-transparent" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <FadeIn>
            <div className="space-y-6">
              <img src="/images/78.png" alt="GENY LAB" className="w-40 md:w-52 mx-auto object-contain opacity-80" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight">
                Tu futuro financiero<br />
                <span className="bg-gradient-to-r from-[#00D1FF] to-[#00E676] bg-clip-text text-transparent">empieza hoy</span>
              </h2>
              <p className="text-white/50 text-base md:text-lg max-w-xl mx-auto">
                No necesitas ser experto. No necesitas miles de dólares. Solo necesitas dar el primer paso. GENY LAB hace el resto.
              </p>
              <div className="pt-4 space-y-4">
                <CTAButton large />
                <p className="text-white/20 text-xs font-mono uppercase tracking-widest">
                  Pago único · Sin suscripciones · Acceso de por vida
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
