// Ingresarios Lab — Lesson Screen (Video + Activity)

import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Play, Check, Lock, Sparkles, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { LESSONS, getLevelForXp, TOTAL_LESSONS } from '../../lib/lessons';
import { 
  getProgress, isLessonUnlocked,
  markVideoCompleted, markActivityCompleted, getCompletedCount,
} from '../../lib/progressStore';

export default function LessonScreen() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const lesson = LESSONS.find(l => l.id === lessonId);

  const [progress, setProgress] = useState(() => getProgress());
  const [videoMarked, setVideoMarked] = useState(() => {
    const lp = getProgress().lessonProgress[lessonId || ''];
    return lp?.videoCompleted ?? false;
  });
  const [activityDone, setActivityDone] = useState(() => {
    const lp = getProgress().lessonProgress[lessonId || ''];
    return lp?.activityCompleted ?? false;
  });
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{ name: string; emoji: string } | null>(null);
  const [showModuleUnlocked, setShowModuleUnlocked] = useState(false);
  const [xpAnimation, setXpAnimation] = useState<number | null>(null);
  const [showRepeatAlert, setShowRepeatAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showVideoAlert, setShowVideoAlert] = useState(false);

  // Sync state when lessonId changes (prevent stale state from previous lesson)
  useEffect(() => {
    window.scrollTo(0, 0);
    const p = getProgress();
    setProgress(p);
    const lp = p.lessonProgress[lessonId || ''];
    setVideoMarked(lp?.videoCompleted ?? false);
    setActivityDone(lp?.activityCompleted ?? false);
    setShowRepeatAlert(false);
    setShowVideoAlert(false);

    // Show a loading screen for a short duration to make the transition obvious
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [lessonId]);

  if (!lesson || !isLessonUnlocked(lesson.order)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-5 bg-[#070b14]">
        <Lock size={64} className="text-white/10 mb-6" />
        <h2 className="text-2xl font-black text-white/50 mb-2">Acceso Denegado</h2>
        <p className="text-brand-text-muted mb-8">Esta lección aún está bloqueada en tu ruta.</p>
        <button className="btn-secondary rounded-full px-8 py-3 gap-2" onClick={() => navigate('/app')}>
          <ArrowLeft size={18} /> Volver a la Ruta
        </button>
      </div>
    );
  }

  const completedCount = getCompletedCount();
  const remaining = TOTAL_LESSONS - completedCount;
  const progressPercent = (completedCount / TOTAL_LESSONS) * 100;

  const handleMarkVideo = () => {
    if (videoMarked) return;
    const result = markVideoCompleted(lesson.id);
    setVideoMarked(true);
    setProgress(getProgress());
    if (result.xpEarned > 0) {
      setXpAnimation(result.xpEarned);
      setTimeout(() => setXpAnimation(null), 1500);
    }
  };

  // Listen for return from micro-apps
  useEffect(() => {
    if (searchParams.get('action') === 'complete' && lesson) {
      // Remove query param to avoid re-triggering
      setSearchParams({}, { replace: true });
      
      if (!activityDone) {
        const result = markActivityCompleted(lesson.id);
        setActivityDone(true);
        setProgress(getProgress());

        if (result.xpEarned > 0) {
          setXpAnimation(result.xpEarned);
          setTimeout(() => setXpAnimation(null), 1500);
        }

        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#01E47E', '#00D1FF', '#ffffff'] });

        if (result.leveledUp) {
          setTimeout(() => {
            setLevelUpData({ name: result.newLevel.name, emoji: result.newLevel.emoji });
            setShowLevelUp(true);
            confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 }, zIndex: 400 });
          }, 800);
        } else {
          // If they didn't level up, but they just unlocked the next module
          const nextLesson = LESSONS.find(l => l.order === lesson.order + 1);
          if (nextLesson) {
            setTimeout(() => {
              setShowModuleUnlocked(true);
              confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 }, zIndex: 400 });
            }, 800);
          }
        }
      }
    }
  }, [searchParams, lesson, activityDone, setSearchParams]);

  const handleStartActivity = () => {
    if (!lesson) return;
    if (lesson.activityRoute) {
      navigate(lesson.activityRoute);
    } else {
      // Fallback: If no activityRoute, just mark as complete instantly
      if (activityDone) return;
      const result = markActivityCompleted(lesson.id);
      setActivityDone(true);
      setProgress(getProgress());

      if (result.xpEarned > 0) {
        setXpAnimation(result.xpEarned);
        setTimeout(() => setXpAnimation(null), 1500);
      }

      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#01E47E', '#00D1FF', '#ffffff'] });

      if (result.leveledUp) {
        setTimeout(() => {
          setLevelUpData({ name: result.newLevel.name, emoji: result.newLevel.emoji });
          setShowLevelUp(true);
          confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 }, zIndex: 400 });
        }, 800);
      } else {
        const nextL = LESSONS.find(l => l.order === lesson.order + 1);
        if (nextL) {
          setTimeout(() => {
            setShowModuleUnlocked(true);
            confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 }, zIndex: 400 });
          }, 800);
        }
      }
    }
  };

  const nextLesson = LESSONS.find(l => l.order === lesson.order + 1);

  return (
    <div className="pb-tab-bar px-5 max-w-[1440px] mx-auto min-h-screen">
      {/* Header / Breadcrumbs */}
      <div className="flex flex-wrap items-center gap-4 py-6 md:py-8 lg:mb-4">
        <button 
          onClick={() => navigate('/app')} 
          className="bg-white/5 hover:bg-white/10 border border-white/10 w-12 h-12 rounded-full flex shrink-0 items-center justify-center cursor-pointer text-white transition-all shadow-lg hover:shadow-[0_0_20px_rgba(0,209,255,0.2)] hover:-translate-x-1"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <div className="text-brand-cyan/80 text-xs font-bold tracking-widest uppercase mb-1">
            Módulo {lesson.order} de {TOTAL_LESSONS}
          </div>
          <div className="text-sm font-medium text-white/60">
            Nivel actual: <strong className="text-white">{getLevelForXp(progress.totalXp).name}</strong>
          </div>
        </div>
      </div>

      {/* Full Width Lesson Header */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 lg:mb-10"
      >
        <div className="flex items-center gap-4 md:gap-6 mb-4">
          <div className="text-5xl md:text-6xl lg:text-7xl">{lesson.emoji}</div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-[1.1] text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50">
            {lesson.title.replace('\n', ' ')}
          </h1>
        </div>
        <p className="text-brand-text-muted/90 text-base md:text-lg lg:text-xl font-medium truncate">
          {lesson.description}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8 lg:gap-12 pb-12">
        {/* LEFT COLUMN: Cinematic Video */}
        <div className="flex flex-col gap-6">

          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
            className="relative"
          >
            {/* Cinematic Glow Behind Video */}
            <div className="absolute -inset-10 bg-[#00D1FF]/10 blur-[100px] rounded-full pointer-events-none"></div>
            
            <div className="glass-panel p-2 md:p-3 rounded-3xl relative overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] border border-white/10">
              <div className="aspect-video bg-black rounded-2xl relative overflow-hidden flex items-center justify-center">
                {lesson.videoUrl ? (
                  <iframe
                    src={lesson.videoUrl}
                    className="w-full h-full border-none"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="text-center text-white/20 flex flex-col items-center">
                    <Play size={64} className="mb-4 opacity-50" />
                    <div className="text-sm font-bold tracking-widest uppercase text-white/40">Transmisión Próximamente</div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Mark Video Action */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center lg:justify-start"
          >
            <button
              onClick={handleMarkVideo}
              disabled={videoMarked}
              className={`
                w-full lg:w-auto px-8 py-4 rounded-full font-black tracking-widest text-xs md:text-sm flex items-center justify-center gap-3 transition-all duration-300 border
                ${videoMarked 
                  ? 'bg-brand-emerald/[0.1] text-brand-emerald border-brand-emerald/40 cursor-default' 
                  : 'bg-brand-cyan/10 text-brand-cyan border-brand-cyan/30 hover:bg-brand-cyan hover:text-black hover:shadow-[0_0_30px_rgba(0,209,255,0.4)] cursor-pointer'
                }
              `}
            >
              {videoMarked ? <Check size={20} /> : <Play size={20} className={videoMarked ? '' : 'fill-current'} />}
              {videoMarked ? 'VIDEO COMPLETADO ✓' : 'MARCAR VIDEO COMO VISTO'}
            </button>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: Info & Actions */}
        <div className="flex flex-col gap-6 lg:gap-8">

          {/* Activity section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={`glass-panel p-6 md:p-8 rounded-3xl relative overflow-hidden transition-all duration-500 border border-brand-emerald/20 ${
              videoMarked ? 'bg-[#0f172a]/80 shadow-[0_10px_40px_-10px_rgba(1,228,126,0.15)]' : 'opacity-60 grayscale'
            }`}
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-brand-emerald/10 blur-[60px] rounded-full pointer-events-none"></div>
            
            <div className="text-[10px] md:text-xs font-black text-brand-emerald mb-4 uppercase tracking-widest relative z-10 flex items-center gap-2">
              <Sparkles size={16} className="fill-brand-emerald" /> ACTIVIDAD INTERACTIVA
            </div>
            
            <div className="relative z-10">
              <p className="text-lg md:text-xl text-white font-bold mb-6 leading-tight">
                {lesson.subtitle}
              </p>

              {activityDone ? (
                <div className="space-y-3">
                  <div className="w-full rounded-full py-4 font-black tracking-widest text-sm flex items-center justify-center gap-2 bg-brand-emerald/10 border border-brand-emerald/30 text-brand-emerald cursor-default shadow-[0_0_20px_rgba(1,228,126,0.15)]">
                    <Check size={20} /> ACTIVIDAD COMPLETADA
                  </div>
                  {lesson.activityRoute && (
                    <button
                      onClick={() => navigate(lesson.activityRoute)}
                      className="w-full rounded-full py-3 font-bold tracking-widest text-xs cursor-pointer transition-all duration-300 bg-brand-blue/15 border border-brand-blue/40 text-brand-blue hover:bg-brand-blue/25 hover:shadow-[0_0_20px_rgba(0,209,255,0.2)] uppercase"
                    >
                      Ver mis resultados
                    </button>
                  )}
                  <button
                    onClick={() => setShowRepeatAlert(true)}
                    className="w-full rounded-full py-3 font-bold tracking-widest text-xs cursor-pointer transition-all duration-300 bg-transparent border border-white/10 text-white/50 hover:bg-white/5 hover:text-white/80 uppercase"
                  >
                    Repetir la actividad
                  </button>
                </div>
              ) : (
                <button
                  className={`w-full rounded-full py-4 font-black tracking-widest text-sm transition-all duration-300 ${!videoMarked ? 'bg-white/5 text-white/40 border border-white/10 cursor-not-allowed hover:bg-white/10' : 'cursor-pointer btn-primary shadow-[0_0_30px_rgba(1,228,126,0.4)] hover:shadow-[0_0_50px_rgba(1,228,126,0.6)]'}`}
                  onClick={() => {
                    if (!videoMarked) {
                      setShowVideoAlert(true);
                    } else {
                      handleStartActivity();
                    }
                  }}
                >
                  COMENZAR ACTIVIDAD →
                </button>
              )}

              {!videoMarked && (
                <div className="text-xs font-bold text-brand-text-muted/60 mt-5 text-center flex items-center justify-center gap-2 uppercase tracking-widest">
                  <Lock size={14} /> Mira el video para desbloquear
                </div>
              )}
            </div>
          </motion.div>

          {/* Next lesson preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={`p-6 md:p-8 rounded-3xl backdrop-blur-md relative overflow-hidden transition-all duration-500 ${
              activityDone 
                ? 'bg-[#0f172a]/60 border border-brand-emerald/20 shadow-[0_10px_30px_-10px_rgba(1,228,126,0.15)]' 
                : 'bg-[#0f172a]/40 border border-white/[0.04] opacity-50 grayscale pointer-events-none'
            }`}
          >
            <div className="flex justify-between items-end mb-4">
              <div className="text-xs font-bold text-white/50 tracking-widest uppercase">Tu Progreso Global</div>
              <div className="text-brand-cyan text-sm font-black">{Math.round(progressPercent)}%</div>
            </div>
            
            <div className="progress-bar mb-6 bg-black/60 border border-white/5 h-3 rounded-full overflow-hidden">
              <div className="progress-bar-fill h-full bg-gradient-to-r from-brand-emerald via-brand-cyan to-[#00D1FF] relative" style={{ width: `${progressPercent}%` }}>
                 <div className="absolute top-0 right-0 bottom-0 w-10 bg-white/30 blur-[2px]"></div>
              </div>
            </div>

            {nextLesson ? (
              <div className="text-sm font-medium flex flex-col md:flex-row md:items-center gap-4">
                {activityDone ? (
                  <>
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-full bg-brand-emerald/20 flex shrink-0 items-center justify-center text-brand-emerald border border-brand-emerald/30 shadow-[0_0_15px_rgba(1,228,126,0.3)]">
                        <Sparkles size={16} />
                      </div>
                      <span className="text-brand-emerald text-glow-emerald leading-tight">
                        Desbloqueaste: <br className="md:hidden" /><strong className="text-white font-bold">{nextLesson.title.replace('\n', ' ')}</strong>
                      </span>
                    </div>
                    <button 
                      onClick={() => navigate(`/app/leccion/${nextLesson.id}`)}
                      className="btn-primary py-3 px-6 rounded-full text-xs font-black tracking-widest uppercase shrink-0 shadow-[0_0_30px_rgba(1,228,126,0.6)] hover:shadow-[0_0_50px_rgba(1,228,126,0.8)] hover:scale-105 transition-all duration-300 animate-pulse border-2 border-brand-emerald/50"
                    >
                      SIGUIENTE MÓDULO →
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex shrink-0 items-center justify-center text-white/30 border border-white/10">
                        <Lock size={16} />
                      </div>
                      <span className="text-brand-text-muted/60 leading-tight">
                        Siguiente nivel:<br className="md:hidden" /> <strong className="text-white/80 font-bold">{nextLesson.title.replace('\n', ' ')}</strong>
                      </span>
                    </div>
                    <button 
                      disabled
                      className="bg-white/5 border border-white/10 text-white/40 py-3 px-6 rounded-full text-xs font-black tracking-widest uppercase shrink-0 cursor-not-allowed flex items-center gap-2"
                    >
                      <Lock size={14} /> BLOQUEADO
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="text-sm text-center text-brand-gold font-bold p-3 bg-brand-gold/10 rounded-xl border border-brand-gold/20">
                🎯 Te {remaining === 0 ? 'queda' : `faltan ${remaining}`} lección{remaining !== 1 ? 'es' : ''} para tu Diagnóstico 1 a 1
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* XP animation overlay */}
      <AnimatePresence>
        {xpAnimation && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: -20, scale: 1 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 bg-brand-gold text-black px-6 py-3 rounded-full font-black text-xl z-[200] shadow-[0_0_40px_rgba(255,215,0,0.5)] border-2 border-white/50"
          >
            +{xpAnimation} XP ✨
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level-up overlay */}
      <AnimatePresence>
        {showLevelUp && levelUpData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLevelUp(false)}
            className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-xl flex items-center justify-center flex-col cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="text-8xl md:text-9xl mb-8 drop-shadow-[0_0_50px_rgba(255,255,255,0.3)]"
            >
              {levelUpData.emoji}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="px-8 py-3 bg-brand-gold/20 border border-brand-gold/40 rounded-full mb-6"
            >
              <h1 className="text-3xl md:text-5xl font-black text-brand-gold text-center tracking-widest uppercase text-glow-gold">
                ¡NIVEL UP!
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-2xl md:text-4xl font-black text-white mt-2 tracking-tighter uppercase"
            >
              {levelUpData.name}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-white/40 mt-12 text-sm md:text-base font-bold tracking-widest uppercase animate-pulse"
            >
              Toca para continuar la aventura
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Module Unlocked overlay */}
      <AnimatePresence>
        {showModuleUnlocked && nextLesson && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModuleUnlocked(false)}
            className="fixed inset-0 z-[300] bg-[#070b14]/90 backdrop-blur-xl flex items-center justify-center flex-col cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="text-8xl md:text-9xl mb-8 drop-shadow-[0_0_50px_rgba(0,209,255,0.3)]"
            >
              {nextLesson.emoji}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="px-8 py-3 bg-brand-cyan/20 border border-brand-cyan/40 rounded-full mb-6"
            >
              <h1 className="text-2xl md:text-4xl font-black text-brand-cyan text-center tracking-widest uppercase shadow-[0_0_20px_rgba(0,209,255,0.4)]">
                ¡ESTÁS SUBIENDO DE NIVEL!
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-xl md:text-2xl font-medium text-white/80 mt-2 text-center"
            >
              Has desbloqueado:
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-3xl md:text-5xl font-black text-white mt-2 tracking-tighter uppercase text-center px-4"
            >
              {nextLesson.title}
            </motion.p>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              onClick={(e) => {
                e.stopPropagation();
                setShowModuleUnlocked(false);
                navigate(`/app/leccion/${nextLesson.id}`);
              }}
              className="mt-12 btn-primary px-8 py-4 rounded-full font-black tracking-widest uppercase text-sm flex items-center gap-2 shadow-[0_0_30px_rgba(1,228,126,0.6)] animate-pulse hover:scale-105 transition-transform"
            >
              Ir al Siguiente Módulo <ChevronRight size={18} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Alert overlay */}
      <AnimatePresence>
        {showRepeatAlert && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel p-8 rounded-3xl max-w-sm w-full border border-white/10 shadow-2xl space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 border border-red-500/20 text-red-400">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight text-white">¿Repetir Actividad?</h3>
                <p className="text-brand-text-muted text-sm font-medium leading-relaxed">
                  Si decides repetir esta actividad, los datos de tu intento anterior podrían perderse o sobrescribirse. ¿Estás seguro de que quieres continuar?
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setShowRepeatAlert(false);
                    handleStartActivity();
                  }}
                  className="w-full py-4 rounded-xl font-black tracking-widest text-xs cursor-pointer transition-all duration-300 bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/30 hover:bg-brand-emerald hover:text-black"
                >
                  SÍ, QUIERO REPETIRLA
                </button>
                <button
                  onClick={() => setShowRepeatAlert(false)}
                  className="w-full py-4 rounded-xl font-black tracking-widest text-xs cursor-pointer transition-all duration-300 bg-white/5 border border-white/10 hover:bg-white/10 text-white/70"
                >
                  CANCELAR
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Video not completed alert overlay */}
      <AnimatePresence>
        {showVideoAlert && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel p-8 rounded-3xl max-w-sm w-full border border-brand-cyan/20 shadow-[0_0_50px_rgba(0,209,255,0.15)] space-y-6"
            >
              <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-brand-cyan/10 flex items-center justify-center mx-auto mb-2 border border-brand-cyan/30 text-brand-cyan shadow-[0_0_30px_rgba(0,209,255,0.2)]">
                  <Play size={32} className="ml-1" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight text-white text-glow-cyan">¡Información Vital Requerida!</h3>
                <p className="text-brand-text-muted text-sm font-medium leading-relaxed">
                  Para poder dominar esta misión con éxito, primero necesitas marcar la transmisión como completada. ¡No te saltes el conocimiento clave!
                </p>
              </div>
              <div className="flex flex-col gap-3 mt-4">
                <button
                  onClick={() => setShowVideoAlert(false)}
                  className="w-full py-4 rounded-xl font-black tracking-widest text-xs cursor-pointer transition-all duration-300 bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/30 hover:bg-brand-cyan hover:text-black shadow-[0_0_20px_rgba(0,209,255,0.2)]"
                >
                  ENTENDIDO, VERÉ EL VIDEO
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Loading overlay for route changes */}
      <AnimatePresence>
        {isLoading && lesson && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[500] flex flex-col items-center justify-center bg-[#070b14]"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center"
            >
              <div className="text-8xl md:text-9xl mb-6 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                >
                  {lesson.emoji}
                </motion.div>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-widest uppercase text-glow-cyan animate-pulse text-center">
                Cargando Módulo...
              </h2>
              <p className="text-brand-text-muted mt-2 font-medium text-center">
                Preparando tu siguiente misión
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
