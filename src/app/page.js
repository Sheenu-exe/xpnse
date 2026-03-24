"use client";

import Link from "next/link";
import { ArrowRight, Wallet, PieChart, ShieldCheck } from "lucide-react";
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
