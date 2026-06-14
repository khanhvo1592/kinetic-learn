import React from 'react';
import { QuizQuestion } from '../../types';

interface SolutionItemProps {
  key?: React.Key; question: QuizQuestion;
  userAnswer: string;
  index: number;
}

export default function SolutionItem({ question, userAnswer, index }: SolutionItemProps) {
  const isCorrect = userAnswer === question.correctKey;

  return (
    <div className="bento-card rounded-[24px] p-5">
      <div className="flex gap-3 mb-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-display font-bold text-sm ${isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          {index + 1}
        </div>
        <h3 className="font-display font-bold text-slate-800 pt-1 leading-snug">
          {question.question}
        </h3>
      </div>

      <div className="space-y-2 mb-4">
        {question.options.map(opt => {
          const isUserSelection = opt.key === userAnswer;
          const isActualCorrect = opt.key === question.correctKey;
          
          let optClass = "bg-slate-50 text-slate-500 border border-slate-100";
          let icon = null;

          if (isActualCorrect) {
            optClass = "bg-green-50 border-green-500 text-green-700 font-medium";
            icon = <span className="material-symbols-outlined text-green-500 text-sm ml-auto">check_circle</span>;
          } else if (isUserSelection && !isActualCorrect) {
            optClass = "bg-red-50 border-red-300 text-red-700";
            icon = <span className="material-symbols-outlined text-red-500 text-sm ml-auto">cancel</span>;
          }

          return (
            <div key={opt.key} className={`flex items-center gap-3 p-3 rounded-xl ${optClass}`}>
              <div className="w-6 h-6 rounded-lg bg-white/80 flex items-center justify-center font-display font-bold text-xs shrink-0 shadow-sm">
                {opt.key}
              </div>
              <span className="text-sm">{opt.text}</span>
              {icon}
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-blue-500 text-sm">info</span>
          <span className="font-bold text-blue-800 text-xs uppercase tracking-wider">Giải thích</span>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed font-sans">
          {question.explanation}
        </p>
      </div>
    </div>
  );
}
