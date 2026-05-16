import { useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Webhook, LogOut, Shield, UserCog } from 'lucide-react';
import toast from 'react-hot-toast';
import { isAdminAuthenticated, logoutAdmin, getAdminInfo } from '../../lib/adminApi';
import { supabase } from '../../lib/supabase';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/usuarios', icon: Users, label: 'Usuarios' },
  { to: '/admin/webhooks', icon: Webhook, label: 'Webhooks' },
  { to: '/admin/configuracion', icon: UserCog, label: 'Admins', superadminOnly: true },
];

// Notification chirp via Web Audio API
function playNotificationSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    // Audio not available
  }
}

const PLATFORM_EMOJI: Record<string, string> = {
  hotmart: '🟠', whop: '🟣', efectivo: '💵', deposito: '🏦',
  transferencia: '💳', generic: '🔗', webhook: '🔗', unknown: '📦',
};

export default function AdminLayout() {
  const navigate = useNavigate();
  const channelRef = useRef<any>(null);
  const adminInfo = getAdminInfo();

  useEffect(() => {
    if (!isAdminAuthenticated() || !adminInfo) {
      logoutAdmin();
      navigate('/admin/login', { replace: true });
      return;
    }

    // Realtime INSERT on enrolled_users
    const channel = supabase
      .channel('admin-new-users')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'enrolled_users' },
        (payload: any) => {
          const user = payload.new;
          playNotificationSound();
          toast(
            (t) => (
              <div
                className="flex items-start gap-3 cursor-pointer"
                onClick={() => { toast.dismiss(t.id); navigate('/admin/usuarios'); }}
              >
                <span className="text-xl shrink-0 mt-0.5">
                  {PLATFORM_EMOJI[user.payment_platform || user.payment_method] || '💰'}
                </span>
                <div>
                  <div className="text-base font-bold" style={{ color: '#00D1FF' }}>Nuevo registro</div>
                  <div className="text-lg font-semibold" style={{ color: '#fff' }}>{user.name}</div>
                  <div className="text-sm font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>{user.email}</div>
                </div>
              </div>
            ),
            {
              duration: 6000,
              style: {
                background: '#0a0e17',
                border: '1px solid rgba(0,209,255,0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                padding: '14px 16px',
                maxWidth: '340px',
              },
            }
          );
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [navigate]);

  const handleLogout = () => {
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    logoutAdmin();
    navigate('/admin/login', { replace: true });
  };

  if (!isAdminAuthenticated() || !adminInfo) return null;

  // Filter nav items based on role
  const visibleNavItems = navItems.filter(item => {
    if (item.superadminOnly && adminInfo?.role !== 'superadmin') return false;
    return true;
  });

  return (
    <div className="min-h-dvh flex" style={{ background: '#060910' }}>
      {/* Sidebar — same background, border-only separation */}
      <aside
        className="hidden md:flex flex-col w-52 shrink-0 py-6 px-4"
        style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5 mb-10 px-1">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(0,209,255,0.08)', border: '1px solid rgba(0,209,255,0.15)' }}
          >
            <Shield className="w-3.5 h-3.5 text-brand-blue" />
          </div>
          <div>
            <div className="text-base font-bold tracking-[0.15em] text-white/90">GENY LAB</div>
            <div className="text-xs text-brand-blue/60 tracking-[0.1em] uppercase font-medium">Admin</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5">
          {visibleNavItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-base font-medium transition-all ${
                  isActive
                    ? 'text-brand-blue bg-brand-blue/[0.08]'
                    : 'text-white/35 hover:text-white/60 hover:bg-white/[0.03]'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Current admin info + Logout */}
        <div className="space-y-2">
          {adminInfo && (
            <div className="px-3 py-2">
              <div className="text-xs font-semibold text-white/50 truncate">
                {adminInfo.display_name || adminInfo.username}
              </div>
              <div className="text-[10px] font-mono text-white/25 truncate">
                @{adminInfo.username}
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-base font-medium text-white/25 hover:text-red-400/80 hover:bg-red-500/[0.05] transition-all w-full"
          >
            <LogOut className="w-4 h-4" />
            Salir
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-50"
        style={{
          background: 'rgba(6,9,16,0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-blue" />
            <span className="text-sm font-bold tracking-[0.15em] text-white/80">ADMIN</span>
            {adminInfo && (
              <span className="text-xs text-white/30 font-mono">• @{adminInfo.username}</span>
            )}
          </div>
          <button onClick={handleLogout} className="text-white/25 hover:text-red-400/80">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
        <nav className="flex gap-0.5 px-3 pb-2">
          {visibleNavItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive ? 'bg-brand-blue/[0.08] text-brand-blue' : 'text-white/30'
                }`
              }
            >
              <item.icon className="w-3.5 h-3.5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <main className="flex-1 min-h-dvh overflow-x-hidden p-5 md:p-8 pt-28 md:pt-8">
        <Outlet />
      </main>
    </div>
  );
}
