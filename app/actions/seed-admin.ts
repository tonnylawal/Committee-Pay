'use server'

import { db } from '@/lib/db'
import { user as userTable, account as accountTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'

function generateId(): string {
  return randomUUID()
}

export async function seedAdminUser() {
  try {
    const email = 'info@iicar.org'
    const password = '@IICAR1016!'

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email))

    if (existingUser.length > 0) {
      return { success: false, message: 'Admin user already exists' }
    }

    // Hash the password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create the user
    const userId = generateId()
    await db.insert(userTable).values({
      id: userId,
      email,
      emailVerified: true,
      name: 'Admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Create the account with hashed password
    await db.insert(accountTable).values({
      id: generateId(),
      userId,
      type: 'email',
      provider: 'credential',
      providerAccountId: email,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return { success: true, message: 'Admin user created successfully' }
  } catch (error) {
    console.error('Error seeding admin user:', error)
    return { success: false, message: 'Failed to create admin user' }
  }
}
