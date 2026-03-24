'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight } from 'lucide-react';
import { FaGithub, FaGoogle } from "react-icons/fa";
import { 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  GithubAuthProvider
} from 'firebase/auth';
import { auth } from '../../libs/firebase.config';
import '../../app/globals.css'

const SignUpPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password should be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/onboarding');
    } catch (err) {
      let errorMessage = 'Failed to create account';
      switch (err.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        default:
          errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderSignUp = async (providerName) => {
    setError('');
    setIsLoading(true);
    
    try {
      const provider = providerName === 'google' ? new GoogleAuthProvider() : new GithubAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/onboarding');
    } catch (authError) {
      if (authError.code === 'auth/popup-closed-by-user') {
        setError('Sign-up cancelled');
      } else {
        console.error("Popup Error Full:", authError);
        setError(`Failed to sign up: ${authError.message}`);
      }
    } finally {
      setIsLoading(false);
    }
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
            Authentication // Secure Registration
          </p>
          <h1 className="text-[5rem] lg:text-[7rem] xl:text-[9.5rem] leading-[0.80] font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-[#333]">
            JOIN
            <br />
            THE GRID.
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

          <h2 className="text-3xl font-light mb-2 tracking-tight">Create Account</h2>
          <p className="text-[#666] mb-12 text-sm font-mono tracking-wide">
            Begin tracking your reality.
          </p>

          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border-l-2 border-red-500 text-red-400 text-sm font-medium animate-fade-in-up">
              {error}
            </div>
          )}

          {/* Minimalist Underline Form */}
          <form onSubmit={handleEmailSignUp} className="space-y-10 group">
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

            <div className="relative">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-transparent border-0 border-b-2 border-[#333] focus:border-green-400 focus:ring-0 px-0 py-2 text-white placeholder-transparent peer transition-colors rounded-none"
                placeholder="Confirm password"
                id="confirmPassword"
                required
              />
              <label 
                htmlFor="confirmPassword"
                className="absolute left-0 -top-5 text-xs text-[#666] font-mono uppercase tracking-wider transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-2 peer-focus:-top-5 peer-focus:text-xs peer-focus:text-green-400 cursor-text"
              >
                Verify Password
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-white text-black font-bold uppercase tracking-widest hover:bg-green-400 transition-colors flex items-center justify-between px-6 rounded-none disabled:opacity-50 disabled:cursor-not-allowed group-hover:shadow-[0_0_30px_rgba(74,222,128,0.1)] mt-8"
            >
              {isLoading ? (
                <span className="flex items-center gap-3"><Loader2 className="animate-spin w-5 h-5" /> Processing</span>
              ) : (
                <>
                  <span>Create Identity</span>
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
                onClick={() => handleProviderSignUp('google')}
                disabled={isLoading}
                className="flex-1 py-4 border border-[#333] flex items-center justify-center hover:border-white hover:bg-white hover:text-black transition-all rounded-none"
                aria-label="Sign up with Google"
              >
                <FaGoogle className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleProviderSignUp('github')}
                disabled={isLoading}
                className="flex-1 py-4 border border-[#333] flex items-center justify-center hover:border-white hover:bg-white hover:text-black transition-all rounded-none"
                aria-label="Sign up with GitHub"
              >
                <FaGithub className="w-5 h-5" />
              </button>
            </div>
          </div>

          <p className="text-xs text-[#666] uppercase font-mono tracking-widest text-center mt-12">
            Already verified?{' '}
            <Link href="/auth/signin" className="text-white hover:text-green-400 transition-colors border-b border-white hover:border-green-400 pb-1 ml-2">
              Access Now
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

export default SignUpPage;
