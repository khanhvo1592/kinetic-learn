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
  const state = location.state || {};
  const [filter, setFilter] = useState<'all' | 'wrong' | 'correct' | 'unanswered'>(state.initialFilter || 'all');

  useEffect(() => {
    if (!attemptId) return;
    setIsLoading(true);
    getAttemptById(attemptId)
      .then(setAttempt)
      .finally(() => setIsLoading(false));
  }, [attemptId, getAttemptById]);

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
  const solutionStats = useMemo(() => {
    return displayQuizzes.reduce(
      (stats, question) => {
        if (!question) return stats;
        const userAnswer = answers[question.id];
        if (!userAnswer) stats.unanswered += 1;
        else if (userAnswer === question.correctKey) stats.correct += 1;
        else stats.wrong += 1;
        return stats;
      },
      { correct: 0, wrong: 0, unanswered: 0 }
    );
  }, [answers, displayQuizzes]);
  const filteredQuizzes = useMemo(() => {
    return displayQuizzes.filter(question => {
      if (!question || filter === 'all') return true;
      const userAnswer = answers[question.id];
      if (filter === 'unanswered') return !userAnswer;
      if (filter === 'correct') return userAnswer === question.correctKey;
      return !!userAnswer && userAnswer !== question.correctKey;
    });
  }, [answers, displayQuizzes, filter]);

  return (
    <div className="flex flex-col h-full bg-[#f7f9fb]">
      <div className="bg-white px-4 pt-12 pb-4 flex items-center justify-between shadow-sm relative z-10 shrink-0">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="font-display font-bold text-lg text-slate-800">Đáp án chi tiết</h1>
        <div className="w-10 h-10"></div>
      </div>

      <div className="bg-white border-b border-slate-100 px-4 py-3 overflow-x-auto shrink-0">
        <div className="flex gap-2 min-w-max">
          {[
            { key: 'all', label: `Tất cả ${displayQuizzes.length}` },
            { key: 'wrong', label: `Câu sai ${solutionStats.wrong}` },
            { key: 'unanswered', label: `Chưa làm ${solutionStats.unanswered}` },
            { key: 'correct', label: `Câu đúng ${solutionStats.correct}` },
          ].map(item => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key as typeof filter)}
              className={`px-3 py-2 rounded-xl text-xs font-black border ${filter === item.key ? 'bg-[#0058be] text-white border-[#0058be]' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {isLoading ? (
          <div className="text-center text-slate-500 mt-10">Đang tải lời giải...</div>
        ) : filteredQuizzes.length > 0 ? (
          filteredQuizzes.map((q, idx) => (
            <SolutionItem
              key={q!.id}
              question={q!}
              userAnswer={answers[q!.id] || null}
              index={idx}
            />
          ))
        ) : (
          <div className="text-center text-slate-500 mt-10">Không có câu hỏi phù hợp với bộ lọc.</div>
        )}
        <div className="h-20"></div>
      </div>
    </div>
  );
}
