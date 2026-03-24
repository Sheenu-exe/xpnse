"use client";

import { X, CalendarClock } from "lucide-react";
import { useState } from "react";
import api from "@/libs/api";
import { auth } from "@/libs/firebase.config";

export const AddSubscriptionModal = ({ isOpen, onClose, onAdded }) => {
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    billingCycle: "monthly",
    nextBillingDate: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!auth.currentUser) throw new Error("Authentication required.");

      const newSub = {
        ...formData,
        amount: parseFloat(formData.amount),
        userId: auth.currentUser.uid,
        status: "active"
      };

      await api.post("/subscriptions", newSub);
      
      onAdded();
      onClose();
      setFormData({ name: "", amount: "", billingCycle: "monthly", nextBillingDate: "" });
    } catch (err) {
      console.error("Failed to add subscription:", err);
      setError(err.response?.data?.error || "Failed to add subscription. Try checking server connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" style={{ zIndex: 999999 }}>
      <div className="bg-[#0f0f0f] border border-neutral-800 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden relative max-h-[90vh] overflow-y-auto">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[50px] rounded-full pointer-events-none"></div>

        <div className="flex justify-between items-center p-6 border-b border-neutral-800/50 bg-[#141414] relative z-10">
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-blue-400" />
            New Recurring Plan
          </h2>
          <button onClick={onClose} className="p-2 bg-neutral-800/50 rounded-full hover:bg-neutral-700 text-gray-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form className="p-6 md:p-8 space-y-6 relative z-10" onSubmit={handleSubmit}>
          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm font-mono">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 ml-1 font-mono">Service Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-5 py-3.5 bg-[#141414] border border-neutral-800 rounded-xl focus:ring-1 focus:ring-blue-400 focus:border-blue-400 outline-none text-white transition-all text-sm font-mono placeholder-[#333]"
                placeholder="e.g. Netflix, Gym, AWS"
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
                className="w-full px-5 py-3.5 bg-[#141414] border border-neutral-800 rounded-xl focus:ring-1 focus:ring-blue-400 focus:border-blue-400 outline-none text-white transition-all text-sm font-mono placeholder-[#333]"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 ml-1 font-mono">Cycle</label>
              <select
                required
                value={formData.billingCycle}
                onChange={(e) => setFormData((prev) => ({ ...prev, billingCycle: e.target.value }))}
                className="w-full px-5 py-3.5 bg-[#141414] border border-neutral-800 rounded-xl focus:ring-1 focus:ring-blue-400 focus:border-blue-400 outline-none text-white transition-all text-sm font-mono appearance-none"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 ml-1 font-mono">Next Billing Date</label>
              <input
                type="date"
                required
                value={formData.nextBillingDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, nextBillingDate: e.target.value }))}
                className="w-full px-5 py-3.5 bg-[#141414] border border-neutral-800 rounded-xl focus:ring-1 focus:ring-blue-400 focus:border-blue-400 outline-none text-white transition-all text-sm font-mono text-gray-400"
              />
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-neutral-800/50 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full md:w-auto px-10 text-white font-bold uppercase tracking-widest text-sm py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.2)] ${
                isSubmitting ? "bg-blue-600 cursor-not-allowed opacity-50" : "bg-blue-600 hover:bg-blue-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]"
              }`}
            >
              {isSubmitting ? "Finalizing..." : "Initialize Tracker"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
