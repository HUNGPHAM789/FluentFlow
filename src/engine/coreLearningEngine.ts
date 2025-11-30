// === LOG ENTRY: 2025-05-23 11:00:00 ===
// ACTION TYPE: file_create
// LOG_TAG: grammar-progress
// FILES AFFECTED:
// - src/engine/coreLearningEngine.ts
// - src/hooks/useLearningSession.ts
// DESCRIPTION:
// Created initial Core Learning Engine skeleton and hook wrapper with placeholder logic, no behavior changes yet.
// CODE DIFF:
// + export class CoreLearningEngine { ... }
// + export const useLearningSession = ...

import { GrammarDrillItem, VocabDrillContent, BadgeDefinition, UserProfile } from '../types';
import { grammarLevels } from '../data/grammarData';
import { addUserXp, updateStreakOnActivity, loadUserProfile, recordDrillResult, getWeakDrillIds } from '../utils/storage';

export type LearningType = 'GRAMMAR' | 'VOCABULARY';

// Union type for the actual content payload
export type LearningContent = GrammarDrillItem | VocabDrillContent;

export interface LearningItem {
  id: string;
  type: LearningType;
  content: LearningContent;
  masteryState: 'new' | 'learning' | 'review' | 'mastered';
}

export interface LearningSession {
  sessionId: string;
  mode: 'NEW_LESSON' | 'REVIEW' | 'PLACEMENT';
  items: LearningItem[];
  currentIndex: number;
  stats: {
    correct: number;
    incorrect: number;
    xpGained: number;
  };
}

export interface LearningResult {
  isCorrect: boolean;
  feedback: string;
  xpAwarded: number;
  updatedItemState: LearningItem['masteryState'];
  badgeUnlocked?: BadgeDefinition;
}

/**
 * Core Learning Engine
 * A logic-only layer that manages learning sessions, grading, and progress updates.
 */
export class CoreLearningEngine {
  
  /**
   * Initializes a new learning session.
   * @param type - The type of learning (GRAMMAR or VOCABULARY).
   * @param options - Configuration for the session (lessonId, mode).
   * @returns A new LearningSession object with initialized stats and items.
   */
  static startSession(
    type: LearningType,
    options: { lessonId?: string; mode?: 'NEW_LESSON' | 'REVIEW' | 'PLACEMENT'; limit?: number }
  ): LearningSession {
    console.log(`[CoreLearningEngine] Starting session: ${type}`, options);

    if (type === 'GRAMMAR') {
      if (options.mode === 'REVIEW') {
        return this.startGrammarReviewSession(options.limit);
      }
      if (options.lessonId) {
        return this.startGrammarSession(options.lessonId);
      }
    }

    if (type === 'VOCABULARY') {
      return this.startVocabSession(options.lessonId);
    }

    // Fallback Mock (Safe default if type is unknown)
    const mockItem: LearningItem = {
      id: `mock-generic-1`,
      type: type,
      masteryState: 'new',
      content: {
            word: 'Scaffold',
            definition: 'A temporary structure.',
            situations: [],
            meaningQuiz: { question: '?', options: [], correctIndex: 0 },
            translationQuiz: { nativeSentence: '', correctEnglish: '', scrambledEnglish: [] },
            scrambleSentence: { scrambled: [], correct: '', translation: '' },
            wordForms: {}
          } as VocabDrillContent
    };

    return {
      sessionId: `session_${Date.now()}`,
      mode: options.mode || 'NEW_LESSON',
      items: [mockItem],
      currentIndex: 0,
      stats: {
        correct: 0,
        incorrect: 0,
        xpGained: 0
      }
    };
  }

  /**
   * Starts a grammar session by looking up the lesson ID in static data.
   */
  private static startGrammarSession(lessonId: string): LearningSession {
    // 1. Find the lesson in the data
    let foundLesson = null;
    for (const group of grammarLevels) {
      const match = group.lessons.find(l => l.id === lessonId);
      if (match) {
        foundLesson = match;
        break;
      }
    }

    if (!foundLesson) {
      console.warn(`[CoreLearningEngine] Lesson ID ${lessonId} not found.`);
      return {
        sessionId: `error_${Date.now()}`,
        mode: 'NEW_LESSON',
        items: [],
        currentIndex: 0,
        stats: { correct: 0, incorrect: 0, xpGained: 0 }
      };
    }

    // 2. Map drills to LearningItems
    const items: LearningItem[] = foundLesson.drills.map(drill => ({
      id: drill.id,
      type: 'GRAMMAR',
      content: drill,
      masteryState: 'new'
    }));

    // 3. Return session
    return {
      sessionId: `${lessonId}_${Date.now()}`,
      mode: 'NEW_LESSON',
      items: items,
      currentIndex: 0,
      stats: {
        correct: 0,
        incorrect: 0,
        xpGained: 0
      }
    };
  }

  /**
   * Stub: Starts a vocabulary session.
   * Currently returns an empty session as a placeholder for future implementation.
   */
  static startVocabSession(topicId?: string): LearningSession {
    return {
      sessionId: `vocab-${topicId ?? 'general'}-${Date.now()}`,
      mode: 'NEW_LESSON',
      items: [], // placeholder for now; vocab items will be loaded in future steps
      currentIndex: 0,
      stats: { correct: 0, incorrect: 0, xpGained: 0 },
    };
  }

  /**
   * Retrieves review items based on weak drill performance.
   */
  static getGrammarReviewItems(limit: number = 20): LearningItem[] {
    const weakIds = getWeakDrillIds({ limit });
    const items: LearningItem[] = [];

    // Helper to find drill content
    const findDrillContent = (id: string): GrammarDrillItem | undefined => {
      for (const group of grammarLevels) {
        for (const lesson of group.lessons) {
          const d = lesson.drills.find(drill => drill.id === id);
          if (d) return d;
        }
      }
      return undefined;
    };

    weakIds.forEach(id => {
      const content = findDrillContent(id);
      if (content) {
        items.push({
          id: content.id,
          type: 'GRAMMAR',
          content: content,
          masteryState: 'review'
        });
      }
    });

    return items;
  }

  /**
   * Starts a grammar review session with weak items.
   */
  static startGrammarReviewSession(limit: number = 20): LearningSession {
    const items = this.getGrammarReviewItems(limit);
    return {
      sessionId: `review_${Date.now()}`,
      mode: 'REVIEW',
      items: items,
      currentIndex: 0,
      stats: { correct: 0, incorrect: 0, xpGained: 0 }
    };
  }

  /**
   * Retrieves the current item to be displayed to the user.
   */
  static getCurrentItem(session: LearningSession): LearningItem | null {
    if (session.currentIndex >= 0 && session.currentIndex < session.items.length) {
      return session.items[session.currentIndex];
    }
    return null;
  }

  /**
   * Processes a user's answer for the current item.
   * @param session - The active session.
   * @param answer - The user's input (string, array, etc.).
   */
  static submitAnswer(session: LearningSession, answer: unknown): LearningResult {
    const currentItem = this.getCurrentItem(session);
    
    if (!currentItem) {
      return {
        isCorrect: false,
        feedback: "Session complete or invalid item.",
        xpAwarded: 0,
        updatedItemState: 'mastered' // No-op
      };
    }

    // --- VOCAB ROUTING ---
    if (currentItem.type === 'VOCABULARY') {
      const result = this.submitVocabAnswer(session, answer);
      
      // Update session stats if result was returned
      if (result.isCorrect) {
        session.stats.correct++;
        session.stats.xpGained += result.xpAwarded;
        currentItem.masteryState = 'mastered';
      } else {
        session.stats.incorrect++;
        currentItem.masteryState = 'learning';
      }
      
      session.currentIndex++;
      return result;
    }

    let isCorrect = false;

    // --- GRAMMAR GRADING LOGIC ---
    if (currentItem.type === 'GRAMMAR') {
      const drill = currentItem.content as GrammarDrillItem;
      isCorrect = this.evaluateGrammarAnswer(drill, answer);
    }

    // --- UPDATE SESSION STATS (In-Memory) ---
    if (isCorrect) {
      session.stats.correct++;
      session.stats.xpGained += 10; // Simple constant XP for now
      currentItem.masteryState = 'mastered';
    } else {
      session.stats.incorrect++;
      currentItem.masteryState = 'learning';
    }

    // --- RECORD MISTAKE TRACKING (Persistent) ---
    if (currentItem.type === 'GRAMMAR') {
       recordDrillResult(currentItem.id, isCorrect);
    }

    // --- ADVANCE INDEX ---
    session.currentIndex++;

    // --- RETURN RESULT ---
    return {
      isCorrect,
      feedback: isCorrect ? "Correct!" : "Incorrect, keep trying!",
      xpAwarded: isCorrect ? 10 : 0,
      updatedItemState: currentItem.masteryState
    };
  }

  /**
   * Stub: Evaluate vocabulary answer.
   */
  static submitVocabAnswer(session: LearningSession, answer: unknown): LearningResult {
    return {
      isCorrect: false,
      feedback: "Vocabulary mode not implemented yet.",
      xpAwarded: 0,
      updatedItemState: 'new',
    };
  }

  /**
   * Helper to evaluate grammar answers based on drill type.
   */
  private static evaluateGrammarAnswer(drill: GrammarDrillItem, userAnswer: unknown): boolean {
    const normalize = (s: string) => String(s).trim().toLowerCase().replace(/\s+/g, ' ');

    if (drill.type === 'reorder') {
      // Expecting array of strings
      const expectedArray = Array.isArray(drill.answer) ? drill.answer : [drill.answer];
      const userArray = Array.isArray(userAnswer) ? userAnswer : [String(userAnswer)];
      return normalize(expectedArray.join(' ')) === normalize(userArray.join(' '));
    }

    // For multiple_choice, fill_blank, drag_drop
    const expected = Array.isArray(drill.answer) ? drill.answer[0] : drill.answer;
    const userVal = Array.isArray(userAnswer) ? userAnswer[0] : userAnswer;
    
    return normalize(String(expected)) === normalize(String(userVal));
  }

  /**
   * Returns current statistics for the session.
   */
  static getSessionStats(session: LearningSession): LearningSession['stats'] {
    return session.stats;
  }

  /**
   * Commits the session results to persistent storage.
   * Updates streak and adds XP.
   */
  static commitSession(session: LearningSession): UserProfile | null {
     console.log('[CoreLearningEngine] Committing session stats:', session.stats);
     
     // 1. Update Streak (and last active timestamp)
     let user = updateStreakOnActivity();
     
     // 2. Add XP if any gained
     if (session.stats.xpGained > 0) {
       user = addUserXp(session.stats.xpGained);
     } else {
       // Reload user in case updateStreakOnActivity modified it but we didn't add XP
       user = loadUserProfile();
     }
     
     return user;
  }
}