import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { id: 'home', icon: 'home', label: 'Trang chủ', path: '/' },
    { id: 'courses', icon: 'school', label: 'Môn học', path: '/courses' },
    { id: 'tasks', icon: 'task_alt', label: 'Nhiệm vụ', path: '/tasks' },
    { id: 'profile', icon: 'person', label: 'Cá nhân', path: '/profile' }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t-2 border-slate-100 rounded-t-2xl pb-safe shadow-[0_-10px_20px_-5px_rgba(0,88,190,0.05)] z-40">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all duration-200 ${
                isActive ? 'text-[#0058be] bg-blue-50/50 scale-105' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className={`material-symbols-outlined text-2xl transition-transform ${isActive ? 'filled-icon scale-110' : ''}`} style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
                {item.icon}
              </span>
              <span className={`text-[10px] font-sans mt-1 ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
