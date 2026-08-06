import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPaymentLinks, getPaymentStats } from '@/app/actions/payment-links'
import CreateLinkForm from '@/components/create-link-form'
import PaymentLinksTable from '@/components/payment-links-table'
import StatsOverview from '@/components/stats-overview'
import DashboardHeader from '@/components/dashboard-header'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/sign-in')
  }

  const links = await getPaymentLinks()
  const stats = await getPaymentStats()

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <DashboardHeader user={user!} />

        {/* Navigation Links */}
        <div className="mb-6 flex flex-wrap gap-2 sm:gap-4">
          <a href="/dashboard" className="text-xs sm:text-sm text-slate-600 hover:text-slate-900 font-medium px-3 sm:px-4 py-2 rounded-lg hover:bg-slate-200 transition">
            Payment Links
          </a>
          <a href="/dashboard/api-keys" className="text-xs sm:text-sm text-slate-600 hover:text-slate-900 font-medium px-3 sm:px-4 py-2 rounded-lg hover:bg-slate-200 transition">
            API Keys
          </a>
          <a href="/api-docs" target="_blank" className="text-xs sm:text-sm text-slate-600 hover:text-slate-900 font-medium px-3 sm:px-4 py-2 rounded-lg hover:bg-slate-200 transition">
            API Docs
          </a>
        </div>

        {/* Stats Overview */}
        <StatsOverview stats={stats} />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mt-6 sm:mt-8">
          {/* Create Link Form */}
          <div className="lg:col-span-1">
            <CreateLinkForm />
          </div>

          {/* Payment Links Table */}
          <div className="lg:col-span-2 overflow-x-auto">
            <PaymentLinksTable links={links} />
          </div>
        </div>
      </div>
    </main>
  )
}
