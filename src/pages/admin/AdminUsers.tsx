import { useEffect, useState, useCallback } from 'react';
import { Search, Plus, X, ChevronRight, Trash2, UserCheck, UserX, CheckCircle2, Flame, Copy, Check, Link2, RefreshCw, Edit } from 'lucide-react';
import { getUsers, createUser, updateUser, deleteUser, getUserActivity, resendMagicLink, syncCrm } from '../../lib/adminApi';

const ACTIVITIES = [
  { id: 'adn', label: '🧬 ADN Financiero' },
  { id: 'gastos', label: '🐜 Gastos Hormiga' },
  { id: 'termostato', label: '🌡️ Termostato' },
  { id: 'trampas', label: '🧠 Trampas' },
  { id: 'pedem', label: '📋 PEDEM' },
  { id: 'sombra', label: '🤯 Emociones' },
  { id: 'flow', label: '⚡ Flow' },
  { id: 'geny', label: '🎯 Geny Options' },
];

const PAYMENT_METHODS = [
  { value: 'efectivo', label: '💵 Efectivo' },
  { value: 'deposito', label: '🏦 Depósito' },
  { value: 'transferencia', label: '💳 Transferencia' },
  { value: 'hotmart', label: '🟠 Hotmart' },
  { value: 'whop', label: '🟣 Whop' },
  { value: 'otro', label: '📦 Otro' },
];

// Magic Link section component for user detail panel
function MagicLinkSection({ user, onUpdated }: { user: any; onUpdated: (url: string) => void }) {
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const handleCopy = () => {
    if (user.magic_link_url) {
      navigator.clipboard.writeText(user.magic_link_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const res = await resendMagicLink(user.id);
      if (res.magic_link_url) {
        onUpdated(res.magic_link_url);
      }
    } catch (err) {
      console.error('Error regenerating magic link:', err);
    }
    setRegenerating(false);
  };

  return (
    <div
      className="rounded-lg p-3 space-y-2"
      style={{ background: 'rgba(0,209,255,0.03)', border: '1px solid rgba(0,209,255,0.1)' }}
    >
      <div className="flex items-center gap-2">
        <Link2 className="w-3.5 h-3.5" style={{ color: '#00D1FF' }} />
        <span className="text-sm font-semibold" style={{ color: '#00D1FF' }}>Magic Link</span>
      </div>
      {user.magic_link_url ? (
        <div className="space-y-2">
          <div
            className="text-xs font-mono text-white/40 break-all bg-white/[0.03] rounded px-2 py-1.5 max-h-16 overflow-y-auto"
            style={{ border: '1px solid rgba(255,255,255,0.04)' }}
          >
            {user.magic_link_url}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: copied ? 'rgba(0,230,118,0.08)' : 'rgba(0,209,255,0.06)',
                border: `1px solid ${copied ? 'rgba(0,230,118,0.2)' : 'rgba(0,209,255,0.15)'}`,
                color: copied ? '#00E676' : '#00D1FF',
              }}
            >
              {copied ? <><Check className="w-3.5 h-3.5" /> Copiado</> : <><Copy className="w-3.5 h-3.5" /> Copiar</>}
            </button>
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-white/25">Sin magic link generado</p>
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
            style={{
              background: 'rgba(0,209,255,0.06)',
              border: '1px solid rgba(0,209,255,0.15)',
              color: '#00D1FF',
            }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
            {regenerating ? 'Generando...' : 'Generar Magic Link'}
          </button>
        </div>
      )}
    </div>
  );
}

// Sync CRM section component for user detail panel
function SyncCRMSection({ user }: { user: any }) {
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    setSynced(false);
    try {
      await syncCrm(user.id);
      setSynced(true);
      setTimeout(() => setSynced(false), 3000);
    } catch (err) {
      console.error('Error syncing CRM:', err);
      alert('Error al sincronizar con el CRM');
    }
    setSyncing(false);
  };

  return (
    <div
      className="rounded-lg p-3 space-y-2 mt-2"
      style={{ background: 'rgba(249,115,22,0.03)', border: '1px solid rgba(249,115,22,0.1)' }}
    >
      <div className="flex items-center gap-2">
        <RefreshCw className="w-3.5 h-3.5 text-orange-400" />
        <span className="text-sm font-semibold text-orange-400">Sincronización CRM</span>
      </div>
      <button
        onClick={handleSync}
        disabled={syncing}
        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
        style={{
          background: synced ? 'rgba(0,230,118,0.08)' : 'rgba(249,115,22,0.06)',
          border: `1px solid ${synced ? 'rgba(0,230,118,0.2)' : 'rgba(249,115,22,0.15)'}`,
          color: synced ? '#00E676' : '#fb923c',
        }}
      >
        {syncing ? (
          <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Sincronizando...</>
        ) : synced ? (
          <><Check className="w-3.5 h-3.5" /> Sincronizado</>
        ) : (
          <><RefreshCw className="w-3.5 h-3.5" /> Push a CRM</>
        )}
      </button>
    </div>
  );
}

const COUNTRY_CODES = [
  { code: '+52', flag: '🇲🇽', name: 'México' },
  { code: '+57', flag: '🇨🇴', name: 'Colombia' },
  { code: '+1', flag: '🇺🇸', name: 'USA/Canadá' },
  { code: '+34', flag: '🇪🇸', name: 'España' },
  { code: '+54', flag: '🇦🇷', name: 'Argentina' },
  { code: '+51', flag: '🇵🇪', name: 'Perú' },
  { code: '+56', flag: '🇨🇱', name: 'Chile' },
  { code: '+593', flag: '🇪🇨', name: 'Ecuador' },
  { code: '+58', flag: '🇻🇪', name: 'Venezuela' },
  { code: '+502', flag: '🇬🇹', name: 'Guatemala' },
  { code: '+506', flag: '🇨🇷', name: 'Costa Rica' },
  { code: '+507', flag: '🇵🇦', name: 'Panamá' },
  { code: '+591', flag: '🇧🇴', name: 'Bolivia' },
  { code: '+595', flag: '🇵🇾', name: 'Paraguay' },
  { code: '+598', flag: '🇺🇾', name: 'Uruguay' },
  { code: '+503', flag: '🇸🇻', name: 'El Salvador' },
  { code: '+504', flag: '🇭🇳', name: 'Honduras' },
  { code: '+505', flag: '🇳🇮', name: 'Nicaragua' },
];

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterActivity, setFilterActivity] = useState('');
  const [filterPayment, setFilterPayment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterHot, setFilterHot] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userActivities, setUserActivities] = useState<any[]>([]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (filterActivity) params.activity = filterActivity;
      if (filterPayment) params.payment_method = filterPayment;
      if (filterStatus) params.status = filterStatus;
      if (filterHot) params.hot = 'true';
      const res = await getUsers(params);
      setUsers(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, filterActivity, filterPayment, filterStatus, filterHot]);

  useEffect(() => {
    const t = setTimeout(loadUsers, 300);
    return () => clearTimeout(t);
  }, [loadUsers]);

  const handleSelectUser = async (user: any) => {
    setSelectedUser(user);
    try {
      const res = await getUserActivity(user.id);
      setUserActivities(res.data || []);
    } catch {
      setUserActivities([]);
    }
  };

  const handleToggleStatus = async (user: any) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    await updateUser(user.id, { status: newStatus });
    loadUsers();
    if (selectedUser?.id === user.id) setSelectedUser({ ...user, status: newStatus });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este usuario permanentemente?')) return;
    await deleteUser(id);
    setSelectedUser(null);
    loadUsers();
  };

  /* Shared styles for custom select replacement */
  const selectStyle = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.6)',
  };

  return (
    <div className="max-w-6xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white/90 tracking-wide">Usuarios</h1>
          <p className="text-base text-white/30 mt-0.5">{users.length} registros</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-base font-bold transition-all"
          style={{ background: '#00D1FF', color: '#060910' }}
          onMouseOver={e => (e.currentTarget.style.boxShadow = '0 0 20px rgba(0,209,255,0.3)')}
          onMouseOut={e => (e.currentTarget.style.boxShadow = 'none')}
        >
          <Plus className="w-4 h-4" /> Agregar
        </button>
      </div>

      {/* Filters */}
      <div
        className="flex flex-wrap gap-2 items-center p-3 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
          <input
            type="text"
            placeholder="Buscar por nombre o email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg pl-9 pr-3 py-2.5 text-base text-white placeholder:text-white/20 focus:outline-none transition-all"
            style={{ ...selectStyle }}
            onFocus={e => { e.target.style.borderColor = 'rgba(0,209,255,0.3)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
          />
        </div>
        <select
          value={filterActivity}
          onChange={e => setFilterActivity(e.target.value)}
          className="rounded-lg px-3 py-2.5 text-base cursor-pointer focus:outline-none appearance-none"
          style={selectStyle}
        >
          <option value="">Todas las actividades</option>
          {ACTIVITIES.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
        </select>
        <select
          value={filterPayment}
          onChange={e => setFilterPayment(e.target.value)}
          className="rounded-lg px-3 py-2.5 text-base cursor-pointer focus:outline-none appearance-none"
          style={selectStyle}
        >
          <option value="">Todos los pagos</option>
          {PAYMENT_METHODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="rounded-lg px-3 py-2.5 text-base cursor-pointer focus:outline-none appearance-none"
          style={selectStyle}
        >
          <option value="">Todos los estados</option>
          <option value="active">✅ Activo</option>
          <option value="suspended">⛔ Suspendido</option>
        </select>
        <button
          onClick={() => setFilterHot(!filterHot)}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-base font-semibold transition-all"
          style={{
            background: filterHot ? 'rgba(249,115,22,0.1)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${filterHot ? 'rgba(249,115,22,0.25)' : 'rgba(255,255,255,0.08)'}`,
            color: filterHot ? '#fb923c' : 'rgba(255,255,255,0.35)',
            boxShadow: filterHot ? '0 0 12px rgba(249,115,22,0.12)' : 'none',
          }}
        >
          <Flame className="w-4 h-4" />
          HOT
        </button>
      </div>

      {/* Table + Detail */}
      <div className="flex gap-5">
        {/* Users List */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-5 h-5 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="glass-panel p-16 text-center">
              <p className="text-white/25 text-base">No se encontraron usuarios</p>
            </div>
          ) : (
            <div className="space-y-1">
              {users.map(u => (
                <button
                  key={u.id}
                  onClick={() => handleSelectUser(u)}
                  className="w-full text-left rounded-xl px-4 py-3.5 flex items-center gap-4 transition-all"
                  style={{
                    background: selectedUser?.id === u.id ? 'rgba(0,209,255,0.04)' : 'rgba(255,255,255,0.015)',
                    border: `1px solid ${selectedUser?.id === u.id ? 'rgba(0,209,255,0.15)' : 'rgba(255,255,255,0.04)'}`,
                  }}
                  onMouseOver={e => {
                    if (selectedUser?.id !== u.id) e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  }}
                  onMouseOut={e => {
                    if (selectedUser?.id !== u.id) e.currentTarget.style.background = 'rgba(255,255,255,0.015)';
                  }}
                >
                  {/* Avatar */}
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
                    style={{
                      background: u.status === 'active' ? 'rgba(0,230,118,0.08)' : 'rgba(255,80,80,0.08)',
                      color: u.status === 'active' ? '#00E676' : '#ff6b6b',
                    }}
                  >
                    {u.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-semibold text-white/80 truncate">{u.name}</div>
                    <div className="text-sm text-white/35 font-mono truncate">{u.email}</div>
                  </div>
                  {/* Badges */}
                  <div className="flex items-center gap-2 shrink-0">
                    {u.is_hot && (
                      <span
                        className="flex items-center gap-1 text-sm font-bold px-2 py-1 rounded-lg"
                        style={{
                          background: 'rgba(249,115,22,0.1)',
                          border: '1px solid rgba(249,115,22,0.2)',
                          color: '#fb923c',
                        }}
                      >
                        <Flame className="w-3 h-3" /> HOT
                      </span>
                    )}
                    <span
                      className="text-sm font-mono font-medium px-2 py-1 rounded-lg"
                      style={{ background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.4)' }}
                    >
                      {u.activity_count || 0}/7
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-white/15" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedUser && (
          <div
            className="w-80 shrink-0 glass-panel p-5 space-y-4 sticky top-4 self-start"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white/50">Detalle de usuario</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowEditModal(true)} className="text-white/20 hover:text-[#00D1FF] transition-colors p-1" title="Editar Usuario">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => setSelectedUser(null)} className="text-white/20 hover:text-white/50 transition-colors p-1" title="Cerrar">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="text-lg font-bold text-white/90">{selectedUser.name}</div>
                  {selectedUser.is_hot && (
                    <span
                      className="flex items-center gap-1 text-sm font-bold px-2 py-0.5 rounded-lg"
                      style={{
                        background: 'rgba(249,115,22,0.1)',
                        border: '1px solid rgba(249,115,22,0.2)',
                        color: '#fb923c',
                      }}
                    >
                      <Flame className="w-3 h-3" /> HOT
                    </span>
                  )}
                </div>
                <div className="text-base text-white/35 font-mono mt-0.5">{selectedUser.email}</div>
                {selectedUser.phone && <div className="text-sm text-white/25 font-mono mt-0.5">{selectedUser.phone}</div>}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="text-sm text-white/30 font-medium mb-1">Método de pago</div>
                  <div className="text-base font-medium text-white/60">{selectedUser.payment_method}</div>
                </div>
                <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="text-sm text-white/30 font-medium mb-1">Monto</div>
                  <div className="text-base font-medium text-white/60 font-mono">
                    {selectedUser.payment_amount ? `$${selectedUser.payment_amount}` : '—'}
                  </div>
                </div>
              </div>

              {selectedUser.notes && (
                <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="text-sm text-white/30 font-medium mb-1">Notas</div>
                  <p className="text-base text-white/45">{selectedUser.notes}</p>
                </div>
              )}

              {/* Magic Link */}
              <MagicLinkSection user={selectedUser} onUpdated={(url) => setSelectedUser({ ...selectedUser, magic_link_url: url })} />

              {/* Sync CRM */}
              <SyncCRMSection user={selectedUser} />

              {/* Activity Timeline */}
              <div>
                <div className="text-sm text-white/30 font-medium mb-2">Actividades completadas</div>
                {userActivities.length === 0 ? (
                  <p className="text-base text-white/20 text-center py-4">Sin actividades registradas</p>
                ) : (
                  <div className="space-y-1.5">
                    {userActivities.map((a: any) => (
                      <div
                        key={a.id}
                        className="flex items-center gap-2 rounded-lg px-3 py-2"
                        style={{ background: 'rgba(0,230,118,0.04)', border: '1px solid rgba(0,230,118,0.08)' }}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-green/70 shrink-0" />
                        <span className="text-base font-medium text-brand-green/80 truncate">{a.activity_name}</span>
                        <span className="text-sm text-white/25 font-mono ml-auto shrink-0">
                          {new Date(a.completed_at).toLocaleDateString('es-MX')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div
                className="flex gap-2 pt-3"
                style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
              >
                <button
                  onClick={() => handleToggleStatus(selectedUser)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all"
                  style={{
                    background: selectedUser.status === 'active' ? 'rgba(255,80,80,0.06)' : 'rgba(0,230,118,0.06)',
                    border: `1px solid ${selectedUser.status === 'active' ? 'rgba(255,80,80,0.15)' : 'rgba(0,230,118,0.15)'}`,
                    color: selectedUser.status === 'active' ? '#ff6b6b' : '#00E676',
                  }}
                >
                  {selectedUser.status === 'active' ? <><UserX className="w-3.5 h-3.5" /> Suspender</> : <><UserCheck className="w-3.5 h-3.5" /> Activar</>}
                </button>
                <button
                  onClick={() => handleDelete(selectedUser.id)}
                  className="px-3 py-2.5 rounded-lg transition-all"
                  style={{
                    background: 'rgba(255,80,80,0.06)',
                    border: '1px solid rgba(255,80,80,0.15)',
                    color: '#ff6b6b',
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && <AddUserModal onClose={() => setShowAddModal(false)} onCreated={() => { setShowAddModal(false); loadUsers(); }} />}
      
      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setShowEditModal(false)}
          onUpdated={(updatedUser) => {
            setShowEditModal(false);
            setSelectedUser({ ...selectedUser, ...updatedUser });
            loadUsers();
          }}
        />
      )}
    </div>
  );
}

// ── Add User Modal ──
function AddUserModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', payment_method: 'efectivo', payment_amount: '', notes: '' });
  const [countryCode, setCountryCode] = useState('+52');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fullPhone = phoneNumber ? `${countryCode}${phoneNumber}` : '';
      await createUser({
        ...form,
        phone: fullPhone,
        payment_amount: form.payment_amount ? parseFloat(form.payment_amount) : undefined,
      });
      onCreated();
    } catch (err: any) {
      setError(err.message || 'Error creating user');
    } finally {
      setLoading(false);
    }
  };

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const inputStyle = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div className="glass-panel p-6 w-full max-w-md space-y-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white/90">Agregar Usuario</h2>
          <button onClick={onClose} className="text-white/25 hover:text-white/60 transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-white/40 block mb-1.5">Nombre *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} required
              className="w-full rounded-xl px-4 py-3 text-base text-white focus:outline-none transition-all"
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'rgba(0,209,255,0.3)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-white/40 block mb-1.5">Email *</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required
              className="w-full rounded-xl px-4 py-3 text-base text-white font-mono focus:outline-none transition-all"
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'rgba(0,209,255,0.3)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-white/40 block mb-1.5">Teléfono</label>
            <div className="flex gap-2">
              <select
                value={countryCode}
                onChange={e => setCountryCode(e.target.value)}
                className="rounded-xl px-3 py-3 text-base text-white focus:outline-none cursor-pointer w-[110px] shrink-0"
                style={{ ...inputStyle, background: 'rgba(255,255,255,0.03)' }}
              >
                {COUNTRY_CODES.map(c => (
                  <option key={c.code + c.name} value={c.code} className="bg-gray-900 text-white">
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
              <input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="Número sin código"
                className="w-full rounded-xl px-4 py-3 text-base text-white font-mono focus:outline-none transition-all"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'rgba(0,209,255,0.3)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-white/40 block mb-1.5">Método de Pago</label>
              <select value={form.payment_method} onChange={e => set('payment_method', e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-base text-white focus:outline-none cursor-pointer"
                style={inputStyle}>
                {PAYMENT_METHODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-white/40 block mb-1.5">Monto</label>
              <input type="number" step="0.01" value={form.payment_amount} onChange={e => set('payment_amount', e.target.value)}
                placeholder="$0.00"
                className="w-full rounded-xl px-4 py-3 text-base text-white font-mono focus:outline-none transition-all"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'rgba(0,209,255,0.3)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-white/40 block mb-1.5">Notas</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2}
              className="w-full rounded-xl px-4 py-3 text-base text-white focus:outline-none resize-none transition-all"
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'rgba(0,209,255,0.3)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            />
          </div>

          {error && (
            <p className="text-base rounded-xl px-3.5 py-2.5" style={{ color: '#ff6b6b', background: 'rgba(255,80,80,0.06)', border: '1px solid rgba(255,80,80,0.12)' }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-base transition-all disabled:opacity-30"
            style={{ background: '#00D1FF', color: '#060910' }}
            onMouseOver={e => { if (!loading) (e.target as HTMLElement).style.boxShadow = '0 0 20px rgba(0,209,255,0.3)'; }}
            onMouseOut={e => { (e.target as HTMLElement).style.boxShadow = 'none'; }}
          >
            {loading ? 'Guardando…' : 'Registrar Usuario'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Edit User Modal ──
function EditUserModal({ user, onClose, onUpdated }: { user: any; onClose: () => void; onUpdated: (data: any) => void }) {
  
  // Parse existing phone number
  const initialPhone = user.phone || '';
  let initialCountryCode = '+52';
  let initialPhoneNumber = initialPhone;
  
  if (initialPhone) {
    const foundCode = COUNTRY_CODES.find(c => initialPhone.startsWith(c.code));
    if (foundCode) {
      initialCountryCode = foundCode.code;
      initialPhoneNumber = initialPhone.substring(foundCode.code.length);
    } else if (initialPhone.startsWith('+')) {
      // Custom country code not in list
      const parts = initialPhone.match(/^(\+\d{1,3})(.*)$/);
      if (parts) {
        initialCountryCode = parts[1];
        initialPhoneNumber = parts[2];
      }
    }
  }

  const [form, setForm] = useState({
    name: user.name || '',
    email: user.email || '',
    payment_method: user.payment_method || 'efectivo',
    payment_amount: user.payment_amount?.toString() || '',
    notes: user.notes || ''
  });
  const [countryCode, setCountryCode] = useState(initialCountryCode);
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fullPhone = phoneNumber ? `${countryCode}${phoneNumber}` : '';
      const payload = {
        ...form,
        phone: fullPhone,
        payment_amount: form.payment_amount ? parseFloat(form.payment_amount) : null,
      };
      await updateUser(user.id, payload);
      onUpdated(payload);
    } catch (err: any) {
      setError(err.message || 'Error updating user');
    } finally {
      setLoading(false);
    }
  };

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const inputStyle = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div className="glass-panel p-6 w-full max-w-md space-y-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white/90">Editar Usuario</h2>
          <button onClick={onClose} className="text-white/25 hover:text-white/60 transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-white/40 block mb-1.5">Nombre *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} required
              className="w-full rounded-xl px-4 py-3 text-base text-white focus:outline-none transition-all"
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'rgba(0,209,255,0.3)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-white/40 block mb-1.5">Email *</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required
              className="w-full rounded-xl px-4 py-3 text-base text-white font-mono focus:outline-none transition-all"
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'rgba(0,209,255,0.3)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-white/40 block mb-1.5">Teléfono</label>
            <div className="flex gap-2">
              <select
                value={countryCode}
                onChange={e => setCountryCode(e.target.value)}
                className="rounded-xl px-3 py-3 text-base text-white focus:outline-none cursor-pointer w-[110px] shrink-0"
                style={{ ...inputStyle, background: 'rgba(255,255,255,0.03)' }}
              >
                {/* Fallback code if the user has an unlisted country code */}
                {!COUNTRY_CODES.find(c => c.code === countryCode) && (
                  <option value={countryCode} className="bg-gray-900 text-white">{countryCode}</option>
                )}
                {COUNTRY_CODES.map(c => (
                  <option key={c.code + c.name} value={c.code} className="bg-gray-900 text-white">
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
              <input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="Número sin código"
                className="w-full rounded-xl px-4 py-3 text-base text-white font-mono focus:outline-none transition-all"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'rgba(0,209,255,0.3)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-white/40 block mb-1.5">Método de Pago</label>
              <select value={form.payment_method} onChange={e => set('payment_method', e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-base text-white focus:outline-none cursor-pointer"
                style={inputStyle}>
                {PAYMENT_METHODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-white/40 block mb-1.5">Monto</label>
              <input type="number" step="0.01" value={form.payment_amount} onChange={e => set('payment_amount', e.target.value)}
                placeholder="$0.00"
                className="w-full rounded-xl px-4 py-3 text-base text-white font-mono focus:outline-none transition-all"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'rgba(0,209,255,0.3)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-white/40 block mb-1.5">Notas</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2}
              className="w-full rounded-xl px-4 py-3 text-base text-white focus:outline-none resize-none transition-all"
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'rgba(0,209,255,0.3)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            />
          </div>

          {error && (
            <p className="text-base rounded-xl px-3.5 py-2.5" style={{ color: '#ff6b6b', background: 'rgba(255,80,80,0.06)', border: '1px solid rgba(255,80,80,0.12)' }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-base transition-all disabled:opacity-30"
            style={{ background: '#00D1FF', color: '#060910' }}
            onMouseOver={e => { if (!loading) (e.target as HTMLElement).style.boxShadow = '0 0 20px rgba(0,209,255,0.3)'; }}
            onMouseOut={e => { (e.target as HTMLElement).style.boxShadow = 'none'; }}
          >
            {loading ? 'Guardando…' : 'Guardar Cambios'}
          </button>
        </form>
      </div>
    </div>
  );
}
