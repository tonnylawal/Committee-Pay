'use server'

import { createClient as createServiceRoleClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

function getAdminDataClient() {
  return createServiceRoleClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export type DashboardAnalytics = {
  rangeDays: number
  trend: Array<{ date: string; total: number; completed: number; failed: number; pending: number; revenueUsd: number; revenueKes: number }>
  status: Array<{ status: string; count: number }>
}

export async function getDashboardAnalytics(rangeDays = 30): Promise<DashboardAnalytics> {
  const days = Math.min(Math.max(Math.floor(rangeDays), 1), 365)
  const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()
  if (profileError) throw profileError
  if (profile?.role !== 'admin') throw new Error('Forbidden')

  const adminSupabase = getAdminDataClient()
  const { data, error } = await adminSupabase
    .from('payments')
    .select('status, amount_usd, amount_kes, created_at')
    .gte('created_at', start)
    .order('created_at', { ascending: true })

  if (error) throw new Error('Failed to fetch dashboard analytics')

  const byDate = new Map<string, DashboardAnalytics['trend'][number]>()
  const statusCounts = new Map<string, number>()
  for (const payment of data || []) {
    const date = new Date(payment.created_at).toISOString().slice(0, 10)
    const row = byDate.get(date) || { date, total: 0, completed: 0, failed: 0, pending: 0, revenueUsd: 0, revenueKes: 0 }
    row.total += 1
    if (payment.status === 'completed') {
      row.completed += 1
      row.revenueUsd += Number(payment.amount_usd || 0)
      row.revenueKes += Number(payment.amount_kes || 0)
    } else if (payment.status === 'failed') row.failed += 1
    else if (payment.status === 'pending') row.pending += 1
    byDate.set(date, row)
    statusCounts.set(payment.status, (statusCounts.get(payment.status) || 0) + 1)
  }

  return {
    rangeDays: days,
    trend: Array.from(byDate.values()),
    status: Array.from(statusCounts, ([status, count]) => ({ status, count })),
  }
}
