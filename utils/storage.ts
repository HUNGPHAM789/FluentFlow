// --- utils/storage.ts ---
import { UserProfile } from '../types';

const APP_PREFIX = 'fluent_';

export const STORAGE_KEYS = {
  USER: `${APP_PREFIX}user`,
  VERSION: `${APP_PREFIX}version`,
  QUOTE: `${APP_PREFIX}quote`,
  QUOTE_TIME: `${APP_PREFIX}quote_time`,
};

export const VOCAB_PROGRESS_KEY = `${APP_PREFIX}vocab_progress_v1`;

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