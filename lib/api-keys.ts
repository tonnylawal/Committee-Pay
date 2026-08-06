import crypto from 'crypto'

/**
 * Generates a secure API key with the format: ap_live_xxxxxxxxxxxxxxxxxxxx
 */
export function generateApiKey(): { key: string; preview: string; hash: string } {
  const randomBytes = crypto.randomBytes(24).toString('hex')
  const key = `ap_live_${randomBytes}`
  const hash = crypto.createHash('sha256').update(key).digest('hex')
  const preview = `${key.slice(0, 8)}...${key.slice(-4)}`
  
  return { key, preview, hash }
}

/**
 * Hashes an API key for comparison
 */
export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex')
}

/**
 * Validates API key format
 */
export function isValidApiKeyFormat(key: string): boolean {
  return key.startsWith('ap_live_') && key.length === 32 // ap_live_ (8) + 24 hex chars
}

/**
 * Extracts preview from full key
 */
export function getApiKeyPreview(key: string): string {
  return `${key.slice(0, 8)}...${key.slice(-4)}`
}
