// GENY LAB — Gamified Path (Horizontal Ecosystem Hub)

import { useMemo, useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Play, Check, ChevronLeft, ChevronRight, Trophy, Flame, X, Zap, GraduationCap } from 'lucide-react';
import { LESSONS, getLevelForXp, getXpProgressInLevel, PHASE_LABELS, type Lesson } from '../../lib/lessons';
import { getProgress, isLessonUnlocked, isLessonCompleted, getCompletedCount, isAllCompleted } from '../../lib/progressStore';
import { Logo } from '../../components/Logo';
import { loadAllActivitiesProgressDB } from '../../lib/activitySync';

export default function PathMap() {
  const navigate = useNavigate();
  const [tick, setTick] = useState(0);
  const progress = useMemo(() => getProgress(), [tick]);
  const level = getLevelForXp(progress.totalXp);
  const xpInLevel = getXpProgressInLevel(progress.totalXp);
  const completedCount = getCompletedCount();
  const allDone = isAllCompleted();

  // Re-read progress after background sync has had time to finish
  useEffect(() => {
    const t = setTimeout(() => setTick(1), 1500);
    return () => clearTimeout(t);
  }, []);

  const carouselRef = useRef<HTMLDivElement>(null);
  const currentCardRef = useRef<HTMLDivElement>(null);
  const desktopCurrentCardRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Auto-scroll to current card
  useEffect(() => {
    setTimeout(() => {
      if (window.innerWidth < 768 && currentCardRef.current) {
        currentCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (window.innerWidth >= 768 && desktopCurrentCardRef.current) {
        desktopCurrentCardRef.current.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }, 600);
  }, []);

  const [showWelcomeModal, setShowWelcomeModal] = useState(() => {
    return localStorage.getItem('geny_lab_hide_welcome') !== 'true';
  });
  const [dbActivities, setDbActivities] = useState<any[]>([]);
  const [pendingActivity, setPendingActivity] = useState<{
    id: string;
    title: string;
    emoji: string;
    route: string;
    statusText: string;
  } | null>(null);
  const [showPendingModal, setShowPendingModal] = useState(false);

  // Scan for pending/unfinished activities
  useEffect(() => {
    (async () => {
      try {
        const progressList = await loadAllActivitiesProgressDB();
        if (progressList) {
          setDbActivities(progressList);
        }

        const hasShown = sessionStorage.getItem('geny_lab_pending_reminder_shown') === 'true';
        if (hasShown) return;

        if (!progressList || progressList.length === 0) return;

        const pendingItems: Array<{
          id: string;
          title: string;
          emoji: string;
          route: string;
          statusText: string;
          order: number;
        }> = [];

        for (const item of progressList) {
          if (item.completed_at) continue;

          const lesson = LESSONS.find(l => l.id === item.activity_id);
          if (!lesson) continue;

          if (!isLessonUnlocked(lesson.order)) continue;

          const meta = item.metadata;
          if (!meta) continue;

          let statusText = '';
          if (item.activity_id === 'sombra' || item.activity_id === 'flow') {
            const compDays = meta.completedDays || {};
            let next = 1;
            for (let i = 1; i <= 10; i++) {
              if (!compDays[i]) {
                next = i;
                break;
              }
              if (i === 10) next = 10;
            }
            statusText = `Día ${next} de 10`;
          } else if (item.activity_id === 'trampas') {
            const count = Object.keys(meta.responses || {}).length;
            statusText = `Pregunta ${Math.min(count + 1, 10)} de 10`;
          } else if (item.activity_id === 'gastos') {
            statusText = 'En progreso';
          } else if (item.activity_id === 'pedem') {
            statusText = 'Armando bitácora';
          } else {
            statusText = 'En progreso';
          }

          pendingItems.push({
            id: item.activity_id,
            title: lesson.title.replace('\n', ' '),
            emoji: lesson.emoji,
            route: lesson.activityRoute,
            statusText,
            order: lesson.order
          });
        }

        if (pendingItems.length > 0) {
          pendingItems.sort((a, b) => b.order - a.order);
          setPendingActivity(pendingItems[0]);
          setTimeout(() => {
            setShowPendingModal(true);
            sessionStorage.setItem('geny_lab_pending_reminder_shown', 'true');
          }, 2500);
        }
      } catch (err) {
        console.error('Error fetching pending activities:', err);
      }
    })();
  }, []);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // ── Typewriter quotes ────────────────────────────────────────────────
  const QUOTES = [
    "No necesitas adivinar el mercado, necesitas aprender a leerlo.",
    "Un trader disciplinado vale más que una estrategia perfecta.",
    "El mercado premia la paciencia, no la impulsividad.",
    "Primero domina tus emociones; después domina el gráfico.",
    "Cada operación es una lección. Cada bitácora, una evolución.",
    "No operes por emoción. Opera por estructura.",
    "El trader novato busca ganancias rápidas. El profesional construye consistencia.",
    "El éxito en trading no llega por suerte, llega por repetición inteligente.",
    "Hoy no necesitas ser perfecto. Solo necesitas ser mejor que ayer.",
    "El que se expone, se exponencia.",
    "La visualización es backtesting emocional.",
    "Sin prisa, sin pausa y tan rápido como quede bien hecho.",
  ];

  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const currentQuote = QUOTES[quoteIndex];
    if (isTyping) {
      if (displayedText.length < currentQuote.length) {
        const timer = setTimeout(() => {
          setDisplayedText(currentQuote.slice(0, displayedText.length + 1));
        }, 35);
        return () => clearTimeout(timer);
      } else {
        // Done typing — pause, then start next
        const pause = setTimeout(() => {
          setIsTyping(false);
        }, 4000);
        return () => clearTimeout(pause);
      }
    } else {
      // Reset and move to next quote
      setDisplayedText('');
      setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
      setIsTyping(true);
    }
  }, [displayedText, isTyping, quoteIndex]);

  const handleCloseWelcome = () => {
    if (dontShowAgain) {
      localStorage.setItem('geny_lab_hide_welcome', 'true');
    }
    setShowWelcomeModal(false);
  };

  const checkScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft) < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current && carouselRef.current.firstElementChild) {
      const cardWidth = carouselRef.current.firstElementChild.clientWidth;
      const gap = 24; // gap-6
      const scrollAmount = cardWidth + gap;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleNodeClick = (lesson: Lesson) => {
    if (!isLessonUnlocked(lesson.order)) return;
    navigate(`/app/leccion/${lesson.id}`);
  };

  return (
    <div className="pb-tab-bar w-full flex flex-col items-center">
      


      {/* Welcome Modal */}
      <AnimatePresence>
        {showWelcomeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={handleCloseWelcome}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg glass-panel rounded-3xl p-6 md:p-8 flex flex-col border border-[#00D1FF]/20 shadow-[0_0_50px_rgba(0,209,255,0.15)] overflow-hidden"
            >
              <button 
                onClick={handleCloseWelcome}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>

              <div className="mb-6 mt-2">
                <div className="flex items-center gap-2 text-[#00D1FF] font-mono text-xs mb-4 uppercase tracking-widest">
                  <div className="w-2 h-2 bg-[#00D1FF] animate-pulse rounded-sm"></div>
                  INICIALIZANDO SISTEMA
                </div>
                <h1 className="text-3xl font-bold uppercase tracking-tight text-white mb-4 leading-none">
                  Conexión a<br /><span className="text-[#00D1FF] font-light">GENY LAB</span>
                </h1>
                <p className="text-white/60 text-sm md:text-base font-medium leading-relaxed">
                  Sigue tu ruta paso a paso. Cada lección te acerca más a dominar tus finanzas.
                </p>
                <ul className="mt-6 space-y-4 text-sm text-white/60 font-mono">
                  <li className="flex gap-3 items-start">
                    <Play className="text-[#00D1FF] shrink-0 mt-0.5" size={16} />
                    <span><strong className="text-white font-sans tracking-wide">MIRA EL VIDEO:</strong> Aprende el concepto clave de cada lección.</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <Check className="text-[#00E676] shrink-0 mt-0.5" size={16} />
                    <span><strong className="text-white font-sans tracking-wide">COMPLETA EL RETO:</strong> Pon en práctica lo aprendido con una actividad.</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <Lock className="text-white/40 shrink-0 mt-0.5" size={16} />
                    <span><strong className="text-white font-sans tracking-wide">DESBLOQUEA:</strong> Al avanzar se abren nuevas lecciones y herramientas.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-auto pt-4 border-t border-white/10 flex flex-col gap-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5 rounded border border-white/20 bg-black/40 group-hover:border-[#00D1FF]/50 transition-colors">
                    <input 
                      type="checkbox" 
                      className="peer sr-only"
                      checked={dontShowAgain}
                      onChange={(e) => setDontShowAgain(e.target.checked)}
                    />
                    <Check size={14} className="text-[#00D1FF] opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-sm text-white/50 group-hover:text-white/80 transition-colors font-mono">No volver a mostrar</span>
                </label>
                
                <button 
                  onClick={handleCloseWelcome}
                  className="w-full py-4 rounded-lg font-mono tracking-widest uppercase text-[#00D1FF] bg-[#00D1FF]/10 border border-[#00D1FF]/30 hover:bg-[#00D1FF]/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Zap size={16} /> INICIAR SECUENCIA
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pending Activity Reminder Modal */}
      <AnimatePresence>
        {showPendingModal && pendingActivity && (
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
              onClick={() => setShowPendingModal(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-md glass-panel rounded-3xl p-6 md:p-8 flex flex-col border border-brand-yellow/30 shadow-[0_0_50px_rgba(242,197,0,0.15)] overflow-hidden text-center"
            >
              {/* Background ambient glow */}
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-brand-yellow/10 blur-[50px] pointer-events-none" />

              <button 
                onClick={() => setShowPendingModal(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>

              <div className="mb-6 mt-4 flex flex-col items-center">
                <motion.div 
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="w-16 h-16 rounded-2xl bg-brand-yellow/15 border border-brand-yellow/30 flex items-center justify-center text-3xl mb-6 shadow-[0_0_20px_rgba(242,197,0,0.1)]"
                >
                  {pendingActivity.emoji}
                </motion.div>
                
                <span className="bg-brand-yellow/20 text-brand-yellow px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-widest border border-brand-yellow/30 mb-3">
                  ⚠️ RETO EN PROGRESO
                </span>
                
                <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-3">
                  ¿Continuamos tu entrenamiento?
                </h2>
                
                <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium max-w-sm">
                  Dejaste inconclusa la actividad de <span className="text-white font-bold">{pendingActivity.title}</span>. Mantén tu racha de aprendizaje para consolidar los conceptos:
                </p>

                {/* Progress Card */}
                <div className="w-full bg-white/5 rounded-2xl p-4 border border-white/10 flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{pendingActivity.emoji}</span>
                    <div className="text-left">
                      <h4 className="text-white font-bold text-sm leading-none mb-1">{pendingActivity.title}</h4>
                      <p className="text-slate-500 text-[10px] uppercase font-mono tracking-wider">Actividad de Aprendizaje</p>
                    </div>
                  </div>
                  <div className="bg-brand-yellow/10 border border-brand-yellow/30 text-brand-yellow px-3 py-1 rounded-lg text-xs font-mono font-bold">
                    {pendingActivity.statusText}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    setShowPendingModal(false);
                    navigate(pendingActivity.route);
                  }}
                  className="w-full cursor-pointer py-4 rounded-xl font-mono text-xs tracking-widest uppercase font-black text-black bg-brand-yellow hover:bg-yellow-400 active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(242,197,0,0.3)]"
                >
                  ⚡ CONTINUAR RETO
                </button>
                <button 
                  onClick={() => setShowPendingModal(false)}
                  className="w-full cursor-pointer py-3.5 rounded-xl font-mono text-xs tracking-widest uppercase font-bold text-slate-400 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 active:scale-[0.98] transition-all"
                >
                  Más tarde
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tech Header */}
      <div className="w-full flex flex-col items-start max-w-[1200px] mb-8 mt-4 md:mt-8 px-4 md:px-8 overflow-hidden">
        <div className="flex items-center gap-2 text-[#00D1FF] font-mono text-[9px] md:text-xs tracking-[0.15em] md:tracking-[0.2em] mb-2 uppercase">
          <span className="w-2 h-2 bg-[#00D1FF] animate-pulse rounded-sm shrink-0"></span>
          <span className="truncate">CONEXIÓN: ESTABLE // SINCRONIZACIÓN: ACTIVA</span>
        </div>
        <div className="mb-2">
          <Logo imgClassName="h-12 md:h-20 w-auto object-contain" />
        </div>
        <p className="text-white/50 text-xs md:text-sm mt-3 w-full font-mono leading-relaxed h-[3em] md:h-[2.5em]">
          <span className="text-[#00D1FF]/70">&gt;</span> {displayedText}<span className="inline-block w-[2px] h-[1em] bg-[#00D1FF]/70 ml-0.5 align-middle animate-pulse" />
        </p>
      </div>

      {/* ══════ MOBILE: Vertical Feed ══════ */}
      <div className="md:hidden w-full px-4 mb-16 flex flex-col gap-3">
        {LESSONS.map((lesson, idx) => {
          const completed = isLessonCompleted(lesson.id);
          const unlocked = isLessonUnlocked(lesson.order) || completed;
          const isCurrent = unlocked && !completed;

          // Compact card for completed/locked
          if (!isCurrent) {
            return (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                onClick={() => handleNodeClick(lesson)}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  completed
                    ? 'glass-panel border-emerald-500/20 cursor-pointer active:scale-[0.98]'
                    : unlocked
                    ? 'glass-panel cursor-pointer active:scale-[0.98]'
                    : 'bg-[#0A0B10] border-white/[0.04] opacity-50'
                }`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center border shrink-0 ${
                  completed ? 'bg-emerald-500/10 border-emerald-500/30' : unlocked ? 'bg-white/5 border-white/10' : 'bg-white/5 border-white/5'
                }`}>
                  {unlocked ? <span className="text-2xl">{lesson.emoji}</span> : <Lock size={16} className="text-white/30" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Nodo {lesson.order}</p>
                  <h3 className={`text-sm font-bold truncate ${completed ? 'text-white/80' : 'text-white/40'}`}>{lesson.title}</h3>
                </div>
                {completed && (
                  <div className="flex items-center gap-1 text-[#00E676] font-mono text-[9px] uppercase tracking-wider shrink-0">
                    <Check size={12} /> OK
                  </div>
                )}
                {!unlocked && (
                  <Lock size={14} className="text-white/20 shrink-0" />
                )}
              </motion.div>
            );
          }

          // Expanded current card
          const actProgress = dbActivities.find(a => a.activity_id === lesson.id);
          const actStarted = !!actProgress;
          const actCompleted = !!actProgress?.completed_at;

          return (
            <motion.div
              key={lesson.id}
              ref={currentCardRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              onClick={() => handleNodeClick(lesson)}
              className="relative rounded-xl overflow-hidden tech-panel-active cursor-pointer active:scale-[0.98] transition-transform"
            >
              <div className={`absolute inset-0 bg-gradient-to-b ${
                actStarted && !actCompleted
                  ? 'from-amber-500/15 via-transparent to-orange-600/15'
                  : 'from-cyan-500/15 via-transparent to-blue-600/15'
              } opacity-20`} />
              <div className="relative z-10 p-5 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                    actStarted && !actCompleted
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.2)]'
                      : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.2)]'
                  }`}>
                    <span className="text-3xl drop-shadow-md">{lesson.emoji}</span>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={`flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest border px-2 py-1 rounded-sm ${
                      actStarted && !actCompleted
                        ? 'text-amber-500 border-amber-500/30 bg-amber-500/10'
                        : 'text-[#00D1FF] border-[#00D1FF]/30 bg-[#00D1FF]/10'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-sm animate-pulse ${
                        actStarted && !actCompleted ? 'bg-amber-500' : 'bg-[#00D1FF]'
                      }`} />
                      {actStarted && !actCompleted ? 'EN CURSO' : 'EN PROGRESO'}
                    </div>
                    <div className={`px-3 py-1 rounded-sm border text-[10px] font-mono tracking-widest uppercase ${
                      actStarted && !actCompleted
                        ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                        : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400'
                    }`}>
                      {PHASE_LABELS[lesson.phase]}
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-mono tracking-widest text-white/50 mb-1 uppercase">NODO {lesson.order}</p>
                  <h2 className={`text-xl font-semibold tracking-[0.12em] leading-tight mb-2 ${
                    actStarted && !actCompleted ? 'text-amber-400' : 'text-[#00D1FF]'
                  }`}>{lesson.title}</h2>
                  <p className="text-xs font-mono text-white/60 leading-relaxed mb-4">&gt; {lesson.description}</p>
                </div>
                <div className={`inline-flex items-center gap-2 px-4 py-3 rounded-md font-mono text-xs uppercase tracking-wider w-full justify-center ${
                  actStarted && !actCompleted
                    ? 'bg-amber-500/10 border border-amber-500/40 text-amber-500 hover:bg-amber-500/20'
                    : 'bg-[#00D1FF]/10 border border-[#00D1FF]/40 text-[#00D1FF] hover:bg-[#00D1FF]/20'
                }`}>
                  {actStarted && !actCompleted ? 'CONTINUAR ACTIVIDAD' : 'INICIAR NODO'} <Play size={14} className={actStarted && !actCompleted ? 'fill-amber-500 stroke-none' : 'fill-[#00D1FF]'} />
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Final Reward Card - Mobile */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: LESSONS.length * 0.05 }}
          onClick={() => { if (allDone) navigate('/app/diagnostico'); }}
          className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
            allDone ? 'glass-panel border-[#F2C500]/30 cursor-pointer' : 'bg-[#0A0B10] border-white/[0.04] opacity-50'
          }`}
        >
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center border shrink-0 ${allDone ? 'bg-[#F2C500]/10 border-[#F2C500]/40 text-[#F2C500]' : 'bg-white/5 border-white/5 text-white/30'}`}>
            {allDone ? <GraduationCap size={18} /> : <Lock size={16} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Recompensa</p>
            <h3 className={`text-sm font-bold truncate ${allDone ? 'text-[#F2C500]' : 'text-white/40'}`}>
              {allDone ? '¡Acceso Liberado!' : 'Diagnóstico Final'}
            </h3>
          </div>
          {allDone && <GraduationCap size={14} className="text-[#F2C500] shrink-0" />}
        </motion.div>
      </div>

      {/* ══════ DESKTOP: Horizontal Carousel ══════ */}
      <div className="relative w-full mb-16 hidden md:block">
        {canScrollLeft && (
          <button onClick={() => scroll('left')} className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-30 cursor-pointer hover:scale-110 transition-transform focus:outline-none" aria-label="Izquierda">
            <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:bg-white/10">
              <ChevronLeft size={24} />
            </div>
          </button>
        )}
        {canScrollRight && (
          <button onClick={() => scroll('right')} className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-30 cursor-pointer hover:scale-110 transition-transform focus:outline-none" aria-label="Derecha">
            <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:bg-white/10">
              <ChevronRight size={24} />
            </div>
          </button>
        )}

        <div ref={carouselRef} onScroll={checkScroll} className="flex overflow-x-auto gap-6 snap-x snap-mandatory hide-scrollbar pb-8 pt-4 px-[calc(50vw-160px)]">
          {LESSONS.map((lesson, idx) => {
            const completed = isLessonCompleted(lesson.id);
            const unlocked = isLessonUnlocked(lesson.order) || completed;
            const isCurrent = unlocked && !completed;

            const actProgress = dbActivities.find(a => a.activity_id === lesson.id);
            const actStarted = !!actProgress;
            const actCompleted = !!actProgress?.completed_at;

            let gradient = 'from-white/5 to-white/5';
            let iconBg = 'bg-white/5 border-white/10 text-white/40';
            let badgeClass = 'border-white/10 bg-white/5 text-white/40';
            if (completed) {
              gradient = 'from-emerald-500/10 via-transparent to-teal-600/10';
              iconBg = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.2)]';
              badgeClass = 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400';
            } else if (isCurrent) {
              if (actStarted && !actCompleted) {
                gradient = 'from-amber-500/15 via-transparent to-orange-600/15';
                iconBg = 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.2)]';
                badgeClass = 'border-amber-500/30 bg-amber-500/10 text-amber-400';
              } else {
                gradient = 'from-cyan-500/15 via-transparent to-blue-600/15';
                iconBg = 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.2)]';
                badgeClass = 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400';
              }
            }
            return (
              <motion.div key={lesson.id} ref={isCurrent ? desktopCurrentCardRef : null} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: idx * 0.1 }} onClick={() => handleNodeClick(lesson)}
                className={`w-[320px] shrink-0 snap-start relative group rounded-xl overflow-hidden glass-panel h-[420px] flex flex-col transition-all duration-300 ${unlocked ? (isCurrent ? 'tech-panel-active cursor-pointer' : 'glass-panel-hover cursor-pointer hover:-translate-y-1') : 'cursor-not-allowed opacity-60 border-white/5'}`}>
                <div className={`absolute inset-0 bg-gradient-to-b ${gradient} opacity-20`} />
                {idx > 0 && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-white/10 rounded-r-sm" />}
                <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center backdrop-blur-md border transition-all duration-300 ${iconBg}`}>
                      {unlocked ? <span className="text-3xl drop-shadow-md">{lesson.emoji}</span> : <Lock size={22} />}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {isCurrent && (
                        <div className={`flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest border px-2 py-1 rounded-sm ${
                          actStarted && !actCompleted
                            ? 'text-amber-500 border-amber-500/30 bg-amber-500/10'
                            : 'text-[#00D1FF] border-[#00D1FF]/30 bg-[#00D1FF]/10'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-sm animate-pulse ${
                            actStarted && !actCompleted ? 'bg-amber-500' : 'bg-[#00D1FF]'
                          }`} />
                          {actStarted && !actCompleted ? 'EN CURSO' : 'EN PROGRESO'}
                        </div>
                      )}
                      {completed && (<div className="flex items-center gap-1.5 text-[#00E676] font-mono text-[9px] uppercase tracking-widest border border-[#00E676]/30 bg-[#00E676]/10 px-2 py-1 rounded-sm"><Check size={10} /> VERIFICADO</div>)}
                      <div className={`px-3 py-1 rounded-sm border text-[10px] font-mono tracking-widest uppercase ${badgeClass}`}>{PHASE_LABELS[lesson.phase]}</div>
                    </div>
                  </div>
                  <div className="mt-auto">
                    <div className="text-xs font-mono tracking-widest text-white/50 mb-2 uppercase">NODO {lesson.order}</div>
                    <h2 className={`min-h-[60px] whitespace-pre-line line-clamp-2 text-2xl font-semibold tracking-[0.12em] leading-tight mb-2 transition-colors duration-300 ${isCurrent ? (actStarted && !actCompleted ? 'text-amber-400' : 'text-[#00D1FF]') : completed ? 'text-white/90' : 'text-white/40'}`}>{lesson.title}</h2>
                    <p className={`text-sm font-mono mb-6 line-clamp-3 leading-relaxed ${isCurrent ? 'text-white/60' : 'text-white/30'}`}>&gt; {lesson.description}</p>
                    {completed ? (
                      <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#00E676]/10 border border-[#00E676]/30 text-[#00E676] font-mono text-xs uppercase tracking-wider w-full justify-center">ESTADO: COMPLETADO <Check size={14} /></div>
                    ) : isCurrent ? (
                      <div className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-md font-mono text-xs uppercase tracking-wider transition-colors duration-300 w-full justify-center ${
                        actStarted && !actCompleted
                          ? 'bg-amber-500/10 border border-amber-500/40 text-amber-500 hover:bg-amber-500/20'
                          : 'bg-[#00D1FF]/10 border border-[#00D1FF]/40 text-[#00D1FF] hover:bg-[#00D1FF]/20'
                      }`}>
                        {actStarted && !actCompleted ? 'CONTINUAR ACTIVIDAD' : 'INICIAR NODO'} <Play size={14} className={actStarted && !actCompleted ? 'fill-amber-500 stroke-none' : 'fill-[#00D1FF]'} />
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-white/5 border border-white/10 text-white/40 font-mono text-xs uppercase tracking-wider w-full justify-center">BLOQUEADO <Lock size={14} /></div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
          {/* Final Reward - Desktop */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: LESSONS.length * 0.1 }}
            onClick={() => { if (allDone) navigate('/app/diagnostico'); }}
            className={`w-[320px] shrink-0 snap-start relative group rounded-xl overflow-hidden glass-panel h-[360px] flex flex-col ${allDone ? 'tech-panel-active border-[#F2C500]/50 shadow-[0_0_30px_rgba(242,197,0,0.2)] cursor-pointer' : 'opacity-60 border-white/5'}`}>
            <div className={`absolute inset-0 bg-gradient-to-b ${allDone ? 'from-[#F2C500]/10 to-transparent' : 'from-white/5 to-transparent'} opacity-50`} />
            <div className="relative z-10 p-6 h-full flex flex-col justify-between items-center text-center">
              <div className={`w-14 h-14 rounded-lg flex items-center justify-center backdrop-blur-md border ${allDone ? 'bg-[#F2C500]/10 border-[#F2C500]/40 text-[#F2C500]' : 'bg-white/5 border-white/10 text-white/30'}`}>
                {allDone ? <GraduationCap size={24} /> : <Lock size={20} />}
              </div>
              <div className="mt-auto flex flex-col items-center w-full">
                <h2 className={`text-xl font-bold tracking-tight uppercase mb-2 ${allDone ? 'text-[#F2C500]' : 'text-white/40'}`}>{allDone ? '¡ACCESO LIBERADO!' : 'RECOMPENSA FINAL'}</h2>
                <p className="text-xs font-mono text-white/50 mb-6">&gt; Diagnóstico Financiero. Completa la red para acceder.</p>
                {allDone && (<button className="w-full py-3 rounded-md font-mono tracking-widest text-xs uppercase bg-[#F2C500]/10 border border-[#F2C500]/40 text-[#F2C500] hover:bg-[#F2C500]/20 transition-colors">RECLAMAR AHORA</button>)}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
