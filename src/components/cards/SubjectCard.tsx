import React from 'react';
import { Subject } from '../../types';

interface SubjectCardProps {
  key?: React.Key; subject: Subject;
  onClick: () => void;
}

export default function SubjectCard({ subject, onClick }: SubjectCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-[24px] p-5 cursor-pointer flex flex-col justify-between h-40 tactile-card border-b-4 ${subject.borderColor} hover:bg-slate-50`}
    >
      <div className="flex justify-between items-start">
        <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center`} style={{ backgroundColor: subject.bgColor, color: subject.color }}>
          <span className="material-symbols-outlined text-2xl">{subject.icon}</span>
        </div>
        <div className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-lg">
          {subject.exercisesCount} bài tập
        </div>
      </div>
      <div>
        <h3 className="font-display font-bold text-lg text-slate-800">{subject.name}</h3>
        <p className="text-xs text-slate-500 font-sans mt-0.5">{subject.lessonsCount} bài học</p>
      </div>
    </div>
  );
}
