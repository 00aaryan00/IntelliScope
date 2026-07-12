import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, Newspaper, Cpu, DollarSign, Briefcase, GraduationCap, 
  Landmark, Code, Terminal, MessageSquare, Building2, Bookmark, Settings, User 
} from 'lucide-react';

export function MobileMenuPage() {
  const navigate = useNavigate();

  return (
    <div className="p-4 pb-24 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <h1 className="text-2xl font-bold text-white mb-6">Menu</h1>
      
      {/* Login Prompt Banner */}
      <div className="p-4 bg-gradient-to-br from-blue-600/20 to-blue-900/10 border border-blue-500/20 rounded-xl mb-6">
        <p className="text-sm text-blue-200 mb-3 font-medium">Sign in to unlock personalized AI intelligence.</p>
        <button onClick={() => navigate('/login')} className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg shadow-sm">
          Sign In
        </button>
      </div>

      <div className="space-y-2">
        <MenuLink to="/" icon={<Home size={20} />} label="Dashboard" />
        <MenuLink to="/news" icon={<Newspaper size={20} />} label="AI News" />
        <MenuLink to="/models" icon={<Cpu size={20} />} label="Models & Releases" />
        <MenuLink to="/funding" icon={<DollarSign size={20} />} label="Funding" />
        <MenuLink to="/research" icon={<GraduationCap size={20} />} label="Research" />
      </div>
      
      <div className="pt-4 border-t border-slate-800 space-y-2">
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
      className={({ isActive }) => `w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-blue-600/10 text-blue-500 font-medium' : 'bg-slate-900/50 text-slate-300 hover:bg-slate-800'}`}
    >
      <div className="opacity-80">{icon}</div>
      <span className="text-base">{label}</span>
    </NavLink>
  );
}
