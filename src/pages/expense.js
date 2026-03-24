"use client";
import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Plus, Receipt } from "lucide-react";
import AddTransactionModal from "../components/AddExpensesModal";
import { Header } from "../components/Header";
import BottomNav from "../components/sidebar";
import api from "@/libs/api";
import { auth } from "@/libs/firebase.config";

import "../app/globals.css";

const ExpenseItem = ({ title, category, amount, date, type, currency }) => (
  <div className="flex items-center gap-4 py-4 border-b border-[#1a1a1a] hover:bg-[#111] transition-colors cursor-pointer group px-4 rounded-2xl">
    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${
      type === "expense" ? "bg-red-500/5 text-red-400 border border-red-500/10" : "bg-green-500/5 text-green-400 border border-green-500/10"
    }`}>
      {type === "expense" ? (
        <ArrowDownRight className="h-6 w-6" />
      ) : (
        <ArrowUpRight className="h-6 w-6" />
      )}
    </div>
    <div className="flex-grow min-w-0">
      <h3 className="text-gray-200 group-hover:text-white font-semibold transition-colors truncate">{title}</h3>
      <p className="text-[11px] font-mono text-[#666] mt-1 uppercase tracking-wider truncate">
        {category} • {new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
      </p>
    </div>
    <div className={`text-lg font-bold font-mono tracking-tight ${type === "expense" ? "text-red-400" : "text-green-400"} drop-shadow-[0_0_8px_rgba(currentColor,0.2)]`}>
      {type === "expense" ? "-" : "+"}{currency}{Number(amount).toFixed(2)}
    </div>
  </div>
);

const Expenses = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [currency, setCurrency] = useState("$");
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
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

  const downloadCSV = () => {
    if (transactions.length === 0) return alert("No ledger data to export.");

    const headers = ["Date", "Type", "Category", "Title", "Amount", "Currency", "Description"];
    
    const rows = transactions.map(tx => [
      new Date(tx.date).toLocaleDateString(),
      tx.type.toUpperCase(),
      tx.category,
      `"${(tx.title || "").replace(/"/g, '""')}"`,
      tx.amount,
      currency,
      `"${(tx.description || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `xpnsr_ledger_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredTransactions = transactions
    .filter(tx => filterType === "all" || tx.type === filterType)
    .filter(tx => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        (tx.title && tx.title.toLowerCase().includes(q)) ||
        (tx.category && tx.category.toLowerCase().includes(q)) ||
        (tx.amount && tx.amount.toString().includes(q))
      );
    });

  return (
    <BottomNav activePage="expenses">
      <div className="min-h-screen bg-[#050505] text-white selection:bg-green-500/30 relative">
        
        {/* Core Architectural Background Orbs */}
        <div className="fixed top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-green-500/5 blur-[120px] rounded-full pointer-events-none mix-blend-screen"></div>

        <div className="flex flex-col relative z-10 w-full max-w-7xl mx-auto">
          <div className="p-4 md:p-8">
            <Header />

            {/* Title Section */}
            <div className="mb-8 mt-4 flex items-end justify-between">
              <div>
                <p className="text-green-400 font-mono text-xs tracking-widest uppercase mb-2 flex items-center gap-2">
                  <Receipt className="w-4 h-4" /> Comprehensive Ledger
                </p>
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                  Transactions.
                </h2>
              </div>
            </div>

            <div className="flex gap-4 mb-8">
              <div className="flex-grow bg-[#0f0f0f] border border-[#1a1a1a] p-3 md:p-4 rounded-2xl flex items-center gap-3 shadow-lg focus-within:border-green-500/50 transition-colors">
                <Search className="w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="QUERY TRANSACTIONS BY NAME, CATEGORY, OR AMOUNT..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent w-full focus:outline-none text-white placeholder:text-[#444] font-mono text-xs uppercase tracking-widest"
                />
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-green-500 hover:bg-green-400 p-3 md:px-8 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 group"
              >
                <Plus className="text-black w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-black font-bold tracking-wide hidden md:block">New Entry</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-8 border-b border-[#1a1a1a] pb-4 justify-between sm:items-center">
              <div className="flex gap-2">
                {["all", "expense", "income"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setFilterType(filter)}
                    className={`px-6 py-2 rounded-full uppercase font-mono text-xs tracking-widest transition-all ${
                      filterType === filter 
                        ? "bg-green-500/10 text-green-400 border border-green-500/30" 
                        : "bg-[#0f0f0f] text-gray-500 border border-[#1a1a1a] hover:text-white"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <button 
                onClick={downloadCSV}
                className="px-6 py-2 rounded-full uppercase font-mono text-xs tracking-widest transition-all bg-[#0f0f0f] text-gray-400 border border-[#1a1a1a] hover:text-white hover:border-gray-500 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Export CSV
              </button>
            </div>

            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-3xl p-4 md:p-6 shadow-2xl relative overflow-hidden pb-12">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1a1a1a] via-green-500/20 to-[#1a1a1a]"></div>
                
              <div className="space-y-1">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx) => (
                    <ExpenseItem key={tx.id} {...tx} currency={currency} />
                  ))
                ) : (
                  <div className="py-20 text-center flex flex-col items-center justify-center opacity-50">
                    <Receipt className="w-16 h-16 text-[#333] mb-4" />
                    <p className="text-[#666] font-mono uppercase tracking-widest text-sm">No Logs Available</p>
                  </div>
                )}
              </div>
            </div>

            <AddTransactionModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      </div>
    </BottomNav>
  );
};

export default Expenses;