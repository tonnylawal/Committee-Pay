import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { paymentLinks } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amountUsd, description, customPath } = body

    // Validation
    if (!amountUsd || amountUsd <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    if (!customPath || customPath.trim().length === 0) {
      return NextResponse.json({ error: 'Custom path is required' }, { status: 400 })
    }

    // Check if custom path already exists
    const existingLink = await db.select().from(paymentLinks).where(eq(paymentLinks.customPath, customPath)).limit(1)

    if (existingLink.length > 0) {
      return NextResponse.json({ error: 'Custom path already exists' }, { status: 400 })
    }

    // Create payment link
    const newLink = await db
      .insert(paymentLinks)
      .values({
        customPath,
        amountUsd: parseFloat(amountUsd),
        description: description || null,
      })
      .returning()

    return NextResponse.json({
      success: true,
      data: newLink[0],
      link: `/pay/${customPath}`,
    })
  } catch (error: any) {
    console.error('[API] Create payment link error:', error)
    return NextResponse.json({ error: 'Failed to create payment link' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const links = await db.select().from(paymentLinks).where(eq(paymentLinks.isActive, true))

    return NextResponse.json({
      success: true,
      data: links,
    })
  } catch (error: any) {
    console.error('[API] Fetch payment links error:', error)
    return NextResponse.json({ error: 'Failed to fetch payment links' }, { status: 500 })
  }
}
