import React from 'react';

interface QuizTimerProps {
  timeLeft: number;
}

export default function QuizTimer({ timeLeft }: QuizTimerProps) {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isWarning = timeLeft < 60;

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-display font-bold text-lg tactile-card border-b-2 ${
      isWarning ? 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-100 text-slate-700 border-slate-200'
    }`}>
      <span className={`material-symbols-outlined ${isWarning ? 'animate-pulse' : ''}`}>
        timer
      </span>
      <span>{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</span>
    </div>
  );
}
