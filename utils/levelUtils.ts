
// --- utils/levelUtils.ts ---
import { EnglishLevel, GrammarLevel } from '../types';

export const getEffectiveLevel = (level: EnglishLevel): string => {
  if (level === EnglishLevel.UNKNOWN) return 'A0';
  if (level === EnglishLevel.PRE_A0) return 'PreA0';
  return level;
};

const LEVEL_ORDER = ['PreA0', 'A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export const isPlacementHigherOrEqual = (placement: EnglishLevel, target: GrammarLevel): boolean => {
    // Treat UNKNOWN as A0 for comparison purposes (unless they explicitly chose PreA0)
    let effective = placement === EnglishLevel.UNKNOWN ? 'A0' : placement;
    if (placement === EnglishLevel.PRE_A0) effective = 'PreA0';

    const pIndex = LEVEL_ORDER.indexOf(effective as string);
    const tIndex = LEVEL_ORDER.indexOf(target);
    
    // Safety check: if levels aren't found, default to false to be safe (lock content)
    if (pIndex === -1 || tIndex === -1) return false;

    return pIndex >= tIndex;
};