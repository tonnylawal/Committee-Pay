import { createAuthClient } from 'better-auth/react'

// The auth client automatically infers the baseURL from window.location
// In development, this will be http://localhost:3000
// which matches our trustedOrigins configuration
export const authClient = createAuthClient({
  // Use the relative API path instead of absolute URL
  // This allows Better Auth to automatically use the current origin
})

export const { useSession, signIn, signUp, signOut } = authClient
