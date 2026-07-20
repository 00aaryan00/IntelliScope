import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { GlobalSearch } from '../shared/GlobalSearch';
import { SystemHealthToaster } from '../shared/SystemHealthToaster';
import { useTheme } from '../../lib/ThemeContext';
import { Sun, Moon, Bell } from 'lucide-react';
import { useAuth } from '../auth/AuthWrapper';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAuth = location.pathname === '/login' || location.pathname === '/onboarding';
  const { theme, toggleTheme } = useTheme();
  const { session } = useAuth();
  
  const getAvatarUrl = () => {
    const rawSeed = session?.user?.email || 'default';
    const seed = encodeURIComponent(rawSeed);
    const avatarGender = localStorage.getItem('avatar_gender') || 'neutral';
    
    if (avatarGender === 'male') return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}-m&backgroundColor=b6e3f4`;
    if (avatarGender === 'female') return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}-f&backgroundColor=ffdfbf`;
    
    return `https://api.dicebear.com/7.x/shapes/svg?seed=${seed}&backgroundColor=b6e3f4`;
  };

  if (isAuth) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans transition-colors duration-300">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 w-full pb-16 md:pb-0 overflow-x-hidden relative">
        <div className="absolute top-4 right-4 md:top-8 md:right-8 flex items-center gap-4 z-50">
          <Link to="/alerts" className="hidden md:flex p-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-sm relative group" title="Notifications">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
          </Link>
          <button onClick={toggleTheme} className="p-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm" title="Toggle Theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <Link to="/profile">
              <img src={getAvatarUrl()} alt="User Avatar" className="w-full h-full object-cover" />
            </Link>
          </div>
        </div>
        {children}
      </main>
      <BottomNav />
      <GlobalSearch />
      <SystemHealthToaster />
    </div>
  );
}
