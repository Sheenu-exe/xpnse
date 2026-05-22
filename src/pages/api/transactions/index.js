import dbConnect from '../../../libs/mongodb';
import Transaction from '../../../models/Transaction';

export default async function handler(req, res) {
  const { method } = req;
  await dbConnect();

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
        res.status(201).json(transaction);
      } catch (err) {
        res.status(400).json({ error: "Failed to save transaction" });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
