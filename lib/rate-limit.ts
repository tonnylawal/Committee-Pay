import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'

const hasRedisConfig = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
)

const limiters = hasRedisConfig
  ? {
      api: new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(120, '1 m'),
        analytics: true,
        prefix: 'rl:api',
        enableProtection: true,
      }),
      publicPayment: new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(20, '1 m'),
        analytics: true,
        prefix: 'rl:public-payment',
        enableProtection: true,
      }),
      verification: new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(30, '1 m'),
        analytics: true,
        prefix: 'rl:verification',
        enableProtection: true,
      }),
    }
  : null

function getClientIp(request: NextRequest) {
  return (
    request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

export async function enforceRateLimit(
  request: NextRequest,
  scope: keyof typeof limiters,
  identity?: string,
) {
  // Keep the payment path available if the Redis integration is not configured
  // in an environment, while emitting a clear operational signal.
  if (!limiters) {
    console.warn('[Security] Upstash Redis is not configured; rate limiting is bypassed')
    return null
  }

  const ip = getClientIp(request)
  const key = identity ? `${identity}:${ip}` : ip
  const result = await limiters[scope].limit(key, {
    ip,
    userAgent: request.headers.get('user-agent') || undefined,
  })

  if (result.success) return null

  const retryAfter = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000))
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } },
  )
}
