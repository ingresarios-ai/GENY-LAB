import { motion } from 'motion/react';
import { TRADE_CHECKS, SHADOW_OPTIONS, ASSET_OPTIONS, DIRECTION_OPTIONS } from './constants';

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

export function PedemTrade({ data, onChange, onFinish, onBack }: Props) {
  const checks: string[] = data.tra_checklist || [];
  const toggleCheck = (id: string) => {
    const next = checks.includes(id) ? checks.filter(c => c !== id) : [...checks, id];
    onChange('tra_checklist', next);
  };

  const valid = data.tra_asset && data.tra_direction && data.tra_setup && data.tra_entry && data.tra_stop && data.tra_target && data.tra_hypothesis;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-3 text-xs tracking-[0.25em] uppercase text-brand-text-muted font-black">
        <span className="w-2 h-2 rounded-full bg-brand-blue" /> PLAN DE TRADE · PASO 1 DE 2
      </div>
      <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-none">
        Tu plan <span className="title-highlight">antes del botón.</span>
      </h1>
      <p className="text-brand-text-muted text-sm leading-relaxed">Un trade sin plan es una apuesta. Define el tuyo en 3 minutos.</p>

      <div className="text-xs tracking-[0.2em] uppercase text-brand-text-muted font-black flex items-center gap-3 pt-2">
        <span className="w-6 h-px bg-brand-blue" /> PLANEAR
      </div>

      <div className="space-y-2">
        <label className="text-xs tracking-[0.2em] uppercase text-brand-text-muted font-black flex items-center gap-2">Activo <span className="text-brand-orange">*</span></label>
        <select value={data.tra_asset || ''} onChange={e => onChange('tra_asset', e.target.value)}
          className="input-field appearance-none cursor-pointer bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2212%22%20height%3D%228%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M1%201l5%205%205-5%22%20stroke%3D%22%2300E676%22%20stroke-width%3D%221.5%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_14px_center] pr-9">
          <option value="">Selecciona un activo</option>
          {ASSET_OPTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-xs tracking-[0.2em] uppercase text-brand-text-muted font-black flex items-center gap-2">Dirección <span className="text-brand-orange">*</span></label>
        <div className="grid grid-cols-3 gap-3">
          {DIRECTION_OPTIONS.map(d => (
            <button key={d.value} onClick={() => onChange('tra_direction', d.value)}
              className={`glass-card p-3 text-center font-black text-sm transition-all cursor-pointer ${data.tra_direction === d.value ? 'border-brand-green/50 bg-brand-green/5' : 'hover:border-white/10'}`}
              style={{ color: data.tra_direction === d.value ? d.color : undefined }}>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs tracking-[0.2em] uppercase text-brand-text-muted font-black flex items-center gap-2">Setup (configuración o patrón gráfico de entrada) en una frase <span className="text-brand-orange">*</span></label>
        <input type="text" value={data.tra_setup || ''} onChange={e => onChange('tra_setup', e.target.value)}
          placeholder='Ej: "Rechazo del POC con Geny Trend alineado en 4H"' className="input-field" />
      </div>

      <div className="space-y-2">
        <label className="text-xs tracking-[0.2em] uppercase text-brand-text-muted font-black flex items-center gap-2">Entrada / Stop / Target <span className="text-brand-orange">*</span></label>
        <div className="grid grid-cols-3 gap-3">
          {[['tra_entry','Entrada'],['tra_stop','Stop'],['tra_target','Target']].map(([id,ph]) => (
            <div key={id} className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 font-mono text-sm">$</span>
              <input type="number" step="0.01" value={data[id] || ''} onChange={e => onChange(id, e.target.value)} placeholder={ph as string}
                className="input-field pl-7 font-mono tabular-nums" />
            </div>
          ))}
        </div>
      </div>

      <div className="text-xs tracking-[0.2em] uppercase text-brand-text-muted font-black flex items-center gap-3 pt-4">
        <span className="w-6 h-px bg-brand-green" /> EJECUTAR
      </div>
      <div className="space-y-2">
        {TRADE_CHECKS.map(c => <CheckItem key={c.id} label={c.label} checked={checks.includes(c.id)} onToggle={() => toggleCheck(c.id)} />)}
      </div>

      <div className="text-xs tracking-[0.2em] uppercase text-brand-text-muted font-black flex items-center gap-3 pt-4">
        <span className="w-6 h-px bg-brand-blue" /> DOCUMENTAR
      </div>
      <div className="space-y-2">
        <label className="text-xs tracking-[0.2em] uppercase text-brand-text-muted font-black flex items-center gap-2">Hipótesis en una frase <span className="text-brand-orange">*</span></label>
        <textarea value={data.tra_hypothesis || ''} onChange={e => onChange('tra_hypothesis', e.target.value)}
          placeholder='Ej: "Creo que sube porque rechazó value area low con volumen."' rows={3} className="input-field resize-y" />
      </div>

      <div className="text-xs tracking-[0.2em] uppercase text-brand-text-muted font-black flex items-center gap-3 pt-2">
        <span className="w-6 h-px bg-brand-orange" /> Sombra observada hoy
      </div>
      <div className="grid grid-cols-2 gap-3">
        {SHADOW_OPTIONS.map(s => (
          <button key={s.id} onClick={() => onChange('tra_shadow', data.tra_shadow === s.id ? '' : s.id)}
            className={`glass-card p-4 text-left transition-all cursor-pointer ${data.tra_shadow === s.id ? 'border-brand-orange/50 bg-brand-orange/5' : 'hover:border-white/10'}`}>
            <div className="text-sm font-black text-white">{s.name}</div>
            <div className="text-xs text-brand-text-muted mt-1">{s.desc}</div>
          </button>
        ))}
      </div>

      <div className="flex gap-3 pt-4 pb-8">
        <button onClick={onBack} className="btn-secondary px-6 py-3.5 rounded-xl text-sm font-black uppercase tracking-widest cursor-pointer">← Atrás</button>
        <button onClick={onFinish} disabled={!valid} className={`flex-1 py-4 rounded-xl text-sm font-black uppercase tracking-[0.12em] transition-all cursor-pointer ${valid ? 'btn-primary' : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/5'}`}>
          Ver mi plan →
        </button>
      </div>
    </motion.div>
  );
}
