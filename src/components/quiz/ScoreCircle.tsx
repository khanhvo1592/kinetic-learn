import React from 'react';

interface ScoreCircleProps {
  score: number;
  total: number;
}

export default function ScoreCircle({ score, total }: ScoreCircleProps) {
  const scorePercent = total > 0 ? (score / total) * 100 : 0;
  const scoreDashOffset = 565.48 - (565.48 * scorePercent) / 100;
  
  let scoreColor = '#4CAF50'; // Green for high score
  if (scorePercent < 50) scoreColor = '#F44336'; // Red for low score
  else if (scorePercent < 80) scoreColor = '#FF9800'; // Orange for medium score

  return (
    <div className="flex justify-center my-8">
      <div className="relative w-48 h-48 drop-shadow-xl">
        <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
          <circle cx="100" cy="100" r="90" fill="white" />
          <circle 
            cx="100" cy="100" r="90" 
            fill="none" stroke="#f1f5f9" strokeWidth="12" 
          />
          <circle 
            cx="100" cy="100" r="90" 
            fill="none" stroke={scoreColor} strokeWidth="12"
            strokeDasharray="565.48" strokeDashoffset={scoreDashOffset} 
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-display font-bold text-slate-800">{score}</span>
          <span className="text-sm font-sans text-slate-500 font-medium">điểm</span>
        </div>
      </div>
    </div>
  );
}
