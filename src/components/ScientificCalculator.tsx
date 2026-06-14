import React, { useState } from 'react';

interface CalculatorProps {
  onClose: () => void;
}

export default function ScientificCalculator({ onClose }: CalculatorProps) {
  const [display, setDisplay] = useState('0');
  const [history, setHistory] = useState('');

  const handleNum = (num: string) => {
    if (display === '0' || display === 'Error') {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOp = (op: string) => {
    setDisplay(display + op);
  };

  const calculate = () => {
    try {
      // Simple and safe arithmetic extraction
      // Replace symbols for evaluation
      const expression = display
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'Math.PI')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/√\(/g, 'Math.sqrt(');

      // Using safe math parsing instead of eval is best but simple JS parser is fine for a calculator widget
      const result = Function(`"use strict"; return (${expression})`)();
      setHistory(display + ' =');
      setDisplay(Number(result).toLocaleString('vi-VN', { maximumFractionDigits: 5 }));
    } catch {
      setDisplay('Error');
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setHistory('');
  };

  const handleSpecial = (func: string) => {
    if (display === '0') {
      setDisplay(func + '(');
    } else {
      setDisplay(display + func + '(');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[24px] border-4 border-primary p-6 w-full max-w-sm shadow-[0_16px_0_0_#004395]">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">calculate</span>
            <h3 className="font-display font-bold text-lg text-primary">Máy tính đa năng</h3>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Display screen */}
        <div className="bg-slate-900 rounded-xl p-4 text-right font-mono mb-4 border-2 border-slate-700">
          <div className="text-slate-400 text-xs min-h-[16px] mb-1">{history || ' '}</div>
          <div className="text-white text-2xl font-bold overflow-x-auto truncate">{display}</div>
        </div>

        {/* Keyboard layout */}
        <div className="grid grid-cols-4 gap-2">
          {/* Scientific functions */}
          <button onClick={() => handleSpecial('sin')} className="p-3 bg-indigo-50 text-indigo-700 font-semibold rounded-xl text-xs hover:bg-indigo-100 active:scale-95 transition-all">sin</button>
          <button onClick={() => handleSpecial('cos')} className="p-3 bg-indigo-50 text-indigo-700 font-semibold rounded-xl text-xs hover:bg-indigo-100 active:scale-95 transition-all">cos</button>
          <button onClick={() => handleSpecial('tan')} className="p-3 bg-indigo-50 text-indigo-700 font-semibold rounded-xl text-xs hover:bg-indigo-100 active:scale-95 transition-all">tan</button>
          <button onClick={handleClear} className="p-3 bg-red-100 text-red-600 font-bold rounded-xl text-sm hover:bg-red-200 active:scale-95 transition-all">C</button>

          <button onClick={() => handleSpecial('√')} className="p-3 bg-indigo-50 text-indigo-700 font-semibold rounded-xl text-sm hover:bg-indigo-100 active:scale-95 transition-all">√</button>
          <button onClick={() => handleOp('(')} className="p-3 bg-indigo-50 text-indigo-700 font-semibold rounded-xl text-sm hover:bg-indigo-100 active:scale-95 transition-all">(</button>
          <button onClick={() => handleOp(')')} className="p-3 bg-indigo-50 text-indigo-700 font-semibold rounded-xl text-sm hover:bg-indigo-100 active:scale-95 transition-all">)</button>
          <button onClick={() => handleOp('÷')} className="p-3 bg-primary-container/10 text-primary font-bold rounded-xl text-sm hover:bg-primary-container/20 active:scale-95 transition-all">÷</button>

          {/* Numbers */}
          {[7, 8, 9].map((n) => (
            <button key={n} onClick={() => handleNum(n.toString())} className="p-4 bg-slate-100 text-slate-800 font-bold rounded-xl hover:bg-slate-200 active:scale-95 transition-all">{n}</button>
          ))}
          <button onClick={() => handleOp('×')} className="p-3 bg-primary-container/10 text-primary font-bold rounded-xl text-sm hover:bg-primary-container/20 active:scale-95 transition-all">×</button>

          {[4, 5, 6].map((n) => (
            <button key={n} onClick={() => handleNum(n.toString())} className="p-4 bg-slate-100 text-slate-800 font-bold rounded-xl hover:bg-slate-200 active:scale-95 transition-all">{n}</button>
          ))}
          <button onClick={() => handleOp('-')} className="p-3 bg-primary-container/10 text-primary font-bold rounded-xl text-sm hover:bg-primary-container/20 active:scale-95 transition-all">-</button>

          {[1, 2, 3].map((n) => (
            <button key={n} onClick={() => handleNum(n.toString())} className="p-4 bg-slate-100 text-slate-800 font-bold rounded-xl hover:bg-slate-200 active:scale-95 transition-all">{n}</button>
          ))}
          <button onClick={() => handleOp('+')} className="p-3 bg-primary-container/10 text-primary font-bold rounded-xl text-sm hover:bg-primary-container/20 active:scale-95 transition-all">+</button>

          <button onClick={() => handleNum('0')} className="p-4 bg-slate-100 text-slate-800 font-bold rounded-xl hover:bg-slate-200 active:scale-95 col-span-2 transition-all">0</button>
          <button onClick={() => handleNum('.')} className="p-4 bg-slate-100 text-slate-800 font-bold rounded-xl hover:bg-slate-200 active:scale-95 transition-all">.</button>
          <button onClick={calculate} className="p-4 bg-primary text-white font-bold rounded-xl hover:bg-blue-700 shadow-md active:translate-y-[2px] transition-all">=</button>
        </div>
      </div>
    </div>
  );
}
