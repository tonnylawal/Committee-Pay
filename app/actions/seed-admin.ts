'use server'

import { db } from '@/lib/db'
import { user as userTable, account as accountTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'

export async function seedAdminUser() {
  try {
    const email = 'info@iicar.org'
    const password = '@IICAR1016!'  // Admin password as specified
    const name = 'Admin'

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email))

    if (existingUser.length > 0) {
      return { success: false, message: 'Admin user already exists' }
    }

    // Hash the password using bcrypt (which Better Auth uses internally)
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate IDs
    const userId = randomUUID()
    const accountId = randomUUID()

    // Create the user directly in the database
    await db.insert(userTable).values({
      id: userId,
      email,
      emailVerified: true,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Create the account with hashed password using Better Auth's expected format
    await db.insert(accountTable).values({
      id: accountId,
      userId,
      type: 'email',
      provider: 'credential',
      providerAccountId: email,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return { success: true, message: 'Admin user created successfully' }
  } catch (error: any) {
    console.error('Error seeding admin user:', error)
    if (error?.message?.includes('already exists') || error?.message?.includes('duplicate')) {
      return { success: false, message: 'Admin user already exists' }
    }
    return { success: false, message: 'Failed to create admin user: ' + error?.message }
  }
}
