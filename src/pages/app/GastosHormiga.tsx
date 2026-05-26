import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, ChevronRight, ChevronLeft, ArrowLeft, Wallet, Share2, RefreshCcw, Copy, Check, X as XIcon, MessageCircle, ExternalLink, Sparkles } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

import { Category, Currency, Projection } from './gastos-hormiga/types';
import { CATEGORIES, CURRENCIES, ANNUAL_RATE, getRecommendation } from './gastos-hormiga/constants';
import Confetti from '../../components/Confetti';
import ShareModule from '../../components/ShareModule';
import ResultActions from '../../components/ResultActions';
import CompletionBanner from '../../components/CompletionBanner';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { initPdfWithHeader, addPdfText, checkPageBreak } from '../../utils/pdfUtils';


// ── Helpers ────────────────────────────────────────────────────────────────
const fmt = (n: number, currency: Currency) =>
  `${currency.symbol}${Math.round(n).toLocaleString(currency.locale)}`;

function buildProjections(monthlyTotal: number): Projection[] {
  const rate = ANNUAL_RATE / 12;
  return [1, 3, 5, 10, 20].map(y => {
    const n = y * 12;
    const val = monthlyTotal * ((Math.pow(1 + rate, n) - 1) / rate);
    return { label: `${y}a`, years: y, val: Math.round(val), invested: Math.round(monthlyTotal * n) };
  });
}

// ── Main Component ─────────────────────────────────────────────────────────
export const GastosHormiga = () => {
  const user = { id: 'local-user' };
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [amounts, setAmounts] = useState<Record<string, string>>(
    Object.fromEntries(CATEGORIES.map(c => [c.id, '']))
  );
  const [currency, setCurrency] = useState<Currency>(CURRENCIES[0]);

  const [showConfetti, setShowConfetti] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Trader');

  const total = useMemo(
    () => Object.values(amounts).reduce((s: number, v) => s + (parseFloat(v as string) || 0), 0),
    [amounts]
  );

  const chartRef = React.useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollSlider = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const generatePDF = async () => {
    const doc = new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
    let y = initPdfWithHeader(doc, 'Gastos Hormiga');
    const W = 210, M = 18;

    doc.setTextColor(250, 204, 21); // brand-yellow
    doc.setFontSize(36); 
    doc.setFont('helvetica', 'bold');
    doc.text(fmt(total, currency), M, y);
    y += 10;
    y = addPdfText(doc, 'Total Mensual', y, { fontSize: 12, color: [100, 116, 139] });
    y += 10;
    
    y = addPdfText(doc, 'PROYECCIÓN DE RIQUEZA (7% Anual)', y, { fontSize: 10, color: [0, 212, 255], fontStyle: 'bold' });
    y += 4;
    proj.forEach((p) => {
      y = addPdfText(doc, `${p.years} años: ${fmt(p.val, currency)}`, y, { fontSize: 12, color: [51, 65, 85] });
    });
    y += 6;

    y = addPdfText(doc, 'RECOMENDACIÓN', y, { fontSize: 10, color: [0, 212, 255], fontStyle: 'bold' });
    y += 4;
    y = addPdfText(doc, rec.title, y, { fontSize: 14, color: [15, 23, 42], fontStyle: 'bold' });
    y += 4;
    y = addPdfText(doc, rec.desc, y, { fontSize: 11, color: [51, 65, 85], lineHeight: 6 });
    y += 4;
    y = addPdfText(doc, `"${rec.highlight}"`, y, { fontSize: 11, color: [217, 119, 6], fontStyle: 'italic', lineHeight: 6 });
    y += 8;

    if (chartRef.current) {
      try {
        const canvas = await html2canvas(chartRef.current, { scale: 2, backgroundColor: '#0a0c14' });
        const imgData = canvas.toDataURL('image/png');
        const imgProps = doc.getImageProperties(imgData);
        const pdfWidth = W - 2*M;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        y = checkPageBreak(doc, y, pdfHeight + 10);
        doc.addImage(imgData, 'PNG', M, y, pdfWidth, pdfHeight);
      } catch (e) {
        console.error('Error capturing chart', e);
      }
    }
    doc.save('gastos-hormiga.pdf');
  };

  const barData = useMemo(
    () => CATEGORIES
      .map(c => ({ ...c, val: parseFloat(amounts[c.id]) || 0 }))
      .filter(d => d.val > 0)
      .sort((a, b) => b.val - a.val),
    [amounts]
  );

  const proj = useMemo(() => buildProjections(total), [total]);
  const rec = useMemo(() => getRecommendation(total, currency.id), [total, currency.id]);

  // ── Load saved progress ──────────────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem('gastos-hormiga-progress');
      if (saved) {
        const r = JSON.parse(saved);
        if (r.amounts) setAmounts(r.amounts);
        if (r.currencyId) {
          const found = CURRENCIES.find(c => c.id === r.currencyId);
          if (found) setCurrency(found);
        }
        if (r.completed) setStep(2);
      }
    } catch (e) {
      console.error('Error loading gastos progress:', e);
    }
    setLoading(false);
  }, []);

  // ── Fetch user name ───────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser?.email) {
          const { data } = await supabase.from('enrolled_users').select('name').eq('email', authUser.email).single();
          if (data?.name) setUserName(data.name);
        }
      } catch {}
    })();
  }, []);

  // ── Save progress ────────────────────────────────────────────────────────
  const handleComplete = async () => {
    setStep(2);
    setShowConfetti(true);
    try {
      localStorage.setItem('gastos-hormiga-progress', JSON.stringify({
        amounts,
        currencyId: currency.id,
        completed: true,
      }));
    } catch (e) {
      console.error('Error saving gastos progress:', e);
    }
  };

  const handleStartQuestionnaire = () => {
    setStep(1);
  };

  const handleReset = () => {
    setAmounts(Object.fromEntries(CATEGORIES.map(c => [c.id, ''])));
    setStep(0);
    localStorage.removeItem('gastos-hormiga-progress');
  };

  // ── Share ────────────────────────────────────────────────────────────────
  const shareText = useMemo(() => {
    if (proj.length < 4) return '';
    return `💰 Hice el diagnóstico de Gastos Hormiga de GENY LAB y descubrí que gasto ${fmt(total, currency)}/mes en pequeñeces. Si los invirtiera, en 10 años tendría ${fmt(proj[3].val, currency)}. ¡Hazlo tú también! 🐜`;
  }, [total, currency, proj]);

  const getShareUrl = useCallback(() => {
    if (!user) return '';
    const payload = {
      n: userName,
      t: 'gastos',
      s: proj[3]?.val || 0,
      c: {
        'Gasto Mensual': total,
        'Capital 10 años': proj[3]?.val || 0,
        'Capital 20 años': proj[4]?.val || 0,
        'Moneda': currency.id.toUpperCase(),
      },
    };
    const encoded = btoa(JSON.stringify(payload));
    return `https://genylab.ingresarios.net/resultado/${encoded}`;
  }, [user, total, proj, currency]);

  const handleShare = (platform: string) => {
    const url = getShareUrl();
    const text = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(url);
    const urls: Record<string, string> = {
      whatsapp: `https://api.whatsapp.com/send?text=${text}%20${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${text}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`,
    };
    if (urls[platform]) window.open(urls[platform], '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  const handleCopyLink = async () => {
    const url = getShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-black uppercase tracking-widest text-brand-text-muted">Cargando progreso...</p>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // STEP 0: Welcome / Landing
  // ════════════════════════════════════════════════════════════════════════
  if (step === 0) return (
    <div className="max-w-5xl mx-auto space-y-10 pb-12">
      <Link
        to="/app/leccion/gastos"
        className="inline-flex items-center gap-2 text-brand-text-muted hover:text-white transition-colors uppercase font-black text-xs tracking-[0.2em] mb-2"
      >
        <ArrowLeft className="w-4 h-4" /> Volver a la Lección
      </Link>

      {/* Hero */}
      <div className="min-h-[70vh] flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-2 gap-12 items-center"
        >
          <div className="space-y-8 text-left">
            <div className="text-6xl md:text-8xl mb-4 animate-float">🐜</div>
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-none">
                Gastos Hormiga <br />
                <span className="title-highlight text-3xl md:text-5xl">→ Inversiones Hormiga</span>
              </h1>
              <p className="text-brand-text-muted font-medium text-lg md:text-xl leading-relaxed max-w-md">
                Pequeños gastos invisibles que se comen tu capital.<br />
                Descúbrelos en 3 minutos y conviértelos en riqueza real.
              </p>
            </div>
            
            <button
              onClick={handleStartQuestionnaire}
              className="btn-primary w-full md:w-auto px-8 py-5 rounded-2xl text-sm font-black uppercase tracking-[0.15em] flex items-center justify-center gap-3"
            >
              Comenzar diagnóstico
              <ChevronRight className="w-5 h-5" />
            </button>


          </div>

          {/* Steps preview */}
          <div className="glass-card p-8 text-left space-y-8 h-full flex flex-col justify-center">
            {[
              { num: '01', color: 'text-brand-blue', t: 'Identificas tus gastos hormiga', s: '10 categorías de gastos del día a día' },
              { num: '02', color: 'text-brand-blue', t: 'Ves cuánto puedes recuperar', s: 'Resumen visual y total mensual' },
              { num: '03', color: 'text-brand-yellow', t: 'Proyección de riqueza', s: 'Interés compuesto a 1, 5, 10 y 20 años' },
            ].map((r, i) => (
              <div key={i} className="flex gap-5 items-start">
                <span className={`${r.color} font-black text-3xl min-w-[40px] opacity-80 pt-1`}>{r.num}</span>
                <div>
                  <div className="font-black uppercase tracking-tight text-lg">{r.t}</div>
                  <div className="text-brand-text-muted text-sm font-medium mt-1">{r.s}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════
  // STEP 1: Questionnaire
  // ════════════════════════════════════════════════════════════════════════
  if (step === 1) return (
    <div className="max-w-5xl mx-auto space-y-10">
      {showConfetti && <Confetti />}
      <motion.div
        key="step1"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="space-y-2">
            <button
              onClick={() => setStep(0)}
              className="flex items-center gap-2 text-brand-text-muted hover:text-white transition-colors uppercase font-black text-xs tracking-[0.2em] mb-4"
            >
              <ArrowLeft className="w-4 h-4" /> Volver
            </button>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight leading-none">
              Gastos <br /><span className="title-highlight">Hormiga</span>
            </h1>
            <p className="text-brand-text-muted font-medium text-base md:text-lg">¿Cuánto gastas al mes en...? Ingresa el valor mensual. Pon 0 si no aplica.</p>
          </div>

          {/* Currency selector */}
          <div className="flex items-center gap-2">
            {CURRENCIES.map(c => (
              <button
                key={c.id}
                onClick={() => setCurrency(c)}
                className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
                  currency.id === c.id
                    ? 'bg-brand-blue/10 border-brand-blue/30 text-brand-blue'
                    : 'bg-white/5 border-white/10 text-brand-text-muted hover:border-white/20'
                }`}
              >
                {c.flag} {c.id.toUpperCase()}
              </button>
            ))}
          </div>
        </header>

        {/* Category inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {CATEGORIES.map(cat => (
            <div
              key={cat.id}
              className={`glass-card flex items-center gap-4 p-4 md:p-5 transition-all ${
                (parseFloat(amounts[cat.id]) || 0) > 0
                  ? 'border-brand-blue/20 bg-brand-blue/[0.03]'
                  : ''
              }`}
            >
              <span className="text-2xl min-w-[36px] text-center">{cat.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-black uppercase tracking-tight text-sm">{cat.label}</div>
                <div className="text-brand-text-muted text-xs mt-0.5 truncate">{cat.hint}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-brand-text-muted text-sm font-bold">{currency.symbol}</span>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={amounts[cat.id]}
                  onChange={e => setAmounts(prev => ({ ...prev, [cat.id]: e.target.value }))}
                  className="w-24 md:w-28 bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2.5 text-white text-base text-right focus:outline-none focus:border-brand-blue/50 transition-colors font-bold tabular-nums"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Total bar */}
        <div className="glass-card mt-6 p-6 md:p-8 text-center border-brand-yellow/20 bg-brand-yellow/[0.03]">
          <div className="text-xs font-black text-brand-text-muted uppercase tracking-[0.2em]">Total mensual detectado</div>
          <div className="text-4xl md:text-5xl font-black text-brand-yellow tracking-tighter mt-2">{fmt(total, currency)}</div>
          <div className="mt-3 flex items-center justify-center gap-3">
            <span className="text-sm font-black text-brand-text-muted">{fmt(total * 12, currency)}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted">al año</span>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <button
            onClick={handleComplete}
            disabled={total === 0}
            className="btn-primary w-full max-w-md py-5 rounded-2xl text-sm font-black uppercase tracking-[0.15em] flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100"
          >
            {total === 0 ? 'Ingresa al menos un gasto' : 'Ver mi diagnóstico'}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════
  // STEP 2: Results
  // ════════════════════════════════════════════════════════════════════════
  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {showConfetti && <Confetti />}
      <motion.div
        key="step2"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="space-y-8"
      >


        <CompletionBanner lessonId="gastos" />

        <ResultActions 
          onDownloadPDF={generatePDF} 
          onReset={handleReset} 
        />

        {/* Main 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Total & Breakdown */}
          <div className="lg:col-span-5 space-y-8">
            <div className="flex items-center justify-end gap-2 mb-2">
              {CURRENCIES.map(c => (
                <button
                  key={c.id}
                  onClick={() => setCurrency(c)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all border ${
                    currency.id === c.id
                      ? 'bg-brand-blue/10 border-brand-blue/30 text-brand-blue'
                      : 'bg-white/5 border-white/5 text-white/30 hover:text-white/60'
                  }`}
                >
                  {c.flag}
                </button>
              ))}
            </div>
            {/* Hero total */}
            <div className="glass-card p-8 md:p-10 text-center relative overflow-hidden group border-brand-yellow/30 shadow-[0_0_40px_rgba(250,204,21,0.1)]">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-yellow/10 to-brand-blue/10 opacity-50 group-hover:opacity-70 transition-opacity" />
              <div className="relative z-10 flex flex-col items-center gap-4">
                <h2 className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white/60">
                  Gastos mensuales detectados
                </h2>
                <p className="text-5xl md:text-6xl lg:text-7xl font-black text-brand-yellow tracking-tighter leading-none drop-shadow-[0_0_30px_rgba(250,204,21,0.4)]">
                  {fmt(total, currency)}
                </p>
                <div className="w-full mt-4 pt-6 border-t border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-sm md:text-base font-black uppercase tracking-widest text-brand-text-muted">
                    <span className="text-white/40">En un año:</span>
                    <span className="text-white">{fmt(total * 12, currency)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm md:text-base font-black uppercase tracking-widest text-brand-text-muted">
                    <span className="text-white/40">En 10 años <span className="text-[10px]">(Sin invertir)</span>:</span>
                    <span className="text-white">{fmt(total * 120, currency)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bar chart breakdown */}
            {barData.length > 0 && (
              <div className="glass-card p-6 md:p-8 space-y-5" ref={chartRef}>
                <h3 className="text-sm font-black text-brand-blue uppercase tracking-widest flex items-center gap-2">
                  <Wallet className="w-4 h-4" /> Desglose
                </h3>
                <div className="space-y-4">
                  {barData.map((d, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm font-bold mb-1.5">
                        <span className="text-white">{d.icon} {d.label}</span>
                        <span className="text-brand-yellow font-black">{fmt(d.val, currency)}</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-1.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.round((d.val / barData[0].val) * 100)}%` }}
                          transition={{ delay: i * 0.1, duration: 0.6 }}
                          className="h-1.5 rounded-full bg-gradient-to-r from-brand-blue to-brand-blue/60"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Projections & Recs */}
          <div className="lg:col-span-7 space-y-8">
            {/* Projection */}
            <div className="glass-card p-6 md:p-8 space-y-6 flex flex-col justify-between border-brand-green/20">
              <div className="text-center md:text-left">
                <h3 className="text-base md:text-lg font-black text-brand-green uppercase tracking-widest flex items-center justify-center md:justify-start gap-2 mb-2">
                  <TrendingUp className="w-5 h-5" /> Proyección de riqueza
                </h3>
                <p className="text-white/60 text-xs md:text-sm font-bold uppercase tracking-widest">
                  Si lo inviertes al 7% anual (Promedio ETF S&P 500)
                </p>
              </div>

              <div className="relative group">
                <button 
                  onClick={() => scrollSlider('left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -ml-1 sm:-ml-3 z-10 bg-[#0a0c14] p-2 rounded-full border border-white/20 text-white/90 hover:text-white transition-all flex shadow-[0_0_15px_rgba(0,0,0,0.8)] hover:scale-110"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div 
                  ref={sliderRef}
                  className="flex overflow-x-auto snap-x snap-mandatory gap-3 md:gap-4 mt-4 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth"
                >
                  {proj.map((p, i) => (
                    <motion.div
                      key={p.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className={`snap-center shrink-0 min-w-[160px] glass-card p-4 flex flex-col items-center justify-center text-center bg-white/[0.03] ${i === 4 ? 'bg-brand-green/10 border-brand-green/30' : 'border-white/10'}`}
                    >
                      <div className="text-white/60 text-[10px] md:text-xs font-black uppercase tracking-widest mb-2">
                        {p.years} {p.years === 1 ? 'año' : 'años'}
                      </div>
                      <div className={`text-brand-green font-black ${p.val > 99_999_999 ? 'text-sm' : 'text-base md:text-lg'} leading-tight whitespace-nowrap`}>
                        {fmt(p.val, currency)}
                      </div>
                      <div className="text-white/40 text-[10px] md:text-xs font-bold mt-2">
                        {fmt(p.invested, currency)} aportes
                      </div>
                    </motion.div>
                  ))}
                </div>

                <button 
                  onClick={() => scrollSlider('right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 -mr-1 sm:-mr-3 z-10 bg-[#0a0c14] p-2 rounded-full border border-white/20 text-white/90 hover:text-white transition-all flex shadow-[0_0_15px_rgba(0,0,0,0.8)] hover:scale-110"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 bg-brand-green/10 rounded-2xl border border-brand-green/20 mt-6 text-center shadow-[0_0_20px_rgba(1,228,126,0.1)]">
                <p className="text-brand-green font-black text-base md:text-lg leading-relaxed">
                  En 20 años tendrías <span className="text-2xl md:text-3xl block mt-2 text-white">{fmt(proj[4].val, currency)}</span>
                  <span className="text-brand-green/80 text-xs md:text-sm mt-2 block uppercase tracking-widest">
                    {proj[4].invested > 0 ? `${Math.round(proj[4].val / proj[4].invested)} veces` : '∞'} más de lo que aportaste
                  </span>
                </p>
              </div>
            </div>

            {/* Recommendation */}
            <div className="glass-card p-6 md:p-8 space-y-6 border-brand-yellow/30 bg-brand-yellow/[0.03]">
              <div className="text-brand-yellow text-xs md:text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Recomendación GENY LAB
              </div>
              <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white">{rec.title}</h3>

              <div className="flex flex-wrap gap-2 md:gap-3">
                {rec.instruments.map(ins => (
                  <span
                    key={ins}
                    className="bg-brand-blue/15 text-brand-blue border border-brand-blue/30 rounded-xl px-4 py-2 text-xs md:text-sm font-black uppercase tracking-widest shadow-[0_0_15px_rgba(0,209,255,0.1)]"
                  >
                    {ins}
                  </span>
                ))}
              </div>

              <p className="text-white/80 text-base md:text-lg leading-relaxed font-medium">{rec.desc}</p>

              <div className="border-l-4 border-brand-yellow pl-5 bg-brand-yellow/5 p-4 rounded-r-2xl">
                <p className="text-brand-yellow text-sm md:text-base italic font-bold leading-relaxed">
                  "{rec.highlight}"
                </p>
              </div>
            </div>
          </div>
        </div>



        <div className="mb-6">
          <ShareModule 
            activity="gastos" 
            title="Gastos Hormiga" 
            resultData={{
              gastos: [{ desc: rec.desc, highlight: rec.highlight }],
              total,
              proyeccion: proj[3].val
            }}
            shareMessage={`Hice el diagnóstico de Gastos Hormiga de GENY LAB y descubrí que gasto ${fmt(total, currency)}/mes en pequeñeces. Si los invirtiera, en 10 años tendría ${fmt(proj[3].val, currency)}. ¡Hazlo tú también! 🐜`}
          />
        </div>
      </motion.div>
    </div>
  );
};
