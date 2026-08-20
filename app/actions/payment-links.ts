'use server'

import { createClient } from '@/lib/supabase/server'

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
        amount_type: amountType,
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
    return updated?.[0]
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
    const supabase = await createClient()
    const { data: allPayments, error } = await supabase
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
