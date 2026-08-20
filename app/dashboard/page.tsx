import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPaymentLinks, getPaymentStats } from '@/app/actions/payment-links'
import { getPaystackSettlementSummary } from '@/lib/paystack'
import { getPlatformSettings } from '@/app/actions/platform-settings'
import CreateLinkForm from '@/components/create-link-form'
import PlatformSettingsForm from '@/components/platform-settings-form'
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

  const [links, stats, settlements, settings] = await Promise.all([
    getPaymentLinks(),
    getPaymentStats(),
    getPaystackSettlementSummary(),
    getPlatformSettings(),
  ])

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <DashboardHeader user={user!} />

        {/* Stats Overview */}
        <StatsOverview stats={stats} settlements={settlements} />

        <div id="payment-settings" className="mt-6 scroll-mt-6 sm:mt-8">
          <PlatformSettingsForm initialSettings={settings} />
        </div>

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
    </div>
  )
}
