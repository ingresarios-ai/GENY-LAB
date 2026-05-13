import { motion } from 'motion/react';
import { NOVICE_HABITS } from './constants';

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

function FormField({ label, id, placeholder, req, rows, hint, value, onChangeValue }: {
  label: string; id: string; placeholder: string; req?: boolean; rows?: number; hint?: string;
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
      {hint && <p className="text-sm text-brand-text-muted/60">{hint}</p>}
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

export function PedemNovice({ data, onChange, onFinish, onBack }: Props) {
  const habits: string[] = data.nov_habits || [];
  const toggleHabit = (id: string) => {
    const next = habits.includes(id) ? habits.filter(h => h !== id) : [...habits, id];
    onChange('nov_habits', next);
  };

  const valid = data.nov_morning && data.nov_afternoon && data.nov_night && data.nov_goal && data.nov_metric && data.nov_vision;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-3 text-xs tracking-[0.25em] uppercase text-brand-text-muted font-black">
        <span className="w-2 h-2 rounded-full bg-brand-green" /> PEDEM DEL DÍA · PASO 1 DE 2
      </div>
      <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-none">
        Diseña <span className="title-highlight">tu mañana.</span>
      </h1>
      <p className="text-brand-text-muted text-sm leading-relaxed">
        Antes de operar mercados, el primer mercado que tienes que gestionar es tu día. Escribe tu mañana ideal en 2 minutos.
      </p>

      <div className="text-xs tracking-[0.2em] uppercase text-brand-text-muted font-black flex items-center gap-3 pt-2">
        <span className="w-6 h-px bg-brand-blue" /> PLANEAR · Tus 3 bloques
      </div>
      <DayBlock time="06–12h" title="Mañana" id="nov_morning" placeholder="Lo más importante que haré en la mañana" value={data.nov_morning || ''} onChangeValue={onChange} />
      <DayBlock time="12–18h" title="Tarde" id="nov_afternoon" placeholder="Qué hago después del trabajo/estudio" value={data.nov_afternoon || ''} onChangeValue={onChange} />
      <DayBlock time="18–22h" title="Noche · Bloque GENY LAB" id="nov_night" placeholder="Ej: 30 min estudiando el Reto 2K→20K" value={data.nov_night || ''} onChangeValue={onChange} />

      <FormField label="Una meta concreta para mañana" id="nov_goal" placeholder='Ej: "Terminar el Video 4 del Reto y hacer mi PEDEM"' req hint="Una sola cosa. No diez. Una." value={data.nov_goal || ''} onChangeValue={onChange} />

      <div className="text-xs tracking-[0.2em] uppercase text-brand-text-muted font-black flex items-center gap-3 pt-4">
        <span className="w-6 h-px bg-brand-green" /> EJECUTAR · Mis hábitos base
      </div>
      <p className="text-sm text-brand-text-muted">Marca los que YA tienes hoy. Los que no marques, son los primeros a trabajar.</p>
      <div className="space-y-2">
        {NOVICE_HABITS.map(h => <CheckItem key={h.id} label={h.label} checked={habits.includes(h.id)} onToggle={() => toggleHabit(h.id)} />)}
      </div>

      <div className="text-xs tracking-[0.2em] uppercase text-brand-text-muted font-black flex items-center gap-3 pt-4">
        <span className="w-6 h-px bg-brand-blue" /> DOCUMENTAR
      </div>
      <FormField label="Mi indicador esta semana" id="nov_metric" placeholder='Ej: "Horas de estudio por día" o "Ahorro diario"' req hint="Algo simple. Algo que puedas contar con los dedos." value={data.nov_metric || ''} onChangeValue={onChange} />

      <div className="text-xs tracking-[0.2em] uppercase text-brand-text-muted font-black flex items-center gap-3 pt-4">
        <span className="w-6 h-px bg-brand-orange" /> MEJORAR · La visión
      </div>
      <FormField label="Si hago esto 21 días seguidos..." id="nov_vision" placeholder='¿Qué cambia en tu vida?' req rows={3} value={data.nov_vision || ''} onChangeValue={onChange} />

      <div className="flex gap-3 pt-4 pb-8">
        <button onClick={onBack} className="btn-secondary px-6 py-3.5 rounded-xl text-sm font-black uppercase tracking-widest cursor-pointer">← Atrás</button>
        <button onClick={onFinish} disabled={!valid} className={`flex-1 py-4 rounded-xl text-sm font-black uppercase tracking-[0.12em] transition-all cursor-pointer ${valid ? 'btn-primary' : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/5'}`}>
          Ver mi PEDEM →
        </button>
      </div>
    </motion.div>
  );
}
