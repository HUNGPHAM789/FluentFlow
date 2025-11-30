// --- App.tsx ---
// === LOG ENTRY: 2024-05-22 10:05:00 ===
// ACTION TYPE: ui_update
// LOG_TAG: grammar-ui
// FILES AFFECTED:
// - App.tsx
// DESCRIPTION:
// Added missing DashboardView and App component to fix 'no default export' error and complete navigation flow.
// CODE DIFF:
// + const DashboardView = ...
// + const App = ...
// + export default App;

import React, { useState, useEffect, useRef, useMemo } from 'react';
import MarkdownRenderer from './components/MarkdownRenderer'; 
import { AppView, UserProfile, EnglishLevel, VocabWord, PlacementQuestion, VocabDrillContent, SpeakingFeedback, NewVocabCard, GrammarQuestion, AppLanguage, SpeakingScenarioData, Quote, BadgeDefinition, LEARNING_TOPICS, GrammarLevel, GrammarPurposeLesson, GrammarLessonState, GrammarDrillItem, GrammarProgress } from './types';
import { evaluateSpeaking, askGenericAI } from './services/gemini';
import { generatePlacementTest, determineLevel, generateVocabDrill, generateNewVocab, generateSpeakingSentence } from './services/content';
import Button from './components/Button';
import { blobToBase64 } from './utils/audioUtils';
import { translations } from './utils/translations';
import { englishQuotes } from './data/englishQuotes';
import { BADGE_DEFINITIONS } from './data/badges';
import { vocabData } from './data/vocabData';
import { grammarLevels } from './data/grammarData';
import { grammarRecallData } from './data/grammarRecallData';
import { STORAGE_KEYS, clearAppStorage, loadUserProfile, saveUserProfile, getStoredVersion, setStoredVersion, loadVocabProgress, saveVocabProgress, loadGrammarProgress, saveGrammarProgress, isLevelUnlocked, updateGrammarLessonProgress, isPreA0Completed, updateLessonProgress } from './utils/storage';
import { getEffectiveLevel } from './utils/levelUtils';
import { DrillRenderer } from './components/Drills';

// Increment this version to force a data reset for all users
const APP_VERSION = '1.5';

/* -------------------------------------------------------------------------- */
/*                            SHARED COMPONENTS                               */
/* -------------------------------------------------------------------------- */

const FullScreenFireworks: React.FC = () => {
  const particles = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 100 + Math.random() * 100;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      const color = ['#60A5FA', '#34D399', '#F472B6', '#FBBF24', '#818CF8'][Math.floor(Math.random() * 5)];
      const delay = Math.random() * 0.2;
      return { tx, ty, color, delay, id: i };
    });
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-20">
      {particles.map((p) => (
        <div
          key={p.id}
          className="firework-particle absolute w-3 h-3 rounded-full opacity-0"
          style={{
            backgroundColor: p.color,
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
            animation: `firework-particle 1s ease-out forwards ${p.delay}s`,
            left: '50%',
            top: '50%'
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

// Reusable Language Selector Component
const LanguageSelector: React.FC<{ 
  currentLang: AppLanguage; 
  onChange: (lang: AppLanguage) => void;
  className?: string; 
}> = ({ currentLang, onChange, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  ];

  const current = languages.find(l => l.code === currentLang) || languages[0];

  return (
    <div className={`relative z-50 ${className}`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-slate-200 hover:bg-white transition-all text-xs font-bold text-slate-700"
      >
        <span className="text-base">{current.flag}</span>
        <span className="uppercase">{currentLang}</span>
        <span className="text-[10px] text-slate-400">▼</span>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-xl shadow-xl border border-slate-100 p-1 fade-in">
          {languages.map(l => (
            <button
              key={l.code}
              onClick={() => {
                onChange(l.code as AppLanguage);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-indigo-50 transition-all ${currentLang === l.code ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600'}`}
            >
              <span>{l.flag}</span>
              <span>{l.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Mission Tracker Component
const MissionTracker: React.FC<{
  user: UserProfile;
  lang: AppLanguage;
}> = ({ user, lang }) => {
  
  // Find the next unearned badge with the lowest threshold relative to progress
  const nextBadge = useMemo(() => {
    // Filter out earned badges
    const unearned = BADGE_DEFINITIONS.filter(b => !user.badges.includes(b.id));
    
    if (unearned.length === 0) return null; // All earned

    // Calculate progress % for each and find the "closest" one
    let bestCandidate = unearned[0];
    let highestProgress = -1;

    unearned.forEach(b => {
      let current = 0;
      switch(b.type) {
        case 'words': current = user.learningStats?.wordsLearned || 0; break;
        case 'sentences': current = user.learningStats?.sentencesSpoken || 0; break;
        case 'grammar': current = user.learningStats?.grammarPoints || 0; break;
        case 'streak': current = user.streak; break;
      }
      
      const progress = Math.min(1, current / b.threshold);
      if (progress > highestProgress) {
        highestProgress = progress;
        bestCandidate = b;
      }
    });

    return bestCandidate;
  }, [user]);

  if (!nextBadge) return (
     <div className="bg-slate-800 text-white p-3 rounded-xl text-sm font-medium flex items-center gap-2 shadow-lg">
       <span>👑</span> All Missions Complete!
     </div>
  );

  let currentVal = 0;
  switch(nextBadge.type) {
    case 'words': currentVal = user.learningStats?.wordsLearned || 0; break;
    case 'sentences': currentVal = user.learningStats?.sentencesSpoken || 0; break;
    case 'grammar': currentVal = user.learningStats?.grammarPoints || 0; break;
    case 'streak': currentVal = user.streak; break;
  }

  const percent = Math.min(100, Math.round((currentVal / nextBadge.threshold) * 100));

  return (
    <div className="bg-white border-l-4 border-indigo-500 rounded-r-xl shadow-sm p-3 flex items-center gap-3 animate-[fadeIn_0.5s]">
      <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-xl">
        {nextBadge.icon}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Next Mission</span>
          <span className="text-xs font-mono text-indigo-600 font-bold">{currentVal}/{nextBadge.threshold}</span>
        </div>
        <div className="text-sm font-bold text-slate-800 leading-none mb-2">
           {lang === 'vi' ? nextBadge.description.vi : nextBadge.description.en}
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${percent}%` }}></div>
        </div>
      </div>
    </div>
  );
};


/* -------------------------------------------------------------------------- */
/*                                WELCOME VIEW                                */
/* -------------------------------------------------------------------------- */

const WelcomeView: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const t = translations.en; // Default for welcome
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-white p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-200/40 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="z-10 text-center space-y-10 max-w-lg fade-in">
        
        {/* Animated Logo */}
        <div className="flex justify-center">
          <div className="relative w-32 h-32 float">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-[2rem] shadow-2xl rotate-3 flex items-center justify-center">
               <span className="text-6xl">🌊</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-[2rem] shadow-2xl -rotate-6 opacity-30 blur-sm -z-10"></div>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
            FluentFlow <span className="text-blue-600">AI</span>
          </h1>
          <p className="text-lg text-slate-600 font-medium leading-relaxed">
            {t.welcomeScreenSubtitle}
          </p>
        </div>

        <button 
          onClick={onStart}
          className="group relative px-8 py-4 bg-slate-900 text-white text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-2">
            {t.getStarted} &rarr;
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </div>

      <div className="absolute bottom-6 text-slate-400 text-xs font-medium">
        Master English naturally.
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                LOGIN VIEW                                  */
/* -------------------------------------------------------------------------- */

const LoginView: React.FC<{ 
  onLogin: (provider: 'google' | 'apple', lang: AppLanguage) => void;
  onSkip: (lang: AppLanguage) => void;
}> = ({ onLogin, onSkip }) => {
  // VIETNAMESE FIRST: Default to 'vi' and removed language selector here
  const lang: AppLanguage = 'vi';
  const t = translations[lang];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-800 p-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md z-10 fade-in text-center space-y-8">
        <div className="space-y-2">
          <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-3xl mb-4 shadow-lg shadow-blue-200">
            🌊
          </div>
          <h1 className="text-3xl font-bold text-slate-800">FluentFlow AI</h1>
          <p className="text-slate-500">{t.loginTitle}</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => onLogin('google', lang)}
            className="w-full flex items-center justify-center gap-3 p-3.5 bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 shadow-sm hover:shadow-md transition-all font-medium group"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6 group-hover:scale-110 transition-transform" alt="Google" />
            <span>{t.continueGoogle}</span>
          </button>
          
          <button 
            onClick={() => onLogin('apple', lang)}
            className="w-full flex items-center justify-center gap-3 p-3.5 bg-black text-white rounded-xl hover:bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-200 font-bold group"
          >
            <svg className="w-6 h-6 fill-current text-white group-hover:scale-110 transition-transform" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.05 20.28c-.98.95-2.05 2.3-3.71 2.3-1.6 0-2.12-.95-3.95-.95-1.8 0-2.35.95-3.92.95-1.55 0-2.82-1.42-3.87-2.9-2.15-3.08-2.15-6.02-2.15-8.5 0-4.15 2.72-6.22 5.3-6.22 1.6 0 3.05 1.05 4.05 1.05.95 0 2.6-1.05 4.38-1.05 1.5.02 2.65.62 3.4 1.08-.85.52-1.4 1.55-1.4 2.8 0 2.22 1.95 3.32 2 3.35-.02.05-3.05 10.58-4.13 12.09zM12.03 7.25c-.15-2.22 1.8-4.25 3.9-4.25.18 2.58-2.6 4.38-3.9 4.25z" />
            </svg>
            <span>{t.continueApple}</span>
          </button>
        </div>

        <button 
          onClick={() => onSkip(lang)}
          className="text-slate-400 hover:text-slate-600 font-medium text-sm border-b border-transparent hover:border-slate-300 transition-all"
        >
          {t.skipGuest}
        </button>

        <div className="text-xs text-slate-400 pt-4">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                     WELCOME LEVEL CHOICE VIEW (NEW)                        */
/* -------------------------------------------------------------------------- */

const WelcomeLevelChoiceView: React.FC<{ 
  onPreA0: () => void;
  onStandard: () => void; 
}> = ({ onPreA0, onStandard }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      <div className="z-10 text-center max-w-lg space-y-8 fade-in w-full">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
            Chào mừng bạn đến với<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">FluentFlow AI</span>
          </h1>
          <p className="text-indigo-200 text-lg">Chọn tình trạng tiếng Anh của bạn:</p>
        </div>
        
        <div className="space-y-4 pt-4">
           {/* Option 1: True Beginner */}
           <button 
              onClick={onPreA0}
              className="w-full p-6 text-left border-2 rounded-2xl bg-amber-50 border-amber-400 hover:bg-amber-100 transition-all group shadow-lg shadow-amber-900/50"
           >
              <div className="text-xl font-bold text-amber-900 mb-2 group-hover:underline">TÔI KHÔNG BIẾT TIẾNG ANH</div>
              <div className="text-base font-normal text-amber-800/90 leading-relaxed">
                Tôi gần như mới bắt đầu từ con số 0. App sẽ cho tôi học khóa nền tảng Pre-A0 với giải thích tiếng Việt.
              </div>
           </button>

           <div className="relative flex py-2 items-center text-white/50">
               <div className="flex-grow border-t border-white/20"></div>
               <span className="flex-shrink-0 mx-4 text-xs uppercase">Hoặc</span>
               <div className="flex-grow border-t border-white/20"></div>
           </div>

           {/* Option 2: Standard Flow */}
           <button 
              onClick={onStandard}
              className="w-full p-4 text-left border border-white/20 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-white"
           >
              <div className="font-bold text-lg mb-1">Tôi đã từng học tiếng Anh</div>
              <div className="text-sm text-indigo-200">
                 Hiểu được vài câu đơn giản. Tiếp tục đến kiểm tra xếp lớp hoặc chọn bài học phù hợp.
              </div>
           </button>
        </div>
        
        <p className="text-xs text-indigo-300 opacity-60">Bạn có thể thay đổi cài đặt ngôn ngữ sau trong Bảng điều khiển.</p>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                             PLACEMENT TEST VIEW                            */
/* -------------------------------------------------------------------------- */

const PlacementTestView: React.FC<{ 
  onComplete: (level: EnglishLevel) => void;
  lang: AppLanguage;
}> = ({ onComplete, lang }) => {
  const [questions, setQuestions] = useState<PlacementQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      const q = await generatePlacementTest();
      setQuestions(q);
      setLoading(false);
    };
    fetchQuestions();
  }, []);

  const handleAnswer = async (idx: number) => {
    const q = questions[currentIdx];
    const selectedOption = q.options[idx];
    const isCorrect = selectedOption === q.correct;
    
    const newScore = isCorrect ? score + 1 : score;
    setScore(newScore);

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setLoading(true);
      const level = await determineLevel(newScore, questions.length);
      onComplete(level);
    }
  };

  if (loading && questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center space-y-4">
          <div className="animate-spin text-4xl">🔮</div>
          <p className="text-slate-600 font-medium">Analyzing your English profile...</p>
        </div>
      </div>
    );
  }

  const q = questions[currentIdx];
  if (!q) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50 flex flex-col items-center justify-center p-6 relative">
      {/* NO LANGUAGE SELECTOR HERE */}
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl p-8 space-y-8 fade-in">
        
        <div className="flex justify-between items-center border-b pb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">
            {q.category}
          </span>
          <span className="text-slate-400 text-sm">Question {currentIdx + 1} of {questions.length}</span>
        </div>
        
        <div className="w-full bg-slate-100 rounded-full h-2">
          <div className="bg-indigo-500 h-2 rounded-full transition-all duration-300" style={{ width: `${((currentIdx) / questions.length) * 100}%` }}></div>
        </div>

        <h2 className="text-2xl font-semibold text-slate-800 leading-relaxed">
          {q.question}
        </h2>

        <div className="space-y-3">
          {q.options?.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              className="w-full text-left p-4 rounded-xl border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all font-medium text-slate-700"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                           GRAMMAR GURU VIEW                                */
/* -------------------------------------------------------------------------- */

const GrammarGuruView: React.FC<{
  user: UserProfile;
  onBack: () => void;
  onGoToPlacement: () => void;
  onUpdateUser: (u: UserProfile) => void;
}> = ({ user, onBack, onGoToPlacement, onUpdateUser }) => {
  const [viewMode, setViewMode] = useState<'HOME' | 'DETAIL' | 'DRILL'>('HOME');
  const [selectedLesson, setSelectedLesson] = useState<GrammarPurposeLesson | null>(null);
  const [progress, setProgress] = useState(loadGrammarProgress());
  const [showLockInfo, setShowLockInfo] = useState<{level: string, message: string} | null>(null);
  
  // Drill State
  const [drillIndex, setDrillIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState<any>(null);
  const [drillResults, setDrillResults] = useState<boolean[]>([]);
  const [lessonResult, setLessonResult] = useState<{correct: number, total: number, score: number} | null>(null);

  const effectiveLevel = getEffectiveLevel(user.level);

  // Auto-refresh progress on mount
  useEffect(() => {
    setProgress(loadGrammarProgress());
  }, []);

  const handleLessonSelect = (lesson: GrammarPurposeLesson, isLocked: boolean) => {
    if (isLocked) {
      if (user.level === EnglishLevel.PRE_A0) {
        setShowLockInfo({
          level: lesson.level,
          message: `Bạn đang học khóa nền tảng Pre-A0. Hoàn thành tất cả bài Pre-A0 để mở khóa cấp độ này.`
        });
        return;
      }
      // Find the previous level
      const currentIdx = ['PreA0', 'A0','A1','A2','B1','B2'].indexOf(lesson.level);
      const prevLevel = ['PreA0', 'A0','A1','A2','B1','B2'][currentIdx - 1] || 'PreA0';
      
      setShowLockInfo({
        level: lesson.level,
        message: `Bài này thuộc cấp độ ${lesson.level}. Để học bài này, bạn cần hoàn thành tất cả các bài ở cấp độ trước (${prevLevel}).`
      });
      return;
    }
    setSelectedLesson(lesson);
    setViewMode('DETAIL');
  };

  const startDrill = () => {
    if (!selectedLesson) return;
    setDrillIndex(0);
    setDrillResults([]);
    setLessonResult(null);
    setUserAnswer(null); // Reset answer
    setViewMode('DRILL');
    
    // Mark as in-progress if not mastered
    if (progress[selectedLesson.id]?.state !== 'mastered') {
        const updated = updateLessonProgress(progress, selectedLesson.id, { state: 'in_progress' });
        setProgress(updated);
    }
  };

  const normalizeText = (text: string): string => {
    return String(text).trim().toLowerCase().replace(/\s+/g, ' ');
  };

  const evaluateDrillAnswer = (drill: GrammarDrillItem, answer: any): boolean => {
    if (!drill) return false;

    if (drill.type === 'reorder') {
        const expectedArray = Array.isArray(drill.answer) ? drill.answer : [drill.answer];
        const userArray = Array.isArray(answer) ? answer : [answer];
        return normalizeText(expectedArray.join(' ')) === normalizeText(userArray.join(' '));
    }

    // String based comparison for multiple choice, fill blank, drag drop
    const expected = Array.isArray(drill.answer) ? drill.answer[0] : drill.answer;
    const userVal = Array.isArray(answer) ? answer[0] : answer;
    
    return normalizeText(String(expected)) === normalizeText(String(userVal));
  };

  const maybeUpgradePreA0ToA0 = (currentUser: UserProfile, currentProgress: GrammarProgress) => {
      if (currentUser.level !== EnglishLevel.PRE_A0) return;
      if (!isPreA0Completed(currentProgress)) return;

      // Auto-upgrade
      const updatedUser = { ...currentUser, level: EnglishLevel.A0 };
      onUpdateUser(updatedUser);
      
      // Could show a toast/dialog here
      alert("Chúc mừng! Bạn đã hoàn thành tất cả bài Pre-A0. Cấp độ A0 – Ngữ pháp sống sót đã được mở khóa.");
  };

  const finalizeLesson = (drills: GrammarDrillItem[], results: boolean[]) => {
      if (!selectedLesson) return;

      const correctCount = results.filter(Boolean).length;
      const totalDrills = drills.length;
      const score = Math.round((correctCount / totalDrills) * 100);

      // Save to storage
      // Only mark mastered if score is perfect? Or simply completion?
      // Requirement says: "When a user completes all drills in a lesson, that lesson is automatically marked as completed/mastered"
      // Let's assume completion is enough, or maybe > 70%? 
      // For now, let's treat completion of all items as mastery.
      
      const newState: GrammarLessonState = 'mastered'; 
      
      const updatedProgress = updateLessonProgress(progress, selectedLesson.id, {
          state: newState,
          completedDrills: totalDrills,
          totalDrills,
          lastScore: score
      });
      
      setProgress(updatedProgress);
      setLessonResult({ correct: correctCount, total: totalDrills, score });

      // Check for auto-upgrade
      maybeUpgradePreA0ToA0(user, updatedProgress);
  };

  const handleCheckAnswer = () => {
    if (!selectedLesson) return;
    const currentDrill = selectedLesson.drills[drillIndex];
    
    const isCorrect = evaluateDrillAnswer(currentDrill, userAnswer);

    // Update results
    setDrillResults(prev => {
        const next = [...prev];
        next[drillIndex] = isCorrect;
        return next;
    });

    if (!isCorrect) {
        alert("Incorrect. The correct answer is: " + (Array.isArray(currentDrill.answer) ? currentDrill.answer.join(" ") : currentDrill.answer));
    } else {
        // Optional immediate feedback
    }

    // Move next or finalize
    if (drillIndex + 1 < selectedLesson.drills.length) {
        setDrillIndex(drillIndex + 1);
        setUserAnswer(null);
    } else {
        // Finalize
        // Need to pass the FULL results including this one
        const finalResults = [...drillResults];
        finalResults[drillIndex] = isCorrect;
        
        finalizeLesson(selectedLesson.drills, finalResults);
    }
  };

  // Find next recommended lesson (First available/in-progress from PreA0 up)
  const nextLesson = useMemo(() => {
      for (const group of grammarLevels) {
          if (!isLevelUnlocked(group.level, progress, user.level)) continue;
          for (const lesson of group.lessons) {
              const p = progress[lesson.id];
              if (!p || p.state !== 'mastered') {
                  return lesson;
              }
          }
      }
      return null;
  }, [progress, user.level]);

  /* --- RENDER HOME --- */
  if (viewMode === 'HOME') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col relative pb-20">
         <div className="bg-white p-4 shadow-sm flex items-center gap-4 sticky top-0 z-10 border-b border-slate-200">
             <button onClick={onBack} className="text-slate-500 hover:text-slate-800 font-medium">← Back</button>
             <div>
                <h2 className="font-bold text-slate-800 text-lg leading-tight">Grammar Guru</h2>
                <p className="text-xs text-slate-500">Ngữ pháp theo mục đích sử dụng</p>
             </div>
         </div>

         <div className="p-4 space-y-6 max-w-2xl mx-auto w-full">
            
            {/* Gentle Reminder for Unknown Level */}
            {user.level === EnglishLevel.UNKNOWN && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 text-sm flex gap-3 items-start">
                   <div className="text-xl">💡</div>
                   <div>
                       <p className="mb-2">
                           Hiện tại app đang tạm xếp bạn ở cấp độ <strong>A0</strong>. 
                           Nếu bạn đã có nền tảng tiếng Anh, hãy làm bài kiểm tra xếp lớp để có thể bắt đầu từ A1 hoặc A2.
                       </p>
                       <button onClick={onGoToPlacement} className="text-indigo-600 font-bold hover:underline">
                           👉 Làm bài kiểm tra ngay
                       </button>
                   </div>
                </div>
            )}

            {/* Pre-A0 Specific Header */}
            {user.level === EnglishLevel.PRE_A0 && (
                 <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-blue-900 text-sm">
                    <p className="font-bold mb-1">Trình độ hiện tại: Pre-A0 – Khóa nền tảng siêu cơ bản.</p>
                    <p>Bạn đang học khóa nền tảng dành cho người mới bắt đầu. Hoàn thành Pre-A0 để mở khóa A0, A1, A2…</p>
                 </div>
            )}

            {/* Recommended Card */}
            {nextLesson && (
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-200 animate-[fadeIn_0.5s]">
                    <div className="flex justify-between items-start mb-2">
                        <span className="bg-white/20 px-2 py-1 rounded text-xs font-bold backdrop-blur-md">Bài học tiếp theo</span>
                        <span className="text-xs font-mono opacity-80">{nextLesson.level}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-1">{nextLesson.purposeTitleVi}</h3>
                    <p className="text-blue-100 text-sm mb-4 italic">"{nextLesson.sampleSentenceEn}"</p>
                    <Button onClick={() => handleLessonSelect(nextLesson, false)} variant="secondary" size="sm" className="w-full">
                        Bắt đầu bài này &rarr;
                    </Button>
                </div>
            )}

            {/* Level Lists */}
            {grammarLevels.map(group => {
                const unlocked = isLevelUnlocked(group.level, progress, user.level);
                const masteredCount = group.lessons.filter(l => progress[l.id]?.state === 'mastered').length;
                
                return (
                    <div key={group.level} className={`space-y-3 ${!unlocked ? 'opacity-70 grayscale-[0.5]' : ''}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded text-xs text-white ${unlocked ? 'bg-indigo-500' : 'bg-slate-400'}`}>{group.level}</span>
                                    {group.titleVi}
                                </h3>
                                <p className="text-xs text-slate-500">{group.descriptionVi}</p>
                            </div>
                            <div className="text-xs font-mono font-bold text-slate-400">
                                {masteredCount}/{group.lessons.length}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {group.lessons.map(lesson => {
                                const state = progress[lesson.id]?.state || 'locked';
                                const isAccessible = unlocked; 
                                
                                return (
                                    <button 
                                        key={lesson.id}
                                        onClick={() => handleLessonSelect(lesson, !isAccessible)}
                                        className={`relative text-left p-4 rounded-xl border-2 transition-all hover:scale-[1.02] active:scale-95
                                            ${!isAccessible 
                                                ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' 
                                                : state === 'mastered'
                                                    ? 'bg-emerald-50 border-emerald-200 text-slate-800'
                                                    : 'bg-white border-slate-200 hover:border-blue-400 text-slate-800 shadow-sm'
                                            }`}
                                    >
                                        {!isAccessible && <div className="absolute top-2 right-2 text-lg">🔒</div>}
                                        {state === 'mastered' && <div className="absolute top-2 right-2 text-emerald-500">✅</div>}
                                        
                                        <div className="font-bold text-sm mb-1">{lesson.purposeTitleVi}</div>
                                        <div className="text-xs text-slate-500 mb-2">{lesson.purposeTitleEn}</div>
                                        <div className="text-xs italic opacity-80 border-l-2 border-current pl-2">
                                            "{lesson.sampleSentenceVi}"
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
         </div>

         {/* Lock Modal */}
         {showLockInfo && (
             <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6 fade-in">
                 <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
                     <div className="text-4xl">🔒</div>
                     <h3 className="font-bold text-lg text-slate-800">Cấp độ {showLockInfo.level} bị khóa</h3>
                     <p className="text-slate-600 text-sm">{showLockInfo.message}</p>
                     <Button onClick={() => setShowLockInfo(null)} className="w-full">Đã hiểu</Button>
                 </div>
             </div>
         )}
      </div>
    );
  }

  /* --- RENDER LESSON DETAIL --- */
  if (viewMode === 'DETAIL' && selectedLesson) {
      return (
          <div className="min-h-screen bg-slate-50 flex flex-col relative">
              <div className="bg-white p-4 shadow-sm flex items-center gap-4 border-b border-slate-200">
                <button onClick={() => setViewMode('HOME')} className="text-slate-500 hover:text-slate-800 font-medium">← Back</button>
                <div className="flex-1">
                    <h2 className="font-bold text-slate-800 leading-none">{selectedLesson.purposeTitleVi}</h2>
                    <p className="text-xs text-slate-500">{selectedLesson.purposeTitleEn}</p>
                </div>
              </div>
              
              <div className="p-6 max-w-lg mx-auto w-full space-y-8">
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl">
                      <p className="text-lg font-medium text-slate-800 mb-1">{selectedLesson.sampleSentenceEn}</p>
                      <p className="text-slate-600 italic">{selectedLesson.sampleSentenceVi}</p>
                  </div>

                  <div className="space-y-4">
                      <h3 className="font-bold text-slate-800 border-b pb-2">Giải thích nhanh</h3>
                      <div className="space-y-2">
                          <p className="text-slate-700">{selectedLesson.explanationVi}</p>
                          <p className="text-slate-500 text-sm italic bg-slate-100 p-2 rounded">{selectedLesson.explanationEn}</p>
                      </div>
                  </div>

                  <div className="pt-8">
                      <Button onClick={startDrill} className="w-full text-lg py-4 shadow-xl">
                          Bắt đầu luyện tập
                      </Button>
                  </div>
              </div>
          </div>
      );
  }

  /* --- RENDER DRILL --- */
  if (viewMode === 'DRILL' && selectedLesson) {
      const currentDrill = selectedLesson.drills[drillIndex];

      if (lessonResult) {
          return (
              <div className="min-h-screen bg-emerald-50 flex flex-col items-center justify-center p-6 text-center space-y-6">
                  <FullScreenFireworks />
                  <div className="text-6xl animate-bounce">🎓</div>
                  <h2 className="text-2xl font-bold text-slate-800">Bài học hoàn thành!</h2>
                  
                  <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm space-y-4">
                      <div className="text-sm uppercase tracking-wide text-slate-500 font-bold">Kết quả</div>
                      <div className="text-4xl font-bold text-emerald-600">{lessonResult.score}%</div>
                      <div className="flex justify-between text-sm text-slate-600 border-t pt-4">
                          <span>Đúng: {lessonResult.correct}</span>
                          <span>Tổng: {lessonResult.total}</span>
                      </div>
                  </div>

                  <Button onClick={() => setViewMode('HOME')} className="w-full max-w-xs">Quay về danh sách</Button>
              </div>
          );
      }

      return (
          <div className="min-h-screen bg-slate-50 flex flex-col relative">
             <div className="w-full bg-slate-200 h-2">
                 <div className="bg-blue-600 h-2 transition-all duration-300" style={{ width: `${(drillIndex / selectedLesson.drills.length) * 100}%` }}></div>
             </div>

             <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-lg mx-auto w-full space-y-8">
                 <div className="w-full text-center">
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Question {drillIndex + 1}/{selectedLesson.drills.length}</span>
                     {/* Drill Render */}
                     <div className="mt-4">
                        <DrillRenderer 
                           drill={currentDrill} 
                           onAnswer={setUserAnswer} 
                           value={userAnswer}
                        />
                     </div>
                 </div>

                 {/* Check Answer Button */}
                 <div className="w-full pt-4">
                    <Button 
                        onClick={handleCheckAnswer} 
                        className="w-full py-4 text-lg shadow-xl"
                        disabled={userAnswer === null || (Array.isArray(userAnswer) && userAnswer.length === 0) || (typeof userAnswer === 'string' && userAnswer.length === 0)}
                    >
                        Check Answer
                    </Button>
                 </div>
             </div>
             
             <div className="p-4 text-center">
                 <button onClick={() => setViewMode('DETAIL')} className="text-slate-400 hover:text-slate-600 text-sm">Thoát bài tập</button>
             </div>
          </div>
      );
  }

  return null;
};

/* -------------------------------------------------------------------------- */
/*                                DASHBOARD VIEW                              */
/* -------------------------------------------------------------------------- */
const DashboardView: React.FC<{
  user: UserProfile;
  lang: AppLanguage;
  onNavigate: (view: AppView) => void;
  onUpdateUser: (u: UserProfile) => void;
}> = ({ user, lang, onNavigate, onUpdateUser }) => {
    return (
        <div className="min-h-screen bg-slate-50 p-6 space-y-6">
            <header className="flex justify-between items-center">
                <div>
                   <h1 className="text-2xl font-bold text-slate-800">Hello, {user.name}</h1>
                   <p className="text-slate-500">Level: {user.level}</p>
                </div>
                <div className="flex items-center gap-2">
                   <span className="text-xl">🔥</span>
                   <span className="font-bold text-slate-700">{user.streak}</span>
                </div>
            </header>
            
            <MissionTracker user={user} lang={lang} />
            
            <div className="grid grid-cols-1 gap-4">
                 <button onClick={() => onNavigate(AppView.GRAMMAR_PRACTICE)} className="p-6 bg-white rounded-xl shadow border border-slate-200 text-left hover:border-indigo-400 transition-all flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg text-indigo-600 mb-1">Grammar Guru</h3>
                        <p className="text-sm text-slate-500">Master grammar rules with purpose</p>
                    </div>
                    <span className="text-2xl">📚</span>
                 </button>
                 
                 <button onClick={() => onNavigate(AppView.PLACEMENT_TEST)} className="p-6 bg-white rounded-xl shadow border border-slate-200 text-left hover:border-blue-400 transition-all flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg text-blue-600 mb-1">Placement Test</h3>
                        <p className="text-sm text-slate-500">Re-check your level</p>
                    </div>
                    <span className="text-2xl">🎯</span>
                 </button>
            </div>
            
            <div className="pt-6 text-center text-xs text-slate-400">
                FluentFlow AI v{APP_VERSION}
            </div>
        </div>
    );
};

/* -------------------------------------------------------------------------- */
/*                                MAIN APP COMPONENT                          */
/* -------------------------------------------------------------------------- */
const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.WELCOME);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [lang, setLang] = useState<AppLanguage>('vi');

  useEffect(() => {
    const loaded = loadUserProfile();
    if (loaded) {
        setUser(loaded);
        setView(AppView.DASHBOARD);
        if (loaded.language) setLang(loaded.language);
    }
  }, []);

  const handleUpdateUser = (u: UserProfile) => {
      setUser(u);
      saveUserProfile(u);
  };
  
  return (
      <>
         {/* Render view based on state */}
         {view === AppView.WELCOME && <WelcomeView onStart={() => setView(AppView.LOGIN)} />}
         
         {view === AppView.LOGIN && <LoginView onLogin={(p, l) => {
             // Create user
             const newUser: UserProfile = {
                name: "Learner",
                level: EnglishLevel.UNKNOWN,
                xp: 0,
                streak: 0,
                badges: [],
                titles: [],
                vocabList: [],
                grammarList: [],
                isReturning: false,
                learningStats: { wordsLearned: 0, sentencesSpoken: 0, grammarPoints: 0 },
                language: l
             };
             handleUpdateUser(newUser);
             setLang(l);
             setView(AppView.LANDING);
         }} onSkip={(l) => {
             const newUser: UserProfile = {
                name: "Guest",
                level: EnglishLevel.UNKNOWN,
                xp: 0,
                streak: 0,
                badges: [],
                titles: [],
                vocabList: [],
                grammarList: [],
                isReturning: false,
                learningStats: { wordsLearned: 0, sentencesSpoken: 0, grammarPoints: 0 },
                language: l
             };
             handleUpdateUser(newUser);
             setLang(l);
             setView(AppView.LANDING);
         }} />}

         {view === AppView.LANDING && <WelcomeLevelChoiceView 
            onPreA0={() => {
                if (user) {
                    const u = { ...user, level: EnglishLevel.PRE_A0 };
                    handleUpdateUser(u);
                    setView(AppView.DASHBOARD);
                }
            }} 
            onStandard={() => {
                setView(AppView.PLACEMENT_TEST);
            }} 
         />}

         {view === AppView.PLACEMENT_TEST && <PlacementTestView 
            lang={lang}
            onComplete={(lvl) => {
                if (user) {
                    const u = { ...user, level: lvl };
                    handleUpdateUser(u);
                    setView(AppView.DASHBOARD);
                }
            }}
         />}

         {view === AppView.DASHBOARD && user && <DashboardView 
            user={user} 
            lang={lang} 
            onNavigate={setView}
            onUpdateUser={handleUpdateUser}
         />}

         {view === AppView.GRAMMAR_PRACTICE && user && <GrammarGuruView 
            user={user}
            onBack={() => setView(AppView.DASHBOARD)}
            onGoToPlacement={() => setView(AppView.PLACEMENT_TEST)}
            onUpdateUser={handleUpdateUser}
         />}
      </>
  );
};

export default App;