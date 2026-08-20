import { createClient } from '@/lib/supabase/server'
import PaymentForm from '@/components/payment-form'
import NotFoundPage from '@/components/not-found-page'
import PaymentInactivePage from '@/components/payment-inactive-page'
import { getPlatformSettings } from '@/app/actions/platform-settings'

export default async function PaymentPage({ params }: { params: { customPath: string } }) {
  const { customPath } = await Promise.resolve(params)

  const supabase = await createClient()
  const { data: links, error } = await supabase
    .from('payment_links')
    .select('*')
    .eq('custom_path', customPath)
    .limit(1)

  if (error || !links || links.length === 0) {
    return <NotFoundPage />
  }

  const link = links[0]
  const settings = await getPlatformSettings()
  const theme = {
    primary: link.theme_primary_color || settings.theme_primary_color,
    background: link.theme_background_color || settings.theme_background_color,
    text: link.theme_text_color || settings.theme_text_color,
    accent: link.theme_accent_color || settings.theme_accent_color,
  }

  if (!link.is_active) {
    return <PaymentInactivePage message={settings.disabled_payment_message} supportEmail={settings.support_email} />
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4" style={{ backgroundColor: theme.background, color: theme.text }}>
      <PaymentForm link={link} theme={theme} />
    </main>
  )
}
