// @ts-nocheck
import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft, ChevronRight, ChevronDown, CheckCircle2, Lock, Unlock,
  Share2, Copy, Check, Trophy, Target, BarChart3, Bot, Zap,
  TrendingUp, TrendingDown, Wallet, Clock, Crosshair, BookOpen,
  Briefcase, History, Brain, ArrowRight, RefreshCcw,
  MessageCircle,   X as XIcon,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import confetti from "canvas-confetti";
import CompletionBanner from '../../components/CompletionBanner';

/* ═══════════════════════════════════════════════════════════════════════════
   BLACK-SCHOLES ENGINE
   ═══════════════════════════════════════════════════════════════════════════ */

function ncdf(x: number) {
  const a = [0.254829592, -0.284496736, 1.421413741, -1.453152027, 1.061405429], p = 0.3275911;
  const s = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.SQRT2;
  const t = 1 / (1 + p * x);
  return 0.5 * (1 + s * (1 - (((((a[4] * t + a[3]) * t + a[2]) * t + a[1]) * t + a[0]) * t * Math.exp(-x * x))));
}

function bsp(S: number, K: number, T: number, type: string, σ = 0.20, r = 0.05) {
  if (T <= 0) return type === 'call' ? Math.max(0, S - K) : Math.max(0, K - S);
  const sq = Math.sqrt(T), d1 = (Math.log(S / K) + (r + σ * σ / 2) * T) / (σ * sq), d2 = d1 - σ * sq;
  return type === 'call'
    ? Math.max(0.01, S * ncdf(d1) - K * Math.exp(-r * T) * ncdf(d2))
    : Math.max(0.01, K * Math.exp(-r * T) * ncdf(-d2) - S * ncdf(-d1));
}

function bsg(S: number, K: number, T: number, type: string, σ = 0.20, r = 0.05) {
  if (T <= 0) return { d: type === 'call' ? (S >= K ? 1 : 0) : (S <= K ? -1 : 0), g: 0, t: 0, v: 0 };
  const sq = Math.sqrt(T), d1 = (Math.log(S / K) + (r + σ * σ / 2) * T) / (σ * sq), d2 = d1 - σ * sq;
  const φ = Math.exp(-d1 * d1 / 2) / Math.sqrt(2 * Math.PI), nd1 = ncdf(d1);
  return {
    d: parseFloat((type === 'call' ? nd1 : nd1 - 1).toFixed(3)),
    g: parseFloat((φ / (S * σ * sq)).toFixed(5)),
    t: parseFloat(((type === 'call' ? -S * φ * σ / (2 * sq) - r * K * Math.exp(-r * T) * ncdf(d2) : -S * φ * σ / (2 * sq) + r * K * Math.exp(-r * T) * ncdf(-d2)) / 365).toFixed(3)),
    v: parseFloat((S * φ * sq / 100).toFixed(3))
  };
}

const f$ = (n: number, d = 2) => `${n >= 0 ? '' : '-'}$${Math.abs(n).toFixed(d)}`;

/* ═══════════════════════════════════════════════════════════════════════════
   SYMBOL DATA
   ═══════════════════════════════════════════════════════════════════════════ */

const SYMBOLS: Record<string, any> = {
  SPX: { label: 'SPX', name: 'S&P 500 Index', cat: 'Índice', price: 5520, iv: 0.17, step: 25, vol: 0.012, col: '#3b82f6', desc: 'El índice más operado del mundo.' },
  XSP: { label: 'XSP', name: 'Mini S&P 500', cat: 'Mini', price: 552, iv: 0.17, step: 5, vol: 0.012, col: '#8b5cf6', desc: 'Versión 1/10 del SPX.' },
  SPY: { label: 'SPY', name: 'S&P 500 ETF', cat: 'ETF', price: 551, iv: 0.16, step: 5, vol: 0.011, col: '#10b981', desc: 'ETF más líquido del mundo.' },
  QQQ: { label: 'QQQ', name: 'Nasdaq 100 ETF', cat: 'ETF', price: 478, iv: 0.22, step: 5, vol: 0.016, col: '#f59e0b', desc: 'Exposición a las 100 mayores tech.' },
  GLD: { label: 'GLD', name: 'Gold ETF', cat: 'Metales', price: 231, iv: 0.14, step: 2, vol: 0.008, col: '#d4a017', desc: 'Replica el precio del oro físico.' },
};

/* ═══════════════════════════════════════════════════════════════════════════
   LESSONS
   ═══════════════════════════════════════════════════════════════════════════ */

const LECCIONES = [
  { tier: 1, id: 'c1', icon: '🎯', title: '¿Qué Es una Opción?', tag: 'FUNDAMENTO', tagCol: '#3b82f6',
    concept: 'Una opción es un contrato que te da el DERECHO — no la obligación — de comprar o vender 100 acciones a un precio fijo antes de una fecha determinada.',
    explain: 'Piénsalo como una reserva en un restaurante. Pagas una pequeña cuota para asegurar tu mesa al precio de hoy. Si cambias de opinión, pierdes solo la reserva.',
    example: 'SPY está en $551. Compras un CALL en el strike $560 por $3,00.\n  • Pagaste: $3 × 100 = $300\n  • Si SPY sube a $575 → opción vale $15 → ganancia: $1.200\n  • Si SPY se queda bajo $560 → pérdida máxima: $300',
    rule: '1 contrato = 100 acciones · Pérdida máxima en opción larga = prima pagada' },
  { tier: 1, id: 'c2', icon: '📊', title: 'Calls vs. Puts', tag: 'FUNDAMENTO', tagCol: '#3b82f6',
    concept: 'Los CALLS ganan cuando el precio SUBE. Los PUTS ganan cuando el precio BAJA.',
    explain: 'Un call es una apuesta alcista. Un put es una apuesta bajista. Ambos son herramientas — ninguno es inherentemente peligroso.',
    example: 'SPY en $551:\n  • COMPRAR CALL $560 por $2,50 → necesitas SPY > $562,50\n  • COMPRAR PUT $540 por $2,50 → necesitas SPY < $537,50',
    rule: 'Calls = derecho a COMPRAR · Puts = derecho a VENDER · Verde = calls · Rojo = puts' },
  { tier: 1, id: 'c3', icon: '💡', title: 'Strike, Vencimiento y Moneyness', tag: 'FUNDAMENTO', tagCol: '#3b82f6',
    concept: 'El strike es tu objetivo. El vencimiento es tu fecha límite. El moneyness te dice qué tan cerca estás.',
    explain: 'ITM = la opción ya tiene valor real. ATM = strike más cercano al precio actual. OTM = opciones baratas que necesitan un movimiento mayor.',
    example: 'SPY en $551:\n  • CALL $530 → ITM (tiene valor intrínseco)\n  • CALL $550 → ATM (mayor gamma)\n  • CALL $575 → OTM (barato, menor probabilidad)',
    rule: 'ITM = valor intrínseco · ATM = mayor gamma · OTM = barato pero menor probabilidad' },
  { tier: 1, id: 'c4', icon: '💰', title: 'Cómo Funciona el P&L', tag: 'FUNDAMENTO', tagCol: '#3b82f6',
    concept: 'Las opciones son apalancadas. Un pequeño movimiento en la acción = un gran movimiento porcentual en la opción.',
    explain: 'La fórmula: (Precio Venta − Precio Compra) × 100 × contratos.',
    example: 'Compras 2x CALL SPY $550 a $5,00:\n  • Costo: $5 × 100 × 2 = $1.000\n  • SPY sube a $565, opción vale $8:\n  • P&L: +$600 (+60%)',
    rule: 'P&L = (Salida − Entrada) × 100 × contratos' },
  { tier: 2, id: 'c5', icon: '⚡', title: 'Delta — Medidor Direccional', tag: 'GRIEGAS', tagCol: '#8b5cf6',
    concept: 'Delta te dice cuánto se mueve el precio de tu opción por cada $1 que se mueve el subyacente.',
    explain: 'Δ 0,50 = tu call gana ~$0,50 por cada $1 que sube. Delta también es la probabilidad aproximada de expirar ITM.',
    example: 'QQQ sube $5:\n  • Δ 0,80 call → gana ~$4,00 (+$400/contrato)\n  • Δ 0,30 call → gana ~$1,50 (+$150/contrato)\n  • Δ 0,05 call → gana ~$0,25 (+$25/contrato)',
    rule: 'Delta 0,50 = ATM · 0,80+ = deep ITM · 0,20− = OTM lejano' },
  { tier: 2, id: 'c6', icon: '⏳', title: 'Theta — El Tiempo Corre', tag: 'GRIEGAS', tagCol: '#8b5cf6',
    concept: 'Theta es el monto en dólares que pierde una opción diariamente solo por el paso del tiempo.',
    explain: 'Cada día que pasa, tu opción pierde valor. Es el enemigo del comprador y el aliado del vendedor.',
    example: 'Compras SPX CALL $5500 por $50,00 con theta = -2,50:\n  • Día 1: ~$47,50\n  • Día 5: ~$37,50\n  • El decaimiento se ACELERA en los últimos 30 días.',
    rule: 'Opciones largas PIERDEN theta · Opciones cortas GANAN theta · ATM = mayor theta' },
  { tier: 2, id: 'c7', icon: '🌊', title: 'Vega — Volatilidad', tag: 'GRIEGAS', tagCol: '#8b5cf6',
    concept: 'Vega mide cuánto cambia el precio de tu opción cuando la IV se mueve un 1%.',
    explain: 'Cuando el mercado se asusta, la IV sube e infla las primas. Cuando se calma, las aplasta (IV crush).',
    example: 'GLD CALL con vega = 0,15 y IV en 14%:\n  • IV sube a 19% → opción gana +$0,75/acción (+$75)\n  • IV cae a 9% → opción pierde -$0,75/acción (-$75)',
    rule: 'IV subiendo → opciones largas suben · IV bajando → opciones largas caen' },
  { tier: 2, id: 'c8', icon: '💸', title: 'Vender para Cobrar Prima', tag: 'ESTRATEGIA', tagCol: '#8b5cf6',
    concept: 'Cuando VENDES una opción, cobras la prima por adelantado. Ganas si expira sin valor.',
    explain: 'Los vendedores son como compañías de seguros. Cobran primas consistentes y ganan cuando no pasa nada dramático.',
    example: 'VENDES QQQ CALL $490 por $3,00 (QQQ en $478):\n  • Recibes: $300\n  • Si QQQ < $490 → expira sin valor → te quedas $300 ✅\n  • Si QQQ sube a $510 → pérdida de $1.700',
    rule: 'Ganas en mercados en rango · Limita pérdida comprando de vuelta si excede 2× prima' },
  { tier: 3, id: 'c9', icon: '📐', title: 'Spreads Verticales', tag: 'ESTRATEGIAS', tagCol: '#10b981',
    concept: 'Comprar + vender en strikes diferentes (mismo vencimiento) = riesgo y ganancia definidos.',
    explain: 'Al vender contra tu posición larga, reduces costo pero limitas ganancia máxima.',
    example: 'Bull Call Spread en SPY $551:\n  • COMPRAR CALL $550 @ $5,00\n  • VENDER CALL $560 @ $2,50\n  • Costo (pérdida máx): $250\n  • Ganancia máxima: $750\n  • Riesgo/Recompensa: 1:3',
    rule: 'Pérdida máx = débito neto · Ganancia máx = ancho del spread − débito' },
  { tier: 3, id: 'c10', icon: '🐻', title: 'Bear Put Spread', tag: 'ESTRATEGIAS', tagCol: '#10b981',
    concept: 'Estrategia bajista de riesgo definido: compra put alto, vende put bajo.',
    explain: 'En lugar de comprar un put desnudo (costoso), vendes un strike inferior para compensar.',
    example: 'Bear Put Spread en QQQ $478:\n  • COMPRAR PUT $475 @ $4,00\n  • VENDER PUT $465 @ $1,50\n  • Costo (pérdida máx): $250\n  • Ganancia máxima: $750',
    rule: 'Spread bajista · Menor costo que put directo' },
  { tier: 3, id: 'c11', icon: '🏦', title: 'Cash-Secured Put (CSP)', tag: 'INGRESOS', tagCol: '#10b981',
    concept: 'Vende un put por debajo del precio actual, cobra prima. Si te asignan, compras a descuento.',
    explain: 'Es como decir: "Estoy feliz de comprar SPY a $530. Págame $3 ahora por ese derecho."',
    example: 'SPY en $551. Vendes PUT $530 por $2,50:\n  • Recibes: $250\n  • SPY > $530 → te quedas $250 ✅\n  • SPY cae a $520 → compras a $530 (costo efectivo: $527,50)',
    rule: 'Solo vende CSPs en activos que QUIERES poseer · Reserva efectivo para el strike' },
];

/* ═══════════════════════════════════════════════════════════════════════════
   MISSION TIERS
   ═══════════════════════════════════════════════════════════════════════════ */

const TIERS = [
  { id: 1, name: 'Principiante', icon: '🌱', col: '#3b82f6', missions: [
    { id: 'r1', xp: 100, title: 'Compra tu Primer Call', desc: 'Adquiere 1 contrato call.', ok: (t: any[]) => t.some(x => x.ot === 'call' && x.side === 'buy') },
    { id: 'r2', xp: 100, title: 'Compra tu Primer Put', desc: 'Adquiere 1 contrato put.', ok: (t: any[]) => t.some(x => x.ot === 'put' && x.side === 'buy') },
    { id: 'r3', xp: 150, title: 'Cierra una Posición', desc: 'Vende una opción que ya tienes.', ok: (t: any[]) => t.some(x => x.isClose) },
    { id: 'r4', xp: 200, title: 'Registra una Ganancia', desc: 'Cierra con ganancia.', ok: (t: any[]) => t.some(x => x.pnl && x.pnl > 0) },
  ] },
  { id: 2, name: 'Aprendiz', icon: '📚', col: '#8b5cf6', missions: [
    { id: 'a1', xp: 200, title: 'ITM Profundo (Δ > 0.65)', desc: 'Compra opción con delta > 0.65.', ok: (t: any[]) => t.some(x => Math.abs(x.delta || 0) > 0.65) },
    { id: 'a2', xp: 200, title: 'Vende para Cobrar Prima', desc: 'Vende un call o put.', ok: (t: any[]) => t.some(x => x.side === 'sell' && !x.isClose) },
    { id: 'a3', xp: 250, title: 'Hito de 5 Operaciones', desc: 'Ejecuta 5 operaciones.', ok: (t: any[]) => t.length >= 5 },
    { id: 'a4', xp: 300, title: 'Retorno del 25%+', desc: 'Cierra con 25%+ de ganancia.', ok: (t: any[]) => t.some(x => x.pnlPct && x.pnlPct >= 25) },
  ] },
  { id: 3, name: 'Trader', icon: '💹', col: '#10b981', missions: [
    { id: 't1', xp: 350, title: 'Bull Call Spread', desc: 'Compra call + vende call mayor.', ok: (_: any, pos: any[]) => { const c = pos.filter(p => p.ot === 'call'); return c.some(p => p.side === 'buy') && c.some(p => p.side === 'sell'); } },
    { id: 't2', xp: 350, title: 'Bear Put Spread', desc: 'Compra put + vende put menor.', ok: (_: any, pos: any[]) => { const p = pos.filter(x => x.ot === 'put'); return p.some(x => x.side === 'buy') && p.some(x => x.side === 'sell'); } },
    { id: 't3', xp: 300, title: 'Cash-Secured Put', desc: 'Vende un put por debajo del precio.', ok: (t: any[]) => t.some(x => x.ot === 'put' && x.side === 'sell' && !x.isClose) },
    { id: 't4', xp: 400, title: 'P&L Total de $500+', desc: 'Acumula $500+ en ganancias.', ok: (t: any[]) => { const tot = t.filter(x => x.pnl).reduce((s: number, x: any) => s + x.pnl, 0); return tot >= 500; } },
  ] },
];

/* ═══════════════════════════════════════════════════════════════════════════
   LESSON CARD COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

function TarjetaLeccion({ leccion, onPractice }: { leccion: any; onPractice: () => void }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="glass-panel overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-5 flex items-center gap-4 hover:bg-white/[0.03] transition-colors"
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
          style={{ background: `${leccion.tagCol}15`, border: `1px solid ${leccion.tagCol}30` }}>
          {leccion.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: leccion.tagCol }}>{leccion.tag}</div>
          <div className="font-black text-base uppercase tracking-tight text-white truncate">{leccion.title}</div>
        </div>
        <ChevronDown className={`w-4 h-4 text-brand-text-muted transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-5 pb-5 space-y-3">
              {/* Concept */}
              <div className="rounded-xl p-3" style={{ background: `${leccion.tagCol}10`, border: `1px solid ${leccion.tagCol}20` }}>
                <div className="text-xs font-black uppercase tracking-widest mb-1.5" style={{ color: leccion.tagCol }}>CONCEPTO CLAVE</div>
                <p className="text-white text-sm leading-relaxed font-medium">{leccion.concept}</p>
              </div>

              {/* Explanation */}
              <div>
                <div className="text-xs font-black uppercase tracking-widest mb-1.5 text-brand-text-muted">EN PALABRAS SIMPLES</div>
                <p className="text-slate-400 text-sm leading-relaxed">{leccion.explain}</p>
              </div>

              {/* Example */}
              <div className="rounded-xl p-3 bg-white/[0.02] border border-white/5">
                <div className="text-xs font-black uppercase tracking-widest mb-1.5 text-amber-400">📊 EJEMPLO REAL</div>
                <pre className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap font-mono">{leccion.example}</pre>
              </div>

              {/* Rule */}
              <div className="rounded-xl p-3 bg-brand-green/5 border border-brand-green/10">
                <div className="text-xs font-black uppercase tracking-widest mb-1 text-brand-green">✅ REGLA CLAVE</div>
                <p className="text-brand-green/80 text-sm leading-relaxed">{leccion.rule}</p>
              </div>

              {/* CTA */}
              <button onClick={onPractice}
                className="w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: `linear-gradient(135deg, ${leccion.tagCol}, ${leccion.tagCol}99)` }}>
                🎯 Practicar en el Simulador →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

export default function GenyOpciones() {
  const user = { id: "local-user" };
  const navigate = useNavigate();
  const userName = 'Trader'?.split(" ")[0] || "Trader";

  // ── State ──
  const [loading, setLoading] = useState(true);
  const [sym, setSym] = useState('SPY');
  const [spot, setSpot] = useState(SYMBOLS.SPY.price);
  const [prevSpot, setPrevSpot] = useState(SYMBOLS.SPY.price);
  const [σ, setσ] = useState(SYMBOLS.SPY.iv);
  const [dte, setDte] = useState(14);
  const [cash, setCash] = useState(25000);
  const [positions, setPositions] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [sel, setSel] = useState<{ strike: number; ot: string } | null>(null);
  const [oSide, setOSide] = useState('buy');
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<'learn' | 'chain' | 'positions' | 'history'>('learn');
  const [tierLearn, setTierLearn] = useState(1);
  const [mTab, setMTab] = useState(1);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [xp, setXp] = useState(0);
  const [aiMsg, setAiMsg] = useState('¡Bienvenido a la Academia de Opciones Geny! 🎓\n\nEmpieza en Aprender para dominar los conceptos, luego ve a la Cadena para practicar.\n\nSelecciona tu activo arriba y ¡a operar!');
  const [aiLoad, setAiLoad] = useState(false);
  const [dia, setDia] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const [showOrder, setShowOrder] = useState(false);
  const [chainGlow, setChainGlow] = useState(false);

  // Navigate to chain tab with a glow effect to guide the user
  const goToChain = () => {
    setTab('chain');
    setChainGlow(true);
    setTimeout(() => setChainGlow(false), 2000);
  };

  const SD = SYMBOLS[sym];
  const saveTimeout = useRef<any>(null);

  // ── Load saved progress ──
  useEffect(() => {
    try {
      const saved = localStorage.getItem('geny-opciones-progress');
      if (saved) {
        const r = JSON.parse(saved);
        if (r.done) setDone(new Set(r.done));
        if (r.xp != null) setXp(r.xp);
        if (r.cash != null) setCash(r.cash);
        if (r.positions) setPositions(r.positions);
        if (r.trades) setTrades(r.trades);
        if (r.dia != null) setDia(r.dia);
        if (r.dte != null) setDte(r.dte);
      }
    } catch (e) {
      console.error('Error loading opciones progress:', e);
    }
    setLoading(false);
  }, []);

  // ── Persist to localStorage (debounced) ──
  const saveState = (overrides: any = {}) => {
    try {
      const current = {
        done: Array.from(done),
        xp, cash, positions, trades, dia, dte,
        ...overrides,
      };
      // Convert Set if passed as override
      if (overrides.done instanceof Set) {
        current.done = Array.from(overrides.done);
      }
      localStorage.setItem('geny-opciones-progress', JSON.stringify(current));
    } catch (e) {
      console.error('Error saving opciones progress:', e);
    }
  };

  // ── Symbol change ──
  useEffect(() => {
    const s = SYMBOLS[sym];
    setSpot(s.price + (Math.random() - 0.5) * s.price * 0.01);
    setPrevSpot(s.price);
    setσ(s.iv);
    setPositions([]);
    setSel(null);
    setDte(14);
  }, [sym]);

  // ── Portfolio value ──
  const posValue = useMemo(() => positions.reduce((s, p) => {
    const T = Math.max(0.001, p.dte / 365);
    const curr = bsp(spot, p.strike, T, p.ot, σ);
    return s + (p.side === 'buy' ? 1 : -1) * curr * 100 * p.qty;
  }, 0), [positions, spot, σ]);

  const equity = cash + posValue;
  const totalPnL = equity - 25000;

  // ── Mission checking ──
  useEffect(() => {
    const nd = new Set(done);
    let nxp = xp;
    const ganadas: any[] = [];
    TIERS.forEach(t => t.missions.forEach(m => {
      if (!nd.has(m.id) && m.ok(trades, positions)) {
        nd.add(m.id);
        nxp += m.xp;
        ganadas.push(m);
      }
    }));
    if (ganadas.length) {
      setDone(nd);
      setXp(nxp);
      const last = ganadas[ganadas.length - 1];
      showToast(`🏆 Misión: ${last.title}  +${last.xp} XP`);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 }, colors: ['#00E676', '#00D1FF', '#FEDD04'] });
      saveState({ done: nd, xp: nxp });
    }
  }, [trades, positions]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  // ── Option chain ──
  const strikes = useMemo(() => {
    const step = SD.step, b = Math.round(spot / step) * step;
    return Array.from({ length: 15 }, (_, i) => b - step * 7 + i * step);
  }, [spot, sym]);

  const chain = useMemo(() => strikes.map(K => {
    const T = Math.max(0.001, dte / 365), skew = σ * (1 + 0.12 * Math.max(0, (spot - K) / spot));
    const cp = bsp(spot, K, T, 'call', σ), pp = bsp(spot, K, T, 'put', skew);
    const cg = bsg(spot, K, T, 'call', σ), pg = bsg(spot, K, T, 'put', skew);
    return {
      K, c: { p: cp, bid: (cp * .979).toFixed(2), ask: (cp * 1.021).toFixed(2), ...cg, iv: (σ * 100).toFixed(1) },
      p: { p: pp, bid: (pp * .979).toFixed(2), ask: (pp * 1.021).toFixed(2), ...pg, iv: (skew * 100).toFixed(1) },
      atm: Math.abs(K - spot) < SD.step * .6, itmc: spot >= K, itmp: spot <= K
    };
  }), [strikes, spot, σ, dte, sym]);

  // ── Payoff chart ──
  const payoff = useMemo(() => {
    if (!positions.length) return [];
    return Array.from({ length: 61 }, (_, i) => {
      const s = spot * 0.65 + i * (spot * 0.70 / 60);
      const pl = positions.reduce((sum: number, p: any) => {
        const ev = p.ot === 'call' ? Math.max(0, s - p.strike) : Math.max(0, p.strike - s);
        return sum + (p.side === 'buy' ? (ev - p.avg) : (p.avg - ev)) * 100 * p.qty;
      }, 0);
      return { s: s.toFixed(0), pnl: parseFloat(pl.toFixed(0)) };
    });
  }, [positions, spot]);

  // ── Selected strike info ──
  const selInfo = useMemo(() => {
    if (!sel) return null;
    const T = Math.max(0.001, dte / 365);
    return { px: bsp(spot, sel.strike, T, sel.ot, σ), g: bsg(spot, sel.strike, T, sel.ot, σ) };
  }, [sel, spot, σ, dte]);

  // ── Advance day ──
  const avanzarDia = () => {
    setPrevSpot(spot);
    const newSpot = parseFloat(Math.max(spot * .85, Math.min(spot * 1.15, spot + (Math.random() - .47) * spot * SD.vol)).toFixed(sym === 'SPX' ? 0 : 2));
    setSpot(newSpot);
    const newIV = parseFloat(Math.max(0.08, Math.min(0.70, σ + (Math.random() - .5) * .02)).toFixed(3));
    setσ(newIV);
    const newDte = Math.max(0, dte - 1);
    setDte(newDte);
    const newDia = dia + 1;
    setDia(newDia);
    saveState({ dia: newDia, dte: newDte });
  };

  // ── Execute order ──
  const ejecutarOrden = () => {
    if (!sel) return;
    const T = Math.max(0.001, dte / 365), raw = bsp(spot, sel.strike, T, sel.ot, σ);
    const px = oSide === 'buy' ? raw * 1.018 : raw * 0.982;
    const cost = parseFloat((px * 100 * qty).toFixed(2));
    const g = bsg(spot, sel.strike, T, sel.ot, σ);

    if (oSide === 'buy' && cost > cash) { showToast('❌ Fondos insuficientes!'); return; }

    const opp = oSide === 'buy' ? 'sell' : 'buy';
    const xi = positions.findIndex(p => p.strike === sel.strike && p.ot === sel.ot && p.side === opp);
    let pnl = null, pnlPct = null, isClose = false;
    let newPositions = [...positions];
    let newCash = cash;

    if (xi >= 0) {
      isClose = true;
      const ex = positions[xi], cq = Math.min(qty, ex.qty);
      pnl = parseFloat(((oSide === 'sell' ? (px - ex.avg) : (ex.avg - px)) * 100 * cq).toFixed(2));
      pnlPct = parseFloat(((pnl / (ex.avg * 100 * cq)) * 100).toFixed(1));
      newPositions = cq >= ex.qty ? positions.filter((_, i) => i !== xi) : positions.map((x, i) => i === xi ? { ...x, qty: x.qty - cq } : x);
    } else {
      const si = positions.findIndex(p => p.strike === sel.strike && p.ot === sel.ot && p.side === oSide);
      if (si >= 0) {
        newPositions = positions.map((x, i) => i === si ? { ...x, qty: x.qty + qty, avg: (x.avg * x.qty + px * qty) / (x.qty + qty) } : x);
      } else {
        newPositions = [...positions, { id: Date.now(), strike: sel.strike, ot: sel.ot, side: oSide, qty, avg: parseFloat(px.toFixed(3)), dte, ...g, sym }];
      }
    }

    newCash = parseFloat((cash + (oSide === 'buy' ? -cost : cost)).toFixed(2));
    setPositions(newPositions);
    setCash(newCash);

    const trade = { id: Date.now(), sym, strike: sel.strike, ot: sel.ot, side: oSide, qty, price: parseFloat(px.toFixed(2)), cost, pnl, pnlPct, isClose, delta: g.d, time: new Date().toLocaleTimeString() };
    const newTrades = [trade, ...trades];
    setTrades(newTrades);

    getAI(trade);
    saveState({ cash: newCash, positions: newPositions, trades: newTrades });
    setShowOrder(false);
  };

  // ── Hybrid AI Coach (5 DeepSeek calls/session, then smart local) ──
  const aiCallCount = useRef(0);
  const MAX_AI_CALLS = 5;

  const LOCAL_COACH: Record<string, (t: any) => string> = {
    buy_call_otm: (t) => `Compraste un call OTM con delta ${t.delta}. Eso significa ~${Math.round(Math.abs(t.delta) * 100)}% de probabilidad de expirar ITM. La prima es baja pero necesitas un movimiento fuerte en ${sym}. Tip: OTM funciona mejor con DTE > 30 días para darle tiempo al subyacente.`,
    buy_call_atm: (t) => `Call ATM en $${t.strike} con delta ${t.delta} — estás en la zona de máximo gamma. Cada $1 que suba ${sym} te genera ~$${Math.abs(t.delta * 100).toFixed(0)} por contrato. El theta te cuesta dinero cada día, así que define tu stop y tu target desde ahora.`,
    buy_call_itm: (t) => `Call ITM profundo (Δ${t.delta}). Esta opción se mueve casi como 100 acciones — es apalancamiento puro con alta probabilidad. Desventaja: prima más cara. Tu breakeven está en $${(t.strike + t.price).toFixed(0)}. Ideal para movimientos direccionales de alta convicción.`,
    buy_put_otm: (t) => `Put OTM con delta ${t.delta}. Funcionan como seguro contra caídas — pierdes prima si nada pasa, pero ganas exponencialmente si ${sym} colapsa. Con delta ${t.delta}, necesitas que ${sym} caiga ~${((Math.abs(t.delta) < 0.3 ? 5 : 3))}% para entrar a breakeven.`,
    buy_put_atm: (t) => `Put ATM en $${t.strike}. Delta ${t.delta} te da máxima exposición a caídas. Cada $1 que baje ${sym} genera ~$${Math.abs(t.delta * 100).toFixed(0)} por contrato. El decaimiento temporal es tu enemigo — no mantengas puts ATM más de 7-10 días sin movimiento.`,
    buy_put_itm: (t) => `Put ITM con delta ${t.delta} — protección seria contra caídas. Se comporta como un short de ${Math.round(Math.abs(t.delta) * 100)} acciones. Tu riesgo máximo es la prima pagada: $${t.cost}. Ideal como cobertura de portafolio o apuesta bajista de alta convicción.`,
    sell_call: (t) => `Vendiste un call en $${t.strike}, cobrando $${t.price} de prima ($${t.cost} total). Si ${sym} se mantiene debajo de $${t.strike} al vencimiento, te quedas toda la prima. ⚠️ Riesgo: si ${sym} sube fuerte, las pérdidas son ilimitadas en un call descubierto. Siempre define un stop.`,
    sell_put: (t) => `Cash-Secured Put en $${t.strike}: cobras $${t.cost} de prima. Si ${sym} > $${t.strike} al vencimiento, ganancia = $${t.cost}. Tu costo efectivo si te asignan: $${(t.strike - t.price).toFixed(2)}. Regla: solo vende CSPs en activos que quieras poseer a ese precio.`,
    close_win: (t) => `¡Excelente cierre! ${t.pnlPct >= 0 ? '+' : ''}${t.pnlPct}% de retorno (${t.pnl >= 0 ? '+' : ''}$${t.pnl}). Regla profesional: si logras 50%+ del máximo profit, tomar ganancias casi siempre es la decisión correcta. El riesgo de devolver profits supera la posible ganancia extra. ¡Bien hecho!`,
    close_loss: (t) => `Cierre en ${t.pnlPct}% ($${t.pnl}). Cortar pérdidas es la marca del trader disciplinado — la mayoría no lo hace. Revisa: ¿la tesis original cambió? ¿O fue theta decay? Si fue temporal, tal vez necesitas DTE más largos. Documéntalo en tu bitácora mental.`,
    close_small: (t) => `Cierre neutral (${t.pnlPct >= 0 ? '+' : ''}${t.pnlPct}%). Ni ganancia ni pérdida significativa — lo importante es que gestionaste la posición activamente. Un trader que gestiona es un trader que sobrevive. Analiza si el timing de entrada fue correcto.`,
  };

  const getLocalCoachMsg = (trade: any): string => {
    const d = Math.abs(trade.delta || 0);
    const moneyness = d > 0.65 ? 'itm' : d > 0.35 ? 'atm' : 'otm';

    if (trade.isClose) {
      const key = trade.pnl > 50 ? 'close_win' : trade.pnl < -20 ? 'close_loss' : 'close_small';
      return LOCAL_COACH[key](trade);
    }
    if (trade.side === 'sell') {
      return LOCAL_COACH[trade.ot === 'call' ? 'sell_call' : 'sell_put'](trade);
    }
    return LOCAL_COACH[`buy_${trade.ot}_${moneyness}`]?.(trade) || LOCAL_COACH.buy_call_atm(trade);
  };

  const getAI = async (trade: any) => {
    aiCallCount.current++;

    // After 5 API calls per session → use smart local responses
    if (aiCallCount.current > MAX_AI_CALLS) {
      const msg = getLocalCoachMsg(trade);
      setAiMsg(msg);
      return;
    }

    // First 5 calls → use DeepSeek API
    setAiLoad(true);
    try {
      const { data, error } = await supabase.functions.invoke('options-coach', {
        body: { trade, symbol: sym, spot: spot.toFixed(2), iv: (σ * 100).toFixed(0), dte }
      });
      if (error) throw error;
      setAiMsg(data?.message || getLocalCoachMsg(trade));
    } catch {
      setAiMsg(getLocalCoachMsg(trade));
    }
    setAiLoad(false);
  };

  const tierDone = (id: number) => TIERS.find(t => t.id === id)?.missions.every(m => done.has(m.id));
  const desbloqueado = (id: number) => id === 1 || tierDone(id - 1);
  const xpPct = ((xp % 1000) / 1000) * 100;
  const leccionesTier = useMemo(() => LECCIONES.filter(l => l.tier === tierLearn), [tierLearn]);

  /* ═══════════════════════════════════════════════════════════════════════
     LOADING
     ═══════════════════════════════════════════════════════════════════════ */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
            <Crosshair className="w-8 h-8 text-brand-blue" />
          </motion.div>
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted">Cargando simulador...</p>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════════════ */
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl font-black text-sm shadow-2xl ${toast.includes('❌') ? 'bg-red-500/90 text-white' : 'bg-brand-green/90 text-black'}`}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <CompletionBanner lessonId="geny" />

      {/* ── HEADER ── */}
      <div className="glass-panel p-5 relative overflow-hidden border-t-2 border-t-brand-blue/40">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/8 via-transparent to-brand-green/5 pointer-events-none" />
        <div className="relative z-10 space-y-4">
          {/* Title Row */}
            <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
                ACADEMIA DE <span className="title-highlight">OPCIONES</span> GENY
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-muted mt-0.5">Simulador de Opciones · GENY LAB</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-black text-brand-blue">⚡ {xp.toLocaleString()} XP</p>
                <div className="h-1.5 w-20 bg-white/5 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-gradient-to-r from-brand-blue to-brand-green rounded-full transition-all" style={{ width: `${xpPct}%` }} />
                </div>
              </div>
              <button onClick={avanzarDia}
                className="px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest bg-white/5 border border-white/10 text-brand-text-muted hover:text-white hover:bg-white/10 transition-all flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" /> Día {dia}
                <span className="text-brand-blue">→ Avanzar</span>
              </button>
            </div>
          </div>

          {/* Symbol + Price + Portfolio Row */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Symbol Selector */}
            <div className="flex gap-1.5">
              {Object.values(SYMBOLS).map((s: any) => (
                <button key={s.label} onClick={() => setSym(s.label)}
                  className={`px-3 py-2 rounded-xl text-center transition-all ${sym === s.label ? 'border-2' : 'border border-white/10 hover:border-white/20'}`}
                  style={sym === s.label ? { borderColor: s.col, background: `${s.col}15` } : {}}>
                  <div className={`font-black text-xs ${sym === s.label ? '' : 'text-slate-500'}`} style={sym === s.label ? { color: s.col } : {}}>{s.label}</div>
                  <div className="text-[10px] text-brand-text-muted mt-0.5">{s.cat}</div>
                </button>
              ))}
            </div>

            {/* Price */}
            <div className="glass-panel px-4 py-2 flex items-center gap-3" style={{ borderColor: `${SD.col}30` }}>
              <div>
                <div className="text-[9px] font-black uppercase tracking-widest" style={{ color: SD.col }}>{sym}</div>
                <div className="font-black text-lg font-mono leading-tight">${spot.toFixed(sym === 'SPX' ? 0 : 2)}</div>
              </div>
              <span className={`text-sm font-black ${spot >= prevSpot ? 'text-brand-green' : 'text-red-500'}`}>
                {spot >= prevSpot ? '▲' : '▼'}{Math.abs(((spot - prevSpot) / prevSpot) * 100).toFixed(2)}%
              </span>
            </div>

            {/* Portfolio */}
            <div className="glass-panel px-4 py-2 ml-auto">
              <div className="text-xs font-black uppercase tracking-widest text-brand-text-muted">Portafolio</div>
              <div className={`font-black text-lg font-mono leading-tight ${equity >= 25000 ? 'text-brand-green' : 'text-red-500'}`}>
                ${equity.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-brand-text-muted">
                Cash: ${cash.toLocaleString('en', { maximumFractionDigits: 0 })} ·
                P&L: <span className={`font-bold ${totalPnL >= 0 ? 'text-brand-green' : 'text-red-500'}`}>{totalPnL >= 0 ? '+' : ''}{f$(totalPnL)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT (tabs) ── */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* LEFT: Main Panel */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Tab Bar */}
          <div className="flex gap-2 glass-panel p-1.5">
            {([
              ['learn', '📖 Aprender', BookOpen],
              ['chain', '📊 Cadena', BarChart3],
              ['positions', `📂 (${positions.length})`, Briefcase],
              ['history', `📋 (${trades.length})`, History],
            ] as const).map(([k, lbl]) => (
              <button key={k} onClick={() => setTab(k as any)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === k ? 'bg-brand-blue/12 text-brand-blue' : 'text-brand-text-muted hover:text-white hover:bg-white/5'}`}>
                {lbl}
              </button>
            ))}
          </div>

          {/* DTE selector (chain only) */}
          {tab === 'chain' && (
            <div className="flex items-center gap-2 justify-end">
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted">Vencimiento:</span>
              {[7, 14, 30, 60].map(d => (
                <button key={d} onClick={() => setDte(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${dte === d ? 'bg-brand-blue/15 text-brand-blue border border-brand-blue/30' : 'text-brand-text-muted border border-white/5 hover:border-white/15'}`}>
                  {d}D
                </button>
              ))}
            </div>
          )}

          {/* Tier selector (learn only) */}
          {tab === 'learn' && (
            <div className="flex gap-2">
              {TIERS.map(t => (
                <button key={t.id} onClick={() => desbloqueado(t.id) && setTierLearn(t.id)} disabled={!desbloqueado(t.id)}
                  className={`flex-1 py-2. rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tierLearn === t.id ? 'border-2' : 'border border-white/10'} ${!desbloqueado(t.id) ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                  style={tierLearn === t.id ? { borderColor: t.col, background: `${t.col}15`, color: t.col } : {}}>
                  {t.icon} {t.name}
                </button>
              ))}
            </div>
          )}

          {/* ═══ LEARN TAB ═══ */}
          {tab === 'learn' && (
            <div className="space-y-3">
              {leccionesTier.map(l => (
                <TarjetaLeccion key={l.id} leccion={l} onPractice={() => { setMTab(tierLearn); setTab('chain'); }} />
              ))}
            </div>
          )}

          {/* ═══ CHAIN TAB ═══ */}
          {tab === 'chain' && (
            <div className={`glass-panel overflow-hidden transition-all duration-500 border-t-2 border-t-brand-blue/30 ${chainGlow ? 'tech-panel-active' : ''}`}>
              {/* Chain Header */}
              <div className="p-3 flex items-center gap-3 border-b border-white/5" style={{ background: `${SD.col}08` }}>
                <span className="font-black text-sm" style={{ color: SD.col }}>{sym}</span>
                <span className="text-sm text-brand-text-muted">{SD.name}</span>
                <span className="text-[9px] text-brand-text-muted bg-white/5 px-2 py-0.5 rounded">{SD.cat}</span>
                <span className="text-[9px] text-brand-text-muted ml-auto hidden md:inline">{SD.desc}</span>
              </div>

              {/* Column Headers */}
              <div className="grid grid-cols-5 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border-b border-white/5 bg-white/[0.02]">
                <span className="text-brand-green">── CALLS ──</span>
                <span className="text-brand-green text-center">Bid / Ask</span>
                <span className="text-center text-brand-text-muted">STRIKE</span>
                <span className="text-red-500 text-center">Bid / Ask</span>
                <span className="text-red-500 text-right">── PUTS ──</span>
              </div>

              {/* Chain Rows */}
              <div className="max-h-[500px] overflow-y-auto no-scrollbar pb-10">
                {chain.map(row => {
                  const sc = sel?.strike === row.K && sel?.ot === 'call';
                  const sp = sel?.strike === row.K && sel?.ot === 'put';
                  const isAtm = row.atm;
                  return (
                    <div key={row.K}
                      className={`grid grid-cols-5 px-3 py-2.5 border-b border-white/[0.03] transition-colors relative ${isAtm ? 'bg-brand-blue/[0.04]' : row.itmc ? 'bg-brand-green/[0.02]' : ''}`}>
                      
                      {isAtm && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-brand-blue shadow-[0_0_10px_rgba(0,209,255,0.8)]" />}

                      {/* Call side */}
                      <button onClick={() => { setSel({ strike: row.K, ot: 'call' }); setOSide('buy'); setShowOrder(true); }}
                        className={`text-left rounded-lg px-2 py-1.5 cursor-pointer transition-all ${sc ? 'bg-brand-green/20 ring-1 ring-brand-green/50 shadow-[0_0_15px_rgba(0,230,118,0.2)]' : 'hover:bg-brand-green/10'}`}>
                        <div className={`font-black font-mono text-[13px] ${sc ? 'text-white' : 'text-brand-green'}`}>{row.c.p.toFixed(2)}</div>
                        <div className="text-[9px] text-brand-text-muted mt-0.5 font-mono">Δ{row.c.d} Θ{row.c.t}</div>
                      </button>

                      <div onClick={() => { setSel({ strike: row.K, ot: 'call' }); setOSide('buy'); setShowOrder(true); }}
                        className="flex items-center justify-center gap-1.5 font-mono text-[11px] cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
                        <span className="text-white/60">{row.c.bid}</span>
                        <span className="text-brand-green/60">{row.c.ask}</span>
                      </div>

                      {/* Strike */}
                      <div className={`flex items-center justify-center font-black text-sm font-mono tracking-wider ${isAtm ? 'text-glow-cyan text-white' : 'text-brand-text-muted'}`}>
                        {row.K}
                      </div>

                      <div onClick={() => { setSel({ strike: row.K, ot: 'put' }); setOSide('buy'); setShowOrder(true); }}
                        className="flex items-center justify-center gap-1.5 font-mono text-[11px] cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
                        <span className="text-red-400/80">{row.p.bid}</span>
                        <span className="text-white/60">{row.p.ask}</span>
                      </div>

                      {/* Put side */}
                      <button onClick={() => { setSel({ strike: row.K, ot: 'put' }); setOSide('buy'); setShowOrder(true); }}
                        className={`text-right rounded-lg px-2 py-1.5 cursor-pointer transition-all ${sp ? 'bg-red-500/20 ring-1 ring-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'hover:bg-red-500/10'}`}>
                        <div className={`font-black font-mono text-[13px] ${sp ? 'text-white' : 'text-red-500'}`}>{row.p.p.toFixed(2)}</div>
                        <div className="text-[9px] text-brand-text-muted mt-0.5 font-mono">Δ{row.p.d} Θ{row.p.t}</div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══ POSITIONS TAB ═══ */}
          {tab === 'positions' && (
            <div className="space-y-3 pb-8">
              {!positions.length && (
                <div className="glass-panel p-12 text-center border-t-2 border-t-white/5">
                  <Briefcase className="w-10 h-10 text-brand-text-muted/30 mx-auto mb-3" />
                  <p className="text-brand-text-muted font-medium text-sm">Sin posiciones abiertas.</p>
                  <p className="text-xs text-brand-text-muted/50 mt-2">Ve a la <span className="text-brand-blue font-bold cursor-pointer hover:text-cyan-400 transition-colors" onClick={goToChain}>Cadena</span> para abrir tu primera posición.</p>
                </div>
              )}
              {positions.map(p => {
                const T = Math.max(0.001, p.dte / 365), curr = bsp(spot, p.strike, T, p.ot, σ);
                const pnl2 = (p.side === 'buy' ? (curr - p.avg) : (p.avg - curr)) * 100 * p.qty;
                const pct = (pnl2 / (p.avg * 100 * p.qty)) * 100;
                return (
                  <div key={p.id} className={`glass-panel p-5 border-l-4 ${pnl2 >= 0 ? 'border-l-brand-green' : 'border-l-red-500'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className={`font-black text-sm ${p.ot === 'call' ? 'text-brand-green' : 'text-red-500'}`}>
                          {p.side === 'buy' ? 'COMPRA' : 'VENTA'} {p.qty}x
                        </span>
                        <span className="ml-2 font-black" style={{ color: SYMBOLS[p.sym]?.col }}>{p.sym}</span>
                        <span className="text-brand-text-muted ml-2">${p.strike} {p.ot.toUpperCase()}</span>
                        <span className="text-brand-text-muted text-xs ml-2">{p.dte}D</span>
                      </div>
                      <div className="text-right">
                        <div className={`font-black font-mono ${pnl2 >= 0 ? 'text-brand-green' : 'text-red-500'}`}>{pnl2 >= 0 ? '+' : ''}{f$(pnl2)}</div>
                        <div className="text-[10px] text-brand-text-muted">{pct >= 0 ? '+' : ''}{pct.toFixed(1)}%</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex gap-4 text-xs text-brand-text-muted">
                        <span>Entrada: ${p.avg.toFixed(2)}</span>
                        <span>Ahora: ${curr.toFixed(2)}</span>
                        <span className="text-brand-blue">Δ{p.d}</span>
                        <span className="text-amber-400">Θ{p.t}</span>
                      </div>
                      <button onClick={() => { setSel({ strike: p.strike, ot: p.ot }); setOSide(p.side === 'buy' ? 'sell' : 'buy'); setShowOrder(true); setTab('chain'); }}
                        className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all">
                        Cerrar →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ═══ HISTORY TAB ═══ */}
          {tab === 'history' && (
            <div className="space-y-2 pb-8">
              {!trades.length && (
                <div className="glass-panel p-12 text-center border-t-2 border-t-white/5">
                  <History className="w-10 h-10 text-brand-text-muted/30 mx-auto mb-3" />
                  <p className="text-brand-text-muted font-medium text-sm">Sin operaciones aún. ¡A operar!</p>
                </div>
              )}
              {trades.map(t => (
                <div key={t.id} className="glass-panel p-4 flex items-center justify-between border-t border-t-white/5">
                  <div>
                    <span className="font-black text-xs" style={{ color: SYMBOLS[t.sym]?.col }}>{t.sym}</span>
                    <span className={`ml-2 font-bold text-xs ${t.ot === 'call' ? 'text-brand-green' : 'text-red-500'}`}>
                      {t.side === 'buy' ? 'COMPRA' : 'VENTA'} {t.qty}x ${t.strike} {t.ot.toUpperCase()}
                    </span>
                    {t.isClose && <span className="text-[9px] font-black uppercase tracking-widest ml-2 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">CIERRE</span>}
                    <div className="text-[10px] text-brand-text-muted mt-1">@ ${t.price} · {t.time} · Δ{t.delta}</div>
                  </div>
                  {t.pnl != null && (
                    <div className="text-right">
                      <div className={`font-black font-mono text-sm ${t.pnl >= 0 ? 'text-brand-green' : 'text-red-500'}`}>{t.pnl >= 0 ? '+' : ''}{f$(t.pnl)}</div>
                      <div className="text-[10px] text-brand-text-muted">{t.pnlPct >= 0 ? '+' : ''}{t.pnlPct}%</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Sidebar (Order + Payoff + Missions + Coach) */}
        <div className="w-full lg:w-80 shrink-0 space-y-4">

          {/* Order Entry */}
          <div className="glass-panel p-5 space-y-5 border-t-2 border-t-brand-blue/30 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-blue/50 to-transparent" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue">Entrada de Orden</span>
              {sel && <span className="text-[9px] font-black font-mono px-2 py-0.5 rounded border" style={{ color: SD.col, borderColor: `${SD.col}40`, background: `${SD.col}10` }}>{sym}</span>}
            </div>

            {sel && selInfo ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="glass-panel p-4 space-y-3 bg-white/[0.01]" style={{ borderColor: `${SD.col}20` }}>
                  <div className="flex justify-between items-center">
                    <span className={`font-black tracking-tight text-sm uppercase ${sel.ot === 'call' ? 'text-brand-green' : 'text-red-500'}`}>{sym} ${sel.strike} {sel.ot}</span>
                    <span className="text-[10px] font-mono text-brand-text-muted">{dte}D venc.</span>
                  </div>
                  <div className="font-mono text-3xl font-black tracking-tighter text-white">
                    ${selInfo.px.toFixed(2)} <span className="text-[10px] text-white/40 tracking-widest font-sans uppercase">/ contract</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-white/5">
                    {[
                      ['Δ', selInfo.g.d, 'text-brand-blue', 'Delta'],
                      ['Γ', selInfo.g.g, 'text-purple-400', 'Gamma'],
                      ['Θ', selInfo.g.t, 'text-amber-400', 'Theta'],
                      ['ν', selInfo.g.v, 'text-emerald-400', 'Vega'],
                    ].map(([l, v, c, n]) => (
                      <div key={l as string} className="bg-white/[0.03] rounded p-1.5 text-center border border-white/5" title={n as string}>
                        <div className="text-[8px] font-black text-white/40 mb-0.5">{l}</div>
                        <div className={`font-black font-mono text-[9px] ${c}`}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  {[['buy', 'COMPRAR'], ['sell', 'VENDER']].map(([s, lbl]) => (
                    <button key={s} onClick={() => setOSide(s)}
                      className={`flex-1 py-3 font-black text-xs uppercase tracking-[0.2em] rounded-xl transition-all ${oSide === s
                        ? (s === 'buy' ? 'bg-brand-green/10 text-brand-green border border-brand-green/40 shadow-[0_0_15px_rgba(0,230,118,0.15)]' : 'bg-red-500/10 text-red-500 border border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.15)]')
                        : 'bg-white/[0.02] border border-white/10 text-white/40 hover:text-white/80 hover:bg-white/[0.05]'}`}>
                      {lbl}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between bg-white/[0.02] p-3 rounded-xl border border-white/5">
                  <span className="text-xs font-black uppercase tracking-widest text-white/60">Contratos</span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-7 h-7 rounded-md bg-white/5 border border-white/10 text-white font-black hover:bg-white/15 transition-colors flex items-center justify-center">−</button>
                    <span className="font-black font-mono text-base min-w-[20px] text-center">{qty}</span>
                    <button onClick={() => setQty(q => q + 1)} className="w-7 h-7 rounded-md bg-white/5 border border-white/10 text-white font-black hover:bg-white/15 transition-colors flex items-center justify-center">+</button>
                  </div>
                </div>

                <div className="text-[10px] font-medium leading-relaxed text-brand-text-muted bg-white/[0.02] border border-white/5 rounded-xl p-3">
                  {oSide === 'buy'
                    ? `📌 Riesgo máx: $${(selInfo.px * 1.018 * 100 * qty).toFixed(0)} · Ganas si ${sym} ${sel.ot === 'call' ? 'sube de' : 'cae de'} $${(sel.strike + (sel.ot === 'call' ? 1 : -1) * selInfo.px).toFixed(0)}`
                    : `📌 Ganas máx: $${(selInfo.px * 0.982 * 100 * qty).toFixed(0)} si expira OTM`}
                </div>

                <button onClick={ejecutarOrden}
                  className={`w-full py-4 rounded-xl font-black uppercase tracking-[0.15em] text-xs text-white transition-all hover:scale-[1.02] active:scale-[0.98] ${oSide === 'buy' ? 'bg-brand-green text-black shadow-[0_0_20px_rgba(0,230,118,0.3)] hover:shadow-[0_0_30px_rgba(0,230,118,0.5)]' : 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)]'}`}>
                  {oSide === 'buy' ? 'ENVIAR COMPRA' : 'ENVIAR VENTA'}
                </button>
              </motion.div>
            ) : (
              <div className="text-center py-10 space-y-4">
                <Crosshair className="w-10 h-10 text-brand-blue/20 mx-auto" />
                <p className="text-brand-text-muted text-xs leading-relaxed max-w-[200px] mx-auto">Selecciona un precio de la <span className="text-brand-blue font-bold cursor-pointer hover:text-cyan-400" onClick={goToChain}>Cadena</span> para abrir el panel de orden.</p>
              </div>
            )}
          </div>

          {/* Payoff Chart */}
          <div className="glass-panel p-4 space-y-3 border-t-2 border-t-purple-500/30">
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">Payoff al Vencimiento</span>
            {payoff.length ? (
              <ResponsiveContainer width="100%" height={130}>
                <LineChart data={payoff} margin={{ top: 4, right: 4, bottom: 0, left: -8 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke="#ffffff0a" />
                  <XAxis dataKey="s" tick={{ fontSize: 9, fill: '#64748b', fontFamily: 'monospace' }} interval={14} />
                  <YAxis tick={{ fontSize: 9, fill: '#64748b', fontFamily: 'monospace' }} tickFormatter={(v: number) => v >= 0 ? `$${v}` : `-$${Math.abs(v)}`} />
                  <Tooltip contentStyle={{ background: '#0f1420', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 10, fontFamily: 'monospace' }}
                    formatter={(v: number) => [`${v >= 0 ? '+' : ''}$${v}`, 'P&L']} labelFormatter={(l: string) => `${sym} @ $${l}`} />
                  <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" />
                  <ReferenceLine x={spot.toFixed(0)} stroke="#00D1FF" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="pnl" stroke="#00D1FF" dot={false} strokeWidth={2} style={{ filter: 'drop-shadow(0 0 4px rgba(0,209,255,0.5))' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-white/30 text-[10px] uppercase tracking-widest font-black py-8 bg-white/[0.01] rounded-xl border border-white/5">
                Abre una posición<br />para ver gráfica
              </div>
            )}
          </div>

          {/* Missions Progress */}
          <div className="glass-panel p-4 space-y-3 border-t-2 border-t-[#F2C500]/40">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#F2C500]">Misiones de Progreso</span>
            {TIERS.map(t => {
              const lock = !desbloqueado(t.id);
              const cnt = t.missions.filter(m => done.has(m.id)).length;
              return (
                <div key={t.id}>
                  <button onClick={() => !lock && setMTab(mTab === t.id ? 0 : t.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${lock ? 'opacity-40 cursor-not-allowed bg-white/[0.01]' : 'hover:bg-white/[0.03] cursor-pointer border border-white/5 shadow-sm'} ${mTab === t.id ? 'bg-white/[0.04] border-white/10' : ''}`}>
                    <span className="text-[11px] font-black tracking-wide">{t.icon} NIVEL {t.id}: <span className="opacity-80">{t.name.toUpperCase()}</span></span>
                    {lock ? <Lock className="w-3.5 h-3.5 text-brand-text-muted" /> : <span className="text-[10px] font-black font-mono" style={{ color: t.col }}>{cnt}/{t.missions.length}</span>}
                  </button>
                  {mTab === t.id && !lock && (
                    <div className="mt-2 space-y-1.5 pl-1 pr-1">
                      {t.missions.map(m => {
                        const isDone = done.has(m.id);
                        return (
                          <div key={m.id} className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs border ${isDone ? 'bg-brand-green/10 text-brand-green border-brand-green/20' : 'bg-white/[0.02] border-white/5 text-white/50'}`}>
                            <div className="flex items-center gap-2 min-w-0">
                              {isDone ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-white/10 shrink-0" />}
                              <span className="font-bold truncate text-[11px] uppercase tracking-wide">{m.title}</span>
                            </div>
                            <span className={`font-black font-mono shrink-0 text-[10px] ${isDone ? 'text-brand-green' : 'text-[#F2C500]'}`}>+{m.xp}XP</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* AI Coach */}
          <div className="glass-panel p-5 space-y-3 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Bot className="w-5 h-5 text-amber-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Coach Geny IA</span>
              </div>
              <div className="bg-[#05080f]/50 rounded-xl p-4 border border-white/5 shadow-inner">
                {aiLoad ? (
                  <div className="flex items-center gap-3 text-brand-blue text-[11px] font-black uppercase tracking-widest">
                    <div className="w-4 h-4 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
                    Analizando operación...
                  </div>
                ) : (
                  <p className="text-slate-300 text-[13px] leading-relaxed whitespace-pre-wrap">{aiMsg}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
