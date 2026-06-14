import React, { useState, useEffect } from 'react';

interface StudyNotesProps {
  lessonId: string;
  lessonTitle: string;
  onClose: () => void;
}

export default function StudyNotes({ lessonId, lessonTitle, onClose }: StudyNotesProps) {
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedNotes = localStorage.getItem(`notes_${lessonId}`);
    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, [lessonId]);

  const handleSave = () => {
    localStorage.setItem(`notes_${lessonId}`, notes);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ ghi chú của bài học này?')) {
      setNotes('');
      localStorage.removeItem(`notes_${lessonId}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[24px] border-4 border-secondary p-6 w-full max-w-md shadow-[0_16px_0_0_#5516be]">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-2xl">draw</span>
            <div>
              <h3 className="font-display font-bold text-lg text-secondary">Sổ tay ghi chú</h3>
              <p className="text-xs text-slate-500 font-sans truncate max-w-[200px]">{lessonTitle}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Viết ghi chú, công thức hoặc các ý chính cần ghi nhớ tại đây..."
          className="w-full h-48 p-4 border-2 border-slate-200 rounded-xl font-sans text-sm focus:outline-none focus:border-secondary resize-none bg-yellow-50/30 mb-4"
        />

        <div className="flex justify-between items-center">
          <button 
            onClick={handleClear}
            className="text-xs font-semibold text-red-500 hover:text-red-700 font-display flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">delete</span> Xóa ghi chú
          </button>

          <div className="flex items-center gap-2">
            {saved && (
              <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">check</span> Đã lưu!
              </span>
            )}
            <button
              onClick={handleSave}
              className="bg-secondary text-white font-button px-5 py-2.5 rounded-full hover:bg-indigo-700 active:translate-y-[2px] transition-all shadow-[0_4px_0_0_#5516be] active:shadow-none"
            >
              Lưu ghi chú
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
