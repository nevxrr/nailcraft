import { useState, type ReactNode } from 'react'
import { Link, Navigate, NavLink, Outlet } from 'react-router-dom'
import { COURSE, formatDate, formatPrice } from '../data/content'
import { BrandBar, LandingNav, TelegramButton } from '../components/LayoutBits'
import { displayName, telegramHref, useStore } from '../store/StoreContext'

export function CabinetLayout() {
  const { ready, user } = useStore()
  if (!ready) return <BootScreen />
  if (!user) return <Navigate to="/login?next=/cabinet" replace />
  return <Outlet />
}

export function BootScreen() {
  return (
    <div className="page">
      <div className="shell login-box">
        <p className="muted">Открываем кабинет…</p>
      </div>
    </div>
  )
}

function CabinetChrome({ children }: { children: ReactNode }) {
  const { user, logout } = useStore()
  return (
    <div className="page cabinet-page">
      <div className="atmosphere" aria-hidden>
        <span className="orb orb-b" />
        <span className="orb orb-c" />
      </div>
      <BrandBar />
      <LandingNav />
      <div className="shell cabinet-top">
        <div className="cabinet-user">
          {user?.photoUrl ? (
            <img className="avatar-img" src={user.photoUrl} alt="" />
          ) : (
            <div className="avatar" aria-hidden />
          )}
          <div>
            <p className="cabinet-name">{displayName(user)}</p>
            <p className="cabinet-level">
              {user?.role === 'teacher' ? 'Учитель' : user?.enrolled ? 'Ученица' : 'Гость кабинета'}
              {user?.username ? ` · @${user.username}` : ''}
            </p>
          </div>
        </div>
        <nav className="cabinet-tabs" aria-label="Кабинет">
          <NavLink to="/cabinet" end>
            Обзор
          </NavLink>
          <NavLink to="/cabinet/course">Курс</NavLink>
          <NavLink to="/cabinet/booking">Запись</NavLink>
          {user?.role === 'teacher' && <NavLink to="/crm">CRM</NavLink>}
          <button type="button" onClick={logout}>
            Выйти
          </button>
        </nav>
      </div>
      <div className="shell cabinet-body">{children}</div>
    </div>
  )
}

export function CabinetHome() {
  const { user, cabinet, enrolled } = useStore()
  return (
    <CabinetChrome>
      <section className="profile-card glass-strong">
        <p className="eyebrow">
          <span>TG</span> Профиль
        </p>
        <h1>{displayName(user)}</h1>
        <ul className="course-meta">
          <li>id {user?.telegramId}</li>
          {user?.username && <li>@{user.username}</li>}
          <li>{user?.role === 'teacher' ? 'учитель' : 'ученица'}</li>
        </ul>
        <p className="muted">
          Вход привязан к Telegram. Имя и фото — из аккаунта, не из формы на сайте.
        </p>
        <div className="course-aside-actions">
          <a className="cta-figma" href={telegramHref(user!)} target="_blank" rel="noreferrer">
            Написать Анастасии
          </a>
          {!enrolled && (
            <Link to="/#offer" className="cta-ghost">
              К оплате курса
            </Link>
          )}
        </div>
      </section>

      <section className="cabinet-section">
        <h2>Прогресс</h2>
        <div className="progress-card glass">
          <strong>
            {cabinet?.progress.lessonsDone ?? 0} / {cabinet?.progress.lessonsTotal ?? 0}
          </strong>
          <p>{cabinet?.progress.hint}</p>
        </div>
      </section>

      <section className="cabinet-section">
        <h2>Записи</h2>
        {cabinet?.bookings.length ? (
          <div className="cabinet-cards">
            {cabinet.bookings.map((group) => (
              <Link key={group.id} to="/cabinet/booking" className="cabinet-card">
                <div>
                  <h3>{group.topic}</h3>
                  <p>
                    {formatDate(group.date)} · {group.time}
                  </p>
                </div>
                <span className="chip">
                  {group.students.length}/2
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="muted">Пока нет записи. Группы — по два места.</p>
        )}
      </section>

      <section className="cabinet-section">
        <h2>Курс</h2>
        <div className="cabinet-card">
          <div>
            <h3>{COURSE.title}</h3>
            <p>
              {enrolled
                ? 'Каркас открыт. Уроки-таблицы появятся здесь.'
                : `Тест-оплата ${formatPrice(COURSE.price)} открывает каркас без эквайринга.`}
            </p>
          </div>
          <Link to={enrolled ? '/cabinet/course' : '/#offer'} className="btn btn-dark">
            {enrolled ? 'Открыть каркас' : 'К курсу'}
          </Link>
        </div>
      </section>
    </CabinetChrome>
  )
}

export function BookingPage() {
  const { cabinet, enrolled, bookGroup } = useStore()
  const [ok, setOk] = useState('')
  const [error, setError] = useState('')

  if (!enrolled) {
    return (
      <CabinetChrome>
        <div className="lock-note glass-strong">
          <h2>Запись после оплаты</h2>
          <p>Мини-группа из двух откроется, когда курс будет в кабинете.</p>
          <Link to="/#offer" className="cta-figma">
            Тест · открыть курс
          </Link>
        </div>
      </CabinetChrome>
    )
  }

  return (
    <CabinetChrome>
      <header className="course-hero">
        <p className="eyebrow">
          <span>2</span> места
        </p>
        <h1>Группы</h1>
        <p className="course-hero-lead">
          Слот закрывается, когда оба места заняты. Индивидуально — та же группа, одно место.
        </p>
      </header>
      <div className="cabinet-cards">
        {cabinet?.groups.map((group) => {
          const mine = Boolean(cabinet.bookings.some((item) => item.id === group.id))
          return (
            <article key={group.id} className="cabinet-card">
              <div>
                <h3>{group.topic}</h3>
                <p>
                  {formatDate(group.date)} · {group.time}
                </p>
                <div className="seat-row">
                  {[0, 1].map((i) => (
                    <span key={i} className={`seat ${group.students[i] ? 'taken' : ''}`}>
                      {group.students[i]?.name ?? 'Место свободно'}
                    </span>
                  ))}
                </div>
              </div>
              {mine ? (
                <span className="chip">Вы записаны</span>
              ) : group.seatsLeft === 0 ? (
                <span className="chip">Группа закрыта</span>
              ) : (
                <button
                  type="button"
                  className="btn btn-dark"
                  onClick={async () => {
                    setError('')
                    try {
                      await bookGroup(group.id)
                      setOk(group.id)
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Не записалось')
                    }
                  }}
                >
                  Занять место
                </button>
              )}
            </article>
          )
        })}
      </div>
      {ok && (
        <div className="toast" role="status">
          Место занято. Напишем в Telegram перед днём.
        </div>
      )}
      {error && <p className="form-error">{error}</p>}
      <TelegramButton className="cta-ghost">Написать Анастасии</TelegramButton>
    </CabinetChrome>
  )
}
