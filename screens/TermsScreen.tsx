import React from 'react';
import { useAppContext } from '../context/AppContext';
import { FileText, CheckCircle, AlertTriangle, Ban, CreditCard, Scale, RefreshCw, Mail } from 'lucide-react';

const TermsScreen: React.FC = () => {
  const { navigateTo } = useAppContext();

  const sections = [
    {
      icon: <CheckCircle size={24} />,
      title: 'Acceptance of Terms',
      content: `By accessing or using GearBase ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service. We reserve the right to modify these terms at any time, and your continued use of the Service constitutes acceptance of any changes.`
    },
    {
      icon: <FileText size={24} />,
      title: 'Description of Service',
      content: `GearBase is a cloud-based gear and inventory management platform designed for production professionals, creative teams, and businesses. The Service allows you to track equipment, manage jobs, organize teams, and generate reports. Features may vary based on your subscription plan.`
    },
    {
      icon: <AlertTriangle size={24} />,
      title: 'User Responsibilities',
      content: `You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You agree to: (a) provide accurate and complete registration information, (b) maintain the security of your password, (c) notify us immediately of any unauthorized use, (d) use the Service only for lawful purposes, and (e) not attempt to circumvent any security features.`
    },
    {
      icon: <Ban size={24} />,
      title: 'Prohibited Uses',
      content: `You may not use GearBase to: (a) violate any laws or regulations, (b) infringe on intellectual property rights, (c) transmit malicious code or interfere with the Service, (d) harvest user data without consent, (e) impersonate others, (f) store illegal content, or (g) resell access to the Service without authorization.`
    },
    {
      icon: <CreditCard size={24} />,
      title: 'Billing & Subscriptions',
      content: `Free accounts are available with limited features. Paid subscriptions are billed monthly or annually as selected. Prices are subject to change with 30 days notice. Refunds may be provided at our discretion. You may cancel your subscription at any time, and access will continue until the end of your billing period.`
    },
    {
      icon: <Scale size={24} />,
      title: 'Intellectual Property',
      content: `GearBase and its original content, features, and functionality are owned by GearBase and are protected by international copyright, trademark, and other intellectual property laws. Your data remains your property, and you grant us a limited license to use it solely to provide the Service.`
    },
    {
      icon: <RefreshCw size={24} />,
      title: 'Service Availability',
      content: `We strive for 99.9% uptime but do not guarantee uninterrupted access. The Service may be temporarily unavailable for maintenance, updates, or circumstances beyond our control. We are not liable for any losses resulting from service interruptions.`
    },
    {
      icon: <AlertTriangle size={24} />,
      title: 'Limitation of Liability',
      content: `GearBase is provided "as is" without warranties of any kind. To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or business opportunities, regardless of the cause of action.`
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
              <FileText size={16} className="inline mr-2" />
              Legal Agreement
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              Terms of <span className="text-teal-600 dark:text-teal-400">Service</span>
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
              Welcome to GearBase. These Terms of Service ("Terms") govern your access to and use of
              our website, applications, and services. Please read these Terms carefully before using
              GearBase. By creating an account or using our services, you agree to be bound by these Terms.
            </p>
          </div>
        </div>
      </section>

      {/* Terms Sections */}
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
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {section.content}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-8 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="glass-card rounded-2xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center text-white">
                <Mail size={24} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Contact Information
              </h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              If you have any questions about these Terms, please contact us:
            </p>
            <ul className="space-y-2 text-slate-600 dark:text-slate-300">
              <li><strong>Email:</strong> support@mygearbase.com</li>
              <li><strong>Website:</strong> https://mygearbase.com</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="glass-card rounded-2xl p-8">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              Questions about our terms?
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              We're happy to clarify anything. Reach out to our team.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigateTo('CONTACT')}
                className="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                Contact Us
              </button>
              <button
                onClick={() => navigateTo('PRIVACY')}
                className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                View Privacy Policy
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
              <button onClick={() => navigateTo('PRIVACY')} className="text-slate-500 hover:text-emerald-500 transition-colors">Privacy</button>
              <button onClick={() => navigateTo('TERMS')} className="text-teal-600 dark:text-teal-400 font-medium">Terms</button>
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

export default TermsScreen;
