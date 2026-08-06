'use server'

import { db, pool } from '@/lib/db'
import { user as userTable, account as accountTable } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'

export async function resetAndCreateAdminUser() {
  try {
    const email = 'info@iicar.org'
    const password = '@IICAR1016!'
    const name = 'Admin'

    console.log('[v0] Starting admin user reset for:', email)

    // First, delete any existing user with this email
    const existingUser = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email))

    if (existingUser.length > 0) {
      const userId = existingUser[0].id
      
      // Delete all accounts associated with this user
      await db
        .delete(accountTable)
        .where(eq(accountTable.userId, userId))
      
      // Delete the user
      await db
        .delete(userTable)
        .where(eq(userTable.id, userId))
      
      console.log('[v0] Deleted existing user:', email)
    }

    // Hash password using bcryptjs (12 rounds)
    const passwordHash = await bcrypt.hash(password, 12)
    console.log('[v0] Password hashed')

    // Create user
    const userId = randomUUID()
    const now = new Date()
    
    await db.insert(userTable).values({
      id: userId,
      email,
      emailVerified: true,
      name,
      createdAt: now,
      updatedAt: now,
    })
    console.log('[v0] User created:', userId)

    // Create credential account using raw SQL to avoid Drizzle's strict typing
    // Better Auth expects accountId to be the email for credential provider
    const accountId = randomUUID()
    
    if (!pool) {
      throw new Error('Database pool is not available')
    }

    // Use raw SQL to insert with the fields needed
    // The actual database schema requires: id, userId, provider, providerAccountId, type, password
    await pool.query(
      `INSERT INTO account (id, "userId", provider, "providerAccountId", type, password, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [accountId, userId, 'credential', email, 'credential', passwordHash, now, now]
    )
    console.log('[v0] Account created:', accountId)

    return { success: true, message: 'Admin user created successfully' }
  } catch (error: any) {
    console.error('[v0] Error resetting admin user:', error)
    return { success: false, message: `Failed to create admin user: ${error?.message}` }
  }
}
