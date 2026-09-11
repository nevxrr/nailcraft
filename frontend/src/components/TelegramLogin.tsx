import { useEffect, useRef } from 'react'
import type { TelegramAuthPayload } from '../lib/types'

export function TelegramLoginWidget({
  botUsername,
  onAuth,
}: {
  botUsername: string
  onAuth: (user: TelegramAuthPayload) => void
}) {
  const host = useRef<HTMLDivElement>(null)
  const onAuthRef = useRef(onAuth)
  onAuthRef.current = onAuth

  useEffect(() => {
    const box = host.current
    if (!box || !botUsername) return
    const name = botUsername.replace(/^@/, '')
    window.onNailCraftTelegramAuth = (user) => {
      onAuthRef.current(user)
    }
    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.async = true
    script.setAttribute('data-telegram-login', name)
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-userpic', 'true')
    script.setAttribute('data-radius', '14')
    script.setAttribute('data-request-access', 'write')
    script.setAttribute('data-onauth', 'onNailCraftTelegramAuth(user)')
    box.replaceChildren(script)
    return () => {
      delete window.onNailCraftTelegramAuth
      box.replaceChildren()
    }
  }, [botUsername])

  return <div className="tg-widget" ref={host} />
}
