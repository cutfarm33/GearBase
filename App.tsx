
import React, { useEffect, useState } from 'react';
import { useAppContext, supabase } from './context/AppContext';
import DashboardScreen from './screens/DashboardScreen';
import { registerServiceWorker, useAutoSync, useOnlineStatus, syncEngine } from './lib/offline';
import JobListScreen from './screens/JobListScreen';
import JobDetailScreen from './screens/JobDetailScreen';
import InventoryScreen from './screens/InventoryScreen';
import ItemDetailScreen from './screens/ItemDetailScreen';
import CheckoutScreen from './screens/CheckoutScreen';
import CheckinScreen from './screens/CheckinScreen';
import AddItemScreen from './screens/AddItemScreen';
import ImportInventoryScreen from './screens/ImportInventoryScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import VerifyEmailScreen from './screens/VerifyEmailScreen';
import EmailConfirmedScreen from './screens/EmailConfirmedScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import JobFormScreen from './screens/JobFormScreen';
import WebsiteScreen from './screens/WebsiteScreen';  // Used for LANDING view
import PackagesScreen from './screens/PackagesScreen';
import PackageFormScreen from './screens/PackageFormScreen';
import TeamScreen from './screens/TeamScreen';
import TeamManagementScreen from './screens/TeamManagementScreen';
import AcceptInvitationScreen from './screens/AcceptInvitationScreen';
import CalendarScreen from './screens/CalendarScreen';
import ReceiptsScreen from './screens/ReceiptsScreen';
import AddReceiptScreen from './screens/AddReceiptScreen';
import GallerySettingsScreen from './screens/GallerySettingsScreen';
import PublicGalleryScreen from './screens/PublicGalleryScreen';
import FeaturesScreen from './screens/FeaturesScreen';
import PricingScreen from './screens/PricingScreen';
import HelpScreen from './screens/HelpScreen';
import AboutScreen from './screens/AboutScreen';
import ContactScreen from './screens/ContactScreen';
import PrivacyScreen from './screens/PrivacyScreen';
import TermsScreen from './screens/TermsScreen';
import CheckoutSuccessScreen from './screens/CheckoutSuccessScreen';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { Loader, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const { state, isConfigured, navigateTo } = useAppContext();
  const { view, params } = state.currentView;
  const isLoggedIn = !!state.currentUser;
  const isWebsitePage = ['LANDING', 'FEATURES', 'PRICING', 'HELP', 'ABOUT', 'CONTACT', 'PRIVACY', 'TERMS', 'CHECKOUT_SUCCESS'].includes(view);
  const isOnline = useOnlineStatus();
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);

  // Get organization ID for sync
  const organizationId = state.currentUser?.active_organization_id || state.currentUser?.organization_id || null;

  // Auto-sync when coming online
  const { triggerSync } = useAutoSync(
    isConfigured ? supabase : null,
    organizationId
  );

  // Register service worker on mount + listen for updates
  useEffect(() => {
    registerServiceWorker();
    const handleSwUpdate = () => setShowUpdateBanner(true);
    window.addEventListener('swUpdate', handleSwUpdate);
    return () => window.removeEventListener('swUpdate', handleSwUpdate);
  }, []);

  // Initialize sync engine when user logs in
  useEffect(() => {
    if (isConfigured && isLoggedIn && organizationId) {
      syncEngine.initialize(supabase, organizationId);
    }
  }, [isConfigured, isLoggedIn, organizationId]);

  // Handle hash-based routing for public gallery (e.g., /#/gallery/{token})
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const galleryMatch = hash.match(/^#\/gallery\/(.+)$/);
      if (galleryMatch) {
        const token = galleryMatch[1];
        navigateTo('PUBLIC_GALLERY', { token });
      }
    };

    // Check on mount
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [navigateTo]);

  // Handle deep linking from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get('item');
    const jobId = urlParams.get('job');

    // Handle ?checkout=success (Stripe redirect after payment)
    if (urlParams.get('checkout') === 'success') {
      navigateTo('CHECKOUT_SUCCESS');
      window.history.replaceState({}, '', '/');
      return;
    }

    // Handle /reset-password route (from Supabase password reset email)
    if (window.location.pathname === '/reset-password') {
      navigateTo('RESET_PASSWORD');
      // Preserve hash fragment (contains recovery token) but clean the path
      const hash = window.location.hash;
      window.history.replaceState({}, '', '/' + hash);
      return;
    }

    // Handle public page routes for SEO
    const pathRoutes: Record<string, string> = {
      '/features': 'FEATURES',
      '/pricing': 'PRICING',
      '/help': 'HELP',
      '/about': 'ABOUT',
      '/contact': 'CONTACT',
      '/privacy': 'PRIVACY',
      '/terms': 'TERMS',
      '/login': 'LOGIN',
      '/signup': 'SIGNUP'
    };

    const pathname = window.location.pathname;
    if (pathRoutes[pathname]) {
      navigateTo(pathRoutes[pathname] as any);
      return;
    }

    // Only navigate if we have a deep link and user is logged in
    if (isLoggedIn && !state.isLoading) {
      if (itemId) {
        const itemIdNum = parseInt(itemId, 10);
        if (!isNaN(itemIdNum)) {
          navigateTo('ITEM_DETAIL', { itemId: itemIdNum });
          // Clear URL params to avoid re-triggering on navigation
          window.history.replaceState({}, '', window.location.pathname);
        }
      } else if (jobId) {
        const jobIdNum = parseInt(jobId, 10);
        if (!isNaN(jobIdNum)) {
          navigateTo('JOB_DETAIL', { jobId: jobIdNum });
          window.history.replaceState({}, '', window.location.pathname);
        }
      }
    }
  }, [isLoggedIn, state.isLoading, navigateTo]);

  // --- CRITICAL: Setup Check ---
  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-6">
        <div className="max-w-lg w-full bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-200 dark:border-slate-700 text-center">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Setup Required</h1>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
                Your app is almost ready! You need to connect it to your Supabase database.
            </p>
            
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 mb-8 text-left">
                <p className="font-bold text-amber-800 dark:text-amber-200 text-sm mb-3 uppercase tracking-wider">Action Required:</p>
                <ol className="list-decimal ml-4 space-y-2 text-sm text-amber-900 dark:text-amber-100">
                    <li>Open <code>context/AppContext.tsx</code></li>
                    <li>Find <code>SUPABASE_URL</code> and paste your <strong>Project URL</strong>.</li>
                    <li>Find <code>SUPABASE_ANON_KEY</code> and paste your <strong>anon public</strong> key.</li>
                </ol>
            </div>

            <button 
                onClick={() => window.location.reload()}
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg"
            >
                I've Updated the Code, Reload App
            </button>
        </div>
      </div>
    );
  }

  const renderView = () => {
    // Public Routes (Excluding Landing which is handled at root level)
    if (view === 'LOGIN') return <LoginScreen />;
    if (view === 'SIGNUP') return <SignupScreen />;
    if (view === 'VERIFY_EMAIL') return <VerifyEmailScreen />;
    if (view === 'EMAIL_CONFIRMED') return <EmailConfirmedScreen />;
    if (view === 'RESET_PASSWORD') return <ResetPasswordScreen />;
    if (view === 'ACCEPT_INVITATION') return <AcceptInvitationScreen />;

    // Website Pages (Public)
    if (view === 'FEATURES') return <FeaturesScreen />;
    if (view === 'PRICING') return <PricingScreen />;
    if (view === 'HELP') return <HelpScreen />;
    if (view === 'ABOUT') return <AboutScreen />;
    if (view === 'CONTACT') return <ContactScreen />;
    if (view === 'PRIVACY') return <PrivacyScreen />;
    if (view === 'TERMS') return <TermsScreen />;
    if (view === 'CHECKOUT_SUCCESS') return <CheckoutSuccessScreen />;

    // Public Gallery (no auth required)
    if (view === 'PUBLIC_GALLERY') return <PublicGalleryScreen token={params?.token} />;

    // Guard: If not logged in, force login
    if (!state.currentUser) {
        return <LoginScreen />;
    }
    
    // Guard: Global Loading State
    if (state.isLoading) {
       return (
         <div className="h-full flex flex-col items-center justify-center min-h-[50vh]">
             <Loader className="animate-spin text-sky-500 mb-4" size={48} />
             <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Loading Gear Base...</p>
         </div>
       );
    }

    // Protected Routes
    switch (view) {
      case 'DASHBOARD':
        return <DashboardScreen />;
      case 'CALENDAR':
        return <CalendarScreen />;
      case 'JOB_LIST':
        return <JobListScreen />;
      case 'JOB_DETAIL':
        return <JobDetailScreen jobId={params?.jobId} />;
      case 'INVENTORY':
        return <InventoryScreen />;
      case 'ITEM_DETAIL':
        return <ItemDetailScreen itemId={params?.itemId} />;
      case 'CHECKOUT':
        return <CheckoutScreen jobId={params?.jobId} />;
      case 'CHECKIN':
        return <CheckinScreen jobId={params?.jobId} />;
      case 'ADD_ITEM':
        return <AddItemScreen />;
      case 'IMPORT_INVENTORY':
        return <ImportInventoryScreen />;
      case 'ADD_JOB':
        return <JobFormScreen />;
      case 'EDIT_JOB':
        return <JobFormScreen jobId={params?.jobId} />;
      case 'PACKAGES':
        return <PackagesScreen />;
      case 'PACKAGE_FORM':
        return <PackageFormScreen kitId={params?.kitId} />;
      case 'TEAM':
        return <TeamScreen />;
      case 'TEAM_MANAGEMENT':
        return <TeamManagementScreen />;
      case 'RECEIPTS':
        return <ReceiptsScreen />;
      case 'ADD_RECEIPT':
        return <AddReceiptScreen receiptId={params?.receiptId} />;
      case 'GALLERY_SETTINGS':
        return <GallerySettingsScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  // Update banner shown when service worker detects a new version
  const updateBanner = showUpdateBanner ? (
    <div className="fixed top-0 left-0 right-0 z-50 bg-emerald-600 text-white px-4 py-2.5 flex items-center justify-center gap-3 text-sm font-medium shadow-lg">
      <RefreshCw size={16} />
      <span>A new version of Gear Base is available.</span>
      <button
        onClick={() => window.location.reload()}
        className="bg-white text-emerald-700 px-3 py-1 rounded-md text-xs font-bold hover:bg-emerald-50 transition-colors"
      >
        Refresh Now
      </button>
      <button
        onClick={() => setShowUpdateBanner(false)}
        className="ml-1 text-emerald-200 hover:text-white text-lg leading-none"
        aria-label="Dismiss"
      >
        &times;
      </button>
    </div>
  ) : null;

  // --- LAYOUT LOGIC ---

  // 0. PUBLIC GALLERY (Standalone full-page view, no app chrome)
  if (view === 'PUBLIC_GALLERY') {
    return <>{updateBanner}<PublicGalleryScreen token={params?.token} /></>;
  }

  // 1. WEBSITE PAGES (Landing, Features, Pricing, Help, About, Contact)
  if (isWebsitePage) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        {updateBanner}
        <Header />
        {view === 'LANDING' ? <WebsiteScreen /> : renderView()}
      </div>
    );
  }

  // 2. APP LAYOUT (Sidebar + Header + Content)
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-300">
      {updateBanner}

      {/* Desktop Sidebar - Only visible when logged in */}
      {isLoggedIn && (
        <div className="hidden md:block fixed inset-y-0 left-0 z-30">
          <Sidebar />
        </div>
      )}

      {/* Main Content Wrapper */}
      <div className={`flex flex-col min-h-screen ${isLoggedIn ? 'md:pl-64' : ''}`}>

        {/* Mobile/Tablet Header - Always visible on mobile, or if not logged in */}
        {/* If logged in, Header component handles its own md:hidden logic, but we render it here to be safe */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderView()}
        </main>
      </div>

    </div>
  );
};

export default App;