import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Shield, ChevronDown, ChevronUp, CheckCircle2, User as UserIcon, Calendar, MapPin, Phone, Mail, FileJson, Activity, Lock, Brain, Sparkles, Target, AlertTriangle, DollarSign, MessageSquare, TrendingUp, Loader2, Zap, Heart, Clock, BookX, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// Helper to display raw JSON
function JsonViewer({ data, title }: { data: any, title: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-4 rounded-xl border border-white/10 overflow-hidden bg-black/40">
      <button 
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          <FileJson className="w-4 h-4 text-[#00D1FF]" />
          <span className="text-xs font-mono font-bold text-white/80 tracking-wider uppercase">{title} (Raw Data Inspector)</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-white/50" /> : <ChevronDown className="w-4 h-4 text-white/50" />}
      </button>
      {open && (
        <div className="p-4 overflow-x-auto">
          <pre className="text-[10px] sm:text-xs text-[#00D1FF]/80 font-mono leading-relaxed">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

// Activity Block Wrapper
function ActivityBlock({ id, title, emoji, log, children }: { id: string, title: string, emoji: string, log: any, children?: React.ReactNode }) {
  if (!log) {
    return (
      <div className="rounded-2xl p-6 border border-dashed border-white/10 bg-white/[0.01] flex items-center gap-4 opacity-50">
        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl grayscale">{emoji}</div>
        <div>
          <h3 className="text-lg font-bold text-white/40">{title}</h3>
          <p className="text-sm text-white/20">No completado</p>
        </div>
      </div>
    );
  }

  const date = new Date(log.completed_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/10 bg-white/[0.02] overflow-hidden"
    >
      <div className="p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner shadow-white/10" style={{ background: 'rgba(0,209,255,0.08)' }}>
              {emoji}
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wide">{title}</h2>
              <div className="flex items-center gap-1.5 text-brand-green mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#00E676]">Completado</span>
              </div>
            </div>
          </div>
          <div className="text-left sm:text-right mt-4 sm:mt-0">
            <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Fecha de Finalización</p>
            <p className="text-sm text-white/60">{date}</p>
          </div>
        </div>

        {/* Custom Visualizations per Activity */}
        <div className="space-y-6">
          {children}
        </div>

        {/* Always present Raw JSON Viewer */}
        <JsonViewer data={log.metadata} title={`Data payload: ${id}`} />
      </div>
    </motion.div>
  );
}

const stepsInfo = [
  {
    key: 'apertura',
    num: 1,
    title: 'Apertura',
    objective: 'Romper hielo',
    badgeColor: 'rgba(0, 209, 255, 0.1)',
    textColor: '#00D1FF'
  },
  {
    key: 'punto_actual',
    num: 2,
    title: 'Punto actual',
    objective: 'Identificar nivel',
    badgeColor: 'rgba(242, 197, 0, 0.1)',
    textColor: '#F2C500'
  },
  {
    key: 'dolor_real',
    num: 3,
    title: 'Dolor real',
    objective: 'Detectar fricción',
    badgeColor: 'rgba(255, 82, 82, 0.1)',
    textColor: '#FF5252'
  },
  {
    key: 'impacto',
    num: 4,
    title: 'Impacto',
    objective: 'Crear conciencia',
    badgeColor: 'rgba(139, 92, 246, 0.1)',
    textColor: '#a78bfa'
  },
  {
    key: 'diagnostico',
    num: 5,
    title: 'Diagnóstico',
    objective: 'Conectar problema',
    badgeColor: 'rgba(0, 230, 118, 0.1)',
    textColor: '#00E676'
  },
  {
    key: 'recomendacion',
    num: 6,
    title: 'Recomendación',
    objective: 'Ofrecer plan',
    badgeColor: 'rgba(245, 158, 11, 0.1)',
    textColor: '#f59e0b'
  },
  {
    key: 'cierre',
    num: 7,
    title: 'Cierre',
    objective: 'Llevar a decisión',
    badgeColor: 'rgba(236, 72, 153, 0.1)',
    textColor: '#ec4899'
  }
];

export default function PublicResultsView() {
  const { userId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<{ user: any, activities: any[] } | null>(null);
  
  // AI Analysis state
  const [analysis, setAnalysis] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [activeStep, setActiveStep] = useState<number | null>(0);
  const [showTechnicalData, setShowTechnicalData] = useState(false);

  useEffect(() => {
    // 1. Prevent Indexing dynamically
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'robots');
      meta.setAttribute('content', 'noindex, nofollow');
      document.head.appendChild(meta);
    } else {
      meta.setAttribute('content', 'noindex, nofollow');
    }
    document.title = "Resultados Confidenciales | GENY LAB";

    // 2. Fetch Data via public endpoint in admin-api
    const fetchResults = async () => {
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-api/public-results/${userId}`, {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          }
        });
        if (!res.ok) throw new Error('Resultados no disponibles o usuario inválido.');
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchResults();
  }, [userId]);

  const generateAnalysis = async () => {
    if (!data) return;
    setAnalyzing(true);
    setAnalysisError('');
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/analyze-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          user: data.user,
          activities: data.activities
        })
      });
      if (!res.ok) throw new Error('Error al generar análisis');
      const json = await res.json();
      setAnalysis(json.analysis);
    } catch (err: any) {
      setAnalysisError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#060910]">
        <div className="flex flex-col items-center gap-4">
          <Activity className="w-8 h-8 text-[#00D1FF] animate-pulse" />
          <div className="text-[#00D1FF] font-black text-xs uppercase tracking-[0.2em] animate-pulse">
            Compilando Radiografía...
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#060910] p-4 text-center">
        <div className="max-w-md space-y-5">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center" style={{ background: 'rgba(255,59,48,0.1)' }}>
            <Lock className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-black uppercase text-white tracking-wider">Acceso Restringido</h1>
          <p className="text-white/50 leading-relaxed text-sm">{error || 'El perfil solicitado no existe o el enlace es incorrecto.'}</p>
        </div>
      </div>
    );
  }

  const { user, activities } = data;
  
  // Index activities by ID
  const acts: Record<string, any> = {};
  activities.forEach(a => { acts[a.activity_id] = a; });

  const coreTotal = ["adn", "gastos", "termostato", "trampas", "pedem", "sombra", "flow"].filter(id => acts[id]).length;

  const gastosData = (() => {
    if (!acts.gastos) return { completed: false, monthly: 0, annual: 0 };
    const meta = acts.gastos.metadata || {};
    let total = 0;
    if (typeof meta.total === 'number') {
      total = meta.total;
    } else if (meta.amounts) {
      total = Object.values(meta.amounts).reduce((s: number, v: any) => s + (parseFloat(v) || 0), 0);
    }
    return { completed: true, monthly: total, annual: total * 12 };
  })();

  const scoreColor = (score: number) => {
    if (score >= 8) return '#00E676';
    if (score >= 6) return '#F2C500';
    return '#FF5252';
  };

  const verdictColor = (verdict: string) => {
    if (verdict === 'ALTAMENTE RECOMENDADO') return '#00E676';
    if (verdict === 'RECOMENDADO') return '#00D1FF';
    return '#F2C500';
  };

  const scriptComercial = analysis?.script_comercial || {
    apertura: {
      pregunta: `Hola ${user?.name || 'Trader'}, qué gusto saludarte. Vi que completaste las 7 actividades de GENY LAB. Cuéntame, ¿qué fue lo que más te hizo clic de todo este proceso?`,
      que_escuchar: "Principiante: Hablará de seguridad y miedo. Intermedio: Hablará de consistencia y desorden. Avanzado: Hablará de optimizar y timing.",
      directriz: "No vendas todavía. Escuchar de forma activa y tomar nota de la palabra clave."
    },
    punto_actual: {
      pregunta: "Excelente. Y hoy en tu día a día con las finanzas y las inversiones, ¿en qué punto sientes que estás exactamente?",
      que_escuchar: "Clasificación del prospecto según su nivel de trading.",
      directriz: "Clasificar mentalmente al usuario: principiante, intermedio o avanzado."
    },
    dolor_real: {
      pregunta: "Entiendo. Y cuando intentas avanzar o aplicar lo que ya sabes, ¿qué es lo que más te cuesta sostener o mantener en el tiempo?",
      que_escuchar: "Falta de claridad en principiante. Inconsistencia/emociones en intermedio. Precisión y acompañamiento en avanzado.",
      directriz: "Aplicar la técnica de Reflejo Profesional: 'O sea que no es falta de ganas, es falta de estructura...'"
    },
    impacto: {
      pregunta: "Totalmente. Y si no cambias esto y sigues operando igual, ¿cómo te ves de aquí a 6 meses?",
      que_escuchar: "Igual de estancado, repitiendo ciclos, o dejando dinero sobre la mesa.",
      directriz: "Hacer silencio absoluto tras lanzar la pregunta. Deja que él mismo sienta el costo de no actuar."
    },
    diagnostico: {
      pregunta: `Por lo que me cuentas y analizando tu perfil, lo que necesitas es ${
        analysis?.plan_sugerido === 'pro' 
          ? 'un método blindado con acompañamiento diario directo para afinar tu ejecución' 
          : 'una ruta clara paso a paso que te dé la seguridad técnica para operar sin miedo'
      }.`,
      que_escuchar: "Escucha su nivel de acuerdo y apertura ante tu diagnóstico.",
      directriz: "Da un diagnóstico directo y clínico. Muestra autoridad profesional."
    },
    recomendacion: {
      pregunta: `Con base en esto, la opción que más sentido tiene para ti y que te va a ayudar a resolver esto de raíz es el plan ${analysis?.plan_nombre || 'INGRESARIOS PRO'} (${analysis?.plan_precio || '$1,497 USD Pago Único'}).`,
      que_escuchar: "Reacciones iniciales ante el precio o el plan sugerido.",
      directriz: "Recomienda una sola opción principal. No muestres alternativas a menos que sea necesario."
    },
    cierre: {
      pregunta: "¿Qué tendría que pasar en este momento para que tomes la decisión de dar el paso y empezar a trabajar juntos?",
      que_escuchar: "Objeciones finales y reales de presupuesto, tiempo o seguridad.",
      directriz: "Escucha la objeción real y responde utilizando el manejador de objeciones. No sobreexpliques."
    }
  };

  return (
    <div className="min-h-screen bg-[#060910] text-white selection:bg-[#00D1FF]/30 pb-32 font-sans">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-[#060910]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,209,255,0.1)', border: '1px solid rgba(0,209,255,0.2)' }}>
              <Shield className="w-4 h-4 text-[#00D1FF]" />
            </div>
            <div>
              <div className="text-xs font-black tracking-[0.2em] text-white">GENY LAB</div>
              <div className="text-[9px] text-[#00D1FF] tracking-[0.1em] uppercase font-bold">Reporte Confidencial</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-white/30" />
            <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest hidden sm:inline-block">Acceso Privado</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 mt-10 space-y-12">
        
        {/* User Profile Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl p-8 border border-[#00D1FF]/20" style={{ background: 'linear-gradient(135deg, rgba(0,209,255,0.05) 0%, rgba(6,9,16,1) 100%)' }}>
          <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
            <UserIcon className="w-40 h-40 text-[#00D1FF]" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
            <div>
              <p className="text-[#00D1FF] font-black text-[10px] uppercase tracking-[0.25em] mb-3">Radiografía del Trader</p>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-2">{user.name}</h1>
              
              <div className="flex flex-wrap items-center gap-y-3 gap-x-6 mt-6">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-white/40" />
                  <span className="text-sm font-mono text-white/80">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-white/40" />
                    <span className="text-sm font-mono text-white/80">{user.phone}</span>
                  </div>
                )}
                {user.country_name && (
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-white/40" />
                    <span className="text-sm font-medium text-white/80">{user.country_name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-white/40" />
                  <span className="text-sm text-white/60">Registrado el {new Date(user.created_at).toLocaleDateString('es-MX')}</span>
                </div>
              </div>
            </div>
            
            <div className="shrink-0 text-center bg-black/40 rounded-2xl p-5 border border-white/5 min-w-[140px]">
              <div className="text-3xl font-black text-[#00E676]">{coreTotal}<span className="text-lg text-white/20">/7</span></div>
              <div className="text-[10px] uppercase tracking-widest text-white/40 mt-1 font-bold">Actividades<br/>Core</div>
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* AI ANALYSIS PANEL */}
        {/* ═══════════════════════════════════════════════════════ */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-3xl border overflow-hidden"
          style={{ 
            borderColor: analysis ? 'rgba(139,92,246,0.3)' : 'rgba(139,92,246,0.15)',
            background: 'linear-gradient(135deg, rgba(139,92,246,0.05) 0%, rgba(6,9,16,1) 100%)'
          }}
        >
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.15)' }}>
                  <Brain className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wide">Análisis AI del Perfil</h2>
                  <p className="text-xs text-purple-400 font-bold uppercase tracking-widest mt-0.5">Powered by DeepSeek</p>
                </div>
              </div>
            </div>

            {!analysis && !analyzing && (
              <div className="text-center py-8">
                <p className="text-white/50 text-sm mb-6 max-w-md mx-auto">
                  Genera un análisis cruzado de todas las actividades del usuario para determinar su aptitud y plan de pago recomendado para el Método Ingresarios.
                </p>
                <button 
                  onClick={generateAnalysis}
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all duration-300 hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: '#fff' }}
                >
                  <Sparkles className="w-5 h-5" />
                  Generar Análisis con AI
                </button>
                {analysisError && (
                  <p className="text-red-400 text-xs mt-4">{analysisError}</p>
                )}
              </div>
            )}

            {analyzing && (
              <div className="text-center py-12">
                <Loader2 className="w-10 h-10 text-purple-400 animate-spin mx-auto mb-4" />
                <p className="text-purple-300 text-sm font-bold uppercase tracking-widest animate-pulse">
                  Analizando perfil financiero...
                </p>
                <p className="text-white/30 text-xs mt-2">Cruzando datos de {activities.length} actividades</p>
              </div>
            )}

            {analysis && (
              <div className="space-y-6">
                {/* Score + Verdict + Plan */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="bg-black/40 rounded-2xl p-5 border border-white/5 text-center">
                    <div className="text-5xl font-black" style={{ color: scoreColor(analysis.score) }}>{analysis.score}</div>
                    <div className="text-[10px] uppercase tracking-widest text-white/40 mt-2 font-bold">Score de Aptitud</div>
                    <div className="text-[9px] text-white/20 mt-1">de 10</div>
                  </div>
                  <div className="bg-black/40 rounded-2xl p-5 border border-white/5 text-center flex flex-col justify-center">
                    <div className="text-sm font-black uppercase tracking-wider" style={{ color: verdictColor(analysis.verdict) }}>
                      {analysis.verdict}
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-white/40 mt-2 font-bold">Veredicto</div>
                  </div>
                  <div className="bg-black/40 rounded-2xl p-5 border border-white/5 text-center flex flex-col justify-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <DollarSign className="w-5 h-5 text-[#00E676]" />
                      <span className="text-lg font-black text-[#00E676]">{analysis.plan_precio}</span>
                    </div>
                    <div className="text-xs font-bold text-white/70 mt-1">{analysis.plan_nombre}</div>
                    <div className="text-[10px] uppercase tracking-widest text-white/40 mt-1 font-bold">Plan Sugerido</div>
                  </div>
                </div>

                {/* Impact Data Point */}
                {analysis.dato_impacto && (
                  <div className="rounded-2xl p-5 text-center border border-[#FF5252]/20" style={{ background: 'rgba(255,82,82,0.04)' }}>
                    <Zap className="w-6 h-6 text-[#FF5252] mx-auto mb-2" />
                    <p className="text-base font-black text-white/90">{analysis.dato_impacto}</p>
                    <p className="text-[10px] uppercase tracking-widest text-[#FF5252] mt-2 font-bold">Dato de Impacto — Usar en la Sesión</p>
                  </div>
                )}

                {/* ═══════════════════════════════════════════════════════ */}
                {/* 7-STEP DYNAMIC CLOSER SCRIPT Accordion */}
                {/* ═══════════════════════════════════════════════════════ */}
                <div className="bg-black/30 rounded-3xl p-6 border border-white/5 space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-[#00D1FF]" />
                      <h3 className="text-lg font-black uppercase tracking-wider text-white">Guía Interactiva del Guion (Closers)</h3>
                    </div>
                    <span className="text-[10px] font-mono text-purple-400 bg-purple-400/10 border border-purple-400/20 px-2.5 py-0.5 rounded-full uppercase tracking-widest font-bold">7 Momentos</span>
                  </div>

                  <div className="space-y-3">
                    {stepsInfo.map((step, idx) => {
                      const stepData = scriptComercial[step.key] || {};
                      const isOpen = activeStep === idx;
                      
                      return (
                        <div 
                          key={step.key} 
                          className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                            isOpen ? 'border-[#00D1FF]/30 bg-[#080d16]/80 shadow-[0_0_20px_rgba(0,209,255,0.03)]' : 'border-white/5 bg-black/20 hover:border-white/10'
                          }`}
                        >
                          {/* Accordion Header */}
                          <button
                            onClick={() => setActiveStep(isOpen ? null : idx)}
                            className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold text-white shrink-0"
                                style={{ background: step.badgeColor, border: `1px solid ${step.textColor}33` }}
                              >
                                {step.num}
                              </div>
                              <div>
                                <span className="text-sm font-black text-white uppercase tracking-wider">{step.title}</span>
                                <span className="mx-2 text-white/20">|</span>
                                <span className="text-xs font-mono uppercase tracking-wider text-white/50">{step.objective}</span>
                              </div>
                            </div>
                            {isOpen ? (
                              <ChevronUp className="w-4 h-4 text-white/40" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-white/40" />
                            )}
                          </button>

                          {/* Accordion Body */}
                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="border-t border-white/5"
                              >
                                <div className="p-5 space-y-4">
                                  {/* Suggested Question */}
                                  <div className="bg-[#00D1FF]/[0.04] border border-[#00D1FF]/30 rounded-2xl p-5 relative overflow-hidden shadow-[inset_0_0_20px_rgba(0,209,255,0.05)]">
                                    <div className="absolute top-0 right-0 p-4 opacity-[0.04] pointer-events-none">
                                      <MessageSquare className="w-20 h-20 text-[#00D1FF]" />
                                    </div>
                                    <span className="text-[10px] font-mono text-[#00D1FF] uppercase tracking-wider font-extrabold block mb-2.5">Pregunta sugerida a realizar:</span>
                                    <p className="text-base md:text-xl font-black text-white pl-4 border-l-4 border-[#00D1FF] leading-relaxed select-all">
                                      "{stepData.pregunta || ''}"
                                    </p>
                                  </div>

                                  {/* Grid columns */}
                                  <div className="grid md:grid-cols-2 gap-4">
                                    {/* What to listen for */}
                                    <div className="bg-[#0c121e]/60 rounded-xl p-5 border border-white/10 space-y-3">
                                      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                                        <Brain className="w-4 h-4 text-purple-400 shrink-0" />
                                        <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-black">¿Qué debes escuchar?</span>
                                      </div>
                                      <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line font-medium">
                                        {stepData.que_escuchar || ''}
                                      </p>
                                    </div>

                                    {/* What the agent should do */}
                                    <div className="bg-[#0c121e]/60 rounded-xl p-5 border border-white/10 space-y-3">
                                      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                                        <Target className="w-4 h-4 text-[#00E676] shrink-0" />
                                        <span className="text-[10px] font-mono text-[#00E676] uppercase tracking-widest font-black">¿Qué debe hacer el comercial?</span>
                                      </div>
                                      <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line font-medium">
                                        {stepData.directriz || ''}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Objection Handlers */}
                {analysis.objeciones && (
                  <div className="rounded-2xl border border-[#F2C500]/15 overflow-hidden bg-black/20" style={{ background: 'rgba(242,197,0,0.02)' }}>
                    <div className="p-6 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <ShieldAlert className="w-5 h-5 text-[#F2C500]" />
                        <span className="text-sm font-black text-[#F2C500] uppercase tracking-widest">Manejo de Objeciones del Cliente</span>
                      </div>
                      <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">Respuestas adaptadas basadas en las respuestas del lead</p>
                    </div>
                    <div className="divide-y divide-white/5">
                      {[
                        { key: 'precio', label: '"Está muy caro"', icon: <DollarSign className="w-3.5 h-3.5" />, color: '#FF5252' },
                        { key: 'tiempo', label: '"No tengo tiempo"', icon: <Clock className="w-3.5 h-3.5" />, color: '#00D1FF' },
                        { key: 'ya_compre_cursos', label: '"Ya compré otros cursos"', icon: <BookX className="w-3.5 h-3.5" />, color: '#8b5cf6' },
                        { key: 'necesito_pensarlo', label: '"Necesito pensarlo"', icon: <Brain className="w-3.5 h-3.5" />, color: '#F2C500' },
                        { key: 'no_tengo_dinero', label: '"No tengo dinero"', icon: <AlertTriangle className="w-3.5 h-3.5" />, color: '#FF5252' },
                      ].filter(o => analysis.objeciones[o.key]).map((obj) => (
                        <div key={obj.key} className="px-6 py-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span style={{ color: obj.color }}>{obj.icon}</span>
                            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: obj.color }}>{obj.label}</span>
                          </div>
                          <p className="text-sm text-white/70 leading-relaxed pl-5">{analysis.objeciones[obj.key]}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strengths + Attention Areas */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-black/30 rounded-2xl p-6 border border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-4 h-4 text-[#00E676]" />
                      <span className="text-xs font-bold text-[#00E676] uppercase tracking-widest">Fortalezas (Anclas Positivas)</span>
                    </div>
                    <ul className="space-y-2.5">
                      {analysis.fortalezas?.map((f: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-white/70 leading-relaxed">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#00E676] mt-0.5 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-black/30 rounded-2xl p-6 border border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-4 h-4 text-[#F2C500]" />
                      <span className="text-xs font-bold text-[#F2C500] uppercase tracking-widest">Puntos de Resistencia (A vigilar)</span>
                    </div>
                    <ul className="space-y-2.5">
                      {analysis.areas_atencion?.map((a: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-white/70 leading-relaxed">
                          <AlertTriangle className="w-3.5 h-3.5 text-[#F2C500] mt-0.5 shrink-0" />
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Regenerate button */}
                <div className="text-center pt-2 border-t border-white/5">
                  <button 
                    onClick={generateAnalysis}
                    className="text-xs text-white/30 hover:text-purple-400 transition-colors font-bold uppercase tracking-widest font-mono"
                  >
                    ↻ Regenerar Diagnóstico Completo (AI)
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* COMPACT DATA GRID - USER RESPONSES (CORE) */}
        {/* ═══════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/5 bg-black/20 p-6 md:p-8 space-y-6"
        >
          <div className="flex items-center gap-2 border-b border-white/5 pb-4">
            <Activity className="w-5 h-5 text-[#00D1FF]" />
            <h3 className="text-base font-black uppercase tracking-wider text-white">Respuestas del Reto (Datos Core)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* ADN */}
            <div className="bg-black/30 p-5 rounded-2xl border border-white/5 space-y-2">
              <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-bold block">🧬 ADN Financiero</span>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">Arquetipo: <span className="text-[#FFD700]">{acts.adn?.metadata?.adn || 'No completado'}</span></p>
                <p className="text-xs text-white/50">Sombra: <span className="text-red-400">{acts.adn?.metadata?.sombra || 'N/A'}</span></p>
              </div>
            </div>

            {/* GASTOS */}
            <div className="bg-black/30 p-5 rounded-2xl border border-white/5 space-y-2">
              <span className="text-[10px] font-mono text-[#00D1FF] uppercase tracking-widest font-bold block">🐜 Gastos Hormiga</span>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">Fuga Mensual: <span className="text-red-400">{gastosData.completed ? `$${Math.round(gastosData.monthly).toLocaleString()}` : 'No completado'}</span></p>
                <p className="text-xs text-white/50">Fuga Anual: <span className="text-red-500 font-bold">{gastosData.completed ? `$${Math.round(gastosData.annual).toLocaleString()}` : 'N/A'}</span></p>
              </div>
            </div>

            {/* TERMOSTATO */}
            <div className="bg-black/30 p-5 rounded-2xl border border-white/5 space-y-2">
              <span className="text-[10px] font-mono text-[#00E676] uppercase tracking-widest font-bold block">🌡️ Termostato</span>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">Puntaje: <span className="text-[#00E676]">{acts.termostato?.metadata?.puntaje_global ? `${acts.termostato.metadata.puntaje_global}°` : 'No completado'}</span></p>
                <p className="text-xs text-white/50">Calibración: <span className="text-white/80">{acts.termostato?.metadata?.temperatura_label || 'N/A'}</span></p>
              </div>
            </div>

            {/* TRAMPAS */}
            <div className="bg-black/30 p-5 rounded-2xl border border-white/5 space-y-2">
              <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest font-bold block">🧠 Trampas del Dinero</span>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">Trampas Detectadas:</p>
                <p className="text-xs text-white/70">
                  {acts.trampas?.metadata?.responses 
                    ? `${Object.keys(acts.trampas.metadata.responses).length} sesgos evaluados` 
                    : 'No completado'}
                </p>
              </div>
            </div>

            {/* PEDEM */}
            <div className="bg-black/30 p-5 rounded-2xl border border-white/5 space-y-2">
              <span className="text-[10px] font-mono text-[#00D1FF] uppercase tracking-widest font-bold block">📋 Mi Primer PEDEM</span>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">Estado del Plan:</p>
                <p className="text-xs text-[#00E676] font-bold">
                  {acts.pedem ? '✓ Estructurado y Guardado' : 'No completado'}
                </p>
              </div>
            </div>

            {/* EMOCIONES Y FLOW */}
            <div className="bg-black/30 p-5 rounded-2xl border border-white/5 space-y-2">
              <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-bold block">⚡ Emociones y Flow</span>
              <div className="space-y-1">
                <p className="text-xs text-white/80">Sombra Emocional: <span className="text-purple-300 font-bold">{acts.sombra ? `Día ${acts.sombra.metadata?.d || acts.sombra.metadata?.selDay || 'Listo'}` : 'Pendiente'}</span></p>
                <p className="text-xs text-white/80">Reto del Flow: <span className="text-[#00D1FF] font-bold">{acts.flow ? `Día ${acts.flow.metadata?.d || acts.flow.metadata?.selDay || 'Listo'}` : 'Pendiente'}</span></p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TECHNICAL RAW DATA SECTION (COLLAPSIBLE / DEVELOPER ONLY) */}
        {/* ═══════════════════════════════════════════════════════ */}
        <div className="pt-8 border-t border-white/5 text-center">
          <button
            onClick={() => setShowTechnicalData(!showTechnicalData)}
            className="text-[10px] font-mono text-white/20 hover:text-white/40 uppercase tracking-widest font-bold transition-colors"
          >
            {showTechnicalData ? '▲ Ocultar Datos Técnicos de Soporte' : '▼ Mostrar Datos Técnicos de Soporte (JSON)'}
          </button>

          {showTechnicalData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-left space-y-4 max-w-2xl mx-auto"
            >
              <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                <p className="text-xs font-mono text-white/40 mb-3 uppercase tracking-wider">Payloads de Actividades en Supabase:</p>
                <div className="space-y-3">
                  {activities.map((act) => (
                    <JsonViewer key={act.activity_id} data={act.metadata} title={`actividad: ${act.activity_id}`} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

