import { useEffect, useState } from 'react';
import { Plus, X, Trash2, CheckCircle2, XCircle, Power } from 'lucide-react';
import { getWebhooks, createWebhook, updateWebhook, deleteWebhook, getWebhookDeliveries } from '../../lib/adminApi';

const ACTIVITIES = [
  { id: 'all', label: '🌐 Todas' },
  { id: 'adn', label: '🧬 ADN' },
  { id: 'gastos', label: '🐜 Gastos' },
  { id: 'termostato', label: '🌡️ Termostato' },
  { id: 'trampas', label: '🧠 Trampas' },
  { id: 'pedem', label: '📋 PEDEM' },
  { id: 'sombra', label: '🤯 Emociones' },
  { id: 'flow', label: '⚡ Flow' },
  { id: 'geny', label: '🎯 Geny Options' },
];

export default function AdminWebhooks() {
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedWh, setSelectedWh] = useState<any>(null);
  const [deliveries, setDeliveries] = useState<any[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getWebhooks();
      setWebhooks(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSelect = async (wh: any) => {
    setSelectedWh(wh);
    try {
      const res = await getWebhookDeliveries(wh.id);
      setDeliveries(res.data || []);
    } catch {
      setDeliveries([]);
    }
  };

  const handleToggle = async (wh: any) => {
    await updateWebhook(wh.id, { is_active: !wh.is_active });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este webhook?')) return;
    await deleteWebhook(id);
    setSelectedWh(null);
    load();
  };

  return (
    <div className="max-w-5xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white/90 tracking-wide">Webhooks</h1>
          <p className="text-sm text-white/30 mt-0.5">Notificaciones salientes</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all"
          style={{ background: '#00D1FF', color: '#060910' }}
          onMouseOver={e => (e.currentTarget.style.boxShadow = '0 0 20px rgba(0,209,255,0.3)')}
          onMouseOut={e => (e.currentTarget.style.boxShadow = 'none')}
        >
          <Plus className="w-4 h-4" /> Agregar
        </button>
      </div>

      {/* Info banner */}
      <div
        className="px-4 py-3 rounded-xl text-sm text-white/45 leading-relaxed"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
      >
        <span className="text-white/60 font-medium">Webhooks Salientes:</span> Cada vez que un usuario completa una actividad, se envía un POST con su nombre, correo y la actividad completada a las URLs configuradas aquí.
      </div>

      <div className="flex gap-5">
        {/* Webhook list */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-5 h-5 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
            </div>
          ) : webhooks.length === 0 ? (
            <div className="glass-panel p-16 text-center">
              <p className="text-white/25 text-sm">No hay webhooks configurados</p>
              <p className="text-[12px] text-white/15 mt-1">Haz clic en "Agregar" para crear uno</p>
            </div>
          ) : (
            webhooks.map(wh => (
              <button
                key={wh.id}
                onClick={() => handleSelect(wh)}
                className="w-full text-left rounded-xl px-4 py-3.5 transition-all"
                style={{
                  background: selectedWh?.id === wh.id ? 'rgba(0,209,255,0.04)' : 'rgba(255,255,255,0.015)',
                  border: `1px solid ${selectedWh?.id === wh.id ? 'rgba(0,209,255,0.15)' : 'rgba(255,255,255,0.04)'}`,
                }}
                onMouseOver={e => {
                  if (selectedWh?.id !== wh.id) e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                }}
                onMouseOut={e => {
                  if (selectedWh?.id !== wh.id) e.currentTarget.style.background = 'rgba(255,255,255,0.015)';
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      background: wh.is_active ? '#00E676' : 'rgba(255,255,255,0.1)',
                      boxShadow: wh.is_active ? '0 0 8px rgba(0,230,118,0.5)' : 'none',
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white/80">{wh.name}</div>
                    <div className="text-[12px] text-white/30 font-mono truncate">{wh.url}</div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {(wh.events || []).slice(0, 3).map((e: string) => (
                      <span
                        key={e}
                        className="text-[11px] font-medium px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.35)' }}
                      >
                        {e}
                      </span>
                    ))}
                    {(wh.events || []).length > 3 && (
                      <span className="text-[11px] text-white/25">+{wh.events.length - 3}</span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Detail */}
        {selectedWh && (
          <div className="w-80 shrink-0 glass-panel p-5 space-y-4 sticky top-4 self-start">
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-semibold text-white/50">Detalle del webhook</h3>
              <button onClick={() => setSelectedWh(null)} className="text-white/20 hover:text-white/50 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-base font-bold text-white/90">{selectedWh.name}</div>
                <div className="text-[12px] text-white/35 font-mono break-all mt-1">{selectedWh.url}</div>
              </div>

              <div>
                <div className="text-[11px] text-white/30 font-medium mb-2">Eventos</div>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedWh.events || []).map((e: string) => (
                    <span
                      key={e}
                      className="text-[12px] font-medium px-2.5 py-1 rounded-lg"
                      style={{ background: 'rgba(0,230,118,0.06)', color: 'rgba(0,230,118,0.7)', border: '1px solid rgba(0,230,118,0.12)' }}
                    >
                      {ACTIVITIES.find(a => a.id === e)?.label || e}
                    </span>
                  ))}
                </div>
              </div>

              {/* Deliveries */}
              <div>
                <div className="text-[11px] text-white/30 font-medium mb-2">Últimas entregas</div>
                {deliveries.length === 0 ? (
                  <p className="text-sm text-white/20 text-center py-4">Sin entregas registradas</p>
                ) : (
                  <div className="space-y-1 max-h-[300px] overflow-y-auto">
                    {deliveries.map((d: any) => (
                      <div
                        key={d.id}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px]"
                        style={{
                          background: d.success ? 'rgba(0,230,118,0.04)' : 'rgba(255,80,80,0.04)',
                          border: `1px solid ${d.success ? 'rgba(0,230,118,0.08)' : 'rgba(255,80,80,0.08)'}`,
                        }}
                      >
                        {d.success
                          ? <CheckCircle2 className="w-3.5 h-3.5 text-brand-green/60 shrink-0" />
                          : <XCircle className="w-3.5 h-3.5 shrink-0" style={{ color: '#ff6b6b' }} />
                        }
                        <span className="font-medium text-white/50 truncate">{d.event}</span>
                        <span className="ml-auto font-mono text-white/25 shrink-0">{d.response_status || '—'}</span>
                        <span className="font-mono text-white/20 shrink-0">
                          {new Date(d.delivered_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <button
                  onClick={() => handleToggle(selectedWh)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[12px] font-semibold transition-all"
                  style={{
                    background: selectedWh.is_active ? 'rgba(255,80,80,0.06)' : 'rgba(0,230,118,0.06)',
                    border: `1px solid ${selectedWh.is_active ? 'rgba(255,80,80,0.15)' : 'rgba(0,230,118,0.15)'}`,
                    color: selectedWh.is_active ? '#ff6b6b' : '#00E676',
                  }}
                >
                  <Power className="w-3.5 h-3.5" /> {selectedWh.is_active ? 'Desactivar' : 'Activar'}
                </button>
                <button
                  onClick={() => handleDelete(selectedWh.id)}
                  className="px-3 py-2.5 rounded-lg transition-all"
                  style={{ background: 'rgba(255,80,80,0.06)', border: '1px solid rgba(255,80,80,0.15)', color: '#ff6b6b' }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAdd && <AddWebhookModal onClose={() => setShowAdd(false)} onCreated={() => { setShowAdd(false); load(); }} />}
    </div>
  );
}

function AddWebhookModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: '', url: '', secret: '', events: ['all'] as string[] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleEvent = (id: string) => {
    setForm(f => {
      let events = [...f.events];
      if (id === 'all') {
        events = events.includes('all') ? [] : ['all'];
      } else {
        events = events.filter(e => e !== 'all');
        events = events.includes(id) ? events.filter(e => e !== id) : [...events, id];
        if (events.length === 0) events = ['all'];
      }
      return { ...f, events };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createWebhook(form);
      onCreated();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div className="glass-panel p-6 w-full max-w-md space-y-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white/90">Nuevo Webhook</h2>
          <button onClick={onClose} className="text-white/25 hover:text-white/60 transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[12px] font-medium text-white/40 block mb-1.5">Nombre *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="Mi webhook de Zapier"
              className="w-full rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all"
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'rgba(0,209,255,0.3)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            />
          </div>
          <div>
            <label className="text-[12px] font-medium text-white/40 block mb-1.5">URL *</label>
            <input type="url" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} required placeholder="https://hooks.zapier.com/…"
              className="w-full rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none transition-all"
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'rgba(0,209,255,0.3)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            />
          </div>
          <div>
            <label className="text-[12px] font-medium text-white/40 block mb-1.5">Secret (opcional)</label>
            <input value={form.secret} onChange={e => setForm(f => ({ ...f, secret: e.target.value }))} placeholder="token-secreto"
              className="w-full rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none transition-all"
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'rgba(0,209,255,0.3)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            />
          </div>

          <div>
            <label className="text-[12px] font-medium text-white/40 block mb-2">Actividades que disparan</label>
            <div className="flex flex-wrap gap-1.5">
              {ACTIVITIES.map(a => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => toggleEvent(a.id)}
                  className="text-[12px] font-medium px-2.5 py-1.5 rounded-lg transition-all"
                  style={{
                    background: form.events.includes(a.id) ? 'rgba(0,230,118,0.08)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${form.events.includes(a.id) ? 'rgba(0,230,118,0.2)' : 'rgba(255,255,255,0.06)'}`,
                    color: form.events.includes(a.id) ? 'rgba(0,230,118,0.8)' : 'rgba(255,255,255,0.3)',
                  }}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm rounded-xl px-3.5 py-2.5" style={{ color: '#ff6b6b', background: 'rgba(255,80,80,0.06)', border: '1px solid rgba(255,80,80,0.12)' }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-[13px] transition-all disabled:opacity-30"
            style={{ background: '#00D1FF', color: '#060910' }}
            onMouseOver={e => { if (!loading) (e.target as HTMLElement).style.boxShadow = '0 0 20px rgba(0,209,255,0.3)'; }}
            onMouseOut={e => { (e.target as HTMLElement).style.boxShadow = 'none'; }}
          >
            {loading ? 'Creando…' : 'Crear Webhook'}
          </button>
        </form>
      </div>
    </div>
  );
}
