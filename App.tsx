import React, { useState, useEffect } from 'react';
import { AppView, UserProfile, EnglishLevel, PlacementQuestion, AppLanguage } from './types';
import { generatePlacementTest, determineLevel } from './services/content';
import { translations } from './utils/translations';
import { loadUserProfile, saveUserProfile } from './utils/storage';
import { viewRegistry } from './navigation/viewRegistry';

/* -------------------------------------------------------------------------- */
/*                                WELCOME VIEW                                */
/* -------------------------------------------------------------------------- */
const WelcomeView: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const t = translations.en;
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-white p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-200/40 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="z-10 text-center space-y-10 max-w-lg fade-in">
        <div className="flex justify-center">
          <div className="relative w-32 h-32 float">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-[2rem] shadow-2xl rotate-3 flex items-center justify-center">
               <span className="text-6xl">🌊</span>
            </div>
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
        </button>
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
  const lang: AppLanguage = 'vi';
  const t = translations[lang];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-800 p-6 relative overflow-hidden">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md z-10 fade-in text-center space-y-8">
        <h1 className="text-3xl font-bold text-slate-800">FluentFlow AI</h1>
        <p className="text-slate-500">{t.loginTitle}</p>
        <div className="space-y-4">
          <button onClick={() => onLogin('google', lang)} className="w-full p-3.5 border rounded-xl hover:bg-slate-50">{t.continueGoogle}</button>
          <button onClick={() => onSkip(lang)} className="text-slate-400 hover:text-slate-600 text-sm">{t.skipGuest}</button>
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
      <div className="z-10 text-center max-w-lg space-y-8 fade-in w-full">
        <h1 className="text-3xl font-bold mb-2">FluentFlow AI</h1>
        <p className="text-indigo-200 text-lg">Chọn tình trạng tiếng Anh của bạn:</p>
        <div className="space-y-4 pt-4">
           <button onClick={onPreA0} className="w-full p-6 text-left border-2 rounded-2xl bg-amber-50 border-amber-400 text-amber-900">
              <div className="text-xl font-bold mb-2">TÔI KHÔNG BIẾT TIẾNG ANH</div>
              <div className="text-base font-normal">Tôi gần như mới bắt đầu từ con số 0.</div>
           </button>
           <button onClick={onStandard} className="w-full p-4 text-left border border-white/20 rounded-xl bg-white/10 text-white">
              <div className="font-bold text-lg mb-1">Tôi đã từng học tiếng Anh</div>
           </button>
        </div>
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
}> = ({ onComplete }) => {
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
    const isCorrect = q.options[idx] === q.correct;
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

  if (loading && questions.length === 0) return <div>Loading...</div>;
  const q = questions[currentIdx];
  if (!q) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl p-8 space-y-8">
        <h2 className="text-2xl font-semibold text-slate-800">{q.question}</h2>
        <div className="space-y-3">
          {q.options?.map((opt, idx) => (
            <button key={idx} onClick={() => handleAnswer(idx)} className="w-full text-left p-4 rounded-xl border-2 hover:bg-indigo-50">{opt}</button>
          ))}
        </div>
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

  if (view === AppView.WELCOME) {
    return <WelcomeView onStart={() => setView(AppView.LOGIN)} />;
  }
  if (view === AppView.LOGIN) {
    return <LoginView onLogin={(p, l) => {
        const newUser: UserProfile = {
           name: "Learner", level: EnglishLevel.UNKNOWN, xp: 0, streak: 0, badges: [], titles: [], vocabList: [], grammarList: [], isReturning: false, learningStats: { wordsLearned: 0, sentencesSpoken: 0, grammarPoints: 0 }, language: l
        };
        handleUpdateUser(newUser);
        setLang(l);
        setView(AppView.LANDING);
    }} onSkip={(l) => {
        const newUser: UserProfile = {
           name: "Guest", level: EnglishLevel.UNKNOWN, xp: 0, streak: 0, badges: [], titles: [], vocabList: [], grammarList: [], isReturning: false, learningStats: { wordsLearned: 0, sentencesSpoken: 0, grammarPoints: 0 }, language: l
        };
        handleUpdateUser(newUser);
        setLang(l);
        setView(AppView.LANDING);
    }} />;
  }
  if (view === AppView.LANDING) {
     return <WelcomeLevelChoiceView 
        onPreA0={() => { if(user) { handleUpdateUser({ ...user, level: EnglishLevel.PRE_A0 }); setView(AppView.DASHBOARD); }}} 
        onStandard={() => setView(AppView.PLACEMENT_TEST)} 
     />;
  }
  if (view === AppView.PLACEMENT_TEST) {
     return <PlacementTestView lang={lang} onComplete={(lvl) => { if(user) { handleUpdateUser({ ...user, level: lvl }); setView(AppView.DASHBOARD); }}} />;
  }

  const ActiveView = viewRegistry[view as keyof typeof viewRegistry];

  if (ActiveView && user) {
     if (view === AppView.GRAMMAR_PRACTICE) {
         const GrammarView = ActiveView as any;
         return <GrammarView 
            user={user} 
            mode="lesson" 
            onBack={() => setView(AppView.DASHBOARD)} 
            onGoToPlacement={() => setView(AppView.PLACEMENT_TEST)}
            onUpdateUser={handleUpdateUser} 
            onViewStats={() => setView(AppView.GRAMMAR_STATS)} 
         />;
     }
     
     if (view === AppView.GRAMMAR_REVIEW) {
         const GrammarView = ActiveView as any;
         return <GrammarView 
            user={user} 
            mode="review" 
            onBack={() => setView(AppView.DASHBOARD)} 
            onUpdateUser={handleUpdateUser} 
         />;
     }

     if (view === AppView.DASHBOARD) {
        const Dashboard = ActiveView as any;
        return <Dashboard user={user} lang={lang} onNavigate={setView} onUpdateUser={handleUpdateUser} />;
     }

     if (view === AppView.GRAMMAR_STATS) {
         const StatsView = ActiveView as any;
         return <StatsView user={user} onBack={() => setView(AppView.DASHBOARD)} onContinue={() => setView(AppView.GRAMMAR_PRACTICE)} />;
     }

     if (view === AppView.PROFILE_ACHIEVEMENTS) {
         const ProfileView = ActiveView as any;
         return <ProfileView user={user} onBack={() => setView(AppView.DASHBOARD)} onNavigate={setView} />;
     }
  }

  return null;
};

export default App;