import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Shield, Lock, Eye, Server, Mail, Trash2 } from 'lucide-react';

const PrivacyScreen: React.FC = () => {
  const { navigateTo } = useAppContext();

  const sections = [
    {
      icon: <Eye size={24} />,
      title: 'Information We Collect',
      content: [
        'Account information (name, email address) when you register',
        'Inventory data you enter including item names, descriptions, values, and images',
        'Job and project information you create',
        'Usage data to improve our services',
        'Device information for security and optimization'
      ]
    },
    {
      icon: <Server size={24} />,
      title: 'How We Use Your Information',
      content: [
        'To provide and maintain the GearBase service',
        'To send you service-related notifications',
        'To respond to your support requests',
        'To improve and optimize our platform',
        'To detect and prevent fraud or abuse'
      ]
    },
    {
      icon: <Lock size={24} />,
      title: 'Data Security',
      content: [
        'All data is encrypted in transit using TLS/SSL',
        'Data at rest is encrypted using AES-256 encryption',
        'We use secure cloud infrastructure (Supabase/AWS)',
        'Regular security audits and penetration testing',
        'Role-based access controls for team features'
      ]
    },
    {
      icon: <Shield size={24} />,
      title: 'Data Sharing',
      content: [
        'We never sell your personal information',
        'Data is only shared with service providers necessary to operate GearBase',
        'We may disclose information if required by law',
        'Team data is shared only with authorized team members you invite',
        'Public galleries only show items you explicitly choose to share'
      ]
    },
    {
      icon: <Trash2 size={24} />,
      title: 'Data Retention & Deletion',
      content: [
        'Your data is retained as long as your account is active',
        'You can export your data at any time via CSV export',
        'You can request complete account deletion by contacting support',
        'Upon deletion, your data is permanently removed within 30 days',
        'Backup copies are automatically purged according to our retention policy'
      ]
    },
    {
      icon: <Mail size={24} />,
      title: 'Contact Us',
      content: [
        'For privacy-related questions: support@mygearbase.com',
        'For data deletion requests: support@mygearbase.com',
        'Response time: Within 48 business hours'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero dark:bg-gradient-to-br dark:from-slate-900 dark:via-emerald-950/50 dark:to-slate-900 text-slate-900 dark:text-white font-sans">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-emerald-50/30 to-transparent dark:from-transparent dark:via-transparent dark:to-transparent"></div>
        <div className="container mx-auto max-w-4xl relative z-10">
          <div className="text-center">
            <div className="inline-block mb-6 px-4 py-1.5 rounded-full glass-card text-teal-700 dark:text-teal-300 text-sm font-semibold">
              <Shield size={16} className="inline mr-2" />
              Your Privacy Matters
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              Privacy <span className="text-teal-600 dark:text-teal-400">Policy</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Last updated: January 23, 2026
            </p>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-8 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="glass-card rounded-2xl p-8 mb-8">
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
              At GearBase, we take your privacy seriously. This Privacy Policy explains how we collect,
              use, disclose, and safeguard your information when you use our gear management platform.
              Please read this policy carefully. By using GearBase, you agree to the collection and use
              of information in accordance with this policy.
            </p>
          </div>
        </div>
      </section>

      {/* Policy Sections */}
      <section className="py-8 px-6">
        <div className="container mx-auto max-w-4xl space-y-6">
          {sections.map((section, index) => (
            <div key={index} className="glass-card rounded-2xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center text-white">
                  {section.icon}
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {section.title}
                </h2>
              </div>
              <ul className="space-y-3">
                {section.content.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                    <span className="text-teal-500 mt-1.5">&#8226;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="glass-card rounded-2xl p-8">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              Questions about our privacy practices?
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              We're here to help. Contact us anytime.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigateTo('CONTACT')}
                className="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                Contact Us
              </button>
              <button
                onClick={() => navigateTo('TERMS')}
                className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                View Terms of Service
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Branding */}
      <footer className="py-8 px-6 border-t border-slate-200 dark:border-slate-800">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateTo('LANDING')}>
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                GB
              </div>
              <span className="font-bold text-lg text-slate-900 dark:text-white">GearBase</span>
            </div>
            <div className="flex gap-6 text-sm">
              <button onClick={() => navigateTo('PRIVACY')} className="text-teal-600 dark:text-teal-400 font-medium">Privacy</button>
              <button onClick={() => navigateTo('TERMS')} className="text-slate-500 hover:text-emerald-500 transition-colors">Terms</button>
              <button onClick={() => navigateTo('CONTACT')} className="text-slate-500 hover:text-emerald-500 transition-colors">Contact</button>
            </div>
            <p className="text-slate-500 text-sm">
              &copy; 2026 GearBase. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyScreen;
