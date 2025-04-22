'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  GithubAuthProvider
} from 'firebase/auth';
import { auth } from '../../libs/firebase.config';
import { Loader2, Eye, EyeOff, X } from 'lucide-react';
import { FaGithub, FaGoogle } from "react-icons/fa";
import { GiReceiveMoney } from "react-icons/gi";
import TiltedCard from '../../components/TiltedCard';
import '../../app/globals.css'
const SignUpPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      await apiService.registerUser(); // Register user with our backend
      router.push('/home');
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
  const handleProviderSignUp = async (provider) => {
    setError('');
    setIsLoading(true);
    
    try {
      // First handle Firebase auth
      const userCredential = await signInWithPopup(auth, provider);
      
      try {
        // Then handle backend registration
        await apiService.registerUser();
        router.push('/home');
      } catch (apiError) {
        // If backend registration fails
        if (apiError.message.includes('Unable to connect to the server')) {
          setError('Server connection failed. Please try again later.');
        } else {
          setError('Account created but profile setup failed. Please try again.');
        }
      }
    } catch (authError) {
      if (authError.code === 'auth/popup-closed-by-user') {
        setError('Sign-up cancelled');
      } else {
        setError(`Failed to sign up: ${authError.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen">
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 lg:px-12 bg-white">
        <div className="w-full max-w-[76%]">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-3">
            <GiReceiveMoney className="w-9 h-9 text-white p-1 rounded-md bg-blue-800" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              XPNSR
            </span>
          </div>

          {/* Signup Form */}
          <div>
            <h1 className="text-2xl font-bold mb-3 text-gray-800">
              Create Account
            </h1>
            <p className="text-gray-500 mb-6 text-base">
              Join thousands of users tracking their progress with Vortex.
            </p>

            {error && (
              <div className="mb-5 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded flex items-center">
                <X className="w-5 h-5 mr-3" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* OAuth Buttons */}
            <div className="grid grid-cols-2 gap-4 mb-2">
              <button
                onClick={() => handleProviderSignUp(new GoogleAuthProvider())}
                disabled={isLoading}
                className="flex items-center justify-center py-3 border border-gray-200 rounded-xl hover:bg-gray-50 space-x-2"
              >
                <FaGoogle className="text-gray-600 w-5 h-5" />
                <span className="text-gray-700">Google</span>
              </button>

              <button
                onClick={() => handleProviderSignUp(new GithubAuthProvider())}
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

            {/* Email Signup Form */}
            <form onSubmit={handleEmailSignUp} className="space-y-5">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-800"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 text-base bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center justify-center"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  'Create account'
                )}
              </button>
            </form>

            <p className="text-sm text-black text-center mt-5">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-blue-800 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

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
    </div>
  );
};

export default SignUpPage;
