import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { payments } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { validatePaystackSignature, verifyPaystackTransaction } from '@/lib/paystack'

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

    // Handle successful charge
    if (event === 'charge.success') {
      const { reference, status } = eventData

      // Verify with Paystack
      const verification = await verifyPaystackTransaction(reference)

      if (verification.status && verification.data?.status === 'success') {
        // Update payment status
        await db.update(payments).set({ status: 'completed' }).where(eq(payments.referenceId, reference))

        console.log(`[Webhook] Payment completed: ${reference}`)
      }
    }

    // Return 200 to acknowledge receipt
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Webhook] Error processing webhook:', error)
    // Still return 200 to prevent Paystack from retrying
    return NextResponse.json({ success: true })
  }
}
