function csv(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function teacherIds(): number[] {
  return csv(process.env.TELEGRAM_TEACHER_IDS)
    .map((item) => Number(item))
    .filter((id) => Number.isFinite(id) && id > 0)
}

export const config = {
  port: Number(process.env.PORT) || 8787,
  dataDir: process.env.DATA_DIR || './data',
  botToken: process.env.TELEGRAM_BOT_TOKEN?.trim() || '',
  botUsername: process.env.TELEGRAM_BOT_USERNAME?.trim().replace(/^@/, '') || '',
  get teacherIds() {
    return teacherIds()
  },
  get jwtSecret() {
    if (process.env.JWT_SECRET?.trim()) return process.env.JWT_SECRET.trim()
    if (!internalJwt) {
      internalJwt = `local-${crypto.randomUUID()}`
      console.warn('[nailcraft-api] JWT_SECRET is empty — using an in-memory key')
    }
    return internalJwt
  },
  get allowDevLogin() {
    const raw = process.env.ALLOW_DEV_LOGIN?.trim().toLowerCase()
    if (raw === 'true' || raw === '1') return true
    if (raw === 'false' || raw === '0') return false
    return !process.env.TELEGRAM_BOT_TOKEN?.trim()
  },
  get origins() {
    const listed = csv(process.env.FRONTEND_ORIGIN)
    return listed.length > 0
      ? listed
      : ['http://localhost:5173', 'http://127.0.0.1:5173']
  },
}

let internalJwt = ''

export function isTeacherId(telegramId: number): boolean {
  return config.teacherIds.includes(telegramId)
}
