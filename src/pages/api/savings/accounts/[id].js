import dbConnect from '../../../../libs/mongodb';
import SavingsAccount from '../../../../models/SavingsAccount';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;
  
  await dbConnect();

  switch (method) {
    case 'PUT':
      try {
        const acc = await SavingsAccount.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json(acc);
      } catch (err) {
        res.status(500).json({ error: "Failed to update account" });
      }
      break;

    case 'DELETE':
      try {
        await SavingsAccount.findByIdAndDelete(id);
        res.status(200).json({ message: 'Account deleted' });
      } catch (err) {
        res.status(500).json({ error: "Failed to delete account" });
      }
      break;

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
