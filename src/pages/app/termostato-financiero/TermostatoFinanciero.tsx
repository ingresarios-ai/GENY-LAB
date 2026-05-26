// @ts-nocheck
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ChevronRight, RotateCcw, Download, Thermometer as ThermIcon } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import confetti from 'canvas-confetti';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { saveActivityProgressDB, loadActivityProgressDB, clearActivityProgressDB } from '../../../lib/activitySync';
import { Thermometer3D, getTempLevel, CAT_LABELS, RADAR_KEYS, TEMP_LEVELS } from './helpers';
import ShareModule from '../../../components/ShareModule';
import ResultActions from '../../../components/ResultActions';
import CompletionBanner from '../../../components/CompletionBanner';
import { initPdfWithHeader, addPdfText, checkPageBreak } from '../../../utils/pdfUtils';

function Spinner() {
  return (<div className="flex items-center gap-1.5 py-1">{[0,1,2].map(i=>(<motion.div key={i} className="w-2 h-2 rounded-full bg-cyan-400" animate={{scale:[.8,1,.8],opacity:[.3,1,.3]}} transition={{repeat:Infinity,duration:1.2,delay:i*.2,ease:"easeInOut"}}/>))}</div>);
}

export default function TermostatoFinanciero() {
  const [searchParams] = useSearchParams();
  const [screen, setScreen] = useState<'welcome'|'loading-ai'|'chat'|'result'>('welcome');
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<any>(null);
  const [turns, setTurns] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      if (searchParams.get('reset') === 'true') {
        await clearActivityProgressDB('termostato');
        setSearchParams({}, { replace: true });
        return;
      }
      if (searchParams.get('view') === 'results') {
        try {
          const saved = await loadActivityProgressDB('termostato');
          if (saved && saved.metadata) { setDiagnosis(saved.metadata); setScreen('result'); }
        } catch(e) { console.error(e); }
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [messages, loading]);
  useEffect(() => { if (screen==='chat'&&!loading&&!analyzing) setTimeout(()=>inputRef.current?.focus({preventScroll:true}),100); }, [screen,loading,analyzing]);

  const callEdge = async (msgs: any[], mode: string) => {
    const { data, error } = await supabase.functions.invoke('chat-termostato', { body: { messages: msgs, mode } });
    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error);
    return data.content;
  };

  const startInterview = async () => {
    window.scrollTo(0,0);
    setScreen('loading-ai');
    try {
      const reply = await callEdge([{role:'user',content:'Comienza la evaluación del termostato financiero'}],'interview');
      const clean = reply.replace('[ANÁLISIS_LISTO]','').trim();
      setMessages([{role:'assistant',content:clean}]);
    } catch(e) {
      setMessages([{role:'assistant',content:'Hola. Soy GENY, tu analista de Termóstato Financiero. Cuéntame, ¿qué es lo primero que aprendiste sobre el dinero en tu casa cuando eras niño?'}]);
    }
    setScreen('chat');
  };

  const sendMessage = async () => {
    if (!input.trim()||loading||analyzing) return;
    const userMsg = input.trim(); setInput('');
    const newTurns = turns+1; setTurns(newTurns);
    const updated = [...messages,{role:'user',content:userMsg}];
    setMessages(updated); setLoading(true);
    try {
      const apiMsgs = updated.map(m=>({role:m.role,content:m.content}));
      const reply = await callEdge(apiMsgs,'interview');
      const isDone = reply.includes('[ANÁLISIS_LISTO]');
      const clean = reply.replace('[ANÁLISIS_LISTO]','').trim();
      setMessages([...updated,{role:'assistant',content:clean}]); setLoading(false);
      if (isDone||newTurns>=11) {
        const transMsg = 'Perfecto. Ya tengo toda la información que necesito. Voy a procesar tu perfil de termostato financiero — dame unos segundos para analizar tus patrones y generar el diagnóstico.';
        setTimeout(()=>setMessages(prev=>[...prev,{role:'assistant',content:transMsg}]),800);
        setTimeout(async()=>{
          setAnalyzing(true);
          try {
            const diagText = await callEdge(apiMsgs,'diagnose');
            let jsonStr = diagText;
            const match = diagText.match(/```json([\s\S]*?)```/);
            if (match) jsonStr = match[1];
            const parsed = JSON.parse(jsonStr.trim());
            setDiagnosis(parsed);
            await saveActivityProgressDB('termostato', parsed, true);
            setScreen('result');
            setTimeout(()=>confetti({particleCount:120,spread:70,origin:{y:0.5},colors:['#00D4FF','#FFD700','#f97316','#ef4444']}),300);
          } catch(e) {
            console.error('Diagnosis Error:',e);
            const fb = {puntaje_global:45,temperatura_label:'Templado',categorias:{programacion:40,setpoint:50,neuronas_espejo:45,adaptacion:42,merecimiento:48,disciplina:44},arquetipo:'El Niño Inocente',arquetipo_desc:'Busca seguridad y evita el riesgo por miedo a perder lo poco que tiene.',tags_patron:['#escasez','#miedo_al_riesgo','#zona_de_confort'],fortalezas:['Conciencia de sus limitaciones','Deseo genuino de mejorar'],sombras:['Miedo paralizante ante decisiones financieras','Creencia de no merecer abundancia','Dependencia de validación externa'],diagnostico_breve:'Tu termostato financiero está calibrado en modo supervivencia. Aunque tienes la capacidad de crecer, tu programación de origen te mantiene en un rango cómodo pero limitante.',primer_paso:'Esta semana, escribe 3 creencias sobre el dinero que escuchaste en tu infancia y junto a cada una escribe una versión opuesta que te empodere.'};
            setDiagnosis(fb); await saveActivityProgressDB('termostato', fb, true);
            setScreen('result'); setTimeout(()=>confetti({particleCount:100,spread:70}),300);
          }
          setAnalyzing(false);
        },3500);
      }
    } catch(e) {
      console.error(e);
      setMessages(prev=>[...prev,{role:'assistant',content:'Hubo un error de conexión. Por favor, repite tu respuesta.'}]);
      setLoading(false); setTurns(turns-1);
    }
  };

  const reset = () => { setScreen('welcome'); setMessages([]); setInput(''); setLoading(false); setAnalyzing(false); setDiagnosis(null); setTurns(0); };

  const generatePDF = async () => {
    if (!diagnosis) return;
    const d = diagnosis;
    const doc = new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
    let y = initPdfWithHeader(doc, 'Termóstato Financiero');
    const W=210,M=18;

    doc.setTextColor(15, 23, 42); // slate-900
    doc.setFontSize(42); 
    doc.setFont('helvetica', 'bold');
    doc.text(`${d.puntaje_global}°`, M, y);
    doc.setFontSize(18); 
    doc.text(d.temperatura_label, M + 40, y); 
    y += 10;
    
    y = addPdfText(doc, `Arquetipo: ${d.arquetipo}`, y, { fontSize: 10, color: [100, 116, 139] });
    y += 2;
    y = addPdfText(doc, d.arquetipo_desc || '', y, { fontSize: 10, color: [51, 65, 85], lineHeight: 6 });
    y += 8;

    y = addPdfText(doc, 'DIAGNÓSTICO', y, { fontSize: 10, color: [0, 212, 255], fontStyle: 'bold' });
    y += 4;
    y = addPdfText(doc, d.diagnostico_breve, y, { fontSize: 11, color: [51, 65, 85], lineHeight: 6 });
    y += 8;
    
    // Attempt to capture the radar chart
    if (chartRef.current) {
      try {
        const canvas = await html2canvas(chartRef.current, { scale: 2, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');
        const imgProps = doc.getImageProperties(imgData);
        const pdfWidth = W - 2*M;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        y = checkPageBreak(doc, y, pdfHeight + 10);
        doc.addImage(imgData, 'PNG', M, y, pdfWidth, pdfHeight);
        y += pdfHeight + 10;
      } catch (e) {
        console.error('Error capturing chart', e);
      }
    }

    y = addPdfText(doc, 'DIMENSIONES', y, { fontSize: 10, color: [0, 212, 255], fontStyle: 'bold' });
    y += 4;
    
    Object.entries(d.categorias||{}).forEach(([k,v])=>{
      y = checkPageBreak(doc, y, 10);
      doc.setTextColor(100, 116, 139); doc.setFontSize(9); doc.setFont('helvetica', 'normal');
      doc.text(CAT_LABELS[k]||k, M, y);
      doc.text(`${v}°`, W-M, y, {align:'right'});
      doc.setFillColor(226, 232, 240); doc.rect(M, y+2, W-2*M, 3, 'F'); // slate-200 background
      doc.setFillColor(0, 212, 255); doc.rect(M, y+2, (W-2*M)*(v as number)/100, 3, 'F');
      y += 10;
    });
    y += 6;

    y = addPdfText(doc, 'FORTALEZAS', y, { fontSize: 10, color: [16, 185, 129], fontStyle: 'bold' });
    y += 4;
    (d.fortalezas||[]).forEach((f:string,i:number)=>{
      y = addPdfText(doc, `${i+1}. ${f}`, y, { fontSize: 10, color: [51, 65, 85], lineHeight: 6 });
    });
    y += 6;

    y = addPdfText(doc, 'SOMBRAS A INTEGRAR', y, { fontSize: 10, color: [239, 68, 68], fontStyle: 'bold' });
    y += 4;
    (d.sombras||[]).forEach((s:string,i:number)=>{
      y = addPdfText(doc, `${i+1}. ${s}`, y, { fontSize: 10, color: [51, 65, 85], lineHeight: 6 });
    });
    y += 6;

    y = addPdfText(doc, 'PRIMER PASO ESTA SEMANA', y, { fontSize: 10, color: [0, 212, 255], fontStyle: 'bold' });
    y += 4;
    y = addPdfText(doc, d.primer_paso, y, { fontSize: 11, color: [15, 23, 42], lineHeight: 6, fontStyle: 'bold' });
    
    doc.save('termostato-financiero.pdf');
  };

  // ═══ WELCOME ═══
  if (screen==='welcome') {
    return (
      <div className="max-w-5xl mx-auto space-y-10 pb-12">
        <Link to="/app/leccion/termostato" className="inline-flex items-center gap-2 text-brand-text-muted hover:text-white transition-colors uppercase font-black text-xs tracking-[0.2em] mb-2">
          <ArrowLeft className="w-4 h-4"/> Regresar
        </Link>
        <div className="min-h-[70vh] flex flex-col justify-center">
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 text-left">
              <div className="flex justify-center md:justify-start"><Thermometer3D idle={true} animated={false} color="#00D4FF" height={200}/></div>
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-none">Termóstato <br className="hidden md:block"/><span className="title-highlight">Financiero</span></h1>
                <p className="text-brand-text-muted font-medium text-lg md:text-xl leading-relaxed max-w-md">Diagnóstico conversacional con IA para descubrir el punto de ajuste interno con el que regulas tu relación con el dinero.</p>
              </div>
              <button onClick={startInterview} className="btn-primary w-full md:w-auto px-8 py-5 rounded-2xl text-sm font-black uppercase tracking-[0.15em] flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(0,209,255,0.3)] hover:shadow-[0_0_40px_rgba(0,209,255,0.5)] transition-all bg-gradient-to-r from-brand-blue to-cyan-500 text-white">
                INICIAR DIAGNÓSTICO <ChevronRight className="w-5 h-5"/>
              </button>
              <p className="text-white/20 text-xs font-black uppercase tracking-widest">T. Harv Eker · Carl Jung · Neurociencia</p>
            </div>
            <div className="glass-card p-8 text-left space-y-8 h-full flex flex-col justify-center border-t-2 border-t-brand-blue/40 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/8 via-transparent to-brand-green/5 pointer-events-none"/>
              <div className="relative z-10 space-y-8">
                {[{num:'01',color:'text-brand-blue',t:'Chat Inmersivo',s:'Conversa con GENY sobre tu relación con el dinero.'},{num:'02',color:'text-cyan-400',t:'6 Dimensiones',s:'Programación, emociones, entorno, adaptación, merecimiento y hábitos.'},{num:'03',color:'text-[#FEDD04]',t:'Tu Diagnóstico',s:'Recibe tu temperatura, arquetipo y primer paso de acción.'}].map((r,i)=>(
                  <div key={i} className="flex gap-5 items-start">
                    <span className={`${r.color} font-black text-3xl min-w-[40px] opacity-80 pt-1`}>{r.num}</span>
                    <div><div className="font-black uppercase tracking-tight text-lg">{r.t}</div><div className="text-brand-text-muted text-sm font-medium mt-1">{r.s}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ═══ LOADING AI ═══
  if (screen==='loading-ai') {
    return (
      <div className="fixed inset-x-0 top-0 md:top-16 bottom-[72px] md:bottom-0 z-[45] bg-[#080c14] flex flex-col items-center justify-center">
        <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} className="flex flex-col items-center gap-6 text-center px-6">
          <motion.div animate={{y:[0,-8,0]}} transition={{repeat:Infinity,duration:2,ease:"easeInOut"}} className="text-6xl md:text-7xl">🌡️</motion.div>
          <div className="space-y-3">
            <motion.p animate={{opacity:[0.5,1,0.5]}} transition={{repeat:Infinity,duration:2,ease:"easeInOut"}} className="text-lg md:text-xl font-black uppercase tracking-[0.2em] text-brand-blue">Iniciando AI</motion.p>
            <p className="text-sm text-brand-text-muted font-medium">Conectando con la red neuronal de GENY...</p>
          </div>
          <Spinner/>
        </motion.div>
      </div>
    );
  }

  // ═══ ANALYZING ═══
  if (analyzing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] py-20">
        <div className="text-center space-y-6">
          <div className="flex justify-center"><Thermometer3D idle={true} animated={false} color="#00D4FF" height={120}/></div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-blue mb-3">Procesando tu Termóstato</p>
            <p className="text-sm md:text-base text-brand-text-muted max-w-sm leading-relaxed mb-6">Analizando patrones, dimensiones y la arquitectura emocional de tus respuestas...</p>
          </div>
          <div className="flex justify-center"><Spinner/></div>
        </div>
      </div>
    );
  }

  // ═══ CHAT ═══
  if (screen==='chat') {
    return (
      <div className="fixed inset-x-0 top-0 md:top-16 bottom-[72px] md:bottom-0 z-[45] bg-[#080c14] flex flex-col">
        {/* Top bar */}
        <div className="max-w-3xl w-full mx-auto px-4 pt-8 pb-2">
          <button onClick={reset} className="inline-flex items-center gap-2 text-brand-text-muted hover:text-white transition-colors uppercase font-black text-xs tracking-[0.2em]">
            <ArrowLeft className="w-4 h-4"/> Volver a Actividades
          </button>
        </div>

        <div className="flex-1 max-w-3xl w-full mx-auto px-4 pb-4 flex flex-col min-h-0">
        <div className="flex-1 flex flex-col glass-card relative overflow-hidden min-h-0">
          {/* Chat Header */}
          <div className="px-5 py-4 border-b border-white/10 flex items-center gap-4 bg-white/5 shrink-0 z-10">
            <div className="w-10 h-10 rounded-full bg-brand-blue/10 border border-brand-blue/30 flex items-center justify-center text-xl shrink-0">🌡️</div>
            <div className="flex-1">
              <div className="text-sm font-bold text-white">GENY</div>
              <div className="text-xs text-brand-text-muted">Analista de Termóstato Financiero · INGRESARIOS</div>
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              {Math.min(turns, 10)} / 10
            </div>
          </div>

          {/* Chat Messages */}
          <div ref={chatRef} className="flex-1 overflow-y-auto p-5 space-y-5">
            {messages.map((m,i)=>(
              <motion.div key={i} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}>
                <div className={`max-w-[85%] px-5 py-3.5 text-[15px] leading-relaxed ${m.role==='user'?'bg-brand-blue/15 border border-brand-blue/30 rounded-2xl rounded-tr-sm text-white':'bg-[#0d1117] border border-white/10 rounded-2xl rounded-tl-sm text-slate-200'}`}>
                  {m.content}
                </div>
              </motion.div>
            ))}
            {loading&&(
              <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex justify-start">
                <div className="bg-[#0d1117] border border-white/10 rounded-2xl rounded-tl-sm px-5 py-4"><Spinner/></div>
              </motion.div>
            )}
            <div ref={bottomRef} className="h-2"/>
          </div>

          {/* Input Area */}
          {!analyzing&&(
            <div className="p-4 border-t border-white/10 bg-[#0d1117] shrink-0 z-10 flex gap-3 items-end">
              <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();}}} placeholder="Escribe tu respuesta aquí..." disabled={loading||analyzing} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-[15px] text-white resize-none outline-none focus:border-brand-blue/50 focus:bg-brand-blue/5 transition-all disabled:opacity-50 min-h-[52px] max-h-[120px]" rows={1}/>
              <button onClick={sendMessage} disabled={!input.trim()||loading||analyzing} className={`p-3.5 rounded-xl flex items-center justify-center transition-all shrink-0 h-[52px] w-[52px] ${(!input.trim()||loading)?'bg-white/5 text-brand-text-muted cursor-not-allowed':'bg-brand-blue text-white shadow-[0_0_15px_rgba(0,209,255,0.3)] hover:scale-105'}`}>
                <ChevronRight className="w-5 h-5"/>
              </button>
            </div>
          )}
        </div>
        </div>
      </div>
    );
  }

  // ═══ RESULTS ═══
  if (screen==='result'&&diagnosis) {
    const d = diagnosis, tl = getTempLevel(d.puntaje_global);
    const radarData = RADAR_KEYS.map(k=>({axis:CAT_LABELS[k]||k,value:(d.categorias||{})[k]||0}));
    return (
      <div className="max-w-5xl mx-auto px-4 pb-20">


        <CompletionBanner lessonId="termostato" />

        <ResultActions 
          onDownloadPDF={generatePDF} 
          onReset={reset} 
        />
        {/* Hero */}
        <div className="grid md:grid-cols-[auto_1fr] gap-12 items-center mb-16">
          <div className="flex justify-center"><Thermometer3D score={d.puntaje_global} color={tl.color} height={320}/></div>
          <div>
            <p className="text-xs font-mono text-white/40 tracking-widest mb-2 uppercase">↓ Tu Puntaje</p>
            <div className="flex items-baseline gap-4 mb-4">
              <span className="text-7xl md:text-8xl font-black font-mono" style={{color:tl.color}}>{d.puntaje_global}°</span>
              <div><div className="text-2xl font-bold" style={{color:tl.color}}>{d.temperatura_label}</div><p className="text-xs font-mono text-white/40 mt-1">RANGO {tl.range}</p></div>
            </div>
            {d.tags_patron&&<div className="flex flex-wrap gap-2 mb-6">{d.tags_patron.map((t:string,i:number)=>(<span key={i} className="text-[11px] font-mono px-3 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">{t}</span>))}</div>}
            <p className="text-white/70 text-base leading-relaxed">{d.diagnostico_breve}</p>
          </div>
        </div>
        {/* Arquetipo + Radar */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="glass-card p-8 border-t-2 border-t-[#FFD700]/40">
            <p className="text-xs font-mono text-[#FFD700] tracking-widest mb-4 uppercase">↓ Arquetipo Junguiano</p>
            <h2 className="text-3xl font-black text-[#FFD700] mb-3">{d.arquetipo}</h2>
            <p className="text-white/70 text-base leading-relaxed">{d.arquetipo_desc}</p>
          </div>
          <div className="glass-card p-6" ref={chartRef}>
            <p className="text-xs font-mono text-cyan-400 tracking-widest mb-2 uppercase">↓ Radar de Dimensiones</p>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}><PolarGrid stroke="rgba(255,255,255,0.1)"/><PolarAngleAxis dataKey="axis" tick={{fill:'#9ca3af',fontSize:10}}/><Radar dataKey="value" stroke="#00D4FF" fill="#00D4FF" fillOpacity={0.25} strokeWidth={2}/></RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        {/* Bars */}
        <div className="glass-card p-8 mb-12">
          <p className="text-xs font-mono text-cyan-400 tracking-widest mb-6 uppercase">↓ Desglose por Dimensión</p>
          <div className="grid md:grid-cols-2 gap-x-10 gap-y-5">
            {RADAR_KEYS.map(k=>{const v=(d.categorias||{})[k]||0;const c=getTempLevel(v).color;return(
              <div key={k}>
                <div className="flex justify-between mb-1.5"><span className="text-xs font-mono text-white/50 uppercase tracking-wider">{CAT_LABELS[k]}</span><span className="text-sm font-mono text-white font-semibold">{v}°</span></div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-1000" style={{width:`${v}%`,background:c,boxShadow:`0 0 8px ${c}80`}}/></div>
              </div>
            );})}
          </div>
        </div>
        {/* Fortalezas + Sombras */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="glass-card p-8 border-t-2 border-t-emerald-500/40">
            <p className="text-xs font-mono text-emerald-400 tracking-widest mb-5 uppercase">↑ Fortalezas</p>
            {(d.fortalezas||[]).map((f:string,i:number)=>(<div key={i} className="flex gap-4 mb-4"><span className="text-sm font-mono text-emerald-400">0{i+1}</span><span className="text-base text-white/80 leading-relaxed">{f}</span></div>))}
          </div>
          <div className="glass-card p-8 border-t-2 border-t-red-500/40">
            <p className="text-xs font-mono text-red-400 tracking-widest mb-5 uppercase">↓ Sombras a Integrar</p>
            {(d.sombras||[]).map((s:string,i:number)=>(<div key={i} className="flex gap-4 mb-4"><span className="text-sm font-mono text-red-400">0{i+1}</span><span className="text-base text-white/80 leading-relaxed">{s}</span></div>))}
          </div>
        </div>
        {/* Primer paso */}
        <div className="glass-card p-10 border-t-2 border-t-cyan-500/40 bg-gradient-to-br from-cyan-500/5 to-[#FFD700]/5 mb-12">
          <p className="text-xs font-mono text-cyan-400 tracking-widest mb-4 uppercase">→ Primer Paso esta Semana</p>
          <p className="text-xl md:text-2xl font-semibold text-white leading-relaxed">{d.primer_paso}</p>
        </div>

        <div className="mb-12">
          <ShareModule activity="termostato" title="Termóstato Financiero" resultData={diagnosis} />
        </div>

        <div className="text-center"><p className="text-[9px] font-mono text-white/20 tracking-widest uppercase">INGRESARIOS · GENY LAB · TERMÓSTATO FINANCIERO<br/>T. HARV EKER · CARL JUNG · RIZZOLATTI · BRICKMAN & CAMPBELL · SCHULTZ</p></div>
      </div>
    );
  }
  return null;
}
