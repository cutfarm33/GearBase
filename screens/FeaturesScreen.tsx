import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Package, QrCode, Users, Calendar, FileText, Shield, Smartphone, BarChart3, Cloud, Zap, CheckCircle } from 'lucide-react';

const FeaturesScreen: React.FC = () => {
  const { navigateTo } = useAppContext();

  const featureCategories = [
    {
      category: 'Core Features',
      subtitle: 'Everything you need to manage your gear',
      features: [
        {
          icon: <Package size={32} />,
          title: 'Inventory Management',
          description: 'Track all your gear in one centralized system. Add items manually or import via CSV for bulk uploads.',
          benefits: ['Real-time availability status', 'Custom categories', 'Value tracking', 'Image uploads']
        },
        {
          icon: <QrCode size={32} />,
          title: 'QR Code Integration',
          description: 'Generate and scan QR codes for lightning-fast item identification and check-in/check-out.',
          benefits: ['Auto-generated QR codes', 'Mobile scanning', 'Instant item lookup', 'Print labels']
        },
        {
          icon: <Zap size={32} />,
          title: 'Bulk Operations',
          description: 'Import hundreds of items at once via CSV, Google Sheets, or paste data directly.',
          benefits: ['CSV import', 'Google Sheets sync', 'Bulk editing', 'Template downloads']
        }
      ]
    },
    {
      category: 'Team & Production',
      subtitle: 'Collaborate with your crew effectively',
      features: [
        {
          icon: <Users size={32} />,
          title: 'Team Management',
          description: 'Manage your crew with role-based permissions. Assign gear to specific team members.',
          benefits: ['Admin, Producer, Crew roles', 'User accountability', 'Assignment tracking', 'Team collaboration']
        },
        {
          icon: <Calendar size={32} />,
          title: 'Job Scheduling',
          description: 'Create production jobs and assign equipment. Track what gear is out and when it returns.',
          benefits: ['Job timeline tracking', 'Equipment reservations', 'Conflict prevention', 'Automated reminders']
        },
        {
          icon: <FileText size={32} />,
          title: 'Digital Signatures',
          description: 'Capture signatures during check-out and check-in for complete accountability.',
          benefits: ['Legal documentation', 'Damage reporting', 'Condition tracking', 'Audit trail']
        }
      ]
    },
    {
      category: 'Security & Reliability',
      subtitle: 'Enterprise-grade protection for your data',
      features: [
        {
          icon: <Shield size={32} />,
          title: 'Multi-Tenancy',
          description: 'Secure organization isolation ensures your data stays private and separate from other users.',
          benefits: ['Data isolation', 'Secure access', 'Role permissions', 'Privacy protection']
        },
        {
          icon: <Cloud size={32} />,
          title: 'Cloud Backup',
          description: 'All your data is automatically backed up to the cloud with enterprise-grade security.',
          benefits: ['Automatic backups', 'Data recovery', '99.9% uptime', 'Secure storage']
        }
      ]
    },
    {
      category: 'Analytics & Access',
      subtitle: 'Insights and accessibility everywhere',
      features: [
        {
          icon: <Smartphone size={32} />,
          title: 'Mobile Responsive',
          description: 'Access your inventory from any device - desktop, tablet, or smartphone.',
          benefits: ['Works anywhere', 'Touch optimized', 'Offline capable', 'Cross-platform']
        },
        {
          icon: <BarChart3 size={32} />,
          title: 'Reports & Analytics',
          description: 'View detailed reports on gear usage, availability, and team activity.',
          benefits: ['Usage statistics', 'Value reports', 'Equipment history', 'Export to PDF']
        }
      ]
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
              Powerful <span className="text-teal-600 dark:text-teal-400">Features</span> for Production Teams
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              Everything you need to manage your gear, track equipment, and keep your team organized.
            </p>
            <button
              onClick={() => navigateTo('SIGNUP')}
              className="glass-button text-white px-8 py-4 rounded-xl font-bold shadow-glow-teal hover:shadow-glow-emerald hover:scale-105 transition-all text-lg"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </section>

      {/* Feature Categories */}
      {featureCategories.map((categoryGroup, categoryIndex) => (
        <section key={categoryIndex} className="py-16 px-6">
          <div className="container mx-auto max-w-7xl">
            {/* Category Header */}
            <div className="text-center mb-12">
              <div className="inline-block mb-4 px-4 py-1.5 rounded-full glass-card text-teal-700 dark:text-teal-300 text-sm font-semibold">
                {categoryGroup.category}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
                {categoryGroup.subtitle}
              </h2>
            </div>

            {/* Features Grid */}
            <div className={`grid gap-6 ${categoryGroup.features.length === 2 ? 'md:grid-cols-2 max-w-5xl mx-auto' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
              {categoryGroup.features.map((feature, featureIndex) => {
                const gradients = [
                  'from-emerald-500 to-teal-500',
                  'from-teal-500 to-blue-500',
                  'from-blue-500 to-teal-500',
                  'from-teal-500 to-emerald-500',
                  'from-emerald-500 to-blue-500',
                  'from-teal-500 to-teal-500'
                ];
                const blurColors = [
                  'from-emerald-500/10',
                  'from-teal-500/10',
                  'from-blue-500/10',
                  'from-teal-500/10',
                  'from-emerald-500/10',
                  'from-teal-500/10'
                ];
                const gradient = gradients[featureIndex % gradients.length];
                const blurColor = blurColors[featureIndex % blurColors.length];

                return (
                  <div
                    key={featureIndex}
                    className="glass-card rounded-2xl p-8 shadow-glass hover:shadow-glass-lg transition-all duration-300 relative overflow-hidden group"
                  >
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${blurColor} to-transparent blur-2xl`}></div>
                    <div className="relative z-10">
                      <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                        {feature.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                        {feature.description}
                      </p>
                      <ul className="space-y-2">
                        {feature.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-start text-sm text-slate-600 dark:text-slate-300">
                            <CheckCircle size={16} className="text-teal-500 dark:text-teal-400 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ))}

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="glass-card rounded-3xl p-10 md:p-16 text-center shadow-glass-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-blue-500/10 to-emerald-500/10 blur-3xl"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto">
                Join production teams who trust Gear Base for their equipment management.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <button
                  onClick={() => navigateTo('SIGNUP')}
                  className="glass-button text-white px-8 py-4 rounded-xl font-bold shadow-glow-teal hover:shadow-glow-emerald hover:scale-105 transition-all text-lg"
                >
                  Start Free Trial
                </button>
                <button
                  onClick={() => navigateTo('HELP')}
                  className="glass-card text-slate-900 dark:text-white px-8 py-4 rounded-xl font-bold hover-float shadow-glass hover:shadow-glass-lg border border-emerald-200/50 dark:border-teal-500/30 text-lg"
                >
                  View Documentation
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FeaturesScreen;
