
// --- utils/grammarStats.ts ---
import { GrammarLevel, GrammarProgress, UserProfile } from "../types";
import { grammarLevels } from "../data/grammarData";
import { loadGrammarProgress, isLevelUnlocked } from "./storage";

export interface LevelStats {
  level: GrammarLevel;
  titleVi: string;
  totalDrills: number;
  completedDrills: number;
  percentCompleted: number;
  status: 'Completed' | 'In Progress' | 'Locked';
}

export interface GrammarOverview {
  currentActiveLevel: GrammarLevel;
  currentLevelPercent: number;
  allLevels: LevelStats[];
}

export const calculateGrammarStats = (user: UserProfile): GrammarOverview => {
  const progress: GrammarProgress = loadGrammarProgress();
  
  const allLevels: LevelStats[] = grammarLevels.map(group => {
    let totalDrills = 0;
    let completedDrills = 0;

    group.lessons.forEach(lesson => {
      totalDrills += lesson.drills.length;
      
      const record = progress[lesson.id];
      if (record) {
        // If lesson is mastered, we count all its drills as done, or take the stored count
        if (record.state === 'mastered') {
             completedDrills += lesson.drills.length;
        } else {
             completedDrills += (record.completedDrills || 0);
        }
      }
    });

    const percent = totalDrills > 0 ? Math.round((completedDrills / totalDrills) * 100) : 0;
    
    // Determine status
    const isUnlocked = isLevelUnlocked(group.level, progress, user.level);
    let status: LevelStats['status'] = 'Locked';
    
    if (percent >= 100) {
        status = 'Completed';
    } else if (percent > 0 || isUnlocked) {
        // If it's unlocked, we consider it "In Progress" or at least available
        // But if percentage is 0, let's distinguish slightly? 
        // The spec asks for "Locked" if 0% and NOT unlocked.
        // If unlocked but 0%, maybe just "In Progress" (Ready to start)
        status = 'In Progress';
    }
    
    if (!isUnlocked) status = 'Locked';

    return {
      level: group.level,
      titleVi: group.titleVi,
      totalDrills,
      completedDrills,
      percentCompleted: Math.min(100, percent),
      status
    };
  });

  // Determine "Current Active Level"
  // Priority:
  // 1. Highest level that is "In Progress" ( > 0% and < 100%)
  // 2. If none, highest level that is "Completed" (showing they finished it)
  // 3. Or simply the user's assigned level if nothing else.
  
  let currentActive = allLevels.find(l => l.status === 'In Progress' && l.percentCompleted > 0);
  
  if (!currentActive) {
      // Maybe they haven't started anything or finished everything?
      // Find the first one that is NOT completed?
      currentActive = allLevels.find(l => l.status === 'In Progress') || allLevels[0];
  }
  
  // If user has explicit level, maybe prefer that?
  // Let's stick to the computed one unless it's locked, which shouldn't happen with the logic above.

  return {
    currentActiveLevel: currentActive.level,
    currentLevelPercent: currentActive.percentCompleted,
    allLevels
  };
};
