"use client";
import { useState } from "react";
import { X, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useTransactions } from "@/context/transactionContext";

const AddTransactionModal = ({ isOpen, onClose }) => {
  const context = useTransactions();
  const addTransaction = context?.addTransaction || (async () => {
    console.error("addTransaction is not available");
  });
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    type: "expense",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const categories = {
    expense: ["Food & Drinks", "Transport", "Shopping", "Bills", "Entertainment", "Healthcare", "Others"],
    income: ["Salary", "Freelance", "Investments", "Business", "Others"],
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
  
    // Basic validation
    if (!formData.title || !formData.amount || isNaN(formData.amount) || !formData.category || !formData.type || !formData.date) {
      setError("Please fill out all required fields correctly.");
      setIsSubmitting(false);
      return;
    }
  
    try {
      // Use the context function to add to Firestore
      await addTransaction(formData);
      
      // Reset form
      setFormData({
        title: "",
        amount: "",
        category: "",
        type: "expense",
        date: new Date().toISOString().split("T")[0],
        description: "",
      });
      
      // Close modal
      onClose();
    } catch (err) {
      console.error("Error adding transaction:", err);
      setError("Failed to add transaction. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-neutral-900 rounded-2xl w-full max-w-md p-6 m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Add Transaction</h2>
          <button onClick={onClose} className="p-2 hover:bg-neutral-800 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-xl mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transaction Type */}
          <div className="flex gap-4 mb-4">
            {["expense", "income"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, type, category: "" }))}
                className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 capitalize ${
                  formData.type === type
                    ? type === "expense"
                      ? "bg-red-400/20 text-red-400"
                      : "bg-green-400/20 text-green-400"
                    : "bg-neutral-800"
                }`}
              >
                {type === "expense" ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                {type}
              </button>
            ))}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full bg-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Enter title"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Amount</label>
            <input
              type="number"
              required
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
              className="w-full bg-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Enter amount"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Category</label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
              className="w-full bg-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <option value="">Select category</option>
              {categories[formData.type].map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Date</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
              className="w-full bg-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full bg-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 min-h-[100px]"
              placeholder="Add description..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full text-black font-medium py-3 rounded-xl transition-colors ${
              isSubmitting ? "bg-green-400/50 cursor-not-allowed" : "bg-green-400 hover:bg-green-500"
            }`}
          >
            {isSubmitting ? "Adding..." : "Add Transaction"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;