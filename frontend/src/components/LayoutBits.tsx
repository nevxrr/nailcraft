import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { NAV, TELEGRAM_URL } from '../data/content'
import { displayName, useStore } from '../store/StoreContext'
import telegramIcon from '../assets/figma/telegram.svg'

export function LandingNav() {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const { user, enrolled } = useStore()
  const onHome = useLocation().pathname === '/'

  useEffect(() => {
    if (!open) return
    const onPointer = (e: MouseEvent | TouchEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('touchstart', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('touchstart', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="nav-sticky" ref={wrapRef}>
      <button
        type="button"
        className="nav-toggle"
        aria-expanded={open}
        aria-controls="landing-menu"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? 'Закрыть' : 'Меню'}
      </button>
      {open && (
        <nav id="landing-menu" className="nav-glass" aria-label="Разделы">
          {NAV.map((item) =>
            onHome ? (
              <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </a>
            ) : (
              <Link
                key={item.href}
                to={`/${item.href}`}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ),
          )}
          {user ? (
            <>
              <NavLink to="/cabinet" onClick={() => setOpen(false)}>
                Кабинет
              </NavLink>
              {enrolled && (
                <NavLink to="/cabinet/course" onClick={() => setOpen(false)}>
                  Мой курс
                </NavLink>
              )}
              {user.role === 'teacher' && (
                <NavLink to="/crm" onClick={() => setOpen(false)}>
                  CRM
                </NavLink>
              )}
            </>
          ) : (
            <NavLink to="/login" onClick={() => setOpen(false)}>
              Войти
            </NavLink>
          )}
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noreferrer"
            onClick={() => setOpen(false)}
          >
            Telegram
          </a>
        </nav>
      )}
    </div>
  )
}

export function LandingHeader() {
  return (
    <>
      <div className="shell landing-brand">
        <a href="#top" className="logo">
          NailCraft
        </a>
      </div>
      <LandingNav />
    </>
  )
}

export function BrandBar() {
  return (
    <div className="shell landing-brand">
      <Link to="/" className="logo">
        NailCraft
      </Link>
    </div>
  )
}

export function TelegramButton({
  children = 'Написать в Telegram',
  className = 'cta-figma',
}: {
  children?: string
  className?: string
}) {
  return (
    <a
      href={TELEGRAM_URL}
      target="_blank"
      rel="noreferrer"
      className={className}
    >
      {children}
    </a>
  )
}

export function TelegramIconLink({ className = '' }: { className?: string }) {
  return (
    <a
      href={TELEGRAM_URL}
      target="_blank"
      rel="noreferrer"
      className={`social-figma-link ${className}`.trim()}
      aria-label="Telegram"
    >
      <img src={telegramIcon} alt="" />
    </a>
  )
}

export function Avatar({
  photoUrl,
  name,
}: {
  photoUrl?: string
  name?: string
}) {
  const label = name || displayName(null)
  if (photoUrl) {
    return <img className="avatar-img" src={photoUrl} alt="" />
  }
  return <div className="avatar" aria-hidden title={label} />
}
