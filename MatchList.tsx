import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { MessageSquare, User, ExternalLink, Mail, Award } from 'lucide-react';
import { motion } from 'motion/react';

export default function MatchList({ currentUser }: { currentUser: any }) {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'matches'), 
          where('uids', 'array-contains', currentUser.uid)
        );
        const snapshot = await getDocs(q);
        
        const matchProfiles = await Promise.all(
          snapshot.docs.map(async (matchDoc) => {
            const data = matchDoc.data();
            const otherUid = data.uids.find((id: string) => id !== currentUser.uid);
            const userDoc = await getDoc(doc(db, 'users', otherUid));
            return {
              id: matchDoc.id,
              ...userDoc.data(),
              matchData: data
            };
          })
        );
        
        setMatches(matchProfiles);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, [currentUser.uid]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="w-12 h-12 border-2 border-neon-blue border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs font-display text-neon-blue uppercase tracking-widest">Đang tải danh sách...</p>
    </div>
  );

  if (matches.length === 0) return (
    <div className="cyber-border bg-cyber-card p-12 text-center">
      <MessageSquare className="w-16 h-16 text-gray-700 mx-auto mb-4" />
      <h3 className="text-xl font-display text-gray-500 uppercase mb-2">Chưa có match nào</h3>
      <p className="text-gray-600 text-sm">Hãy tích cực swipe right để tìm thấy đồng đội lý tưởng!</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {matches.map((profile, i) => (
        <motion.div 
          key={profile.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass rounded-3xl overflow-hidden group flex flex-col hover:border-sky-500/30 transition-colors"
        >
          {/* Header Info */}
          <div className="relative h-32 bg-white/5">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.fullName} className="w-full h-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-sky-500/10 to-indigo-500/10 text-sky-400/30 text-4xl font-bold">
                {profile.fullName[0]}
              </div>
            )}
            <div className="absolute top-4 right-4 px-3 py-1 glass rounded-full text-sky-400 text-[10px] font-bold uppercase tracking-widest">
              CONNECTED
            </div>
          </div>

          <div className="p-6 space-y-4 flex-1 flex flex-col">
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-sky-400 transition-colors tracking-tight">{profile.fullName}</h3>
              <p className="text-xs text-slate-400 font-medium mb-3">{profile.university}</p>
              <div className="flex gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                  profile.role === 'leader' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-sky-500/10 border-sky-500/20 text-sky-400'
                }`}>
                  {profile.role === 'leader' ? 'Leader' : 'Member'}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="label-caps !mb-0 italic text-slate-500">Tech Stack</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills?.slice(0, 4).map((skill: string) => (
                  <span key={skill} className="px-2 py-0.5 glass rounded-md text-slate-400 text-[9px] font-medium border-white/5">
                    {skill}
                  </span>
                ))}
                {profile.skills?.length > 4 && <span className="text-[9px] text-slate-500 font-medium ml-1">+{profile.skills.length - 4}</span>}
              </div>
            </div>

            <div className="mt-auto pt-6 space-y-3">
              <div className="flex items-center gap-3 text-xs text-slate-400 glass p-3 rounded-xl border-white/5">
                <Mail className="w-4 h-4 text-sky-400" />
                <span className="truncate">{profile.email}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button className="app-button-primary !py-2 text-[11px] flex items-center justify-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Chat
                </button>
                <button className="app-button-secondary !py-2 text-[11px] flex items-center justify-center gap-2">
                  <User className="w-3.5 h-3.5" />
                  View
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
