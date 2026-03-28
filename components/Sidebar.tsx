
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { useVertical } from '../hooks/useVertical';
import { LayoutDashboard, Briefcase, Package, Camera, LogOut, Sun, Moon, ChevronRight, Users, Calendar, HelpCircle, Receipt, Music, Share2, Trash2, Upload, X, MapPin } from 'lucide-react';

const Sidebar: React.FC = () => {
  const { state, dispatch, navigateTo, signOut, deleteAccount, toggleTheme, uploadLogo, removeLogo } = useAppContext();
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = React.useState('');
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [logoUploading, setLogoUploading] = React.useState(false);
  const logoInputRef = React.useRef<HTMLInputElement>(null);
  const { view } = state.currentView;
  const { t, features, vertical } = useVertical();

  // Helper to determine if a nav item is active based on the current view
  const isNavActive = (target: string) => {
      if (target === 'DASHBOARD') return view === 'DASHBOARD';
      if (target === 'JOB_LIST') return ['JOB_LIST', 'ADD_JOB', 'EDIT_JOB', 'JOB_DETAIL', 'CHECKOUT', 'CHECKIN'].includes(view);
      if (target === 'INVENTORY') return ['INVENTORY', 'ADD_ITEM', 'ITEM_DETAIL', 'IMPORT_INVENTORY'].includes(view);
      if (target === 'PACKAGES') return ['PACKAGES', 'PACKAGE_FORM'].includes(view);
      if (target === 'TEAM') return view === 'TEAM';
      if (target === 'CALENDAR') return view === 'CALENDAR';
      if (target === 'RECEIPTS') return ['RECEIPTS', 'ADD_RECEIPT'].includes(view);
      if (target === 'EQUIPMENT_MAP') return view === 'EQUIPMENT_MAP';
      if (target === 'GALLERY_SETTINGS') return view === 'GALLERY_SETTINGS';
      return false;
  };

  const NavItem: React.FC<{ target: 'DASHBOARD' | 'JOB_LIST' | 'INVENTORY' | 'PACKAGES' | 'TEAM' | 'CALENDAR' | 'RECEIPTS' | 'EQUIPMENT_MAP' | 'GALLERY_SETTINGS'; icon: React.ReactNode; label: string }> = ({ target, icon, label }) => {
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
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col items-center gap-2">
          <input
            type="file"
            accept="image/png,image/jpeg,image/svg+xml"
            className="hidden"
            ref={logoInputRef}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setLogoUploading(true);
              try { await uploadLogo(file); } catch (err: any) { alert('Logo upload failed: ' + err.message); }
              setLogoUploading(false);
              if (logoInputRef.current) logoInputRef.current.value = '';
            }}
          />
          {state.orgLogoUrl ? (
            <div className="relative group">
              <img src={state.orgLogoUrl} alt="Organization Logo" className="h-16 w-auto max-w-full object-contain cursor-pointer" onClick={() => dispatch({type: 'NAVIGATE', payload: {view: 'LANDING'}})} />
              <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button onClick={() => logoInputRef.current?.click()} className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 p-1 rounded-full hover:bg-slate-300 dark:hover:bg-slate-600" title="Change logo"><Upload size={12} /></button>
                <button onClick={async () => { await removeLogo(); }} className="bg-red-100 dark:bg-red-900/30 text-red-500 p-1 rounded-full hover:bg-red-200 dark:hover:bg-red-900/50" title="Remove logo"><X size={12} /></button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <img src="/logo.png" alt="Gear Base" className="h-16 w-auto object-contain cursor-pointer" onClick={() => dispatch({type: 'NAVIGATE', payload: {view: 'LANDING'}})} />
              <button
                onClick={() => logoInputRef.current?.click()}
                disabled={logoUploading}
                className="text-xs text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors flex items-center gap-1"
              >
                <Upload size={12} /> {logoUploading ? 'Uploading...' : 'Upload your logo'}
              </button>
            </div>
          )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Menu</p>
          <NavItem target="DASHBOARD" icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <NavItem
            target="INVENTORY"
            icon={vertical === 'music' ? <Music size={20} /> : <Camera size={20} />}
            label={t.inventory}
          />
          {features.jobs && (
            <NavItem target="JOB_LIST" icon={<Briefcase size={20} />} label={t.jobPlural} />
          )}
          {features.packages && (
            <NavItem target="PACKAGES" icon={<Package size={20} />} label={t.packages} />
          )}
          <NavItem target="TEAM" icon={<Users size={20} />} label={t.team} />
          {features.calendar && (
            <NavItem target="CALENDAR" icon={<Calendar size={20} />} label="Calendar" />
          )}
          <NavItem target="EQUIPMENT_MAP" icon={<MapPin size={20} />} label="Equipment Map" />
          {features.receipts && (
            <NavItem target="RECEIPTS" icon={<Receipt size={20} />} label="Receipts" />
          )}
          <NavItem target="GALLERY_SETTINGS" icon={<Share2 size={20} />} label="Public Gallery" />
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
          {/* Help Button */}
          <a
            href="mailto:support@mygearbase.com?subject=Support Request - Gear Base"
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

          <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-xs text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
          >
              <Trash2 size={14} />
              <span>Delete Account</span>
          </button>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-red-600 dark:text-red-400">Delete Account</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              This will permanently delete your account and all associated data including inventory items, jobs, receipts, and uploaded images. This action cannot be undone.
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Type <strong>DELETE</strong> to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
              placeholder="Type DELETE"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}
                className="flex-1 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    await deleteAccount();
                  } catch (err: any) {
                    alert('Failed to delete account: ' + (err.message || 'Unknown error'));
                    setIsDeleting(false);
                  }
                }}
                disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-medium text-sm hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
