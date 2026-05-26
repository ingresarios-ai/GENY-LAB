// Ingresarios Lab — Lesson Screen (Video + Activity)

import { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Play, Check, Lock, Sparkles, ChevronRight } from 'lucide-react';
// Removed confetti import
import { LESSONS, getLevelForXp, TOTAL_LESSONS } from '../../lib/lessons';
import { 
  getProgress, isLessonUnlocked,
  markVideoCompleted, markActivityCompleted, getCompletedCount, isAllCompleted,
} from '../../lib/progressStore';
import { loadActivityProgressDB } from '../../lib/activitySync';

const CONVERTEAI_ACCOUNT = '6f88db54-0f9b-4a7c-af05-9ae2f56f3fdf';

/** VTurb / Converteai Smart Player embed */
function VTurbPlayer({ playerId }: { playerId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous content
    containerRef.current.innerHTML = '';

    // Create the custom element
    const player = document.createElement('vturb-smartplayer');
    player.id = `vid-${playerId}`;
    player.style.display = 'block';
    player.style.margin = '0 auto';
    player.style.width = '100%';
    containerRef.current.appendChild(player);

    // Load the script
    const script = document.createElement('script');
    script.src = `https://scripts.converteai.net/${CONVERTEAI_ACCOUNT}/players/${playerId}/v4/player.js`;
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup on unmount
      try { document.head.removeChild(script); } catch { /* already removed */ }
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [playerId]);

  return <div ref={containerRef} className="w-full h-full" />;
}

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
  const [dbActivity, setDbActivity] = useState<{ started: boolean; completed: boolean } | null>(null);

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

    if (lessonId) {
      setDbActivity(null);
      (async () => {
        const dbProgress = await loadActivityProgressDB(lessonId);
        if (dbProgress) {
          setDbActivity({
            started: true,
            completed: dbProgress.completed
          });
        } else {
          setDbActivity({
            started: false,
            completed: false
          });
        }
      })();
    }

    // Show a loading screen for a short duration to make the transition obvious
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [lessonId]);

  // Listen for progress synced event from AuthGuard
  useEffect(() => {
    const handleSync = () => {
      const p = getProgress();
      setProgress(p);
      const lp = p.lessonProgress[lessonId || ''];
      setVideoMarked(lp?.videoCompleted ?? false);
      setActivityDone(lp?.activityCompleted ?? false);
    };

    window.addEventListener('progress-synced', handleSync);
    return () => window.removeEventListener('progress-synced', handleSync);
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

  const isCompleted = dbActivity ? dbActivity.completed : activityDone;
  const isInProgress = dbActivity ? (dbActivity.started && !dbActivity.completed) : false;

  let borderClass = 'border-brand-emerald/20';
  let badgeText = 'VALIDACIÓN PRÁCTICA';
  let badgeColor = 'text-brand-emerald';
  let badgeBullet = 'bg-brand-emerald';
  let cardBgGradient = '';

  if (isCompleted) {
    borderClass = 'border-brand-emerald/20';
    badgeText = 'VALIDACIÓN EXITOSA';
    badgeColor = 'text-brand-emerald';
    badgeBullet = 'bg-brand-emerald';
    cardBgGradient = 'from-brand-emerald/5 via-transparent to-brand-cyan/5';
  } else if (isInProgress) {
    borderClass = 'border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.05)]';
    badgeText = 'ACTIVIDAD EN CURSO';
    badgeColor = 'text-amber-500';
    badgeBullet = 'bg-amber-500';
    cardBgGradient = 'from-amber-500/5 via-transparent to-orange-500/5';
  }

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
        setDbActivity({ started: true, completed: true });
        setProgress(getProgress());

        if (result.xpEarned > 0) {
          setXpAnimation(result.xpEarned);
          setTimeout(() => setXpAnimation(null), 1500);
        }

        // Check if ALL lessons are now complete (last lesson finished)
        if (isAllCompleted()) {
          setTimeout(() => {
            navigate('/app/diagnostico');
          }, 1500);
        } else if (result.leveledUp) {
          setTimeout(() => {
            setLevelUpData({ name: result.newLevel.name, emoji: result.newLevel.emoji });
            setShowLevelUp(true);
          }, 800);
        } else {
          // If they didn't level up, but they just unlocked the next module
          const nextLesson = LESSONS.find(l => l.order === lesson.order + 1);
          if (nextLesson) {
            setTimeout(() => {
              setShowModuleUnlocked(true);
            }, 800);
          }
        }
      }
    }
  }, [searchParams, lesson, activityDone, setSearchParams]);

  const handleStartActivity = (isRepeat = false) => {
    if (!lesson) return;
    if (lesson.activityRoute) {
      navigate(isRepeat ? `${lesson.activityRoute}?reset=true` : lesson.activityRoute);
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

      if (result.leveledUp) {
        setTimeout(() => {
          setLevelUpData({ name: result.newLevel.name, emoji: result.newLevel.emoji });
          setShowLevelUp(true);
        }, 800);
      } else if (isAllCompleted()) {
        // Last lesson completed via fallback path
        setTimeout(() => {
          navigate('/app/diagnostico');
        }, 1500);
      } else {
        const nextL = LESSONS.find(l => l.order === lesson.order + 1);
        if (nextL) {
          setTimeout(() => {
            setShowModuleUnlocked(true);
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
            {/* Clean tech border instead of massive blur */}
            <div className="glass-panel p-2 md:p-3 rounded-xl relative overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] border border-white/10">
              <div className="aspect-video bg-black rounded-lg relative overflow-hidden flex items-center justify-center">
                {lesson.videoUrl ? (
                  <VTurbPlayer playerId={lesson.videoUrl} />
                ) : (
                  <div className="text-center text-white/20 flex flex-col items-center">
                    <Play size={64} className="mb-4 opacity-50" />
                    <div className="text-sm font-bold tracking-widest uppercase text-white/40">Transmisión Próximamente</div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>


        </div>

        {/* RIGHT COLUMN: Info & Actions */}
        <div className="flex flex-col gap-6 lg:gap-8">

          {/* Activity section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={`glass-panel p-6 md:p-8 rounded-xl relative overflow-hidden transition-all duration-500 border ${borderClass} bg-[#0A0B10]`}
          >
            {/* Subtle animated gradient background when completed or in progress */}
            {cardBgGradient && (
              <div className={`absolute inset-0 bg-gradient-to-br ${cardBgGradient} pointer-events-none`} />
            )}

            <div className={`text-[10px] md:text-xs font-mono ${badgeColor} mb-4 uppercase tracking-widest relative z-10 flex items-center gap-2`}>
              <span className={`w-2 h-2 ${badgeBullet} rounded-sm animate-pulse`}></span> {badgeText}
            </div>
            
            <div className="relative z-10">
              <p className="text-lg md:text-xl text-white font-bold mb-6 leading-tight">
                {lesson.subtitle}
              </p>

              {dbActivity === null ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin mb-2" />
                  <p className="text-xs text-white/40 font-mono">Cargando estado...</p>
                </div>
              ) : isCompleted ? (
                <div className="space-y-3">
                  {/* Success celebration */}
                  <div className="flex flex-col items-center text-center py-4 mb-2">
                    <div className="w-16 h-16 rounded-2xl bg-brand-emerald/10 border border-brand-emerald/30 flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(1,228,126,0.2)]">
                      <Check size={28} className="text-brand-emerald" />
                    </div>
                    <p className="text-brand-emerald font-mono text-sm tracking-widest uppercase mb-1">Validación Exitosa</p>
                    <p className="text-white/40 text-xs font-mono">Datos procesados correctamente</p>
                  </div>

                  {lesson.activityRoute && (
                    <button
                      onClick={() => navigate(lesson.activityRoute + '?view=results')}
                      className="w-full rounded-lg py-3.5 font-mono tracking-widest text-xs cursor-pointer transition-all duration-300 bg-brand-cyan/10 border border-brand-cyan/40 text-brand-cyan hover:bg-brand-cyan/20 hover:shadow-[0_0_20px_rgba(0,209,255,0.2)] uppercase flex items-center justify-center gap-2"
                    >
                      <Sparkles size={14} /> Ver mis resultados
                    </button>
                  )}
                  <button
                    onClick={() => setShowRepeatAlert(true)}
                    className="w-full rounded-lg py-3 font-mono tracking-widest text-xs cursor-pointer transition-all duration-300 bg-transparent border border-white/10 text-white/50 hover:bg-white/5 hover:text-white/80 uppercase"
                  >
                    Reiniciar actividad
                  </button>
                </div>
              ) : isInProgress ? (
                <div className="space-y-3">
                  {/* In progress block */}
                  <div className="flex flex-col items-center text-center py-4 mb-2">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(245,158,11,0.2)]">
                      <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                    <p className="text-amber-500 font-mono text-sm tracking-widest uppercase mb-1">Actividad en Curso</p>
                    <p className="text-white/40 text-xs font-mono">Tienes un progreso guardado incompleto</p>
                  </div>

                  <button
                    onClick={() => {
                      if (!videoMarked) {
                        handleMarkVideo();
                      }
                      handleStartActivity();
                    }}
                    className="w-full rounded-lg py-3.5 font-mono tracking-widest text-xs cursor-pointer transition-all duration-300 bg-amber-500/10 border border-amber-500/40 text-amber-500 hover:bg-amber-500/20 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] uppercase flex items-center justify-center gap-2"
                  >
                    <Play size={14} className="fill-amber-500 stroke-none" /> Continuar con la actividad
                  </button>

                  <button
                    onClick={() => setShowRepeatAlert(true)}
                    className="w-full rounded-lg py-3 font-mono tracking-widest text-xs cursor-pointer transition-all duration-300 bg-transparent border border-white/10 text-white/50 hover:bg-white/5 hover:text-white/80 uppercase"
                  >
                    Reiniciar actividad
                  </button>
                </div>
              ) : (
                <button
                  className={`w-full rounded-lg py-4 font-mono tracking-widest text-xs transition-all duration-300 cursor-pointer bg-[#00E676]/10 border border-[#00E676]/30 text-[#00E676] hover:bg-[#00E676]/20 shadow-[0_0_20px_rgba(1,228,126,0.2)] hover:shadow-[0_0_30px_rgba(1,228,126,0.4)]`}
                  onClick={() => {
                    if (!videoMarked) {
                      handleMarkVideo();
                    }
                    handleStartActivity();
                  }}
                >
                  COMENZAR_ACTIVIDAD()
                </button>
              )}

            </div>
          </motion.div>

          {/* Next lesson preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={`p-6 md:p-8 rounded-xl backdrop-blur-md relative overflow-hidden transition-all duration-500 ${
              activityDone 
                ? 'bg-[#0A0B10] border border-brand-emerald/20 shadow-[0_10px_30px_-10px_rgba(1,228,126,0.15)]' 
                : 'bg-[#0A0B10] border border-white/[0.04] opacity-50 grayscale pointer-events-none'
            }`}
          >
            {/* Subtle gradient overlay when active */}
            {activityDone && (
              <div className="absolute inset-0 bg-gradient-to-br from-brand-cyan/5 via-transparent to-brand-emerald/5 pointer-events-none" />
            )}

            <div className="relative z-10">
              <div className="flex justify-between items-center mb-3">
                <div className="text-[10px] md:text-xs font-mono text-white/50 tracking-widest uppercase">Tu Progreso Global</div>
                <div className="text-brand-cyan text-lg font-bold font-mono">{Math.round(progressPercent)}%</div>
              </div>
              
              <div className="progress-bar mb-2">
                <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
              </div>
              <p className="text-[10px] text-white/30 font-mono mb-6">{completedCount} de {TOTAL_LESSONS} nodos completados</p>
            </div>

            {nextLesson ? (
              <div className="text-sm font-medium flex flex-col gap-4">
                {activityDone ? (
                  <>
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-brand-emerald/10 flex shrink-0 items-center justify-center text-brand-emerald border border-brand-emerald/30 shadow-[0_0_20px_rgba(1,228,126,0.3)]">
                        <span className="text-lg">{nextLesson.emoji}</span>
                      </div>
                      <div>
                        <p className="text-brand-emerald font-mono text-[10px] uppercase tracking-widest mb-0.5">Nuevo Acceso Desbloqueado</p>
                        <p className="text-white font-bold text-sm">{nextLesson.title.replace('\n', ' ')}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate(`/app/leccion/${nextLesson.id}`)}
                      className="w-full bg-brand-emerald/10 border border-brand-emerald/40 text-brand-emerald py-3.5 px-6 rounded-lg text-xs font-mono tracking-widest uppercase hover:bg-brand-emerald/20 hover:shadow-[0_0_20px_rgba(1,228,126,0.4)] transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      Siguiente Módulo <ChevronRight size={14} />
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex shrink-0 items-center justify-center text-white/30 border border-white/10">
                      <Lock size={16} />
                    </div>
                    <span className="text-white/40 font-mono text-xs leading-tight">
                      Siguiente: <strong className="text-white/60 font-bold">{nextLesson.title.replace('\n', ' ')}</strong>
                    </span>
                  </div>
                )}
              </div>
            ) : activityDone && isAllCompleted() ? (
              <div className="text-sm font-medium flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#F2C500]/10 flex shrink-0 items-center justify-center text-[#F2C500] border border-[#F2C500]/30 shadow-[0_0_20px_rgba(242,197,0,0.3)]">
                    <span className="text-lg">🏆</span>
                  </div>
                  <div>
                    <p className="text-[#F2C500] font-mono text-[10px] uppercase tracking-widest mb-0.5">¡Sistema Completado!</p>
                    <p className="text-white font-bold text-sm">Tu Diagnóstico Privado está listo</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/app/diagnostico')}
                  className="w-full bg-[#F2C500]/10 border border-[#F2C500]/40 text-[#F2C500] py-3.5 px-6 rounded-lg text-xs font-mono tracking-widest uppercase hover:bg-[#F2C500]/20 hover:shadow-[0_0_20px_rgba(242,197,0,0.4)] transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Reclamar Mi Diagnóstico <ChevronRight size={14} />
                </button>
              </div>
            ) : (
              <div className="text-xs font-mono text-center text-brand-gold p-3 bg-brand-gold/5 rounded-lg border border-brand-gold/20">
                &gt; FALTAN {remaining} VALIDACION{remaining === 1 ? '' : 'ES'} PARA TU RECOMPENSA FINAL
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
            onClick={() => {
              setShowLevelUp(false);
              const nextL = LESSONS.find(l => l.order === lesson.order + 1);
              if (nextL) {
                setShowModuleUnlocked(true);
              } else {
                navigate('/app/diagnostico');
              }
            }}
            className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-md flex items-center justify-center flex-col cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="text-8xl md:text-9xl mb-8 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            >
              {levelUpData.emoji}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="px-8 py-3 bg-[#00D1FF]/10 border border-[#00D1FF]/30 rounded-lg mb-6"
            >
              <h1 className="text-2xl md:text-4xl font-mono text-[#00D1FF] text-center tracking-widest uppercase shadow-[0_0_20px_rgba(0,209,255,0.2)]">
                NIVEL ALCANZADO
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-xl md:text-3xl font-bold text-white mt-2 tracking-tighter uppercase text-center px-4"
            >
              {levelUpData.name}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-[#00D1FF]/60 mt-12 text-xs md:text-sm font-mono tracking-widest uppercase animate-pulse"
            >
              &gt; Toca para continuar la secuencia
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
            onClick={() => {
              setShowModuleUnlocked(false);
              navigate(`/app/leccion/${nextLesson.id}`);
            }}
            className="fixed inset-0 z-[300] bg-[#05080f]/95 backdrop-blur-md flex items-center justify-center flex-col cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="text-8xl md:text-9xl mb-8 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            >
              {nextLesson.emoji}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="px-8 py-3 bg-brand-cyan/10 border border-brand-cyan/30 rounded-lg mb-6"
            >
              <h1 className="text-xl md:text-3xl font-mono text-brand-cyan text-center tracking-widest uppercase shadow-[0_0_20px_rgba(0,209,255,0.2)]">
                NUEVO ACCESO
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-xs md:text-sm font-mono text-white/60 mt-2 text-center uppercase"
            >
              Ahora tienes acceso a:
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-xl md:text-3xl font-bold text-white mt-2 tracking-tighter uppercase text-center px-4"
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
              className="mt-12 bg-brand-cyan/10 border border-brand-cyan/40 px-8 py-4 rounded-lg font-mono tracking-widest uppercase text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(0,209,255,0.2)] hover:bg-brand-cyan/20 transition-colors text-brand-cyan"
            >
              COMENZAR MÓDULO <ChevronRight size={18} />
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
                <h3 className="text-xl font-black uppercase tracking-tight text-white">
                  {isCompleted ? "¿Repetir Actividad?" : "¿Reiniciar Actividad?"}
                </h3>
                <p className="text-brand-text-muted text-sm font-medium leading-relaxed">
                  {isCompleted 
                    ? "Si decides repetir esta actividad, los datos de tu intento anterior podrían perderse o sobrescribirse. ¿Estás seguro de que quieres continuar?"
                    : "Si decides reiniciar esta actividad, todo tu progreso actual de este intento se perderá. ¿Estás seguro de que quieres continuar?"}
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setShowRepeatAlert(false);
                    handleStartActivity(true);
                  }}
                  className="w-full py-4 rounded-xl font-black tracking-widest text-xs cursor-pointer transition-all duration-300 bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/30 hover:bg-brand-emerald hover:text-black"
                >
                  {isCompleted ? "SÍ, QUIERO REPETIRLA" : "SÍ, QUIERO REINICIARLA"}
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
