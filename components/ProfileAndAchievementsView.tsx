import React, { useMemo } from 'react';
import { UserProfile, AppView } from '../types';
import { calculateGrammarStats } from '../utils/grammarStats';
import { BADGE_DEFINITIONS } from '../data/badges';
import { getWeakDrillIds, countDrillsAnsweredToday } from '../utils/storage';

interface ProfileAndAchievementsViewProps {
  user: UserProfile;
  onBack: () => void;
  onNavigate?: (view: AppView) => void;
}

const ProfileAndAchievementsView: React.FC<ProfileAndAchievementsViewProps> = ({ user, onBack, onNavigate }) => {
  const grammarStats = useMemo(() => calculateGrammarStats(user), [user]);
  const weakDrillCount = useMemo(() => getWeakDrillIds().length, []);
  const reviewedToday = useMemo(() => countDrillsAnsweredToday(), []);
  
  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Never';
    return new Date(isoString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
       {/* Header with Back Button */}
       <div className="bg-white p-4 shadow-sm flex items-center gap-4 sticky top-0 z-10 border-b border-slate-200">
         <button onClick={onBack} className="text-slate-500 hover:text-slate-800 font-medium">← Back</button>
         <h2 className="font-bold text-slate-800 text-lg">Profile & Achievements</h2>
       </div>

       <div className="p-6 max-w-2xl mx-auto w-full space-y-8 pb-20">
         
         {/* User Header Card */}
         <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
            
            <div className="w-20 h-20 bg-white rounded-full p-1 shadow-lg z-10 -mt-2">
                <div className="w-full h-full bg-slate-200 rounded-full flex items-center justify-center text-3xl font-bold text-slate-500">
                    {user.name.charAt(0).toUpperCase()}
                </div>
            </div>
            
            <div className="mt-3 z-10">
                <h1 className="text-2xl font-bold text-slate-800">{user.name}</h1>
                <p className="text-slate-500 font-medium">{user.level}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-6 w-full border-t border-slate-100 pt-4">
                <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold text-indigo-600">{user.xp || 0}</span>
                    <span className="text-xs text-slate-400 uppercase tracking-wide">Total XP</span>
                </div>
                <div className="flex flex-col items-center sm:border-l border-slate-100">
                    <span className="text-2xl font-bold text-orange-500">{user.streak}</span>
                    <span className="text-xs text-slate-400 uppercase tracking-wide">Day Streak</span>
                </div>
                
                {/* Clickable Needs Review Stat */}
                <button 
                    onClick={() => onNavigate?.(AppView.GRAMMAR_REVIEW)}
                    disabled={!onNavigate}
                    className="flex flex-col items-center sm:border-l border-slate-100 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer py-1 disabled:cursor-default disabled:hover:bg-transparent"
                >
                    <span className="text-2xl font-bold text-rose-500">{weakDrillCount}</span>
                    <span className="text-xs text-slate-400 uppercase tracking-wide">Needs Review</span>
                </button>

                {/* Reviewed Today Stat */}
                <div className="flex flex-col items-center sm:border-l border-slate-100">
                    <span className="text-2xl font-bold text-emerald-500">{reviewedToday}</span>
                    <span className="text-xs text-slate-400 uppercase tracking-wide">Reviewed Today</span>
                </div>
                
                 <div className="flex flex-col items-center sm:border-l border-slate-100">
                    <span className="text-sm font-bold text-slate-600 mt-1.5">{formatDate(user.lastActive)}</span>
                    <span className="text-xs text-slate-400 uppercase tracking-wide mt-1">Last Active</span>
                </div>
            </div>
         </div>

         {/* Grammar Progress Summary */}
         <div className="space-y-4">
             <h3 className="font-bold text-slate-800 text-lg">Grammar Mastery</h3>
             <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
                 {grammarStats.allLevels.map(level => (
                     <div key={level.level} className="flex flex-col gap-1">
                         <div className="flex justify-between text-sm">
                             <span className="font-bold text-slate-700">{level.level} <span className="text-slate-400 font-normal">| {level.titleVi}</span></span>
                             <span className="text-slate-500 font-mono">{level.percentCompleted}%</span>
                         </div>
                         <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                             <div 
                                className={`h-full rounded-full ${level.percentCompleted === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                style={{ width: `${level.percentCompleted}%` }}
                             ></div>
                         </div>
                     </div>
                 ))}
             </div>
         </div>

         {/* Badges Grid */}
         <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                Achievements 
                <span className="text-sm font-normal bg-slate-100 px-2 py-1 rounded-full text-slate-500">
                    {user.badges.length}/{BADGE_DEFINITIONS.length}
                </span>
            </h3>
            
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {BADGE_DEFINITIONS.map(badge => {
                    const isUnlocked = user.badges.includes(badge.id);
                    return (
                        <div 
                            key={badge.id}
                            className={`
                                flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all
                                ${isUnlocked 
                                    ? 'bg-white border-indigo-100 shadow-sm' 
                                    : 'bg-slate-50 border-slate-100 opacity-60 grayscale'
                                }
                            `}
                        >
                            <div className="text-3xl mb-2">{badge.icon}</div>
                            <div className="text-xs font-bold text-slate-700 leading-tight mb-1">{badge.name.en}</div>
                            <div className="text-[10px] text-slate-400 leading-tight hidden sm:block">{badge.description.en}</div>
                        </div>
                    );
                })}
            </div>
         </div>

       </div>
    </div>
  );
};

export default ProfileAndAchievementsView;