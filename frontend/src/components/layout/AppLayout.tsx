import React from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { GlobalSearch } from '../shared/GlobalSearch';
import { useTheme } from '../../lib/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAuth = location.pathname === '/login';
  const { theme, toggleTheme } = useTheme();

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
          <button onClick={toggleTheme} className="p-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm" title="Toggle Theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
          </div>
        </div>
        {children}
      </main>
      <BottomNav />
      <GlobalSearch />
    </div>
  );
}
