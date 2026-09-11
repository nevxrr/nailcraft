import { Link, useNavigate, useParams } from 'react-router-dom'
import { Checklist } from '../components/Checklist'
import { StatusBadge } from '../components/StatusBadge'
import { useStore } from '../store/StoreContext'
import { deadlineMeta, formatDate, progressOf } from '../lib/utils'
import { STATUS_LABELS, STATUS_ORDER, type OrderStatus } from '../types'

export function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    getOrder,
    updateOrderStatus,
    updateAssignee,
    toggleChecklist,
    setStagePhoto,
    state,
  } = useStore()

  const order = id ? getOrder(id) : undefined

  if (!order) {
    return (
      <div className="detail-missing">
        <p>Заказ не найден</p>
        <Link to="/">К списку</Link>
      </div>
    )
  }

  const due = deadlineMeta(order.deadline)
  const progress = progressOf(order)
  const allDone = order.checklist.every((s) => s.done)
  const readOnly = order.status === 'shipped'

  function nextStatus(): OrderStatus | null {
    const i = STATUS_ORDER.indexOf(order!.status)
    if (i < 0 || i >= STATUS_ORDER.length - 1) return null
    return STATUS_ORDER[i + 1]
  }

  const next = nextStatus()

  return (
    <div className="detail-page">
      <header className="detail-header">
        <button type="button" className="back-btn" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" aria-hidden>
            <path
              d="M15 5 8 12l7 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Назад
        </button>
        <StatusBadge status={order.status} />
      </header>

      <section className="detail-hero">
        <p className="order-number">{order.number}</p>
        <h1>
          {order.collarType}{' '}
          <span className="order-size">{order.size}</span>
        </h1>
        <p className="detail-lead">
          {order.material} · {order.color}
        </p>
      </section>

      <section className="detail-grid">
        <div className="info-block">
          <span className="info-label">Срок готовности</span>
          <strong className={`deadline-${due.tone}`}>
            {formatDate(order.deadline)} · {due.label}
          </strong>
        </div>
        <div className="info-block">
          <span className="info-label">Ответственный</span>
          <label className="sr-only" htmlFor="assignee">
            Сотрудник
          </label>
          <select
            id="assignee"
            className="inline-select"
            value={order.assignee}
            disabled={readOnly}
            onChange={(e) => updateAssignee(order.id, e.target.value)}
          >
            {state.employees.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>
      </section>

      {order.notes && (
        <section className="notes-block">
          <span className="info-label">Заметка</span>
          <p>{order.notes}</p>
        </section>
      )}

      <section className="section-block">
        <div className="section-head">
          <h2>Этапы и фото</h2>
          <span>{progress}%</span>
        </div>
        <div className="progress-track thick" aria-hidden>
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <Checklist
          stages={order.checklist}
          readOnly={readOnly}
          onToggle={(stageId) => toggleChecklist(order.id, stageId)}
          onPhoto={(stageId, dataUrl) =>
            setStagePhoto(order.id, stageId, dataUrl)
          }
        />
      </section>

      <section className="section-block">
        <div className="section-head">
          <h2>Статус заказа</h2>
        </div>
        <div className="status-steps">
          {STATUS_ORDER.map((s) => (
            <button
              key={s}
              type="button"
              className={`status-step ${order.status === s ? 'current' : ''} ${
                STATUS_ORDER.indexOf(s) < STATUS_ORDER.indexOf(order.status)
                  ? 'passed'
                  : ''
              }`}
              disabled={readOnly && s !== order.status}
              onClick={() => updateOrderStatus(order.id, s)}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </section>

      {!readOnly && next && (
        <div className="sticky-actions">
          <button
            type="button"
            className="primary-btn"
            disabled={next === 'ready' && !allDone}
            onClick={() => updateOrderStatus(order.id, next)}
          >
            {next === 'in_progress' && 'Взять в работу'}
            {next === 'ready' &&
              (allDone
                ? 'Отметить готовым к выдаче'
                : 'Сначала завершите этапы')}
            {next === 'shipped' && 'Отгрузить клиенту'}
          </button>
        </div>
      )}
    </div>
  )
}
