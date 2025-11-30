
import { useState, useCallback } from 'react';
import { CoreLearningEngine, LearningType, LearningSession, LearningItem, LearningResult } from '../engine/coreLearningEngine';

interface UseLearningSessionProps {
  type: LearningType;
  lessonId?: string;
  mode?: 'NEW_LESSON' | 'REVIEW' | 'PLACEMENT';
}

/**
 * A hook that bridges the UI with the CoreLearningEngine.
 * Manages the reactive state of a learning session.
 */
export const useLearningSession = ({ type, lessonId, mode }: UseLearningSessionProps) => {
  const [session, setSession] = useState<LearningSession | null>(null);
  const [currentItem, setCurrentItem] = useState<LearningItem | null>(null);
  const [lastResult, setLastResult] = useState<LearningResult | null>(null);

  /**
   * Initialize and start the session.
   */
  const start = useCallback(() => {
    // The engine handles looking up the lesson ID if type is GRAMMAR
    const newSession = CoreLearningEngine.startSession(type, { lessonId, mode });
    setSession(newSession);
    setCurrentItem(CoreLearningEngine.getCurrentItem(newSession));
    setLastResult(null);
  }, [type, lessonId, mode]);

  /**
   * Submit an answer for the current item.
   * Updates local state based on Engine results.
   */
  const submit = useCallback((answer: unknown) => {
    if (!session) return;
    
    // 1. Get result from Engine (Engine mutates session stats in-memory for now)
    const result = CoreLearningEngine.submitAnswer(session, answer);
    setLastResult(result);
    
    // 2. Force a re-render by creating a shallow copy of the session
    // (Since Engine.submitAnswer mutates the session object in place)
    const updatedSession = { ...session };
    
    setSession(updatedSession);
    setCurrentItem(CoreLearningEngine.getCurrentItem(updatedSession));
    
  }, [session]);

  return {
    session,
    currentItem,
    sessionStats: session ? CoreLearningEngine.getSessionStats(session) : null,
    lastResult,
    start,
    submit
  };
};
