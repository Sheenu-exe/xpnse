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
  const [isLoading, setIsLoading] = useState(true)
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
    } finally {
      setIsLoading(false)
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
        
        {/* Deep Forest Gradient Spotlights */}
        <div className="fixed top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-sage/5 blur-[150px] rounded-full pointer-events-none mix-blend-screen opacity-50"></div>
        <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-powder/5 blur-[120px] rounded-full pointer-events-none mix-blend-screen opacity-30"></div>

        <div className="flex flex-col relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 pb-32">
          <Header />

          {/* Heading */}
          <div className="mt-4 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-4xl md:text-5xl font-display font-extrabold tracking-tighter text-cream drop-shadow-lg">
                Spends.
              </h2>
              <p className="text-cream/50 mt-2 font-mono text-sm tracking-wide">
                Every drop, logged.
              </p>
            </div>
            
            <button 
              onClick={() => { setEditTxData(null); setIsModalOpen(true); }}
              className="bg-sage hover:bg-sage/90 border border-sage/50 p-3 px-6 rounded-xl transition-all shadow-luxury text-forest-900 font-bold tracking-wide flex items-center justify-center gap-2 group w-full md:w-auto"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              <span>New Entry</span>
            </button>
          </div>

          {/* Desktop/Tablet Table View */}
          <div className="hidden md:block bg-forest-800/80 backdrop-blur-xl border border-forest-600 rounded-luxury shadow-luxury overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-forest-600 bg-forest-900/50">
                    <th className="py-4 px-6 text-xs font-mono text-cream/50 uppercase tracking-widest font-semibold">Asset/Type</th>
                    <th className="py-4 px-4 text-xs font-mono text-cream/50 uppercase tracking-widest font-semibold">Title & Category</th>
                    <th className="py-4 px-4 text-xs font-mono text-cream/50 uppercase tracking-widest font-semibold">Date</th>
                    <th className="py-4 px-4 text-xs font-mono text-cream/50 uppercase tracking-widest font-semibold text-right">Impact</th>
                    <th className="py-4 px-6 text-xs font-mono text-cream/50 uppercase tracking-widest font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest-600/50">
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="py-5 px-6"><div className="h-4 w-16 bg-forest-700 rounded"></div></td>
                        <td className="py-5 px-4"><div className="h-4 w-32 bg-forest-700 rounded mb-2"></div><div className="h-3 w-20 bg-forest-700 rounded"></div></td>
                        <td className="py-5 px-4"><div className="h-4 w-24 bg-forest-700 rounded"></div></td>
                        <td className="py-5 px-4 text-right"><div className="h-5 w-20 bg-forest-700 rounded ml-auto"></div></td>
                        <td className="py-5 px-6 text-right"><div className="h-8 w-16 bg-forest-700 rounded ml-auto"></div></td>
                      </tr>
                    ))
                  ) : filteredTransactions.length > 0 ? (
                    filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-forest-700/30 transition-colors group">
                        <td className="py-5 px-6">
                          <div className={`p-2 w-fit rounded-xl ${tx.type === "expense" ? "bg-forest-900 border border-forest-700 text-cream/50" : "bg-sage/10 text-sage"}`}>
                            {tx.type === "expense" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                          </div>
                        </td>
                        <td className="py-5 px-4">
                          <p className="text-base font-bold text-cream tracking-wide">{tx.title}</p>
                          <p className="text-xs font-mono text-cream/50 uppercase mt-1">{tx.category}</p>
                        </td>
                        <td className="py-5 px-4 text-sm text-cream/70 font-mono">
                          {new Date(tx.date).toLocaleDateString()}
                        </td>
                        <td className="py-5 px-4 text-right font-mono font-bold">
                          <span className={tx.type === "expense" ? "text-cream" : "text-sage"}>
                            {tx.type === "expense" ? "-" : "+"}{currency}{Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="py-5 px-6 text-right">
                          <button onClick={() => { setEditTxData(tx); setIsModalOpen(true); }} className="text-xs font-mono uppercase text-cream/30 hover:text-sage">Edit</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="5" className="py-24 text-center text-cream/40 font-mono">No telemetry found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse bg-forest-800/80 border border-forest-600 p-5 rounded-2xl">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-forest-600"></div>
                      <div className="h-4 w-24 bg-forest-600 rounded"></div>
                    </div>
                    <div className="h-5 w-16 bg-forest-600 rounded"></div>
                  </div>
                  <div className="h-3 w-32 bg-forest-600 rounded mb-4"></div>
                  <div className="h-8 w-full bg-forest-700 rounded-lg"></div>
                </div>
              ))
            ) : filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx) => (
                <div key={tx.id} className="bg-forest-800/80 border border-forest-600 p-5 rounded-2xl">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono text-cream/50">{tx.category}</span>
                    <span className={`font-mono font-bold ${tx.type === "expense" ? "text-cream" : "text-sage"}`}>
                      {tx.type === "expense" ? "-" : "+"}{currency}{Number(tx.amount).toLocaleString()}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-cream mb-4">{tx.title}</h4>
                  <button onClick={() => { setEditTxData(tx); setIsModalOpen(true); }} className="w-full py-2 bg-forest-900 border border-forest-700 rounded-lg text-xs font-mono uppercase tracking-widest text-cream/50">Edit Entry</button>
                </div>
              ))
            ) : (
              <div className="py-24 text-center text-cream/40 font-mono">No telemetry found</div>
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