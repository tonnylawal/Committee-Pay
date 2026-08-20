'use server'

import { createClient } from '@/lib/supabase/server'

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/
const DEFAULT_MESSAGE = 'Our systems are currently down and we might not be able to process your payment. Please contact support for an alternative payment method.'

function validColor(value: unknown, fallback: string) {
  return typeof value === 'string' && HEX_COLOR.test(value) ? value : fallback
}

export async function getPlatformSettings() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('platform_settings').select('*').eq('id', 1).maybeSingle()
  if (error) throw new Error('Failed to load platform settings')
  return data || {
    disabled_payment_message: DEFAULT_MESSAGE,
    support_email: 'support@alghahim.com',
    theme_primary_color: '#0f766e',
    theme_background_color: '#f8fafc',
    theme_text_color: '#0f172a',
    theme_accent_color: '#14b8a6',
  }
}

export async function updatePlatformSettings(input: {
  disabled_payment_message: string
  support_email: string
  theme_primary_color: string
  theme_background_color: string
  theme_text_color: string
  theme_accent_color: string
}) {
  const message = input.disabled_payment_message.trim()
  const email = input.support_email.trim()
  if (!message || message.length > 500) throw new Error('The outage message must be between 1 and 500 characters')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid support email')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('You must be signed in')

  const { data, error } = await supabase.from('platform_settings').update({
    disabled_payment_message: message,
    support_email: email,
    theme_primary_color: validColor(input.theme_primary_color, '#0f766e'),
    theme_background_color: validColor(input.theme_background_color, '#f8fafc'),
    theme_text_color: validColor(input.theme_text_color, '#0f172a'),
    theme_accent_color: validColor(input.theme_accent_color, '#14b8a6'),
    updated_at: new Date().toISOString(),
    updated_by: user.id,
  }).eq('id', 1).select().single()
  if (error) throw new Error('Failed to save platform settings')
  return data
}
