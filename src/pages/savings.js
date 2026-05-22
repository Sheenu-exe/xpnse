"use client"
import React, { useState, useEffect } from "react"
import { Header } from "../components/Header"
import BottomNav from "../components/sidebar"
import AddSavingsModal from "../components/AddSavingsModal"
import CreateAccountModal from "../components/CreateAccountModal"
import { auth } from "@/libs/firebase.config"
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Plus, Building2, TrendingUp, ShieldCheck, ArrowUpRight, Zap, PiggyBank, Briefcase, Landmark } from "lucide-react"

export default function Savings() {
  const [activeTab, setActiveTab] = useState("savings")
  const [accounts, setAccounts] = useState([])
  const [transactions, setTransactions] = useState([])
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false)
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false)
  const [currency, setCurrency] = useState("₹")
  const { currentUser } = auth

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

  const fetchData = async () => {
    if (!currentUser) return
    try {
      const accRes = await fetch(`/api/savings/accounts?userId=${currentUser.uid}`)
      const accData = await accRes.json()
      setAccounts(accData)

      const txRes = await fetch(`/api/savings/transactions?userId=${currentUser.uid}`)
      const txData = await txRes.json()
      setTransactions(txData)
    } catch (err) {
      console.error(err)
    }
  }

  // --- Calculations ---
  const totalSavings = accounts.reduce((acc, curr) => acc + curr.currentBalance, 0)
  const liquidCapital = accounts.filter(a => a.liquidityType !== 'Locked').reduce((acc, curr) => acc + curr.currentBalance, 0)
  const lockedAssets = accounts.filter(a => a.liquidityType === 'Locked').reduce((acc, curr) => acc + curr.currentBalance, 0)

  // Calculate monthly growth (Sum of deposits this month vs last month)
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  
  const thisMonthDeposits = transactions
    .filter(tx => tx.type === 'deposit' && new Date(tx.date).getMonth() === currentMonth && new Date(tx.date).getFullYear() === currentYear)
    .reduce((acc, curr) => acc + curr.amount, 0)

  const reserveStatus = liquidCapital > 100000 ? "Strong" : liquidCapital > 50000 ? "Stable" : liquidCapital > 25000 ? "Building" : "Critical"
  const reserveProgress = Math.min((liquidCapital / 100000) * 100, 100)

  // --- Chart Data ---
  const COLORS = ['#A7D1AE', '#BCDDF0', '#85a48b', '#4a6d51', '#FFF2E6'];
  const pieData = accounts.map(a => ({ name: a.name, value: a.currentBalance }))

  const getAccountIcon = (type) => {
    if (type.includes("FD") || type.includes("Locked") || type.includes("SIP")) return <ShieldCheck className="w-5 h-5 text-powder" />
    if (type.includes("Bank") || type === "Savings") return <PiggyBank className="w-5 h-5 text-sage" />
    if (type.includes("Stock") || type === "Investment") return <Briefcase className="w-5 h-5 text-powder" />
    return <Landmark className="w-5 h-5 text-cream" />
  }

  return (
    <BottomNav activePage={activeTab} setActivePage={setActiveTab}>
      <div className="min-h-screen bg-forest-900 text-cream selection:bg-sage/30 relative font-sans">
        
        {/* Subtle noise texture overlay */}
        <div className="fixed inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay"></div>

        {/* Ambient background glow */}
        <div className="fixed top-[0%] left-[50%] -translate-x-1/2 w-[80vw] h-[80vw] bg-sage/5 blur-[150px] rounded-full pointer-events-none mix-blend-screen"></div>

        <div className="flex flex-col relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 pb-32">
          <Header />

          {/* Heading */}
          <div className="mt-4 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-4xl md:text-5xl font-display font-extrabold tracking-tighter text-cream drop-shadow-lg">
                Wealth.
              </h2>
              <p className="text-cream/50 mt-2 font-mono text-sm tracking-wide">
                Track your reserves, accounts, and financial growth.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <button 
                onClick={() => setIsAddAccountModalOpen(true)}
                className="w-full sm:w-auto bg-forest-800 hover:bg-forest-700 border border-forest-600 p-3 px-6 rounded-xl transition-all shadow-luxury text-cream font-bold tracking-wide flex items-center justify-center gap-2 group"
              >
                <Building2 className="w-4 h-4 text-cream/50 group-hover:text-cream transition-colors" />
                <span>New Asset</span>
              </button>
              <button 
                onClick={() => setIsAddTxModalOpen(true)}
                className="w-full sm:w-auto bg-sage hover:bg-sage/90 border border-sage/50 p-3 px-6 rounded-xl transition-all shadow-luxury text-forest-900 font-bold tracking-wide flex items-center justify-center gap-2 group"
              >
                <ArrowUpRight className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Move Capital</span>
              </button>
            </div>
          </div>

          {/* Top Summary Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
            {/* Liquid Savings Card */}
            <div className="bg-forest-800/80 backdrop-blur-xl border border-forest-600 rounded-luxury p-6 shadow-luxury relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-sage/10 rounded-full blur-2xl group-hover:bg-sage/20 transition-all"></div>
              <p className="font-mono text-xs text-cream/50 uppercase tracking-widest mb-2">Available Cash</p>
              <h3 className="text-3xl md:text-4xl font-display font-bold text-sage tracking-tighter mb-2">
                {currency}{liquidCapital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <p className="text-xs font-mono text-cream/40 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-sage" /> Highly liquid capital
              </p>
            </div>

            {/* Locked Assets Card */}
            <div className="bg-forest-800/80 backdrop-blur-xl border border-forest-600 rounded-luxury p-6 shadow-luxury">
              <p className="font-mono text-xs text-cream/50 uppercase tracking-widest mb-2">Locked Assets (-)</p>
              <h3 className="text-3xl md:text-4xl font-display font-bold text-cream tracking-tighter mb-2">
                {currency}{lockedAssets.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <p className="text-xs font-mono text-cream/40">FDs, SIPs, & Stocks</p>
            </div>

            {/* AI Insights Card */}
            <div className="bg-forest-800/80 backdrop-blur-xl border border-forest-600 rounded-luxury p-6 shadow-luxury lg:col-span-2">
              <p className="font-mono text-xs text-sage uppercase tracking-widest mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Liquid Reserve Status: {reserveStatus}
              </p>
              <div className="flex items-end justify-between mb-2">
                <h3 className="text-xl font-display font-bold text-cream tracking-tight">
                  Target: {currency}100,000
                </h3>
                <span className="text-sm font-mono text-cream/50">{Math.round(reserveProgress)}%</span>
              </div>
              
              <div className="w-full bg-forest-900 rounded-full h-3 mb-4 shadow-luxury-inner border border-forest-700">
                <div 
                  className="bg-sage h-3 rounded-full transition-all duration-1000 ease-out relative overflow-hidden" 
                  style={{ width: `${reserveProgress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite] -skew-x-12"></div>
                </div>
              </div>
              <p className="text-xs text-cream/40 leading-relaxed max-w-md">
                Your liquid reserve health is classified as <strong>{reserveStatus}</strong>. You are {(100 - reserveProgress).toFixed(1)}% away from your primary emergency fund target.
              </p>
            </div>
          </div>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Accounts Column */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className="font-mono text-xs text-cream/50 uppercase tracking-widest flex items-center gap-2 mb-2">
                <Briefcase className="w-4 h-4" /> Active Accounts
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {accounts.length > 0 ? accounts.map((acc) => (
                  <div key={acc._id} className="bg-forest-800/50 hover:bg-forest-800 border border-forest-700 rounded-2xl p-5 transition-all shadow-luxury group cursor-pointer relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-forest-900 rounded-xl border border-forest-700/50 shadow-luxury-inner">
                        {getAccountIcon(acc.accountType)}
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-widest bg-forest-900 px-2 py-1 rounded-md text-cream/40 border border-forest-700">
                        {acc.accountType}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-cream tracking-wide group-hover:text-sage transition-colors">{acc.name}</h4>
                    <p className="text-2xl font-display font-bold text-cream/90 mt-1">
                      {currency}{acc.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                )) : (
                  <div className="sm:col-span-2 py-12 text-center border border-dashed border-forest-600 rounded-2xl">
                    <p className="text-cream/30 font-mono text-sm uppercase tracking-widest">No accounts found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Analytics Sidebar */}
            <div className="space-y-6">
              <div className="bg-forest-800 rounded-luxury border border-forest-700 p-6 shadow-luxury">
                <h3 className="font-mono text-xs text-cream/50 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <PieChart className="w-4 h-4" /> Capital Distribution
                </h3>
                
                {accounts.length > 0 ? (
                  <div className="h-64 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          formatter={(value) => `${currency}${value.toLocaleString()}`}
                          contentStyle={{ backgroundColor: '#0D180C', borderColor: '#1D3D1C', borderRadius: '12px', color: '#FFF2E6' }}
                          itemStyle={{ color: '#A7D1AE' }}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                      <span className="text-xs font-mono text-cream/30 uppercase tracking-widest">Total</span>
                      <span className="text-lg font-bold text-sage">{currency}{totalSavings >= 1000 ? (totalSavings/1000).toFixed(1)+'k' : totalSavings}</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-cream/20 font-mono text-xs uppercase tracking-widest">Insufficient Data</p>
                  </div>
                )}
                
                <div className="mt-4 space-y-2">
                  {pieData.map((data, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span className="text-cream/70 truncate w-32">{data.name}</span>
                      </div>
                      <span className="font-mono text-cream/90">{((data.value / totalSavings) * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <CreateAccountModal 
        isOpen={isAddAccountModalOpen} 
        onClose={() => setIsAddAccountModalOpen(false)} 
        userId={currentUser?.uid} 
        onAccountCreated={fetchData} 
      />

      <AddSavingsModal 
        isOpen={isAddTxModalOpen} 
        onClose={() => setIsAddTxModalOpen(false)} 
        userId={currentUser?.uid} 
        accounts={accounts}
        onTransactionComplete={fetchData} 
      />
    </BottomNav>
  )
}
// Note: using an inline dummy import for PieChart from lucide since it wasn't extracted up top.
import { PieChart } from "lucide-react"
