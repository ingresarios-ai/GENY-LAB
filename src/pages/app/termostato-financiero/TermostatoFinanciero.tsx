// @ts-nocheck
import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ChevronRight, RotateCcw, Download, Thermometer as ThermIcon } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import confetti from 'canvas-confetti';
import jsPDF from 'jspdf';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { Thermometer3D, getTempLevel, CAT_LABELS, RADAR_KEYS, TEMP_LEVELS } from './helpers';

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

  useEffect(() => {
    if (searchParams.get('view') === 'results') {
      try {
        const saved = localStorage.getItem('termostato-diagnosis');
        if (saved) { setDiagnosis(JSON.parse(saved)); setScreen('result'); }
      } catch(e) { console.error(e); }
    }
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
    const greeting = 'Hola. Soy GENY, tu analista de Termóstato Financiero. Vamos a tener una conversación que revelará cómo tu mente regula tu relación con el dinero — tu "punto de ajuste" interno. No hay respuestas correctas ni incorrectas.';
    try {
      const reply = await callEdge([{role:'user',content:'Comienza la evaluación del termostato financiero'}],'interview');
      const clean = reply.replace('[ANÁLISIS_LISTO]','').trim();
      setMessages([{role:'assistant',content:greeting},{role:'assistant',content:'Empecemos. '+clean}]);
    } catch(e) {
      setMessages([{role:'assistant',content:greeting},{role:'assistant',content:'Empecemos. Cuéntame, ¿qué es lo primero que aprendiste sobre el dinero en tu casa cuando eras niño?'}]);
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
            localStorage.setItem('termostato-diagnosis',JSON.stringify(parsed));
            setScreen('result');
            setTimeout(()=>confetti({particleCount:120,spread:70,origin:{y:0.5},colors:['#00D4FF','#FFD700','#f97316','#ef4444']}),300);
          } catch(e) {
            console.error('Diagnosis Error:',e);
            const fb = {puntaje_global:45,temperatura_label:'Templado',categorias:{programacion:40,setpoint:50,neuronas_espejo:45,adaptacion:42,merecimiento:48,disciplina:44},arquetipo:'El Niño Inocente',arquetipo_desc:'Busca seguridad y evita el riesgo por miedo a perder lo poco que tiene.',tags_patron:['#escasez','#miedo_al_riesgo','#zona_de_confort'],fortalezas:['Conciencia de sus limitaciones','Deseo genuino de mejorar'],sombras:['Miedo paralizante ante decisiones financieras','Creencia de no merecer abundancia','Dependencia de validación externa'],diagnostico_breve:'Tu termostato financiero está calibrado en modo supervivencia. Aunque tienes la capacidad de crecer, tu programación de origen te mantiene en un rango cómodo pero limitante.',primer_paso:'Esta semana, escribe 3 creencias sobre el dinero que escuchaste en tu infancia y junto a cada una escribe una versión opuesta que te empodere.'};
            setDiagnosis(fb); localStorage.setItem('termostato-diagnosis',JSON.stringify(fb));
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

  const generatePDF = () => {
    if (!diagnosis) return;
    const d = diagnosis, tl = getTempLevel(d.puntaje_global);
    const doc = new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
    const W=210,M=18; let y=20;
    doc.setFillColor(8,12,15); doc.rect(0,0,W,297,'F');
    doc.setFillColor(0,212,255); doc.rect(0,0,W,3,'F');
    doc.setTextColor(0,212,255); doc.setFontSize(9); doc.text('INGRESARIOS · GENY LAB',M,y);
    doc.setTextColor(100); doc.text('TERMÓSTATO FINANCIERO',W-M,y,{align:'right'}); y+=16;
    doc.setTextColor(255); doc.setFontSize(42); doc.text(`${d.puntaje_global}°`,M,y);
    doc.setFontSize(18); doc.text(d.temperatura_label,M+40,y); y+=10;
    doc.setFontSize(10); doc.setTextColor(150); doc.text(`Arquetipo: ${d.arquetipo}`,M,y); y+=6;
    doc.text(d.arquetipo_desc||'',M,y,{maxWidth:W-2*M}); y+=14;
    doc.setTextColor(0,212,255); doc.setFontSize(9); doc.text('DIAGNÓSTICO',M,y); y+=6;
    doc.setTextColor(200); doc.setFontSize(11);
    const lines = doc.splitTextToSize(d.diagnostico_breve,W-2*M);
    doc.text(lines,M,y); y+=lines.length*6+8;
    doc.setTextColor(0,212,255); doc.setFontSize(9); doc.text('DIMENSIONES',M,y); y+=7;
    Object.entries(d.categorias).forEach(([k,v])=>{
      doc.setTextColor(150); doc.setFontSize(9); doc.text(CAT_LABELS[k]||k,M,y);
      doc.text(`${v}°`,W-M,y,{align:'right'});
      doc.setFillColor(30,30,40); doc.rect(M,y+2,W-2*M,3,'F');
      doc.setFillColor(0,212,255); doc.rect(M,y+2,(W-2*M)*(v as number)/100,3,'F');
      y+=10;
    });
    y+=4;
    doc.setTextColor(16,185,129); doc.setFontSize(9); doc.text('FORTALEZAS',M,y); y+=6;
    d.fortalezas.forEach((f:string,i:number)=>{doc.setTextColor(200);doc.setFontSize(10);doc.text(`${i+1}. ${f}`,M,y);y+=6;});
    y+=4;
    doc.setTextColor(239,68,68); doc.setFontSize(9); doc.text('SOMBRAS A INTEGRAR',M,y); y+=6;
    d.sombras.forEach((s:string,i:number)=>{doc.setTextColor(200);doc.setFontSize(10);doc.text(`${i+1}. ${s}`,M,y);y+=6;});
    y+=6;
    doc.setTextColor(0,212,255); doc.setFontSize(9); doc.text('PRIMER PASO ESTA SEMANA',M,y); y+=6;
    doc.setTextColor(255); doc.setFontSize(11);
    const pasoLines = doc.splitTextToSize(d.primer_paso,W-2*M);
    doc.text(pasoLines,M,y);
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
      <div className="fixed inset-0 bg-brand-bg z-50 flex items-center justify-center">
        <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} className="text-center space-y-6">
          <div className="text-5xl animate-pulse">🌡️</div>
          <div className="space-y-2"><p className="text-white font-black text-lg uppercase tracking-widest">Iniciando IA</p><p className="text-brand-text-muted text-sm">Conectando con la red neuronal de GENY...</p></div>
          <Spinner/>
        </motion.div>
      </div>
    );
  }

  // ═══ CHAT ═══
  if (screen==='chat') {
    return (
      <div className="fixed inset-0 bg-brand-bg z-40 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-brand-bg/90 backdrop-blur-md">
          <div className="flex items-center gap-2"><ThermIcon className="w-4 h-4 text-cyan-400"/><span className="text-[10px] font-black text-cyan-400 tracking-widest uppercase">TERMÓSTATO · DIAGNÓSTICO</span></div>
          <div className="text-[10px] font-mono text-white/40">{turns}/11</div>
        </div>
        <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {messages.map((m,i)=>(
            <motion.div key={i} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}>
              <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed ${m.role==='user'?'bg-cyan-500/15 border border-cyan-500/30 text-white':'bg-white/5 border border-white/10 text-white/90'}`}>
                {m.role==='assistant'&&<div className="text-[10px] font-black text-cyan-400 tracking-widest mb-1.5 uppercase">GENY</div>}
                {m.content}
              </div>
            </motion.div>
          ))}
          {loading&&<div className="flex justify-start"><div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5"><div className="text-[10px] font-black text-cyan-400 tracking-widest mb-1.5">GENY</div><Spinner/></div></div>}
          {analyzing&&<motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex justify-center py-8"><div className="text-center space-y-4"><div className="text-4xl animate-pulse">🌡️</div><p className="text-white font-black text-sm uppercase tracking-widest">Analizando termostato...</p><p className="text-brand-text-muted text-xs">Procesando patrones financieros</p><Spinner/></div></motion.div>}
          <div ref={bottomRef}/>
        </div>
        {!analyzing&&(
          <div className="border-t border-white/10 bg-brand-bg/90 backdrop-blur-md px-4 py-3">
            <div className="max-w-3xl mx-auto flex gap-3">
              <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();}}} placeholder="Escribe tu respuesta..." rows={1} disabled={loading} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-[15px] placeholder-white/30 resize-none focus:outline-none focus:border-cyan-500/50"/>
              <button onClick={sendMessage} disabled={!input.trim()||loading} className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-white/10 disabled:text-white/30 text-black font-bold px-5 rounded-xl transition-all text-sm">Enviar</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ═══ RESULTS ═══
  if (screen==='result'&&diagnosis) {
    const d = diagnosis, tl = getTempLevel(d.puntaje_global);
    const radarData = RADAR_KEYS.map(k=>({axis:CAT_LABELS[k]||k,value:d.categorias[k]||0}));
    return (
      <div className="max-w-5xl mx-auto px-4 pb-20">
        <div className="flex items-center justify-between py-6 border-b border-white/10 mb-10">
          <div className="flex items-center gap-2"><ThermIcon className="w-4 h-4 text-cyan-400"/><span className="text-[10px] font-black text-cyan-400 tracking-widest uppercase">TERMÓSTATO · DIAGNÓSTICO</span></div>
          <div className="flex gap-3">
            <button onClick={generatePDF} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider hover:bg-cyan-500/20 transition-all"><Download className="w-4 h-4"/>PDF</button>
            <button onClick={reset} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/50 text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition-all"><RotateCcw className="w-4 h-4"/>Repetir</button>
          </div>
        </div>
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
          <div className="glass-card p-6">
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
            {RADAR_KEYS.map(k=>{const v=d.categorias[k]||0;const c=getTempLevel(v).color;return(
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
            {d.fortalezas.map((f:string,i:number)=>(<div key={i} className="flex gap-4 mb-4"><span className="text-sm font-mono text-emerald-400">0{i+1}</span><span className="text-base text-white/80 leading-relaxed">{f}</span></div>))}
          </div>
          <div className="glass-card p-8 border-t-2 border-t-red-500/40">
            <p className="text-xs font-mono text-red-400 tracking-widest mb-5 uppercase">↓ Sombras a Integrar</p>
            {d.sombras.map((s:string,i:number)=>(<div key={i} className="flex gap-4 mb-4"><span className="text-sm font-mono text-red-400">0{i+1}</span><span className="text-base text-white/80 leading-relaxed">{s}</span></div>))}
          </div>
        </div>
        {/* Primer paso */}
        <div className="glass-card p-10 border-t-2 border-t-cyan-500/40 bg-gradient-to-br from-cyan-500/5 to-[#FFD700]/5 mb-12">
          <p className="text-xs font-mono text-cyan-400 tracking-widest mb-4 uppercase">→ Primer Paso esta Semana</p>
          <p className="text-xl md:text-2xl font-semibold text-white leading-relaxed">{d.primer_paso}</p>
        </div>
        <div className="text-center"><p className="text-[9px] font-mono text-white/20 tracking-widest uppercase">INGRESARIOS · GENY LAB · TERMÓSTATO FINANCIERO<br/>T. HARV EKER · CARL JUNG · RIZZOLATTI · BRICKMAN & CAMPBELL · SCHULTZ</p></div>
      </div>
    );
  }
  return null;
}
