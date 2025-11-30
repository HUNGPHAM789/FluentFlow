import { AppView } from '../types';
import DashboardView from '../components/DashboardView';
import GrammarGuruView from '../components/GrammarGuruView';
import GrammarProgressView from '../components/GrammarProgressView';
import ProfileAndAchievementsView from '../components/ProfileAndAchievementsView';

// Map AppView enum to React Components
export const viewRegistry = {
  [AppView.DASHBOARD]: DashboardView,
  [AppView.GRAMMAR_PRACTICE]: GrammarGuruView,
  [AppView.GRAMMAR_REVIEW]: GrammarGuruView, // Reuses GrammarGuruView with props
  [AppView.GRAMMAR_STATS]: GrammarProgressView,
  [AppView.PROFILE_ACHIEVEMENTS]: ProfileAndAchievementsView,
} as const;