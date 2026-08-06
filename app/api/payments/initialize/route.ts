import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceRoleClient } from '@supabase/supabase-js'
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

    const supabase = createServiceRoleClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    // Get payment link
    const { data: linkData, error: linkError } = await supabase
      .from('payment_links')
      .select('*')
      .eq('custom_path', customPath)
      .limit(1)

    if (linkError || !linkData || linkData.length === 0) {
      return NextResponse.json({ error: 'Payment link not found' }, { status: 404 })
    }

    const paymentLink = linkData[0]

    if (!paymentLink.is_active) {
      return NextResponse.json({ error: 'Payment link is no longer active' }, { status: 400 })
    }

    // Handle flexible amount
    let amountUsd = paymentLink.amount_usd
    if (paymentLink.is_flexible_amount && body.amount) {
      amountUsd = parseFloat(body.amount)
      if (amountUsd < paymentLink.minimum_amount_usd) {
        return NextResponse.json(
          { error: `Amount must be at least $${paymentLink.minimum_amount_usd}` },
          { status: 400 },
        )
      }
    }

    // Convert USD to KES
    const amountKes = convertUsdToKes(amountUsd)

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
        originalAmountUsd: amountUsd,
        conversionRate: 134,
      },
    })

    if (!paystackResponse.status || !paystackResponse.data) {
      console.error('[API] Paystack initialization failed:', paystackResponse)
      return NextResponse.json({ error: 'Failed to initialize payment' }, { status: 500 })
    }

    // Record payment in database
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        link_id: paymentLink.id,
        reference_id: reference,
        amount_kes: amountKes,
        amount_usd: amountUsd,
        status: 'pending',
        customer_email: email,
      })
      .select()

    if (paymentError) throw paymentError

    return NextResponse.json({
      success: true,
      data: {
        authorizationUrl: paystackResponse.data.authorization_url,
        accessCode: paystackResponse.data.access_code,
        reference,
        amountUsd,
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
