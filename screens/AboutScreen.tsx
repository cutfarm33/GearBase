import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Package, Target, Users, Zap, Shield, Cloud, Smartphone, Heart, Lightbulb, Rocket, Award } from 'lucide-react';

const AboutScreen: React.FC = () => {
  const { navigateTo } = useAppContext();

  const values = [
    {
      icon: <Target size={32} />,
      title: 'Simplicity',
      description: 'We believe powerful tools should be easy to use. No complicated training required.',
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      icon: <Zap size={32} />,
      title: 'Speed',
      description: 'Quick check-ins, instant lookups, and real-time updates keep your team moving.',
      gradient: 'from-teal-500 to-blue-500'
    },
    {
      icon: <Users size={32} />,
      title: 'Collaboration',
      description: 'Built for teams, with role-based permissions and seamless communication.',
      gradient: 'from-blue-500 to-teal-500'
    },
    {
      icon: <Package size={32} />,
      title: 'Reliability',
      description: 'Your data is secure, backed up, and always accessible when you need it.',
      gradient: 'from-teal-500 to-emerald-500'
    }
  ];

  const features = [
    {
      icon: <Cloud size={28} />,
      title: 'Cloud-Based',
      description: 'Access from anywhere, automatic backups, and 99.9% uptime guarantee',
      color: 'emerald'
    },
    {
      icon: <Smartphone size={28} />,
      title: 'Mobile-First',
      description: 'Responsive design works seamlessly on phones, tablets, and desktops',
      color: 'teal'
    },
    {
      icon: <Shield size={28} />,
      title: 'Enterprise Security',
      description: 'Bank-level encryption, secure authentication, and complete data isolation',
      color: 'blue'
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
            <div className="inline-block mb-6 px-4 py-1.5 rounded-full glass-card text-teal-700 dark:text-teal-300 text-sm font-semibold">
              <Heart size={16} className="inline mr-2" />
              Built by Production Professionals
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
              About <span className="text-teal-600 dark:text-teal-400">Gear Base</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Empowering production teams with modern gear management solutions
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left - Visual Element */}
            <div className="relative">
              <div className="glass-card rounded-3xl p-12 shadow-glass-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 via-emerald-500/20 to-blue-500/20 blur-3xl"></div>
                <div className="relative z-10">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-6 flex items-center justify-center h-32">
                      <Lightbulb size={48} className="text-white" />
                    </div>
                    <div className="bg-gradient-to-br from-teal-500 to-blue-500 rounded-2xl p-6 flex items-center justify-center h-32">
                      <Rocket size={48} className="text-white" />
                    </div>
                    <div className="bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl p-6 flex items-center justify-center h-32">
                      <Heart size={48} className="text-white" />
                    </div>
                    <div className="bg-gradient-to-br from-teal-500 to-emerald-500 rounded-2xl p-6 flex items-center justify-center h-32">
                      <Award size={48} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Content */}
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-slate-600 dark:text-white mb-6 leading-relaxed">
                At Gear Base, we're dedicated to simplifying equipment management for production companies, film crews, and creative teams. We understand the challenges of tracking valuable gear across multiple locations, productions, and team members.
              </p>
              <p className="text-lg text-slate-600 dark:text-white leading-relaxed">
                Our platform combines powerful inventory management with intuitive design, making it easy to know exactly where your gear is, who has it, and when it's coming back.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-6 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Our Values
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              The principles that guide everything we build and every decision we make
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="glass-card rounded-2xl p-8 text-center shadow-glass hover:shadow-glass-lg transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-transparent blur-2xl"></div>
                <div className="relative z-10">
                  <div className={`w-16 h-16 bg-gradient-to-br ${value.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    <div className="text-white">{value.icon}</div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                    {value.title}
                  </h3>
                  <p className="text-slate-600 dark:text-white">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                Our Story
              </h2>
              <div className="space-y-6">
                <p className="text-lg text-slate-600 dark:text-white leading-relaxed">
                  Gear Base was born from real-world frustration. After years of managing production equipment using spreadsheets, whiteboards, and scattered notes, we knew there had to be a better way.
                </p>
                <p className="text-lg text-slate-600 dark:text-white leading-relaxed">
                  We built Gear Base to solve the problems we faced every day: lost equipment, unclear accountability, time wasted searching for gear, and the constant stress of not knowing what was available for the next shoot.
                </p>
                <p className="text-lg text-slate-600 dark:text-white leading-relaxed">
                  Today, production teams around the world use Gear Base to manage millions of dollars worth of equipment and coordinate hundreds of productions.
                </p>
              </div>
            </div>

            {/* Right - Visual Timeline */}
            <div className="relative">
              <div className="space-y-6">
                <div className="glass-card rounded-2xl p-6 shadow-glass hover:shadow-glass-lg transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-transparent blur-2xl"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                        1
                      </div>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white">The Problem</h4>
                    </div>
                    <p className="text-slate-600 dark:text-white ml-14">
                      Managing gear with spreadsheets and scattered notes was inefficient and error-prone
                    </p>
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-6 shadow-glass hover:shadow-glass-lg transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-500/10 to-transparent blur-2xl"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                        2
                      </div>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white">The Solution</h4>
                    </div>
                    <p className="text-slate-600 dark:text-white ml-14">
                      We built Gear Base - a modern platform designed specifically for production teams
                    </p>
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-6 shadow-glass hover:shadow-glass-lg transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent blur-2xl"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                        3
                      </div>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white">The Impact</h4>
                    </div>
                    <p className="text-slate-600 dark:text-white ml-14">
                      Teams worldwide now manage their gear efficiently, saving time and preventing losses
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Built with Modern Technology
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Gear Base leverages cutting-edge web technologies to deliver a fast, reliable, and secure experience across all your devices
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass-card rounded-2xl p-8 shadow-glass hover:shadow-glass-lg transition-all duration-300 relative overflow-hidden group"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 blur-2xl ${
                  feature.color === 'emerald' ? 'bg-gradient-to-br from-emerald-500/10 to-transparent' :
                  feature.color === 'teal' ? 'bg-gradient-to-br from-teal-500/10 to-transparent' :
                  'bg-gradient-to-br from-blue-500/10 to-transparent'
                }`}></div>
                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg ${
                    feature.color === 'emerald' ? 'bg-gradient-to-br from-emerald-500 to-teal-500' :
                    feature.color === 'teal' ? 'bg-gradient-to-br from-teal-500 to-blue-500' :
                    'bg-gradient-to-br from-blue-500 to-teal-500'
                  }`}>
                    <div className="text-white">{feature.icon}</div>
                  </div>
                  <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-white leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
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
                Ready to Transform Your Gear Management?
              </h2>
              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto">
                Join production teams who have simplified their workflow with Gear Base
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <button
                  onClick={() => navigateTo('SIGNUP')}
                  className="glass-button text-white px-8 py-4 rounded-xl font-bold shadow-glow-teal hover:shadow-glow-emerald hover:scale-105 transition-all text-lg"
                >
                  Start Free Trial
                </button>
                <button
                  onClick={() => navigateTo('CONTACT')}
                  className="glass-card text-slate-900 dark:text-white px-8 py-4 rounded-xl font-bold hover-float shadow-glass hover:shadow-glass-lg border border-emerald-200/50 dark:border-teal-500/30 text-lg"
                >
                  Contact Us
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutScreen;
