'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Eye, EyeOff, X } from 'lucide-react';
import { FaGithub, FaGoogle } from "react-icons/fa";
import { GiReceiveMoney } from "react-icons/gi";
import TiltedCard from '../../components/TiltedCard';
import '../../app/globals.css'

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Mock authentication functions
  const signIn = async (email, password) => {
    setIsLoading(true);
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Redirect to home on successful login
      router.push('/home');
    } catch (error) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithProvider = async (provider) => {
    setIsLoading(true);
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Redirect to home on successful login
      router.push('/home');
    } catch (error) {
      setError(`Failed to sign in with ${provider}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    await signIn(email, password);
  };

  return (
    <div className="flex h-screen w-screen">
      {/* Image Section */}
      <div className="hidden lg:flex w-1/2 items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-12">
        <TiltedCard
          imageSrc='/Images/hhholographic(1).webp'
          containerHeight="100vh"
          containerWidth="50vw"
          imageHeight="70vh"
          imageWidth="30vw"
          rotateAmplitude={12}
          scaleOnHover={1.2}
          showMobileWarning={false}
          showTooltip={false}
          displayOverlayContent={true}
        />
      </div>

      {/* Signin Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 lg:px-12 bg-white">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-6">
            <GiReceiveMoney className="w-9 h-9 text-white p-1 rounded-md bg-blue-800" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              XPNSR
            </span>
          </div>

          <h1 className="text-2xl font-bold mb-3 text-gray-800">
            Welcome Back
          </h1>
          <p className="text-gray-500 mb-6 text-base">
            Sign in to continue tracking your expenses.
          </p>

          {error && (
            <div className="mb-5 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded flex items-center">
              <X className="w-5 h-5 mr-3" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => signInWithProvider('google')}
              disabled={isLoading}
              className="flex items-center justify-center py-3 border border-gray-200 rounded-xl hover:bg-gray-50 space-x-2"
            >
              <FaGoogle className="text-gray-600 w-5 h-5" />
              <span className="text-gray-700">Google</span>
            </button>

            <button
              onClick={() => signInWithProvider('github')}
              disabled={isLoading}
              className="flex items-center justify-center py-3 border border-gray-200 rounded-xl hover:bg-gray-50 space-x-2"
            >
              <FaGithub className="text-gray-600 w-5 h-5" />
              <span className="text-gray-700">GitHub</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-gray-500 text-sm">
                or continue with email
              </span>
            </div>
          </div>

          {/* Email Signin Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-800"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-800"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <Link 
                href="/auth/forgot-password" 
                className="text-blue-800 hover:underline text-sm"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 text-base bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-sm text-center mt-5">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-blue-800 hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;