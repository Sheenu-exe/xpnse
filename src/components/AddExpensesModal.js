"use client";

import { X, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/libs/api";
import { auth } from "@/libs/firebase.config";

const AddTransactionModal = ({ isOpen, onClose, editData = null, onComplete, accounts = [] }) => {
  const { currentUser } = auth; // 👈 get logged-in user

  const [formData, setFormData] = useState({
    type: "expense",
    title: "",
    amount: "",
    category: "",
    date: "",
    accountId: "",
    description: "",
  });

  useEffect(() => {
    if (editData && isOpen) {
      setFormData({
        type: editData.type || "expense",
        title: editData.title || "",
        amount: editData.amount || "",
        category: editData.category || "",
        date: editData.date ? new Date(editData.date).toISOString().split('T')[0] : "",
        accountId: editData.accountId || "",
        description: editData.description || "",
      });
    } else if (isOpen) {
      setFormData({
        type: "expense",
        title: "",
        amount: "",
        category: "",
        date: "",
        accountId: "",
        description: "",
      });
    }
  }, [editData, isOpen]);

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
        createdAt: editData ? editData.createdAt : new Date(),
        userId: currentUser.uid, // 👈 attach user ID here!
      };

      if (editData) {
        await api.put(`/transactions/${editData._id || editData.id}`, newTransaction);
      } else {
        await api.post("/transactions", newTransaction);
      }

      setFormData({
        type: "expense",
        title: "",
        amount: "",
        category: "",
        date: "",
        accountId: "",
        description: "",
      });

      if (onComplete) onComplete();

      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to add transaction. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in" style={{ zIndex: 999999 }}>
      <div className="bg-[#1C1C1E] border border-white/10 w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden relative max-h-[90vh] overflow-y-auto">
        <div className="absolute top-0 right-0 w-32 h-32 bg-sage/5 blur-[50px] rounded-full pointer-events-none"></div>

        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-[#1C1C1E] relative z-10">
          <h2 className="text-[17px] font-semibold text-foreground tracking-tight">{editData ? "Edit Entry" : "New Entry"}</h2>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form className="p-6 md:p-8 space-y-6 relative z-10 pb-12" onSubmit={handleSubmit}>
          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm font-medium">{error}</div>}

          <div className="flex gap-4">
            {["expense", "income"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, type, category: "" }))}
                className={`flex-1 py-3 px-4 rounded-[16px] flex items-center justify-center gap-2 capitalize font-medium text-[13px] tracking-wide transition-all duration-300 ${
                  formData.type === type
                    ? type === "expense"
                      ? "bg-red-500/10 text-red-500 border border-red-500/20 shadow-sm"
                      : "bg-sage/10 text-sage border border-sage/20 shadow-sm"
                    : "bg-white/5 text-white/50 border border-white/5 hover:bg-white/10 hover:text-white"
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
                <label className="block text-[11px] font-medium tracking-wider uppercase text-white/50 mb-2 ml-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full px-5 py-3.5 bg-black/50 border border-white/10 rounded-[16px] focus:ring-1 focus:ring-sage focus:border-sage outline-none text-foreground transition-all text-[15px] placeholder-white/20"
                  placeholder="e.g. Starbucks"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium tracking-wider uppercase text-white/50 mb-2 ml-1">Amount</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-5 py-3.5 bg-black/50 border border-white/10 rounded-[16px] focus:ring-1 focus:ring-sage focus:border-sage outline-none text-foreground transition-all text-[15px] placeholder-white/20"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium tracking-wider uppercase text-white/50 mb-2 ml-1">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                  className="w-full px-5 py-3.5 bg-black/50 border border-white/10 rounded-[16px] focus:ring-1 focus:ring-sage focus:border-sage outline-none text-foreground transition-all text-[15px] text-white/70"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-medium tracking-wider uppercase text-white/50 mb-2 ml-1">Category</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full px-5 py-3.5 bg-black/50 border border-white/10 rounded-[16px] focus:ring-1 focus:ring-sage focus:border-sage outline-none text-foreground transition-all text-[15px] appearance-none"
                >
                  <option value="" disabled className="text-white/30">Select Category</option>
                  {categories[formData.type].map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-medium tracking-wider uppercase text-white/50 mb-2 ml-1">Link Bank Account (Optional)</label>
                <select
                  value={formData.accountId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, accountId: e.target.value }))}
                  className="w-full px-5 py-3.5 bg-black/50 border border-white/10 rounded-[16px] focus:ring-1 focus:ring-sage focus:border-sage outline-none text-foreground transition-all text-[15px] appearance-none"
                >
                  <option value="" className="text-white/30">No Account Linked</option>
                  {accounts.map((acc) => (
                    <option key={acc._id} value={acc._id}>{acc.name} ({acc.accountType})</option>
                  ))}
                </select>
                <p className="text-[11px] text-white/40 mt-2 ml-1">If linked, this entry will automatically update the account's balance.</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-medium tracking-wider uppercase text-white/50 mb-2 ml-1">Notes (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-5 py-3.5 bg-black/50 border border-white/10 rounded-[16px] focus:ring-1 focus:ring-sage focus:border-sage outline-none text-foreground transition-all text-[15px] min-h-[80px] placeholder-white/20"
                  placeholder="..."
                />
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-white/5 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full md:w-auto px-10 text-white font-medium tracking-wide text-[15px] py-3.5 rounded-full transition-all duration-300 shadow-sm ${
                isSubmitting ? "bg-sage/50 cursor-not-allowed opacity-50" : "bg-sage hover:bg-opacity-90 active:scale-95 text-[#0A0A0A]"
              }`}
            >
              {isSubmitting ? "Finalizing..." : editData ? "Save Changes" : "Submit Ledger"}
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
