import { useEffect, useState } from 'react';
import { Users, TrendingUp, Activity, Copy, Check, Link2, ArrowRight } from 'lucide-react';
import { getStats } from '../../lib/adminApi';

const ACTIVITY_LABELS: Record<string, string> = {
  adn: '🧬 ADN', gastos: '🐜 Gastos', termostato: '🌡️ Termostato',
  trampas: '🧠 Trampas', pedem: '📋 PEDEM', sombra: '🤯 Emociones',
  flow: '⚡ Flow', geny: '🎯 Geny Options',
};

const PAYMENT_LABELS: Record<string, string> = {
  efectivo: '💵 Efectivo', deposito: '🏦 Depósito', transferencia: '💳 Transferencia',
  hotmart: '🟠 Hotmart', whop: '🟣 Whop', webhook: '🔗 Webhook', otro: '📦 Otro',
};

interface Stats {
  totalUsers: number;
  activeUsers: number;
  usersThisWeek: number;
  usersThisMonth: number;
  paymentDistribution: Record<string, number>;
  activityDistribution: Record<string, number>;
  totalActivities: number;
  hotUsers: number;
  recentUsers: any[];
}

const WEBHOOK_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/payment-webhook`;

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getStats().then(setStats).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-5 h-5 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) return <p className="text-red-400">Error cargando datos</p>;

  const maxActivity = Math.max(...Object.values(stats.activityDistribution), 1);
  const conversionRate = stats.totalUsers > 0
    ? Math.round((stats.hotUsers / stats.totalUsers) * 100)
    : 0;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white/90 tracking-wide">Dashboard</h1>
        <p className="text-base text-white/30 mt-0.5">Panel de administración</p>
      </div>

      {/* ── Webhook URL ── */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl"
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <Link2 className="w-4 h-4 text-white/25 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-base text-white/35 font-medium mb-0.5">Webhook URL para Hotmart / Whop</div>
          <code className="text-lg font-mono text-white/60 truncate block select-all">{WEBHOOK_URL}</code>
        </div>
        <button
          onClick={() => { navigator.clipboard.writeText(WEBHOOK_URL); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className="shrink-0 p-2 rounded-lg transition-all"
          style={{
            background: copied ? 'rgba(0,230,118,0.08)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${copied ? 'rgba(0,230,118,0.2)' : 'rgba(255,255,255,0.06)'}`,
            color: copied ? '#00E676' : 'rgba(255,255,255,0.3)',
          }}
          title="Copiar URL"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {/* ── Conversion Funnel ── */}
      <div className="glass-panel p-6">
        {/* Hero metric + supporting stats */}
        <div className="flex items-end gap-8 mb-6">
          {/* Hero */}
          <div>
            <div className="text-lg text-white/35 font-medium mb-1">Total Usuarios</div>
            <div className="text-[5rem] font-bold font-mono text-white/90 leading-none">{stats.totalUsers}</div>
          </div>

          {/* Supporting metrics */}
          <div className="flex gap-6 pb-1">
            <div>
              <div className="text-base text-white/30 mb-0.5">Activos</div>
              <div className="text-2xl font-bold font-mono text-brand-green">{stats.activeUsers}</div>
            </div>
            <div>
              <div className="text-base text-white/30 mb-0.5">Esta semana</div>
              <div className="text-2xl font-bold font-mono text-white/70">{stats.usersThisWeek}</div>
            </div>
            <div>
              <div className="text-base text-white/30 mb-0.5">Este mes</div>
              <div className="text-2xl font-bold font-mono text-white/70">{stats.usersThisMonth}</div>
            </div>
          </div>
        </div>

        {/* Pipeline: Total → Active → HOT */}
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-white/30" />
            <span className="text-lg font-mono text-white/50">{stats.totalUsers}</span>
            <span className="text-base text-white/25">registros</span>
          </div>
          <ArrowRight className="w-4 h-4 text-white/15" />
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-green/70" />
            <span className="text-lg font-mono text-brand-green">{stats.activeUsers}</span>
            <span className="text-base text-white/25">activos</span>
          </div>
          <ArrowRight className="w-4 h-4 text-white/15" />
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-400/80" />
            <span className="text-lg font-mono text-orange-400 font-bold">{stats.hotUsers}</span>
            <span className="text-base text-orange-400/50 font-medium">HOT 🔥</span>
          </div>

          {/* Conversion rate */}
          <div className="ml-auto flex items-center gap-2">
            <div
              className="h-1.5 w-20 rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${conversionRate}%`,
                  background: 'linear-gradient(90deg, #00E676, #FF6321)',
                }}
              />
            </div>
            <span className="text-base font-mono text-white/30">{conversionRate}%</span>
          </div>
        </div>
      </div>

      {/* ── Distribution Cards ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Payment Distribution */}
        <div className="glass-panel p-5">
          <h2 className="text-lg font-semibold text-white/50 mb-4">Métodos de Pago</h2>
          <div className="space-y-3">
            {Object.entries(stats.paymentDistribution).map(([key, count]) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-lg text-white/50 w-28 truncate">{PAYMENT_LABELS[key] || key}</span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(count / stats.totalUsers) * 100}%`,
                      background: 'rgba(0,209,255,0.5)',
                    }}
                  />
                </div>
                <span className="text-lg font-mono text-white/60 w-8 text-right font-medium">{count}</span>
              </div>
            ))}
            {Object.keys(stats.paymentDistribution).length === 0 && (
              <p className="text-lg text-white/20 text-center py-6">Sin datos aún</p>
            )}
          </div>
        </div>

        {/* Activity Distribution */}
        <div className="glass-panel p-5">
          <h2 className="text-lg font-semibold text-white/50 mb-4">
            Actividades Completadas <span className="text-white/25 font-mono">({stats.totalActivities})</span>
          </h2>
          <div className="space-y-3">
            {Object.entries(stats.activityDistribution).sort((a, b) => b[1] - a[1]).map(([key, count]) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-lg text-white/50 w-28 truncate">{ACTIVITY_LABELS[key] || key}</span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(count / maxActivity) * 100}%`,
                      background: 'rgba(0,230,118,0.45)',
                    }}
                  />
                </div>
                <span className="text-lg font-mono text-white/60 w-8 text-right font-medium">{count}</span>
              </div>
            ))}
            {Object.keys(stats.activityDistribution).length === 0 && (
              <p className="text-lg text-white/20 text-center py-6">Sin datos aún</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Recent Users ── */}
      <div className="glass-panel p-5">
        <h2 className="text-lg font-semibold text-white/50 mb-4">Últimos Registros</h2>
        {stats.recentUsers.length === 0 ? (
          <p className="text-lg text-white/20 text-center py-8">Sin registros aún</p>
        ) : (
          <div className="space-y-2">
            {stats.recentUsers.map((u: any) => (
              <div
                key={u.id}
                className="flex items-center justify-between rounded-xl px-4 py-3"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
              >
                <div>
                  <div className="text-lg font-semibold text-white/80">{u.name}</div>
                  <div className="text-base text-white/35 font-mono">{u.email}</div>
                </div>
                <div className="text-right">
                  <div className="text-base text-white/40">{PAYMENT_LABELS[u.payment_method] || u.payment_method}</div>
                  <div className="text-sm text-white/25 font-mono mt-0.5">{new Date(u.created_at).toLocaleDateString('es-MX')}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
