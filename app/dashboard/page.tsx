import { getPaymentLinks, getPaymentStats } from '@/app/actions/payment-links'
import CreateLinkForm from '@/components/create-link-form'
import PaymentLinksTable from '@/components/payment-links-table'
import StatsOverview from '@/components/stats-overview'

export default async function DashboardPage() {
  const links = await getPaymentLinks()
  const stats = await getPaymentStats()

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Payment Links Dashboard</h1>
          <p className="text-slate-600">Create and manage payment links for your customers</p>
        </div>

        {/* Stats Overview */}
        <StatsOverview stats={stats} />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Create Link Form */}
          <div className="lg:col-span-1">
            <CreateLinkForm />
          </div>

          {/* Payment Links Table */}
          <div className="lg:col-span-2">
            <PaymentLinksTable links={links} />
          </div>
        </div>
      </div>
    </main>
  )
}
