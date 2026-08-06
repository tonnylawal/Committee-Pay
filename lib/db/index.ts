import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

// Initialize Supabase database connection
const initializeDatabase = () => {
  // Use Supabase PostgreSQL URL with SSL
  const databaseUrl = process.env.SUPABASE_POSTGRES_URL || process.env.DATABASE_URL
  
  if (!databaseUrl) {
    console.error('[v0] No database URL found. Set SUPABASE_POSTGRES_URL or DATABASE_URL')
    return {
      pool: null as any,
      db: null as any,
    }
  }
  
  const pool = new Pool({ 
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  })
  const db = drizzle(pool, { schema })
  return { pool, db }
}

const { pool, db } = initializeDatabase()

export { pool, db }
