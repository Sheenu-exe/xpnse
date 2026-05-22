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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-forest-900 border border-forest-700 w-full max-w-md rounded-luxury p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-cream/50 hover:text-cream">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-display font-bold text-cream mb-6">New Wealth Target</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-cream/50 uppercase tracking-widest mb-1">Target Name</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. New Car, House Downpayment" className="w-full bg-forest-800 border border-forest-600 rounded-xl p-3 text-cream focus:border-sage focus:ring-1 focus:ring-sage outline-none" />
          </div>
          
          <div>
            <label className="block text-xs font-mono text-cream/50 uppercase tracking-widest mb-1">Target Amount</label>
            <input type="number" required value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-forest-800 border border-forest-600 rounded-xl p-3 text-cream focus:border-sage focus:ring-1 focus:ring-sage outline-none" />
          </div>

          <button disabled={isSubmitting} type="submit" className="w-full bg-sage text-forest-900 font-bold py-3 rounded-xl mt-4 hover:bg-sage/90 transition-colors">
            {isSubmitting ? 'Creating...' : 'Create Target'}
          </button>
        </form>
      </div>
    </div>
  )
}
