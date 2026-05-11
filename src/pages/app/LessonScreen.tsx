// Trader Mapp — Lesson Screen (Video + Activity)

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Play, Check, Lock, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { LESSONS, getLevelForXp, TOTAL_LESSONS } from '../../lib/lessons';
import { 
  getProgress, isLessonUnlocked,
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-5">
        <Lock size={48} className="text-white/20 mb-4" />
        <p className="text-brand-text-muted">Esta lección aún está bloqueada.</p>
        <button className="btn-secondary rounded-xl mt-4 gap-2" onClick={() => navigate('/app')}>
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

    if (result.xpEarned > 0) {
      setXpAnimation(result.xpEarned);
      setTimeout(() => setXpAnimation(null), 1500);
    }

    confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });

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
    <div className="pb-tab-bar px-5 max-w-[600px] mx-auto">
      {/* Back button + breadcrumb */}
      <div className="flex items-center gap-3 py-4">
        <button 
          onClick={() => navigate('/app')} 
          className="bg-transparent border-none cursor-pointer text-brand-text-muted hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="text-xs text-brand-text-muted/60 font-semibold">
          Lección {lesson.order} de {TOTAL_LESSONS} · {getLevelForXp(progress.totalXp).name}
        </div>
      </div>

      {/* Lesson title */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="text-3xl mb-1">{lesson.emoji}</div>
        <h1 className="text-2xl font-bold mb-2 ">{lesson.title}</h1>
        <p className="text-sm text-brand-text-muted leading-relaxed">{lesson.description}</p>
      </motion.div>

      {/* XP animation */}
      <AnimatePresence>
        {xpAnimation && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: -20, scale: 1 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 bg-brand-gold text-black px-5 py-2 rounded-full font-extrabold text-lg z-[200] "
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
        className="glass-card p-4 mb-4"
      >
        <div className="text-[0.7rem] font-bold text-brand-blue mb-3 uppercase tracking-wider">
          📹 Video de la Lección
        </div>

        {/* Video placeholder */}
        <div className="aspect-video bg-white/[0.02] rounded-xl flex items-center justify-center mb-3.5 border border-white/[0.06] relative overflow-hidden">
          {lesson.videoUrl ? (
            <iframe
              src={lesson.videoUrl}
              className="w-full h-full border-none rounded-xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="text-center text-white/20">
              <Play size={48} />
              <div className="text-xs mt-2">Video próximamente</div>
            </div>
          )}
        </div>

        {/* Mark video as watched */}
        <button
          onClick={handleMarkVideo}
          disabled={videoMarked}
          className={`
            w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer border
            ${videoMarked 
              ? 'bg-brand-green/[0.1] text-brand-green border-brand-green/40 cursor-default' 
              : 'bg-white/[0.03] text-brand-text-muted border-white/[0.08] hover:border-brand-green/30 hover:text-white'
            }
          `}
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
        className={`glass-card p-4 mb-4 transition-opacity duration-500 ${
          videoMarked ? '' : 'opacity-40 pointer-events-none'
        }`}
      >
        <div className="text-[0.7rem] font-bold text-brand-green mb-3 uppercase tracking-wider">
          🎯 Actividad Interactiva
        </div>

        <p className="text-sm text-brand-text-muted mb-4">
          {lesson.subtitle}
        </p>

        {activityDone ? (
          <div className="w-full py-3.5 text-center bg-brand-green/[0.08] rounded-xl text-brand-green font-bold flex items-center justify-center gap-2">
            <Sparkles size={18} /> Actividad completada
          </div>
        ) : (
          <button
            className="btn-primary w-full rounded-xl py-3.5"
            onClick={handleActivityComplete}
            disabled={!videoMarked}
          >
            Comenzar Actividad →
          </button>
        )}

        {!videoMarked && (
          <div className="text-[0.7rem] text-brand-text-muted/40 mt-3 text-center">
            🔒 Mira el video primero para desbloquear
          </div>
        )}
      </motion.div>

      {/* Next lesson preview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-4"
      >
        <div className="progress-bar mb-2">
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
        </div>

        {nextLesson ? (
          <div className="text-xs text-center flex items-center justify-center gap-1.5">
            {activityDone ? (
              <span className="text-brand-green">
                ✨ Siguiente: {nextLesson.emoji} {nextLesson.title}
              </span>
            ) : (
              <span className="text-brand-text-muted/50">
                <Lock size={12} className="inline mr-1" /> Siguiente: {nextLesson.title}
              </span>
            )}
          </div>
        ) : (
          <div className="text-xs text-center text-brand-gold font-semibold">
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
            className="fixed inset-0 z-[300] bg-black/85 backdrop-blur-lg flex items-center justify-center flex-col cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="text-7xl mb-4"
            >
              {levelUpData.emoji}
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl  font-bold text-brand-gold text-center"
            >
              ¡NIVEL UP!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-xl font-bold text-white mt-2"
            >
              {levelUpData.name}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-brand-text-muted/60 mt-6 text-sm"
            >
              Toca para continuar
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
