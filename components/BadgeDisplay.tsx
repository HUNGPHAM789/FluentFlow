// --- components/BadgeDisplay.tsx ---
import React from 'react';
import { Badge } from '../types';

interface Props {
  badges: Badge[];
}

const BadgeDisplay: React.FC<Props> = ({ badges }) => {
  if (badges.length === 0) {
    return (
      <div className="p-4 bg-slate-100 rounded-xl text-slate-500 text-center text-sm">
        No badges earned yet. Start learning to unlock!
      </div>
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {badges.map((badge) => (
        <div key={badge.id} className="flex-shrink-0 w-24 flex flex-col items-center group cursor-pointer relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 border-2 border-yellow-400 flex items-center justify-center text-2xl shadow-sm group-hover:shadow-md transition-all">
            {badge.icon}
          </div>
          <span className="text-xs font-medium text-slate-700 mt-2 text-center leading-tight">
            {badge.name}
          </span>
          
          {/* Tooltip */}
          <div className="absolute bottom-full mb-2 hidden group-hover:block w-32 bg-slate-800 text-white text-xs p-2 rounded z-10 text-center">
            {badge.description}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BadgeDisplay;