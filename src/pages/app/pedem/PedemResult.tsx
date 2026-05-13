import { useState } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Share2, Copy, Check, ChevronRight } from 'lucide-react';

import type { PedemPath } from './constants';
import { SHADOW_MAP, DIRECTION_MAP, PATH_LABELS } from './constants';

interface Props {
  path: PedemPath;
  data: Record<string, any>;
  onRestart: () => void;
}

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex justify-between items-start py-3 border-b border-dashed border-white/6 last:border-b-0 gap-4">
      <span className="text-xs tracking-[0.15em] uppercase text-brand-text-muted font-black flex-shrink-0 pt-0.5">{label}</span>
      <span className={`text-sm font-medium text-right leading-snug ${color || 'text-white'}`}>{value}</span>
    </div>
  );
}

export function PedemResult({ path, data, onRestart }: Props) {
  const userName = 'Trader';
  const navigate = useNavigate();
  const [copiedLink, setCopiedLink] = useState(false);

  const titles: Record<PedemPath, { main: string; highlight: string; sub: string }> = {
    novice: { main: 'Tu día PEDEM', highlight: 'está diseñado.', sub: 'Planear antes de ejecutar.' },
    routine: { main: 'Tu rutina', highlight: 'pre-mercado.', sub: 'Ahora hónralo 21 días.' },
    trade: { main: 'Tu plan', highlight: 'de trade.', sub: 'Ahora hónralo en la ejecución.' },
  };
  const t = titles[path];

  let rr: string | null = null;
  if (path === 'trade') {
    const entry = parseFloat(data.tra_entry);
    const stop = parseFloat(data.tra_stop);
    const target = parseFloat(data.tra_target);
    if (!isNaN(entry) && !isNaN(stop) && !isNaN(target)) {
      const risk = Math.abs(entry - stop);
      const reward = Math.abs(target - entry);
      if (risk > 0) rr = (reward / risk).toFixed(2);
    }
  }

  const closingMessages: Record<PedemPath, string> = {
    novice: 'El PEDEM no empieza en el gráfico. Empieza en tu día. Si no puedes ejecutar tu rutina de mañana, no vas a poder ejecutar un trade. Hónralo.',
    routine: 'El 95% abre el gráfico y reacciona. El 5% llega con ritual. Acabas de diseñar el tuyo — ahora el trabajo es ejecutarlo todos los días.',
    trade: rr && parseFloat(rr) < 1.5
      ? 'Atención: tu R:R está debajo de 1:1.5. Revisa si vale la pena tomar este trade con esa asimetría.'
      : 'Ejecutar sin plan es apostar. Ahora tienes el plan. Lo que pase ya no depende del mercado — depende de si honras lo que escribiste.',
  };

  // ── Share logic — generates /resultado/:data link with PEDEM payload ──
  const generateShareUrl = () => {
    // Build compact fields for the shared result page
    const fields: Record<string, string> = {};
    if (path === 'novice') {
      if (data.nov_morning) fields.morning = data.nov_morning;
      if (data.nov_afternoon) fields.afternoon = data.nov_afternoon;
      if (data.nov_night) fields.night = data.nov_night;
      if (data.nov_goal) fields.goal = data.nov_goal;
      if (data.nov_metric) fields.metric = data.nov_metric;
      if (data.nov_vision) fields.vision = data.nov_vision;
    } else if (path === 'routine') {
      if (data.rou_body) fields.body = data.rou_body;
      if (data.rou_analysis) fields.analysis = data.rou_analysis;
      if (data.rou_intention) fields.intention = data.rou_intention;
      if (data.rou_improvement) fields.improvement = data.rou_improvement;
    } else if (path === 'trade') {
      if (data.tra_asset) fields.asset = data.tra_asset;
      if (data.tra_direction) fields.direction = DIRECTION_MAP[data.tra_direction] || data.tra_direction;
      if (data.tra_setup) fields.setup = data.tra_setup;
      if (data.tra_entry) fields.entry = data.tra_entry;
      if (data.tra_stop) fields.stop = data.tra_stop;
      if (data.tra_target) fields.target = data.tra_target;
      if (data.tra_hypothesis) fields.hypothesis = data.tra_hypothesis;
    }

    const payload = {
      t: 'pedem',
      n: userName,
      path,
      pl: PATH_LABELS[path],
      f: fields,
    };
    // UTF-8 safe base64
    const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    return `https://reto.ingresarios.net/resultado/${b64}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generateShareUrl());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSocialShare = (platform: 'whatsapp' | 'twitter' | 'facebook' | 'linkedin') => {
    const pathNames: Record<PedemPath, string> = {
      novice: 'Mi Día PEDEM',
      routine: 'Mi Rutina Pre-Mercado',
      trade: 'Mi Plan de Trade',
    };
    const text = encodeURIComponent(
      `Acabo de completar "${pathNames[path]}" con el método PEDEM de GENY LAB. 📋 Planear → Ejecutar → Documentar → Mejorar.`
    );
    const url = encodeURIComponent(generateShareUrl());
    const links: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    };
    window.open(links[platform], '_blank');
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="pb-16 space-y-8 w-full">
      <Link to="/app/actividades"
        className="inline-flex items-center gap-2 text-brand-text-muted hover:text-white transition-colors uppercase font-black text-xs tracking-[0.2em]">
        <ChevronLeft className="w-4 h-4" /> Volver a Actividades
      </Link>

      {/* Results Title & Main CTA */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-brand-green/10 border border-brand-green/20 p-6 rounded-2xl relative overflow-hidden mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-green/10 to-transparent -translate-x-full animate-shimmer" />
        <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white relative z-10 text-center md:text-left">
          Resultados Bitácora PEDEM
        </h2>
        <button
          onClick={() => navigate('/app/leccion/pedem?action=complete')}
          className="btn-primary w-full md:w-auto px-8 py-4 rounded-xl text-sm md:text-base font-black uppercase tracking-[0.15em] flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(1,228,126,0.4)] hover:shadow-[0_0_40px_rgba(1,228,126,0.6)] hover:scale-105 transition-all relative z-10 group overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-2">
            Completar Actividad
            <ChevronRight className="w-5 h-5" />
          </span>
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-shimmer" />
        </button>
      </div>

      <div className="glass-card p-8 md:p-12 border-t-2 border-t-brand-green relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-green/10 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-brand-green" />

        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-start">
          
          {/* Left Column */}
          <div className="space-y-6 text-left">
            <div className="text-xs tracking-[0.3em] uppercase text-brand-text-muted font-black">
              PEDEM COMPLETADO
            </div>

            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
              {t.main}{' '}
              <span className="title-highlight">{t.highlight}</span>
            </h2>

            <p className="text-white/85 text-base leading-[1.7] font-medium max-w-lg">
              {userName}, acabas de hacer lo que el 95% no hace.{' '}
              <span className="text-brand-green font-black">{t.sub}</span>
            </p>

            {/* Plan summary card */}
            <div className="glass-card p-5 text-left border-t-2 border-t-brand-blue/30 max-w-md w-full">
              {path === 'novice' && <>
                <Row label="Mañana" value={data.nov_morning} />
                <Row label="Tarde" value={data.nov_afternoon} />
                <Row label="Noche" value={data.nov_night} color="text-brand-blue" />
                <Row label="Meta" value={data.nov_goal} color="text-brand-green" />
                <Row label="Hábitos" value={`${(data.nov_habits || []).length}/5 activos`} />
                <Row label="Indicador" value={data.nov_metric} color="text-brand-blue" />
                <Row label="Visión 21d" value={data.nov_vision} />
              </>}
              {path === 'routine' && <>
                <Row label="-30min" value={data.rou_body} />
                <Row label="-20min" value={data.rou_analysis} />
                <Row label="-5min" value={data.rou_intention} color="text-brand-blue" />
                <Row label="Reglas" value={`${(data.rou_checklist || []).length}/4 activas`} />
                {data.rou_shadow && <Row label="Sombra" value={SHADOW_MAP[data.rou_shadow]} color="text-brand-orange" />}
                <Row label="Mejora 21d" value={data.rou_improvement} color="text-brand-green" />
              </>}
              {path === 'trade' && <>
                <Row label="Activo" value={data.tra_asset} color="text-brand-blue" />
                <Row label="Dirección" value={DIRECTION_MAP[data.tra_direction] || ''} />
                <Row label="Setup" value={data.tra_setup} />
                <Row label="Entrada" value={`$${data.tra_entry}`} color="text-brand-blue" />
                <Row label="Stop" value={`$${data.tra_stop}`} color="text-brand-orange" />
                <Row label="Target" value={`$${data.tra_target}`} color="text-brand-green" />
                {rr && <Row label="R:R" value={`1 : ${rr}`} color="text-brand-blue" />}
                <Row label="Checklist" value={`${(data.tra_checklist || []).length}/4`} />
                <Row label="Hipótesis" value={data.tra_hypothesis} />
                {data.tra_shadow && <Row label="Sombra" value={SHADOW_MAP[data.tra_shadow]} color="text-brand-orange" />}
              </>}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8 flex flex-col justify-center h-full">
            {/* Closing quote */}
            <div className="glass-card p-5 border-l-[3px] border-l-brand-blue/30 text-left max-w-md w-full">
              <p className="text-sm text-white/70 italic leading-relaxed">{closingMessages[path]}</p>
              <p className="text-xs tracking-[0.2em] uppercase text-brand-blue font-black mt-2">— Juan Villegas</p>
            </div>

            {/* Review */}
            <div className="w-full flex flex-col gap-3 max-w-md">
              {/* Removed Marcar Actividad como Completada (Moved to Top) */}
              <button onClick={onRestart}
                className="px-6 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-brand-text-muted hover:bg-white/10 hover:text-white transition-all font-bold cursor-pointer">
                ↻ Hacer otro PEDEM
              </button>
            </div>

            {/* ── Share Section (same as TrampasDinero / RetoADN) ── */}
            <div className="pt-8 border-t border-white/5 space-y-4 text-center">
              <div className="flex items-center justify-center gap-3">
                <Share2 className="w-5 h-5 text-brand-green" />
                <span className="font-black uppercase tracking-tight text-sm">
                  Comparte tu logro
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-lg mx-auto">
                <button
                  onClick={() => handleSocialShare('whatsapp')}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-all text-sm font-black text-white/80 hover:text-white cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-[#25D366]" /> WhatsApp
                </button>
                <button
                  onClick={() => handleSocialShare('twitter')}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-black text-white/80 hover:text-white cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-white/70" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.258 5.63 5.906-5.63Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> X
                </button>
                <button
                  onClick={() => handleSocialShare('facebook')}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#1877F2]/10 border border-[#1877F2]/20 hover:bg-[#1877F2]/20 transition-all text-sm font-black text-white/80 hover:text-white cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#1877F2]" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073c0 6.028 4.388 11.024 10.125 11.927v-8.437H7.078v-3.49h3.047V9.42c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.929-1.956 1.883v2.263h3.328l-.532 3.49h-2.796v8.437C19.612 23.097 24 18.1 24 12.073z"/></svg> 
                </button>
                <button
                  onClick={() => handleSocialShare('linkedin')}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#0A66C2]/10 border border-[#0A66C2]/20 hover:bg-[#0A66C2]/20 transition-all text-sm font-black text-white/80 hover:text-white cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#0A66C2]" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </button>
              </div>

              <button
                onClick={handleCopyLink}
                className={`mx-auto flex items-center justify-center gap-3 px-6 py-3 rounded-xl border transition-all font-black uppercase tracking-widest text-xs cursor-pointer ${
                  copiedLink
                    ? 'bg-brand-green/10 border-brand-green/30 text-brand-green'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {copiedLink ? (
                  <>
                    <Check className="w-5 h-5" /> ¡LINK COPIADO!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" /> COPIAR LINK
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
