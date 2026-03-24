"use client";

import { useEffect, useState, useMemo } from "react";
import { Wallet, Receipt, TrendingUp, TrendingDown, Save, ArrowUpRight, ArrowDownRight, Activity, Zap, Play } from "lucide-react";
import BottomNav from "../components/sidebar";
import { Header } from "../components/Header";
import api from "@/libs/api";
import { auth } from "@/libs/firebase.config";

import "../app/globals.css";

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userBudget, setUserBudget] = useState("0");
  const [currency, setCurrency] = useState("$");
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

    // Initial load
    loadProfileData();
    
    const fetchTransactions = async () => {
      try {
        const response = await api.get(`/transactions?userId=${currentUser.uid}`);
        const data = response.data.map((tx) => ({ ...tx, id: tx._id }));
        setTransactions(data);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
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

    const filteredRecent = transactions.slice(0, 5); // Top 5

    transactions.forEach((tx) => {
      const txDate = new Date(tx.date);
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

  const budgetProgress = useMemo(() => {
    const budgetNum = Number(userBudget);
    if (budgetNum === 0) return 0;
    const p = (monthlySpending / budgetNum) * 100;
    return p > 100 ? 100 : p;
  }, [monthlySpending, userBudget]);

  const formatCurrency = (val) => {
    return Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const aiInsights = useMemo(() => {
    if (transactions.length === 0) return ["Awaiting more telemetry to generate insights..."];
    let msgs = [];
    
    // Savings
    const savingsRate = monthlyIncome > 0 ? ((monthlySavings) / monthlyIncome) * 100 : 0;
    if (savingsRate > 20) msgs.push(`Phenomenal: You are saving ${savingsRate.toFixed(0)}% of your inbound capital.`);
    else if (savingsRate > 0) msgs.push(`Pacing well: You saved ${savingsRate.toFixed(0)}% this time. Aim for 20% to accelerate wealth.`);
    else if (monthlyIncome > 0 && monthlySpending > monthlyIncome) msgs.push(`Warning: Deficit detected. Outbound exceeded inbound by ${currency}${formatCurrency(monthlySpending - monthlyIncome)}.`);

    // Budget
    const bNum = Number(userBudget);
    if (bNum > 0) {
      const burn = (monthlySpending / bNum) * 100;
      if (burn > 90) msgs.push(`Critical Threshold: You have consumed ${burn.toFixed(0)}% of your target budget.`);
      else if (burn < 50 && new Date().getDate() > 15) msgs.push(`Strong conservation: Used only ${burn.toFixed(0)}% of target past mid-month.`);
    }

    // Categories
    if (categorySpending.length > 0) {
      const topCat = categorySpending[0];
      if (topCat.percentage > 40) msgs.push(`Anomaly: '${topCat.category}' constitutes a massive ${topCat.percentage.toFixed(0)}% of total expenditure.`);
    }

    if (msgs.length === 0) msgs.push("Telemetry stable. No financial anomalies detected.");
    return msgs;
  }, [monthlyIncome, monthlySavings, monthlySpending, userBudget, categorySpending, currency, transactions.length]);

  return (
    <BottomNav activePage={activeTab} setActivePage={setActiveTab}>
      <div className="min-h-screen bg-[#050505] text-white selection:bg-green-500/30 relative font-sans">
        
        {/* Dynamic Global Ambient Glow */}
        <div className="fixed top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-green-900/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen opacity-60"></div>
        <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-emerald-700/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen opacity-40"></div>

        <div className="flex flex-col relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 py-6">
          <Header />

          {/* Heading */}
          <div className="mt-4 mb-8">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter text-white drop-shadow-lg">
              Overview.
            </h2>
            <p className="text-gray-400 mt-2 font-mono text-sm tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Live Telemetry Active
            </p>
          </div>

          {/* AI Insights Banner */}
          <div className="mb-8 w-full bg-[#121212] border border-green-500/20 rounded-2xl p-4 md:p-6 shadow-[0_0_30px_rgba(74,222,128,0.05)] relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-[40px] rounded-full"></div>
            <p className="text-[10px] font-mono text-green-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Zap className="w-3 h-3" /> Auto-Coach Insights
            </p>
            <div className="flex flex-col gap-2">
              {aiInsights.map((insight, i) => (
                <p key={i} className="text-sm md:text-base font-semibold text-gray-200 tracking-wide">
                  {insight}
                </p>
              ))}
            </div>
          </div>

          {/* === THE BENTO GRID === */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-32">
            
            {/* Bento Block 1: Master Balance (Large) */}
            <div className="md:col-span-12 lg:col-span-6 bg-gradient-to-br from-[#121212] to-[#0a0a0a] rounded-[2.5rem] p-8 md:p-10 border border-white/5 shadow-2xl relative overflow-hidden group hover:border-green-500/20 transition-all duration-500">
              <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-[60px] rounded-full group-hover:bg-green-500/20 transition-all duration-700 transform translate-x-10 -translate-y-10"></div>
              
              <div className="flex flex-col h-full justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-black/50 border border-white/10 rounded-2xl backdrop-blur-md">
                    <Wallet className="w-6 h-6 text-green-400" />
                  </div>
                  <span className="font-mono uppercase tracking-widest text-xs text-gray-400">Net Liquidity</span>
                </div>
                
                <div className="mt-12 md:mt-24">
                  <span className="text-green-500 text-3xl font-light pr-2">{currency}</span>
                  <span className="text-6xl md:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400">
                    {formatCurrency(totalBalance)}
                  </span>
                </div>
              </div>
            </div>

            {/* Bento Block 2: Cash Flow (Vertical Split) */}
            <div className="md:col-span-6 lg:col-span-3 flex flex-col gap-6">
              
              {/* Income Mini-bento */}
              <div className="flex-1 bg-[#121212] rounded-[2rem] p-6 md:p-8 border border-white/5 hover:bg-[#161616] transition-colors flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-4">
                  <ArrowDownRight className="w-5 h-5 text-green-400 bg-green-400/10 rounded-full p-0.5" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-gray-500">Inbound (30d)</span>
                </div>
                <div className="text-3xl font-bold tracking-tight text-white mb-1">
                  {currency}{formatCurrency(monthlyIncome)}
                </div>
                <p className="text-xs text-gray-500 font-mono tracking-wider">Gross Deposits</p>
              </div>

              {/* Expense Mini-bento */}
              <div className="flex-1 bg-[#121212] rounded-[2rem] p-6 md:p-8 border border-white/5 hover:bg-[#161616] transition-colors flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-4">
                  <ArrowUpRight className="w-5 h-5 text-red-400 bg-red-400/10 rounded-full p-0.5" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-gray-500">Outbound (30d)</span>
                </div>
                <div className="text-3xl font-bold tracking-tight text-white mb-1">
                  {currency}{formatCurrency(monthlySpending)}
                </div>
                <p className="text-xs text-gray-500 font-mono tracking-wider">Gross Capital Out</p>
              </div>

            </div>

            {/* Bento Block 3: Budget Velocity Tracker */}
            <div className="md:col-span-6 lg:col-span-3 bg-[#121212] rounded-[2.5rem] p-8 border border-white/5 flex flex-col items-center justify-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-t from-transparent to-white/[0.02] pointer-events-none"></div>
              
              <span className="font-mono uppercase tracking-widest text-[10px] text-gray-500 mb-8 w-full block text-left">Burn Rate</span>
              
              {/* Circular Radial Graph representation */}
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-neutral-800" />
                  <circle 
                    cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                    strokeDasharray={`${2 * Math.PI * 40}`} 
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - budgetProgress / 100)}`}
                    strokeLinecap="round"
                    className={`transition-all duration-1000 ease-out ${budgetProgress >= 100 ? 'text-red-500' : budgetProgress > 80 ? 'text-yellow-500' : 'text-green-400'}`} 
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center mt-1">
                  <span className="text-2xl font-bold tracking-tighter text-white">{budgetProgress.toFixed(0)}%</span>
                  <span className="text-[10px] uppercase font-mono text-gray-500 block">Consumed</span>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-sm font-semibold text-gray-300">Target: {currency}{formatCurrency(userBudget)}</p>
              </div>
            </div>

            {/* Bento Block 4: Ledger Array (Wide) */}
            <div className="md:col-span-12 lg:col-span-7 bg-[#0d0d0d] rounded-[2.5rem] p-8 border border-white/5">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h3 className="text-xl font-bold text-white tracking-wide">Recent Activity</h3>
                  <p className="font-mono text-xs text-gray-500 uppercase mt-1">Real-time ledger extract</p>
                </div>
                <div className="p-2 bg-[#1a1a1a] rounded-xl hover:bg-[#222] transition-colors cursor-pointer border border-[#2a2a2a] group">
                  <Play className="w-5 h-5 text-gray-400 group-hover:text-green-400 transition-colors" />
                </div>
              </div>

              <div className="space-y-2">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((tx) => (
                    <div key={tx.id} className="flex justify-between items-center bg-[#141414] hover:bg-[#1a1a1a] transition-all p-4 rounded-2xl group border border-transparent hover:border-white/5">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl flex items-center justify-center ${
                          tx.type === "expense" ? "bg-neutral-900 border border-neutral-800 text-gray-400 group-hover:text-white" : "bg-green-500/10 text-green-400 border border-green-500/20"
                        }`}>
                          {tx.type === "expense" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="text-base font-semibold text-gray-200 group-hover:text-white transition-colors">{tx.category || tx.title}</p>
                          <p className="text-[10px] font-mono text-gray-500 uppercase">{new Date(tx.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className={`text-base font-bold font-mono tracking-tight ${tx.type === "expense" ? "text-white" : "text-green-400"}`}>
                        {tx.type === "expense" ? "-" : "+"}{currency}{Number(tx.amount).toFixed(2)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center">
                    <Zap className="w-8 h-8 text-neutral-700 mb-2" />
                    <p className="text-sm font-mono uppercase text-neutral-600">No telemetry recorded</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bento Block 5: Categories Array (Wide) */}
            <div className="md:col-span-12 lg:col-span-5 bg-[#0d0d0d] rounded-[2.5rem] p-8 border border-white/5">
              <h3 className="text-xl font-bold text-white tracking-wide mb-1">Expenditure Matrix</h3>
              <p className="font-mono text-xs text-gray-500 uppercase mb-8">Category allocation</p>
              
              <div className="flex flex-col gap-5">
                {categorySpending.length > 0 ? (
                  categorySpending.map((cat, idx) => (
                    <div key={idx} className="relative group">
                      <div className="flex justify-between items-end mb-2 relative z-10">
                        <span className="text-sm font-bold text-gray-300">{cat.category}</span>
                        <div className="text-right flex items-center gap-3">
                          <span className="text-xs font-mono text-gray-500">{cat.percentage.toFixed(0)}%</span>
                          <span className="text-sm font-bold text-white">{currency}{Number(cat.amount).toLocaleString()}</span>
                        </div>
                      </div>
                      
                      {/* Premium thick progress bar */}
                      <div className="h-2 w-full bg-[#1a1a1a] rounded-full overflow-hidden relative z-10">
                        <div 
                          className="h-full bg-gradient-to-r from-gray-600 to-white rounded-full transition-all duration-1000 ease-out" 
                          style={{ width: `${cat.percentage}%` }} 
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center">
                    <Activity className="w-8 h-8 text-neutral-700 mb-2" />
                    <p className="text-sm font-mono uppercase text-neutral-600">Awaiting data</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </BottomNav>
  );
};

export default Dashboard;
