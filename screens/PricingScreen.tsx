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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-emerald-50 mb-8">
              Start free. Upgrade when you're ready. Cancel anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`rounded-lg p-8 ${
                  plan.highlighted
                    ? 'bg-emerald-600 text-white shadow-2xl scale-105 border-4 border-emerald-400'
                    : 'bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700'
                }`}
              >
                {plan.highlighted && (
                  <div className="text-center mb-4">
                    <span className="bg-emerald-400 text-emerald-900 px-3 py-1 rounded-full text-sm font-bold">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                <h3 className={`text-2xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className={`text-4xl font-bold ${plan.highlighted ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm ${plan.highlighted ? 'text-emerald-100' : 'text-slate-600 dark:text-slate-400'}`}>
                    {' '}/{plan.period}
                  </span>
                </div>
                <p className={`mb-6 ${plan.highlighted ? 'text-emerald-50' : 'text-slate-600 dark:text-slate-400'}`}>
                  {plan.description}
                </p>
                <button
                  onClick={() => plan.name === 'Enterprise' ? navigateTo('CONTACT') : navigateTo('SIGNUP')}
                  className={`w-full py-3 rounded-lg font-bold mb-6 transition-colors ${
                    plan.highlighted
                      ? 'bg-white text-emerald-600 hover:bg-emerald-50'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {plan.cta}
                </button>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className={`flex items-start ${plan.highlighted ? 'text-emerald-50' : 'text-slate-600 dark:text-slate-400'}`}>
                      <Check
                        size={20}
                        className={`mr-2 flex-shrink-0 mt-0.5 ${plan.highlighted ? 'text-emerald-200' : 'text-emerald-500'}`}
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-slate-100 dark:bg-slate-800 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-700 rounded-lg p-6">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                Is the free plan really free forever?
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Yes! The free plan is completely free with no time limit. It's perfect for small teams managing basic inventory needs.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-700 rounded-lg p-6">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                Can I upgrade or downgrade at any time?
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Absolutely! You can upgrade, downgrade, or cancel your subscription at any time. Changes take effect immediately.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-700 rounded-lg p-6">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                We accept all major credit cards (Visa, Mastercard, American Express) and process payments securely through Stripe.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-700 rounded-lg p-6">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Yes, we offer a 30-day money-back guarantee. If you're not satisfied, contact us for a full refund.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Ready to streamline your gear management?
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
            Join hundreds of production teams using Gear Base.
          </p>
          <button
            onClick={() => navigateTo('SIGNUP')}
            className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-lg text-lg"
          >
            Get Started Free
          </button>
        </div>
      </section>
    </div>
  );
};

export default PricingScreen;
