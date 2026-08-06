'use server'

import { db } from '@/lib/db'
import { user as userTable, account as accountTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'

// Import bcrypt for password hashing - Better Auth credentials use bcrypt
import bcrypt from 'bcryptjs'

export async function seedAdminUser() {
  try {
    const email = 'info@iicar.org'
    const password = '@IICAR1016!'
    const name = 'Admin'

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email))

    if (existingUser.length > 0) {
      return { success: false, message: 'Admin user already exists' }
    }

    // Use bcryptjs which is the standard Better Auth uses for password hashing
    // Hash with 12 rounds (Better Auth's default)
    const passwordHash = await bcrypt.hash(password, 12)

    // Create the user
    const userId = randomUUID()
    await db.insert(userTable).values({
      id: userId,
      email,
      emailVerified: true,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Create the credential account with the properly hashed password
    const accountId = randomUUID()
    await db.insert(accountTable).values({
      id: accountId,
      userId,
      accountId: email,
      providerId: 'credential',
      password: passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return { success: true, message: 'Admin user created successfully' }
  } catch (error: any) {
    console.error('[v0] Error seeding admin user:', error)
    if (error?.message?.includes('duplicate key') || error?.message?.includes('already exists')) {
      return { success: false, message: 'Admin user already exists' }
    }
    return { success: false, message: `Failed to create admin user: ${error?.message}` }
  }
}
