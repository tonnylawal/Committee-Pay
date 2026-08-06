import { createClient } from '@/lib/supabase/server'

// Get the current user session
export async function getSession() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('[v0] Error getting session:', error)
    return null
  }
  
  return data.session
}

// Get the current user
export async function getCurrentUser() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('[v0] Error getting user:', error)
    return null
  }
  
  return data.user
}

// Sign in with email and password
export async function signInWithPassword(email: string, password: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  return { data, error }
}

// Sign up with email and password
export async function signUpWithPassword(
  email: string,
  password: string,
  name?: string
) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo:
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
      data: {
        name: name || email,
      },
    },
  })
  
  return { data, error }
}

// Sign out
export async function signOut() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  
  return { error }
}
