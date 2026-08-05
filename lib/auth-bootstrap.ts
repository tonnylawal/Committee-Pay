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
      "token" text NOT NULL UNIQUE,
      "expiresAt" timestamp NOT NULL,
      "ipAddress" text,
      "userAgent" text,
      "createdAt" timestamp NOT NULL DEFAULT now(),
      "updatedAt" timestamp NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS "account" (
      "id" text PRIMARY KEY,
      "userId" text NOT NULL,
      "accountId" text NOT NULL,
      "providerId" text NOT NULL,
      "accessToken" text,
      "refreshToken" text,
      "idToken" text,
      "accessTokenExpiresAt" timestamp,
      "refreshTokenExpiresAt" timestamp,
      "scope" text,
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
    ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "token" text;
    ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "ipAddress" text;
    ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "userAgent" text;
    ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "accountId" text;
    ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "providerId" text;
    ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "providerAccountId" text;
    ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "provider" text;
    ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "accessToken" text;
    ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "refreshToken" text;
    ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "idToken" text;
    ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "accessTokenExpiresAt" timestamp;
    ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "refreshTokenExpiresAt" timestamp;
    ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "scope" text;
    UPDATE "account" SET "accountId" = COALESCE("accountId", "providerAccountId") WHERE "accountId" IS NULL;
    UPDATE "account" SET "providerId" = COALESCE("providerId", "provider") WHERE "providerId" IS NULL;
    UPDATE "session" SET "token" = COALESCE("token", "id") WHERE "token" IS NULL;
  `).then(() => undefined)

  await schemaPromise
}

export async function getUserCount() {
  await ensureDatabaseSchema()

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
