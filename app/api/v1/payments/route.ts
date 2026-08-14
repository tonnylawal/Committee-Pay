import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { authenticateApiRequest, hasPermission, unauthorized, forbidden } from '@/lib/api-middleware'
import { enforceRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const authResult = await authenticateApiRequest(request)
  const rateLimitResponse = await enforceRateLimit(request, 'api', authResult.apiKey?.id)
  if (rateLimitResponse) return rateLimitResponse
  if (!authResult.success) return unauthorized(authResult.error)
  const { apiKey } = authResult
  if (!apiKey || !hasPermission(apiKey.permissions, 'create:payments')) {
    return forbidden('Insufficient permissions to create payments')
  }

  try {
    const body = await request.json()
    const { custom_path: customPath, email, amount_usd: amountUsd } = body
    const amount = Number(amountUsd)
    if (!customPath || !email || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'custom_path, email, and a positive amount_usd are required' }, { status: 400 })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const { data: link, error: linkError } = await supabase
      .from('payment_links')
      .select('id, custom_path, is_active, amount_type, amount_usd, minimum_amount_usd, api_key_id')
      .eq('custom_path', customPath)
      .eq('api_key_id', apiKey.id)
      .maybeSingle()

    if (linkError || !link || !link.is_active) {
      return NextResponse.json({ error: 'Payment link not found or inactive' }, { status: 404 })
    }

    const amountType = link.amount_type || 'fixed'
    if (amountType === 'fixed' && Number(link.amount_usd) !== amount) {
      return NextResponse.json({ error: 'amount_usd must match the fixed payment amount' }, { status: 400 })
    }
    if (amountType === 'flexible' && amount < Number(link.minimum_amount_usd || 20)) {
      return NextResponse.json({ error: `amount_usd must be at least ${link.minimum_amount_usd || 20}` }, { status: 400 })
    }

    const { v4: uuidv4 } = await import('uuid')
    const { convertUsdToKes, initializePaystackTransaction } = await import('@/lib/paystack')
    const reference = `${customPath}-${uuidv4().slice(0, 8)}`
    const amountKes = convertUsdToKes(amount)
    const origin = new URL(request.url).origin
    const paystack = await initializePaystackTransaction({
      email,
      amount: Math.round(amountKes * 100),
      reference,
      callback_url: `${origin}/pay/${customPath}?reference=${reference}`,
      metadata: { customPath, linkId: link.id, originalAmountUsd: amount },
    })
    if (!paystack.status || !paystack.data) {
      return NextResponse.json({ error: 'Failed to initialize payment' }, { status: 502 })
    }

    const { error: insertError } = await supabase.from('payments').insert({
      link_id: link.id,
      reference_id: reference,
      amount_kes: amountKes,
      amount_usd: amount,
      status: 'pending',
      customer_email: email,
    })
    if (insertError) console.error('[API] Failed to record payment:', insertError)

    return NextResponse.json({
      data: {
        reference,
        access_code: paystack.data.access_code,
        authorization_url: paystack.data.authorization_url,
        public_key: process.env.PAYSTACK_PUBLIC_KEY,
        amount_usd: amount,
        amount_kes: amountKes,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('[API] Inline payment initialization error:', error)
    return NextResponse.json({ error: 'Failed to initialize payment' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const rateLimitResponse = await enforceRateLimit(request, 'api')
  if (rateLimitResponse) return rateLimitResponse

  // Authenticate API key
  const authResult = await authenticateApiRequest(request)
  if (!authResult.success) {
    return unauthorized(authResult.error)
  }

  const { apiKey } = authResult
  if (!apiKey || !hasPermission(apiKey.permissions, 'read:payments')) {
    return forbidden('Insufficient permissions to read payments')
  }

  try {
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const productSlug = url.searchParams.get('product_slug')
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100)
    const offset = parseInt(url.searchParams.get('offset') || '0')

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    let query = supabase
      .from('payments')
      .select(
        `
        *,
        payment_links:payment_link_id(id, custom_path, product_slug)
      `,
        { count: 'exact' },
      )
      .eq('payment_links.api_key_id', apiKey.id)

    if (status) {
      query = query.eq('status', status)
    }

    if (productSlug) {
      query = query.eq('payment_links.product_slug', productSlug)
    }

    const { data, error, count } = await query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching payments:', error)
      return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
    }

    return NextResponse.json({
      data: data || [],
      pagination: {
        limit,
        offset,
        total: count || 0,
      },
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
