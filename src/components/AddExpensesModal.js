"use client";

import { X, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import api from "@/libs/api";
import { auth } from "@/libs/firebase.config";

const AddTransactionModal = ({ isOpen, onClose }) => {
  const { currentUser } = auth; // 👈 get logged-in user

  const [formData, setFormData] = useState({
    type: "expense",
    title: "",
    amount: "",
    category: "",
    date: "",
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const categories = {
    expense: ["Food", "Transport", "Bills", "Entertainment", "Health"],
    income: ["Salary", "Freelance", "Investments", "Gifts"],
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (!currentUser) {
        throw new Error("User not logged in");
      }

      const newTransaction = {
        ...formData,
        amount: Number(formData.amount),
        date: formData.date,
        createdAt: new Date(),
        userId: currentUser.uid, // 👈 attach user ID here!
      };

      await api.post("/transactions", newTransaction);

      setFormData({
        type: "expense",
        title: "",
        amount: "",
        category: "",
        date: "",
        description: "",
      });

      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to add transaction. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" style={{ zIndex: 999999 }}>
      <div className="bg-[#0f0f0f] border border-neutral-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative max-h-[90vh] overflow-y-auto">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-[50px] rounded-full pointer-events-none"></div>

        <div className="flex justify-between items-center p-6 border-b border-neutral-800/50 bg-[#141414] relative z-10">
          <h2 className="text-xl font-bold text-white tracking-wide">New Entry</h2>
          <button onClick={onClose} className="p-2 bg-neutral-800/50 rounded-full hover:bg-neutral-700 text-gray-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form className="p-6 md:p-8 space-y-6 relative z-10" onSubmit={handleSubmit}>
          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm font-mono">{error}</div>}

          <div className="flex gap-4">
            {["expense", "income"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, type, category: "" }))}
                className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 capitalize font-mono text-xs tracking-widest transition-all ${
                  formData.type === type
                    ? type === "expense"
                      ? "bg-red-400/10 text-red-400 border border-red-400/20 shadow-[0_0_15px_rgba(248,113,113,0.1)]"
                      : "bg-green-400/10 text-green-400 border border-green-400/20 shadow-[0_0_15px_rgba(74,222,128,0.1)]"
                    : "bg-[#141414] text-gray-500 border border-neutral-800 hover:bg-[#1a1a1a]"
                }`}
              >
                {type === "expense" ? (
                  <ArrowDownRight className="h-4 w-4" />
                ) : (
                  <ArrowUpRight className="h-4 w-4" />
                )}
                {type}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 ml-1 font-mono">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full px-5 py-3.5 bg-[#141414] border border-neutral-800 rounded-xl focus:ring-1 focus:ring-green-400 focus:border-green-400 outline-none text-white transition-all text-sm font-mono placeholder-[#333]"
                  placeholder="e.g. Starbucks"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 ml-1 font-mono">Amount</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-5 py-3.5 bg-[#141414] border border-neutral-800 rounded-xl focus:ring-1 focus:ring-green-400 focus:border-green-400 outline-none text-white transition-all text-sm font-mono placeholder-[#333]"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 ml-1 font-mono">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                  className="w-full px-5 py-3.5 bg-[#141414] border border-neutral-800 rounded-xl focus:ring-1 focus:ring-green-400 focus:border-green-400 outline-none text-white transition-all text-sm font-mono text-gray-400"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 ml-1 font-mono">Category</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full px-5 py-3.5 bg-[#141414] border border-neutral-800 rounded-xl focus:ring-1 focus:ring-green-400 focus:border-green-400 outline-none text-white transition-all text-sm font-mono appearance-none"
                >
                  <option value="" disabled className="text-gray-600">Select Category</option>
                  {categories[formData.type].map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 ml-1 font-mono">Notes (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-5 py-3.5 bg-[#141414] border border-neutral-800 rounded-xl focus:ring-1 focus:ring-green-400 focus:border-green-400 outline-none text-white transition-all text-sm font-mono min-h-[80px] placeholder-[#333]"
                  placeholder="..."
                />
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-neutral-800/50 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full md:w-auto px-10 text-black font-bold uppercase tracking-widest text-sm py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(74,222,128,0.2)] ${
                isSubmitting ? "bg-green-600 cursor-not-allowed opacity-50" : "bg-green-500 hover:bg-green-400 hover:shadow-[0_0_30px_rgba(74,222,128,0.4)]"
              }`}
            >
              {isSubmitting ? "Finalizing..." : "Submit Ledger"}
            </button>
          </div>
        </form>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fade-in {
          0% { opacity: 0; transform: scale(0.95) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fade-in > div {
          animation: fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
    </div>
  );
};

export default AddTransactionModal;
