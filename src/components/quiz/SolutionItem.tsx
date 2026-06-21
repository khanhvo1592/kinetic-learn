import React from 'react';
import { QuizQuestion } from '../../types';
import MathText from '../common/MathText';

interface SolutionItemProps {
  key?: React.Key; question: QuizQuestion;
  userAnswer: string | null;
  index: number;
}

export default function SolutionItem({ question, userAnswer, index }: SolutionItemProps) {
  const isCorrect = userAnswer === question.correctKey;
  const correctOption = question.options.find(opt => opt.key === question.correctKey);
  const userOption = question.options.find(opt => opt.key === userAnswer);

  return (
    <div className="bento-card rounded-[24px] p-5">
      <div className="flex gap-3 mb-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-display font-bold text-sm ${isCorrect ? 'bg-green-100 text-green-600' : userAnswer ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
          {index + 1}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${isCorrect ? 'bg-emerald-50 text-emerald-700' : userAnswer ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-500'}`}>
              {isCorrect ? 'Đúng' : userAnswer ? 'Sai' : 'Chưa làm'}
            </span>
            {!isCorrect && userAnswer && <span className="text-[10px] font-bold text-slate-500">Bạn chọn {userAnswer}</span>}
            {!isCorrect && <span className="text-[10px] font-bold text-emerald-700">Đáp án đúng {question.correctKey}</span>}
          </div>
          <h3 className="font-display font-bold text-slate-800 pt-1 leading-snug">
            <MathText text={question.question} />
          </h3>
        </div>
      </div>

      {!isCorrect && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 text-xs">
          <div className="rounded-xl border border-rose-100 bg-rose-50 p-3">
            <p className="font-black text-rose-700 mb-1">Bạn đã chọn</p>
            <p className="text-slate-700">{userOption ? <MathText text={`${userOption.key}. ${userOption.text}`} /> : 'Chưa chọn đáp án'}</p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
            <p className="font-black text-emerald-700 mb-1">Đáp án đúng</p>
            <p className="text-slate-700">{correctOption ? <MathText text={`${correctOption.key}. ${correctOption.text}`} /> : question.correctKey}</p>
          </div>
        </div>
      )}

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
              <span className="text-sm"><MathText text={opt.text} /></span>
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
          <MathText text={question.explanation} />
        </p>
      </div>
    </div>
  );
}
