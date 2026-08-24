'use client'

import { useState } from 'react'

interface Transaction {
  id: string
  reference: string
  amount_usd: number | string
  amount_kes: number | string
  email: string
  status: 'pending' | 'completed' | 'failed'
  transaction_id?: string
  created_at: string
  updated_at: string
  payment_links?: {
    custom_path: string
    description?: string
  }
}

interface TransactionsTableProps {
  transactions: Transaction[]
}

type DateRange = 'all' | '24h' | '7d' | '14d' | '21d' | '30d' | '2m' | '3m' | '6m' | '12m'

const DATE_RANGES: Array<{ value: DateRange; label: string; days?: number }> = [
  { value: 'all', label: 'All time' },
  { value: '24h', label: 'Last 24 hours', days: 1 },
  { value: '7d', label: 'Last 7 days', days: 7 },
  { value: '14d', label: 'Last 14 days', days: 14 },
  { value: '21d', label: 'Last 21 days', days: 21 },
  { value: '30d', label: 'Last 30 days', days: 30 },
  { value: '2m', label: 'Last 2 months', days: 60 },
  { value: '3m', label: 'Last 3 months', days: 90 },
  { value: '6m', label: 'Last 6 months', days: 180 },
  { value: '12m', label: 'Last 12 months', days: 365 },
]

const toNumber = (value: number | string | null | undefined): number => {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value ?? '0'))
  return Number.isFinite(parsed) ? parsed : 0
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'failed':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-slate-100 text-slate-800'
  }
}

export default function TransactionsTable({ transactions }: TransactionsTableProps) {
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all')
  const [dateRange, setDateRange] = useState<DateRange>('all')
  const [searchEmail, setSearchEmail] = useState('')

  const filteredTransactions = transactions.filter((tx) => {
    const matchesStatus = filter === 'all' || tx.status === filter
    const matchesEmail = (tx.email ?? '').toLowerCase().includes(searchEmail.toLowerCase())
    const selectedRange = DATE_RANGES.find((range) => range.value === dateRange)
    const matchesDate = !selectedRange?.days || new Date(tx.created_at).getTime() >= Date.now() - selectedRange.days * 24 * 60 * 60 * 1000
    return matchesStatus && matchesEmail && matchesDate
  })

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-12 shadow-sm text-center">
        <p className="text-sm sm:text-base text-slate-600">No transactions yet.</p>
      </div>
    )
  }

  return (
    <>
      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition ${
              filter === 'completed'
                ? 'bg-green-600 text-white'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition ${
              filter === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('failed')}
            className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition ${
              filter === 'failed'
                ? 'bg-red-600 text-white'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
            }`}
          >
            Failed
          </button>
        </div>
        <select
          value={dateRange}
          onChange={(event) => setDateRange(event.target.value as DateRange)}
          className="w-full sm:w-auto px-3 sm:px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Filter payments by date"
        >
          {DATE_RANGES.map((range) => <option key={range.value} value={range.value}>{range.label}</option>)}
        </select>
        <div className="flex-1">
          <input
            type="email"
            placeholder="Search by email..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max sm:min-w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-slate-700">Email</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-slate-700">Amount (USD)</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-slate-700">Amount (KES)</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-slate-700 hidden sm:table-cell">Status</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-slate-700 hidden md:table-cell">Reference</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-slate-700">Date &amp; time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 sm:px-6 py-4 text-center text-sm text-slate-600">
                    No transactions match your filter
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-slate-50 transition align-top">
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div>
                        <p className="font-medium text-xs sm:text-sm text-slate-900 break-all">
                          {transaction.email}
                        </p>
                        {transaction.payment_links?.custom_path && (
                          <p className="text-xs text-slate-500 mt-1">
                            Link: {transaction.payment_links.custom_path}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <p className="font-semibold text-xs sm:text-sm text-slate-900">
                        ${toNumber(transaction.amount_usd).toFixed(2)}
                      </p>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <p className="text-xs sm:text-sm text-slate-600">
                        {Math.round(transaction.amount_kes).toLocaleString()} KES
                      </p>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          transaction.status,
                        )}`}
                      >
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                      <p className="text-xs text-slate-600 break-all font-mono">
                        {transaction.reference}
                      </p>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <p className="text-xs sm:text-sm text-slate-600 whitespace-nowrap" suppressHydrationWarning>
                        {formatDate(transaction.created_at)}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>Showing {filteredTransactions.length} of {transactions.length} transactions</strong>
        </p>
      </div>
    </>
  )
}
