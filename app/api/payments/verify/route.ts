import { NextRequest, NextResponse } from 'next/server'
import { reconcilePaymentReference } from '@/lib/paystack-payment-status'
import { enforceRateLimit } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  const rateLimitResponse = await enforceRateLimit(request, 'verification')
  if (rateLimitResponse) return rateLimitResponse

  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get('reference')

    if (!reference) {
      return NextResponse.json({ error: 'Reference parameter is required' }, { status: 400 })
    }

    const result = await reconcilePaymentReference(reference)

    if (!result) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    const { payment, verification } = result
    if (!verification.status || !verification.data) {
      return NextResponse.json({ error: 'Failed to verify payment' }, { status: 502 })
    }

    return NextResponse.json({
      success: true,
      data: {
        reference,
        status: payment.status,
        amount: verification.data.amount / 100,
        email: verification.data.customer?.email,
      },
    })
  } catch (error: any) {
    console.error('[API] Verify payment error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment' },
      { status: 500 },
    )
  }
}
