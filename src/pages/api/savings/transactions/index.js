import dbConnect from '../../../../libs/mongodb';
import SavingsTransaction from '../../../../models/SavingsTransaction';
import SavingsAccount from '../../../../models/SavingsAccount';
import Transaction from '../../../../models/Transaction';

export default async function handler(req, res) {
  const { method } = req;
  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const { userId, accountId } = req.query;
        let query = {};
        if (userId) query.userId = userId;
        if (accountId) query.accountId = accountId;
        
        const transactions = await SavingsTransaction.find(query)
          .sort({ date: -1 })
          .populate('accountId', 'name color')
          .populate('transferToAccountId', 'name color');
        res.status(200).json(transactions);
      } catch (err) {
        res.status(500).json({ error: "Failed to fetch savings transactions" });
      }
      break;
    
    case 'POST':
      try {
        const { userId, accountId, type, amount, note, date, transferToAccountId } = req.body;
        
        const sourceAcc = await SavingsAccount.findById(accountId);
        if (!sourceAcc) return res.status(404).json({ error: "Source account not found" });

        try {
          if (type === 'deposit') {
            sourceAcc.currentBalance += Number(amount);
            await sourceAcc.save();
            await SavingsTransaction.create([{ ...req.body }]);
            
            await Transaction.create([{
              title: `Deposit to ${sourceAcc.name}`,
              amount: Number(amount),
              category: "Wealth Allocation",
              type: "expense",
              date: date || new Date().toISOString(),
              description: note || `From Master Ledger -> ${sourceAcc.name} (Fd/SIP/Stocks)`,
              userId
            }]);

          } else if (type === 'withdrawal') {
            sourceAcc.currentBalance -= Number(amount);
            await sourceAcc.save();
            await SavingsTransaction.create([{ ...req.body }]);

            await Transaction.create([{
              title: `Withdrawal from ${sourceAcc.name}`,
              amount: Number(amount),
              category: "Wealth Utilization",
              type: "income",
              date: date || new Date().toISOString(),
              description: note || `From ${sourceAcc.name} (Fd/SIP/Stocks) -> Master Ledger`,
              userId
            }]);

          } else if (type === 'transfer') {
            const destAcc = await SavingsAccount.findById(transferToAccountId);
            if (!destAcc) throw new Error("Destination account not found");

            sourceAcc.currentBalance -= Number(amount);
            destAcc.currentBalance += Number(amount);
            
            await sourceAcc.save();
            await destAcc.save();
            
            await SavingsTransaction.create([{ ...req.body }]);
          }

          res.status(201).json({ message: "Transaction completed successfully" });
        } catch (e) {
          throw e;
        }
      } catch (err) {
        console.error("Savings TX Error:", err);
        res.status(400).json({ error: "Failed to process transaction" });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
