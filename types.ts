

// --- types.ts ---

export enum AppView {
  WELCOME = 'WELCOME',
  LOGIN = 'LOGIN',
  LANDING = 'LANDING',
  PLACEMENT_TEST = 'PLACEMENT_TEST',
  DASHBOARD = 'DASHBOARD',
  SPEAKING_PRACTICE = 'SPEAKING_PRACTICE',
  VOCAB_DRILL = 'VOCAB_DRILL',
  NEW_VOCAB = 'NEW_VOCAB',
  GRAMMAR_PRACTICE = 'GRAMMAR_PRACTICE',
  GRAMMAR_REVIEW = 'GRAMMAR_REVIEW',
  GRAMMAR_RECALL = 'GRAMMAR_RECALL',
  PROGRESS = 'PROGRESS',
  WRITING_ASSISTANT = 'WRITING_ASSISTANT'
}

export enum EnglishLevel {
  PRE_A0 = 'PRE_A0',
  A0 = 'A0',
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2',
  UNKNOWN = 'UNKNOWN'
}

export type AppLevel = EnglishLevel | 'IELTS' | 'TOEIC' | 'CITIZENSHIP' | 'MIXED' | 'DEFAULT';

// Strict Tutor Modes
export type TutorMode = 'WRITING_FEEDBACK' | 'ANSWER_CHECK' | 'SPEAKING_FEEDBACK';
export type AppMode = TutorMode | 'EXPLAIN' | 'EXERCISE' | 'SPEAKING' | 'EXAM' | 'FEEDBACK'; // Legacy support

export interface AppSettings {
  level: AppLevel;
  mode: AppMode;
  topic: string; 
  context?: string;
}

export const LEARNING_TOPICS = [
  "Daily Life", 
  "Work & Business", 
  "Citizenship",
  "Socializing", 
  "IELTS", 
  "Slang"
];

export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1"];

export type AppLanguage = 'en' | 'vi';

export interface GrammarPoint {
  id: string;
  topic: string;
  rule: string;
  proficiency: number;
  lastReviewed?: string;
}

export interface UserProfile {
  name: string;
  email?: string;
  avatar?: string;
  level: EnglishLevel;
  xp: number;
  streak: number;
  badges: string[]; // Store Badge IDs now
  titles: string[];
  vocabList: VocabWord[];
  grammarList: GrammarPoint[];
  isReturning: boolean;
  learningStats: {
    wordsLearned: number;
    sentencesSpoken: number;
    grammarPoints: number;
  };
  language?: AppLanguage;
}

export type BadgeType = 'streak' | 'words' | 'sentences' | 'grammar';

export interface BadgeDefinition {
  id: string;
  name: { en: string; vi: string };
  description: { en: string; vi: string };
  icon: string;
  type: BadgeType;
  threshold: number;
}

export interface Badge extends BadgeDefinition {
  earnedDate?: string;
}

export interface VocabWord {
  id: string;
  word: string;
  definition: string;
  masteryLevel: number;
  lastReviewed?: string;
}

export type PlacementCategory = 'Grammar' | 'Vocabulary' | 'Listening' | 'Reading' | 'Work' | 'Slang' | 'Daily' | 'IELTS' | 'TOEIC';

export interface PlacementQuestion {
  id: string | number;
  category: PlacementCategory;
  question: string; // Unified from questionText
  options: string[];
  correct: string; // Unified from correct/correctAnswerIndex logic
}

export interface SpeakingFeedback {
  isCorrect: boolean;
  transcription: string;
  feedback: string;
  mispronouncedWords: string[];
  phoneticGuidance?: Record<string, string>;
}

export interface VocabDrillContent {
  word: string;
  ipa?: string; // pronunciation
  definition: string;
  situations: { english: string; translation: string }[];
  meaningQuiz: {
    question: string;
    options: string[];
    correctIndex: number;
  };
  translationQuiz: {
    nativeSentence: string;
    correctEnglish: string;
    scrambledEnglish: string[];
  };
  scrambleSentence: {
    scrambled: string[];
    correct: string;
    translation: string;
  };
  wordForms: {
    noun?: string;
    verb?: string;
    adjective?: string;
    adverb?: string;
  };
}

export interface NewVocabCard {
  word: string;
  definition: string;
  example: string;
  exampleTranslation: string;
  topic: string;
  level: string;
  pronunciation?: string;
}

export interface GrammarQuestion {
  id: string;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface DialogueLine {
  speaker: string;
  text: string;
  translation?: string;
}

export type SpeakingScenarioType = 'DIALOGUE' | 'EXAM' | 'SIMPLE';

export interface SpeakingScenarioData {
    type: SpeakingScenarioType;
    prompt: string; // Main display text
    subText?: string; // Context or role description
    sampleAnswer?: string;
}

export interface Quote {
  id: string;
  text: string;
  translation: string;
  author: string;
  category: 'Learning' | 'Inspiration' | 'Motivation' | 'Atomic Tip' | 'Fun Fact';
}

// --- STORED DATA SCHEMAS ---

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correct: string;
  category: "Daily" | "Work" | "IELTS" | "TOEIC" | "Grammar" | "Vocabulary" | "Listening" | "Reading" | "Slang";
};

// Deprecated legacy structure - keeping for compatibility during migration if needed
export type GrammarLesson = {
  id: string;
  title: string;
  explanation: string;
  examples: { en: string; vi: string }[];
  exercises: {
    question: string;
    options: string[];
    answer: string;
  }[];
};

export type GrammarRecallItem = {
  id: string;
  prompt: string;
  options: string[];
  answer: string;
};

export type SpeakingPrompt = {
  id: string;
  topic: string;
  question: string;
  sampleAnswer: string;
};

export type ShadowingItem = {
  id: string;
  topic: string;
  text: string;
  translationVi: string;
};

export type VocabItem = {
  word: string;
  ipa?: string;
  definitionEn: string;
  definitionVi: string;
  examples: { en: string; vi: string }[];
  wordForms: {
    noun?: string;
    verb?: string;
    adjective?: string;
    adverb?: string;
  };
  topic: string;
};

export type VocabRecallItem = {
  word: string;
  definitionVi: string;
  exampleEn: string;
  exampleVi: string;
  topic: string;
};

// --- GRAMMAR GURU NEW TYPES ---

export type GrammarLevel = 'PreA0' | 'A0' | 'A1' | 'A2' | 'B1' | 'B2';

export type GrammarLessonState = 'locked' | 'available' | 'in_progress' | 'mastered';

export type GrammarProgressRecord = {
  state: GrammarLessonState;
  completedDrills: number;
  totalDrills: number;
  lastScore?: number;
  lastUpdated?: string;
};

export type GrammarProgress = {
  [lessonId: string]: GrammarProgressRecord;
};

export interface GrammarDrillItem {
    id: string;
    type?: 'multiple_choice' | 'fill_blank' | 'drag_drop' | 'reorder';
    question: string;
    explanation?: string;
    
    // Multiple Choice & Generic
    options?: string[];
    answer: string | string[]; 

    // Reorder
    items?: string[];
    
    // DragDrop
    pairs?: { left: string; right: string }[];
    sentence?: string;
    choices?: string[];
}

export type GrammarPurposeLesson = {
  id: string; 
  level: GrammarLevel;

  purposeTitleVi: string;
  purposeTitleEn: string;

  shortDescriptionVi: string;
  shortDescriptionEn?: string;

  sampleSentenceVi: string;
  sampleSentenceEn: string;

  explanationEn: string;
  explanationVi: string;
  
  drills: GrammarDrillItem[];
};

export type GrammarLevelGroup = {
  level: GrammarLevel;
  titleVi: string;
  titleEn: string;
  descriptionVi: string;
  lessons: GrammarPurposeLesson[];
};