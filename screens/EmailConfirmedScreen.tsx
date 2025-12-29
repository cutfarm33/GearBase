
import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { CheckCircle, ArrowRight } from 'lucide-react';

const EmailConfirmedScreen: React.FC = () => {
  const { navigateTo, supabase } = useAppContext();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // User is authenticated, redirect to dashboard after countdown
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              navigateTo('DASHBOARD');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);
      }
    };

    checkAuth();
  }, [supabase, navigateTo]);

  const handleContinue = () => {
    navigateTo('LOGIN');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg w-full max-w-md border border-slate-200 dark:border-slate-700 text-center">

        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-full">
            <CheckCircle size={64} className="text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        {/* Success Message */}
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          Email Confirmed!
        </h2>

        <p className="text-slate-600 dark:text-slate-400 mb-6 text-lg">
          Your email has been successfully verified. Welcome to GearBase!
        </p>

        {/* Features Preview */}
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 mb-6 text-left">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wide">
            You now have access to:
          </h3>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li className="flex items-start gap-2">
              <CheckCircle size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
              Unlimited inventory management
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
              Job and project tracking
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
              QR code check-in/check-out
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
              Digital signatures and history
            </li>
          </ul>
        </div>

        {/* Auto-redirect message or CTA */}
        {countdown > 0 ? (
          <div className="text-slate-500 dark:text-slate-400 text-sm mb-4">
            Redirecting to your dashboard in {countdown} seconds...
          </div>
        ) : null}

        {/* Manual Continue Button */}
        <button
          onClick={handleContinue}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg"
        >
          Continue to Login
          <ArrowRight size={20} />
        </button>

        {/* Help Text */}
        <p className="mt-6 text-xs text-slate-500 dark:text-slate-500">
          Already logged in? You'll be redirected automatically.
        </p>
      </div>
    </div>
  );
};

export default EmailConfirmedScreen;
