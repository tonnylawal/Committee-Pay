import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getSetCookie().map((cookie) => {
              const [name, ...rest] = cookie.split('=')
              return { name, value: rest.join('=') }
            })
          },
          setAll(cookiesToSet) {
            const response = NextResponse.json({ success: true })
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
            return response
          },
        },
      },
    )

    const response = NextResponse.json({ success: true })

    await supabase.auth.signOut()

    return response
  } catch (error) {
    console.error('[API] Sign out error:', error)
    return NextResponse.json({ error: 'Failed to sign out' }, { status: 500 })
  }
}
