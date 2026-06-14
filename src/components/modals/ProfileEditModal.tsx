import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface ProfileEditModalProps {
  onClose: () => void;
}

export default function ProfileEditModal({ onClose }: ProfileEditModalProps) {
  const { currentUser, updateProfile } = useAuth();
  const [name, setName] = useState(currentUser?.name || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!currentUser) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim()) return;
    
    setIsSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        username: username.trim(),
        avatar: avatar.trim()
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi cập nhật hồ sơ!');
    } finally {
      setIsSaving(false);
    }
  };

  const AVATAR_OPTIONS = [
    `https://ui-avatars.com/api/?name=${name || 'A'}&background=0058be&color=fff`,
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=120',
    'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&q=80&w=120',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120',
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-8 duration-300">
        
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 text-[#0058be] rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined">edit_square</span>
            </div>
            <div>
              <h2 className="font-display font-black text-xl text-slate-800 tracking-tight leading-tight">Chỉnh sửa hồ sơ</h2>
              <p className="text-xs text-slate-500 font-sans">Cập nhật thông tin cá nhân của bạn</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-full flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-lg block">close</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto">
          {/* Avatar Selection */}
          <div className="space-y-3">
            <label className="font-bold text-slate-600 uppercase tracking-wider text-[11px]">Ảnh đại diện</label>
            <div className="flex gap-3 overflow-x-auto pb-2 scroll-hide">
              {AVATAR_OPTIONS.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatar(url)}
                  className={`w-14 h-14 rounded-full flex-shrink-0 border-4 transition-all overflow-hidden ${
                    avatar === url ? 'border-[#0058be] scale-110 shadow-md' : 'border-transparent hover:scale-105'
                  }`}
                >
                  <img src={url} alt="avatar" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <input 
              type="text" 
              placeholder="Hoặc dán URL ảnh của bạn vào đây..."
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#0058be] rounded-xl px-4 py-3 text-sm outline-none font-sans"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-600 uppercase tracking-wider text-[11px]">Họ và Tên</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border-2 border-slate-200 focus:border-[#0058be] rounded-xl px-4 py-3 text-sm outline-none font-bold text-slate-800"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-600 uppercase tracking-wider text-[11px]">Tên đăng nhập (Username)</label>
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white border-2 border-slate-200 focus:border-[#0058be] rounded-xl px-4 py-3 text-sm outline-none font-mono text-slate-600"
            />
          </div>

          <button 
            type="submit"
            disabled={isSaving}
            className="w-full h-14 bg-[#0058be] text-white font-display font-black rounded-2xl shadow-[0_4px_0_0_#004395] hover:bg-blue-700 active:translate-y-[4px] active:shadow-none transition-all flex justify-center items-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Lưu Thay Đổi <span className="material-symbols-outlined text-lg">check_circle</span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
