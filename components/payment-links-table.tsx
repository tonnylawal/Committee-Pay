'use client'

import { PaymentLink } from '@/lib/db/schema'
import { useState } from 'react'
import { updatePaymentLink, deletePaymentLink, getPaymentsByLinkId } from '@/app/actions/payment-links'
import { useRouter } from 'next/navigation'
import PaymentDetailsModal from './payment-details-modal'

interface PaymentLinksTableProps {
  links: PaymentLink[]
}

export default function PaymentLinksTable({ links }: PaymentLinksTableProps) {
  const [selectedLink, setSelectedLink] = useState<PaymentLink | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to deactivate this link?')) {
      try {
        setLoading(true)
        await deletePaymentLink(id)
        router.refresh()
      } catch (error) {
        alert('Failed to deactivate link')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleViewPayments = (link: PaymentLink) => {
    setSelectedLink(link)
    setShowModal(true)
  }

  const handleCopyLink = (path: string) => {
    const link = `${window.location.origin}/pay/${path}`
    navigator.clipboard.writeText(link)
    alert('Link copied to clipboard!')
  }

  if (links.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-12 shadow-sm text-center">
        <p className="text-slate-600">No payment links created yet. Create one to get started!</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Path</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Created</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {links.map((link) => (
                <tr key={link.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="font-medium text-slate-900">{link.customPath}</p>
                        {link.description && <p className="text-xs text-slate-500 mt-1">{link.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-900">${link.amountUsd}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        link.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {link.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {link.createdAt && new Date(link.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleCopyLink(link.customPath)}
                        className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-900 rounded transition"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => handleViewPayments(link)}
                        className="px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-900 rounded transition"
                      >
                        Payments
                      </button>
                      <button
                        onClick={() => handleDelete(link.id)}
                        disabled={loading || !link.isActive}
                        className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-900 disabled:opacity-50 disabled:cursor-not-allowed rounded transition"
                      >
                        Deactivate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedLink && (
        <PaymentDetailsModal link={selectedLink} onClose={() => setShowModal(false)} />
      )}
    </>
  )
}
