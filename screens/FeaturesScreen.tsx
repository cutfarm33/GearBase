import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Package, QrCode, Users, Calendar, FileText, Shield, Smartphone, BarChart3, Cloud, Zap } from 'lucide-react';

const FeaturesScreen: React.FC = () => {
  const { navigateTo } = useAppContext();

  const features = [
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
    },
    {
      icon: <Shield size={32} />,
      title: 'Multi-Tenancy',
      description: 'Secure organization isolation ensures your data stays private and separate from other users.',
      benefits: ['Data isolation', 'Secure access', 'Role permissions', 'Privacy protection']
    },
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
    },
    {
      icon: <Cloud size={32} />,
      title: 'Cloud Backup',
      description: 'All your data is automatically backed up to the cloud with enterprise-grade security.',
      benefits: ['Automatic backups', 'Data recovery', '99.9% uptime', 'Secure storage']
    },
    {
      icon: <Zap size={32} />,
      title: 'Bulk Operations',
      description: 'Import hundreds of items at once via CSV, Google Sheets, or paste data directly.',
      benefits: ['CSV import', 'Google Sheets sync', 'Bulk editing', 'Template downloads']
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Powerful Features for Production Teams
            </h1>
            <p className="text-xl text-emerald-50 mb-8">
              Everything you need to manage your gear, track equipment, and keep your team organized.
            </p>
            <button
              onClick={() => navigateTo('SIGNUP')}
              className="bg-white text-emerald-600 px-8 py-3 rounded-lg font-bold text-lg hover:bg-emerald-50 transition-colors shadow-lg"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow border border-slate-200 dark:border-slate-700"
              >
                <div className="text-emerald-600 dark:text-emerald-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-100 dark:bg-slate-800 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
            Join production teams who trust Gear Base for their equipment management.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => navigateTo('SIGNUP')}
              className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-lg"
            >
              Start Free Trial
            </button>
            <button
              onClick={() => navigateTo('HELP')}
              className="bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-lg border border-slate-300 dark:border-slate-600"
            >
              View Documentation
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FeaturesScreen;
