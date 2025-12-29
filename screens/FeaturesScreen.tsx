import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Package, QrCode, Users, Calendar, FileText, Shield, Smartphone, BarChart3, Cloud, Zap, CheckCircle, ArrowRight, Sparkles, Camera, Music, Briefcase, Settings } from 'lucide-react';

const FeaturesScreen: React.FC = () => {
  const { navigateTo } = useAppContext();

  const featureCategories = [
    {
      category: 'Core Features',
      subtitle: 'Everything you need to manage your gear',
      icon: <Package size={20} />,
      features: [
        {
          icon: Package,
          title: 'Inventory Management',
          description: 'Track all your gear in one centralized system. Add items manually or import via CSV for bulk uploads.',
          benefits: ['Real-time availability status', 'Custom categories', 'Value tracking', 'Image uploads'],
          gradient: 'from-emerald-500 to-teal-500'
        },
        {
          icon: QrCode,
          title: 'QR Code Integration',
          description: 'Generate and scan QR codes for lightning-fast item identification and check-in/check-out.',
          benefits: ['Auto-generated QR codes', 'Mobile scanning', 'Instant item lookup', 'Print labels'],
          gradient: 'from-teal-500 to-blue-500'
        },
        {
          icon: Zap,
          title: 'Bulk Operations',
          description: 'Import hundreds of items at once via CSV, Google Sheets, or paste data directly.',
          benefits: ['CSV import', 'Google Sheets sync', 'Bulk editing', 'Template downloads'],
          gradient: 'from-blue-500 to-teal-500'
        }
      ]
    },
    {
      category: 'Team & Projects',
      subtitle: 'Collaborate with your team effectively',
      icon: <Users size={20} />,
      features: [
        {
          icon: Users,
          title: 'Team Management',
          description: 'Manage your team with industry-specific roles. Assign gear to specific team members.',
          benefits: ['Industry-specific roles', 'User accountability', 'Assignment tracking', 'Team collaboration'],
          gradient: 'from-emerald-500 to-teal-500'
        },
        {
          icon: Calendar,
          title: 'Project Scheduling',
          description: 'Create projects and assign equipment. Track what gear is out and when it returns.',
          benefits: ['Project timeline tracking', 'Equipment reservations', 'Conflict prevention', 'Automated reminders'],
          gradient: 'from-teal-500 to-blue-500'
        },
        {
          icon: FileText,
          title: 'Digital Signatures',
          description: 'Capture signatures during check-out and check-in for complete accountability.',
          benefits: ['Legal documentation', 'Damage reporting', 'Condition tracking', 'Audit trail'],
          gradient: 'from-blue-500 to-emerald-500'
        }
      ]
    },
    {
      category: 'Security & Reliability',
      subtitle: 'Enterprise-grade protection for your data',
      icon: <Shield size={20} />,
      features: [
        {
          icon: Shield,
          title: 'Multi-Tenancy',
          description: 'Secure organization isolation ensures your data stays private and separate from other users.',
          benefits: ['Data isolation', 'Secure access', 'Role permissions', 'Privacy protection'],
          gradient: 'from-emerald-500 to-teal-500'
        },
        {
          icon: Cloud,
          title: 'Cloud Backup',
          description: 'All your data is automatically backed up to the cloud with enterprise-grade security.',
          benefits: ['Automatic backups', 'Data recovery', '99.9% uptime', 'Secure storage'],
          gradient: 'from-teal-500 to-blue-500'
        }
      ]
    },
    {
      category: 'Analytics & Access',
      subtitle: 'Insights and accessibility everywhere',
      icon: <BarChart3 size={20} />,
      features: [
        {
          icon: Smartphone,
          title: 'Mobile Responsive',
          description: 'Access your inventory from any device - desktop, tablet, or smartphone.',
          benefits: ['Works anywhere', 'Touch optimized', 'Offline capable', 'Cross-platform'],
          gradient: 'from-blue-500 to-teal-500'
        },
        {
          icon: BarChart3,
          title: 'Reports & Analytics',
          description: 'View detailed reports on gear usage, availability, and team activity.',
          benefits: ['Usage statistics', 'Value reports', 'Equipment history', 'Export to PDF'],
          gradient: 'from-emerald-500 to-teal-500'
        }
      ]
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
            <div className="inline-block mb-6 px-4 py-1.5 rounded-full glass-card text-teal-700 dark:text-teal-300 text-sm font-semibold shadow-glow-teal">
              <Sparkles size={14} className="inline mr-1.5 -mt-0.5" />
              Film • Photo • Music • General
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
              Powerful Tools for<br/>
              <span className="text-teal-600 dark:text-teal-400">Every Creative</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              Choose your industry and get tailored categories, team roles, and workflows. One platform, endless possibilities.
            </p>
            <button
              onClick={() => navigateTo('SIGNUP')}
              className="glass-button text-white px-8 py-4 rounded-2xl font-bold shadow-glow-teal hover:shadow-glow-emerald hover:scale-105 transition-all text-lg inline-flex items-center gap-2"
            >
              Start Free Trial
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Industry Selector Section */}
      <section className="py-20 px-6 bg-white/50 dark:bg-slate-900/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full glass-card text-teal-700 dark:text-teal-300 text-sm font-semibold shadow-glow-teal">
              <Settings size={16} />
              <span>Choose Your Industry</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Tailored for How You Work
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Select your industry during signup and get pre-configured categories, team roles, and terminology that matches your workflow.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Film/Production */}
            <div className="glass-card hover-float rounded-2xl p-6 text-center shadow-glass hover:shadow-glass-lg transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <Camera size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Film & Video</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Cameras, Lenses, Lighting, Grip, Audio equipment</p>
              <div className="mt-3 text-xs text-slate-500 dark:text-slate-500">
                Roles: Producer, DP, Gaffer, PA...
              </div>
            </div>

            {/* Photography */}
            <div className="glass-card hover-float rounded-2xl p-6 text-center shadow-glass hover:shadow-glass-lg transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <Camera size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Photography</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Cameras, Lenses, Strobes, Modifiers, Backdrops</p>
              <div className="mt-3 text-xs text-slate-500 dark:text-slate-500">
                Roles: Owner, Photographer, Assistant...
              </div>
            </div>

            {/* Music/Audio */}
            <div className="glass-card hover-float rounded-2xl p-6 text-center shadow-glass hover:shadow-glass-lg transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <Music size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Music & Audio</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Instruments, Mics, Mixers, Amps, Cables</p>
              <div className="mt-3 text-xs text-slate-500 dark:text-slate-500">
                Roles: Band Leader, Tech, Roadie...
              </div>
            </div>

            {/* General */}
            <div className="glass-card hover-float rounded-2xl p-6 text-center shadow-glass hover:shadow-glass-lg transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <Briefcase size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">General</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Tools, Equipment, Electronics, Sports gear</p>
              <div className="mt-3 text-xs text-slate-500 dark:text-slate-500">
                Roles: Owner, Manager, Member...
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Categories */}
      {featureCategories.map((categoryGroup, categoryIndex) => (
        <section key={categoryIndex} className="py-20 px-6">
          <div className="container mx-auto max-w-7xl">
            {/* Category Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full glass-card text-teal-700 dark:text-teal-300 text-sm font-semibold shadow-glow-teal">
                {categoryGroup.icon}
                <span>{categoryGroup.category}</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                {categoryGroup.subtitle}
              </h2>
            </div>

            {/* Features Grid */}
            <div className={`grid gap-8 ${categoryGroup.features.length === 2 ? 'md:grid-cols-2 max-w-5xl mx-auto' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
              {categoryGroup.features.map((feature, featureIndex) => {
                const IconComponent = feature.icon;

                return (
                  <div
                    key={featureIndex}
                    className="glass-card hover-float rounded-3xl p-8 shadow-glass hover:shadow-glass-lg transition-all duration-300 group relative overflow-hidden"
                  >
                    {/* Background glow effect */}
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.gradient} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`}></div>

                    <div className="relative z-10">
                      {/* Icon */}
                      <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                        <IconComponent size={26} />
                      </div>

                      {/* Title */}
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
                        {feature.title}
                      </h3>

                      {/* Description */}
                      <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                        {feature.description}
                      </p>

                      {/* Benefits List */}
                      <ul className="space-y-2.5">
                        {feature.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-start text-sm text-slate-700 dark:text-slate-300">
                            <CheckCircle size={16} className="text-emerald-600 dark:text-emerald-400 mr-2.5 mt-0.5 flex-shrink-0" />
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

      {/* Stats Section */}
      <section className="py-20 px-6 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="glass-card rounded-3xl p-12 shadow-glass-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-blue-500/5 blur-xl"></div>
            <div className="relative z-10">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
                  Trusted by Creative Professionals
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-300">
                  Join photographers, filmmakers, musicians, and teams managing their gear with confidence
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 mb-2">
                    Unlimited
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 font-medium">Items Tracked</div>
                </div>
                <div>
                  <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600 dark:from-teal-400 dark:to-blue-400 mb-2">
                    Instant
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 font-medium">QR Scanning</div>
                </div>
                <div>
                  <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400 mb-2">
                    100%
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 font-medium">Cloud Backed</div>
                </div>
                <div>
                  <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 mb-2">
                    24/7
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 font-medium">Access</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 pb-32">
        <div className="container mx-auto max-w-4xl">
          <div className="glass-card rounded-3xl p-12 md:p-16 text-center shadow-glass-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-blue-500/10 to-emerald-500/10 blur-3xl"></div>
            <div className="relative z-10">
              <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold shadow-glow-emerald">
                Free Forever Plan Available
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                Join creative professionals who trust Gear Base for their equipment management. No credit card required.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <button
                  onClick={() => navigateTo('SIGNUP')}
                  className="glass-button text-white px-8 py-4 rounded-2xl font-bold shadow-glow-teal hover:shadow-glow-emerald hover:scale-105 transition-all text-lg inline-flex items-center gap-2"
                >
                  Start Free Trial
                  <ArrowRight size={20} />
                </button>
                <button
                  onClick={() => navigateTo('LANDING')}
                  className="glass-card text-slate-900 dark:text-white px-8 py-4 rounded-2xl font-bold hover-float shadow-glass hover:shadow-glass-lg text-lg"
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-12 px-6 mt-auto">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateTo('LANDING')}>
            <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-1.5 rounded-md text-white">
              <Camera size={16} />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">Gear Base</span>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} Gear Base. All rights reserved.
          </div>
          <div className="flex gap-6">
            <button onClick={() => navigateTo('LANDING')} className="text-slate-500 hover:text-emerald-500 transition-colors text-sm">Privacy</button>
            <button onClick={() => navigateTo('LANDING')} className="text-slate-500 hover:text-emerald-500 transition-colors text-sm">Terms</button>
            <button onClick={() => navigateTo('CONTACT')} className="text-slate-500 hover:text-emerald-500 transition-colors text-sm">Contact</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FeaturesScreen;
