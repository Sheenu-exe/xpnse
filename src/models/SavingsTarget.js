import mongoose from 'mongoose';

const SavingsTargetSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.SavingsTarget || mongoose.model('SavingsTarget', SavingsTargetSchema);
