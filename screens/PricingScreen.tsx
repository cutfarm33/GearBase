import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Check } from 'lucide-react';

const PricingScreen: React.FC = () => {
  const { navigateTo } = useAppContext();

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for small teams getting started',
      features: [
        'Up to 50 inventory items',
        'Up to 3 team members',
        '1 active job at a time',
        'QR code generation',
        'Mobile access',
        'Basic reporting',
        'Email support'
      ],
      cta: 'Get Started Free',
      highlighted: false
    },
    {
      name: 'Pro',
      price: '$29',
      period: 'per month',
      description: 'For growing production companies',
      features: [
        'Unlimited inventory items',
        'Unlimited team members',
        'Unlimited active jobs',
        'QR code generation & scanning',
        'Mobile access',
        'Advanced reporting & analytics',
        'Priority email support',
        'Bulk import (CSV, Google Sheets)',
        'Custom categories',
        'Equipment kits/packages',
        'Digital signatures',
        'Data export'
      ],
      cta: 'Start Free Trial',
      highlighted: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact us',
      description: 'For large organizations with custom needs',
      features: [
        'Everything in Pro',
        'Multiple organizations',
        'Custom integrations',
        'API access',
        'Dedicated support',
        'Custom training',
        'Service level agreement (SLA)',
        'On-premise deployment option',
        'Advanced security features',
        'Custom branding'
      ],
      cta: 'Contact Sales',
      highlighted: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero dark:bg-gradient-to-br dark:from-slate-900 dark:via-emerald-950/50 dark:to-slate-900 text-slate-900 dark:text-white font-sans selection:bg-emerald-500 selection:text-white animate-gradient bg-[length:200%_200%]">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative">
        {/* Depth layer - subtle gradient overlay for light mode */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-emerald-50/30 to-transparent dark:from-transparent dark:via-transparent dark:to-transparent"></div>
        {/* Subtle shadow at bottom for depth */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-200/40 to-transparent dark:via-emerald-900/20"></div>

        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
              Simple, <span className="text-teal-600 dark:text-teal-400">Transparent</span> Pricing
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Start free. Upgrade when you're ready. Cancel anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-3 gap-6 items-center">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`glass-card rounded-3xl p-8 shadow-glass relative overflow-hidden transition-all duration-300 ${
                  plan.highlighted
                    ? 'md:scale-105 border-2 border-teal-500/50 shadow-glass-lg hover:scale-110 hover:-translate-y-2'
                    : 'hover:shadow-glass-lg hover:-translate-y-1'
                }`}
              >
                <div className={`absolute top-0 right-0 w-64 h-64 ${
                  plan.highlighted
                    ? 'bg-gradient-to-br from-teal-500/20 via-emerald-500/20 to-transparent'
                    : 'bg-gradient-to-br from-blue-500/10 to-transparent'
                } blur-3xl`}></div>

                <div className="relative z-10">
                  {plan.highlighted && (
                    <div className="text-center mb-6">
                      <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">
                        MOST POPULAR
                      </span>
                    </div>
                  )}
                  <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-5xl font-bold text-slate-900 dark:text-white">
                      {plan.price}
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {' '}/{plan.period}
                    </span>
                  </div>
                  <p className="mb-6 text-slate-600 dark:text-slate-300">
                    {plan.description}
                  </p>
                  <button
                    onClick={() => plan.name === 'Enterprise' ? navigateTo('CONTACT') : navigateTo('SIGNUP')}
                    className={`w-full py-3 rounded-xl font-bold mb-6 transition-all ${
                      plan.highlighted
                        ? 'glass-button text-white shadow-glow-teal hover:shadow-glow-emerald hover:scale-105'
                        : 'glass-card border border-emerald-200/50 dark:border-teal-500/30 text-slate-900 dark:text-white hover-float'
                    }`}
                  >
                    {plan.cta}
                  </button>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start text-slate-600 dark:text-slate-300">
                        <Check
                          size={20}
                          className="mr-2 flex-shrink-0 mt-0.5 text-teal-500"
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
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
