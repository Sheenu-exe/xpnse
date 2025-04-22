"use client";
import { useState } from "react";
import { Plus, ArrowDownRight, ArrowUpRight } from "lucide-react";
import AddTransactionModal from "../components/AddExpensesModal";
import { Header } from "../components/Header";
import BottomNav from "../components/sidebar";
import { useTransactions } from "@/context/transactionContext";
import '../app/globals.css'

const ExpenseItem = ({ title, category, amount, date, type }) => (
  <div className="flex items-center gap-3 p-3 bg-neutral-900 rounded-xl mb-3">
    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${type === "expense" ? "bg-red-400/20" : "bg-green-400/20"}`}>
      {type === "expense" ? <ArrowDownRight className="text-red-400" /> : <ArrowUpRight className="text-green-400" />}
    </div>
    <div className="flex-grow min-w-0">
      <h3 className="truncate">{title}</h3>
      <p className="text-sm text-gray-400 truncate">{category} • {date}</p>
    </div>
    <div className={`font-medium ${type === "expense" ? "text-red-400" : "text-green-400"}`}>
      {type === "expense" ? "-" : "+"}₹{Number(amount).toFixed(2)}
    </div>
  </div>
);

const Expenses = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const context = useTransactions();
  const transactions = context?.transactions || [];
  const loading = context?.loading || true;

  const transactionsData = useTransactions() || { transactions: [], loading: true };
  // Add a safety check for transactions
  const filteredTransactions = transactions
    ? transactions
        .filter((tx) => activeFilter === "all" || tx.type === activeFilter)
        .filter((tx) => tx.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];
  return (
    <BottomNav activePage="expenses">
      <div className="p-6 text-white bg-black min-h-screen">
        <Header />
        <div className="flex gap-4 mb-4">
          <div className="flex-grow bg-neutral-900 p-3 rounded-xl flex items-center">
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent w-full focus:outline-none"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-green-400 p-3 rounded-xl hover:bg-green-500 transition-colors"
          >
            <Plus className="text-black" />
          </button>
        </div>
        
        <div className="flex gap-2 mb-6">
          {["all", "expense", "income"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-xl capitalize transition-colors ${
                activeFilter === filter 
                ? "bg-green-400 text-black" 
                : "bg-neutral-900 text-white hover:bg-neutral-800"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-400"></div>
          </div>
        ) : filteredTransactions.length > 0 ? (
          <div className="space-y-3">
            {filteredTransactions.map((tx) => (
              <ExpenseItem key={tx.id} {...tx} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-400">
            <p>No transactions found</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="mt-3 text-green-400 hover:underline"
            >
              Add your first transaction
            </button>
          </div>
        )}
        
        <AddTransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    </BottomNav>
  );
};

export default Expenses;