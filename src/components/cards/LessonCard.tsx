import React from 'react';
import { Lesson } from '../../types';

interface LessonCardProps {
  lesson: Lesson;
  onClick: () => void;
}

export default function LessonCard({ lesson, onClick }: LessonCardProps) {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-[24px] p-4 cursor-pointer flex flex-col gap-3 h-full tactile-card border-b-[#e2e8f0]"
    >
      <div className="flex gap-3">
        <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center shrink-0 ${lesson.iconBg} ${lesson.iconColor}`}>
          <span className="material-symbols-outlined text-2xl">{lesson.iconName}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-[#0058be] uppercase tracking-wider mb-1 truncate">
            {lesson.subjectName}
          </p>
          <h3 className="font-display font-bold text-base text-slate-800 leading-tight line-clamp-2">
            {lesson.title}
          </h3>
        </div>
      </div>
      
      <div className="mt-auto">
        <div className="flex justify-between items-center text-xs text-slate-500 mb-2 font-sans">
          <span>{lesson.duration}</span>
          <span>{lesson.progress}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${lesson.progress === 100 ? 'bg-green-500' : 'bg-[#0058be]'}`}
            style={{ width: `${lesson.progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
