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
      <div className="min-h-screen bg-background text-foreground selection:bg-[#0A84FF]/30 relative font-sans">
        
        {/* Ambient background orbs for Subscriptions (Blueish) */}
        <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#0A84FF]/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen opacity-50"></div>
        <div className="fixed bottom-0 right-0 w-[40vw] h-[40vw] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none mix-blend-screen opacity-40"></div>

        <div className="flex flex-col relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 pb-32">
          <Header />

          {/* Title Area */}
          <div className="mt-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-[#0A84FF] font-medium text-[11px] tracking-wider uppercase mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Fixed Liability Tracker
              </p>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground drop-shadow-sm leading-tight">
                Burn Rate
              </h2>
            </div>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#0A84FF] hover:bg-opacity-90 text-white rounded-full font-medium tracking-wide transition-all duration-300 shadow-sm border border-transparent active:scale-95"
            >
              <Plus className="w-4 h-4" /> Add Liability
            </button>
          </div>

          {/* Core Master Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
            <div className="md:col-span-12 lg:col-span-8 glass-panel rounded-[32px] p-8 md:p-10 relative overflow-hidden group hover:bg-white/[0.08] transition-colors duration-300">
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#0A84FF]/10 blur-[60px] rounded-full group-hover:bg-[#0A84FF]/20 transition-all duration-700"></div>
              
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
                    <Zap className="w-5 h-5 text-[#0A84FF]" />
                  </div>
                  <span className="font-medium tracking-wide text-xs text-white/50">Total Fixed Burn (30 Days)</span>
                </div>
                
                <div className="mt-12 md:mt-24">
                  <span className="text-[#0A84FF] text-3xl font-medium pr-2">{currency}</span>
                  <span className="text-6xl md:text-7xl font-semibold tracking-tight text-foreground">
                    {Number(totalMonthlyBurn).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <div className="md:col-span-12 lg:col-span-4 flex flex-col gap-6">
              <div className="flex-1 glass-panel rounded-[32px] p-6 flex flex-col justify-center relative overflow-hidden hover:bg-white/[0.08] transition-colors duration-300">
                <p className="font-medium text-[11px] tracking-wider text-white/50 mb-2">Annualized Leakage</p>
                <p className="text-3xl font-semibold tracking-tight text-foreground">{currency}{Number(totalYearlyBurn).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>

              <div className="flex-1 glass-panel rounded-[32px] p-6 flex flex-col justify-center relative overflow-hidden hover:bg-white/[0.08] transition-colors duration-300">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-[11px] tracking-wider text-white/50 mb-2">Billing Next 7 Days</p>
                    <p className="text-3xl font-semibold tracking-tight text-foreground">{upcomingThisWeek} <span className="text-sm font-medium text-white/50 ml-1">services</span></p>
                  </div>
                  <Clock className="w-10 h-10 text-white/10" />
                </div>
              </div>
            </div>
            
          </div>

          {/* Subscriptions Grid List */}
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-[17px] font-semibold text-foreground tracking-tight">Active Trackers</h3>
            <Settings2 className="w-5 h-5 text-white/40" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptions.length > 0 ? (
              subscriptions.map((sub) => (
                <div key={sub.id} className="glass-panel hover:bg-white/[0.08] rounded-[32px] p-6 transition-all duration-300 group relative overflow-hidden shadow-sm">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
                        <CreditCard className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[17px] text-foreground tracking-tight">{sub.name}</h4>
                        <span className="text-[11px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#0A84FF]/10 text-[#0A84FF] border border-[#0A84FF]/20 mt-1 inline-block">
                          {sub.billingCycle}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => cancelSubscription(sub.id)}
                      className="text-white/30 hover:text-red-500 transition-colors tooltip relative inline-flex"
                      title="Untrack / Cancel"
                    >
                      <Ban className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex justify-between items-end mt-auto">
                    <div>
                      <p className="text-[11px] font-medium tracking-wider text-white/50 mb-1">Next Charge</p>
                      <p className="text-[15px] font-medium text-foreground tracking-tight">
                        {sub.nextBillingDate ? new Date(sub.nextBillingDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'}) : "-"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-medium tracking-wider text-white/50 mb-1">Amount</p>
                      <p className="text-2xl font-semibold text-foreground tracking-tight">
                        {currency}{Number(sub.amount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 flex flex-col items-center justify-center bg-black/20 border border-dashed border-white/10 rounded-[32px]">
                <ZapOff className="w-10 h-10 text-white/20 mb-4" />
                <h3 className="text-[17px] font-semibold text-foreground tracking-tight mb-2">No active liabilities found</h3>
                <p className="text-sm font-medium text-white/50 tracking-wide">Initialize a tracker to compute burn rate.</p>
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
