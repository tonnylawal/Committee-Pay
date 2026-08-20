import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabase as adminSupabase } from '@/lib/db'
import { requestAuditContext, writeAuditLog } from '@/lib/audit-log'

const PROTECTED_ADMIN_EMAIL = 'info@iicar.org'
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

  const { data: adminUser } = await adminSupabase.from('users').select('role, is_active').eq('id', user.id).maybeSingle()
  if (!adminUser || adminUser.role !== 'admin' || adminUser.is_active === false) {
    return { error: NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 }) }
  }
  return { user }
}

async function getTarget(userId: string) {
  const { data: target } = await adminSupabase.from('users').select('id, email, role, is_active').eq('id', userId).maybeSingle()
  return target
}

function isProtected(target: { email?: string | null }) {
  return target.email?.toLowerCase() === PROTECTED_ADMIN_EMAIL
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error
  const { userId } = await params
  const target = await getTarget(userId)
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const body = await request.json()
  const { role, is_active, email } = body
  if (isProtected(target) && (role !== undefined || is_active !== undefined || email !== undefined)) {
    return NextResponse.json({ error: 'The primary admin account cannot be modified.' }, { status: 403 })
  }
  if (role !== undefined && !['admin', 'manager', 'viewer'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }
  if (email !== undefined && (!EMAIL_PATTERN.test(email) || email.length > 254)) {
    return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 })
  }

  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (role !== undefined) updateData.role = role
  if (is_active !== undefined) updateData.is_active = Boolean(is_active)
  if (email !== undefined) updateData.email = email.toLowerCase().trim()

  if (email !== undefined) {
    const { error } = await adminSupabase.auth.admin.updateUserById(userId, { email: email.toLowerCase().trim() })
    if (error) return NextResponse.json({ error: 'Failed to update authentication email' }, { status: 400 })
  }
  const { data: updatedUser, error } = await adminSupabase.from('users').update(updateData).eq('id', userId).select().single()
  if (error) {
    console.error('[v0] Failed to update user role/profile:', error)
    return NextResponse.json({ error: error.message || 'Failed to update user' }, { status: 500 })
  }
  const context = requestAuditContext(request)
  await writeAuditLog({ actorId: auth.user.id, actorEmail: auth.user.email, action: role !== undefined ? 'user.role_updated' : email !== undefined ? 'user.email_updated' : 'user.profile_updated', targetType: 'user', targetId: userId, targetLabel: updatedUser.email, metadata: { ...(role !== undefined ? { oldRole: target.role, newRole: role } : {}), ...(email !== undefined ? { oldEmail: target.email, newEmail: updatedUser.email } : {}) }, ...context })
  return NextResponse.json(updatedUser)
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error
  const { userId } = await params
  const target = await getTarget(userId)
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  const body = await request.json()
  const action = body.action

  if (action === 'ban' || action === 'unban') {
    if (isProtected(target)) return NextResponse.json({ error: 'The primary admin account cannot be banned.' }, { status: 403 })
    const banned = action === 'ban'
    const { error } = await adminSupabase.from('users').update({ is_active: !banned, updated_at: new Date().toISOString() }).eq('id', userId)
    if (error) return NextResponse.json({ error: 'Failed to update ban status' }, { status: 500 })
    await writeAuditLog({ actorId: auth.user.id, actorEmail: auth.user.email, action: banned ? 'user.banned' : 'user.unbanned', targetType: 'user', targetId: userId, targetLabel: target.email, metadata: { previousActive: target.is_active, newActive: !banned }, ...requestAuditContext(request) })
    return NextResponse.json({ message: banned ? 'User banned' : 'User unbanned' })
  }

  if (action === 'password_reset' || action === 'verification') {
    const { error } = action === 'password_reset'
      ? await adminSupabase.auth.resetPasswordForEmail(target.email)
      : await adminSupabase.auth.resend({ type: 'signup', email: target.email })
    if (error) return NextResponse.json({ error: 'Failed to send the requested email' }, { status: 400 })
    await writeAuditLog({ actorId: auth.user.id, actorEmail: auth.user.email, action: action === 'password_reset' ? 'user.password_reset_sent' : 'user.verification_sent', targetType: 'user', targetId: userId, targetLabel: target.email, ...requestAuditContext(request) })
    return NextResponse.json({ message: action === 'password_reset' ? 'Password reset email sent' : 'Verification email sent' })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error
  const { userId } = await params
  const target = await getTarget(userId)
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  if (isProtected(target)) return NextResponse.json({ error: 'The primary admin account cannot be removed.' }, { status: 403 })
  const { error } = await adminSupabase.auth.admin.deleteUser(userId)
  if (error) return NextResponse.json({ error: 'Failed to remove user' }, { status: 500 })
  await adminSupabase.from('users').delete().eq('id', userId)
  await writeAuditLog({ actorId: auth.user.id, actorEmail: auth.user.email, action: 'user.removed', targetType: 'user', targetId: userId, targetLabel: target.email, metadata: { role: target.role }, ...requestAuditContext(_request) })
  return NextResponse.json({ message: 'User removed' })
}
