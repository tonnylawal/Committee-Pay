import { redirect } from 'next/navigation'
import TrainingCenter from '@/components/training-center'
import { createClient } from '@/lib/supabase/server'

export default async function TrainingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')
  const { data: profile } = await supabase.from('users').select('role,is_active').eq('id', user.id).maybeSingle()
  if (profile?.role !== 'admin' || !profile.is_active) redirect('/dashboard')
  return <TrainingCenter />
}
