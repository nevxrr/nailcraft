import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import telegramIcon from '../assets/figma/telegram.svg'
import vkIcon from '../assets/figma/vk.svg'

export function LandingNav() {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

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
          <a href="#courses" onClick={() => setOpen(false)}>
            Курсы
          </a>
          <a href="#reviews" onClick={() => setOpen(false)}>
            Отзывы
          </a>
          <a href="#contacts" onClick={() => setOpen(false)}>
            Контакты
          </a>
          <NavLink to="/cabinet" onClick={() => setOpen(false)}>
            Кабинет
          </NavLink>
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

export function PageChrome({
  children,
  showBack = true,
}: {
  children: ReactNode
  showBack?: boolean
}) {
  return (
    <div className="page">
      <div className="shell landing-brand">
        <Link to="/" className="logo">
          NailCraft
        </Link>
      </div>
      <LandingNav />
      <div className="shell shell-inner">
        {children}
        {showBack && (
          <Link to="/" className="back-home">
            Вернуться на главную
          </Link>
        )}
      </div>
    </div>
  )
}

export function SocialLinks() {
  return (
    <div className="social-figma">
      <a href="https://t.me/" target="_blank" rel="noreferrer" aria-label="Telegram">
        <img src={telegramIcon} alt="" />
      </a>
      <a href="https://vk.com/" target="_blank" rel="noreferrer" aria-label="VK">
        <img src={vkIcon} alt="" />
      </a>
    </div>
  )
}
