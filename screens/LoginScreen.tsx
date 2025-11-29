
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';

const LoginScreen: React.FC = () => {
  const { supabase, navigateTo, checkAuth, isConfigured, state } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        console.log("Attempting login for:", email);
        const { data, error: authError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password.trim()
        });

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
        
        // Manually trigger auth check which updates GLOBAL state
        const success = await checkAuth(data.session);
        
        if (!success) {
            // This should logically never happen with the new fail-safe processUserSession
            setError("Session established but profile loading failed.");
            setLoading(false);
        }
        // If success is true, the AppContext will trigger a re-render 
        // and App.tsx will see currentUser is set, switching to DASHBOARD.
        // We do NOT need to navigate manually here, which caused the race condition.

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
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 rounded-lg transition-colors shadow-lg disabled:bg-slate-400"
            >
                {loading ? 'Signing in...' : 'Sign In'}
            </button>
        </form>

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
