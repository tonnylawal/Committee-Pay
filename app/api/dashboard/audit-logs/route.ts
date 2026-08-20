import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabase as adminSupabase } from '@/lib/db'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await adminSupabase.from('users').select('role, is_active').eq('id', user.id).maybeSingle()
  return profile?.role === 'admin' && profile.is_active !== false ? user : null
}

export async function GET(request: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const params = request.nextUrl.searchParams
  const page = Math.max(Number(params.get('page') || 1), 1)
  const pageSize = Math.min(Math.max(Number(params.get('pageSize') || 25), 1), 100)
  const search = params.get('search')?.trim()
  const action = params.get('action')?.trim()
  const targetType = params.get('targetType')?.trim()
  let query = adminSupabase.from('admin_audit_logs').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range((page - 1) * pageSize, page * pageSize - 1)
  if (search) query = query.or(`actor_email.ilike.%${search}%,target_label.ilike.%${search}%,action.ilike.%${search}%`)
  if (action) query = query.eq('action', action)
  if (targetType) query = query.eq('target_type', targetType)
  const { data, count, error } = await query
  if (error) return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 })
  return NextResponse.json({ logs: data || [], total: count || 0, page, pageSize })
}
