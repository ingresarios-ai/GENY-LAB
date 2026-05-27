import { useEffect, useState } from 'react';
import {
  UserCog, Plus, X, Trash2, Eye, EyeOff, Shield, ShieldCheck,
  AlertCircle, Check, Pencil, Settings, Clock, ToggleLeft, ToggleRight
} from 'lucide-react';
import {
  getAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser, getAdminInfo,
  getSiteSetting, updateSiteSetting
} from '../../lib/adminApi';

const ROLES = [
  { value: 'superadmin', label: 'Super Admin', desc: 'Acceso total + gestión de admins', icon: ShieldCheck },
  { value: 'admin', label: 'Admin', desc: 'Acceso al panel sin gestión de admins', icon: Shield },
];

export default function AdminSettings() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [form, setForm] = useState({ username: '', password: '', display_name: '', admin_role: 'admin' });
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit password state
  const [editPassword, setEditPassword] = useState('');
  const [showEditPw, setShowEditPw] = useState(false);

  const currentAdmin = getAdminInfo();

  // Site settings state
  const [delayEnabled, setDelayEnabled] = useState(true);
  const [delayMinutes, setDelayMinutes] = useState(10);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);

  const loadAdmins = async () => {
    try {
      const res = await getAdminUsers();
      setAdmins(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Error cargando administradores');
    }
    setLoading(false);
  };

  const loadSettings = async () => {
    try {
      const config = await getSiteSetting('content_delay');
      if (config) {
        setDelayEnabled(config.enabled ?? true);
        setDelayMinutes(config.minutes ?? 10);
      }
    } catch {}
    setSettingsLoading(false);
  };

  const saveSettings = async () => {
    setSettingsSaving(true);
    try {
      await updateSiteSetting('content_delay', {
        enabled: delayEnabled,
        minutes: delayMinutes
      });
      // Clear localStorage so users see the new config on next visit
      setSuccess('Configuración guardada exitosamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al guardar configuración');
    }
    setSettingsSaving(false);
  };

  useEffect(() => { loadAdmins(); loadSettings(); }, []);

  const resetForm = () => {
    setForm({ username: '', password: '', display_name: '', admin_role: 'admin' });
    setShowPw(false);
    setShowCreate(false);
    setEditingId(null);
    setEditPassword('');
    setShowEditPw(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await createAdminUser(form);
      setSuccess('Administrador creado exitosamente');
      setTimeout(() => setSuccess(''), 3000);
      resetForm();
      loadAdmins();
    } catch (err: any) {
      setError(err.message || 'Error al crear administrador');
    }
    setSaving(false);
  };

  const handleToggleActive = async (admin: any) => {
    try {
      await updateAdminUser(admin.id, { is_active: !admin.is_active });
      loadAdmins();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar');
    }
  };

  const handleChangePassword = async (id: string) => {
    if (!editPassword || editPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setSaving(true);
    try {
      await updateAdminUser(id, { password: editPassword });
      setSuccess('Contraseña actualizada');
      setTimeout(() => setSuccess(''), 3000);
      setEditingId(null);
      setEditPassword('');
    } catch (err: any) {
      setError(err.message || 'Error al cambiar contraseña');
    }
    setSaving(false);
  };

  const handleDelete = async (admin: any) => {
    if (!confirm(`¿Eliminar al administrador "${admin.display_name || admin.username}"? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteAdminUser(admin.id);
      setSuccess('Administrador eliminado');
      setTimeout(() => setSuccess(''), 3000);
      loadAdmins();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white/90 flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-brand-blue" />
          Configuración
        </h1>
        <p className="text-base text-white/35 mt-1">
          Ajustes de la plataforma y gestión de administradores
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════════
          SALES PAGE SETTINGS
      ═══════════════════════════════════════════════════════ */}
      <div
        className="rounded-2xl p-6 space-y-5"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2.5">
          <Settings className="w-5 h-5 text-[#00D1FF]" />
          <h2 className="text-lg font-bold text-white/80">Sales Page — Contenido Bloqueado</h2>
        </div>
        <p className="text-sm text-white/35">
          Oculta el contenido de las páginas de venta y muestra solo el logo y el video. Después del tiempo configurado, el contenido se desbloquea automáticamente.
        </p>

        {settingsLoading ? (
          <div className="text-white/25 text-sm py-4">Cargando configuración…</div>
        ) : (
          <>
            {/* Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDelayEnabled(!delayEnabled)}
                  className="transition-all"
                >
                  {delayEnabled ? (
                    <ToggleRight className="w-10 h-10 text-[#00E676]" />
                  ) : (
                    <ToggleLeft className="w-10 h-10 text-white/20" />
                  )}
                </button>
                <div>
                  <span className="text-sm font-bold text-white/70">
                    {delayEnabled ? 'Activado' : 'Desactivado'}
                  </span>
                  <p className="text-xs text-white/30">
                    {delayEnabled ? 'El contenido se oculta en la primera visita' : 'Todo el contenido es visible de inmediato'}
                  </p>
                </div>
              </div>
            </div>

            {/* Minutes input */}
            {delayEnabled && (
              <div className="flex items-center gap-4">
                <Clock className="w-5 h-5 text-[#00D1FF] shrink-0" />
                <label className="text-sm text-white/50 shrink-0">Minutos de espera:</label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={delayMinutes}
                  onChange={e => setDelayMinutes(Math.max(1, Math.min(60, parseInt(e.target.value) || 1)))}
                  className="w-20 rounded-lg px-3 py-2 text-sm text-white font-mono text-center focus:outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(0,209,255,0.3)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                />
                <span className="text-xs text-white/25">min</span>
              </div>
            )}

            {/* Save button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={saveSettings}
                disabled={settingsSaving}
                className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-30"
                style={{ background: '#00D1FF', color: '#060910' }}
                onMouseOver={e => { (e.target as HTMLElement).style.boxShadow = '0 0 20px rgba(0,209,255,0.3)'; }}
                onMouseOut={e => { (e.target as HTMLElement).style.boxShadow = 'none'; }}
              >
                {settingsSaving ? 'Guardando…' : 'Guardar Configuración'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════
          ADMIN USERS
      ═══════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white/90 flex items-center gap-2.5">
            <UserCog className="w-6 h-6 text-brand-blue" />
            Administradores
          </h1>
          <p className="text-base text-white/35 mt-1">
            Gestiona los usuarios con acceso al panel de administración
          </p>
        </div>
        <button
          onClick={() => { setShowCreate(true); setError(''); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
          style={{
            background: '#00D1FF',
            color: '#060910',
          }}
          onMouseOver={e => { (e.target as HTMLElement).style.boxShadow = '0 0 20px rgba(0,209,255,0.3)'; }}
          onMouseOut={e => { (e.target as HTMLElement).style.boxShadow = 'none'; }}
        >
          <Plus className="w-4 h-4" />
          Nuevo Admin
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div
          className="flex items-center gap-2.5 text-sm rounded-xl px-4 py-3"
          style={{
            color: '#ff6b6b',
            background: 'rgba(255,107,107,0.06)',
            border: '1px solid rgba(255,107,107,0.12)',
          }}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <button onClick={() => setError('')} className="ml-auto text-white/30 hover:text-white/50">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      {success && (
        <div
          className="flex items-center gap-2.5 text-sm rounded-xl px-4 py-3"
          style={{
            color: '#00E676',
            background: 'rgba(0,230,118,0.06)',
            border: '1px solid rgba(0,230,118,0.12)',
          }}
        >
          <Check className="w-4 h-4 shrink-0" />
          {success}
        </div>
      )}

      {/* Create Form */}
      {showCreate && (
        <div
          className="rounded-2xl p-6 space-y-4"
          style={{ background: 'rgba(0,209,255,0.03)', border: '1px solid rgba(0,209,255,0.1)' }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white/80">Nuevo Administrador</h2>
            <button onClick={resetForm} className="text-white/30 hover:text-white/50 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-white/40 block mb-1.5">Usuario *</label>
              <input
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                placeholder="nombre.usuario"
                className="w-full rounded-lg px-3 py-2.5 text-sm text-white font-mono placeholder:text-white/15 focus:outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                onFocus={e => { e.target.style.borderColor = 'rgba(0,209,255,0.3)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-white/40 block mb-1.5">Nombre para mostrar</label>
              <input
                value={form.display_name}
                onChange={e => setForm({ ...form, display_name: e.target.value })}
                placeholder="Juan Pérez"
                className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/15 focus:outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                onFocus={e => { e.target.style.borderColor = 'rgba(0,209,255,0.3)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-white/40 block mb-1.5">Contraseña *</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full rounded-lg px-3 pr-9 py-2.5 text-sm text-white font-mono placeholder:text-white/15 focus:outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(0,209,255,0.3)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50"
                >
                  {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-white/40 block mb-1.5">Rol</label>
              <select
                value={form.admin_role}
                onChange={e => setForm({ ...form, admin_role: e.target.value })}
                className="w-full rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none transition-all cursor-pointer appearance-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {ROLES.map(r => (
                  <option key={r.value} value={r.value} style={{ background: '#0a0e17' }}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white/40 hover:text-white/60 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving || !form.username || !form.password}
                className="px-5 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-30"
                style={{ background: '#00D1FF', color: '#060910' }}
              >
                {saving ? 'Creando…' : 'Crear Admin'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Admin List */}
      {loading ? (
        <div className="text-center py-12 text-white/25 text-base">Cargando…</div>
      ) : admins.length === 0 ? (
        <div className="text-center py-12 text-white/25 text-base">No hay administradores</div>
      ) : (
        <div className="space-y-3">
          {admins.map(admin => {
            const RoleIcon = admin.role === 'superadmin' ? ShieldCheck : Shield;
            const isCurrentUser = currentAdmin?.username === admin.username;
            const isEditing = editingId === admin.id;

            return (
              <div
                key={admin.id}
                className="rounded-2xl p-5 transition-all"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: `1px solid ${isCurrentUser ? 'rgba(0,209,255,0.15)' : 'rgba(255,255,255,0.05)'}`,
                }}
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: admin.role === 'superadmin' ? 'rgba(168,85,247,0.1)' : 'rgba(0,209,255,0.06)',
                      border: `1px solid ${admin.role === 'superadmin' ? 'rgba(168,85,247,0.2)' : 'rgba(0,209,255,0.12)'}`,
                    }}
                  >
                    <RoleIcon
                      className="w-5 h-5"
                      style={{ color: admin.role === 'superadmin' ? '#a855f7' : '#00D1FF' }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-white/85 truncate">
                        {admin.display_name || admin.username}
                      </span>
                      {isCurrentUser && (
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider"
                          style={{ background: 'rgba(0,209,255,0.1)', color: '#00D1FF', border: '1px solid rgba(0,209,255,0.2)' }}
                        >
                          Tú
                        </span>
                      )}
                      {!admin.is_active && (
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider"
                          style={{ background: 'rgba(255,107,107,0.08)', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.15)' }}
                        >
                          Inactivo
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-sm font-mono text-white/35">@{admin.username}</span>
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-md"
                        style={{
                          background: admin.role === 'superadmin' ? 'rgba(168,85,247,0.08)' : 'rgba(255,255,255,0.03)',
                          color: admin.role === 'superadmin' ? '#a855f7' : 'rgba(255,255,255,0.4)',
                          border: `1px solid ${admin.role === 'superadmin' ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.06)'}`,
                        }}
                      >
                        {ROLES.find(r => r.value === admin.role)?.label || admin.role}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {!isCurrentUser && (
                      <>
                        <button
                          onClick={() => handleToggleActive(admin)}
                          className="p-2 rounded-lg transition-all text-white/25 hover:text-white/50"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                          title={admin.is_active ? 'Desactivar' : 'Activar'}
                        >
                          {admin.is_active ? (
                            <Shield className="w-3.5 h-3.5" style={{ color: '#00E676' }} />
                          ) : (
                            <Shield className="w-3.5 h-3.5" style={{ color: '#ff6b6b' }} />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(admin)}
                          className="p-2 rounded-lg transition-all text-white/25 hover:text-red-400/80"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => {
                        setEditingId(isEditing ? null : admin.id);
                        setEditPassword('');
                      }}
                      className="p-2 rounded-lg transition-all text-white/25 hover:text-white/50"
                      style={{
                        background: isEditing ? 'rgba(0,209,255,0.08)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${isEditing ? 'rgba(0,209,255,0.15)' : 'rgba(255,255,255,0.06)'}`,
                      }}
                      title="Cambiar contraseña"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Edit password panel */}
                {isEditing && (
                  <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <label className="text-xs font-semibold text-white/40 block mb-1.5">Nueva contraseña</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type={showEditPw ? 'text' : 'password'}
                          value={editPassword}
                          onChange={e => setEditPassword(e.target.value)}
                          placeholder="Mínimo 6 caracteres"
                          className="w-full rounded-lg px-3 pr-9 py-2.5 text-sm text-white font-mono placeholder:text-white/15 focus:outline-none transition-all"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                          onFocus={e => { e.target.style.borderColor = 'rgba(0,209,255,0.3)'; }}
                          onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowEditPw(!showEditPw)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50"
                        >
                          {showEditPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <button
                        onClick={() => handleChangePassword(admin.id)}
                        disabled={saving || editPassword.length < 6}
                        className="px-4 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-30"
                        style={{ background: '#00D1FF', color: '#060910' }}
                      >
                        {saving ? 'Guardando…' : 'Guardar'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Info */}
      <div
        className="rounded-xl p-4 text-sm text-white/30"
        style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)' }}
      >
        <p><strong className="text-white/45">Super Admin:</strong> Acceso total al panel + puede gestionar administradores</p>
        <p className="mt-1"><strong className="text-white/45">Admin:</strong> Acceso al panel para gestionar usuarios y webhooks</p>
      </div>
    </div>
  );
}
