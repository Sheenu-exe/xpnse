import dbConnect from '../../../../libs/mongodb';
import SavingsTarget from '../../../../models/SavingsTarget';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  try { await dbConnect(); } catch (err) { return res.status(500).json({ error: 'Database connection failed' }); }

  switch (method) {
    case 'PUT':
      try {
        const target = await SavingsTarget.findByIdAndUpdate(id, req.body, { new: true });
        if (!target) return res.status(404).json({ error: "Target not found" });
        res.status(200).json(target);
      } catch (err) {
        res.status(400).json({ error: "Failed to update target" });
      }
      break;

    case 'DELETE':
      try {
        const target = await SavingsTarget.findByIdAndDelete(id);
        if (!target) return res.status(404).json({ error: "Target not found" });
        res.status(200).json({ message: "Target deleted successfully" });
      } catch (err) {
        res.status(400).json({ error: "Failed to delete target" });
      }
      break;

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
