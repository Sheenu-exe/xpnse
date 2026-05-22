import dbConnect from '../../../libs/mongodb';
import Subscription from '../../../models/Subscription';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;
  
  try { await dbConnect(); } catch (err) { return res.status(500).json({ error: 'Database connection failed' }); }

  switch (method) {
    case 'PUT':
      try {
        const sub = await Subscription.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json(sub);
      } catch (err) {
        res.status(500).json({ error: "Failed to update subscription" });
      }
      break;

    case 'DELETE':
      try {
        await Subscription.findByIdAndDelete(id);
        res.status(200).json({ message: 'Subscription deleted' });
      } catch (err) {
        res.status(500).json({ error: "Failed to delete subscription" });
      }
      break;

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
