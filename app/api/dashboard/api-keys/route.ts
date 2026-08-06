import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { generateApiKey } from '@/lib/api-keys'

export async function GET(request: NextRequest) {
  try {
    const supabaseAuth = await createServerClient()
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching API keys:', error)
      return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabaseAuth = await createServerClient()
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, product_slug, rate_limit_per_hour } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    // Generate API key
    const { key: fullKey, preview, hash } = generateApiKey()
    console.log('[v0] Generated API key:', {
      preview,
      format: `ap_live_[${preview.split('...')[0].length}...${preview.split('...')[1].length}]`,
      userId: user.id,
      name,
    })

    // Store hashed key in database
    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        user_id: user.id,
        name,
        key_hash: hash,
        key_preview: preview,
        product_slug: product_slug || null,
        rate_limit_per_hour: rate_limit_per_hour || 1000,
        permissions: ['read:payment_links', 'create:payment_links', 'update:payment_links', 'delete:payment_links', 'read:payments', 'webhook:register'],
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error('[v0] Error creating API key in database:', {
        error: error.message,
        details: error.details,
        code: error.code,
      })
      return NextResponse.json({ error: 'Failed to create API key', details: error.message }, { status: 500 })
    }

    console.log('[v0] API key successfully created and stored:', {
      id: data.id,
      name: data.name,
      preview: data.key_preview,
    })

    // Return full key only once
    return NextResponse.json(
      {
        id: data.id,
        name: data.name,
        key_preview: data.key_preview,
        full_key: fullKey,
        product_slug: data.product_slug,
        created_at: data.created_at,
        message: 'API key created successfully. Save this key - you won\'t see it again!',
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
