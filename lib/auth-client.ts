import { createAuthClient } from 'better-auth/react'

// Create auth client with explicit base URL inference
// This ensures origin validation works correctly
export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : undefined,
})

export const { useSession, signIn, signUp, signOut } = authClient
