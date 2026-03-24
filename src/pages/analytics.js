"use client";
import { useEffect, useState, useMemo } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { Header } from "../components/Header";
import BottomNav from "../components/sidebar";
import api from "@/libs/api";
import { auth } from "@/libs/firebase.config";

import "../app/globals.css";

const StatCard = ({ title, value, change, trend, currency = "" }) => (
  <div className="relative overflow-hidden transition-all duration-300 rounded-3xl p-6 flex flex-col justify-between bg-[#0f0f0f] border border-[#1f1f1f] hover:border-green-500/30 group h-40 shadow-2xl">
    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-[50px] rounded-full group-hover:bg-green-500/10 transition-colors pointer-events-none"></div>
    
    <div className="flex justify-between items-start relative z-10 w-full mb-4">
      <span className="block text-xs font-mono uppercase tracking-widest text-[#666]">{title}</span>
      <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-mono tracking-wider flex items-center gap-1 border ${
        trend === "up" ? "bg-green-400/10 text-green-400 border-green-400/20" : "bg-red-400/10 text-red-400 border-red-400/20"
      }`}>
        {trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
        {change}
      </span>
    </div>

    <div className="relative z-10 mt-auto">
      <span className="block text-3xl sm:text-4xl font-bold tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all">
        {value}
      </span>
    </div>
  </div>
);

const Analytics = () => {
  const [transactions, setTransactions] = useState([]);
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

    const fetchTransactions = async () => {
      try {
        const response = await api.get(`/transactions?userId=${currentUser.uid}`);
        const data = response.data
          .map((tx) => ({ ...tx, id: tx._id }))
          .sort((a, b) => new Date(a.date) - new Date(b.date));
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

  const { monthlyData, categoryData, stats } = useMemo(() => {
    const monthlyDataTemp = {};
    const categoryDataTemp = {};
    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const month = date.toLocaleString("default", { month: "short" });

      if (!monthlyDataTemp[month]) {
        monthlyDataTemp[month] = { name: month, expenses: 0, income: 0 };
      }
      if (transaction.type === "expense") {
        monthlyDataTemp[month].expenses += transaction.amount;
        totalExpenses += transaction.amount;

        if (!categoryDataTemp[transaction.category]) {
          categoryDataTemp[transaction.category] = 0;
        }
        categoryDataTemp[transaction.category] += transaction.amount;
      } else if (transaction.type === "income") {
        monthlyDataTemp[month].income += transaction.amount;
        totalIncome += transaction.amount;
      }
    });

    const monthlyDataArray = Object.values(monthlyDataTemp)
      .sort((a, b) => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return months.indexOf(a.name) - months.indexOf(b.name);
      });

    const categoryDataArray = Object.entries(categoryDataTemp)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    const savings = totalIncome - totalExpenses;
    const expenseRatio = totalIncome ? (totalExpenses / totalIncome) * 100 : 0;

    return {
      monthlyData: monthlyDataArray,
      categoryData: categoryDataArray,
      stats: {
        monthlySavings: savings,
        monthlyExpenses: totalExpenses,
        expenseRatio,
        averageDailySpend: totalExpenses / 30,
      },
    };
  }, [transactions]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0f0f0f]/90 backdrop-blur-xl border border-[#1f1f1f] p-4 rounded-2xl shadow-2xl">
          <p className="text-[#666] font-mono uppercase tracking-widest text-[10px] mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-bold flex items-center justify-between gap-4 font-mono">
              <span className="capitalize" style={{ color: entry.color }}>{entry.name}:</span>
              <span className="text-white">{currency}{entry.value.toFixed(2)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <BottomNav>
      <div className="min-h-screen bg-[#050505] text-white selection:bg-green-500/30 relative">
        
        {/* Core Architectural Background Orbs */}
        <div className="fixed top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-emerald-600/5 blur-[120px] rounded-full pointer-events-none mix-blend-screen"></div>
        <div className="fixed bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-green-500/5 blur-[100px] rounded-full pointer-events-none mix-blend-screen"></div>

        <div className="flex flex-col relative z-10 w-full max-w-7xl mx-auto">
          <div className="p-4 md:p-8">
            <Header />

            {/* Title Section */}
            <div className="mb-10 mt-4 flex items-end justify-between">
              <div>
                <p className="text-green-400 font-mono text-xs tracking-widest uppercase mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Performance Metrics
                </p>
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                  Analytics Engine.
                </h2>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
              <StatCard title="Total Savings" value={`${currency}${stats.monthlySavings.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`} change="N/A" trend={stats.monthlySavings >= 0 ? "up" : "down"} />
              <StatCard title="Total Expenses" value={`${currency}${stats.monthlyExpenses.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`} change="N/A" trend="down" />
              <StatCard title="Expense Ratio" value={`${stats.expenseRatio.toFixed(1)}%`} change="N/A" trend={stats.expenseRatio < 80 ? "up" : "down"} />
              <StatCard title="Avg Daily Spend" value={`${currency}${stats.averageDailySpend.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`} change="N/A" trend="down" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
              {/* Income vs Expenses Trend */}
              <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1a1a1a] via-green-500/20 to-[#1a1a1a]"></div>
                
                <h3 className="text-lg font-bold tracking-wide mb-8">Cash Flow Analysis</h3>
                <div className="h-64 md:h-72 lg:h-80 -ml-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#111" vertical={false} />
                      <XAxis dataKey="name" stroke="#444" tick={{ fill: '#666', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                      <YAxis stroke="#444" tick={{ fill: '#666', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} tickFormatter={(val) => `${currency}${val}`} />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#222', strokeWidth: 2 }} />
                      <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} dot={{ fill: '#0a0a0a', stroke: '#10b981', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#10b981', stroke: '#fff' }} />
                      <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#0a0a0a', stroke: '#ef4444', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#ef4444', stroke: '#fff' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Expense by Category */}
              <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-600/20 via-[#1a1a1a] to-[#1a1a1a]"></div>
                
                <h3 className="text-lg font-bold tracking-wide mb-8">Category Distribution</h3>
                <div className="h-64 md:h-72 lg:h-80 -ml-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#111" vertical={false} />
                      <XAxis dataKey="category" stroke="#444" tick={{ fill: '#666', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                      <YAxis stroke="#444" tick={{ fill: '#666', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} tickFormatter={(val) => `${currency}${val}`} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: '#111' }} />
                      <Bar dataKey="amount" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </BottomNav>
  );
};

export default Analytics;
