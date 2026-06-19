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
      <div className="min-h-screen bg-background text-foreground selection:bg-[#0A84FF]/30 relative font-sans">
        
        {/* Apple-style Ambient Gradients */}
        <div className="fixed top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-[#0A84FF]/20 blur-[150px] rounded-full pointer-events-none mix-blend-screen z-0"></div>
        <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#5E5CE6]/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen z-0"></div>

        <div className="flex flex-col relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 pb-32">
          <Header />

          {/* Heading */}
          <div className="mt-4 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground drop-shadow-sm">
                Transactions
              </h2>
              <p className="text-white/50 mt-2 font-medium text-sm tracking-wide">
                Your entire ledger history.
              </p>
            </div>
            
            <button 
              onClick={() => { setEditTxData(null); setIsModalOpen(true); }}
              className="bg-[#0A84FF] hover:bg-opacity-90 p-3 px-6 rounded-full transition-all shadow-sm text-white font-medium tracking-wide flex items-center justify-center gap-2 group w-full md:w-auto active:scale-95"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              <span>New Entry</span>
            </button>
          </div>

          {/* Desktop/Tablet Table View */}
          <div className="hidden md:block glass-panel rounded-[32px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-black/20">
                    <th className="py-4 px-6 text-xs font-medium text-white/50 uppercase tracking-wider">Asset/Type</th>
                    <th className="py-4 px-4 text-xs font-medium text-white/50 uppercase tracking-wider">Title & Category</th>
                    <th className="py-4 px-4 text-xs font-medium text-white/50 uppercase tracking-wider">Date</th>
                    <th className="py-4 px-4 text-xs font-medium text-white/50 uppercase tracking-wider text-right">Impact</th>
                    <th className="py-4 px-6 text-xs font-medium text-white/50 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="py-5 px-6"><div className="h-4 w-16 bg-white/10 rounded"></div></td>
                        <td className="py-5 px-4"><div className="h-4 w-32 bg-white/10 rounded mb-2"></div><div className="h-3 w-20 bg-white/10 rounded"></div></td>
                        <td className="py-5 px-4"><div className="h-4 w-24 bg-white/10 rounded"></div></td>
                        <td className="py-5 px-4 text-right"><div className="h-5 w-20 bg-white/10 rounded ml-auto"></div></td>
                        <td className="py-5 px-6 text-right"><div className="h-8 w-16 bg-white/10 rounded ml-auto"></div></td>
                      </tr>
                    ))
                  ) : filteredTransactions.length > 0 ? (
                    filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="py-5 px-6">
                          <div className={`p-2 w-fit rounded-full ${tx.type === "expense" ? "bg-white/5 border border-white/5 text-white/50" : "bg-sage/10 text-sage"}`}>
                            {tx.type === "expense" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                          </div>
                        </td>
                        <td className="py-5 px-4">
                          <p className="text-[15px] font-medium text-foreground tracking-tight">{tx.title}</p>
                          <p className="text-xs font-medium text-white/50 mt-1">{tx.category}</p>
                        </td>
                        <td className="py-5 px-4 text-[13px] text-white/70 font-medium tracking-tight">
                          {new Date(tx.date).toLocaleDateString()}
                        </td>
                        <td className="py-5 px-4 text-right font-medium tracking-tight">
                          <span className={tx.type === "expense" ? "text-foreground" : "text-sage"}>
                            {tx.type === "expense" ? "-" : "+"}{currency}{Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="py-5 px-6 text-right">
                          <button onClick={() => { setEditTxData(tx); setIsModalOpen(true); }} className="text-xs font-medium text-[#0A84FF] hover:text-[#0A84FF]/80 transition-colors bg-[#0A84FF]/10 px-3 py-1.5 rounded-full">Edit</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="5" className="py-24 text-center text-white/40 font-medium">No transactions found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse glass-panel p-5 rounded-[24px]">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-white/20"></div>
                      <div className="h-4 w-24 bg-white/10 rounded"></div>
                    </div>
                    <div className="h-5 w-16 bg-white/10 rounded"></div>
                  </div>
                  <div className="h-3 w-32 bg-white/10 rounded mb-4"></div>
                  <div className="h-8 w-full bg-white/5 rounded-lg"></div>
                </div>
              ))
            ) : filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx) => (
                <div key={tx.id} className="glass-panel p-5 rounded-[24px]">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-medium text-white/50">{tx.category}</span>
                    <span className={`font-medium tracking-tight ${tx.type === "expense" ? "text-foreground" : "text-sage"}`}>
                      {tx.type === "expense" ? "-" : "+"}{currency}{Number(tx.amount).toLocaleString()}
                    </span>
                  </div>
                  <h4 className="text-[17px] font-semibold text-foreground tracking-tight mb-4">{tx.title}</h4>
                  <button onClick={() => { setEditTxData(tx); setIsModalOpen(true); }} className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[13px] font-medium text-foreground transition-colors">Edit Entry</button>
                </div>
              ))
            ) : (
              <div className="py-24 text-center text-white/40 font-medium">No transactions found</div>
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