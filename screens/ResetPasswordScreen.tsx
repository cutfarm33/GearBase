
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
  const [sessionReady, setSessionReady] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Establish the recovery session from the reset link before showing the form.
  // The previous version only looked for `type=recovery` in the hash and never
  // did anything with it, so if detectSessionInUrl had not already consumed the
  // URL the form still submitted and updateUser() threw "Auth session missing!".
  useEffect(() => {
    let cancelled = false;

    const finish = (message?: string) => {
      if (cancelled) return;
      if (message) setError(message);
      else setSessionReady(true);
      setCheckingSession(false);
    };

    const establishSession = async () => {
      // getSession() awaits the client's own initialization, so if
      // detectSessionInUrl already handled the link we are done.
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        window.history.replaceState({}, '', '/');
        return finish();
      }

      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const queryParams = new URLSearchParams(window.location.search);
      const param = (key: string) => hashParams.get(key) || queryParams.get(key);

      // Supabase rejected the link itself (expired, already used, bad redirect).
      const linkError = param('error_description') || param('error');
      if (linkError) {
        return finish(decodeURIComponent(linkError.replace(/\+/g, ' ')));
      }

      // Implicit flow: tokens land in the hash fragment.
      const access_token = hashParams.get('access_token');
      const refresh_token = hashParams.get('refresh_token');
      if (access_token && refresh_token) {
        const { error: setSessionError } = await supabase.auth.setSession({ access_token, refresh_token });
        window.history.replaceState({}, '', '/');
        return finish(setSessionError ? setSessionError.message : undefined);
      }

      // PKCE flow: a single-use code lands in the query string.
      const code = queryParams.get('code');
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        window.history.replaceState({}, '', '/');
        return finish(exchangeError ? exchangeError.message : undefined);
      }

      finish('Invalid or expired reset link. Please request a new one.');
    };

    establishSession().catch((err: any) => {
      finish(err?.message || 'Could not verify this reset link. Please request a new one.');
    });

    return () => { cancelled = true; };
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

      // Drop the recovery session so the user signs in with the new password
      // instead of being silently carried into the app on a recovery token.
      await supabase.auth.signOut().catch(() => {});

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

        {checkingSession ? (
          <p className="text-center text-slate-500 dark:text-slate-400">Verifying reset link...</p>
        ) : !sessionReady ? (
          <div className="text-center">
            <button
              onClick={() => navigateTo('LOGIN')}
              className="text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300 font-medium"
            >
              Back to Login
            </button>
          </div>
        ) : success ? (
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
