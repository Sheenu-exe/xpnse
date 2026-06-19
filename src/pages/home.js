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
      <div className="min-h-screen bg-background text-foreground selection:bg-[#0A84FF]/30 relative font-sans">
        
        {/* Subtle noise texture overlay */}
        <div className="fixed inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay z-0"></div>
        
        {/* Apple-style Ambient Gradients */}
        <div className="fixed top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-[#0A84FF]/20 blur-[150px] rounded-full pointer-events-none mix-blend-screen z-0"></div>
        <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#5E5CE6]/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen z-0"></div>

        <div className="flex flex-col relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 pb-32">
          <Header />


          {/* Editorial Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
            
            {/* Primary Account Block */}
            <div className="md:col-span-12 lg:col-span-7 glass-panel rounded-[32px] p-8 md:p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#0A84FF]/10 blur-[60px] rounded-full group-hover:bg-[#0A84FF]/20 transition-all duration-700 transform translate-x-10 -translate-y-10"></div>
              
              <div className="flex flex-col h-full justify-between relative z-10">
                <span className="font-medium text-xs text-white/50 tracking-wider">Total Balance</span>
                
                <div className="mt-16 md:mt-24">
                  {isLoading ? (
                    <div className="h-20 w-64 bg-white/5 rounded-xl animate-pulse"></div>
                  ) : (
                    <>
                      <span className="text-white/50 text-4xl font-medium pr-1 align-top">{currency}</span>
                      <span className="font-display text-7xl md:text-8xl font-semibold tracking-tight text-foreground">
                        {formatCurrency(totalBalance)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Inbound & Outbound Stack */}
            <div className="md:col-span-12 lg:col-span-5 flex flex-col gap-6">
              
              <div className="flex-1 glass-panel rounded-[32px] p-8 flex flex-col justify-center relative overflow-hidden group hover:bg-white/[0.08] transition-colors duration-300">
                <span className="font-medium text-xs text-white/50 mb-2 tracking-wide">Monthly Inflow</span>
                {isLoading ? (
                  <div className="h-12 w-32 bg-white/5 rounded-lg animate-pulse"></div>
                ) : (
                  <div className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-foreground mb-1">
                    <span className="text-sage pr-1">+</span>{currency}{formatCurrency(monthlyIncome)}
                  </div>
                )}
              </div>

              <div className="flex-1 glass-panel rounded-[32px] p-8 flex flex-col justify-center relative overflow-hidden group hover:bg-white/[0.08] transition-colors duration-300">
                <span className="font-medium text-xs text-white/50 mb-2 tracking-wide">Monthly Outflow</span>
                {isLoading ? (
                  <div className="h-12 w-32 bg-white/5 rounded-lg animate-pulse"></div>
                ) : (
                  <div className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-foreground mb-1">
                    <span className="text-white/40 pr-1">-</span>{currency}{formatCurrency(monthlySpending)}
                  </div>
                )}
              </div>

            </div>

            {/* Expenditure Matrix (Categories) */}
            <div className="md:col-span-12 lg:col-span-6 glass-panel rounded-[32px] p-8 md:p-10">
              <h3 className="font-display text-xl font-semibold text-foreground tracking-tight mb-1">Spending Categories</h3>
              <p className="font-medium text-xs text-white/40 mb-8">Trailing 30 Days</p>
              
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
                        <span className="text-sm font-medium text-foreground tracking-tight">{cat.category}</span>
                        <div className="text-right flex items-center gap-3">
                          <span className="font-medium text-[11px] text-white/40">{cat.percentage.toFixed(0)}%</span>
                          <span className="font-medium text-sm text-foreground tracking-tight">{currency}{formatCurrency(cat.amount)}</span>
                        </div>
                      </div>
                      
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative z-10">
                        <div 
                          className="h-full bg-sage rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(50,215,75,0.3)]" 
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
            <div className="md:col-span-12 lg:col-span-6 glass-panel rounded-[32px] p-8 md:p-10">
              <h3 className="font-display text-xl font-semibold text-foreground tracking-tight mb-1">Recent Transactions</h3>
              <p className="font-medium text-xs text-white/40 mb-8">Latest Moves</p>

              <div className="space-y-3">
                {isLoading ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-white/5 p-4 rounded-[20px] flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-white/20"></div>
                        <div>
                          <div className="h-4 w-24 bg-white/10 rounded mb-2"></div>
                          <div className="h-3 w-16 bg-white/10 rounded"></div>
                        </div>
                      </div>
                      <div className="h-5 w-16 bg-white/10 rounded"></div>
                    </div>
                  ))
                ) : recentTransactions.length > 0 ? (
                  recentTransactions.map((tx) => (
                    <div key={tx.id} className="flex justify-between items-center bg-white/5 hover:bg-white/10 transition-all duration-300 p-4 rounded-[20px] group cursor-pointer shadow-sm border border-white/5 active:scale-95">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${tx.type === "expense" ? "bg-white/30" : "bg-[#32D74B] shadow-[0_0_8px_rgba(50,215,75,0.5)]"}`}></div>
                        <div>
                          <p className="text-[15px] font-medium text-foreground tracking-tight">{tx.category || tx.title}</p>
                          <p className="text-[11px] font-medium text-white/40 mt-0.5">{new Date(tx.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className={`text-[15px] font-medium tracking-tight ${tx.type === "expense" ? "text-foreground" : "text-[#32D74B]"}`}>
                        {tx.type === "expense" ? "-" : "+"}{currency}{Number(tx.amount).toFixed(2)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center">
                    <p className="text-sm font-medium text-white/30">Nothing to show yet</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* AI Executive Briefing Panel */}
          <div className="mt-6 w-full glass-panel rounded-[32px] p-6 md:p-8 relative overflow-hidden">
            <p className="text-[11px] font-medium text-[#0A84FF] tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0A84FF] shadow-[0_0_8px_rgba(10,132,255,0.6)] animate-pulse"></span> EXECUTIVE BRIEFING
            </p>
            <div className="flex flex-col gap-3">
              {aiInsights.map((insight, i) => (
                <p key={i} className="text-[15px] md:text-[17px] font-medium text-foreground tracking-tight leading-relaxed">
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
          userId={currentUser?.uid}
        />
      </div>
    </BottomNav>
  );
};

export default Dashboard;
