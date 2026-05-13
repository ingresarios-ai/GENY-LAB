// @ts-nocheck
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, RotateCcw, Share2, Copy, Check, MessageCircle, ArrowLeft } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import confetti from "canvas-confetti";
import { supabase } from "../../lib/supabase";

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

function DNASpinner() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      {[0,1,2].map(i => (
        <motion.div 
          key={i} 
          className="w-2 h-2 rounded-full bg-brand-blue"
          animate={{ scale: [0.8, 1, 0.8], opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// Map profile names to colors
const PROFILE_COLORS: Record<string, string> = {
  Guardián: "#3b82f6",
  Constructor: "#8b5cf6",
  Estratega: "#f59e0b",
  Cazador: "#ef4444",
  Emprendedor: "#10b981",
};

export default function RetoADN() {
  const navigate = useNavigate();

  const [screen, setScreen] = useState<"welcome" | "loading-ai" | "chat" | "result">("welcome");
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<any>(null);
  const [turns, setTurns] = useState(0);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll chat container to bottom (not the page)
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Focus input
  useEffect(() => {
    if (screen === 'chat' && !loading && !analyzing) {
      setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 100);
    }
  }, [screen, loading, analyzing]);

  const callEdgeFunction = async (msgs: any[], mode: 'interview' | 'diagnose') => {
    const { data, error } = await supabase.functions.invoke('chat-adn', {
      body: { messages: msgs, mode }
    });
    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error);
    return data.content;
  };

  const startInterview = async () => {
    window.scrollTo(0, 0);
    setScreen("loading-ai");
    const greeting = "Hola. Soy GENY, tu analista de ADN Financiero. En los próximos minutos vamos a tener una conversación que va a revelar patrones sobre tu relación con el dinero que probablemente nunca habías visto. No hay respuestas correctas ni incorrectas — solo honestidad.";
    try {
      const reply = await callEdgeFunction(
        [{ role: "user", content: "Comienza la entrevista" }],
        'interview'
      );
      const clean = reply.replace("[ANÁLISIS_LISTO]", "").trim();
      setMessages([
        { role: "assistant", content: greeting + "\n\nEmpecemos. " + clean }
      ]);
    } catch (e) {
      console.error(e);
      setMessages([
        { role: "assistant", content: greeting + "\n\nEmpecemos. ¿Cuál es tu mayor desafío con el dinero en este momento?" }
      ]);
    }
    setScreen("chat");
  };

  const sendMessage = async () => {
    if (!input.trim() || loading || analyzing) return;
    const userMsg = input.trim();
    setInput("");
    
    const newTurns = turns + 1;
    setTurns(newTurns);
    
    const updated = [...messages, { role: "user", content: userMsg }];
    setMessages(updated);
    setLoading(true);

    try {
      const apiMsgs = updated.map(m => ({ role: m.role, content: m.content }));
      const reply = await callEdgeFunction(apiMsgs, 'interview');
      
      const isDone = reply.includes("[ANÁLISIS_LISTO]");
      const clean = reply.replace("[ANÁLISIS_LISTO]", "").trim();
      
      const finalMsgs = [...updated, { role: "assistant", content: clean }];
      setMessages(finalMsgs);
      setLoading(false);

      if (isDone || newTurns >= 11) {
        // Add transition message so it doesn't feel abrupt
        const transitionMsg = "Perfecto. Ya tengo toda la información que necesito. Voy a activar el análisis profundo de tu ADN Financiero — dame unos segundos para procesar tus patrones, contradicciones y fortalezas.";
        setTimeout(() => {
          setMessages(prev => [...prev, { role: "assistant", content: transitionMsg }]);
        }, 800);

        // Wait for the user to read the message, then start analysis
        setTimeout(async () => {
          setAnalyzing(true);
          try {
            const diagText = await callEdgeFunction(apiMsgs, 'diagnose');
            let jsonStr = diagText;
            const match = diagText.match(/```json([\s\S]*?)```/);
            if (match) jsonStr = match[1];
            
            const parsed = JSON.parse(jsonStr.trim());
            setDiagnosis(parsed);
            
            setScreen("result");
            setTimeout(() => confetti({ particleCount: 120, spread: 70, origin: { y: 0.5 }, colors: ['#00D1FF', '#00E676', '#FEDD04', '#f59e0b'] }), 300);
          } catch (e) {
            console.error("Diagnosis Error:", e);
            setDiagnosis({
              adn: "Estratega", emoji: "📊", titulo: "El Buscador de Certezas",
              lecturaCore: "Tu relación con el dinero está profundamente marcada por la necesidad de control. No es codicia — es arquitectura defensiva.",
              sombra: "Tu sombra financiera es la parálisis por análisis: usas la preparación como escudo para no actuar.",
              contradiccion: "Hablas de querer crecer, pero cada decisión que describes tiene una salida de emergencia incorporada.",
              fortaleza: "Capacidad analítica excepcional y disciplina en la documentación de tus procesos.",
              patron: "Investigas, planeas, casi ejecutas — y en el último momento encuentras una razón para esperar un poco más.",
              activacion: "El sistema perfecto que nunca se ejecuta vale menos que el imperfecto que sí lo hace."
            });
            setScreen("result");
            setTimeout(() => confetti({ particleCount: 100, spread: 70 }), 300);
          }
          setAnalyzing(false);
        }, 3500);
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: "assistant", content: "Hubo un error de conexión con la red neuronal. Por favor, repite tu respuesta." }]);
      setLoading(false);
      setTurns(turns - 1);
    }
  };

  const handleKey = (e: any) => { 
    if (e.key === "Enter" && !e.shiftKey) { 
      e.preventDefault(); 
      sendMessage(); 
    } 
  };

  const reset = () => {
    setScreen("welcome"); setMessages([]); setInput("");
    setLoading(false); setAnalyzing(false); setDiagnosis(null); setTurns(0);
  };

  /* ═══ WELCOME ═══ */
  if (screen === "welcome") {
    return (
      <div className="max-w-5xl mx-auto space-y-10 pb-12">
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
            <div className="space-y-8 text-left">
              <DNACanvas size={160} />
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-none">
                  Diagnóstico <br className="hidden md:block" />
                  <span className="title-highlight">ADN Financiero</span>
                </h1>
                <p className="text-brand-text-muted font-medium text-lg md:text-xl leading-relaxed max-w-md">
                  No es un quiz tradicional. Es una conversación inmersiva con GENY que cambiará cómo ves tu dinero.
                </p>
              </div>

              <button
                onClick={startInterview}
                className="btn-primary w-full md:w-auto px-8 py-5 rounded-2xl text-sm font-black uppercase tracking-[0.15em] flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(0,209,255,0.3)] hover:shadow-[0_0_40px_rgba(0,209,255,0.5)] transition-all bg-gradient-to-r from-brand-blue to-cyan-500 text-white"
              >
                INICIAR ENTREVISTA
                <ChevronRight className="w-5 h-5" />
              </button>

              <p className="text-white/20 text-xs font-black uppercase tracking-widest">
                Psicología Jungiana · Diagnóstico único para ti
              </p>
            </div>

            {/* Right side */}
            <div className="glass-card p-8 text-left space-y-8 h-full flex flex-col justify-center border-t-2 border-t-brand-blue/40 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/8 via-transparent to-brand-green/5 pointer-events-none" />
              <div className="relative z-10 space-y-8">
                {[
                  { num: '01', color: 'text-brand-blue', t: 'Chat Inmersivo', s: 'Conversa con la red neuronal de GENY.' },
                  { num: '02', color: 'text-cyan-400', t: 'Análisis Jungiano', s: 'Descubre tus patrones, sombras y bloqueos ocultos.' },
                  { num: '03', color: 'text-[#FEDD04]', t: 'Tu Activación', s: 'Recibe una frase única para reprogramar tu mente.' },
                ].map((r, i) => (
                  <div key={i} className="flex gap-5 items-start">
                    <span className={`${r.color} font-black text-3xl min-w-[40px] opacity-80 pt-1`}>{r.num}</span>
                    <div>
                      <div className="font-black uppercase tracking-tight text-lg">{r.t}</div>
                      <div className="text-brand-text-muted text-sm font-medium mt-1">{r.s}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ═══ ANALYZING ═══ */
  if (analyzing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] py-20">
        <div className="text-center space-y-6">
          <DNACanvas size={100} />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-blue mb-3">Procesando tu ADN</p>
            <p className="text-sm md:text-base text-brand-text-muted max-w-sm leading-relaxed mb-6">
              Analizando patrones, contradicciones y la arquitectura emocional de tus respuestas...
            </p>
          </div>
          <div className="flex justify-center">
            <DNASpinner />
          </div>
        </div>
      </div>
    );
  }

  /* ═══ LOADING AI ═══ */
  if (screen === "loading-ai") {
    return (
      <div className="fixed inset-x-0 top-0 md:top-16 bottom-0 z-[45] bg-[#080c14] flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6 text-center px-6"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="text-6xl md:text-7xl"
          >
            🤖
          </motion.div>
          <div className="space-y-3">
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="text-lg md:text-xl font-black uppercase tracking-[0.2em] text-brand-blue"
            >
              Iniciando AI
            </motion.p>
            <p className="text-sm text-brand-text-muted font-medium">
              Conectando con la red neuronal de GENY...
            </p>
          </div>
          <DNASpinner />
        </motion.div>
      </div>
    );
  }

  /* ═══ CHAT ═══ */
  if (screen === "chat") {
    return (
      <div className="fixed inset-x-0 top-0 md:top-16 bottom-0 z-[45] bg-[#080c14] flex flex-col">
        {/* Top bar */}
        <div className="max-w-3xl w-full mx-auto px-4 pt-8 pb-2">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 text-brand-text-muted hover:text-white transition-colors uppercase font-black text-xs tracking-[0.2em]"
          >
            <ArrowLeft className="w-4 h-4" /> Volver a Actividades
          </button>
        </div>

        <div className="flex-1 max-w-3xl w-full mx-auto px-4 pb-4 flex flex-col min-h-0">
        <div className="flex-1 flex flex-col glass-card relative overflow-hidden min-h-0">
          {/* Chat Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center gap-4 bg-white/5 shrink-0 z-10">
          <div className="w-10 h-10 rounded-full bg-brand-blue/10 border border-brand-blue/30 flex items-center justify-center text-xl shrink-0">
            🧬
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-white">GENY</div>
            <div className="text-xs text-brand-text-muted">Analista de ADN Financiero · INGRESARIOS</div>
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            {Math.min(turns, 10)} / 10
          </div>
        </div>

        {/* Chat Messages */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-5 space-y-5">
          <AnimatePresence>
            {messages.map((m, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`
                  max-w-[85%] px-5 py-3.5 text-[15px] leading-relaxed
                  ${m.role === "user" 
                    ? "bg-brand-blue/15 border border-brand-blue/30 rounded-2xl rounded-tr-sm text-white" 
                    : "bg-[#0d1117] border border-white/10 rounded-2xl rounded-tl-sm text-slate-200"
                  }
                `}>
                  {m.content}
                </div>
              </motion.div>
            ))}
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="bg-[#0d1117] border border-white/10 rounded-2xl rounded-tl-sm px-5 py-4">
                  <DNASpinner />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} className="h-2" />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10 bg-[#0d1117] shrink-0 z-10 flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Escribe tu respuesta aquí..."
            disabled={loading || analyzing}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-[15px] text-white resize-none outline-none focus:border-brand-blue/50 focus:bg-brand-blue/5 transition-all disabled:opacity-50 min-h-[52px] max-h-[120px]"
            rows={input.split('\n').length > 1 ? Math.min(input.split('\n').length, 4) : 1}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading || analyzing}
            className={`
              p-3.5 rounded-xl flex items-center justify-center transition-all shrink-0 h-[52px] w-[52px]
              ${(!input.trim() || loading) 
                ? "bg-white/5 text-brand-text-muted cursor-not-allowed" 
                : "bg-brand-blue text-white shadow-[0_0_15px_rgba(0,209,255,0.3)] hover:scale-105"
              }
            `}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        </div>
        </div>
      </div>
    );
  }

  /* ═══ RESULT ═══ */
  if (screen === "result" && diagnosis) {
    const profColor = PROFILE_COLORS[diagnosis.adn] || "#00D4FF";
    
    return (
      <div className="max-w-6xl mx-auto pb-12">
        {/* Completion CTA Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-brand-green/10 border border-brand-green/20 p-6 rounded-2xl relative overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-green/10 to-transparent -translate-x-full animate-shimmer" />
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white relative z-10 text-center md:text-left">
            Diagnóstico Finalizado
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
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-5 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-10 text-center space-y-6 border-t-2 relative overflow-hidden h-full flex flex-col justify-center min-h-[400px]"
              style={{ borderTopColor: `${profColor}60` }}
            >
              <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at top, ${profColor}15, transparent 70%)` }} />
              <div className="relative z-10 space-y-5">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue">Tu resultado</p>
                <div className="text-7xl md:text-8xl leading-none">{diagnosis.emoji}</div>
                <p className="text-xs font-black uppercase tracking-widest text-[#FFD700]">{diagnosis.titulo}</p>
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
                  ADN <br/><span style={{ color: profColor }}>{diagnosis.adn}</span>
                </h1>
                <div className="w-16 h-1 rounded-full mx-auto" style={{ background: profColor }} />
              </div>
            </motion.div>
          </div>

          {/* Right Column: Insights */}
          <div className="lg:col-span-7 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="glass-card p-7 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue">Lectura de tu perfil</p>
              <p className="text-[15px] text-slate-300 leading-relaxed">{diagnosis.lecturaCore}</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="glass-card p-7 space-y-3 border border-amber-500/20 bg-amber-500/5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFD700]">Tu sombra financiera</p>
              <p className="text-[15px] text-slate-300 leading-relaxed">{diagnosis.sombra}</p>
            </motion.div>

            {diagnosis.contradiccion && diagnosis.contradiccion.toLowerCase() !== "vacío" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="glass-card p-7 space-y-3 border border-brand-blue/20">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue">Contradicción detectada</p>
                <p className="text-[15px] text-slate-300 leading-relaxed">{diagnosis.contradiccion}</p>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="glass-card p-6 space-y-3">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue">Tu fortaleza real</p>
                <p className="text-sm text-slate-300 leading-relaxed">{diagnosis.fortaleza}</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="glass-card p-6 space-y-3 border border-amber-500/10">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFD700]">Patrón de sabotaje</p>
                <p className="text-sm text-slate-300 leading-relaxed">{diagnosis.patron}</p>
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              className="rounded-2xl p-8 text-center bg-brand-blue/10 border border-brand-blue/20">
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-blue mb-4">Tu frase de activación</p>
              <p className="text-lg md:text-xl text-white font-medium italic leading-relaxed">
                "{diagnosis.activacion}"
              </p>
            </motion.div>

            <div className="text-center pt-2">
              <button onClick={reset}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 text-brand-text-muted hover:text-white hover:bg-white/10 transition-all">
                <RotateCcw className="w-4 h-4" /> Repetir el diagnóstico
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
