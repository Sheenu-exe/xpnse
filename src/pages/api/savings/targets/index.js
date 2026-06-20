import dbConnect from '../../../../libs/mongodb';
import SavingsTarget from '../../../../models/SavingsTarget';
import Collab from '../../../../models/Collab';

export default async function handler(req, res) {
  const { method } = req;
  try { await dbConnect(); } catch (err) { return res.status(500).json({ error: 'Database connection failed' }); }

  switch (method) {
    case 'GET':
      try {
        const { userId } = req.query;
        let query = {};
        if (userId) {
          const collab = await Collab.findOne({ users: userId });
          query.userId = collab ? { $in: collab.users } : userId;
        }
        const targets = await SavingsTarget.find(query).sort({ createdAt: 1 });
        res.status(200).json(targets);
      } catch (err) {
        res.status(500).json({ error: "Failed to fetch targets" });
      }
      break;
    
    case 'POST':
      try {
        const target = await SavingsTarget.create(req.body);
        res.status(201).json(target);
      } catch (err) {
        res.status(400).json({ error: "Failed to create target" });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
