import dbConnect from '../../../libs/mongodb';
import Transaction from '../../../models/Transaction';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;
  
  try { await dbConnect(); } catch (err) { return res.status(500).json({ error: 'Database connection failed' }); }

  switch (method) {
    case 'PUT':
      try {
        const transaction = await Transaction.findByIdAndUpdate(id, req.body, { new: true });
        if (!transaction) return res.status(404).json({ error: "Transaction not found" });
        res.status(200).json(transaction);
      } catch (err) {
        res.status(400).json({ error: "Failed to update transaction" });
      }
      break;

    case 'DELETE':
      try {
        await Transaction.findByIdAndDelete(id);
        res.status(200).json({ message: 'Transaction deleted' });
      } catch (err) {
        res.status(500).json({ error: "Failed to delete transaction" });
      }
      break;

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
