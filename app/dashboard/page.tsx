import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPaymentLinks, getPaymentStats } from '@/app/actions/payment-links'
import { getPaystackSettlementSummary } from '@/lib/paystack'
import { getAdminConfig, getPlatformSettings } from '@/app/actions/platform-settings'
import { getDashboardAnalytics } from '@/app/actions/analytics'
import CreateLinkForm from '@/components/create-link-form'
import PlatformSettingsForm from '@/components/platform-settings-form'
import PaymentLinksTable from '@/components/payment-links-table'
import StatsOverview from '@/components/stats-overview'
import DashboardHeader from '@/components/dashboard-header'
import DashboardAnalytics from '@/components/dashboard-analytics'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/sign-in')
  }

  const defaultSettings = {
    disabled_payment_message: 'Our systems are currently down and we might not be able to process your payment. Please contact support for an alternative payment method.',
    support_email: 'support@committee.com',
    theme_primary_color: '#0f766e',
    theme_background_color: '#f8fafc',
    theme_text_color: '#0f172a',
    theme_accent_color: '#14b8a6',
  }
  const defaultStats = {
    total: 0,
    completed: 0,
    pending: 0,
    failed: 0,
    completedAmountUsd: 0,
    completedAmountKes: 0,
    failedAmountUsd: 0,
    failedAmountKes: 0,
  }
  const defaultAnalytics = { rangeDays: 30, trend: [], status: [] }

  const [links, stats, settlements, settings, config, analytics] = await Promise.all([
    getPaymentLinks().catch((error) => {
      console.error('[v0] Dashboard payment links failed:', error)
      return []
    }),
    getPaymentStats().catch((error) => {
      console.error('[v0] Dashboard payment stats failed:', error)
      return defaultStats
    }),
    getPaystackSettlementSummary().catch((error) => {
      console.error('[v0] Dashboard settlement summary failed:', error)
      return { settledAmountKes: 0, pendingAmountKes: 0 }
    }),
    getPlatformSettings().catch((error) => {
      console.error('[v0] Dashboard platform settings failed:', error)
      return defaultSettings
    }),
    getAdminConfig().catch((error) => {
      console.error('[v0] Dashboard secure configuration failed:', error)
      return []
    }),
    getDashboardAnalytics(30).catch((error) => {
      console.error('[v0] Dashboard analytics failed:', error)
      return defaultAnalytics
    }),
  ])

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <DashboardHeader user={user!} />

        {/* Stats Overview */}
        <StatsOverview stats={stats} settlements={settlements} />

        <DashboardAnalytics initialData={analytics} />

        <div id="payment-settings" className="mt-6 scroll-mt-6 sm:mt-8">
          <PlatformSettingsForm initialSettings={settings} initialConfig={config} />
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
