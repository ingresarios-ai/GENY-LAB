import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import {
  ChevronLeft, CheckCircle, Share2,    Copy, Check,
  Lock, Unlock, Zap, Brain, AlertTriangle, ArrowRight, ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import { initPdfWithHeader, addPdfText, checkPageBreak } from '../../utils/pdfUtils';

import confetti from "canvas-confetti";
import {
  DAYS, PHASES, DIAG_Q, DIAG_R,
  type RouteType, type DayData
} from "./reto-sombra/constants";
import ShareModule from "../../components/ShareModule";
import ResultActions from "../../components/ResultActions";
import CompletionBanner from '../../components/CompletionBanner';
import html2canvas from 'html2canvas-pro';
// ── Helpers ──────────────────────────────────────────────────────────────────
function cx(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export default function MisEmociones() {
  const user = { id: "local-user" };
  const navigate = useNavigate();
  const userName = 'Trader'?.split(" ")[0] || "Trader";

  // ── State ──────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState<RouteType | null>(null);
  const [tasksDone, setTasksDone] = useState<Record<string, boolean>>({});
  const [completedDays, setCompletedDays] = useState<Record<number, boolean>>({});
  const [view, setView] = useState<"hero" | "diag" | "result" | "route" | "home" | "day">("hero");
  const [selDay, setSelDay] = useState<number>(1);
  const [copiedLink, setCopiedLink] = useState(false);
  const [dashTab, setDashTab] = useState<"mission" | "calendar" | "progress">("mission");
  const [shareModal, setShareModal] = useState(false);

  // Diagnostic
  const [diagAns, setDiagAns] = useState<string[]>([]);
  const [diagStep, setDiagStep] = useState(0);

  // Computed diagnostic values
  const diagScore = diagAns.length === 4
    ? Math.round((diagAns.filter(a => a === "si").length / 4) * 100)
    : 0;
  const diagLevel: string = diagScore <= 25 ? "silencio"
    : diagScore <= 50 ? "acechando"
    : diagScore <= 75 ? "operando"
    : "alMando";
  const diagResult = DIAG_R[diagLevel];

  // ── Load saved progress ────────────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem('reto-sombra-progress');
      if (saved) {
        const r = JSON.parse(saved);
        if (r.route) setRoute(r.route);
        if (r.tasksDone) setTasksDone(r.tasksDone);
        if (r.completedDays) setCompletedDays(r.completedDays);
        if (r.diagAns) {
          setDiagAns(r.diagAns);
          if (r.diagAns.length >= 4) setView('result');
        }
        if (r.view === 'home') setView('home');
      }
    } catch (e) {
      console.error('Error loading sombra progress:', e);
    }
    setLoading(false);
  }, []);

  // ── Persist to localStorage ───────────────────────────────────────────
  const saveState = async (
    newRoute = route,
    newTasks = tasksDone,
    newDays = completedDays,
    newDiagAns = diagAns,
    newView?: string,
  ) => {
    try {
      localStorage.setItem('reto-sombra-progress', JSON.stringify({
        route: newRoute,
        tasksDone: newTasks,
        completedDays: newDays,
        diagAns: newDiagAns,
        view: newView || (newRoute ? 'home' : undefined),
      }));
    } catch (e) {
      console.error('Error saving sombra progress:', e);
    }
  };

  // ── Day progression ───────────────────────────────────────────────────
  const getDayStatus = (day: number): "done" | "active" | "locked" => {
    if (completedDays[day]) return "done";
    if (day === 1) return "active";
    if (completedDays[day - 1]) return "active";
    return "locked";
  };

  // ── Select route ──────────────────────────────────────────────────────
  const selectRoute = async (r: RouteType) => {
    setRoute(r);
    setView("home");
    await saveState(r, tasksDone, completedDays, diagAns);
  };

  // ── Answer diagnostic ─────────────────────────────────────────────────
  const answerDiag = async (answer: string) => {
    const newAns = [...diagAns, answer];
    setDiagAns(newAns);
    if (newAns.length < 4) {
      setDiagStep(diagStep + 1);
    } else {
      setView("result");
      await saveState(route, tasksDone, completedDays, newAns);
    }
  };

  // ── Toggle task ───────────────────────────────────────────────────────
  const toggleTask = async (taskId: string) => {
    const newTasks = { ...tasksDone, [taskId]: !tasksDone[taskId] };
    setTasksDone(newTasks);

    const dayData = DAYS.find((d) => d.day === selDay);
    if (!dayData || !route) return;

    const exercises = dayData.routes[route].exercises;
    const allDone = exercises.every((_, i) => newTasks[`${selDay}-${i}`]);

    let newDays = { ...completedDays };
    if (allDone && !completedDays[selDay]) {
      newDays[selDay] = true;
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#f97316", "#f59e0b", "#10b981"],
      });
    } else if (!allDone && completedDays[selDay]) {
      newDays[selDay] = false;
    }

    setCompletedDays(newDays);
    await saveState(route, newTasks, newDays, diagAns);
  };

  // ── Share ─────────────────────────────────────────────────────────────
  const generateShareUrl = () => {
    const payload = {
      t: "sombra",
      n: userName,
      r: route || "novato",
      d: Object.values(completedDays).filter(Boolean).length,
    };
    return `https://reto.ingresarios.net/resultado/${btoa(JSON.stringify(payload))}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generateShareUrl());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSocialShare = (platform: "whatsapp" | "twitter" | "facebook" | "linkedin") => {
    const dayData = DAYS.find((d) => d.day === selDay);
    let sText = "Estoy desactivando mi Saboteador interior con 'Mis Emociones' de GENY LAB. Únete.";
    if (completedDays[selDay] && dayData) {
      sText = `Acabo de completar el Día ${selDay}: "${dayData.title}" de Mis Emociones. ⚔️ Otro día dominando a mi Saboteador.`;
    }
    const enc = encodeURIComponent;
    const url = enc(generateShareUrl());
    const txt = enc(sText);
    const links: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${txt}%20${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${txt}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    };
    window.open(links[platform], "_blank");
  };

  // ═══════════════════════════════════════════════════════════════════════
  // LOADING STATE
  // ═══════════════════════════════════════════════════════════════════════
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </motion.div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // VIEW: HERO (Landing with CTA → Diagnostic)
  // ═══════════════════════════════════════════════════════════════════════
  if (view === "hero") {
    const symptoms = [
      { icon: "🩸", text: "Mueves el stop loss \"solo esta vez\"" },
      { icon: "🎰", text: "Haces revenge trading después de perder" },
      { icon: "😰", text: "Cierras ganadores demasiado pronto" },
      { icon: "🧠", text: "Operas contra tu propio plan" },
    ];
    return (
      <div className="max-w-5xl mx-auto pb-12">
        <Link
          to="/app/actividades"
          className="inline-flex items-center gap-2 text-brand-text-muted hover:text-white transition-colors uppercase font-black text-xs tracking-[0.2em] mb-4"
        >
          <ChevronLeft className="w-4 h-4" /> Volver a Actividades
        </Link>
        
        <div className="min-h-[70vh] flex flex-col justify-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-12 items-center">
            
            {/* Left Column: Title & Hook */}
            <div className="space-y-8 text-center md:text-left">
              <div className="space-y-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="text-7xl md:text-8xl mb-2"
                >
                  👤
                </motion.div>
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-none">
                  <span className="bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 bg-clip-text text-transparent">
                    MIS EMOCIONES
                  </span>
                </h1>
                <p className="text-brand-text-muted font-medium text-lg md:text-xl leading-relaxed max-w-md">
                  Carl Jung descubrió que dentro de cada persona vive una segunda personalidad inconsciente. Para los traders, esto significa que en tu silla hay DOS operadores — y solo uno tiene un plan.
                </p>
              </div>

              {/* ── CTA Button ── */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setDiagStep(0); setDiagAns([]); setView("diag"); }}
                className="w-full md:w-auto cursor-pointer rounded-2xl px-8 py-5 transition-all group relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 40%, #991b1b 100%)',
                  boxShadow: '0 0 30px rgba(239,68,68,0.35), 0 0 60px rgba(239,68,68,0.15), 0 8px 24px rgba(0,0,0,0.4)',
                }}
              >
                {/* Animated shine sweep */}
                <div
                  className="absolute inset-0 skew-x-[-20deg] pointer-events-none"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                    animation: 'diag-shine 3s ease-in-out infinite',
                  }}
                />
                <style>{`@keyframes diag-shine { 0%, 100% { transform: translateX(-150%) skewX(-20deg); } 50% { transform: translateX(150%) skewX(-20deg); } }`}</style>
                <div className="relative z-10 flex flex-col items-center justify-center">
                  <span className="text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3">
                    DIAGNOSTICAR SABOTEADOR
                    <ChevronRight className="w-5 h-5" />
                  </span>
                </div>
              </motion.button>
              
              <p className="text-white/20 text-xs font-black uppercase tracking-widest">
                4 preguntas · Operación Saboteador 10 Días
              </p>
            </div>

            {/* Right Column: Symptoms & Info */}
            <div className="space-y-8 flex flex-col justify-center h-full">
              <div className="glass-card p-8 space-y-8 relative overflow-hidden flex-grow flex flex-col justify-center border-t-2 border-t-red-500/40">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/8 via-transparent to-amber-500/5 pointer-events-none" />
                <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-red-500/10 blur-[60px] pointer-events-none" />

                <div className="relative z-10 space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <h2 className="text-xs font-black text-red-500 uppercase tracking-[0.3em]">Pregunta Incómoda</h2>
                      <p className="text-[10px] text-brand-text-muted uppercase tracking-widest">Basado en Carl Jung</p>
                    </div>
                  </div>

                  <blockquote className="border-l-4 border-red-500/40 pl-5 py-1">
                    <p className="text-sm md:text-base text-white font-medium leading-relaxed">
                      ¿Por qué pierdes cuando <span className="text-red-500 font-black">SABES</span> que vas a ganar?
                      <br />
                      ¿Por qué ignoras tu plan cuando lo <span className="text-emerald-500 font-black">DISEÑASTE</span> tú?
                    </p>
                  </blockquote>

                  {/* ── Symptoms Grid ── */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
                      <span className="text-red-400 text-[10px] font-black uppercase tracking-[0.3em] whitespace-nowrap text-center">Señales del Saboteador</span>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {symptoms.map((s, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                          className="bg-white/5 p-3 rounded-xl flex items-center gap-4 border-l-4 border-l-red-500/30"
                        >
                          <span className="text-xl shrink-0">{s.icon}</span>
                          <span className="text-slate-300 text-sm font-medium">{s.text}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // VIEW: DIAGNOSTIC (4 questions)
  // ═══════════════════════════════════════════════════════════════════════
  if (view === "diag") {
    const q = DIAG_Q[diagStep];
    const options = [
      { label: "Sí, lo he hecho", value: "si", color: "red-500" },
      { label: "A veces", value: "aveces", color: "amber-500" },
      { label: "Nunca", value: "no", color: "emerald-500" },
    ];

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-8 pb-12">
        <button
          onClick={() => { setDiagAns([]); setDiagStep(0); setView("hero"); }}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors uppercase text-sm font-bold tracking-widest"
        >
          <ChevronLeft className="w-5 h-5" /> Volver
        </button>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-bold">
            <span className="text-red-400 uppercase tracking-widest text-xs">Diagnóstico del Saboteador</span>
            <span className="text-brand-text-muted font-mono text-xs">{diagStep + 1} / {DIAG_Q.length}</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((diagStep + 1) / DIAG_Q.length) * 100}%` }}
              className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500"
            />
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={diagStep}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="glass-card p-8 md:p-10 border-t-2 border-t-red-500/40 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10 space-y-8">
              <div className="text-center">
                <span className="text-6xl mb-4 block">🔍</span>
                <h2 className="text-xl md:text-2xl text-white font-black leading-relaxed">
                  {q}
                </h2>
              </div>

              <div className="space-y-3">
                {options.map((opt) => (
                  <motion.button
                    key={opt.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => answerDiag(opt.value)}
                    className={cx(
                      "w-full cursor-pointer p-4 rounded-xl border-2 text-left font-bold text-base transition-all",
                      `bg-${opt.color}/5 border-${opt.color}/20 hover:border-${opt.color}/60 hover:bg-${opt.color}/10 text-white`
                    )}
                    style={{
                      backgroundColor: opt.value === "si" ? "rgba(239,68,68,0.05)"
                        : opt.value === "aveces" ? "rgba(245,158,11,0.05)"
                        : "rgba(16,185,129,0.05)",
                      borderColor: opt.value === "si" ? "rgba(239,68,68,0.2)"
                        : opt.value === "aveces" ? "rgba(245,158,11,0.2)"
                        : "rgba(16,185,129,0.2)",
                    }}
                  >
                    {opt.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // VIEW: DIAGNOSTIC RESULT
  // ═══════════════════════════════════════════════════════════════════════
  const resetDiag = () => { setDiagAns([]); setDiagStep(0); setView("hero"); };
  const generatePDF = async () => {
    const doc = new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
    let y = initPdfWithHeader(doc, 'Reto Sombra');
    const W=210,M=18;
    
    doc.setTextColor(15, 23, 42); // slate-900
    doc.setFontSize(28); 
    doc.setFont('helvetica', 'bold');
    doc.text(diagResult?.title?.toUpperCase() || 'DIAGNÓSTICO', M, y); 
    y += 12;

    y = addPdfText(doc, `${diagScore}% NIVEL DE SABOTAJE`, y, { fontSize: 14, color: [239, 68, 68], fontStyle: 'bold' });
    y += 4;

    y = addPdfText(doc, diagResult?.message || '', y, { fontSize: 11, color: [51, 65, 85], lineHeight: 6 });
    y += 8;
    
    y = addPdfText(doc, 'TUS RESPUESTAS', y, { fontSize: 14, color: [15, 23, 42], fontStyle: 'bold' });
    y += 6;

    DIAG_Q.forEach((q, i) => {
      y = checkPageBreak(doc, y, 20);
      
      y = addPdfText(doc, `PREGUNTA ${i+1}`, y, { fontSize: 9, color: [239, 68, 68], fontStyle: 'bold' });
      y += 4;
      
      y = addPdfText(doc, q, y, { fontSize: 11, color: [15, 23, 42], fontStyle: 'bold', lineHeight: 6 });
      y += 4;
      
      y = addPdfText(doc, diagAns[i] === 'si' ? 'Sí' : 'No', y, { fontSize: 10, color: [100, 116, 139], fontStyle: 'italic', lineHeight: 6 });
      y += 6;
    });

    doc.save('reto-sombra.pdf');
  };

  if (view === "result") {
    return (
      <div className="max-w-5xl mx-auto pb-12">
        <ResultActions 
          onDownloadPDF={generatePDF} 
          onReset={resetDiag} 
          resetLabel="Reiniciar diagnóstico"
        />

        <div className="min-h-[70vh] flex flex-col justify-center mt-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="grid md:grid-cols-2 gap-12 items-center">
            
            {/* Left Column: Result Presentation */}
            <div className="flex flex-col h-full justify-center space-y-8">
              <div className="glass-card p-10 md:p-12 border-t-2 relative overflow-hidden text-center flex-grow flex flex-col justify-center items-center"
                style={{ borderTopColor: diagResult?.color || "#ef4444" }}
              >
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: `radial-gradient(circle at 50% 0%, ${diagResult?.color}15, transparent 60%)` }}
                />

                <div className="relative z-10 space-y-8">
                  {/* Circular score indicator */}
                  <div className="mx-auto w-48 h-48 relative">
                    <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                      <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                      <motion.circle
                        cx="60" cy="60" r="52" fill="none"
                        stroke={diagResult?.color || "#ef4444"}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 52}
                        initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - diagScore / 100) }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="text-5xl font-black"
                        style={{ color: diagResult?.color }}
                      >
                        {diagScore}%
                      </motion.span>
                      <span className="text-xs text-brand-text-muted uppercase tracking-widest font-bold mt-1">Actividad</span>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-wider" style={{ color: diagResult?.color }}>
                      {diagResult?.title}
                    </h2>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Message & CTA */}
            <div className="flex flex-col h-full justify-center space-y-8">
              <div className="glass-card p-10 space-y-8 flex-grow flex flex-col justify-center relative overflow-hidden">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl border flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${diagResult?.color}20`, borderColor: `${diagResult?.color}40` }}>
                    <Brain className="w-6 h-6" style={{ color: diagResult?.color }} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.3em]" style={{ color: diagResult?.color }}>Diagnóstico</h3>
                    <p className="text-[10px] text-brand-text-muted uppercase tracking-widest">Nivel de Sabotaje</p>
                  </div>
                </div>

                <p className="text-slate-300 text-lg leading-relaxed border-l-4 pl-5 py-2" style={{ borderLeftColor: `${diagResult?.color}50` }}>
                  {diagResult?.message}
                </p>

                {/* CTA to start protocol */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setView("route")}
                  className="w-full cursor-pointer rounded-2xl px-6 py-6 text-center transition-all group relative overflow-hidden mt-4"
                  style={{
                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 40%, #991b1b 100%)',
                    boxShadow: '0 0 30px rgba(239,68,68,0.35), 0 0 60px rgba(239,68,68,0.15), 0 8px 24px rgba(0,0,0,0.4)',
                  }}
                >
                  {/* Animated shine sweep */}
                  <div
                    className="absolute inset-0 skew-x-[-20deg] pointer-events-none"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                      animation: 'cta-shine 3s ease-in-out infinite',
                    }}
                  />
                  {/* Pulsing ring */}
                  <div className="absolute -inset-1 rounded-2xl border border-red-500/40 animate-ping opacity-20 pointer-events-none" style={{ animationDuration: '2.5s' }} />
                  <div className="relative z-10">
                    <p className="text-white font-black text-base md:text-lg uppercase tracking-wider drop-shadow-md flex items-center justify-center gap-2">
                      ⚔️ INICIAR PROTOCOLO DE 10 DÍAS
                    </p>
                    <p className="text-red-100/70 text-xs mt-2 font-medium tracking-widest uppercase">Elige tu ruta y desactiva a tu Saboteador</p>
                  </div>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // VIEW: ROUTE SELECTION
  // ═══════════════════════════════════════════════════════════════════════
  if (view === "route" || !route) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8 pb-12">
        <button
          onClick={() => setView("result")}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors uppercase text-sm font-bold tracking-widest"
        >
          <ChevronLeft className="w-5 h-5" /> Ver diagnóstico
        </button>

        <div className="text-center space-y-3">
          <div className="text-6xl">⚔️</div>
          <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-wider">Elige tu Ruta</h2>
          <p className="text-brand-text-muted text-lg font-medium">
            ¿Desde dónde enfrentas a tu Saboteador, <span className="text-red-400 font-black">{userName}</span>?
          </p>
        </div>

        {/* Route selection intro */}
        <div className="glass-card relative overflow-hidden border-t-2 border-t-amber-500/30">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-red-500/5 pointer-events-none" />
          <div className="relative z-10 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                <span className="text-lg">🎭</span>
              </div>
              <h3 className="text-xs font-black text-amber-500 uppercase tracking-[0.3em]">Dos caminos, un destino</h3>
            </div>
            <p className="text-base text-slate-300 leading-relaxed">
              El Saboteador opera diferente según tu experiencia. Un <span className="text-amber-400 font-bold">principiante</span> lo
              enfrenta desde las decisiones cotidianas. Un <span className="text-red-400 font-bold">operador activo</span> lo combate
              en cada trade. <span className="text-emerald-400 font-bold">Ambas rutas llegan al mismo resultado</span>: dominio total.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* NOVATO */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => selectRoute("novato")}
            className="cursor-pointer glass-card p-6 md:p-8 text-left h-full border-t-2 border-t-amber-500/30 hover:border-amber-500/60 transition-all group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Brain className="w-6 h-6 text-amber-500" />
              </div>
              <h2 className="text-2xl font-black text-amber-500 mb-1 uppercase tracking-wider">🌱 Principiante</h2>
              <p className="text-amber-300 text-xs font-bold italic mb-4">"Quiero preparar mi mente antes de operar"</p>
              <p className="text-slate-400 mb-6 min-h-[60px]">
                Aprende sobre tu Saboteador desde las finanzas personales y decisiones cotidianas. Sin jerga de trading.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-300">Dominarás tu mente y emociones antes de operar.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-300">Ejercicios aplicados a decisiones diarias, no a charts.</span>
                </li>
              </ul>
            </div>
          </motion.button>

          {/* OPERADOR */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => selectRoute("operador")}
            className="cursor-pointer glass-card p-6 md:p-8 text-left h-full border-t-2 border-t-red-500/30 hover:border-red-500/60 transition-all group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <AlertTriangle className="w-32 h-32 text-red-500" />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-2xl font-black text-red-500 mb-1 uppercase tracking-wider">⚔️ Operador Activo</h2>
              <p className="text-red-300 text-xs font-bold italic mb-4">"Ya opero — necesito eliminar el autosabotaje"</p>
              <p className="text-slate-400 mb-6 min-h-[60px]">
                Combate directamente al Saboteador donde más duele: en tus sesiones de trading con capital real.
              </p>
              <ul className="space-y-3 relative z-10">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-300">Integrarás psicología profunda con tu operativa diaria.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-300">Desactivarás patrones de sabotaje en tiempo real.</span>
                </li>
              </ul>
            </div>
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // VIEW: HOME / DASHBOARD (Tabbed: Mission, Calendar, Progress)
  // ═══════════════════════════════════════════════════════════════════════
  if (view === "home") {
    const totalDays = DAYS.length;
    const completedCount = Object.values(completedDays).filter(Boolean).length;
    const progressPerc = Math.round((completedCount / totalDays) * 100);

    const phaseColorMap: Record<string, { bg: string; border: string; text: string; hex: string; glow: string }> = {
      detectar:    { bg: "from-orange-500/10 to-transparent",   border: "border-orange-500/20",   text: "text-orange-500",   hex: "#f97316", glow: "249,115,22" },
      desactivar:  { bg: "from-amber-500/10 to-transparent",    border: "border-amber-500/20",    text: "text-amber-500",    hex: "#f59e0b", glow: "245,158,11" },
      dominar:     { bg: "from-emerald-500/10 to-transparent",  border: "border-emerald-500/20",  text: "text-emerald-500",  hex: "#10b981", glow: "16,185,129" },
    };

    const streak = (() => { let s = 0; for (let i = 1; i <= 10; i++) { if (completedDays[i]) s++; else break; } return s; })();
    const nextDay = (() => { for (let i = 1; i <= 10; i++) { if (!completedDays[i]) return i; } return 10; })();
    const nextDayData = DAYS[Math.min(nextDay, 10) - 1];
    const nextPc = phaseColorMap[nextDayData.phase];

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto space-y-6 pb-12">
        <style>{`
          @keyframes journey-pulse { 0%, 100% { box-shadow: 0 0 14px rgba(249,115,22,0.12); } 50% { box-shadow: 0 0 28px rgba(249,115,22,0.3); } }
          @keyframes card-shine2 { 0%, 100% { transform: translateX(-150%) skewX(-20deg); } 50% { transform: translateX(150%) skewX(-20deg); } }
        `}</style>

        <CompletionBanner lessonId="sombra" />

        {/* ── Header Card ── */}
        <div className="glass-card p-6 md:p-8 border-t-2 border-t-orange-500/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-amber-500/5 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-wider mb-2">
                <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 bg-clip-text text-transparent">
                  MIS EMOCIONES
                </span>
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="bg-orange-500/20 text-orange-400 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-orange-500/30">
                  {route === "operador" ? "⚔️ Luchador" : "🛡️ Principiante"}
                </span>
                {diagScore > 0 && (
                  <span className="bg-amber-500/20 text-amber-400 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-amber-500/30">
                    🎯 Saboteador: {diagScore}%
                  </span>
                )}
              </div>
            </div>
            {/* Circular progress */}
            <div className="shrink-0">
              <svg width="78" height="78" viewBox="0 0 78 78">
                <circle cx="39" cy="39" r="32" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="4"/>
                <circle cx="39" cy="39" r="32" fill="none" stroke="url(#hpg)" strokeWidth="4"
                  strokeDasharray={`${progressPerc * 2.01} ${201 - progressPerc * 2.01}`}
                  strokeDashoffset="50" strokeLinecap="round"
                  style={{ transition: "stroke-dasharray .8s" }}
                />
                <defs>
                  <linearGradient id="hpg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f97316"/>
                    <stop offset="100%" stopColor="#10b981"/>
                  </linearGradient>
                </defs>
                <text x="39" y="36" textAnchor="middle" fill="#fff" fontSize="17" fontWeight="900" fontFamily="monospace">{completedCount}</text>
                <text x="39" y="49" textAnchor="middle" fill="#334155" fontSize="8" fontWeight="700" fontFamily="monospace">/10</text>
              </svg>
            </div>
          </div>
        </div>

        {/* ── Tab Navigation ── */}
        <div className="flex bg-white/[0.02] rounded-xl p-1 border border-white/5">
          {([
            { id: "mission" as const, label: "🎯 Misión" },
            { id: "calendar" as const, label: "📅 Calendario" },
            { id: "progress" as const, label: "📊 Progreso" },
          ]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDashTab(tab.id)}
              className={cx(
                "flex-1 py-2.5 px-4 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer",
                dashTab === tab.id
                  ? "bg-orange-500/15 text-orange-400 border border-orange-500/25"
                  : "text-brand-text-muted hover:text-white border border-transparent"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ═══ TAB: MISIÓN ═══ */}
        {dashTab === "mission" && (
          <div className="space-y-6">
            {/* El Camino — Horizontal Journey */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black text-brand-text-muted uppercase tracking-[0.2em]">EL CAMINO · 10 DÍAS</span>
                <span className="text-[10px] font-black text-brand-text-muted uppercase tracking-[0.15em]">{completedCount}/10</span>
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-2" style={{ scrollbarWidth: "thin" }}>
                {DAYS.map((dy, idx) => {
                  const dn = completedDays[dy.day];
                  const isNext = dy.day === nextDay && !completedDays[nextDay];
                  const lk = getDayStatus(dy.day) === "locked";
                  const pp = phaseColorMap[dy.phase];
                  const showSep = idx === 3 || idx === 7;
                  return (
                    <div key={dy.day} className="flex items-stretch shrink-0">
                      {showSep && <div className="w-2 flex items-center justify-center"><div className="w-0.5 h-8 bg-white/5 rounded-full" /></div>}
                      <motion.button
                        whileHover={!lk ? { y: -2 } : {}}
                        onClick={() => { if (!lk) { setSelDay(dy.day); setView("day"); } }}
                        disabled={lk}
                        className={cx("w-[62px] rounded-xl text-center transition-all py-2.5 px-1", lk ? "opacity-40 cursor-not-allowed" : "cursor-pointer")}
                        style={{
                          border: isNext ? `2px solid ${pp.hex}` : dn ? `1px solid ${pp.hex}50` : "1px solid rgba(255,255,255,0.05)",
                          background: dn ? `${pp.hex}15` : isNext ? `${pp.hex}0a` : "rgba(255,255,255,0.015)",
                          animation: isNext ? "journey-pulse 2.5s ease-in-out infinite" : "none",
                        }}
                      >
                        <div className="text-[8px] font-black tracking-wider font-mono mb-1" style={{ color: lk ? "#475569" : pp.hex }}>DÍA {dy.day}</div>
                        <div className="text-xl leading-none mb-1" style={{ filter: lk ? "grayscale(0.6) opacity(0.5)" : "none" }}>{dy.icon}</div>
                        <div className="text-[10px] font-black" style={{ color: dn ? pp.hex : lk ? "#475569" : "#cbd5e1" }}>
                          {dn ? "✓" : lk ? "🔒" : isNext ? "●" : ""}
                        </div>
                      </motion.button>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-2 px-1">
                <span className="text-[8px] font-black tracking-widest text-orange-500">🎯 DETECTAR</span>
                <span className="text-[8px] font-black tracking-widest text-amber-500">⚔️ DESACTIVAR</span>
                <span className="text-[8px] font-black tracking-widest text-emerald-500">👑 DOMINAR</span>
              </div>
            </div>

            {/* Phase Counters */}
            <div className="grid grid-cols-3 gap-3">
              {([
                { label: "Detectar", count: Object.keys(completedDays).filter(k => Number(k) <= 3 && completedDays[Number(k)]).length, total: 3, color: "#f97316", icon: "🎯" },
                { label: "Desactivar", count: Object.keys(completedDays).filter(k => Number(k) > 3 && Number(k) <= 7 && completedDays[Number(k)]).length, total: 4, color: "#f59e0b", icon: "⚔️" },
                { label: "Dominar", count: Object.keys(completedDays).filter(k => Number(k) > 7 && completedDays[Number(k)]).length, total: 3, color: "#10b981", icon: "👑" },
              ]).map((s) => (
                <div key={s.label} className="glass-card p-4 text-center">
                  <div className="text-xl mb-1">{s.icon}</div>
                  <div className="text-lg font-black font-mono" style={{ color: s.color }}>{s.count}/{s.total}</div>
                  <div className="text-[9px] font-black text-brand-text-muted uppercase tracking-widest">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Next Day CTA */}
            {!completedDays[nextDay] && nextDay <= 10 && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: nextPc.hex }}>
                    ▸ {nextDay === 1 ? "EMPIEZA HOY" : "SIGUIENTE MISIÓN"}
                  </span>
                  {streak > 0 && <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">🔥 {streak} días seguidos</span>}
                </div>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => { setSelDay(nextDayData.day); setView("day"); }}
                  className="w-full glass-card p-5 md:p-6 text-left relative overflow-hidden cursor-pointer transition-all"
                  style={{ borderColor: `${nextPc.hex}30`, borderWidth: 1, animation: "journey-pulse 2.5s ease-in-out infinite" }}
                >
                  <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(135deg, ${nextPc.hex}10, transparent 60%)` }} />
                  {/* Shine sweep */}
                  <div className="absolute inset-0 skew-x-[-20deg] pointer-events-none" style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)", animation: "card-shine2 5s ease-in-out infinite" }} />
                  <div className="relative z-10 flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0" style={{ background: `${nextPc.hex}15` }}>{nextDayData.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-black font-mono tracking-wider mb-1" style={{ color: nextPc.hex }}>
                        DÍA {nextDayData.day} · {PHASES[nextDayData.phase].label.toUpperCase()}
                      </div>
                      <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-wider mb-2 leading-tight">{nextDayData.title}</h3>
                      <p className="text-sm text-orange-200/70 italic font-medium line-clamp-2">"{nextDayData.hook}"</p>
                    </div>
                    <ArrowRight className="w-6 h-6 shrink-0 mt-2 animate-pulse" style={{ color: nextPc.hex }} />
                  </div>
                  {route && (
                    <div className="flex gap-2 mt-4 flex-wrap relative z-10">
                      {nextDayData.routes[route].exercises.map((ex, i) => (
                        <span key={i} className="text-[11px] font-bold px-3 py-1.5 rounded-full border"
                          style={{
                            background: tasksDone[`${nextDayData.day}-${i}`] ? `${nextPc.hex}20` : "rgba(255,255,255,0.05)",
                            color: tasksDone[`${nextDayData.day}-${i}`] ? nextPc.hex : "#cbd5e1",
                            borderColor: tasksDone[`${nextDayData.day}-${i}`] ? `${nextPc.hex}40` : "rgba(255,255,255,0.08)"
                          }}>
                          {ex.icon} {ex.title.length > 20 ? ex.title.slice(0, 20) + "…" : ex.title}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.button>
              </>
            )}

            {/* All Complete */}
            {completedCount === 10 && (
              <div className="glass-card p-8 text-center border-t-2 border-t-emerald-500/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
                <div className="relative z-10 space-y-3">
                  <div className="text-5xl">👑</div>
                  <h2 className="text-2xl font-black text-emerald-500 uppercase tracking-wider">¡Saboteador Desactivado!</h2>
                  <p className="text-slate-400 text-base">Has completado el protocolo de 10 días. Eres otro trader.</p>
                  
                  <div className="pt-6">
                    <p className="text-sm font-medium text-slate-300 mb-4">
                      El siguiente paso: descubrir <span className="text-orange-400 font-bold">por qué o de dónde vienen tus trampas de dinero</span>.
                    </p>
                    <Link
                      to="/app/trampas-dinero"
                      className="btn-premium-orange inline-flex py-3 px-8 rounded-xl text-sm font-black uppercase tracking-widest"
                      style={{
                        background: 'linear-gradient(135deg, #f97316 0%, #f59e0b 100%)',
                        color: '#fff',
                        boxShadow: '0 0 20px rgba(249,115,22,0.3)',
                      }}
                    >
                      SIGUIENTE → TRAMPAS DEL DINERO
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* ── Inline Share Section (matches GastosHormiga pattern) ── */}
            <div className="glass-card p-6 md:p-8 space-y-6 border-orange-500/10">
              <div className="flex items-center gap-4">
                <Share2 className="w-6 h-6 text-orange-500" />
                <div>
                  <div className="font-black uppercase tracking-tight text-base">Comparte tu progreso</div>
                  <div className="text-brand-text-muted text-sm font-medium mt-1">Recluta a otro trader — el que pierde por su propia culpa lo necesita más que nadie.</div>
                </div>
              </div>

              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                <p className="text-brand-text-muted text-sm leading-relaxed font-medium">
                  "🚨 Acabo de descubrir al <span className="text-orange-400 font-black">trader que me hacía perder dinero</span>. Resulta que vivía dentro de mí.{' '}
                  Día <span className="text-orange-400 font-black">{Math.min(nextDay, 10)}/10</span> del reto <span className="text-orange-400 font-black">Mis Emociones</span> (GENY LAB).{' '}
                  ¿Te atreves a conocer al tuyo? 🎯"
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button onClick={() => handleSocialShare('whatsapp')} className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-all text-sm font-black text-white/80 hover:text-white">
                  <span className="text-[#25D366]">💬</span> WhatsApp
                </button>
                <button onClick={() => handleSocialShare('facebook')} className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#1877F2]/10 border border-[#1877F2]/20 hover:bg-[#1877F2]/20 transition-all text-sm font-black text-white/80 hover:text-white">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#1877F2]" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073c0 6.028 4.388 11.024 10.125 11.927v-8.437H7.078v-3.49h3.047V9.42c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.929-1.956 1.883v2.263h3.328l-.532 3.49h-2.796v8.437C19.612 23.097 24 18.1 24 12.073z"/></svg> 
                </button>
                <button onClick={() => handleSocialShare('linkedin')} className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#0A66C2]/10 border border-[#0A66C2]/20 hover:bg-[#0A66C2]/20 transition-all text-sm font-black text-white/80 hover:text-white">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#0A66C2]" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> LinkedIn
                </button>
                <button onClick={() => handleSocialShare('twitter')} className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-black text-white/80 hover:text-white">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-white/70" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.258 5.63 5.906-5.63Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> X
                </button>
              </div>

              <button
                onClick={handleCopyLink}
                className={cx(
                  "w-full flex items-center justify-center gap-3 p-3.5 rounded-xl border transition-all font-black uppercase tracking-widest text-xs",
                  copiedLink
                    ? "bg-brand-green/10 border-brand-green/30 text-brand-green"
                    : "bg-white/5 border-white/10 text-brand-text-muted hover:bg-white/10 hover:text-white"
                )}
              >
                {copiedLink ? (<><Check className="w-5 h-5" /> ¡Link Copiado!</>) : (<><Copy className="w-5 h-5" /> Copiar Link de Resultados</>)}
              </button>
            </div>

            {/* Cambiar de misión */}
            <div className="flex justify-center">
              <button
                onClick={() => { setRoute(null); setView("route"); }}
                className="flex items-center gap-2 text-brand-text-muted hover:text-white transition-colors uppercase font-black text-xs tracking-[0.2em] py-4"
              >
                🔄 Cambiar de misión
              </button>
            </div>
          </div>
        )}

        {/* ═══ TAB: CALENDARIO ═══ */}
        {dashTab === "calendar" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-wider mb-3">Una misión a la vez</h2>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${progressPerc}%` }} className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 rounded-full" />
              </div>
            </div>
            {Object.entries(PHASES).map(([phaseKey, phaseObj]) => {
              const daysInPhase = DAYS.filter((d) => d.phase === phaseKey);
              const pc = phaseColorMap[phaseKey];
              return (
                <div key={phaseKey} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{phaseObj.icon}</span>
                    <span className="text-sm font-black text-white uppercase tracking-wider">{phaseObj.label}</span>
                    <span className="text-[10px] font-mono text-brand-text-muted">Días {phaseObj.range[0]}–{phaseObj.range[1]}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {daysInPhase.map((d) => {
                      const dn = completedDays[d.day];
                      const isNext = d.day === nextDay && !completedDays[nextDay];
                      const lk = getDayStatus(d.day) === "locked";
                      const exDone = route ? d.routes[route].exercises.filter((_, i) => tasksDone[`${d.day}-${i}`]).length : 0;
                      const exTotal = route ? d.routes[route].exercises.length : 4;
                      return (
                        <motion.button
                          key={d.day}
                          whileHover={!lk ? { y: -2 } : {}}
                          onClick={() => { if (!lk) { setSelDay(d.day); setView("day"); } }}
                          disabled={lk}
                          className={cx("p-4 rounded-xl text-left transition-all relative", lk ? "opacity-20 cursor-not-allowed" : "cursor-pointer")}
                          style={{
                            background: dn ? `${pc.hex}12` : isNext ? `${pc.hex}08` : "rgba(255,255,255,0.015)",
                            border: `1px solid ${dn ? `${pc.hex}35` : isNext ? `${pc.hex}30` : "rgba(255,255,255,0.04)"}`,
                            animation: isNext ? "journey-pulse 2.5s ease-in-out infinite" : "none",
                          }}
                        >
                          {dn && <div className="absolute top-2 right-2 text-sm">✅</div>}
                          {lk && <div className="absolute top-2 right-2 text-xs">🔒</div>}
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{d.icon}</span>
                            <div>
                              <div className="text-[8px] font-black font-mono tracking-wider" style={{ color: pc.hex }}>DÍA {d.day}</div>
                              <div className="text-sm font-black text-white leading-tight mt-0.5">{d.title}</div>
                            </div>
                          </div>
                          <div className="text-[10px] font-mono font-bold text-brand-text-muted">{exDone}/{exTotal} ejercicios</div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ═══ TAB: PROGRESO ═══ */}
        {dashTab === "progress" && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-white uppercase tracking-wider">Tu progreso de campo</h2>
            {/* Big SVG Circle */}
            <div className="glass-card p-8 text-center">
              <svg width="140" height="140" viewBox="0 0 140 140" className="mx-auto block">
                <circle cx="70" cy="70" r="58" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="6"/>
                <circle cx="70" cy="70" r="58" fill="none" stroke="url(#bpg)" strokeWidth="6"
                  strokeDasharray={`${progressPerc * 3.64} ${364 - progressPerc * 3.64}`}
                  strokeDashoffset="91" strokeLinecap="round"
                  style={{ transition: "stroke-dasharray 1s" }}
                />
                <defs>
                  <linearGradient id="bpg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f97316"/>
                    <stop offset="50%" stopColor="#f59e0b"/>
                    <stop offset="100%" stopColor="#10b981"/>
                  </linearGradient>
                </defs>
                <text x="70" y="65" textAnchor="middle" fill="#fff" fontSize="30" fontWeight="900" fontFamily="monospace">{progressPerc}%</text>
                <text x="70" y="82" textAnchor="middle" fill="#475569" fontSize="10" fontWeight="700" fontFamily="monospace">Saboteador</text>
                <text x="70" y="95" textAnchor="middle" fill="#475569" fontSize="10" fontWeight="700" fontFamily="monospace">desactivado</text>
              </svg>
              <div className="flex justify-center gap-10 mt-6">
                {([
                  { label: "Días", value: String(completedCount), color: "#f97316" },
                  { label: "Racha", value: `${streak}🔥`, color: "#f59e0b" },
                  { label: "Ejercicios", value: String(Object.keys(tasksDone).filter(k => tasksDone[k]).length), color: "#10b981" },
                ]).map((s) => (
                  <div key={s.label}>
                    <div className="text-xl font-black font-mono" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-[9px] font-black text-brand-text-muted uppercase tracking-widest">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Milestones */}
            <div className="space-y-2">
              {([
                { threshold: 3, label: "Saboteador Detectado", icon: "🎯" },
                { threshold: 7, label: "Saboteador Desactivado", icon: "⚔️" },
                { threshold: 10, label: "Trader Imparable", icon: "👑" },
              ]).map((m) => {
                const ok = completedCount >= m.threshold;
                return (
                  <div key={m.threshold} className={cx("glass-card p-4 flex items-center gap-4", ok ? "border-l-4" : "opacity-40")} style={ok ? { borderLeftColor: "#f97316" } : {}}>
                    <span className="text-2xl" style={{ filter: ok ? "none" : "grayscale(1)" }}>{m.icon}</span>
                    <span className={cx("text-sm font-black flex-1", ok ? "text-orange-300" : "text-brand-text-muted")}>{m.label}</span>
                    {ok && <CheckCircle className="w-5 h-5 text-orange-500" />}
                  </div>
                );
              })}
            </div>
            <button onClick={() => setDashTab("mission")} className="w-full glass-card p-4 text-center cursor-pointer text-orange-400 text-sm font-black flex items-center justify-center gap-2 transition-all hover:bg-white/[0.04] uppercase tracking-widest">
              <Share2 className="w-4 h-4" /> Compartir mi progreso
            </button>
          </div>
        )}

      </motion.div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // VIEW: DAY DETAIL
  // ═══════════════════════════════════════════════════════════════════════
  const dayData = DAYS.find((d) => d.day === selDay);
  if (!dayData) return null;
  const phaseInfo = PHASES[dayData.phase as keyof typeof PHASES];
  const dayCompleted = completedDays[selDay];
  const exercises = dayData.routes[route].exercises;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-3xl mx-auto pb-16"
    >
      <button
        onClick={() => setView("home")}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group uppercase text-sm font-bold tracking-widest"
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Volver al Mapa
      </button>

      <div className="space-y-8">
        {/* Day Header */}
        <div className="glass-card p-6 md:p-10 border-t-2 relative overflow-hidden"
          style={{ borderTopColor: phaseInfo?.hex || "#ef4444" }}
        >
          <div className="absolute top-0 right-0 p-8 text-8xl opacity-5 pointer-events-none">
            {dayData.icon}
          </div>

          <div className="relative z-10 space-y-6">
            <div>
              <span className={cx("text-sm font-bold uppercase tracking-widest font-mono", phaseInfo?.color)}>
                Día {selDay} • Fase: {phaseInfo?.label}
              </span>
              <h1 className="text-3xl md:text-5xl font-black uppercase tracking-wider mt-2 mb-4"
                style={{ color: phaseInfo?.hex }}
              >
                {dayData.title}
              </h1>
              <span
                className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border"
                style={{
                  background: (phaseInfo?.hex || "#ef4444") + "22",
                  color: phaseInfo?.hex,
                  borderColor: (phaseInfo?.hex || "#ef4444") + "44",
                }}
              >
                {exercises[0]?.type || "reflexión"}
              </span>
            </div>

            <blockquote className="border-l-4 pl-4 py-2 italic text-lg text-slate-300 font-serif"
              style={{ borderColor: (phaseInfo?.hex || "#ef4444") + "80" }}
            >
              {dayData.quote}
            </blockquote>

            <div className="space-y-4 text-slate-300 leading-relaxed text-lg">
              <p>{dayData.teaching}</p>
              <div className="p-4 rounded-lg border"
                style={{
                  backgroundColor: (phaseInfo?.hex || "#ef4444") + "10",
                  borderColor: (phaseInfo?.hex || "#ef4444") + "30",
                  color: phaseInfo?.hex,
                }}
              >
                <span className="font-bold uppercase text-sm tracking-widest block mb-2">
                  Contexto {route}
                </span>
                <span className="text-slate-300">{dayData.routes[route].context}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Exercises / Tasks */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-red-400 uppercase tracking-widest mb-6 border-b border-white/10 pb-2">
            Misiones del Día
          </h2>

          {exercises.map((ex, i) => {
            const taskId = `${selDay}-${i}`;
            const isDone = tasksDone[taskId];

            return (
              <motion.div
                key={taskId}
                onClick={() => toggleTask(taskId)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={cx(
                  "glass-card p-5 cursor-pointer transition-all border-l-4 group flex gap-4 items-start",
                  isDone
                    ? "border-l-emerald-500 bg-emerald-500/10 border-t border-t-white/5"
                    : "border-l-transparent border-t border-t-white/10 hover:border-l-slate-400 hover:bg-white/5"
                )}
              >
                <div className="mt-1">
                  {isDone ? (
                    <CheckCircle className="w-6 h-6 text-emerald-500" />
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-slate-600 group-hover:border-slate-400" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className={cx(
                      "font-bold text-lg",
                      isDone ? "text-white line-through opacity-70" : "text-red-400"
                    )}>
                      {ex.icon} {ex.title}
                    </h3>
                    <span className="text-xs font-mono text-slate-500 uppercase px-2 py-1 bg-white/5 rounded shrink-0">
                      ~{ex.time}
                    </span>
                  </div>
                  <p className={cx(
                    "text-slate-400 text-sm md:text-base",
                    isDone ? "opacity-50" : ""
                  )}>
                    {ex.inst}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Completion + Share */}
        {dayCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 text-center border-t border-t-emerald-500 space-y-6 mt-12 bg-gradient-to-b from-emerald-500/10 to-transparent"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mb-2">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-emerald-500 uppercase tracking-widest mb-2">
                DÍA {selDay} COMPLETADO
              </h3>
              <p className="text-slate-400">
                Le ganaste otra batalla a tu Saboteador. Comparte tu progreso para afianzar este proceso y reclutar aliados.
              </p>
            </div>

            {/* Sharing Section */}
            <div className="mt-8 space-y-6">
              <ShareModule 
                activity="sombra" 
                title="Reto de la Sombra" 
                resultData={{ selDay, title: dayData.title }}
                shareMessage={`Acabo de completar el Día ${selDay}: "${dayData.title}" de Mis Emociones. ⚔️ Otro día dominando a mi Saboteador.`}
              />
            </div>
            <div className="pt-4">
              <button
                onClick={() => setView("home")}
                className="btn-primary py-3 px-8 text-sm tracking-widest rounded-xl"
              >
                VOLVER AL MAPA
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
