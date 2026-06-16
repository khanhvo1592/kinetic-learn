import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PublicQuizQuestion } from '../types';

interface PublicQuizPayload {
  id: string;
  title: string;
  durationSeconds: number;
  requireName: boolean;
  questionCount: number;
  questions: PublicQuizQuestion[];
}

interface PublicQuizResult {
  attemptId: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  durationSeconds: number;
}

async function readJsonResponse<T>(res: Response, fallbackMessage: string): Promise<T> {
  const contentType = res.headers.get('content-type') || '';
  const rawBody = await res.text();

  if (!contentType.includes('application/json')) {
    const isHtml = rawBody.trim().startsWith('<');
    throw new Error(isHtml ? 'API public quiz chưa phản hồi JSON. Vui lòng chạy app bằng server Express (npm run dev) hoặc kiểm tra cấu hình API.' : fallbackMessage);
  }

  const data = rawBody ? JSON.parse(rawBody) : {};
  if (!res.ok) {
    throw new Error(data.error || data.details || fallbackMessage);
  }

  return data as T;
}

export default function PublicQuizPage() {
  const { slug } = useParams<{ slug: string }>();
  const startTimeRef = useRef(new Date().toISOString());
  const [quiz, setQuiz] = useState<PublicQuizPayload | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [contact, setContact] = useState('');
  const [className, setClassName] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<PublicQuizResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetch(`/api/public-quiz/${slug}`)
      .then(async (res) => {
        return readJsonResponse<PublicQuizPayload>(res, 'Không thể tải đề.');
      })
      .then((data) => {
        if (!cancelled) setQuiz(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const currentQuestion = quiz?.questions[currentIdx];
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const rest = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${rest.toString().padStart(2, '0')}`;
  };

  const startQuiz = () => {
    if (!displayName.trim()) {
      setError('Vui lòng nhập tên để bắt đầu.');
      return;
    }
    setError('');
    startTimeRef.current = new Date().toISOString();
    setIsStarted(true);
  };

  const submitQuiz = async () => {
    if (!quiz || !slug || isSubmitting) return;
    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/public-quiz/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName,
          contact,
          className,
          answers,
          startedAt: startTimeRef.current,
        }),
      });
      const data = await readJsonResponse<PublicQuizResult>(res, 'Không thể nộp bài.');
      setResult(data as PublicQuizResult);
    } catch (err: any) {
      setError(err.message || 'Không thể nộp bài.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center text-slate-500">Đang tải đề...</div>;
  }

  if (error && !quiz) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center p-4 text-center">
        <div className="bg-white border border-slate-100 rounded-2xl p-6 max-w-md">
          <span className="material-symbols-outlined text-4xl text-rose-500">link_off</span>
          <h1 className="font-display font-black text-xl text-slate-800 mt-3">Không mở được link</h1>
          <p className="text-sm text-slate-500 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  if (result) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-100 p-6 text-center shadow-sm">
          <span className="material-symbols-outlined text-5xl text-emerald-500">task_alt</span>
          <h1 className="font-display font-black text-2xl text-slate-800 mt-3">Đã nộp bài</h1>
          <p className="text-sm text-slate-500 mt-1">{quiz.title}</p>
          <div className="my-6">
            <p className="text-[11px] uppercase font-black text-slate-400">Điểm số</p>
            <p className="font-display font-black text-6xl text-[#0058be]">{result.score}<span className="text-2xl text-slate-400">/10</span></p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-emerald-50 rounded-xl p-3">
              <p className="font-black text-emerald-700">{result.correctCount}</p>
              <p className="text-[10px] font-bold text-emerald-700">Đúng</p>
            </div>
            <div className="bg-rose-50 rounded-xl p-3">
              <p className="font-black text-rose-700">{result.wrongCount}</p>
              <p className="text-[10px] font-bold text-rose-700">Sai</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="font-black text-slate-700">{result.unansweredCount}</p>
              <p className="text-[10px] font-bold text-slate-600">Bỏ trống</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-5">Thời gian làm bài: {formatDuration(result.durationSeconds)}</p>
        </div>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <span className="material-symbols-outlined text-5xl text-[#0058be]">quiz</span>
          <h1 className="font-display font-black text-2xl text-slate-800 mt-3">{quiz.title}</h1>
          <p className="text-sm text-slate-500 mt-2">{quiz.questionCount} câu hỏi • {formatDuration(quiz.durationSeconds)}</p>
          <div className="space-y-3 mt-6">
            <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Tên người làm bài" className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#0058be] rounded-xl px-4 py-3 text-sm outline-none" />
            <input value={className} onChange={e => setClassName(e.target.value)} placeholder="Lớp/nhóm (không bắt buộc)" className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#0058be] rounded-xl px-4 py-3 text-sm outline-none" />
            <input value={contact} onChange={e => setContact(e.target.value)} placeholder="SĐT/email (không bắt buộc)" className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#0058be] rounded-xl px-4 py-3 text-sm outline-none" />
          </div>
          {error && <p className="text-sm text-rose-600 mt-3">{error}</p>}
          <button onClick={startQuiz} className="w-full mt-6 bg-[#0058be] text-white font-display font-black py-3.5 rounded-xl shadow-[0_4px_0_0_#004395]">
            Bắt đầu làm bài
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col">
      <div className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-display font-bold text-sm text-slate-800 truncate">{quiz.title}</h1>
            <p className="text-[11px] text-slate-500">Câu {currentIdx + 1}/{quiz.questions.length} • Đã làm {answeredCount}</p>
          </div>
          <button onClick={submitQuiz} disabled={isSubmitting} className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-sm disabled:opacity-50">
            {isSubmitting ? 'Đang nộp...' : 'Nộp bài'}
          </button>
        </div>
      </div>

      <main className="max-w-3xl w-full mx-auto p-4 flex-1">
        {currentQuestion && (
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <h2 className="font-display font-bold text-lg text-slate-800 leading-relaxed">
              <span className="text-slate-400 mr-2">{currentIdx + 1}.</span>{currentQuestion.question}
            </h2>
            <div className="space-y-3 mt-5">
              {currentQuestion.options.map(opt => {
                const selected = answers[currentQuestion.id] === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setAnswers(prev => ({ ...prev, [currentQuestion.id]: opt.key }))}
                    className={`w-full text-left p-4 rounded-xl border-2 flex items-center gap-3 ${selected ? 'border-[#0058be] bg-blue-50 text-[#0058be]' : 'border-slate-200 hover:border-blue-200 text-slate-700'}`}
                  >
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${selected ? 'bg-[#0058be] text-white' : 'bg-slate-100 text-slate-500'}`}>{opt.key}</span>
                    <span className="font-semibold text-sm">{opt.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {error && <p className="text-sm text-rose-600 mt-4">{error}</p>}

        <div className="flex flex-wrap gap-2 mt-5">
          {quiz.questions.map((q, idx) => (
            <button key={q.id} onClick={() => setCurrentIdx(idx)} className={`w-9 h-9 rounded-lg text-xs font-bold border ${idx === currentIdx ? 'bg-[#0058be] text-white border-[#0058be]' : answers[q.id] ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-slate-500 border-slate-200'}`}>
              {idx + 1}
            </button>
          ))}
        </div>

        <div className="flex justify-between mt-6">
          <button onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))} disabled={currentIdx === 0} className="px-4 py-3 font-bold text-slate-500 disabled:opacity-30">Câu trước</button>
          <button onClick={() => setCurrentIdx(prev => Math.min(quiz.questions.length - 1, prev + 1))} disabled={currentIdx === quiz.questions.length - 1} className="px-4 py-3 font-bold text-[#0058be] disabled:opacity-30">Câu tiếp</button>
        </div>
      </main>
    </div>
  );
}
