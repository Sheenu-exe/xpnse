import { useState } from "react"
import { X } from "lucide-react"

export default function AddTargetModal({ isOpen, onClose, userId, onTargetCreated }) {
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/savings/targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name,
          amount: Number(amount)
        })
      })
      if (response.ok) {
        onTargetCreated()
        onClose()
        setName("")
        setAmount("")
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
        <h2 className="text-[17px] font-semibold text-foreground tracking-tight mb-6">New Wealth Target</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-white/50 uppercase tracking-wider mb-1">Target Name</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. New Car, House Downpayment" className="w-full bg-black/50 border border-white/10 rounded-[16px] p-3 text-foreground focus:border-[#0A84FF] focus:ring-1 focus:ring-[#0A84FF] outline-none transition-all placeholder-white/20 text-[15px]" />
          </div>
          
          <div>
            <label className="block text-[11px] font-medium text-white/50 uppercase tracking-wider mb-1">Target Amount</label>
            <input type="number" required value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-black/50 border border-white/10 rounded-[16px] p-3 text-foreground focus:border-[#0A84FF] focus:ring-1 focus:ring-[#0A84FF] outline-none transition-all placeholder-white/20 text-[15px]" />
          </div>

          <button disabled={isSubmitting} type="submit" className="w-full bg-[#0A84FF] text-white font-medium tracking-wide text-[15px] py-3.5 rounded-full mt-4 hover:bg-opacity-90 active:scale-95 transition-all duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmitting ? 'Creating...' : 'Create Target'}
          </button>
        </form>
      </div>
    </div>
  )
}
