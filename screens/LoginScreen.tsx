
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { trackLogin } from '../lib/analytics';

// Google "G" logo SVG component
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

const LoginScreen: React.FC = () => {
  const { supabase, navigateTo, checkAuth, isConfigured, state } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  
  // Track if component is mounted to prevent state updates on unmounted component
  const isMounted = useRef(true);
  useEffect(() => {
      return () => { isMounted.current = false; };
  }, []);

  // Auto-redirect if already logged in
  useEffect(() => {
      if (state.currentUser && !state.isLoading) {
          // This is a safety fallback. The App.tsx router normally handles this.
          navigateTo('DASHBOARD');
      }
  }, [state.currentUser, state.isLoading, navigateTo]);

  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetLoading(true);
    setResetSuccess(false);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;

      setResetSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send password recovery email');
    } finally {
      setResetLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        console.log("Attempting login for:", email);

        // Add timeout to prevent hanging forever
        const authPromise = supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password.trim()
        });

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Login request timed out. Please check your internet connection.')), 15000)
        );

        const { data, error: authError } = await Promise.race([authPromise, timeoutPromise]) as any;

        console.log("Auth response received:", { hasSession: !!data?.session, error: authError });

        if (authError) {
            console.error("Supabase Auth Error:", authError);
            if (authError.message === 'Invalid login credentials') {
                throw new Error('Invalid credentials. Please check your email/password or ensure you have configured the correct Supabase Project keys in AppContext.tsx');
            }
            throw authError;
        }

        if (!data.session) {
             setError('Login successful but no session created. Please check if your email is verified.');
             setLoading(false);
             return;
        }

        console.log("Calling checkAuth with session...");
        // Manually trigger auth check which updates GLOBAL state
        const success = await checkAuth(data.session);
        console.log("checkAuth completed, success:", success);

        // Always stop the loading spinner
        setLoading(false);

        if (success) {
            // Track successful login
            trackLogin('email');
            // Force navigation to dashboard - don't rely on context re-render
            console.log("Login successful, navigating to dashboard");
            navigateTo('DASHBOARD');
        } else {
            setError("Session established but profile loading failed.");
        }

    } catch (err: any) {
        console.error("Login Error Catch:", err);
        if (isMounted.current) {
            setError(err.message || 'Failed to log in');
            setLoading(false);
        }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg w-full max-w-md border border-slate-200 dark:border-slate-700">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-6">Gear Base</h2>
        <h3 className="text-xl text-slate-500 dark:text-slate-300 text-center mb-8">Log In</h3>
        
        {error && <div className="bg-red-500/10 text-red-500 dark:text-red-400 p-3 rounded mb-4 text-sm text-center break-words">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Email</label>
                <input 
                    type="email" 
                    autoComplete="email"
                    className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 border border-slate-300 dark:border-slate-600"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Password</label>
                <input 
                    type="password" 
                    autoComplete="current-password"
                    className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 border border-slate-300 dark:border-slate-600"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <input
                        id="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 text-sky-600 bg-slate-100 border-slate-300 rounded focus:ring-sky-500 dark:focus:ring-sky-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
                    />
                    <label htmlFor="remember-me" className="ml-2 text-sm font-medium text-slate-900 dark:text-slate-300">Remember me</label>
                </div>
                <button
                    type="button"
                    onClick={() => { setShowForgotPassword(true); setError(''); setResetSuccess(false); setResetEmail(email); }}
                    className="text-sm text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300"
                >
                    Forgot Password?
                </button>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 rounded-lg transition-colors shadow-lg disabled:bg-slate-400"
            >
                {loading ? 'Signing in...' : 'Sign In'}
            </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-slate-300 dark:border-slate-600"></div>
          <span className="px-4 text-sm text-slate-500 dark:text-slate-400">or</span>
          <div className="flex-1 border-t border-slate-300 dark:border-slate-600"></div>
        </div>

        {/* Google Sign In */}
        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
        >
          <GoogleIcon />
          {googleLoading ? 'Connecting...' : 'Continue with Google'}
        </button>

        <div className="mt-6 text-center">
            <p className="text-slate-500 dark:text-slate-400">Don't have an account?</p>
            <button
                onClick={() => navigateTo('SIGNUP')}
                className="text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300 font-medium mt-2"
            >
                Create Account
            </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg w-full max-w-md border border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-2">Reset Password</h3>
            <p className="text-slate-500 dark:text-slate-400 text-center mb-6 text-sm">
              Enter your email and we'll send you a link to reset your password.
            </p>

            {error && <div className="bg-red-500/10 text-red-500 dark:text-red-400 p-3 rounded mb-4 text-sm text-center break-words">{error}</div>}

            {resetSuccess ? (
              <div className="text-center">
                <div className="bg-green-500/10 text-green-600 dark:text-green-400 p-4 rounded mb-6">
                  Check your email for a password reset link. It may take a few minutes to arrive.
                </div>
                <button
                  onClick={() => { setShowForgotPassword(false); setResetSuccess(false); setError(''); }}
                  className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 rounded-lg transition-colors"
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    autoComplete="email"
                    className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 border border-slate-300 dark:border-slate-600"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 rounded-lg transition-colors shadow-lg disabled:bg-slate-400"
                >
                  {resetLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForgotPassword(false); setError(''); }}
                  className="w-full text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium py-2"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>
      )}
      
      <div className="mt-8 flex items-center gap-2 text-xs text-slate-400 justify-center flex-col">
          <div className="flex items-center gap-2">
            {isConfigured ? <Wifi size={12} className="text-green-500"/> : <WifiOff size={12} className="text-red-500"/>}
            {isConfigured ? 'Connected to Supabase' : 'Disconnected'}
          </div>
          {error && error.includes('Invalid credentials') && (
              <p className="text-amber-500 mt-2 flex items-center gap-1">
                  <AlertTriangle size={12}/> Tip: Check context/AppContext.tsx for correct keys.
              </p>
          )}
      </div>
    </div>
  );
};

export default LoginScreen;
