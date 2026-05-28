// GENY LAB — User progress store (In-memory, synced from Supabase)

import { LESSONS, getLevelForXp, type Lesson } from './lessons';

export interface LessonProgress {
  lessonId: string;
  videoCompleted: boolean;
  activityCompleted: boolean;
  completedAt?: string;
}

export interface UserProgress {
  lessonProgress: Record<string, LessonProgress>;
  totalXp: number;
  streak: number;
  lastActivityDate?: string;
}

const defaultProgress: UserProgress = {
  lessonProgress: {},
  totalXp: 0,
  streak: 0,
};

// In-memory store
let memoryStore: UserProgress = { ...defaultProgress };

// ============================================
// Read / Write
// ============================================

export const getProgress = (): UserProgress => {
  return memoryStore;
};

const saveProgress = (progress: UserProgress) => {
  memoryStore = { ...progress };
};

// ============================================
// Queries
// ============================================

export const isLessonUnlocked = (lessonOrder: number): boolean => {
  if (lessonOrder === 1) return true; // First lesson always unlocked
  const progress = getProgress();

  // If the lesson itself is already completed, it is unlocked
  const currentLesson = LESSONS.find(l => l.order === lessonOrder);
  if (currentLesson) {
    const lp = progress.lessonProgress[currentLesson.id];
    if (lp?.videoCompleted && lp?.activityCompleted) return true;
  }

  // Previous lesson must be fully completed
  const prevLesson = LESSONS.find(l => l.order === lessonOrder - 1);
  if (!prevLesson) return false;
  const prevProgress = progress.lessonProgress[prevLesson.id];
  return !!(prevProgress?.videoCompleted && prevProgress?.activityCompleted);
};

export const isLessonCompleted = (lessonId: string): boolean => {
  const progress = getProgress();
  const lp = progress.lessonProgress[lessonId];
  return !!(lp?.videoCompleted && lp?.activityCompleted);
};

export const getCurrentLesson = (): Lesson => {
  const progress = getProgress();
  for (const lesson of LESSONS) {
    const lp = progress.lessonProgress[lesson.id];
    if (!lp?.videoCompleted || !lp?.activityCompleted) {
      return lesson;
    }
  }
  return LESSONS[LESSONS.length - 1]; // All completed
};

export const getCompletedCount = (): number => {
  const progress = getProgress();
  return LESSONS.filter(l => {
    const lp = progress.lessonProgress[l.id];
    return lp?.videoCompleted && lp?.activityCompleted;
  }).length;
};

export const isAllCompleted = (): boolean => {
  return getCompletedCount() === LESSONS.length;
};

// ============================================
// Mutations
// ============================================

export const markVideoCompleted = (lessonId: string): { xpEarned: number; newTotalXp: number } => {
  const progress = getProgress();
  const lesson = LESSONS.find(l => l.id === lessonId);
  if (!lesson) return { xpEarned: 0, newTotalXp: progress.totalXp };

  if (!progress.lessonProgress[lessonId]) {
    progress.lessonProgress[lessonId] = {
      lessonId,
      videoCompleted: false,
      activityCompleted: false,
    };
  }

  if (progress.lessonProgress[lessonId].videoCompleted) {
    return { xpEarned: 0, newTotalXp: progress.totalXp };
  }

  progress.lessonProgress[lessonId].videoCompleted = true;
  progress.totalXp += lesson.xpVideo;
  saveProgress(progress);

  return { xpEarned: lesson.xpVideo, newTotalXp: progress.totalXp };
};

export const markActivityCompleted = (lessonId: string): { 
  xpEarned: number; 
  newTotalXp: number;
  lessonCompleted: boolean;
  leveledUp: boolean;
  newLevel: ReturnType<typeof getLevelForXp>;
} => {
  const progress = getProgress();
  const lesson = LESSONS.find(l => l.id === lessonId);
  if (!lesson) return { 
    xpEarned: 0, newTotalXp: progress.totalXp, 
    lessonCompleted: false, leveledUp: false, 
    newLevel: getLevelForXp(progress.totalXp) 
  };

  if (!progress.lessonProgress[lessonId]) {
    progress.lessonProgress[lessonId] = {
      lessonId,
      videoCompleted: false,
      activityCompleted: false,
    };
  }

  if (progress.lessonProgress[lessonId].activityCompleted) {
    return { 
      xpEarned: 0, newTotalXp: progress.totalXp, 
      lessonCompleted: true, leveledUp: false, 
      newLevel: getLevelForXp(progress.totalXp) 
    };
  }

  const prevLevel = getLevelForXp(progress.totalXp);

  let xpEarned = lesson.xpActivity;
  // Auto-complete video if not already completed
  if (!progress.lessonProgress[lessonId].videoCompleted) {
    progress.lessonProgress[lessonId].videoCompleted = true;
    xpEarned += lesson.xpVideo + lesson.xpBonus;
  } else {
    xpEarned += lesson.xpBonus;
  }

  progress.lessonProgress[lessonId].activityCompleted = true;
  progress.lessonProgress[lessonId].completedAt = new Date().toISOString();
  progress.totalXp += xpEarned;

  // Streak
  const today = new Date().toISOString().split('T')[0];
  if (progress.lastActivityDate) {
    const lastDate = new Date(progress.lastActivityDate);
    const diffDays = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) {
      progress.streak += 1;
    } else {
      progress.streak = 1;
    }
  } else {
    progress.streak = 1;
  }
  progress.lastActivityDate = today;

  saveProgress(progress);

  const newLevel = getLevelForXp(progress.totalXp);
  const leveledUp = newLevel.id > prevLevel.id;

  return { xpEarned, newTotalXp: progress.totalXp, lessonCompleted: true, leveledUp, newLevel };
};

export const syncFromDB = (activityIds: string[]) => {
  // We re-initialize from scratch to avoid duplicate increments
  memoryStore = { ...defaultProgress, lessonProgress: {} };
  const progress = getProgress();
  let changed = false;

  for (const lessonId of activityIds) {
    const lesson = LESSONS.find(l => l.id === lessonId);
    if (!lesson) continue;

    if (!progress.lessonProgress[lessonId]) {
      progress.lessonProgress[lessonId] = {
        lessonId,
        videoCompleted: false,
        activityCompleted: false,
      };
    }

    const lp = progress.lessonProgress[lessonId];
    if (!lp.videoCompleted || !lp.activityCompleted) {
      if (!lp.videoCompleted) {
        lp.videoCompleted = true;
        progress.totalXp += lesson.xpVideo;
      }
      if (!lp.activityCompleted) {
        lp.activityCompleted = true;
        progress.totalXp += lesson.xpActivity;
        lp.completedAt = new Date().toISOString();
      }
      changed = true;
    }
  }

  saveProgress(progress);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('progress-synced'));
  }
};

// ============================================
// User payment method (for conditional UI)
// ============================================

const PM_KEY = 'geny_lab_user_pm';

export const setUserPaymentMethod = (pm: string) => {
  try { localStorage.setItem(PM_KEY, pm); } catch {}
};

export const getUserPaymentMethod = (): string | null => {
  try { return localStorage.getItem(PM_KEY); } catch { return null; }
};

/** Returns true when the current user is an "Alumno tribu" (source = ghl) */
export const isAlumnoTribu = (): boolean => getUserPaymentMethod() === 'ghl';
