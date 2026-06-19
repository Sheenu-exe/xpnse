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
  <div className="relative overflow-hidden transition-all duration-300 rounded-[32px] p-6 flex flex-col justify-between glass-panel hover:bg-white/[0.08] shadow-sm group h-40">
    
    <div className="flex justify-between items-start relative z-10 w-full mb-4">
      <span className="block text-[11px] font-medium uppercase tracking-wider text-white/50">{title}</span>
      <span className={`px-2 py-1 rounded-md text-[10px] font-medium uppercase tracking-wider flex items-center gap-1 border ${
        trend === "up" ? "bg-sage/10 text-sage border-sage/20" : "bg-red-400/10 text-red-400 border-red-400/20"
      }`}>
        {trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
        {change}
      </span>
    </div>

    <div className="relative z-10 mt-auto">
      <span className="block text-3xl sm:text-4xl font-semibold tracking-tight text-foreground transition-all">
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

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let thisMonthIncome = 0;
    let thisMonthExpense = 0;

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const month = date.toLocaleString("default", { month: "short" });
      const txMonth = date.getMonth();
      const txYear = date.getFullYear();

      if (!monthlyDataTemp[month]) {
        monthlyDataTemp[month] = { name: month, expenses: 0, income: 0 };
      }
      
      if (transaction.type === "expense") {
        monthlyDataTemp[month].expenses += transaction.amount;
        totalExpenses += transaction.amount;
        if (txYear === currentYear && txMonth === currentMonth) {
          thisMonthExpense += transaction.amount;
        }

        if (!categoryDataTemp[transaction.category]) {
          categoryDataTemp[transaction.category] = 0;
        }
        categoryDataTemp[transaction.category] += transaction.amount;
      } else if (transaction.type === "income") {
        monthlyDataTemp[month].income += transaction.amount;
        totalIncome += transaction.amount;
        if (txYear === currentYear && txMonth === currentMonth) {
          thisMonthIncome += transaction.amount;
        }
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

    // Calculate changes based on cumulative totals (up to last month vs up to now)
    const lastMonthTotalIncome = totalIncome - thisMonthIncome;
    const lastMonthTotalExpenses = totalExpenses - thisMonthExpense;
    const lastMonthSavings = lastMonthTotalIncome - lastMonthTotalExpenses;

    const calculateGrowth = (current, previous) => {
      if (previous === 0 || !previous) return current > 0 ? "+100%" : "0%";
      const change = ((current - previous) / Math.abs(previous)) * 100;
      return `${change > 0 ? "+" : ""}${change.toFixed(1)}%`;
    };

    const savingsChange = calculateGrowth(savings, lastMonthSavings);
    const expensesChange = calculateGrowth(totalExpenses, lastMonthTotalExpenses);
    
    const lastMonthRatio = lastMonthTotalIncome ? (lastMonthTotalExpenses / lastMonthTotalIncome) * 100 : 0;
    const ratioChange = calculateGrowth(expenseRatio, lastMonthRatio);

    const avgDailySpend = totalExpenses / 30; // 30-day trailing avg
    const lastMonthAvgDailySpend = lastMonthTotalExpenses / 30;
    const dailySpendChange = calculateGrowth(avgDailySpend, lastMonthAvgDailySpend);

    return {
      monthlyData: monthlyDataArray,
      categoryData: categoryDataArray,
      stats: {
        monthlySavings: savings,
        monthlyExpenses: totalExpenses,
        expenseRatio,
        averageDailySpend: avgDailySpend,
        savingsChange,
        expensesChange,
        ratioChange,
        dailySpendChange
      },
    };
  }, [transactions]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-4 rounded-[24px]">
          <p className="text-white/50 font-medium tracking-wider uppercase text-[11px] mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-[13px] font-medium flex items-center justify-between gap-4">
              <span className="capitalize" style={{ color: entry.color }}>{entry.name}:</span>
              <span className="text-foreground tracking-tight">{currency}{entry.value.toFixed(2)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <BottomNav>
      <div className="min-h-screen bg-background text-foreground selection:bg-sage/30 relative">
        
        {/* Core Architectural Background Orbs */}
        <div className="fixed top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#0A84FF]/20 blur-[150px] rounded-full pointer-events-none mix-blend-screen z-0"></div>
        <div className="fixed bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-[#5E5CE6]/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen z-0"></div>

        <div className="flex flex-col relative z-10 w-full max-w-7xl mx-auto">
          <div className="p-4 md:p-8">
            <Header />

            {/* Title Section */}
            <div className="mb-10 mt-4 flex items-end justify-between">
              <div>
                <p className="text-sage font-medium tracking-wider text-[11px] uppercase mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Performance Metrics
                </p>
                <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground drop-shadow-sm">
                  Analytics
                </h2>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
              <StatCard title="Total Savings" value={`${currency}${stats.monthlySavings.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`} change={stats.savingsChange} trend={parseFloat(stats.savingsChange) >= 0 ? "up" : "down"} />
              <StatCard title="Total Expenses" value={`${currency}${stats.monthlyExpenses.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`} change={stats.expensesChange} trend={parseFloat(stats.expensesChange) <= 0 ? "up" : "down"} />
              <StatCard title="Expense Ratio" value={`${stats.expenseRatio.toFixed(1)}%`} change={stats.ratioChange} trend={parseFloat(stats.ratioChange) <= 0 ? "up" : "down"} />
              <StatCard title="Avg Daily Spend" value={`${currency}${stats.averageDailySpend.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`} change={stats.dailySpendChange} trend={parseFloat(stats.dailySpendChange) <= 0 ? "up" : "down"} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
              {/* Income vs Expenses Trend */}
              <div className="glass-panel rounded-[32px] p-6 md:p-8 relative overflow-hidden">
                <h3 className="text-[17px] font-semibold tracking-tight mb-8">Cash Flow Analysis</h3>
                <div className="h-64 md:h-72 lg:h-80 -ml-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
                      <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} tickFormatter={(val) => `${currency}${val}`} />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                      <Line type="monotone" dataKey="income" stroke="#32D74B" strokeWidth={3} dot={{ fill: '#1C1C1E', stroke: '#32D74B', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#32D74B', stroke: '#fff' }} />
                      <Line type="monotone" dataKey="expenses" stroke="#FF453A" strokeWidth={3} dot={{ fill: '#1C1C1E', stroke: '#FF453A', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#FF453A', stroke: '#fff' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Expense by Category */}
              <div className="glass-panel rounded-[32px] p-6 md:p-8 relative overflow-hidden">
                <h3 className="text-[17px] font-semibold tracking-tight mb-8">Category Distribution</h3>
                <div className="h-64 md:h-72 lg:h-80 -ml-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="category" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
                      <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} tickFormatter={(val) => `${currency}${val}`} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                      <Bar dataKey="amount" fill="#32D74B" radius={[6, 6, 0, 0]} maxBarSize={40} />
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
