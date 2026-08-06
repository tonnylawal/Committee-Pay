import { redirect } from 'next/navigation'
import Link from 'next/link'
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-8">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">API Keys</h1>
              <p className="text-slate-600 mt-2">Manage your API keys for programmatic access</p>
            </div>
          </div>
        </div>
        <ApiKeysClient />
      </div>
    </div>
  )
}
