import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, GrammarPurposeLesson, GrammarLessonState, GrammarDrillItem, EnglishLevel } from '../types';
import Button from './Button';
import { DrillRenderer } from './Drills';
import { useLearningSession } from '../hooks/useLearningSession';
import { loadGrammarProgress, updateLessonProgress, isPreA0Completed, isLevelUnlocked } from '../utils/storage';
import { grammarLevels } from '../data/grammarData';
import { getEffectiveLevel } from '../utils/levelUtils';

// FullScreenFireworks Component (Extracted from App.tsx)
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

// Helper for Encouragement Messages (Task 2 impl)
const getEncouragementMessage = (params: {
  mode: 'NEW_LESSON' | 'REVIEW';
  scorePercent: number;
}) => {
  const { mode, scorePercent } = params;

  if (mode === 'NEW_LESSON') {
    if (scorePercent === 0) {
      return {
        titleEn: "Great first try!",
        titleVi: "Khởi đầu tốt!",
        bodyEn: "Review this lesson again to remember the structure.",
        bodyVi: "Học lại bài này thêm một lần nữa để nhớ cấu trúc nhé."
      };
    } else if (scorePercent < 50) {
      return {
        titleEn: "Nice effort!",
        titleVi: "Cố gắng tốt!",
        bodyEn: "With a bit more review, you'll improve very quickly.",
        bodyVi: "Ôn thêm một chút nữa là bạn sẽ tiến bộ rất nhanh."
      };
    } else if (scorePercent < 80) {
      return {
        titleEn: "Good job!",
        titleVi: "Làm tốt lắm!",
        bodyEn: "You’re getting used to this grammar pattern.",
        bodyVi: "Bạn đang dần quen với cấu trúc này rồi."
      };
    } else {
      return {
        titleEn: "Excellent! You almost mastered this lesson.",
        titleVi: "Quá xuất sắc! Bạn gần như đã làm chủ bài này rồi.",
        bodyEn: "Try one more time later to lock it in.",
        bodyVi: "Làm lại một lần nữa sau đó để nhớ lâu hơn nhé."
      };
    }
  } else {
    // REVIEW mode
    if (scorePercent === 0) {
      return {
        titleEn: "You’re facing your weak points.",
        titleVi: "Bạn đang đối mặt với điểm yếu của mình.",
        bodyEn: "Keep reviewing these questions – they will get easier.",
        bodyVi: "Tiếp tục ôn lại những câu này – dần dần bạn sẽ thấy dễ hơn."
      };
    } else if (scorePercent < 50) {
      return {
        titleEn: "Nice! You’re fixing your mistakes.",
        titleVi: "Rất tốt! Bạn đang sửa lỗi từng chút một.",
        bodyEn: "Review these items again tomorrow to remember them.",
        bodyVi: "Ôn lại những câu này vào ngày mai để nhớ chắc hơn."
      };
    } else if (scorePercent < 80) {
      return {
        titleEn: "Good review!",
        titleVi: "Lượt ôn rất tốt!",
        bodyEn: "You’re turning weak points into strengths.",
        bodyVi: "Bạn đang biến điểm yếu thành điểm mạnh."
      };
    } else {
      return {
        titleEn: "Awesome! Your weak points are much better now.",
        titleVi: "Tuyệt vời! Những điểm yếu của bạn đã tốt hơn nhiều.",
        bodyEn: "Check again in a few days to make sure you still remember.",
        bodyVi: "Ôn lại sau vài ngày để chắc chắn bạn vẫn nhớ."
      };
    }
  }
};

interface GrammarGuruViewProps {
  user: UserProfile;
  mode?: 'lesson' | 'review';
  onBack: () => void;
  onGoToPlacement?: () => void;
  onUpdateUser: (u: UserProfile) => void;
  onViewStats?: () => void;
}

const GrammarGuruView: React.FC<GrammarGuruViewProps> = ({ user, mode = 'lesson', onBack, onGoToPlacement, onUpdateUser, onViewStats }) => {
  const isReview = mode === 'review';
  const [viewMode, setViewMode] = useState<'HOME' | 'DETAIL' | 'DRILL' | 'REVIEW_INTRO'>(isReview ? 'REVIEW_INTRO' : 'HOME');
  const [selectedLesson, setSelectedLesson] = useState<GrammarPurposeLesson | null>(null);
  const [progress, setProgress] = useState(loadGrammarProgress());
  const [showLockInfo, setShowLockInfo] = useState<{level: string, message: string} | null>(null);
  
  // Use Engine Hook
  const { session, currentItem, start, submit, commit, sessionStats } = useLearningSession({
    type: 'GRAMMAR',
    lessonId: selectedLesson?.id,
    mode: isReview ? 'REVIEW' : 'NEW_LESSON',
    limit: 20
  });

  // Drill State
  // We keep userAnswer local because inputs are controlled
  const [userAnswer, setUserAnswer] = useState<any>(null);
  const [lessonResult, setLessonResult] = useState<{correct: number, total: number, score: number, xpGained: number} | null>(null);

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
    if (!selectedLesson && !isReview) return;
    
    // Reset local view state
    setLessonResult(null);
    setUserAnswer(null); 
    
    // Start Engine Session
    start();
    
    setViewMode('DRILL');
    
    // Mark as in-progress if not mastered (only for normal lessons)
    if (!isReview && selectedLesson && progress[selectedLesson.id]?.state !== 'mastered') {
        const updated = updateLessonProgress(progress, selectedLesson.id, { state: 'in_progress' });
        setProgress(updated);
    }
  };

  const startReview = () => {
    setLessonResult(null);
    setUserAnswer(null);
    start();
    setViewMode('DRILL');
  };

  const normalizeText = (text: string): string => {
    return String(text).trim().toLowerCase().replace(/\s+/g, ' ');
  };

  const maybeUpgradePreA0ToA0 = (currentUser: UserProfile, currentProgress: any) => {
      if (currentUser.level !== EnglishLevel.PRE_A0) return;
      if (!isPreA0Completed(currentProgress)) return;

      // Auto-upgrade
      const updatedUser = { ...currentUser, level: EnglishLevel.A0 };
      onUpdateUser(updatedUser);
      
      // Could show a toast/dialog here
      alert("Chúc mừng! Bạn đã hoàn thành tất cả bài Pre-A0. Cấp độ A0 – Ngữ pháp sống sót đã được mở khóa.");
  };

  const finalizeLesson = (correct: number, total: number) => {
      // Calculate score
      const score = total > 0 ? Math.round((correct / total) * 100) : 0;

      if (!isReview && selectedLesson) {
          const newState: GrammarLessonState = 'mastered'; 
          const updatedProgress = updateLessonProgress(progress, selectedLesson.id, {
              state: newState,
              completedDrills: total,
              totalDrills: total,
              lastScore: score
          });
          setProgress(updatedProgress);
           // Check for auto-upgrade
          maybeUpgradePreA0ToA0(user, updatedProgress);
      }

      // Commit session to profile (XP, Streak)
      const updatedUser = commit();
      if (updatedUser) {
          onUpdateUser(updatedUser);
      }

      const xp = sessionStats ? sessionStats.xpGained : 0;
      setLessonResult({ correct, total, score, xpGained: xp });
  };

  const handleCheckAnswer = () => {
    // Capture current drill for feedback before engine moves to next
    const currentDrill = currentItem?.content as GrammarDrillItem;
    
    const { result, isComplete, stats } = submit(userAnswer);

    if (!result.isCorrect && currentDrill) {
         alert("Incorrect. The correct answer is: " + (Array.isArray(currentDrill.answer) ? currentDrill.answer.join(" ") : currentDrill.answer));
    } else {
        // Optional immediate feedback
    }

    // Move next or finalize
    if (isComplete) {
        finalizeLesson(stats.correct, stats.correct + stats.incorrect);
    } else {
        setUserAnswer(null);
    }
  };

  // Find next recommended lesson (First available/in-progress from PreA0 up)
  const nextLesson = useMemo(() => {
      if (isReview) return null;
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
  }, [progress, user.level, isReview]);

  /* --- RENDER HOME --- */
  if (viewMode === 'HOME') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col relative pb-20">
         <div className="bg-white p-4 shadow-sm flex items-center justify-between sticky top-0 z-10 border-b border-slate-200">
             <div className="flex items-center gap-4">
                 <button onClick={onBack} className="text-slate-500 hover:text-slate-800 font-medium">← Back</button>
                 <div>
                    <h2 className="font-bold text-slate-800 text-lg leading-tight">Grammar Guru</h2>
                    <p className="text-xs text-slate-500">Ngữ pháp theo mục đích sử dụng</p>
                 </div>
             </div>
             {onViewStats && (
                 <button onClick={onViewStats} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold border border-blue-100 hover:bg-blue-100 transition-colors">
                    Progress
                 </button>
             )}
         </div>

         <div className="p-4 space-y-6 max-w-2xl mx-auto w-full">
            
            {/* Gentle Reminder for Unknown Level */}
            {user.level === EnglishLevel.UNKNOWN && onGoToPlacement && (
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

  /* --- RENDER REVIEW INTRO --- */
  if (viewMode === 'REVIEW_INTRO') {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col relative items-center justify-center p-6 text-center">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
                 <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-4xl mx-auto">
                    🛠️
                 </div>
                 <h2 className="text-2xl font-bold text-slate-800">Review Weak Areas</h2>
                 <p className="text-slate-600">
                    We've identified grammar points you struggled with. Let's practice them to achieve mastery!
                 </p>
                 
                 <div className="pt-4 space-y-3">
                    <Button onClick={startReview} className="w-full" size="lg">Start Review</Button>
                    <button onClick={onBack} className="text-slate-400 hover:text-slate-600 text-sm font-medium">Cancel</button>
                 </div>
            </div>
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
  if (viewMode === 'DRILL' && (selectedLesson || isReview)) {
      // Safety check for empty review
      if (isReview && session && session.items.length === 0) {
          return (
              <div className="min-h-screen bg-emerald-50 flex flex-col items-center justify-center p-6 text-center space-y-6">
                  <div className="text-6xl">🌟</div>
                  <h2 className="text-2xl font-bold text-slate-800">No weak areas found!</h2>
                  <p className="text-slate-600">You are doing great. Go back and learn new lessons.</p>
                  <Button onClick={onBack} className="w-full max-w-xs">Return to Dashboard</Button>
              </div>
          );
      }

      const currentDrill = currentItem?.content as GrammarDrillItem;
      const drillIndex = session?.currentIndex || 0;
      const totalDrills = isReview ? (session?.items.length || 0) : (selectedLesson ? selectedLesson.drills.length : 0);

      if (lessonResult) {
          // Context-aware message logic
          const msg = getEncouragementMessage({
             mode: isReview ? 'REVIEW' : 'NEW_LESSON',
             scorePercent: lessonResult.score
          });

          return (
              <div className="min-h-screen bg-emerald-50 flex flex-col items-center justify-center p-6 text-center space-y-6">
                  <FullScreenFireworks />
                  <div className="text-6xl animate-bounce">🎓</div>
                  <h2 className="text-2xl font-bold text-slate-800">{isReview ? "Review Complete!" : "Bài học hoàn thành!"}</h2>
                  
                  <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm space-y-4">
                      <div className="text-sm uppercase tracking-wide text-slate-500 font-bold">Kết quả</div>
                      <div className="text-5xl font-bold text-emerald-600">{lessonResult.score}%</div>
                      
                      {/* Context-Aware Message */}
                      <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-left space-y-2">
                         <div>
                            <p className="font-bold text-emerald-900 text-sm">{msg.titleEn}</p>
                            {msg.bodyEn && <p className="text-xs text-emerald-700 mt-0.5">{msg.bodyEn}</p>}
                         </div>
                         <div className="pt-2 border-t border-emerald-200/60">
                            <p className="font-bold text-emerald-800 text-sm">{msg.titleVi}</p>
                            {msg.bodyVi && <p className="text-xs text-emerald-600 italic mt-0.5">{msg.bodyVi}</p>}
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 border-t pt-4">
                          <div className="flex flex-col">
                             <span className="text-xs text-slate-400 uppercase">Correct</span>
                             <span className="font-bold text-slate-700 text-lg">{lessonResult.correct}/{lessonResult.total}</span>
                          </div>
                          <div className="flex flex-col border-l">
                             <span className="text-xs text-slate-400 uppercase">XP Gained</span>
                             <span className="font-bold text-amber-500 text-lg">+{lessonResult.xpGained} XP</span>
                          </div>
                      </div>
                  </div>

                  <Button onClick={onBack} className="w-full max-w-xs">{isReview ? "Return to Dashboard" : "Quay về danh sách"}</Button>
              </div>
          );
      }

      return (
          <div className="min-h-screen bg-slate-50 flex flex-col relative">
             <div className="w-full bg-slate-200 h-2">
                 <div className="bg-blue-600 h-2 transition-all duration-300" style={{ width: `${(drillIndex / totalDrills) * 100}%` }}></div>
             </div>

             <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-lg mx-auto w-full space-y-8">
                 <div className="w-full text-center">
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Question {drillIndex + 1}/{totalDrills}</span>
                     {/* Drill Render */}
                     <div className="mt-4">
                        {currentDrill ? (
                           <DrillRenderer 
                             drill={currentDrill} 
                             onAnswer={setUserAnswer} 
                             value={userAnswer}
                           />
                        ) : (
                           <div className="text-slate-400">Loading drill...</div>
                        )}
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
                 <button onClick={() => isReview ? onBack() : setViewMode('DETAIL')} className="text-slate-400 hover:text-slate-600 text-sm">Thoát bài tập</button>
             </div>
          </div>
      );
  }

  return null;
};

export default GrammarGuruView;