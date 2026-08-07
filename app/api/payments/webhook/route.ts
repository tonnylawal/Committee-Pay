import { NextRequest, NextResponse } from 'next/server'
import { validatePaystackSignature, verifyPaystackTransaction } from '@/lib/paystack'
import { applyWebhookPaymentStatus } from '@/lib/paystack-payment-status'

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-paystack-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    // Get raw body for signature verification
    const body = await request.text()

    // Validate signature
    const isValid = validatePaystackSignature(signature, body)
    if (!isValid) {
      console.warn('[Webhook] Invalid Paystack signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const data = JSON.parse(body)
    const { event, data: eventData } = data

    const reference = eventData?.reference
    const isChargeEvent = typeof event === 'string' && event.startsWith('charge.')

    if (reference && isChargeEvent) {
      let paystackStatus = eventData?.status || (event === 'charge.success' ? 'success' : 'failed')

      if (event === 'charge.success') {
        const verification = await verifyPaystackTransaction(reference)
        if (verification.status && verification.data) {
          paystackStatus = verification.data.status
        }
      }

      const status = await applyWebhookPaymentStatus(reference, paystackStatus)
      console.log('[Webhook] Payment status updated:', { reference, status, event })
    }

    // Return 200 to acknowledge webhook
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Webhook] Error processing webhook:', error)
    // Still return 200 to prevent Paystack from retrying
    return NextResponse.json({ success: true })
  }
}
