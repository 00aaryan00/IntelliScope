import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, Newspaper, Cpu, DollarSign, Briefcase, GraduationCap, 
  Landmark, Code, Terminal, MessageSquare, Building2, Bookmark, Settings, User, Sun, Moon
} from 'lucide-react';
import { useTheme } from '../lib/ThemeContext';

export function MobileMenuPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="p-4 pb-24 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Menu</h1>

      <div className="space-y-2">
        <MenuLink to="/" icon={<Home size={20} />} label="Dashboard" />
        <MenuLink to="/news" icon={<Newspaper size={20} />} label="AI News" />
        <MenuLink to="/models" icon={<Cpu size={20} />} label="Models & Releases" />
        <MenuLink to="/funding" icon={<DollarSign size={20} />} label="Funding" />
        <MenuLink to="/vc" icon={<Briefcase size={20} />} label="VC Intelligence" />
        <MenuLink to="/research" icon={<GraduationCap size={20} />} label="Research" />
        <MenuLink to="/gov" icon={<Landmark size={20} />} label="Government" />
        <MenuLink to="/opensource" icon={<Code size={20} />} label="Open Source" />
        <MenuLink to="/dev" icon={<Terminal size={20} />} label="Dev Ecosystem" />
        <MenuLink to="/social" icon={<MessageSquare size={20} />} label="Social Intelligence" />
        <MenuLink to="/business" icon={<Building2 size={20} />} label="Business Intel" />
      </div>
      
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <button onClick={toggleTheme} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors bg-slate-100 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800">
          <div className="opacity-80">{theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}</div>
          <span className="text-base">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <MenuLink to="/saved" icon={<Bookmark size={20} />} label="Saved Intelligence" />
        <MenuLink to="/settings" icon={<Settings size={20} />} label="Settings" />
        <MenuLink to="/profile" icon={<User size={20} />} label="Profile" />
      </div>
    </div>
  );
}

function MenuLink({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) {
  return (
    <NavLink 
      to={to}
      className={({ isActive }) => `w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-500 font-medium' : 'bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
    >
      <div className="opacity-80">{icon}</div>
      <span className="text-base">{label}</span>
    </NavLink>
  );
}
