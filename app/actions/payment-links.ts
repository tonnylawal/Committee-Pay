'use server'

import { db } from '@/lib/db'
import { paymentLinks, payments } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function getPaymentLinks() {
  try {
    return await db.select().from(paymentLinks).orderBy(desc(paymentLinks.createdAt))
  } catch (error: any) {
    console.error('[Action] Get payment links error:', error)
    throw new Error('Failed to fetch payment links')
  }
}

export async function createPaymentLink(customPath: string, amountUsd: number, description?: string) {
  try {
    if (!customPath || customPath.trim().length === 0) {
      throw new Error('Custom path is required')
    }

    if (amountUsd <= 0) {
      throw new Error('Amount must be greater than 0')
    }

    // Check if path exists
    const existing = await db.select().from(paymentLinks).where(eq(paymentLinks.customPath, customPath)).limit(1)

    if (existing.length > 0) {
      throw new Error('This custom path already exists')
    }

    const newLink = await db
      .insert(paymentLinks)
      .values({
        customPath,
        amountUsd,
        description: description || null,
      })
      .returning()

    return newLink[0]
  } catch (error: any) {
    console.error('[Action] Create payment link error:', error)
    throw error
  }
}

export async function updatePaymentLink(
  id: number,
  updates: { description?: string; isActive?: boolean; amountUsd?: number },
) {
  try {
    const updated = await db.update(paymentLinks).set(updates).where(eq(paymentLinks.id, id)).returning()

    return updated[0]
  } catch (error: any) {
    console.error('[Action] Update payment link error:', error)
    throw new Error('Failed to update payment link')
  }
}

export async function deletePaymentLink(id: number) {
  try {
    await db.update(paymentLinks).set({ isActive: false }).where(eq(paymentLinks.id, id))

    return { success: true }
  } catch (error: any) {
    console.error('[Action] Delete payment link error:', error)
    throw new Error('Failed to delete payment link')
  }
}

export async function getPaymentsByLinkId(linkId: number) {
  try {
    return await db.select().from(payments).where(eq(payments.linkId, linkId)).orderBy(desc(payments.createdAt))
  } catch (error: any) {
    console.error('[Action] Get payments error:', error)
    throw new Error('Failed to fetch payments')
  }
}

export async function getPaymentStats() {
  try {
    const allPayments = await db.select().from(payments)

    const stats = {
      total: allPayments.length,
      completed: allPayments.filter((p) => p.status === 'completed').length,
      pending: allPayments.filter((p) => p.status === 'pending').length,
      failed: allPayments.filter((p) => p.status === 'failed').length,
      totalAmountUsd: allPayments.reduce((sum, p) => sum + parseFloat(p.amountUsd.toString()), 0),
      totalAmountKes: allPayments.reduce((sum, p) => sum + parseFloat(p.amountKes.toString()), 0),
    }

    return stats
  } catch (error: any) {
    console.error('[Action] Get payment stats error:', error)
    throw new Error('Failed to fetch payment stats')
  }
}
