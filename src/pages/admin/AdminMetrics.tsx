import { useEffect, useState } from 'react';
import { BarChart3, Users, UserCheck, Eye, Percent, ArrowRight, TrendingUp } from 'lucide-react';
import { getAnalytics, resetAnalytics } from '../../lib/adminApi';

interface LandingStats {
  visits: number;
  leads: number;
  conversions: number;
}

interface AnalyticsData {
  stats: {
    salesPage: LandingStats;
    landingPage: LandingStats;
  };
  rawVisitsCount: number;
}

export default function AdminMetrics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  const loadData = () => {
    setLoading(true);
    getAnalytics()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReset = async () => {
    if (!confirm('¿Estás seguro de reiniciar todas las métricas de analítica? Esto borrará el registro de visitas, eliminará los leads registrados (no pagados) y limpiará la procedencia de los usuarios activos.')) {
      return;
    }
    
    setResetting(true);
    try {
      await resetAnalytics();
      loadData();
    } catch (err) {
      console.error(err);
      alert('Error al reiniciar métricas');
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-5 h-5 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return <p className="text-red-400">Error al cargar métricas de análisis</p>;

  const { salesPage, landingPage } = data.stats;

  // Calculations for Sales Page
  const salesPageModalRate = salesPage.visits > 0 ? ((salesPage.leads / salesPage.visits) * 100).toFixed(1) : '0.0';
  const salesPageLeadToSaleRate = salesPage.leads > 0 ? ((salesPage.conversions / salesPage.leads) * 100).toFixed(1) : '0.0';
  const salesPageGlobalRate = salesPage.visits > 0 ? ((salesPage.conversions / salesPage.visits) * 100).toFixed(1) : '0.0';

  // Calculations for Landing Page Clone
  const landingPageModalRate = landingPage.visits > 0 ? ((landingPage.leads / landingPage.visits) * 100).toFixed(1) : '0.0';
  const landingPageLeadToSaleRate = landingPage.leads > 0 ? ((landingPage.conversions / landingPage.leads) * 100).toFixed(1) : '0.0';
  const landingPageGlobalRate = landingPage.visits > 0 ? ((landingPage.conversions / landingPage.visits) * 100).toFixed(1) : '0.0';

  // Totals
  const totalVisits = salesPage.visits + landingPage.visits;
  const totalLeads = salesPage.leads + landingPage.leads;
  const totalSales = salesPage.conversions + landingPage.conversions;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white/90 tracking-wide flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-brand-blue" />
            Analytics & Métricas
          </h1>
          <p className="text-base text-white/30 mt-0.5">Comparativa de conversión de Landing Pages</p>
        </div>
        <button
          onClick={handleReset}
          disabled={resetting}
          className="px-4 py-2 rounded-lg text-sm font-semibold border border-red-500/30 text-red-400 bg-red-500/[0.04] hover:bg-red-500/[0.08] hover:border-red-500/50 active:scale-[0.98] transition-all disabled:opacity-30 disabled:pointer-events-none"
        >
          {resetting ? 'Reiniciando...' : 'Reiniciar Métricas'}
        </button>
      </div>

      {/* Global Counters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 flex items-center justify-between">
          <div>
            <div className="text-sm text-white/35 font-medium mb-1">Visitas Únicas Totales</div>
            <div className="text-3xl font-bold font-mono text-white/90">{totalVisits}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center">
            <Eye className="w-5 h-5 text-brand-blue" />
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center justify-between">
          <div>
            <div className="text-sm text-white/35 font-medium mb-1">Total Leads Capturados</div>
            <div className="text-3xl font-bold font-mono text-amber-500">{totalLeads}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-amber-500" />
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center justify-between">
          <div>
            <div className="text-sm text-white/35 font-medium mb-1">Ventas / Usuarios Activos</div>
            <div className="text-3xl font-bold font-mono text-brand-green">{totalSales}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-brand-green" />
          </div>
        </div>
      </div>

      {/* Comparisons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Landing (Root) */}
        <div className="glass-panel p-6 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-brand-blue/50" />
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white/90">Sales Page Principal</h2>
              <code className="text-xs text-brand-blue/60 font-mono">Ruta: /</code>
            </div>
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-blue/15 text-brand-blue border border-brand-blue/20">
              Original
            </span>
          </div>

          {/* Core Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/[0.015] border border-white/5 rounded-xl p-3 text-center">
              <div className="text-xs text-white/30 font-medium mb-0.5">Visitas</div>
              <div className="text-xl font-bold font-mono text-white/90">{salesPage.visits}</div>
            </div>
            <div className="bg-white/[0.015] border border-white/5 rounded-xl p-3 text-center">
              <div className="text-xs text-white/30 font-medium mb-0.5">Leads</div>
              <div className="text-xl font-bold font-mono text-amber-500">{salesPage.leads}</div>
            </div>
            <div className="bg-white/[0.015] border border-white/5 rounded-xl p-3 text-center">
              <div className="text-xs text-white/30 font-medium mb-0.5">Ventas</div>
              <div className="text-xl font-bold font-mono text-brand-green">{salesPage.conversions}</div>
            </div>
          </div>

          {/* Pipelines */}
          <div className="space-y-4 pt-3 border-t border-white/5">
            <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider">Tasas de Conversión</h3>
            
            {/* Visitas a Leads */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Conversión de Modal (Visitas → Leads)</span>
                <span className="font-mono text-amber-500 font-bold">{salesPageModalRate}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/[0.03] overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(parseFloat(salesPageModalRate), 100)}%` }} />
              </div>
            </div>

            {/* Leads a Ventas */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Efectividad de Venta (Leads → Ventas)</span>
                <span className="font-mono text-brand-green font-bold">{salesPageLeadToSaleRate}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/[0.03] overflow-hidden">
                <div className="h-full bg-brand-green rounded-full" style={{ width: `${Math.min(parseFloat(salesPageLeadToSaleRate), 100)}%` }} />
              </div>
            </div>

            {/* Global Conversion */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Rendimiento Global (Visitas → Ventas)</span>
                <span className="font-mono text-white/80 font-bold">{salesPageGlobalRate}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/[0.03] overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand-blue to-brand-green rounded-full" style={{ width: `${Math.min(parseFloat(salesPageGlobalRate) * 10, 100)}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Landing Page Clone (/landing) */}
        <div className="glass-panel p-6 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-purple-500/50" />
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white/90">Clon de Landing Page</h2>
              <code className="text-xs text-purple-400/60 font-mono">Ruta: /landing</code>
            </div>
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/20">
              Campañas
            </span>
          </div>

          {/* Core Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/[0.015] border border-white/5 rounded-xl p-3 text-center">
              <div className="text-xs text-white/30 font-medium mb-0.5">Visitas</div>
              <div className="text-xl font-bold font-mono text-white/90">{landingPage.visits}</div>
            </div>
            <div className="bg-white/[0.015] border border-white/5 rounded-xl p-3 text-center">
              <div className="text-xs text-white/30 font-medium mb-0.5">Leads</div>
              <div className="text-xl font-bold font-mono text-amber-500">{landingPage.leads}</div>
            </div>
            <div className="bg-white/[0.015] border border-white/5 rounded-xl p-3 text-center">
              <div className="text-xs text-white/30 font-medium mb-0.5">Ventas</div>
              <div className="text-xl font-bold font-mono text-brand-green">{landingPage.conversions}</div>
            </div>
          </div>

          {/* Pipelines */}
          <div className="space-y-4 pt-3 border-t border-white/5">
            <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider">Tasas de Conversión</h3>
            
            {/* Visitas a Leads */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Conversión de Modal (Visitas → Leads)</span>
                <span className="font-mono text-amber-500 font-bold">{landingPageModalRate}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/[0.03] overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(parseFloat(landingPageModalRate), 100)}%` }} />
              </div>
            </div>

            {/* Leads a Ventas */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Efectividad de Venta (Leads → Ventas)</span>
                <span className="font-mono text-brand-green font-bold">{landingPageLeadToSaleRate}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/[0.03] overflow-hidden">
                <div className="h-full bg-brand-green rounded-full" style={{ width: `${Math.min(parseFloat(landingPageLeadToSaleRate), 100)}%` }} />
              </div>
            </div>

            {/* Global Conversion */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Rendimiento Global (Visitas → Ventas)</span>
                <span className="font-mono text-white/80 font-bold">{landingPageGlobalRate}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/[0.03] overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-brand-green rounded-full" style={{ width: `${Math.min(parseFloat(landingPageGlobalRate) * 10, 100)}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Pipeline Funnel Comparison */}
      <div className="glass-panel p-6 space-y-4">
        <h2 className="text-lg font-bold text-white/90">Embudo de Conversión Comparativo</h2>
        <p className="text-sm text-white/30 -mt-2">Estructura visual de caída de tráfico por landing page</p>
        
        <div className="space-y-6 pt-2">
          {/* Sales Page Funnel */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm font-semibold">
              <span className="text-brand-blue">Sales Page Principal (/)</span>
              <span className="text-white/40">Visitas: {salesPage.visits} • Leads: {salesPage.leads} • Ventas: {salesPage.conversions}</span>
            </div>
            <div className="flex items-center gap-1.5 h-6 rounded-lg overflow-hidden bg-white/[0.02] border border-white/5 p-0.5">
              {salesPage.visits > 0 ? (
                <>
                  <div className="h-full bg-brand-blue/80 flex items-center justify-center text-[10px] font-mono font-bold text-[#060910] rounded" style={{ width: '45%' }}>
                    Tráfico
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-white/20 shrink-0" />
                  <div className="h-full bg-amber-500/80 flex items-center justify-center text-[10px] font-mono font-bold text-[#060910] rounded" style={{ width: `${Math.max(10, parseFloat(salesPageModalRate) * 0.45)}%` }}>
                    Leads ({salesPageModalRate}%)
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-white/20 shrink-0" />
                  <div className="h-full bg-brand-green/80 flex items-center justify-center text-[10px] font-mono font-bold text-[#060910] rounded" style={{ width: `${Math.max(8, parseFloat(salesPageGlobalRate) * 4.5)}%` }}>
                    Compraron ({salesPageGlobalRate}%)
                  </div>
                </>
              ) : (
                <div className="text-xs text-white/20 px-3">Sin visitas registradas</div>
              )}
            </div>
          </div>

          {/* Landing Page Funnel */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm font-semibold">
              <span className="text-purple-400">Landing Page Clon (/landing)</span>
              <span className="text-white/40">Visitas: {landingPage.visits} • Leads: {landingPage.leads} • Ventas: {landingPage.conversions}</span>
            </div>
            <div className="flex items-center gap-1.5 h-6 rounded-lg overflow-hidden bg-white/[0.02] border border-white/5 p-0.5">
              {landingPage.visits > 0 ? (
                <>
                  <div className="h-full bg-purple-500/80 flex items-center justify-center text-[10px] font-mono font-bold text-[#060910] rounded" style={{ width: '45%' }}>
                    Tráfico
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-white/20 shrink-0" />
                  <div className="h-full bg-amber-500/80 flex items-center justify-center text-[10px] font-mono font-bold text-[#060910] rounded" style={{ width: `${Math.max(10, parseFloat(landingPageModalRate) * 0.45)}%` }}>
                    Leads ({landingPageModalRate}%)
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-white/20 shrink-0" />
                  <div className="h-full bg-brand-green/80 flex items-center justify-center text-[10px] font-mono font-bold text-[#060910] rounded" style={{ width: `${Math.max(8, parseFloat(landingPageGlobalRate) * 4.5)}%` }}>
                    Compraron ({landingPageGlobalRate}%)
                  </div>
                </>
              ) : (
                <div className="text-xs text-white/20 px-3">Sin visitas registradas</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
