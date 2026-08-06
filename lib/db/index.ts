import { createClient as createServiceRoleClient } from '@supabase/supabase-js'

// Initialize Supabase database connection
const initializeDatabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[v0] Supabase URL or Service Role Key not found')
    return {
      supabase: null as any,
    }
  }
  
  const supabase = createServiceRoleClient(supabaseUrl, serviceRoleKey)
  return { supabase }
}

const { supabase } = initializeDatabase()

export { supabase }
