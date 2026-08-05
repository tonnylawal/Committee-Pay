'use client'

import { PaymentLink } from '@/lib/db/schema'
import { getPaymentsByLinkId } from '@/app/actions/payment-links'
import { useEffect, useState } from 'react'

interface PaymentDetailsModalProps {
  link: PaymentLink
  onClose: () => void
}

interface Payment {
  id: number
  linkId: number
  referenceId: string | null
  amountKes: any
  amountUsd: any
  status: string | null
  customerEmail: string | null
  createdAt: any
  updatedAt: any
}

export default function PaymentDetailsModal({ link, onClose }: PaymentDetailsModalProps) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const data = await getPaymentsByLinkId(link.id)
        setPayments(data as Payment[])
      } catch (error) {
        console.error('Failed to fetch payments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [link.id])

  const getStatusBadge = (status: string | null) => {
    const baseClass = 'inline-block px-2 py-1 text-xs font-medium rounded'
    switch (status) {
      case 'completed':
        return `${baseClass} bg-green-100 text-green-800`
      case 'pending':
        return `${baseClass} bg-yellow-100 text-yellow-800`
      case 'failed':
        return `${baseClass} bg-red-100 text-red-800`
      default:
        return `${baseClass} bg-slate-100 text-slate-800`
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto shadow-lg">
        <div className="sticky top-0 bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Payments for {link.customPath}</h2>
            <p className="text-sm text-slate-600">Amount: ${link.amountUsd}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 text-xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <p className="text-slate-600">Loading payments...</p>
          ) : payments.length === 0 ? (
            <p className="text-slate-600">No payments yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-slate-700">Reference</th>
                    <th className="px-4 py-2 text-left font-semibold text-slate-700">Email</th>
                    <th className="px-4 py-2 text-left font-semibold text-slate-700">Amount (KES)</th>
                    <th className="px-4 py-2 text-left font-semibold text-slate-700">Status</th>
                    <th className="px-4 py-2 text-left font-semibold text-slate-700">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2 font-mono text-xs text-slate-900">
                        {payment.referenceId?.substring(0, 16)}...
                      </td>
                      <td className="px-4 py-2 text-slate-600">{payment.customerEmail || '-'}</td>
                      <td className="px-4 py-2 font-semibold text-slate-900">
                        KES {parseFloat(payment.amountKes).toFixed(0)}
                      </td>
                      <td className="px-4 py-2">
                        <span className={getStatusBadge(payment.status)}>{payment.status || 'unknown'}</span>
                      </td>
                      <td className="px-4 py-2 text-slate-600">
                        {payment.createdAt && new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
