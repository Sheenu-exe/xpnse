import { useState, useEffect } from "react"
import { X } from "lucide-react"

export default function CreateAccountModal({ isOpen, onClose, userId, onAccountCreated, editData = null }) {
  const [name, setName] = useState("")
  const [accountType, setAccountType] = useState("Bank Account")
  const [customType, setCustomType] = useState("")
  const [currentBalance, setCurrentBalance] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (editData && isOpen) {
      setName(editData.name || "");
      if (["Bank Account", "FD", "SIP", "Stocks"].includes(editData.accountType)) {
        setAccountType(editData.accountType);
        setCustomType("");
      } else {
        setAccountType("Other");
        setCustomType(editData.accountType || "");
      }
      setCurrentBalance(editData.currentBalance || "");
    } else if (isOpen) {
      setName("");
      setAccountType("Bank Account");
      setCustomType("");
      setCurrentBalance("");
    }
  }, [editData, isOpen]);

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
      const payload = {
        userId,
        name,
        accountType: finalType,
        liquidityType: getLiquidity(accountType),
        currentBalance: Number(currentBalance) || 0
      };

      let response;
      if (editData) {
        response = await fetch(`/api/savings/accounts/${editData._id || editData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      } else {
        response = await fetch('/api/savings/accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      }
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-[#1C1C1E] border border-white/10 w-full max-w-md rounded-[32px] p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-[17px] font-semibold text-foreground tracking-tight mb-6">{editData ? 'Edit Asset' : 'New Asset'}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-white/50 uppercase tracking-wider mb-1">Asset Name</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. HDFC Savings, Zerodha" className="w-full bg-black/50 border border-white/10 rounded-[16px] p-3 text-foreground focus:border-[#0A84FF] focus:ring-1 focus:ring-[#0A84FF] outline-none transition-all placeholder-white/20 text-[15px]" />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-white/50 uppercase tracking-wider mb-1">Asset Type</label>
            <select value={accountType} onChange={e => setAccountType(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-[16px] p-3 text-foreground focus:border-[#0A84FF] focus:ring-1 focus:ring-[#0A84FF] outline-none transition-all appearance-none text-[15px]">
              <option value="Bank Account">Bank Account (Liquid Cash)</option>
              <option value="FD">Fixed Deposit (Locked)</option>
              <option value="SIP">Mutual Fund SIP (Locked)</option>
              <option value="Stocks">Stocks / Equity (Locked)</option>
              <option value="Other">Something Else...</option>
            </select>
          </div>
          
          {accountType === "Other" && (
            <div>
              <label className="block text-[11px] font-medium text-white/50 uppercase tracking-wider mb-1">Custom Type</label>
              <input type="text" required value={customType} onChange={e => setCustomType(e.target.value)} placeholder="e.g. Crypto, Real Estate" className="w-full bg-black/50 border border-white/10 rounded-[16px] p-3 text-foreground focus:border-[#0A84FF] focus:ring-1 focus:ring-[#0A84FF] outline-none transition-all placeholder-white/20 text-[15px]" />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-white/50 uppercase tracking-wider mb-1">Initial Value (Optional)</label>
            <input type="number" value={currentBalance} onChange={e => setCurrentBalance(e.target.value)} placeholder="0.00" className="w-full bg-black/50 border border-white/10 rounded-[16px] p-3 text-foreground focus:border-[#0A84FF] focus:ring-1 focus:ring-[#0A84FF] outline-none transition-all placeholder-white/20 text-[15px]" />
          </div>

          <button disabled={isSubmitting} type="submit" className="w-full bg-[#0A84FF] text-white font-medium tracking-wide text-[15px] py-3.5 rounded-full mt-4 hover:bg-opacity-90 active:scale-95 transition-all duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmitting ? 'Saving...' : editData ? 'Save Changes' : 'Create Asset'}
          </button>
        </form>
      </div>
    </div>
  )
}

