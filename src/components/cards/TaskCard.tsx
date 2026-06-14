import React from 'react';
import { Task } from '../../types';

interface TaskCardProps {
  key?: React.Key; task: Task;
  onToggle: () => void;
  onDelete?: () => void;
}

export default function TaskCard({ task, onToggle, onDelete }: TaskCardProps) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-[20px] transition-all tactile-card ${task.completed ? 'bg-slate-50 opacity-70' : 'bg-white'}`}>
      <button 
        onClick={onToggle}
        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
          task.completed ? 'bg-green-500 text-white' : 'border-2 border-slate-300'
        }`}
      >
        {task.completed && <span className="material-symbols-outlined text-[16px] font-bold">check</span>}
      </button>
      
      <div className="flex-1 min-w-0" onClick={onToggle}>
        <h4 className={`font-display font-bold text-sm truncate ${task.completed ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
          {task.title}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-md font-medium">
            {task.category}
          </span>
          <span className="text-[10px] text-slate-400 truncate">{task.subInfo}</span>
        </div>
      </div>
      
      <div className="flex flex-col items-end gap-1 shrink-0">
        <div className="text-amber-500 font-bold text-xs bg-amber-50 px-2 py-1 rounded-lg flex items-center gap-1">
          +{task.xpReward} <span className="material-symbols-outlined text-[12px]">star</span>
        </div>
        {onDelete && (
          <button onClick={onDelete} className="text-red-400 hover:text-red-600 p-1">
            <span className="material-symbols-outlined text-sm">delete</span>
          </button>
        )}
      </div>
    </div>
  );
}
