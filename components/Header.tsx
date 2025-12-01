
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { LogOut, Moon, Sun, Menu, X, LayoutDashboard, Briefcase, Camera, Package, Users, Calendar } from 'lucide-react';

const Header: React.FC = () => {
  const { state, navigateTo, signOut, toggleTheme } = useAppContext();
  const isLoggedIn = !!state.currentUser;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isLanding = state.currentView.view === 'LANDING';

  // Helper for mobile nav items
  const MobileNavItem: React.FC<{ view: 'DASHBOARD' | 'JOB_LIST' | 'INVENTORY' | 'PACKAGES' | 'TEAM' | 'CALENDAR'; icon: React.ReactNode; label: string }> = ({ view, icon, label }) => (
    <button
      onClick={() => {
        navigateTo(view);
        setIsMenuOpen(false);
      }}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left ${
        state.currentView.view === view 
        ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 font-semibold' 
        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  // On Desktop, if we are logged in, the Sidebar takes over. We hide this header.
  // If we are on Landing page, we show it.
  const headerClasses = isLoggedIn && !isLanding 
    ? "md:hidden bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-800" 
    : "bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-800";

  return (
    <header className={headerClasses}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Area */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo('LANDING')}>
            <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                Gear Base
            </h1>
          </div>

          {/* Desktop Navigation (Landing Page Only) */}
          {isLanding && (
             <div className="hidden md:flex items-center gap-6">
                 <button onClick={() => {}} className="text-slate-600 dark:text-slate-400 hover:text-sky-500">Features</button>
                 <button onClick={() => {}} className="text-slate-600 dark:text-slate-400 hover:text-sky-500">Pricing</button>
             </div>
          )}
          
          {/* Desktop Right Actions (Landing Page Only mostly) */}
          <div className="hidden md:flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="text-slate-500 hover:text-sky-500 dark:text-slate-400 dark:hover:text-sky-400 transition-colors p-2"
                title="Toggle Theme"
              >
                  {state.theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {isLoggedIn && isLanding && (
                  <button 
                    onClick={() => navigateTo('DASHBOARD')}
                    className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-sm text-sm"
                  >
                      Go to Dashboard
                  </button>
              )}
              
              {!isLoggedIn && isLanding && (
                  <div className="flex gap-2">
                    <button onClick={() => navigateTo('LOGIN')} className="text-slate-600 dark:text-slate-300 hover:text-sky-500 font-medium px-3 py-2">Login</button>
                    <button onClick={() => navigateTo('SIGNUP')} className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-sm text-sm">Get Started</button>
                  </div>
              )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
             <button
                onClick={toggleTheme}
                className="text-slate-500 hover:text-sky-500 dark:text-slate-400 p-1"
              >
                  {state.theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
             <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-1"
             >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
             </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-4 shadow-lg animate-in slide-in-from-top-5">
            <div className="space-y-2">
                {isLoggedIn ? (
                    <>
                        <MobileNavItem view="DASHBOARD" icon={<LayoutDashboard size={18}/>} label="Dashboard" />
                        <MobileNavItem view="CALENDAR" icon={<Calendar size={18}/>} label="Calendar" />
                        <MobileNavItem view="JOB_LIST" icon={<Briefcase size={18}/>} label="Jobs" />
                        <MobileNavItem view="INVENTORY" icon={<Camera size={18}/>} label="Inventory" />
                        <MobileNavItem view="PACKAGES" icon={<Package size={18}/>} label="Packages" />
                        <MobileNavItem view="TEAM" icon={<Users size={18}/>} label="Team" />
                        <div className="border-t border-slate-100 dark:border-slate-800 my-2 pt-2">
                             <button 
                                onClick={() => {
                                    signOut();
                                    setIsMenuOpen(false);
                                }}
                                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                             >
                                <LogOut size={18} />
                                <span>Log Out</span>
                             </button>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col gap-3">
                        <button onClick={() => navigateTo('LOGIN')} className="w-full py-3 text-slate-600 dark:text-slate-300 font-medium bg-slate-50 dark:bg-slate-800 rounded-lg">Login</button>
                        <button onClick={() => navigateTo('SIGNUP')} className="w-full py-3 bg-sky-600 text-white font-bold rounded-lg">Create Account</button>
                    </div>
                )}
            </div>
        </div>
      )}
    </header>
  );
};

export default Header;
