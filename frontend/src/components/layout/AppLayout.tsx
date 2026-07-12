import React from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { GlobalSearch } from '../shared/GlobalSearch';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAuth = location.pathname === '/login';

  if (isAuth) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 font-sans">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-50 font-sans">
      <Sidebar />
      <main className="flex-1 w-full pb-16 md:pb-0 overflow-x-hidden relative">
        {children}
      </main>
      <BottomNav />
      <GlobalSearch />
    </div>
  );
}
