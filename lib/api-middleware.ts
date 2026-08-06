import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { hashApiKey } from './api-keys'

export interface AuthenticatedRequest extends NextRequest {
  apiKey?: {
    id: string
    userId: string
    productSlug: string | null
    permissions: string[]
  }
  userId?: string
}

/**
 * Authenticates API request using API key from Authorization header
 * Format: Authorization: Bearer ap_live_xxxxxxxxxxxxxxxxxxxx
 */
export async function authenticateApiRequest(request: NextRequest): Promise<{
  success: boolean
  error?: string
  apiKey?: { id: string; userId: string; productSlug: string | null; permissions: string[] }
}> {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { success: false, error: 'Missing or invalid Authorization header' }
  }

  const apiKey = authHeader.slice(7) // Remove 'Bearer ' prefix

  if (!apiKey.startsWith('ap_live_')) {
    return { success: false, error: 'Invalid API key format' }
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const keyHash = hashApiKey(apiKey)

    const { data: keyData, error } = await supabase
      .from('api_keys')
      .select('id, user_id, product_slug, permissions, expires_at, is_active')
      .eq('key_hash', keyHash)
      .single()

    if (error || !keyData) {
      return { success: false, error: 'Invalid API key' }
    }

    if (!keyData.is_active) {
      return { success: false, error: 'API key is inactive' }
    }

    if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
      return { success: false, error: 'API key has expired' }
    }

    // Update last_used_at
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', keyData.id)

    return {
      success: true,
      apiKey: {
        id: keyData.id,
        userId: keyData.user_id,
        productSlug: keyData.product_slug,
        permissions: keyData.permissions || [],
      },
    }
  } catch (error) {
    console.error('API authentication error:', error)
    return { success: false, error: 'Authentication failed' }
  }
}

/**
 * Checks if API key has required permission
 */
export function hasPermission(
  permissions: string[],
  requiredPermission: string,
): boolean {
  return permissions.includes(requiredPermission) || permissions.includes('*')
}

/**
 * Creates a 401 unauthorized response
 */
export function unauthorized(message: string = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 })
}

/**
 * Creates a 403 forbidden response
 */
export function forbidden(message: string = 'Forbidden') {
  return NextResponse.json({ error: message }, { status: 403 })
}

/**
 * Creates a 400 bad request response
 */
export function badRequest(message: string = 'Bad request') {
  return NextResponse.json({ error: message }, { status: 400 })
}
