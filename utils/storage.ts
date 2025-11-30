

// --- utils/storage.ts ---
import { UserProfile, GrammarProgress, GrammarLevel, GrammarLessonState, EnglishLevel, GrammarProgressRecord } from '../types';
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