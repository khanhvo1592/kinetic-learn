import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { useQuizAttempts } from '../hooks/useQuizAttempts';
import { QuizAttempt } from '../types';
import ScoreCircle from '../components/quiz/ScoreCircle';

export default function ResultPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
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

  const fallbackAttempt = useMemo<QuizAttempt | null>(() => {
    if (attemptId) return null;
    const state = location.state || {};
    if (!state.userAnswers) return null;
    const lessonQuestions = state.lessonId ? quizzes.filter(q => q.lessonId === state.lessonId) : [];
    const correctQuestionIds = lessonQuestions.filter(q => state.userAnswers[q.id] === q.correctKey).map(q => q.id);
    const wrongQuestionIds = lessonQuestions.filter(q => state.userAnswers[q.id] && state.userAnswers[q.id] !== q.correctKey).map(q => q.id);
    const unansweredQuestionIds = lessonQuestions.filter(q => !state.userAnswers[q.id]).map(q => q.id);
    return {
      id: 'legacy-state',
      userId: '',
      mode: 'lesson_quiz',
      lessonId: state.lessonId,
      questionIds: lessonQuestions.map(q => q.id),
      answers: state.userAnswers,
      correctQuestionIds,
      wrongQuestionIds,
      unansweredQuestionIds,
      score: state.score || 0,
      totalQuestions: lessonQuestions.length || state.total || 10,
      correctCount: correctQuestionIds.length,
      wrongCount: wrongQuestionIds.length,
      startedAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      durationSeconds: state.actualTimeTaken || 0,
    };
  }, [attemptId, location.state, quizzes]);

  const displayAttempt = attempt || fallbackAttempt;

  if (isLoading) {
    return <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center text-slate-500">Đang tải kết quả...</div>;
  }

  if (!displayAttempt) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex flex-col items-center justify-center p-4 text-center">
        <h2 className="font-display font-bold text-xl text-slate-700">Không tìm thấy kết quả</h2>
        <button onClick={() => navigate('/exams')} className="mt-4 text-[#0058be] font-bold">Về danh sách đề</button>
      </div>
    );
  }

  const timeTakenMinutes = Math.floor(displayAttempt.durationSeconds / 60);
  const timeTakenSeconds = displayAttempt.durationSeconds % 60;
  const timeTaken = `${timeTakenMinutes.toString().padStart(2, '0')}:${timeTakenSeconds.toString().padStart(2, '0')}`;
  const xpReward = displayAttempt.score * 5;
  const isGreat = displayAttempt.score >= 8;
  const solutionsPath = displayAttempt.id === 'legacy-state'
    ? '/solutions'
    : `/attempts/${displayAttempt.id}/solutions`;

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col pt-12 pb-6 px-4">
      <div className="flex-1 max-w-md w-full mx-auto flex flex-col items-center">
        <div className={`w-24 h-24 ${isGreat ? 'bg-yellow-100 text-yellow-500 animate-bounce' : 'bg-blue-100 text-[#0058be]'} rounded-full flex items-center justify-center mb-4`}>
          <span className="material-symbols-outlined text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            {isGreat ? 'trophy' : 'task_alt'}
          </span>
        </div>

        <h1 className="font-display font-black text-3xl text-slate-800 mb-2 text-center">
          {isGreat ? 'Tuyệt vời!' : 'Hoàn thành!'}
        </h1>
        <p className="text-slate-500 font-sans text-center mb-8">
          Bạn đã hoàn thành bài kiểm tra với thời gian {timeTaken}
        </p>

        <ScoreCircle score={displayAttempt.score} total={10} />

        <div className="w-full bg-white rounded-[24px] p-5 shadow-sm border border-slate-100 mb-5 grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="font-display font-black text-emerald-600 text-xl">{displayAttempt.correctCount}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Đúng</p>
          </div>
          <div>
            <p className="font-display font-black text-rose-600 text-xl">{displayAttempt.wrongCount}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Sai</p>
          </div>
          <div>
            <p className="font-display font-black text-slate-500 text-xl">{displayAttempt.unansweredQuestionIds.length}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Bỏ trống</p>
          </div>
        </div>

        <div className="w-full bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 mb-8 tactile-card border-b-[#e2e8f0]">
          <h3 className="font-display font-bold text-slate-800 mb-4 text-center">Phần thưởng đạt được</h3>
          <div className="flex justify-center gap-6">
            <div className="text-center">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mx-auto mb-2 border-2 border-amber-100">
                <span className="material-symbols-outlined text-2xl">star</span>
              </div>
              <p className="font-display font-bold text-amber-600 text-lg">+{xpReward}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">XP</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 mx-auto mb-2 border-2 border-orange-100">
                <span className="material-symbols-outlined text-2xl">local_fire_department</span>
              </div>
              <p className="font-display font-bold text-orange-600 text-lg">+1</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Chuỗi</p>
            </div>
          </div>
        </div>

        <div className="w-full space-y-3 mt-auto">
          <button
            onClick={() => navigate(solutionsPath, {
              state: {
                ...location.state,
                initialFilter: displayAttempt.wrongQuestionIds.length > 0
                  ? 'wrong'
                  : displayAttempt.unansweredQuestionIds.length > 0
                    ? 'unanswered'
                    : 'all',
              },
            })}
            className="w-full bg-white border-2 border-slate-200 text-slate-700 font-display font-bold py-4 rounded-[20px] tactile-card hover:bg-slate-50 active:scale-95 transition-all flex justify-center items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">fact_check</span>
            Xem câu sai và đáp án đúng
          </button>
          {(displayAttempt.wrongQuestionIds.length + displayAttempt.unansweredQuestionIds.length) > 0 && (
            <button onClick={() => navigate('/review/wrong')} className="w-full bg-rose-50 border-2 border-rose-100 text-rose-600 font-display font-bold py-4 rounded-[20px] tactile-card hover:bg-rose-100 active:scale-95 transition-all flex justify-center items-center gap-2">
              <span className="material-symbols-outlined text-lg">replay</span>
              Ôn lại câu sai
            </button>
          )}
          <button onClick={() => navigate('/')} className="w-full bg-[#0058be] text-white font-display font-bold py-4 rounded-[20px] tactile-button shadow-[0_4px_0_0_#004395] hover:bg-blue-700 active:translate-y-[4px] active:shadow-none transition-all">
            Về màn hình chính
          </button>
        </div>
      </div>
    </div>
  );
}
