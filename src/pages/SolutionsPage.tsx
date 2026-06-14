import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import SolutionItem from '../components/quiz/SolutionItem';

export default function SolutionsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { quizzes } = useAppContext();

  const state = location.state || {};
  const { lessonId, userAnswers = {} } = state;

  const displayQuizzes = lessonId ? quizzes.filter(q => q.lessonId === lessonId) : [];

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
        {displayQuizzes.length > 0 ? (
          displayQuizzes.map((q, idx) => (
            <SolutionItem 
              key={q.id}
              question={q}
              userAnswer={userAnswers[q.id] || null}
              index={idx}
            />
          ))
        ) : (
          <div className="text-center text-slate-500 mt-10">Không có dữ liệu bài kiểm tra.</div>
        )}
        <div className="h-20"></div>
      </div>
    </div>
  );
}
