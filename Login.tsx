import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Shield, Lock, Mail, AlertTriangle, UserPlus, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError('Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại thông tin BTC cấp.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // In this specific system, we might want to use actual Firebase CreateUser if enabled
      // For now, let's inform the user it's for simulation or implement it
      setError('Tính năng đăng ký tự do đang được bảo trì. Vui lòng sử dụng tài khoản BTC cung cấp hoặc Chế độ Test.');
    } catch (err: any) {
      setError('Có lỗi xảy ra trong quá trình đăng ký.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTestMode = () => {
    (window as any).bypassLogin?.();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="glass rounded-3xl p-10 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {!isRegistering ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="flex flex-col items-center mb-10">
                  <div className="w-16 h-16 bg-sky-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-sky-500/20">
                    <Shield className="w-8 h-8" />
                  </div>
                  <h1 className="text-3xl font-bold text-white tracking-tight text-center">
                    TeamMatch Access
                  </h1>
                  <p className="text-slate-400 text-sm mt-3 text-center">Đăng nhập tài khoản BTC để bắt đầu tìm kiếm đồng đội.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <label className="label-caps">Email / Username</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="app-input pl-12" 
                        placeholder="username@gmail.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="label-caps">Mật khẩu</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="app-input pl-12" 
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-rose-400 leading-relaxed">{error}</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="app-button-primary w-full flex items-center justify-center gap-2"
                    >
                      {loading ? 'Đang kết nối...' : 'Bắt đầu ngay'}
                    </button>

                    <button 
                      type="button"
                      onClick={handleTestMode}
                      className="app-button-secondary w-full"
                    >
                      Chế độ Test (Bỏ qua đăng nhập)
                    </button>

                    <div className="flex items-center gap-3 py-2">
                      <div className="h-px bg-white/5 flex-1"></div>
                      <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Hoặc</span>
                      <div className="h-px bg-white/5 flex-1"></div>
                    </div>

                    <button 
                      type="button"
                      onClick={() => setIsRegistering(true)}
                      className="w-full p-4 rounded-xl border border-white/5 text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      Tạo tài khoản mới
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                 <button 
                  onClick={() => setIsRegistering(false)}
                  className="mb-6 flex items-center gap-2 text-slate-400 hover:text-sky-400 transition-colors text-xs font-bold uppercase tracking-widest"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Quay lại
                </button>

                <div className="flex flex-col items-center mb-10">
                  <div className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-500/20">
                    <UserPlus className="w-8 h-8" />
                  </div>
                  <h1 className="text-3xl font-bold text-white tracking-tight text-center">
                    Đăng ký tài khoản
                  </h1>
                  <p className="text-slate-400 text-sm mt-3 text-center">Tham gia cộng đồng để tìm kiếm đồng đội phù hợp nhất.</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-6">
                  <div className="space-y-2">
                    <label className="label-caps">Email đăng ký</label>
                    <input 
                      type="email" 
                      className="app-input" 
                      placeholder="email@example.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="label-caps">Mật khẩu</label>
                    <input 
                      type="password" 
                      className="app-input" 
                      placeholder="Tối thiểu 6 ký tự"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="label-caps">Xác nhận mật khẩu</label>
                    <input 
                      type="password" 
                      className="app-input" 
                      placeholder="Nhập lại mật khẩu"
                      required
                    />
                  </div>

                  {error && (
                    <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-rose-400 leading-relaxed">{error}</p>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="app-button-primary w-full bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/20"
                  >
                    Tạo tài khoản
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-10 pt-8 border-t border-white/5 flex justify-center items-center text-[10px] uppercase font-bold tracking-widest text-slate-600">
            SECURE LINK: ENCRYPTED
          </div>
        </div>
      </motion.div>
    </div>
  );
}
