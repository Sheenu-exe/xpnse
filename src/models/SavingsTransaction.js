import mongoose from 'mongoose';

const SavingsTransactionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'SavingsAccount', required: true },
  type: { type: String, required: true }, // "deposit", "withdrawal", "transfer"
  amount: { type: Number, required: true },
  note: { type: String, default: "" },
  date: { type: Date, default: Date.now },
  transferToAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'SavingsAccount', default: null } // Used only for transfers
});

export default mongoose.models.SavingsTransaction || mongoose.model('SavingsTransaction', SavingsTransactionSchema);
