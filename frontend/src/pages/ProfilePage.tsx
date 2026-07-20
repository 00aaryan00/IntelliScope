import React, { useEffect, useState } from 'react';
import { User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthWrapper';

export function ProfilePage() {
  const navigate = useNavigate();
  const { session, signOut } = useAuth();
  const [avatarGender, setAvatarGender] = useState('neutral');

  useEffect(() => {
    const savedGender = localStorage.getItem('avatar_gender');
    if (savedGender) setAvatarGender(savedGender);
  }, []);

  const getAvatarUrl = () => {
    const rawSeed = session?.user?.email || 'default';
    const seed = encodeURIComponent(rawSeed);
    
    if (avatarGender === 'male') return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}-m&backgroundColor=b6e3f4`;
    if (avatarGender === 'female') return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}-f&backgroundColor=ffdfbf`;
    
    return `https://api.dicebear.com/7.x/shapes/svg?seed=${seed}&backgroundColor=b6e3f4`;
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="border-b border-slate-200 dark:border-slate-800 pb-6 pr-24">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Profile</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your personal account details.</p>
      </header>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center space-y-4 shadow-sm">
        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto border-4 border-white dark:border-slate-950 shadow-lg dark:shadow-xl overflow-hidden">
          <img src={getAvatarUrl()} alt="User Avatar" className="w-full h-full object-cover" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {session?.user?.email || "Guest User"}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {session ? "You are authenticated and your feed is personalized." : "You are browsing the dashboard anonymously."}
          </p>
        </div>
        
        <div className="pt-6">
          {session ? (
            <button onClick={() => signOut()} className="px-6 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 rounded-md font-medium transition-colors shadow-sm flex items-center gap-2 mx-auto">
              <LogOut size={16} /> Sign Out
            </button>
          ) : (
            <button onClick={() => navigate('/login')} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-medium transition-colors shadow-sm mx-auto">
              Sign In / Register
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
