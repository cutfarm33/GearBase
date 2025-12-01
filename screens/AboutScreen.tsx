import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Package, Target, Users, Zap } from 'lucide-react';

const AboutScreen: React.FC = () => {
  const { navigateTo } = useAppContext();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About Gear Base
            </h1>
            <p className="text-xl text-emerald-50 mb-8">
              Empowering production teams with modern gear management solutions
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 text-center">
            Our Mission
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            At Gear Base, we're dedicated to simplifying equipment management for production companies, film crews, and creative teams. We understand the challenges of tracking valuable gear across multiple locations, productions, and team members.
          </p>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            Our platform combines powerful inventory management with intuitive design, making it easy to know exactly where your gear is, who has it, and when it's coming back. From solo operators to large production houses, we help teams stay organized and focused on what matters most: creating amazing content.
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-slate-100 dark:bg-slate-800 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-12 text-center">
            Our Values
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="bg-emerald-100 dark:bg-emerald-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="text-emerald-600 dark:text-emerald-400" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Simplicity
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                We believe powerful tools should be easy to use. No complicated training required.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-emerald-100 dark:bg-emerald-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="text-emerald-600 dark:text-emerald-400" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Speed
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Quick check-ins, instant lookups, and real-time updates keep your team moving.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-emerald-100 dark:bg-emerald-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-emerald-600 dark:text-emerald-400" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Collaboration
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Built for teams, with role-based permissions and seamless communication.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-emerald-100 dark:bg-emerald-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="text-emerald-600 dark:text-emerald-400" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Reliability
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Your data is secure, backed up, and always accessible when you need it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 text-center">
            Our Story
          </h2>
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              Gear Base was born from real-world frustration. After years of managing production equipment using spreadsheets, whiteboards, and scattered notes, we knew there had to be a better way.
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              We built Gear Base to solve the problems we faced every day: lost equipment, unclear accountability, time wasted searching for gear, and the constant stress of not knowing what was available for the next shoot.
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Today, production teams around the world use Gear Base to manage millions of dollars worth of equipment, track thousands of items, and coordinate hundreds of productions. We're proud to help creative professionals spend less time managing gear and more time creating.
            </p>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="bg-slate-100 dark:bg-slate-800 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 text-center">
            Built with Modern Technology
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 leading-relaxed text-center">
            Gear Base leverages cutting-edge web technologies to deliver a fast, reliable, and secure experience across all your devices.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white dark:bg-slate-700 rounded-lg p-6 text-center">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                Cloud-Based
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Access from anywhere, automatic backups, 99.9% uptime
              </p>
            </div>
            <div className="bg-white dark:bg-slate-700 rounded-lg p-6 text-center">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                Mobile-First
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Responsive design works seamlessly on phones, tablets, and desktops
              </p>
            </div>
            <div className="bg-white dark:bg-slate-700 rounded-lg p-6 text-center">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                Enterprise Security
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Bank-level encryption, secure authentication, data isolation
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Ready to Transform Your Gear Management?
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
            Join production teams who have simplified their workflow with Gear Base
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => navigateTo('SIGNUP')}
              className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-lg text-lg"
            >
              Start Free Trial
            </button>
            <button
              onClick={() => navigateTo('CONTACT')}
              className="bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-lg border border-slate-300 dark:border-slate-600 text-lg"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutScreen;
