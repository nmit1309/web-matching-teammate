/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import Layout from './components/Layout';
import Login from './components/Login';
import ProfileForm from './components/ProfileForm';
import Discover from './components/Discover';
import MatchList from './components/MatchList';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('discover');
  const [profileComplete, setProfileComplete] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const [isTestMode, setIsTestMode] = useState(false);

  useEffect(() => {
    (window as any).bypassLogin = () => {
      setIsTestMode(true);
      setProfileComplete(true);
      setUserData({
        fullName: 'Thí sinh Test',
        university: 'CTE Academy',
        skills: ['React', 'Firebase', 'Frosted Glass'],
        majorProject: 'Teammate Finder',
        bio: 'Tôi đang trải nghiệm thử tính năng của ứng dụng!',
        role: 'leader',
        isFirstLogin: false
      });
    };

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        setIsTestMode(false);
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData(data);
            setProfileComplete(!data.isFirstLogin);
          } else {
            setProfileComplete(false);
          }
        } catch (err) {
          console.error("Error checking profile:", err);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const activeUser = user || (isTestMode ? { uid: 'test-user-id', email: 'test@example.com', displayName: 'Thí sinh Test' } : null);

  if (loading && !isTestMode) {
    return (
      <div className="min-h-screen bg-cyber-dark flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 bg-sky-500 rounded-2xl flex items-center justify-center font-bold text-2xl text-white shadow-lg shadow-sky-500/20 animate-bounce mb-8">
          C
        </div>
        <p className="mt-4 font-bold text-xs text-sky-400 uppercase tracking-[0.4em] animate-pulse">
          Synchronizing Hub...
        </p>
      </div>
    );
  }

  if (!activeUser) {
    return <Login />;
  }

  if (!profileComplete) {
    return (
      <Layout user={activeUser} activeTab="profile" setActiveTab={setActiveTab}>
        <ProfileForm user={activeUser} onComplete={() => setProfileComplete(true)} />
      </Layout>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'discover':
        return <Discover currentUser={activeUser} />;
      case 'matches':
        return <MatchList currentUser={activeUser} />;
      case 'profile':
        return (
          <div className="space-y-8">
             <div className="flex flex-col items-center">
                <ProfileForm user={activeUser} onComplete={() => {
                  setActiveTab('discover');
                  alert('Cập nhật hồ sơ thành công!');
                }} />
             </div>
          </div>
        );
      default:
        return <Discover currentUser={activeUser} />;
    }
  };

  return (
    <Layout user={activeUser} activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="h-full">
        {renderContent()}
      </div>
    </Layout>
  );
}
