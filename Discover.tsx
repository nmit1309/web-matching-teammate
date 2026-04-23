import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { MapPin, Code2, Briefcase, Heart, X, Sparkles } from 'lucide-react';

interface UserProfile {
  id: string;
  uid: string;
  fullName: string;
  email: string;
  university: string;
  skills: string[];
  majorProject?: string;
  bio?: string;
  avatarUrl?: string;
  status: string;
}

interface TeammateCardProps {
  key?: string;
  profile: UserProfile;
  onSwipe: (direction: 'left' | 'right') => void;
}

function TeammateCard({ profile, onSwipe }: TeammateCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  const likeOpacity = useTransform(x, [50, 150], [0, 1]);
  const nopeOpacity = useTransform(x, [-50, -150], [0, 1]);

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 100) {
      onSwipe('right');
    } else if (info.offset.x < -100) {
      onSwipe('left');
    }
  };

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
    >
      <div className="h-full glass rounded-[2.5rem] relative overflow-hidden flex flex-col group">
        {/* Swipe Indicators */}
        <motion.div style={{ opacity: likeOpacity }} className="absolute top-8 left-8 z-20 border-4 border-emerald-400 text-emerald-400 px-6 py-3 rounded-2xl font-bold text-4xl rotate-[-20deg] uppercase shadow-lg shadow-emerald-400/20 backdrop-blur-md">
          LIKE
        </motion.div>
        <motion.div style={{ opacity: nopeOpacity }} className="absolute top-8 right-8 z-20 border-4 border-rose-400 text-rose-400 px-6 py-3 rounded-2xl font-bold text-4xl rotate-[20deg] uppercase shadow-lg shadow-rose-400/20 backdrop-blur-md">
          NOPE
        </motion.div>

        {/* Profile Image / placeholder */}
        <div className="h-[45%] bg-white/5 relative overflow-hidden">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={profile.fullName} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-tr from-sky-400/20 to-indigo-500/20 flex items-center justify-center">
              <div className="w-24 h-24 rounded-3xl glass flex items-center justify-center shadow-lg">
                <span className="text-4xl font-bold text-white/50">{profile.fullName[0]}</span>
              </div>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#0c0e14] to-transparent">
            <h2 className="text-3xl font-bold text-white mb-1 tracking-tight">{profile.fullName}</h2>
            <div className="flex items-center gap-2 text-sky-400 text-sm font-medium">
              <MapPin className="w-4 h-4" />
              {profile.university}
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="flex-1 p-8 space-y-8 overflow-y-auto custom-scroll">
          <div className="space-y-4">
            <h3 className="label-caps !mb-0 flex items-center gap-2 italic">
              <Code2 className="w-3 h-3" /> Tech Stack
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill: string) => (
                <span key={skill} className="px-3 py-1 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-full text-xs font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="label-caps !mb-0 flex items-center gap-2 italic">
              <Briefcase className="w-3 h-3" /> Dự án tâm đắc
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed border-l-2 border-white/10 pl-4 py-1 italic">
              {profile.majorProject || 'Đang cập nhật nội dung...'}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="label-caps !mb-0 flex items-center gap-2 italic">
              <Sparkles className="w-3 h-3" /> Giới thiệu
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              {profile.bio || 'Người dùng này chưa cập nhật giới thiệu cá nhân.'}
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="p-8 pt-0 flex gap-4 mt-auto">
          <button onClick={() => onSwipe('left')} className="w-16 h-16 glass rounded-2xl flex items-center justify-center text-rose-500 hover:bg-rose-500/10 transition-all active:scale-90">
            <X className="w-8 h-8" />
          </button>
          <button onClick={() => onSwipe('right')} className="flex-1 h-16 bg-sky-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-sky-500/20 hover:bg-sky-600 transition-all active:scale-[0.98] font-bold text-lg">
            Connect
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function Discover({ currentUser }: { currentUser: any }) {
  const [queue, setQueue] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchFound, setMatchFound] = useState<UserProfile | null>(null);

  const mockUsers: UserProfile[] = [
    {
      id: 'mock-1',
      uid: 'mock-uid-1',
      fullName: 'Nguyễn Văn A',
      email: 'vana@example.com',
      university: 'ĐH Bách Khoa',
      skills: ['Python', 'AI', 'Machine Learning'],
      majorProject: 'Hệ thống nhận diện gương mặt',
      bio: 'Đam mê nghiên cứu các mô hình AI mới nhất.',
      status: 'searching',
      avatarUrl: 'https://picsum.photos/seed/user1/400/600'
    },
    {
      id: 'mock-2',
      uid: 'mock-uid-2',
      fullName: 'Lê Thị B',
      email: 'thib@example.com',
      university: 'ĐH Kinh Tế',
      skills: ['Marketing', 'Data Analysis', 'Pitching'],
      majorProject: 'Startup kết nối nông sản',
      bio: 'Máu lửa, sẵn sàng thử thách bản thân với cái mới.',
      status: 'searching',
      avatarUrl: 'https://picsum.photos/seed/user2/400/600'
    },
    {
      id: 'mock-3',
      uid: 'mock-uid-3',
      fullName: 'Trần Minh C',
      email: 'minhc@example.com',
      university: 'ĐH FPT',
      skills: ['React Native', 'Firebase', 'Java'],
      majorProject: 'App quản lý chi tiêu',
      bio: 'Fullstack developer đang tìm đồng đội cùng build sản phẩm.',
      status: 'searching',
      avatarUrl: 'https://picsum.photos/seed/user3/400/600'
    }
  ];

  useEffect(() => {
    const fetchQueue = async () => {
      setLoading(true);
      try {
        if (currentUser?.uid === 'test-user-id') {
          // In test mode, prepend mocks
          setQueue(mockUsers);
          setLoading(false);
          return;
        }

        // Fetch users who are searching
        const q = query(
          collection(db, 'users'), 
          where('status', '==', 'searching')
        );
        const snapshot = await getDocs(q);
        
        // Filter out current user and users already swiped
        const swipedQ = query(collection(db, 'swipes'), where('fromUid', '==', currentUser.uid));
        const swipedSnap = await getDocs(swipedQ);
        const swipedUids = swipedSnap.docs.map(doc => doc.data().toUid);
        
        const filtered = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as UserProfile))
          .filter(u => u.uid !== currentUser.uid && !swipedUids.includes(u.uid));
        
        setQueue(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQueue();
  }, [currentUser.uid]);

  const handleSwipe = async (direction: 'left' | 'right', targetProfile: UserProfile) => {
    // Optimistically remove from queue
    setQueue(prev => prev.filter(u => u.uid !== targetProfile.uid));

    if (currentUser?.uid === 'test-user-id') {
      // Mock match for test user on "like"
      if (direction === 'right' && Math.random() > 0.5) {
        setMatchFound(targetProfile);
      }
      return;
    }

    try {
      // Record swipe
      await addDoc(collection(db, 'swipes'), {
        fromUid: currentUser.uid,
        toUid: targetProfile.uid,
        type: direction === 'right' ? 'like' : 'dislike',
        createdAt: serverTimestamp()
      });

      // Check for match if it's a "like"
      if (direction === 'right') {
        const q = query(
          collection(db, 'swipes'), 
          where('fromUid', '==', targetProfile.uid),
          where('toUid', '==', currentUser.uid),
          where('type', '==', 'like')
        );
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          // IT'S A MATCH!
          const matchData = {
            uids: [currentUser.uid, targetProfile.uid],
            createdAt: serverTimestamp()
          };
          await addDoc(collection(db, 'matches'), matchData);
          setMatchFound(targetProfile);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center gap-6">
      <div className="w-16 h-16 border-4 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sky-400 font-bold tracking-widest animate-pulse">ĐANG QUÉT TÍN HIỆU...</p>
    </div>
  );

  if (queue.length === 0) return (
    <div className="h-full flex flex-col items-center justify-center p-12 text-center app-card">
      <div className="p-8 bg-sky-500/10 rounded-full border border-sky-500/20 mb-8 inline-block">
        <Sparkles className="w-12 h-12 text-sky-400 mx-auto" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-4 tracking-tight uppercase tracking-widest">Đã hết danh sách</h3>
      <p className="text-slate-400 text-sm mb-8 leading-relaxed max-w-sm">Hiện tại không còn thí sinh mới để hiển thị. Hãy quay lại sau khi hệ thống cập nhật thêm nhân lực nhé!</p>
      <button 
        onClick={() => window.location.reload()}
        className="app-button-secondary uppercase tracking-widest text-xs font-bold"
      >
        Làm mới tín hiệu
      </button>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 relative mx-auto w-full max-w-sm lg:max-w-md">
        <AnimatePresence>
          {queue.slice(0, 2).reverse().map((profile: UserProfile) => (
            <TeammateCard 
              key={profile.uid} 
              profile={profile} 
              onSwipe={(dir) => handleSwipe(dir, profile)} 
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Match Overlay */}
      <AnimatePresence>
        {matchFound && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-cyber-dark/95 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="cyber-border bg-cyber-card p-12 flex flex-col items-center text-center max-w-md shadow-[0_0_50px_rgba(0,242,255,0.3)]"
            >
              <div className="relative mb-8">
                <Heart className="w-24 h-24 text-neon-blue animate-pulse" />
                <Sparkles className="absolute -top-4 -right-4 w-8 h-8 text-neon-green animate-bounce" />
              </div>
              <h2 className="text-4xl font-display text-white uppercase mb-2 tracking-tighter">IT'S A MATCH!</h2>
              <p className="text-neon-blue mb-8 uppercase text-sm tracking-widest font-bold">Bạn và {matchFound.fullName} đã tìm thấy nhau</p>
              
              <div className="flex gap-4 mb-8">
                <div className="w-20 h-20 border-2 border-neon-blue p-1 shadow-neon-blue">
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center font-display text-2xl text-neon-blue">YOU</div>
                </div>
                <div className="flex items-center text-neon-pink">
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                    <Heart className="w-8 h-8 fill-current" />
                  </motion.div>
                </div>
                <div className="w-20 h-20 border-2 border-neon-blue p-1 shadow-neon-blue overflow-hidden">
                  {matchFound.avatarUrl ? (
                    <img src={matchFound.avatarUrl} alt={matchFound.fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center font-display text-2xl text-neon-blue">{matchFound.fullName[0]}</div>
                  )}
                </div>
              </div>

              <button 
                onClick={() => setMatchFound(null)}
                className="cyber-button w-full"
              >
                Tiếp tục tìm kiếm
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
