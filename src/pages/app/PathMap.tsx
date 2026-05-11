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
    const unlocked = isLessonUnlocked(lesson.order);
    if (!unlocked) return;
    navigate(`/app/leccion/${lesson.id}`);
  };

  return (
    <div className="pb-tab-bar" style={{ padding: '0 20px' }}>
      {/* Header — Level + XP + Streak */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 0', position: 'sticky', top: 0,
          background: 'var(--bg-primary)', zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '1.3rem' }}>{level.emoji}</span>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Nivel {level.id}
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: level.color }}>
              {level.name}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* XP bar */}
          <div style={{ width: 100 }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'right', marginBottom: 2 }}>
              {progress.totalXp} XP
            </div>
            <div className="progress-bar" style={{ height: 6 }}>
              <div className="progress-bar-fill" style={{ width: `${xpInLevel.percent}%` }} />
            </div>
          </div>

          {/* Streak */}
          {progress.streak > 0 && (
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: 4,
              background: 'rgba(242, 197, 0, 0.15)', padding: '4px 10px',
              borderRadius: 20, fontSize: '0.85rem', fontWeight: 700,
              color: 'var(--gold-primary)',
            }}>
              🔥 {progress.streak}
            </div>
          )}
        </div>
      </motion.div>

      {/* Progress counter */}
      <div style={{
        textAlign: 'center', marginBottom: 24, fontSize: '0.8rem',
        color: 'var(--text-secondary)',
      }}>
        {completedCount} de {LESSONS.length} lecciones completadas
      </div>

      {/* Path nodes */}
      <div style={{ 
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 0, position: 'relative', paddingBottom: 24,
      }}>
        {LESSONS.map((lesson, i) => {
          const unlocked = isLessonUnlocked(lesson.order);
          const completed = isLessonCompleted(lesson.id);
          const isCurrent = unlocked && !completed;
          const isLeft = i % 2 === 0;

          // Phase divider
          const showPhaseDivider = i === 0 || LESSONS[i - 1]?.phase !== lesson.phase;

          return (
            <div key={lesson.id} style={{ width: '100%', maxWidth: 340 }}>
              {/* Phase divider */}
              {showPhaseDivider && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    textAlign: 'center', margin: i === 0 ? '0 0 20px' : '12px 0 20px',
                    fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: completed || unlocked ? 'var(--cyan-accent)' : 'var(--text-muted)',
                  }}
                >
                  {PHASE_LABELS[lesson.phase]}
                </motion.div>
              )}

              {/* Connector line */}
              {i > 0 && (
                <div style={{
                  width: 3, height: 32, margin: '0 auto',
                  background: completed || unlocked 
                    ? 'linear-gradient(180deg, var(--green-primary), var(--cyan-accent))' 
                    : 'var(--border-subtle)',
                  borderRadius: 99,
                }} />
              )}

              {/* Node */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08, type: 'spring', stiffness: 200 }}
                onClick={() => handleNodeClick(lesson)}
                className={isCurrent ? 'animate-pulse-glow' : ''}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  width: '100%', padding: '14px 18px',
                  background: completed 
                    ? 'linear-gradient(135deg, rgba(0,230,118,0.12), rgba(0,209,255,0.08))'
                    : isCurrent 
                      ? 'linear-gradient(135deg, rgba(242,197,0,0.12), rgba(242,197,0,0.05))'
                      : 'var(--bg-card)',
                  border: `2px solid ${
                    completed ? 'var(--green-primary)' 
                    : isCurrent ? 'var(--gold-primary)' 
                    : 'var(--border-subtle)'
                  }`,
                  borderRadius: 16,
                  cursor: unlocked ? 'pointer' : 'not-allowed',
                  opacity: unlocked ? 1 : 0.45,
                  flexDirection: isLeft ? 'row' : 'row',
                  textAlign: 'left',
                  fontFamily: 'var(--font-body)',
                  color: 'var(--text-primary)',
                  transition: 'all 0.3s var(--ease-smooth)',
                }}
              >
                {/* Icon circle */}
                <div style={{
                  width: 50, height: 50, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', flexShrink: 0,
                  background: completed 
                    ? 'rgba(0,230,118,0.2)' 
                    : isCurrent 
                      ? 'rgba(242,197,0,0.2)' 
                      : 'rgba(71,85,105,0.2)',
                }}>
                  {completed ? (
                    <Check size={24} color="var(--green-primary)" strokeWidth={3} />
                  ) : unlocked ? (
                    <span>{lesson.emoji}</span>
                  ) : (
                    <Lock size={20} color="var(--text-muted)" />
                  )}
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600,
                    marginBottom: 2,
                  }}>
                    Lección {lesson.order}
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 2 }}>
                    {lesson.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {lesson.subtitle}
                  </div>
                </div>

                {/* Action indicator */}
                {isCurrent && (
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'var(--gold-primary)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Play size={18} color="#000" fill="#000" />
                  </div>
                )}
              </motion.button>
            </div>
          );
        })}

        {/* Final reward card */}
        <div style={{
          width: 3, height: 32, margin: '0 auto',
          background: allDone 
            ? 'linear-gradient(180deg, var(--green-primary), var(--gold-primary))' 
            : 'var(--border-subtle)',
          borderRadius: 99,
        }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={allDone ? 'glass-card animate-pulse-glow' : 'glass-card'}
          style={{
            width: '100%', maxWidth: 340, padding: '20px',
            textAlign: 'center', position: 'relative', overflow: 'hidden',
            border: allDone ? '2px solid var(--gold-primary)' : '2px solid var(--border-subtle)',
          }}
        >
          {!allDone && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(2, 11, 26, 0.5)',
              backdropFilter: 'blur(2px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 2,
            }}>
              <Lock size={28} color="var(--text-muted)" />
            </div>
          )}
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>🎯</div>
          <div style={{ 
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem',
            color: allDone ? 'var(--gold-primary)' : 'var(--text-secondary)',
            marginBottom: 4,
          }}>
            {allDone ? '¡DESBLOQUEADO!' : 'RECOMPENSA'}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Sesión Diagnóstico 1 a 1
          </div>
          {allDone && (
            <button className="btn-primary" style={{ marginTop: 16, maxWidth: '100%' }}>
              Agendar Mi Diagnóstico →
            </button>
          )}
          {!allDone && (
            <div style={{ 
              fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 8,
            }}>
              Completa las {LESSONS.length} lecciones para desbloquear
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
