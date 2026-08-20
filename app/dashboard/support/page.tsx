import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SupportWorkspace from '@/components/support-workspace'

export default async function SupportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')
  const { data: profile } = await supabase.from('users').select('role,is_active').eq('id', user.id).maybeSingle()
  if (profile?.role !== 'admin' || !profile.is_active) redirect('/dashboard')
  return <SupportWorkspace />
}
