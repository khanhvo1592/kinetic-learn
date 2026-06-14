import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import SubjectCard from '../components/cards/SubjectCard';
import LessonCard from '../components/cards/LessonCard';

export default function CoursesPage() {
  const navigate = useNavigate();
  const { subjects, lessons } = useAppContext();

  return (
    <div className="space-y-6 px-4 py-4">
      <div className="bg-gradient-to-br from-[#0058be] to-cyan-500 rounded-[28px] p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none">
          <span className="material-symbols-outlined text-[120px]">school</span>
        </div>
        <h1 className="text-2xl font-display font-black mb-2 relative z-10">Môn học</h1>
        <p className="text-sm font-sans opacity-90 relative z-10 max-w-[80%]">
          Khám phá vũ trụ tri thức với hàng trăm bài giảng trực quan và sinh động.
        </p>
      </div>

      {/* Subjects Grid */}
      <section>
        <h2 className="font-display font-bold text-lg text-slate-800 mb-3">Tất cả môn học</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {subjects.map(subject => (
            <SubjectCard 
              key={subject.id} 
              subject={subject} 
              onClick={() => {
                navigate(`/subject/${subject.id}`);
              }}
            />
          ))}
        </div>
      </section>

      {/* Suggested Lessons */}
      <section className="pb-4">
        <h2 className="font-display font-bold text-lg text-slate-800 mb-3">Gợi ý cho bạn</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lessons.slice(0, 6).map(lesson => (
            <div key={lesson.id} className="h-32">
              <LessonCard 
                lesson={lesson} 
                onClick={() => navigate(`/lesson/${lesson.id}`)} 
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
