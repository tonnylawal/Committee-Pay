import { createAuthClient } from 'better-auth/react'

// Create auth client - it automatically uses the current window origin
// This ensures origin validation works correctly in both development and production
export const authClient = createAuthClient()

export const { useSession, signIn, signUp, signOut } = authClient
