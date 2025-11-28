// --- App.tsx ---
import React, { useState, useEffect, useRef } from 'react';
import { AppView, UserProfile, EnglishLevel, VocabWord, PlacementQuestion, VocabDrillContent, SpeakingFeedback, NewVocabCard, GrammarQuestion, AppLanguage, GrammarPoint, LEARNING_TOPICS, CEFR_LEVELS } from './types';
import { generatePlacementTest, determineLevel, evaluateSpeaking, generateVocabDrill, getExplanation, generateNewVocab, generateGrammarExercise, generateGrammarRecallQuestions, generateSpeakingSentence } from './services/gemini';
import Button from './components/Button';
import BadgeDisplay from './components/BadgeDisplay';
import { blobToBase64 } from './utils/audioUtils';
import { translations } from './utils/translations';

/* -------------------------------------------------------------------------- */
/*                                WELCOME VIEW                                */
/* -------------------------------------------------------------------------- */

const WelcomeView: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const t = translations.en; // Default for welcome
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white to-slate-100 p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="z-10 text-center space-y-10 max-w-lg fade-in">
        
        {/* Animated Logo */}
        <div className="flex justify-center">
          <div className="relative w-32 h-32 float">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-[2rem] shadow-2xl rotate-3 flex items-center justify-center">
               <span className="text-6xl">🌊</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-[2rem] shadow-2xl -rotate-6 opacity-30 blur-sm -z-10"></div>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
            FluentFlow <span className="text-indigo-600">AI</span>
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
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const t = translations[lang];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'vi', name: 'Vietnamese (Tiếng Việt)' },
  ];

  const filteredLangs = languages.filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      
      {/* Language Selector */}
      <div className="absolute top-6 right-6 z-20">
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-all text-sm font-medium text-slate-700"
          >
            <span>🌐 {languages.find(l => l.code === lang)?.name}</span>
            <span>▼</span>
          </button>
          
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 p-2 fade-in">
              <input 
                type="text" 
                placeholder={t.searchLanguage} 
                className="w-full px-3 py-2 bg-slate-50 rounded-lg text-sm mb-2 border-transparent focus:bg-white focus:border-indigo-500 transition-all outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="max-h-48 overflow-y-auto space-y-1">
                {filteredLangs.map(l => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLang(l.code as AppLanguage);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-indigo-50 transition-all ${lang === l.code ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600'}`}
                  >
                    {l.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md z-10 fade-in text-center space-y-8">
        <div className="space-y-2">
          <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center text-3xl mb-4 shadow-lg shadow-indigo-200">
            🌊
          </div>
          <h1 className="text-3xl font-bold text-slate-800">FluentFlow AI</h1>
          <p className="text-slate-500">{t.loginTitle}</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => onLogin('google', lang)}
            className="w-full flex items-center justify-center gap-3 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all font-medium text-slate-700 bg-white"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
            {t.continueGoogle}
          </button>
          
          <button 
            onClick={() => onLogin('apple', lang)}
            className="w-full flex items-center justify-center gap-3 p-4 bg-black text-white rounded-xl hover:opacity-90 transition-all font-medium"
          >
            <img src="https://www.svgrepo.com/show/445205/apple.svg" className="w-5 h-5 invert" alt="Apple" />
            {t.continueApple}
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
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 relative overflow-hidden">
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

const PlacementTestView: React.FC<{ onComplete: (level: EnglishLevel) => void }> = ({ onComplete }) => {
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
    const isCorrect = idx === questions[currentIdx].correctAnswerIndex;
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
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
          {q.questionText}
        </h2>

        <div className="space-y-3">
          {q.options.map((opt, idx) => (
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
  defaultLevel: string;
}> = ({ isOpen, onClose, onSelect, title, defaultLevel }) => {
  const [selectedLevel, setSelectedLevel] = useState(defaultLevel);
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 fade-in">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800">✕</button>
        <h3 className="text-xl font-bold text-slate-800 mb-2 text-center">{title}</h3>
        
        {/* Level Selector */}
        <div className="mb-6 bg-slate-50 p-3 rounded-xl">
           <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Target Level</label>
           <div className="flex justify-between gap-1 overflow-x-auto">
             {CEFR_LEVELS.map(lvl => (
               <button
                 key={lvl}
                 onClick={() => setSelectedLevel(lvl)}
                 className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${selectedLevel === lvl ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
               >
                 {lvl}
               </button>
             ))}
           </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {LEARNING_TOPICS.map((t) => (
            <button 
              key={t}
              onClick={() => onSelect(t, selectedLevel)}
              className="p-3 rounded-xl border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all font-medium text-slate-600 text-left"
            >
              {t}
            </button>
          ))}
          <button 
            onClick={() => onSelect("Random", selectedLevel)}
            className="p-3 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/50 text-indigo-600 hover:bg-indigo-100 transition-all font-medium text-left col-span-2 text-center"
          >
             🎲 Surprise Me (Random)
          </button>
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const t = translations[user.language || 'en'];

  const handleTopicSelect = (topic: string, level: string) => {
    if (modalType === 'vocab') {
      onNavigate(AppView.NEW_VOCAB, { topic, level });
    } else if (modalType === 'grammar') {
      onNavigate(AppView.GRAMMAR_PRACTICE, { topic });
    }
    setModalType(null);
  };

  // Logic for Smart Suggestion
  let suggestionAction = { text: t.randomDrill, action: () => setModalType('vocab'), color: 'bg-indigo-100 text-indigo-700' };
  if (user.grammarList && user.grammarList.length > 0) {
    suggestionAction = { 
      text: `${t.fixWeakness}: ${user.grammarList[0].topic}`, 
      action: () => onNavigate(AppView.GRAMMAR_REVIEW),
      color: 'bg-red-100 text-red-700'
    };
  } else if (user.vocabList.length > 0 && user.vocabList.some(v => !v.lastReviewed)) {
    suggestionAction = {
      text: t.reviewVocab,
      action: () => onNavigate(AppView.VOCAB_DRILL),
      color: 'bg-emerald-100 text-emerald-700'
    };
  }

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'vi', name: 'Vietnamese' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 pb-24 relative">
      <TopicSelectionModal 
        isOpen={!!modalType} 
        onClose={() => setModalType(null)} 
        onSelect={handleTopicSelect} 
        title={modalType === 'vocab' ? t.discoverTitle : t.grammarTitle}
        defaultLevel={user.level !== EnglishLevel.UNKNOWN ? user.level : 'B1'}
      />

       {/* Language Selector (Persistent) */}
       <div className="absolute top-6 right-6 z-20">
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50 transition-all text-xs font-bold text-slate-700 uppercase"
          >
            <span>🌐 {user.language || 'EN'}</span>
            <span>▼</span>
          </button>
          
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 p-1 fade-in">
              {languages.map(l => (
                  <button
                    key={l.code}
                    onClick={() => {
                      onLanguageChange(l.code as AppLanguage);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-indigo-50 transition-all ${user.language === l.code ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600'}`}
                  >
                    {l.name}
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8 fade-in pt-8">
        
        {/* Header */}
        <header>
            <h1 className="text-3xl font-bold text-slate-900">{t.welcome}, {user.name} 👋</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-md font-medium border border-yellow-200">
                {user.titles[user.titles.length - 1] || 'Novice Learner'}
              </span>
              <span className="text-sm bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                Lvl: {user.level}
              </span>
            </div>
        </header>

        {/* Action Buttons (Fade In) */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
             <h3 className="font-semibold text-slate-800 text-lg animate-[fadeIn_0.5s_ease-out]">{t.whatToLearn}</h3>
             {/* Smart Suggestion Banner */}
             <button 
                onClick={suggestionAction.action}
                className={`text-xs px-3 py-1 rounded-full font-bold animate-[fadeIn_0.6s_ease-out] hover:opacity-80 transition-all ${suggestionAction.color}`}
             >
                {t.suggestion} {suggestionAction.text} &rarr;
             </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            
            <button 
              onClick={() => onNavigate(AppView.SPEAKING_PRACTICE)}
              className="group relative overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white text-left shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02] hover:shadow-indigo-300 animate-[fadeIn_0.6s_ease-out_fill-mode-backwards]"
            >
              <div className="absolute top-0 right-0 p-4 opacity-20 text-6xl rotate-12">🎤</div>
              <h4 className="text-xl font-bold mb-2">{t.shadowingTitle}</h4>
              <p className="text-indigo-100 text-sm mb-4">{t.shadowingDesc}</p>
              <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md">{t.startSession} &rarr;</span>
            </button>

            <button 
              onClick={() => setModalType('vocab')}
              className="group relative overflow-hidden bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl p-6 text-white text-left shadow-lg shadow-pink-200 transition-all hover:scale-[1.02] hover:shadow-pink-300 animate-[fadeIn_0.65s_ease-out_fill-mode-backwards]"
            >
              <div className="absolute top-0 right-0 p-4 opacity-20 text-6xl rotate-12">🔭</div>
              <h4 className="text-xl font-bold mb-2">{t.discoverTitle}</h4>
              <p className="text-pink-100 text-sm mb-4">{t.discoverDesc}</p>
              <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md">{t.explore} &rarr;</span>
            </button>

            <button 
              onClick={() => setModalType('grammar')}
              className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-600 rounded-3xl p-6 text-white text-left shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] hover:shadow-blue-300 animate-[fadeIn_0.7s_ease-out_fill-mode-backwards]"
            >
              <div className="absolute top-0 right-0 p-4 opacity-20 text-6xl rotate-12">⚖️</div>
              <h4 className="text-xl font-bold mb-2">{t.grammarTitle}</h4>
              <p className="text-blue-100 text-sm mb-4">{t.grammarDesc}</p>
              <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md">{t.practice} &rarr;</span>
            </button>

            <button 
              onClick={() => onNavigate(AppView.VOCAB_DRILL)}
              className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white text-left shadow-lg shadow-emerald-200 transition-all hover:scale-[1.02] hover:shadow-emerald-300 animate-[fadeIn_0.75s_ease-out_fill-mode-backwards]"
            >
              <div className="absolute top-0 right-0 p-4 opacity-20 text-6xl rotate-12">🧠</div>
              <h4 className="text-xl font-bold mb-2">{t.vocabRecallTitle}</h4>
              <p className="text-emerald-100 text-sm mb-4">{t.vocabRecallDesc}</p>
              <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md">{t.startDrill} &rarr;</span>
            </button>

            <button 
              onClick={() => onNavigate(AppView.GRAMMAR_REVIEW)}
              className="group relative overflow-hidden bg-gradient-to-br from-orange-500 to-amber-600 rounded-3xl p-6 text-white text-left shadow-lg shadow-orange-200 transition-all hover:scale-[1.02] hover:shadow-orange-300 animate-[fadeIn_0.78s_ease-out_fill-mode-backwards]"
            >
              <div className="absolute top-0 right-0 p-4 opacity-20 text-6xl rotate-12">🧱</div>
              <h4 className="text-xl font-bold mb-2">{t.grammarListTitle}</h4>
              <p className="text-orange-100 text-sm mb-4">{t.grammarListDesc}</p>
              <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md">{t.review} &rarr;</span>
            </button>

             <button 
              onClick={() => onNavigate(AppView.PROGRESS)}
              className="group relative overflow-hidden bg-white border-2 border-slate-200 rounded-3xl p-6 text-slate-800 text-left hover:border-blue-400 transition-all hover:scale-[1.01] animate-[fadeIn_0.8s_ease-out_fill-mode-backwards]"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 text-6xl rotate-12 text-slate-900">📈</div>
              <h4 className="text-xl font-bold mb-2">{t.progressTitle}</h4>
              <p className="text-slate-500 text-sm mb-4">{t.progressDesc}</p>
              <span className="inline-block bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold">{t.viewStats} &rarr;</span>
            </button>

          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-[fadeIn_1s_ease-out_fill-mode-backwards]">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="text-2xl mb-1">🔥</div>
            <div className="font-bold text-slate-800">{user.streak} Days</div>
            <div className="text-xs text-slate-400">{t.streak}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="text-2xl mb-1">🏅</div>
            <div className="font-bold text-slate-800">{user.badges.length}</div>
            <div className="text-xs text-slate-400">{t.badges}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
             <div className="text-2xl mb-1">📝</div>
             <div className="font-bold text-slate-800">{user.learningStats.wordsLearned}</div>
             <div className="text-xs text-slate-400">{t.wordsMastered}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
             <div className="text-2xl mb-1">🗣️</div>
             <div className="font-bold text-slate-800">{user.learningStats.sentencesSpoken}</div>
             <div className="text-xs text-slate-400">{t.sentencesSpoken}</div>
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
/*                            PROGRESS VIEW                                   */
/* -------------------------------------------------------------------------- */

const ProgressView: React.FC<{ user: UserProfile, onBack: () => void }> = ({ user, onBack }) => {
  const t = translations[user.language || 'en'];
  
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto space-y-8 fade-in">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-800 flex items-center gap-2">
          &larr; {t.back}
        </button>
        
        <h1 className="text-3xl font-bold text-slate-900">{t.progressTitle} 📈</h1>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold mb-4">Titles Earned</h2>
          <div className="flex flex-wrap gap-2">
            {user.titles.map((t, i) => (
              <span key={i} className="px-4 py-2 bg-gradient-to-r from-yellow-50 to-orange-50 text-orange-700 border border-orange-200 rounded-lg font-medium shadow-sm">
                {t}
              </span>
            ))}
            {user.titles.length === 0 && <span className="text-slate-400 italic">No titles yet. Keep learning!</span>}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold mb-4">{t.badges}</h2>
          <BadgeDisplay badges={user.badges} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold mb-2">Vocabulary</h2>
            <div className="text-4xl font-bold text-emerald-500">{user.learningStats.wordsLearned}</div>
            <p className="text-slate-500">{t.wordsMastered}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold mb-2">Speaking</h2>
            <div className="text-4xl font-bold text-indigo-500">{user.learningStats.sentencesSpoken}</div>
            <p className="text-slate-500">{t.sentencesSpoken}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                            GRAMMAR REVIEW VIEW                             */
/* -------------------------------------------------------------------------- */

const GrammarReviewView: React.FC<{
  user: UserProfile;
  onBack: () => void;
  onRecall: (point: GrammarPoint) => void;
}> = ({ user, onBack, onRecall }) => {
  const t = translations[user.language || 'en'];
  
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6 fade-in">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-800 flex items-center gap-2">
          &larr; {t.back}
        </button>
        
        <h1 className="text-3xl font-bold text-slate-900">{t.grammarListTitle} 🧱</h1>
        <p className="text-slate-500">{t.grammarListDesc}</p>

        {user.grammarList.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border-dashed border-2 border-slate-200">
            <span className="text-4xl block mb-2">🎉</span>
            <p className="text-slate-600 font-medium">No weak points found!</p>
            <p className="text-sm text-slate-400">Practice Grammar Guru to find areas to improve.</p>
          </div>
        ) : (
          <div className="space-y-4">
             {user.grammarList.map(point => (
               <div key={point.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-orange-200 transition-all">
                 <div>
                   <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded uppercase">{point.topic}</span>
                   <p className="text-slate-800 font-medium mt-2">{point.rule}</p>
                   <p className="text-xs text-slate-400 mt-1">Proficiency: {point.proficiency}/3</p>
                 </div>
                 <Button onClick={() => onRecall(point)} className="bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200">
                   {t.startDrill}
                 </Button>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                          GRAMMAR RECALL VIEW                               */
/* -------------------------------------------------------------------------- */

const GrammarRecallView: React.FC<{
  point: GrammarPoint;
  lang: AppLanguage;
  onBack: () => void;
  onSuccess: (pointId: string) => void;
}> = ({ point, lang, onBack, onSuccess }) => {
  const [questions, setQuestions] = useState<GrammarQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [failed, setFailed] = useState(false);
  const t = translations[lang];

  useEffect(() => {
    generateGrammarRecallQuestions(point.topic, point.rule, lang).then(qs => {
      setQuestions(qs);
      setLoading(false);
    });
  }, [point]);

  const handleAnswer = (idx: number) => {
    const q = questions[currentIdx];
    if (idx !== q.correctIndex) {
      setFailed(true);
      setStep('result');
    } else {
      if (currentIdx + 1 < questions.length) {
        setCurrentIdx(prev => prev + 1);
      } else {
        setFailed(false);
        setStep('result');
        onSuccess(point.id);
      }
    }
  };

  if (loading) {
     return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin text-4xl text-orange-500">🧱</div></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl p-8 space-y-6 fade-in relative">
        <button onClick={onBack} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800">✕</button>

        {step === 'intro' && (
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">{t.recallIntro}</h2>
            <div className="p-4 bg-orange-50 rounded-xl text-left border border-orange-100">
               <h3 className="font-bold text-orange-800 text-sm uppercase mb-2">{t.ruleRefresher}</h3>
               <p className="text-slate-700">{point.rule}</p>
            </div>
            <p className="text-slate-600">{t.recallDesc}</p>
            <Button onClick={() => setStep('quiz')} className="w-full bg-orange-500 hover:bg-orange-600">{t.startGauntlet}</Button>
          </div>
        )}

        {step === 'quiz' && questions[currentIdx] && (
          <div className="space-y-6 animate-[fadeIn_0.3s]">
             <div className="flex justify-between items-center text-sm text-slate-400">
               <span>Question {currentIdx + 1}/{questions.length}</span>
               <div className="flex gap-1">
                 {questions.map((_, i) => (
                   <div key={i} className={`w-2 h-2 rounded-full ${i <= currentIdx ? 'bg-orange-500' : 'bg-slate-200'}`}></div>
                 ))}
               </div>
             </div>
             <h3 className="text-xl font-medium text-slate-800 text-center">{questions[currentIdx].question}</h3>
             <div className="space-y-3">
               {questions[currentIdx].options.map((opt, i) => (
                 <button key={i} onClick={() => handleAnswer(i)} className="w-full p-4 rounded-xl border-2 border-slate-100 hover:border-orange-500 hover:bg-orange-50 text-left transition-all">
                   {opt}
                 </button>
               ))}
             </div>
          </div>
        )}

        {step === 'result' && (
          <div className="text-center space-y-6 animate-[fadeIn_0.3s]">
            <div className="text-6xl">{failed ? '💥' : '🎉'}</div>
            <h2 className="text-2xl font-bold text-slate-800">{failed ? t.incorrect : t.correct}</h2>
            <p className="text-slate-600">{failed ? t.gauntletFail : t.gauntletSuccess}</p>
            <Button onClick={onBack} className="w-full">{t.back}</Button>
          </div>
        )}
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
  onBack: () => void; 
  onSave: (word: string) => void;
}> = ({ topic, level, lang, onBack, onSave }) => {
  const [card, setCard] = useState<NewVocabCard | null>(null);
  const [loading, setLoading] = useState(true);
  const t = translations[lang];

  const fetchNewWord = async () => {
    setLoading(true);
    const data = await generateNewVocab(topic, level, lang);
    setCard(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchNewWord();
  }, [topic, level]);

  const playPronunciation = (text: string) => {
    const u = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 space-y-6 fade-in relative">
        <button onClick={onBack} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800">✕</button>
        <div className="flex items-center gap-2">
           <span className="text-xs font-bold uppercase tracking-wider text-pink-500 bg-pink-50 px-3 py-1 rounded-full">
            {topic}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {level}
          </span>
        </div>

        {loading || !card ? (
          <div className="py-20 flex justify-center"><div className="animate-spin text-4xl text-pink-400">🔭</div></div>
        ) : (
          <>
            <div className="text-center space-y-2">
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
              <Button onClick={() => onSave(card.word)} variant="secondary">{t.save}</Button>
              <Button onClick={fetchNewWord} className="bg-gradient-to-r from-pink-500 to-rose-500">{t.next} &rarr;</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                          GRAMMAR VIEW                                      */
/* -------------------------------------------------------------------------- */

const GrammarView: React.FC<{
  topic: string;
  lang: AppLanguage;
  onBack: () => void;
  onComplete: (correct: boolean, explanation: string, rule: string) => void;
}> = ({ topic, lang, onBack, onComplete }) => {
  const [question, setQuestion] = useState<GrammarQuestion | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const t = translations[lang];

  const fetchQuestion = async () => {
    setLoading(true);
    setSelectedIdx(null);
    const q = await generateGrammarExercise(topic, lang);
    setQuestion(q);
    setLoading(false);
  };

  useEffect(() => {
    fetchQuestion();
  }, [topic]);

  const handleSelect = (idx: number) => {
    if (selectedIdx !== null) return;
    setSelectedIdx(idx);
    if (question) {
       // Extract a simple rule from explanation or use the explanation itself
       onComplete(idx === question.correctIndex, question.explanation, question.explanation);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl p-8 space-y-6 fade-in relative">
        <button onClick={onBack} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800">✕</button>
        <span className="text-xs font-bold uppercase tracking-wider text-blue-500 bg-blue-50 px-3 py-1 rounded-full">
           Grammar: {topic}
        </span>

        {loading || !question ? (
          <div className="py-20 flex justify-center"><div className="animate-spin text-4xl text-blue-400">⚖️</div></div>
        ) : (
          <>
            <h2 className="text-2xl font-semibold text-slate-800 leading-relaxed text-center">
              {question.question}
            </h2>

            <div className="space-y-3">
              {question.options.map((opt, idx) => {
                let statusClass = "border-slate-100 hover:border-blue-500 hover:bg-blue-50";
                if (selectedIdx !== null) {
                  if (idx === question.correctIndex) statusClass = "border-green-500 bg-green-50 text-green-700 font-bold";
                  else if (idx === selectedIdx) statusClass = "border-red-500 bg-red-50 text-red-700";
                  else statusClass = "border-slate-100 opacity-50";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={selectedIdx !== null}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all font-medium text-slate-700 ${statusClass}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {selectedIdx !== null && (
              <div className="animate-[fadeIn_0.3s]">
                <div className="p-4 bg-slate-100 rounded-xl text-slate-700 text-sm mb-4">
                  <span className="font-bold block mb-1">Explanation:</span>
                  {question.explanation}
                </div>
                {selectedIdx !== question.correctIndex && (
                  <div className="text-xs text-orange-500 font-bold mb-4 flex items-center gap-1">
                    <span>💾</span> {t.savedToGrammarList}
                  </div>
                )}
                <Button onClick={fetchQuestion} className="w-full bg-gradient-to-r from-blue-500 to-cyan-600">{t.next} &rarr;</Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                          VOCAB DRILL VIEW (WIZARD)                         */
/* -------------------------------------------------------------------------- */

const VocabDrillView: React.FC<{ 
  user: UserProfile; 
  onBack: () => void;
  onUpdateProgress: (wordId: string) => void; 
}> = ({ user, onBack, onUpdateProgress }) => {
  const [drillContent, setDrillContent] = useState<VocabDrillContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  
  // Drill State
  const [step, setStep] = useState(0); // 0: Study, 1: Meaning Quiz, 2: Translation Quiz, 3: Scramble Quiz, 4: Finish
  const [mistakeMade, setMistakeMade] = useState(false);
  const [explanation, setExplanation] = useState<{term: string, text: string} | null>(null);

  // Interaction States
  const [userScramble, setUserScramble] = useState<string[]>([]);
  const [quizSelection, setQuizSelection] = useState<number | null>(null);
  const [quizStatus, setQuizStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');

  const lang = user.language || 'en';
  const t = translations[lang];
  const wordToPractice = user.vocabList[currentWordIndex];

  useEffect(() => {
    if (wordToPractice) {
      setLoading(true);
      generateVocabDrill(wordToPractice.word, lang).then(data => {
        setDrillContent(data);
        resetDrillState();
        setLoading(false);
      });
    }
  }, [wordToPractice, lang]);

  const resetDrillState = () => {
    setStep(0);
    setMistakeMade(false);
    setUserScramble([]);
    setQuizSelection(null);
    setQuizStatus('idle');
    setExplanation(null);
  };

  const handleNextWord = () => {
    setCurrentWordIndex(prev => (prev + 1) % user.vocabList.length);
  };

  const handleExplanationRequest = async (term: string) => {
    if (!drillContent) return;
    const text = await getExplanation(term, `Drill for word: ${wordToPractice.word}`, lang);
    setExplanation({ term, text });
  };

  /* --- Step Handlers --- */

  // Step 1: Meaning Quiz
  const checkMeaningQuiz = (idx: number) => {
    if (!drillContent) return;
    setQuizSelection(idx);
    if (idx === drillContent.meaningQuiz.correctIndex) {
      setQuizStatus('correct');
    } else {
      setQuizStatus('incorrect');
      setMistakeMade(true);
    }
  };

  // Step 2 & 3: Scramble Handlers (Used for both Translation & Usage)
  const handleWordClick = (word: string) => {
    if (userScramble.includes(word)) {
      setUserScramble(prev => prev.filter(w => w !== word));
    } else {
      setUserScramble(prev => [...prev, word]);
    }
  };

  const checkScramble = (correctSentence: string) => {
    const userString = userScramble.join(' ');
    // Lenient check: ignore punctuation and case
    const normalize = (s: string) => s.toLowerCase().replace(/[.,!?;]/g, '').trim();
    const isCorrect = normalize(userString) === normalize(correctSentence);
    
    if (isCorrect) {
      setQuizStatus('correct');
    } else {
      setQuizStatus('incorrect');
      setMistakeMade(true);
    }
  };

  const nextStep = () => {
    setStep(prev => prev + 1);
    // Reset interaction states for next step
    setUserScramble([]);
    setQuizSelection(null);
    setQuizStatus('idle');
  };

  // Final Step Logic
  useEffect(() => {
    if (step === 4 && !mistakeMade && wordToPractice) {
      onUpdateProgress(wordToPractice.id);
    }
  }, [step, mistakeMade, wordToPractice]);

  if (user.vocabList.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Your list is empty!</h2>
        <Button onClick={onBack} className="mt-4">{t.back}</Button>
      </div>
    );
  }

  if (loading || !drillContent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin text-4xl text-emerald-500">🧠</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-20 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-lg p-6 space-y-6 fade-in relative min-h-[500px] flex flex-col">
        <button onClick={onBack} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800">✕</button>
        
        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full mb-4">
          <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${(step / 4) * 100}%` }}></div>
        </div>

        {/* STEP 0: STUDY */}
        {step === 0 && (
          <div className="flex-1 space-y-6 animate-[fadeIn_0.3s]">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">{t.drillIntro}</span>
              <h2 className="text-5xl font-bold text-slate-800">{drillContent.word}</h2>
              <div className="flex justify-center gap-2 mt-2">
                 {Object.entries(drillContent.wordForms).map(([form, val], i) => val && (
                   <span key={i} className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-xs">{form}: {val}</span>
                 ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-slate-700">📚 {t.contextUsage}</h3>
              <ul className="space-y-3">
                {drillContent.situations.map((sit, i) => (
                  <li key={i} className="p-3 bg-slate-50 rounded-lg text-slate-700 text-sm border-l-4 border-emerald-400">
                    <p className="font-medium">{sit.english}</p>
                    <p className="text-slate-500 text-xs mt-1">{sit.translation}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-auto pt-4">
               <Button onClick={nextStep} className="w-full">{t.startDrill} &rarr;</Button>
            </div>
          </div>
        )}

        {/* STEP 1: MEANING QUIZ */}
        {step === 1 && (
          <div className="flex-1 flex flex-col space-y-6 animate-[fadeIn_0.3s]">
            <h3 className="text-xl font-bold text-center">{t.meaningQuiz}</h3>
            <div className="text-center text-4xl font-bold text-indigo-600 mb-4">{drillContent.word}</div>
            
            <div className="space-y-3 flex-1">
              {drillContent.meaningQuiz.options.map((opt, idx) => {
                let statusClass = "border-slate-200 hover:bg-slate-50";
                if (quizSelection !== null) {
                  if (idx === drillContent.meaningQuiz.correctIndex) statusClass = "bg-green-100 border-green-500 text-green-800";
                  else if (idx === quizSelection) statusClass = "bg-red-100 border-red-500 text-red-800";
                  else statusClass = "opacity-50";
                }
                return (
                  <button 
                    key={idx} 
                    onClick={() => checkMeaningQuiz(idx)}
                    disabled={quizSelection !== null}
                    className={`w-full p-4 rounded-xl border-2 text-left font-medium transition-all ${statusClass}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            
            {quizStatus !== 'idle' && (
              <div className="mt-auto animate-[fadeIn_0.2s]">
                {quizStatus === 'incorrect' ? (
                   <div className="text-center text-red-500 mb-2">
                     {t.incorrect}. <span className="underline cursor-pointer font-bold" onClick={() => handleExplanationRequest(drillContent.word)}>{t.why}</span>
                   </div>
                ) : (
                   <div className="text-center text-green-500 mb-2 font-bold">{t.correct}</div>
                )}
                <Button onClick={nextStep} className="w-full">{t.next}</Button>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: TRANSLATION QUIZ */}
        {step === 2 && (
          <div className="flex-1 flex flex-col space-y-6 animate-[fadeIn_0.3s]">
            <h3 className="text-xl font-bold text-center">{t.translationQuiz}</h3>
            <div className="p-4 bg-indigo-50 rounded-xl text-center text-lg font-medium text-indigo-900 border border-indigo-100">
               "{drillContent.translationQuiz.nativeSentence}"
            </div>

            <div className="min-h-[60px] p-4 bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex flex-wrap gap-2 items-center justify-center">
              {userScramble.map((word, i) => (
                <button key={i} onClick={() => handleWordClick(word)} className="px-3 py-1 bg-white shadow-sm rounded-md border border-slate-200 text-slate-800 font-medium animate-[fadeIn_0.2s]">
                  {word}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
               {drillContent.translationQuiz.scrambledEnglish
                 .filter(w => !userScramble.includes(w) || drillContent.translationQuiz.scrambledEnglish.filter(sw => sw === w).length > userScramble.filter(uw => uw === w).length)
                 .map((word, i) => (
                   <button key={i} onClick={() => handleWordClick(word)} className="px-3 py-2 bg-white text-indigo-600 rounded-lg border border-indigo-100 shadow-sm hover:shadow-md font-medium transition-all">
                     {word}
                   </button>
                 ))}
            </div>

            <div className="mt-auto text-center">
               {quizStatus === 'idle' && (
                  <Button onClick={() => checkScramble(drillContent.translationQuiz.correctEnglish)} disabled={userScramble.length === 0} className="w-full">{t.check}</Button>
               )}
               {quizStatus !== 'idle' && (
                  <div className="space-y-2 animate-[fadeIn_0.2s]">
                     {quizStatus === 'correct' ? <div className="text-green-600 font-bold">{t.correct}</div> : <div className="text-red-500 font-bold">{t.incorrect}</div>}
                     {quizStatus === 'incorrect' && <div className="text-xs text-slate-400">Correct: {drillContent.translationQuiz.correctEnglish}</div>}
                     <Button onClick={nextStep} className="w-full">{t.next}</Button>
                  </div>
               )}
            </div>
          </div>
        )}

        {/* STEP 3: USAGE QUIZ */}
        {step === 3 && (
           <div className="flex-1 flex flex-col space-y-6 animate-[fadeIn_0.3s]">
           <h3 className="text-xl font-bold text-center">{t.usageQuiz}</h3>
           <div className="text-center text-slate-500 italic mb-2">"{drillContent.scrambleSentence.translation}"</div>

           <div className="min-h-[60px] p-4 bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex flex-wrap gap-2 items-center justify-center">
             {userScramble.map((word, i) => (
               <button key={i} onClick={() => handleWordClick(word)} className="px-3 py-1 bg-white shadow-sm rounded-md border border-slate-200 text-slate-800 font-medium animate-[fadeIn_0.2s]">
                 {word}
               </button>
             ))}
           </div>

           <div className="flex flex-wrap gap-2 justify-center">
              {drillContent.scrambleSentence.scrambled
                .filter(w => !userScramble.includes(w) || drillContent.scrambleSentence.scrambled.filter(sw => sw === w).length > userScramble.filter(uw => uw === w).length)
                .map((word, i) => (
                  <button key={i} onClick={() => handleWordClick(word)} className="px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 hover:bg-emerald-100 font-medium transition-all">
                    {word}
                  </button>
                ))}
           </div>

           <div className="mt-auto text-center">
              {quizStatus === 'idle' && (
                 <Button onClick={() => checkScramble(drillContent.scrambleSentence.correct)} disabled={userScramble.length === 0} className="w-full">{t.check}</Button>
              )}
              {quizStatus !== 'idle' && (
                 <div className="space-y-2 animate-[fadeIn_0.2s]">
                    {quizStatus === 'correct' ? <div className="text-green-600 font-bold">{t.correct}</div> : <div className="text-red-500 font-bold">{t.incorrect}</div>}
                    {quizStatus === 'incorrect' && <div className="text-xs text-slate-400">Correct: {drillContent.scrambleSentence.correct}</div>}
                    <Button onClick={nextStep} className="w-full">{t.next}</Button>
                 </div>
              )}
           </div>
         </div>
        )}

        {/* STEP 4: RESULT */}
        {step === 4 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 animate-[fadeIn_0.5s]">
            <div className="text-6xl">{!mistakeMade ? '🎉' : '💪'}</div>
            <h2 className="text-3xl font-bold text-slate-800">{t.drillComplete}</h2>
            <p className="text-lg text-slate-600 max-w-sm">
              {!mistakeMade ? t.drillSuccess : t.drillFail}
            </p>
            <Button onClick={handleNextWord} className="w-full">{t.next} Word &rarr;</Button>
          </div>
        )}

        {/* Interactive Explanation Modal */}
        {explanation && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex items-center justify-center p-6 rounded-3xl animate-[fadeIn_0.2s]">
            <div className="text-center space-y-4">
              <h4 className="text-lg font-bold text-slate-800">💡 {explanation.term}</h4>
              <p className="text-slate-600">{explanation.text}</p>
              <Button onClick={() => setExplanation(null)} variant="secondary" className="mt-4">{t.close}</Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                            SPEAKING PRACTICE VIEW                          */
/* -------------------------------------------------------------------------- */

const SpeakingView: React.FC<{ 
  user: UserProfile;
  onBack: () => void;
  onSaveWord: (word: string) => void;
  onSuccess: () => void;
}> = ({ user, onBack, onSaveWord, onSuccess }) => {
  const [targetSentence, setTargetSentence] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<SpeakingFeedback | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  
  // Topic State - Unified with Dashboard
  const topics = LEARNING_TOPICS;
  const [currentTopic, setCurrentTopic] = useState("Daily Life");

  // Audio Visualizer State
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const lang = user.language || 'en';
  const t = translations[lang];
  const guidanceMode = attempts >= 2;

  // Fetch sentence on mount or topic change
  useEffect(() => {
    fetchNewSentence();
  }, [currentTopic]);

  const fetchNewSentence = async () => {
    setTargetSentence("Loading...");
    const s = await generateSpeakingSentence(currentTopic, user.level, lang);
    setTargetSentence(s);
    setAttempts(0);
    setFeedback(null);
  };

  const startVisualizer = (stream: MediaStream) => {
    if (!canvasRef.current) return;
    
    // Init Audio Context
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    const source = audioCtx.createMediaStreamSource(stream);
    
    source.connect(analyser);
    analyser.fftSize = 256;
    
    audioContextRef.current = audioCtx;
    analyserRef.current = analyser;
    sourceRef.current = source;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      // Circular Visualization Logic
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 45; // Base radius of the button
      
      // Calculate average volume for pulse effect
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      const pulse = 1 + (average / 256) * 0.3; // Scale 1.0 to 1.3

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.scale(pulse, pulse);

      // Draw dynamic wave ring
      ctx.beginPath();
      ctx.arc(0, 0, radius + 5, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.5)'; // Indigo-500 with opacity
      ctx.lineWidth = 4;
      ctx.stroke();

      // Draw secondary outer ring based on frequency chunks
      ctx.beginPath();
      for (let i = 0; i < bufferLength; i += 10) { // Skip chunks for performance
         const v = dataArray[i] / 128.0;
         const angle = (i / bufferLength) * Math.PI * 2;
         const r = radius + 10 + (v * 10);
         const x = Math.cos(angle) * r;
         const y = Math.sin(angle) * r;
         if (i === 0) ctx.moveTo(x, y);
         else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)'; // Purple
      ctx.stroke();
      
      ctx.restore();
    };

    draw();
  };

  const stopVisualizer = () => {
    cancelAnimationFrame(animationRef.current);
    if (sourceRef.current) sourceRef.current.disconnect();
    if (audioContextRef.current) audioContextRef.current.close();
    // Clear canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      startVisualizer(stream); // Start Viz
      
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      let chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        stopVisualizer(); // Stop Viz
        
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setProcessing(true);
        const base64 = await blobToBase64(blob);
        const result = await evaluateSpeaking(base64, targetSentence, lang);
        setFeedback(result);
        setProcessing(false);
        if (!result.isCorrect) setAttempts(prev => prev + 1);
        else {
          setAttempts(0); // Reset
          onSuccess();
        }
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setFeedback(null);
    } catch (err) {
      alert("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const playWord = (word: string) => {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const playSentence = () => {
    const utterance = new SpeechSynthesisUtterance(targetSentence);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="p-4 border-b bg-white flex justify-between items-center z-10 relative">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-800 flex items-center gap-2">
          &larr; {t.quit}
        </button>
        <div className="flex gap-2 overflow-x-auto no-scrollbar max-w-[60%] mask-linear-fade">
           {topics.map(topic => (
             <button
               key={topic}
               onClick={() => setCurrentTopic(topic)}
               className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold transition-all ${currentTopic === topic ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
             >
               {topic}
             </button>
           ))}
        </div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8 max-w-2xl mx-auto w-full pb-32">
        
        <div className="w-full text-center space-y-6">
          
          {guidanceMode ? (
            <div className="fade-in space-y-6">
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl inline-block text-orange-800 text-sm font-medium">
                Let's break it down. Click each word to listen.
              </div>
              
              <div className="flex flex-wrap justify-center gap-4">
                {targetSentence.split(' ').map((word, i) => (
                  <button 
                    key={i} 
                    onClick={() => playWord(word)}
                    className="flex flex-col items-center p-4 bg-white rounded-xl shadow-md border-2 border-slate-100 hover:border-indigo-400 transition-all active:scale-95 group"
                  >
                    <span className="text-xl font-bold text-slate-800 mb-1">{word}</span>
                    <span className="text-xs text-slate-400 group-hover:text-indigo-500">Tap 🔊</span>
                    {feedback?.phoneticGuidance?.[word] && (
                       <span className="text-xs text-indigo-500 font-mono mt-1 px-2 py-0.5 bg-indigo-50 rounded">
                         {feedback.phoneticGuidance[word]}
                       </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="pt-8">
                 <Button onClick={() => setAttempts(0)} variant="outline">
                   {t.returnToSentence}
                 </Button>
              </div>
            </div>
          ) : (
            <div className="fade-in flex flex-col items-center gap-4">
              <h2 className={`text-3xl md:text-5xl font-bold text-slate-800 leading-tight transition-all ${targetSentence === "Loading..." ? 'opacity-50 blur-sm' : 'opacity-100'}`}>
                "{targetSentence}"
              </h2>
              
              <button 
                onClick={playSentence}
                disabled={targetSentence === "Loading..."}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors font-semibold text-sm disabled:opacity-50"
              >
                <span>🔊 {t.preview}</span>
              </button>
            </div>
          )}
        </div>

        {!guidanceMode && feedback && (
          <div className={`w-full p-6 rounded-2xl border-l-4 fade-in ${feedback.isCorrect ? 'bg-green-50 border-green-500' : 'bg-orange-50 border-orange-500'}`}>
            <h3 className={`font-bold mb-2 ${feedback.isCorrect ? 'text-green-700' : 'text-orange-700'}`}>
              {feedback.isCorrect ? t.correct : t.tryAgain}
            </h3>
            <p className="text-slate-700 mb-2">{feedback.feedback}</p>
            
            {!feedback.isCorrect && feedback.mispronouncedWords.length > 0 && (
               <div className="mt-3">
                 <p className="text-xs font-bold text-slate-500 uppercase mb-2">{t.trickyWords}</p>
                 <div className="flex flex-wrap gap-2">
                   {feedback.mispronouncedWords.map((word: string, i: number) => (
                     <button 
                      key={i} 
                      onClick={() => onSaveWord(word)}
                      className="px-3 py-1 bg-white border border-orange-200 rounded-full text-sm text-orange-700 hover:bg-orange-100 flex items-center gap-1 transition-colors"
                     >
                       {word} <span className="text-xs opacity-50 ml-1">+Save</span>
                     </button>
                   ))}
                 </div>
               </div>
            )}
            
            <p className="text-xs text-slate-400 mt-4 font-mono truncate">You said: {feedback.transcription}</p>
          </div>
        )}

        {!guidanceMode && (
          <div className="fixed bottom-10 left-0 right-0 flex flex-col items-center gap-6">
             
             {/* Main Record Button & Visualizer Container */}
             <div className="relative flex items-center justify-center">
                {/* Visualizer Canvas */}
                <canvas 
                  ref={canvasRef} 
                  width={200} 
                  height={200} 
                  className="absolute pointer-events-none" 
                  style={{ zIndex: 0 }}
                />

                <Button 
                  onClick={isRecording ? stopRecording : startRecording}
                  variant={isRecording ? 'danger' : 'primary'}
                  isLoading={processing}
                  disabled={targetSentence === "Loading..."}
                  className={`rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 relative z-10 ${isRecording ? 'w-24 h-24' : 'w-20 h-20'}`}
                >
                  {isRecording ? (
                    <div className="w-8 h-8 bg-white rounded-sm animate-pulse"></div>
                  ) : (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                  )}
                </Button>
             </div>
             
             <div className="flex flex-col items-center gap-2">
                <p className="text-sm text-slate-400 font-medium">{isRecording ? t.listening : t.tapToSpeak}</p>
                
                {/* Skip/Next Button */}
                <button 
                  onClick={fetchNewSentence} 
                  className="text-slate-400 hover:text-slate-600 text-sm font-semibold flex items-center gap-1 mt-2 transition-colors"
                >
                  {t.next} &rarr;
                </button>
             </div>

          </div>
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                               MAIN APP                                     */
/* -------------------------------------------------------------------------- */

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.WELCOME); // Start with WELCOME by default
  const [viewParams, setViewParams] = useState<any>(null); // To pass data like 'topic'
  const [user, setUser] = useState<UserProfile>({
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
    language: 'en'
  });

  // Check login state on mount
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('fluent_auth') === 'true';
    if (isLoggedIn) {
      const savedUser = localStorage.getItem('fluent_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
        setView(AppView.DASHBOARD);
      } else {
        setView(AppView.LANDING);
      }
    } else {
      // If not logged in, stick with WELCOME which is the default
      setView(AppView.WELCOME);
    }
  }, []);

  const saveUser = (u: UserProfile) => {
    setUser(u);
    localStorage.setItem('fluent_user', JSON.stringify(u));
  };

  const handleLogin = (provider: 'google' | 'apple', lang: AppLanguage) => {
    // Mock login logic
    localStorage.setItem('fluent_auth', 'true');
    const savedUser = localStorage.getItem('fluent_user');
    if (savedUser) {
       const u = JSON.parse(savedUser);
       // Update language preference if they changed it at login
       u.language = lang;
       saveUser(u);
       setView(AppView.DASHBOARD);
    } else {
       // New user flow, but preserve language selection
       setUser(prev => ({ ...prev, language: lang }));
       setView(AppView.LANDING);
    }
  };

  const handleSkipToDashboard = (lang: AppLanguage) => {
    const existingUser = localStorage.getItem('fluent_user');
    if (!existingUser) {
        const guestUser: UserProfile = {
            name: "Guest Learner",
            level: EnglishLevel.B1, 
            xp: 0,
            streak: 0,
            badges: [],
            titles: [],
            vocabList: [],
            grammarList: [],
            isReturning: true,
            learningStats: { wordsLearned: 0, sentencesSpoken: 0, grammarPoints: 0 },
            language: lang
        };
        saveUser(guestUser);
    } else {
        // If user exists but skipped login screen (session restoration), ensure lang is updated
        const u = JSON.parse(existingUser);
        u.language = lang;
        saveUser(u);
    }
    localStorage.setItem('fluent_auth', 'true');
    setView(AppView.DASHBOARD);
  };

  const handleNavigate = (v: AppView, params?: any) => {
    setViewParams(params);
    setView(v);
  }

  const handlePlacementComplete = (level: EnglishLevel) => {
    const updatedUser = { 
      ...user, 
      name: "User", // Could be populated from auth
      level, 
      isReturning: true,
      badges: [...user.badges, { id: Date.now().toString(), name: 'Assessed', icon: '🎯', description: 'Completed placement test', earnedDate: new Date().toISOString() }] 
    };
    saveUser(updatedUser);
    setView(AppView.DASHBOARD);
  };

  const handleSaveWord = (word: string) => {
    const cleanWord = word.replace(/[.,!?]/g, '').toLowerCase();
    if (!user.vocabList.find(v => v.word === cleanWord)) {
      const newWord: VocabWord = {
        id: Date.now().toString(),
        word: cleanWord,
        definition: '',
        masteryLevel: 0
      };
      const updatedUser = { 
        ...user, 
        vocabList: [...user.vocabList, newWord],
      };
      saveUser(updatedUser);
      alert(`Saved "${cleanWord}"!`);
    }
  };

  const handleUpdateVocabMastery = (wordId: string) => {
    const updatedList = user.vocabList.map(w => {
      if (w.id === wordId) return { ...w, masteryLevel: Math.min(w.masteryLevel + 1, 5), lastReviewed: new Date().toISOString() };
      return w;
    });

    // Only increment 'wordsLearned' stat if it was the first time maxing it out or just a general learning increment?
    // User requirement: "Words Mastered, only count when user complete all steps of vocab drill correctly."
    // So we just increment the counter every time a drill is perfect.
    const newWordsLearnedCount = user.learningStats.wordsLearned + 1;

    const updatedUser = {
      ...user,
      vocabList: updatedList,
      learningStats: { ...user.learningStats, wordsLearned: newWordsLearnedCount }
    };

    if (newWordsLearnedCount >= 10 && !updatedUser.titles.includes("Word Collector")) {
      updatedUser.titles.push("Word Collector");
      updatedUser.badges.push({ id: Date.now().toString(), name: 'Collector', icon: '📚', description: 'Saved & Mastered 10 words', earnedDate: new Date().toISOString() });
    }
    saveUser(updatedUser);
  };

  const handleSpeakingSuccess = () => {
    const updatedUser = {
      ...user,
      xp: user.xp + 20,
      learningStats: { ...user.learningStats, sentencesSpoken: user.learningStats.sentencesSpoken + 1 }
    };
     if (updatedUser.learningStats.sentencesSpoken >= 5 && !updatedUser.titles.includes("Orator")) {
      updatedUser.titles.push("Orator");
      updatedUser.badges.push({ id: Date.now().toString(), name: 'Speaker', icon: '🗣️', description: '5 sentences mastered', earnedDate: new Date().toISOString() });
    }
    saveUser(updatedUser);
  };

  // Handles completion of a single Grammar Question (Grammar Guru)
  const handleGrammarComplete = (correct: boolean, explanation: string, rule: string) => {
    if (correct) {
      const updatedUser = {
        ...user,
        learningStats: { ...user.learningStats, grammarPoints: user.learningStats.grammarPoints + 1 }
      };
      if (updatedUser.learningStats.grammarPoints >= 5 && !updatedUser.titles.includes("Grammar Guru")) {
        updatedUser.titles.push("Grammar Guru");
        updatedUser.badges.push({ id: Date.now().toString(), name: 'Guru', icon: '⚖️', description: 'Mastered 5 grammar rules', earnedDate: new Date().toISOString() });
      }
      saveUser(updatedUser);
    } else {
      // Logic: Save incorrect grammar point to list
      // Extract a simplified topic from viewParams if available, or just generic 'Grammar'
      const topic = viewParams?.topic || 'General';
      const alreadySaved = user.grammarList.some(g => g.rule === rule);
      
      if (!alreadySaved) {
        const newPoint: GrammarPoint = {
          id: Date.now().toString(),
          topic: topic,
          rule: rule, // In a real app, maybe summarize the rule better
          proficiency: 0
        };
        const updatedUser = { ...user, grammarList: [...user.grammarList, newPoint] };
        saveUser(updatedUser);
      }
    }
  }

  // Handles completion of Grammar Recall (The Gauntlet)
  const handleRecallSuccess = (pointId: string) => {
    // Remove from list or mark mastered? Let's remove for now.
    const updatedList = user.grammarList.filter(p => p.id !== pointId);
    saveUser({ ...user, grammarList: updatedList });
    setView(AppView.GRAMMAR_REVIEW);
  };

  const handleLanguageChange = (lang: AppLanguage) => {
     const updatedUser = { ...user, language: lang };
     saveUser(updatedUser);
  };

  return (
    <div className="antialiased text-slate-800">
      {view === AppView.WELCOME && (
        <WelcomeView onStart={() => setView(AppView.LOGIN)} />
      )}

      {view === AppView.LOGIN && (
        <LoginView 
          onLogin={handleLogin} 
          onSkip={handleSkipToDashboard}
        />
      )}

      {view === AppView.LANDING && (
        <LandingView 
          onStart={() => setView(AppView.PLACEMENT_TEST)} 
          onSkip={() => handleSkipToDashboard(user.language || 'en')}
        />
      )}
      
      {view === AppView.PLACEMENT_TEST && (
        <PlacementTestView onComplete={handlePlacementComplete} />
      )}

      {view === AppView.DASHBOARD && (
        <DashboardView 
          user={user} 
          onNavigate={handleNavigate} 
          onLanguageChange={handleLanguageChange}
        />
      )}

      {view === AppView.PROGRESS && (
        <ProgressView user={user} onBack={() => setView(AppView.DASHBOARD)} />
      )}

      {view === AppView.NEW_VOCAB && (
        <NewVocabView 
          topic={viewParams?.topic || 'Random'} 
          level={viewParams?.level || 'B1'}
          lang={user.language || 'en'}
          onBack={() => setView(AppView.DASHBOARD)} 
          onSave={handleSaveWord}
        />
      )}

      {view === AppView.GRAMMAR_PRACTICE && (
        <GrammarView 
          topic={viewParams?.topic || 'Random'} 
          lang={user.language || 'en'}
          onBack={() => setView(AppView.DASHBOARD)}
          onComplete={handleGrammarComplete}
        />
      )}

       {view === AppView.GRAMMAR_REVIEW && (
        <GrammarReviewView 
          user={user} 
          onBack={() => setView(AppView.DASHBOARD)} 
          onRecall={(point) => handleNavigate(AppView.GRAMMAR_RECALL, { point })}
        />
      )}

      {view === AppView.GRAMMAR_RECALL && viewParams?.point && (
        <GrammarRecallView 
          point={viewParams.point}
          lang={user.language || 'en'}
          onBack={() => setView(AppView.GRAMMAR_REVIEW)}
          onSuccess={handleRecallSuccess}
        />
      )}

      {view === AppView.SPEAKING_PRACTICE && (
        <SpeakingView 
          user={user}
          onBack={() => setView(AppView.DASHBOARD)} 
          onSaveWord={handleSaveWord}
          onSuccess={handleSpeakingSuccess}
        />
      )}

      {view === AppView.VOCAB_DRILL && (
        <VocabDrillView 
          user={user} 
          onBack={() => setView(AppView.DASHBOARD)}
          onUpdateProgress={handleUpdateVocabMastery}
        />
      )}
    </div>
  );
};

export default App;