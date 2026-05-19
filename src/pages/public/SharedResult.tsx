// @ts-nocheck
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { supabase } from '../../lib/supabase';

const CAT_LABELS: Record<string, string> = {
  programacion: 'Programación', setpoint: 'Setpoint', neuronas_espejo: 'Neuronas Espejo',
  adaptacion: 'Adaptación', merecimiento: 'Merecimiento', disciplina: 'Disciplina',
};
const PROFILE_COLORS: Record<string, string> = {
  Guardián: '#3b82f6', Constructor: '#8b5cf6', Estratega: '#f59e0b', Cazador: '#ef4444', Emprendedor: '#10b981',
};

function getTempColor(score: number): string {
  if (score <= 20) return '#3b82f6';
  if (score <= 40) return '#06b6d4';
  if (score <= 60) return '#10b981';
  if (score <= 75) return '#FFD700';
  if (score <= 90) return '#f97316';
  return '#ef4444';
}

function ADNResult({ d }: { d: any }) {
  const color = PROFILE_COLORS[d.adn] || '#00D4FF';
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="text-7xl">{d.emoji}</div>
        <p className="text-xs font-black uppercase tracking-widest text-[#FFD700]">{d.titulo}</p>
        <h2 className="text-4xl font-black uppercase">ADN <span style={{ color }}>{d.adn}</span></h2>
      </div>
      <div className="glass-card p-6"><p className="text-xs font-black uppercase tracking-widest text-brand-blue mb-3">Lectura de tu perfil</p><p className="text-base text-slate-300 leading-relaxed">{d.lecturaCore}</p></div>
      <div className="glass-card p-6 border border-amber-500/20"><p className="text-xs font-black uppercase tracking-widest text-[#FFD700] mb-3">Tu sombra financiera</p><p className="text-base text-slate-300 leading-relaxed">{d.sombra}</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-6"><p className="text-xs font-black uppercase tracking-widest text-brand-blue mb-3">Tu fortaleza real</p><p className="text-base text-slate-300">{d.fortaleza}</p></div>
        <div className="glass-card p-6 border border-amber-500/10"><p className="text-xs font-black uppercase tracking-widest text-[#FFD700] mb-3">Patrón de sabotaje</p><p className="text-base text-slate-300">{d.patron}</p></div>
      </div>
      <div className="rounded-2xl p-8 text-center bg-brand-blue/10 border border-brand-blue/20">
        <p className="text-xs font-black uppercase tracking-widest text-brand-blue mb-4">Frase de activación</p>
        <p className="text-xl text-white font-medium italic">"{d.activacion}"</p>
      </div>
    </div>
  );
}

function TermostatoResult({ d }: { d: any }) {
  const color = getTempColor(d.puntaje_global);
  const radarData = Object.entries(d.categorias || {}).map(([k, v]) => ({ axis: CAT_LABELS[k] || k, value: v }));
  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="text-7xl">🌡️</div>
        <div className="flex items-baseline justify-center gap-3">
          <span className="text-7xl font-black font-mono" style={{ color }}>{d.puntaje_global}°</span>
          <span className="text-2xl font-bold" style={{ color }}>{d.temperatura_label}</span>
        </div>
        {d.tags_patron && <div className="flex flex-wrap justify-center gap-2">{d.tags_patron.map((t: string, i: number) => (<span key={i} className="text-[11px] font-mono px-3 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">{t}</span>))}</div>}
      </div>
      <div className="glass-card p-6 border-t-2" style={{ borderTopColor: `${color}60` }}>
        <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color }}>Arquetipo: {d.arquetipo}</p>
        <p className="text-base text-slate-300 leading-relaxed">{d.arquetipo_desc}</p>
      </div>
      <div className="glass-card p-6"><p className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-3">Diagnóstico</p><p className="text-base text-slate-300 leading-relaxed">{d.diagnostico_breve}</p></div>
      {radarData.length > 0 && (
        <div className="glass-card p-6">
          <p className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-2">Radar de Dimensiones</p>
          <div className="h-[220px]"><ResponsiveContainer width="100%" height="100%"><RadarChart data={radarData}><PolarGrid stroke="rgba(255,255,255,0.1)" /><PolarAngleAxis dataKey="axis" tick={{ fill: '#9ca3af', fontSize: 10 }} /><Radar dataKey="value" stroke="#00D4FF" fill="#00D4FF" fillOpacity={0.25} strokeWidth={2} /></RadarChart></ResponsiveContainer></div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-6 border-t-2 border-t-emerald-500/40">
          <p className="text-xs font-mono text-emerald-400 uppercase tracking-widest mb-4">Fortalezas</p>
          {(d.fortalezas || []).map((f: string, i: number) => (<p key={i} className="text-sm text-white/80 mb-2">• {f}</p>))}
        </div>
        <div className="glass-card p-6 border-t-2 border-t-red-500/40">
          <p className="text-xs font-mono text-red-400 uppercase tracking-widest mb-4">Sombras</p>
          {(d.sombras || []).map((s: string, i: number) => (<p key={i} className="text-sm text-white/80 mb-2">• {s}</p>))}
        </div>
      </div>
      <div className="glass-card p-8 bg-gradient-to-br from-cyan-500/5 to-[#FFD700]/5 border-t-2 border-t-cyan-500/40">
        <p className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-3">Primer Paso esta Semana</p>
        <p className="text-lg text-white font-semibold">{d.primer_paso}</p>
      </div>
    </div>
  );
}

function GenericResult({ d, activity }: { d: any; activity: string }) {
  const labels: Record<string, string> = { gastos: 'Gastos Hormiga', trampas: 'Trampas del Dinero', pedem: 'Mi Primer PEDEM', sombra: 'Mis Emociones', flow: 'Reto del Flow' };
  return (
    <div className="space-y-6">
      <div className="text-center"><h2 className="text-2xl font-black uppercase">{labels[activity] || activity}</h2><p className="text-brand-text-muted text-sm mt-2">Resultados de la actividad</p></div>
      {d.summary && <div className="glass-card p-6"><p className="text-base text-slate-300 leading-relaxed">{d.summary}</p></div>}
      {d.score !== undefined && <div className="glass-card p-6 text-center"><p className="text-xs font-black uppercase tracking-widest text-brand-blue mb-2">Puntaje</p><p className="text-5xl font-black text-brand-blue">{d.score}</p></div>}
      {d.items && Array.isArray(d.items) && (
        <div className="glass-card p-6 space-y-3">
          {d.items.map((item: any, i: number) => (<div key={i} className="flex items-start gap-3"><span className="text-brand-blue font-mono text-sm">0{i + 1}</span><p className="text-sm text-white/80">{typeof item === 'string' ? item : JSON.stringify(item)}</p></div>))}
        </div>
      )}
    </div>
  );
}

function GastosHormigaResult({ d }: { d: any }) {
  const fmt = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;
  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="text-7xl">🐜</div>
        <p className="text-xs font-black uppercase tracking-widest text-[#FFD700]">Gastos Hormiga</p>
        <div className="text-5xl font-black text-white">{fmt(d.total)}<span className="text-lg text-white/50">/mes</span></div>
        <p className="text-sm text-brand-green font-medium">Proyección a 10 años: {fmt(d.proyeccion)}</p>
      </div>
      <div className="glass-card p-6 space-y-4 border-t-2 border-t-[#FFD700]/40">
        <p className="text-xs font-mono uppercase tracking-widest text-[#FFD700] mb-2">Resumen de Fugas</p>
        {(d.gastos || []).map((g: any, i: number) => (
          <div key={i} className="flex flex-col gap-1 border-b border-white/5 pb-3 last:border-0 last:pb-0">
            <p className="text-white/80 text-sm">{g.desc}</p>
            <p className="text-[#FFD700] text-xs italic">"{g.highlight}"</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrampasDineroResult({ d }: { d: any }) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="text-7xl">🧠</div>
        <p className="text-xs font-black uppercase tracking-widest text-brand-green">Trampas del Dinero</p>
        <h2 className="text-3xl font-black text-white uppercase">Reto Completado</h2>
      </div>
      <div className="glass-card p-6 border-t-2 border-t-brand-green/40">
         <p className="text-xs font-mono uppercase tracking-widest text-brand-green mb-4">Respuestas Destacadas</p>
         <div className="space-y-4">
           {Object.entries(d.responses || {}).map(([idx, resp], i) => (
             <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/5">
                <span className="text-[10px] text-white/30 font-mono uppercase">Pregunta {Number(idx)+1}</span>
                <p className="text-white/80 text-sm mt-1">{String(resp)}</p>
             </div>
           ))}
         </div>
      </div>
    </div>
  );
}

function PedemResultView({ d }: { d: any }) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="text-7xl">📋</div>
        <p className="text-xs font-black uppercase tracking-widest text-brand-blue">Mi Primer PEDEM</p>
        <h2 className="text-2xl font-black text-white uppercase">Plan Estructurado</h2>
      </div>
      <div className="glass-card p-6 border-t-2 border-t-brand-blue/40 space-y-3">
        {Object.entries(d.data || {}).map(([key, val], i) => (
          <div key={i} className="flex justify-between items-start py-2 border-b border-dashed border-white/10 last:border-b-0">
            <span className="text-xs tracking-[0.15em] uppercase text-slate-400 font-bold">{key}</span>
            <span className="text-sm font-medium text-right text-white max-w-[60%]">{String(val)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SombraResult({ d }: { d: any }) {
  const day = d.selDay || d.d || 1;
  const totalDays = 10;
  const completedDays = d.d || day;
  const progressPerc = Math.round((completedDays / totalDays) * 100);
  const phase = day <= 3 ? 'Detectar' : day <= 7 ? 'Desactivar' : 'Dominar';
  const phaseIcon = day <= 3 ? '🎯' : day <= 7 ? '⚔️' : '👑';
  const phaseColor = day <= 3 ? '#f97316' : day <= 7 ? '#f59e0b' : '#10b981';
  const traderName = d.n || d.name || 'Un Trader';
  const routeLabel = d.r === 'operador' ? '⚔️ Luchador' : '🛡️ Principiante';

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="text-7xl">🤯</div>
        <p className="text-xs font-black uppercase tracking-widest" style={{ color: phaseColor }}>Mis Emociones · Reto de 10 Días</p>
        <h2 className="text-3xl font-black text-white uppercase">Día {day} Completado</h2>
        {d.title && <p className="text-lg italic font-medium" style={{ color: phaseColor }}>"{d.title}"</p>}
        <p className="text-slate-400 text-sm"><span className="text-white font-bold">{traderName}</span> está dominando su Saboteador Interior</p>
      </div>

      {/* Progress */}
      <div className="glass-card p-6 border-t-2" style={{ borderTopColor: `${phaseColor}60` }}>
        <div className="flex justify-between text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">
          <span>Progreso del reto</span>
          <span className="text-white">{completedDays} de {totalDays} días</span>
        </div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 rounded-full transition-all" style={{ width: `${progressPerc}%` }} />
        </div>
        <div className="flex justify-between mt-3">
          <span className="text-[10px] font-black tracking-widest text-orange-500">🎯 Detectar</span>
          <span className="text-[10px] font-black tracking-widest text-amber-500">⚔️ Desactivar</span>
          <span className="text-[10px] font-black tracking-widest text-emerald-500">👑 Dominar</span>
        </div>
      </div>

      {/* Current Phase */}
      <div className="glass-card p-6 text-center">
        <div className="text-4xl mb-3">{phaseIcon}</div>
        <p className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: phaseColor }}>Fase Actual</p>
        <p className="text-2xl font-black text-white uppercase">{phase}</p>
        {d.r && <p className="text-xs text-slate-500 mt-2">Ruta: <span className="font-bold text-slate-300">{routeLabel}</span></p>}
      </div>

      {/* Motivational */}
      <div className="rounded-2xl p-8 text-center bg-gradient-to-br from-orange-500/5 to-emerald-500/5 border border-white/5">
        <p className="text-xs font-black uppercase tracking-widest text-orange-500 mb-4">¿Tú también tienes un Saboteador?</p>
        <p className="text-base text-slate-300 leading-relaxed">
          El 80% de los traders pierden por sus emociones, no por su estrategia.
          <span className="text-white font-bold"> Descubre al trader que te hace perder dinero.</span>
        </p>
      </div>
    </div>
  );
}

function FlowResult({ d }: { d: any }) {
  const day = d.selDay || d.d || 1;
  const totalDays = 10;
  const completedDays = d.d || day;
  const progressPerc = Math.round((completedDays / totalDays) * 100);
  const phase = day <= 3 ? 'Despertar' : day <= 6 ? 'Entrenamiento' : day <= 9 ? 'Integración' : 'Maestría';
  const phaseIcon = day <= 3 ? '🌅' : day <= 6 ? '⚡' : day <= 9 ? '🧬' : '👑';
  const phaseColor = day <= 3 ? '#3b82f6' : day <= 6 ? '#f59e0b' : day <= 9 ? '#8b5cf6' : '#10b981';
  const traderName = d.n || d.name || 'Un Trader';

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="text-7xl">⚡</div>
        <p className="text-xs font-black uppercase tracking-widest" style={{ color: phaseColor }}>Reto del Flow · 10 Días</p>
        <h2 className="text-3xl font-black text-white uppercase">Día {day} Completado</h2>
        {d.title && <p className="text-lg italic font-medium" style={{ color: phaseColor }}>"{d.title}"</p>}
        <p className="text-slate-400 text-sm"><span className="text-white font-bold">{traderName}</span> está activando su estado de Flow</p>
      </div>

      {/* Progress */}
      <div className="glass-card p-6 border-t-2" style={{ borderTopColor: `${phaseColor}60` }}>
        <div className="flex justify-between text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">
          <span>Progreso del reto</span>
          <span className="text-white">{completedDays} de {totalDays} días</span>
        </div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 via-amber-500 to-emerald-500 rounded-full transition-all" style={{ width: `${progressPerc}%` }} />
        </div>
      </div>

      {/* Current Phase */}
      <div className="glass-card p-6 text-center">
        <div className="text-4xl mb-3">{phaseIcon}</div>
        <p className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: phaseColor }}>Fase Actual</p>
        <p className="text-2xl font-black text-white uppercase">{phase}</p>
        {d.r && <p className="text-xs text-slate-500 mt-2">Ruta: <span className="font-bold text-slate-300 capitalize">{d.r}</span></p>}
      </div>

      {/* Motivational */}
      <div className="rounded-2xl p-8 text-center bg-gradient-to-br from-blue-500/5 to-emerald-500/5 border border-white/5">
        <p className="text-xs font-black uppercase tracking-widest text-brand-green mb-4">¿Quieres operar en Flow?</p>
        <p className="text-base text-slate-300 leading-relaxed">
          Los mejores traders operan en estado de Flow — concentración absoluta, sin ego, sin miedo.
          <span className="text-white font-bold"> Activa tu estado óptimo de rendimiento.</span>
        </p>
      </div>
    </div>
  );
}

const ACTIVITY_TITLES: Record<string, string> = {
  adn: 'ADN Financiero', termostato: 'Termóstato Financiero', gastos: 'Gastos Hormiga',
  trampas: 'Trampas del Dinero', pedem: 'Mi Primer PEDEM', sombra: 'Mis Emociones', flow: 'Reto del Flow',
};
const ACTIVITY_EMOJI: Record<string, string> = { adn: '🧬', termostato: '🌡️', gastos: '🐜', trampas: '🧠', pedem: '📋', sombra: '🤯', flow: '⚡' };

export default function SharedResult() {
  const { shareCode } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: row, error } = await supabase.from('shared_results').select('*').eq('share_code', shareCode).single();
      if (error || !row) { setNotFound(true); setLoading(false); return; }
      setData(row);
      setLoading(false);
    })();
  }, [shareCode]);

  if (loading) return (<div className="min-h-screen bg-brand-bg flex items-center justify-center"><motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-brand-blue font-black text-sm uppercase tracking-widest">Cargando resultados...</motion.div></div>);

  if (notFound) return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
      <div className="text-center space-y-6">
        <div className="text-6xl">🔍</div>
        <h1 className="text-2xl font-black uppercase">Resultado no encontrado</h1>
        <p className="text-brand-text-muted">Este enlace no existe o ha expirado.</p>
        <Link to="/" className="inline-block px-6 py-3 rounded-xl bg-brand-blue/10 border border-brand-blue/30 text-brand-blue text-sm font-bold uppercase tracking-wider hover:bg-brand-blue/20 transition-all">Ir a GENY LAB</Link>
      </div>
    </div>
  );

  const { activity, result_data: d } = data;

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Header */}
      <div className="border-b border-white/10 bg-brand-bg/95 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/images/78.png" alt="GENY LAB" className="h-8 md:h-10 w-auto object-contain" />
            <div className="h-6 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-xl">{ACTIVITY_EMOJI[activity] || '📊'}</span>
              <p className="text-sm font-bold text-white">{ACTIVITY_TITLES[activity] || activity}</p>
            </div>
          </div>
          <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted hover:text-white transition-colors">Descubrir mi resultado →</Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-10">
        {activity === 'adn' && <ADNResult d={d} />}
        {activity === 'termostato' && <TermostatoResult d={d} />}
        {activity === 'gastos' && <GastosHormigaResult d={d} />}
        {activity === 'trampas' && <TrampasDineroResult d={d} />}
        {activity === 'pedem' && <PedemResultView d={d} />}
        {activity === 'sombra' && <SombraResult d={d} />}
        {activity === 'flow' && <FlowResult d={d} />}
        {!['adn', 'termostato', 'gastos', 'trampas', 'pedem', 'sombra', 'flow'].includes(activity) && <GenericResult d={d} activity={activity} />}

        {/* CTA */}
        <div className="mt-12 text-center space-y-4">
          <div className="h-px bg-white/10 mb-8" />
          <p className="text-brand-text-muted text-sm">¿Quieres descubrir tu propio resultado?</p>
          <Link to="/" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-blue to-cyan-500 text-white font-black uppercase tracking-widest text-sm shadow-[0_0_25px_rgba(0,209,255,0.3)] hover:shadow-[0_0_40px_rgba(0,209,255,0.5)] transition-all">
            Entrar a GENY LAB 🚀
          </Link>
          <p className="text-[9px] font-mono text-white/15 uppercase tracking-widest mt-6">INGRESARIOS · GENY LAB</p>
        </div>
      </div>
    </div>
  );
}
