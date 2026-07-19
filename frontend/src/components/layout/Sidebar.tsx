import { 
  Home, Newspaper, Cpu, DollarSign, Briefcase, GraduationCap, Building2, Landmark, Code, Terminal, MessageSquare, Bookmark, Settings, User, Search, Sun, Moon, RefreshCw, Activity
} from "lucide-react";
import { useLocation, NavLink } from "react-router-dom";
import { useTheme } from "../../lib/ThemeContext";
import { useState, useEffect } from "react";
import { getCategoryStats } from "../../lib/api";

export function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const [stats, setStats] = useState<Record<string, { total: number, new: number }>>({});

  useEffect(() => {
    const fetchStats = async () => {
      const data = await getCategoryStats();
      setStats(data);
    };
    fetchStats();
    
    // Poll every 60 seconds
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const location = useLocation();
  const [lastSeen, setLastSeen] = useState<Record<string, number>>(() => {
    try {
      return JSON.parse(localStorage.getItem('category_last_seen') || '{}');
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const category = location.pathname.replace('/', '');
    if (stats[category] && stats[category].total > 0) {
      const currentTotal = stats[category].total;
      if (lastSeen[category] !== currentTotal) {
        const newLastSeen = { ...lastSeen, [category]: currentTotal };
        setLastSeen(newLastSeen);
        localStorage.setItem('category_last_seen', JSON.stringify(newLastSeen));
      }
    }
  }, [location.pathname, stats, lastSeen]);

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 p-4 sticky top-0 transition-colors duration-300">
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">T</div>
          <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Tasknova</span>
        </div>
      </div>

      {/* Search Indicator */}
      <div className="px-3 mb-6 hidden md:block">
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('open-global-search'))}
          className="w-full flex items-center justify-between px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 transition-colors shadow-sm dark:shadow-none"
        >
          <div className="flex items-center gap-2">
            <Search size={14} />
            <span className="text-xs font-medium">Search...</span>
          </div>
          <kbd className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-mono">⌘K</kbd>
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto space-y-6 pb-4">
        {/* Overview Zone */}
        <div>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-2">Overview</p>
          <NavItem icon={<Home size={18} />} label="Dashboard" to="/" />
        </div>

        {/* Intelligence Modules Zone */}
        <div>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-2">Intelligence</p>
          <NavItem icon={<Newspaper size={18} />} label="News" to="/news" stats={stats.news} lastSeenTotal={lastSeen.news} />
          <NavItem icon={<Cpu size={18} />} label="Models & Releases" to="/models" stats={stats.models} lastSeenTotal={lastSeen.models} />
          <NavItem icon={<DollarSign size={18} />} label="Funding" to="/funding" stats={stats.funding} lastSeenTotal={lastSeen.funding} />
          <NavItem icon={<Briefcase size={18} />} label="VC Intelligence" to="/vc" stats={stats.vc} lastSeenTotal={lastSeen.vc} />
          <NavItem icon={<GraduationCap size={18} />} label="Research" to="/research" stats={stats.research} lastSeenTotal={lastSeen.research} />
          <NavItem icon={<Landmark size={18} />} label="Government" to="/gov" stats={stats.gov} lastSeenTotal={lastSeen.gov} />
          <NavItem icon={<Code size={18} />} label="Open Source" to="/opensource" stats={stats.opensource} lastSeenTotal={lastSeen.opensource} />
          <NavItem icon={<Terminal size={18} />} label="Dev Ecosystem" to="/dev" stats={stats.dev} lastSeenTotal={lastSeen.dev} />
          <NavItem icon={<MessageSquare size={18} />} label="Social Intelligence" to="/social" stats={stats.social} lastSeenTotal={lastSeen.social} />
          <NavItem icon={<Building2 size={18} />} label="Business Intel" to="/business" stats={stats.business} lastSeenTotal={lastSeen.business} />
        </div>

        {/* Personal Zone */}
        <div>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-2">Personal</p>
          <NavItem icon={<Bookmark size={18} />} label="Saved Intelligence" to="/saved" />
        </div>
      </div>

    {/* System Zone */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-4 space-y-1">
        <button 
          onClick={async () => {
            const btn = document.getElementById('sidebar-refresh-btn');
            if (btn) btn.innerHTML = 'Refreshing...';
            try {
              await fetch('http://localhost:8000/api/refresh', { method: 'POST' });
              window.location.reload();
            } catch (e) {
              console.error(e);
            }
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
        >
          <RefreshCw size={18} />
          <span id="sidebar-refresh-btn">Force Refresh Data</span>
        </button>
        <NavItem icon={<Settings size={18} />} label="Settings" to="/settings" />
        <NavItem icon={<Activity size={18} />} label="System Health" to="/health" />
        <NavItem icon={<User size={18} />} label="Profile" to="/profile" />
      </div>
    </aside>
  );
}

function NavItem({ icon, label, to, stats, lastSeenTotal }: { icon: React.ReactNode, label: string, to: string, stats?: { total: number, new: number }, lastSeenTotal?: number }) {
  let unseenCount = 0;
  if (stats && stats.total > 0) {
    if (lastSeenTotal !== undefined) {
      unseenCount = Math.max(0, stats.total - lastSeenTotal);
    } else {
      // Fallback to backend 24h count if we've never visited this tab before
      unseenCount = stats.new;
    }
  }

  return (
    <NavLink 
      to={to}
      className={({ isActive }) => `w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors text-sm ${isActive ? 'bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-500 font-medium' : 'hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'}`}
    >
      <div className="flex items-center gap-3">
        {icon}
        {label}
      </div>
      {stats && stats.total > 0 && (
        <div className="flex items-center gap-1.5 ml-2 shrink-0">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 group-hover:text-slate-500">
            {stats.total}
          </span>
          {unseenCount > 0 && (
            <span className="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800/50 flex items-center justify-center min-w-[28px]">
              +{unseenCount}
            </span>
          )}
        </div>
      )}
    </NavLink>
  );
}
