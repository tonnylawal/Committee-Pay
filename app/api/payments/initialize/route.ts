import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceRoleClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'
import { convertUsdToKes, initializePaystackTransaction } from '@/lib/paystack'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customPath, email, amountUsd } = body

    // Validation
    if (!customPath || !email || !amountUsd) {
      return NextResponse.json({ error: 'Missing required fields: customPath, email, amountUsd' }, { status: 400 })
    }

    const amount = parseFloat(amountUsd)
    if (amount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 })
    }

    // Get Supabase client
    const supabase = createServiceRoleClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    // Get payment link
    const { data: links, error: linkError } = await supabase
      .from('payment_links')
      .select('*')
      .eq('custom_path', customPath)
      .limit(1)

    if (linkError || !links || links.length === 0) {
      return NextResponse.json({ error: 'Payment link not found' }, { status: 404 })
    }

    const paymentLink = links[0]

    if (!paymentLink.is_active) {
      return NextResponse.json({ error: 'Payment link is no longer active' }, { status: 400 })
    }

    // Convert USD to KES silently
    const amountKes = convertUsdToKes(amount)

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
    const { error: insertError } = await supabase
      .from('payments')
      .insert({
        link_id: paymentLink.id,
        reference_id: reference,
        amount_kes: amountKes,
        amount_usd: amount,
        status: 'pending',
        customer_email: email,
      })

    if (insertError) {
      console.error('[API] Failed to record payment:', insertError)
    }

    return NextResponse.json({
      success: true,
      data: {
        authorizationUrl: paystackResponse.data.authorization_url,
        accessCode: paystackResponse.data.access_code,
        reference,
        amountUsd: amount,
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
