'use client'

import { useState, ChangeEvent, FormEvent } from 'react'
import { createPaymentLink } from '@/app/actions/payment-links'
import { useRouter } from 'next/navigation'

interface FormData {
  customPath: string
  description: string
  amountType: 'fixed' | 'flexible'
  fixedAmount: string
  minimumAmount: string
}

export default function CreateLinkForm() {
  const [formData, setFormData] = useState<FormData>({
    customPath: '',
    description: '',
    amountType: 'flexible',
    fixedAmount: '',
    minimumAmount: '20.00',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const router = useRouter()

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setGeneratedLink(null)

    try {
      const amountUsd = formData.amountType === 'fixed' ? parseFloat(formData.fixedAmount) : null
      const minimumAmount = formData.amountType === 'flexible' ? parseFloat(formData.minimumAmount) : null

      if (formData.amountType === 'fixed' && (!amountUsd || amountUsd <= 0)) {
        throw new Error('Please enter a valid fixed amount')
      }

      if (formData.amountType === 'flexible' && (!minimumAmount || minimumAmount < 0.01)) {
        throw new Error('Minimum amount must be at least $0.01')
      }

      const link = await createPaymentLink(
        formData.customPath,
        formData.amountType,
        amountUsd,
        minimumAmount,
        formData.description || undefined,
      )

      setMessage({
        type: 'success',
        text: 'Payment link created successfully!',
      })

      setGeneratedLink(`${window.location.origin}/pay/${formData.customPath}`)

      setFormData({
        customPath: '',
        description: '',
        amountType: 'flexible',
        fixedAmount: '',
        minimumAmount: '20.00',
      })

      // Refresh dashboard
      router.refresh()
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to create payment link',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900 mb-2">Create Payment Link</h2>
      <p className="text-sm text-slate-600 mb-6">Choose between a fixed amount or let customers decide</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="customPath" className="block text-sm font-medium text-slate-700 mb-2">
            Custom Path *
          </label>
          <input
            id="customPath"
            name="customPath"
            type="text"
            placeholder="e.g., invoice-123"
            value={formData.customPath}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-slate-500">This will be the URL path for your payment link</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">Payment Type *</label>
          <div className="grid grid-cols-2 gap-3">
            <label className={`flex items-center p-3 border-2 rounded-md cursor-pointer transition ${
              formData.amountType === 'fixed' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
            }`}>
              <input
                type="radio"
                name="amountType"
                value="fixed"
                checked={formData.amountType === 'fixed'}
                onChange={() => setFormData(prev => ({ ...prev, amountType: 'fixed' }))}
                className="mr-2"
              />
              <span className="text-sm font-medium text-slate-700">Fixed Amount</span>
            </label>
            <label className={`flex items-center p-3 border-2 rounded-md cursor-pointer transition ${
              formData.amountType === 'flexible' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
            }`}>
              <input
                type="radio"
                name="amountType"
                value="flexible"
                checked={formData.amountType === 'flexible'}
                onChange={() => setFormData(prev => ({ ...prev, amountType: 'flexible' }))}
                className="mr-2"
              />
              <span className="text-sm font-medium text-slate-700">Customer Decides</span>
            </label>
          </div>
        </div>

        {formData.amountType === 'fixed' && (
          <div>
            <label htmlFor="fixedAmount" className="block text-sm font-medium text-slate-700 mb-2">
              Amount (USD) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-900 font-semibold">$</span>
              <input
                id="fixedAmount"
                name="fixedAmount"
                type="number"
                placeholder="50.00"
                value={formData.fixedAmount}
                onChange={handleChange}
                step="0.01"
                min="0.01"
                className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {formData.amountType === 'flexible' && (
          <div>
            <label htmlFor="minimumAmount" className="block text-sm font-medium text-slate-700 mb-2">
              Minimum Amount (USD) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-900 font-semibold">$</span>
              <input
                id="minimumAmount"
                name="minimumAmount"
                type="number"
                placeholder="20.00"
                value={formData.minimumAmount}
                onChange={handleChange}
                step="0.01"
                min="0.01"
                className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">Customers must pay at least this amount</p>
          </div>
        )}

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            placeholder="e.g., Service invoice for Q3"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-medium py-2 px-4 rounded-md transition duration-200"
        >
          {loading ? 'Creating...' : 'Create Payment Link'}
        </button>
      </form>

      {/* Messages */}
      {message && (
        <div
          className={`mt-4 p-3 rounded-md text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Generated Link */}
      {generatedLink && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-xs text-slate-600 mb-2">Your payment link:</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm text-blue-900 break-all font-mono">{generatedLink}</code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedLink)
              }}
              className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-900 rounded transition"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
