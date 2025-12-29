import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Mail, Send, HelpCircle, ArrowRight } from 'lucide-react';

const ContactScreen: React.FC = () => {
  const { navigateTo } = useAppContext();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('https://formspree.io/f/mnnezjkg', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const faqs = [
    {
      question: 'How quickly will I get a response?',
      answer: 'We aim to respond to all inquiries within 24 hours during business days. Enterprise customers receive priority support with faster response times.'
    },
    {
      question: 'Can I schedule a demo?',
      answer: 'Absolutely! Contact our sales team at sales@mygearbase.com or use the form above to schedule a personalized demo of Gear Base.'
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
              Get in <span className="text-teal-600 dark:text-teal-400">Touch</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Have questions? We're here to help your team succeed.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="glass-card rounded-3xl p-8 md:p-10 shadow-glass-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-teal-500/10 to-transparent blur-3xl"></div>
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                  Send Us a Message
                </h2>
                {submitted ? (
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200 p-8 rounded-2xl text-center border-2 border-emerald-200 dark:border-emerald-700">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="text-white" size={32} />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
                    <p className="text-lg">We've received your message and will get back to you within 24 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none glass-card text-slate-900 dark:text-white"
                        placeholder="John Smith"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none glass-card text-slate-900 dark:text-white"
                        placeholder="john@company.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                        Subject *
                      </label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none glass-card text-slate-900 dark:text-white"
                      >
                        <option value="">Select a topic...</option>
                        <option value="sales">Sales & Pricing</option>
                        <option value="support">Technical Support</option>
                        <option value="billing">Billing & Accounts</option>
                        <option value="feature">Feature Request</option>
                        <option value="general">General Inquiry</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                        Message *
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none glass-card text-slate-900 dark:text-white resize-none"
                        placeholder="Tell us how we can help..."
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full glass-button text-white px-6 py-4 rounded-xl font-bold shadow-glow-teal hover:shadow-glow-emerald hover:scale-105 transition-all flex items-center justify-center gap-2 text-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      <Send size={20} className={isSubmitting ? 'animate-pulse' : ''} />
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-8">
              {/* Email Contacts */}
              <div className="glass-card rounded-2xl p-8 shadow-glass relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-transparent blur-2xl"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                    <Mail className="text-white" size={24} />
                  </div>
                  <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-4">
                    Email Us Directly
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">General Support</p>
                      <a
                        href="mailto:support@mygearbase.com"
                        className="text-teal-600 dark:text-teal-400 hover:underline font-medium"
                      >
                        support@mygearbase.com
                      </a>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">Sales & Pricing</p>
                      <a
                        href="mailto:sales@mygearbase.com"
                        className="text-teal-600 dark:text-teal-400 hover:underline font-medium"
                      >
                        sales@mygearbase.com
                      </a>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
                    We respond within 24 hours
                  </p>
                </div>
              </div>

              {/* Quick Links */}
              <div className="glass-card rounded-2xl p-8 shadow-glass relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-transparent blur-2xl"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                    <HelpCircle className="text-white" size={24} />
                  </div>
                  <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-4">
                    Quick Links
                  </h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => navigateTo('HELP')}
                      className="flex items-center gap-2 text-teal-600 dark:text-teal-400 hover:gap-3 transition-all font-medium"
                    >
                      <ArrowRight size={18} />
                      View Documentation
                    </button>
                    <button
                      onClick={() => navigateTo('PRICING')}
                      className="flex items-center gap-2 text-teal-600 dark:text-teal-400 hover:gap-3 transition-all font-medium"
                    >
                      <ArrowRight size={18} />
                      See Pricing Plans
                    </button>
                    <button
                      onClick={() => navigateTo('FEATURES')}
                      className="flex items-center gap-2 text-teal-600 dark:text-teal-400 hover:gap-3 transition-all font-medium"
                    >
                      <ArrowRight size={18} />
                      Explore Features
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-12 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="glass-card rounded-2xl p-8 shadow-glass hover:shadow-glass-lg transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-500/10 to-transparent blur-2xl"></div>
                <div className="relative z-10">
                  <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-lg text-slate-600 dark:text-white leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactScreen;
