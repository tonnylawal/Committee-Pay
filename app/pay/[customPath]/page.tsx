import { createClient } from '@/lib/supabase/server'
import PaymentForm from '@/components/payment-form'
import NotFoundPage from '@/components/not-found-page'
import PaymentInactivePage from '@/components/payment-inactive-page'

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

  if (!link.is_active) {
    return <PaymentInactivePage />
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <PaymentForm link={link} />
    </main>
  )
}
