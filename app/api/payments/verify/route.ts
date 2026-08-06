import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceRoleClient } from '@supabase/supabase-js'
import { verifyPaystackTransaction } from '@/lib/paystack'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get('reference')

    if (!reference) {
      return NextResponse.json({ error: 'Reference parameter is required' }, { status: 400 })
    }

    const supabase = createServiceRoleClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    // Get payment from database
    const { data: payments, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('reference_id', reference)
      .limit(1)

    if (fetchError || !payments || payments.length === 0) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    const paymentRecord = payments[0]

    // Verify with Paystack
    const verification = await verifyPaystackTransaction(reference)

    if (verification.status && verification.data) {
      const status = verification.data.status === 'success' ? 'completed' : 'failed'

      // Update payment status if it changed
      if (paymentRecord.status !== status) {
        await supabase
          .from('payments')
          .update({ status })
          .eq('reference_id', reference)
      }

      return NextResponse.json({
        success: true,
        data: {
          reference,
          status,
          amount: verification.data.amount / 100, // Convert from cents
          email: verification.data.customer?.email,
          amountUsd: paymentRecord.amount_usd,
          amountKes: paymentRecord.amount_kes,
        },
      })
    }

    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 })
  } catch (error: any) {
    console.error('[API] Verify payment error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment' },
      { status: 500 },
    )
  }
}
