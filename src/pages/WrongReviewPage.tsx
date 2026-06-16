import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { useQuizAttempts } from '../hooks/useQuizAttempts';
import { useWrongQuestionStats } from '../hooks/useWrongQuestionStats';

export default function WrongReviewPage() {
  const navigate = useNavigate();
  const { quizzes } = useAppContext();
  const { activeWrongStats, isLoading, recordAttemptStats } = useWrongQuestionStats();
  const { createAttempt } = useQuizAttempts();
  const startTimeRef = useRef(Date.now());
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reviewQuestions = useMemo(() => {
    const byId = new Map(quizzes.map(q => [q.id, q]));
    return activeWrongStats
      .map(stat => byId.get(stat.questionId))
      .filter(Boolean)
      .slice(0, 10)
      .map((q, idx) => ({ ...q!, num: String(idx + 1).padStart(2, '0') }));
  }, [activeWrongStats, quizzes]);

  const handleSubmit = async () => {
    if (reviewQuestions.length === 0 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const attempt = await createAttempt({
        mode: 'wrong_review',
        questions: reviewQuestions,
        answers,
        startedAt: startTimeRef.current,
        subjectId: reviewQuestions[0]?.subjectId,
      });
      await recordAttemptStats(attempt, reviewQuestions);
      navigate(`/attempts/${attempt.id}`, { replace: true });
    } catch (error: any) {
      console.error(error);
      alert(`Không thể lưu phiên ôn tập: ${error.message || 'Vui lòng thử lại.'}`);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center text-slate-500">Đang tải câu sai...</div>;
  }

  if (reviewQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-[24px] flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-4xl">verified</span>
        </div>
        <h1 className="font-display font-black text-2xl text-slate-800">Chưa có câu sai cần ôn</h1>
        <p className="text-sm text-slate-500 mt-2 max-w-sm">Sau khi làm bài kiểm tra, những câu sai hoặc bỏ trống sẽ xuất hiện ở đây.</p>
        <button onClick={() => navigate('/exams')} className="mt-6 bg-[#0058be] text-white font-display font-bold px-6 py-3 rounded-xl shadow-[0_4px_0_0_#004395]">
          Làm bài kiểm tra
        </button>
      </div>
    );
  }

  const currentQ = reviewQuestions[currentIdx];
  const isLast = currentIdx === reviewQuestions.length - 1;
  const selectedKey = answers[currentQ.id];

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col">
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="text-center">
          <h1 className="font-display font-bold text-sm">Ôn lại câu sai</h1>
          <p className="text-[10px] text-slate-500">Câu {currentIdx + 1} / {reviewQuestions.length}</p>
        </div>
        <div className="w-10 h-10" />
      </div>

      <div className="flex-1 max-w-2xl w-full mx-auto p-4">
        <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm mb-28">
          <h2 className="font-display font-bold text-lg text-slate-800 mb-6 leading-relaxed">
            <span className="text-slate-400 mr-2">{currentIdx + 1}.</span>
            {currentQ.question}
          </h2>

          <div className="space-y-3">
            {currentQ.options.map(opt => {
              const isSelected = selectedKey === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => setAnswers(prev => ({ ...prev, [currentQ.id]: opt.key }))}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'border-[#0058be] bg-blue-50/50 text-[#0058be]'
                      : 'border-slate-200 bg-white hover:border-[#0058be]/30 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isSelected ? 'bg-[#0058be] text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {opt.key}
                  </div>
                  <span className="font-semibold text-sm flex-1">{opt.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <button onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))} disabled={currentIdx === 0} className="px-4 py-3 font-bold text-slate-500 disabled:opacity-30 flex items-center gap-2">
            <span className="material-symbols-outlined">arrow_back</span>
            Câu trước
          </button>
          {isLast ? (
            <button onClick={handleSubmit} disabled={isSubmitting} className="px-5 py-3 font-display font-black text-white bg-emerald-500 rounded-xl shadow-[0_4px_0_0_#059669] flex items-center gap-2 disabled:opacity-50">
              {isSubmitting ? 'Đang lưu...' : 'Hoàn thành'}
              <span className="material-symbols-outlined">send</span>
            </button>
          ) : (
            <button onClick={() => setCurrentIdx(prev => Math.min(reviewQuestions.length - 1, prev + 1))} className="px-5 py-3 font-display font-black text-white bg-[#0058be] rounded-xl shadow-[0_4px_0_0_#004395] flex items-center gap-2">
              Câu tiếp
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
