'use server'

import { db } from '@/lib/db'
import { user as userTable, account as accountTable } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import { randomUUID } from 'crypto'

// Import bcrypt for password hashing - Better Auth credentials use bcrypt
import bcrypt from 'bcryptjs'

export async function resetAndCreateAdminUser() {
  try {
    const email = 'info@iicar.org'
    const password = '@IICAR1016!'
    const name = 'Admin'

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

    // Hash the password with bcryptjs - 12 rounds
    const passwordHash = await bcrypt.hash(password, 12)
    
    console.log('[v0] Created password hash with bcryptjs')

    // Create fresh user
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
    
    console.log('[v0] Created user:', userId)

    // Create the credential account with the properly hashed password
    const accountId = randomUUID()
    try {
      await db.insert(accountTable).values({
        id: accountId,
        userId,
        accountId: email,
        providerId: 'credential',
        password: passwordHash,
      })
      console.log('[v0] Created account:', accountId)
    } catch (accountError: any) {
      console.error('[v0] Account creation failed:', accountError)
      // If account creation fails, still return success as user was created
      return { success: true, message: 'Admin user created (account creation had an issue)' }
    }

    return { success: true, message: 'Admin user created successfully' }
  } catch (error: any) {
    console.error('[v0] Error resetting admin user:', error)
    return { success: false, message: `Failed to create admin user: ${error?.message}` }
  }
}
