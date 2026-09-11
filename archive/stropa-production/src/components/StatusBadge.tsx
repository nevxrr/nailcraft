import type { OrderStatus } from '../types'
import { STATUS_LABELS } from '../types'

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`status-badge status-${status}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}
