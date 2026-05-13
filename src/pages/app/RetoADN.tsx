// @ts-nocheck
import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Dna, ChevronRight, RotateCcw, Share2, Copy, Check,
  ShieldCheck, Hammer, BarChart3, Crosshair, Rocket, Trophy,
  MessageCircle, Link2, ExternalLink, ArrowLeft
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

import confetti from "canvas-confetti";

/* ═══════════════════════════════════════════════════════════════════════════
   PROFILES
   ═══════════════════════════════════════════════════════════════════════════ */

const PROFILES: Record<string, any> = {
  G: {
    name: "Guardián", emoji: "🛡️", tagline: "El Protector del Capital", color: "#3b82f6",
    icon: ShieldCheck,
    description: "Tu ADN financiero está programado para proteger. Valoras la seguridad sobre el rendimiento y tomas decisiones calculadas con visión de largo plazo conservador. Eres el pilar financiero de tu familia.",
    traits: ["Alta aversión al riesgo", "Fondo de emergencia robusto", "Preferencia por activos seguros", "Mentalidad de preservación de capital"],
    cta: "Descubre cómo proteger Y hacer crecer tu capital con GENY LAB"
  },
  C: {
    name: "Constructor", emoji: "🏗️", tagline: "El Arquitecto del Largo Plazo", color: "#8b5cf6",
    icon: Hammer,
    description: "Eres paciente, disciplinado y confías en el poder del interés compuesto. Tu ADN entiende que la riqueza se construye ladrillo a ladrillo, con consistencia y sin atajos.",
    traits: ["Mentalidad de largo plazo", "Disciplina en la inversión", "Reinversión sistemática", "Resistencia emocional ante la volatilidad"],
    cta: "Aprende a acelerar tu construcción de riqueza con GENY LAB"
  },
  E: {
    name: "Estratega", emoji: "📊", tagline: "El Cuantitativo del Mercado", color: "#f59e0b",
    icon: BarChart3,
    description: "Tus decisiones se basan en datos, no en emociones. Tu ADN es el de un cuantitativo puro: analizas, modelas, haces backtesting y ejecutas con precisión.",
    traits: ["Pensamiento analítico avanzado", "Proceso sobre intuición", "Gestión de riesgo rigurosa", "Mejora continua y documentación"],
    cta: "Lleva tu sistema al siguiente nivel con las herramientas de GENY LAB"
  },
  H: {
    name: "Cazador", emoji: "🎯", tagline: "El Agresivo del Momentum", color: "#ef4444",
    icon: Crosshair,
    description: "Vives para la oportunidad. Tu ADN está calibrado para identificar y ejecutar en movimientos de alto impacto. Eres rápido, decisivo y aceptas el riesgo como parte del juego.",
    traits: ["Alta tolerancia al riesgo", "Pensamiento de alta velocidad", "Foco en retornos asimétricos", "Ejecución bajo presión"],
    cta: "Domina el timing y la ejecución con la metodología GENY LAB"
  },
  K: {
    name: "Emprendedor", emoji: "🚀", tagline: "El Creador de Activos", color: "#10b981",
    icon: Rocket,
    description: "Tu riqueza viene de crear, no solo de invertir. Tu ADN construye sistemas, negocios y activos que generan flujos. Ves el dinero como un recurso para multiplicar tu impacto.",
    traits: ["Visión de flujos pasivos", "Mentalidad de activos propios", "Alta tolerancia a la incertidumbre", "Pensamiento de escala y sistema"],
    cta: "Combina tu espíritu emprendedor con estrategias de inversión en GENY LAB"
  }
};

/* ═══════════════════════════════════════════════════════════════════════════
   QUESTIONS
   ═══════════════════════════════════════════════════════════════════════════ */

const RAW_QUESTIONS = [
  { q: "Si tuvieras $10,000 para invertir hoy, ¿qué harías primero?", options: [
    { text: "Los pondría en CDTs o bonos del gobierno, sin dudar", p: "G" },
    { text: "ETF indexado global y los olvido por 10 años", p: "C" },
    { text: "Analizaría datos históricos antes de distribuirlos", p: "E" },
    { text: "Opciones o criptos con potencial explosivo", p: "H" },
    { text: "Capital semilla para iniciar o escalar un negocio", p: "K" }]},
  { q: "El mercado cae 25% en un mes. ¿Cuál es tu primera reacción?", options: [
    { text: "Salgo inmediatamente y pongo todo en efectivo", p: "G" },
    { text: "No hago nada. Confío en el largo plazo", p: "C" },
    { text: "Reviso mi modelo de riesgo y ajusto exposición", p: "E" },
    { text: "Compro agresivamente. Es la oportunidad del año", p: "H" },
    { text: "Me concentro en generar más ingresos con mi negocio", p: "K" }]},
  { q: "¿Cuánto tiempo dedicas al análisis financiero por semana?", options: [
    { text: "Menos de 1 hora. Prefiero algo automático y seguro", p: "G" },
    { text: "2-3 horas revisando mi portafolio de largo plazo", p: "C" },
    { text: "10+ horas analizando datos y haciendo backtesting", p: "E" },
    { text: "Estoy pendiente del mercado casi todo el día", p: "H" },
    { text: "Mi foco es el negocio, las finanzas son secundarias", p: "K" }]},
  { q: "Para ti, la libertad financiera significa...", options: [
    { text: "No deber nada y tener un fondo de emergencia enorme", p: "G" },
    { text: "Vivir de dividendos e intereses sin trabajar", p: "C" },
    { text: "Un sistema automatizado que supere al mercado", p: "E" },
    { text: "Ganar en semanas lo que otros ganan en un año", p: "H" },
    { text: "Mis activos y negocios trabajando mientras yo duermo", p: "K" }]},
  { q: "Pierdes el 30% en una inversión. ¿Qué haces?", options: [
    { text: "Pánico. Cierro todo y no vuelvo a invertir ahí", p: "G" },
    { text: "Lo acepto. Las caídas son parte natural del ciclo", p: "C" },
    { text: "Analizo qué falló en mi modelo y lo corrijo", p: "E" },
    { text: "Doblo si el análisis sigue siendo válido", p: "H" },
    { text: "Pivoteo hacia una oportunidad de negocio mejor", p: "K" }]},
  { q: "¿Cuál de estos activos te genera más confianza?", options: [
    { text: "Oro, finca raíz o propiedades físicas", p: "G" },
    { text: "S&P 500 o ETFs globales diversificados", p: "C" },
    { text: "Portafolio cuantitativo con modelos propios", p: "E" },
    { text: "Acciones de crecimiento, opciones o criptos", p: "H" },
    { text: "Mi propio negocio o activos que yo controlo", p: "K" }]},
  { q: "¿Cuál es tu horizonte de inversión principal?", options: [
    { text: "Más de 20 años. Ese dinero es intocable", p: "G" },
    { text: "10-20 años con reinversión constante de dividendos", p: "C" },
    { text: "3-5 años con rebalanceo sistemático", p: "E" },
    { text: "Días, semanas o pocos meses máximo", p: "H" },
    { text: "Reinvierto constantemente en escalar mi negocio", p: "K" }]},
  { q: "¿Cómo describes tu relación con el dinero?", options: [
    { text: "Es seguridad y protección para mi familia", p: "G" },
    { text: "Es una semilla que planto y dejo crecer sola", p: "C" },
    { text: "Es un recurso que gestiono con datos y disciplina", p: "E" },
    { text: "Es munición. Entre más rápido lo muevo, mejor", p: "H" },
    { text: "Es combustible para crear y escalar proyectos", p: "K" }]},
  { q: "Un amigo te da un 'tip' de inversión caliente. Tú...", options: [
    { text: "Lo ignoro. Prefiero lo probado y predecible", p: "G" },
    { text: "Solo si encaja con mi estrategia de largo plazo", p: "C" },
    { text: "Lo backtest antes de siquiera considerarlo", p: "E" },
    { text: "Me emociono y busco el punto de entrada rápido", p: "H" },
    { text: "Me pregunto si hay oportunidad de negocio detrás", p: "K" }]},
  { q: "Tu mayor miedo financiero es...", options: [
    { text: "Perder todo lo que he ahorrado con tanto sacrificio", p: "G" },
    { text: "No tener suficiente dinero para el retiro", p: "C" },
    { text: "Tomar decisiones importantes sin suficiente información", p: "E" },
    { text: "Perderme la gran oportunidad de mi vida", p: "H" },
    { text: "Seguir dependiendo de un jefe o un empleo para siempre", p: "K" }]},
  { q: "¿Cuánto riesgo estás dispuesto a asumir?", options: [
    { text: "Mínimo. Prefiero rentabilidades bajas pero seguras", p: "G" },
    { text: "Moderado. Acepto volatilidad si es a largo plazo", p: "C" },
    { text: "Calculado. El riesgo siempre debe ser cuantificable", p: "E" },
    { text: "Alto. Sin riesgo no hay recompensa extraordinaria", p: "H" },
    { text: "Variable según el potencial real del proyecto", p: "K" }]},
  { q: "¿Qué concepto financiero resuena más contigo?", options: [
    { text: "\"Págate a ti mismo primero\" — ahorra antes de gastar", p: "G" },
    { text: "\"El tiempo en el mercado supera al timing del mercado\"", p: "C" },
    { text: "\"Lo que no se puede medir, no se puede mejorar\"", p: "E" },
    { text: "\"El mejor momento para entrar es ahora mismo\"", p: "H" },
    { text: "\"Construye activos que trabajen mientras tú duermes\"", p: "K" }]},
  { q: "Logras un retorno del 40% en una inversión. ¿Qué haces?", options: [
    { text: "Lo transfiero inmediatamente a mi fondo seguro", p: "G" },
    { text: "Lo reinvierto automáticamente para el largo plazo", p: "C" },
    { text: "Documento si fue sistema o suerte antes de reinvertir", p: "E" },
    { text: "Busco la siguiente oportunidad grande de inmediato", p: "H" },
    { text: "Lo reinvierto en escalar mi negocio o proyecto", p: "K" }]},
  { q: "¿Qué herramienta usas o usarías más para tus finanzas?", options: [
    { text: "Calculadora de CDTs y comparador de tasas bancarias", p: "G" },
    { text: "Portfolio tracker con dividendos reinvertidos automáticos", p: "C" },
    { text: "Python, Excel avanzado o TradingView con indicadores", p: "E" },
    { text: "Bróker activo con ejecución rápida y opciones", p: "H" },
    { text: "CRM, flujo de caja y proyecciones de negocio", p: "K" }]},
  { q: "En 10 años, ¿cómo te imaginas financieramente?", options: [
    { text: "Sin deudas, fondo enorme y viviendo completamente tranquilo", p: "G" },
    { text: "Portafolio que genera dividendos que cubren todos mis gastos", p: "C" },
    { text: "Sistema de inversión automatizado que supera al mercado", p: "E" },
    { text: "Haber capturado varios ciclos explosivos del mercado", p: "H" },
    { text: "Múltiples negocios y activos generando flujos pasivos", p: "K" }]}
];

const PROFILE_ORDER = [
  { key: "G", label: "Guardián", emoji: "🛡️" },
  { key: "C", label: "Constructor", emoji: "🏗️" },
  { key: "E", label: "Estratega", emoji: "📊" },
  { key: "H", label: "Cazador", emoji: "🎯" },
  { key: "K", label: "Emprendedor", emoji: "🚀" },
];

const LETTERS = ["A", "B", "C", "D", "E"];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ═══════════════════════════════════════════════════════════════════════════
   DNA CANVAS ANIMATION
   ═══════════════════════════════════════════════════════════════════════════ */

function DNACanvas({ size = 120 }: { size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let t = 0, raf: number;
    function draw() {
      ctx.clearRect(0, 0, size, size);
      for (let i = 0; i < 14; i++) {
        const y = (i / 14) * size;
        const phase = (y / size) * Math.PI * 4 + t;
        const x1 = size / 2 + Math.sin(phase) * (size * 0.24);
        const x2 = size / 2 + Math.sin(phase + Math.PI) * (size * 0.24);
        const alpha = 0.25 + 0.75 * Math.abs(Math.cos(phase * 0.5));
        ctx.beginPath();
        ctx.strokeStyle = `rgba(0,209,255,${alpha * 0.5})`;
        ctx.lineWidth = 1.5;
        ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
        ctx.beginPath(); ctx.arc(x1, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,209,255,${alpha})`; ctx.fill();
        ctx.beginPath(); ctx.arc(x2, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,230,118,${alpha * 0.85})`; ctx.fill();
      }
      t += 0.03;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [size]);
  return <canvas ref={ref} width={size} height={size} className="mx-auto" />;
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

export default function RetoADN() {
  const user = { id: "local-user" };
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState<"welcome" | "quiz" | "result">("welcome");
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [scores, setScores] = useState({ G: 0, C: 0, E: 0, H: 0, K: 0 });
  const [copied, setCopied] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [showInviteSheet, setShowInviteSheet] = useState(false);
  const [questions] = useState(() => RAW_QUESTIONS.map(q => ({ ...q, options: shuffle(q.options) })));

  // ── Load from Supabase ──
  useEffect(() => {
    setLoading(false);
  }, []);

  // ── Save to Supabase ──
  const saveState = async (overrides: any = {}) => {
    // Local memory only
  };

  const reset = () => {
    setScreen("welcome");
    setQIdx(0);
    setSelected(null);
    setScores({ G: 0, C: 0, E: 0, H: 0, K: 0 });
  };

  const handleNext = () => {
    if (selected === null) return;
    const p = questions[qIdx].options[selected].p;
    const newScores = { ...scores, [p]: scores[p] + 1 };
    setScores(newScores);
    setSelected(null);
    if (qIdx < 14) {
      setQIdx(qIdx + 1);
    } else {
      setScreen("result");
      saveState({ scores: newScores, screen: 'result' });
      setTimeout(() => confetti({ particleCount: 120, spread: 70, origin: { y: 0.5 }, colors: ['#00D1FF', '#00E676', '#FEDD04', '#f59e0b'] }), 300);
    }
  };

  const winner = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  const prof = PROFILES[winner];
  const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
  const progress = ((qIdx + (selected !== null ? 0.5 : 0)) / 15) * 100;

  // ── Share helpers ──
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Participante';
  const sharePayload = btoa(JSON.stringify({ p: winner, n: userName }));
  const shareUrl = `https://lab.ingresarios.net/adn/${sharePayload}`;
  const enrollUrl = `https://lab.ingresarios.net/?utm_source=share_adn_financiero&utm_medium=social&utm_campaign=reto-2k-20k&utm_term=resultado-compartido&utm_content=${encodeURIComponent(userName)}_${winner}`;
  const shareText = `🧬 Mi ADN Financiero es: ${prof.emoji} ${prof.name} — "${prof.tagline}"\n\n¿Cuál es el tuyo? Descúbrelo en GENY LAB (toma 5 min):\n${shareUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shareTwitter = () => {
    const text = `🧬 Mi ADN Financiero es: ${prof.emoji} ${prof.name} — "${prof.tagline}"\n\n¿Cuál es el tuyo? → `;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopy = handleCopyText;

  // ── Invite-a-friend share helpers ──
  const inviteText = `🧬 Acabo de descubrir mi ADN Financiero en GENY LAB y quiero que tú también lo descubras.\n\nEs un test de 5 minutos que revela cómo piensas con el dinero. Yo soy ${prof?.emoji} ${prof?.name} — ¿y tú?\n\nRegístrate aquí → ${enrollUrl}`;

  const inviteWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(inviteText)}`, '_blank', 'noopener,noreferrer');
  };
  const inviteFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(enrollUrl)}&quote=${encodeURIComponent(inviteText)}`, '_blank', 'noopener,noreferrer');
  };
  const inviteTwitter = () => {
    const t = `🧬 Descubrí mi ADN Financiero: ${prof?.emoji} ${prof?.name}\n\n¿Cuál es el tuyo? → `;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(t)}&url=${encodeURIComponent(enrollUrl)}`, '_blank', 'noopener,noreferrer');
  };
  const handleCopyInvite = () => {
    navigator.clipboard.writeText(inviteText);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2500);
  };

  /* ═══ LOADING ═══ */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
            <Dna className="w-8 h-8 text-brand-blue" />
          </motion.div>
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted">Cargando ADN...</p>
        </div>
      </div>
    );
  }

  /* ═══ WELCOME ═══ */
  if (screen === "welcome") {
    return (
      <div className="max-w-5xl mx-auto pb-12">
        <Link
          to="/app/actividades"
          className="inline-flex items-center gap-2 text-brand-text-muted hover:text-white transition-colors uppercase font-black text-xs tracking-[0.2em] mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a Actividades
        </Link>
        <div className="min-h-[70vh] flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            {/* Left side */}
            <div className="space-y-6 text-center md:text-left">
              <DNACanvas size={160} />
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue mb-2">GENY LAB</p>
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-none">
                  Reto <br className="hidden md:block" />
                  <span className="title-highlight">ADN</span> Financiero
                </h1>
              </div>
              <p className="text-brand-text-muted text-base md:text-lg leading-relaxed max-w-sm mx-auto md:mx-0">
                15 preguntas · 5 minutos · Un diagnóstico que cambiará cómo ves tu dinero
              </p>
            </div>

            {/* Right side */}
            <div className="glass-card p-10 text-center space-y-8 flex flex-col justify-center h-full border-t-2 border-t-brand-blue/40 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/8 via-transparent to-brand-green/5 pointer-events-none" />
              <div className="relative z-10 space-y-6">
                <p className="text-brand-text-muted/80 text-sm font-medium">
                  Descubre cuál de los 5 ADN Financieros define tu perfil:
                </p>
                
                <div className="grid grid-cols-2 gap-3 pt-2 text-left">
                  {PROFILE_ORDER.map((p, i) => (
                    <div key={p.key} className={`flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 ${i === 4 ? 'col-span-2 justify-center' : ''}`}>
                      <span className="text-2xl">{p.emoji}</span>
                      <span className="text-xs font-black tracking-widest text-brand-text-muted/80 uppercase">{p.label}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setScreen("quiz"); saveState({ screen: 'quiz' }); }}
                    className="w-full px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-sm bg-gradient-to-r from-brand-blue to-cyan-500 text-white shadow-[0_0_25px_rgba(0,209,255,0.3)] hover:shadow-[0_0_40px_rgba(0,209,255,0.5)] transition-all"
                  >
                    DESCUBRIR MI ADN →
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ═══ QUIZ ═══ */
  if (screen === "quiz") {
    const q = questions[qIdx];
    return (
      <div className="max-w-xl mx-auto space-y-4 pb-12">
        {/* Header */}
        <div className="glass-card p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue">ADN Financiero</span>
            <span className="text-xs font-bold text-brand-text-muted">{qIdx + 1} / 15</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-brand-blue to-brand-green rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={qIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <div className="glass-card p-5">
              <p className="text-[9px] font-black uppercase tracking-widest text-amber-400 mb-2">Pregunta {qIdx + 1}</p>
              <h2 className="text-base md:text-lg font-bold leading-relaxed">{q.q}</h2>
            </div>

            {/* Options */}
            <div className="space-y-2.5">
              {q.options.map((opt, i) => {
                const isSelected = selected === i;
                return (
                  <motion.button
                    key={i}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelected(i)}
                    className={`w-full text-left glass-card p-4 flex items-center gap-3.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-brand-blue/50 bg-brand-blue/8 shadow-[0_0_15px_rgba(0,209,255,0.1)]'
                        : 'hover:border-white/15 hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 transition-all ${
                      isSelected
                        ? 'bg-brand-blue text-white'
                        : 'bg-white/5 text-brand-text-muted'
                    }`}>
                      {LETTERS[i]}
                    </div>
                    <span className={`text-sm leading-relaxed transition-colors ${
                      isSelected ? 'text-white' : 'text-brand-text-muted'
                    }`}>
                      {opt.text}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Next Button */}
            <div className="text-center pt-2">
              <motion.button
                whileHover={selected !== null ? { scale: 1.03 } : {}}
                whileTap={selected !== null ? { scale: 0.97 } : {}}
                onClick={handleNext}
                disabled={selected === null}
                className={`px-8 py-3.5 rounded-xl font-black uppercase tracking-widest text-sm transition-all ${
                  selected !== null
                    ? 'bg-gradient-to-r from-brand-blue to-cyan-500 text-white shadow-[0_0_20px_rgba(0,209,255,0.25)] cursor-pointer'
                    : 'bg-white/5 text-brand-text-muted/40 cursor-not-allowed'
                }`}
              >
                {qIdx < 14 ? (
                  <span className="flex items-center gap-2">Siguiente <ChevronRight className="w-4 h-4" /></span>
                ) : (
                  '🧬 Ver mi ADN'
                )}
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  /* ═══ RESULT ═══ */
  const ProfileIcon = prof.icon;
  return (
    <>
    <div className="max-w-6xl mx-auto pb-12">
      {/* Results Title & Main CTA */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-brand-green/10 border border-brand-green/20 p-6 rounded-2xl relative overflow-hidden mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-green/10 to-transparent -translate-x-full animate-shimmer" />
        <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white relative z-10 text-center md:text-left">
          Resultados ADN Financiero
        </h2>
        <button
          onClick={() => navigate('/app/leccion/adn?action=complete')}
          className="btn-primary w-full md:w-auto px-8 py-4 rounded-xl text-sm md:text-base font-black uppercase tracking-[0.15em] flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(1,228,126,0.4)] hover:shadow-[0_0_40px_rgba(1,228,126,0.6)] hover:scale-105 transition-all relative z-10 group overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-2">
            Completar Actividad
            <ChevronRight className="w-5 h-5" />
          </span>
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-shimmer" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Profile Card & Info */}
        <div className="lg:col-span-5 space-y-6">
          {/* Header Result */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-10 text-center space-y-6 border-t-2 relative overflow-hidden h-full flex flex-col justify-center min-h-[400px]"
            style={{ borderTopColor: `${prof.color}60` }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at top, ${prof.color}10, transparent 70%)` }} />
            <div className="relative z-10 space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue">Tu resultado</p>
              <div className="text-6xl md:text-8xl">{prof.emoji}</div>
              <p className="text-xs md:text-sm font-black uppercase tracking-widest" style={{ color: prof.color }}>{prof.tagline}</p>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
                ADN <br/><span style={{ color: prof.color }}>{prof.name}</span>
              </h1>
              <div className="w-14 h-0.5 rounded-full mx-auto" style={{ background: prof.color }} />
            </div>
          </motion.div>
        </div>

        {/* Right Column: Traits, Distribution, CTA */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Description & Traits */}
            <div className="space-y-6 flex flex-col">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="glass-card p-6 flex-grow">
                <p className="text-sm md:text-base text-slate-300 leading-relaxed font-medium">{prof.description}</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="glass-card p-6 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">Rasgos de tu ADN</p>
                {prof.traits.map((t: string) => (
                  <div key={t} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: prof.color }} />
                    <span className="text-sm font-medium text-slate-300">{t}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Distribution */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="glass-card p-6 space-y-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">Tu distribución de ADN</p>
              <div className="space-y-4">
                {PROFILE_ORDER.map(pr => {
                  const pct = Math.round((scores[pr.key] / total) * 100);
                  const isWinner = pr.key === winner;
                  const pColor = PROFILES[pr.key].color;
                  return (
                    <div key={pr.key} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className={`text-sm ${isWinner ? 'font-bold text-white' : 'text-brand-text-muted font-medium'}`}>
                          {pr.emoji} {pr.label}
                        </span>
                        <span className={`text-xs font-black font-mono ${isWinner ? '' : 'text-brand-text-muted/50'}`}
                          style={isWinner ? { color: pColor } : {}}>
                          {pct}%
                        </span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{ background: isWinner ? pColor : '#2d3748' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CTA */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="rounded-3xl p-6 text-center space-y-4 flex flex-col justify-center"
              style={{ background: `${prof.color}08`, border: `1px solid ${prof.color}25` }}>
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">Tu camino comienza aquí</p>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-medium">
                Tu ADN financiero no es un límite — es tu punto de partida. La buena noticia: <span className="font-bold text-white">se puede reprogramar</span>.
              </p>
              <div className="pt-2 space-y-3">
                <button onClick={reset}
                  className="w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 text-brand-text-muted hover:text-white hover:bg-white/8 transition-all flex items-center justify-center gap-2">
                  <RotateCcw className="w-3.5 h-3.5" /> Repetir el test
                </button>
              </div>
            </motion.div>

            <div className="space-y-6 flex flex-col">
              {/* Share Section */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="glass-card p-6 space-y-4 flex-grow">
                <div className="flex items-center gap-2 mb-2">
                  <Share2 className="w-4 h-4 text-brand-blue" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-blue">Comparte tu resultado</p>
                </div>

                {/* Social buttons */}
                <div className="grid grid-cols-3 gap-3">
                  <motion.button
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    onClick={shareWhatsApp}
                    className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border border-white/8 bg-[#25D366]/10 hover:bg-[#25D366]/20 transition-all group"
                  >
                    <MessageCircle className="w-5 h-5 text-[#25D366]" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    onClick={shareTwitter}
                    className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border border-white/8 bg-white/5 hover:bg-white/10 transition-all group"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white/80 group-hover:fill-white" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.258 5.63 5.906-5.63Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    onClick={shareFacebook}
                    className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border border-white/8 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 transition-all group"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#1877F2]" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073c0 6.028 4.388 11.024 10.125 11.927v-8.437H7.078v-3.49h3.047V9.42c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.929-1.956 1.883v2.263h3.328l-.532 3.49h-2.796v8.437C19.612 23.097 24 18.1 24 12.073z"/>
                    </svg>
                  </motion.button>
                </div>

                <div className="flex items-center gap-2 bg-white/[0.03] border border-white/8 rounded-xl px-3 py-2 mt-2">
                  <span className="text-[10px] text-brand-text-muted/70 truncate flex-1 font-mono">{shareUrl}</span>
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={handleCopyLink}
                    className="px-2 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-brand-blue/15 text-brand-blue transition-all shrink-0"
                  >
                    {copied ? 'Copiado' : 'Copiar'}
                  </motion.button>
                </div>
              </motion.div>

              {/* Referral / Enroll CTA */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                className="rounded-2xl p-6 text-center space-y-4 border border-dashed border-white/10 bg-white/[0.02]">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">¿Conoces a alguien que debería hacer este test?</p>
                <button
                  onClick={() => setShowInviteSheet(true)}
                  className="w-full inline-flex justify-center items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest bg-gradient-to-r from-amber-500 to-amber-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Share2 className="w-4 h-4" /> Invitar a un amigo
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* ── Invite Share Sheet Modal ─────────────────────────────────────── */}
    <AnimatePresence>
      {showInviteSheet && (
        <motion.div
          key="invite-sheet"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setShowInviteSheet(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-sm glass-card p-6 space-y-5 border-amber-400/20 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 via-transparent to-transparent pointer-events-none" />

            {/* Header */}
            <div className="relative flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-400">Invitar a un amigo</p>
                <h3 className="text-lg font-black uppercase tracking-tight">Comparte el test</h3>
                <p className="text-xs text-brand-text-muted leading-relaxed">El test toma solo 5 min.</p>
              </div>
              <button
                onClick={() => setShowInviteSheet(false)}
                className="w-8 h-8 shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-text-muted hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Message preview */}
            <div className="bg-white/[0.03] border border-white/8 rounded-xl p-3 space-y-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-brand-text-muted">Mensaje de invitación</p>
              <p className="text-[11px] text-slate-300 leading-relaxed whitespace-pre-line line-clamp-5">{inviteText}</p>
            </div>

            {/* Share buttons */}
            <div className="grid grid-cols-3 gap-2.5">
              {/* WhatsApp */}
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={inviteWhatsApp}
                className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border border-white/8 bg-[#25D366]/10 hover:bg-[#25D366]/20 hover:border-[#25D366]/40 transition-all group"
              >
                <MessageCircle className="w-5 h-5 text-[#25D366]" />
                <span className="text-[10px] font-black uppercase tracking-wide text-[#25D366]/80 group-hover:text-[#25D366]">WhatsApp</span>
              </motion.button>

              {/* X / Twitter */}
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={inviteTwitter}
                className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border border-white/8 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all group"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.258 5.63 5.906-5.63Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span className="text-[10px] font-black uppercase tracking-wide text-white/60 group-hover:text-white">X / Twitter</span>
              </motion.button>

              {/* Facebook */}
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={inviteFacebook}
                className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border border-white/8 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 hover:border-[#1877F2]/40 transition-all group"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#1877F2]" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073c0 6.028 4.388 11.024 10.125 11.927v-8.437H7.078v-3.49h3.047V9.42c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.929-1.956 1.883v2.263h3.328l-.532 3.49h-2.796v8.437C19.612 23.097 24 18.1 24 12.073z"/>
                </svg>
                <span className="text-[10px] font-black uppercase tracking-wide text-[#1877F2]/80 group-hover:text-[#1877F2]"></span>
              </motion.button>
            </div>

            {/* Copy full message */}
            <button
              onClick={handleCopyInvite}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all"
              style={copiedInvite
                ? { background: 'rgba(0,230,118,0.1)', borderColor: 'rgba(0,230,118,0.3)', color: '#00E676' }
                : { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', color: '#9ca3af' }
              }
            >
              {copiedInvite
                ? <><Check className="w-4 h-4" /> ¡Mensaje copiado!</>
                : <><Copy className="w-4 h-4" /> Copiar mensaje + link</>}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  </>
  );
}
