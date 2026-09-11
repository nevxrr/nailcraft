import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Link, NavLink, Navigate, Outlet } from 'react-router-dom'
import {
  courses,
  formatDate,
  offlineSlots,
} from '../data/content'
import { useStore } from '../store/StoreContext'

function CabinetHeader({ title }: { title?: string }) {
  const { state, hasAccess, logout } = useStore()
  const level = hasAccess ? 'Ученица' : 'Новичок'
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
    <>
      <div className="shell landing-brand cabinet-brand">
        <div className="cabinet-user">
          <div className="avatar" aria-hidden />
          <div>
            <p className="cabinet-name">{title ?? state.userName}</p>
            {!title && <p className="cabinet-level">{level}</p>}
          </div>
        </div>
      </div>
      <div className="nav-sticky" ref={wrapRef}>
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="cabinet-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'Закрыть' : 'Меню'}
        </button>
        {open && (
          <nav id="cabinet-menu" className="nav-glass" aria-label="Кабинет">
            <NavLink
              to="/cabinet"
              end
              className={({ isActive }) => (isActive ? 'active' : undefined)}
              onClick={() => setOpen(false)}
            >
              Обзор
            </NavLink>
            {hasAccess && (
              <>
                <NavLink
                  to="/cabinet/lessons"
                  className={({ isActive }) => (isActive ? 'active' : undefined)}
                  onClick={() => setOpen(false)}
                >
                  Уроки
                </NavLink>
                <NavLink
                  to="/cabinet/booking"
                  className={({ isActive }) => (isActive ? 'active' : undefined)}
                  onClick={() => setOpen(false)}
                >
                  Запись
                </NavLink>
              </>
            )}
            <Link to="/" onClick={() => setOpen(false)}>
              Главная
            </Link>
            <button type="button" className="nav-logout" onClick={logout}>
              Выйти
            </button>
          </nav>
        )}
      </div>
    </>
  )
}

function CabinetShell({
  children,
  title,
}: {
  children: ReactNode
  title?: string
}) {
  return (
    <div className="page cabinet-shell">
      <CabinetHeader title={title} />
      <div className="shell shell-inner cabinet-body">{children}</div>
    </div>
  )
}

export function CabinetLayout() {
  const { isLoggedIn } = useStore()
  if (!isLoggedIn) return <Navigate to="/cabinet/login" replace />
  return <Outlet />
}

export function LoginPage() {
  const { login, isLoggedIn } = useStore()
  const [name, setName] = useState('')
  if (isLoggedIn) return <Navigate to="/cabinet" replace />

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    login(name)
  }

  return (
    <div className="page">
      <div className="shell">
        <form className="login-box glass-strong" onSubmit={onSubmit}>
          <Link to="/" className="logo">
            NailCraft
          </Link>
          <h1>Личный кабинет</h1>
          <p>Войдите, чтобы открыть уроки и запись на офлайн после оплаты.</p>
          <div className="form-grid">
            <label className="field">
              <span>Имя и фамилия</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Мария Иванова"
                required
              />
            </label>
            <button type="submit" className="btn btn-dark">
              Войти
            </button>
            <Link to="/" className="muted" style={{ textAlign: 'center' }}>
              ← На главную
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export function CabinetHome() {
  const { hasAccess, isEnrolled } = useStore()
  const owned = courses.filter((c) => isEnrolled(c.id))

  return (
    <CabinetShell>
      {!hasAccess ? (
        <div className="lock-note glass-strong">
          <h2>Платформа пока закрыта</h2>
          <p>
            Оплатите курс — и здесь появятся ближайшие занятия и
            онлайн-материалы.
          </p>
          <Link to="/#courses" className="btn btn-pink">
            Выбрать курс
          </Link>
        </div>
      ) : (
        <>
          <section className="cabinet-section">
            <h2>Ближайшие занятия</h2>
            <div className="cabinet-cards">
              {offlineSlots.map((slot) => (
                <Link
                  key={slot.id}
                  to="/cabinet/booking"
                  className="cabinet-card"
                >
                  <div>
                    <h3>{slot.topic}</h3>
                    <p>
                      {formatDate(slot.date)}
                      <br />
                      {slot.time}
                    </p>
                  </div>
                  <span className="chip">Офлайн · мест {slot.seatsLeft}</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="cabinet-section">
            <h2>Онлайн материал</h2>
            <div className="cabinet-cards">
              {owned
                .flatMap((c) =>
                  c.lessons.slice(0, 2).map((lesson) => (
                    <Link
                      key={lesson.id}
                      to="/cabinet/lessons"
                      className="cabinet-card"
                    >
                      <div>
                        <h3>{lesson.title}</h3>
                        <p>
                          {c.title} · {lesson.duration}
                        </p>
                      </div>
                      <span className="chip">
                        {lesson.type === 'video'
                          ? 'Видео'
                          : lesson.type === 'practice'
                            ? 'Практика'
                            : 'PDF'}
                      </span>
                    </Link>
                  )),
                )
                .slice(0, 3)}
            </div>
          </section>
        </>
      )}
    </CabinetShell>
  )
}

export function LessonsPage() {
  const { hasAccess, state, toggleLesson, isEnrolled } = useStore()

  if (!hasAccess) {
    return (
      <CabinetShell title="Онлайн материал">
        <div className="lock-note glass-strong">
          <h2>Уроки закрыты</h2>
          <p>Оплатите курс, чтобы открыть онлайн-материалы.</p>
          <Link to="/#courses" className="btn btn-pink">
            К курсам
          </Link>
        </div>
      </CabinetShell>
    )
  }

  const owned = courses.filter((c) => isEnrolled(c.id))

  return (
    <CabinetShell title="Онлайн материал">
      {owned.map((course) => (
        <section key={course.id} className="cabinet-section">
          <h2>{course.title}</h2>
          <div className="cabinet-cards">
            {course.lessons.map((lesson) => {
              const done = Boolean(state.lessonProgress[lesson.id])
              return (
                <button
                  key={lesson.id}
                  type="button"
                  className="cabinet-card"
                  onClick={() => toggleLesson(lesson.id)}
                  style={{
                    background: done
                      ? 'linear-gradient(160deg, rgba(155,201,200,.45), rgba(214,230,251,.5))'
                      : undefined,
                  }}
                >
                  <div>
                    <h3>
                      {done ? '✓ ' : ''}
                      {lesson.title}
                    </h3>
                    <p>
                      {lesson.summary} · {lesson.duration}
                    </p>
                  </div>
                  <span className="chip">
                    {lesson.type === 'video'
                      ? 'Видео'
                      : lesson.type === 'practice'
                        ? 'Практика'
                        : 'PDF'}
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      ))}
    </CabinetShell>
  )
}

export function BookingPage() {
  const { hasAccess, bookSlot, hasBooking, state } = useStore()
  const [phone, setPhone] = useState('')
  const [ok, setOk] = useState<string | null>(null)

  if (!hasAccess) {
    return (
      <CabinetShell title="Ближайшие занятия">
        <div className="lock-note glass-strong">
          <h2>Запись на офлайн</h2>
          <p>Доступна после оплаты курса.</p>
          <Link to="/#courses" className="btn btn-pink">
            Оплатить курс
          </Link>
        </div>
      </CabinetShell>
    )
  }

  return (
    <CabinetShell title="Ближайшие занятия">
      <label className="field" style={{ maxWidth: 320, marginBottom: 18 }}>
        <span>Телефон для подтверждения</span>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+7 …"
        />
      </label>

      <div className="cabinet-cards">
        {offlineSlots.map((slot) => {
          const booked = hasBooking(slot.id)
          return (
            <article key={slot.id} className="cabinet-card">
              <div>
                <h3>{slot.topic}</h3>
                <p>
                  {formatDate(slot.date)} · {slot.time}
                  <br />
                  Осталось мест: {slot.seatsLeft}
                </p>
              </div>
              {booked ? (
                <span className="chip">Вы записаны</span>
              ) : (
                <button
                  type="button"
                  className="btn btn-dark"
                  disabled={!phone.trim()}
                  onClick={() => {
                    bookSlot(slot.id, state.userName, phone.trim())
                    setOk(slot.id)
                  }}
                >
                  Записаться
                </button>
              )}
            </article>
          )
        })}
      </div>
      {ok && (
        <div className="toast" role="status">
          Запись сохранена. Мы напишем перед занятием.
        </div>
      )}
    </CabinetShell>
  )
}
