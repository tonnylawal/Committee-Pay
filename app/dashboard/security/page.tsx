import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SecurityClient from '@/components/security-client'

export default async function SecurityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')
  const { data: profile } = await supabase.from('users').select('role, is_active').eq('id', user.id).maybeSingle()
  if (!profile || profile.role !== 'admin' || profile.is_active === false) redirect('/dashboard')
  return <SecurityClient email={user.email || ''} />
}
