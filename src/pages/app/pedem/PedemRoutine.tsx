import { motion } from 'motion/react';
import { ROUTINE_CHECKS, SHADOW_OPTIONS } from './constants';

interface Props {
  data: Record<string, any>;
  onChange: (key: string, val: any) => void;
  onFinish: () => void;
  onBack: () => void;
}

function CheckItem({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all text-sm w-full cursor-pointer ${checked ? 'bg-brand-green/5 border-brand-green/30' : 'bg-white/[0.03] border-white/5 hover:border-white/10'}`}>
      <div className={`w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center border-2 transition-all mt-0.5 ${checked ? 'bg-brand-green border-brand-green' : 'border-white/20'}`}>
        {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="#000" strokeWidth="2"/></svg>}
      </div>
      <span className={`leading-snug ${checked ? 'text-white font-medium' : 'text-brand-text-muted'}`}>{label}</span>
    </button>
  );
}

function FormField({ label, id, placeholder, req, rows, value, onChangeValue }: {
  label: string; id: string; placeholder: string; req?: boolean; rows?: number;
  value: string; onChangeValue: (id: string, val: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs tracking-[0.2em] uppercase text-brand-text-muted font-black flex items-center gap-2">
        {label} {req && <span className="text-brand-orange">*</span>}
      </label>
      {rows ? (
        <textarea value={value} onChange={e => onChangeValue(id, e.target.value)} placeholder={placeholder} rows={rows}
          className="input-field resize-y" />
      ) : (
        <input type="text" value={value} onChange={e => onChangeValue(id, e.target.value)} placeholder={placeholder}
          className="input-field" />
      )}
    </div>
  );
}

function DayBlock({ time, title, id, placeholder, value, onChangeValue }: {
  time: string; title: string; id: string; placeholder: string;
  value: string; onChangeValue: (id: string, val: string) => void;
}) {
  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-xs tracking-[0.15em] uppercase font-black text-brand-blue bg-brand-blue/10 px-2.5 py-1.5 rounded-lg">{time}</span>
        <span className="text-base font-black text-white">{title}</span>
      </div>
      <input value={value} onChange={e => onChangeValue(id, e.target.value)} placeholder={placeholder}
        className="w-full bg-black/30 border border-white/6 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-green/50 transition-colors placeholder:text-white/20" />
    </div>
  );
}

export function PedemRoutine({ data, onChange, onFinish, onBack }: Props) {
  const checks: string[] = data.rou_checklist || [];
  const toggleCheck = (id: string) => {
    const next = checks.includes(id) ? checks.filter(c => c !== id) : [...checks, id];
    onChange('rou_checklist', next);
  };

  const valid = data.rou_body && data.rou_analysis && data.rou_intention && data.rou_improvement;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-3 text-xs tracking-[0.25em] uppercase text-brand-text-muted font-black">
        <span className="w-2 h-2 rounded-full bg-brand-blue" /> RUTINA PRE-MERCADO · PASO 1 DE 2
      </div>
      <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-none">
        Tu ritual <span className="title-highlight">antes de abrir.</span>
      </h1>
      <p className="text-brand-text-muted text-sm leading-relaxed">El 95% abre el gráfico y reacciona. El 5% llega con ritual. Diseña el tuyo ahora.</p>

      <div className="text-xs tracking-[0.2em] uppercase text-brand-text-muted font-black flex items-center gap-3 pt-2">
        <span className="w-6 h-px bg-brand-blue" /> PLANEAR · Mi ritual en 3 pasos
      </div>
      <DayBlock time="30 min antes" title="Estado físico" id="rou_body" placeholder='Ej: "Agua, respiración 4-7-8, 10 sentadillas"' value={data.rou_body || ''} onChangeValue={onChange} />
      <DayBlock time="20 min antes" title="Análisis de mercado" id="rou_analysis" placeholder='Ej: "Revisar niveles clave SPX/ES, noticias, VIX"' value={data.rou_analysis || ''} onChangeValue={onChange} />
      <DayBlock time="5 min antes" title="Intención del día" id="rou_intention" placeholder='Ej: "Hoy opero solo si veo mi setup A. Máximo 2 trades."' value={data.rou_intention || ''} onChangeValue={onChange} />

      <div className="text-xs tracking-[0.2em] uppercase text-brand-text-muted font-black flex items-center gap-3 pt-4">
        <span className="w-6 h-px bg-brand-orange" /> EJECUTAR · No abrir el gráfico si...
      </div>
      <div className="space-y-2">
        {ROUTINE_CHECKS.map(c => <CheckItem key={c.id} label={c.label} checked={checks.includes(c.id)} onToggle={() => toggleCheck(c.id)} />)}
      </div>

      <div className="text-xs tracking-[0.2em] uppercase text-brand-text-muted font-black flex items-center gap-3 pt-4">
        <span className="w-6 h-px bg-brand-orange" /> DOCUMENTAR · Mi sombra más común
      </div>
      <div className="grid grid-cols-2 gap-3">
        {SHADOW_OPTIONS.map(s => (
          <button key={s.id} onClick={() => onChange('rou_shadow', data.rou_shadow === s.id ? '' : s.id)}
            className={`glass-card p-4 text-left transition-all cursor-pointer ${data.rou_shadow === s.id ? 'border-brand-orange/50 bg-brand-orange/5' : 'hover:border-white/10'}`}>
            <div className="text-sm font-black text-white">{s.name}</div>
            <div className="text-xs text-brand-text-muted mt-1">{s.desc}</div>
          </button>
        ))}
      </div>

      <div className="text-xs tracking-[0.2em] uppercase text-brand-text-muted font-black flex items-center gap-3 pt-4">
        <span className="w-6 h-px bg-brand-green" /> MEJORAR
      </div>
      <FormField label="¿Qué mejora quieres ver en 21 días?" id="rou_improvement" placeholder='Ej: "Operar solo mi setup A, respetar mi stop 10 de 10 veces"' req rows={3} value={data.rou_improvement || ''} onChangeValue={onChange} />

      <div className="flex gap-3 pt-4 pb-8">
        <button onClick={onBack} className="btn-secondary px-6 py-3.5 rounded-xl text-sm font-black uppercase tracking-widest cursor-pointer">← Atrás</button>
        <button onClick={onFinish} disabled={!valid} className={`flex-1 py-4 rounded-xl text-sm font-black uppercase tracking-[0.12em] transition-all cursor-pointer ${valid ? 'btn-primary' : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/5'}`}>
          Ver mi rutina →
        </button>
      </div>
    </motion.div>
  );
}
