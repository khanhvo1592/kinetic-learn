import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { useExamTemplates } from '../hooks/useExamTemplates';
import { useQuizAttempts } from '../hooks/useQuizAttempts';
import { useWrongQuestionStats } from '../hooks/useWrongQuestionStats';
import { useStudents } from '../hooks/useStudents';
import { useAuth } from '../hooks/useAuth';
import MathText from '../components/common/MathText';

export default function ExamPage() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { quizzes } = useAppContext();
  const { getExamById } = useExamTemplates();
  const { createAttempt } = useQuizAttempts();
  const { recordAttemptStats } = useWrongQuestionStats();
  const { updateStudentXP, updateStudentStreak } = useStudents();

  const exam = examId ? getExamById(examId) : null;
  const startTimeRef = useRef(Date.now());
  const [isStarted, setIsStarted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(exam?.durationSeconds || 15 * 60);

  const examQuestions = useMemo(() => {
    if (!exam) return [];
    const byId = new Map(quizzes.map(q => [q.id, q]));
    const selected = exam.questionIds
      .map(id => byId.get(id))
      .filter(Boolean)
      .map((q, idx) => ({ ...q!, num: String(idx + 1).padStart(2, '0') }));
    return exam.shuffleQuestions ? [...selected].sort(() => 0.5 - Math.random()) : selected;
  }, [exam, quizzes]);

  useEffect(() => {
    if (exam) setTimeLeft(exam.durationSeconds);
  }, [exam]);

  useEffect(() => {
    if (!isStarted || isSubmitting || timeLeft <= 0) return;
    const timerId = window.setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    return () => window.clearTimeout(timerId);
  }, [isStarted, isSubmitting, timeLeft]);

  useEffect(() => {
    if (isStarted && timeLeft === 0 && !isSubmitting) {
      handleSubmit(false);
    }
  }, [isStarted, timeLeft, isSubmitting]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    startTimeRef.current = Date.now();
    setIsStarted(true);
  };

  const handleSubmit = async (confirmFirst = true) => {
    if (confirmFirst && !window.confirm('Bạn muốn nộp bài kiểm tra này?')) return;
    if (!exam || !currentUser || examQuestions.length === 0 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const attempt = await createAttempt({
        mode: 'exam',
        examId: exam.id,
        subjectId: exam.subjectId,
        questions: examQuestions,
        answers,
        startedAt: startTimeRef.current,
      });
      await recordAttemptStats(attempt, examQuestions);
      try {
        await updateStudentXP(currentUser.id, attempt.score * 5);
        await updateStudentStreak(currentUser.id, 1);
      } catch (rewardError) {
        console.warn('Reward update skipped by rules or network:', rewardError);
      }
      navigate(`/attempts/${attempt.id}`, { replace: true });
    } catch (error: any) {
      console.error(error);
      alert(`Không thể lưu kết quả: ${error.message || 'Vui lòng thử lại.'}`);
      setIsSubmitting(false);
    }
  };

  if (!exam) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex flex-col items-center justify-center p-4">
        <h2 className="font-display font-bold text-xl text-slate-700">Không tìm thấy đề kiểm tra</h2>
        <button onClick={() => navigate('/exams')} className="mt-4 text-[#0058be] font-bold">Quay lại danh sách đề</button>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-[24px] shadow-sm max-w-md w-full text-center border border-slate-100">
          <span className="material-symbols-outlined text-6xl text-[#0058be] mb-4">quiz</span>
          <h1 className="font-display font-black text-2xl text-slate-800 mb-2">{exam.title}</h1>
          <p className="text-slate-500 text-sm mb-8">
            Bài kiểm tra gồm {examQuestions.length} câu hỏi. Thời gian làm bài là {formatTime(exam.durationSeconds)}.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/exams')} className="px-6 py-3 font-bold text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200">
              Quay lại
            </button>
            <button onClick={handleStart} disabled={examQuestions.length === 0} className="px-6 py-3 font-display font-black text-white bg-[#0058be] rounded-xl shadow-[0_4px_0_0_#004395] hover:bg-blue-700 active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50">
              Bắt đầu thi
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = examQuestions[currentIdx];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col">
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => {
            if (window.confirm('Bạn có chắc chắn muốn thoát? Bài thi sẽ chưa được lưu.')) navigate('/exams');
          }} className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100">
            <span className="material-symbols-outlined">close</span>
          </button>
          <div>
            <h2 className="font-display font-bold text-sm">{exam.title}</h2>
            <p className="text-[10px] text-slate-500 font-sans">Câu {currentIdx + 1} / {examQuestions.length} • Đã làm {answeredCount}</p>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-xl font-mono font-bold flex items-center gap-2 ${timeLeft < 60 ? 'bg-rose-50 text-rose-600 border border-rose-200 animate-pulse' : 'bg-blue-50 text-blue-600 border border-blue-200'}`}>
          <span className="material-symbols-outlined text-sm">timer</span>
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="flex-1 max-w-2xl w-full mx-auto p-4 flex flex-col">
        <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm flex-1 mb-28">
          <h3 className="font-display font-bold text-lg text-slate-800 mb-6 leading-relaxed">
            <span className="text-slate-400 mr-2">{currentIdx + 1}.</span>
            <MathText text={currentQ.question} />
          </h3>

          <div className="space-y-3">
            {currentQ.options.map(opt => {
              const isSelected = answers[currentQ.id] === opt.key;
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
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${isSelected ? 'bg-[#0058be] text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {opt.key}
                  </div>
                  <span className="font-semibold text-sm flex-1"><MathText text={opt.text} /></span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-slate-100">
            {examQuestions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentIdx(idx)}
                className={`w-9 h-9 rounded-xl text-xs font-bold border ${
                  idx === currentIdx ? 'bg-[#0058be] text-white border-[#0058be]' :
                  answers[q.id] ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  'bg-slate-50 text-slate-500 border-slate-200'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <button onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))} disabled={currentIdx === 0} className="px-4 py-3 font-bold text-slate-500 disabled:opacity-30 flex items-center gap-2">
            <span className="material-symbols-outlined">arrow_back</span>
            Câu trước
          </button>

          {currentIdx === examQuestions.length - 1 ? (
            <button onClick={() => handleSubmit(true)} disabled={isSubmitting} className="px-5 py-3 font-display font-black text-white bg-emerald-500 rounded-xl shadow-[0_4px_0_0_#059669] hover:bg-emerald-600 active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-2 disabled:opacity-50">
              {isSubmitting ? 'Đang lưu...' : 'Nộp bài'}
              <span className="material-symbols-outlined">send</span>
            </button>
          ) : (
            <button onClick={() => setCurrentIdx(prev => Math.min(examQuestions.length - 1, prev + 1))} className="px-5 py-3 font-display font-black text-white bg-[#0058be] rounded-xl shadow-[0_4px_0_0_#004395] hover:bg-blue-700 active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-2">
              Câu tiếp
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
