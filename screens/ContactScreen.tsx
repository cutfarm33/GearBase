import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Mail, MessageSquare, Phone, MapPin, Send } from 'lucide-react';

const ContactScreen: React.FC = () => {
  const { navigateTo } = useAppContext();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send to a backend API
    console.log('Contact form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-emerald-50 mb-8">
              Have questions? We're here to help your team succeed.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                Send Us a Message
              </h2>
              {submitted ? (
                <div className="bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 p-6 rounded-lg text-center">
                  <div className="text-4xl mb-4">✓</div>
                  <h3 className="text-xl font-bold mb-2">Thank You!</h3>
                  <p>We've received your message and will get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      placeholder="john@company.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Subject *
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
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
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      placeholder="Tell us how we can help..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Send size={20} />
                    Send Message
                  </button>
                </form>
              )}
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                  Other Ways to Reach Us
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-emerald-100 dark:bg-emerald-900 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="text-emerald-600 dark:text-emerald-400" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">
                        Email Support
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-2">
                        For general inquiries and support
                      </p>
                      <a href="mailto:support@mygearbase.com" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                        support@mygearbase.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-emerald-100 dark:bg-emerald-900 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="text-emerald-600 dark:text-emerald-400" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">
                        Sales Inquiries
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-2">
                        Questions about pricing or enterprise plans
                      </p>
                      <a href="mailto:sales@mygearbase.com" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                        sales@mygearbase.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-emerald-100 dark:bg-emerald-900 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="text-emerald-600 dark:text-emerald-400" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">
                        Phone Support
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-2">
                        Pro and Enterprise customers only
                      </p>
                      <p className="text-slate-900 dark:text-white font-medium">
                        +1 (555) 123-4567
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-emerald-100 dark:bg-emerald-900 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="text-emerald-600 dark:text-emerald-400" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">
                        Office Location
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        123 Production Way<br />
                        Los Angeles, CA 90001<br />
                        United States
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Support Hours */}
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-6 border border-emerald-200 dark:border-emerald-800">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3">
                  Support Hours
                </h3>
                <div className="space-y-2 text-slate-600 dark:text-slate-400">
                  <p><strong className="text-slate-900 dark:text-white">Email Support:</strong> 24/7</p>
                  <p><strong className="text-slate-900 dark:text-white">Phone Support:</strong> Mon-Fri, 9am-6pm PST</p>
                  <p><strong className="text-slate-900 dark:text-white">Response Time:</strong> Within 24 hours</p>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">
                  Quick Links
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => navigateTo('HELP')}
                    className="text-emerald-600 dark:text-emerald-400 hover:underline block"
                  >
                    → View Documentation
                  </button>
                  <button
                    onClick={() => navigateTo('PRICING')}
                    className="text-emerald-600 dark:text-emerald-400 hover:underline block"
                  >
                    → See Pricing Plans
                  </button>
                  <button
                    onClick={() => navigateTo('FEATURES')}
                    className="text-emerald-600 dark:text-emerald-400 hover:underline block"
                  >
                    → Explore Features
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-slate-100 dark:bg-slate-800 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-700 rounded-lg p-6">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                How quickly will I get a response?
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                We aim to respond to all inquiries within 24 hours during business days. Enterprise customers receive priority support with faster response times.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-700 rounded-lg p-6">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                Do you offer phone support?
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Phone support is available for Pro and Enterprise plan customers Monday through Friday, 9am-6pm PST. Free tier users can reach us via email.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-700 rounded-lg p-6">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                Can I schedule a demo?
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Absolutely! Contact our sales team at sales@mygearbase.com or use the form above to schedule a personalized demo of Gear Base.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactScreen;
