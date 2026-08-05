import { Signer } from '@aws-sdk/rds-signer'
import { awsCredentialsProvider } from '@vercel/functions/oidc'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const initializeDatabase = () => {
  const host = process.env.PGHOST
  const user = process.env.PGUSER

  if (host && user && process.env.AWS_REGION && process.env.AWS_ROLE_ARN) {
    const port = Number(process.env.PGPORT ?? 5432)
    const signer = new Signer({
      hostname: host,
      port,
      username: user,
      region: process.env.AWS_REGION,
      credentials: awsCredentialsProvider({
        roleArn: process.env.AWS_ROLE_ARN,
        clientConfig: { region: process.env.AWS_REGION },
      }),
    })

    const pool = new Pool({
      host,
      port,
      user,
      database: process.env.PGDATABASE,
      ssl: { rejectUnauthorized: false },
      password: () => signer.getAuthToken(),
    })
    const db = drizzle(pool, { schema })
    return { pool, db }
  }

  if (process.env.DATABASE_URL?.startsWith('postgres')) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL })
    const db = drizzle(pool, { schema })
    return { pool, db }
  }

  return { pool: null as any, db: null as any }
}

const { pool, db } = initializeDatabase()

export { pool, db }
