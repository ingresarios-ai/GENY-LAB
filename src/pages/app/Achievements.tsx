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
    <div className="pb-tab-bar" style={{ padding: '20px', maxWidth: 600, margin: '0 auto' }}>
      <motion.h1 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 24 }}
      >
        Mis Logros
      </motion.h1>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
        {[
          { icon: <Trophy size={20} />, label: 'Nivel', value: level.name, color: level.color },
          { icon: <Star size={20} />, label: 'XP Total', value: `${progress.totalXp}`, color: 'var(--gold-primary)' },
          { icon: <Target size={20} />, label: 'Lecciones', value: `${completedCount}/${LESSONS.length}`, color: 'var(--green-primary)' },
          { icon: <Flame size={20} />, label: 'Racha', value: `${progress.streak} días`, color: '#FF6B35' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card"
            style={{ padding: '16px', textAlign: 'center' }}
          >
            <div style={{ color: stat.color, marginBottom: 6 }}>{stat.icon}</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Level progression */}
      <h3 style={{ marginBottom: 12, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Niveles</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
        {LEVELS.map((lvl, i) => {
          const isCurrentLevel = lvl.id === level.id;
          const isPast = lvl.id < level.id;
          return (
            <motion.div
              key={lvl.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', borderRadius: 12,
                background: isCurrentLevel ? `${lvl.color}15` : 'var(--bg-card)',
                border: `1px solid ${isCurrentLevel ? lvl.color : 'var(--border-subtle)'}`,
                opacity: isPast || isCurrentLevel ? 1 : 0.4,
              }}
            >
              <span style={{ fontSize: '1.4rem' }}>{lvl.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: isCurrentLevel ? lvl.color : 'var(--text-primary)' }}>
                  Nivel {lvl.id}: {lvl.name}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {lvl.minXp} - {lvl.maxXp} XP
                </div>
              </div>
              {isPast && <span style={{ color: 'var(--green-primary)', fontSize: '0.8rem', fontWeight: 700 }}>✓</span>}
              {isCurrentLevel && (
                <div style={{ width: 60 }}>
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
      <h3 style={{ marginBottom: 12, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Lecciones</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {LESSONS.map((lesson, i) => {
          const completed = isLessonCompleted(lesson.id);
          return (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 10,
                background: completed ? 'rgba(0,230,118,0.08)' : 'var(--bg-card)',
                border: `1px solid ${completed ? 'rgba(0,230,118,0.3)' : 'var(--border-subtle)'}`,
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{lesson.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{lesson.title}</div>
              </div>
              {completed && (
                <span style={{ color: 'var(--green-primary)', fontSize: '0.75rem', fontWeight: 700 }}>
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
