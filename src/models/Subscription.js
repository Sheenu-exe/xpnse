import mongoose from 'mongoose';

const SubscriptionSchema = new mongoose.Schema({
  name: String,
  amount: Number,
  billingCycle: String,
  nextBillingDate: String,
  status: { type: String, default: "active" },
  userId: String,
});

export default mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);
