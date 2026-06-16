import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { useQuizAttempts } from '../hooks/useQuizAttempts';
import { QuizAttempt } from '../types';
import SolutionItem from '../components/quiz/SolutionItem';

export default function SolutionsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { attemptId } = useParams<{ attemptId: string }>();
  const { quizzes } = useAppContext();
  const { getAttemptById } = useQuizAttempts();
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [isLoading, setIsLoading] = useState(!!attemptId);

  useEffect(() => {
    if (!attemptId) return;
    setIsLoading(true);
    getAttemptById(attemptId)
      .then(setAttempt)
      .finally(() => setIsLoading(false));
  }, [attemptId, getAttemptById]);

  const state = location.state || {};
  const fallbackUserAnswers = state.userAnswers || {};

  const displayQuizzes = useMemo(() => {
    if (attempt) {
      const byId = new Map(quizzes.map(q => [q.id, q]));
      return attempt.questionIds.map(id => byId.get(id)).filter(Boolean);
    }
    if (state.lessonId) return quizzes.filter(q => q.lessonId === state.lessonId);
    return [];
  }, [attempt, quizzes, state.lessonId]);

  const answers = attempt?.answers || fallbackUserAnswers;

  return (
    <div className="flex flex-col h-full bg-[#f7f9fb]">
      <div className="bg-white px-4 pt-12 pb-4 flex items-center justify-between shadow-sm relative z-10 shrink-0">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="font-display font-bold text-lg text-slate-800">Đáp án chi tiết</h1>
        <div className="w-10 h-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {isLoading ? (
          <div className="text-center text-slate-500 mt-10">Đang tải lời giải...</div>
        ) : displayQuizzes.length > 0 ? (
          displayQuizzes.map((q, idx) => (
            <SolutionItem
              key={q!.id}
              question={q!}
              userAnswer={answers[q!.id] || null}
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
