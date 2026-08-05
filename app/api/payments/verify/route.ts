import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { payments } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { verifyPaystackTransaction } from '@/lib/paystack'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get('reference')

    if (!reference) {
      return NextResponse.json({ error: 'Reference parameter is required' }, { status: 400 })
    }

    // Get payment from database
    const payment = await db.select().from(payments).where(eq(payments.referenceId, reference)).limit(1)

    if (payment.length === 0) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    const paymentRecord = payment[0]

    // Verify with Paystack
    const verification = await verifyPaystackTransaction(reference)

    if (verification.status && verification.data) {
      const status = verification.data.status === 'success' ? 'completed' : 'failed'

      // Update payment status if it changed
      if (paymentRecord.status !== status) {
        await db.update(payments).set({ status }).where(eq(payments.referenceId, reference))
      }

      return NextResponse.json({
        success: true,
        data: {
          reference,
          status,
          amount: verification.data.amount / 100, // Convert from cents
          email: verification.data.customer?.email,
          amountUsd: paymentRecord.amountUsd,
          amountKes: paymentRecord.amountKes,
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
