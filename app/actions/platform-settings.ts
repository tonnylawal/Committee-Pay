'use server'

import { createClient } from '@/lib/supabase/server'
import { decryptConfigValue, encryptConfigValue, getRuntimeConfig, isAllowedConfigKey, maskConfigValue, REQUIRED_ENV_VARS } from '@/lib/config-vault'

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/
const DEFAULT_MESSAGE = 'Our systems are currently down and we might not be able to process your payment. Please contact support for an alternative payment method.'

function validColor(value: unknown, fallback: string) {
  return typeof value === 'string' && HEX_COLOR.test(value) ? value : fallback
}

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('You must be signed in')
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).maybeSingle()
  if (profile?.role !== 'admin') throw new Error('Administrator access required')
  return { supabase, user }
}

export async function getPlatformSettings() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('platform_settings').select('*').eq('id', 1).maybeSingle()
  if (error) throw new Error('Failed to load platform settings')
  return data || { disabled_payment_message: DEFAULT_MESSAGE, support_email: 'support@committee.com', theme_primary_color: '#0f766e', theme_background_color: '#f8fafc', theme_text_color: '#0f172a', theme_accent_color: '#14b8a6' }
}

export async function updatePlatformSettings(input: { disabled_payment_message: string; support_email: string; theme_primary_color: string; theme_background_color: string; theme_text_color: string; theme_accent_color: string }) {
  const message = input.disabled_payment_message.trim()
  const email = input.support_email.trim()
  if (!message || message.length > 500) throw new Error('The outage message must be between 1 and 500 characters')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid support email')
  const { supabase, user } = await requireAdmin()
  const { data, error } = await supabase.from('platform_settings').update({ disabled_payment_message: message, support_email: email, theme_primary_color: validColor(input.theme_primary_color, '#0f766e'), theme_background_color: validColor(input.theme_background_color, '#f8fafc'), theme_text_color: validColor(input.theme_text_color, '#0f172a'), theme_accent_color: validColor(input.theme_accent_color, '#14b8a6'), updated_at: new Date().toISOString(), updated_by: user.id }).eq('id', 1).select().single()
  if (error) throw new Error('Failed to save platform settings')
  return data
}

export async function getAdminConfig() {
  let context: Awaited<ReturnType<typeof requireAdmin>>
  try {
    context = await requireAdmin()
  } catch {
    return []
  }
  const { supabase } = context
  const { data, error } = await supabase.from('admin_config_vault').select('key, description, updated_at, value_ciphertext').order('key')
  if (error) throw new Error('Failed to load secure configuration')
  const stored = new Map((data || []).map((row) => [row.key, row]))
  return REQUIRED_ENV_VARS.map(({ key, description }) => {
    const row = stored.get(key)
    const runtime = getRuntimeConfig(key)
    let masked = runtime ? maskConfigValue(runtime) : null
    if (!masked && row) {
      try { masked = maskConfigValue(decryptConfigValue(row.value_ciphertext)) } catch { masked = 'Configured' }
    }
    return { key, description, configured: Boolean(masked), masked, updatedAt: row?.updated_at ?? null }
  })
}

export async function saveAdminConfig(input: { key: string; value: string; description?: string }) {
  const key = input.key.trim()
  const value = input.value.trim()
  if (!isAllowedConfigKey(key) || !REQUIRED_ENV_VARS.some((item) => item.key === key)) throw new Error('That environment variable is not allowed')
  if (!value) throw new Error('Enter a value')
  const { supabase, user } = await requireAdmin()
  const { error } = await supabase.from('admin_config_vault').upsert({ key, value_ciphertext: encryptConfigValue(value), description: input.description?.trim() || REQUIRED_ENV_VARS.find((item) => item.key === key)?.description, updated_at: new Date().toISOString(), updated_by: user.id })
  if (error) throw new Error('Failed to save secure configuration')
  return { success: true }
}

export async function deleteAdminConfig(key: string) {
  if (!isAllowedConfigKey(key) || !REQUIRED_ENV_VARS.some((item) => item.key === key)) throw new Error('That environment variable is not allowed')
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from('admin_config_vault').delete().eq('key', key)
  if (error) throw new Error('Failed to delete secure configuration')
  return { success: true }
}

