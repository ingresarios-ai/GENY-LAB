import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import {
  ChevronLeft, CheckCircle, Share2,    Copy, Check,
  Lock, Unlock, Zap, Brain, BookOpen, Search, ChevronRight, ArrowRight
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { saveActivityProgressDB, loadActivityProgressDB, clearActivityProgressDB } from '../../lib/activitySync';
import { markActivityCompleted } from "../../lib/progressStore";
import confetti from "canvas-confetti";
import {
  DAYS, PHASES, TRACKS, ARQUETIPOS, EMOCIONES, GLOSARIO, TIPO_COLOR,
  type RouteType, type FlowDay
} from "./reto-flow/constants";
import ShareModule from "../../components/ShareModule";
import ResultActions from "../../components/ResultActions";
import CompletionBanner from '../../components/CompletionBanner';
import jsPDF from "jspdf";
import { initPdfWithHeader, addPdfText, checkPageBreak } from '../../utils/pdfUtils';
// ── Helpers ────────────────────────────────────────────────────────────────
function cx(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

// ── BADGE ──────────────────────────────────────────────────────────────────
function Badge({ tipo }: { tipo: string }) {
  const c = TIPO_COLOR[tipo] || "#7c3aed";
  return (
    <span
      className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border"
      style={{ background: c + "22", color: c, borderColor: c + "44" }}
    >
      {tipo}
    </span>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════
export default function RetoFlow() {
  const user = { id: "local-user" };
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const userName = 'Trader'?.split(" ")[0] || "Trader";
  const bannerRef = useRef<HTMLDivElement>(null);

  // State
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState<RouteType | null>(null);
  const [arquetipo, setArquetipo] = useState<string | null>(null);
  const [tasksDone, setTasksDone] = useState<Record<string, boolean>>({});
  const [completedDays, setCompletedDays] = useState<Record<number, boolean>>({});
  const [emociones, setEmociones] = useState<Record<number, string>>({});
  const [view, setView] = useState<"route" | "arquetipo" | "home" | "day" | "glosario" | "results">("route");
  const [selDay, setSelDay] = useState<number>(1);
  const [copiedLink, setCopiedLink] = useState(false);
  const [glosarioQuery, setGlosarioQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // ── Load saved progress ─────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        if (searchParams.get('reset') === 'true') {
          await clearActivityProgressDB('flow');
          setSearchParams({}, { replace: true });
          setLoading(false);
          return;
        }
        const queryView = searchParams.get('view');
        const saved = await loadActivityProgressDB('flow');
        if (saved && saved.metadata) {
          const r = saved.metadata;
          if (r.route) setRoute(r.route);
          if (r.arquetipo) setArquetipo(r.arquetipo);
          if (r.tasksDone) setTasksDone(r.tasksDone);
          if (r.completedDays) setCompletedDays(r.completedDays);
          if (r.emociones) setEmociones(r.emociones);
          if (r.view) setView(r.view);
          if (r.selDay) setSelDay(r.selDay);
          const isCompleted = Object.keys(r.completedDays || {}).length === DAYS.length && Object.values(r.completedDays || {}).every(Boolean);
          if (isCompleted || saved.completed) {
            markActivityCompleted('flow');
          }
        }
        if (queryView === 'results') {
          setView('results');
        }
      } catch (e) {
        console.error('Error loading flow progress:', e);
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Persist to DB ────────────────────────────────────────────────────────
  const saveState = async (
    newRoute = route,
    newArq = arquetipo,
    newTasks = tasksDone,
    newDays = completedDays,
    newEmo = emociones,
    newView?: string,
    newSelDay?: number,
  ) => {
    try {
      const dataToSave = {
        route: newRoute,
        arquetipo: newArq,
        tasksDone: newTasks,
        completedDays: newDays,
        emociones: newEmo,
        view: newView || view,
        selDay: newSelDay !== undefined ? newSelDay : selDay,
      };
      const isCompleted = Object.keys(newDays).length === DAYS.length && Object.values(newDays).every(Boolean);
      await saveActivityProgressDB('flow', dataToSave, isCompleted);
      if (isCompleted) {
        markActivityCompleted('flow');
      }
    } catch (e) {
      console.error('Error saving flow progress:', e);
    }
  };

  // ── Day progression ────────────────────────────────────────────────────
  const getDayStatus = (day: number): "done" | "active" | "locked" => {
    if (completedDays[day]) return "done";
    if (day === 1) return "active";
    if (completedDays[day - 1]) return "active";
    return "locked";
  };

  const selectRoute = async (r: RouteType) => {
    setRoute(r);
    setView("arquetipo");
    await saveState(r, arquetipo, tasksDone, completedDays, emociones, "arquetipo");
  };

  const selectArquetipo = async (arqId: string) => {
    setArquetipo(arqId);
    setView("home");
    await saveState(route, arqId, tasksDone, completedDays, emociones, "home");
  };

  // ── Toggle task ────────────────────────────────────────────────────────
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
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#00E676", "#00D1FF", "#7c3aed"],
      });
    } else if (!allDone && completedDays[selDay]) {
      newDays[selDay] = false;
    }

    setCompletedDays(newDays);
    await saveState(route, arquetipo, newTasks, newDays, emociones, view, selDay);

    // No auto-redirect. Let the user stay on the Day 10 view to read details/download PDF and click "Ver resultados" manually.
  };

  // ── Share ──────────────────────────────────────────────────────────────
  const generateShareUrl = () => {
    const payload = {
      t: "flow",
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
    let sText = "Estoy entrenando mi estado de Flow con el Reto 10 Días al Flow de GENY LAB. Únete.";
    if (completedDays[selDay] && dayData) {
      sText = `Acabo de completar el Día ${selDay}: "${dayData.title}" del Reto 10 Días al Flow. ⚡ Otro día dominando mi estado mental.`;
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

  const generateResultsPDF = async () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
      let y = initPdfWithHeader(doc, 'Reto Flow');
      const W = 210, M = 18;
      
      // Title
      doc.setTextColor(15, 23, 42); // slate-900
      doc.setFontSize(22); 
      doc.setFont('helvetica', 'bold');
      doc.text('REPORTE DE INTEGRACIÓN DEL FLOW', M, y); 
      y += 10;

      const intro = `¡Felicidades, ${userName}! Has completado los 10 días del Reto del Flow ("El estado de máximo rendimiento"). Este reporte resume tu progreso, el perfil de flow elegido y tu arquetipo integrado. Has entrenado tu mente para operar y tomar decisiones financieras desde la serenidad del Self.`;
      y = addPdfText(doc, intro, y, { fontSize: 11, color: [51, 65, 85], lineHeight: 6 });
      y += 8;

      // Route / Profile
      y = checkPageBreak(doc, y, 40);
      const trackInfo = TRACKS[route || 'novato'];
      y = addPdfText(doc, `1. TU PERFIL: ${trackInfo?.nombre.toUpperCase()}`, y, { fontSize: 14, color: [0, 209, 255], fontStyle: 'bold' });
      y += 6;
      y = addPdfText(doc, trackInfo?.desc || '', y, { fontSize: 10, color: [51, 65, 85], lineHeight: 5 });
      y += 8;

      // Archetype
      y = checkPageBreak(doc, y, 40);
      const arqInfo = ARQUETIPOS.find((a) => a.id === arquetipo);
      y = addPdfText(doc, `2. TU ARQUETIPO: ${arqInfo?.nombre.toUpperCase()}`, y, { fontSize: 14, color: [124, 58, 237], fontStyle: 'bold' });
      y += 6;
      y = addPdfText(doc, arqInfo?.desc || '', y, { fontSize: 10, color: [51, 65, 85], lineHeight: 5 });
      y += 8;

      // Phase Summary
      y = checkPageBreak(doc, y, 45);
      y = addPdfText(doc, '3. RESUMEN DE FASES DEL RETO', y, { fontSize: 14, color: [15, 23, 42], fontStyle: 'bold' });
      y += 6;

      // Phase 1
      y = addPdfText(doc, 'FASE 1: ACTIVACIÓN (Días 1 a 3)', y, { fontSize: 11, color: [242, 197, 0], fontStyle: 'bold' });
      y += 4;
      const phase1Text = "• Aprendiste a identificar tu Mapa de Flow Personal a partir de tus experiencias pasadas.\n• Construiste tu Mapa Emocional honesto de decisiones con el dinero.\n• Diseñaste tu Ritual de Entrada Pre-Operativa para calmar tu mente y activar el foco a voluntad.";
      y = addPdfText(doc, phase1Text, y, { fontSize: 10, color: [51, 65, 85], lineHeight: 5 });
      y += 6;

      // Phase 2
      y = checkPageBreak(doc, y, 40);
      y = addPdfText(doc, 'FASE 2: PROFUNDIZACIÓN (Días 4 a 7)', y, { fontSize: 11, color: [0, 209, 255], fontStyle: 'bold' });
      y += 4;
      const phase2Text = "• Identificaste la voz del miedo y la utilizaste como información reguladora de riesgo.\n• Implementaste la metodología PEDEM (Planear-Ejecutar-Documentar-Evaluar-Mejorar) de manera consciente.\n• Aprendiste a distinguir las decisiones reactivas del Ego de las decisiones claras del Self.\n• Entrenaste bloques de Concentración Pura sin distracciones físicas ni digitales.";
      y = addPdfText(doc, phase2Text, y, { fontSize: 10, color: [51, 65, 85], lineHeight: 5 });
      y += 6;

      // Phase 3
      y = checkPageBreak(doc, y, 40);
      y = addPdfText(doc, 'FASE 3: INTEGRACIÓN (Días 8 a 10)', y, { fontSize: 11, color: [0, 230, 118], fontStyle: 'bold' });
      y += 4;
      const phase3Text = "• Integraste tu sistema de flow personalizado en tu rutina diaria.\n• Alquimizaste tu sombra emocional en un factor de protección en los mercados.\n• Construiste tu Manifiesto Personal del Flow para mantener el estado mental de alto rendimiento.";
      y = addPdfText(doc, phase3Text, y, { fontSize: 10, color: [51, 65, 85], lineHeight: 5 });
      y += 10;

      // Action plan
      y = checkPageBreak(doc, y, 45);
      y = addPdfText(doc, '4. TU PLAN DE ACCIÓN RECOMENDADO', y, { fontSize: 14, color: [15, 23, 42], fontStyle: 'bold' });
      y += 6;

      const actionText = route === "trader"
        ? "1. Ritual Pre-Trading: Seguirás ejecutando tu rutina de respiración, delimitación de setups y definición de sesgo antes de ver la pantalla.\n2. Bitácora de Flow: Mantendrás el registro de tu nivel de flow y emociones en cada sesión.\n3. Alquimia: Usarás tus disparadores de ego (frustración, codicia) como señales técnicas para modular tu riesgo y sizing."
        : "1. Ritual de Foco: Dedicarás 10 minutos a silenciar tu entorno y respirar antes de tomar cualquier decisión de inversión o gasto relevante.\n2. Bitácora del Self: Observarás cuándo es tu ego reactivo el que quiere comprar o gastar imprevistamente.\n3. Aprendizaje Compuesto: Aplicarás PEDEM en cada meta financiera personal.";
      y = addPdfText(doc, actionText, y, { fontSize: 10, color: [51, 65, 85], lineHeight: 5.5 });
      y += 12;

      y = checkPageBreak(doc, y, 20);
      doc.setDrawColor(0, 230, 118);
      doc.setLineWidth(0.5);
      doc.line(M, y, W - M, y);
      y += 6;

      y = addPdfText(doc, 'ESTADO FINAL: MASTER DEL FLOW EN GENY LAB', y, { fontSize: 10, color: [0, 230, 118], fontStyle: 'bold', align: 'center' });
      doc.save(`reporte-integracion-flow.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // ════════════════════════════════════════════════════════════════════════
  // LOADING
  // ════════════════════════════════════════════════════════════════════════
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-brand-green">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
          <Zap className="w-8 h-8" />
        </motion.div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // VIEW: ROUTE SELECTION
  // ════════════════════════════════════════════════════════════════════════
  if (view === "route" || !route) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8 pb-12">
        <Link
          to="/app/leccion/flow"
          className="inline-flex items-center gap-2 text-brand-text-muted hover:text-white transition-colors uppercase font-black text-xs tracking-[0.2em]"
        >
          <ChevronLeft className="w-4 h-4" /> Volver a la Lección
        </Link>
        <div className="text-center space-y-4 pt-4">
          <div className="text-7xl mb-2">⚡</div>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-brand-green via-brand-blue to-brand-purple bg-clip-text text-transparent uppercase tracking-wider">
            RETO 10 DÍAS AL FLOW
          </h1>
        </div>

        {/* ── ¿Qué es el Flow? — Intro Card ── */}
        <div className="glass-card relative overflow-hidden border-t-2 border-t-brand-green/40">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-green/8 via-brand-blue/5 to-brand-purple/5 pointer-events-none" />
          {/* Decorative glow */}
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-brand-green/10 blur-[60px] pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-brand-blue/10 blur-[60px] pointer-events-none" />

          <div className="relative z-10 p-6 md:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-green/20 border border-brand-green/30 flex items-center justify-center">
                <Zap className="w-5 h-5 text-brand-green" />
              </div>
              <div>
                <h2 className="text-xs font-black text-brand-green uppercase tracking-[0.3em]">¿Qué es el Flow?</h2>
                <p className="text-[10px] text-brand-text-muted uppercase tracking-widest">El estado de máximo rendimiento</p>
              </div>
            </div>

            {/* Main definition */}
            <blockquote className="border-l-4 border-brand-green/40 pl-5 py-1">
              <p className="text-lg md:text-xl text-white font-medium leading-relaxed">
                El estado mental de <span className="text-brand-green font-black">máximo rendimiento</span> donde 
                el tiempo se distorsiona, las distracciones desaparecen y actúas desde tu <span className="text-brand-yellow font-black">mejor versión</span>. 
                Ni aburrido ni ansioso: <span className="text-brand-blue font-black">en la zona exacta</span>.
              </p>
            </blockquote>



            {/* CTA text */}
            <p className="text-center text-brand-text-muted text-sm font-medium">
              En 10 días entrenarás tu mente para activar el flow a voluntad.
              <br />
              <span className="text-brand-yellow font-black text-base">Elige tu camino, {userName}.</span>
            </p>

            {/* Animated bouncing arrow */}
            <div className="flex justify-center pt-2">
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="w-10 h-10 rounded-full bg-brand-yellow/20 border border-brand-yellow/30 flex items-center justify-center"
              >
                <ChevronLeft className="w-5 h-5 text-brand-yellow -rotate-90" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Instruction */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-brand-yellow/50 to-transparent" />
          <span className="text-brand-yellow text-base md:text-lg font-black uppercase tracking-[0.2em] whitespace-nowrap">Selecciona tu perfil para comenzar</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-brand-yellow/50 to-transparent" />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* NOVATO */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => selectRoute("novato")}
            className="cursor-pointer glass-card p-6 md:p-8 text-left h-full border-t-2 border-t-brand-green/30 hover:border-brand-green/60 transition-all group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-green/5 via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-brand-green/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Brain className="w-6 h-6 text-brand-green" />
              </div>
              <h2 className="text-2xl font-black text-brand-green mb-1 uppercase tracking-wider">🌱 {TRACKS.novato.nombre}</h2>
              <p className="text-brand-yellow text-xs font-bold italic mb-4">"{TRACKS.novato.tagline}"</p>
              <p className="text-slate-400 mb-6 min-h-[60px]">{TRACKS.novato.desc}</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-brand-green shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-300">Dominarás tu mente y emociones antes de operar.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-brand-green shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-300">Aprenderás flow sin terminología financiera.</span>
                </li>
              </ul>
            </div>
          </motion.button>

          {/* TRADER */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => selectRoute("trader")}
            className="cursor-pointer glass-card p-6 md:p-8 text-left h-full border-t-2 border-t-brand-blue/30 hover:border-brand-blue/60 transition-all group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Zap className="w-32 h-32 text-brand-blue" />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-brand-blue/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-brand-blue" />
              </div>
              <h2 className="text-2xl font-black text-brand-blue mb-1 uppercase tracking-wider">⚡ {TRACKS.trader.nombre}</h2>
              <p className="text-brand-yellow text-xs font-bold italic mb-3">"{TRACKS.trader.tagline}"</p>
              <div className="flex items-start gap-2 px-3 py-2 bg-brand-blue/10 border border-brand-blue/20 rounded-lg mb-4">
                <span className="text-brand-blue text-xs mt-0.5">⚠️</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">Solo selecciona esta ruta si operas con <strong className="text-brand-blue">capital real</strong>. Si operas en demo o aún no operas, elige <strong className="text-brand-green">la otra ruta</strong>.</p>
              </div>
              <p className="text-slate-400 mb-6 min-h-[60px]">{TRACKS.trader.desc}</p>
              <ul className="space-y-3 relative z-10">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-300">Integrarás PEDEM con flow y psicología profunda.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-300">Transformarás tu trading con consciencia total.</span>
                </li>
              </ul>
            </div>
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // VIEW: ARQUETIPO SELECTION
  // ════════════════════════════════════════════════════════════════════════
  if (view === "arquetipo" || !arquetipo) {
    const trackInfo = TRACKS[route];
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-2xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="text-6xl">{trackInfo.emoji}</div>
          <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-wider">Tu Arquetipo de Flow</h2>
          <p className="text-brand-text-muted text-lg font-medium">
            ¿Con cuál te identificas más, <span className="text-brand-yellow font-black">{userName}</span>?
          </p>
        </div>

        {/* ── Intro: ¿Qué es un arquetipo? ── */}
        <div className="glass-card relative overflow-hidden border-t-2 border-t-brand-yellow/30">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-yellow/5 via-transparent to-brand-green/5 pointer-events-none" />
          <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-brand-yellow/10 blur-[50px] pointer-events-none" />
          <div className="relative z-10 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand-yellow/20 border border-brand-yellow/30 flex items-center justify-center">
                <span className="text-lg">🎭</span>
              </div>
              <h3 className="text-xs font-black text-brand-yellow uppercase tracking-[0.3em]">¿Qué es un Arquetipo?</h3>
            </div>
            <p className="text-base text-slate-300 leading-relaxed">
              Carl Jung descubrió que todos compartimos <span className="text-brand-yellow font-bold">patrones profundos de personalidad</span> que 
              determinan cómo enfrentamos desafíos. Tu arquetipo no es un rol — es tu <span className="text-brand-green font-bold">forma natural de entrar en flow</span>. 
              Conocerlo personaliza completamente tu experiencia en este reto.
            </p>
          </div>
        </div>

        {/* Arquetipo Cards */}
        <div className="space-y-4">
          {ARQUETIPOS.map((a) => (
            <motion.button
              key={a.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => selectArquetipo(a.id)}
              className={cx(
                "cursor-pointer w-full text-left p-6 rounded-2xl border-2 transition-all duration-300",
                arquetipo === a.id
                  ? "bg-brand-green/10 border-brand-green shadow-[0_0_20px_rgba(0,255,136,0.15)]"
                  : "bg-white/[0.03] border-white/5 hover:border-white/20 hover:bg-white/[0.05]"
              )}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{a.emoji}</span>
                <span className={cx(
                  "font-black uppercase tracking-widest text-base",
                  arquetipo === a.id ? "text-brand-green" : "text-white"
                )}>
                  {a.nombre}
                </span>
              </div>
              <p className="text-sm text-brand-text-muted leading-relaxed font-medium pl-[44px]">
                {a.desc}
              </p>
            </motion.button>
          ))}
        </div>
      </motion.div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // VIEW: GLOSARIO
  // ════════════════════════════════════════════════════════════════════════
  if (view === "glosario") {
    const q = glosarioQuery.toLowerCase();
    const lista = q
      ? GLOSARIO.filter((g) => g.term.toLowerCase().includes(q) || g.def.toLowerCase().includes(q))
      : GLOSARIO;

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto pb-12 space-y-6">
        <button
          onClick={async () => {
            setView("home");
            await saveState(route, arquetipo, tasksDone, completedDays, emociones, "home");
          }}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors uppercase text-sm font-bold tracking-widest"
        >
          <ChevronLeft className="w-5 h-5" /> Volver
        </button>

        <div className="glass-card p-6 border-t-2 border-t-brand-green/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-green/5 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 flex items-center gap-4">
            <BookOpen className="w-8 h-8 text-brand-green" />
            <div>
              <h2 className="text-2xl font-black text-brand-green uppercase tracking-wider">Glosario del Flow</h2>
              <p className="text-brand-text-muted text-sm">{GLOSARIO.length} términos explicados sin jerga</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={glosarioQuery}
            onChange={(e) => setGlosarioQuery(e.target.value)}
            placeholder="Buscar término..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:border-brand-green outline-none transition-colors"
          />
        </div>

        <div className="space-y-3">
          {lista.length === 0 && (
            <div className="text-center text-brand-text-muted py-10">No se encontró ese término.</div>
          )}
          {lista.map((g, i) => (
            <div key={i} className="glass-card p-5 border-l-4 border-l-brand-green/30">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{g.emoji}</span>
                <span className="text-brand-green font-black uppercase tracking-wider text-sm">{g.term}</span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">{g.def}</p>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // VIEW: FINAL CHALLENGE RESULTS / REPORT (10 Days Completed)
  // ════════════════════════════════════════════════════════════════════════
  if (view === "results") {
    const totalDays = DAYS.length;
    const completedCount = Object.values(completedDays).filter(Boolean).length;
    const trackInfo = TRACKS[route || "novato"];
    const arqInfo = ARQUETIPOS.find((a) => a.id === arquetipo);

    return (
      <div className="max-w-5xl mx-auto pb-12 space-y-8">
        <ResultActions 
          onDownloadPDF={generateResultsPDF} 
          onReset={async () => {
            setRoute(null);
            setArquetipo(null);
            setCompletedDays({});
            setTasksDone({});
            setEmociones({});
            setView("route");
            await saveState(null, null, {}, {}, {}, "route", 1);
          }} 
          resetLabel="Reiniciar todo el Reto"
        />

        <div className="min-h-[70vh] flex flex-col justify-center gap-8">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Header Card */}
            <div className="glass-card p-8 md:p-10 border-t-2 border-t-[#00D1FF] relative overflow-hidden text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00D1FF]/10 via-transparent to-transparent pointer-events-none" />
              <div className="relative z-10 space-y-4">
                <span className="text-6xl">🏆</span>
                <h1 className="text-3xl md:text-5xl font-black uppercase tracking-wider text-white">
                  Reporte de Integración de Flow
                </h1>
                <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                  Felicidades, <span className="text-[#00D1FF] font-black">{userName}</span>. Has completado exitosamente la actividad de 10 días "Reto del Flow" y entrenado tu mente para operar desde la serenidad del Self.
                </p>
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#00D1FF]/10 border border-[#00D1FF]/30 rounded-full text-[#00D1FF] text-xs font-black uppercase tracking-widest font-mono">
                  ✓ RETO COMPLETADO ({completedCount}/{totalDays} Días)
                </div>
              </div>
            </div>

            {/* Content Columns */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column: Track & Archetype */}
              <div className="glass-card p-6 md:p-8 space-y-6 flex flex-col justify-between">
                <div className="space-y-6">
                  {/* Track info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-blue/15 border border-brand-blue/30 flex items-center justify-center">
                        <span className="text-lg">{trackInfo?.emoji}</span>
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-brand-blue uppercase tracking-widest">Ruta de Entrenamiento</h3>
                        <p className="text-[10px] text-brand-text-muted uppercase tracking-widest font-mono">{trackInfo?.nombre}</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed italic">
                      "{trackInfo?.tagline}"
                    </p>
                  </div>
                  
                  {/* Archetype info */}
                  <div className="pt-6 border-t border-white/5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-purple/15 border border-brand-purple/30 flex items-center justify-center">
                        <span className="text-lg">{arqInfo?.emoji}</span>
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-brand-purple uppercase tracking-widest">Tu Arquetipo de Flow</h3>
                        <p className="text-[10px] text-brand-text-muted uppercase tracking-widest font-mono">{arqInfo?.nombre}</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed font-medium">
                      {arqInfo?.desc}
                    </p>
                  </div>
                </div>

                {/* Phases summary */}
                <div className="pt-6 border-t border-white/5 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-white">Fases del Entrenamiento:</h4>
                  <div className="space-y-3 font-medium">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Fase 1: Activación (Días 1-3)</span>
                      <span className="text-brand-green font-bold font-mono">✓ COMPLETADA</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Fase 2: Profundización (Días 4-7)</span>
                      <span className="text-brand-green font-bold font-mono">✓ COMPLETADA</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Fase 3: Integración (Días 8-10)</span>
                      <span className="text-brand-green font-bold font-mono">✓ COMPLETADA</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Improvements & Skills */}
              <div className="glass-card p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-green/15 border border-brand-green/30 flex items-center justify-center">
                    <span className="text-lg">⚡</span>
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-brand-green uppercase tracking-widest">Habilidades y Mejoras Integradas</h3>
                    <p className="text-[10px] text-brand-text-muted uppercase tracking-widest font-mono">Cambios en tu Perfil {route === 'trader' ? 'Trader' : 'Finanzas'}</p>
                  </div>
                </div>

                <ul className="space-y-3 text-sm text-slate-300 font-medium">
                  {route === "trader" ? (
                    <>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-brand-green shrink-0 mt-0.5" />
                        <span><strong>Foco Absoluto:</strong> Capacidad para operar libre de distracciones externas e internas.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-brand-green shrink-0 mt-0.5" />
                        <span><strong>Coherencia Cardíaca:</strong> Control de tu respiración pre-trading para modular la respuesta al estrés.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-brand-green shrink-0 mt-0.5" />
                        <span><strong>Decisiones desde el Self:</strong> Identificación oportuna de los sesgos y venganza del ego.</span>
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-brand-green shrink-0 mt-0.5" />
                        <span><strong>Presencia Consciente:</strong> Enfoque ininterrumpido en la planeación y tareas financieras.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-brand-green shrink-0 mt-0.5" />
                        <span><strong>Saneamiento Emocional:</strong> Observación de los impulsos inconscientes de gasto/riesgo en tus finanzas diarias.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-brand-green shrink-0 mt-0.5" />
                        <span><strong>Framework PEDEM:</strong> Hábito de planeación, ejecución y evaluación en tus metas de vida.</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            {/* Booking CTA Card */}
            <div className="glass-card p-8 md:p-10 border border-[#F2C500]/30 bg-gradient-to-r from-[#F2C500]/10 to-transparent relative overflow-hidden rounded-3xl text-center space-y-6">
              <div className="absolute top-0 right-0 p-8 text-8xl opacity-[0.03] pointer-events-none">
                🏆
              </div>
              <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
                <span className="text-[#F2C500] font-mono text-xs font-black uppercase tracking-[0.2em]">¡RECOMPENSA FINAL DESBLOQUEADA!</span>
                <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider">
                  Tu Sesión Diagnóstico de Consistencia
                </h2>
                <p className="text-white/70 text-sm md:text-base leading-relaxed">
                  Has completado las 7 actividades core del reto. El acceso a tu sesión privada 1-a-1 valorada en <strong>$1,000 USD</strong> está totalmente liberado. Agenda tu horario en el calendario de inmediato para asegurar tu lugar.
                </p>
                
                <div className="pt-4">
                  <Link 
                    to="/app/diagnostico" 
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black px-8 py-4 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(245,158,11,0.2)] hover:shadow-[0_0_40px_rgba(245,158,11,0.4)]"
                  >
                    <span>Agendar Sesión Diagnóstico ➔</span>
                  </Link>
                </div>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // VIEW: HOME / DASHBOARD
  // ════════════════════════════════════════════════════════════════════════
  if (view === "home") {
    const totalDays = DAYS.length;
    const completedCount = Object.values(completedDays).filter(Boolean).length;
    const progressPerc = Math.round((completedCount / totalDays) * 100);
    const trackInfo = TRACKS[route];
    const arqInfo = ARQUETIPOS.find((a) => a.id === arquetipo);

    // Phase color map — matches the Sombra pattern
    const phaseColorMap: Record<string, { bg: string; border: string; text: string }> = {
      activacion:     { bg: "from-brand-yellow/10 to-transparent", border: "border-brand-yellow/20", text: "text-brand-yellow" },
      profundizacion: { bg: "from-brand-blue/10 to-transparent",   border: "border-brand-blue/20",   text: "text-brand-blue" },
      integracion:    { bg: "from-brand-green/10 to-transparent",  border: "border-brand-green/20",  text: "text-brand-green" },
    };

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto space-y-8 pb-12">
        <CompletionBanner ref={bannerRef} lessonId="flow" disabled={completedCount < totalDays} progressLabel={`${completedCount} de ${totalDays} días completados`} />

        {completedCount === totalDays && (
          <div className="glass-card p-8 text-center border-t-2 border-t-brand-green/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-green/10 via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <div className="text-6xl">👑</div>
              <h2 className="text-3xl font-black text-brand-green uppercase tracking-wider">¡Felicidades, Master del Flow!</h2>
              <p className="text-slate-300 text-lg">Has completado los 10 días del Reto del Flow. Has integrado tu mentalidad con el mercado.</p>
              
              <div className="max-w-md mx-auto py-6 border-t border-b border-white/5 my-6 space-y-4">
                <button
                  onClick={() => setView("results")}
                  className="w-full cursor-pointer inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-brand-green/20 border border-brand-green/30 text-brand-green hover:bg-brand-green/30 transition-all text-xs font-mono uppercase tracking-widest rounded-xl"
                >
                  📊 Ver Reporte Completo
                </button>
                
                <div className="pt-4 border-t border-white/5">
                  <p className="text-xs text-brand-green font-black uppercase tracking-widest mb-3">Comparte tu victoria</p>
                  <ShareModule 
                    activity="flow" 
                    title="Reto 10 Días al Flow" 
                    resultData={{ selDay: 10, title: "Reto Completado", route, arquetipo }}
                    shareMessage={`¡He completado con éxito los 10 días del Reto del Flow en GENY LAB! ⚡ Mente en calma, operativa consistente. Únete al reto.`}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Header Card ── */}
        <div className="glass-card p-6 md:p-8 border-t-2 border-t-brand-green/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-green/10 via-transparent to-brand-blue/5 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-brand-green uppercase tracking-wider mb-2">
                RETO 10 DÍAS AL FLOW
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="bg-brand-green/20 text-brand-green px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-brand-green/30">
                  {trackInfo.emoji} {trackInfo.nombre}
                </span>
                {arqInfo && (
                  <span className="bg-brand-blue/20 text-brand-blue px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-brand-blue/30">
                    {arqInfo.emoji} {arqInfo.nombre}
                  </span>
                )}
                <button
                  onClick={async () => {
                    setRoute(null);
                    setArquetipo(null);
                    setView("route");
                    await saveState(null, null, tasksDone, completedDays, emociones, "route");
                  }}
                  className="text-xs text-brand-yellow hover:text-white underline transition font-bold"
                >
                  Cambiar
                </button>
              </div>
            </div>

            <div className="w-full md:w-1/3 space-y-2">
              <div className="flex justify-between text-sm font-black uppercase tracking-wider">
                <span className="text-brand-text-muted">Progreso</span>
                <span className="text-brand-yellow">{progressPerc}%</span>
              </div>
              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPerc}%` }}
                  className="h-full bg-gradient-to-r from-brand-yellow via-brand-blue to-brand-green"
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-brand-text-muted">
                <span>{completedCount} de {totalDays} días</span>
                <span className="text-brand-green">{completedCount > 0 ? "🔥 Activo" : "Inicia hoy"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Glosario Button ── */}
        <button
          onClick={async () => {
            setView("glosario");
            await saveState(route, arquetipo, tasksDone, completedDays, emociones, "glosario");
          }}
          className="w-full glass-card p-4 flex items-center gap-4 text-left border-l-4 border-l-brand-green/30 hover:bg-white/[0.04] transition-all group"
        >
          <BookOpen className="w-6 h-6 text-brand-green group-hover:scale-110 transition-transform" />
          <div className="flex-1">
            <div className="text-brand-green font-black text-sm uppercase tracking-wider">📖 Glosario del Flow</div>
            <div className="text-brand-text-muted text-xs">{GLOSARIO.length} términos explicados sin jerga</div>
          </div>
          <ChevronLeft className="w-5 h-5 text-brand-green rotate-180" />
        </button>

        {/* ── Phases + Day Cards ── */}
        <div className="space-y-12">
          {Object.entries(PHASES).map(([phaseKey, phaseObj]) => {
            const daysInPhase = DAYS.filter((d) => d.phase === phaseKey);
            const phaseDone = daysInPhase.filter((d) => completedDays[d.day]).length;
            const pc = phaseColorMap[phaseKey] || phaseColorMap.activacion;

            return (
              <div key={phaseKey} className="space-y-6">
                {/* Phase Banner */}
                <div className={`flex items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r ${pc.bg} border ${pc.border}`}>
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{phaseObj.icon}</div>
                    <div>
                      <h2 className={`text-2xl md:text-3xl font-black uppercase tracking-widest ${phaseObj.color}`}>
                        FASE: {phaseObj.label}
                      </h2>
                      <p className="text-sm text-brand-text-muted uppercase tracking-widest font-mono">
                        DÍAS {phaseObj.range[0]} AL {phaseObj.range[1]}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-2xl font-black ${pc.text}`}>{phaseDone}/{daysInPhase.length}</span>
                    <p className="text-[10px] text-brand-text-muted uppercase tracking-widest font-bold">completados</p>
                  </div>
                </div>

                {/* Day Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {daysInPhase.map((dayObj) => {
                    const status = getDayStatus(dayObj.day);
                    const isLocked = status === "locked";
                    const isDone = status === "done";

                    const borderColor = isDone
                      ? phaseKey === "activacion" ? "border-t-brand-yellow"
                        : phaseKey === "profundizacion" ? "border-t-brand-blue"
                        : "border-t-brand-green"
                      : "border-t-white/10";

                    const cardBg = isDone
                      ? phaseKey === "activacion" ? "bg-brand-yellow/5"
                        : phaseKey === "profundizacion" ? "bg-brand-blue/5"
                        : "bg-brand-green/5"
                      : "bg-transparent";

                    const checkColor = phaseKey === "activacion" ? "text-brand-yellow"
                      : phaseKey === "profundizacion" ? "text-brand-blue"
                      : "text-brand-green";

                    const dayLabelColor = isLocked ? "text-slate-600" : isDone ? pc.text : "text-brand-blue";

                    return (
                      <motion.button
                        key={dayObj.day}
                        whileHover={!isLocked ? { scale: 1.02 } : {}}
                        whileTap={!isLocked ? { scale: 0.98 } : {}}
                        onClick={async () => {
                          if (!isLocked) {
                            setSelDay(dayObj.day);
                            setView("day");
                            await saveState(route, arquetipo, tasksDone, completedDays, emociones, "day", dayObj.day);
                          }
                        }}
                        disabled={isLocked}
                        className={cx(
                          "glass-card p-5 text-left border-t-2 relative overflow-hidden transition-all duration-300",
                          borderColor,
                          cardBg,
                          isLocked ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-white/[0.06]"
                        )}
                      >
                        {isDone && (
                          <div className={`absolute inset-0 bg-gradient-to-br ${pc.bg} pointer-events-none`} />
                        )}

                        <div className="relative z-10">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{dayObj.icon}</span>
                              <span className={`text-sm font-mono font-black tracking-wider ${dayLabelColor}`}>
                                DÍA {dayObj.day}
                              </span>
                            </div>
                            {isLocked ? (
                              <Lock className="w-5 h-5 text-slate-600" />
                            ) : isDone ? (
                              <CheckCircle className={`w-6 h-6 ${checkColor}`} />
                            ) : (
                              <Unlock className="w-5 h-5 text-brand-yellow animate-pulse" />
                            )}
                          </div>

                          <h3 className={`text-xl font-black uppercase tracking-wider mb-2 ${isDone ? "text-white" : isLocked ? "text-slate-500" : "text-white"}`}>
                            {dayObj.title}
                          </h3>
                          <p className={`text-sm line-clamp-2 ${isLocked ? "text-slate-600" : "text-slate-400"}`}>
                            {dayObj.teaching}
                          </p>

                          {isDone && (
                            <div className={`mt-3 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${checkColor}`}>
                              <CheckCircle className="w-3 h-3" /> Completado
                            </div>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // VIEW: DAY DETAIL (mirrors RetoSombra pattern exactly)
  // ════════════════════════════════════════════════════════════════════════
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
          await saveState(route, arquetipo, tasksDone, completedDays, emociones, "home", selDay);
        }}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group uppercase text-sm font-bold tracking-widest"
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Volver al Mapa
      </button>

      <div className="space-y-8">
        {/* Day Header */}
        <div className="glass-card p-6 md:p-10 border-t-2 relative overflow-hidden border-t-brand-green/50">
          <div className="absolute top-0 right-0 p-8 text-8xl opacity-5 pointer-events-none">
            {dayData.icon}
          </div>

          <div className="relative z-10 space-y-6">
            <div>
              <span className={cx("text-sm font-bold uppercase tracking-widest font-mono", phaseInfo.color)}>
                Día {selDay} • Fase: {phaseInfo.label}
              </span>
              <h1 className="text-3xl md:text-5xl font-black text-brand-green uppercase tracking-wider mt-2 mb-4">
                {dayData.title}
              </h1>
              <Badge tipo={exercises[0]?.type || "reflexión"} />
            </div>

            <blockquote className="border-l-4 border-brand-green/50 pl-4 py-2 italic text-lg text-slate-300 font-serif">
              {dayData.quote}
            </blockquote>

            <div className="space-y-4 text-slate-300 leading-relaxed text-lg">
              <p>{dayData.teaching}</p>
              <div className="p-4 bg-brand-green/10 border border-brand-green/20 rounded-lg text-brand-green">
                <span className="font-bold text-brand-green uppercase text-sm tracking-widest block mb-2">
                  Contexto {route}
                </span>
                {dayData.routes[route].context}
              </div>
            </div>
          </div>
        </div>

        {/* Exercises / Tasks */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-brand-blue uppercase tracking-widest mb-6 border-b border-white/10 pb-2">
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
                    ? "border-l-brand-green bg-brand-green/10 border-t border-t-white/5"
                    : "border-l-transparent border-t border-t-white/10 hover:border-l-slate-400 hover:bg-white/5"
                )}
              >
                <div className="mt-1">
                  {isDone ? (
                    <CheckCircle className="w-6 h-6 text-brand-green" />
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-slate-600 group-hover:border-slate-400" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className={cx(
                      "font-bold text-lg",
                      isDone ? "text-white line-through opacity-70" : "text-brand-green"
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
            className="glass-card p-8 text-center border-t border-t-brand-green space-y-6 mt-12 bg-gradient-to-b from-brand-green/10 to-transparent"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-green/20 mb-2">
              <CheckCircle className="w-8 h-8 text-brand-green" />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-brand-green uppercase tracking-widest mb-2">
                DÍA {selDay} COMPLETADO
              </h3>
              <p className="text-slate-400">
                Tu mente está un paso más cerca del Flow absoluto. Continúa con tu entrenamiento diario.
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 mt-8">
              <button
                onClick={async () => {
                  setIsGenerating(true);
                  try {
                    const doc = new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
                    let y = initPdfWithHeader(doc, 'Reto Flow');
                    
                    y = addPdfText(doc, `DÍA ${selDay} COMPLETADO`, y, { fontSize: 20, fontStyle: 'bold', color: [15, 23, 42] });
                    y += 4;

                    y = addPdfText(doc, dayData.title, y, { fontSize: 14, fontStyle: 'normal', color: [71, 85, 105] });
                    y += 10;
                    
                    y = addPdfText(doc, 'EJERCICIOS COMPLETADOS', y, { fontSize: 14, fontStyle: 'bold', color: [15, 23, 42] });
                    y += 8;

                    exercises.forEach((ex, i) => {
                      y = checkPageBreak(doc, y, 35);
                      y = addPdfText(doc, `EJERCICIO ${i+1} (~${ex.time}): ${ex.title}`, y, { fontSize: 11, fontStyle: 'bold', color: [0, 212, 255] });
                      y += 2;
                      y = addPdfText(doc, ex.inst, y, { fontSize: 10, fontStyle: 'italic', color: [71, 85, 105] });
                      y += 8;
                    });

                    doc.save(`reto-flow-dia-${selDay}.pdf`);
                  } catch (err) {
                    console.error(err);
                  } finally {
                    setIsGenerating(false);
                  }
                }}
                disabled={isGenerating}
                className="w-full sm:w-auto cursor-pointer inline-flex items-center justify-center gap-2 px-8 py-3 bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 transition-all disabled:opacity-50 text-xs font-mono uppercase tracking-widest rounded-xl"
              >
                {isGenerating ? "Generando PDF..." : "📥 Descargar PDF de hoy"}
              </button>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full pt-4">
                {selDay < 10 && (
                  <button
                    onClick={async () => {
                      const nextD = selDay + 1;
                      setSelDay(nextD);
                      setView("day");
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      await saveState(route, arquetipo, tasksDone, completedDays, emociones, "day", nextD);
                    }}
                    className="w-full sm:w-auto cursor-pointer rounded-xl px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-[0_0_20px_rgba(139,92,246,0.25)] hover:shadow-[0_0_25px_rgba(139,92,246,0.4)]"
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
                      await saveState(route, arquetipo, tasksDone, completedDays, emociones, "day", nextD);
                      navigate("/app");
                    } else {
                      setView("results");
                      await saveState(route, arquetipo, tasksDone, completedDays, emociones, "results", selDay);
                      // Trigger big completion confetti on manual results view entry!
                      setTimeout(() => {
                        confetti({
                          particleCount: 300,
                          spread: 120,
                          origin: { y: 0.4 },
                          colors: ["#01E47E", "#00D1FF", "#7c3aed"],
                        });
                      }, 100);
                    }
                  }}
                  className="w-full sm:w-auto cursor-pointer rounded-xl px-8 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-black uppercase tracking-widest transition-all duration-300"
                >
                  {selDay < 10 ? "Continuar mañana" : "Ver resultados"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
