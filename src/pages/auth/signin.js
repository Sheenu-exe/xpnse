'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight } from 'lucide-react';
import { FaGithub, FaGoogle } from "react-icons/fa";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { auth } from '../../libs/firebase.config';
import '../../app/globals.css'

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const signIn = async (email, password) => {
    setIsLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/home');
    } catch (error) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithProvider = async (providerName) => {
    setIsLoading(true);
    setError('');
    try {
      const provider = providerName === 'google' ? new GoogleAuthProvider() : new GithubAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/home');
    } catch (error) {
      if (error.code !== 'auth/popup-closed-by-user') {
        console.error("Popup Error Full:", error);
        setError(`Failed to sign in with ${providerName}: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    await signIn(email, password);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-[#0a0a0a] text-white font-sans selection:bg-green-500/30">
      
      {/* Left: Architectural Typography Section (Sticky) */}
      <div className="hidden md:flex md:w-[60%] lg:w-[65%] sticky top-0 h-screen flex-col justify-between p-12 overflow-hidden border-r border-[#1a1a1a]">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="relative z-10">
          <Link href="/" className="inline-block text-xl font-bold tracking-[0.2em] text-white hover:text-green-400 transition-colors">
            XPNSR<span className="text-green-400">.</span>
          </Link>
        </div>

        <div className="relative z-10 flex flex-col justify-end h-full pb-10">
          <p className="text-green-400 font-mono text-sm tracking-widest uppercase mb-4 opacity-80">
            Authentication // Secure Login
          </p>
          <h1 className="text-[5rem] lg:text-[7rem] xl:text-[9rem] leading-[0.85] font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-[#333]">
            ENTER
            <br />
            REALITY.
          </h1>
        </div>
      </div>

      {/* Right: Cardless Form Section (Scrollable if needed) */}
      <div className="w-full md:w-[40%] lg:w-[35%] min-h-screen bg-[#0a0a0a] flex flex-col relative">
        <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 py-16 lg:py-0 max-w-lg mx-auto w-full z-10">
          
          <div className="md:hidden mb-12">
            <Link href="/" className="text-xl font-bold tracking-[0.2em] text-white">
              XPNSR<span className="text-green-400">.</span>
            </Link>
          </div>

          <h2 className="text-3xl font-light mb-2 tracking-tight">Sign In</h2>
          <p className="text-[#666] mb-12 text-sm font-mono tracking-wide">
            Access your financial command center.
          </p>

          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border-l-2 border-red-500 text-red-400 text-sm font-medium animate-fade-in-up">
              {error}
            </div>
          )}

          {/* Minimalist Underline Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-10 group">
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-0 border-b-2 border-[#333] focus:border-green-400 focus:ring-0 px-0 py-2 text-white placeholder-transparent peer transition-colors rounded-none"
                placeholder="Email Address"
                id="email"
                required
              />
              <label 
                htmlFor="email"
                className="absolute left-0 -top-5 text-xs text-[#666] font-mono uppercase tracking-wider transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-2 peer-focus:-top-5 peer-focus:text-xs peer-focus:text-green-400 cursor-text"
              >
                Email Address
              </label>
            </div>

            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-0 border-b-2 border-[#333] focus:border-green-400 focus:ring-0 px-0 py-2 text-white placeholder-transparent peer transition-colors rounded-none"
                placeholder="Password"
                id="password"
                required
              />
              <label 
                htmlFor="password"
                className="absolute left-0 -top-5 text-xs text-[#666] font-mono uppercase tracking-wider transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-2 peer-focus:-top-5 peer-focus:text-xs peer-focus:text-green-400 cursor-text"
              >
                Password
              </label>
            </div>

            <div className="flex justify-between items-center mt-2">
              <Link 
                href="/auth/forgot-password" 
                className="text-[#666] hover:text-white transition-colors text-xs uppercase font-mono tracking-widest"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-white text-black font-bold uppercase tracking-widest hover:bg-green-400 transition-colors flex items-center justify-between px-6 rounded-none disabled:opacity-50 disabled:cursor-not-allowed group-hover:shadow-[0_0_30px_rgba(74,222,128,0.1)] mt-8"
            >
              {isLoading ? (
                <span className="flex items-center gap-3"><Loader2 className="animate-spin w-5 h-5" /> Authenticating</span>
              ) : (
                <>
                  <span>Initialize Login</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Social Auth (Architectural style) */}
          <div className="mt-16">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px bg-[#222] flex-1"></div>
              <span className="text-xs uppercase font-mono tracking-widest text-[#666]">Alternative</span>
              <div className="h-px bg-[#222] flex-1"></div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => signInWithProvider('google')}
                disabled={isLoading}
                className="flex-1 py-4 border border-[#333] flex items-center justify-center hover:border-white hover:bg-white hover:text-black transition-all rounded-none"
                aria-label="Sign in with Google"
              >
                <FaGoogle className="w-5 h-5" />
              </button>
              <button
                onClick={() => signInWithProvider('github')}
                disabled={isLoading}
                className="flex-1 py-4 border border-[#333] flex items-center justify-center hover:border-white hover:bg-white hover:text-black transition-all rounded-none"
                aria-label="Sign in with GitHub"
              >
                <FaGithub className="w-5 h-5" />
              </button>
            </div>
          </div>

          <p className="text-xs text-[#666] uppercase font-mono tracking-widest text-center mt-12">
            No access?{' '}
            <Link href="/auth/signup" className="text-white hover:text-green-400 transition-colors border-b border-white hover:border-green-400 pb-1 ml-2">
              Request Entry
            </Link>
          </p>
        </div>
      </div>
      
      {/* Animation Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease forwards;
        }
      `}} />
    </div>
  );
};

export default SignInPage;