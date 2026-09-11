/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_TELEGRAM_BOT_USERNAME?: string
  readonly VITE_TELEGRAM_TEACHER_IDS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  onNailCraftTelegramAuth?: (user: {
    id: number
    first_name: string
    last_name?: string
    username?: string
    photo_url?: string
    auth_date: number
    hash: string
  }) => void
}
