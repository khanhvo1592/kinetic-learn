import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';
import AdminPanel from '../modals/AdminPanel';

export default function PageShell() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const notifications = [
    'Bắt đầu nhiệm vụ hàng ngày để duy trì chuỗi Streak 3 ngày nào!',
    'Hệ thống AI vừa cập nhật tài liệu ôn tập Hóa Học 8.',
    'Bạn đã hoàn thành bài tập Đạo Hàm đạt 85%.'
  ];

  return (
    <div className="w-full min-h-screen bg-[#f7f9fb] flex">
      {/* Sidebar for PC */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-md md:max-w-none mx-auto relative shadow-2xl md:shadow-none overflow-hidden pb-20 md:pb-0 flex flex-col">
        <TopBar 
          notificationsCount={notifications.length}
          onToggleNotifications={() => setShowNotifications(true)}
          onOpenAdmin={() => setIsAdminOpen(true)}
        />

        <div className="flex-1 overflow-y-auto scroll-hide md:p-6 lg:p-10">
          <Outlet />
        </div>

        {/* BottomNav for Mobile */}
        <BottomNav />
      </div>

      {/* Notifications Drawer */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowNotifications(false)}>
          <div className="w-full max-w-md md:rounded-3xl bg-white rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-full duration-300" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display font-bold text-xl text-slate-800">Thông báo</h3>
              <button onClick={() => setShowNotifications(false)} className="bg-slate-100 p-2 rounded-full text-slate-500 hover:bg-slate-200">
                <span className="material-symbols-outlined text-lg block">close</span>
              </button>
            </div>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto scroll-hide pb-4">
              {notifications.map((note, idx) => (
                <div key={idx} className="flex gap-4 items-start p-4 bg-slate-50 rounded-[20px] tactile-card border-b-2">
                  <div className="bg-blue-100 text-blue-600 p-2 rounded-xl mt-1 shrink-0">
                    <span className="material-symbols-outlined text-sm block">notifications_active</span>
                  </div>
                  <p className="text-slate-700 text-sm font-sans leading-relaxed">{note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Admin Panel */}
      {isAdminOpen && <AdminPanel onClose={() => setIsAdminOpen(false)} />}
    </div>
  );
}
