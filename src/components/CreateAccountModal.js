import { useState, useEffect } from "react"
import { X } from "lucide-react"

export default function CreateAccountModal({ isOpen, onClose, userId, onAccountCreated }) {
  const [name, setName] = useState("")
  const [accountType, setAccountType] = useState("Bank Account")
  const [customType, setCustomType] = useState("")
  const [currentBalance, setCurrentBalance] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const getLiquidity = (type) => {
    if (type === "Bank Account") return "Liquid";
    if (["FD", "SIP", "Stocks"].includes(type)) return "Locked";
    return "Liquid"; // Default for Other
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    const finalType = accountType === "Other" ? (customType || "Custom") : accountType;
    try {
      const response = await fetch('/api/savings/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name,
          accountType: finalType,
          liquidityType: getLiquidity(accountType),
          currentBalance: Number(currentBalance) || 0
        })
      })
      if (response.ok) {
        onAccountCreated()
        onClose()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-forest-900 border border-forest-700 w-full max-w-md rounded-luxury p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-cream/50 hover:text-cream">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-display font-bold text-cream mb-6">New Asset</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-cream/50 uppercase tracking-widest mb-1">Asset Name</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. HDFC Savings, Zerodha" className="w-full bg-forest-800 border border-forest-600 rounded-xl p-3 text-cream focus:border-sage focus:ring-1 focus:ring-sage outline-none" />
          </div>
          <div>
            <label className="block text-xs font-mono text-cream/50 uppercase tracking-widest mb-1">Asset Type</label>
            <select value={accountType} onChange={e => setAccountType(e.target.value)} className="w-full bg-forest-800 border border-forest-600 rounded-xl p-3 text-cream focus:border-sage focus:ring-1 focus:ring-sage outline-none">
              <option value="Bank Account">Bank Account (Liquid Cash)</option>
              <option value="FD">Fixed Deposit (Locked)</option>
              <option value="SIP">Mutual Fund SIP (Locked)</option>
              <option value="Stocks">Stocks / Equity (Locked)</option>
              <option value="Other">Something Else...</option>
            </select>
          </div>
          
          {accountType === "Other" && (
            <div>
              <label className="block text-xs font-mono text-cream/50 uppercase tracking-widest mb-1">Custom Type</label>
              <input type="text" required value={customType} onChange={e => setCustomType(e.target.value)} placeholder="e.g. Crypto, Real Estate" className="w-full bg-forest-800 border border-forest-600 rounded-xl p-3 text-cream focus:border-sage focus:ring-1 focus:ring-sage outline-none" />
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-cream/50 uppercase tracking-widest mb-1">Initial Value (Optional)</label>
            <input type="number" value={currentBalance} onChange={e => setCurrentBalance(e.target.value)} placeholder="0.00" className="w-full bg-forest-800 border border-forest-600 rounded-xl p-3 text-cream focus:border-sage focus:ring-1 focus:ring-sage outline-none" />
          </div>

          <button disabled={isSubmitting} type="submit" className="w-full bg-sage text-forest-900 font-bold py-3 rounded-xl mt-4 hover:bg-sage/90 transition-colors">
            {isSubmitting ? 'Creating...' : 'Create Asset'}
          </button>
        </form>
      </div>
    </div>
  )
}

