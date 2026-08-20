import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabase as adminSupabase } from '@/lib/db'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await adminSupabase.from('users').select('role,is_active').eq('id', user.id).maybeSingle()
  if (profile?.role !== 'admin' || !profile.is_active) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

  const query = request.nextUrl.searchParams.get('q')?.trim()
  if (!query || query.length < 2) return NextResponse.json({ customers: [], payments: [] })

  const [{ data: users }, { data: payments }] = await Promise.all([
    adminSupabase.from('users').select('id,email,full_name,role,is_active,created_at').or(`email.ilike.%${query}%,full_name.ilike.%${query}%`).limit(20),
    adminSupabase.from('payments').select('id,reference,email,amount_usd,amount_kes,currency,status,transaction_id,created_at,updated_at,payment_link_id').or(`email.ilike.%${query}%,reference.ilike.%${query}%`).order('created_at', { ascending: false }).limit(50),
  ])
  return NextResponse.json({ customers: users || [], payments: payments || [] })
}
