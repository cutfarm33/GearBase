
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Camera, CheckSquare, Smartphone, Shield, ChevronRight, Users, Briefcase, Mail, Zap, Infinity } from 'lucide-react';

type PageView = 'home' | 'privacy' | 'terms' | 'contact';

const WebsiteScreen: React.FC = () => {
  const { navigateTo, state } = useAppContext();
  const [currentPage, setCurrentPage] = useState<PageView>('home');

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const scrollToSection = (id: string) => {
    if (currentPage !== 'home') {
        setCurrentPage('home');
        // Wait for render then scroll
        setTimeout(() => {
            const element = document.getElementById(id);
            if (element) element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    } else {
        const element = document.getElementById(id);
        if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        }
    }
  };

  const handleLaunch = () => {
    if (state.currentUser) {
      navigateTo('DASHBOARD');
    } else {
      navigateTo('LOGIN');
    }
  };

  const LegalLayout: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
      <div className="pt-32 pb-20 px-6 min-h-screen">
          <div className="container mx-auto max-w-3xl">
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">{title}</h1>
              <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 space-y-6 leading-relaxed">
                  {children}
              </div>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-sans selection:bg-sky-500 selection:text-white flex flex-col">

      {/* Navigation is now handled by Header component in App.tsx */}

      {/* CONTENT SWITCHER */}
      <main className="flex-grow">
        {currentPage === 'home' && (
            <>
                {/* Hero Section */}
                <section className="pt-32 pb-20 px-6">
                    <div className="container mx-auto text-center max-w-5xl">
                    <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-semibold border border-emerald-200 dark:border-emerald-700">
                        🚀 Version 2.0 is here
                    </div>

                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                        Track Your Gear.<br/>
                        <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">Own Your Production.</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed font-normal">
                        Professional inventory management built for film crews, rental houses, and production companies. Stop losing gear, start managing it.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <style dangerouslySetInnerHTML={{
                            __html: `
                                @keyframes border-beam {
                                    0% { background-position: 0% 0%; }
                                    100% { background-position: 200% 200%; }
                                }
                                .btn-beam-wrapper {
                                    position: relative;
                                    border-radius: 1rem;
                                }
                                .btn-beam-wrapper::before {
                                    content: '';
                                    position: absolute;
                                    top: -1px;
                                    left: -1px;
                                    right: -1px;
                                    bottom: -1px;
                                    border-radius: inherit;
                                    background: linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.6), transparent);
                                    background-size: 200% 200%;
                                    opacity: 0;
                                    transition: opacity 0.3s;
                                    animation: border-beam 2s linear infinite;
                                    pointer-events: none;
                                    z-index: 0;
                                }
                                .btn-beam-wrapper:hover::before {
                                    opacity: 1;
                                }
                            `
                        }} />
                        <div className="btn-beam-wrapper">
                            <button
                                onClick={handleLaunch}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-bold py-4 px-8 rounded-2xl transition-all shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 flex items-center justify-center gap-2 relative z-10"
                            >
                                Start for Free <ChevronRight size={20} />
                            </button>
                        </div>
                        <button
                            onClick={() => scrollToSection('features')}
                            className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-lg font-bold py-4 px-8 rounded-2xl transition-all border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-700"
                        >
                            Learn More
                        </button>
                    </div>
                    </div>
                </section>

                {/* Feature Grid */}
                <section id="features" className="py-24 bg-slate-50 dark:bg-slate-900">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">Everything you need to run the show</h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">We built this specifically for producers, camera assistants, and rental houses.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100 dark:border-slate-700 group hover:-translate-y-1">
                                <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                                    <CheckSquare size={26} />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Digital Check-in/out</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Scan gear in and out using standard barcodes. Capture digital signatures from crew members for accountability.
                                </p>
                            </div>
                            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100 dark:border-slate-700 group hover:-translate-y-1">
                                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-500 mb-6 group-hover:scale-110 transition-transform">
                                    <Shield size={26} />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Damage Tracking</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Log damage immediately with photos and notes. Track repair status so you never send out broken gear.
                                </p>
                            </div>
                            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100 dark:border-slate-700 group hover:-translate-y-1">
                                <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                                    <Smartphone size={26} />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Mobile First</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Built for the set. Works perfectly on phones and tablets so you can manage inventory from the camera truck.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Mobile App Preview Section */}
                <section className="py-32 px-6 bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20 overflow-hidden">
                    <div className="container mx-auto max-w-7xl">
                        <div className="text-center mb-20">
                            <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-sm font-semibold border border-emerald-200 dark:border-emerald-700">
                                📱 Mobile Experience
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white">
                                Manage gear from anywhere
                            </h2>
                            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                                Track inventory, check out equipment, and manage your production on the go with our beautifully designed mobile app.
                            </p>
                        </div>

                        <div className="relative flex justify-center items-center gap-8 flex-wrap lg:flex-nowrap">
                            {/* Left Phone - Dashboard */}
                            <div className="relative transform lg:-rotate-6 hover:rotate-0 transition-transform duration-500">
                                <div className="w-[280px] h-[580px] bg-slate-900 rounded-[3rem] p-3 shadow-2xl ring-8 ring-slate-900/10 dark:ring-white/10">
                                    <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-[2.5rem] overflow-hidden relative">
                                        {/* Notch */}
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-10"></div>

                                        {/* Content */}
                                        <div className="p-8 pt-12 text-slate-900">
                                            <div className="mb-8">
                                                <div className="text-sm mb-2">9:41</div>
                                                <div className="w-12 h-12 bg-emerald-700 rounded-2xl mb-8"></div>
                                            </div>
                                            <h3 className="text-3xl font-bold mb-2 leading-tight">Track Your<br/>Gear</h3>
                                            <p className="text-sm opacity-80 mb-8 leading-relaxed">Manage your inventory easily using our intuitive interface</p>
                                            <button className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-4 px-6 rounded-2xl transition-colors shadow-lg">
                                                Get Started
                                            </button>
                                            <p className="text-sm text-center mt-4 opacity-70">Already have an account? <span className="font-semibold underline">Login</span></p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Center Phone - Main Dashboard */}
                            <div className="relative z-10 transform lg:scale-110">
                                <div className="w-[280px] h-[580px] bg-slate-900 rounded-[3rem] p-3 shadow-2xl ring-8 ring-slate-900/10 dark:ring-white/10">
                                    <div className="w-full h-full bg-white dark:bg-slate-800 rounded-[2.5rem] overflow-hidden relative">
                                        {/* Notch */}
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-10"></div>

                                        {/* Content */}
                                        <div className="p-6 pt-10">
                                            <div className="flex items-center justify-between mb-6">
                                                <div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400">Hi, Producer</div>
                                                    <div className="text-lg font-bold text-slate-900 dark:text-white">Welcome Back!</div>
                                                </div>
                                                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold relative">
                                                    🔔
                                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full border-2 border-white"></div>
                                                </div>
                                            </div>

                                            <div className="bg-slate-900 dark:bg-slate-700 rounded-2xl p-5 mb-6 text-white">
                                                <div className="text-xs opacity-70 mb-1">Total Inventory</div>
                                                <div className="text-3xl font-bold mb-4">247 Items</div>
                                                <div className="flex gap-2">
                                                    <div className="flex-1 bg-emerald-600/20 backdrop-blur rounded-xl px-3 py-2 text-xs">
                                                        <div className="text-emerald-300">Available</div>
                                                        <div className="font-bold">189</div>
                                                    </div>
                                                    <div className="flex-1 bg-amber-600/20 backdrop-blur rounded-xl px-3 py-2 text-xs">
                                                        <div className="text-amber-300">Out</div>
                                                        <div className="font-bold">58</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-3 mb-6">
                                                <button className="flex-1 bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl text-sm shadow-lg shadow-emerald-500/30">
                                                    Check Out
                                                </button>
                                                <button className="flex-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold py-3 px-4 rounded-xl text-sm">
                                                    Check In
                                                </button>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                                                    <span>Recent Activity</span>
                                                    <span className="text-emerald-600 dark:text-emerald-400">See All →</span>
                                                </div>
                                                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                                                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                                                        CA
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">Camera A</div>
                                                        <div className="text-[10px] text-slate-500 dark:text-slate-400">Today, 14:30</div>
                                                    </div>
                                                    <div className="text-xs font-bold text-red-600">-$450</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Phone - Analytics */}
                            <div className="relative transform lg:rotate-6 hover:rotate-0 transition-transform duration-500">
                                <div className="w-[280px] h-[580px] bg-slate-900 rounded-[3rem] p-3 shadow-2xl ring-8 ring-slate-900/10 dark:ring-white/10">
                                    <div className="w-full h-full bg-white dark:bg-slate-800 rounded-[2.5rem] overflow-hidden relative">
                                        {/* Notch */}
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-10"></div>

                                        {/* Content */}
                                        <div className="p-6 pt-12">
                                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Analytics</h3>

                                            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-5 mb-6">
                                                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Active Jobs</div>
                                                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">12</div>
                                                <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                    ↗ 4.9% <span className="text-slate-400">From last week</span>
                                                </div>
                                            </div>

                                            <div className="mb-6">
                                                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">Equipment Usage</div>
                                                <div className="h-32 bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-4 relative overflow-hidden">
                                                    {/* Simple wave chart simulation */}
                                                    <svg className="w-full h-full" viewBox="0 0 200 80" preserveAspectRatio="none">
                                                        <path d="M 0 60 Q 25 20, 50 30 T 100 45 T 150 25 T 200 40" stroke="rgb(16, 185, 129)" strokeWidth="3" fill="none" opacity="0.8"/>
                                                        <path d="M 0 60 Q 25 20, 50 30 T 100 45 T 150 25 T 200 40 L 200 80 L 0 80 Z" fill="url(#gradient)" opacity="0.2"/>
                                                        <defs>
                                                            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                                <stop offset="0%" style={{ stopColor: 'rgb(16, 185, 129)', stopOpacity: 0.5 }} />
                                                                <stop offset="100%" style={{ stopColor: 'rgb(16, 185, 129)', stopOpacity: 0 }} />
                                                            </linearGradient>
                                                        </defs>
                                                    </svg>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                                        <span className="text-slate-600 dark:text-slate-400">Cameras</span>
                                                    </div>
                                                    <span className="font-bold text-slate-900 dark:text-white">$2,100</span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                        <span className="text-slate-600 dark:text-slate-400">Lighting</span>
                                                    </div>
                                                    <span className="font-bold text-slate-900 dark:text-white">$890</span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                                        <span className="text-slate-600 dark:text-slate-400">Audio</span>
                                                    </div>
                                                    <span className="font-bold text-slate-900 dark:text-white">$645</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-center mt-16">
                            <p className="text-slate-600 dark:text-slate-400 mb-6">Available on iOS and Android</p>
                            <div className="flex gap-4 justify-center flex-wrap">
                                <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-3 px-6 rounded-xl flex items-center gap-3 hover:scale-105 transition-transform">
                                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                                    </svg>
                                    <div className="text-left">
                                        <div className="text-[10px] opacity-70">Download on the</div>
                                        <div className="text-sm">App Store</div>
                                    </div>
                                </button>
                                <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-3 px-6 rounded-xl flex items-center gap-3 hover:scale-105 transition-transform">
                                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                                    </svg>
                                    <div className="text-left">
                                        <div className="text-[10px] opacity-70">GET IT ON</div>
                                        <div className="text-sm">Google Play</div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* About Section */}
                <section id="about" className="py-24 px-6 bg-white dark:bg-slate-900">
                    <div className="container mx-auto max-w-6xl">
                        <div className="flex flex-col md:flex-row items-center gap-16">

                            {/* Content */}
                            <div className="md:w-1/2 order-2 md:order-1">
                                <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-semibold border border-emerald-200 dark:border-emerald-700">
                                    🎬 About Us
                                </div>
                                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white leading-tight">
                                    Built by filmmakers,<br/>
                                    <span className="text-emerald-600 dark:text-emerald-400">for filmmakers.</span>
                                </h2>
                                <p className="text-lg text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                                    Gear Base started on a feature film set when we lost track of a $15,000 lens. That moment of panic led us to build what became the industry's most trusted inventory system.
                                </p>
                                <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                                    Today, we're helping productions of all sizes—from indie shoots to blockbuster features—keep their gear organized, accounted for, and ready to roll.
                                </p>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <CheckSquare size={16} className="text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 dark:text-white mb-1">Production-First Design</div>
                                            <div className="text-slate-600 dark:text-slate-400 text-sm">Built specifically for the chaos of on-set workflows</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <Shield size={16} className="text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 dark:text-white mb-1">Battle-Tested Reliability</div>
                                            <div className="text-slate-600 dark:text-slate-400 text-sm">Used on sets around the world, from commercials to features</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <Users size={16} className="text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 dark:text-white mb-1">Community Driven</div>
                                            <div className="text-slate-600 dark:text-slate-400 text-sm">Every feature requested by real crew members and producers</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Animated Camera Illustration */}
                            <div className="md:w-1/2 order-1 md:order-2 relative">
                                <style dangerouslySetInnerHTML={{
                                    __html: `
                                        @keyframes float {
                                            0%, 100% { transform: translateY(0px); }
                                            50% { transform: translateY(-20px); }
                                        }
                                        @keyframes rotate-slow {
                                            from { transform: rotate(0deg); }
                                            to { transform: rotate(360deg); }
                                        }
                                        @keyframes pulse-glow {
                                            0%, 100% { opacity: 0.2; }
                                            50% { opacity: 0.4; }
                                        }
                                        @keyframes blink {
                                            0%, 49%, 100% { opacity: 1; }
                                            50%, 99% { opacity: 0.3; }
                                        }
                                        .float-animation { animation: float 6s ease-in-out infinite; }
                                        .rotate-animation { animation: rotate-slow 20s linear infinite; }
                                        .pulse-glow-animation { animation: pulse-glow 3s ease-in-out infinite; }
                                        .blink-animation { animation: blink 2s ease-in-out infinite; }
                                    `
                                }} />

                                {/* Background glow */}
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur-3xl opacity-20 pulse-glow-animation"></div>

                                {/* Main illustration container */}
                                <div className="relative aspect-square max-w-md mx-auto">
                                    <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                                        {/* Grid background */}
                                        <g opacity="0.1">
                                            <line x1="0" y1="100" x2="400" y2="100" className="stroke-emerald-500" strokeWidth="1" strokeDasharray="5 5" />
                                            <line x1="0" y1="200" x2="400" y2="200" className="stroke-emerald-500" strokeWidth="1" strokeDasharray="5 5" />
                                            <line x1="0" y1="300" x2="400" y2="300" className="stroke-emerald-500" strokeWidth="1" strokeDasharray="5 5" />
                                            <line x1="100" y1="0" x2="100" y2="400" className="stroke-emerald-500" strokeWidth="1" strokeDasharray="5 5" />
                                            <line x1="200" y1="0" x2="200" y2="400" className="stroke-emerald-500" strokeWidth="1" strokeDasharray="5 5" />
                                            <line x1="300" y1="0" x2="300" y2="400" className="stroke-emerald-500" strokeWidth="1" strokeDasharray="5 5" />
                                        </g>

                                        {/* Inventory Card 1 - Camera */}
                                        <g className="float-animation" style={{ animation: 'float 4s ease-in-out infinite' }}>
                                            <rect x="50" y="80" width="120" height="80" rx="12" className="fill-white dark:fill-slate-800" stroke="rgb(16, 185, 129)" strokeWidth="2" />
                                            <circle cx="80" cy="110" r="15" className="fill-emerald-100 dark:fill-emerald-900/50" />
                                            <rect x="75" y="105" width="10" height="10" rx="2" className="fill-emerald-600 dark:fill-emerald-500" />
                                            <rect x="105" y="105" width="50" height="6" rx="3" className="fill-slate-300 dark:fill-slate-600" />
                                            <rect x="105" y="117" width="35" height="4" rx="2" className="fill-slate-200 dark:fill-slate-700" />
                                            <circle cx="155" cy="145" r="8" className="fill-emerald-500 dark:fill-emerald-400" />
                                            <path d="M 152 145 L 155 148 L 160 143" className="stroke-white dark:stroke-slate-900" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                        </g>

                                        {/* Inventory Card 2 - Lighting */}
                                        <g className="float-animation" style={{ animation: 'float 5s ease-in-out infinite 0.5s' }}>
                                            <rect x="230" y="100" width="120" height="80" rx="12" className="fill-white dark:fill-slate-800" stroke="rgb(251, 191, 36)" strokeWidth="2" />
                                            <circle cx="260" cy="130" r="15" className="fill-amber-100 dark:fill-amber-900/50" />
                                            <circle cx="260" cy="130" r="8" className="fill-amber-500 dark:fill-amber-400" />
                                            <rect x="285" y="125" width="50" height="6" rx="3" className="fill-slate-300 dark:fill-slate-600" />
                                            <rect x="285" y="137" width="35" height="4" rx="2" className="fill-slate-200 dark:fill-slate-700" />
                                            <circle cx="335" cy="165" r="8" className="fill-amber-500 dark:fill-amber-400" />
                                            <path d="M 335 161 L 335 169 M 331 165 L 339 165" className="stroke-white dark:stroke-slate-900" strokeWidth="2" strokeLinecap="round" />
                                        </g>

                                        {/* Inventory Card 3 - Audio */}
                                        <g className="float-animation" style={{ animation: 'float 4.5s ease-in-out infinite 1s' }}>
                                            <rect x="140" y="220" width="120" height="80" rx="12" className="fill-white dark:fill-slate-800" stroke="rgb(59, 130, 246)" strokeWidth="2" />
                                            <circle cx="170" cy="250" r="15" className="fill-blue-100 dark:fill-blue-900/50" />
                                            <rect x="167" y="245" width="6" height="10" rx="1" className="fill-blue-600 dark:fill-blue-500" />
                                            <rect x="195" y="245" width="50" height="6" rx="3" className="fill-slate-300 dark:fill-slate-600" />
                                            <rect x="195" y="257" width="35" height="4" rx="2" className="fill-slate-200 dark:fill-slate-700" />
                                            <rect x="235" y="283" width="16" height="6" rx="3" className="fill-blue-500 dark:fill-blue-400" />
                                        </g>

                                        {/* Center organizing element - Checkmark circle */}
                                        <g className="float-animation" style={{ animation: 'float 6s ease-in-out infinite 0.2s' }}>
                                            <circle cx="200" cy="200" r="35" className="fill-emerald-600 dark:fill-emerald-500" />
                                            <circle cx="200" cy="200" r="28" className="fill-white dark:fill-slate-900" />
                                            <path d="M 190 200 L 197 207 L 212 192" className="stroke-emerald-600 dark:stroke-emerald-500" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                        </g>

                                        {/* Connecting lines with animation */}
                                        <g className="pulse-glow-animation">
                                            <line x1="110" y1="120" x2="165" y2="180" className="stroke-emerald-400 dark:stroke-emerald-600" strokeWidth="2" strokeDasharray="5 5" />
                                            <line x1="290" y1="140" x2="235" y2="185" className="stroke-amber-400 dark:stroke-amber-600" strokeWidth="2" strokeDasharray="5 5" />
                                            <line x1="200" y1="260" x2="200" y2="235" className="stroke-blue-400 dark:stroke-blue-600" strokeWidth="2" strokeDasharray="5 5" />
                                        </g>

                                        {/* Status indicators */}
                                        <g className="blink-animation">
                                            <circle cx="165" cy="85" r="4" className="fill-emerald-500" />
                                            <circle cx="345" cy="105" r="4" className="fill-amber-500" />
                                            <circle cx="255" cy="225" r="4" className="fill-blue-500" />
                                        </g>

                                        {/* Floating count bubbles */}
                                        <g className="float-animation" style={{ animation: 'float 3.5s ease-in-out infinite' }}>
                                            <circle cx="60" cy="220" r="20" className="fill-teal-500 dark:fill-teal-400" opacity="0.9" />
                                            <text x="60" y="227" textAnchor="middle" className="fill-white dark:fill-slate-900" fontSize="16" fontWeight="bold">24</text>
                                        </g>

                                        <g className="float-animation" style={{ animation: 'float 4.2s ease-in-out infinite 0.8s' }}>
                                            <circle cx="360" cy="260" r="20" className="fill-emerald-500 dark:fill-emerald-400" opacity="0.9" />
                                            <text x="360" y="267" textAnchor="middle" className="fill-white dark:fill-slate-900" fontSize="16" fontWeight="bold">89</text>
                                        </g>
                                    </svg>

                                    {/* Floating stats badges */}
                                    <div className="absolute -bottom-4 left-0 right-0 mx-auto max-w-sm">
                                        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl p-5 shadow-xl border border-emerald-100 dark:border-emerald-900/30">
                                            <div className="grid grid-cols-3 gap-4 text-center">
                                                <div>
                                                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">2.5k+</div>
                                                    <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Items</div>
                                                </div>
                                                <div>
                                                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">150+</div>
                                                    <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Productions</div>
                                                </div>
                                                <div>
                                                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">99.9%</div>
                                                    <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Uptime</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="pricing" className="py-24 bg-slate-900 text-white text-center">
                    <div className="container mx-auto px-6">
                        <h2 className="text-4xl font-bold mb-6">Start Free, Upgrade Later</h2>
                        <p className="text-slate-400 mb-12 max-w-xl mx-auto">Get started for free today. No credit card required. Pro features coming soon.</p>
                        
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                            
                            {/* FREE - HIGHLIGHTED */}
                            <div className="bg-gradient-to-b from-emerald-800 to-slate-800 p-8 rounded-2xl border border-emerald-500/50 flex flex-col relative shadow-xl shadow-emerald-500/10">
                                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">AVAILABLE NOW</div>
                                <div className="text-left">
                                    <div className="text-sm font-bold text-emerald-400 uppercase mb-2">Free Forever</div>
                                    <div className="text-4xl font-bold mb-2">$0 <span className="text-lg font-normal text-slate-400">/month</span></div>
                                    <p className="text-slate-300 text-sm mb-6">Full access to all core features. No credit card required.</p>
                                </div>
                                <ul className="space-y-4 mb-8 text-slate-200 text-left flex-grow">
                                    <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-400 mt-1 flex-shrink-0"/> Unlimited Items</li>
                                    <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-400 mt-1 flex-shrink-0"/> Unlimited Jobs</li>
                                    <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-400 mt-1 flex-shrink-0"/> Unlimited Users</li>
                                    <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-400 mt-1 flex-shrink-0"/> QR Code Support</li>
                                    <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-400 mt-1 flex-shrink-0"/> Check-in/Check-out</li>
                                    <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-400 mt-1 flex-shrink-0"/> Digital Signatures</li>
                                </ul>
                                <button onClick={() => navigateTo('SIGNUP')} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition-colors">Get Started Free</button>
                            </div>

                            {/* PRO - COMING SOON */}
                            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 flex flex-col opacity-60 relative">
                                <div className="absolute top-0 right-0 bg-slate-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">COMING SOON</div>
                                <div className="text-left">
                                    <div className="text-sm font-bold text-sky-400 uppercase mb-2 flex items-center gap-2"><Zap size={14}/> Pro</div>
                                    <div className="text-4xl font-bold mb-2">$29 <span className="text-lg font-normal text-slate-500">/mo</span></div>
                                    <p className="text-slate-400 text-sm mb-6">Advanced features for professionals.</p>
                                </div>
                                <ul className="space-y-4 mb-8 text-slate-400 text-left flex-grow">
                                    <li className="flex items-start gap-2"><CheckSquare size={16} className="text-slate-500 mt-1 flex-shrink-0"/> Everything in Free</li>
                                    <li className="flex items-start gap-2"><CheckSquare size={16} className="text-slate-500 mt-1 flex-shrink-0"/> Advanced Reports</li>
                                    <li className="flex items-start gap-2"><CheckSquare size={16} className="text-slate-500 mt-1 flex-shrink-0"/> API Access</li>
                                    <li className="flex items-start gap-2"><CheckSquare size={16} className="text-slate-500 mt-1 flex-shrink-0"/> Priority Support</li>
                                </ul>
                                <button disabled className="w-full bg-slate-700 text-slate-500 font-bold py-3 rounded-lg cursor-not-allowed">Coming Soon</button>
                            </div>

                            {/* TEAM - COMING SOON */}
                            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 flex flex-col opacity-60 relative">
                                <div className="absolute top-0 right-0 bg-slate-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">COMING SOON</div>
                                <div className="text-left">
                                    <div className="text-sm font-bold text-indigo-400 uppercase mb-2 flex items-center gap-2"><Users size={14}/> Team</div>
                                    <div className="text-4xl font-bold mb-2">$99 <span className="text-lg font-normal text-slate-500">/mo</span></div>
                                    <p className="text-slate-400 text-sm mb-6">For production houses and rental studios.</p>
                                </div>
                                <ul className="space-y-4 mb-8 text-slate-400 text-left flex-grow">
                                    <li className="flex items-start gap-2"><CheckSquare size={16} className="text-slate-500 mt-1 flex-shrink-0"/> Everything in Pro</li>
                                    <li className="flex items-start gap-2"><CheckSquare size={16} className="text-slate-500 mt-1 flex-shrink-0"/> Advanced Analytics</li>
                                    <li className="flex items-start gap-2"><CheckSquare size={16} className="text-slate-500 mt-1 flex-shrink-0"/> White Label Options</li>
                                    <li className="flex items-start gap-2"><CheckSquare size={16} className="text-slate-500 mt-1 flex-shrink-0"/> Dedicated Support</li>
                                </ul>
                                <button disabled className="w-full bg-slate-700 text-slate-500 font-bold py-3 rounded-lg cursor-not-allowed">Coming Soon</button>
                            </div>

                            {/* ENTERPRISE - COMING SOON */}
                            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 flex flex-col opacity-60 relative">
                                <div className="absolute top-0 right-0 bg-slate-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">COMING SOON</div>
                                <div className="text-left">
                                    <div className="text-sm font-bold text-amber-500 uppercase mb-2 flex items-center gap-2"><Infinity size={14}/> Enterprise</div>
                                    <div className="text-3xl font-bold mb-2">Custom</div>
                                    <p className="text-slate-400 text-sm mb-6">Custom solutions for large organizations.</p>
                                </div>
                                <ul className="space-y-4 mb-8 text-slate-400 text-left flex-grow">
                                    <li className="flex items-start gap-2"><CheckSquare size={16} className="text-slate-500 mt-1 flex-shrink-0"/> Everything in Team</li>
                                    <li className="flex items-start gap-2"><CheckSquare size={16} className="text-slate-500 mt-1 flex-shrink-0"/> Custom Integrations</li>
                                    <li className="flex items-start gap-2"><CheckSquare size={16} className="text-slate-500 mt-1 flex-shrink-0"/> On-Premise Hosting</li>
                                    <li className="flex items-start gap-2"><CheckSquare size={16} className="text-slate-500 mt-1 flex-shrink-0"/> SLA Guarantee</li>
                                </ul>
                                <button disabled className="w-full bg-slate-700 text-slate-500 font-bold py-3 rounded-lg cursor-not-allowed">Coming Soon</button>
                            </div>

                        </div>
                    </div>
                </section>
            </>
        )}

        {currentPage === 'privacy' && (
            <LegalLayout title="Privacy Policy">
                <p>Last Updated: {new Date().toLocaleDateString()}</p>
                
                <h3>1. Introduction</h3>
                <p>Welcome to Gear Base. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website or use our application and tell you about your privacy rights and how the law protects you.</p>
                
                <h3>2. Data We Collect</h3>
                <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:</p>
                <ul>
                    <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
                    <li><strong>Contact Data:</strong> includes email address.</li>
                    <li><strong>Inventory Data:</strong> includes equipment details, serial numbers, and photos uploaded by you.</li>
                    <li><strong>Usage Data:</strong> includes information about how you use our website and application.</li>
                </ul>

                <h3>3. How We Use Your Data</h3>
                <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
                <ul>
                    <li>To register you as a new customer.</li>
                    <li>To provide the inventory management services you requested.</li>
                    <li>To manage our relationship with you (including notifying you about changes to our terms or privacy policy).</li>
                    <li>To improve our website, products/services, marketing or customer relationships.</li>
                </ul>

                <h3>4. Data Security</h3>
                <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.</p>

                <h3>5. Contact Us</h3>
                <p>If you have any questions about this privacy policy or our privacy practices, please contact us at: <a href="mailto:info@mygearbase.com" className="text-sky-600 hover:underline">info@mygearbase.co</a></p>
            </LegalLayout>
        )}

        {currentPage === 'terms' && (
            <LegalLayout title="Terms of Service">
                <p>Last Updated: {new Date().toLocaleDateString()}</p>

                <h3>1. Acceptance of Terms</h3>
                <p>By accessing and using Gear Base, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.</p>

                <h3>2. Description of Service</h3>
                <p>Gear Base provides users with equipment inventory tracking and management tools. You are responsible for obtaining access to the Service, and that access may involve third-party fees (such as Internet service provider or airtime charges).</p>

                <h3>3. User Account</h3>
                <p>You are responsible for maintaining the security of your account and password. Gear Base cannot and will not be liable for any loss or damage from your failure to comply with this security obligation.</p>

                <h3>4. User Content</h3>
                <p>You retain all rights to the data and content you upload to Gear Base. However, you grant us a worldwide, non-exclusive, royalty-free license to host, store, and display your content solely as required to provide the Service to you.</p>

                <h3>5. Termination</h3>
                <p>We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>

                <h3>6. Limitation of Liability</h3>
                <p>In no event shall Gear Base, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.</p>

                <h3>7. Contact Information</h3>
                <p>Questions about the Terms of Service should be sent to us at <a href="mailto:info@mygearbase.com" className="text-sky-600 hover:underline">info@mygearbase.co</a></p>
            </LegalLayout>
        )}

        {currentPage === 'contact' && (
            <div className="pt-32 pb-20 px-6 min-h-screen flex flex-col items-center">
                <div className="container mx-auto max-w-2xl text-center">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">Get in Touch</h1>
                    <p className="text-xl text-slate-600 dark:text-slate-300 mb-12">
                        Have a question about Gear Base? Interested in an Enterprise plan? We'd love to hear from you.
                    </p>

                    <div className="bg-white dark:bg-slate-800 p-10 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center">
                        <div className="w-16 h-16 bg-sky-100 dark:bg-sky-900/50 rounded-full flex items-center justify-center text-sky-600 dark:text-sky-400 mb-6">
                            <Mail size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Email Us</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">We typically respond within 24 hours.</p>
                        <a href="mailto:info@mygearbase.com" className="text-2xl md:text-3xl font-bold text-sky-600 dark:text-sky-400 hover:underline">
                            info@mygearbase.com
                        </a>
                    </div>

                    <div className="mt-12 grid md:grid-cols-2 gap-8 text-left max-w-2xl mx-auto">
                         <div>
                             <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                 <Briefcase size={18} /> Support
                             </h3>
                             <p className="text-slate-600 dark:text-slate-400">
                                 Need help setting up your account or migrating data? Our support team is ready to assist.
                             </p>
                         </div>
                         <div>
                             <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                 <Users size={18} /> Sales
                             </h3>
                             <p className="text-slate-600 dark:text-slate-400">
                                 Managing a large rental house or studio? Contact us for custom pricing and features.
                             </p>
                         </div>
                    </div>
                </div>
            </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-12 px-6 mt-auto">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentPage('home')}>
                <div className="bg-sky-500 p-1.5 rounded-md text-white">
                    <Camera size={16} />
                </div>
                <span className="font-bold text-slate-900 dark:text-white">Gear Base</span>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
                &copy; {new Date().getFullYear()} Gear Base. All rights reserved.
            </div>
            <div className="flex gap-6">
                <button onClick={() => setCurrentPage('privacy')} className="text-slate-500 hover:text-sky-500 transition-colors text-sm">Privacy</button>
                <button onClick={() => setCurrentPage('terms')} className="text-slate-500 hover:text-sky-500 transition-colors text-sm">Terms</button>
                <button onClick={() => setCurrentPage('contact')} className="text-slate-500 hover:text-sky-500 transition-colors text-sm">Contact</button>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default WebsiteScreen;
