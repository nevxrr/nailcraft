import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import type { TelegramAuthPayload } from './types.ts'

const MAX_AGE_SEC = 60 * 60 * 24

export function verifyTelegramAuth(
  payload: TelegramAuthPayload,
  botToken: string,
  nowSec = Math.floor(Date.now() / 1000),
): { ok: true } | { ok: false; error: string } {
  if (!botToken) return { ok: false, error: 'telegram_not_configured' }
  if (!payload?.hash || !payload.id || !payload.first_name || !payload.auth_date) {
    return { ok: false, error: 'invalid_payload' }
  }

  const authDate = Number(payload.auth_date)
  if (!Number.isFinite(authDate) || nowSec - authDate > MAX_AGE_SEC) {
    return { ok: false, error: 'auth_expired' }
  }

  const data: Record<string, string> = {
    id: String(payload.id),
    first_name: payload.first_name,
    auth_date: String(payload.auth_date),
  }
  if (payload.last_name) data.last_name = payload.last_name
  if (payload.username) data.username = payload.username
  if (payload.photo_url) data.photo_url = payload.photo_url

  const checkString = Object.keys(data)
    .sort()
    .map((key) => `${key}=${data[key]}`)
    .join('\n')

  const secret = createHash('sha256').update(botToken).digest()
  const hmac = createHmac('sha256', secret).update(checkString).digest('hex')
  const a = Buffer.from(hmac, 'hex')
  const b = Buffer.from(payload.hash, 'hex')
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, error: 'bad_hash' }
  }
  return { ok: true }
}

export function signTelegramAuth(
  payload: Omit<TelegramAuthPayload, 'hash'>,
  botToken: string,
): TelegramAuthPayload {
  const data: Record<string, string> = {
    id: String(payload.id),
    first_name: payload.first_name,
    auth_date: String(payload.auth_date),
  }
  if (payload.last_name) data.last_name = payload.last_name
  if (payload.username) data.username = payload.username
  if (payload.photo_url) data.photo_url = payload.photo_url
  const checkString = Object.keys(data)
    .sort()
    .map((key) => `${key}=${data[key]}`)
    .join('\n')
  const secret = createHash('sha256').update(botToken).digest()
  const hash = createHmac('sha256', secret).update(checkString).digest('hex')
  return { ...payload, hash }
}
