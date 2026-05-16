import React, { useEffect, useState } from 'react';
import { X, User, Trophy, Crown, HelpCircle, LogOut, Phone, Globe, Shield, Star, Map } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getProgress, getCompletedCount } from '../lib/progressStore';
import { LESSONS } from '../lib/lessons';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface AccountDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountDrawer: React.FC<AccountDrawerProps> = ({ isOpen, onClose }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Progress metrics
  const progress = getProgress();
  const completedCount = getCompletedCount();
  const totalLessons = LESSONS.length;
  const progressPercent = Math.round((completedCount / totalLessons) * 100);

  useEffect(() => {
    if (isOpen) {
      fetchUserProfile();
    }
  }, [isOpen]);

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

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-[400px] z-[100] transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } bg-[#0A0B10] border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-y-auto`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 sticky top-0 bg-[#0A0B10]/80 backdrop-blur-md z-10">
          <h2 className="text-xl font-mono uppercase tracking-wider text-white">Mi Cuenta</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 flex-1 flex flex-col gap-8">
          
          {/* 1. Perfil y Datos Personales */}
          <section className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#00D1FF] to-[#0055FF] p-1 shadow-[0_0_20px_rgba(0,209,255,0.3)]">
              <div className="w-full h-full bg-[#0A0B10] rounded-full flex items-center justify-center text-[#00D1FF]">
                <User size={40} />
              </div>
            </div>
            
            <div className="text-center">
              {loading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-6 bg-white/10 rounded w-32 mx-auto"></div>
                  <div className="h-4 bg-white/10 rounded w-48 mx-auto"></div>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-white">{profile?.name || user?.user_metadata?.name || 'Inversor'}</h3>
                  <p className="text-white/50 text-sm mt-1">{user?.email}</p>
                </>
              )}
            </div>

            {/* Badges Info */}
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {(profile?.phone || profile?.country_name) && (
                <>
                  {profile?.phone && (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/70">
                      <Phone size={12} /> {profile.phone}
                    </span>
                  )}
                  {profile?.country_name && (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/70">
                      <Globe size={12} /> {profile.country_name}
                    </span>
                  )}
                </>
              )}
            </div>
          </section>

          {/* 2. Progreso y Gamificación */}
          <section className="glass-panel p-5 rounded-xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="text-[#00D1FF]" size={20} />
              <h4 className="font-mono text-sm tracking-widest uppercase text-white/80">Tu Progreso</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="bg-black/30 rounded-lg p-3 border border-white/5 text-center">
                <p className="text-white/40 text-xs font-mono mb-1">XP ACUMULADO</p>
                <p className="text-xl font-bold text-[#00D1FF]">{progress.totalXp}</p>
              </div>
              <div className="bg-black/30 rounded-lg p-3 border border-white/5 text-center">
                <p className="text-white/40 text-xs font-mono mb-1">RACHA</p>
                <p className="text-xl font-bold text-brand-emerald">{progress.streak} DÍAS</p>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-2">
                <span className="text-white/50">AVANCE DEL RETO</span>
                <span className="text-[#00D1FF]">{progressPercent}%</span>
              </div>
              <div className="h-2 bg-black/50 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-[#00D1FF] to-[#0055FF] transition-all duration-1000"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </section>

          {/* 3. Suscripción y Planes */}
          <section className="glass-panel p-5 rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-transparent relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
            
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <Crown className="text-amber-500" size={20} />
              <h4 className="font-mono text-sm tracking-widest uppercase text-amber-500">Suscripción y Planes</h4>
            </div>
            
            <div className="relative z-10">
              <p className="text-white/80 text-sm mb-1">Plan Actual:</p>
              <div className="inline-block px-3 py-1 rounded bg-black/40 border border-white/10 text-white font-mono text-sm mb-5">
                RETO GENY LAB V3
              </div>

              <a 
                href="https://metodoingresarios.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full py-3 rounded-lg flex items-center justify-center gap-2 font-bold text-black bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:-translate-y-0.5"
              >
                <Star size={18} />
                ACTUALIZAR A PRO
              </a>
            </div>
          </section>

          {/* 4. Soporte y Comunidad */}
          <section className="flex flex-col gap-3">
            <h4 className="font-mono text-xs tracking-widest uppercase text-white/40 px-2">Comunidad</h4>
            
            <a 
              href="https://t.me/ingresarios" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-xl glass-panel-hover border border-white/5 text-white/80 hover:text-white group"
            >
              <div className="p-2 rounded-lg bg-[#0088CC]/20 text-[#0088CC] group-hover:bg-[#0088CC] group-hover:text-white transition-colors">
                <Shield size={20} />
              </div>
              <div className="flex-1">
                <p className="font-bold">Tribu Ingresarios</p>
                <p className="text-xs text-white/50">Únete a nuestra comunidad VIP</p>
              </div>
            </a>

            <a 
              href="mailto:soporte@ingresarios.com" 
              className="flex items-center gap-3 p-4 rounded-xl glass-panel-hover border border-white/5 text-white/80 hover:text-white group"
            >
              <div className="p-2 rounded-lg bg-white/5 text-white/60 group-hover:bg-white/10 group-hover:text-white transition-colors">
                <HelpCircle size={20} />
              </div>
              <div className="flex-1">
                <p className="font-bold">Soporte Técnico</p>
                <p className="text-xs text-white/50">¿Necesitas ayuda con la app?</p>
              </div>
            </a>
          </section>

          {/* 5. Sesión */}
          <section className="mt-auto pt-4 border-t border-white/5">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 p-4 text-red-500/80 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
            >
              <LogOut size={18} />
              <span className="font-mono tracking-wider uppercase text-sm">Cerrar Sesión</span>
            </button>
          </section>
        </div>
      </div>
    </>
  );
};
