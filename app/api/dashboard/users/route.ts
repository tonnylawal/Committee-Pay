import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabase as adminSupabase } from '@/lib/db'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Check if user is admin
    const { data: adminUser } = await adminSupabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (adminUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Fetch all users
    const { data: users, error } = await adminSupabase
      .from('users')
      .select('id, email, full_name, role, is_active, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[v0] Error fetching users:', error)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    return NextResponse.json(users)
  } catch (error: any) {
    console.error('[v0] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Check if user is admin
    const { data: adminUser } = await adminSupabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (adminUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { email, full_name, role } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (!['admin', 'manager', 'viewer'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Create auth user with a temporary password
    const tempPassword = Math.random().toString(36).slice(-12)

    const { data: authUser, error: authError } = await adminSupabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    })

    if (authError) {
      console.error('[v0] Error creating auth user:', authError)
      return NextResponse.json({ error: 'Failed to create user: ' + authError.message }, { status: 500 })
    }

    // Insert user record in database
    const { data: dbUser, error: dbError } = await adminSupabase
      .from('users')
      .insert({
        id: authUser.user.id,
        email,
        full_name: full_name || email.split('@')[0],
        role,
        is_active: true,
      })
      .select()
      .single()

    if (dbError) {
      console.error('[v0] Error creating database user:', dbError)
      // Clean up auth user if database insert fails
      await adminSupabase.auth.admin.deleteUser(authUser.user.id)
      return NextResponse.json({ error: 'Failed to create user in database' }, { status: 500 })
    }

    console.log('[v0] User created successfully:', {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
    })

    return NextResponse.json(
      {
        ...dbUser,
        message: `User ${email} created successfully. They can sign in with this email and will need to set their password.`,
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error('[v0] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
