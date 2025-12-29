
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useVertical } from '../hooks/useVertical';
import { LogOut, Moon, Sun, Menu, X, LayoutDashboard, Briefcase, Camera, Package, Users, Calendar, Receipt, Music, Share2 } from 'lucide-react';
import OrganizationSwitcher from './OrganizationSwitcher';
import { OfflineIndicatorCompact } from './OfflineIndicator';

const Header: React.FC = () => {
  const { state, navigateTo, signOut, toggleTheme } = useAppContext();
  const { t, features, vertical } = useVertical();
  const isLoggedIn = !!state.currentUser;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const currentView = state.currentView.view;
  const isWebsitePage = ['LANDING', 'FEATURES', 'PRICING', 'HELP', 'ABOUT', 'CONTACT'].includes(currentView);

  // Helper for mobile nav items
  const MobileNavItem: React.FC<{ view: 'DASHBOARD' | 'JOB_LIST' | 'INVENTORY' | 'PACKAGES' | 'TEAM' | 'CALENDAR' | 'RECEIPTS' | 'GALLERY_SETTINGS'; icon: React.ReactNode; label: string }> = ({ view, icon, label }) => (
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

  // On Desktop, if we are logged in and NOT on website pages, the Sidebar takes over. We hide this header.
  // If we are on website pages, we show it with glass effect.
  const headerClasses = isLoggedIn && !isWebsitePage
    ? "md:hidden bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-800"
    : isWebsitePage
    ? "glass-card shadow-glass border-b border-white/20 dark:border-white/10"
    : "bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-800";

  return (
    <header className={headerClasses}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Area */}
          <div className="flex items-center cursor-pointer" onClick={() => navigateTo('LANDING')}>
            <img src="/logoB.png" alt="Gear Base" className="h-20 w-auto object-contain dark:hidden" />
            <img src="/logo.png" alt="Gear Base" className="h-20 w-auto object-contain hidden dark:block" />
          </div>

          {/* Desktop Navigation (Website Pages) */}
          {isWebsitePage && (
             <div className="hidden md:flex items-center gap-6">
                 <button
                   onClick={() => navigateTo('FEATURES')}
                   className={`font-medium transition-colors ${currentView === 'FEATURES' ? 'text-teal-600 dark:text-teal-400' : 'text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400'}`}
                 >
                   Features
                 </button>
                 <button
                   onClick={() => navigateTo('PRICING')}
                   className={`font-medium transition-colors ${currentView === 'PRICING' ? 'text-teal-600 dark:text-teal-400' : 'text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400'}`}
                 >
                   Pricing
                 </button>
                 <button
                   onClick={() => navigateTo('HELP')}
                   className={`font-medium transition-colors ${currentView === 'HELP' ? 'text-teal-600 dark:text-teal-400' : 'text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400'}`}
                 >
                   Help
                 </button>
                 <button
                   onClick={() => navigateTo('ABOUT')}
                   className={`font-medium transition-colors ${currentView === 'ABOUT' ? 'text-teal-600 dark:text-teal-400' : 'text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400'}`}
                 >
                   About
                 </button>
                 <button
                   onClick={() => navigateTo('CONTACT')}
                   className={`font-medium transition-colors ${currentView === 'CONTACT' ? 'text-teal-600 dark:text-teal-400' : 'text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400'}`}
                 >
                   Contact
                 </button>
             </div>
          )}
          
          {/* Desktop Right Actions (Landing Page Only mostly) */}
          <div className="hidden md:flex items-center gap-4">
              {/* Offline status indicator - Only show when logged in */}
              {isLoggedIn && <OfflineIndicatorCompact />}

              {/* Organization Switcher - Only show when logged in */}
              {isLoggedIn && <OrganizationSwitcher currentUser={state.currentUser} />}

              <button
                onClick={toggleTheme}
                className="text-slate-500 hover:text-sky-500 dark:text-slate-400 dark:hover:text-sky-400 transition-colors p-2"
                title="Toggle Theme"
              >
                  {state.theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {isLoggedIn && isWebsitePage && (
                  <button
                    onClick={() => navigateTo('DASHBOARD')}
                    className="glass-button text-white font-bold py-2 px-6 rounded-lg transition-all shadow-glow-emerald hover:shadow-glow-teal hover:scale-105"
                  >
                      Go to Dashboard
                  </button>
              )}

              {!isLoggedIn && isWebsitePage && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigateTo('LOGIN')}
                      className="text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 font-medium px-4 py-2 transition-colors"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => navigateTo('SIGNUP')}
                      className="glass-button text-white font-bold py-2 px-6 rounded-lg transition-all shadow-glow-emerald hover:shadow-glow-teal hover:scale-105"
                    >
                      Get Started
                    </button>
                  </div>
              )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
             {/* Offline indicator for mobile */}
             {isLoggedIn && <OfflineIndicatorCompact />}

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
                {isWebsitePage && !isLoggedIn && (
                    <>
                        <button
                          onClick={() => { navigateTo('FEATURES'); setIsMenuOpen(false); }}
                          className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${currentView === 'FEATURES' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-teal-600 dark:text-teal-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                          Features
                        </button>
                        <button
                          onClick={() => { navigateTo('PRICING'); setIsMenuOpen(false); }}
                          className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${currentView === 'PRICING' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-teal-600 dark:text-teal-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                          Pricing
                        </button>
                        <button
                          onClick={() => { navigateTo('HELP'); setIsMenuOpen(false); }}
                          className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${currentView === 'HELP' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-teal-600 dark:text-teal-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                          Help
                        </button>
                        <button
                          onClick={() => { navigateTo('ABOUT'); setIsMenuOpen(false); }}
                          className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${currentView === 'ABOUT' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-teal-600 dark:text-teal-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                          About
                        </button>
                        <button
                          onClick={() => { navigateTo('CONTACT'); setIsMenuOpen(false); }}
                          className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${currentView === 'CONTACT' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-teal-600 dark:text-teal-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                          Contact
                        </button>
                        <div className="border-t border-slate-100 dark:border-slate-800 my-2 pt-2">
                          <button
                            onClick={() => { navigateTo('LOGIN'); setIsMenuOpen(false); }}
                            className="w-full py-3 text-slate-600 dark:text-slate-300 font-medium bg-slate-50 dark:bg-slate-800 rounded-lg"
                          >
                            Login
                          </button>
                          <button
                            onClick={() => { navigateTo('SIGNUP'); setIsMenuOpen(false); }}
                            className="w-full py-3 glass-button text-white font-bold rounded-lg mt-2"
                          >
                            Get Started
                          </button>
                        </div>
                    </>
                )}

                {isLoggedIn && !isWebsitePage && (
                    <>
                        <MobileNavItem view="DASHBOARD" icon={<LayoutDashboard size={18}/>} label="Dashboard" />
                        <MobileNavItem view="INVENTORY" icon={vertical === 'music' ? <Music size={18}/> : <Camera size={18}/>} label={t.inventory} />
                        {features.jobs && (
                            <MobileNavItem view="JOB_LIST" icon={<Briefcase size={18}/>} label={t.jobPlural} />
                        )}
                        {features.packages && (
                            <MobileNavItem view="PACKAGES" icon={<Package size={18}/>} label={t.packages} />
                        )}
                        <MobileNavItem view="TEAM" icon={<Users size={18}/>} label={t.team} />
                        {features.calendar && (
                            <MobileNavItem view="CALENDAR" icon={<Calendar size={18}/>} label="Calendar" />
                        )}
                        {features.receipts && (
                            <MobileNavItem view="RECEIPTS" icon={<Receipt size={18}/>} label="Receipts" />
                        )}
                        <MobileNavItem view="GALLERY_SETTINGS" icon={<Share2 size={18}/>} label="Public Gallery" />
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
                )}

                {isLoggedIn && isWebsitePage && (
                    <button
                      onClick={() => { navigateTo('DASHBOARD'); setIsMenuOpen(false); }}
                      className="w-full py-3 glass-button text-white font-bold rounded-lg"
                    >
                      Go to Dashboard
                    </button>
                )}
            </div>
        </div>
      )}
    </header>
  );
};

export default Header;
