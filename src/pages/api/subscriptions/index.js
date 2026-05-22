import dbConnect from '../../../libs/mongodb';
import Subscription from '../../../models/Subscription';

export default async function handler(req, res) {
  const { method } = req;
  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const { userId } = req.query;
        let query = {};
        if (userId) query.userId = userId;
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
