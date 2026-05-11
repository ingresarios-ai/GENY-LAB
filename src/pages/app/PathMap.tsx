// Trader Mapp — Gamified Path (Duolingo-style vertical map)

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, Play, Check } from 'lucide-react';
import { LESSONS, getLevelForXp, getXpProgressInLevel, PHASE_LABELS, type Lesson } from '../../lib/lessons';
import { getProgress, isLessonUnlocked, isLessonCompleted, getCompletedCount, isAllCompleted } from '../../lib/progressStore';

export default function PathMap() {
  const navigate = useNavigate();
  const progress = useMemo(() => getProgress(), []);
  const level = getLevelForXp(progress.totalXp);
  const xpInLevel = getXpProgressInLevel(progress.totalXp);
  const completedCount = getCompletedCount();
  const allDone = isAllCompleted();

  const handleNodeClick = (lesson: Lesson) => {
    if (!isLessonUnlocked(lesson.order)) return;
    navigate(`/app/leccion/${lesson.id}`);
  };

  return (
    <div className="pb-tab-bar px-5">
      {/* Header — Level + XP + Streak */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between py-4 sticky top-0 z-10"
        style={{ background: 'inherit' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">{level.emoji}</span>
          <div>
            <div className="text-[0.65rem] text-brand-text-muted font-semibold">
              Nivel {level.id}
            </div>
            <div className="text-sm font-bold" style={{ color: level.color }}>
              {level.name}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* XP bar */}
          <div className="w-24">
            <div className="text-[0.6rem] text-brand-text-muted text-right mb-0.5">
              {progress.totalXp} XP
            </div>
            <div className="progress-bar" style={{ height: 5 }}>
              <div className="progress-bar-fill" style={{ width: `${xpInLevel.percent}%` }} />
            </div>
          </div>

          {/* Streak */}
          {progress.streak > 0 && (
            <div className="flex items-center gap-1 bg-brand-gold/15 px-2.5 py-1 rounded-full text-sm font-bold text-brand-gold">
              🔥 {progress.streak}
            </div>
          )}
        </div>
      </motion.div>

      {/* Progress counter */}
      <div className="text-center mb-6 text-xs text-brand-text-muted">
        {completedCount} de {LESSONS.length} lecciones completadas
      </div>

      {/* Path nodes */}
      <div className="flex flex-col items-center pb-6 relative">
        {LESSONS.map((lesson, i) => {
          const unlocked = isLessonUnlocked(lesson.order);
          const completed = isLessonCompleted(lesson.id);
          const isCurrent = unlocked && !completed;

          // Phase divider
          const showPhaseDivider = i === 0 || LESSONS[i - 1]?.phase !== lesson.phase;

          return (
            <div key={lesson.id} className="w-full max-w-[340px]">
              {/* Phase divider */}
              {showPhaseDivider && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={`text-center text-[0.65rem] font-bold tracking-wider uppercase ${
                    i === 0 ? 'mb-5' : 'mt-3 mb-5'
                  } ${completed || unlocked ? 'text-brand-blue' : 'text-brand-text-muted/50'}`}
                >
                  {PHASE_LABELS[lesson.phase]}
                </motion.div>
              )}

              {/* Connector line */}
              {i > 0 && (
                <div className={`w-[3px] h-8 mx-auto rounded-full ${
                  completed || unlocked 
                    ? 'bg-gradient-to-b from-brand-green to-brand-blue' 
                    : 'bg-white/[0.06]'
                }`} />
              )}

              {/* Node */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08, type: 'spring', stiffness: 200 }}
                onClick={() => handleNodeClick(lesson)}
                className={`
                  flex items-center gap-3.5 w-full p-3.5 rounded-2xl text-left transition-all duration-300 cursor-pointer
                  ${isCurrent ? 'animate-pulse-glow' : ''}
                  ${completed 
                    ? 'bg-brand-green/[0.08] border-2 border-brand-green/60' 
                    : isCurrent 
                      ? 'bg-brand-gold/[0.08] border-2 border-brand-gold' 
                      : 'bg-white/[0.03] border-2 border-white/[0.06]'
                  }
                  ${unlocked ? '' : 'opacity-40 cursor-not-allowed'}
                `}
              >
                {/* Icon circle */}
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0
                  ${completed 
                    ? 'bg-brand-green/20' 
                    : isCurrent 
                      ? 'bg-brand-gold/20' 
                      : 'bg-white/[0.05]'
                  }
                `}>
                  {completed ? (
                    <Check size={22} className="text-brand-green" strokeWidth={3} />
                  ) : unlocked ? (
                    <span>{lesson.emoji}</span>
                  ) : (
                    <Lock size={18} className="text-white/30" />
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="text-[0.6rem] text-brand-text-muted/60 font-semibold mb-0.5">
                    Lección {lesson.order}
                  </div>
                  <div className="text-[0.95rem] font-bold text-white mb-0.5">
                    {lesson.title}
                  </div>
                  <div className="text-xs text-brand-text-muted">
                    {lesson.subtitle}
                  </div>
                </div>

                {/* Action indicator */}
                {isCurrent && (
                  <div className="w-9 h-9 rounded-full bg-brand-gold flex items-center justify-center shrink-0">
                    <Play size={16} color="#000" fill="#000" />
                  </div>
                )}
              </motion.button>
            </div>
          );
        })}

        {/* Final reward card */}
        <div className={`w-[3px] h-8 mx-auto rounded-full ${
          allDone 
            ? 'bg-gradient-to-b from-brand-green to-brand-gold' 
            : 'bg-white/[0.06]'
        }`} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`
            glass-card w-full max-w-[340px] p-5 text-center relative overflow-hidden
            ${allDone 
              ? 'animate-pulse-glow border-2 !border-brand-gold' 
              : 'border-2 !border-white/[0.08]'
            }
          `}
        >
          {!allDone && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10">
              <Lock size={28} className="text-white/25" />
            </div>
          )}
          <div className="text-3xl mb-2">🎯</div>
          <div className={` font-bold text-sm ${
            allDone ? 'text-brand-gold' : 'text-brand-text-muted'
          }`}>
            {allDone ? '¡DESBLOQUEADO!' : 'RECOMPENSA'}
          </div>
          <div className="text-sm text-brand-text-muted mt-1">
            Sesión Diagnóstico 1 a 1
          </div>
          {allDone && (
            <button className="btn-premium-gold rounded-xl py-3 w-full mt-4 text-sm">
              Agendar Mi Diagnóstico →
            </button>
          )}
          {!allDone && (
            <div className="text-[0.65rem] text-brand-text-muted/50 mt-2">
              Completa las {LESSONS.length} lecciones para desbloquear
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
