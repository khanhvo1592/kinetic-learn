import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Discussion } from '../types';
import AITutor from '../components/modals/AITutor';
import Dictionary from '../components/modals/Dictionary';
import StudyNotes from '../components/modals/StudyNotes';

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { lessons } = useAppContext();
  const { currentUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'summary' | 'docs' | 'discussion'>('summary');
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isDictOpen, setIsDictOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);

  const [discussions, setDiscussions] = useState<Discussion[]>([]);

  const lesson = lessons.find(l => l.id === id);

  useEffect(() => {
    if (!lesson) return;
    const q = query(collection(db, `lessons/${lesson.id}/discussions`));
    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => doc.data() as Discussion);
      // Sort by createdAt descending
      data.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setDiscussions(data);
    });
    return () => unsubscribe();
  }, [lesson]);

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center h-full pt-20">
        <h2 className="text-xl font-bold text-slate-600">Bài học không tồn tại</h2>
        <button onClick={() => navigate(-1)} className="mt-4 text-[#0058be]">Quay lại</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Video Header Area */}
      <div className="w-full bg-slate-900 aspect-video relative flex items-center justify-center overflow-hidden flex-shrink-0 z-10 shadow-md">
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-md hover:bg-black/60 transition-colors z-20">
          <span className="material-symbols-outlined text-lg">arrow_back</span>
        </button>
        {lesson.videoUrl ? (
          <video src={lesson.videoUrl} className="w-full h-full object-cover" controls playsInline />
        ) : (
          <div className="text-center p-6">
            <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg ${lesson.iconBg} ${lesson.iconColor}`}>
              <span className="material-symbols-outlined text-3xl">{lesson.iconName}</span>
            </div>
            <h2 className="text-white font-display font-bold text-lg">{lesson.title}</h2>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col min-h-0 bg-[#f7f9fb]">
        {/* Floating Action Tools */}
        <div className="px-4 py-3 bg-white border-b border-slate-100 flex gap-2 justify-between shrink-0 shadow-sm z-10 relative">
          <button onClick={() => setIsDictOpen(true)} className="flex items-center gap-1 text-slate-500 hover:text-orange-600 hover:bg-orange-50 px-3 py-1.5 rounded-lg text-[10px] font-bold font-sans transition-colors tactile-button border-b-2">
            <span className="material-symbols-outlined text-base text-orange-500">translate</span> Từ Điển
          </button>
          <button onClick={() => setIsNotesOpen(true)} className="flex items-center gap-1 text-slate-500 hover:text-amber-600 hover:bg-amber-50 px-3 py-1.5 rounded-lg text-[10px] font-bold font-sans transition-colors tactile-button border-b-2">
            <span className="material-symbols-outlined text-base text-amber-500">edit_note</span> Ghi chú
          </button>
          <button onClick={() => setIsAIOpen(true)} className="flex items-center gap-1 text-[#0058be] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-[10px] font-bold font-sans transition-colors tactile-button border-b-2">
            <span className="material-symbols-outlined text-base">psychology</span> AI Tutor
          </button>
        </div>

        {/* Lesson Info */}
        <div className="px-5 py-5 bg-white shrink-0 relative z-0">
          <div className="flex items-center gap-2 text-[10px] font-bold text-[#0058be] uppercase tracking-wider mb-2">
            <span className="material-symbols-outlined text-sm">subject</span> {lesson.subjectName}
          </div>
          <h1 className="font-display font-bold text-2xl text-slate-800 leading-tight mb-2">
            {lesson.title}
          </h1>
          <p className="text-xs text-slate-500 font-sans">{lesson.chapter} • Lần học cuối: {lesson.lastStudied}</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-5 pt-2 bg-white shrink-0 z-0 relative sticky top-0">
          {[
            { id: 'summary', icon: 'subject', label: 'Tóm tắt' },
            { id: 'docs', icon: 'menu_book', label: 'Tài liệu' },
            { id: 'discussion', icon: 'forum', label: 'Thảo luận' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 pb-3 text-[11px] font-bold font-display uppercase tracking-wider transition-all border-b-[3px] flex items-center justify-center gap-1 ${
                activeTab === tab.id ? 'border-[#0058be] text-[#0058be]' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto px-5 py-6 no-scrollbar pb-24 z-0 relative">
          {activeTab === 'summary' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bento-card rounded-2xl p-4 bg-white/60">
                <p className="text-slate-700 text-sm leading-relaxed font-sans">{lesson.summary}</p>
              </div>
              {lesson.formulaTitle && (
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4">
                  <h4 className="font-display font-bold text-[#0058be] text-sm mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">functions</span> {lesson.formulaTitle}
                  </h4>
                  <ul className="space-y-2">
                    {lesson.formulas?.map((f, i) => (
                      <li key={i} className="flex gap-2 items-start text-sm text-slate-700 font-mono bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                        <span className="text-[#0058be] mt-0.5">•</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'docs' && (
            <div className="space-y-6 animate-fadeIn">
              {lesson.sections.map((sec, i) => (
                <div key={i}>
                  <h3 className="font-display font-bold text-lg text-slate-800 mb-3 text-cyan-800">{sec.title}</h3>
                  <div className="text-sm text-slate-700 leading-relaxed font-sans whitespace-pre-line bg-white p-4 rounded-[20px] shadow-sm border border-slate-100">
                    {(!sec.type || sec.type === 'text') && <>{sec.content}</>}
                    {sec.type === 'image' && <img src={sec.content} alt={sec.title} className="w-full h-auto rounded-xl" />}
                    {sec.type === 'audio' && <audio src={sec.content} controls className="w-full" />}
                    {sec.type === 'video_raw' && <video src={sec.content} controls className="w-full h-auto rounded-xl aspect-video" />}
                    {sec.type === 'video' && sec.content && (
                      <div className="aspect-video w-full rounded-xl overflow-hidden">
                        <iframe 
                          width="100%" 
                          height="100%" 
                          src={`https://www.youtube.com/embed/${(() => {
                            const match = sec.content.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
                            return (match && match[2].length === 11) ? match[2] : '';
                          })()}`} 
                          title="YouTube video player" 
                          frameBorder="0" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowFullScreen
                        ></iframe>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'discussion' && (
            <div className="space-y-4 animate-fadeIn">
              {discussions.map((d, i) => (
                <div key={i} className={`flex gap-3 ${d.userId === currentUser?.id ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm ${d.userId === currentUser?.id ? 'bg-[#0058be]' : 'bg-slate-400'}`}>
                    {d.userName.charAt(0)}
                  </div>
                  <div className={`flex flex-col max-w-[85%] ${d.userId === currentUser?.id ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] text-slate-500 font-bold mb-1 font-sans">{d.userName}</span>
                    <div className={`p-3 rounded-[20px] text-xs font-sans leading-relaxed shadow-sm ${
                      d.userId === currentUser?.id 
                        ? 'bg-[#0058be] text-white rounded-tr-sm' 
                        : 'bg-white text-slate-700 border border-slate-100 rounded-tl-sm'
                    }`}>
                      {d.text}
                    </div>
                  </div>
                </div>
              ))}
              <div className="h-4"></div>
            </div>
          )}
        </div>
      </div>

      {/* Footer sticky elements */}
      {activeTab === 'discussion' ? (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-100 z-10 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)]">
          <div className="flex gap-2">
            <input 
              type="text"
              placeholder="Đặt câu hỏi thảo luận..."
              className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#0058be] font-sans transition-colors"
            />
            <button className="w-10 h-10 bg-[#0058be] text-white rounded-xl flex items-center justify-center hover:bg-[#004395] shadow-[0_4px_0_0_#003370] active:translate-y-[4px] active:shadow-none transition-all">
              <span className="material-symbols-outlined text-sm">send</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-100 z-10 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)]">
          <button 
            onClick={() => navigate(`/quiz/${lesson.id}`)}
            className="w-full bg-[#0058be] text-white font-display font-bold py-3.5 rounded-xl tactile-button shadow-[0_4px_0_0_#004395] hover:bg-[#004a9f] active:translate-y-[4px] active:shadow-none transition-all flex justify-center items-center gap-2"
          >
            Bắt đầu bài kiểm tra
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
        </div>
      )}

      {/* Modals */}
      {isAIOpen && <AITutor onClose={() => setIsAIOpen(false)} initialTopic={lesson.title} />}
      {isDictOpen && <Dictionary onClose={() => setIsDictOpen(false)} />}
      {isNotesOpen && <StudyNotes lessonId={lesson.id} onClose={() => setIsNotesOpen(false)} />}
    </div>
  );
}
