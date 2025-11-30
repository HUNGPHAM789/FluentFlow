# FluentFlow AI - App Workflow & Architecture Summary

## 1. Overview
FluentFlow AI is a client-side, progressive web application designed to help Vietnamese learners master English. It combines AI-driven feedback with structured content to improve grammar, vocabulary, and speaking skills.

**Key Features:**
*   **Adaptive Learning**: Progress through CEFR levels (Pre-A0 to B2+).
*   **Core Learning Engine**: Centralized logic for grading, session management, and gamification.
*   **Grammar Review**: A dedicated mode that identifies "weak" areas using mistake tracking and spaced repetition heuristics.
*   **Gamification**: XP, day streaks, and achievement badges to motivate learners.

Built using **TypeScript**, **React**, and **Vite**, the app focuses on a clean, logic-driven architecture where UI components are decoupled from the learning rules.

## 2. App Architecture & Navigation

The app uses a single-page architecture controlled by a central root component (`App.tsx`).

*   **State-Based Routing**: The app uses a state variable `view` (typed as `AppView` enum) in `App.tsx` to determine which screen to render.
*   **View Controller**: `App.tsx` acts as the main controller. It loads the `UserProfile` on mount and conditionally renders views based on the current state.
*   **Key Views (`AppView` Enum)**:
    *   **`WELCOME` / `LOGIN` / `LANDING`**: Onboarding screens.
    *   **`PLACEMENT_TEST`**: Initial assessment to determine `EnglishLevel`.
    *   **`DASHBOARD`**: The main hub showing user stats (streak, next mission) and navigation.
    *   **`GRAMMAR_PRACTICE`**: The lesson-based listing for Grammar Guru.
    *   **`GRAMMAR_REVIEW`**: A specialized session for reviewing weak grammar points.
    *   **`GRAMMAR_STATS`**: Detailed progress report visualizing mastery per CEFR level.
    *   **`PROFILE_ACHIEVEMENTS`**: A unified screen showing User Profile, XP, Streak, Stats, and Badges.
*   **Navigation**: Navigation is handled by passing `setView` callbacks (e.g., `onNavigate`) to child components.

## 3. Grammar Drills Workflow (Powered by CoreLearningEngine)

All grammar learning—whether new lessons or reviews—is powered by the **Core Learning Engine**.

*   **Engine & Hook**:
    *   **`src/engine/coreLearningEngine.ts`**: Contains the business logic for sessions, grading, and stats.
    *   **`src/hooks/useLearningSession.ts`**: React hook that connects the UI to the Engine.
*   **Session Types**:
    *   **`NEW_LESSON`**: Users selects a specific lesson ID. The Engine loads drills from `grammarData.ts`.
    *   **`REVIEW`**: The Engine calls `getWeakDrillIds` to fetch items the user previously got wrong, prioritizing older mistakes.
*   **Execution Flow in `GrammarGuruView`**:
    1.  **Start**: Component mounts, calls `useLearningSession` with mode and lesson ID (if applicable).
    2.  **Render**: `GrammarGuruView` reads `currentItem` from the hook and renders it using `DrillRenderer`.
    3.  **Submit**: User input is sent via `submit(answer)`. The Engine grades it (Correct/Incorrect) and updates internal stats.
    4.  **Feedback**: Immediate feedback is shown (Correct/Incorrect).
    5.  **Completion**: When the session ends:
        *   **Commit**: `commit()` is called. The Engine updates XP, Streak, and Drill Performance in storage.
        *   **Summary**: A summary screen appears showing Score %, XP gained, and an encouraging EN-VI message.

## 4. Grammar Progress & Levels

The app tracks progress at both the high-level (Lesson/CEFR) and granular level (Drill Performance).

*   **Lesson Progress**:
    *   Managed via `fluent_grammar_progress_v1`.
    *   Tracks if a lesson is `locked`, `available`, `in_progress`, or `mastered`.
    *   `utils/grammarStats.ts` calculates aggregate percentages for UI bars.
*   **Drill Performance (Mistake Tracking)**:
    *   Managed via `fluent_drill_performance_v1`.
    *   Every time a user answers a drill, `recordDrillResult` updates:
        *   `correctCount`
        *   `incorrectCount`
        *   `lastAnswerAt` (Timestamp)
*   **Review Logic**:
    *   The **"Needs Review"** indicator on the Profile screen shows the count of weak items.
    *   **`getWeakDrillIds`** logic: Selects drills with mistakes, sorting them by a score that combines mistake count and recency (time since last answer).

## 5. Data Files & Their Roles

*   **`src/engine/coreLearningEngine.ts`**: Central logic for grading, session state, and commit (XP/Streak) logic.
*   **`src/hooks/useLearningSession.ts`**: Glue code connecting React components to the Engine.
*   **`data/grammarData.ts`**: Static content: Grammar levels, lessons, explanations, and drill definitions.
*   **`data/badges.ts`**: Definitions for achievement badges.
*   **`utils/storage.ts`**:
    *   Manages `localStorage` keys.
    *   Helpers: `addUserXp`, `updateStreakOnActivity`, `recordDrillResult`, `getWeakDrillIds`.
    *   Progress loaders: `loadGrammarProgress`, `loadUserProfile`.

## 6. Storage & Progress Tracking

The app uses `localStorage` for persistence.

*   **User Profile** (`fluent_user`):
    *   `xp`: Total experience points.
    *   `streak`: Consecutive days active.
    *   `lastActive`: Timestamp of last activity (for streak calculation).
    *   `badges`: Array of earned badge IDs.
    *   `level`: Current English Level (Pre-A0, A1, etc.).
*   **Grammar Progress** (`fluent_grammar_progress_v1`):
    *   Maps `lessonId` -> `{ state, completedDrills, lastScore }`.
*   **Drill Performance** (`fluent_drill_performance_v1`):
    *   Maps `drillId` -> `{ correctCount, incorrectCount, lastAnswerAt }`.
    *   This data drives the Review Mode algorithm.

## 7. End-to-End Flow Example

1.  **Dashboard**: User sees "Grammar Guru" and "My Profile".
2.  **Lesson Practice**:
    *   User selects "Grammar Guru" -> "A1" -> "Present Simple".
    *   `CoreLearningEngine` starts a `NEW_LESSON` session.
    *   User completes drills. Engine tracks results in-memory.
    *   **End of Session**: Engine commits results. `fluent_user` (XP increased) and `fluent_grammar_progress_v1` (lesson mastered) are updated. `fluent_drill_performance_v1` is updated per drill.
3.  **Profile Check**:
    *   User navigates to "My Profile".
    *   User sees updated XP and Streak.
    *   User sees "Needs Review: 5" (calculated from drill performance).
4.  **Review Session**:
    *   User clicks "Needs Review" or "Grammar Review" button.
    *   `CoreLearningEngine` starts a `REVIEW` session. It calls `getWeakDrillIds` to fetch the 5 weak items.
    *   User practices these specific items.
    *   On completion, performance stats update (potentially removing items from the "weak" list if corrected enough).
