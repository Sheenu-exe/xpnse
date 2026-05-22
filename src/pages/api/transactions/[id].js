import dbConnect from '../../../libs/mongodb';
import Transaction from '../../../models/Transaction';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;
  
  try { await dbConnect(); } catch (err) { return res.status(500).json({ error: 'Database connection failed' }); }

  switch (method) {
    case 'DELETE':
      try {
        await Transaction.findByIdAndDelete(id);
        res.status(200).json({ message: 'Transaction deleted' });
      } catch (err) {
        res.status(500).json({ error: "Failed to delete transaction" });
      }
      break;

    default:
      res.setHeader('Allow', ['DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
