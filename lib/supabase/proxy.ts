import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // This refreshes a user's auth token. A revoked or stale refresh token can
  // otherwise be sent on every request and make the entire app appear broken.
  const { error } = await supabase.auth.getUser()

  if (error?.code === 'refresh_token_not_found') {
    // The SSR client may not be able to clear the invalid token itself because
    // the refresh request already failed. Remove Supabase auth cookies from the
    // response so the next request starts a clean unauthenticated session.
    for (const cookie of request.cookies.getAll()) {
      if (
        cookie.name.startsWith('sb-') &&
        (cookie.name.includes('auth-token') || cookie.name.includes('code-verifier'))
      ) {
        supabaseResponse.cookies.delete(cookie.name)
      }
    }
  }

  return supabaseResponse
}
