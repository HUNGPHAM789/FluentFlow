// --- utils/storage.ts ---
import { UserProfile, GrammarProgress, GrammarLevel, GrammarLessonState, EnglishLevel, GrammarProgressRecord, DrillPerformance } from '../types';
import { grammarLevels } from '../data/grammarData';
import { isPlacementHigherOrEqual } from './levelUtils';

const APP_PREFIX = 'fluent_';

export const STORAGE_KEYS = {
  USER: `${APP_PREFIX}user`,
  VERSION: `${APP_PREFIX}version`,
  QUOTE: `${APP_PREFIX}quote`,
  QUOTE_TIME: `${APP_PREFIX}quote_time`,
};

export const VOCAB_PROGRESS_KEY = `${APP_PREFIX}vocab_progress_v1`;
export const GRAMMAR_PROGRESS_KEY = `${APP_PREFIX}grammar_progress_v1`;
export const DRILL_PERFORMANCE_KEY = `${APP_PREFIX}drill_performance_v1`;

export type VocabProgress = {
  [word: string]: {
    masteryLevel: number; // 0 = not mastered, 1 = mastered
    lastReviewed?: string;
  };
};

/**
 * Clears only the keys associated with this application.
 * Prevents wiping data from other apps running on the same domain (e.g., localhost).
 */
export const clearAppStorage = () => {
  // Snapshot keys to avoid issues while iterating and deleting
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(APP_PREFIX)) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
  console.log(`[Storage] Cleared ${keysToRemove.length} app-specific keys.`);
};

/**
 * Safely loads the user profile. 
 * Can be expanded to include migration logic in the future.
 */
export const loadUserProfile = (): UserProfile | null => {
  const saved = localStorage.getItem(STORAGE_KEYS.USER);
  if (!saved) return null;

  try {
    const parsed = JSON.parse(saved);
    // Basic schema validation/migration could happen here
    return parsed;
  } catch (e) {
    console.error("[Storage] Failed to parse user profile", e);
    return null;
  }
};

/**
 * Saves the user profile to local storage.
 */
export const saveUserProfile = (user: UserProfile) => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

export const getStoredVersion = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.VERSION);
};

export const setStoredVersion = (version: string) => {
  localStorage.setItem(STORAGE_KEYS.VERSION, version);
};

/**
 * Loads the separate vocabulary progress map.
 */
export const loadVocabProgress = (): VocabProgress => {
  const saved = localStorage.getItem(VOCAB_PROGRESS_KEY);
  if (!saved) return {};
  try {
    return JSON.parse(saved);
  } catch (e) {
    console.error("[Storage] Failed to parse vocab progress", e);
    return {};
  }
};

/**
 * Saves the separate vocabulary progress map.
 */
export const saveVocabProgress = (progress: VocabProgress) => {
  localStorage.setItem(VOCAB_PROGRESS_KEY, JSON.stringify(progress));
};

/* -------------------------------------------------------------------------- */
/*                           GRAMMAR STORAGE HELPERS                          */
/* -------------------------------------------------------------------------- */

export const loadGrammarProgress = (): GrammarProgress => {
    const saved = localStorage.getItem(GRAMMAR_PROGRESS_KEY);
    if (!saved) return {};
    try {
        return JSON.parse(saved);
    } catch (e) {
        console.error("[Storage] Failed to parse grammar progress", e);
        return {};
    }
};

export const saveGrammarProgress = (progress: GrammarProgress) => {
    localStorage.setItem(GRAMMAR_PROGRESS_KEY, JSON.stringify(progress));
};

/* -------------------------------------------------------------------------- */
/*                        DRILL PERFORMANCE HELPERS                           */
/* -------------------------------------------------------------------------- */

export const getDrillPerformanceMap = (): Record<string, DrillPerformance> => {
  const saved = localStorage.getItem(DRILL_PERFORMANCE_KEY);
  if (!saved) return {};
  try {
    return JSON.parse(saved);
  } catch (e) {
    console.error("[Storage] Failed to parse drill performance", e);
    return {};
  }
};

export const saveDrillPerformanceMap = (map: Record<string, DrillPerformance>) => {
  localStorage.setItem(DRILL_PERFORMANCE_KEY, JSON.stringify(map));
};

export const recordDrillResult = (drillId: string, isCorrect: boolean) => {
  const map = getDrillPerformanceMap();
  const existing = map[drillId] || {
    drillId,
    correctCount: 0,
    incorrectCount: 0,
  };

  if (isCorrect) {
    existing.correctCount = (existing.correctCount || 0) + 1;
  } else {
    existing.incorrectCount = (existing.incorrectCount || 0) + 1;
  }
  
  existing.lastAnswerAt = new Date().toISOString();
  
  map[drillId] = existing;
  saveDrillPerformanceMap(map);
};

export const getWeakDrillIds = (options: { limit?: number } = {}): string[] => {
  const limit = options.limit || 20;
  const map = getDrillPerformanceMap();
  const drills = Object.values(map);

  // Filter: drills with at least one incorrect answer are candidates
  const candidates = drills.filter(d => d.incorrectCount > 0);
  
  const now = Date.now();
  const ONE_HOUR = 60 * 60 * 1000;
  const ONE_DAY = 24 * ONE_HOUR;

  // Helper to determine time-based weight (Spaced Repetition Lite)
  const getRecencyFactor = (lastAnswerAt?: string): number => {
      if (!lastAnswerAt) return 1.5; // Treat unknown time as "old" (priority)
      
      const lastTime = new Date(lastAnswerAt).getTime();
      const diff = now - lastTime;
      
      if (diff < 2 * ONE_HOUR) return 0.5; // Very recent -> Deprioritize
      if (diff < ONE_DAY) return 0.8; // Recent -> Slight deprioritize
      if (diff > 3 * ONE_DAY) return 1.2; // Older -> Boost priority
      
      return 1.0; // Standard > 24h
  };

  // Sort by weighted weakness
  candidates.sort((a, b) => {
    // Base mistake score: higher incorrect increases score, high correct decreases it slightly.
    // We clamp it to a minimum of 0.1 to ensure the recency factor has something to multiply.
    const baseScoreA = Math.max(0.1, a.incorrectCount - (a.correctCount * 0.3));
    const baseScoreB = Math.max(0.1, b.incorrectCount - (b.correctCount * 0.3));
    
    const scoreA = baseScoreA * getRecencyFactor(a.lastAnswerAt);
    const scoreB = baseScoreB * getRecencyFactor(b.lastAnswerAt);
    
    return scoreB - scoreA; // Descending
  });

  return candidates.slice(0, limit).map(d => d.drillId);
};

export const countDrillsAnsweredToday = (): number => {
  const map = getDrillPerformanceMap();
  const today = new Date().toDateString();
  
  return Object.values(map).filter(d => {
    if (!d.lastAnswerAt) return false;
    return new Date(d.lastAnswerAt).toDateString() === today;
  }).length;
};

/* -------------------------------------------------------------------------- */
/*                           LESSON STATES & LOGIC                            */
/* -------------------------------------------------------------------------- */

export const getLessonState = (lessonId: string, progress: GrammarProgress): GrammarLessonState => {
    return progress[lessonId]?.state || 'locked'; // Default locked unless computed otherwise
};

export const isPreA0Completed = (progress: GrammarProgress): boolean => {
    const preLessons = grammarLevels.find(g => g.level === 'PreA0')?.lessons || [];
    if (preLessons.length === 0) return true; // No lessons means completed? Or N/A. Let's assume true so we don't block.
    
    // Check if every lesson in PreA0 is mastered
    return preLessons.every(lesson => {
        const p = progress[lesson.id];
        return p && p.state === 'mastered';
    });
};

export const isLevelUnlocked = (level: GrammarLevel, progress: GrammarProgress, userLevel?: EnglishLevel): boolean => {
    // 0. SPECIAL RULE: If user is PRE_A0, they MUST finish PreA0 first.
    // While in PreA0 mode, ONLY PreA0 is unlocked.
    if (userLevel === EnglishLevel.PRE_A0) {
        if (level === 'PreA0') return true;
        return false; // Lock everything else until upgrade
    }

    // 1. PreA0 and A0 are always unlocked for non-PreA0 users (A0+ users)
    if (level === 'PreA0' || level === 'A0') return true;

    // 2. If user's placement level is high enough, unlock immediately
    if (userLevel && isPlacementHigherOrEqual(userLevel, level)) {
        return true;
    }

    // 3. Otherwise, check progress of previous level
    const levelsOrder: GrammarLevel[] = ['PreA0', 'A0', 'A1', 'A2', 'B1', 'B2'];
    const idx = levelsOrder.indexOf(level);
    
    if (idx <= 0) return true; 

    const prevLevel = levelsOrder[idx - 1];
    
    const prevLevelGroup = grammarLevels.find(g => g.level === prevLevel);
    if (!prevLevelGroup) return false; 

    // If any lesson in previous level is NOT mastered, then current level is locked
    return prevLevelGroup.lessons.every(lesson => {
        const p = progress[lesson.id];
        return p && p.state === 'mastered';
    });
};

export const updateLessonProgress = (
  progress: GrammarProgress,
  lessonId: string,
  partial: Partial<GrammarProgressRecord>
): GrammarProgress => {
  const existing = progress[lessonId] || {
    state: 'available',
    completedDrills: 0,
    totalDrills: 0
  };
  
  const next: GrammarProgressRecord = {
    ...existing,
    ...partial,
    lastUpdated: new Date().toISOString()
  };
  
  const updated = { ...progress, [lessonId]: next };
  saveGrammarProgress(updated);
  return updated;
};

// Backwards compatibility wrapper if needed, or simple direct use
export const updateGrammarLessonProgress = (lessonId: string, isComplete: boolean) => {
    const progress = loadGrammarProgress();
    // Default to a simple update
    updateLessonProgress(progress, lessonId, {
      state: isComplete ? 'mastered' : 'in_progress'
    });
};

/* -------------------------------------------------------------------------- */
/*                           XP & STREAK HELPERS                              */
/* -------------------------------------------------------------------------- */

export const addUserXp = (amount: number): UserProfile | null => {
  const user = loadUserProfile();
  if (!user) return null;
  
  user.xp = (user.xp || 0) + amount;
  saveUserProfile(user);
  return user;
};

export const updateStreakOnActivity = (): UserProfile | null => {
  const user = loadUserProfile();
  if (!user) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime(); // Start of today
  
  // If never active, init
  if (!user.lastActive) {
      user.streak = 1;
      user.lastActive = now.toISOString();
      saveUserProfile(user);
      return user;
  }

  const lastActiveDate = new Date(user.lastActive);
  const lastActiveDay = new Date(lastActiveDate.getFullYear(), lastActiveDate.getMonth(), lastActiveDate.getDate()).getTime();

  const oneDay = 24 * 60 * 60 * 1000;
  const diff = today - lastActiveDay;

  if (diff === 0) {
      // Already active today, just update timestamp
      user.lastActive = now.toISOString();
  } else if (diff === oneDay) {
      // Consecutive day
      user.streak += 1;
      user.lastActive = now.toISOString();
  } else if (diff > oneDay) {
      // Streak broken
      user.streak = 1;
      user.lastActive = now.toISOString();
  }

  saveUserProfile(user);
  return user;
};