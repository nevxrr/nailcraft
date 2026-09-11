import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, NavLink, Outlet, useParams } from 'react-router-dom'
import { COURSE, formatDate, formatPrice } from '../data/content'
import { BrandBar, LandingNav } from '../components/LayoutBits'
import { leadStatusLabel } from '../lib/api'
import type { Lead, LeadStatus, StudentCard } from '../lib/types'
import { displayName, telegramHref, useStore } from '../store/StoreContext'
import { BootScreen } from './CabinetPages'

const STATUSES: LeadStatus[] = ['new', 'contacted', 'booked', 'paid', 'lost']

export function CrmLayout() {
  const { ready, user, refreshCrm } = useStore()
  useEffect(() => {
    if (user?.role === 'teacher') void refreshCrm()
  }, [user, refreshCrm])
  if (!ready) return <BootScreen />
  if (!user) return <Navigate to="/login?next=/crm" replace />
  if (user.role !== 'teacher') return <Navigate to="/cabinet" replace />
  return (
    <div className="page crm-page">
      <div className="atmosphere" aria-hidden>
        <span className="orb orb-a" />
        <span className="orb orb-c" />
      </div>
      <BrandBar />
      <LandingNav />
      <div className="shell cabinet-top">
        <div>
          <p className="eyebrow">
            <span>CRM</span> учитель
          </p>
          <h1 className="crm-title">Школа</h1>
        </div>
        <nav className="cabinet-tabs" aria-label="CRM">
          <NavLink to="/crm" end>
            Воронка
          </NavLink>
          <NavLink to="/crm/students">Ученицы</NavLink>
          <NavLink to="/crm/groups">Группы</NavLink>
          <NavLink to="/crm/payments">Оплаты</NavLink>
          <NavLink to="/crm/scripts">Скрипты</NavLink>
          <NavLink to="/cabinet">Кабинет</NavLink>
        </nav>
      </div>
      <div className="shell cabinet-body">
        <Outlet />
      </div>
    </div>
  )
}

export function CrmFunnel() {
  const { crm, setLeadStatus, saveLeadNotes } = useStore()
  if (!crm) return <p className="muted">Заявки загружаются…</p>

  return (
    <>
      <p className="muted crm-lead-copy">
        Новые заявки с лендинга и шпаргалки. Ответ — в Telegram, статус меняете здесь.
      </p>
      <div className="funnel">
        {STATUSES.map((status) => {
          const items = crm.leads.filter((lead) => lead.status === status)
          return (
            <section key={status} className="funnel-col glass">
              <header>
                <h2>{leadStatusLabel(status)}</h2>
                <span>{items.length}</span>
              </header>
              {items.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onStatus={(next) => void setLeadStatus(lead.id, next)}
                  onNotes={(notes) => void saveLeadNotes(lead.id, notes)}
                />
              ))}
            </section>
          )
        })}
      </div>
    </>
  )
}

function LeadCard({
  lead,
  onStatus,
  onNotes,
}: {
  lead: Lead
  onStatus: (status: LeadStatus) => void
  onNotes: (notes: string) => void
}) {
  return (
    <article className="lead-card">
      <h3>{lead.name}</h3>
      <p>{lead.contact}</p>
      <p className="muted">
        {lead.experience || 'опыт не указан'}
        {lead.struggle ? ` · ${lead.struggle}` : ''}
      </p>
      {lead.preferredDate && <p className="muted">{formatDate(lead.preferredDate)}</p>}
      <div className="chip-row">
        <span className="chip">{lead.source === 'magnet' ? 'Шпаргалка' : 'Заявка'}</span>
        <a href={telegramHref(lead)} target="_blank" rel="noreferrer">
          Написать
        </a>
      </div>
      <label className="field">
        <span>Статус</span>
        <select value={lead.status} onChange={(e) => onStatus(e.target.value as LeadStatus)}>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {leadStatusLabel(status)}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Заметка</span>
        <textarea
          defaultValue={lead.notes}
          rows={2}
          onBlur={(e) => onNotes(e.target.value)}
        />
      </label>
    </article>
  )
}

export function CrmStudents() {
  const { crm } = useStore()
  if (!crm) return <p className="muted">Карточки загружаются…</p>
  if (crm.students.length === 0) {
    return (
      <p className="muted">
        Пока нет учениц. Они появятся после входа через Telegram.
      </p>
    )
  }
  return (
    <div className="cabinet-cards">
      {crm.students.map((student) => (
        <Link key={student.id} to={`/crm/students/${student.id}`} className="cabinet-card">
          <div>
            <h3>{displayName(student)}</h3>
            <p>
              {student.username ? `@${student.username}` : `id ${student.telegramId}`}
              <br />
              {student.enrolled ? 'Курс открыт' : 'Без оплаты'}
            </p>
          </div>
          <span className="chip">{student.payments.length} опл.</span>
        </Link>
      ))}
    </div>
  )
}

export function CrmStudentCard() {
  const { id } = useParams()
  const { crm, saveStudentNotes, markPaid, assignStudent } = useStore()
  const student = crm?.students.find((item) => item.id === id)
  const [groupId, setGroupId] = useState(crm?.groups[0]?.id ?? '')

  if (!crm) return <p className="muted">Карточка загружается…</p>
  if (!student) {
    return (
      <p className="muted">
        Нет такой ученицы. <Link to="/crm/students">К списку</Link>
      </p>
    )
  }

  return (
    <article className="student-sheet glass-strong">
      <p className="eyebrow">
        <span>id</span> {student.telegramId}
      </p>
      <h1>{displayName(student)}</h1>
      <ul className="course-meta">
        {student.username && <li>@{student.username}</li>}
        <li>{student.enrolled ? 'курс открыт' : 'не оплачено'}</li>
        <li>{student.payments.length} платежей</li>
      </ul>
      <p className="muted">
        {student.experience || 'Опыт не заполнен'}
        {student.pains ? ` · ${student.pains}` : ''}
      </p>
      <div className="course-aside-actions">
        <a className="cta-figma" href={telegramHref(student)} target="_blank" rel="noreferrer">
          Написать в Telegram
        </a>
        <button type="button" className="cta-ghost" onClick={() => void markPaid(student.id)}>
          Отметить оплату {formatPrice(COURSE.price)}
        </button>
      </div>
      <label className="field">
        <span>Заметки и скрипт</span>
        <textarea
          defaultValue={student.notes}
          rows={4}
          onBlur={(e) => void saveStudentNotes(student.id, e.target.value)}
        />
      </label>
      <section>
        <h2>Посадить в группу</h2>
        <div className="inline-row">
          <select value={groupId} onChange={(e) => setGroupId(e.target.value)}>
            {crm.groups.map((group) => (
              <option key={group.id} value={group.id}>
                {formatDate(group.date)} · {group.students.length}/2
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-dark"
            disabled={!groupId}
            onClick={() => groupId && void assignStudent(groupId, student.id)}
          >
            В группу
          </button>
        </div>
      </section>
      <StudentPayments student={student} />
      <Link to="/crm/students" className="back-home">
        Ко всем ученицам
      </Link>
    </article>
  )
}

function StudentPayments({ student }: { student: StudentCard }) {
  if (student.payments.length === 0) return <p className="muted">Оплат пока нет.</p>
  return (
    <ul className="pay-list">
      {student.payments.map((pay) => (
        <li key={pay.id}>
          <strong>{formatPrice(pay.amount)}</strong>
          <span>
            {pay.kind === 'internship' ? 'стажировка' : 'курс'} · {pay.status}
          </span>
        </li>
      ))}
    </ul>
  )
}

export function CrmGroups() {
  const { crm, createGroup, removeSeat } = useStore()
  const [error, setError] = useState('')

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    setError('')
    try {
      await createGroup({
        date: String(data.get('date') ?? ''),
        time: String(data.get('time') ?? ''),
        topic: String(data.get('topic') ?? COURSE.title),
      })
      e.currentTarget.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не создалось')
    }
  }

  if (!crm) return <p className="muted">Группы загружаются…</p>

  return (
    <>
      <form className="group-create glass" onSubmit={onCreate}>
        <h2>Новая группа из 2</h2>
        <div className="form-grid three">
          <label className="field">
            <span>Дата</span>
            <input name="date" type="date" required />
          </label>
          <label className="field">
            <span>Время</span>
            <input name="time" required placeholder="11:00–17:00" />
          </label>
          <label className="field">
            <span>Тема</span>
            <input name="topic" defaultValue={COURSE.title} />
          </label>
        </div>
        <button type="submit" className="cta-figma">
          Открыть слот
        </button>
        {error && <p className="form-error">{error}</p>}
      </form>
      <div className="cabinet-cards">
        {crm.groups.map((group) => (
          <article key={group.id} className="cabinet-card">
            <div>
              <h3>{group.topic}</h3>
              <p>
                {formatDate(group.date)} · {group.time}
              </p>
              <div className="seat-row">
                {[0, 1].map((i) => {
                  const person = group.students[i]
                  return (
                    <span key={i} className={`seat ${person ? 'taken' : ''}`}>
                      {person ? (
                        <>
                          <Link to={`/crm/students/${person.id}`}>{person.name}</Link>
                          <button
                            type="button"
                            className="text-reset"
                            onClick={() => void removeSeat(group.id, person.id)}
                          >
                            убрать
                          </button>
                        </>
                      ) : (
                        'Место свободно'
                      )}
                    </span>
                  )
                })}
              </div>
            </div>
            <span className="chip">{group.status === 'full' ? 'Закрыта' : `${group.seatsLeft} свободно`}</span>
          </article>
        ))}
      </div>
    </>
  )
}

export function CrmPayments() {
  const { crm, markPaid } = useStore()
  if (!crm) return <p className="muted">Оплаты загружаются…</p>
  return (
    <>
      <p className="muted">
        Эквайринга нет. Тест-кнопка на лендинге пишет статус «test» и открывает курс.
        Здесь можно отметить живую оплату вручную.
      </p>
      <ul className="pay-list">
        {crm.payments.map((pay) => {
          const student = crm.students.find((item) => item.id === pay.studentId)
          return (
            <li key={pay.id}>
              <strong>{formatPrice(pay.amount)}</strong>
              <span>
                {student ? displayName(student) : pay.studentId} · {pay.kind} · {pay.status}
              </span>
            </li>
          )
        })}
      </ul>
      {crm.students.filter((item) => !item.enrolled).length > 0 && (
        <section className="cabinet-section">
          <h2>Без оплаты</h2>
          <div className="chip-row wrap">
            {crm.students
              .filter((item) => !item.enrolled)
              .map((student) => (
                <button
                  key={student.id}
                  type="button"
                  className="btn btn-dark"
                  onClick={() => void markPaid(student.id)}
                >
                  {displayName(student)} · {formatPrice(COURSE.price)}
                </button>
              ))}
          </div>
        </section>
      )}
    </>
  )
}

export function CrmScripts() {
  const { crm } = useStore()
  const scripts = crm?.scripts ?? []
  return (
    <div className="script-grid">
      {scripts.map((script) => (
        <article key={script.id} className="script-card glass">
          <p className="day-time">{script.title}</p>
          <h3>{script.claim}</h3>
          <p>{script.benefit}</p>
        </article>
      ))}
    </div>
  )
}
