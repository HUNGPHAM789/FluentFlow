// --- App.tsx ---
import React, { useState, useEffect, useRef, useMemo } from 'react';
import MarkdownRenderer from './components/MarkdownRenderer'; 
import { AppView, UserProfile, EnglishLevel, VocabWord, PlacementQuestion, VocabDrillContent, SpeakingFeedback, NewVocabCard, GrammarQuestion, AppLanguage, SpeakingScenarioData, Quote, BadgeDefinition, LEARNING_TOPICS } from './types';
import { evaluateSpeaking, askGenericAI } from './services/gemini';
import { generatePlacementTest, determineLevel, generateVocabDrill, generateNewVocab, generateSpeakingSentence } from './services/content';
import Button from './components/Button';
import { blobToBase64 } from './utils/audioUtils';
import { translations } from './utils/translations';
import { englishQuotes } from './data/englishQuotes';
import { BADGE_DEFINITIONS } from './data/badges';
import { vocabData } from './data/vocabData';
import { STORAGE_KEYS, clearAppStorage, loadUserProfile, saveUserProfile, getStoredVersion, setStoredVersion } from './utils/storage';

// Increment this version to force a data reset for all users
const APP_VERSION = '1.4';

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
  const [lang, setLang] = useState<AppLanguage>('en');
  const t = translations[lang] || translations.en;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-800 p-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      
      {/* Language Selector */}
      <div className="absolute top-6 right-6 z-20">
         <LanguageSelector currentLang={lang} onChange={setLang} />
      </div>

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
/*                                LANDING VIEW                                */
/* -------------------------------------------------------------------------- */

const LandingView: React.FC<{ 
  onStart: () => void;
  onSkip: () => void; 
}> = ({ onStart, onSkip }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white p-6 relative overflow-hidden">
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
    <div className="z-10 text-center max-w-lg space-y-8 fade-in">
      <div className="space-y-2">
        <h1 className="text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
          FluentFlow AI
        </h1>
        <p className="text-indigo-200 text-lg">Master English with adaptive AI shadowing and real-time feedback.</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-left bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎯</span>
          <span className="text-sm font-medium">Placement Test</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-2xl">🗣️</span>
          <span className="text-sm font-medium">Shadowing</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-2xl">🧠</span>
          <span className="text-sm font-medium">Interactive Drills</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏆</span>
          <span className="text-sm font-medium">Titles & Badges</span>
        </div>
      </div>

      <div className="space-y-4">
        <Button onClick={onStart} className="w-full text-lg py-4 shadow-indigo-500/50">
          Start Placement Test
        </Button>
        <button 
          onClick={onSkip}
          className="text-indigo-200 hover:text-white text-sm font-medium hover:underline transition-all opacity-80"
        >
          I know my level (Skip to Dashboard)
        </button>
      </div>
      
      <p className="text-xs text-indigo-300 opacity-60">Takes about 5 minutes • Determines your level (A1-C1)</p>
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/*                             PLACEMENT TEST VIEW                            */
/* -------------------------------------------------------------------------- */

const PlacementTestView: React.FC<{ 
  onComplete: (level: EnglishLevel) => void;
  lang: AppLanguage;
  onLangChange: (l: AppLanguage) => void; 
}> = ({ onComplete, lang, onLangChange }) => {
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
      <div className="absolute top-6 right-6 z-20">
         <LanguageSelector currentLang={lang} onChange={onLangChange} />
      </div>
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
/*                              DASHBOARD VIEW                                */
/* -------------------------------------------------------------------------- */

const TopicSelectionModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  onSelect: (topic: string, level: string) => void; 
  title: string;
  userVocab: VocabWord[];
}> = ({ isOpen, onClose, onSelect, title, userVocab }) => {
  if (!isOpen) return null;

  const isCompleted = (topic: string) => {
    // Count how many words in this topic the user has learned
    const userCount = userVocab.filter(v => {
        // Find the topic of this word from the vocabData
        const source = vocabData.find(r => r.word === v.word);
        return source?.topic === topic;
    }).length;
    
    // Count total available words in this topic
    const totalCount = vocabData.filter(v => v.topic === topic).length;
    
    return totalCount > 0 && userCount >= totalCount;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 fade-in">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 transition-colors">✕</button>
        <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">{title}</h3>
        
        <div className="grid grid-cols-2 gap-3">
          {LEARNING_TOPICS.map((t) => {
            const completed = isCompleted(t);
            return (
                <button 
                  key={t}
                  onClick={() => onSelect(t, "B1")} // Defaulting level as it's adaptive
                  disabled={completed}
                  className={`p-3 rounded-xl border transition-all font-medium text-left flex flex-col justify-between h-24
                    ${completed 
                        ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed' 
                        : 'bg-white border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 text-slate-600'
                    }`}
                >
                  <span>{t}</span>
                  {completed && <span className="text-xs font-bold text-green-500 uppercase">Completed ✓</span>}
                </button>
            );
          })}
          <button 
            onClick={() => onSelect("Random", "B1")}
            className="p-3 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/50 text-indigo-600 hover:bg-indigo-100 transition-all font-medium text-left col-span-2 text-center h-24 flex items-center justify-center"
          >
             🎲 Surprise Me (Random)
          </button>
        </div>
      </div>
    </div>
  );
};

// Quote Card Component (Antique Style)
const QuoteCard: React.FC = () => {
  const [quote, setQuote] = useState<Quote | null>(null);

  useEffect(() => {
    const ONE_MINUTE = 60 * 1000;
    const TEN_MINUTES = 10 * ONE_MINUTE;

    const storedQuote = localStorage.getItem(STORAGE_KEYS.QUOTE);
    const storedTime = localStorage.getItem(STORAGE_KEYS.QUOTE_TIME);
    const now = Date.now();

    if (storedQuote && storedTime && (now - parseInt(storedTime)) < TEN_MINUTES) {
      setQuote(JSON.parse(storedQuote));
    } else {
      const randomQuote = englishQuotes[Math.floor(Math.random() * englishQuotes.length)];
      setQuote(randomQuote);
      localStorage.setItem(STORAGE_KEYS.QUOTE, JSON.stringify(randomQuote));
      localStorage.setItem(STORAGE_KEYS.QUOTE_TIME, now.toString());
    }
  }, []);

  if (!quote) return null;

  return (
    <div className="w-full bg-[#f4e4bc] rounded-xl shadow-lg border-2 border-[#d4c5a3] p-6 text-[#432d1e] relative overflow-hidden group shine font-serif">
      <div className="absolute top-0 right-0 p-4 opacity-10 text-8xl font-serif leading-none select-none pointer-events-none">"</div>
      
      <div className="relative z-10 flex flex-col items-center text-center space-y-5">
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase border-b border-[#432d1e]/30 pb-1">
          {quote.category}
        </span>
        
        <div>
          <p className="text-2xl font-medium leading-relaxed drop-shadow-sm font-serif italic">"{quote.text}"</p>
          <p className="text-sm opacity-80 mt-3 font-light italic">
            {quote.translation}
          </p>
        </div>

        <div className="text-xs font-bold uppercase tracking-wide opacity-70">
          — {quote.author}
        </div>
      </div>
    </div>
  );
};

// Badge List Modal
const BadgeModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  lang: AppLanguage;
}> = ({ isOpen, onClose, user, lang }) => {
  if (!isOpen) return null;

  // Filter next 10 unearned badges
  const unearnedBadges = BADGE_DEFINITIONS.filter(b => !user.badges.includes(b.id)).slice(0, 10);

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 fade-in">
      <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 transition-colors">✕</button>
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-slate-800">Your Next Quest</h3>
          <p className="text-slate-500 text-sm">Earn these badges to level up!</p>
        </div>

        <div className="space-y-3">
          {unearnedBadges.map(badge => {
            let currentVal = 0;
            switch(badge.type) {
              case 'words': currentVal = user.learningStats?.wordsLearned || 0; break;
              case 'sentences': currentVal = user.learningStats?.sentencesSpoken || 0; break;
              case 'grammar': currentVal = user.learningStats?.grammarPoints || 0; break;
              case 'streak': currentVal = user.streak; break;
            }
            const progress = Math.min(100, Math.round((currentVal / badge.threshold) * 100));

            return (
              <div key={badge.id} className="flex items-center gap-4 p-3 rounded-xl border border-slate-200 bg-slate-50 opacity-75 hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-2xl grayscale">
                  {badge.icon}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-700">{lang === 'vi' ? badge.name.vi : badge.name.en}</span>
                    <span className="text-xs font-mono text-slate-500">{currentVal}/{badge.threshold}</span>
                  </div>
                  <div className="text-xs text-slate-500 mb-1">{lang === 'vi' ? badge.description.vi : badge.description.en}</div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-400 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 text-center">
            <Button onClick={onClose} variant="secondary">Keep Learning</Button>
        </div>
      </div>
    </div>
  );
};


const DashboardView: React.FC<{ 
  user: UserProfile; 
  onNavigate: (view: AppView, params?: any) => void;
  onLanguageChange: (lang: AppLanguage) => void;
}> = ({ user, onNavigate, onLanguageChange }) => {
  const [modalType, setModalType] = useState<'vocab' | 'grammar' | null>(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const t = translations[user.language || 'en'] || translations.en;
  const lang = user.language || 'en';

  const handleTopicSelect = (topic: string, level: string) => {
    if (modalType === 'vocab') {
      onNavigate(AppView.NEW_VOCAB, { topic, level });
    } else if (modalType === 'grammar') {
      onNavigate(AppView.GRAMMAR_PRACTICE, { topic });
    }
    setModalType(null);
  };

  // Get Highest Earned Badge (Latest Title)
  const latestBadge = useMemo(() => {
    // Find all badges user has earned
    const earned = BADGE_DEFINITIONS.filter(b => user.badges.includes(b.id));
    // Sort by threshold (approx difficulty)
    earned.sort((a, b) => b.threshold - a.threshold);
    // Return highest or default
    return earned.length > 0 ? earned[0] : { 
        name: { en: "Novice Wanderer", vi: "Lữ Khách Mới" }, 
        description: { en: "Your journey begins.", vi: "Hành trình bắt đầu." }, // Add default description
        icon: "🎒",
        type: 'words', // Default type
        threshold: 0,
        id: 'novice'
    };
  }, [user.badges]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50 p-6 pb-24 relative">
      <TopicSelectionModal 
        isOpen={!!modalType} 
        onClose={() => setModalType(null)} 
        onSelect={handleTopicSelect} 
        title={modalType === 'vocab' ? t.discoverTitle : t.grammarTitle}
        userVocab={user.vocabList}
      />

      <BadgeModal 
        isOpen={showBadgeModal} 
        onClose={() => setShowBadgeModal(false)} 
        user={user}
        lang={lang}
      />

       {/* Language Selector (Persistent) */}
       <div className="absolute top-6 right-6 z-20">
         <LanguageSelector currentLang={user.language || 'en'} onChange={onLanguageChange} />
      </div>

      <div className="max-w-4xl mx-auto space-y-6 fade-in pt-8">
        
        {/* Header */}
        <header>
            <h1 className="text-3xl font-bold text-slate-900">{t.welcome}, {user.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              {/* Clickable RPG Title */}
              <button 
                onClick={() => setShowBadgeModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-amber-100 border border-amber-200 px-3 py-1 rounded-full shadow-sm hover:shadow-md hover:scale-105 transition-all cursor-pointer"
              >
                 <span className="text-lg">{latestBadge.icon}</span>
                 <span className="text-sm font-bold text-amber-800">
                    {lang === 'vi' ? latestBadge.name.vi : latestBadge.name.en}
                 </span>
                 <span className="text-[10px] text-amber-600 ml-1">ℹ️</span>
              </button>
              
              <span className="text-sm bg-white text-slate-600 px-2 py-0.5 rounded-md font-medium border border-slate-200">
                Lvl: {user.level}
              </span>
            </div>
        </header>

        {/* Stats & Quote Section */}
        <div className="space-y-4 animate-[fadeIn_0.4s_ease-out]">
           {/* Quick Stats Grid */}
           <div className="grid grid-cols-4 gap-2 md:gap-4">
              <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
                <div className="text-xl mb-1">🔥</div>
                <div className="font-bold text-slate-800 text-sm">{user.streak}</div>
                <div className="text-[10px] text-slate-400 uppercase font-bold text-center">{t.streak}</div>
              </div>
              <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
                <div className="text-xl mb-1">🏅</div>
                <div className="font-bold text-slate-800 text-sm">{user.badges.length}</div>
                <div className="text-[10px] text-slate-400 uppercase font-bold text-center">{t.badges}</div>
              </div>
              <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
                 <div className="text-xl mb-1">📝</div>
                 <div className="font-bold text-slate-800 text-sm">{user.learningStats?.wordsLearned || 0}</div>
                 <div className="text-[10px] text-slate-400 uppercase font-bold text-center">{t.wordsMastered}</div>
              </div>
              <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
                 <div className="text-xl mb-1">🗣️</div>
                 <div className="font-bold text-slate-800 text-sm">{user.learningStats?.sentencesSpoken || 0}</div>
                 <div className="text-[10px] text-slate-400 uppercase font-bold text-center">Spoken</div>
              </div>
            </div>

            {/* Mission Tracker */}
            <MissionTracker user={user} lang={lang} />

            {/* Antique Random Quote Card */}
            <QuoteCard />
        </div>

        {/* Action Buttons (Fade In) */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-4">
             <h3 className="font-semibold text-slate-800 text-lg animate-[fadeIn_0.5s_ease-out]">{t.whatToLearn}</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            
            {/* 1. Discover Words */}
            <button 
              onClick={() => setModalType('vocab')}
              className="group relative overflow-hidden bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl p-6 text-white text-left shadow-lg shadow-pink-200 transition-all hover:scale-[1.02] hover:shadow-pink-300 animate-[fadeIn_0.6s_ease-out_fill-mode-backwards]"
            >
              <div className="absolute top-0 right-0 p-4 opacity-20 text-6xl rotate-12">🔭</div>
              <h4 className="text-xl font-bold mb-2">{t.discoverTitle}</h4>
              <p className="text-pink-100 text-sm mb-4">{t.discoverDesc}</p>
              <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md">{t.explore} &rarr;</span>
            </button>

             {/* 2. Vocab Recall */}
             <button 
              onClick={() => onNavigate(AppView.VOCAB_DRILL)}
              className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white text-left shadow-lg shadow-emerald-200 transition-all hover:scale-[1.02] hover:shadow-emerald-300 animate-[fadeIn_0.65s_ease-out_fill-mode-backwards]"
            >
              <div className="absolute top-0 right-0 p-4 opacity-20 text-6xl rotate-12">🧠</div>
              <h4 className="text-xl font-bold mb-2">{t.vocabRecallTitle}</h4>
              <p className="text-emerald-100 text-sm mb-4">{t.vocabRecallDesc}</p>
              <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md">{t.startDrill} &rarr;</span>
            </button>

            {/* 3. Grammar Guru */}
            <button 
              onClick={() => setModalType('grammar')}
              className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-600 rounded-3xl p-6 text-white text-left shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] hover:shadow-blue-300 animate-[fadeIn_0.7s_ease-out_fill-mode-backwards]"
            >
              <div className="absolute top-0 right-0 p-4 opacity-20 text-6xl rotate-12">⚖️</div>
              <h4 className="text-xl font-bold mb-2">{t.grammarTitle}</h4>
              <p className="text-blue-100 text-sm mb-4">{t.grammarDesc}</p>
              <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md">{t.practice} &rarr;</span>
            </button>

            {/* 4. Grammar Review */}
            <button 
              onClick={() => onNavigate(AppView.GRAMMAR_REVIEW)}
              className="group relative overflow-hidden bg-gradient-to-br from-orange-500 to-amber-600 rounded-3xl p-6 text-white text-left shadow-lg shadow-orange-200 transition-all hover:scale-[1.02] hover:shadow-orange-300 animate-[fadeIn_0.75s_ease-out_fill-mode-backwards]"
            >
              <div className="absolute top-0 right-0 p-4 opacity-20 text-6xl rotate-12">🧱</div>
              <h4 className="text-xl font-bold mb-2">{t.grammarListTitle}</h4>
              <p className="text-orange-100 text-sm mb-4">{t.grammarListDesc}</p>
              <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md">{t.review} &rarr;</span>
            </button>

            {/* 5. Shadowing */}
            <button 
              onClick={() => onNavigate(AppView.SPEAKING_PRACTICE)}
              className="group relative overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white text-left shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02] hover:shadow-indigo-300 animate-[fadeIn_0.78s_ease-out_fill-mode-backwards]"
            >
              <div className="absolute top-0 right-0 p-4 opacity-20 text-6xl rotate-12">🎤</div>
              <h4 className="text-xl font-bold mb-2">{t.shadowingTitle}</h4>
              <p className="text-indigo-100 text-sm mb-4">{t.shadowingDesc}</p>
              <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md">{t.startSession} &rarr;</span>
            </button>
            
            {/* 6. AI Tutor & Writing */}
            <button 
              onClick={() => onNavigate(AppView.WRITING_ASSISTANT)}
              className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-violet-600 rounded-3xl p-6 text-white text-left shadow-lg shadow-purple-200 transition-all hover:scale-[1.02] hover:shadow-purple-300 animate-[fadeIn_0.8s_ease-out_fill-mode-backwards]"
            >
              <div className="absolute top-0 right-0 p-4 opacity-20 text-6xl rotate-12">✍️</div>
              <h4 className="text-xl font-bold mb-2">AI Tutor & Writing</h4>
              <p className="text-purple-100 text-sm mb-4">Feedback, writing, & custom Q&A.</p>
              <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md">Start &rarr;</span>
            </button>

          </div>
        </div>

        <footer className="text-center text-slate-400 text-xs py-8">
           FluentFlow AI v1.0 • Built with Gemini
        </footer>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                          NEW VOCAB VIEW                                    */
/* -------------------------------------------------------------------------- */

const NewVocabView: React.FC<{ 
  topic: string; 
  level: string;
  lang: AppLanguage;
  userVocab: VocabWord[];
  onBack: () => void; 
  onSave: (word: string) => void;
  onLangChange: (l: AppLanguage) => void;
}> = ({ topic, level, lang, userVocab, onBack, onSave, onLangChange }) => {
  const [card, setCard] = useState<NewVocabCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [seenWords, setSeenWords] = useState<string[]>([]);
  const t = translations[lang] || translations.en;

  const fetchNewWord = async () => {
    setLoading(true);
    setIsSaved(false);
    
    // Combine saved words and session seen words to exclude them
    const exclude = [...userVocab.map(v => v.word), ...seenWords];
    
    const data = await generateNewVocab(topic, level, lang, exclude);
    
    setCard(data);
    if (data) {
        setSeenWords(prev => [...prev, data.word]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNewWord();
  }, [topic, level]);

  const handleSave = () => {
    if (card && !isSaved) {
        onSave(card.word);
        setIsSaved(true);
    }
  };

  const playPronunciation = (text: string) => {
    const u = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(u);
  };

  // Particles for firework effect
  const particles = useMemo(() => {
     return Array.from({ length: 12 }).map((_, i) => {
         const angle = (i / 12) * Math.PI * 2;
         const distance = 40; // px
         const tx = Math.cos(angle) * distance;
         const ty = Math.sin(angle) * distance;
         return { tx, ty, color: ['#60A5FA', '#34D399', '#F472B6', '#FBBF24'][i % 4] };
     });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50 flex flex-col items-center justify-center p-6 relative">
       <div className="absolute top-6 left-6 z-20">
         <LanguageSelector currentLang={lang} onChange={onLangChange} />
       </div>
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 space-y-6 fade-in relative min-h-[400px] flex flex-col justify-center">
        <button onClick={onBack} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 transition-colors">✕</button>
        <div className="absolute top-8 left-8 flex items-center gap-2">
           <span className="text-xs font-bold uppercase tracking-wider text-pink-500 bg-pink-50 px-3 py-1 rounded-full">
            {topic}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {level}
          </span>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center"><div className="animate-spin text-4xl text-pink-400">🔭</div></div>
        ) : !card ? (
           <div className="text-center space-y-4">
             <div className="text-6xl">🎉</div>
             <h2 className="text-2xl font-bold text-slate-800">Topic Completed!</h2>
             <p className="text-slate-600">You have explored all available words in this topic.</p>
             <Button onClick={onBack} className="w-full">Choose Another Topic</Button>
           </div>
        ) : (
          <>
            <div className="text-center space-y-2 mt-8">
              <h2 className="text-4xl font-bold text-slate-800">{card.word}</h2>
              <div className="flex items-center justify-center gap-2 text-slate-500">
                <span className="font-mono bg-slate-100 px-2 rounded text-sm">{card.pronunciation}</span>
                <button onClick={() => playPronunciation(card.word)} className="p-1 hover:bg-slate-100 rounded-full">🔊</button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900">{t.definition}</h3>
                <p className="text-slate-600 leading-relaxed">{card.definition}</p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{t.example}</h3>
                 <div className="p-4 bg-slate-50 rounded-xl border-l-4 border-pink-400 italic text-slate-600 space-y-2">
                  <p>"{card.example}"</p>
                  <p className="text-sm text-slate-500">{card.exampleTranslation}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4">
              <div className="relative w-full">
                <Button 
                  onClick={handleSave} 
                  variant={isSaved ? "primary" : "secondary"}
                  disabled={isSaved}
                  className={`w-full transition-all duration-300 relative overflow-visible ${isSaved ? 'bg-blue-600 text-white border-blue-600 animate-pop' : ''}`}
                >
                  {isSaved ? "Saved! ⭐" : t.save}
                </Button>
                {isSaved && particles.map((p, i) => (
                    <span 
                        key={i} 
                        className="firework-particle" 
                        style={{ 
                          "--tx": `${p.tx}px`, 
                          "--ty": `${p.ty}px`,
                          "--color": p.color,
                          backgroundColor: p.color
                        } as React.CSSProperties}
                    />
                ))}
              </div>
              <Button onClick={fetchNewWord} className="bg-gradient-to-r from-pink-500 to-rose-500">{t.next} &rarr;</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                          VOCAB DRILL VIEW                                  */
/* -------------------------------------------------------------------------- */

const VocabDrillView: React.FC<{
  user: UserProfile;
  onBack: () => void;
  onComplete: (word: string, mastery: number) => void;
  onLangChange: (l: AppLanguage) => void;
}> = ({ user, onBack, onComplete, onLangChange }) => {
  const [currentWord, setCurrentWord] = useState<VocabWord | null>(null);
  const [content, setContent] = useState<VocabDrillContent | null>(null);
  const [step, setStep] = useState<'INTRO' | 'QUIZ_MEANING' | 'QUIZ_TRANS' | 'QUIZ_SCRAMBLE' | 'SUCCESS'>('INTRO');
  const [mistakes, setMistakes] = useState(0);
  const [isAllMastered, setIsAllMastered] = useState(false);
  const processedRef = useRef(false);
  const t = translations[user.language || 'en'] || translations.en;
  
  // Interactive Quiz State
  const [userSentence, setUserSentence] = useState<{id: string, word: string}[]>([]);
  const [wordBank, setWordBank] = useState<{id: string, word: string}[]>([]);
  const [quizStatus, setQuizStatus] = useState<'IDLE' | 'CORRECT' | 'WRONG'>('IDLE');

  // Explicitly derive active words (excluding mastered)
  // Mastery Level 3+ is considered "Mastered"
  const activeWords = useMemo(() => {
    return user.vocabList.filter(v => v.masteryLevel < 3);
  }, [user.vocabList]);

  const startDrill = async () => {
    processedRef.current = false;

    if (activeWords.length === 0) {
       setIsAllMastered(true);
       setCurrentWord(null);
       setContent(null);
       return;
    }

    setIsAllMastered(false);
    // Pick a random word from the active list
    const target = activeWords[Math.floor(Math.random() * activeWords.length)];

    setCurrentWord(target);
    setStep('INTRO');
    setMistakes(0);
    setQuizStatus('IDLE');
    
    const drillContent = await generateVocabDrill(target.word, user.language);
    setContent(drillContent);
  };

  useEffect(() => {
    // Only start drill once on mount or if we have words and no current content
    if (activeWords.length > 0 && !currentWord) {
      startDrill();
    } else if (activeWords.length === 0 && user.vocabList.length > 0) {
      // If we have saved words but all are mastered
      setIsAllMastered(true);
    }
  }, []);

  // Initialize interactive quiz data when step changes
  useEffect(() => {
    if (!content) return;
    
    setUserSentence([]);
    setQuizStatus('IDLE');

    if (step === 'QUIZ_TRANS') {
       setWordBank(content.translationQuiz.scrambledEnglish.map((w, i) => ({ id: `t-${i}`, word: w })));
    } else if (step === 'QUIZ_SCRAMBLE') {
       setWordBank(content.scrambleSentence.scrambled.map((w, i) => ({ id: `s-${i}`, word: w })));
    }
  }, [step, content]);

  // Auto-save progress when completing a word
  useEffect(() => {
     if (step === 'SUCCESS' && currentWord && !processedRef.current) {
         processedRef.current = true;
         // Increase mastery if no mistakes, otherwise decrease (min 0) or stay same
         // Logic: Correct = +1, Mistake = -1 (optional, can be stricter)
         const newMastery = mistakes === 0 ? currentWord.masteryLevel + 1 : Math.max(0, currentWord.masteryLevel - 1);
         onComplete(currentWord.word, newMastery);
     }
  }, [step]);

  const handleWordClick = (item: {id: string, word: string}, from: 'bank' | 'sentence') => {
      if (quizStatus === 'CORRECT') return; 

      if (from === 'bank') {
          setWordBank(prev => prev.filter(w => w.id !== item.id));
          setUserSentence(prev => [...prev, item]);
          setQuizStatus('IDLE');
      } else {
          setUserSentence(prev => prev.filter(w => w.id !== item.id));
          setWordBank(prev => [...prev, item]);
          setQuizStatus('IDLE');
      }
  };

  const checkInteractiveSentence = (target: string) => {
      const attempt = userSentence.map(w => w.word).join(' ');
      const cleanAttempt = attempt.replace(/[.,!?]/g, '').toLowerCase().trim();
      const cleanTarget = target.replace(/[.,!?]/g, '').toLowerCase().trim();

      if (cleanAttempt === cleanTarget) {
          setQuizStatus('CORRECT');
      } else {
          setQuizStatus('WRONG');
          setMistakes(m => m + 1);
      }
  };

  if (user.vocabList.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="text-6xl">📭</div>
        <h2 className="text-2xl font-bold text-slate-800">No Words Saved Yet</h2>
        <p className="text-slate-600 max-w-sm">Go to "Discover Words" to build your vocabulary list first.</p>
        <div className="flex gap-4">
           <Button onClick={onBack} variant="secondary">Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  if (isAllMastered) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-6">
            <div className="text-6xl">🎓</div>
            <h2 className="text-2xl font-bold text-slate-800">All Words Mastered!</h2>
            <p className="text-slate-600 max-w-sm">You have mastered all your currently saved words. Go to "Discover Words" to add more challenging vocabulary!</p>
            <Button onClick={onBack} variant="secondary">Back to Dashboard</Button>
        </div>
      );
  }

  if (!content || !currentWord) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin text-4xl">⏳</div></div>;

  const handleNextStep = () => {
    const nextSteps: Record<string, any> = {
      'INTRO': 'QUIZ_MEANING',
      'QUIZ_MEANING': 'QUIZ_TRANS',
      'QUIZ_TRANS': 'QUIZ_SCRAMBLE',
      'QUIZ_SCRAMBLE': 'SUCCESS'
    };
    setStep(nextSteps[step]);
  };

  const playPronunciation = () => {
    if (currentWord) {
      const u = new SpeechSynthesisUtterance(currentWord.word);
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-slate-50 flex flex-col items-center justify-center p-6 relative">
      <div className="absolute top-6 left-6 z-20">
         <LanguageSelector currentLang={user.language || 'en'} onChange={onLangChange} />
      </div>
      
      {step === 'SUCCESS' && <FullScreenFireworks />}

      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 space-y-6 fade-in relative">
        <button onClick={onBack} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 transition-colors">✕</button>
        
        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
           <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
             style={{ width: `${['INTRO','QUIZ_MEANING','QUIZ_TRANS','QUIZ_SCRAMBLE','SUCCESS'].indexOf(step) * 25}%` }}>
           </div>
        </div>

        {step === 'INTRO' && (
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold text-slate-800 flex items-center justify-center gap-3">
                {content.word}
                <button onClick={playPronunciation} className="text-2xl hover:scale-110 transition-transform" title="Listen">🔊</button>
            </h2>
            {content.ipa && <p className="text-sm font-mono text-slate-400 bg-slate-50 inline-block px-2 py-1 rounded">{content.ipa}</p>}
            <p className="text-lg text-slate-600">{content.definition}</p>
            
            <div className="bg-slate-50 p-4 rounded-xl text-left space-y-3">
              <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">
                 Word Forms & Examples
              </h3>
              
              {/* Word Forms */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-2 border-b border-slate-200 pb-2">
                 {content.wordForms.noun && <div><span className="font-bold">n.</span> {content.wordForms.noun}</div>}
                 {content.wordForms.verb && <div><span className="font-bold">v.</span> {content.wordForms.verb}</div>}
                 {content.wordForms.adjective && <div><span className="font-bold">adj.</span> {content.wordForms.adjective}</div>}
                 {content.wordForms.adverb && <div><span className="font-bold">adv.</span> {content.wordForms.adverb}</div>}
              </div>

              {content.situations.map((sit, i) => (
                <div key={i} className="text-sm border-b border-slate-200 pb-2 last:border-0 last:pb-0">
                  <p className="text-emerald-700 font-medium">"{sit.english}"</p>
                  <p className="text-slate-500 text-xs italic">{sit.translation}</p>
                </div>
              ))}
            </div>
            
            <Button onClick={handleNextStep} className="w-full">{t.startDrill}</Button>
          </div>
        )}

        {step === 'QUIZ_MEANING' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800 text-center">{content.meaningQuiz.question}</h3>
            <div className="space-y-3">
              {content.meaningQuiz.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if(i === content.meaningQuiz.correctIndex) handleNextStep();
                    else setMistakes(m => m + 1);
                  }}
                  className="w-full p-4 rounded-xl border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all font-medium text-slate-700 text-left"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'QUIZ_TRANS' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800 text-center">{t.translationQuiz}</h3>
            <div className="bg-indigo-50 p-4 rounded-xl text-center text-indigo-800 font-medium text-lg">
              "{content.translationQuiz.nativeSentence}"
            </div>
            
            {/* Interactive Sentence Building Area */}
            <div className={`min-h-[3rem] p-3 rounded-xl border-2 flex flex-wrap gap-2 items-center justify-center transition-all ${quizStatus === 'WRONG' ? 'border-red-300 bg-red-50' : quizStatus === 'CORRECT' ? 'border-green-300 bg-green-50' : 'border-slate-200 bg-slate-50'}`}>
                {userSentence.length === 0 && <span className="text-slate-400 text-sm italic">Tap words to build sentence...</span>}
                {userSentence.map((item) => (
                   <button 
                     key={item.id} 
                     onClick={() => handleWordClick(item, 'sentence')}
                     className="bg-white border border-slate-300 px-3 py-1.5 rounded-lg shadow-sm text-slate-700 hover:bg-red-50 hover:border-red-200 font-medium animate-[pop_0.2s]"
                   >
                     {item.word}
                   </button>
                ))}
            </div>

            {/* Word Bank */}
            <div className="flex flex-wrap gap-2 justify-center">
               {wordBank.map((item) => (
                 <button 
                   key={item.id} 
                   onClick={() => handleWordClick(item, 'bank')}
                   className="bg-white border border-slate-200 px-3 py-2 rounded-lg shadow-sm text-slate-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all"
                 >
                   {item.word}
                 </button>
               ))}
            </div>
            
            {quizStatus === 'CORRECT' ? (
                <div className="space-y-2">
                    <div className="text-center text-green-600 font-bold mb-2">Correct! 🎉</div>
                    <Button onClick={handleNextStep} className="w-full bg-green-600 hover:bg-green-700">Continue</Button>
                </div>
            ) : (
                <div className="space-y-2">
                    {quizStatus === 'WRONG' && <div className="text-center text-red-500 text-sm font-bold">Try again!</div>}
                    <Button onClick={() => checkInteractiveSentence(content.translationQuiz.correctEnglish)} className="w-full" disabled={userSentence.length === 0}>Check Answer</Button>
                </div>
            )}
          </div>
        )}

        {step === 'QUIZ_SCRAMBLE' && (
          <div className="space-y-6 text-center">
             <h3 className="text-xl font-bold text-slate-800">{t.usageQuiz}</h3>
             <p className="text-slate-500">{content.scrambleSentence.translation}</p>
             
              {/* Interactive Sentence Building Area */}
            <div className={`min-h-[3rem] p-3 rounded-xl border-2 flex flex-wrap gap-2 items-center justify-center transition-all ${quizStatus === 'WRONG' ? 'border-red-300 bg-red-50' : quizStatus === 'CORRECT' ? 'border-green-300 bg-green-50' : 'border-slate-200 bg-slate-50'}`}>
                {userSentence.length === 0 && <span className="text-slate-400 text-sm italic">Arrage the words...</span>}
                {userSentence.map((item) => (
                   <button 
                     key={item.id} 
                     onClick={() => handleWordClick(item, 'sentence')}
                     className="bg-white border border-slate-300 px-3 py-1.5 rounded-lg shadow-sm text-slate-700 hover:bg-red-50 hover:border-red-200 font-medium animate-[pop_0.2s]"
                   >
                     {item.word}
                   </button>
                ))}
            </div>

            {/* Word Bank */}
            <div className="flex flex-wrap gap-2 justify-center">
               {wordBank.map((item) => (
                 <button 
                   key={item.id} 
                   onClick={() => handleWordClick(item, 'bank')}
                   className="bg-white border border-slate-200 px-3 py-2 rounded-lg shadow-sm text-slate-600 hover:bg-emerald-50 hover:border-emerald-200 transition-all"
                 >
                   {item.word}
                 </button>
               ))}
            </div>
             
             {quizStatus === 'CORRECT' ? (
                <div className="space-y-2">
                    <div className="text-center text-green-600 font-bold mb-2">Perfect! 🎉</div>
                    <Button onClick={handleNextStep} className="w-full bg-green-600 hover:bg-green-700">Finish</Button>
                </div>
            ) : (
                <div className="space-y-2">
                    {quizStatus === 'WRONG' && <div className="text-center text-red-500 text-sm font-bold">Incorrect order.</div>}
                    <Button onClick={() => checkInteractiveSentence(content.scrambleSentence.correct)} className="w-full" disabled={userSentence.length === 0}>Check Answer</Button>
                </div>
            )}
          </div>
        )}

        {step === 'SUCCESS' && (
          <div className="text-center space-y-6 py-8">
            <div className="text-6xl animate-bounce">🏆</div>
            <h2 className="text-2xl font-bold text-slate-800">{t.drillComplete}</h2>
            <p className="text-slate-600">
              {mistakes === 0 ? t.drillSuccess : t.drillFail}
            </p>
            <div className="grid grid-cols-2 gap-4">
               <Button onClick={() => startDrill()} variant="secondary">{t.next}</Button>
               <Button onClick={onBack}>{t.close}</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                          WRITING ASSISTANT VIEW                            */
/* -------------------------------------------------------------------------- */

const WritingAssistantView: React.FC<{
  user: UserProfile;
  onBack: () => void;
}> = ({ user, onBack }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user'|'ai', text: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const response = await askGenericAI({ 
        mode: 'WRITING_FEEDBACK', 
        level: user.level,
        context: user.language === 'vi' ? 'Vietnamese learner' : 'English learner'
      }, userMsg);
      
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I encountered an error." }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
       <div className="bg-white p-4 shadow-sm flex items-center gap-4 sticky top-0 z-10">
         <button onClick={onBack} className="text-slate-500 hover:text-slate-800">← Back</button>
         <h2 className="font-bold text-slate-800">AI Tutor</h2>
       </div>
       
       <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
             <div className="text-center text-slate-400 mt-10">
                <div className="text-4xl mb-2">👋</div>
                <p>Ask me anything or paste a sentence for correction!</p>
             </div>
          )}
          {messages.map((m, i) => (
             <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-4 ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 shadow-sm'}`}>
                   <MarkdownRenderer content={m.text} />
                </div>
             </div>
          ))}
          {loading && (
             <div className="flex justify-start">
               <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex gap-2">
                 <span className="animate-bounce">●</span><span className="animate-bounce delay-100">●</span><span className="animate-bounce delay-200">●</span>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
       </div>

       <div className="p-4 bg-white border-t border-slate-200">
          <div className="flex gap-2">
             <input 
               className="flex-1 border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
               placeholder="Type here..."
               value={input}
               onChange={e => setInput(e.target.value)}
               onKeyDown={e => e.key === 'Enter' && handleSend()}
               disabled={loading}
             />
             <Button onClick={handleSend} disabled={loading || !input.trim()}>Send</Button>
          </div>
       </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                           SPEAKING PRACTICE VIEW                           */
/* -------------------------------------------------------------------------- */

const SpeakingPracticeView: React.FC<{
    user: UserProfile;
    onBack: () => void;
}> = ({ user, onBack }) => {
    const [scenario, setScenario] = useState<SpeakingScenarioData | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [feedback, setFeedback] = useState<SpeakingFeedback | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const loadScenario = async () => {
        setFeedback(null);
        const data = await generateSpeakingSentence("Random", user.level, user.language);
        setScenario(data);
    };

    useEffect(() => { loadScenario(); }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            chunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.start();
            setIsRecording(true);
        } catch (e) {
            alert("Microphone access denied or not available.");
        }
    };

    const stopRecording = async () => {
        if (!mediaRecorderRef.current) return;
        
        mediaRecorderRef.current.onstop = async () => {
            const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
            setIsRecording(false);
            setAnalyzing(true);
            
            try {
                const base64 = await blobToBase64(blob);
                const result = await evaluateSpeaking(base64, scenario?.prompt || "", user.language);
                setFeedback(result);
            } catch (e) {
                console.error(e);
            } finally {
                setAnalyzing(false);
                // Stop all tracks
                mediaRecorderRef.current?.stream.getTracks().forEach(t => t.stop());
            }
        };
        
        mediaRecorderRef.current.stop();
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 relative">
             <button onClick={onBack} className="absolute top-6 left-6 text-slate-400 hover:text-white">✕ Exit</button>
             
             {scenario ? (
                 <div className="max-w-lg w-full text-center space-y-8">
                     <div className="space-y-4">
                         <h2 className="text-3xl font-bold leading-tight">"{scenario.prompt}"</h2>
                         <p className="text-slate-400 text-lg">{scenario.subText}</p>
                     </div>

                     <div className="h-64 flex items-center justify-center">
                        {analyzing ? (
                            <div className="animate-pulse text-indigo-400">Analyzing your pronunciation...</div>
                        ) : feedback ? (
                            <div className={`bg-slate-800 p-6 rounded-2xl border ${feedback.isCorrect ? 'border-green-500' : 'border-amber-500'} text-left w-full`}>
                                <div className="font-bold mb-2 flex items-center gap-2">
                                    {feedback.isCorrect ? '✅ Excellent!' : '⚠️ Needs Improvement'}
                                </div>
                                <p className="text-slate-300 mb-2">You said: "{feedback.transcription}"</p>
                                <p className="text-sm text-slate-400 mb-4">{feedback.feedback}</p>
                                {feedback.mispronouncedWords.length > 0 && (
                                    <div className="text-xs text-red-300">
                                        Check: {feedback.mispronouncedWords.join(", ")}
                                    </div>
                                )}
                                <div className="mt-4 flex gap-2">
                                   <Button size="sm" onClick={() => setFeedback(null)} variant="secondary">Try Again</Button>
                                   <Button size="sm" onClick={loadScenario}>Next Sentence</Button>
                                </div>
                            </div>
                        ) : (
                            <button 
                                onClick={isRecording ? stopRecording : startRecording}
                                className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl transition-all ${isRecording ? 'bg-red-500 animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.5)]' : 'bg-indigo-600 hover:bg-indigo-500 shadow-xl'}`}
                            >
                                {isRecording ? '⏹' : '🎤'}
                            </button>
                        )}
                     </div>
                     {!feedback && !analyzing && <div className="text-slate-500">Tap microphone to speak</div>}
                 </div>
             ) : (
                 <div className="animate-spin text-4xl">⏳</div>
             )}
        </div>
    );
};

/* -------------------------------------------------------------------------- */
/*                           APP COMPONENT (MAIN)                             */
/* -------------------------------------------------------------------------- */

const App: React.FC = () => {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [view, setView] = useState<AppView>(AppView.WELCOME);
    const [viewParams, setViewParams] = useState<any>({});

    useEffect(() => {
        // Safe Version Check & Migration
        const savedVersion = getStoredVersion();
        
        if (savedVersion !== APP_VERSION) {
            console.log(`[App] Version mismatch (Old: ${savedVersion} vs New: ${APP_VERSION}). Clearing app-specific storage.`);
            
            // Only clear OUR keys, not the whole browser storage
            clearAppStorage(); 
            
            // Set new version
            setStoredVersion(APP_VERSION);
            
            // Reset user state in memory
            setUserProfile(null);
            setView(AppView.WELCOME);
        } else {
            // Check for saved user with Robust Error Handling
            const parsed = loadUserProfile();
            if (parsed) {
                 // MIGRATION LOGIC: Ensure new fields exist
                if (!parsed.learningStats) {
                    parsed.learningStats = { wordsLearned: 0, sentencesSpoken: 0, grammarPoints: 0 };
                }
                if (!Array.isArray(parsed.badges)) {
                    parsed.badges = [];
                }
                if (typeof parsed.streak !== 'number') {
                    parsed.streak = 1;
                }
                
                setUserProfile(parsed);
                setView(AppView.DASHBOARD);
            }
        }
    }, []);

    const handleLogin = (provider: string, lang: AppLanguage) => {
        const newUser: UserProfile = {
            name: "Learner",
            level: EnglishLevel.UNKNOWN,
            xp: 0,
            streak: 1,
            badges: [],
            titles: ["Novice"],
            vocabList: [],
            grammarList: [],
            isReturning: false,
            learningStats: { wordsLearned: 0, sentencesSpoken: 0, grammarPoints: 0 },
            language: lang
        };
        setUserProfile(newUser);
        saveUserProfile(newUser);
        
        // If unknown level, go to placement, else dashboard
        setView(AppView.LANDING);
    };

    const handleUpdateUser = (updated: UserProfile) => {
        setUserProfile(updated);
        saveUserProfile(updated);
    };

    const renderView = () => {
        switch (view) {
            case AppView.WELCOME:
                return <WelcomeView onStart={() => setView(AppView.LOGIN)} />;
            case AppView.LOGIN:
                return <LoginView onLogin={handleLogin} onSkip={(lang) => handleLogin('guest', lang)} />;
            case AppView.LANDING:
                 return <LandingView onStart={() => setView(AppView.PLACEMENT_TEST)} onSkip={() => setView(AppView.DASHBOARD)} />;
            case AppView.PLACEMENT_TEST:
                return userProfile ? <PlacementTestView 
                    lang={userProfile.language || 'en'}
                    onLangChange={(l) => handleUpdateUser({...userProfile, language: l})}
                    onComplete={(lvl) => {
                        handleUpdateUser({...userProfile, level: lvl});
                        setView(AppView.DASHBOARD);
                    }} 
                /> : null;
            case AppView.DASHBOARD:
                return userProfile ? <DashboardView 
                    user={userProfile} 
                    onNavigate={(v, p) => { setView(v); if(p) setViewParams(p); }} 
                    onLanguageChange={(l) => handleUpdateUser({...userProfile, language: l})}
                /> : null;
            case AppView.NEW_VOCAB:
                return userProfile ? <NewVocabView 
                    topic={viewParams.topic || "Daily Life"} 
                    level={viewParams.level || "B1"}
                    lang={userProfile.language || 'en'}
                    userVocab={userProfile.vocabList}
                    onLangChange={(l) => handleUpdateUser({...userProfile, language: l})}
                    onBack={() => setView(AppView.DASHBOARD)}
                    onSave={(w) => {
                        if (!userProfile.vocabList.some(v => v.word === w)) {
                            const newWord: VocabWord = { id: Date.now().toString(), word: w, definition: '', masteryLevel: 0, lastReviewed: new Date().toISOString() };
                            const updated = {
                                ...userProfile, 
                                vocabList: [...userProfile.vocabList, newWord],
                                learningStats: { ...userProfile.learningStats, wordsLearned: (userProfile.learningStats?.wordsLearned || 0) + 1 }
                            };
                            handleUpdateUser(updated);
                        }
                    }}
                /> : null;
            case AppView.WRITING_ASSISTANT:
                return userProfile ? <WritingAssistantView user={userProfile} onBack={() => setView(AppView.DASHBOARD)} /> : null;
            case AppView.SPEAKING_PRACTICE:
                return userProfile ? <SpeakingPracticeView user={userProfile} onBack={() => setView(AppView.DASHBOARD)} /> : null;
            case AppView.VOCAB_DRILL:
                return userProfile ? <VocabDrillView 
                    user={userProfile} 
                    onBack={() => setView(AppView.DASHBOARD)}
                    onLangChange={(l) => handleUpdateUser({...userProfile, language: l})}
                    onComplete={(word, newMastery) => {
                        const idx = userProfile.vocabList.findIndex(v => v.word === word);
                        if (idx >= 0) {
                            const updatedList = [...userProfile.vocabList];
                            // Use spread to ensure object immutability and trigger updates correctly
                            updatedList[idx] = { 
                                ...updatedList[idx], 
                                masteryLevel: newMastery, 
                                lastReviewed: new Date().toISOString() 
                            };
                            handleUpdateUser({ ...userProfile, vocabList: updatedList });
                        }
                    }}
                /> : null;
            case AppView.GRAMMAR_PRACTICE:
            case AppView.GRAMMAR_REVIEW:
                // Placeholder for features not yet implemented in detail
                return (
                    <div className="min-h-screen flex items-center justify-center flex-col gap-4 bg-slate-50">
                        <h2 className="text-xl font-bold">Coming Soon</h2>
                        <p className="text-slate-500">This feature is under development.</p>
                        <Button onClick={() => setView(AppView.DASHBOARD)}>Back</Button>
                    </div>
                );
            default:
                return userProfile ? <DashboardView user={userProfile} onNavigate={setView} onLanguageChange={(l) => handleUpdateUser({...userProfile, language: l})} /> : <WelcomeView onStart={() => setView(AppView.LOGIN)} />;
        }
    };

    return (
        <div className="app-container font-sans text-slate-900">
            {renderView()}
        </div>
    );
};

export default App;
