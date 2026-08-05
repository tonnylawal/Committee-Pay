import { count } from 'drizzle-orm'
import { db, pool } from '@/lib/db'
import { user } from '@/lib/db/schema'

let schemaPromise: Promise<void> | undefined

export async function ensureDatabaseSchema() {
  if (!pool) {
    throw new Error('Database is not configured')
  }

  schemaPromise ??= pool.query(`
    CREATE TABLE IF NOT EXISTS "user" (
      "id" text PRIMARY KEY,
      "email" text NOT NULL UNIQUE,
      "emailVerified" boolean NOT NULL DEFAULT false,
      "name" text,
      "image" text,
      "createdAt" timestamp NOT NULL DEFAULT now(),
      "updatedAt" timestamp NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS "session" (
      "id" text PRIMARY KEY,
      "userId" text NOT NULL,
      "expiresAt" timestamp NOT NULL,
      "createdAt" timestamp NOT NULL DEFAULT now(),
      "updatedAt" timestamp NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS "account" (
      "id" text PRIMARY KEY,
      "userId" text NOT NULL,
      "type" text NOT NULL,
      "provider" text NOT NULL,
      "providerAccountId" text NOT NULL,
      "password" text,
      "createdAt" timestamp NOT NULL DEFAULT now(),
      "updatedAt" timestamp NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS "verification" (
      "id" text PRIMARY KEY,
      "identifier" text NOT NULL,
      "value" text NOT NULL,
      "expiresAt" timestamp NOT NULL,
      "createdAt" timestamp DEFAULT now(),
      "updatedAt" timestamp DEFAULT now()
    );
  `).then(() => undefined)

  await schemaPromise
}

export async function getUserCount() {
  await ensureDatabaseSchema()

  if (!db) {
    throw new Error('Database is not configured')
  }

  if (!db) {
    throw new Error('Database is not configured')
  }

  const [result] = await db.select({ count: count() }).from(user)
  return result?.count ?? 0
}

export async function isInitialSignupAvailable() {
  try {
    return (await getUserCount()) === 0
  } catch (error) {
    const message = [
      error instanceof Error ? error.message : '',
      error instanceof Error && error.cause instanceof Error ? error.cause.message : '',
    ].join(' ')

    if (message.includes('relation "user" does not exist')) {
      return true
    }
    throw error
  }
}
