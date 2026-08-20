'use server'

import { NextRequest, NextResponse } from 'next/server'
import { enforceRateLimit } from '@/lib/rate-limit'
import { requestAuditContext, writeAuditLog } from '@/lib/audit-log'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!email || email.length > 320) return NextResponse.json({ error: 'A valid email is required' }, { status: 400 })

  const limited = await enforceRateLimit(request, 'verification', email)
  if (limited) return limited

  const result = body.result === 'success' ? 'success' : 'failure'
  await writeAuditLog({
    action: result === 'success' ? 'auth.sign_in_succeeded' : 'auth.sign_in_failed',
    targetType: 'auth',
    targetLabel: email,
    metadata: { reason: typeof body.reason === 'string' ? body.reason.slice(0, 120) : undefined },
    ...requestAuditContext(request),
  })
  return NextResponse.json({ ok: true })
}
