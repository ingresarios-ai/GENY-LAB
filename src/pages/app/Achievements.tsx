// Trader Mapp — Achievements / Results Page

import { useMemo } from 'react';
import { motion } from 'motion/react';
import { Trophy, Star, Flame, Target } from 'lucide-react';
import { LESSONS, LEVELS, getLevelForXp, getXpProgressInLevel } from '../../lib/lessons';
import { getProgress, getCompletedCount, isLessonCompleted } from '../../lib/progressStore';

export default function Achievements() {
  const progress = useMemo(() => getProgress(), []);
  const level = getLevelForXp(progress.totalXp);
  const xpInLevel = getXpProgressInLevel(progress.totalXp);
  const completedCount = getCompletedCount();

  return (
    <div className="pb-tab-bar px-5 max-w-[600px] mx-auto pt-6">
      <motion.h1 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl  font-bold mb-6"
      >
        Mis Logros
      </motion.h1>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-7">
        {[
          { icon: <Trophy size={20} />, label: 'Nivel', value: level.name, color: level.color },
          { icon: <Star size={20} />, label: 'XP Total', value: `${progress.totalXp}`, color: '#F2C500' },
          { icon: <Target size={20} />, label: 'Lecciones', value: `${completedCount}/${LESSONS.length}`, color: '#00E676' },
          { icon: <Flame size={20} />, label: 'Racha', value: `${progress.streak} días`, color: '#FF6321' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card p-4 text-center"
          >
            <div className="mb-1.5" style={{ color: stat.color }}>{stat.icon}</div>
            <div className="text-xl font-extrabold " style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-[0.65rem] text-brand-text-muted/60 font-semibold mt-0.5">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Level progression */}
      <h3 className="text-sm text-brand-text-muted mb-3 font-semibold">Niveles</h3>
      <div className="flex flex-col gap-2 mb-7">
        {LEVELS.map((lvl, i) => {
          const isCurrentLevel = lvl.id === level.id;
          const isPast = lvl.id < level.id;
          return (
            <motion.div
              key={lvl.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`
                flex items-center gap-3 py-3 px-4 rounded-xl border transition-all
                ${isCurrentLevel 
                  ? 'bg-white/[0.04] border-white/10' 
                  : 'bg-white/[0.02] border-white/[0.04]'
                }
                ${isPast || isCurrentLevel ? '' : 'opacity-35'}
              `}
              style={isCurrentLevel ? { borderColor: `${lvl.color}40` } : {}}
            >
              <span className="text-xl">{lvl.emoji}</span>
              <div className="flex-1">
                <div className="font-bold text-sm" style={{ color: isCurrentLevel ? lvl.color : '#fff' }}>
                  Nivel {lvl.id}: {lvl.name}
                </div>
                <div className="text-[0.65rem] text-brand-text-muted/50">
                  {lvl.minXp} - {lvl.maxXp} XP
                </div>
              </div>
              {isPast && <span className="text-brand-green text-sm font-bold">✓</span>}
              {isCurrentLevel && (
                <div className="w-14">
                  <div className="progress-bar" style={{ height: 4 }}>
                    <div className="progress-bar-fill" style={{ width: `${xpInLevel.percent}%` }} />
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Completed lessons */}
      <h3 className="text-sm text-brand-text-muted mb-3 font-semibold">Lecciones</h3>
      <div className="flex flex-col gap-1.5">
        {LESSONS.map((lesson, i) => {
          const completed = isLessonCompleted(lesson.id);
          return (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className={`
                flex items-center gap-2.5 py-2.5 px-3.5 rounded-xl border
                ${completed 
                  ? 'bg-brand-green/[0.05] border-brand-green/20' 
                  : 'bg-white/[0.02] border-white/[0.04]'
                }
              `}
            >
              <span className="text-lg">{lesson.emoji}</span>
              <div className="flex-1">
                <div className="text-sm font-semibold">{lesson.title}</div>
              </div>
              {completed && (
                <span className="text-brand-green text-[0.7rem] font-bold">
                  ✓ +{lesson.xpVideo + lesson.xpActivity + lesson.xpBonus} XP
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
