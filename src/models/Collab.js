import mongoose from 'mongoose';

const CollabSchema = new mongoose.Schema({
  users: {
    type: [String],
    required: true,
  },
  inviteCode: {
    type: String,
    unique: true,
    sparse: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.models.Collab || mongoose.model('Collab', CollabSchema);
