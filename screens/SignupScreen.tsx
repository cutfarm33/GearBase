
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft, ArrowRight, Film, Music, Camera, Package, Check } from 'lucide-react';
import { UserRole, Vertical } from '../types';
import { getAllVerticals, getVerticalConfig, getRolesForVertical } from '../lib/verticalConfig';
import { trackSignupStart, trackSignupComplete } from '../lib/analytics';

// Google "G" logo SVG component
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

type SignupStep = 'vertical' | 'account' | 'role';

const SignupScreen: React.FC = () => {
  const { supabase, navigateTo, dispatch, mergeOfflineProfile } = useAppContext();

  const [step, setStep] = useState<SignupStep>('vertical');
  const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '' as string,
      vertical: 'film' as Vertical
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const verticals = getAllVerticals();

  // Track when user starts signup process
  useEffect(() => {
    trackSignupStart();
  }, []);

  const handleGoogleSignup = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      // Save the selected vertical to localStorage before OAuth redirect
      localStorage.setItem('gearbase_pending_signup', JSON.stringify({
        vertical: formData.vertical
      }));

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Failed to sign up with Google');
      setGoogleLoading(false);
      localStorage.removeItem('gearbase_pending_signup');
    }
  };

  const getVerticalIcon = (id: Vertical) => {
    switch (id) {
      case 'film': return <Film size={32} />;
      case 'music': return <Music size={32} />;
      case 'photo': return <Camera size={32} />;
      case 'general': return <Package size={32} />;
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      if (formData.password !== formData.confirmPassword) {
          setError("Passwords don't match");
          return;
      }

      setLoading(true);

      try {
          // Check if an offline profile exists for this email FIRST
          let offlineProfileId: string | null = null;
          const { data: existingProfiles } = await supabase
              .from('profiles')
              .select('id')
              .eq('email', formData.email);

          if (existingProfiles && existingProfiles.length > 0) {
              offlineProfileId = existingProfiles[0].id;
              console.log("Found existing offline profile:", offlineProfileId);
          }

          // 1. Create Auth User with Metadata
          const { data: authData, error: authError } = await supabase.auth.signUp({
              email: formData.email,
              password: formData.password,
              options: {
                  data: {
                      full_name: formData.name,
                      role: formData.role,
                      plan: 'free'
                  }
              }
          });

          if (authError) throw authError;

          if (authData.user) {
              // 2. Create Organization with vertical using RPC
              const { data: organizationId, error: orgError } = await supabase
                  .rpc('create_organization_for_signup', {
                      org_name: `${formData.name}'s Organization`,
                      org_vertical: formData.vertical
                  });

              if (orgError || !organizationId) {
                  console.error("Error creating organization:", orgError);
                  throw new Error("Failed to create organization");
              }

              // 3. Handle Profile Creation or Merge
              if (offlineProfileId) {
                  await mergeOfflineProfile(offlineProfileId, authData.user.id);

                  const { error: upsertError } = await supabase.from('profiles').upsert({
                      id: authData.user.id,
                      email: formData.email,
                      full_name: formData.name,
                      role: formData.role,
                      plan: 'free',
                      organization_id: organizationId
                  });
                   if (upsertError) console.error("Error creating merged profile:", upsertError);

              } else {
                  const { error: profileError } = await supabase.from('profiles').insert({
                      id: authData.user.id,
                      email: formData.email,
                      full_name: formData.name,
                      role: formData.role,
                      plan: 'free',
                      organization_id: organizationId
                  });

                  if (profileError) {
                      console.warn('Initial profile creation skipped (likely pending verification).', profileError);
                  }
              }

              // Track successful signup conversion
              trackSignupComplete(authData.user.id, 'free');

              dispatch({ type: 'SET_DATA', payload: { pendingEmail: formData.email } });
              dispatch({ type: 'SET_VERTICAL', payload: formData.vertical });
              navigateTo('VERIFY_EMAIL');
          }
      } catch (err: any) {
          setError(err.message || 'Signup failed');
      } finally {
          setLoading(false);
      }
  };

  const handleNextStep = () => {
    if (step === 'vertical') {
      setStep('account');
    } else if (step === 'account') {
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        setError('Please fill in all fields');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords don't match");
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      setError('');
      // Set default role based on vertical
      const roles = getRolesForVertical(formData.vertical);
      if (!formData.role || !roles.includes(formData.role)) {
        setFormData({ ...formData, role: roles[0] });
      }
      setStep('role');
    }
  };

  const handleBackStep = () => {
    if (step === 'account') {
      setStep('vertical');
    } else if (step === 'role') {
      setStep('account');
    }
  };

  // Step 1: Vertical Selection
  if (step === 'vertical') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg w-full max-w-2xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => navigateTo('LANDING')}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Home
          </button>

          <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-2">What are you tracking?</h2>
          <p className="text-center text-slate-500 dark:text-slate-400 mb-8 text-sm">
            Choose the option that best fits your needs. This determines your categories, terminology, and features.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {verticals.map((v) => (
              <button
                key={v.id}
                onClick={() => setFormData({ ...formData, vertical: v.id })}
                className={`p-6 rounded-xl border-2 text-left transition-all ${
                  formData.vertical === v.id
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${
                    formData.vertical === v.id
                      ? 'bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-400'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}>
                    {getVerticalIcon(v.id)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-semibold ${
                        formData.vertical === v.id
                          ? 'text-emerald-700 dark:text-emerald-300'
                          : 'text-slate-900 dark:text-white'
                      }`}>
                        {v.name}
                      </h3>
                      {formData.vertical === v.id && (
                        <Check size={20} className="text-emerald-500" />
                      )}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {v.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={handleNextStep}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg transition-colors shadow-lg flex items-center justify-center gap-2"
          >
            Continue <ArrowRight size={18} />
          </button>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-slate-300 dark:border-slate-600"></div>
            <span className="px-4 text-sm text-slate-500 dark:text-slate-400">or</span>
            <div className="flex-1 border-t border-slate-300 dark:border-slate-600"></div>
          </div>

          {/* Google Sign Up */}
          <button
            onClick={handleGoogleSignup}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
          >
            <GoogleIcon />
            {googleLoading ? 'Connecting...' : 'Continue with Google'}
          </button>

          <div className="mt-6 text-center">
            <p className="text-slate-500 dark:text-slate-400">Already have an account?</p>
            <button
              onClick={() => navigateTo('LOGIN')}
              className="text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300 font-medium mt-2"
            >
              Log In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Account Details
  if (step === 'account') {
    const config = getVerticalConfig(formData.vertical);
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg w-full max-w-md border border-slate-200 dark:border-slate-700">
          <button
            onClick={handleBackStep}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div className="flex items-center gap-3 mb-6 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-800 rounded-lg text-emerald-600 dark:text-emerald-400">
              {getVerticalIcon(formData.vertical)}
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Setting up for</p>
              <p className="font-semibold text-slate-900 dark:text-white">{config.name}</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Create your account</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">Start managing your gear for free.</p>

          {error && <div className="bg-red-500/10 text-red-500 dark:text-red-400 p-3 rounded mb-4 text-sm text-center">{error}</div>}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Full Name</label>
              <input
                type="text"
                className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 border border-slate-300 dark:border-slate-600"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Email</label>
              <input
                type="email"
                className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 border border-slate-300 dark:border-slate-600"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Password</label>
              <input
                type="password"
                className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 border border-slate-300 dark:border-slate-600"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Confirm Password</label>
              <input
                type="password"
                className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 border border-slate-300 dark:border-slate-600"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                required
                minLength={6}
              />
            </div>

            <button
              onClick={handleNextStep}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg transition-colors mt-4 shadow-lg flex items-center justify-center gap-2"
            >
              Continue <ArrowRight size={18} />
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-slate-500 dark:text-slate-400">Already have an account?</p>
            <button
              onClick={() => navigateTo('LOGIN')}
              className="text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300 font-medium mt-2"
            >
              Log In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Role Selection
  const config = getVerticalConfig(formData.vertical);
  const roles = getRolesForVertical(formData.vertical);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg w-full max-w-md border border-slate-200 dark:border-slate-700">
        <button
          onClick={handleBackStep}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">What's your role?</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
          This helps us personalize your experience.
        </p>

        {error && <div className="bg-red-500/10 text-red-500 dark:text-red-400 p-3 rounded mb-4 text-sm text-center">{error}</div>}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Your Role</label>
            <select
              className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 border border-slate-300 dark:border-slate-600"
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              {roles.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          {/* Summary */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 mt-6">
            <h4 className="font-medium text-slate-900 dark:text-white mb-2">Account Summary</h4>
            <div className="space-y-1 text-sm">
              <p className="text-slate-500 dark:text-slate-400">
                <span className="text-slate-700 dark:text-slate-300">Type:</span> {config.name}
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                <span className="text-slate-700 dark:text-slate-300">Name:</span> {formData.name}
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                <span className="text-slate-700 dark:text-slate-300">Email:</span> {formData.email}
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg transition-colors mt-4 shadow-lg disabled:bg-slate-400"
          >
            {loading ? 'Creating Account...' : 'Create Free Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-500 dark:text-slate-400">Already have an account?</p>
          <button
            onClick={() => navigateTo('LOGIN')}
            className="text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300 font-medium mt-2"
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupScreen;
