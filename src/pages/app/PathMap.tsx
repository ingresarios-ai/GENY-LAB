// GENY LAB — Gamified Path (Horizontal Ecosystem Hub)

import { useMemo, useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Play, Check, ChevronLeft, ChevronRight, Trophy, Flame, X } from 'lucide-react';
import { LESSONS, getLevelForXp, getXpProgressInLevel, PHASE_LABELS, type Lesson } from '../../lib/lessons';
import { getProgress, isLessonUnlocked, isLessonCompleted, getCompletedCount, isAllCompleted } from '../../lib/progressStore';

export default function PathMap() {
  const navigate = useNavigate();
  const progress = useMemo(() => getProgress(), []);
  const level = getLevelForXp(progress.totalXp);
  const xpInLevel = getXpProgressInLevel(progress.totalXp);
  const completedCount = getCompletedCount();
  const allDone = isAllCompleted();

  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const [showWelcomeModal, setShowWelcomeModal] = useState(() => {
    return localStorage.getItem('geny_lab_hide_welcome') !== 'true';
  });
  const [dontShowAgain, setDontShowAgain] = useState(false);

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
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#00D1FF]/20 blur-[60px] rounded-full pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#00E676]/20 blur-[60px] rounded-full pointer-events-none" />
              
              <button 
                onClick={handleCloseWelcome}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>

              <div className="mb-6 mt-2">
                <h1 className="text-3xl font-black uppercase tracking-tighter text-glow-cyan mb-4 leading-none">
                  ¡Bienvenido a<br />GENY LAB!
                </h1>
                <p className="text-white/80 text-sm md:text-base font-medium leading-relaxed">
                  Esta es tu ruta interactiva hacia la libertad financiera. Cada módulo está diseñado como un nivel que debes superar. 
                </p>
                <ul className="mt-4 space-y-3 text-sm text-white/70">
                  <li className="flex gap-3 items-start">
                    <Play className="text-[#00D1FF] shrink-0 mt-0.5" size={16} />
                    <span><strong>Activación Mental:</strong> Cada módulo inicia con un video inmersivo.</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <Check className="text-[#00FF88] shrink-0 mt-0.5" size={16} />
                    <span><strong>Ejecución Práctica:</strong> Resuelve actividades interactivas para demostrar tu avance.</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <Lock className="text-[#F2C500] shrink-0 mt-0.5" size={16} />
                    <span><strong>Desbloqueo Constante:</strong> Tu disciplina libera nuevos niveles y aplicaciones.</span>
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
                  <span className="text-sm text-white/50 group-hover:text-white/80 transition-colors">No volver a mostrar</span>
                </label>
                
                <button 
                  onClick={handleCloseWelcome}
                  className="w-full py-4 rounded-xl font-black tracking-widest uppercase text-black bg-gradient-to-r from-[#00D1FF] to-[#00E676] hover:scale-[1.02] transition-transform"
                >
                  Entendido, Comenzar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hero Typography Logo */}
      <div className="w-full flex flex-col items-center justify-center text-center px-4 mb-10 mt-2 md:mt-6 relative">
        {/* Glow behind text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-[#00D1FF]/20 blur-[100px] rounded-full pointer-events-none" />

        {/* Massive Glow Text Container */}
        <div className="relative z-10 flex flex-row items-end justify-center gap-2 md:gap-4 mb-2">
          <h1 className="text-4xl md:text-6xl lg:text-8xl font-black uppercase tracking-tighter leading-none"
              style={{
                background: 'linear-gradient(180deg, #FFFFFF 0%, #A5F3FF 40%, #00D1FF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 30px rgba(0, 209, 255, 0.4))'
              }}>
            GENY
          </h1>
          <span className="text-4xl md:text-6xl lg:text-8xl font-black uppercase tracking-tighter leading-none"
                style={{
                  background: 'linear-gradient(180deg, #00FF88 0%, #00B359 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 20px rgba(0, 255, 136, 0.4))'
                }}>
            LAB
          </span>
        </div>
        
        {/* Sub-text Spaced out */}
        <div className="relative z-10 text-[10px] md:text-sm lg:text-base font-bold tracking-[0.2em] md:tracking-[0.4em] uppercase text-[#00D1FF] mb-8 drop-shadow-[0_0_10px_rgba(0,209,255,0.5)]">
          SISTEMA - EJECUCIÓN - RESULTADOS
        </div>

        {/* Description */}
        <p className="relative z-10 text-white/60 font-medium text-sm md:text-base max-w-2xl mx-auto">
          La central de inteligencia y herramientas avanzadas para dominar el mercado.
        </p>
      </div>

      {/* Horizontal Carousel */}
      <div className="relative w-full mb-16">
        {/* Blinking Arrows for Scroll Indication */}
        {canScrollLeft && (
          <button 
            onClick={() => scroll('left')}
            className="absolute left-[-10px] md:left-[-20px] top-1/2 -translate-y-1/2 z-30 cursor-pointer hover:scale-110 transition-transform focus:outline-none"
            aria-label="Deslizar a la izquierda"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:bg-white/10">
              <ChevronLeft size={24} />
            </div>
          </button>
        )}
        {canScrollRight && (
          <button 
            onClick={() => scroll('right')}
            className="absolute right-[-10px] md:right-[-20px] top-1/2 -translate-y-1/2 z-30 cursor-pointer hover:scale-110 transition-transform focus:outline-none"
            aria-label="Deslizar a la derecha"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:bg-white/10">
              <ChevronRight size={24} />
            </div>
          </button>
        )}

        {/* Scrollable Container */}
        <div 
          ref={carouselRef}
          onScroll={checkScroll}
          className="flex overflow-x-auto gap-4 md:gap-6 snap-x snap-mandatory hide-scrollbar pb-8 pt-4 px-2"
        >
          {LESSONS.map((lesson, idx) => {
            const unlocked = isLessonUnlocked(lesson.order);
            const completed = isLessonCompleted(lesson.id);
            const isCurrent = unlocked && !completed;

            let gradient = 'from-white/5 to-white/5';
            let glow = 'bg-white/5';
            let iconBg = 'bg-white/5 border-white/10 text-white/40';
            let badgeClass = 'border-white/10 bg-white/5 text-white/40';
            
            if (completed) {
              gradient = 'from-emerald-500/10 via-transparent to-teal-600/10';
              glow = 'bg-emerald-500/10 group-hover:bg-emerald-400/20';
              iconBg = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.2)]';
              badgeClass = 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400';
            } else if (isCurrent) {
              gradient = 'from-cyan-500/15 via-transparent to-blue-600/15';
              glow = 'bg-cyan-500/20 group-hover:bg-cyan-400/30';
              iconBg = 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.2)]';
              badgeClass = 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400';
            }

            return (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                onClick={() => handleNodeClick(lesson)}
                className={`w-[85vw] md:w-[400px] shrink-0 snap-center md:snap-start relative group rounded-[2.5rem] overflow-hidden glass-panel h-[480px] flex flex-col transition-all duration-500 ${unlocked ? 'glass-panel-hover cursor-pointer hover:-translate-y-3 hover:shadow-[0_20px_50px_rgba(0,209,255,0.2)]' : 'cursor-not-allowed opacity-80'}`}
              >
                {/* Dynamic Backgrounds */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-50 group-hover:opacity-100 transition-opacity duration-700`} />
                <div className={`absolute right-[-10%] bottom-[-20%] w-[80%] h-[80%] ${glow} blur-[80px] rounded-full transition-colors duration-700`} />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvc3ZnPg==')] opacity-20" />

                {/* Card Content */}
                <div className="relative z-10 p-6 md:p-8 h-full flex flex-col justify-between">
                  {/* Top Section */}
                  <div className="flex justify-between items-start">
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center backdrop-blur-md border transition-all duration-500 ${unlocked ? 'group-hover:scale-125 group-hover:-translate-y-2 group-hover:rotate-[5deg]' : ''} ${iconBg}`}>
                      {unlocked ? <span className="text-5xl">{lesson.emoji}</span> : <Lock size={32} />}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {isCurrent && (
                        <div className="flex items-center gap-1.5 text-[#00D1FF] font-bold text-[10px] uppercase tracking-widest border border-[#00D1FF]/30 bg-[#00D1FF]/10 px-3 py-1 rounded-full">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#00D1FF] animate-pulse"></div>
                          Tu Próximo Paso
                        </div>
                      )}
                      {completed && (
                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[10px] uppercase tracking-widest border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 rounded-full">
                          <Check size={12} /> Completado
                        </div>
                      )}
                      <div className={`px-4 py-2 rounded-full border text-xs md:text-sm font-bold tracking-widest uppercase ${badgeClass}`}>
                        {PHASE_LABELS[lesson.phase]}
                      </div>
                    </div>
                  </div>
                  
                  {/* Bottom Section */}
                  <div className="mt-auto">
                    <div className="text-xs md:text-sm font-bold tracking-widest text-white/50 mb-2 uppercase">
                      Módulo {lesson.order}
                    </div>
                    <h2 className={`min-h-[75px] md:min-h-[90px] whitespace-pre-line line-clamp-2 text-3xl md:text-4xl font-black tracking-tighter uppercase leading-tight mb-3 transition-all duration-500 ${isCurrent ? 'group-hover:text-glow-cyan text-white' : completed ? 'text-white/90' : 'text-white/40'}`}>
                      {lesson.title}
                    </h2>
                    <p className={`text-sm md:text-base mb-8 font-medium line-clamp-4 ${isCurrent ? 'text-white/70' : 'text-white/30'}`}>
                      {lesson.description}
                    </p>
                    
                    {/* Action Button */}
                    {completed ? (
                      <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-emerald-400 font-bold text-sm uppercase tracking-widest">
                        Completado <Check size={18} />
                      </div>
                    ) : isCurrent ? (
                      <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform duration-300">
                        Iniciar Módulo <Play size={18} className="fill-black" />
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/40 font-bold text-sm uppercase tracking-widest">
                        Bloqueado <Lock size={18} />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Final Reward Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: LESSONS.length * 0.1 }}
            className={`w-[80vw] md:w-[360px] shrink-0 snap-center md:snap-start relative group rounded-[2rem] overflow-hidden glass-panel h-[400px] flex flex-col ${allDone ? 'glass-panel-hover border-[#F2C500]/50 shadow-[0_0_30px_rgba(242,197,0,0.2)] cursor-pointer' : 'opacity-60 border-white/5'}`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${allDone ? 'from-[#F2C500]/20 via-transparent to-[#FF6321]/20' : 'from-white/5 to-white/5'} opacity-50`} />
            <div className={`absolute right-[-10%] bottom-[-20%] w-[80%] h-[80%] ${allDone ? 'bg-[#F2C500]/20' : 'bg-white/5'} blur-[80px] rounded-full`} />
            
            <div className="relative z-10 p-6 md:p-8 h-full flex flex-col justify-between items-center text-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center backdrop-blur-md border ${allDone ? 'bg-[#F2C500]/20 border-[#F2C500]/40 text-[#F2C500] shadow-[0_0_40px_rgba(242,197,0,0.4)]' : 'bg-white/5 border-white/10 text-white/30'}`}>
                {allDone ? <Trophy size={40} /> : <Lock size={32} />}
              </div>
              
              <div className="mt-auto flex flex-col items-center">
                <h2 className={`text-3xl font-black tracking-tighter uppercase mb-3 ${allDone ? 'text-[#F2C500] drop-shadow-[0_0_15px_rgba(242,197,0,0.8)]' : 'text-white/40'}`}>
                  {allDone ? '¡Desbloqueado!' : 'Recompensa'}
                </h2>
                <p className="text-sm font-medium text-white/60 mb-6">
                  Diagnóstico Financiero 1 a 1. Completa todas las lecciones para acceder.
                </p>
                
                {allDone && (
                  <button className="btn-premium-gold w-full text-sm py-4">
                    Agendar Ahora
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
