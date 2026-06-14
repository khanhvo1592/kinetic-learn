import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';

export default function SubjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { subjects, lessons } = useAppContext();

  const subject = subjects.find(s => s.id === id);

  // Group lessons by chapter
  const groupedLessons = useMemo(() => {
    if (!subject) return {};
    const filtered = lessons.filter(l => l.subjectId === subject.id);
    const grouped: Record<string, typeof lessons> = {};
    filtered.forEach(l => {
      if (!grouped[l.chapter]) grouped[l.chapter] = [];
      grouped[l.chapter].push(l);
    });
    return grouped;
  }, [subject, lessons]);

  if (!subject) {
    return (
      <div className="flex flex-col items-center justify-center h-full pt-20">
        <h2 className="text-xl font-bold text-slate-600">Môn học không tồn tại</h2>
        <button onClick={() => navigate(-1)} className="mt-4 text-[#0058be]">Quay lại</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-4 pb-24 h-full overflow-y-auto">
      <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white text-slate-600 flex items-center justify-center shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors">
        <span className="material-symbols-outlined text-xl">arrow_back</span>
      </button>

      <div className={`rounded-[28px] p-6 text-white shadow-lg relative overflow-hidden`} style={{ backgroundColor: subject.color }}>
        <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none">
          <span className="material-symbols-outlined text-[120px]">{subject.icon}</span>
        </div>
        <h1 className="text-3xl font-display font-black mb-2 relative z-10">{subject.name}</h1>
        <p className="text-sm font-sans opacity-90 relative z-10 max-w-[80%]">
          Tổng số bài học: {Object.values(groupedLessons).flat().length}
        </p>
      </div>

      <div className="space-y-6">
        {Object.keys(groupedLessons).length === 0 ? (
          <div className="text-center py-10 text-slate-500">Chưa có bài học nào cho môn này.</div>
        ) : (
          Object.keys(groupedLessons).map(chapter => (
            <div key={chapter} className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-slate-100">
              <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 font-display font-bold text-slate-800 text-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0058be]">auto_stories</span>
                {chapter}
              </div>
              <div className="p-4 space-y-3">
                {groupedLessons[chapter].map((lesson, idx) => (
                  <div 
                    key={lesson.id} 
                    onClick={() => navigate(`/lesson/${lesson.id}`)}
                    className="flex gap-4 p-4 rounded-2xl border border-slate-100 hover:border-[#0058be]/30 hover:bg-blue-50/50 transition-all cursor-pointer group"
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110 ${lesson.iconBg} ${lesson.iconColor}`}>
                      <span className="material-symbols-outlined text-2xl">{lesson.iconName}</span>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h4 className="font-bold text-slate-800 text-sm leading-tight truncate">{lesson.title}</h4>
                      <p className="text-[11px] text-slate-500 font-sans mt-0.5 truncate">{lesson.summary}</p>
                    </div>
                    <div className="flex items-center text-slate-300 group-hover:text-[#0058be] transition-colors">
                      <span className="material-symbols-outlined">chevron_right</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
