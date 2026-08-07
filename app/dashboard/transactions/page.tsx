import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { reconcilePendingPayments } from '@/lib/paystack-payment-status'
import TransactionsTable from '@/components/transactions-table'

async function getTransactions() {
  try {
    await reconcilePendingPayments(25)

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('payments')
      .select('*, payment_links(custom_path, description)')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error: any) {
    console.error('[Page] Get transactions error:', error)
    return []
  }
}

export default async function TransactionsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  const transactions = await getTransactions()

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Transaction History</h1>
          <p className="text-slate-600">View all payments and transaction details</p>
        </div>

        {/* Navigation */}
        <div className="mb-6 flex flex-wrap gap-2 sm:gap-4">
          <a href="/dashboard" className="text-xs sm:text-sm text-slate-600 hover:text-slate-900 font-medium px-3 sm:px-4 py-2 rounded-lg hover:bg-slate-200 transition">
            Payment Links
          </a>
          <a href="/dashboard/transactions" className="text-xs sm:text-sm text-slate-600 hover:text-slate-900 font-medium px-3 sm:px-4 py-2 rounded-lg bg-slate-200 transition">
            Transactions
          </a>
          <a href="/dashboard/api-keys" className="text-xs sm:text-sm text-slate-600 hover:text-slate-900 font-medium px-3 sm:px-4 py-2 rounded-lg hover:bg-slate-200 transition">
            API Keys
          </a>
          <a href="/api-docs" target="_blank" className="text-xs sm:text-sm text-slate-600 hover:text-slate-900 font-medium px-3 sm:px-4 py-2 rounded-lg hover:bg-slate-200 transition">
            API Docs
          </a>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-8">
          <div className="bg-white border rounded-lg p-3 sm:p-4 md:p-6">
            <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1 sm:mb-2 truncate">Total Transactions</p>
            <p className="text-lg sm:text-2xl md:text-3xl font-bold text-slate-900 truncate">{transactions.length}</p>
          </div>
          <div className="bg-white border rounded-lg p-3 sm:p-4 md:p-6">
            <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1 sm:mb-2 truncate">Completed</p>
            <p className="text-lg sm:text-2xl md:text-3xl font-bold text-green-600 truncate">
              {transactions.filter((t: any) => t.status === 'completed').length}
            </p>
          </div>
          <div className="bg-white border rounded-lg p-3 sm:p-4 md:p-6">
            <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1 sm:mb-2 truncate">Pending</p>
            <p className="text-lg sm:text-2xl md:text-3xl font-bold text-yellow-600 truncate">
              {transactions.filter((t: any) => t.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white border rounded-lg p-3 sm:p-4 md:p-6">
            <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1 sm:mb-2 truncate">Failed</p>
            <p className="text-lg sm:text-2xl md:text-3xl font-bold text-red-600 truncate">
              {transactions.filter((t: any) => t.status === 'failed').length}
            </p>
          </div>
        </div>

        {/* Transactions Table */}
        <TransactionsTable transactions={transactions} />
      </div>
    </div>
  )
}
