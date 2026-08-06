import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import AuthForm from '@/components/auth-form'

export const dynamic = 'force-dynamic'

export default async function SignInPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  
  if (session?.user) {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg border border-slate-200 shadow-lg p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 text-center">Dashboard</h1>
          <p className="text-center text-slate-600 mb-8">Sign in to manage payment links</p>
          
          <AuthForm mode="sign-in" />
          <p className="text-center text-sm text-slate-500 mt-6">
            First-time setup?{' '}
            <Link href="/sign-up" className="font-medium text-blue-600 hover:text-blue-700">
              Create the administrator account
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
