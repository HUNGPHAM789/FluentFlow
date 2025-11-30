
// --- components/GrammarProgressView.tsx ---
import React, { useMemo } from 'react';
import { UserProfile } from '../types';
import { calculateGrammarStats } from '../utils/grammarStats';
import Button from './Button';

interface GrammarProgressViewProps {
  user: UserProfile;
  onBack: () => void;
  onContinue: () => void;
}

const GrammarProgressView: React.FC<GrammarProgressViewProps> = ({ user, onBack, onContinue }) => {
  const stats = useMemo(() => calculateGrammarStats(user), [user]);

  const getEncouragementMessage = (percent: number) => {
     if (percent === 0) {
       return {
         en: "Let’s get started with your first grammar exercises.",
         vi: "Chưa sao, mình bắt đầu từ từ nhé. Làm bài đầu tiên để khởi động."
       };
     } else if (percent > 0 && percent <= 30) {
       return {
         en: `Nice start! You’ve completed about ${percent}% of this level.`,
         vi: `Bạn đã hoàn thành khoảng ${percent}% level này – quá ổn cho người mới bắt đầu!`
       };
     } else if (percent > 30 && percent <= 70) {
       return {
         en: "Great progress! You’re more than halfway through this level.",
         vi: "Tiến độ rất tốt! Bạn đã đi hơn nửa chặng đường ở level này rồi."
       };
     } else if (percent > 70 && percent < 100) {
       return {
         en: "You’re close to finishing this level. Keep going!",
         vi: "Gần xong level này rồi – cố thêm vài bài nữa nhé!"
       };
     } else {
       // percent === 100
       return {
         en: "You’ve completed this level! You’re ready for the next one.",
         vi: "Bạn đã hoàn thành level này! Sẵn sàng lên level tiếp theo."
       };
     }
  };

  const currentMessage = getEncouragementMessage(stats.currentLevelPercent);

  const getStatusHint = (percent: number) => {
      if (percent === 0) return { en: "Not started yet.", vi: "Chưa bắt đầu." };
      if (percent === 100) return { en: "Completed!", vi: "Đã hoàn thành!" };
      return { en: "In progress.", vi: "Đang học dở." };
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm flex items-center gap-4 sticky top-0 z-10 border-b border-slate-200">
         <button onClick={onBack} className="text-slate-500 hover:text-slate-800 font-medium">← Back</button>
         <div>
            <h2 className="font-bold text-slate-800 text-lg leading-tight">Grammar Progress / Tiến độ Ngữ pháp</h2>
            <p className="text-xs text-slate-500">Track your grammar learning by level / Theo dõi tiến độ theo từng level</p>
         </div>
      </div>

      <div className="flex-1 p-6 max-w-2xl mx-auto w-full space-y-8">
          
          {/* Current Level Overview */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl -mr-10 -mt-10 opacity-60 pointer-events-none"></div>
             
             <div className="relative z-10">
                 <div className="flex justify-between items-start mb-4">
                     <div>
                         <div className="text-sm font-bold text-slate-400 uppercase tracking-wide">Current Level / Trình độ hiện tại</div>
                         <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.currentActiveLevel} Grammar</h3>
                     </div>
                     <div className="text-3xl font-bold text-blue-600">
                         {stats.currentLevelPercent}%
                     </div>
                 </div>

                 <div className="w-full bg-slate-100 rounded-full h-3 mb-4 overflow-hidden">
                     <div 
                        className="bg-blue-600 h-full rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${stats.currentLevelPercent}%` }}
                     ></div>
                 </div>
                 
                 <div className="encouragement">
                     <p className="text-sm text-slate-800 font-medium mb-1">{currentMessage.en}</p>
                     <p className="text-sm text-slate-500 italic">{currentMessage.vi}</p>
                 </div>
             </div>
          </div>

          {/* Level List */}
          <div className="space-y-4">
              {stats.allLevels.map((levelStat) => {
                  const hint = getStatusHint(levelStat.percentCompleted);
                  return (
                    <div 
                        key={levelStat.level} 
                        className={`bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col gap-3 transition-all
                            ${levelStat.status === 'Locked' ? 'opacity-60 grayscale-[0.8] bg-slate-50' : ''}
                            ${levelStat.status === 'Completed' ? 'border-emerald-200 bg-emerald-50/30' : ''}
                        `}
                    >
                        <div className="flex justify-between items-center">
                            <h4 className="font-bold text-slate-700 flex items-center gap-2">
                                <span>{levelStat.level}</span>
                                <span className="text-slate-300">|</span>
                                <span className="font-normal text-sm text-slate-600">{levelStat.titleVi}</span>
                            </h4>
                            
                            <div className="flex items-center gap-2">
                                {levelStat.status === 'Completed' && <span className="text-emerald-500 text-lg">✅</span>}
                                {levelStat.status === 'Locked' && <span className="text-slate-400 text-lg">🔒</span>}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex-1 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-700 ${levelStat.status === 'Completed' ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                                    style={{ width: `${levelStat.percentCompleted}%` }}
                                ></div>
                            </div>
                            <span className="text-xs font-bold text-slate-500 w-10 text-right">{levelStat.percentCompleted}%</span>
                        </div>
                        
                        <div className="flex justify-between text-xs text-slate-400">
                            {/* <div className="level-hint"> */}
                               <span>{hint.en} <span className="opacity-60">/ {hint.vi}</span></span>
                            {/* </div> */}
                        </div>
                    </div>
                  );
              })}
          </div>

          <div className="pt-4 pb-8">
              <Button onClick={onContinue} className="w-full shadow-lg" size="lg">
                  Tiếp tục học tập
              </Button>
          </div>
      </div>
    </div>
  );
};

export default GrammarProgressView;
