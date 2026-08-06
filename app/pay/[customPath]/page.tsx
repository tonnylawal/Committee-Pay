import { createClient } from '@/lib/supabase/server'
import PaymentForm from '@/components/payment-form'

export default async function PaymentPage({ params }: { params: { customPath: string } }) {
  const { customPath } = await Promise.resolve(params)

  const supabase = await createClient()
  const { data: links, error } = await supabase
    .from('payment_links')
    .select('*')
    .eq('custom_path', customPath)
    .limit(1)

  if (error || !links || links.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg border border-slate-200 p-8 shadow-sm max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment Not Found</h1>
          <p className="text-slate-600">This payment link does not exist or has been deactivated.</p>
        </div>
      </main>
    )
  }

  const link = links[0]

  if (!link.is_active) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg border border-slate-200 p-8 shadow-sm max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment Inactive</h1>
          <p className="text-slate-600">This payment link is no longer active.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <PaymentForm link={link} />
    </main>
  )
}
