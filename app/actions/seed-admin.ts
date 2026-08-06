'use server'

import { createClient as createServiceRoleClient } from '@supabase/supabase-js'

export async function resetAndCreateAdminUser() {
  try {
    const email = 'info@iicar.org'
    const password = '@IICAR1016!'
    const name = 'Admin'

    console.log('[v0] Starting admin user reset for:', email)

    // Use service role key for admin operations
    const supabase = createServiceRoleClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Sign up the admin user using Supabase Auth
    // This will create the user with proper authentication
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        name,
      },
      email_confirm: true,
    })

    if (error) {
      // If user already exists, try to delete and recreate
      if (error.message.includes('already exists')) {
        console.log('[v0] User already exists, attempting to update')
        
        // Get the existing user
        const { data: existingUsers, error: fetchError } = await supabase.auth.admin.listUsers()
        
        if (!fetchError && existingUsers) {
          const existingUser = existingUsers.users.find(u => u.email === email)
          
          if (existingUser) {
            // Delete the existing user
            await supabase.auth.admin.deleteUser(existingUser.id)
            console.log('[v0] Deleted existing user')
            
            // Recreate the user
            const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
              email,
              password,
              user_metadata: {
                name,
              },
              email_confirm: true,
            })
            
            if (createError) throw createError
            console.log('[v0] Admin user recreated successfully')
            return { success: true, message: 'Admin user created successfully' }
          }
        }
      }
      throw error
    }

    console.log('[v0] Admin user created successfully:', data.user?.id)
    return { success: true, message: 'Admin user created successfully' }
  } catch (error: any) {
    console.error('[v0] Error resetting admin user:', error)
    return { success: false, message: `Failed to create admin user: ${error?.message}` }
  }
}
