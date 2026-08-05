import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { pool, db } from './db'
import * as schema from './db/schema'

const getOrigin = () => {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  if (process.env.V0_RUNTIME_URL) return process.env.V0_RUNTIME_URL
  return 'http://localhost:3000'
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: getOrigin(),
  basePath: '/api/auth',
  trustedOrigins: process.env.NODE_ENV === 'development' 
    ? ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8000', 'http://127.0.0.1:3000']
    : [
        getOrigin(),
        ...(process.env.VERCEL_PROJECT_PRODUCTION_URL ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`] : []),
        ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
        ...(process.env.V0_RUNTIME_URL ? [process.env.V0_RUNTIME_URL] : []),
      ],
  advanced: {
    defaultCookieAttributes: {
      sameSite: process.env.NODE_ENV === 'development' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'development' ? true : true,
    },
    disableCsrfCheck: process.env.NODE_ENV === 'development',
  },
  emailAndPassword: {
    enabled: true,
  },
})
