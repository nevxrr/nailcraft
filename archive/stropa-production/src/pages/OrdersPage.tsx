import { useMemo, useState } from 'react'
import { OrderCard } from '../components/OrderCard'
import { useStore } from '../store/StoreContext'
import type { OrderStatus } from '../types'
import { STATUS_LABELS, STATUS_ORDER } from '../types'

type Filter = 'all' | OrderStatus | 'mine'

export function OrdersPage() {
  const { state } = useStore()
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: state.orders.length }
    for (const s of STATUS_ORDER) {
      c[s] = state.orders.filter((o) => o.status === s).length
    }
    return c
  }, [state.orders])

  const filtered = useMemo(() => {
    let list = [...state.orders]
    if (filter !== 'all' && filter !== 'mine') {
      list = list.filter((o) => o.status === filter)
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter(
        (o) =>
          o.number.toLowerCase().includes(q) ||
          o.collarType.toLowerCase().includes(q) ||
          o.assignee.toLowerCase().includes(q) ||
          o.color.toLowerCase().includes(q) ||
          o.material.toLowerCase().includes(q),
      )
    }
    const rank: Record<OrderStatus, number> = {
      in_progress: 0,
      accepted: 1,
      ready: 2,
      shipped: 3,
    }
    return list.sort((a, b) => {
      const r = rank[a.status] - rank[b.status]
      if (r !== 0) return r
      return a.deadline.localeCompare(b.deadline)
    })
  }, [state.orders, filter, query])

  const filters: { id: Filter; label: string }[] = [
    { id: 'all', label: 'Все' },
    ...STATUS_ORDER.map((s) => ({ id: s as Filter, label: STATUS_LABELS[s] })),
  ]

  return (
    <div className="orders-page">
      <section className="page-intro">
        <h1>Заказы</h1>
        <p>Кто делает, на каком этапе и когда сдаст.</p>
      </section>

      <div className="search-wrap">
        <input
          type="search"
          className="search-input"
          placeholder="Номер, тип, сотрудник…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          enterKeyHint="search"
        />
      </div>

      <div className="filter-scroll" role="tablist" aria-label="Статус">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            className={`filter-chip ${filter === f.id ? 'active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
            <span className="chip-count">{counts[f.id] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="order-list">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <p>Заказов не найдено</p>
            <span>Измените фильтр или добавьте новый заказ</span>
          </div>
        ) : (
          filtered.map((order) => <OrderCard key={order.id} order={order} />)
        )}
      </div>
    </div>
  )
}
