import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useExamTemplates } from '../hooks/useExamTemplates';
import { useAppContext } from '../contexts/AppContext';

export default function ExamListPage() {
  const navigate = useNavigate();
  const { publishedExamTemplates, isLoading } = useExamTemplates();
  const { subjects } = useAppContext();

  const getSubjectName = (subjectId?: string) => {
    if (!subjectId) return 'Tổng hợp';
    return subjects.find(s => s.id === subjectId)?.name || 'Tổng hợp';
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.max(1, Math.round(seconds / 60));
    return `${minutes} phút`;
  };

  return (
    <div className="space-y-6 px-4 py-4 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-[#0058be] uppercase tracking-wider">Kiểm tra</p>
          <h1 className="font-display font-black text-2xl text-slate-800">Danh sách đề</h1>
        </div>
        <button
          onClick={() => navigate('/review/wrong')}
          className="h-11 px-4 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 font-bold text-xs flex items-center gap-2 hover:bg-rose-100 transition-colors"
        >
          <span className="material-symbols-outlined text-base">replay</span>
          Ôn câu sai
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-400">Đang tải danh sách đề...</div>
      ) : publishedExamTemplates.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-[24px] p-8 text-center">
          <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">quiz</span>
          <h2 className="font-display font-bold text-slate-700">Chưa có đề kiểm tra</h2>
          <p className="text-sm text-slate-500 mt-1">Giáo viên cần xuất bản đề trước khi học sinh có thể làm bài.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {publishedExamTemplates.map(exam => (
            <button
              key={exam.id}
              onClick={() => navigate(`/exam/${exam.id}`)}
              className="bg-white border border-slate-100 rounded-[24px] p-5 text-left shadow-sm hover:border-[#0058be]/30 hover:bg-blue-50/30 transition-all tactile-card"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0058be] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined">assignment</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full">
                  Đang mở
                </span>
              </div>
              <h2 className="font-display font-black text-lg text-slate-800 leading-snug">{exam.title}</h2>
              <p className="text-xs text-slate-500 mt-2">{getSubjectName(exam.subjectId)}</p>
              <div className="flex items-center gap-3 mt-4 text-xs font-bold text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">help</span>
                  {exam.questionIds.length} câu
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">timer</span>
                  {formatDuration(exam.durationSeconds)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
