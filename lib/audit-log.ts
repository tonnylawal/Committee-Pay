import 'server-only'

import { supabase as adminSupabase } from '@/lib/db'

const SENSITIVE_KEYS = /password|token|secret|key|authorization|cookie/i

type AuditInput = {
  actorId?: string | null
  actorEmail?: string | null
  action: string
  targetType: string
  targetId?: string | null
  targetLabel?: string | null
  metadata?: Record<string, unknown>
  ipAddress?: string | null
  userAgent?: string | null
}

function safeMetadata(metadata: Record<string, unknown> = {}) {
  return Object.fromEntries(Object.entries(metadata).filter(([key]) => !SENSITIVE_KEYS.test(key)))
}

export async function writeAuditLog(input: AuditInput) {
  const { error } = await adminSupabase.from('admin_audit_logs').insert({
    actor_id: input.actorId || null,
    actor_email: input.actorEmail || null,
    action: input.action,
    target_type: input.targetType,
    target_id: input.targetId || null,
    target_label: input.targetLabel || null,
    metadata: safeMetadata(input.metadata),
    ip_address: input.ipAddress || null,
    user_agent: input.userAgent || null,
  })

  if (error) {
    console.error('[v0] Failed to write audit log:', error.message)
  }
}

export function requestAuditContext(request: Request) {
  return {
    ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip'),
    userAgent: request.headers.get('user-agent'),
  }
}
