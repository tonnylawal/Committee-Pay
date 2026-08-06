import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { authenticateApiRequest, hasPermission, unauthorized, forbidden, badRequest } from '@/lib/api-middleware'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  // Authenticate API key
  const authResult = await authenticateApiRequest(request)
  if (!authResult.success) {
    return unauthorized(authResult.error)
  }

  const { apiKey } = authResult
  if (!apiKey || !hasPermission(apiKey.permissions, 'create:payment_links')) {
    return forbidden('Insufficient permissions to create payment links')
  }

  try {
    const body = await request.json()
    const { amount_usd, amount_type = 'fixed', description, product_slug, expires_at, max_payments } = body

    // Validation
    if (!amount_usd || amount_usd <= 0) {
      return badRequest('amount_usd is required and must be greater than 0')
    }

    if (!['fixed', 'flexible'].includes(amount_type)) {
      return badRequest('amount_type must be "fixed" or "flexible"')
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    // Generate custom path
    const customPath = `${product_slug || 'link'}-${nanoid(8)}`

    // Create payment link
    const { data, error } = await supabase
      .from('payment_links')
      .insert({
        user_id: apiKey.userId,
        custom_path: customPath,
        amount_usd,
        amount_type,
        description: description || null,
        api_key_id: apiKey.id,
        product_slug: product_slug || null,
        expires_at: expires_at || null,
        max_payments: max_payments || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating payment link:', error)
      return NextResponse.json({ error: 'Failed to create payment link' }, { status: 500 })
    }

    // Log to audit
    await supabase.from('api_key_audit_logs').insert({
      api_key_id: apiKey.id,
      action: 'create_payment_link',
      resource_type: 'payment_link',
      resource_id: data.id,
      status: 'success',
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent'),
    })

    return NextResponse.json(
      {
        id: data.id,
        custom_path: data.custom_path,
        amount_usd: data.amount_usd,
        amount_type: data.amount_type,
        description: data.description,
        payment_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://alghahim.pay'}/pay/${data.custom_path}`,
        created_at: data.created_at,
        expires_at: data.expires_at,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  // Authenticate API key
  const authResult = await authenticateApiRequest(request)
  if (!authResult.success) {
    return unauthorized(authResult.error)
  }

  const { apiKey } = authResult
  if (!apiKey || !hasPermission(apiKey.permissions, 'read:payment_links')) {
    return forbidden('Insufficient permissions to read payment links')
  }

  try {
    const url = new URL(request.url)
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100)
    const offset = parseInt(url.searchParams.get('offset') || '0')
    const productSlug = url.searchParams.get('product_slug')

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    let query = supabase
      .from('payment_links')
      .select('*', { count: 'exact' })
      .eq('user_id', apiKey.userId)
      .eq('api_key_id', apiKey.id)

    if (productSlug) {
      query = query.eq('product_slug', productSlug)
    }

    const { data, error, count } = await query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching payment links:', error)
      return NextResponse.json({ error: 'Failed to fetch payment links' }, { status: 500 })
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
