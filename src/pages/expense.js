"use client"
import React, { useState, useEffect } from "react"
import { Header } from "../components/Header"
import BottomNav from "../components/sidebar"
import api from "@/libs/api"
import { auth } from "@/libs/firebase.config"
import { Search, Download, Plus, ArrowUpRight, ArrowDownRight, Zap } from "lucide-react"
import AddTransactionModal from "../components/AddExpensesModal"

export default function Expenses() {
  const [activeTab, setActiveTab] = useState("expenses")
  const [transactions, setTransactions] = useState([])
  const [accounts, setAccounts] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editTxData, setEditTxData] = useState(null)
  const [currency, setCurrency] = useState("₹")
  const { currentUser } = auth

  const fetchData = async () => {
    if (!currentUser) return;
    try {
      const [txRes, accRes] = await Promise.all([
        api.get(`/transactions?userId=${currentUser.uid}`),
        fetch(`/api/savings/accounts?userId=${currentUser.uid}`)
      ]);
      const txData = txRes.data.map((tx) => ({ ...tx, id: tx._id }))
      const accData = await accRes.json()
      setTransactions(txData)
      setAccounts(accData)
    } catch (error) {
      console.error("Failed to fetch data:", error)
    }
  }

  useEffect(() => {
    if (!currentUser) return;

    const storedProfile = localStorage.getItem(`xpnsr_profile_${currentUser.uid}`);
    if (storedProfile) {
      const parsed = JSON.parse(storedProfile);
      const symbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹' };
      if (parsed.currency && symbols[parsed.currency]) {
        setCurrency(symbols[parsed.currency]);
      }
    }

    fetchData()
  }, [currentUser])

  const filteredTransactions = transactions
    .filter(tx => filterType === "all" || tx.type === filterType)
    .filter(tx => {
      const q = searchQuery.toLowerCase()
      return (
        (tx.title && tx.title.toLowerCase().includes(q)) ||
        (tx.category && tx.category.toLowerCase().includes(q)) ||
        (tx.amount && tx.amount.toString().includes(q))
      )
    })

  const downloadCSV = () => {
    if (transactions.length === 0) return;
    
    const headers = ["Date", "Title", "Category", "Type", "Amount", "Description"];
    const csvRows = [];
    csvRows.push(headers.join(","));
    
    transactions.forEach(tx => {
      const row = [
        new Date(tx.date).toLocaleDateString(),
        `"${tx.title || ''}"`,
        `"${tx.category || ''}"`,
        tx.type,
        tx.amount,
        `"${tx.description || ''}"`
      ];
      csvRows.push(row.join(","));
    });
    
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "xpnsr_ledger_export.csv";
    link.click();
  }

  return (
    <BottomNav activePage={activeTab} setActivePage={setActiveTab}>
      <div className="min-h-screen bg-forest-900 text-cream selection:bg-sage/30 relative font-sans">
        
        {/* Subtle noise texture overlay */}
        <div className="fixed inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay"></div>

        <div className="flex flex-col relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 pb-32">
          <Header />

          {/* Heading */}
          <div className="mt-4 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-4xl md:text-5xl font-display font-extrabold tracking-tighter text-cream drop-shadow-lg">
                Master Ledger.
              </h2>
              <p className="text-cream/50 mt-2 font-mono text-sm tracking-wide">
                Complete transaction telemetry
              </p>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/40" />
                <input
                  type="text"
                  placeholder="Query ledger..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-forest-800 border border-forest-600 rounded-xl py-3 pl-11 pr-4 text-sm text-cream placeholder-cream/30 focus:border-sage focus:ring-1 focus:ring-sage transition-all shadow-luxury-inner"
                />
              </div>
              <button 
                onClick={() => { setEditTxData(null); setIsModalOpen(true); }}
                className="bg-sage hover:bg-sage/90 border border-sage/50 p-3 px-6 rounded-xl transition-all shadow-luxury text-forest-900 font-bold tracking-wide flex items-center justify-center gap-2 group flex-shrink-0"
              >
                <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="hidden md:block">New Entry</span>
              </button>
            </div>
          </div>

          {/* Bank Accounts Overview */}
          <div className="mb-8">
            <h3 className="font-mono text-xs text-cream/50 uppercase tracking-widest mb-4">Account Balances</h3>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {accounts.map(acc => (
                <div key={acc._id} className="min-w-[200px] bg-forest-800/80 border border-forest-700 rounded-xl p-4 flex-shrink-0 shadow-luxury">
                  <p className="text-xs font-mono text-cream/50 uppercase truncate">{acc.name}</p>
                  <p className="text-xl font-bold text-cream mt-1">{currency}{acc.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <p className="text-[10px] text-sage mt-2 uppercase tracking-widest">{acc.accountType}</p>
                </div>
              ))}
              {accounts.length === 0 && (
                <div className="min-w-[200px] border border-dashed border-forest-700 rounded-xl p-4 flex items-center justify-center">
                  <p className="text-xs font-mono text-cream/40">No accounts found</p>
                </div>
              )}
            </div>
          </div>

          {/* Filters & Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-between sm:items-center">
            <div className="flex gap-2">
              {["all", "expense", "income"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFilterType(filter)}
                  className={`px-6 py-2 rounded-full uppercase font-mono text-xs tracking-widest transition-all ${
                    filterType === filter 
                      ? "bg-sage/10 text-sage border border-sage/30" 
                      : "bg-forest-800 text-cream/50 border border-forest-600 hover:text-cream"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
            <button 
              onClick={downloadCSV}
              className="px-6 py-2 rounded-full uppercase font-mono text-xs tracking-widest transition-all bg-forest-800 text-cream/50 border border-forest-600 hover:text-cream hover:border-cream/50 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>

          {/* Ledger Table Container */}
          <div className="bg-forest-800 rounded-luxury p-2 md:p-6 shadow-luxury overflow-hidden border border-forest-700/50">
            {filteredTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-forest-700">
                      <th className="py-4 px-4 font-mono text-xs text-cream/50 uppercase tracking-widest">Type</th>
                      <th className="py-4 px-4 font-mono text-xs text-cream/50 uppercase tracking-widest">Details</th>
                      <th className="py-4 px-4 font-mono text-xs text-cream/50 uppercase tracking-widest">Date</th>
                      <th className="py-4 px-4 font-mono text-xs text-cream/50 uppercase tracking-widest text-right">Amount</th>
                      <th className="py-4 px-4 font-mono text-xs text-cream/50 uppercase tracking-widest text-right"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((tx) => (
                      <tr 
                        key={tx.id} 
                        className="border-b border-forest-700/50 hover:bg-forest-700/30 transition-colors group"
                      >
                        <td className="py-5 px-4">
                          <div className={`p-2 w-fit rounded-xl flex items-center justify-center ${
                            tx.type === "expense" ? "bg-forest-900 border border-forest-700 text-cream/50 group-hover:text-cream" : "bg-sage/10 text-sage border border-sage/20"
                          }`}>
                            {tx.type === "expense" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                          </div>
                        </td>
                        <td className="py-5 px-4">
                          <p className="text-base font-bold text-cream tracking-wide">{tx.title}</p>
                          <p className="text-xs font-mono text-cream/50 uppercase mt-1">
                            {tx.category} {tx.accountId && accounts.find(a => a._id === tx.accountId) ? `• ${accounts.find(a => a._id === tx.accountId).name}` : ''}
                          </p>
                        </td>
                        <td className="py-5 px-4">
                          <p className="text-sm text-cream/70 font-mono tracking-tight">{new Date(tx.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                        </td>
                        <td className="py-5 px-4 text-right">
                          <div className={`text-lg font-bold font-mono tracking-tighter ${tx.type === "expense" ? "text-cream" : "text-sage"}`}>
                            {tx.type === "expense" ? "-" : "+"}{currency}{Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </div>
                        </td>
                        <td className="py-5 px-4 text-right">
                          <button 
                            onClick={() => { setEditTxData(tx); setIsModalOpen(true); }}
                            className="text-xs font-mono uppercase tracking-widest text-cream/30 hover:text-sage transition-colors p-2"
                            title="Edit Entry"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-24 flex flex-col items-center justify-center">
                <Zap className="w-10 h-10 text-forest-600 mb-4" />
                <p className="text-sm font-mono uppercase text-cream/40 tracking-widest">No telemetry found</p>
                {searchQuery && (
                  <p className="text-xs text-cream/30 mt-2">Try adjusting your query</p>
                )}
              </div>
            )}
          </div>
          
          <AddTransactionModal
            isOpen={isModalOpen}
            onClose={() => { setIsModalOpen(false); setEditTxData(null); }}
            editData={editTxData}
            onComplete={fetchData}
            accounts={accounts}
          />
        </div>
      </div>
    </BottomNav>
  )
}