import { useState } from "react"
import { X, ArrowRight } from "lucide-react"

export default function AddSavingsModal({ isOpen, onClose, userId, accounts, onTransactionComplete }) {
  const [type, setType] = useState("deposit")
  const [accountId, setAccountId] = useState("")
  const [transferToAccountId, setTransferToAccountId] = useState("")
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!accountId) return alert("Select an account")
    if (type === "transfer" && !transferToAccountId) return alert("Select a destination account")
    
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/savings/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          type,
          accountId,
          transferToAccountId: type === 'transfer' ? transferToAccountId : null,
          amount: Number(amount),
          note
        })
      })
      if (response.ok) {
        onTransactionComplete()
        onClose()
      } else {
        alert("Transaction failed")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-[#1C1C1E] border border-white/10 w-full max-w-md rounded-[32px] p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-[17px] font-semibold text-foreground tracking-tight mb-6">Manage Capital</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex bg-white/5 p-1 rounded-[16px] border border-white/5">
            {["deposit", "withdrawal", "transfer"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 py-2 text-[11px] font-medium uppercase tracking-wider rounded-xl transition-all duration-300 ${
                  type === t ? "bg-[#0A84FF] text-white shadow-sm" : "text-white/50 hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className={type === 'transfer' ? "flex items-center gap-2" : ""}>
            <div className="flex-1">
              <label className="block text-[11px] font-medium text-white/50 uppercase tracking-wider mb-1">
                {type === 'transfer' ? 'From' : 'Account'}
              </label>
              <select required value={accountId} onChange={e => setAccountId(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-[16px] p-3 text-[15px] text-foreground focus:border-[#0A84FF] focus:ring-1 focus:ring-[#0A84FF] outline-none appearance-none transition-all">
                <option value="" className="text-white/30">Select...</option>
                {accounts.map(a => (
                  <option key={a._id} value={a._id}>{a.name} ({a.currentBalance})</option>
                ))}
              </select>
            </div>

            {type === 'transfer' && (
              <>
                <div className="pt-5"><ArrowRight className="text-white/30 w-5 h-5" /></div>
                <div className="flex-1">
                  <label className="block text-[11px] font-medium text-white/50 uppercase tracking-wider mb-1">To</label>
                  <select required value={transferToAccountId} onChange={e => setTransferToAccountId(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-[16px] p-3 text-[15px] text-foreground focus:border-[#0A84FF] focus:ring-1 focus:ring-[#0A84FF] outline-none appearance-none transition-all">
                    <option value="" className="text-white/30">Select...</option>
                    {accounts.filter(a => a._id !== accountId).map(a => (
                      <option key={a._id} value={a._id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-medium text-white/50 uppercase tracking-wider mb-1">Amount</label>
            <input type="number" required value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-black/50 border border-white/10 rounded-[16px] p-3 text-foreground text-[15px] tracking-tight focus:border-[#0A84FF] focus:ring-1 focus:ring-[#0A84FF] outline-none transition-all placeholder-white/20" />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-white/50 uppercase tracking-wider mb-1">Note / Reference</label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Q1 Profit Allocation" className="w-full bg-black/50 border border-white/10 rounded-[16px] p-3 text-foreground text-[15px] focus:border-[#0A84FF] focus:ring-1 focus:ring-[#0A84FF] outline-none transition-all placeholder-white/20" />
          </div>

          <button disabled={isSubmitting} type="submit" className="w-full bg-[#0A84FF] text-white font-medium tracking-wide py-3.5 rounded-full mt-4 hover:bg-opacity-90 transition-all duration-300 shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-[15px]">
            {isSubmitting ? 'Processing...' : 'Execute'}
          </button>
        </form>
      </div>
    </div>
  )
}
