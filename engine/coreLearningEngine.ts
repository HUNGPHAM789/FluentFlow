import { GrammarDrillItem, VocabDrillContent, BadgeDefinition, UserProfile } from '../types';
import { grammarLevels } from '../data/grammarData';
import { addUserXp, updateStreakOnActivity, loadUserProfile, recordDrillResult, getWeakDrillIds } from '../utils/storage';

export type LearningType = 'GRAMMAR' | 'VOCABULARY';

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

export class CoreLearningEngine {
  
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

  private static startGrammarSession(lessonId: string): LearningSession {
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

    const items: LearningItem[] = foundLesson.drills.map(drill => ({
      id: drill.id,
      type: 'GRAMMAR',
      content: drill,
      masteryState: 'new'
    }));

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

  static startVocabSession(topicId?: string): LearningSession {
    return {
      sessionId: `vocab-${topicId ?? 'general'}-${Date.now()}`,
      mode: 'NEW_LESSON',
      items: [], 
      currentIndex: 0,
      stats: { correct: 0, incorrect: 0, xpGained: 0 },
    };
  }

  static getGrammarReviewItems(limit: number = 20): LearningItem[] {
    const weakIds = getWeakDrillIds({ limit });
    const items: LearningItem[] = [];

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

  static getCurrentItem(session: LearningSession): LearningItem | null {
    if (session.currentIndex >= 0 && session.currentIndex < session.items.length) {
      return session.items[session.currentIndex];
    }
    return null;
  }

  static submitAnswer(session: LearningSession, answer: unknown): LearningResult {
    const currentItem = this.getCurrentItem(session);
    
    if (!currentItem) {
      return {
        isCorrect: false,
        feedback: "Session complete or invalid item.",
        xpAwarded: 0,
        updatedItemState: 'mastered'
      };
    }

    if (currentItem.type === 'VOCABULARY') {
      const result = this.submitVocabAnswer(session, answer);
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

    if (currentItem.type === 'GRAMMAR') {
      const drill = currentItem.content as GrammarDrillItem;
      isCorrect = this.evaluateGrammarAnswer(drill, answer);
    }

    if (isCorrect) {
      session.stats.correct++;
      session.stats.xpGained += 10; 
      currentItem.masteryState = 'mastered';
    } else {
      session.stats.incorrect++;
      currentItem.masteryState = 'learning';
    }

    if (currentItem.type === 'GRAMMAR') {
       recordDrillResult(currentItem.id, isCorrect);
    }

    session.currentIndex++;

    return {
      isCorrect,
      feedback: isCorrect ? "Correct!" : "Incorrect, keep trying!",
      xpAwarded: isCorrect ? 10 : 0,
      updatedItemState: currentItem.masteryState
    };
  }

  static submitVocabAnswer(session: LearningSession, answer: unknown): LearningResult {
    return {
      isCorrect: false,
      feedback: "Vocabulary mode not implemented yet.",
      xpAwarded: 0,
      updatedItemState: 'new',
    };
  }

  private static evaluateGrammarAnswer(drill: GrammarDrillItem, userAnswer: unknown): boolean {
    const normalize = (s: string) => String(s).trim().toLowerCase().replace(/\s+/g, ' ');

    if (drill.type === 'reorder') {
      const expectedArray = Array.isArray(drill.answer) ? drill.answer : [drill.answer];
      const userArray = Array.isArray(userAnswer) ? userAnswer : [String(userAnswer)];
      return normalize(expectedArray.join(' ')) === normalize(userArray.join(' '));
    }

    const expected = Array.isArray(drill.answer) ? drill.answer[0] : drill.answer;
    const userVal = Array.isArray(userAnswer) ? userAnswer[0] : userAnswer;
    
    return normalize(String(expected)) === normalize(String(userVal));
  }

  static getSessionStats(session: LearningSession): LearningSession['stats'] {
    return session.stats;
  }

  static commitSession(session: LearningSession): UserProfile | null {
     console.log('[CoreLearningEngine] Committing session stats:', session.stats);
     let user = updateStreakOnActivity();
     if (session.stats.xpGained > 0) {
       user = addUserXp(session.stats.xpGained);
     } else {
       user = loadUserProfile();
     }
     return user;
  }
}