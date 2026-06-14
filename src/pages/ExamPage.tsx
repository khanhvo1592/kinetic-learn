import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';

export default function ExamPage() {
  const navigate = useNavigate();
  const { quizzes } = useAppContext();
  
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 phút
  
  // Lấy ngẫu nhiên 10 câu hỏi để thi
  const [examQuestions, setExamQuestions] = useState<typeof quizzes>([]);

  useEffect(() => {
    if (quizzes.length > 0 && examQuestions.length === 0) {
      const shuffled = [...quizzes].sort(() => 0.5 - Math.random());
      setExamQuestions(shuffled.slice(0, 10)); // Lấy 10 câu
    }
  }, [quizzes]);

  // Đồng hồ đếm ngược
  useEffect(() => {
    if (isStarted && !isFinished && timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (timeLeft === 0 && !isFinished) {
      handleSubmit();
    }
  }, [isStarted, isFinished, timeLeft]);

  const handleStart = () => {
    if (examQuestions.length === 0) {
      alert("Hệ thống chưa có đủ câu hỏi trắc nghiệm.");
      return;
    }
    setIsStarted(true);
  };

  const handleSubmit = () => {
    setIsFinished(true);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm max-w-md w-full text-center border-2 border-slate-100">
          <span className="material-symbols-outlined text-6xl text-[#0058be] mb-4">quiz</span>
          <h1 className="font-display font-black text-2xl text-slate-800 mb-2">Kiểm Tra Tổng Hợp</h1>
          <p className="text-slate-500 text-sm mb-8">
            Bài kiểm tra gồm {examQuestions.length || 10} câu hỏi ngẫu nhiên. Thời gian làm bài là 15 phút. Điểm số sẽ không được lưu vào hệ thống.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 font-bold text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200"
            >
              Quay lại
            </button>
            <button
              onClick={handleStart}
              className="px-6 py-3 font-display font-black text-white bg-[#0058be] rounded-xl shadow-[0_4px_0_0_#004395] hover:bg-blue-700 active:translate-y-[2px] active:shadow-none transition-all"
            >
              Bắt đầu thi
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isFinished) {
    let score = 0;
    examQuestions.forEach(q => {
      if (answers[q.id] === q.correctKey) score++;
    });

    return (
      <div className="min-h-screen bg-[#f7f9fb] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm max-w-md w-full text-center border-2 border-slate-100">
          <span className="material-symbols-outlined text-6xl text-emerald-500 mb-4">verified</span>
          <h1 className="font-display font-black text-2xl text-slate-800 mb-2">Kết Quả Bài Thi</h1>
          <div className="text-5xl font-black text-[#0058be] my-6">
            {score} <span className="text-2xl text-slate-400">/ {examQuestions.length}</span>
          </div>
          <p className="text-slate-500 text-sm mb-8">
            Cảm ơn bạn đã hoàn thành bài kiểm tra. Bạn có thể xem lại đáp án ở phần ôn tập.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full px-6 py-3 font-display font-black text-white bg-[#0058be] rounded-xl shadow-[0_4px_0_0_#004395] hover:bg-blue-700 active:translate-y-[2px] active:shadow-none transition-all"
          >
            Về Trang Chủ
          </button>
        </div>
      </div>
    );
  }

  const currentQ = examQuestions[currentIdx];

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => {
            if(window.confirm('Bạn có chắc chắn muốn thoát? Bài thi sẽ bị hủy.')) navigate(-1);
          }} className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100">
            <span className="material-symbols-outlined">close</span>
          </button>
          <div>
            <h2 className="font-display font-bold text-sm">Đang làm bài thi</h2>
            <p className="text-[10px] text-slate-500 font-sans">Câu {currentIdx + 1} / {examQuestions.length}</p>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-xl font-mono font-bold flex items-center gap-2 ${timeLeft < 60 ? 'bg-rose-50 text-rose-600 border border-rose-200 animate-pulse' : 'bg-blue-50 text-blue-600 border border-blue-200'}`}>
          <span className="material-symbols-outlined text-sm">timer</span>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-2xl w-full mx-auto p-4 flex flex-col">
        <div className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-sm flex-1 mb-24">
          <h3 className="font-display font-bold text-lg text-slate-800 mb-6 leading-relaxed">
            <span className="text-slate-400 mr-2">{currentIdx + 1}.</span> 
            {currentQ.question}
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
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                    isSelected ? 'bg-[#0058be] text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {opt.key}
                  </div>
                  <span className="font-semibold text-sm flex-1">{opt.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
            disabled={currentIdx === 0}
            className="px-6 py-3 font-bold text-slate-500 disabled:opacity-30 flex items-center gap-2"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Câu trước
          </button>
          
          {currentIdx === examQuestions.length - 1 ? (
            <button
              onClick={() => {
                if (window.confirm('Bạn đã hoàn thành bài thi và muốn nộp bài?')) handleSubmit();
              }}
              className="px-6 py-3 font-display font-black text-white bg-emerald-500 rounded-xl shadow-[0_4px_0_0_#059669] hover:bg-emerald-600 active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-2"
            >
              Nộp Bài
              <span className="material-symbols-outlined">send</span>
            </button>
          ) : (
            <button
              onClick={() => setCurrentIdx(prev => Math.min(examQuestions.length - 1, prev + 1))}
              className="px-6 py-3 font-display font-black text-white bg-[#0058be] rounded-xl shadow-[0_4px_0_0_#004395] hover:bg-blue-700 active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-2"
            >
              Câu tiếp
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
