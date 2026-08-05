import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { isInitialSignupAvailable } from '@/lib/auth-bootstrap'
import AuthForm from '@/components/auth-form'

export const dynamic = 'force-dynamic'

export default async function SignUpPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (session?.user) {
    redirect('/dashboard')
  }

  if (!(await isInitialSignupAvailable())) {
    redirect('/sign-in')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg border border-slate-200 shadow-lg p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 text-center">Create administrator</h1>
          <p className="text-center text-slate-600 mb-8">Set up the first account to manage payment links</p>
          <AuthForm mode="sign-up" />
          <p className="text-center text-xs text-slate-500 mt-6">Signup closes automatically after the first account is created.</p>
        </div>
      </div>
    </main>
  )
}
