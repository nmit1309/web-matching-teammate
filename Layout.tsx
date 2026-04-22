import React from 'react';
import { LogOut, User, MessageCircle, Layers } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: any;
}

export default function Layout({ children, activeTab, setActiveTab, user }: LayoutProps) {
  const handleSignOut = () => signOut(auth);

  if (!user) return <>{children}</>;

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 glass h-full flex flex-col p-6 z-10 shrink-0">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-sky-500/20">
            C
          </div>
          <span className="text-xl font-semibold tracking-tight text-white uppercase font-display">
            CTE Match
          </span>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          {[
            { id: 'discover', label: 'Khám phá', icon: Layers },
            { id: 'matches', label: 'Đã Kết Nối', icon: MessageCircle },
            { id: 'profile', label: 'Hồ sơ', icon: User },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all font-medium ${
                activeTab === tab.id 
                ? 'bg-white/10 text-sky-400' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto">
          <div className="p-4 glass rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center font-bold">
              {user.email?.[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-white">{user.displayName || 'Thí sinh'}</p>
              <button 
                onClick={handleSignOut}
                className="text-[10px] uppercase font-bold text-slate-500 hover:text-rose-400 transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-hidden flex flex-col relative">
        <div className="flex justify-between items-center mb-8 relative z-10">
          <h1 className="text-3xl font-bold text-white capitalize">
            {activeTab === 'discover' ? 'Khám phá đối tác' : activeTab === 'matches' ? 'Kết nối của tôi' : 'Thiết lập hồ sơ'}
          </h1>
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 glass rounded-full flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
             </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scroll relative z-10 pr-2">
          {children}
        </div>
      </main>
    </div>
  );
}
