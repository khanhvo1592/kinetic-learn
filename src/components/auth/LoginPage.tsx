import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const { login, loginWithEmail, registerWithEmail, currentUser, isLoading } = useAuth();
  const navigate = useNavigate();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleGoogleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Google Login error details:', error);
      if (error.code === 'auth/unauthorized-domain') {
        alert(`Tên miền "${window.location.hostname}" chưa được cấp phép.\n\nĐăng nhập vào Firebase Console > Authentication > Settings > Authorized domains > Thêm "${window.location.hostname}" vào danh sách.`);
      } else {
        alert(`Đăng nhập Google thất bại: ${error.message || 'Vui lòng thử lại.'}`);
      }
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isLoginMode) {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password);
      }
    } catch (error: any) {
      console.error('Email Auth error details:', error);
      let msg = error.message || 'Vui lòng thử lại sau.';
      if (error.code === 'auth/invalid-credential') msg = 'Email hoặc mật khẩu không chính xác.';
      if (error.code === 'auth/email-already-in-use') msg = 'Email này đã được sử dụng. Vui lòng đăng nhập.';
      if (error.code === 'auth/weak-password') msg = 'Mật khẩu quá yếu, cần ít nhất 6 ký tự.';
      if (error.code === 'auth/operation-not-allowed') msg = 'Tính năng Đăng nhập bằng Email/Mật khẩu chưa được bật trên Firebase Console.';
      alert(`${isLoginMode ? 'Đăng nhập' : 'Đăng ký'} thất bại: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0058be]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-400/20 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3"></div>
      
      <div className="max-w-md w-full z-10">
        <div className="bg-white rounded-[32px] p-8 shadow-[0_20px_40px_-15px_rgba(0,88,190,0.1)] border-b-8 border-[#e2e8f0] flex flex-col items-center">
          
          <div className="w-16 h-16 bg-gradient-to-br from-[#0058be] to-cyan-500 rounded-[20px] flex items-center justify-center text-white shadow-lg mb-6 shadow-blue-500/30">
            <span className="material-symbols-outlined text-[32px]">bolt</span>
          </div>
          
          <h1 className="text-2xl font-display font-black text-slate-800 mb-2 tracking-tight text-center">Kinetic Learning</h1>
          <p className="text-slate-500 font-sans text-sm mb-6 text-center leading-relaxed">
            Nền tảng học tập thông minh với gia sư AI.
          </p>

          <form onSubmit={handleEmailAuth} className="w-full space-y-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase tracking-wider">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ví dụ: hocsinh@gmail.com"
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-[#0058be] focus:bg-white transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase tracking-wider">Mật khẩu</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự..."
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-[#0058be] focus:bg-white transition-all text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 bg-[#0058be] text-white font-bold py-3.5 rounded-xl tactile-button shadow-[0_4px_0_0_#004395] hover:bg-blue-700 active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                isLoginMode ? 'Đăng nhập' : 'Tạo tài khoản'
              )}
            </button>
          </form>

          <div className="w-full flex items-center justify-between gap-4 mb-6">
            <div className="h-px bg-slate-200 flex-1"></div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Hoặc</span>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 text-slate-700 font-bold py-3.5 rounded-xl tactile-card hover:bg-slate-50 active:border-slate-200 shadow-sm transition-all disabled:opacity-50"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          
          <div className="mt-6 text-center text-sm font-sans text-slate-500">
            {isLoginMode ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
            <button 
              type="button" 
              onClick={() => setIsLoginMode(!isLoginMode)}
              className="text-[#0058be] font-bold hover:underline"
            >
              {isLoginMode ? 'Đăng ký ngay' : 'Đăng nhập'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
