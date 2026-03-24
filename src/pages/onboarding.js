"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/libs/firebase.config";
import { updateProfile, onAuthStateChanged } from "firebase/auth";
import { Loader2, ArrowRight } from "lucide-react";
import "../app/globals.css";

const OnboardingPage = () => {
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [budget, setBudget] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/auth/signup");
      } else {
        setUser(currentUser);
        if (currentUser.displayName) {
          setName(currentUser.displayName);
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (user && name) {
        await updateProfile(user, { displayName: name });
      }
      
      if (user) {
        localStorage.setItem(`xpnsr_profile_${user.uid}`, JSON.stringify({
          currency: currency,
          budget: budget || '0'
        }));
      }
      
      await new Promise(resolve => setTimeout(resolve, 800));
      router.push("/home");
    } catch (error) {
      console.error("Failed to save info", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-green-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-black text-white selection:bg-green-500/30 font-sans overflow-hidden items-center justify-center">
      {/* Background blur element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-green-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-lg px-8 py-10 bg-neutral-900/40 border border-neutral-800 backdrop-blur-md rounded-3xl shadow-2xl">
        <h1 className="text-3xl font-bold mb-2 tracking-tight">Welcome to XPNSR</h1>
        <p className="text-gray-400 mb-8">Let's set up your profile to personalize your dashboard.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none transition-all placeholder:text-neutral-600"
              placeholder="E.g. John Doe"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Preferred Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none transition-all text-white"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Monthly Target Budget
              </label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none transition-all placeholder:text-neutral-600"
                placeholder="0.00"
                min="0"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !name}
            className="w-full py-4 text-black bg-green-400 rounded-xl hover:bg-green-500 transition-all font-semibold text-lg flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              <>
                Go to Dashboard
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OnboardingPage;
