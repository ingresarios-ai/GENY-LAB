import { NavLink, Outlet, Link } from 'react-router-dom';
import { Map, Trophy, MessageCircle, Target, Lock, User } from 'lucide-react';
import { Footer } from '../../components/Footer';
import { getCompletedCount } from '../../lib/progressStore';
import toast from 'react-hot-toast';
import { AccountDrawer } from '../../components/AccountDrawer';
import { useState } from 'react';

export default function AppLayout() {
  const completedCount = getCompletedCount();
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const navItems = [
    { to: "/app", icon: Map, label: "Mi Ruta", end: true },
    { 
      to: "/app/geny-opciones", 
      icon: Target, 
      label: "Geny Options", 
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
              {item.locked ? <Lock className="w-4 h-4 opacity-50" /> : <item.icon className="w-4 h-4" />}
              <span>{item.label}</span>
            </NavLink>
          ))}
          <div className="w-px h-6 bg-white/10 mx-2"></div>
          <button
            onClick={() => setIsAccountOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-300 text-white/60 hover:bg-white/5 hover:text-white"
          >
            <div className="p-1 rounded-full bg-[#00D1FF]/20 text-[#00D1FF]">
              <User size={16} />
            </div>
          </button>
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
                  <Lock size={22} className="opacity-50" />
                ) : (
                  <item.icon size={22} className={isActive ? 'drop-shadow-[0_0_8px_rgba(0,209,255,0.8)]' : ''} />
                )}
                <span className="text-[10px] font-mono uppercase tracking-wider">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
        <button
          onClick={() => setIsAccountOpen(true)}
          className="flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all text-white/40 hover:text-white"
        >
          <User size={22} />
          <span className="text-[10px] font-mono uppercase tracking-wider">Mi Cuenta</span>
        </button>
      </nav>

      {/* Account Drawer */}
      <AccountDrawer isOpen={isAccountOpen} onClose={() => setIsAccountOpen(false)} />
    </div>
  );
}
