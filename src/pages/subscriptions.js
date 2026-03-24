"use client";

import { useEffect, useState, useMemo } from "react";
import BottomNav from "../components/sidebar";
import { Header } from "../components/Header";
import api from "@/libs/api";
import { auth } from "@/libs/firebase.config";
import { AddSubscriptionModal } from "../components/AddSubscriptionModal";
import { CreditCard, Plus, Clock, Zap, Ban, Settings2, ShieldCheck, ZapOff } from "lucide-react";

import "../app/globals.css";

const Subscriptions = () => {
  const [activeTab, setActiveTab] = useState("subscriptions");
  const [subscriptions, setSubscriptions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currency, setCurrency] = useState("$");
  const { currentUser } = auth;

  useEffect(() => {
    if (!currentUser) return;

    const loadProfileData = () => {
      const storedProfile = localStorage.getItem(`xpnsr_profile_${currentUser.uid}`);
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        const symbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹' };
        if (parsed.currency && symbols[parsed.currency]) {
          setCurrency(symbols[parsed.currency]);
        }
      }
    };
    loadProfileData();
    fetchSubscriptions();
  }, [currentUser]);

  const fetchSubscriptions = async () => {
    if (!currentUser) return;
    try {
      const response = await api.get(`/subscriptions?userId=${currentUser.uid}`);
      const data = response.data.map((sub) => ({ ...sub, id: sub._id }));
      setSubscriptions(data);
    } catch (error) {
      console.error("Failed to fetch subscriptions:", error);
    }
  };

  const cancelSubscription = async (id) => {
    if (!confirm("Are you sure you want to cancel tracking this?")) return;
    try {
      await api.delete(`/subscriptions/${id}`);
      fetchSubscriptions();
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const { totalMonthlyBurn, totalYearlyBurn, upcomingThisWeek } = useMemo(() => {
    let monthly = 0;
    let yearly = 0;
    let weekCount = 0;

    const now = new Date();
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(now.getDate() + 7);

    subscriptions.forEach(sub => {
      if (sub.status !== 'active') return;

      if (sub.billingCycle === 'monthly') {
        monthly += sub.amount;
        yearly += sub.amount * 12;
      } else {
        monthly += sub.amount / 12;
        yearly += sub.amount;
      }

      if (sub.nextBillingDate) {
        const nextDate = new Date(sub.nextBillingDate);
        if (nextDate >= now && nextDate <= oneWeekFromNow) {
          weekCount++;
        }
      }
    });

    return { totalMonthlyBurn: monthly, totalYearlyBurn: yearly, upcomingThisWeek: weekCount };
  }, [subscriptions]);

  return (
    <BottomNav activePage={activeTab} setActivePage={setActiveTab}>
      <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 relative font-sans">
        
        {/* Ambient background orbs for Subscriptions (Blueish) */}
        <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen opacity-50"></div>
        <div className="fixed bottom-0 right-0 w-[40vw] h-[40vw] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none mix-blend-screen opacity-40"></div>

        <div className="flex flex-col relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 pb-32">
          <Header />

          {/* Title Area */}
          <div className="mt-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-blue-400 font-mono text-xs tracking-widest uppercase mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Fixed Liability Tracker
              </p>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter text-white drop-shadow-lg leading-tight">
                Burn Rate.
              </h2>
            </div>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold font-mono tracking-widest uppercase text-xs transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] border border-blue-500/50 hover:scale-105"
            >
              <Plus className="w-4 h-4" /> Add Liability
            </button>
          </div>

          {/* Core Master Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
            
            <div className="md:col-span-12 lg:col-span-8 bg-gradient-to-br from-[#121212] to-[#0a0a0a] rounded-[2.5rem] p-8 md:p-10 border border-white/5 shadow-2xl relative overflow-hidden group hover:border-blue-500/20 transition-all duration-500">
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-500/10 blur-[60px] rounded-full group-hover:bg-blue-500/20 transition-all duration-700"></div>
              
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-black/50 border border-white/10 rounded-2xl backdrop-blur-md">
                    <Zap className="w-6 h-6 text-blue-400" />
                  </div>
                  <span className="font-mono uppercase tracking-widest text-xs text-gray-400">Total Fixed Burn (30 Days)</span>
                </div>
                
                <div className="mt-12 md:mt-24">
                  <span className="text-blue-500 text-3xl font-light pr-2">{currency}</span>
                  <span className="text-6xl md:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400">
                    {Number(totalMonthlyBurn).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <div className="md:col-span-12 lg:col-span-4 flex flex-col gap-6">
              <div className="flex-1 bg-[#121212] rounded-[2rem] p-6 border border-white/5 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-red-500/5 pointer-events-none"></div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-2">Annualized Leakage</p>
                <p className="text-3xl font-bold tracking-tight text-white">{currency}{Number(totalYearlyBurn).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>

              <div className="flex-1 bg-[#121212] rounded-[2rem] p-6 border border-white/5 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-yellow-500/5 pointer-events-none"></div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-2">Billing Next 7 Days</p>
                    <p className="text-3xl font-bold tracking-tight text-white">{upcomingThisWeek} <span className="text-sm font-medium text-gray-500 tracking-normal ml-1">services</span></p>
                  </div>
                  <Clock className="w-10 h-10 text-yellow-500/20" />
                </div>
              </div>
            </div>
            
          </div>

          {/* Subscriptions Grid List */}
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-bold text-white tracking-wide">Active Trackers</h3>
            <Settings2 className="w-5 h-5 text-gray-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptions.length > 0 ? (
              subscriptions.map((sub) => (
                <div key={sub.id} className="bg-[#0a0a0a] border border-[#1a1a1a] hover:border-blue-500/30 rounded-3xl p-6 transition-all group relative overflow-hidden shadow-xl">
                  {/* Subtle top border gradient */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
                  
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#141414] border border-[#222] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                        <CreditCard className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-white group-hover:text-blue-300 transition-colors">{sub.name}</h4>
                        <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 mt-1 inline-block">
                          {sub.billingCycle}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => cancelSubscription(sub.id)}
                      className="text-neutral-600 hover:text-red-400 transition-colors tooltip relative inline-flex"
                      title="Untrack / Cancel"
                    >
                      <Ban className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex justify-between items-end mt-auto">
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1">Next Charge</p>
                      <p className="text-sm font-semibold text-gray-300">
                        {sub.nextBillingDate ? new Date(sub.nextBillingDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'}) : "-"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1">Amount</p>
                      <p className="text-2xl font-bold font-mono text-white tracking-tight drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]">
                        {currency}{Number(sub.amount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 flex flex-col items-center justify-center bg-[#0a0a0a] border border-dashed border-[#222] rounded-[2.5rem]">
                <ZapOff className="w-12 h-12 text-[#333] mb-4" />
                <h3 className="text-lg font-bold text-gray-300 mb-2">No active liabilities found</h3>
                <p className="text-sm font-mono text-gray-500 tracking-wide">Initialize a tracker to compute burn rate.</p>
              </div>
            )}
          </div>

        </div>
      </div>

      <AddSubscriptionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdded={fetchSubscriptions} 
      />
    </BottomNav>
  );
};

export default Subscriptions;
