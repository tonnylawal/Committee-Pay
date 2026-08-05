import { redirect } from 'next/navigation'
import { isInitialSignupAvailable } from '@/lib/auth-bootstrap'

export const dynamic = 'force-dynamic'

export default async function InitPage() {
  if (await isInitialSignupAvailable()) {
    redirect('/sign-up')
  }

  redirect('/sign-in')
}
