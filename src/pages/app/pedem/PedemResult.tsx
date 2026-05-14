import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Share2, Copy, Check, ChevronRight } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { initPdfWithHeader, addPdfText, checkPageBreak } from '../../../utils/pdfUtils';

import type { PedemPath } from './constants';
import { SHADOW_MAP, DIRECTION_MAP, PATH_LABELS } from './constants';
import ShareModule from '../../../components/ShareModule';
import ResultActions from '../../../components/ResultActions';
import CompletionBanner from '../../../components/CompletionBanner';

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

  const generatePDF = async () => {
    const doc = new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
    let y = initPdfWithHeader(doc, 'Bitácora PEDEM');
    const W=210,M=18;
    
    doc.setTextColor(15, 23, 42); // slate-900
    doc.setFontSize(28); 
    doc.setFont('helvetica', 'bold');
    doc.text(PATH_LABELS[path].toUpperCase(), M, y); 
    y += 12;

    y = addPdfText(doc, closingMessages[path], y, { fontSize: 11, color: [51, 65, 85], lineHeight: 6 });
    y += 10;
    
    const rows: {label: string, value: string}[] = [];
    if (path === 'novice') {
      rows.push({label: 'RUTINA MAÑANA', value: data.nov_morning || ''});
      rows.push({label: 'RUTINA TARDE', value: data.nov_afternoon || ''});
      rows.push({label: 'RUTINA NOCHE', value: data.nov_night || ''});
      rows.push({label: 'MI OBJETIVO', value: data.nov_goal || ''});
      rows.push({label: 'MI MÉTRICA DE ÉXITO', value: data.nov_metric || ''});
      rows.push({label: 'MI VISIÓN', value: data.nov_vision || ''});
    } else if (path === 'routine') {
      rows.push({label: 'PREP. FÍSICA', value: data.rou_body || ''});
      rows.push({label: 'PREP. TÉCNICA', value: data.rou_analysis || ''});
      rows.push({label: 'INTENCIÓN', value: data.rou_intention || ''});
      rows.push({label: 'MEJORA HOY', value: data.rou_improvement || ''});
    } else if (path === 'trade') {
      rows.push({label: 'ACTIVO', value: data.tra_asset || ''});
      rows.push({label: 'DIRECCIÓN', value: DIRECTION_MAP[data.tra_direction] || data.tra_direction || ''});
      rows.push({label: 'SETUP', value: data.tra_setup || ''});
      rows.push({label: 'ENTRADA', value: data.tra_entry || ''});
      rows.push({label: 'STOP LOSS', value: data.tra_stop || ''});
      rows.push({label: 'TARGET', value: data.tra_target || ''});
      if (rr) rows.push({label: 'RISK:REWARD', value: `1:${rr}`});
      rows.push({label: 'HIPÓTESIS', value: data.tra_hypothesis || ''});
    }

    rows.forEach(r => {
      y = checkPageBreak(doc, y, 20);
      
      y = addPdfText(doc, r.label, y, { fontSize: 9, color: [16, 185, 129], fontStyle: 'bold' });
      y += 4;
      
      y = addPdfText(doc, String(r.value), y, { fontSize: 11, color: [15, 23, 42], fontStyle: 'bold', lineHeight: 6 });
      y += 6;
    });

    doc.save(`pedem-${path}.pdf`);
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="pb-16 space-y-8 w-full">
      <CompletionBanner lessonId="pedem" />

      <ResultActions 
        onDownloadPDF={generatePDF} 
        onReset={onRestart} 
        resetLabel="Cambiar ruta PEDEM"
      />

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

            </div>

            {/* ── Share Section (same as TrampasDinero / RetoADN) ── */}
            <div className="pt-8 border-t border-white/5 space-y-4 text-center">
              <ShareModule 
                activity="pedem" 
                title="Mi Primer PEDEM" 
                resultData={{ path, data }} 
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
