import 'server-only'

import { createClient as createServiceRoleClient } from '@supabase/supabase-js'
import { verifyPaystackTransaction, type VerifyTransactionResponse } from '@/lib/paystack'

export type PaymentStatus = 'pending' | 'completed' | 'failed'

type PaymentRecord = {
  id: number
  reference_id: string
  status: PaymentStatus
}

function getServiceRoleClient() {
  return createServiceRoleClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export function normalizePaystackStatus(status?: string | null): PaymentStatus {
  switch (status?.toLowerCase()) {
    case 'success':
      return 'completed'
    case 'failed':
    case 'abandoned':
    case 'reversed':
    case 'cancelled':
    case 'canceled':
      return 'failed'
    default:
      return 'pending'
  }
}

async function persistVerifiedStatus(
  supabase: ReturnType<typeof getServiceRoleClient>,
  payment: PaymentRecord,
  verification: VerifyTransactionResponse,
) {
  if (!verification.status || !verification.data) {
    return payment.status
  }

  const status = normalizePaystackStatus(verification.data.status)
  if (status === payment.status) {
    return status
  }

  const { error } = await supabase
    .from('payments')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', payment.id)

  if (error) {
    throw new Error(`Failed to update payment ${payment.reference_id}: ${error.message}`)
  }

  console.log('[v0] Reconciled payment status:', {
    reference: payment.reference_id,
    previousStatus: payment.status,
    status,
    paystackStatus: verification.data.status,
  })

  return status
}

export async function reconcilePaymentReference(reference: string) {
  const supabase = getServiceRoleClient()
  const { data: payment, error: fetchError } = await supabase
    .from('payments')
    .select('id, reference_id, status')
    .eq('reference_id', reference)
    .maybeSingle()

  if (fetchError) throw fetchError
  if (!payment) return null

  const verification = await verifyPaystackTransaction(reference)
  const status = await persistVerifiedStatus(supabase, payment, verification)

  return { payment: { ...payment, status }, verification }
}

export async function reconcilePendingPayments(limit = 25) {
  const supabase = getServiceRoleClient()
  const { data: payments, error } = await supabase
    .from('payments')
    .select('id, reference_id, status')
    .eq('status', 'pending')
    .not('reference_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error

  const results = await Promise.allSettled(
    (payments || []).map(async (payment) => {
      const verification = await verifyPaystackTransaction(payment.reference_id)
      return persistVerifiedStatus(supabase, payment, verification)
    }),
  )

  const failures = results.filter((result) => result.status === 'rejected')
  if (failures.length > 0) {
    console.warn('[v0] Some pending payments could not be reconciled:', failures.length)
  }

  return { checked: results.length, updated: results.filter((result) => result.status === 'fulfilled').length }
}

export async function applyWebhookPaymentStatus(reference: string, paystackStatus?: string | null) {
  const supabase = getServiceRoleClient()
  const status = normalizePaystackStatus(paystackStatus)
  const { data: payment, error: fetchError } = await supabase
    .from('payments')
    .select('id, reference_id, status')
    .eq('reference_id', reference)
    .maybeSingle()

  if (fetchError) throw fetchError
  if (!payment) return null

  // Paystack retries and out-of-order events are common. Never let a later
  // pending/failed event move a completed payment backwards.
  if (payment.status === 'completed' || payment.status === status) return payment.status

  const { error } = await supabase
    .from('payments')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', payment.id)
    .neq('status', 'completed')

  if (error) throw error
  return status
}
