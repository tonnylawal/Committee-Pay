import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceRoleClient } from '@supabase/supabase-js'
import { validatePaystackSignature, verifyPaystackTransaction } from '@/lib/paystack'

export async function POST(request: NextRequest) {
  try {
    // Get the signature from headers
    const signature = request.headers.get('x-paystack-signature')
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    // Get raw body for signature verification
    const body = await request.text()
    
    // Validate signature
    try {
      const isValid = validatePaystackSignature(signature, body)
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    } catch (error) {
      console.error('[Webhook] Signature validation error:', error)
      return NextResponse.json({ error: 'Signature validation failed' }, { status: 401 })
    }

    // Parse the body
    const event = JSON.parse(body)
    const { event: eventType, data } = event

    console.log('[Webhook] Received event:', eventType, data?.reference)

    // Handle charge.success event
    if (eventType === 'charge.success') {
      const reference = data.reference
      const amount = data.amount / 100 // Convert from kobo to KES

      // Get Supabase client
      const supabase = createServiceRoleClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      )

      // Update payment status
      const { data: payments, error: fetchError } = await supabase
        .from('payments')
        .select('*')
        .eq('reference_id', reference)
        .limit(1)

      if (fetchError || !payments || payments.length === 0) {
        console.warn('[Webhook] Payment not found for reference:', reference)
        // Still return 200 to acknowledge receipt
        return NextResponse.json({ received: true })
      }

      const payment = payments[0]

      // Verify with Paystack to ensure authenticity
      try {
        const verification = await verifyPaystackTransaction(reference)
        
        if (verification.status && verification.data?.status === 'success') {
          // Update payment status to completed
          const { error: updateError } = await supabase
            .from('payments')
            .update({
              status: 'completed',
              transaction_id: verification.data.id.toString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', payment.id)

          if (updateError) {
            console.error('[Webhook] Failed to update payment:', updateError)
          } else {
            console.log('[Webhook] Payment marked as completed:', reference)
          }
        }
      } catch (error) {
        console.error('[Webhook] Verification failed:', error)
      }

      return NextResponse.json({ received: true })
    }

    // Handle charge.failed event
    if (eventType === 'charge.failed') {
      const reference = data.reference

      const supabase = createServiceRoleClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      )

      // Update payment status to failed
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('reference_id', reference)

      if (updateError) {
        console.error('[Webhook] Failed to update failed payment:', updateError)
      } else {
        console.log('[Webhook] Payment marked as failed:', reference)
      }

      return NextResponse.json({ received: true })
    }

    // Acknowledge all other events
    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('[Webhook] Error processing webhook:', error)
    // Return 200 to prevent Paystack from retrying
    return NextResponse.json({ received: true, error: error.message }, { status: 200 })
  }
}
