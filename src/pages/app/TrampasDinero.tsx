import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, CheckCircle, Brain,
  Share2, Copy, Check,   
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import ShareModule from "../../components/ShareModule";
import ResultActions from "../../components/ResultActions";
import CompletionBanner from '../../components/CompletionBanner';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import confetti from "canvas-confetti";

// ── Question Data ──────────────────────────────────────────────────────────

interface Question {
  type: "comprensión" | "aplicación" | "acción";
  question: string;
  hint?: string;
  placeholder: string;
  inputType?: "number";
  rows?: number;
}

const RETO = {
  name: "TRAMPAS DEL DINERO",
  liveTitle: "Tu cerebro está diseñado para hacerte perder dinero",
  intro:
    "Acabas de ver el LIVE. Las 5 trampas cognitivas que sabotean cada decisión financiera están identificadas. Ahora toca bajarlas a tu realidad. Responde honesto — no es examen, es espejo.",
  questions: [
    {
      type: "comprensión" as const,
      question:
        "¿Por qué tu cerebro evolucionó para sabotear tus decisiones financieras modernas?",
      hint: "Recuerda: evolucionó para la sabana, no para el mercado",
      placeholder: "Porque...",
      rows: 3,
    },
    {
      type: "comprensión" as const,
      question:
        "Según Kahneman & Tversky: ¿cuántas veces más duele perder $100 que el placer de ganar $100?",
      hint: "El dato exacto que dije en el LIVE",
      placeholder: "",
      inputType: "number" as const,
    },
    {
      type: "aplicación" as const,
      question:
        "Piensa en tu último trade ganador: ¿lo cerraste antes del target o esperaste?",
      placeholder: "Cerré en +$X antes del target porque sentí...",
      rows: 3,
    },
    {
      type: "aplicación" as const,
      question:
        "Piensa en tu último trade perdedor: ¿esperaste más de lo que debías? ¿Por qué?",
      placeholder: "Debí salir en $X pero no lo hice porque...",
      rows: 3,
    },
    {
      type: "comprensión" as const,
      question:
        "¿Qué es gratificación instantánea en trading (descuento hiperbólico)?",
      hint: "Cuando prefieres $50 hoy sobre $200 mañana",
      placeholder: "Es cuando...",
      rows: 3,
    },
    {
      type: "aplicación" as const,
      question:
        "Si tu target promedio es $200 y cierras en $50: ¿cuánto dejas en la mesa al año? (100 trades)",
      hint: "Calcula: (200-50) × 100 × % que alcanzarían target",
      placeholder: "$",
      inputType: "number" as const,
    },
    {
      type: "comprensión" as const,
      question:
        "¿Cuál es la combinación mortal de FOMO + Costo Hundido?",
      hint: "Lo expliqué en el bloque de trampas #3 y #4",
      placeholder: "FOMO te hace entrar..., Costo hundido te hace...",
      rows: 4,
    },
    {
      type: "aplicación" as const,
      question:
        "Tu último FOMO trade: ¿qué viste, qué hiciste, cómo terminó?",
      placeholder:
        "Vi que [ticker/grupo] estaba moviendo, entré sin plan, terminé...",
      rows: 4,
    },
    {
      type: "aplicación" as const,
      question:
        "Después de 3 trades ganadores seguidos: ¿qué cambias en tu trading (tamaño, frecuencia, plan)?",
      hint: "Sé brutalmente honesto — ahí está tu exceso de confianza",
      placeholder: "Cuando tengo racha buena, empiezo a...",
      rows: 4,
    },
    {
      type: "acción" as const,
      question:
        "Escribe 1 regla anti-trampa para tu TRAMPA DOMINANTE (la que más te afecta). Ejemplo: 'Después de 2 trades ganadores seguidos, bajo tamaño 50% por 3 trades.'",
      hint: "Esta regla va a tu plan de trading desde hoy",
      placeholder:
        "Mi trampa dominante es [X]. Mi regla: cuando detecte...",
      rows: 5,
    },
  ] as Question[],
};

const TOTAL_QUESTIONS = RETO.questions.length;

const TYPE_STYLES: Record<
  string,
  { color: string; bg: string; border: string; label: string }
> = {
  comprensión: {
    color: "text-[#00D2FF]",
    bg: "bg-[#00D2FF]/8",
    border: "border-l-[#00D2FF]",
    label: "COMPRENSIÓN",
  },
  aplicación: {
    color: "text-brand-yellow",
    bg: "bg-brand-yellow/8",
    border: "border-l-brand-yellow",
    label: "APLICACIÓN",
  },
  acción: {
    color: "text-brand-green",
    bg: "bg-brand-green/8",
    border: "border-l-brand-green",
    label: "ACCIÓN",
  },
};

// ════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════

export default function TrampasDinero() {
  const user = { id: "local-user" };
  const navigate = useNavigate();
  const userName = 'Trader'?.split(" ")[0] || "Trader";

  // ── State ──
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"intro" | "questions" | "completed">("intro");
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [copiedLink, setCopiedLink] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const answered = Object.values(responses).filter(
    (v) => v && String(v).trim()
  ).length;
  const progress = (answered / TOTAL_QUESTIONS) * 100;
  const allAnswered = answered === TOTAL_QUESTIONS;

  // ── Load from Supabase ──
  useEffect(() => { setLoading(false); }, []);

  // ── Auto-save on response changes (debounced) ──
  // Auto-save logic removed for V3

  const update = (i: number, v: string) =>
    setResponses((prev) => ({ ...prev, [i]: v }));

  const handleStart = () => { setView("questions"); };

  const handleComplete = () => {
    setView("completed");
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ["#FF3EB0", "#00FF94", "#FFD93D", "#00D2FF"] });
    setTimeout(() => contentRef.current?.scrollTo({ top: 0, behavior: "smooth" }), 100);
  };

  // ── Share ──
  const generateShareUrl = () => {
    const payload = {
      t: "trampas",
      n: userName,
      c: TOTAL_QUESTIONS,
      p: "Completado",
    };
    return `https://lab.ingresarios.net/resultado/${btoa(JSON.stringify(payload))}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generateShareUrl());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSocialShare = (
    platform: "whatsapp" | "twitter" | "facebook" | "linkedin"
  ) => {
    const text = encodeURIComponent(
      `Acabo de identificar las trampas cognitivas que sabotean mis finanzas con el Reto Trampas del Dinero de GENY LAB. 🧠 Las trampas ya tienen nombre.`
    );
    const url = encodeURIComponent(generateShareUrl());
    const links: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    };
    window.open(links[platform], "_blank");
  };

  const reset = () => {
    setResponses({});
    setView("questions");
  };

  const generatePDF = async () => {
    const doc = new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
    const W=210,M=18; let y=20;
    
    doc.setFillColor(8,12,15); doc.rect(0,0,W,297,'F');
    doc.setFillColor(255,62,176); doc.rect(0,0,W,3,'F'); // #FF3EB0
    
    doc.setTextColor(255,62,176); doc.setFontSize(9); doc.text('INGRESARIOS · GENY LAB',M,y);
    doc.setTextColor(100); doc.text('TRAMPAS DEL DINERO',W-M,y,{align:'right'}); y+=16;
    
    doc.setTextColor(255); doc.setFontSize(28); 
    doc.text('LAS TRAMPAS YA TIENEN NOMBRE',M,y); y+=12;
    
    doc.setTextColor(200); doc.setFontSize(11);
    const intro = "Conocer la trampa no la elimina — la hace visible. Cada vez que aparezcan ahora, vas a poder decir: 'Te vi. No hoy.'";
    const introLines = doc.splitTextToSize(intro, W-2*M);
    doc.text(introLines, M, y); y+=introLines.length*6 + 10;
    
    RETO.questions.forEach((q, i) => {
      if (y > 270) { doc.addPage(); doc.setFillColor(8,12,15); doc.rect(0,0,W,297,'F'); y=20; }
      doc.setTextColor(255,62,176); doc.setFontSize(9); 
      doc.text(`PREGUNTA ${i+1} (${q.type.toUpperCase()})`, M, y); y+=6;
      doc.setTextColor(255); doc.setFontSize(11);
      const qLines = doc.splitTextToSize(q.question, W-2*M);
      doc.text(qLines, M, y); y+=qLines.length*6+2;
      doc.setTextColor(200); doc.setFontSize(10); doc.setFont('helvetica', 'italic');
      const ansLines = doc.splitTextToSize(String(responses[i] || 'No respondida'), W-2*M);
      doc.text(ansLines, M, y); y+=ansLines.length*6+6;
      doc.setFont('helvetica', 'normal');
    });
    
    doc.save('trampas-del-dinero.pdf');
  };

  // ════════════════════════════════════════════════════════════════════════
  // LOADING
  // ════════════════════════════════════════════════════════════════════════
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-brand-yellow">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Brain className="w-8 h-8" />
        </motion.div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // VIEW: INTRO
  // ════════════════════════════════════════════════════════════════════════
  if (view === "intro") {
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
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-center md:justify-start gap-3 text-[10px] tracking-[0.25em] uppercase text-brand-text-muted font-bold font-mono">
                  <span className="w-2 h-2 rounded-full bg-[#FF3EB0]" />
                  RETO DE 1 DÍA — GENY LAB
                </div>

                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-none">
                  {RETO.name.split(" ").slice(0, 1)}{" "}
                  <span className="title-highlight">
                    {RETO.name.split(" ").slice(1).join(" ")}
                  </span>
                </h1>

                <p className="text-brand-text-muted text-sm md:text-base leading-relaxed mt-4">
                  Post-LIVE:{" "}
                  <span className="text-white font-medium">
                    "{RETO.liveTitle}"
                  </span>
                </p>
              </div>

              {/* Stats bar */}
              <div className="glass-card p-6 flex flex-wrap justify-center md:justify-start items-center gap-6 md:gap-8">
                {[
                  { value: "10", label: "Preguntas" },
                  { value: "~20", label: "Minutos" },
                  { value: "1", label: "Día" },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center gap-4">
                    {i > 0 && (
                      <div className="w-px h-8 bg-white/10 hidden sm:block" />
                    )}
                    <div className={i > 0 ? "sm:pl-4" : ""}>
                      <div className="text-2xl md:text-3xl font-black font-mono text-[#FF3EB0]">
                        {stat.value}
                      </div>
                      <div className="text-[10px] uppercase tracking-widest text-brand-text-muted font-bold mt-0.5">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Intro text & CTA */}
            <div className="space-y-8 flex flex-col justify-center h-full">
              <div className="glass-card p-10 space-y-8 relative overflow-hidden flex-grow flex flex-col justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF3EB0]/8 via-transparent to-transparent pointer-events-none" />
                <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[#FF3EB0]/10 blur-[60px] pointer-events-none" />
                
                <p className="relative z-10 text-white/90 text-lg leading-[1.7] font-medium border-l-4 border-[#FF3EB0]/40 pl-5">
                  {RETO.intro}
                </p>

                <div className="space-y-4 pt-4 relative z-10">
                  {/* Start CTA */}
                  <button
                    onClick={handleStart}
                    className="w-full btn-primary py-5 px-10 rounded-xl text-base font-black uppercase tracking-[0.12em] flex items-center justify-center gap-3 transition-transform hover:scale-[1.02]"
                  >
                    Empezar el reto
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  <p className="text-white/30 text-[10px] text-center font-bold uppercase tracking-widest">
                    Tu progreso se guarda automáticamente
                  </p>
                </div>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // VIEW: QUESTIONS
  // ════════════════════════════════════════════════════════════════════════
  if (view === "questions") {
    return (
      <div className="flex flex-col min-h-[calc(100vh-80px)]">
        {/* Sticky header with progress */}
        <div className="sticky top-0 z-30 bg-brand-surface/90 backdrop-blur-md border-b border-white/5 px-4 md:px-8 py-3">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#FF3EB0]" />
              <span className="text-sm font-black text-[#FF3EB0] uppercase tracking-wider hidden sm:inline">
                RETO {RETO.name}
              </span>
              <span className="text-[10px] font-mono text-brand-text-muted tracking-widest">
                · 1 DÍA
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono text-brand-text-muted">
                {String(answered).padStart(2, "0")} / {TOTAL_QUESTIONS}{" "}
                respondidas
              </span>
              <div className="w-28 md:w-36 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#FF3EB0] rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto px-4 md:px-8 py-8"
        >
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Page header */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[10px] tracking-[0.22em] uppercase text-brand-text-muted font-bold font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF3EB0]" />
                POST-LIVE · APLICACIÓN INMEDIATA
              </div>
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
                Bajemos el LIVE al papel.
              </h1>
              <p className="text-brand-text-muted text-sm leading-relaxed font-medium">
                10 preguntas. Cada una hace click con algo que te dije en
                vivo. Respóndelas con honestidad — son para ti.
              </p>
            </div>

            {/* Question cards */}
            {RETO.questions.map((q, i) => {
              const style = TYPE_STYLES[q.type];
              const isAnswered =
                responses[i] && String(responses[i]).trim();

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`glass-card p-6 relative overflow-hidden border-l-[3px] ${style.border}`}
                >
                  {/* Question header */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-mono text-brand-text-muted font-bold">
                      Q{String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`text-[9px] tracking-[0.2em] uppercase font-black font-mono px-2.5 py-1 rounded ${style.bg} ${style.color}`}
                    >
                      {style.label}
                    </span>
                    {isAnswered && (
                      <span className="text-[10px] text-brand-green font-black font-mono ml-auto flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> RESPONDIDA
                      </span>
                    )}
                  </div>

                  {/* Question text */}
                  <h3 className="text-[17px] font-black text-white leading-snug mb-2">
                    {q.question}
                  </h3>

                  {/* Hint */}
                  {q.hint && (
                    <p className="text-sm text-brand-text-muted leading-relaxed mb-4">
                      {q.hint}
                    </p>
                  )}

                  {/* Input */}
                  {q.inputType === "number" ? (
                    <div className="flex items-center gap-3 mt-4">
                      <span className={`text-xl font-mono font-bold ${style.color}`}>
                        $
                      </span>
                      <input
                        type="number"
                        value={responses[i] || ""}
                        onChange={(e) => update(i, e.target.value)}
                        placeholder="0"
                        className="w-48 bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-white text-lg font-mono font-bold tabular-nums focus:outline-none focus:border-[#FF3EB0]/50 transition-colors placeholder:text-white/15"
                      />
                    </div>
                  ) : (
                    <textarea
                      value={responses[i] || ""}
                      onChange={(e) => update(i, e.target.value)}
                      placeholder={q.placeholder}
                      rows={q.rows || 3}
                      className="w-full mt-2 bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-white text-sm leading-relaxed focus:outline-none focus:border-[#FF3EB0]/50 transition-colors placeholder:text-white/15 resize-y"
                    />
                  )}
                </motion.div>
              );
            })}

            {/* Complete button */}
            <div className="flex items-center gap-5 pt-4 pb-8">
              <button
                onClick={handleComplete}
                disabled={!allAnswered}
                className={`py-4 px-10 rounded-xl text-sm font-black uppercase tracking-[0.12em] flex items-center gap-3 transition-all ${
                  allAnswered
                    ? "btn-primary"
                    : "bg-white/5 text-slate-500 cursor-not-allowed border border-white/5"
                }`}
              >
                Cerrar el reto
                <ChevronRight className="w-5 h-5" />
              </button>
              {!allAnswered && (
                <span className="text-sm text-brand-text-muted font-mono">
                  Responde las {TOTAL_QUESTIONS - answered} que faltan
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // VIEW: COMPLETED
  // ════════════════════════════════════════════════════════════════════════
  return (
    <div className="max-w-5xl mx-auto pb-12">
      <CompletionBanner lessonId="trampas" />

      <ResultActions 
        onDownloadPDF={generatePDF} 
        onReset={reset} 
      />

      <div className="min-h-[70vh] flex flex-col justify-center">
        <motion.div
          ref={contentRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid md:grid-cols-2 gap-12 items-center"
        >
          {/* Left Column: Result Presentation */}
          <div className="flex flex-col h-full justify-center space-y-8">
            <div className="glass-card p-10 md:p-12 text-center border-t-2 border-t-[#FF3EB0] relative overflow-hidden flex-grow flex flex-col justify-center items-center">
              <div className="absolute inset-0 bg-gradient-to-b from-[#FF3EB0]/10 to-transparent pointer-events-none" />
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#FF3EB0]" />

              <div className="relative z-10 space-y-6 w-full">
                <div className="text-[10px] tracking-[0.3em] uppercase text-brand-text-muted font-bold font-mono">
                  RETO COMPLETADO
                </div>

                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
                  Las trampas ya tienen{" "}
                  <span className="title-highlight">nombre.</span>
                </h2>

                <p className="text-white/85 text-base leading-[1.7] font-medium max-w-sm mx-auto">
                  Conocer la trampa no la elimina — la hace visible. Cada vez que
                  aparezcan ahora, vas a poder decir:{" "}
                  <span className="text-[#FF3EB0] font-black">
                    'Te vi. No hoy.'
                  </span>{" "}
                  Aplica tu regla 30 días seguidos.
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto pt-4">
                  <div className="glass-card p-4 text-center">
                    <div className="text-2xl font-black font-mono text-brand-green">
                      10/10
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-brand-text-muted font-bold mt-1">
                      Preguntas
                    </div>
                  </div>
                  <div className="glass-card p-4 text-center">
                    <div className="text-sm font-black font-mono text-[#FF3EB0] leading-snug">
                      {responses[9] ? "REGLA LISTA" : "___"}
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-brand-text-muted font-bold mt-1">
                      Tu defensa
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Actions & Share */}
          <div className="flex flex-col h-full justify-center space-y-8">
            <div className="glass-card p-10 space-y-8 flex-grow flex flex-col justify-center relative overflow-hidden">
              
              <div className="space-y-4">
              </div>
              {/* Share Section */}
              <div className="pt-8 border-t border-white/5 space-y-6">
                <ShareModule 
                  activity="trampas" 
                  title="Las Trampas del Dinero" 
                  resultData={{ responses }} 
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
