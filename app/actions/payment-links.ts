'use server'

import { createClient as createServiceRoleClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

function getAdminDataClient() {
  return createServiceRoleClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}
import { writeAuditLog } from '@/lib/audit-log'

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/

export async function getPaymentLinks() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('payment_links')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error: any) {
    console.error('[Action] Get payment links error:', error)
    throw new Error('Failed to fetch payment links')
  }
}

export async function createPaymentLink(
  customPath: string,
  amountType: 'fixed' | 'flexible',
  amountUsd?: number,
  minimumAmount?: number,
  description?: string,
) {
  try {
    if (!customPath || customPath.trim().length === 0) {
      throw new Error('Custom path is required')
    }

    if (amountType === 'fixed' && (!amountUsd || amountUsd <= 0)) {
      throw new Error('Fixed amount must be greater than 0')
    }

    if (amountType === 'flexible' && (!minimumAmount || minimumAmount < 0.01)) {
      throw new Error('Minimum amount must be at least $0.01')
    }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) throw new Error('You must be signed in to create a payment link')
    
    // Check if path exists
    const normalizedPath = customPath.trim()
    const normalizedDescription = description?.trim() || null
    const linkName = normalizedDescription || normalizedPath

    // The existing schema requires amount_usd to be non-null. For flexible links,
    // store the minimum as the base amount while preserving the amount type.
    const baseAmountUsd = amountType === 'fixed' ? amountUsd : minimumAmount

    const { data: existing } = await supabase
      .from('payment_links')
      .select('*')
      .eq('custom_path', normalizedPath)
      .limit(1)

    if (existing && existing.length > 0) {
      throw new Error('This custom path already exists')
    }

    const { data: newLink, error } = await supabase
      .from('payment_links')
      .insert({
        user_id: user.id,
        name: linkName,
        custom_path: normalizedPath,
        amount_usd: baseAmountUsd,
        amount_type: amountType,
        minimum_amount_usd: amountType === 'flexible' ? minimumAmount : null,
        description: normalizedDescription,
        is_flexible_amount: amountType === 'flexible',
        is_active: true,
      })
      .select()

    if (error) throw error
    const created = newLink?.[0]
    if (created) await writeAuditLog({ actorId: user.id, actorEmail: user.email, action: 'payment_link.created', targetType: 'payment_link', targetId: String(created.id), targetLabel: created.custom_path, metadata: { amountType: created.amount_type, isActive: created.is_active } })
    return created
  } catch (error: any) {
    console.error('[Action] Create payment link error:', error)
    throw error
  }
}

export async function updatePaymentLink(
  id: number,
  updates: {
    description?: string
    is_active?: boolean
    amount_usd?: number
    minimum_amount_usd?: number
    theme_primary_color?: string | null
    theme_background_color?: string | null
    theme_text_color?: string | null
    theme_accent_color?: string | null
  },
) {
  try {
    for (const key of ['theme_primary_color', 'theme_background_color', 'theme_text_color', 'theme_accent_color'] as const) {
      const value = updates[key]
      if (value !== undefined && value !== null && !HEX_COLOR.test(value)) throw new Error('Theme colors must be six-digit hex values')
    }
    const supabase = await createClient()
    const { data: updated, error } = await supabase
      .from('payment_links')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) throw error
    const changed = updated?.[0]
    const { data: { user } } = await supabase.auth.getUser()
    if (changed) await writeAuditLog({ actorId: user?.id, actorEmail: user?.email, action: updates.is_active === false ? 'payment_link.disabled' : updates.is_active === true ? 'payment_link.activated' : 'payment_link.updated', targetType: 'payment_link', targetId: String(changed.id), targetLabel: changed.custom_path, metadata: { changedFields: Object.keys(updates), isActive: changed.is_active } })
    return changed
  } catch (error: any) {
    console.error('[Action] Update payment link error:', error)
    throw new Error('Failed to update payment link')
  }
}

export async function disablePaymentLink(id: number) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('payment_links')
      .update({ is_active: false })
      .eq('id', id)

    if (error) throw error
    const { data: { user } } = await supabase.auth.getUser()
    await writeAuditLog({ actorId: user?.id, actorEmail: user?.email, action: 'payment_link.disabled', targetType: 'payment_link', targetId: String(id), metadata: { isActive: false } })
    return { success: true }
  } catch (error: any) {
    console.error('[Action] Disable payment link error:', error)
    throw new Error('Failed to disable payment link')
  }
}

export async function activatePaymentLink(id: number) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('payment_links')
      .update({ is_active: true })
      .eq('id', id)

    if (error) throw error
    const { data: { user } } = await supabase.auth.getUser()
    await writeAuditLog({ actorId: user?.id, actorEmail: user?.email, action: 'payment_link.activated', targetType: 'payment_link', targetId: String(id), metadata: { isActive: true } })
    return { success: true }
  } catch (error: any) {
    console.error('[Action] Activate payment link error:', error)
    throw new Error('Failed to activate payment link')
  }
}

export async function deletePaymentLink(id: number) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('payment_links')
      .delete()
      .eq('id', id)

    if (error) throw error
    const { data: { user } } = await supabase.auth.getUser()
    await writeAuditLog({ actorId: user?.id, actorEmail: user?.email, action: 'payment_link.deleted', targetType: 'payment_link', targetId: String(id) })
    return { success: true }
  } catch (error: any) {
    console.error('[Action] Delete payment link error:', error)
    throw new Error('Failed to delete payment link')
  }
}

export async function getPaymentsByLinkId(linkId: number) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('payment_link_id', linkId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error: any) {
    console.error('[Action] Get payments error:', error)
    throw new Error('Failed to fetch payments')
  }
}

export async function getPaymentStats() {
  try {
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
    const { data: allPayments, error } = await adminSupabase
      .from('payments')
      .select('*')

    if (error) throw error

    const payments = allPayments || []
    const completedPayments = payments.filter((p: any) => p.status === 'completed')
    const failedPayments = payments.filter((p: any) => p.status === 'failed')
    const sumAmount = (rows: any[], field: 'amount_usd' | 'amount_kes') =>
      rows.reduce((sum: number, payment: any) => sum + parseFloat(payment[field]?.toString() || '0'), 0)

    const stats = {
      total: payments.length,
      completed: completedPayments.length,
      pending: payments.filter((p: any) => p.status === 'pending').length,
      failed: failedPayments.length,
      completedAmountUsd: sumAmount(completedPayments, 'amount_usd'),
      completedAmountKes: sumAmount(completedPayments, 'amount_kes'),
      failedAmountUsd: sumAmount(failedPayments, 'amount_usd'),
      failedAmountKes: sumAmount(failedPayments, 'amount_kes'),
    }

    return stats
  } catch (error: any) {
    console.error('[Action] Get payment stats error:', error)
    throw new Error('Failed to fetch payment stats')
  }
}
