import { NextResponse } from 'next/server'
import { reconcilePendingPayments } from '@/lib/paystack-payment-status'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase.from('users').select('role, is_active').eq('id', user.id).maybeSingle()
  if (profile?.role !== 'admin' || !profile.is_active) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  try {
    return NextResponse.json(await reconcilePendingPayments(50))
  } catch (error) {
    console.error('[v0] Payment reconciliation failed:', error)
    return NextResponse.json({ error: 'Reconciliation failed' }, { status: 500 })
  }
}
