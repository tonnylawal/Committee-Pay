import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { authenticateApiRequest, hasPermission, unauthorized, forbidden } from '@/lib/api-middleware'

export async function GET(request: NextRequest) {
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
