import React, { useEffect, useState } from 'react';
import { useAppContext, supabase } from '../context/AppContext';
import { Crown, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { trackFounderPurchase } from '../lib/analytics';

const CheckoutSuccessScreen: React.FC = () => {
  const { navigateTo, state } = useAppContext();
  const isLoggedIn = !!state.currentUser;
  const [founderNumber, setFounderNumber] = useState<number | null>(null);

  useEffect(() => {
    // Fetch the user's founder number
    const fetchFounderInfo = async () => {
      if (!isLoggedIn) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data } = await supabase
          .from('founder_deals')
          .select('founder_number')
          .eq('user_id', session.user.id)
          .single();

        if (data?.founder_number) {
          setFounderNumber(data.founder_number);
          trackFounderPurchase(data.founder_number);
        }
      } catch {
        // Founder info not available yet (webhook may still be processing)
      }
    };

    fetchFounderInfo();
  }, [isLoggedIn]);

  // Clear checkout intent from localStorage
  useEffect(() => {
    localStorage.removeItem('gearbase_checkout_intent');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-hero dark:bg-gradient-to-br dark:from-slate-900 dark:via-emerald-950/50 dark:to-slate-900 text-slate-900 dark:text-white font-sans selection:bg-emerald-500 selection:text-white animate-gradient bg-[length:200%_200%]">
      <section className="pt-32 pb-20 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 via-teal-50/40 to-white/50 dark:from-transparent dark:via-transparent dark:to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-radial from-emerald-100/30 via-transparent to-transparent dark:from-transparent"></div>

        <div className="container mx-auto max-w-2xl relative z-10">
          <div className="glass-card rounded-3xl p-10 md:p-16 text-center shadow-glass-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-yellow-500/5"></div>

            <div className="relative z-10">
              {/* Success icon */}
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                <Crown size={40} className="text-white" />
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                Welcome, Founder{founderNumber ? ` #${founderNumber}` : ''}!
              </h1>

              <div className="flex items-center justify-center gap-2 mb-6">
                <Sparkles size={16} className="text-amber-500" />
                <span className="text-amber-600 dark:text-amber-400 font-semibold">Lifetime Pro Access Activated</span>
                <Sparkles size={16} className="text-amber-500" />
              </div>

              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-lg mx-auto leading-relaxed">
                Thank you for believing in GearBase early. You now have lifetime access to all Pro features — including everything we build in the future.
              </p>

              <div className="space-y-3 text-left max-w-sm mx-auto mb-10">
                {[
                  'Lifetime Pro access — no renewals',
                  'All future Pro features included',
                  'Priority support',
                  'Founder badge on your profile'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle size={18} className="text-amber-500 flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-200">{item}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigateTo(isLoggedIn ? 'DASHBOARD' : 'LOGIN')}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:scale-105 transition-all text-lg flex items-center justify-center gap-2 mx-auto"
              >
                {isLoggedIn ? 'Go to Dashboard' : 'Log In to Get Started'}
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CheckoutSuccessScreen;
