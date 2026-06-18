"use client";

import { useEffect, useState, useMemo } from "react";
import { Wallet, Receipt, TrendingUp, TrendingDown, Save, ArrowUpRight, ArrowDownRight, Activity, Zap, Play } from "lucide-react";
import BottomNav from "../components/sidebar";
import { Header } from "../components/Header";
import AIChat from "../components/AIChat";
import api from "@/libs/api";
import { auth } from "@/libs/firebase.config";

import "../app/globals.css";

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userBudget, setUserBudget] = useState("0");
  const [currency, setCurrency] = useState("₹");
  const [isLoading, setIsLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState(["Awaiting AI telemetry..."]);
  const [hasFetchedAi, setHasFetchedAi] = useState(false);
  const { currentUser } = auth;

  useEffect(() => {
    if (!currentUser) return;

    const loadProfileData = () => {
      const storedProfile = localStorage.getItem(`xpnsr_profile_${currentUser.uid}`);
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        if (parsed.budget) setUserBudget(Number(parsed.budget).toFixed(2));
        
        const symbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹' };
        if (parsed.currency && symbols[parsed.currency]) {
          setCurrency(symbols[parsed.currency]);
        }
      }
    };

    loadProfileData();
    
    const fetchTransactions = async () => {
      try {
        const response = await api.get(`/transactions?userId=${currentUser.uid}`);
        const data = response.data.map((tx) => ({ ...tx, id: tx._id }));
        setTransactions(data);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
    const interval = setInterval(() => {
      fetchTransactions();
      loadProfileData(); 
    }, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const { totalBalance, monthlySpending, monthlyIncome, monthlySavings, recentTransactions, categorySpending } = useMemo(() => {
    let income = 0;
    let expense = 0;
    const categoryTotals = {};

    const filteredRecent = transactions.slice(0, 5);

    transactions.forEach((tx) => {
      if (tx.type === "income") {
        income += tx.amount;
      } else if (tx.type === "expense") {
        expense += tx.amount;
        if (!categoryTotals[tx.category]) {
          categoryTotals[tx.category] = 0;
        }
        categoryTotals[tx.category] += tx.amount;
      }
    });

    const totalExpenses = Object.values(categoryTotals).reduce((acc, val) => acc + val, 0);

    const categorySpendingData = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount: amount.toFixed(2),
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5); 

    const balance = income - expense;

    return {
      totalBalance: balance,
      monthlySpending: expense,
      monthlyIncome: income,
      monthlySavings: income - expense,
      recentTransactions: filteredRecent,
      categorySpending: categorySpendingData,
    };
  }, [transactions]);

  const formatCurrency = (val) => {
    return Number(val).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const runwayMonths = useMemo(() => {
    if (monthlySpending === 0) return "∞";
    return (totalBalance / monthlySpending).toFixed(1);
  }, [totalBalance, monthlySpending]);

  useEffect(() => {
    const fetchInsights = async () => {
      if (transactions.length === 0 || hasFetchedAi) return;
      try {
        const res = await fetch('/api/ai/insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transactions,
            totalBalance,
            monthlyIncome,
            monthlySpending
          })
        });
        const data = await res.json();
        if (data.insights) {
          setAiInsights(data.insights);
          setHasFetchedAi(true);
        }
      } catch (err) {
        console.error("Failed to fetch AI insights", err);
      }
    };
    fetchInsights();
  }, [transactions, hasFetchedAi, totalBalance, monthlyIncome, monthlySpending]);

  return (
    <BottomNav activePage={activeTab} setActivePage={setActiveTab}>
      <div className="min-h-screen bg-forest-900 text-cream selection:bg-sage/30 relative font-sans">
        
        {/* Subtle noise texture overlay */}
        <div className="fixed inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay"></div>
        
        {/* Deep Forest Gradient Spotlights */}
        <div className="fixed top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-sage/5 blur-[150px] rounded-full pointer-events-none mix-blend-screen opacity-50"></div>
        <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-powder/5 blur-[120px] rounded-full pointer-events-none mix-blend-screen opacity-30"></div>

        <div className="flex flex-col relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 pb-32">
          <Header />


          {/* Editorial Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Primary Account Block */}
            <div className="md:col-span-12 lg:col-span-7 bg-forest-700 rounded-luxury p-8 md:p-10 shadow-luxury relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-sage/5 blur-[60px] rounded-full group-hover:bg-sage/10 transition-all duration-700 transform translate-x-10 -translate-y-10"></div>
              
              <div className="flex flex-col h-full justify-between relative z-10">
                <span className="font-mono uppercase tracking-[0.15em] text-xs text-cream/60 font-bold">Your Bag</span>
                
                <div className="mt-16 md:mt-24">
                  {isLoading ? (
                    <div className="h-20 w-64 bg-forest-600/50 rounded-xl animate-pulse"></div>
                  ) : (
                    <>
                      <span className="text-sage text-4xl font-light pr-1 align-top">{currency}</span>
                      <span className="font-display text-7xl md:text-8xl font-black tracking-tighter text-cream drop-shadow-md">
                        {formatCurrency(totalBalance)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Inbound & Outbound Stack */}
            <div className="md:col-span-12 lg:col-span-5 flex flex-col gap-6">
              
              <div className="flex-1 bg-forest-800 rounded-luxury p-8 shadow-luxury-inner flex flex-col justify-center relative overflow-hidden hover:bg-forest-700/80 transition-colors">
                <span className="font-mono text-[10px] uppercase tracking-widest text-cream/50 mb-2 font-bold">Money In</span>
                {isLoading ? (
                  <div className="h-12 w-32 bg-forest-700 rounded-lg animate-pulse"></div>
                ) : (
                  <div className="font-display text-4xl md:text-5xl font-bold tracking-tight text-cream mb-1">
                    <span className="text-sage pr-1">+</span>{currency}{formatCurrency(monthlyIncome)}
                  </div>
                )}
              </div>

              <div className="flex-1 bg-forest-800 rounded-luxury p-8 shadow-luxury-inner flex flex-col justify-center relative overflow-hidden hover:bg-forest-700/80 transition-colors">
                <span className="font-mono text-[10px] uppercase tracking-widest text-cream/50 mb-2 font-bold">Money Out</span>
                {isLoading ? (
                  <div className="h-12 w-32 bg-forest-700 rounded-lg animate-pulse"></div>
                ) : (
                  <div className="font-display text-4xl md:text-5xl font-bold tracking-tight text-cream mb-1">
                    <span className="text-cream/50 pr-1">-</span>{currency}{formatCurrency(monthlySpending)}
                  </div>
                )}
              </div>

            </div>

            {/* Expenditure Matrix (Categories) */}
            <div className="md:col-span-12 lg:col-span-6 bg-forest-800 rounded-luxury p-8 md:p-10 shadow-luxury">
              <h3 className="font-display text-2xl font-bold text-cream tracking-tight mb-2">Where it goes</h3>
              <p className="font-mono text-xs text-cream/50 uppercase tracking-widest mb-10">Trailing 30 Days</p>
              
              <div className="flex flex-col gap-6">
                {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse flex flex-col gap-2">
                      <div className="flex justify-between">
                        <div className="h-4 w-20 bg-forest-700 rounded"></div>
                        <div className="h-4 w-12 bg-forest-700 rounded"></div>
                      </div>
                      <div className="h-2.5 w-full bg-forest-700 rounded-full"></div>
                    </div>
                  ))
                ) : categorySpending.length > 0 ? (
                  categorySpending.map((cat, idx) => (
                    <div key={idx} className="relative group">
                      <div className="flex justify-between items-end mb-2 relative z-10">
                        <span className="text-sm font-bold text-cream tracking-wide">{cat.category}</span>
                        <div className="text-right flex items-center gap-3">
                          <span className="font-mono text-xs text-cream/50">{cat.percentage.toFixed(0)}%</span>
                          <span className="font-mono text-sm font-bold text-cream">{currency}{formatCurrency(cat.amount)}</span>
                        </div>
                      </div>
                      
                      <div className="h-2.5 w-full bg-forest-900 rounded-full overflow-hidden relative z-10">
                        <div 
                          className="h-full bg-sage rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(167,209,174,0.3)]" 
                          style={{ width: `${cat.percentage}%` }} 
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center">
                    <p className="text-sm font-mono uppercase text-cream/30 tracking-widest">No spends yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Ledger Extract */}
            <div className="md:col-span-12 lg:col-span-6 bg-forest-800 rounded-luxury p-8 md:p-10 shadow-luxury">
              <h3 className="font-display text-2xl font-bold text-cream tracking-tight mb-2">Recent Drops</h3>
              <p className="font-mono text-xs text-cream/50 uppercase tracking-widest mb-8">Latest Moves</p>

              <div className="space-y-3">
                {isLoading ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-forest-700/50 p-5 rounded-2xl flex justify-between items-center">
                      <div className="flex items-center gap-5">
                        <div className="w-2 h-2 rounded-full bg-forest-600"></div>
                        <div>
                          <div className="h-4 w-24 bg-forest-600 rounded mb-2"></div>
                          <div className="h-3 w-16 bg-forest-600 rounded"></div>
                        </div>
                      </div>
                      <div className="h-5 w-16 bg-forest-600 rounded"></div>
                    </div>
                  ))
                ) : recentTransactions.length > 0 ? (
                  recentTransactions.map((tx) => (
                    <div key={tx.id} className="flex justify-between items-center bg-forest-700 hover:bg-forest-600 transition-colors p-5 rounded-2xl group cursor-pointer shadow-luxury-inner">
                      <div className="flex items-center gap-5">
                        <div className={`w-2 h-2 rounded-full ${tx.type === "expense" ? "bg-cream/20" : "bg-sage shadow-[0_0_8px_rgba(167,209,174,0.5)]"}`}></div>
                        <div>
                          <p className="text-sm font-bold text-cream tracking-wide">{tx.category || tx.title}</p>
                          <p className="text-[10px] font-mono text-cream/40 uppercase tracking-widest mt-0.5">{new Date(tx.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className={`text-base font-mono font-bold tracking-tight ${tx.type === "expense" ? "text-cream" : "text-sage"}`}>
                        {tx.type === "expense" ? "-" : "+"}{currency}{Number(tx.amount).toFixed(2)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center">
                    <p className="text-sm font-mono uppercase text-cream/30 tracking-widest">Nothing to show yet</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* AI Executive Briefing Panel */}
          <div className="mt-6 w-full bg-forest-800/80 rounded-luxury p-6 shadow-luxury-inner relative overflow-hidden">
            <p className="text-[10px] font-mono text-powder uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-powder animate-pulse"></span> Executive Briefing
            </p>
            <div className="flex flex-col gap-3">
              {aiInsights.map((insight, i) => (
                <p key={i} className="text-sm md:text-lg font-medium text-cream/90 tracking-wide font-sans leading-relaxed">
                  {insight}
                </p>
              ))}
            </div>
          </div>
        </div>
        
        <AIChat 
          transactions={transactions} 
          totalBalance={totalBalance} 
          monthlyIncome={monthlyIncome} 
          monthlySpending={monthlySpending} 
        />
      </div>
    </BottomNav>
  );
};

export default Dashboard;
