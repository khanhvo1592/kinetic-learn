import React from 'react';
import { QuizQuestion } from '../../types';
import MathText from '../common/MathText';

interface QuestionCardProps {
  question: QuizQuestion;
  selectedKey: string | null;
  isAnswered: boolean;
  isCorrect: boolean;
  onSelect: (key: string) => void;
}

export default function QuestionCard({ question, selectedKey, isAnswered, isCorrect, onSelect }: QuestionCardProps) {
  return (
    <div className={`bento-card rounded-[28px] p-6 mb-6 transition-transform duration-300 ${isAnswered && !isCorrect ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
      <div className="flex gap-4 mb-6">
        <div className="w-12 h-12 bg-blue-50 text-[#0058be] rounded-[16px] flex items-center justify-center font-display font-bold text-xl shrink-0">
          {question.num}
        </div>
        <h2 className="font-display font-bold text-xl text-slate-800 leading-snug pt-1">
          <MathText text={question.question} />
        </h2>
      </div>

      <div className="space-y-3">
        {question.options.map((opt) => {
          const isSelected = selectedKey === opt.key;
          
          let buttonClass = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300';
          let letterClass = 'bg-white text-slate-500 shadow-sm';
          let icon = null;

          if (isAnswered) {
            if (opt.key === question.correctKey) {
              buttonClass = 'bg-green-50 border-green-500 text-green-700 ring-4 ring-green-500/20 z-10 scale-[1.02]';
              letterClass = 'bg-green-500 text-white';
              icon = <span className="material-symbols-outlined text-green-500 font-bold ml-auto">check_circle</span>;
            } else if (isSelected) {
              buttonClass = 'bg-red-50 border-red-300 text-red-700';
              letterClass = 'bg-red-400 text-white';
              icon = <span className="material-symbols-outlined text-red-500 font-bold ml-auto">cancel</span>;
            } else {
              buttonClass = 'opacity-50 grayscale border-slate-200 bg-slate-50';
            }
          } else if (isSelected) {
            buttonClass = 'bg-blue-50 border-[#0058be] text-[#0058be]';
            letterClass = 'bg-[#0058be] text-white';
          }

          return (
            <button
              key={opt.key}
              disabled={isAnswered}
              onClick={() => onSelect(opt.key)}
              className={`w-full flex items-center gap-4 p-4 rounded-[20px] border-2 text-left transition-all duration-200 tactile-card ${buttonClass} ${!isAnswered ? 'active:scale-95' : ''}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-display font-bold shrink-0 transition-colors ${letterClass}`}>
                {opt.key}
              </div>
              <span className="font-sans font-medium text-[15px]"><MathText text={opt.text} /></span>
              {icon}
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <div className={`mt-6 p-5 rounded-[20px] ${isCorrect ? 'bg-green-50' : 'bg-red-50'} border-l-4 ${isCorrect ? 'border-green-500' : 'border-red-500'}`}>
          <div className="flex gap-2 items-center mb-2">
            <span className={`material-symbols-outlined ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {isCorrect ? 'auto_awesome' : 'lightbulb'}
            </span>
            <h4 className={`font-display font-bold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
              {isCorrect ? 'Chính xác! Làm tốt lắm' : 'Chưa đúng rồi, hãy xem giải thích nhé'}
            </h4>
          </div>
          <p className="text-slate-700 font-sans text-sm leading-relaxed">
            <MathText text={question.explanation} />
          </p>
        </div>
      )}
    </div>
  );
}
