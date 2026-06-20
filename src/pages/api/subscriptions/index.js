import dbConnect from '../../../libs/mongodb';
import Subscription from '../../../models/Subscription';
import Collab from '../../../models/Collab';

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
        const subscriptions = await Subscription.find(query).sort({ nextBillingDate: 1 });
        res.status(200).json(subscriptions);
      } catch (err) {
        res.status(500).json({ error: "Failed to fetch subscriptions" });
      }
      break;
    
    case 'POST':
      try {
        const subscription = await Subscription.create(req.body);
        res.status(201).json(subscription);
      } catch (err) {
        res.status(400).json({ error: "Failed to save subscription" });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
