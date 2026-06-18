import dbConnect from '../../../libs/mongodb';
import Transaction from '../../../models/Transaction';
import SavingsAccount from '../../../models/SavingsAccount';

export default async function handler(req, res) {
  const { method } = req;
  try { await dbConnect(); } catch (err) { return res.status(500).json({ error: 'Database connection failed' }); }

  switch (method) {
    case 'GET':
      try {
        const { userId } = req.query;
        let query = {};
        if (userId) query.userId = userId;
        const transactions = await Transaction.find(query).sort({ date: -1 });
        res.status(200).json(transactions);
      } catch (err) {
        res.status(500).json({ error: "Failed to fetch transactions" });
      }
      break;
    
    case 'POST':
      try {
        const transaction = await Transaction.create(req.body);
        if (req.body.accountId) {
          const account = await SavingsAccount.findById(req.body.accountId);
          if (account) {
            if (req.body.type === 'expense') {
              account.currentBalance -= Number(req.body.amount) || 0;
            } else if (req.body.type === 'income') {
              account.currentBalance += Number(req.body.amount) || 0;
            }
            await account.save();
          }
        }
        res.status(201).json(transaction);
      } catch (err) {
        console.error(err);
        res.status(400).json({ error: "Failed to save transaction" });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
