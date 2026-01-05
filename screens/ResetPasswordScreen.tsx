
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { CheckCircle, AlertCircle } from 'lucide-react';

const ResetPasswordScreen: React.FC = () => {
  const { supabase, navigateTo } = useAppContext();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Check if we have a valid recovery session
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      // If there's no session and no hash fragment, redirect to login
      if (!session && !window.location.hash.includes('type=recovery')) {
        // Give Supabase a moment to process the recovery token
        setTimeout(async () => {
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          if (!retrySession) {
            setError('Invalid or expired reset link. Please request a new one.');
          }
        }, 1000);
      }
    };
    checkSession();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      setSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigateTo('LOGIN');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg w-full max-w-md border border-slate-200 dark:border-slate-700">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-6">Gear Base</h2>
        <h3 className="text-xl text-slate-500 dark:text-slate-300 text-center mb-8">Reset Password</h3>

        {error && (
          <div className="bg-red-500/10 text-red-500 dark:text-red-400 p-3 rounded mb-4 text-sm text-center break-words flex items-center justify-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center">
            <div className="bg-green-500/10 text-green-600 dark:text-green-400 p-6 rounded-lg mb-6 flex flex-col items-center gap-3">
              <CheckCircle size={48} />
              <p className="font-medium">Password reset successfully!</p>
              <p className="text-sm opacity-80">Redirecting to login...</p>
            </div>
            <button
              onClick={() => navigateTo('LOGIN')}
              className="text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300 font-medium"
            >
              Go to Login Now
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                New Password
              </label>
              <input
                type="password"
                autoComplete="new-password"
                className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 border border-slate-300 dark:border-slate-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="At least 6 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                autoComplete="new-password"
                className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 border border-slate-300 dark:border-slate-600"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 rounded-lg transition-colors shadow-lg disabled:bg-slate-400"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigateTo('LOGIN')}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm"
              >
                Back to Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordScreen;
