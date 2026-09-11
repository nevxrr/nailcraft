import assert from 'node:assert/strict'
import { test } from 'node:test'
import { signTelegramAuth, verifyTelegramAuth } from './telegram.ts'

const token = 'test-bot-token-not-a-secret'

test('accepts a valid Telegram Login payload', () => {
  const now = 1_700_000_000
  const signed = signTelegramAuth(
    {
      id: 4242,
      first_name: 'Анастасия',
      username: 'nastya',
      auth_date: now,
    },
    token,
  )
  assert.equal(verifyTelegramAuth(signed, token, now).ok, true)
})

test('rejects a tampered hash', () => {
  const now = 1_700_000_000
  const signed = signTelegramAuth(
    { id: 1, first_name: 'A', auth_date: now },
    token,
  )
  const bad = { ...signed, hash: '0'.repeat(64) }
  assert.deepEqual(verifyTelegramAuth(bad, token, now), {
    ok: false,
    error: 'bad_hash',
  })
})

test('rejects expired auth_date', () => {
  const now = 1_700_000_000
  const signed = signTelegramAuth(
    { id: 1, first_name: 'A', auth_date: now - 60 * 60 * 25 },
    token,
  )
  assert.deepEqual(verifyTelegramAuth(signed, token, now), {
    ok: false,
    error: 'auth_expired',
  })
})

test('rejects missing bot token', () => {
  assert.deepEqual(
    verifyTelegramAuth(
      { id: 1, first_name: 'A', auth_date: 1, hash: 'ab' },
      '',
    ),
    { ok: false, error: 'telegram_not_configured' },
  )
})
