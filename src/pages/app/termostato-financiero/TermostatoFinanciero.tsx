import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft,  Thermometer, ChevronRight, ChevronLeft, CheckCircle2, BarChart3, Trophy, Calendar, Target, ShieldCheck, Zap, ArrowRight, RefreshCcw, Share2, Lock, Copy, Check, X as XIcon, MessageCircle  } from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  ResponsiveContainer 
} from 'recharts';
import confetti from 'canvas-confetti';

import { Category, UserData, ChallengeDay } from './types';
import { QUESTIONS, LEVELS, RETO_DAYS } from './constants';
import { useNavigate } from 'react-router-dom';


const TermostatoFinanciero = () => {
  const user = { id: "local-user" };
  const navigate = useNavigate();
  const [step, setStep] = useState<'onboarding' | 'quiz' | 'results' | 'challenge'>('onboarding');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [userData, setUserData] = useState<UserData | null>(null);
  const [challengeDays, setChallengeDays] = useState<ChallengeDay[]>(RETO_DAYS);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Build shareable URL from current results
  const getShareUrl = useCallback(() => {
    if (!userData || !user) return '';
    const payload = {
      n: 'Trader',
      s: userData.totalScore,
      c: userData.scores,
    };
    const encoded = btoa(JSON.stringify(payload));
    return `${window.location.origin}/resultado/${encoded}`;
  }, [userData, user]);

  const shareText = userData
    ? `🔥 Mi Termostato Financiero es: ${userData.level.title} (${userData.totalScore}/40). ¿Cuál es el tuyo? Descúbrelo en el Reto 2k a 20k 👇`
    : '';

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

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'noopener,noreferrer,width=600,height=400');
    }
    setShowShareModal(false);
  };

  const handleCopyLink = async () => {
    const url = getShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
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

  // Load progress from Supabase
  useEffect(() => {}, []);

  const handleAnswer = (points: number) => {
    const questionId = QUESTIONS[currentQuestionIndex].id;
    setAnswers(prev => ({ ...prev, [questionId]: points }));

    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      calculateResults();
    }
  };

  const calculateResults = () => {
    const scores: Record<Category, number> = {
      'Mentalidad': 0,
      'Gestión': 0,
      'Disciplina': 0,
      'Visión': 0,
      'Entorno': 0
    };

    QUESTIONS.forEach(q => {
      scores[q.category] += answers[q.id] || 0;
    });

    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    const level = LEVELS.find(l => totalScore >= l.min && totalScore <= l.max) || LEVELS[0];

    const newUserData: UserData = {
      scores,
      totalScore,
      level,
      completedAt: new Date().toISOString()
    };

    setUserData(newUserData);
    // Save to Supabase
    // local persistence
    setStep('results');
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: [level.color, '#FFFFFF', '#000000']
    });
  };

  const toggleChallengeDay = (dayIndex: number) => {
    const newDays = [...challengeDays];
    newDays[dayIndex].completed = !newDays[dayIndex].completed;
    setChallengeDays(newDays);
    // Save to Supabase
    // local persistence
    
    if (newDays[dayIndex].completed) {
      confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.8 }
      });
    }
  };

  const resetQuiz = () => {
    if (window.confirm('¿Estás seguro de que quieres reiniciar tu termostato financiero? Se perderán tus resultados actuales.')) {
      setAnswers({});
      setCurrentQuestionIndex(0);
      setUserData(null);
      setStep('onboarding');
      // local persistence
    }
  };

  // Radar Chart Data
  const radarData = userData ? Object.entries(userData.scores).map(([name, value]) => ({
    subject: name,
    A: value,
    fullMark: 8 // Assuming 2 questions per category, max 4 points each
  })) : [];

  return (
    <div className="min-h-screen pb-20">
      <AnimatePresence mode="wait">
        {/* ONBOARDING */}
        {step === 'onboarding' && (
          <div className="max-w-5xl mx-auto space-y-10 pb-12">
            <button onClick={() => navigate('/app/actividades')} className="inline-flex items-center gap-2 text-brand-text-muted hover:text-white transition-colors uppercase font-black text-xs tracking-[0.2em] mb-6">
              <ArrowLeft className="w-4 h-4" /> Volver a Actividades
            </button>

            <div className="min-h-[70vh] flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid md:grid-cols-2 gap-12 items-center"
              >
                <div className="space-y-8 text-left">
                  <div className="text-6xl md:text-8xl mb-4 animate-float">🌡️</div>
                  <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-[1.1] text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50">
                      TERMOSTATO<br />FINANCIERO
                    </h1>
                    <p className="text-brand-text-muted font-medium text-lg md:text-xl leading-relaxed max-w-md">
                      ¿Por qué algunos ganan 10k y los pierden, mientras otros escalan a 100k con calma? <br />
                      Mide tu capacidad mental de retener capital.
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setStep('quiz')}
                    className="btn-primary w-full md:w-auto px-8 py-5 rounded-2xl text-sm font-black uppercase tracking-[0.15em] flex items-center justify-center gap-3"
                    style={{ backgroundColor: 'var(--brand-yellow)', color: '#000' }}
                  >
                    Comenzar diagnóstico
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="glass-card p-8 text-left space-y-8 h-full flex flex-col justify-center">
                  {[
                    { num: '01', color: 'text-brand-yellow', t: 'Diagnóstico', s: 'Mide tu capacidad emocional y financiera' },
                    { num: '02', color: 'text-brand-yellow', t: 'Análisis', s: 'Identifica tus techos de cristal' },
                    { num: '03', color: 'text-brand-yellow', t: 'Expansión', s: 'Reto de 10 días para elevar tu nivel' },
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
        )}

        {/* QUIZ */}
        {step === 'quiz' && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-2xl mx-auto py-10 space-y-10"
          >
            <div className="flex items-center justify-between mb-8">
              <button 
                onClick={() => currentQuestionIndex > 0 ? setCurrentQuestionIndex(i => i - 1) : setStep('onboarding')}
                className="p-2 rounded-full hover:bg-white/5 text-brand-text-muted transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div className="flex gap-1">
                {QUESTIONS.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentQuestionIndex ? 'w-8 bg-brand-yellow' : 
                      i < currentQuestionIndex ? 'w-4 bg-brand-yellow/40' : 'w-4 bg-white/10'
                    }`} 
                  />
                ))}
              </div>
              <span className="text-xs font-black text-brand-text-muted uppercase tracking-widest">
                {currentQuestionIndex + 1} / {QUESTIONS.length}
              </span>
            </div>

            <div className="space-y-10">
              <div className="space-y-4">
                <span className="text-xs font-black uppercase tracking-[0.3em] text-brand-yellow px-3 py-1 bg-brand-yellow/10 rounded-full border border-brand-yellow/20">
                  {QUESTIONS[currentQuestionIndex].category}
                </span>
                <h2 className="text-3xl font-black uppercase tracking-tight leading-tight">
                  {QUESTIONS[currentQuestionIndex].text}
                </h2>
              </div>

              <div className="grid gap-4">
                {QUESTIONS[currentQuestionIndex].options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(option.points)}
                    className="p-6 text-left glass-card border-white/10 hover:border-brand-yellow/40 hover:bg-brand-yellow/5 transition-all group flex items-center justify-between"
                  >
                    <span className="text-lg font-medium text-brand-text-muted group-hover:text-white transition-colors">
                      {option.text}
                    </span>
                    <div className="w-8 h-8 rounded-full border-2 border-white/10 group-hover:border-brand-yellow flex items-center justify-center transition-all">
                      <div className="w-4 h-4 rounded-full bg-brand-yellow opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* RESULTS */}
        {step === 'results' && userData && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-6xl mx-auto py-10 space-y-12"
          >
            {/* Results Title & Main CTA */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-brand-green/10 border border-brand-green/20 p-6 rounded-2xl relative overflow-hidden mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-green/10 to-transparent -translate-x-full animate-shimmer" />
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white relative z-10 text-center md:text-left">
                Resultados Termostato Financiero
              </h2>
              <button
                onClick={() => navigate('/app/leccion/termostato?action=complete')}
                className="btn-primary w-full md:w-auto px-8 py-4 rounded-xl text-sm md:text-base font-black uppercase tracking-[0.15em] flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(1,228,126,0.4)] hover:shadow-[0_0_40px_rgba(1,228,126,0.6)] hover:scale-105 transition-all relative z-10 group overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Completar Actividad
                  <ChevronRight className="w-5 h-5" />
                </span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-shimmer" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Left Column: Level & Stats */}
              <div className="lg:col-span-5 space-y-8">
                <div className="glass-card p-10 space-y-6 relative overflow-hidden">
                  <div 
                    className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[100px] opacity-20"
                    style={{ backgroundColor: userData.level.color }}
                  />
                  
                  <div className="space-y-2 relative z-10">
                    <span className="text-xs font-black uppercase tracking-widest text-brand-text-muted">Tu Resultado Actual</span>
                    <h2 className="text-5xl font-black uppercase tracking-tighter" style={{ color: userData.level.color }}>
                      {userData.level.title}
                    </h2>
                  </div>

                  <p className="text-brand-text-muted text-lg font-medium leading-relaxed relative z-10">
                    {userData.level.description}
                  </p>

                  <div className="pt-6 border-t border-white/10 relative z-10 space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted">Puntaje Total</span>
                        <div className="text-3xl font-black">{userData.totalScore} <span className="text-sm text-white/30">/ 40</span></div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowShareModal(true)}
                      className="w-full py-4 px-6 rounded-xl bg-brand-green/10 hover:bg-brand-green/20 text-brand-green border border-brand-green/20 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      <Share2 className="w-5 h-5" />
                      Comparte tu Resultado
                    </button>
                    <button 
                      onClick={resetQuiz}
                      className="w-full py-3 px-6 rounded-xl bg-white/5 hover:bg-white/10 text-brand-text-muted hover:text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all"
                    >
                      <RefreshCcw className="w-4 h-4" />
                      Volver a Hacer el Test
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(userData.scores).map(([cat, score]) => (
                    <div key={cat} className="glass-card p-6 border-white/5 bg-white/[0.02] space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted">{cat}</span>
                      <div className="flex items-end gap-2">
                        <div className="text-2xl font-black">{score as number}</div>
                        <div className="h-1 flex-grow bg-white/5 rounded-full overflow-hidden mb-2">
                          <div 
                            className="h-full bg-brand-yellow" 
                            style={{ width: `${((score as number) / 8) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Radar Chart & Action */}
              <div className="lg:col-span-7 space-y-8">
                <div className="glass-card p-8 h-[450px] flex flex-col items-center justify-center">
                  <h3 className="text-xs font-black uppercase tracking-widest text-brand-text-muted mb-8">Mapa de Perfil Financiero</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 900 }} 
                      />
                      <Radar
                        name="Termostato"
                        dataKey="A"
                        stroke={userData.level.color}
                        fill={userData.level.color}
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="glass-card p-8 border-brand-yellow/20 bg-brand-yellow/5 flex flex-col md:flex-row items-center gap-8">
                  <div className="w-20 h-20 rounded-full bg-brand-yellow/20 flex items-center justify-center shrink-0">
                    <Trophy className="w-10 h-10 text-brand-yellow" />
                  </div>
                  <div className="space-y-4 text-center md:text-left flex-grow">
                    <h4 className="text-xl font-black uppercase tracking-tight">¿Listo para subir de nivel?</h4>
                    <p className="text-brand-text-muted text-sm font-medium leading-relaxed">
                      Hemos diseñado un reto de 10 días basado en tus resultados para expandir tu termostato financiero.
                    </p>
                    <button 
                      onClick={() => setStep('challenge')}
                      className="px-8 py-4 bg-brand-yellow text-black font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all flex items-center gap-2 mx-auto md:mx-0"
                    >
                      Iniciar Reto 10 Días
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* CHALLENGE */}
        {step === 'challenge' && (
          <motion.div
            key="challenge"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto py-10 space-y-12"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setStep('results')}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-brand-text-muted transition-all"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="space-y-1">
                  <h2 className="text-3xl font-black uppercase tracking-tight">Reto de <span className="text-brand-yellow">10 Días</span></h2>
                  <p className="text-brand-text-muted text-sm font-medium">Expansión de Capacidad Financiera</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 glass-card px-6 py-4 border-white/5">
                <div className="text-center">
                  <div className="text-2xl font-black text-brand-yellow">
                    {challengeDays.filter(d => d.completed).length} / 10
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted">Días Completados</div>
                </div>
                <div className="w-32 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-yellow transition-all duration-500" 
                    style={{ width: `${(challengeDays.filter(d => d.completed).length / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challengeDays.map((day, index) => (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`glass-card p-6 flex flex-col h-full transition-all duration-300 ${
                    day.completed ? 'border-brand-green/30 bg-brand-green/5' : 'border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm ${
                      day.completed ? 'bg-brand-green text-black' : 'bg-white/10 text-white/40'
                    }`}>
                      {day.day}
                    </div>
                    {day.completed && <CheckCircle2 className="w-6 h-6 text-brand-green" />}
                  </div>

                  <div className="space-y-4 flex-grow">
                    <h3 className={`text-xl font-black uppercase tracking-tight ${day.completed ? 'text-brand-green' : 'text-white'}`}>
                      {day.title}
                    </h3>
                    <p className="text-brand-text-muted text-sm font-medium leading-relaxed">
                      {day.description}
                    </p>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-brand-yellow">Misión del Día</span>
                      <p className="text-xs font-medium italic text-white/70">"{day.task}"</p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleChallengeDay(index)}
                    className={`mt-8 w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      day.completed 
                        ? 'bg-brand-green/10 text-brand-green border border-brand-green/20 hover:bg-brand-green/20' 
                        : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {day.completed ? 'Completado' : 'Marcar como Hecho'}
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl border border-white/10 p-8 space-y-6"
              style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #0a0a1a 100%)' }}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black uppercase tracking-tight text-white">Compartir</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-brand-text-muted hover:text-white transition-all"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>

              <p className="text-brand-text-muted text-sm font-medium leading-relaxed">
                Comparte tu resultado <span className="font-black" style={{ color: userData?.level.color }}>{userData?.level.title}</span> con tus amigos y rétales a descubrir el suyo.
              </p>

              {/* Share Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-all group"
                >
                  <MessageCircle className="w-6 h-6 text-[#25D366]" />
                  <span className="text-sm font-black text-white/80 group-hover:text-white">WhatsApp</span>
                </button>

                <button
                  onClick={() => handleShare('facebook')}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-[#1877F2]/10 border border-[#1877F2]/20 hover:bg-[#1877F2]/20 transition-all group"
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#1877F2]" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073c0 6.028 4.388 11.024 10.125 11.927v-8.437H7.078v-3.49h3.047V9.42c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.929-1.956 1.883v2.263h3.328l-.532 3.49h-2.796v8.437C19.612 23.097 24 18.1 24 12.073z"/></svg>
                  <span className="text-sm font-black text-white/80 group-hover:text-white"></span>
                </button>

                <button
                  onClick={() => handleShare('linkedin')}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-[#0A66C2]/10 border border-[#0A66C2]/20 hover:bg-[#0A66C2]/20 transition-all group"
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#0A66C2]" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  <span className="text-sm font-black text-white/80 group-hover:text-white">LinkedIn</span>
                </button>

                <button
                  onClick={() => handleShare('twitter')}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                >
                  <XIcon className="w-6 h-6 text-white/70" />
                  <span className="text-sm font-black text-white/80 group-hover:text-white">X</span>
                </button>
              </div>

              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className={`w-full flex items-center justify-center gap-3 p-4 rounded-2xl border transition-all font-black uppercase tracking-widest text-xs ${
                  copied
                    ? 'bg-brand-green/10 border-brand-green/30 text-brand-green'
                    : 'bg-white/5 border-white/10 text-brand-text-muted hover:bg-white/10 hover:text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    ¡Link Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copiar Link
                  </>
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TermostatoFinanciero;
