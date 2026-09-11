import { useState, type FormEvent } from 'react'
import { COURSE } from '../data/content'
import { useStore } from '../store/StoreContext'
import type { LeadSource } from '../lib/types'

export function LeadForm({
  source = 'landing',
  title = 'Оставить заявку',
  submitLabel = 'Отправить заявку',
  dark = false,
}: {
  source?: LeadSource
  title?: string
  submitLabel?: string
  dark?: boolean
}) {
  const { submitLead } = useStore()
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    setError('')
    try {
      await submitLead({
        name: String(data.get('name') ?? ''),
        contact: String(data.get('contact') ?? ''),
        interest: String(data.get('interest') ?? COURSE.title),
        experience: String(data.get('experience') ?? ''),
        struggle: String(data.get('struggle') ?? ''),
        preferredDate: String(data.get('preferredDate') ?? ''),
        source,
      })
      setSent(true)
      e.currentTarget.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не отправилось')
    }
  }

  return (
    <form className={`lead-form ${dark ? 'dark' : ''}`} onSubmit={onSubmit}>
      <h3>{title}</h3>
      <p className={dark ? 'offer-lead' : 'muted'}>
        Заявка приходит в CRM, не только в чат.
      </p>
      <div className="form-grid">
        <label className="field">
          <span>Имя</span>
          <input name="name" required placeholder="Алина" />
        </label>
        <label className="field">
          <span>Telegram</span>
          <input name="contact" required placeholder="@username или телефон" />
        </label>
        <label className="field">
          <span>Опыт</span>
          <input name="experience" placeholder="С нуля / уже в работе" />
        </label>
        <label className="field">
          <span>Что не получается</span>
          <input name="struggle" placeholder="Сколы, страх аппарата…" />
        </label>
        <label className="field">
          <span>Дата</span>
          <input name="preferredDate" type="date" />
        </label>
        <input type="hidden" name="interest" value={COURSE.title} />
        <button type="submit" className={dark ? 'cta-figma' : 'cta-figma'}>
          {submitLabel}
        </button>
        {sent && (
          <div className="toast" role="status">
            Заявка в CRM. Анастасия ответит в Telegram.
          </div>
        )}
        {error && <p className="form-error">{error}</p>}
      </div>
    </form>
  )
}
