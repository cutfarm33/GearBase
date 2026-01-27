import React, { useEffect, useState } from 'react';
import { useAppContext, supabase } from '../context/AppContext';
import { CheckCircle, Zap, Users, Infinity, Crown, Loader, AlertCircle } from 'lucide-react';
import { trackPricingView, trackPlanSelect, trackFounderPurchase } from '../lib/analytics';
import { createCheckoutSession } from '../lib/stripe';

const PricingScreen: React.FC = () => {
  const { navigateTo, state } = useAppContext();
  const isLoggedIn = !!state.currentUser;

  const [founderCount, setFounderCount] = useState<number | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Track pricing page view
  useEffect(() => {
    trackPricingView();
  }, []);

  // Fetch founder count
  useEffect(() => {
    const fetchFounderCount = async () => {
      try {
        const { data, error } = await supabase.rpc('get_founder_count');
        if (!error && data !== null) {
          setFounderCount(data);
        }
      } catch {
        // If RPC doesn't exist yet, default to 0
        setFounderCount(0);
      }
    };
    fetchFounderCount();
  }, []);

  const spotsRemaining = founderCount !== null ? Math.max(0, 100 - founderCount) : null;
  const founderAvailable = spotsRemaining !== null && spotsRemaining > 0;

  const handleFounderCheckout = async () => {
    if (!isLoggedIn) {
      // Save intent so we can redirect after signup
      localStorage.setItem('gearbase_checkout_intent', 'founder');
      navigateTo('SIGNUP');
      return;
    }

    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      const checkoutUrl = await createCheckoutSession(supabase);
      trackPlanSelect("Founder's Deal - Lifetime Pro", 29);
      trackFounderPurchase(founderCount ? founderCount + 1 : undefined);
      window.location.href = checkoutUrl;
    } catch (err: any) {
      setCheckoutError(err.message || 'Failed to start checkout. Please try again.');
      setIsCheckingOut(false);
    }
  };

  const plans = [
    {
      name: 'Free Forever',
      nameShort: 'Free',
      price: '$0',
      period: '/month',
      description: 'Full access to all core features. No credit card required.',
      features: [
        'Unlimited Items',
        'Unlimited Jobs',
        'Unlimited Users',
        'QR Code Support',
        'Check-in/Check-out',
        'Digital Signatures'
      ],
      cta: 'Get Started Free',
      highlighted: false,
      available: true,
      icon: null,
      type: 'free' as const
    },
    {
      name: "Founder's Deal",
      nameShort: 'Founder',
      price: '$29',
      period: ' one-time',
      description: 'Lifetime Pro access. Lock in your price forever — no subscriptions, no renewals.',
      features: [
        'Everything in Free',
        'Lifetime Pro Access',
        'All Future Pro Features',
        'Advanced Reports',
        'API Access',
        'Priority Support',
        'Founder Badge'
      ],
      cta: founderAvailable
        ? `Become a Founder (${spotsRemaining} left)`
        : 'Sold Out',
      highlighted: true,
      available: founderAvailable,
      icon: Crown,
      type: 'founder' as const
    },
    {
      name: 'Pro',
      nameShort: 'Pro',
      price: '$5',
      period: '/mo',
      description: 'Advanced features for professionals. Available after Founder slots fill.',
      features: [
        'Everything in Free',
        'Advanced Reports',
        'API Access',
        'Priority Support'
      ],
      cta: founderAvailable ? 'After Founders' : 'Coming Soon',
      highlighted: false,
      available: false,
      icon: Zap,
      type: 'pro' as const
    },
    {
      name: 'Team',
      nameShort: 'Team',
      price: '$99',
      period: '/mo',
      description: 'For production houses and rental studios.',
      features: [
        'Everything in Pro',
        'Advanced Analytics',
        'White Label Options',
        'Dedicated Support'
      ],
      cta: 'Coming Soon',
      highlighted: false,
      available: false,
      icon: Users,
      type: 'team' as const
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero dark:bg-gradient-to-br dark:from-slate-900 dark:via-emerald-950/50 dark:to-slate-900 text-slate-900 dark:text-white font-sans selection:bg-emerald-500 selection:text-white animate-gradient bg-[length:200%_200%]">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative">
        {/* Background overlay for light mode */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 via-teal-50/40 to-white/50 dark:from-transparent dark:via-transparent dark:to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-radial from-emerald-100/30 via-transparent to-transparent dark:from-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-300/50 to-transparent dark:via-emerald-900/20"></div>

        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
              Start Free, <span className="text-teal-600 dark:text-teal-400">Upgrade Later</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Get started for free today. No credit card required.
              {founderAvailable && (
                <span className="block mt-2 text-amber-600 dark:text-amber-400 font-semibold">
                  Limited: First 100 founders get lifetime Pro for just $29.
                </span>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Founder's Deal Banner */}
      {founderAvailable && (
        <section className="px-6 -mt-8 mb-8 relative z-10">
          <div className="container mx-auto max-w-3xl">
            <div className="glass-card rounded-2xl p-6 border-2 border-amber-500/50 shadow-glass-lg text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-yellow-500/5"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Crown size={20} className="text-amber-500" />
                  <span className="text-sm font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Founder's Deal — Limited to 100</span>
                  <Crown size={20} className="text-amber-500" />
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Pay once, own it forever. Get lifetime Pro access for <strong className="text-slate-900 dark:text-white">$29</strong> instead of $5/month.
                </p>
                {/* Progress bar */}
                <div className="max-w-md mx-auto mb-3">
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <span>{founderCount || 0} founders joined</span>
                    <span>{spotsRemaining} spots left</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-orange-500 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${((founderCount || 0) / 100) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Pricing Cards */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, index) => {
              const IconComponent = plan.icon;
              const isFounder = plan.type === 'founder';

              return (
                <div
                  key={index}
                  className={`glass-card hover-float p-8 rounded-2xl flex flex-col relative shadow-glass hover:shadow-glass-lg transition-all duration-300 ${
                    isFounder && founderAvailable
                      ? 'border-2 border-amber-500/50 ring-2 ring-amber-500/20'
                      : plan.highlighted ? 'border-2 border-teal-500/50' : ''
                  } ${!plan.available ? 'opacity-60' : ''}`}
                >
                  {isFounder && founderAvailable ? (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-[10px] font-bold px-3 py-1.5 rounded-full text-white shadow-lg">
                      LIMITED — {spotsRemaining} LEFT
                    </div>
                  ) : plan.available ? (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 glass-badge text-[10px] font-bold px-3 py-1.5 rounded-full text-white shadow-lg">
                      AVAILABLE NOW
                    </div>
                  ) : (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-500/90 dark:bg-slate-600/90 backdrop-blur-sm text-[10px] font-bold px-3 py-1.5 rounded-full text-white">
                      {plan.cta === 'After Founders' ? 'AFTER FOUNDERS' : 'COMING SOON'}
                    </div>
                  )}

                  <div className="text-left">
                    <div className={`text-sm font-bold uppercase mb-2 flex items-center gap-2 ${
                      isFounder && founderAvailable
                        ? 'text-amber-600 dark:text-amber-400'
                        : plan.available
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : index === 2 ? 'text-blue-600 dark:text-blue-400'
                        : index === 3 ? 'text-teal-600 dark:text-teal-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {IconComponent && <IconComponent size={14} />}
                      {plan.nameShort}
                    </div>
                    <div className="text-4xl font-bold mb-2 text-slate-900 dark:text-white">
                      {plan.price} <span className="text-lg font-normal text-slate-500 dark:text-slate-400">{plan.period}</span>
                    </div>
                    {isFounder && founderAvailable && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 line-through">
                        $5/month ($60/year)
                      </div>
                    )}
                    <p className={`text-sm mb-6 ${
                      plan.available ? 'text-slate-600 dark:text-slate-300' : 'text-slate-600 dark:text-slate-400'
                    }`}>
                      {plan.description}
                    </p>
                  </div>

                  <ul className={`space-y-4 mb-8 text-left flex-grow ${
                    plan.available ? 'text-slate-700 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400'
                  }`}>
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle
                          size={16}
                          className={`mt-1 flex-shrink-0 ${
                            isFounder && founderAvailable ? 'text-amber-500' :
                            plan.available ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-500'
                          }`}
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {checkoutError && isFounder && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                      <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-700 dark:text-red-300">{checkoutError}</p>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      if (isFounder && founderAvailable) {
                        handleFounderCheckout();
                      } else if (plan.available && plan.type === 'free') {
                        trackPlanSelect(plan.name, 0);
                        navigateTo('SIGNUP');
                      }
                    }}
                    disabled={!plan.available || isCheckingOut}
                    className={`w-full font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      isFounder && founderAvailable
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-lg'
                        : plan.available
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isCheckingOut && isFounder ? (
                      <>
                        <Loader size={16} className="animate-spin" />
                        Redirecting to Checkout...
                      </>
                    ) : (
                      plan.cta
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-12 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {founderAvailable && (
              <div className="glass-card rounded-2xl p-6 hover-float shadow-glass hover:shadow-glass-lg transition-all duration-300">
                <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-3">
                  What is the Founder's Deal?
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  The first 100 users who sign up get lifetime Pro access for a one-time payment of $29. That's it — no monthly fees, no renewals. You'll also get access to every Pro feature we add in the future, forever.
                </p>
              </div>
            )}
            <div className="glass-card rounded-2xl p-6 hover-float shadow-glass hover:shadow-glass-lg transition-all duration-300">
              <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-3">
                Is the free plan really free forever?
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Yes! The free plan is completely free with no time limit. It's perfect for small teams managing basic inventory needs.
              </p>
            </div>
            <div className="glass-card rounded-2xl p-6 hover-float shadow-glass hover:shadow-glass-lg transition-all duration-300">
              <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-3">
                Can I upgrade or downgrade at any time?
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Absolutely! You can upgrade, downgrade, or cancel your subscription at any time. Changes take effect immediately.
              </p>
            </div>
            <div className="glass-card rounded-2xl p-6 hover-float shadow-glass hover:shadow-glass-lg transition-all duration-300">
              <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-3">
                What payment methods do you accept?
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                We accept all major credit cards (Visa, Mastercard, American Express) and process payments securely through Stripe.
              </p>
            </div>
            <div className="glass-card rounded-2xl p-6 hover-float shadow-glass hover:shadow-glass-lg transition-all duration-300">
              <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-3">
                Do you offer refunds?
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Yes, we offer a 30-day money-back guarantee. If you're not satisfied, contact us for a full refund.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="glass-card rounded-3xl p-10 md:p-16 text-center shadow-glass-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-blue-500/10 to-emerald-500/10 blur-3xl"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                Ready to streamline your gear management?
              </h2>
              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto">
                Join hundreds of production teams using Gear Base.
              </p>
              <button
                onClick={() => navigateTo('SIGNUP')}
                className="glass-button text-white px-8 py-4 rounded-xl font-bold shadow-glow-teal hover:shadow-glow-emerald hover:scale-105 transition-all text-lg"
              >
                Get Started Free
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingScreen;
