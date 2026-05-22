import mongoose from 'mongoose';

const SavingsAccountSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  accountType: { type: String, required: true }, // "Bank Account", "FD", "SIP", "Stocks", "Other"
  liquidityType: { type: String, default: "Liquid" }, // "Liquid" vs "Locked"
  currentBalance: { type: Number, default: 0 },
  color: { type: String, default: "#A7D1AE" },
  icon: { type: String, default: "Wallet" },
  notes: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.SavingsAccount || mongoose.model('SavingsAccount', SavingsAccountSchema);

