import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAppContext } from '../contexts/AppContext';
import LessonCard from '../components/cards/LessonCard';
import TaskCard from '../components/cards/TaskCard';
import LeaderboardCard from '../components/cards/LeaderboardCard';
import { useTasks } from '../hooks/useTasks';
import { calculateLevel } from '../types';
import confetti from 'canvas-confetti';

export default function HomePage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { lessons, allStudents } = useAppContext();
  const { tasks, toggleTask } = useTasks();
  const [cheeredStudents, setCheeredStudents] = useState<Record<string, boolean>>({});

  if (!currentUser) return null;

  const level = calculateLevel(currentUser.xp);
  const recentLessons = lessons.slice(0, 3);
  const leaderboard = [...allStudents].sort((a, b) => b.xp - a.xp).slice(0, 5);
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const dashOffset = 364.4 - (364.4 * progressPercent) / 100;

  const handleCheer = (name: string) => {
    setCheeredStudents(prev => {
      const isCheering = !prev[name];
      if (isCheering) {
        confetti({ particleCount: 25, angle: 60, spread: 40, origin: { x: 0.5, y: 0.85 } });
      }
      return { ...prev, [name]: isCheering };
    });
  };

  return (
    <div className="space-y-6 px-4 py-4">
      {/* Hero Greeting */}
      <div className="bg-gradient-to-br from-[#0058be] to-[#2170e4] rounded-[28px] p-6 text-white shadow-[0_16px_0_0_#004395] relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <p className="text-sm opacity-80 font-sans">Chào buổi sáng 🌅</p>
        <h1 className="text-2xl font-display font-bold mt-1">{currentUser.name}!</h1>
        <p className="text-sm opacity-90 mt-2 font-sans">Sẵn sàng chinh phục kiến thức hôm nay chưa nào? 🚀</p>
        <div className="flex gap-4 mt-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2 text-center">
            <p className="text-xs opacity-80">XP</p>
            <p className="font-display font-bold text-lg">{currentUser.xp.toLocaleString()}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2 text-center">
            <p className="text-xs opacity-80">Streak</p>
            <p className="font-display font-bold text-lg">🔥 {currentUser.streak}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2 text-center">
            <p className="text-xs opacity-80">Level</p>
            <p className="font-display font-bold text-lg">LV.{level}</p>
          </div>
        </div>
      </div>

      {/* Recent Lessons */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-display font-bold text-lg text-slate-800">📚 Bài học gần đây</h2>
          <button onClick={() => navigate('/courses')} className="text-[#0058be] text-sm font-bold font-sans hover:underline">
            Xem tất cả →
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scroll-hide">
          {recentLessons.map(lesson => (
            <div key={lesson.id} className="min-w-[280px]">
              <LessonCard lesson={lesson} onClick={() => navigate(`/lesson/${lesson.id}`)} />
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Tasks Summary */}
        <section className="bento-card rounded-[24px] p-5 h-fit">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg text-slate-800">✅ Nhiệm vụ hôm nay</h2>
            <svg width="52" height="52" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="58" fill="none" stroke="#e2e8f0" strokeWidth="4" />
              <circle cx="60" cy="60" r="58" fill="none" stroke="#0058be" strokeWidth="4"
                strokeDasharray="364.4" strokeDashoffset={dashOffset} strokeLinecap="round"
                className="progress-ring-circle" />
              <text x="60" y="65" textAnchor="middle" className="fill-[#0058be] font-display font-bold" fontSize="24">
                {progressPercent}%
              </text>
            </svg>
          </div>
          <div className="space-y-2">
            {tasks.slice(0, 3).map(task => (
              <TaskCard key={task.id} task={task} onToggle={() => toggleTask(task.id)} />
            ))}
          </div>
          {tasks.length > 3 && (
            <button onClick={() => navigate('/tasks')} className="w-full text-center text-[#0058be] font-bold text-sm mt-3 hover:underline">
              Xem tất cả {tasks.length} nhiệm vụ →
            </button>
          )}
        </section>

        {/* Weekly Leaderboard */}
        <section className="bento-card rounded-[24px] p-5 h-fit">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg text-slate-800">🏆 Bảng xếp hạng tuần</h2>
            <span className="text-xs text-slate-400 font-sans">Cập nhật liên tục</span>
          </div>
          <div className="space-y-2">
            {leaderboard.map((student, idx) => (
              <LeaderboardCard
                key={student.id}
                student={student}
                rank={idx + 1}
                isCurrentUser={student.id === currentUser.id}
                onCheer={() => handleCheer(student.name)}
                isCheered={cheeredStudents[student.name]}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
