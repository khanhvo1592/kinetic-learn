import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import SolutionItem from '../components/quiz/SolutionItem';

export default function SolutionsPage() {
  const navigate = useNavigate();
  const { quizzes } = useAppContext();

  // Mocking user answers for the sake of the rewrite since we didn't persist quiz session
  const mockUserAnswers: Record<string, string> = {};
  quizzes.slice(0, 5).forEach((q, i) => {
    mockUserAnswers[q.id] = i % 2 === 0 ? q.correctKey : (q.correctKey === 'A' ? 'B' : 'A');
  });

  const displayQuizzes = quizzes.slice(0, 5);

  return (
    <div className="flex flex-col h-full bg-[#f7f9fb]">
      <div className="bg-white px-4 pt-12 pb-4 flex items-center justify-between shadow-sm relative z-10 shrink-0">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="font-display font-bold text-lg text-slate-800">Đáp án chi tiết</h1>
        <div className="w-10 h-10"></div> {/* Spacer */}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {displayQuizzes.map((q, idx) => (
          <SolutionItem 
            key={q.id}
            question={q}
            userAnswer={mockUserAnswers[q.id] || 'A'}
            index={idx}
          />
        ))}
        <div className="h-20"></div>
      </div>
    </div>
  );
}
