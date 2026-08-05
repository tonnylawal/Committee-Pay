import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

// Initialize database connection only when DATABASE_URL is available
const initializeDatabase = () => {
  if (!process.env.DATABASE_URL) {
    // Return dummy objects that will throw if actually used
    return {
      pool: null as any,
      db: null as any,
    }
  }
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const db = drizzle(pool, { schema })
  return { pool, db }
}

const { pool, db } = initializeDatabase()

export { pool, db }
