import { Link, Navigate } from 'react-router-dom'
import {
  COURSE,
  COURSE_SLOTS,
  MASTER,
  TELEGRAM_URL,
  formatPrice,
} from '../data/content'
import { useStore } from '../store/StoreContext'
import { LandingNav, TelegramButton } from '../components/LayoutBits'

export function CoursePage() {
  const { enrolled, reset } = useStore()
  if (!enrolled) return <Navigate to="/#offer" replace />

  return (
    <div className="page course-page">
      <div className="atmosphere" aria-hidden>
        <span className="orb orb-b" />
        <span className="orb orb-c" />
      </div>
      <div className="shell landing-brand">
        <Link to="/" className="logo">
          NailCraft
        </Link>
      </div>
      <LandingNav />

      <main className="shell course-main">
        <header className="course-hero">
          <p className="eyebrow">
            <span>Курс</span> каркас · без эквайринга
          </p>
          <h1>{COURSE.title}</h1>
          <p className="course-hero-lead">
            Уроки ещё собираются. Здесь — день как таблица: теория, две модели,
            материалы. Не лонгрид и не «скоро будет текст».
          </p>
          <ul className="course-meta">
            <li>{COURSE.format}</li>
            <li>{COURSE.seats} места</li>
            <li>носка {COURSE.wear}</li>
            <li>{formatPrice(COURSE.price)}</li>
          </ul>
        </header>

        <div className="course-slots">
          {COURSE_SLOTS.map((slot) => (
            <section key={slot.id} className="course-slot">
              <div className="course-slot-head">
                <p className="day-time">{slot.kicker}</p>
                <h2>{slot.title}</h2>
                <p className="muted">{slot.hint}</p>
              </div>
              <ol className="course-table">
                {slot.rows.map((row) => (
                  <li key={row}>
                    <span>{row}</span>
                    <em>слот пуст</em>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>

        <aside className="course-aside glass-strong">
          <div>
            <h2>Сертификат и стажировка</h2>
            <p>
              После дня — сертификат NailCraft. Стажировка {formatPrice(COURSE.internship)}{' '}
              — отдельно, когда будете готовы к живым клиентам.
            </p>
          </div>
          <div className="course-aside-actions">
            <TelegramButton>Написать Анастасии</TelegramButton>
            <Link to="/" className="cta-ghost">
              На лендинг
            </Link>
            <button type="button" className="text-reset" onClick={reset}>
              Сбросить тест-доступ
            </button>
          </div>
          <p className="muted">
            {MASTER.name} · чат после курса тоже в{' '}
            <a href={TELEGRAM_URL} target="_blank" rel="noreferrer">
              Telegram
            </a>
          </p>
        </aside>
      </main>
    </div>
  )
}

export function TelegramLoginPage() {
  return (
    <div className="page">
      <div className="atmosphere" aria-hidden>
        <span className="orb orb-a" />
      </div>
      <div className="shell">
        <div className="login-box glass-strong">
          <Link to="/" className="logo">
            NailCraft
          </Link>
          <h1>Вход</h1>
          <p>
            Пока без пароля и почты. Напишите Анастасии в Telegram — это и контакт,
            и вход.
          </p>
          <TelegramButton>Открыть Telegram</TelegramButton>
          <p className="muted login-note">
            Тест курса — с лендинга, кнопка «открыть курс без оплаты». Эквайринга нет.
          </p>
          <Link to="/" className="back-home">
            На главную
          </Link>
        </div>
      </div>
    </div>
  )
}
