import React from 'react';
import { Student } from '../../types';

interface LeaderboardCardProps {
  key?: React.Key; student: Student;
  rank: number;
  isCurrentUser: boolean;
  onCheer?: () => void;
  isCheered?: boolean;
}

export default function LeaderboardCard({ student, rank, isCurrentUser, onCheer, isCheered }: LeaderboardCardProps) {
  let rankColor = 'text-slate-400 font-bold';
  let rankBg = 'bg-transparent';
  
  if (rank === 1) {
    rankColor = 'text-amber-500';
    rankBg = 'bg-amber-100';
  } else if (rank === 2) {
    rankColor = 'text-slate-400';
    rankBg = 'bg-slate-200';
  } else if (rank === 3) {
    rankColor = 'text-orange-400';
    rankBg = 'bg-orange-100';
  }

  return (
    <div className={`flex items-center gap-3 p-3 rounded-[20px] transition-all tactile-card ${isCurrentUser ? 'bg-blue-50 border-2 border-[#0058be]/20' : 'bg-white'}`}>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${rankBg}`}>
        <span className={`font-display text-lg ${rankColor}`}>
          {rank <= 3 ? <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>trophy</span> : rank}
        </span>
      </div>
      
      <img src={student.avatar || `https://ui-avatars.com/api/?name=${student.name}&background=random`} alt={student.name} className="w-10 h-10 rounded-full border-2 border-slate-100 object-cover" />
      
      <div className="flex-1 min-w-0">
        <h4 className="font-display font-bold text-sm text-slate-800 truncate">
          {student.name} {isCurrentUser && <span className="text-[10px] text-[#0058be] font-sans ml-1">(Bạn)</span>}
        </h4>
        <p className="text-[11px] text-slate-500 mt-0.5">{student.streak} ngày streak 🔥</p>
      </div>
      
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <p className="font-display font-bold text-[#0058be]">{student.xp.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-wide">XP</p>
        </div>
        {!isCurrentUser && onCheer && (
          <button 
            onClick={onCheer}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              isCheered ? 'bg-pink-100 text-pink-500' : 'bg-slate-100 text-slate-400 hover:bg-pink-50 hover:text-pink-400'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]" style={isCheered ? { fontVariationSettings: "'FILL' 1" } : {}}>
              favorite
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
