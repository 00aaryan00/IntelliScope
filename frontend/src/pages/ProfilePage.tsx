import React from 'react';
import { User, Mail, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ProfilePage() {
  const navigate = useNavigate();

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="border-b border-slate-200 dark:border-slate-800 pb-6 pr-24">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Profile</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your personal account details.</p>
      </header>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center space-y-4 shadow-sm">
        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto border-4 border-white dark:border-slate-950 shadow-lg dark:shadow-xl">
          <User size={40} className="text-slate-400 dark:text-slate-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Guest User</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">You are browsing the dashboard anonymously.</p>
        </div>
        <div className="pt-4">
          <button onClick={() => navigate('/login')} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-medium transition-colors shadow-sm">
            Sign In / Register
          </button>
        </div>
      </div>
    </div>
  );
}
