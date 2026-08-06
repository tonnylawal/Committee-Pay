'use client'

import { useState } from 'react'
import { updatePaymentLink } from '@/app/actions/payment-links'
import { useRouter } from 'next/navigation'

interface PaymentLink {
  id: number
  custom_path: string
  amount_usd: number | null
  amount_type?: 'fixed' | 'flexible'
  minimum_amount_usd?: number
  description?: string
  is_active: boolean
}

interface EditLinkModalProps {
  link: PaymentLink
  onClose: () => void
}

export default function EditLinkModal({ link, onClose }: EditLinkModalProps) {
  const [description, setDescription] = useState(link.description || '')
  const [fixedAmount, setFixedAmount] = useState(link.amount_usd?.toString() || '')
  const [minimumAmount, setMinimumAmount] = useState((link.minimum_amount_usd || 20).toString())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const amountType = link.amount_type || (link.is_active ? 'fixed' : 'flexible')

  const handleSave = async () => {
    setError('')
    setLoading(true)

    try {
      const updates: any = { description }

      if (amountType === 'fixed') {
        const amount = parseFloat(fixedAmount)
        if (!amount || amount <= 0) {
          throw new Error('Amount must be greater than 0')
        }
        updates.amount_usd = amount
      } else {
        const minAmount = parseFloat(minimumAmount)
        if (!minAmount || minAmount < 0.01) {
          throw new Error('Minimum amount must be at least $0.01')
        }
        updates.minimum_amount_usd = minAmount
      }

      await updatePaymentLink(link.id, updates)
      router.refresh()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to update link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Edit Payment Link</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Path</label>
            <input
              type="text"
              value={link.custom_path}
              disabled
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-600 bg-slate-50"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {amountType === 'fixed' && (
            <div>
              <label htmlFor="fixedAmount" className="block text-sm font-medium text-slate-700 mb-2">
                Amount (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-900 font-semibold">$</span>
                <input
                  id="fixedAmount"
                  type="number"
                  value={fixedAmount}
                  onChange={(e) => setFixedAmount(e.target.value)}
                  step="0.01"
                  min="0.01"
                  className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {amountType === 'flexible' && (
            <div>
              <label htmlFor="minimumAmount" className="block text-sm font-medium text-slate-700 mb-2">
                Minimum Amount (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-900 font-semibold">$</span>
                <input
                  id="minimumAmount"
                  type="number"
                  value={minimumAmount}
                  onChange={(e) => setMinimumAmount(e.target.value)}
                  step="0.01"
                  min="0.01"
                  className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">Customers must pay at least this amount</p>
            </div>
          )}

          {error && <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-md text-sm">{error}</div>}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-md hover:bg-slate-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-medium rounded-md transition"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
