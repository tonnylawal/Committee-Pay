import { NextRequest, NextResponse } from 'next/server'
import { validatePaystackSignature, verifyPaystackTransaction } from '@/lib/paystack'
import { applyWebhookPaymentStatus } from '@/lib/paystack-payment-status'

export async function POST(request: NextRequest) {
  try {
    // Get the signature from headers
    const signature = request.headers.get('x-paystack-signature')
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    // Reject unexpectedly large webhook payloads before parsing.
    const contentLength = Number(request.headers.get('content-length') || 0)
    if (contentLength > 256 * 1024) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 })
    }

    // Get raw body for signature verification
    const body = await request.text()
    if (body.length > 256 * 1024) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 })
    }
    
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

    const reference = data?.reference
    const isChargeEvent = typeof eventType === 'string' && eventType.startsWith('charge.')

    if (reference && isChargeEvent) {
      let paystackStatus = data?.status || (eventType === 'charge.success' ? 'success' : 'failed')

      // The verify endpoint is authoritative and also covers statuses that do
      // not reliably arrive as a webhook, such as abandoned transactions.
      if (eventType === 'charge.success') {
        const verification = await verifyPaystackTransaction(reference)
        if (verification.status && verification.data) {
          paystackStatus = verification.data.status
        }
      }

      const status = await applyWebhookPaymentStatus(reference, paystackStatus)
      console.log('[Webhook] Payment status updated:', { reference, status, eventType })
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('[Webhook] Error processing webhook:', error)
    // Return a non-2xx response so Paystack can retry transient failures.
    return NextResponse.json({ received: false, error: 'Webhook processing failed' }, { status: 500 })
  }
}
