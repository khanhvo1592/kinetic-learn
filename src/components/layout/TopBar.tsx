import React from 'react';
import { useAuth } from '../../hooks/useAuth';

interface TopBarProps {
  notificationsCount: number;
  onToggleNotifications: () => void;
  onOpenAdmin: () => void;
}

export default function TopBar({ notificationsCount, onToggleNotifications, onOpenAdmin }: TopBarProps) {
  const { isAdmin, isTeacher } = useAuth();

  return (
    <div className="sticky top-0 w-full bg-white/80 backdrop-blur-md z-40 border-b-2 border-slate-100 shadow-[0_10px_30px_-10px_rgba(0,88,190,0.05)]">
      <div className="flex justify-between items-center px-4 h-16">
        <div className="flex items-center gap-2">
          <div className="bg-[#0058be] text-white p-1.5 rounded-xl tactile-card">
            <span className="material-symbols-outlined text-xl">bolt</span>
          </div>
          <span className="font-display font-bold text-xl text-slate-800 tracking-tight">Kinetic</span>
        </div>
        
        <div className="flex items-center gap-3">
          {(isAdmin || isTeacher) && (
            <button 
              onClick={onOpenAdmin}
              className="p-2 text-slate-400 hover:text-[#0058be] hover:bg-blue-50 rounded-full transition-colors tactile-button border-b-2"
            >
              <span className="material-symbols-outlined">admin_panel_settings</span>
            </button>
          )}
          
          <button 
            onClick={onToggleNotifications}
            className="p-2 text-slate-600 hover:text-[#0058be] hover:bg-blue-50 rounded-full transition-colors relative tactile-button border-b-2"
          >
            <span className="material-symbols-outlined">notifications</span>
            {notificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
