import { 
  Home, 
  Newspaper, 
  Cpu, 
  DollarSign, 
  Briefcase, 
  GraduationCap, 
  Building2, 
  Landmark, 
  Code, 
  Terminal, 
  MessageSquare,
  Bookmark,
  Settings,
  User
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

export function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-slate-950 text-slate-300 border-r border-slate-800 p-4 sticky top-0">
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">I</div>
        <span className="text-xl font-bold text-white tracking-tight">IntelliScope</span>
      </div>

      {/* Search Indicator */}
      <div className="px-3 mb-6 hidden md:block">
        <button 
          onClick={() => document.dispatchEvent(new CustomEvent('open-global-search'))}
          className="w-full flex items-center justify-between px-3 py-2 bg-slate-900 border border-slate-800 rounded-md text-sm text-slate-400 hover:text-slate-300 hover:border-slate-600 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Search size={14} />
            <span className="text-xs font-medium">Search...</span>
          </div>
          <kbd className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 font-mono">⌘K</kbd>
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto space-y-6 pb-4">
        {/* Overview Zone */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Overview</p>
          <NavItem icon={<Home size={18} />} label="Dashboard" to="/" />
        </div>

        {/* Intelligence Modules Zone */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Intelligence</p>
          <NavItem icon={<Newspaper size={18} />} label="AI News" to="/news" />
          <NavItem icon={<Cpu size={18} />} label="Models & Releases" to="/models" />
          <NavItem icon={<DollarSign size={18} />} label="Funding" to="/funding" />
          <NavItem icon={<Briefcase size={18} />} label="VC Intelligence" to="/vc" />
          <NavItem icon={<GraduationCap size={18} />} label="Research" to="/research" />
          <NavItem icon={<Landmark size={18} />} label="Government" to="/gov" />
          <NavItem icon={<Code size={18} />} label="Open Source" to="/opensource" />
          <NavItem icon={<Terminal size={18} />} label="Dev Ecosystem" to="/dev" />
          <NavItem icon={<MessageSquare size={18} />} label="Social Intelligence" to="/social" />
          <NavItem icon={<Building2 size={18} />} label="Business Intel" to="/business" />
        </div>

        {/* Personal Zone */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Personal</p>
          <NavItem icon={<Bookmark size={18} />} label="Saved Intelligence" to="/saved" />
        </div>
      </div>

      {/* Login Prompt Banner */}
      <div className="mx-2 mt-4 p-3 bg-gradient-to-br from-blue-600/20 to-blue-900/10 border border-blue-500/20 rounded-lg">
        <p className="text-xs text-blue-200 mb-2 font-medium leading-relaxed">Sign in to unlock personalized AI intelligence and save objects.</p>
        <button onClick={() => navigate('/login')} className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded shadow-sm transition-colors">
          Sign In
        </button>
      </div>

      {/* System Zone */}
      <div className="pt-4 border-t border-slate-800 mt-4 space-y-1">
        <NavItem icon={<Settings size={18} />} label="Settings" to="/settings" />
        <NavItem icon={<User size={18} />} label="Profile" to="/profile" />
      </div>
    </aside>
  );
}

function NavItem({ icon, label, to }: { icon: React.ReactNode, label: string, to: string }) {
  return (
    <NavLink 
      to={to}
      className={({ isActive }) => `w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm ${isActive ? 'bg-blue-600/10 text-blue-500 font-medium' : 'hover:bg-slate-900 hover:text-white'}`}
    >
      {icon}
      {label}
    </NavLink>
  );
}
