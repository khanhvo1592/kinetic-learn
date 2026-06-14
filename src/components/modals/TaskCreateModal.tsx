import React, { useState } from 'react';
import { Subject } from '../../types';

interface TaskCreateModalProps {
  onClose: () => void;
  onSubmit: (title: string, category: string, xpReward: number) => void;
  subjects: Subject[];
}

export default function TaskCreateModal({ onClose, onSubmit, subjects }: TaskCreateModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(subjects[0]?.name || 'Chung');
  const [xpReward, setXpReward] = useState(20);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit(title.trim(), category, xpReward);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-sm bg-white rounded-[28px] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-display font-bold text-xl text-slate-800">Tạo nhiệm vụ mới</h3>
          <button onClick={onClose} className="bg-slate-100 p-2 rounded-full text-slate-500 hover:bg-slate-200 transition-colors">
            <span className="material-symbols-outlined text-lg block">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Tên nhiệm vụ</label>
            <input 
              type="text" 
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="VD: Làm 5 bài tập Toán..."
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-[#0058be] transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Môn học</label>
            <select 
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-[#0058be] transition-colors appearance-none"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
              <option value="Khác">Khác</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Phần thưởng XP: {xpReward}</label>
            <input 
              type="range" 
              min="10" max="100" step="10"
              value={xpReward}
              onChange={e => setXpReward(Number(e.target.value))}
              className="w-full accent-[#0058be]"
            />
          </div>

          <button 
            type="submit"
            disabled={!title.trim()}
            className="w-full bg-[#0058be] text-white font-bold py-3.5 rounded-xl tactile-button mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Thêm nhiệm vụ
          </button>
        </form>
      </div>
    </div>
  );
}
