'use client'

import { ChangeEvent, FormEvent, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface PaymentLink {
  id: number
  custom_path: string
  amount_usd: number | null
  description?: string
  is_active: boolean
  is_flexible_amount: boolean
}

interface PaymentFormProps {
  link: PaymentLink
}

export default function PaymentForm({ link }: PaymentFormProps) {
  const [email, setEmail] = useState('')
  const [amountUsd, setAmountUsd] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'verifying' | 'success' | 'failed'>(
    'idle',
  )
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check payment status if returning from Paystack
  useEffect(() => {
    const reference = searchParams.get('reference')
    const status = searchParams.get('status')

    if (reference) {
      verifyPayment(reference)
    }
  }, [searchParams])

  const verifyPayment = async (reference: string) => {
    try {
      setPaymentStatus('verifying')
      const response = await fetch(`/api/payments/verify?reference=${reference}`)
      const data = await response.json()

      if (response.ok && data.data.status === 'completed') {
        setPaymentStatus('success')
      } else {
        setPaymentStatus('failed')
        setError('Payment verification failed. Please contact support.')
      }
    } catch (err) {
      setPaymentStatus('failed')
      setError('Failed to verify payment')
    }
  }

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    setError('')
  }

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAmountUsd(e.target.value)
    setError('')
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const amount = parseFloat(amountUsd)
      if (!amount || amount <= 0) {
        throw new Error('Please enter a valid amount')
      }

      // Initialize payment
      const initResponse = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customPath: link.custom_path,
          email,
          amountUsd: amount,
        }),
      })

      const initData = await initResponse.json()

      if (!initResponse.ok) {
        throw new Error(initData.error || 'Failed to initialize payment')
      }

      // Redirect to Paystack
      setPaymentStatus('processing')

      // Use timeout to allow UI to update before redirect
      setTimeout(() => {
        window.location.href = initData.data.authorizationUrl
      }, 500)
    } catch (err: any) {
      setError(err.message || 'Failed to process payment')
      setLoading(false)
    }
  }

  if (paymentStatus === 'verifying') {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8 shadow-sm max-w-md w-full text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-lg font-semibold text-slate-900">Verifying Payment...</h2>
        <p className="text-slate-600 mt-2">Please wait while we confirm your payment.</p>
      </div>
    )
  }

  if (paymentStatus === 'success') {
    return (
      <div className="bg-white rounded-lg border border-green-200 p-8 shadow-sm max-w-md w-full text-center bg-green-50">
        <div className="text-4xl mb-4">✓</div>
        <h2 className="text-2xl font-bold text-green-900">Payment Successful!</h2>
        <p className="text-green-800 mt-3">Your payment has been processed successfully.</p>
        <p className="text-sm text-green-700 mt-4">You will receive a confirmation email shortly.</p>
        <button
          onClick={() => window.location.href = '/'}
          className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition"
        >
          Return Home
        </button>
      </div>
    )
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="bg-white rounded-lg border border-red-200 p-8 shadow-sm max-w-md w-full text-center bg-red-50">
        <div className="text-4xl mb-4">✕</div>
        <h2 className="text-2xl font-bold text-red-900">Payment Failed</h2>
        <p className="text-red-800 mt-3">{error}</p>
        <button
          onClick={() => {
            setPaymentStatus('idle')
            setEmail('')
            setError('')
          }}
          className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-8 shadow-sm max-w-md w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Payment</h1>
        {link.description && <p className="text-slate-600">{link.description}</p>}
        {link.is_flexible_amount && <p className="text-sm text-slate-500 mt-2">Enter the amount you want to pay</p>}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-slate-700 mb-2">
            Amount (USD) *
          </label>
          <div className="relative">
            <span className="absolute left-4 top-2 text-slate-900 font-semibold">$</span>
            <input
              id="amount"
              type="number"
              placeholder="50.00"
              value={amountUsd}
              onChange={handleAmountChange}
              required
              disabled={loading}
              step="0.01"
              min="0.01"
              className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100"
            />
          </div>
          <p className="mt-1 text-xs text-slate-500">Minimum: $0.01</p>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
            Email Address *
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={handleEmailChange}
            required
            disabled={loading}
            className="w-full px-4 py-2 border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100"
          />
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-md text-sm">{error}</div>}

        <button
          type="submit"
          disabled={loading || !amountUsd}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-3 px-4 rounded-md transition duration-200"
        >
          {loading ? 'Processing...' : amountUsd ? `Pay $${parseFloat(amountUsd).toFixed(2)}` : 'Enter amount to continue'}
        </button>
      </form>

      {/* Footer */}
      <p className="text-xs text-slate-500 text-center mt-6">
        Secure payment powered by Paystack. Your payment information is encrypted and secure.
      </p>
    </div>
  )
}
