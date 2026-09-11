import { Link } from 'react-router-dom'
import type { Order } from '../types'
import { StatusBadge } from './StatusBadge'
import { deadlineMeta, progressOf } from '../lib/utils'

export function OrderCard({ order }: { order: Order }) {
  const due = deadlineMeta(order.deadline)
  const progress = progressOf(order)

  return (
    <Link to={`/orders/${order.id}`} className="order-card">
      <div className="order-card-top">
        <div>
          <p className="order-number">{order.number}</p>
          <h2 className="order-title">
            {order.collarType}
            <span className="order-size"> {order.size}</span>
          </h2>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <dl className="order-meta">
        <div>
          <dt>Материал</dt>
          <dd>
            {order.material}
            {order.color ? ` · ${order.color}` : ''}
          </dd>
        </div>
        <div>
          <dt>Ответственный</dt>
          <dd>{order.assignee}</dd>
        </div>
        <div>
          <dt>Срок</dt>
          <dd className={`deadline-${due.tone}`}>{due.label}</dd>
        </div>
      </dl>

      {order.status !== 'shipped' && order.status !== 'accepted' && (
        <div className="progress-row">
          <div className="progress-track" aria-hidden>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="progress-label">{progress}%</span>
        </div>
      )}
    </Link>
  )
}
