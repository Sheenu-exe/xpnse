"use client";

import Link from "next/link";
import { ArrowRight, Wallet, PieChart, ShieldCheck, CheckCircle2, Star, Zap, Activity, Smartphone, Twitter, Github, Linkedin } from "lucide-react";
import "../app/globals.css";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-green-500/30 font-sans overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-green-500/20 blur-[120px] rounded-full pointer-events-none fade-in-slow"></div>
      
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-400 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-black" />
          </div>
          <span className="text-xl font-bold tracking-widest text-white">XPNSR</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/auth/signin" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Log In
          </Link>
          <Link href="/auth/signup" className="text-sm font-medium px-5 py-2.5 bg-white text-black rounded-full hover:bg-gray-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center pt-32 pb-20 px-4 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 mb-8 animate-fade-in-up">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          <span className="text-xs font-medium text-gray-300 uppercase tracking-wider">The Future of Finance</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight mb-8 leading-tight animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          Master Your Money <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
            Without Effort.
          </span>
        </h1>
        
        <p className="text-xl text-gray-400 max-w-2xl mb-12 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          XPNSR tracks your expenses, visualizes your spending, and helps you build wealth seamlessly. Stop guessing and start knowing.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <Link href="/auth/signup" className="group flex items-center gap-2 px-8 py-4 bg-green-400 text-black rounded-full font-semibold text-lg hover:bg-green-500 transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(74,222,128,0.3)]">
            Start completely free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/auth/signin" className="px-8 py-4 text-white rounded-full font-semibold text-lg border border-neutral-800 hover:bg-neutral-900 transition-all">
            I already have an account
          </Link>
        </div>
      </main>

      {/* Features Showcase */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-6 pb-32 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
        <div className="p-8 rounded-3xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm hover:border-green-500/30 transition-colors">
          <PieChart className="w-10 h-10 text-green-400 mb-6" />
          <h3 className="text-xl font-semibold mb-3">Intelligent Analytics</h3>
          <p className="text-gray-400">Transform raw data into beautiful, understandable graphs that show exactly where your money goes.</p>
        </div>
        <div className="p-8 rounded-3xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm hover:border-green-500/30 transition-colors">
          <Wallet className="w-10 h-10 text-green-400 mb-6" />
          <h3 className="text-xl font-semibold mb-3">Lightning Fast Entry</h3>
          <p className="text-gray-400">Log expenses in seconds with our optimized interface. Less time tracking, more time living.</p>
        </div>
        <div className="p-8 rounded-3xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm hover:border-green-500/30 transition-colors">
          <ShieldCheck className="w-10 h-10 text-green-400 mb-6" />
          <h3 className="text-xl font-semibold mb-3">Total Privacy</h3>
          <p className="text-gray-400">Your financial data stays securely encypted and entirely private. We never share your data.</p>
        </div>
      </div>
      
      {/* App Interface Showcase */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-32 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
        <div className="rounded-2xl md:rounded-[40px] border border-neutral-800 bg-neutral-900/50 p-2 md:p-4 backdrop-blur-md shadow-[0_0_100px_rgba(74,222,128,0.1)] overflow-hidden relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[20%] bg-green-500/10 blur-[80px] rounded-full"></div>
          <div className="w-full h-48 md:h-96 rounded-xl md:rounded-[30px] bg-black border border-neutral-800 relative overflow-hidden flex flex-col items-center justify-center">
            {/* Mockup elements */}
            <div className="flex gap-4 mb-8 w-full max-w-2xl px-8 opacity-50">
              <div className="h-24 flex-1 bg-neutral-900 rounded-2xl border border-neutral-800"></div>
              <div className="h-24 flex-1 bg-neutral-900 rounded-2xl border border-neutral-800 hidden md:block"></div>
              <div className="h-24 flex-1 bg-neutral-900 rounded-2xl border border-neutral-800 hidden md:block"></div>
            </div>
            <div className="w-full max-w-2xl px-8 opacity-50">
              <div className="h-4 w-1/3 bg-neutral-800 rounded-full mb-4"></div>
              <div className="space-y-3">
                <div className="h-12 w-full bg-neutral-900 rounded-xl border border-neutral-800"></div>
                <div className="h-12 w-full bg-neutral-900 rounded-xl border border-neutral-800"></div>
                <div className="h-12 w-full bg-neutral-900 rounded-xl border border-neutral-800"></div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex items-end justify-center pb-8">
              <span className="px-4 py-2 bg-neutral-900/80 backdrop-blur-md border border-neutral-800 rounded-full text-sm text-green-400 font-medium">Gorgeous Dark Mode Interface</span>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="relative z-10 py-24 bg-neutral-950 border-y border-neutral-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Master your wealth in 3 steps</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">We've removed all the friction from financial tracking so you can focus on building your empire.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-6 relative">
                <div className="absolute -inset-2 bg-green-500/10 rounded-full blur-xl"></div>
                <Smartphone className="w-8 h-8 text-green-400 relative z-10" />
              </div>
              <h3 className="text-2xl font-bold mb-3">1. Connect Your Bags</h3>
              <p className="text-gray-400">Add your bank accounts, wallets, and investments. We create a unified dashboard for all your assets.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-6 relative">
                <div className="absolute -inset-2 bg-green-500/10 rounded-full blur-xl"></div>
                <Zap className="w-8 h-8 text-green-400 relative z-10" />
              </div>
              <h3 className="text-2xl font-bold mb-3">2. Log Instantly</h3>
              <p className="text-gray-400">Log expenses and incomes in seconds. Our system automatically balances your linked accounts.</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-6 relative">
                <div className="absolute -inset-2 bg-green-500/10 rounded-full blur-xl"></div>
                <Activity className="w-8 h-8 text-green-400 relative z-10" />
              </div>
              <h3 className="text-2xl font-bold mb-3">3. Watch it Grow</h3>
              <p className="text-gray-400">Set ambitious savings targets and watch your net worth climb with real-time, beautiful analytics.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials / Social Proof */}
      <div className="relative z-10 py-32 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Loved by builders and creators</h2>
          <p className="text-gray-400">Join thousands of Gen-Z professionals managing their wealth.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { quote: "This app completely changed how I look at my money. The UI is just insanely good.", author: "Alex R.", role: "Software Engineer" },
            { quote: "Finally a finance tracker that doesn't look like it was built in 2005. The dark mode is flawless.", author: "Sarah M.", role: "Product Designer" },
            { quote: "I love the 'Stash' feature. It makes saving for my new setup feel like a game rather than a chore.", author: "David T.", role: "Content Creator" }
          ].map((testimonial, i) => (
            <div key={i} className="p-8 rounded-3xl bg-neutral-900/30 border border-neutral-800">
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((star) => <Star key={star} className="w-4 h-4 fill-green-400 text-green-400" />)}
              </div>
              <p className="text-lg text-gray-300 mb-6">"{testimonial.quote}"</p>
              <div>
                <p className="font-bold text-white">{testimonial.author}</p>
                <p className="text-sm text-gray-500">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Massive CTA */}
      <div className="relative z-10 py-24 mx-4 md:mx-auto max-w-6xl mb-24 rounded-[40px] bg-gradient-to-br from-green-500/20 to-neutral-900 border border-green-500/30 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/20 blur-[100px] rounded-full mix-blend-screen"></div>
        <div className="relative z-10 flex flex-col items-center text-center px-6">
          <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">Ready to secure the bag?</h2>
          <p className="text-xl text-green-100/70 mb-10 max-w-2xl">Stop bleeding cash. Start tracking your wealth. Join XPNSR today and take absolute control of your financial future.</p>
          <Link href="/auth/signup" className="px-10 py-5 bg-white text-black rounded-full font-bold text-xl hover:bg-gray-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_50px_rgba(255,255,255,0.2)]">
            Create Free Account
          </Link>
          <p className="text-sm text-green-100/50 mt-6 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> No credit card required. Setup takes 30 seconds.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-neutral-900 bg-neutral-950 py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-green-400 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-bold tracking-widest text-white">XPNSR</span>
            </div>
            <p className="text-gray-500 text-sm mb-6">The ultimate financial OS for the next generation of builders.</p>
            <div className="flex gap-4">
              <Twitter className="w-5 h-5 text-gray-500 hover:text-white cursor-pointer transition-colors" />
              <Github className="w-5 h-5 text-gray-500 hover:text-white cursor-pointer transition-colors" />
              <Linkedin className="w-5 h-5 text-gray-500 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li className="hover:text-green-400 cursor-pointer transition-colors">Features</li>
              <li className="hover:text-green-400 cursor-pointer transition-colors">Security</li>
              <li className="hover:text-green-400 cursor-pointer transition-colors">Pricing</li>
              <li className="hover:text-green-400 cursor-pointer transition-colors">Changelog</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li className="hover:text-green-400 cursor-pointer transition-colors">About Us</li>
              <li className="hover:text-green-400 cursor-pointer transition-colors">Careers</li>
              <li className="hover:text-green-400 cursor-pointer transition-colors">Blog</li>
              <li className="hover:text-green-400 cursor-pointer transition-colors">Contact</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li className="hover:text-green-400 cursor-pointer transition-colors">Privacy Policy</li>
              <li className="hover:text-green-400 cursor-pointer transition-colors">Terms of Service</li>
              <li className="hover:text-green-400 cursor-pointer transition-colors">Cookie Policy</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-neutral-900 text-sm text-gray-600 text-center">
          © {new Date().getFullYear()} XPNSR Inc. All rights reserved.
        </div>
      </footer>
      
      {/* Custom Global Styles for Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-slow {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .fade-in-slow {
          animation: fade-in-slow 2s ease-out forwards;
        }
      `}} />
    </div>
  );
}
