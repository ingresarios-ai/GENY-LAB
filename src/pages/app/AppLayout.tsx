import { NavLink, Outlet, Link } from 'react-router-dom';
import { Map, Trophy, MessageCircle } from 'lucide-react';
import { Footer } from '../../components/Footer';

export default function AppLayout() {
  const navItems = [
    { to: "/app", icon: Map, label: "Camino", end: true },
    { to: "/app/logros", icon: Trophy, label: "Logros" },
  ];


  return (
    <div className="min-h-dvh flex">
      {/* Global Logo Text */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[40] pointer-events-none flex flex-col items-center text-center w-full max-w-[200px]">
        <Link to="/app" className="pointer-events-auto flex flex-col items-center hover:opacity-80 transition-opacity">
          <div className="text-xl md:text-2xl font-black uppercase tracking-tight text-white leading-none mb-1 drop-shadow-[0_0_15px_rgba(0,209,255,0.6)]">
            GENY<br/>LAB
          </div>
          <div className="text-[#00D1FF] font-bold text-[8px] md:text-[9px] tracking-[0.2em] md:tracking-[0.3em] uppercase opacity-90 drop-shadow-[0_0_8px_rgba(0,209,255,0.6)] whitespace-nowrap mt-0.5">
            Sistema - Ejecución - Resultados
          </div>
        </Link>
      </div>
      {/* Desktop Top Navigation */}
      <header className="hidden md:flex fixed top-4 left-1/2 -translate-x-1/2 z-50 glass-panel rounded-full px-4 py-2 items-center justify-center border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <nav className="flex items-center gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 font-bold text-sm tracking-widest uppercase ${
                isActive 
                  ? 'bg-white/10 text-[#00D1FF] shadow-[inset_0_0_20px_rgba(0,209,255,0.1)] border border-[#00D1FF]/20' 
                  : 'text-white/60 border border-transparent hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
          <div className="w-px h-6 bg-white/10 mx-2"></div>
          <a
            href="https://wa.me/5215512345678"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 font-bold text-sm tracking-widest uppercase text-brand-emerald/80 border border-transparent hover:bg-brand-emerald/10 hover:text-brand-emerald"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Soporte</span>
          </a>
        </nav>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative min-h-dvh">
        <main className="flex-1 w-full max-w-[1440px] mx-auto pt-8 md:pt-32 px-4 md:px-12 lg:px-16 pb-10">
          <Outlet />
        </main>
        <Footer />
      </div>

      {/* Bottom Tab Bar (Mobile Only) */}
      <nav className="flex md:hidden fixed bottom-0 left-0 right-0 justify-around items-center px-4 pb-[calc(10px+env(safe-area-inset-bottom))] pt-3 glass-panel rounded-t-3xl border-b-0 z-50">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${
              isActive ? 'text-[#00D1FF]' : 'text-white/40'
            }`}
          >
            {({ isActive }) => (
              <>
                <item.icon size={22} className={isActive ? 'drop-shadow-[0_0_8px_rgba(0,209,255,0.8)]' : ''} />
                <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
        <a
          href="https://wa.me/5215512345678"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all text-white/40"
        >
          <MessageCircle size={22} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Soporte</span>
        </a>
      </nav>
    </div>
  );
}
