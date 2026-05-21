import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Shield, ChevronDown, ChevronUp, CheckCircle2, User as UserIcon, Calendar, MapPin, Phone, Mail, FileJson, Activity, Lock } from 'lucide-react';
import { motion } from 'motion/react';

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

export default function PublicResultsView() {
  const { userId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<{ user: any, activities: any[] } | null>(null);

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
        const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-api/public-results/${userId}`);
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

        {/* Activity Blocks */}
        <div className="space-y-6">
          <ActivityBlock id="adn" title="ADN Financiero" emoji="🧬" log={acts.adn}>
            {acts.adn?.metadata && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-black/30 p-5 rounded-2xl border border-white/5">
                  <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Arquetipo Principal</p>
                  <p className="text-xl font-bold text-[#FFD700]">{acts.adn.metadata.adn || 'N/A'}</p>
                </div>
                <div className="bg-black/30 p-5 rounded-2xl border border-white/5">
                  <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Sombra (Debilidad)</p>
                  <p className="text-base text-red-400 font-medium">{acts.adn.metadata.sombra || 'N/A'}</p>
                </div>
              </div>
            )}
          </ActivityBlock>

          <ActivityBlock id="gastos" title="Gastos Hormiga" emoji="🐜" log={acts.gastos}>
            {acts.gastos?.metadata && (
              <div className="bg-black/30 p-5 rounded-2xl border border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Fuga Mensual Detectada</p>
                  <p className="text-3xl font-black text-white">${Math.round(acts.gastos.metadata.total || 0).toLocaleString('en-US')}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Pérdida Anual</p>
                  <p className="text-xl font-bold text-red-500">${Math.round((acts.gastos.metadata.total || 0) * 12).toLocaleString('en-US')}</p>
                </div>
              </div>
            )}
          </ActivityBlock>

          <ActivityBlock id="termostato" title="Termostato Financiero" emoji="🌡️" log={acts.termostato}>
            {acts.termostato?.metadata && (
              <div className="bg-black/30 p-5 rounded-2xl border border-white/5 flex items-center gap-6">
                <div className="text-5xl font-black text-[#00D1FF]">{acts.termostato.metadata.puntaje_global}°</div>
                <div>
                  <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Calibración Actual</p>
                  <p className="text-lg font-bold text-white">{acts.termostato.metadata.temperatura_label || 'N/A'}</p>
                </div>
              </div>
            )}
          </ActivityBlock>

          <ActivityBlock id="trampas" title="Trampas del Dinero" emoji="🧠" log={acts.trampas}>
            {acts.trampas?.metadata && (
              <div className="bg-black/30 p-5 rounded-2xl border border-white/5">
                <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Respuestas del Quiz</p>
                <div className="flex flex-wrap gap-2 text-sm text-white/80">
                  {Object.keys(acts.trampas.metadata.responses || {}).length} trampas detectadas o evaluadas. (Ver Raw JSON para los detalles específicos de cada sesgo).
                </div>
              </div>
            )}
          </ActivityBlock>

          <ActivityBlock id="pedem" title="Mi Primer PEDEM" emoji="📋" log={acts.pedem}>
            {acts.pedem?.metadata && (
              <div className="bg-black/30 p-5 rounded-2xl border border-white/5">
                <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Plan Estructurado (Resumen)</p>
                <p className="text-sm text-white/60">Contiene metas, control de deudas, e ingresos planeados. Abre el Raw JSON para leer el plan completo detallado.</p>
              </div>
            )}
          </ActivityBlock>

          <ActivityBlock id="sombra" title="Mis Emociones (Sombra)" emoji="🤯" log={acts.sombra}>
            {acts.sombra?.metadata && (
              <div className="bg-black/30 p-5 rounded-2xl border border-white/5">
                <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Último avance</p>
                <p className="text-base text-white">Día registrado: <span className="font-bold text-[#00D1FF]">{acts.sombra.metadata.d || acts.sombra.metadata.selDay || 1}</span></p>
              </div>
            )}
          </ActivityBlock>

          <ActivityBlock id="flow" title="Reto del Flow" emoji="⚡" log={acts.flow}>
            {acts.flow?.metadata && (
              <div className="bg-black/30 p-5 rounded-2xl border border-white/5">
                <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Estado actual</p>
                <p className="text-base text-white">Día de Flow: <span className="font-bold text-[#00D1FF]">{acts.flow.metadata.d || acts.flow.metadata.selDay || 1}</span></p>
              </div>
            )}
          </ActivityBlock>

        </div>
      </div>
    </div>
  );
}
