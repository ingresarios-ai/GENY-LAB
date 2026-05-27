import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import {
  ChevronLeft, CheckCircle, Share2,    Copy, Check,
  Lock, Unlock, Zap, Brain, AlertTriangle, ArrowRight, ChevronRight
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { saveActivityProgressDB, loadActivityProgressDB, clearActivityProgressDB } from '../../lib/activitySync';
import { markActivityCompleted } from "../../lib/progressStore";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const userName = 'Trader'?.split(" ")[0] || "Trader";

  // ── State ──────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState<RouteType | null>(null);
  const [tasksDone, setTasksDone] = useState<Record<string, boolean>>({});
  const [completedDays, setCompletedDays] = useState<Record<number, boolean>>({});
  const bannerRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<"hero" | "diag" | "result" | "route" | "home" | "day" | "results">("hero");
  const [selDay, setSelDay] = useState<number>(1);
  const [copiedLink, setCopiedLink] = useState(false);
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
  const diagResult = route
    ? DIAG_R[route][diagLevel]
    : DIAG_R.operador[diagLevel];
  const activeQuestions = route ? DIAG_Q[route] : DIAG_Q.operador;

  // ── Load saved progress ────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        if (searchParams.get('reset') === 'true') {
          await clearActivityProgressDB('sombra');
          setSearchParams({}, { replace: true });
          setLoading(false);
          return;
        }
        const queryView = searchParams.get('view');
        const saved = await loadActivityProgressDB('sombra');
        if (saved && saved.metadata) {
          const r = saved.metadata;
          if (r.route) setRoute(r.route);
          if (r.tasksDone) setTasksDone(r.tasksDone);
          if (r.completedDays) setCompletedDays(r.completedDays);
          if (r.diagAns) {
            setDiagAns(r.diagAns);
            if (r.diagAns.length >= 4 && !r.route) setView('result');
          }
          if (r.view) setView(r.view);
          if (r.selDay) setSelDay(r.selDay);
          const isCompleted = Object.keys(r.completedDays || {}).length === DAYS.length && Object.values(r.completedDays || {}).every(Boolean);
          if (isCompleted || saved.completed) {
            markActivityCompleted('sombra');
          }
        }
        if (queryView === 'results') {
          setView('results');
        }
      } catch (e) {
        console.error('Error loading sombra progress:', e);
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Persist to DB ───────────────────────────────────────────
  const saveState = async (
    newRoute = route,
    newTasks = tasksDone,
    newDays = completedDays,
    newDiagAns = diagAns,
    newView?: string,
    newSelDay?: number,
  ) => {
    try {
      const dataToSave = {
        route: newRoute,
        tasksDone: newTasks,
        completedDays: newDays,
        diagAns: newDiagAns,
        view: newView || view,
        selDay: newSelDay !== undefined ? newSelDay : selDay,
      };
      const isCompleted = Object.keys(newDays).length === DAYS.length && Object.values(newDays).every(Boolean);
      await saveActivityProgressDB('sombra', dataToSave, isCompleted);
      if (isCompleted) {
        markActivityCompleted('sombra');
      }
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
    if (diagAns.length < 4) {
      setDiagStep(0);
      setDiagAns([]);
      setView("diag");
      await saveState(r, tasksDone, completedDays, [], "diag");
    } else {
      setView("home");
      await saveState(r, tasksDone, completedDays, diagAns, "home");
    }
  };

  // ── Answer diagnostic ─────────────────────────────────────────────────
  const answerDiag = async (answer: string) => {
    const newAns = [...diagAns, answer];
    setDiagAns(newAns);
    if (newAns.length < 4) {
      setDiagStep(diagStep + 1);
    } else {
      setView("result");
      await saveState(route, tasksDone, completedDays, newAns, "result");
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

      // No auto-redirect. Let the user stay on the Day 10 view to read details/download PDF and click "Finalizar Reto" manually.
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
    return `https://genylab.ingresarios.net/resultado/${btoa(JSON.stringify(payload))}`;
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
      { icon: "🩸", text: "Mueves el stop loss o gastas dinero por impulso" },
      { icon: "🎰", text: "Haces revenge trading o compras para calmar el estrés" },
      { icon: "😰", text: "Cierras ganadores temprano o postergas el ahorro" },
      { icon: "🧠", text: "Operas o decides contra tu propio plan financiero" },
    ];
    return (
      <div className="max-w-5xl mx-auto pb-12">
        <Link
          to="/app/leccion/sombra"
          className="inline-flex items-center gap-2 text-brand-text-muted hover:text-white transition-colors uppercase font-black text-xs tracking-[0.2em] mb-4"
        >
          <ChevronLeft className="w-4 h-4" /> Volver a la Lección
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
                  Carl Jung descubrió que dentro de cada persona vive una segunda personalidad inconsciente: el Saboteador. Hoy sabrás cómo influye en tu dinero, tu trading y tus decisiones financieras.
                </p>
              </div>

              {/* ── CTA Button ── */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={async () => {
                  setView("route");
                  await saveState(route, tasksDone, completedDays, diagAns, "route");
                }}
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
                      ¿Por qué pierdes dinero cuando <span className="text-red-500 font-black">SABES</span> que deberías ganar?
                      <br />
                      ¿Por qué saboteas tus planes cuando los <span className="text-emerald-500 font-black">DISEÑASTE</span> tú?
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
    const q = activeQuestions[diagStep];
    const options = [
      { label: "Sí, lo he hecho", value: "si", color: "red-500" },
      { label: "A veces", value: "aveces", color: "amber-500" },
      { label: "Nunca", value: "no", color: "emerald-500" },
    ];

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-8 pb-12">
        <button
          onClick={async () => {
            setDiagAns([]);
            setDiagStep(0);
            setView("route");
            await saveState(route, tasksDone, completedDays, [], "route");
          }}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors uppercase text-sm font-bold tracking-widest"
        >
          <ChevronLeft className="w-5 h-5" /> Volver
        </button>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-bold">
            <span className="text-red-400 uppercase tracking-widest text-xs">Diagnóstico del Saboteador</span>
            <span className="text-brand-text-muted font-mono text-xs">{diagStep + 1} / {activeQuestions.length}</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((diagStep + 1) / activeQuestions.length) * 100}%` }}
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

    activeQuestions.forEach((q, i) => {
      y = checkPageBreak(doc, y, 20);
      
      y = addPdfText(doc, `PREGUNTA ${i+1}`, y, { fontSize: 9, color: [239, 68, 68], fontStyle: 'bold' });
      y += 4;
      
      y = addPdfText(doc, q, y, { fontSize: 11, color: [15, 23, 42], fontStyle: 'bold', lineHeight: 6 });
      y += 4;
      
      const ansLabel = diagAns[i] === 'si' ? 'Sí'
        : diagAns[i] === 'aveces' ? 'A veces'
        : 'Nunca';
      y = addPdfText(doc, ansLabel, y, { fontSize: 10, color: [100, 116, 139], fontStyle: 'italic', lineHeight: 6 });
      y += 6;
    });

    doc.save('reto-sombra.pdf');
  };

  const generateResultsPDF = async () => {
    const doc = new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
    let y = initPdfWithHeader(doc, 'Reto Sombra');
    const W = 210, M = 18;
    
    // Title
    doc.setTextColor(15, 23, 42); // slate-900
    doc.setFontSize(22); 
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE DE INTEGRACIÓN DE SOMBRA', M, y); 
    y += 10;

    const intro = `¡Felicidades, ${userName}! Has completado los 10 días de la Operación Saboteador ("Mis Emociones"). Este reporte resume tu progreso, las habilidades que has integrado y los cambios logrados durante este proceso de transformación mental basado en la psicología de Carl Jung.`;
    y = addPdfText(doc, intro, y, { fontSize: 11, color: [51, 65, 85], lineHeight: 6 });
    y += 8;

    // Diagnostic section
    y = checkPageBreak(doc, y, 40);
    y = addPdfText(doc, '1. TU DIAGNÓSTICO INICIAL', y, { fontSize: 14, color: [239, 68, 68], fontStyle: 'bold' });
    y += 6;

    const scoreText = `Nivel de Autosabotaje Inicial: ${diagScore}% - ${diagResult?.title}`;
    y = addPdfText(doc, scoreText, y, { fontSize: 12, color: [15, 23, 42], fontStyle: 'bold' });
    y += 5;

    y = addPdfText(doc, diagResult?.message || '', y, { fontSize: 10, color: [100, 116, 139], lineHeight: 5 });
    y += 8;

    // Phase Summary
    y = checkPageBreak(doc, y, 45);
    y = addPdfText(doc, '2. LOGROS POR FASES DE LA OPERACIÓN', y, { fontSize: 14, color: [15, 23, 42], fontStyle: 'bold' });
    y += 6;

    // Phase 1
    y = addPdfText(doc, 'FASE 1: DETECTAR (Días 1 a 3)', y, { fontSize: 11, color: [249, 115, 22], fontStyle: 'bold' });
    y += 4;
    const phase1Text = route === "operador"
      ? "• Identificaste el 'Trader que Nadie Ve' (tu Sombra operativa inconsciente).\n• Mapeaste tu Yo Ideal vs. Yo Real para ver dónde cae la máscara de disciplina.\n• Realizaste una ficha policial de tu Saboteador y definiste su modus operandi."
      : "• Identificaste el 'Yo que Nadie Ve' en tu relación con el dinero.\n• Mapeaste tu Yo Ideal vs. Yo Real en finanzas personales para detectar la brecha de control.\n• Diseñaste la ficha policial de tu Saboteador, identificando sus detonantes y modus operandi.";
    y = addPdfText(doc, phase1Text, y, { fontSize: 10, color: [51, 65, 85], lineHeight: 5 });
    y += 6;

    // Phase 2
    y = checkPageBreak(doc, y, 40);
    y = addPdfText(doc, 'FASE 2: DESACTIVAR (Días 4 a 7)', y, { fontSize: 11, color: [245, 158, 11], fontStyle: 'bold' });
    y += 4;
    const phase2Text = route === "operador"
      ? "• Hiciste arqueología financiera para vincular recuerdos de infancia con tu sizing y manejo de stops hoy.\n• Realizaste imaginación activa mediante un diálogo directo y por escrito con tu Saboteador.\n• Identificaste tu miedo nuclear subyacente y expusiste de forma controlada tu peor escenario emocional.\n• Descubriste tu Sombra Dorada: dones de trading reprimidos que no te permitías brillar."
      : "• Hiciste arqueología financiera para sanar creencias de escasez heredadas de la infancia.\n• Realizaste imaginación activa escribiendo un diálogo directo para comprender de qué te protege tu Saboteador.\n• Confrontaste tu miedo nuclear oculto en el dinero y realizaste simulación controlada del peor escenario.\n• Recuperaste tu Sombra Dorada: la ambición saludable y los dones de prosperidad bloqueados.";
    y = addPdfText(doc, phase2Text, y, { fontSize: 10, color: [51, 65, 85], lineHeight: 5 });
    y += 6;

    // Phase 3
    y = checkPageBreak(doc, y, 40);
    y = addPdfText(doc, 'FASE 3: DOMINAR (Días 8 a 10)', y, { fontSize: 11, color: [16, 185, 129], fontStyle: 'bold' });
    y += 4;
    const phase3Text = route === "operador"
      ? "• Dejaste de pelear contra tu Saboteador e integraste sus impulsos como un sistema de alerta pre-trading.\n• Alquimizaste tus peores defectos: transformaste impulsividad en rapidez, miedo en gestión de riesgo y codicia en dejar correr ganancias.\n• Diseñaste un ritual permanente post-reto para blindar cada sesión antes de ver los charts."
      : "• Convertiste al Saboteador en tu aliado protector: usaste su miedo como prudencia y su impulso como acción rápida.\n• Alquimizaste defectos financieros cotidianos: indecisión en evaluación cuidadosa, y compras impulsivas en recompensas planificadas.\n• Creaste un sistema diario post-reto con rituales por la mañana, tarde y noche.";
    y = addPdfText(doc, phase3Text, y, { fontSize: 10, color: [51, 65, 85], lineHeight: 5 });
    y += 10;

    // Improvements and commitments
    y = checkPageBreak(doc, y, 45);
    y = addPdfText(doc, '3. TU PLAN DE ACCIÓN Y COMPROMISO INTEGRADO', y, { fontSize: 14, color: [15, 23, 42], fontStyle: 'bold' });
    y += 6;

    const actionText = route === "operador"
      ? "1. Ritual Pre-Trading: Dedicarás 10 minutos antes de cada sesión a respirar con coherencia cardíaca, chequear el estado emocional de tu Saboteador y declarar operar desde la totalidad.\n2. Bitácora Integrada: Sumarás la columna del Saboteador en tu bitácora operativa.\n3. Alquimia Diaria: Cada vez que sientas prisa o miedo, recordarás que son señales de advertencia técnica, no motivos para romper tu plan."
      : "1. Ritual Matutino: Dedicarás 10 minutos cada mañana a respirar en calma, registrar tu estado emocional y elegir conscientemente la abundancia.\n2. Filtro de Compras: Pausarás 24 horas antes de realizar cualquier gasto emocional o imprevisto, analizando si responde a una necesidad del Saboteador.\n3. Hábito de Oro: Usarás tus dones transmutados para tomar control activo del ahorro y la educación financiera.";
    y = addPdfText(doc, actionText, y, { fontSize: 10, color: [51, 65, 85], lineHeight: 5.5 });
    y += 12;

    y = checkPageBreak(doc, y, 20);
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(0.5);
    doc.line(M, y, W - M, y);
    y += 6;

    y = addPdfText(doc, 'ESTADO FINAL: AUTOSABOTAJE NEUTRALIZADO Y SOMBRA INTEGRADA', y, { fontSize: 10, color: [16, 185, 129], fontStyle: 'bold', align: 'center' });
    
    doc.save('reporte-final-sombra.pdf');
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
                  onClick={async () => {
                    const targetView = route ? "home" : "route";
                    setView(targetView);
                    await saveState(route, tasksDone, completedDays, diagAns, targetView);
                  }}
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
          onClick={async () => {
            const targetView = diagAns.length >= 4 ? "result" : "hero";
            setView(targetView);
            await saveState(route, tasksDone, completedDays, diagAns, targetView);
          }}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors uppercase text-sm font-bold tracking-widest"
        >
          <ChevronLeft className="w-5 h-5" /> {diagAns.length >= 4 ? "Ver diagnóstico" : "Volver al inicio"}
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
  // VIEW: FINAL CHALLENGE RESULTS / REPORT (10 Days Completed)
  // ═══════════════════════════════════════════════════════════════════════
  if (view === "results") {
    const totalDays = DAYS.length;
    const completedCount = Object.values(completedDays).filter(Boolean).length;
    const phaseColorMap: Record<string, { bg: string; border: string; text: string; hex: string; glow: string }> = {
      detectar:    { bg: "from-orange-500/10 to-transparent",   border: "border-orange-500/20",   text: "text-orange-500",   hex: "#f97316", glow: "249,115,22" },
      desactivar:  { bg: "from-amber-500/10 to-transparent",    border: "border-amber-500/20",    text: "text-amber-500",    hex: "#f59e0b", glow: "245,158,11" },
      dominar:     { bg: "from-emerald-500/10 to-transparent",  border: "border-emerald-500/20",  text: "text-emerald-500",  hex: "#10b981", glow: "16,185,129" },
    };
    
    return (
      <div className="max-w-5xl mx-auto pb-12">
        <ResultActions 
          onDownloadPDF={generateResultsPDF} 
          onReset={async () => {
            setRoute(null);
            setView("route");
            await saveState(null, {}, {}, [], "route", 1);
          }} 
          resetLabel="Reiniciar todo el Reto"
        />

        <div className="min-h-[70vh] flex flex-col justify-center mt-4">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Header Card */}
            <div className="glass-card p-8 md:p-10 border-t-2 border-t-[#01E47E] relative overflow-hidden text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-[#01E47E]/10 via-transparent to-transparent pointer-events-none" />
              <div className="relative z-10 space-y-4">
                <span className="text-6xl">👑</span>
                <h1 className="text-3xl md:text-5xl font-black uppercase tracking-wider text-white">
                  Reporte de Integración de Sombra
                </h1>
                <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                  Felicidades, <span className="text-[#01E47E] font-black">{userName}</span>. Has completado exitosamente la actividad de 10 días "Mis Emociones" y neutralizado el autosabotaje financiero.
                </p>
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-brand-green text-xs font-black uppercase tracking-widest font-mono">
                  ✓ RETO COMPLETADO ({completedCount}/{totalDays} Días)
                </div>
              </div>
            </div>

            {/* Content Columns */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column: Progress & Score Summary */}
              <div className="glass-card p-6 md:p-8 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center">
                      <span className="text-lg">🎯</span>
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-red-500 uppercase tracking-widest">Diagnóstico Inicial</h3>
                      <p className="text-[10px] text-brand-text-muted uppercase tracking-widest font-mono">Nivel de Sabotaje</p>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white">{diagScore}%</span>
                    <span className="text-red-400 font-bold uppercase tracking-wider text-xs">{diagResult?.title}</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed border-l-4 border-red-500/30 pl-4 py-1 font-medium">
                    {diagResult?.message}
                  </p>
                </div>

                <div className="pt-6 border-t border-white/5 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-white">Fases del Entrenamiento:</h4>
                  <div className="space-y-3 font-medium">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Fase 1: Detectar (Días 1-3)</span>
                      <span className="text-brand-green font-bold font-mono">✓ COMPLETADA</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Fase 2: Desactivar (Días 4-7)</span>
                      <span className="text-brand-green font-bold font-mono">✓ COMPLETADA</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Fase 3: Dominar (Días 8-10)</span>
                      <span className="text-brand-green font-bold font-mono">✓ COMPLETADA</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Improvements */}
              <div className="glass-card p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-cyan/15 border border-brand-cyan/30 flex items-center justify-center">
                    <span className="text-lg">⚡</span>
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-brand-cyan uppercase tracking-widest">Habilidades y Mejoras Integradas</h3>
                    <p className="text-[10px] text-brand-text-muted uppercase tracking-widest font-mono">Cambios en tu Perfil {route === 'operador' ? 'Trader' : 'Finanzas'}</p>
                  </div>
                </div>

                <ul className="space-y-3 text-sm text-slate-300 font-medium">
                  {route === "operador" ? (
                    <>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-[#01E47E] shrink-0 mt-0.5" />
                        <span><strong>Control de Impulsividad:</strong> Capacidad para evitar entradas fuera de plan tras pérdidas (anti-revenge trading).</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-[#01E47E] shrink-0 mt-0.5" />
                        <span><strong>Integración de Emociones:</strong> Uso de impulsos emocionales como alertas tempranas para regular el sizing y el riesgo.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-[#01E47E] shrink-0 mt-0.5" />
                        <span><strong>Protección del Plan:</strong> Neutralización del miedo a perder que provoca cerrar ganadores antes o mover stops irracionalmente.</span>
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-[#01E47E] shrink-0 mt-0.5" />
                        <span><strong>Gasto Emocional Neutralizado:</strong> Mayor conciencia de los detonantes que te impulsaban a gastar dinero por aburrimiento o estrés.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-[#01E47E] shrink-0 mt-0.5" />
                        <span><strong>Saneamiento de Creencias:</strong> Desinstalación de lealtades invisibles de escasez y culpa familiar respecto a prosperar.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-[#01E47E] shrink-0 mt-0.5" />
                        <span><strong>Acción frente a la Procrastinación:</strong> Superación de la resistencia para ahorrar, planificar o invertir de forma inteligente.</span>
                      </li>
                    </>
                  )}
                </ul>

                {/* PDF Action in column */}
                <div className="pt-4">
                  <button
                    onClick={generateResultsPDF}
                    className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.25)] cursor-pointer"
                  >
                    📥 Descargar Reporte Final (PDF)
                  </button>
                </div>
              </div>
            </div>

            {/* Back Button / Next lesson mapping */}
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={async () => {
                  setView("home");
                  await saveState(route, tasksDone, completedDays, diagAns, "home");
                }}
                className="py-3.5 px-8 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-mono uppercase tracking-widest transition-colors cursor-pointer"
              >
                Volver al Mapa del Reto
              </button>
              <button
                onClick={() => navigate('/app')}
                className="py-3.5 px-8 bg-brand-cyan/10 border border-brand-cyan/30 hover:bg-brand-cyan/20 text-brand-cyan rounded-xl text-xs font-mono uppercase tracking-widest transition-colors cursor-pointer"
              >
                Volver a la Ruta Principal
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // VIEW: HOME / DASHBOARD (Vertical Journey)
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto space-y-8 pb-12">
        <style>{`
          @keyframes journey-pulse { 0%, 100% { box-shadow: 0 0 14px rgba(249,115,22,0.12); } 50% { box-shadow: 0 0 28px rgba(249,115,22,0.3); } }
          @keyframes card-shine2 { 0%, 100% { transform: translateX(-150%) skewX(-20deg); } 50% { transform: translateX(150%) skewX(-20deg); } }
        `}</style>

        <CompletionBanner
          ref={bannerRef}
          lessonId="sombra"
          disabled={completedCount < totalDays}
          progressLabel={completedCount < totalDays ? `${completedCount}/${totalDays} días completados` : undefined}
        />

        {/* ── 1. Cabecera Minimalista ── */}
        <div className="glass-card p-6 md:p-8 border-t-2 border-t-orange-500/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-amber-500/5 pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center text-center gap-4">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-wider">
              <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 bg-clip-text text-transparent">
                MIS EMOCIONES
              </span>
            </h1>
            <div className="flex items-center gap-3 justify-center flex-wrap">
              <span className="bg-orange-500/20 text-orange-400 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-orange-500/30">
                {route === "operador" ? "⚔️ Luchador" : "🛡️ Principiante"}
              </span>
              {diagScore > 0 && (
                <span className="bg-amber-500/20 text-amber-400 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-amber-500/30">
                  🎯 Saboteador: {diagScore}%
                </span>
              )}
              {streak > 0 && (
                <span className="bg-red-500/20 text-red-400 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-red-500/30">
                  🔥 Racha: {streak}
                </span>
              )}
            </div>

            {/* Linear Progress Bar */}
            <div className="w-full max-w-md mt-4">
              <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">
                <span>Progreso</span>
                <span className="text-white">{completedCount} de 10 días</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPerc}%` }}
                  className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500"
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. Misión Actual (Hero) ── */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black text-white uppercase tracking-[0.2em] px-3 py-1 bg-white/10 rounded-full">
              TU MISIÓN ACTUAL
            </span>
          </div>

          {!completedDays[nextDay] && nextDay <= 10 ? (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={async () => {
                setSelDay(nextDayData.day);
                setView("day");
                await saveState(route, tasksDone, completedDays, diagAns, "day", nextDayData.day);
              }}
              className="w-full glass-card p-6 md:p-8 text-left relative overflow-hidden cursor-pointer transition-all border-l-4"
              style={{
                borderLeftColor: nextPc.hex,
                borderTopColor: "rgba(255,255,255,0.05)",
                borderRightColor: "rgba(255,255,255,0.05)",
                borderBottomColor: "rgba(255,255,255,0.05)",
                animation: "journey-pulse 2.5s ease-in-out infinite"
              }}
            >
              <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(135deg, ${nextPc.hex}15, transparent 70%)` }} />
              <div className="absolute inset-0 skew-x-[-20deg] pointer-events-none" style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)", animation: "card-shine2 5s ease-in-out infinite" }} />
              
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shrink-0 border border-white/10" style={{ background: `${nextPc.hex}20` }}>
                  {nextDayData.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-black font-mono tracking-widest mb-2" style={{ color: nextPc.hex }}>
                    DÍA {nextDayData.day} · {PHASES[nextDayData.phase].label.toUpperCase()}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider mb-2 leading-tight">
                    {nextDayData.title}
                  </h3>
                  <p className="text-base text-slate-300 italic font-medium">"{nextDayData.hook}"</p>
                </div>
                <div className="shrink-0 w-full md:w-auto mt-4 md:mt-0">
                  <div className="flex items-center justify-center gap-2 bg-white text-black px-6 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-colors">
                    EMPEZAR MISIÓN <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </motion.button>
          ) : (
            <div className="glass-card p-8 text-center border-t-2 border-t-emerald-500/50 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
              <div className="relative z-10 space-y-6">
                <div className="text-6xl">👑</div>
                <h2 className="text-3xl font-black text-emerald-500 uppercase tracking-wider">¡Saboteador Desactivado!</h2>
                <p className="text-slate-300 text-lg mb-6">Has completado el protocolo de 10 días. Sombra integrada, autosabotaje neutralizado.</p>

                <div className="flex flex-wrap justify-center gap-3 mb-8">
                  <button
                    onClick={generateResultsPDF}
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black uppercase tracking-widest text-[10px] md:text-xs rounded-xl transition-all shadow-[0_0_15px_rgba(220,38,38,0.2)] cursor-pointer"
                  >
                    📥 Descargar Reporte Final (PDF)
                  </button>
                  <button
                    onClick={async () => {
                      setView("results");
                      await saveState(route, tasksDone, completedDays, diagAns, "results");
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white font-black uppercase tracking-widest text-[10px] md:text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    🔍 Ver Reporte de Resultados
                  </button>
                </div>
                
                <div className="glass-card p-8 border border-[#01E47E]/30 bg-[#0a1f14]/50 relative overflow-hidden text-center space-y-6 max-w-2xl mx-auto">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <span className="text-8xl">⚡</span>
                  </div>
                  <div className="space-y-2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest bg-brand-green/20 text-[#01E47E] uppercase">
                      ¡Nivel Desbloqueado!
                    </span>
                    <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">
                      Siguiente Módulo: Reto del Flow
                    </h3>
                    <p className="text-sm text-slate-300 max-w-md mx-auto">
                      Entra en la zona de rendimiento óptimo: opera sin miedo, sin ego y con concentración absoluta.
                    </p>
                  </div>
                  <Link
                    to="/app/flow"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#01E47E] text-black font-black uppercase tracking-widest text-xs hover:bg-[#01E47E]/90 hover:scale-[1.02] transition-all cursor-pointer"
                  >
                    Ir a Reto del Flow
                    <ChevronRight className="w-4 h-4 text-black stroke-[3px]" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── 3. Línea de Tiempo Vertical (El Camino) ── */}
        <div className="space-y-6 pt-8 border-t border-white/10">
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-widest">El Camino de 10 Días</h2>
            <p className="text-brand-text-muted text-sm mt-2">Sigue tu progreso a través de las 3 fases del dominio.</p>
          </div>

          <div className="relative max-w-2xl mx-auto">
            {/* Línea conectora central */}
            <div className="absolute top-8 bottom-8 left-[28px] md:left-[50%] w-1 bg-white/5 -ml-[0.5px] rounded-full" />

            {Object.entries(PHASES).map(([phaseKey, phaseObj]) => {
              const daysInPhase = DAYS.filter((d) => d.phase === phaseKey);
              const pc = phaseColorMap[phaseKey];
              
              return (
                <div key={phaseKey} className="relative mb-12 last:mb-0">
                  {/* Phase Marker */}
                  <div className="flex items-center md:justify-center mb-8 relative z-10">
                    <div className="bg-[#0B0C10] px-5 py-2.5 rounded-full border border-white/10 flex items-center gap-3 shadow-xl">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: pc.hex }} />
                      <span className="text-xl">{phaseObj.icon}</span>
                      <span className="text-sm font-black uppercase tracking-widest" style={{ color: pc.hex }}>
                        FASE {phaseObj.label}
                      </span>
                    </div>
                  </div>

                  {/* Days in Phase */}
                  <div className="space-y-4">
                    {daysInPhase.map((d, index) => {
                      const dn = completedDays[d.day];
                      const isNext = d.day === nextDay && !completedDays[nextDay];
                      const lk = getDayStatus(d.day) === "locked";
                      const isEven = index % 2 === 0;

                      return (
                        <div key={d.day} className={cx("relative flex items-center w-full", "md:justify-between")}>
                          {/* Nodo central (círculo) */}
                          <div className="absolute left-[16px] md:left-1/2 md:-ml-4 w-8 h-8 rounded-full bg-[#0B0C10] flex items-center justify-center z-10 border-4 border-[#0B0C10]">
                            <div
                              className="w-full h-full rounded-full flex items-center justify-center text-xs font-black shadow-inner"
                              style={{
                                backgroundColor: dn ? pc.hex : isNext ? `${pc.hex}40` : "rgba(255,255,255,0.1)",
                                color: dn ? "#000" : "#fff",
                                border: isNext ? `2px solid ${pc.hex}` : "none"
                              }}
                            >
                              {dn ? "✓" : d.day}
                            </div>
                          </div>

                          {/* Tarjeta del Día */}
                          <motion.div
                            whileHover={!lk ? { scale: 1.02 } : {}}
                            onClick={async () => {
                              if (!lk) {
                                setSelDay(d.day);
                                setView("day");
                                await saveState(route, tasksDone, completedDays, diagAns, "day", d.day);
                              }
                            }}
                            className={cx(
                              "w-[calc(100%-4rem)] ml-16 md:ml-0 md:w-[calc(50%-2.5rem)]",
                              !isEven ? "md:order-last" : "md:order-first md:text-right"
                            )}
                          >
                            <div
                              className={cx(
                                "p-4 rounded-xl transition-all relative glass-card",
                                lk ? "opacity-40 grayscale cursor-not-allowed border-transparent bg-white/5" : "cursor-pointer hover:bg-white/10"
                              )}
                              style={{
                                borderColor: isNext ? pc.hex : dn ? `${pc.hex}50` : "rgba(255,255,255,0.05)",
                                borderWidth: isNext ? 2 : 1,
                                boxShadow: isNext ? `0 0 20px ${pc.hex}20` : "none"
                              }}
                            >
                              <div className={cx("flex items-center gap-3", !isEven ? "flex-row" : "md:flex-row-reverse flex-row")}>
                                <div className="text-3xl shrink-0">{d.icon}</div>
                                <div className="flex-1">
                                  <div className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: lk ? "#64748b" : pc.hex }}>
                                    DÍA {d.day}
                                  </div>
                                  <div className="text-sm font-black text-white leading-tight">
                                    {d.title}
                                  </div>
                                </div>
                                {lk && <Lock className="w-4 h-4 text-slate-500 shrink-0" />}
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 4. Acciones Secundarias ── */}
        <div className="grid md:grid-cols-2 gap-4 pt-8 border-t border-white/10">
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Share2 className="w-5 h-5 text-orange-500" />
              <h3 className="font-black uppercase tracking-wider text-sm">Comparte tu Progreso</h3>
            </div>
            <p className="text-xs text-slate-400 font-medium">Invita a otros traders a enfrentarse a su propio Saboteador.</p>
            <div className="flex gap-2">
              <button onClick={() => handleSocialShare('whatsapp')} className="flex-1 p-2 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 transition-all flex justify-center text-[#25D366]">
                <span className="text-sm">💬</span>
              </button>
              <button onClick={() => handleSocialShare('twitter')} className="flex-1 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all flex justify-center text-white/70">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.258 5.63 5.906-5.63Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> 
              </button>
              <button onClick={handleCopyLink} className="flex-1 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all flex justify-center text-slate-400">
                {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="glass-card p-6 flex flex-col justify-center items-center text-center space-y-3">
            <h3 className="font-black uppercase tracking-wider text-sm text-slate-300">¿Quieres cambiar de misión?</h3>
            <p className="text-xs text-slate-500 font-medium">Revisa tu diagnóstico o cambia entre Principiante y Operador.</p>
            <button
              onClick={async () => {
                setRoute(null);
                setView("route");
                await saveState(null, tasksDone, completedDays, diagAns, "route", selDay);
              }}
              className="text-orange-400 hover:text-orange-300 transition-colors uppercase font-black text-xs tracking-widest px-4 py-2 bg-orange-500/10 rounded-lg hover:bg-orange-500/20"
            >
              🔄 Cambiar de Ruta
            </button>
          </div>
        </div>

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
        onClick={async () => {
          setView("home");
          await saveState(route, tasksDone, completedDays, diagAns, "home", selDay);
        }}
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
                    "text-slate-400 text-sm md:text-base whitespace-pre-line",
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
                Le ganaste otra batalla a tu Saboteador. Continúa con tu entrenamiento diario.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
              {selDay < 10 && (
                <button
                  onClick={() => {
                    setSelDay(selDay + 1);
                    setView("day");
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto cursor-pointer rounded-xl px-8 py-3.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.25)] hover:shadow-[0_0_25px_rgba(220,38,38,0.4)]"
                >
                  Ir al siguiente día →
                </button>
              )}
              <button
                onClick={async () => {
                  if (selDay < 10) {
                    const nextD = selDay + 1;
                    setSelDay(nextD);
                    setView("day");
                    await saveState(route, tasksDone, completedDays, diagAns, "day", nextD);
                    navigate("/app");
                  } else {
                    setView("home");
                    await saveState(route, tasksDone, completedDays, diagAns, "home", selDay);
                    // Trigger big completion confetti on manual results view entry!
                    setTimeout(() => {
                      confetti({
                        particleCount: 300,
                        spread: 120,
                        origin: { y: 0.4 },
                        colors: ["#01E47E", "#10b981", "#f59e0b", "#f97316"],
                      });
                    }, 100);
                  }
                }}
                className="w-full sm:w-auto cursor-pointer rounded-xl px-8 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-black uppercase tracking-widest transition-all duration-300"
              >
                {selDay < 10 ? "Continuar mañana" : "Finalizar Reto"}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
