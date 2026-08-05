import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { payments, paymentLinks } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'
import { convertUsdToKes, initializePaystackTransaction } from '@/lib/paystack'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customPath, email } = body

    // Validation
    if (!customPath || !email) {
      return NextResponse.json({ error: 'Missing required fields: customPath, email' }, { status: 400 })
    }

    // Get payment link
    const link = await db
      .select()
      .from(paymentLinks)
      .where(eq(paymentLinks.customPath, customPath))
      .limit(1)

    if (link.length === 0) {
      return NextResponse.json({ error: 'Payment link not found' }, { status: 404 })
    }

    const paymentLink = link[0]

    if (!paymentLink.isActive) {
      return NextResponse.json({ error: 'Payment link is no longer active' }, { status: 400 })
    }

    // Convert USD to KES silently
    const amountKes = convertUsdToKes(parseFloat(paymentLink.amountUsd.toString()))

    // Create unique reference
    const reference = `${customPath}-${uuidv4().substring(0, 8)}`

    // Initialize Paystack transaction
    const paystackResponse = await initializePaystackTransaction({
      email,
      amount: Math.round(amountKes * 100), // Paystack expects amount in cents
      reference,
      metadata: {
        customPath,
        linkId: paymentLink.id,
        originalAmountUsd: parseFloat(paymentLink.amountUsd.toString()),
        conversionRate: 134,
      },
    })

    if (!paystackResponse.status || !paystackResponse.data) {
      console.error('[API] Paystack initialization failed:', paystackResponse)
      return NextResponse.json({ error: 'Failed to initialize payment' }, { status: 500 })
    }

    // Record payment in database
    const payment = await db
      .insert(payments)
      .values({
        linkId: paymentLink.id,
        referenceId: reference,
        amountKes,
        amountUsd: parseFloat(paymentLink.amountUsd.toString()),
        status: 'pending',
        customerEmail: email,
      })
      .returning()

    return NextResponse.json({
      success: true,
      data: {
        authorizationUrl: paystackResponse.data.authorization_url,
        accessCode: paystackResponse.data.access_code,
        reference,
        amountUsd: parseFloat(paymentLink.amountUsd.toString()),
        amountKes,
      },
    })
  } catch (error: any) {
    console.error('[API] Initialize payment error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to initialize payment' },
      { status: 500 },
    )
  }
}
