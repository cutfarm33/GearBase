
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Mail, AlertTriangle } from 'lucide-react';

const VerifyEmailScreen: React.FC = () => {
  const { state, navigateTo } = useAppContext();
  const email = state.pendingEmail;

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg w-full max-w-lg border border-slate-200 dark:border-slate-700 text-center">
        
        <div className="w-16 h-16 bg-sky-100 dark:bg-sky-900/50 rounded-full flex items-center justify-center mx-auto mb-6 text-sky-600 dark:text-sky-400">
            <Mail size={32} />
        </div>

        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Check your inbox!</h2>
        
        <p className="text-slate-600 dark:text-slate-300 mb-6">
            We've sent a verification link to {email ? <span className="font-bold text-slate-900 dark:text-white">{email}</span> : 'your email'}.<br/>
            Please click the link in the email to activate your account.
        </p>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-left text-sm text-amber-800 dark:text-amber-200 mb-8">
            <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="mt-0.5 flex-shrink-0"/>
                <div>
                    <strong>Link not working?</strong><br/>
                    If you click the link and get a <em>"localhost refused to connect"</em> error:
                    <ol className="list-decimal ml-4 mt-2 space-y-1">
                        <li>Go to your <strong>Supabase Dashboard</strong></li>
                        <li>Navigate to <strong>Authentication</strong> &gt; <strong>URL Configuration</strong></li>
                        <li>Update the <strong>Site URL</strong> to your current app URL.</li>
                    </ol>
                </div>
            </div>
        </div>

        <div className="space-y-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">Once verified, you can log in:</p>
            <button 
                onClick={() => navigateTo('LOGIN')}
                className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 rounded-lg transition-colors shadow-lg"
            >
                Back to Login
            </button>
        </div>

      </div>
    </div>
  );
};

export default VerifyEmailScreen;
