'use client'

import { useState } from 'react'
import { updatePaymentLink, disablePaymentLink, activatePaymentLink, deletePaymentLink, getPaymentsByLinkId } from '@/app/actions/payment-links'
import { useRouter } from 'next/navigation'
import PaymentDetailsModal from './payment-details-modal'
import EditLinkModal from './edit-link-modal'

interface PaymentLink {
  id: number
  custom_path: string
  amount_usd: number | null
  amount_type?: 'fixed' | 'flexible'
  minimum_amount_usd?: number
  description?: string
  is_active: boolean
}

interface PaymentLinksTableProps {
  links: PaymentLink[]
}

export default function PaymentLinksTable({ links }: PaymentLinksTableProps) {
  const [selectedLink, setSelectedLink] = useState<PaymentLink | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingLink, setEditingLink] = useState<PaymentLink | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDisable = async (id: number) => {
    if (confirm('Are you sure you want to disable this link?')) {
      try {
        setLoading(true)
        await disablePaymentLink(id)
        router.refresh()
      } catch (error) {
        alert('Failed to disable link')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleActivate = async (id: number) => {
    try {
      setLoading(true)
      await activatePaymentLink(id)
      router.refresh()
    } catch (error) {
      alert('Failed to activate link')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to permanently delete this link?')) {
      try {
        setLoading(true)
        await deletePaymentLink(id)
        router.refresh()
      } catch (error) {
        alert('Failed to delete link')
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

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const year = date.getFullYear()
    return `${month}/${day}/${year}`
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
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Type & Amount</th>
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
                    {(() => {
                      const amountType = link.amount_type || (link.amount_usd ? 'fixed' : 'flexible')
                      if (amountType === 'fixed') {
                        return (
                          <div>
                            <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded mb-1">Fixed</span>
                            <p className="font-semibold text-slate-900">${link.amount_usd?.toFixed(2)}</p>
                          </div>
                        )
                      } else {
                        return (
                          <div>
                            <span className="inline-block px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded mb-1">Flexible</span>
                            <p className="text-sm text-slate-600">Min: ${(link.minimum_amount_usd || 20).toFixed(2)}</p>
                          </div>
                        )
                      }
                    })()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        link.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {link.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600" suppressHydrationWarning>
                    {formatDate(link.created_at as string)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleCopyLink(link.custom_path)}
                        className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-900 rounded transition"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => setEditingLink(link)}
                        className="px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-900 rounded transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleViewPayments(link)}
                        className="px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-900 rounded transition"
                      >
                        Payments
                      </button>
                      {link.is_active ? (
                        <button
                          onClick={() => handleDisable(link.id)}
                          disabled={loading}
                          className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-900 rounded transition"
                        >
                          Disable
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(link.id)}
                          disabled={loading}
                          className="px-3 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-900 rounded transition"
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showModal && selectedLink && (
        <PaymentDetailsModal link={selectedLink} onClose={() => setShowModal(false)} />
      )}

      {editingLink && (
        <EditLinkModal link={editingLink} onClose={() => setEditingLink(null)} />
      )}
    </>
  )
}
