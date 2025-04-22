// components/Analytics.js
"use client"
import { useMemo } from "react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Header } from "../components/Header"
import BottomNav from "../components/sidebar"

// Dummy data for transactions
const dummyTransactions = [
  { id: 1, date: "2025-02-01", type: "income", amount: 5000, category: "Salary" },
  { id: 2, date: "2025-02-05", type: "expense", amount: 120, category: "Groceries" },
  { id: 3, date: "2025-02-07", type: "expense", amount: 85, category: "Dining" },
  { id: 4, date: "2025-02-10", type: "expense", amount: 200, category: "Utilities" },
  { id: 5, date: "2025-02-15", type: "expense", amount: 800, category: "Rent" },
  { id: 6, date: "2025-02-18", type: "expense", amount: 65, category: "Transportation" },
  { id: 7, date: "2025-02-20", type: "expense", amount: 150, category: "Entertainment" },
  { id: 8, date: "2025-02-25", type: "income", amount: 500, category: "Freelance" },
  { id: 9, date: "2025-02-27", type: "expense", amount: 95, category: "Groceries" },
  { id: 10, date: "2025-01-05", type: "expense", amount: 110, category: "Groceries" },
  { id: 11, date: "2025-01-15", type: "expense", amount: 800, category: "Rent" },
  { id: 12, date: "2025-01-01", type: "income", amount: 5000, category: "Salary" },
  { id: 13, date: "2025-01-20", type: "expense", amount: 140, category: "Dining" },
  { id: 14, date: "2025-01-10", type: "expense", amount: 190, category: "Utilities" },
  { id: 15, date: "2025-03-01", type: "income", amount: 5200, category: "Salary" },
  { id: 16, date: "2025-03-05", type: "expense", amount: 125, category: "Groceries" },
  { id: 17, date: "2025-03-12", type: "expense", amount: 210, category: "Utilities" },
  { id: 18, date: "2025-03-15", type: "expense", amount: 800, category: "Rent" },
  { id: 19, date: "2025-03-22", type: "expense", amount: 170, category: "Entertainment" },
  { id: 20, date: "2025-03-25", type: "income", amount: 600, category: "Freelance" }
];

const StatCard = ({ title, value, change, trend }) => (
  <div className="bg-neutral-900 rounded-xl p-4">
    <p className="text-gray-400 text-sm">{title}</p>
    <div className="flex items-center gap-2 mt-2">
      <h3 className="text-2xl font-bold">{value}</h3>
      <span className={`flex items-center text-sm ${trend === "up" ? "text-green-400" : "text-red-400"}`}>
        {trend === "up" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
        {change}
      </span>
    </div>
  </div>
)

const Analytics = () => {
  const { monthlyData, categoryData, stats } = useMemo(() => {
    const monthlyDataTemp = {};
    const categoryDataTemp = {};
    let totalIncome = 0;
    let totalExpenses = 0;

    dummyTransactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const month = date.toLocaleString("default", { month: "short" });

      // Monthly data
      if (!monthlyDataTemp[month]) {
        monthlyDataTemp[month] = { expenses: 0, income: 0 };
      }
      if (transaction.type === "expense") {
        monthlyDataTemp[month].expenses += transaction.amount;
        totalExpenses += transaction.amount;
      } else {
        monthlyDataTemp[month].income += transaction.amount;
        totalIncome += transaction.amount;
      }

      // Category data
      if (transaction.type === "expense") {
        if (!categoryDataTemp[transaction.category]) {
          categoryDataTemp[transaction.category] = 0;
        }
        categoryDataTemp[transaction.category] += transaction.amount;
      }
    });

    const monthlyDataArray = Object.entries(monthlyDataTemp)
      .map(([name, data]) => ({ name, ...data }))
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
        averageDailySpend: totalExpenses / 30 // simplified
      }
    };
  }, []);

  return (
    <BottomNav>
      <div className="min-h-screen bg-black text-white">
        <div className="p-4 md:p-8">
          <Header />

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            <StatCard 
              title="Monthly Savings" 
              value={`$${stats.monthlySavings.toFixed(2)}`} 
              change="+12.5%" 
              trend="up" 
            />
            <StatCard 
              title="Monthly Expenses" 
              value={`$${stats.monthlyExpenses.toFixed(2)}`} 
              change="-5.2%" 
              trend="down" 
            />
            <StatCard 
              title="Expense Ratio" 
              value={`${stats.expenseRatio.toFixed(1)}%`} 
              change="-2.1%" 
              trend="up" 
            />
            <StatCard 
              title="Average Daily Spend" 
              value={`$${stats.averageDailySpend.toFixed(2)}`} 
              change="+3.8%" 
              trend="down" 
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Income vs Expenses Trend */}
            <div className="bg-neutral-900 rounded-2xl p-4 md:p-6">
              <h3 className="font-medium mb-4 md:mb-6 text-sm md:text-base">Income vs Expenses Trend</h3>
              <div className="h-64 md:h-72 lg:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#262626", border: "none" }}
                      itemStyle={{ color: "#fff" }}
                    />
                    <Line type="monotone" dataKey="income" stroke="#4ade80" strokeWidth={2} />
                    <Line type="monotone" dataKey="expenses" stroke="#f87171" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Expense by Category */}
            <div className="bg-neutral-900 rounded-2xl p-4 md:p-6">
              <h3 className="font-medium mb-4 md:mb-6 text-sm md:text-base">Expense by Category</h3>
              <div className="h-64 md:h-72 lg:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="category" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#262626", border: "none" }}
                      itemStyle={{ color: "#fff" }}
                    />
                    <Bar dataKey="amount" fill="#4ade80" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BottomNav>
  );
};

export default Analytics;