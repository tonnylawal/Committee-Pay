import 'server-only'

import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'

const algorithm = 'aes-256-gcm'

function getKey() {
  const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!secret) throw new Error('Server encryption is not configured')
  return createHash('sha256').update(secret).digest()
}

export function encryptConfigValue(value: string) {
  const iv = randomBytes(12)
  const cipher = createCipheriv(algorithm, getKey(), iv)
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  return [iv.toString('base64url'), cipher.getAuthTag().toString('base64url'), encrypted.toString('base64url')].join('.')
}

export function decryptConfigValue(payload: string) {
  const [iv, tag, encrypted] = payload.split('.')
  if (!iv || !tag || !encrypted) throw new Error('Invalid encrypted configuration')
  const decipher = createDecipheriv(algorithm, getKey(), Buffer.from(iv, 'base64url'))
  decipher.setAuthTag(Buffer.from(tag, 'base64url'))
  return Buffer.concat([decipher.update(Buffer.from(encrypted, 'base64url')), decipher.final()]).toString('utf8')
}

export function maskConfigValue(value: string) {
  if (value.length <= 4) return '••••'
  return `${value.slice(0, 2)}${'•'.repeat(Math.min(12, Math.max(4, value.length - 4)))}${value.slice(-2)}`
}

export const REQUIRED_ENV_VARS = [
  { key: 'NEXT_PUBLIC_SUPABASE_URL', description: 'Supabase project URL' },
  { key: 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', description: 'Public Supabase key' },
  { key: 'SUPABASE_SERVICE_ROLE_KEY', description: 'Server-only Supabase admin key' },
  { key: 'PAYSTACK_SECRET_KEY', description: 'Paystack server API key' },
  { key: 'PAYSTACK_PUBLIC_KEY', description: 'Paystack browser API key' },
] as const

export function isAllowedConfigKey(key: string) {
  return /^[A-Z][A-Z0-9_]{1,127}$/.test(key)
}

export function isSecretKey(key: string) {
  return !key.startsWith('NEXT_PUBLIC_') && key !== 'PAYSTACK_PUBLIC_KEY'
}

export function getRuntimeConfig(key: string) {
  const value = process.env[key]
  return value || null
}

export { createHash }
