
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { LayoutDashboard, Briefcase, Package, Camera, LogOut, Sun, Moon, ChevronRight, Users, Calendar, HelpCircle } from 'lucide-react';

const Sidebar: React.FC = () => {
  const { state, dispatch, navigateTo, signOut, toggleTheme } = useAppContext();
  const { view } = state.currentView;

  // Helper to determine if a nav item is active based on the current view
  const isNavActive = (target: string) => {
      if (target === 'DASHBOARD') return view === 'DASHBOARD';
      if (target === 'JOB_LIST') return ['JOB_LIST', 'ADD_JOB', 'EDIT_JOB', 'JOB_DETAIL', 'CHECKOUT', 'CHECKIN'].includes(view);
      if (target === 'INVENTORY') return ['INVENTORY', 'ADD_ITEM', 'ITEM_DETAIL', 'IMPORT_INVENTORY'].includes(view);
      if (target === 'PACKAGES') return ['PACKAGES', 'PACKAGE_FORM'].includes(view);
      if (target === 'TEAM') return view === 'TEAM';
      if (target === 'CALENDAR') return view === 'CALENDAR';
      return false;
  };

  const NavItem: React.FC<{ target: 'DASHBOARD' | 'JOB_LIST' | 'INVENTORY' | 'PACKAGES' | 'TEAM' | 'CALENDAR'; icon: React.ReactNode; label: string }> = ({ target, icon, label }) => {
      const isActive = isNavActive(target);
      return (
          <button
              onClick={() => navigateTo(target)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
              <div className={`${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>
                  {icon}
              </div>
              <span>{label}</span>
              {isActive && <ChevronRight size={16} className="ml-auto text-emerald-600 dark:text-emerald-400" />}
          </button>
      );
  };

  return (
    <aside className="w-64 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-colors duration-300 fixed left-0 top-0 z-30">
      {/* Logo Area */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-center cursor-pointer" onClick={() => dispatch({type: 'NAVIGATE', payload: {view: 'LANDING'}})}>
          <img src="/logo.png" alt="Gear Base" className="h-18 w-auto object-contain" />
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Menu</p>
          <NavItem target="DASHBOARD" icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <NavItem target="CALENDAR" icon={<Calendar size={20} />} label="Calendar" />
          <NavItem target="JOB_LIST" icon={<Briefcase size={20} />} label="Jobs" />
          <NavItem target="INVENTORY" icon={<Camera size={20} />} label="Inventory" />
          <NavItem target="PACKAGES" icon={<Package size={20} />} label="Packages" />
          <NavItem target="TEAM" icon={<Users size={20} />} label="Team" />
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
          {/* Help Button */}
          <a
            href="mailto:info@mygearbase.com?subject=Support Request - Gear Base"
            className="flex items-center gap-3 px-4 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/10"
          >
              <HelpCircle size={18} />
              <span>Help & Support</span>
          </a>

          {/* User Profile Snippet */}
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold shadow-md">
                  {state.currentUser?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{state.currentUser?.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{state.currentUser?.role}</p>
              </div>
          </div>

          <div className="flex gap-2">
            <button
                onClick={toggleTheme}
                className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all hover:shadow-sm"
                title="Toggle Theme"
            >
                {state.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                <span className="text-xs font-medium">Theme</span>
            </button>
            <button
                onClick={signOut}
                className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all hover:shadow-sm"
                title="Log Out"
            >
                <LogOut size={18} />
                <span className="text-xs font-medium">Log Out</span>
            </button>
          </div>
      </div>
    </aside>
  );
};

export default Sidebar;
