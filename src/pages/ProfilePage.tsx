import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useStudents } from '../hooks/useStudents';
import LeaderboardCard from '../components/cards/LeaderboardCard';
import AdminPanel from '../components/modals/AdminPanel';
import ProfileEditModal from '../components/modals/ProfileEditModal';

export default function ProfilePage() {
  const { currentUser, logout, isAdmin, isTeacher } = useAuth();
  const { getLeaderboard } = useStudents();
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  if (!currentUser) return null;

  const leaderboard = getLeaderboard();

  return (
    <div className="flex flex-col h-full bg-[#f7f9fb] px-4 py-4 space-y-6">
      
      <div className="flex flex-col md:flex-row gap-6 h-full mb-6">
        {/* Left Column: Profile Info & Actions */}
        <div className="flex flex-col gap-6 md:w-1/3 shrink-0">
          {/* Profile Header */}
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex flex-col items-center tactile-card border-b-[#e2e8f0]">
            <div className="relative mb-4">
              <img 
                src={currentUser.avatar || `https://ui-avatars.com/api/?name=${currentUser.name}&background=0058be&color=fff`} 
                alt={currentUser.name} 
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
              />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#0058be] text-white text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-md uppercase tracking-wider">
                {currentUser.role === 'admin' ? 'Quản trị viên' : currentUser.role === 'teacher' ? 'Giáo viên' : 'Học viên'}
              </div>
            </div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-display font-black text-2xl text-slate-800">{currentUser.name}</h1>
              <button 
                onClick={() => setIsEditProfileOpen(true)}
                className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-[#0058be] flex items-center justify-center transition-colors"
                title="Chỉnh sửa hồ sơ"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </button>
            </div>
            <p className="text-slate-500 font-sans text-sm">{currentUser.email}</p>

            <div className="flex gap-4 w-full mt-6">
              <div className="flex-1 bg-amber-50 rounded-2xl p-3 border-2 border-amber-100 text-center">
                <span className="material-symbols-outlined text-amber-500 mb-1">star</span>
                <p className="font-display font-bold text-amber-700 text-lg">{currentUser.xp}</p>
                <p className="text-[10px] text-amber-600/70 font-bold uppercase tracking-wider">Điểm XP</p>
              </div>
              <div className="flex-1 bg-orange-50 rounded-2xl p-3 border-2 border-orange-100 text-center">
                <span className="material-symbols-outlined text-orange-500 mb-1">local_fire_department</span>
                <p className="font-display font-bold text-orange-700 text-lg">{currentUser.streak}</p>
                <p className="text-[10px] text-orange-600/70 font-bold uppercase tracking-wider">Ngày học</p>
              </div>
            </div>
          </div>

          {/* Admin Panel Button */}
          {(isAdmin || isTeacher) && (
            <button 
              onClick={() => setIsAdminPanelOpen(true)}
              className="w-full bg-[#0058be] text-white font-display font-bold py-4 rounded-[20px] tactile-button shadow-[0_4px_0_0_#004395] hover:bg-blue-700 active:translate-y-[4px] active:shadow-none transition-all flex justify-center items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
              {isTeacher && !isAdmin ? 'Công cụ Giáo viên' : 'Mở trang quản trị'}
            </button>
          )}

          <button 
            onClick={logout}
            className="w-full bg-red-50 text-red-600 font-display font-bold py-4 rounded-[20px] border-2 border-red-100 tactile-card hover:bg-red-100 active:translate-y-[2px] transition-all flex justify-center items-center gap-2 shrink-0"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Đăng xuất
          </button>
        </div>

        {/* Right Column: Leaderboard */}
        <div className="bg-white rounded-[32px] p-5 shadow-sm border border-slate-100 flex-1 flex flex-col h-[500px] md:h-auto overflow-hidden">
          <div className="flex items-center gap-2 mb-4 shrink-0">
            <span className="material-symbols-outlined text-[#0058be]">leaderboard</span>
            <h2 className="font-display font-bold text-lg text-slate-800">Bảng xếp hạng</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 scroll-hide">
            {leaderboard.map((student, idx) => (
              <LeaderboardCard 
                key={student.id}
                student={student}
                rank={idx + 1}
                isCurrentUser={student.id === currentUser.id}
              />
            ))}
          </div>
        </div>
      </div>

      {isAdminPanelOpen && <AdminPanel onClose={() => setIsAdminPanelOpen(false)} />}
      {isEditProfileOpen && <ProfileEditModal onClose={() => setIsEditProfileOpen(false)} />}
    </div>
  );
}
