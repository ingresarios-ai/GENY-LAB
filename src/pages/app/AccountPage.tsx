import React, { useEffect, useState } from 'react';
import { User, Trophy, Crown, HelpCircle, LogOut, Phone, Globe, Shield, Star, Award, Edit2, Save, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getProgress, getCompletedCount } from '../../lib/progressStore';
import { LESSONS } from '../../lib/lessons';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AVAILABLE_AVATARS = [
  '/avatars/avatar_m_1.png', '/avatars/avatar_f_1.png',
  '/avatars/avatar_m_2.png', '/avatars/avatar_f_2.png',
  '/avatars/avatar_m_3.png', '/avatars/avatar_f_3.png',
  '/avatars/avatar_m_4.png', '/avatars/avatar_f_4.png',
  '/avatars/avatar_m_5.png', '/avatars/avatar_f_5.png',
  '/avatars/avatar_m_6.png', '/avatars/avatar_f_6.png',
  '/avatars/avatar_m_7.png', '/avatars/avatar_f_7.png',
  '/avatars/avatar_bear.png', '/avatars/avatar_bull.png'
];

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  // Progress metrics
  const progress = getProgress();
  const completedCount = getCompletedCount();
  const totalLessons = LESSONS.length;
  const progressPercent = Math.round((completedCount / totalLessons) * 100);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user?.email) {
        const { data, error } = await supabase
          .from('enrolled_users')
          .select('*')
          .eq('email', user.email)
          .single();
        
        if (!error && data) {
          setProfile(data);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Sesión cerrada correctamente');
      navigate('/');
    } catch (error) {
      toast.error('Error al cerrar sesión');
    }
  };

  const handleEditClick = () => {
    setEditName(profile?.name || user?.user_metadata?.name || '');
    setEditPhone(profile?.phone || '');
    setEditCountry(profile?.country_name || '');
    setEditAvatar(profile?.avatar_url || '');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveProfile = async () => {
    if (!user?.email) return;
    
    try {
      setSaving(true);
      const updates = {
        name: editName,
        phone: editPhone,
        country_name: editCountry,
        avatar_url: editAvatar,
      };

      const { error } = await supabase
        .from('enrolled_users')
        .update(updates)
        .eq('email', user.email);

      if (error) throw error;

      setProfile({ ...profile, ...updates });
      setIsEditing(false);
      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-32 lg:pb-8">
      
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Mi Cuenta</h1>
        <p className="text-white/50 mt-2">Gestiona tu progreso, suscripciones y configuración.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Columna Izquierda: Perfil */}
        <div className="md:col-span-1 space-y-6">
          <section className="glass-panel p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00D1FF]/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
            
            <div className="flex flex-col items-center gap-4 relative z-10">
              {/* Botón Editar */}
              {!isEditing && !loading && (
                <button
                  onClick={handleEditClick}
                  className="absolute top-0 right-0 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Editar perfil"
                >
                  <Edit2 size={16} />
                </button>
              )}

              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#00D1FF] to-[#0055FF] p-1 shadow-[0_0_20px_rgba(0,209,255,0.3)] mt-2">
                <div className="w-full h-full bg-[#0A0B10] rounded-full flex items-center justify-center text-[#00D1FF] overflow-hidden">
                  {(isEditing ? editAvatar : profile?.avatar_url) ? (
                    <img src={isEditing ? editAvatar : profile?.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User size={40} />
                  )}
                </div>
              </div>
              
              <div className="text-center w-full">
                {loading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-6 bg-white/10 rounded w-32 mx-auto"></div>
                    <div className="h-4 bg-white/10 rounded w-48 mx-auto"></div>
                  </div>
                ) : isEditing ? (
                  <div className="space-y-3 w-full mt-2">
                    {/* Selector de Avatar */}
                    <div>
                      <label className="block text-left text-xs font-mono text-white/50 mb-2">Elige un Avatar</label>
                      <div className="grid grid-cols-4 gap-2">
                        {AVAILABLE_AVATARS.map((avatar, idx) => (
                          <button
                            key={idx}
                            onClick={() => setEditAvatar(avatar)}
                            className={`w-full aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                              editAvatar === avatar 
                                ? 'border-[#00D1FF] shadow-[0_0_10px_rgba(0,209,255,0.3)] scale-105' 
                                : 'border-transparent hover:border-white/20'
                            }`}
                          >
                            <img src={avatar} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-left text-xs font-mono text-white/50 mb-1">Nombre</label>
                      <input 
                        type="text" 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00D1FF] transition-colors"
                        placeholder="Tu nombre"
                      />
                    </div>
                    <p className="text-white/30 text-xs text-left truncate">{user?.email}</p>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {profile?.name || user?.user_metadata?.name || 'Inversor'}
                    </h3>
                    <p className="text-white/50 text-sm truncate max-w-full px-2">{user?.email}</p>
                  </>
                )}
              </div>

              {/* Badges Info */}
              <div className="w-full flex flex-col gap-2 mt-4 pt-4 border-t border-white/5">
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-left text-xs font-mono text-white/50 mb-1">Teléfono</label>
                      <input 
                        type="tel" 
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00D1FF] transition-colors"
                        placeholder="+1 234 567 890"
                      />
                    </div>
                    <div>
                      <label className="block text-left text-xs font-mono text-white/50 mb-1">País</label>
                      <input 
                        type="text" 
                        value={editCountry}
                        onChange={(e) => setEditCountry(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00D1FF] transition-colors"
                        placeholder="Ej. México, Colombia..."
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button 
                        onClick={handleCancelEdit}
                        className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm font-medium transition-colors flex items-center justify-center gap-1"
                        disabled={saving}
                      >
                        <X size={14} /> Cancelar
                      </button>
                      <button 
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="flex-1 py-2 rounded-lg bg-[#00D1FF] hover:bg-[#00D1FF]/80 text-black text-sm font-bold transition-colors flex items-center justify-center gap-1"
                      >
                        {saving ? (
                          <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                        ) : (
                          <><Save size={14} /> Guardar</>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {profile?.phone && (
                      <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 text-sm text-white/70">
                        <Phone size={14} className="text-white/40" /> 
                        <span>{profile.phone}</span>
                      </div>
                    )}
                    {profile?.country_name && (
                      <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 text-sm text-white/70">
                        <Globe size={14} className="text-white/40" /> 
                        <span>{profile.country_name}</span>
                      </div>
                    )}
                    {!profile?.phone && !profile?.country_name && !loading && (
                      <p className="text-center text-xs text-white/40 italic">Información de contacto no disponible.</p>
                    )}
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Botón Cerrar Sesión Desktop (visible on larger screens here, or standard on all) */}
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-4 text-red-500/80 hover:text-red-400 hover:bg-red-500/10 border border-red-500/20 rounded-2xl transition-all glass-panel-hover"
          >
            <LogOut size={18} />
            <span className="font-mono tracking-wider uppercase text-sm font-semibold">Cerrar Sesión</span>
          </button>
        </div>

        {/* Columna Central: Progreso */}
        <div className="md:col-span-1 space-y-6">
          <section className="glass-panel p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-[#00D1FF]/5 to-transparent h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#00D1FF]/10 rounded-lg">
                <Trophy className="text-[#00D1FF]" size={20} />
              </div>
              <h4 className="font-mono text-sm tracking-widest uppercase text-white/80">Tu Progreso</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-black/40 rounded-xl p-4 border border-white/5 flex flex-col items-center justify-center">
                <p className="text-white/40 text-[10px] font-mono mb-2 uppercase tracking-widest">XP Acumulado</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-3xl font-bold text-[#00D1FF]">{progress.totalXp}</p>
                  <span className="text-[#00D1FF]/50 text-xs font-mono">XP</span>
                </div>
              </div>
              <div className="bg-black/40 rounded-xl p-4 border border-white/5 flex flex-col items-center justify-center">
                <p className="text-white/40 text-[10px] font-mono mb-2 uppercase tracking-widest">Racha</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-3xl font-bold text-brand-emerald">{progress.streak}</p>
                  <span className="text-brand-emerald/50 text-xs font-mono">DÍAS</span>
                </div>
              </div>
            </div>

            <div className="mt-auto">
              <div className="flex justify-between items-end mb-3">
                <div className="flex items-center gap-2">
                  <Award size={16} className="text-white/40" />
                  <span className="text-sm text-white/70 font-medium">Avance del Reto</span>
                </div>
                <span className="text-xl font-bold text-[#00D1FF]">{progressPercent}%</span>
              </div>
              <div className="h-3 bg-black/50 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-[#00D1FF] to-[#0055FF] transition-all duration-1000 relative"
                  style={{ width: `${progressPercent}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                </div>
              </div>
              <p className="text-center text-xs text-white/40 mt-3 font-mono">
                {completedCount} DE {totalLessons} MISIONES COMPLETADAS
              </p>
            </div>
          </section>
        </div>

        {/* Columna Derecha: Suscripción y Comunidad */}
        <div className="md:col-span-1 space-y-6">
          
          {/* Suscripción y Planes */}
          <section className="glass-panel p-6 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-transparent relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-amber-500/30 transition-colors duration-500"></div>
            
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Crown className="text-amber-500" size={20} />
              </div>
              <h4 className="font-mono text-sm tracking-widest uppercase text-amber-500">Suscripción</h4>
            </div>
            
            <div className="relative z-10">
              <p className="text-white/60 text-sm mb-2">Plan Actual:</p>
              <div className="inline-flex items-center px-4 py-2 rounded-lg bg-black/40 border border-amber-500/20 text-white font-mono text-sm mb-6 w-full shadow-inner">
                <div className="w-2 h-2 rounded-full bg-amber-500 mr-3 animate-pulse"></div>
                GENY LAB
              </div>

              <a 
                href="https://metodoingresarios.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-black bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:-translate-y-1"
              >
                <Star size={18} />
                ACTUALIZAR A PRO
              </a>
            </div>
          </section>

          {/* Comunidad */}
          <section className="flex flex-col gap-4">
            <h4 className="font-mono text-xs tracking-widest uppercase text-white/40 px-2">Comunidad y Soporte</h4>
            
            <a 
              href="https://t.me/ingresarios" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 rounded-2xl glass-panel-hover border border-white/5 text-white/80 hover:text-white group transition-all"
            >
              <div className="p-3 rounded-xl bg-[#0088CC]/10 text-[#0088CC] group-hover:bg-[#0088CC] group-hover:text-white transition-colors shadow-inner">
                <Shield size={24} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-base">Tribu Ingresarios</p>
                <p className="text-xs text-white/50 mt-1">Únete a nuestra comunidad VIP</p>
              </div>
            </a>

            <a 
              href="mailto:soporte@ingresarios.com" 
              className="flex items-center gap-4 p-5 rounded-2xl glass-panel-hover border border-white/5 text-white/80 hover:text-white group transition-all"
            >
              <div className="p-3 rounded-xl bg-white/5 text-white/60 group-hover:bg-white/10 group-hover:text-white transition-colors shadow-inner">
                <HelpCircle size={24} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-base">Soporte Técnico</p>
                <p className="text-xs text-white/50 mt-1">¿Necesitas ayuda con la app?</p>
              </div>
            </a>
          </section>

        </div>
      </div>
    </div>
  );
}
