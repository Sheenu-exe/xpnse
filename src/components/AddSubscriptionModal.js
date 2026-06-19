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
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in" style={{ zIndex: 999999 }}>
      <div className="bg-[#1C1C1E] border border-white/10 w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden relative max-h-[90vh] overflow-y-auto">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#0A84FF]/5 blur-[50px] rounded-full pointer-events-none"></div>

        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-[#1C1C1E] relative z-10">
          <h2 className="text-[17px] font-semibold text-foreground tracking-tight flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-[#0A84FF]" />
            New Recurring Plan
          </h2>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form className="p-6 md:p-8 space-y-6 relative z-10 pb-12" onSubmit={handleSubmit}>
          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm font-medium">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-medium tracking-wider uppercase text-white/50 mb-2 ml-1">Service Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-5 py-3.5 bg-black/50 border border-white/10 rounded-[16px] focus:ring-1 focus:ring-[#0A84FF] focus:border-[#0A84FF] outline-none text-foreground transition-all text-[15px] placeholder-white/20"
                placeholder="e.g. Netflix, Gym, AWS"
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
                className="w-full px-5 py-3.5 bg-black/50 border border-white/10 rounded-[16px] focus:ring-1 focus:ring-[#0A84FF] focus:border-[#0A84FF] outline-none text-foreground transition-all text-[15px] placeholder-white/20"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium tracking-wider uppercase text-white/50 mb-2 ml-1">Cycle</label>
              <select
                required
                value={formData.billingCycle}
                onChange={(e) => setFormData((prev) => ({ ...prev, billingCycle: e.target.value }))}
                className="w-full px-5 py-3.5 bg-black/50 border border-white/10 rounded-[16px] focus:ring-1 focus:ring-[#0A84FF] focus:border-[#0A84FF] outline-none text-foreground transition-all text-[15px] appearance-none"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-medium tracking-wider uppercase text-white/50 mb-2 ml-1">Next Billing Date</label>
              <input
                type="date"
                required
                value={formData.nextBillingDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, nextBillingDate: e.target.value }))}
                className="w-full px-5 py-3.5 bg-black/50 border border-white/10 rounded-[16px] focus:ring-1 focus:ring-[#0A84FF] focus:border-[#0A84FF] outline-none text-foreground transition-all text-[15px] text-white/70"
              />
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-white/5 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full md:w-auto px-10 text-white font-medium tracking-wide text-[15px] py-3.5 rounded-full transition-all duration-300 shadow-sm ${
                isSubmitting ? "bg-[#0A84FF]/50 cursor-not-allowed opacity-50" : "bg-[#0A84FF] hover:bg-opacity-90 active:scale-95"
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
