import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuizSession } from '../hooks/useQuizSession';
import { useAuth } from '../hooks/useAuth';
import QuizTimer from '../components/quiz/QuizTimer';
import QuestionCard from '../components/quiz/QuestionCard';
import Calculator from '../components/modals/Calculator';

export default function QuizPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const { 
    questions, currentIdx, timeLeft, userAnswers, isFinished,
    score, selectAnswer, nextQuestion, finishQuiz, actualTimeTaken
  } = useQuizSession(lessonId);

  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Navigate to results when finished
  useEffect(() => {
    if (isFinished) {
      // Pass state via navigate
      navigate('/result', { 
        state: { 
          lessonId,
          score,
          total: questions.length,
          actualTimeTaken,
          userAnswers
        }
      });
    }
  }, [isFinished, navigate, lessonId, score, questions.length, actualTimeTaken, userAnswers]);

  if (!questions || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full pt-20">
        <h2 className="text-xl font-bold text-slate-600">Không có câu hỏi nào</h2>
        <button onClick={() => navigate(-1)} className="mt-4 text-[#0058be]">Quay lại</button>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 bg-white">
        <div className="w-24 h-24 bg-blue-50 text-[#0058be] rounded-[32px] flex items-center justify-center shadow-lg mb-6 shadow-[#0058be]/20">
          <span className="material-symbols-outlined text-[48px]">quiz</span>
        </div>
        <h1 className="font-display font-black text-2xl text-slate-800 mb-2">Bắt đầu kiểm tra</h1>
        <p className="text-slate-500 font-sans text-center mb-10 max-w-xs">
          Bạn có 15 phút để hoàn thành {questions.length} câu hỏi. Hãy chuẩn bị sẵn sàng nhé!
        </p>
        <button 
          onClick={() => setHasStarted(true)}
          className="w-full max-w-xs bg-[#0058be] text-white font-display font-bold py-4 rounded-2xl tactile-button shadow-[0_4px_0_0_#004395] active:translate-y-[4px] active:shadow-none hover:bg-blue-700 transition-all text-lg"
        >
          Bắt đầu ngay
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  const isAnswered = !!userAnswers[currentQ.id];
  const isCorrect = userAnswers[currentQ.id] === currentQ.correctKey;
  const progressPercent = ((currentIdx) / questions.length) * 100;

  return (
    <div className="flex flex-col h-[calc(100vh-144px)] bg-[#f7f9fb] pb-safe">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex justify-between items-center border-b border-slate-100 shadow-sm z-10 shrink-0">
        <button onClick={() => finishQuiz()} className="text-slate-400 hover:text-slate-600 p-2 font-bold font-sans text-xs flex items-center gap-1 transition-colors">
          <span className="material-symbols-outlined text-sm">close</span>
          Kết thúc
        </button>
        <QuizTimer timeLeft={timeLeft} />
        <button onClick={() => setIsCalculatorOpen(true)} className="p-2 text-slate-500 bg-slate-50 rounded-xl tactile-card border-b-2 hover:text-[#0058be] hover:bg-blue-50 transition-colors">
          <span className="material-symbols-outlined text-lg block">calculate</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-1.5 shrink-0">
        <div 
          className="bg-[#0058be] h-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 scroll-hide">
        <QuestionCard 
          question={currentQ}
          selectedKey={userAnswers[currentQ.id] || null}
          isAnswered={isAnswered}
          isCorrect={isCorrect}
          onSelect={(key) => selectAnswer(currentQ.id, key)}
        />
      </div>

      {/* Footer Action */}
      <div className="p-4 bg-white border-t border-slate-100 shrink-0 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)] z-10">
        <button
          disabled={!isAnswered}
          onClick={nextQuestion}
          className="w-full bg-[#0058be] text-white font-display font-bold py-4 rounded-[20px] shadow-[0_4px_0_0_#004395] hover:bg-blue-700 active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none disabled:bg-slate-300 disabled:text-slate-500 flex justify-center items-center gap-2"
        >
          {currentIdx === questions.length - 1 ? 'Hoàn thành' : 'Tiếp tục'}
          {currentIdx !== questions.length - 1 && <span className="material-symbols-outlined">arrow_forward</span>}
        </button>
      </div>

      {isCalculatorOpen && <Calculator onClose={() => setIsCalculatorOpen(false)} />}
    </div>
  );
}
