import dbConnect from '../../../libs/mongodb';
import Transaction from '../../../models/Transaction';
import SavingsAccount from '../../../models/SavingsAccount';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;
  
  try { await dbConnect(); } catch (err) { return res.status(500).json({ error: 'Database connection failed' }); }

  switch (method) {
    case 'PUT':
      try {
        const oldTransaction = await Transaction.findById(id);
        if (!oldTransaction) return res.status(404).json({ error: "Transaction not found" });

        // Reverse old transaction effect
        if (oldTransaction.accountId) {
          const oldAccount = await SavingsAccount.findById(oldTransaction.accountId);
          if (oldAccount) {
            if (oldTransaction.type === 'expense') {
              oldAccount.currentBalance += Number(oldTransaction.amount) || 0;
            } else if (oldTransaction.type === 'income') {
              oldAccount.currentBalance -= Number(oldTransaction.amount) || 0;
            }
            await oldAccount.save();
          }
        }

        // Apply new transaction effect
        if (req.body.accountId) {
          const newAccount = await SavingsAccount.findById(req.body.accountId);
          if (newAccount) {
            if (req.body.type === 'expense') {
              newAccount.currentBalance -= Number(req.body.amount) || 0;
            } else if (req.body.type === 'income') {
              newAccount.currentBalance += Number(req.body.amount) || 0;
            }
            await newAccount.save();
          }
        }

        const transaction = await Transaction.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json(transaction);
      } catch (err) {
        console.error(err);
        res.status(400).json({ error: "Failed to update transaction" });
      }
      break;

    case 'DELETE':
      try {
        const oldTransaction = await Transaction.findById(id);
        if (!oldTransaction) return res.status(404).json({ error: "Transaction not found" });

        // Reverse old transaction effect before deleting
        if (oldTransaction.accountId) {
          const oldAccount = await SavingsAccount.findById(oldTransaction.accountId);
          if (oldAccount) {
            if (oldTransaction.type === 'expense') {
              oldAccount.currentBalance += Number(oldTransaction.amount) || 0;
            } else if (oldTransaction.type === 'income') {
              oldAccount.currentBalance -= Number(oldTransaction.amount) || 0;
            }
            await oldAccount.save();
          }
        }

        await Transaction.findByIdAndDelete(id);
        res.status(200).json({ message: 'Transaction deleted' });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete transaction" });
      }
      break;

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
