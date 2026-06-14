import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { id: 'home', icon: 'home', label: 'Trang chủ', path: '/' },
    { id: 'courses', icon: 'school', label: 'Môn học', path: '/courses' },
    { id: 'tasks', icon: 'task_alt', label: 'Nhiệm vụ', path: '/tasks' },
    { id: 'profile', icon: 'person', label: 'Cá nhân', path: '/profile' }
  ];

  return (
    <div className="hidden md:flex flex-col w-64 bg-white border-r-2 border-slate-100 h-screen sticky top-0 shadow-[10px_0_20px_-5px_rgba(0,88,190,0.05)] z-40">
      {/* Logo Area */}
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-[#0058be] to-cyan-500 rounded-[12px] flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
          <span className="material-symbols-outlined text-[24px]">bolt</span>
        </div>
        <h1 className="font-display font-black text-xl text-slate-800 tracking-tight">Kinetic</h1>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-50 text-[#0058be] shadow-sm font-bold' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 font-medium'
              }`}
            >
              <span 
                className={`material-symbols-outlined text-[26px] transition-transform ${isActive ? 'filled-icon scale-110' : ''}`} 
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span className="text-[15px]">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Footer / Info */}
      <div className="p-6 mt-auto">
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
          <p className="text-xs text-slate-500 font-sans leading-relaxed">
            Hệ thống học tập Kinetic Learning © 2026. Phiên bản PC.
          </p>
        </div>
      </div>
    </div>
  );
}
