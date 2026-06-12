import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ChevronRight, Trash2, UserCheck, Edit, Calendar, Phone, Mail, Globe, Download } from 'lucide-react';
import { getUsers, updateUser, deleteUser } from '../../lib/adminApi';

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

const escapeCSV = (val: any) => {
  if (val === null || val === undefined) return '';
  let str = String(val);
  str = str.replace(/"/g, '""');
  if (str.includes(',') || str.includes(';') || str.includes('\n') || str.includes('\r') || str.includes('"')) {
    return `"${str}"`;
  }
  return str;
};

export default function AdminLeads() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [page, setPage] = useState(1);
  const [totalMatchingCount, setTotalMatchingCount] = useState(0);
  const pageSize = 50;
  const totalPages = Math.ceil(totalMatchingCount / pageSize);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { 
        status: 'lead',
        limit: String(pageSize),
        offset: String((page - 1) * pageSize)
      };
      if (search) params.search = search;
      const res = await getUsers(params);
      setLeads(res.data || []);
      setTotalMatchingCount(res.count || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const t = setTimeout(loadLeads, 300);
    return () => clearTimeout(t);
  }, [loadLeads]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const handlePromoteLead = async (lead: any) => {
    if (!confirm(`¿Aprobar pago y promover a ${lead.name} como usuario activo?`)) return;
    try {
      await updateUser(lead.id, {
        status: 'active',
        payment_method: 'manual_admin',
        payment_platform: 'generic',
        updated_at: new Date().toISOString()
      });
      setSelectedLead(null);
      loadLeads();
      alert('Lead promovido a usuario activo exitosamente.');
    } catch (err: any) {
      alert(`Error al promover: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este interesado permanentemente?')) return;
    await deleteUser(id);
    setSelectedLead(null);
    loadLeads();
  };

  const handleDownloadCSV = async (exportAll: boolean) => {
    let leadsToExport = leads;
    
    if (exportAll) {
      try {
        setExporting(true);
        const params: Record<string, string> = {
          status: 'lead',
          limit: '9999',
          offset: '0'
        };
        if (search) params.search = search;
        
        const res = await getUsers(params);
        leadsToExport = res.data || [];
      } catch (err) {
        console.error('Error fetching all leads for export:', err);
        alert('Error al descargar todos los interesados');
        return;
      } finally {
        setExporting(false);
      }
    }

    if (leadsToExport.length === 0) {
      alert('No hay interesados para descargar');
      return;
    }

    const headers = [
      'Nombre',
      'Email',
      'Teléfono',
      'País',
      'Fecha de Registro',
      'Notas'
    ];

    const rows = leadsToExport.map(l => [
      l.name || '',
      l.email || '',
      l.phone || '',
      l.country_name || l.country || '',
      l.created_at ? new Date(l.created_at).toLocaleString('es-MX') : '',
      l.notes || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(escapeCSV).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    
    const dateStr = new Date().toISOString().split('T')[0];
    const fileNameSuffix = exportAll ? 'todos' : `pagina_${page}`;
    link.setAttribute('download', `leads_geny_lab_${fileNameSuffix}_${dateStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          <h1 className="text-xl font-bold text-white/90 tracking-wide">Leads Interesados</h1>
          <p className="text-base text-white/30 mt-0.5">
            {leads.length} {leads.length === 1 ? 'interesado registrado' : 'interesados registrados'}
            {totalMatchingCount > 0 && (
              <span className="text-white/20 ml-2 font-normal">
                • {totalMatchingCount} en total en la plataforma
              </span>
            )}
          </p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-base font-bold transition-all disabled:opacity-50"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.8)',
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            <Download className="w-4 h-4 text-white/60" /> {exporting ? 'Exportando...' : 'Descargar CSV'}
          </button>
          {showExportMenu && (
            <div 
              className="absolute right-0 mt-2 w-56 rounded-xl glass-panel shadow-2xl z-[110] p-1.5 space-y-1"
              style={{
                background: 'rgba(10, 15, 25, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <button
                onClick={() => { setShowExportMenu(false); handleDownloadCSV(false); }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold hover:bg-white/[0.04] text-white/80 hover:text-white transition-colors"
              >
                Vista Actual ({leads.length})
              </button>
              <button
                onClick={() => { setShowExportMenu(false); handleDownloadCSV(true); }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold hover:bg-white/[0.04] text-white/80 hover:text-white transition-colors"
              >
                Todos los filtrados ({totalMatchingCount})
              </button>
            </div>
          )}
        </div>
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
      </div>

      {/* Table + Detail */}
      <div className="flex gap-5">
        {/* Leads List */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-5 h-5 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
            </div>
          ) : leads.length === 0 ? (
            <div className="glass-panel p-16 text-center">
              <p className="text-white/25 text-base">No hay interesados registrados</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1">
                {leads.map(l => (
                  <button
                    key={l.id}
                    onClick={() => setSelectedLead(l)}
                    className="w-full text-left rounded-xl px-4 py-3.5 flex items-center gap-4 transition-all"
                    style={{
                      background: selectedLead?.id === l.id ? 'rgba(0,209,255,0.04)' : 'rgba(255,255,255,0.015)',
                      border: `1px solid ${selectedLead?.id === l.id ? 'rgba(0,209,255,0.15)' : 'rgba(255,255,255,0.04)'}`,
                    }}
                    onMouseOver={e => {
                      if (selectedLead?.id !== l.id) e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    }}
                    onMouseOut={e => {
                      if (selectedLead?.id !== l.id) e.currentTarget.style.background = 'rgba(255,255,255,0.015)';
                    }}
                  >
                    {/* Icon */}
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 bg-amber-500/10 text-amber-500"
                    >
                      {l.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-semibold text-white/80 truncate">{l.name}</div>
                      <div className="text-sm text-white/35 font-mono truncate">{l.email}</div>
                      {(l.phone || l.country_name) && (
                        <div className="flex items-center gap-3 mt-0.5">
                          {l.phone && (
                            <span className="text-xs text-white/25 font-mono">📱 {l.phone}</span>
                          )}
                          {l.country_name && (
                            <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ background: 'rgba(0,209,255,0.06)', color: 'rgba(0,209,255,0.5)', border: '1px solid rgba(0,209,255,0.1)' }}>🌎 {l.country_name}</span>
                          )}
                        </div>
                      )}
                    </div>
                    {/* Date */}
                    <div className="text-xs font-mono text-white/20 shrink-0">
                      {new Date(l.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-white/15 shrink-0" />
                  </button>
                ))}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-lg text-sm font-semibold transition-all bg-white/[0.03] border border-white/[0.08] text-white/60 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                  >
                    Anterior
                  </button>
                  <span className="text-sm font-mono text-white/40">
                    Página <span className="text-white/80 font-bold">{page}</span> de <span className="text-white/80 font-bold">{totalPages}</span> <span className="text-white/20 ml-1">({totalMatchingCount} filtrados)</span>
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-lg text-sm font-semibold transition-all bg-white/[0.03] border border-white/[0.08] text-white/60 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedLead && (
          <div
            className="w-80 shrink-0 glass-panel p-5 space-y-4 sticky top-4 self-start"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white/50">Detalle del interesado</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowEditModal(true)} className="text-white/20 hover:text-[#00D1FF] transition-colors p-1" title="Editar Lead">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => setSelectedLead(null)} className="text-white/20 hover:text-white/50 transition-colors p-1" title="Cerrar">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-lg font-bold text-white/90">{selectedLead.name}</div>
                <div className="text-base text-white/35 font-mono mt-0.5">{selectedLead.email}</div>
                {selectedLead.phone && <div className="text-sm text-white/25 font-mono mt-0.5">{selectedLead.phone}</div>}
              </div>

              <div className="rounded-lg p-3 space-y-2 bg-[#0a0e17] border border-white/5 text-sm">
                <div className="flex items-center gap-2 text-white/40 font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-brand-blue" />
                  <span>Registro</span>
                </div>
                <p className="text-white/60 font-mono">
                  {new Date(selectedLead.created_at).toLocaleString('es-MX')}
                </p>
              </div>

              {selectedLead.country_name && (
                <div className="rounded-lg p-3" style={{ background: 'rgba(0,209,255,0.02)', border: '1px solid rgba(0,209,255,0.08)' }}>
                  <div className="text-sm text-white/30 font-medium mb-1">País</div>
                  <div className="text-base font-medium text-white/60">
                    {selectedLead.country_name} <span className="text-xs text-white/25 font-mono ml-1">({selectedLead.country})</span>
                  </div>
                </div>
              )}

              {selectedLead.notes && (
                <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="text-sm text-white/30 font-medium mb-1">Notas</div>
                  <p className="text-base text-white/45">{selectedLead.notes}</p>
                </div>
              )}

              {/* Action buttons */}
              <div
                className="flex flex-col gap-2 pt-3"
                style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
              >
                <button
                  onClick={() => handlePromoteLead(selectedLead)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all"
                  style={{
                    background: 'rgba(0,230,118,0.06)',
                    border: '1px solid rgba(0,230,118,0.15)',
                    color: '#00E676',
                  }}
                >
                  <UserCheck className="w-3.5 h-3.5" /> Promover a Activo
                </button>
                
                <button
                  onClick={() => handleDelete(selectedLead.id)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all"
                  style={{
                    background: 'rgba(255,80,80,0.06)',
                    border: '1px solid rgba(255,80,80,0.15)',
                    color: '#ff6b6b',
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" /> Eliminar Interesado
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Lead Modal */}
      {showEditModal && selectedLead && (
        <EditLeadModal
          lead={selectedLead}
          onClose={() => setShowEditModal(false)}
          onUpdated={(updatedLead) => {
            setShowEditModal(false);
            setSelectedLead({ ...selectedLead, ...updatedLead });
            loadLeads();
          }}
        />
      )}
    </div>
  );
}

// ── Edit Lead Modal ──
function EditLeadModal({ lead, onClose, onUpdated }: { lead: any; onClose: () => void; onUpdated: (data: any) => void }) {
  // Parse existing phone number
  const initialPhone = lead.phone || '';
  let initialCountryCode = '+52';
  let initialPhoneNumber = initialPhone;

  if (initialPhone) {
    const foundCode = COUNTRY_CODES.find(c => initialPhone.startsWith(c.code));
    if (foundCode) {
      initialCountryCode = foundCode.code;
      initialPhoneNumber = initialPhone.substring(foundCode.code.length);
    } else if (initialPhone.startsWith('+')) {
      const parts = initialPhone.match(/^(\+\d{1,3})(.*)$/);
      if (parts) {
        initialCountryCode = parts[1];
        initialPhoneNumber = parts[2];
      }
    }
  }

  const [form, setForm] = useState({
    name: lead.name || '',
    email: lead.email || '',
    notes: lead.notes || ''
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
      };
      await updateUser(lead.id, payload);
      onUpdated(payload);
    } catch (err: any) {
      setError(err.message || 'Error updating lead');
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
          <h2 className="text-lg font-bold text-white/90">Editar Interesado</h2>
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
          <div>
            <label className="text-sm font-medium text-white/40 block mb-1.5">Notas</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3}
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
