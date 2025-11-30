# Core Learning Engine Design Document

## 1. Definition & Purpose

The **Core Learning Engine** is a proposed centralized logic layer for FluentFlow AI. It decouples the business logic of learning (drills, progression, scoring, scheduling) from the UI components.

Currently, logic is scattered across views like `GrammarGuruView` and utility files. The Engine will serve as the single source of truth for:
*   **Running Learning Sessions**: Managing the flow of a drill session (Grammar or Vocabulary).
*   **Progress Calculation**: Determining mastery, updating XP, and calculating streaks.
*   **Review Scheduling**: Tracking mistakes and scheduling items for spaced repetition.
*   **Gamification**: Triggering badge unlocks and achievement updates.

**Key Principle**: The Engine is **logic-only**. It does not render UI. It provides data and state to Views, which render them.

## 2. Architecture Integration

The Engine fits into the existing React + Vite + LocalStorage architecture as a hook-based service or a singleton class instance accessible by views.

### High-Level Flow
1.  **App.tsx** (Router): Determines the current view (e.g., `GRAMMAR_PRACTICE`).
2.  **View Component** (e.g., `GrammarGuruView`):
    *   Initializes a session via the Engine (e.g., `engine.startSession('grammar', lessonId)`).
    *   Asks the Engine for the `currentDrill`.
    *   Renders the drill using `DrillRenderer`.
    *   Passes user input back to the Engine: `engine.submitAnswer(input)`.
    *   Receives feedback and updates from the Engine.
3.  **Storage Layer** (`utils/storage.ts`): The Engine calls existing storage helpers to persist changes to `fluent_user` and `fluent_grammar_progress_v1`.
4.  **Passive Views** (`GrammarProgressView`, `ProfileAndAchievementsView`): These views simply read the state persisted by the Engine (or query the Engine for calculated stats) to display progress.

### Integration Points
*   **Grammar Guru**: Instead of managing `drillIndex` and `results` locally state, it will subscribe to the Engine's session state.
*   **Profile & Achievements**: Reads user stats updated by the Engine after every drill or session completion.

## 3. Conceptual Data Types & Interfaces

These interfaces map to existing types where possible but normalize the structure for the Engine.

### 3.1 Learning Items
The unit of study.
```typescript
type LearningType = 'GRAMMAR' | 'VOCABULARY';

interface LearningItem {
  id: string;
  type: LearningType;
  content: GrammarDrillItem | VocabDrillContent; // Wraps existing data types
  masteryState: 'new' | 'learning' | 'review' | 'mastered';
}
```

### 3.2 Learning Session
Represents an active study session.
```typescript
interface LearningSession {
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
```

### 3.3 Learning Result
The outcome of a user interaction.
```typescript
interface LearningResult {
  isCorrect: boolean;
  feedback: string; // Explanation or correction
  xpAwarded: number;
  updatedItemState: LearningItem['masteryState']; // Did the item move from 'learning' to 'mastered'?
  badgeUnlocked?: BadgeDefinition; // Immediate feedback if a badge was earned
}
```

### 3.4 User Progress Summary
Data structure for the combined "Profile & Achievements" screen.
```typescript
interface UserProgressSummary {
  user: UserProfile; // Existing UserProfile type
  levelStats: {
    currentLevel: EnglishLevel;
    percentComplete: number; // Aggregate of grammar/vocab for this level
  };
  engagement: {
    streak: number;
    lastActive: string;
  };
}
```

## 4. Responsibilities

### The Core Learning Engine IS RESPONSIBLE for:
*   **Item Selection**: Deciding which drill comes next (e.g., shuffling a lesson, or picking weak items for review).
*   **Grading**: Comparing user input against expected answers (case-insensitivity, fuzzy matching if needed).
*   **State Management**: Transitioning an item from `locked` → `available` → `mastered`.
*   **XP & Streak Logic**: Calculating XP based on performance and updating user streak logic (checking date diffs).
*   **Persistence**: Calling `saveUserProfile`, `saveGrammarProgress`, etc., immediately upon changes to prevent data loss.

### The Core Learning Engine is NOT RESPONSIBLE for:
*   **UI Rendering**: It does not return JSX. It returns objects/primitives.
*   **Routing**: It does not decide when to switch from Dashboard to Grammar Guru.
*   **Raw Storage Implementation**: It delegates the actual `localStorage` calls to `utils/storage.ts`.

## 5. Interaction with Profile & Achievements

The **Profile & Achievements** screen replaces separate profile and stats views. It relies heavily on the Engine's data updates.

### Updates (Write Path)
When a user completes a drill in **Grammar Guru**:
1.  Engine calculates result (Correct/Incorrect).
2.  Engine adds XP (e.g., +10 for correct).
3.  Engine updates `UserProfile.learningStats`.
4.  Engine checks `BadgeDefinition` thresholds (e.g., "Master 50 words").
    *   If threshold crossed: Add badge ID to `UserProfile.badges`.
5.  Engine saves `UserProfile` to storage.

### Display (Read Path)
The **Profile & Achievements** view renders:
*   **Header**: Avatar, Name, Current Level (from `UserProfile`).
*   **Stats Card**:
    *   **XP**: Read directly from `UserProfile.xp`.
    *   **Streak**: Read from `UserProfile.streak`.
*   **Progress**: Read aggregated stats (e.g., "A1 Grammar: 80%").
*   **Badges Grid**: Iterates over `BADGE_DEFINITIONS`.
    *   If ID exists in `UserProfile.badges`, render full color.
    *   Else, render grayed out (optionally with progress bar).

## 6. Migration & Consistency Plan

1.  **Refactor Grammar Guru**: Move the local state (`drillIndex`, `userAnswer`) into a `useLearningEngine` hook.
2.  **Combine Views**: Merge the profile display logic from Dashboard and the detailed stats from `GrammarProgressView` into the new **Profile & Achievements** screen.
3.  **Preserve Data**: Ensure `fluent_user` and `fluent_grammar_progress_v1` keys remain the source of truth so existing user data is not lost.
4.  **Scope Reduction**: Explicitly mark Speaking and Shadowing code as deprecated or "Optional Modules" that do not feed into the Core Engine's primary progress loop for now.
