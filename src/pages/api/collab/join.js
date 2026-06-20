import dbConnect from '../../../libs/mongodb';
import Collab from '../../../models/Collab';

export default async function handler(req, res) {
  const { method } = req;
  try { await dbConnect(); } catch (err) { return res.status(500).json({ error: 'Database connection failed' }); }

  switch (method) {
    case 'POST':
      try {
        const { userId, inviteCode } = req.body;
        if (!userId || !inviteCode) return res.status(400).json({ error: "userId and inviteCode are required" });

        // Find the target collab by code
        const targetCollab = await Collab.findOne({ inviteCode: inviteCode.toUpperCase() });
        if (!targetCollab) {
          return res.status(404).json({ error: "Invalid invite code" });
        }

        if (targetCollab.users.includes(userId)) {
          return res.status(400).json({ error: "Already a member of this collab" });
        }

        // Find if user is currently in another collab
        const userCollab = await Collab.findOne({ users: userId });
        if (userCollab) {
          // Remove user from old collab
          userCollab.users = userCollab.users.filter(id => id !== userId);
          if (userCollab.users.length === 0) {
            await Collab.deleteOne({ _id: userCollab._id });
          } else {
            await userCollab.save();
          }
        }

        // Add user to new collab
        targetCollab.users.push(userId);
        await targetCollab.save();

        res.status(200).json(targetCollab);
      } catch (err) {
        res.status(500).json({ error: "Failed to join collab" });
      }
      break;

    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
