'use server'

import { createClient as createServiceRoleClient } from '@supabase/supabase-js'

function createSupabaseClient() {
  return createServiceRoleClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function getPaymentLinks() {
  try {
    const supabase = createSupabaseClient()
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
  amountUsd: number,
  description?: string,
  amountType?: string,
  minimumAmount?: number,
) {
  try {
    if (!customPath || customPath.trim().length === 0) {
      throw new Error('Custom path is required')
    }

    if (amountUsd <= 0 && amountType === 'fixed') {
      throw new Error('Amount must be greater than 0')
    }

    const supabase = createSupabaseClient()

    // Check if path exists
    const { data: existing } = await supabase
      .from('payment_links')
      .select('*')
      .eq('custom_path', customPath)
      .limit(1)

    if (existing && existing.length > 0) {
      throw new Error('This custom path already exists')
    }

    const { data: newLink, error } = await supabase
      .from('payment_links')
      .insert({
        custom_path: customPath,
        amount_usd: amountType === 'fixed' ? amountUsd : null,
        amount_type: amountType || 'fixed',
        minimum_amount_usd: amountType === 'flexible' ? minimumAmount : null,
        description: description || null,
        is_flexible_amount: amountType === 'flexible',
        is_active: true,
      })
      .select()

    if (error) throw error
    return newLink?.[0]
  } catch (error: any) {
    console.error('[Action] Create payment link error:', error)
    throw error
  }
}

export async function updatePaymentLink(
  id: number,
  updates: { description?: string; is_active?: boolean; amount_usd?: number },
) {
  try {
    const supabase = createSupabaseClient()

    const { data: updated, error } = await supabase
      .from('payment_links')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) throw error
    return updated?.[0]
  } catch (error: any) {
    console.error('[Action] Update payment link error:', error)
    throw new Error('Failed to update payment link')
  }
}

export async function disablePaymentLink(id: number) {
  try {
    const supabase = createSupabaseClient()

    const { error } = await supabase.from('payment_links').update({ is_active: false }).eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    console.error('[Action] Disable payment link error:', error)
    throw new Error('Failed to disable payment link')
  }
}

export async function activatePaymentLink(id: number) {
  try {
    const supabase = createSupabaseClient()

    const { error } = await supabase.from('payment_links').update({ is_active: true }).eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    console.error('[Action] Activate payment link error:', error)
    throw new Error('Failed to activate payment link')
  }
}

export async function deletePaymentLink(id: number) {
  try {
    const supabase = createSupabaseClient()

    const { error } = await supabase.from('payment_links').delete().eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    console.error('[Action] Delete payment link error:', error)
    throw new Error('Failed to delete payment link')
  }
}

export async function getPaymentsByLinkId(linkId: number) {
  try {
    const supabase = createSupabaseClient()

    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('link_id', linkId)
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
    const supabase = createSupabaseClient()

    const { data: allPayments, error } = await supabase.from('payments').select('*')

    if (error) throw error

    const payments = allPayments || []
    const stats = {
      total: payments.length,
      completed: payments.filter((p: any) => p.status === 'completed').length,
      pending: payments.filter((p: any) => p.status === 'pending').length,
      failed: payments.filter((p: any) => p.status === 'failed').length,
      totalAmountUsd: payments.reduce((sum: number, p: any) => sum + (parseFloat(p.amount_usd) || 0), 0),
      totalAmountKes: payments.reduce((sum: number, p: any) => sum + (parseFloat(p.amount_kes) || 0), 0),
    }

    return stats
  } catch (error: any) {
    console.error('[Action] Get payment stats error:', error)
    throw new Error('Failed to fetch payment stats')
  }
}
