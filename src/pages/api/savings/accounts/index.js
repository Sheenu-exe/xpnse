import dbConnect from '../../../../libs/mongodb';
import SavingsAccount from '../../../../models/SavingsAccount';
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
        const accounts = await SavingsAccount.find(query).sort({ currentBalance: -1 });
        res.status(200).json(accounts);
      } catch (err) {
        res.status(500).json({ error: "Failed to fetch accounts" });
      }
      break;
    
    case 'POST':
      try {
        const account = await SavingsAccount.create(req.body);
        res.status(201).json(account);
      } catch (err) {
        res.status(400).json({ error: "Failed to create account" });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
