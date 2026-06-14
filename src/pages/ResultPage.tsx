import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAppContext } from '../contexts/AppContext';
import { useStudents } from '../hooks/useStudents';
import ScoreCircle from '../components/quiz/ScoreCircle';

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { updateStudentXP, updateStudentStreak } = useStudents();
  const { subjects, quizzes } = useAppContext();
  
  const [xpAwarded, setXpAwarded] = useState(false);

  const state = location.state || {};
  const { lessonId, score = 0, actualTimeTaken = 0, userAnswers = {} } = state;
  const total = 10; // Score is out of 10

  const timeTakenMinutes = Math.floor(actualTimeTaken / 60);
  const timeTakenSeconds = actualTimeTaken % 60;
  const timeTaken = `${timeTakenMinutes.toString().padStart(2, '0')}:${timeTakenSeconds.toString().padStart(2, '0')}`;
  
  const xpReward = score * 5;

  useEffect(() => {
    if (currentUser && !xpAwarded) {
      updateStudentXP(currentUser.id, xpReward);
      updateStudentStreak(currentUser.id, 1);
      setXpAwarded(true);
    }
  }, [currentUser, xpAwarded, xpReward, updateStudentXP, updateStudentStreak]);

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col pt-12 pb-6 px-4">
      <div className="flex-1 max-w-md w-full mx-auto flex flex-col items-center">
        
        {score >= 8 ? (
          <div className="w-24 h-24 bg-yellow-100 text-yellow-500 rounded-full flex items-center justify-center mb-4 animate-bounce">
            <span className="material-symbols-outlined text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>trophy</span>
          </div>
        ) : (
          <div className="w-24 h-24 bg-blue-100 text-[#0058be] rounded-full flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
          </div>
        )}

        <h1 className="font-display font-black text-3xl text-slate-800 mb-2 text-center">
          {score >= 8 ? 'Tuyệt vời!' : 'Hoàn thành!'}
        </h1>
        <p className="text-slate-500 font-sans text-center mb-8">
          Bạn đã hoàn thành bài kiểm tra với thời gian {timeTaken}
        </p>

        <ScoreCircle score={score} total={total} />

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
            onClick={() => navigate('/solutions', { state: { lessonId, userAnswers } })}
            className="w-full bg-white border-2 border-slate-200 text-slate-700 font-display font-bold py-4 rounded-[20px] tactile-card hover:bg-slate-50 active:scale-95 transition-all flex justify-center items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">fact_check</span>
            Xem đáp án chi tiết
          </button>
          
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-[#0058be] text-white font-display font-bold py-4 rounded-[20px] tactile-button shadow-[0_4px_0_0_#004395] hover:bg-blue-700 active:translate-y-[4px] active:shadow-none transition-all"
          >
            Về màn hình chính
          </button>
        </div>
      </div>
    </div>
  );
}
