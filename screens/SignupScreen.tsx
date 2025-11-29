
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft } from 'lucide-react';
import { UserRole } from '../types';

const SignupScreen: React.FC = () => {
  const { supabase, navigateTo, dispatch, mergeOfflineProfile } = useAppContext();

  const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'Crew' as UserRole
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
                      plan: 'free' // Everyone starts on free tier
                  }
              }
          });

          if (authError) throw authError;

          if (authData.user) {
              // 2. Handle Profile Creation or Merge
              if (offlineProfileId) {
                  // MERGE: Don't create new profile. Link old data to new Auth ID.
                  await mergeOfflineProfile(offlineProfileId, authData.user.id);
                  
                  // Ensure the new profile has the correct ID (Auth ID)
                  // The merge function deleted the old profile. Now we insert the new one (or update if upsert)
                  const { error: upsertError } = await supabase.from('profiles').upsert({
                      id: authData.user.id,
                      email: formData.email,
                      full_name: formData.name,
                      role: formData.role,
                      plan: 'free'
                  });
                   if (upsertError) console.error("Error creating merged profile:", upsertError);

              } else {
                  // CREATE NEW
                  const { error: profileError } = await supabase.from('profiles').insert({
                      id: authData.user.id,
                      email: formData.email,
                      full_name: formData.name,
                      role: formData.role,
                      plan: 'free'
                  });
                  
                  if (profileError) {
                      console.warn('Initial profile creation skipped (likely pending verification).', profileError);
                  }
              }
              
              // Pass the email to the state so the Verify screen can show it
              dispatch({ type: 'SET_DATA', payload: { pendingEmail: formData.email } });
              navigateTo('VERIFY_EMAIL');
          }
      } catch (err: any) {
          setError(err.message || 'Signup failed');
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg w-full max-w-md border border-slate-200 dark:border-slate-700">
        <button 
            onClick={() => navigateTo('LANDING')}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-6 transition-colors"
        >
            <ArrowLeft size={16} /> Back to Home
        </button>
        
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-2">Create Account</h2>
        <p className="text-center text-slate-500 dark:text-slate-400 mb-6 text-sm">Start managing your gear for free. No credit card required.</p>
        
        {error && <div className="bg-red-500/10 text-red-500 dark:text-red-400 p-3 rounded mb-4 text-sm text-center">{error}</div>}

        <form onSubmit={handleSignup} className="space-y-4">
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
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Role</label>
                <select 
                    className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 border border-slate-300 dark:border-slate-600"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
                >
                    <optgroup label="Management">
                        <option value="Admin">Admin</option>
                        <option value="Producer">Producer</option>
                        <option value="Director">Director</option>
                    </optgroup>
                    <optgroup label="Camera">
                        <option value="DP">Director of Photography</option>
                        <option value="AC">Camera Assistant (AC)</option>
                    </optgroup>
                    <optgroup label="Lighting & Grip">
                        <option value="Gaffer">Gaffer</option>
                        <option value="Grip">Grip</option>
                    </optgroup>
                     <optgroup label="Support">
                        <option value="PA">Production Assistant</option>
                        <option value="Crew">General Crew</option>
                    </optgroup>
                </select>
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
