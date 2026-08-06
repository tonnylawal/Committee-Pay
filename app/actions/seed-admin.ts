'use server'

import { createClient as createServiceRoleClient } from '@supabase/supabase-js'

export async function seedAdminUser() {
  try {
    const email = 'info@iicar.org'
    const password = '@IICAR1016!' // Admin password as specified
    const name = 'Admin'

    const supabase = createServiceRoleClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', email)
      .limit(1)

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError
    }

    if (existingUser && existingUser.length > 0) {
      return { success: false, message: 'Admin user already exists' }
    }

    // Create user via Supabase Auth API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        display_name: name,
      },
    })

    if (authError) {
      if (authError.message?.includes('already exists') || authError.message?.includes('duplicate')) {
        return { success: false, message: 'Admin user already exists' }
      }
      throw authError
    }

    return { success: true, message: 'Admin user created successfully', userId: authData?.user?.id }
  } catch (error: any) {
    console.error('Error seeding admin user:', error)
    if (error?.message?.includes('already exists') || error?.message?.includes('duplicate')) {
      return { success: false, message: 'Admin user already exists' }
    }
    return { success: false, message: 'Failed to create admin user: ' + error?.message }
  }
}
