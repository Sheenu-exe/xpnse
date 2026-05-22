import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  title: String,
  amount: Number,
  category: String,
  type: String,
  date: String,
  description: String,
  userId: String,
});

export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
