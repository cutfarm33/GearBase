
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Mail, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

const VerifyEmailScreen: React.FC = () => {
  const { state, navigateTo } = useAppContext();
  const email = state.pendingEmail;

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg w-full max-w-lg border border-slate-200 dark:border-slate-700 text-center">

        {/* Success indicator */}
        <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-emerald-100 dark:bg-emerald-900/30 rounded-full animate-pulse"></div>
            <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                <Mail size={36} className="text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800">
                <CheckCircle2 size={16} className="text-white" />
            </div>
        </div>

        <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles size={18} className="text-emerald-500" />
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">Account Created!</span>
            <Sparkles size={18} className="text-emerald-500" />
        </div>

        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Check Your Inbox</h2>

        <p className="text-slate-600 dark:text-slate-300 mb-6">
            We've sent a verification link to<br/>
            {email ? <span className="font-bold text-emerald-600 dark:text-emerald-400">{email}</span> : 'your email'}
        </p>

        {/* Steps indicator */}
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-5 mb-6">
            <div className="flex items-center justify-between text-sm">
                <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold mb-2">
                        <CheckCircle2 size={18} />
                    </div>
                    <span className="text-slate-500 dark:text-slate-400">Sign Up</span>
                </div>
                <div className="flex-1 h-0.5 bg-emerald-500 mx-2 mb-6"></div>
                <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold mb-2 ring-4 ring-emerald-500/20">
                        2
                    </div>
                    <span className="text-slate-900 dark:text-white font-medium">Verify Email</span>
                </div>
                <div className="flex-1 h-0.5 bg-slate-300 dark:bg-slate-600 mx-2 mb-6"></div>
                <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 rounded-full flex items-center justify-center font-bold mb-2">
                        3
                    </div>
                    <span className="text-slate-500 dark:text-slate-400">Start Using</span>
                </div>
            </div>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Click the link in your email to activate your account.<br/>
            <span className="text-xs">Don't see it? Check your spam folder.</span>
        </p>

        <button
            onClick={() => navigateTo('LOGIN')}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg transition-colors shadow-lg flex items-center justify-center gap-2 group"
        >
            Continue to Login
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>

      </div>
    </div>
  );
};

export default VerifyEmailScreen;
