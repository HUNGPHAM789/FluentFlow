import React from 'react';
import { UserProfile, AppView, AppLanguage } from '../types';
import { BADGE_DEFINITIONS } from '../data/badges';

const APP_VERSION = '1.5'; 

// MissionTracker Component (Extracted)
const MissionTracker: React.FC<{
  user: UserProfile;
  lang: AppLanguage;
}> = ({ user, lang }) => {
  
  // Find the next unearned badge with the lowest threshold relative to progress
  const nextBadge = React.useMemo(() => {
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

interface DashboardViewProps {
  user: UserProfile;
  lang: AppLanguage;
  onNavigate: (view: AppView) => void;
  onUpdateUser: (u: UserProfile) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ user, lang, onNavigate, onUpdateUser }) => {
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
                 <button onClick={() => onNavigate(AppView.GRAMMAR_PRACTICE)} className="p-6 bg-white rounded-xl shadow border border-slate-200 text-left hover:border-indigo-400 transition-all flex justify-between items-center group">
                    <div>
                        <h3 className="font-bold text-lg text-indigo-600 mb-1">Grammar Guru</h3>
                        <p className="text-sm text-slate-500">Master grammar rules with purpose</p>
                    </div>
                    <span className="text-2xl group-hover:scale-110 transition-transform">📚</span>
                 </button>

                 <button onClick={() => onNavigate(AppView.GRAMMAR_REVIEW)} className="p-6 bg-white rounded-xl shadow border border-slate-200 text-left hover:border-purple-400 transition-all flex justify-between items-center group">
                    <div>
                        <h3 className="font-bold text-lg text-purple-600 mb-1">Grammar Review</h3>
                        <p className="text-sm text-slate-500">Practice your weak spots</p>
                    </div>
                    <span className="text-2xl group-hover:scale-110 transition-transform">🛠️</span>
                 </button>
                 
                 <button onClick={() => onNavigate(AppView.PLACEMENT_TEST)} className="p-6 bg-white rounded-xl shadow border border-slate-200 text-left hover:border-blue-400 transition-all flex justify-between items-center group">
                    <div>
                        <h3 className="font-bold text-lg text-blue-600 mb-1">Placement Test</h3>
                        <p className="text-sm text-slate-500">Re-check your level</p>
                    </div>
                    <span className="text-2xl group-hover:scale-110 transition-transform">🎯</span>
                 </button>

                 <button onClick={() => onNavigate(AppView.PROFILE_ACHIEVEMENTS)} className="p-6 bg-white rounded-xl shadow border border-slate-200 text-left hover:border-orange-400 transition-all flex justify-between items-center group">
                    <div>
                        <h3 className="font-bold text-lg text-orange-600 mb-1">My Profile</h3>
                        <p className="text-sm text-slate-500">Stats, Badges & Progress</p>
                    </div>
                    <span className="text-2xl group-hover:scale-110 transition-transform">🏆</span>
                 </button>
            </div>

            {/* Added View Progress Button */}
            <button 
                onClick={() => onNavigate(AppView.GRAMMAR_STATS)}
                className="w-full p-4 rounded-xl bg-slate-100 text-slate-600 font-bold border border-slate-200 hover:bg-slate-200 transition-all flex justify-center items-center gap-2"
            >
                <span>📊</span> Detailed Grammar Stats
            </button>
            
            <div className="pt-6 text-center text-xs text-slate-400">
                FluentFlow AI v{APP_VERSION}
            </div>
        </div>
    );
};

export default DashboardView;