# FluentFlow AI - App Workflow & Architecture Summary

## 1. Overview
FluentFlow AI is a client-side, progressive web application designed to help Vietnamese learners master English. It combines AI-driven feedback with structured content to improve grammar, vocabulary, and speaking skills. Built using **TypeScript**, **React**, and **Vite**, the app focuses on an adaptive learning experience where users progress through CEFR levels (Pre-A0 to B2+) via interactive drills and gamified missions.

## 2. App Architecture & Navigation

The app uses a single-page architecture controlled by a central root component (`App.tsx`).

*   **State-Based Routing**: The app does not use a URL-based router (like React Router). Instead, it uses a state variable `view` (typed as `AppView` enum) in `App.tsx` to determine which screen to render.
*   **View Controller**: `App.tsx` acts as the main controller. It loads the `UserProfile` on mount and conditionally renders views based on the current state.
*   **Key Views (`AppView` Enum)**:
    *   **`WELCOME` / `LOGIN` / `LANDING`**: Onboarding screens for new users.
    *   **`PLACEMENT_TEST`**: Initial assessment to determine `EnglishLevel`.
    *   **`DASHBOARD`**: The main hub showing user stats (streak, badges), daily missions, and navigation buttons.
    *   **`GRAMMAR_PRACTICE`** (Grammar Guru): The primary listing of grammar levels and lessons.
    *   **`GRAMMAR_STATS`**: A detailed progress report visualizing mastery per CEFR level.
    *   *(Other views exist for Speaking, Vocab, etc., but Grammar is the core structural example).*
*   **Navigation**: Navigation is handled by passing `setView` callbacks to child components (e.g., `<DashboardView onNavigate={setView} />`).

## 3. Grammar Drills Workflow

Grammar practice is the core feature, structured hierarchically: **Levels → Lessons → Drills**.

*   **Data Structure**: Defined in `data/grammarData.ts`. Each `GrammarLevelGroup` contains `GrammarPurposeLesson`s, which contain `GrammarDrillItem`s.
*   **Drill Types**:
    *   **`multiple_choice`**: Standard radio button selection.
    *   **`fill_blank`**: Text input for specific words.
    *   **`drag_drop`**: UI for matching pairs or filling slots in a sentence.
    *   **`reorder`**: Sorting words to form a correct sentence.
*   **Rendering**:
    *   The **`DrillRenderer`** component (`components/Drills/DrillRenderer.tsx`) acts as a factory, rendering the specific sub-component (e.g., `MultipleChoice.tsx`) based on the drill's `type`.
*   **Execution & Scoring**:
    *   User selects/types an answer.
    *   `GrammarGuruView` handles the "Check Answer" logic. It compares the user's input against the stored `answer` (normalizing text for case-insensitivity).
    *   It tracks `drillResults` (array of booleans) for the current session.
*   **Completion**:
    *   When the final drill is completed, `finalizeLesson` is called.
    *   It calculates the score and calls `updateLessonProgress` in `utils/storage.ts` to persist the state as `'mastered'` or `'in_progress'`.

## 4. Grammar Progress & Levels

The app tracks progress granularly per lesson to aggregate statistics for CEFR levels (PreA0, A0, A1, A2, B1, B2).

*   **Level Logic**:
    *   Levels are strictly ordered. A user must generally complete the previous level (or be placed higher via test) to unlock the next.
    *   `utils/storage.ts` contains `isLevelUnlocked`, which enforces these rules (e.g., PreA0 users are locked to PreA0 until completion).
*   **Stats Calculation**:
    *   **`utils/grammarStats.ts`**: Exports `calculateGrammarStats(user)`.
    *   It iterates through the static `grammarLevels` data.
    *   It checks the user's persisted `GrammarProgress` map.
    *   It calculates: `percentCompleted = (mastered_drills / total_drills) * 100`.
    *   It derives status: `Locked`, `In Progress`, or `Completed`.
*   **Visualization**:
    *   **`GrammarProgressView.tsx`**: Consumes these calculated stats to display progress bars.
    *   It shows a summary card for the **Current Active Level** (the highest level currently in progress).

## 5. Data Files & Their Roles

The `data/` folder contains static content used to drive the app.

*   **`data/grammarData.ts`**: The schema for all grammar lessons, explanations (VI/EN), and drill questions.
*   **`data/grammarRecallData.ts`**: A pool of questions used for the "Grammar Recall" (Gauntlet) review mode.
*   **`data/vocabData.ts`**: A unified database of vocabulary words, definitions, IPAs, and examples.
*   **`data/speakingData.ts`**: Prompts and sample answers for speaking practice scenarios.
*   **`data/shadowingData.ts`**: Sentences paired with translations for pronunciation shadowing.
*   **`data/badges.ts`**: Definitions for achievement badges (thresholds for streaks, words learned, etc.).

## 6. Storage & Progress Tracking

The app uses `localStorage` for persistence, managed via `utils/storage.ts`.

*   **User Profile** (`fluent_user`): Stores name, current `EnglishLevel`, XP, streak, and unlocked badges.
*   **Grammar Progress** (`fluent_grammar_progress_v1`): A JSON object mapping `lessonId` → `GrammarProgressRecord`.
    *   **Record Structure**: `{ state: 'locked' | 'available' | 'in_progress' | 'mastered', completedDrills: number, lastScore: number }`.
*   **Logic**:
    *   The app loads this data on startup.
    *   When a user completes a lesson in `GrammarGuruView`, the storage is updated immediately.
    *   Navigation back to Dashboard or Stats triggers a re-read or calculation based on this updated data.

## 7. End-to-End Flow Example

1.  **Launch**: User opens the app. `App.tsx` initializes and loads `UserProfile` from `localStorage`.
2.  **Dashboard**: User lands on `DashboardView`, seeing their streak and a "Next Mission" card.
3.  **Navigation**: User clicks "Grammar Guru" (`AppView.GRAMMAR_PRACTICE`).
4.  **Level Selection**: User sees a list of levels (e.g., A0, A1). Completed levels have checkmarks; locked levels are grayed out.
5.  **Lesson View**: User clicks an unlocked lesson. They read the bilingual theory/explanation.
6.  **Drill Phase**: User clicks "Start Practice". The `DrillRenderer` cycles through questions (Multiple Choice, Reorder, etc.).
7.  **Submission**: User submits answers. The app validates them instantly.
8.  **Completion**: Upon finishing, the app saves the lesson as `mastered` in storage.
9.  **Feedback**: A completion screen shows the score.
10. **Progress Check**: User navigates to "Grammar Progress" (`AppView.GRAMMAR_STATS`). The stats utility recalculates based on the newly saved data, updating the progress bar for that level.
