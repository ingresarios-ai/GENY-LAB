// Trader Mapp — Lesson Screen (Video + Activity)

import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Play, Check, Lock, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { LESSONS, getLevelForXp, TOTAL_LESSONS } from '../../lib/lessons';
import { 
  getProgress, isLessonUnlocked, isLessonCompleted,
  markVideoCompleted, markActivityCompleted, getCompletedCount,
} from '../../lib/progressStore';

export default function LessonScreen() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
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
  const [xpAnimation, setXpAnimation] = useState<number | null>(null);

  if (!lesson || !isLessonUnlocked(lesson.order)) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <Lock size={48} color="var(--text-muted)" />
        <p style={{ marginTop: 16 }}>Esta lección aún está bloqueada.</p>
        <button className="btn-secondary" onClick={() => navigate('/app')} style={{ marginTop: 16 }}>
          ← Volver al Mapa
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

  const handleActivityComplete = () => {
    if (activityDone) return;
    const result = markActivityCompleted(lesson.id);
    setActivityDone(true);
    setProgress(getProgress());

    // XP animation
    if (result.xpEarned > 0) {
      setXpAnimation(result.xpEarned);
      setTimeout(() => setXpAnimation(null), 1500);
    }

    // Confetti
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });

    // Level up check
    if (result.leveledUp) {
      setTimeout(() => {
        setLevelUpData({ name: result.newLevel.name, emoji: result.newLevel.emoji });
        setShowLevelUp(true);
        confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
      }, 800);
    }
  };

  const nextLesson = LESSONS.find(l => l.order === lesson.order + 1);

  return (
    <div className="pb-tab-bar" style={{ padding: '0 20px', maxWidth: 600, margin: '0 auto' }}>
      {/* Back button + breadcrumb */}
      <div style={{ 
        display: 'flex', alignItems: 'center', gap: 12, padding: '16px 0',
      }}>
        <button onClick={() => navigate('/app')} style={{
          background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)',
          display: 'flex', alignItems: 'center',
        }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          Lección {lesson.order} de {TOTAL_LESSONS} · {getLevelForXp(progress.totalXp).name}
        </div>
      </div>

      {/* Lesson title */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 24 }}
      >
        <div style={{ fontSize: '2rem', marginBottom: 4 }}>{lesson.emoji}</div>
        <h1 style={{ fontSize: '1.5rem', marginBottom: 6 }}>{lesson.title}</h1>
        <p style={{ fontSize: '0.9rem' }}>{lesson.description}</p>
      </motion.div>

      {/* XP animation */}
      <AnimatePresence>
        {xpAnimation && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: -20, scale: 1 }}
            exit={{ opacity: 0, y: -50 }}
            style={{
              position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
              background: 'var(--gold-primary)', color: '#000', padding: '8px 20px',
              borderRadius: 20, fontWeight: 800, fontSize: '1.1rem', zIndex: 200,
              fontFamily: 'var(--font-display)',
            }}
          >
            +{xpAnimation} XP ✨
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card" 
        style={{ padding: 16, marginBottom: 16 }}
      >
        <div style={{ 
          fontSize: '0.75rem', fontWeight: 700, color: 'var(--cyan-accent)', 
          marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>
          📹 Video de la Lección
        </div>

        {/* Video placeholder */}
        <div style={{
          aspectRatio: '16/9', background: 'var(--bg-secondary)',
          borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 14, border: '1px solid var(--border-subtle)',
          position: 'relative', overflow: 'hidden',
        }}>
          {lesson.videoUrl ? (
            <iframe
              src={lesson.videoUrl}
              style={{ width: '100%', height: '100%', border: 'none', borderRadius: 12 }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              <Play size={48} />
              <div style={{ fontSize: '0.8rem', marginTop: 8 }}>Video próximamente</div>
            </div>
          )}
        </div>

        {/* Mark video as watched */}
        <button
          onClick={handleMarkVideo}
          disabled={videoMarked}
          style={{
            width: '100%', padding: '12px',
            background: videoMarked ? 'rgba(0,230,118,0.15)' : 'var(--bg-secondary)',
            color: videoMarked ? 'var(--green-primary)' : 'var(--text-secondary)',
            border: `1px solid ${videoMarked ? 'var(--green-primary)' : 'var(--border-subtle)'}`,
            borderRadius: 10, cursor: videoMarked ? 'default' : 'pointer',
            fontWeight: 600, fontSize: '0.85rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.3s ease',
            fontFamily: 'var(--font-body)',
          }}
        >
          {videoMarked ? <Check size={18} /> : <Play size={18} />}
          {videoMarked ? 'Video completado ✓' : 'Marcar video como visto'}
        </button>
      </motion.div>

      {/* Activity section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card" 
        style={{ 
          padding: 16, marginBottom: 16,
          opacity: videoMarked ? 1 : 0.5,
          pointerEvents: videoMarked ? 'auto' : 'none',
          transition: 'opacity 0.4s ease',
        }}
      >
        <div style={{ 
          fontSize: '0.75rem', fontWeight: 700, color: 'var(--green-primary)', 
          marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>
          🎯 Actividad Interactiva
        </div>

        <p style={{ fontSize: '0.85rem', marginBottom: 16 }}>
          {lesson.subtitle}
        </p>

        {activityDone ? (
          <div style={{
            width: '100%', padding: '14px', textAlign: 'center',
            background: 'rgba(0,230,118,0.12)', borderRadius: 10,
            color: 'var(--green-primary)', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <Sparkles size={18} /> Actividad completada
          </div>
        ) : (
          <button
            className="btn-primary"
            onClick={handleActivityComplete}
            disabled={!videoMarked}
            style={{ maxWidth: '100%' }}
          >
            Comenzar Actividad →
          </button>
        )}

        {!videoMarked && (
          <div style={{ 
            fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 10, textAlign: 'center',
          }}>
            🔒 Mira el video primero para desbloquear
          </div>
        )}
      </motion.div>

      {/* Next lesson preview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{ marginBottom: 16 }}
      >
        <div className="progress-bar" style={{ marginBottom: 8 }}>
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
        </div>

        {nextLesson ? (
          <div style={{ 
            fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            {activityDone ? (
              <span style={{ color: 'var(--green-primary)' }}>
                ✨ Siguiente: {nextLesson.emoji} {nextLesson.title}
              </span>
            ) : (
              <>
                <Lock size={14} /> Siguiente: {nextLesson.title}
              </>
            )}
          </div>
        ) : (
          <div style={{ 
            fontSize: '0.8rem', color: 'var(--gold-primary)', textAlign: 'center',
            fontWeight: 600,
          }}>
            🎯 Te {remaining === 0 ? 'queda' : `faltan ${remaining}`} lección{remaining !== 1 ? 'es' : ''} para tu Diagnóstico 1 a 1
          </div>
        )}
      </motion.div>

      {/* Level-up overlay */}
      <AnimatePresence>
        {showLevelUp && levelUpData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLevelUp(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 300,
              background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', cursor: 'pointer',
            }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              style={{ fontSize: '5rem', marginBottom: 16 }}
            >
              {levelUpData.emoji}
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{ 
                fontSize: '2.5rem', color: 'var(--gold-primary)',
                fontFamily: 'var(--font-display)', textAlign: 'center',
              }}
            >
              ¡NIVEL UP!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              style={{ 
                fontSize: '1.2rem', color: 'var(--text-primary)', marginTop: 8,
                fontWeight: 700,
              }}
            >
              {levelUpData.name}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              style={{ color: 'var(--text-muted)', marginTop: 24, fontSize: '0.85rem' }}
            >
              Toca para continuar
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
