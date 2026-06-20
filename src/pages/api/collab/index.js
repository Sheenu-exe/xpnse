import dbConnect from '../../../libs/mongodb';
import Collab from '../../../models/Collab';
import crypto from 'crypto';

export default async function handler(req, res) {
  const { method } = req;
  try { await dbConnect(); } catch (err) { return res.status(500).json({ error: 'Database connection failed' }); }

  switch (method) {
    case 'GET':
      try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ error: "userId is required" });
        
        let collab = await Collab.findOne({ users: userId });
        
        // Auto-create a collab container for the user if they don't have one
        if (!collab) {
          const inviteCode = crypto.randomBytes(3).toString('hex').toUpperCase(); // e.g. A1B2C3
          collab = await Collab.create({ users: [userId], inviteCode });
        }
        
        res.status(200).json(collab);
      } catch (err) {
        res.status(500).json({ error: "Failed to fetch collab" });
      }
      break;

    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
