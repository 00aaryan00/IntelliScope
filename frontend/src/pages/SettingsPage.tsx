import React from 'react';
import { Settings, Bell, Shield, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function SettingsPage() {
  const navigate = useNavigate();

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="border-b border-slate-800 pb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">Settings</h1>
        <p className="text-slate-400 text-sm">Manage your application preferences and integrations.</p>
      </header>

      <div className="grid gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center gap-3">
            <Bell size={18} className="text-blue-400" />
            <h2 className="font-semibold text-white">Notifications</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-200">Daily AI Briefing</p>
                <p className="text-xs text-slate-400 mt-1">Receive a morning summary of high-impact AI events.</p>
              </div>
              <div className="w-10 h-6 bg-blue-600 rounded-full relative cursor-pointer opacity-50">
                <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center gap-3">
            <Shield size={18} className="text-purple-400" />
            <h2 className="font-semibold text-white">Security & Privacy</h2>
          </div>
          <div className="p-6">
             <p className="text-sm text-slate-400 mb-4">Login required to manage API keys and security settings.</p>
             <button onClick={() => navigate('/login')} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded text-sm transition-colors">Sign In</button>
          </div>
        </div>
      </div>
    </div>
  );
}
