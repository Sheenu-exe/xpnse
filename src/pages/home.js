"use client"
import { useState } from "react"
import { Wallet, Receipt, TrendingUp, Save, ArrowUpRight, ArrowDownRight } from "lucide-react"
import BottomNav from "../components/sidebar"
import { Header } from "../components/Header"
import '../app/globals.css'

const ExpenseCard = ({ icon: Icon, title, amount, type }) => (
  <div className="transition-colors rounded-2xl p-4 flex flex-col items-center justify-center gap-2 bg-neutral-900 hover:bg-green-400/20 h-full min-h-40">
    <div className="p-3 rounded-lg bg-neutral-800 group-hover:bg-green-400/50">
      <Icon className="h-6 w-6 text-white" />
    </div>
    <span className="text-sm font-medium text-gray-400">{title}</span>
    <span className="text-xl font-bold">${amount}</span>
    <span className={`text-xs ${type === "increase" ? "text-green-400" : "text-red-400"} flex items-center gap-1`}>
      {type === "increase" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
      {type === "increase" ? "+2.5%" : "-1.4%"}
    </span>
  </div>
)

const TransactionItem = ({ category, amount, date, type }) => (
  <div className="flex items-center gap-3 py-3 border-b border-neutral-800">
    <div
      className={`h-8 w-8 rounded-lg ${type === "expense" ? "bg-red-400/20" : "bg-green-400/20"} 
      flex items-center justify-center flex-shrink-0`}
    >
      {type === "expense" ? (
        <ArrowDownRight className={`h-4 w-4 text-red-400`} />
      ) : (
        <ArrowUpRight className={`h-4 w-4 text-green-400`} />
      )}
    </div>
    <div className="flex-grow">
      <p className="text-sm font-medium text-white">{category}</p>
      <p className="text-xs text-gray-400">{date}</p>
    </div>
    <div className={`text-sm font-medium ${type === "expense" ? "text-red-400" : "text-green-400"}`}>
      {type === "expense" ? "-" : "+"}${amount}
    </div>
  </div>
)

const CategorySpending = ({ category, amount, percentage }) => (
  <div className="flex items-center gap-3 py-2">
    <div className="flex-grow">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-white">{category}</span>
        <span className="text-sm text-white">${amount}</span>
      </div>
      <div className="h-2 bg-neutral-800 rounded-full">
        <div className="h-full bg-green-400 rounded-full" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  </div>
)

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard")
  
  // Dummy data for transactions
  const dummyTransactions = [
    { category: "Groceries", amount: 85.20, date: "Mar 10, 2025", type: "expense" },
    { category: "Salary", amount: 2500.00, date: "Mar 5, 2025", type: "income" },
    { category: "Dining", amount: 64.30, date: "Mar 3, 2025", type: "expense" },
    { category: "Freelance", amount: 350.00, date: "Mar 1, 2025", type: "income" },
    { category: "Shopping", amount: 129.99, date: "Feb 28, 2025", type: "expense" },
    { category: "Gas", amount: 45.50, date: "Feb 25, 2025", type: "expense" }
  ]

  // Dummy stats
  const totalBalance = 4250.80
  const monthlySpending = 1250.40
  const monthlySavings = 1850.20

  const expenseCards = [
    {
      icon: Wallet,
      title: "Total Balance",
      amount: totalBalance.toFixed(2),
      type: totalBalance >= 0 ? "increase" : "decrease",
    },
    { icon: TrendingUp, title: "Monthly Spending", amount: monthlySpending.toFixed(2), type: "decrease" },
    {
      icon: Save,
      title: "Monthly Savings",
      amount: monthlySavings.toFixed(2),
      type: monthlySavings >= 0 ? "increase" : "decrease",
    },
    { icon: Receipt, title: "Monthly Budget", amount: "8,000.00", type: "neutral" },
  ]

  const recentTransactions = dummyTransactions.slice(0, 4)

  const categorySpending = [
    { category: "Food & Drinks", amount: "850.00", percentage: 75 },
    { category: "Shopping", amount: "640.00", percentage: 55 },
    { category: "Transport", amount: "450.00", percentage: 40 },
    { category: "Entertainment", amount: "320.00", percentage: 25 },
  ]

  return (
    <BottomNav activePage={activeTab} setActivePage={setActiveTab}>
      <div className="min-h-screen bg-black text-white">
        <div className="flex flex-col">
          {/* Main Content */}
          <div className="flex-1 p-4 md:p-8">
            {/* Header */}
            <Header />

            {/* Expense Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {expenseCards.map((card, index) => (
                <ExpenseCard key={index} icon={card.icon} title={card.title} amount={card.amount} type={card.type} />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {/* Recent Transactions */}
              <div className="bg-neutral-900 rounded-2xl p-4 md:p-6">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h3 className="font-medium">Recent Transactions</h3>
                  <button className="text-sm text-gray-400 hover:text-white">See all</button>
                </div>
                <div className="space-y-1">
                  {recentTransactions.map((transaction, index) => (
                    <TransactionItem key={index} {...transaction} />
                  ))}
                </div>
              </div>

              {/* Spending by Category */}
              <div className="bg-neutral-900 rounded-2xl p-4 md:p-6 mt-4 lg:mt-0">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h3 className="font-medium">Spending by Category</h3>
                  <button className="text-sm text-gray-400 hover:text-white">See all</button>
                </div>
                <div className="space-y-4">
                  {categorySpending.map((category, index) => (
                    <CategorySpending key={index} {...category} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BottomNav>
  )
}

export default Dashboard