import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { updatePassword } from 'firebase/auth';
import { User, GraduationCap, Code2, Briefcase, Info, Save, Lock } from 'lucide-react';
import { motion } from 'motion/react';

interface ProfileFormProps {
  user: any;
  onComplete: () => void;
}

export default function ProfileForm({ user, onComplete }: ProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    university: '',
    skills: '',
    majorProject: '',
    bio: '',
    role: 'member',
    isFirstLogin: true
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFormData({
          fullName: data.fullName || '',
          university: data.university || '',
          skills: data.skills?.join(', ') || '',
          majorProject: data.majorProject || '',
          bio: data.bio || '',
          role: data.role || 'member',
          isFirstLogin: data.isFirstLogin ?? true
        });
        if (data.isFirstLogin) {
          setShowPasswordReset(true);
        }
      } else {
        setShowPasswordReset(true);
      }
    };
    fetchProfile();
  }, [user.uid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (showPasswordReset && newPassword) {
        await updatePassword(auth.currentUser!, newPassword);
      }

      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(Boolean);
      
      const profileData = {
        ...formData,
        uid: user.uid,
        email: user.email,
        skills: skillsArray,
        isFirstLogin: false,
        updatedAt: new Date().toISOString(),
        status: 'searching'
      };

      await setDoc(doc(db, 'users', user.uid), profileData, { merge: true });
      onComplete();
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="app-card"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-sky-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Hồ sơ dự thi
            </h2>
            <p className="text-slate-400 text-sm">Cập nhật kỹ năng để teammates dễ dàng tìm thấy bạn</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {showPasswordReset && (
            <div className="p-6 glass rounded-2xl border-rose-500/20 bg-rose-500/5 space-y-4">
              <div className="flex items-center gap-2 text-rose-400 mb-2 font-bold uppercase text-xs tracking-widest">
                <Lock className="w-4 h-4" />
                <span>Thiết lập mật khẩu mới</span>
              </div>
              <p className="text-sm text-slate-400">Vì lý do bảo mật, vui lòng thiết lập mật khẩu riêng của bạn.</p>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="app-input focus:border-rose-500" 
                placeholder="Mật khẩu mới ít nhất 6 ký tự"
                required={showPasswordReset}
                minLength={6}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="label-caps">Họ và tên</label>
              <input 
                type="text" 
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className="app-input" 
                required
              />
            </div>

            <div className="space-y-2">
              <label className="label-caps">Trường đại học</label>
              <input 
                type="text" 
                value={formData.university}
                onChange={(e) => setFormData({...formData, university: e.target.value})}
                className="app-input" 
                placeholder="Ví dụ: ĐH Ngoại Thương (FTU)"
                required
              />
            </div>

            <div className="col-span-full space-y-2">
              <label className="label-caps">Kỹ năng (cách nhau bởi dấu phẩy)</label>
              <input 
                type="text" 
                value={formData.skills}
                onChange={(e) => setFormData({...formData, skills: e.target.value})}
                className="app-input" 
                placeholder="React, TypeScript, Node.js..."
                required
              />
            </div>

            <div className="col-span-full space-y-2">
              <label className="label-caps">Dự án nổi bật nhất</label>
              <input 
                type="text" 
                value={formData.majorProject}
                onChange={(e) => setFormData({...formData, majorProject: e.target.value})}
                className="app-input" 
                placeholder="Tên dự án bạn tâm đắc..."
              />
            </div>

            <div className="col-span-full space-y-2">
              <label className="label-caps">Giới thiệu ngắn về bản thân</label>
              <textarea 
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className="app-input resize-none" 
                placeholder="Đam mê công nghệ, mong muốn tìm đồng đội cùng chí hướng..."
              ></textarea>
            </div>

            <div className="col-span-full space-y-2">
              <label className="label-caps">Vai trò mong muốn</label>
              <div className="flex gap-4">
                {['leader', 'member'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setFormData({...formData, role})}
                    className={`flex-1 py-4 rounded-xl border transition-all font-bold uppercase tracking-widest text-xs ${
                      formData.role === role 
                        ? 'bg-sky-500 border-sky-500 text-white shadow-lg shadow-sky-500/20' 
                        : 'glass border-white/10 text-slate-500 hover:text-white'
                    }`}
                  >
                    {role === 'leader' ? 'Đội trưởng' : 'Thành viên'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="app-button-primary w-full py-4 text-base flex items-center justify-center gap-3"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Đang lưu hồ sơ...' : 'Xác nhận và Bắt đầu Matching'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
