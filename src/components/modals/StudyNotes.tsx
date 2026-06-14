import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';

interface StudyNotesProps {
  lessonId: string;
  onClose: () => void;
}

export default function StudyNotes({ lessonId, onClose }: StudyNotesProps) {
  const { currentUser } = useAuth();
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    
    const fetchNote = async () => {
      const noteId = `${lessonId}_${currentUser.id}`;
      const noteRef = doc(db, 'notes', noteId);
      try {
        const snap = await getDoc(noteRef);
        if (snap.exists()) {
          setContent(snap.data().content);
          setSavedAt(snap.data().updatedAt);
        }
      } catch (error) {
        console.error('Error fetching note:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNote();
  }, [lessonId, currentUser]);

  const handleSave = async () => {
    if (!currentUser) return;
    setIsSaving(true);
    const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    
    const noteId = `${lessonId}_${currentUser.id}`;
    const noteRef = doc(db, 'notes', noteId);
    
    try {
      await setDoc(noteRef, {
        id: noteId,
        lessonId,
        userId: currentUser.id,
        content,
        updatedAt: now,
      });
      setSavedAt(now);
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#fef3c7] rounded-[24px] border-4 border-amber-300 p-6 w-full max-w-md shadow-[0_16px_0_0_#d97706] flex flex-col h-[500px]">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-600 text-2xl">edit_note</span>
            <h3 className="font-display font-bold text-lg text-amber-800">Sổ tay ghi chú</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-amber-200/50 flex items-center justify-center text-amber-700">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Paper texture container */}
        <div className="flex-1 bg-[url('https://www.transparenttextures.com/patterns/lined-paper.png')] bg-amber-50/50 rounded-2xl border-2 border-amber-200/50 p-4 shadow-inner flex flex-col min-h-0">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <span className="text-amber-600 animate-pulse">Đang tải...</span>
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ghi chú lại những điểm quan trọng của bài học này..."
              className="flex-1 w-full bg-transparent resize-none focus:outline-none text-slate-700 leading-8 font-sans"
              style={{ lineHeight: '2rem' }}
            />
          )}
        </div>

        {/* Footer controls */}
        <div className="flex justify-between items-center mt-4 flex-shrink-0">
          <span className="text-xs text-amber-700/60 font-sans italic">
            {savedAt ? `Đã lưu lúc ${savedAt}` : 'Chưa lưu'}
          </span>
          <button 
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="bg-amber-500 text-white px-5 py-2.5 rounded-xl font-bold tactile-button shadow-[0_4px_0_0_#b45309] hover:bg-amber-600 active:translate-y-[4px] active:shadow-none transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
            ) : (
              <span className="material-symbols-outlined text-sm">save</span>
            )}
            Lưu ghi chú
          </button>
        </div>
      </div>
    </div>
  );
}
