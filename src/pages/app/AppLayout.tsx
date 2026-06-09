import { useState, useEffect } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { Map, Trophy, MessageCircle, Target, Lock, User, Video, Scale, Zap, Check } from 'lucide-react';
import { Footer } from '../../components/Footer';
import { getCompletedCount } from '../../lib/progressStore';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';

export default function AppLayout() {
  const completedCount = getCompletedCount();
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [agreeTermsChecked, setAgreeTermsChecked] = useState(false);
  const [acceptingTerms, setAcceptingTerms] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email) {
          const { data } = await supabase
            .from('enrolled_users')
            .select('accepted_terms')
            .eq('email', user.email)
            .single();
          if (data && !data.accepted_terms) {
            setShowTermsModal(true);
          }
        }
      } catch (err) {
        console.error('Error checking terms acceptance:', err);
      }
    })();
  }, []);

  const handleAcceptTerms = async () => {
    if (!agreeTermsChecked) return;
    setAcceptingTerms(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email) {
        const { error } = await supabase
          .from('enrolled_users')
          .update({ accepted_terms: true })
          .eq('email', user.email);
        
        if (error) throw error;
        setShowTermsModal(false);
        toast.success('Términos y condiciones aceptados.');
      }
    } catch (err) {
      console.error('Error accepting terms:', err);
      toast.error('Error al guardar la aceptación de los términos.');
    } finally {
      setAcceptingTerms(false);
    }
  };

  const navItems = [
    { to: "/app", icon: Map, label: "Mi Ruta", end: true },
    { to: "/app/en-vivo", icon: Video, label: "Sesiones", end: false },
    { 
      to: "/app/geny-opciones", 
      icon: Target, 
      label: "Geny Opciones", 
      // locked: completedCount < 6,
      locked: false, // Temporary bypass to enable Geny Opciones
      onClick: (e: React.MouseEvent) => {
        // const isLocked = completedCount < 6;
        const isLocked = false; // Temporary bypass
        if (isLocked) {
          e.preventDefault();
          toast.error("Supera la Fase 2 (Nodo 6) para desbloquear el simulador.", {
            id: 'locked-toast',
            icon: '🔒',
            style: {
              background: 'rgba(10, 11, 16, 0.85)',
              backdropFilter: 'blur(12px)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.2)',
              fontSize: '1.1rem',
              fontWeight: '500',
              padding: '20px 30px',
              maxWidth: '450px',
              textAlign: 'center',
              marginTop: '35vh',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
            }
          });
        }
      }
    },
    { to: "/app/logros", icon: Trophy, label: "Logros" },
  ];

  return (
    <div className="min-h-dvh flex">
      {/* Desktop Top Navigation */}
      <header className="hidden md:flex fixed top-4 left-1/2 -translate-x-1/2 z-50 glass-panel rounded-lg px-4 py-2 items-center justify-center border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <nav className="flex items-center gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={item.onClick}
              className={({ isActive }) => `flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all duration-300 font-mono text-xs tracking-widest uppercase ${
                isActive && !item.locked
                  ? 'bg-white/10 text-[#00D1FF] shadow-[inset_0_0_20px_rgba(0,209,255,0.1)] border border-[#00D1FF]/20' 
                  : item.locked
                    ? 'text-white/20 border border-transparent cursor-not-allowed hover:bg-white/5'
                    : 'text-white/60 border border-transparent hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.locked ? <Lock className="w-5 h-5 opacity-50" /> : <item.icon className="w-5 h-5" />}
              <span>{item.label}</span>
            </NavLink>
          ))}
          <div className="w-px h-6 bg-white/10 mx-2"></div>
          <NavLink
            to="/app/cuenta"
            className={({ isActive }) => `flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-300 ${
              isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className="p-1 rounded-full bg-[#00D1FF]/20 text-[#00D1FF]">
              <User size={18} />
            </div>
          </NavLink>
        </nav>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative min-h-dvh overflow-x-hidden">
        <main className="flex-1 w-full max-w-[1440px] mx-auto pt-8 md:pt-32 px-4 md:px-12 lg:px-16 pb-[100px] md:pb-10">
          <Outlet />
        </main>
        <Footer />
      </div>

      {/* Bottom Tab Bar (Mobile Only) */}
      <nav className="flex md:hidden fixed bottom-0 left-0 right-0 justify-around items-center px-4 pb-[calc(10px+env(safe-area-inset-bottom))] pt-3 glass-panel rounded-t-xl border-b-0 z-50">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={item.onClick}
            className={({ isActive }) => `flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all ${
              isActive && !item.locked ? 'text-[#00D1FF]' : item.locked ? 'text-white/20' : 'text-white/40'
            }`}
          >
            {({ isActive }) => (
              <>
                {item.locked ? (
                  <Lock size={28} className="opacity-50" />
                ) : (
                  <item.icon size={28} className={isActive ? 'drop-shadow-[0_0_8px_rgba(0,209,255,0.8)]' : ''} />
                )}
                <span className="text-[10px] font-mono uppercase tracking-wider">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
        <NavLink
          to="/app/cuenta"
          className={({ isActive }) => `flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all ${
            isActive ? 'text-[#00D1FF]' : 'text-white/40 hover:text-white'
          }`}
        >
          {({ isActive }) => (
            <>
              <User size={28} className={isActive ? 'drop-shadow-[0_0_8px_rgba(0,209,255,0.8)]' : ''} />
              <span className="text-[10px] font-mono uppercase tracking-wider">Mi Cuenta</span>
            </>
          )}
        </NavLink>
      </nav>

      {/* Terms and Conditions Acceptance Modal */}
      <AnimatePresence>
        {showTermsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl glass-panel rounded-3xl p-6 md:p-8 flex flex-col border border-[#00D1FF]/30 shadow-[0_0_50px_rgba(0,209,255,0.2)] overflow-hidden max-h-[90vh]"
            >
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-[#00D1FF]/10 rounded-full blur-2xl pointer-events-none"></div>

              <div className="mb-4 mt-2 relative z-10">
                <div className="flex items-center gap-2 text-[#00D1FF] font-mono text-xs mb-3 uppercase tracking-widest">
                  <Scale className="w-4 h-4 text-[#00D1FF]" />
                  <span>MARCO LEGAL REQUERIDO</span>
                </div>
                <h2 className="text-2xl font-bold uppercase tracking-tight text-white mb-2 leading-tight">
                  Términos y Condiciones
                </h2>
                <p className="text-white/60 text-xs font-mono">
                  Plataforma Educativa GENY LAB · Reditum Group S.A.S.
                </p>
              </div>

              {/* Scrollable Summary */}
              <div className="flex-1 overflow-y-auto bg-black/40 border border-white/5 rounded-2xl p-4 mb-4 text-white/70 text-xs md:text-sm space-y-4 scrollbar-thin max-h-[35vh]">
                <p className="font-semibold text-white/90">
                  Por favor, lee con atención los siguientes puntos antes de acceder a la plataforma. Al usar GENY LAB, aceptas estos términos:
                </p>
                <div className="space-y-3 font-sans text-white/70 leading-relaxed">
                  <p>
                    <strong>1. Naturaleza Educativa:</strong> El usuario reconoce que GENY LAB es una plataforma exclusivamente formativa e informativa. Los perfiles, diagnósticos orientativos y reportes generados no constituyen asesoría de inversión, financiera, fiscal, legal ni de salud mental.
                  </p>
                  <p>
                    <strong>2. Decisiones Autónomas:</strong> Toda decisión financiera adoptada por el usuario es de su entera y exclusiva responsabilidad. El trading y las inversiones conllevan riesgos significativos de pérdida de capital.
                  </p>
                  <p>
                    <strong>3. Confidencialidad de Accesos:</strong> El usuario se compromete a resguardar sus credenciales de ingreso y a no ceder, compartir ni transferir su cuenta a terceros.
                  </p>
                  <p>
                    <strong>4. Propiedad Intelectual:</strong> Las metodologías, simuladores, asistentes de IA y contenidos son propiedad exclusiva de Reditum Group S.A.S. y están protegidos por las leyes de propiedad intelectual.
                  </p>
                </div>
                <div className="pt-2 text-center">
                  <a 
                    href="/terminos-y-condiciones" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-[#00D1FF] hover:underline inline-flex items-center gap-1 font-semibold text-xs font-mono"
                  >
                    Leer Términos y Condiciones Completos <span className="text-xs">↗</span>
                  </a>
                </div>
              </div>

              {/* Accept Section */}
              <div className="mt-auto pt-4 border-t border-white/10 flex flex-col gap-4 relative z-10">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5 rounded border border-white/20 bg-black/40 group-hover:border-[#00D1FF]/50 transition-colors mt-0.5 shrink-0">
                    <input 
                      type="checkbox" 
                      className="peer sr-only"
                      checked={agreeTermsChecked}
                      onChange={(e) => setAgreeTermsChecked(e.target.checked)}
                    />
                    <Check size={14} className="text-[#00D1FF] opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-xs text-white/60 group-hover:text-white/80 transition-colors leading-relaxed">
                    He leído, comprendo y acepto sin reservas los <a href="/terminos-y-condiciones" target="_blank" rel="noopener noreferrer" className="text-[#00D1FF] hover:underline font-semibold">Términos y Condiciones</a> y la Política de Privacidad de la plataforma.
                  </span>
                </label>
                
                <button 
                  onClick={handleAcceptTerms}
                  disabled={!agreeTermsChecked || acceptingTerms}
                  className="w-full py-4 rounded-xl font-mono tracking-widest uppercase text-black bg-[#00D1FF] hover:bg-[#00D1FF]/95 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 font-bold shadow-[0_0_20px_rgba(0,209,255,0.2)]"
                >
                  {acceptingTerms ? (
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Zap size={16} /> ACEPTAR Y CONTINUAR
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
