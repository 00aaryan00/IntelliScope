import { Home, Search, Bookmark, Bell, Menu } from "lucide-react";
import { NavLink } from "react-router-dom";

export function BottomNav() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-2 z-50 transition-colors duration-300">
      <NavItem icon={<Home size={24} />} label="Home" to="/" />
      <NavItem icon={<Search size={24} />} label="Search" to="/search" />
      <NavItem icon={<Bookmark size={24} />} label="Saved" to="/saved" />
      <NavItem icon={<Bell size={24} />} label="Alerts" to="/alerts" />
      <NavItem icon={<Menu size={24} />} label="Menu" to="/menu" />
    </div>
  );
}

function NavItem({ icon, label, to }: { icon: React.ReactNode, label: string, to: string }) {
  return (
    <NavLink 
      to={to}
      className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full gap-1 transition-colors duration-300 ${isActive ? 'text-blue-600 dark:text-blue-500' : 'text-slate-500 dark:text-slate-400'}`}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </NavLink>
  );
}
