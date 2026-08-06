import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ApiKeysClient from '@/components/api-keys-client'

export default async function ApiKeysPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">API Keys</h1>
            <p className="text-slate-600 mt-2">Manage your API keys for programmatic access</p>
          </div>
        </div>
        <ApiKeysClient />
      </div>
    </div>
  )
}
