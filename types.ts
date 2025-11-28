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
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2',
  UNKNOWN = 'UNKNOWN'
}

// Extended level type for Prompt Generation
export type AppLevel = EnglishLevel | 'IELTS' | 'TOEIC' | 'CITIZENSHIP' | 'MIXED' | 'DEFAULT';

export type AppMode = 'EXPLAIN' | 'EXERCISE' | 'SPEAKING' | 'EXAM' | 'FEEDBACK';

export interface AppSettings {
  level: AppLevel;
  mode: AppMode;
  topic: string; 
  context?: string;
}

// Centralized constants for the app
export const LEARNING_TOPICS = [
  "Daily Life", 
  "Work & Business", 
  "Travel", 
  "Academic", 
  "Technology", 
  "Socializing", 
  "Health", 
  "Art & Culture", 
  "Slang", 
  "IELTS", 
  "IELTS Speaking Part 2",
  "Role Play",
  "Fun"
];

export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

export type AppLanguage = 'en' | 'vi';

export interface GrammarPoint {
  id: string;
  topic: string;
  rule: string;
  proficiency: number; // 0-3
  lastReviewed?: string;
}

export interface UserProfile {
  name: string;
  email?: string;
  avatar?: string;
  level: EnglishLevel;
  xp: number;
  streak: number;
  badges: Badge[];
  titles: string[]; // e.g. "Vocabulary Master", "Grammar Guru"
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

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedDate: string;
}

export interface VocabWord {
  id: string;
  word: string;
  definition: string;
  masteryLevel: number; // 0-5
  lastReviewed?: string;
}

export type PlacementCategory = 'Academy' | 'Work' | 'IELTS' | 'TOEIC' | 'Daily Life' | 'Speaking' | 'Slang';

export interface PlacementQuestion {
  id: number;
  category: PlacementCategory;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
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
  definition: string; // Native translation
  situations: { english: string; translation: string }[];
  meaningQuiz: {
    question: string;
    options: string[]; // Options in user's native language
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

export interface ExamSpeakingContent {
  type: 'EXAM';
  cueCard: string;
  sampleAnswer: string;
  vocabulary: { word: string, definition: string }[];
}

export interface RolePlayScenario {
  type: 'DIALOGUE';
  dialogue: DialogueLine[];
  usefulPhrases: { phrase: string; translation: string }[];
  targetSentence: string; // The specific sentence to shadow
}

export type SpeakingScenario = string | RolePlayScenario | ExamSpeakingContent;