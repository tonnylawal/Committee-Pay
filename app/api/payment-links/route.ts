import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceRoleClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amountUsd, description, customPath } = body

    // Validation
    if (!amountUsd || amountUsd <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    if (!customPath || customPath.trim().length === 0) {
      return NextResponse.json({ error: 'Custom path is required' }, { status: 400 })
    }

    const supabase = createServiceRoleClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    // Check if custom path already exists
    const { data: existing } = await supabase
      .from('payment_links')
      .select('*')
      .eq('custom_path', customPath)
      .limit(1)

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: 'Custom path already exists' }, { status: 400 })
    }

    // Create payment link
    const { data: newLink, error } = await supabase
      .from('payment_links')
      .insert({
        custom_path: customPath,
        amount_usd: parseFloat(amountUsd),
        description: description || null,
      })
      .select()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: newLink?.[0],
      link: `/pay/${customPath}`,
    })
  } catch (error: any) {
    console.error('[API] Create payment link error:', error)
    return NextResponse.json({ error: 'Failed to create payment link' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const { data: links, error } = await supabase
      .from('payment_links')
      .select('*')
      .eq('is_active', true)

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: links || [],
    })
  } catch (error: any) {
    console.error('[API] Fetch payment links error:', error)
    return NextResponse.json({ error: 'Failed to fetch payment links' }, { status: 500 })
  }
}
