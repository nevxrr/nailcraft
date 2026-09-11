import { useMemo, useState } from 'react'
import { useStore } from '../store/StoreContext'
import type { Material } from '../types'

const CATEGORY_LABELS: Record<Material['category'], string> = {
  strap: 'Стропы',
  buckle: 'Пряжки',
  carabiner: 'Карабины',
  other: 'Прочее',
}

export function WarehousePage() {
  const { state, lowStock, adjustMaterial, setMaterialQuantity, resetDemo } =
    useStore()
  const [onlyLow, setOnlyLow] = useState(false)

  const groups = useMemo(() => {
    const list = onlyLow
      ? state.materials.filter((m) => m.quantity <= m.minQuantity)
      : state.materials
    const map = new Map<Material['category'], Material[]>()
    for (const m of list) {
      const arr = map.get(m.category) ?? []
      arr.push(m)
      map.set(m.category, arr)
    }
    return Array.from(map.entries())
  }, [state.materials, onlyLow])

  return (
    <div className="warehouse-page">
      <section className="page-intro">
        <h1>Склад</h1>
        <p>Остатки строп, пряжек и карабинов.</p>
      </section>

      {lowStock.length > 0 && (
        <div className="low-stock-banner" role="status">
          <div>
            <strong>Заканчивается</strong>
            <p>
              {lowStock.map((m) => m.name + (m.color ? ` (${m.color})` : '')).join(' · ')}
            </p>
          </div>
          <button
            type="button"
            className="text-btn"
            onClick={() => setOnlyLow(true)}
          >
            Показать
          </button>
        </div>
      )}

      <div className="warehouse-toolbar">
        <button
          type="button"
          className={`filter-chip ${!onlyLow ? 'active' : ''}`}
          onClick={() => setOnlyLow(false)}
        >
          Все материалы
        </button>
        <button
          type="button"
          className={`filter-chip ${onlyLow ? 'active' : ''}`}
          onClick={() => setOnlyLow(true)}
        >
          На исходе
          <span className="chip-count">{lowStock.length}</span>
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="empty-state">
          <p>Всё в норме</p>
          <span>Нет материалов с низким остатком</span>
        </div>
      ) : (
        groups.map(([category, items]) => (
          <section key={category} className="material-group">
            <h2>{CATEGORY_LABELS[category]}</h2>
            <ul className="material-list">
              {items.map((m) => {
                const low = m.quantity <= m.minQuantity
                const pct = Math.min(
                  100,
                  Math.round((m.quantity / Math.max(m.minQuantity * 2, 1)) * 100),
                )
                return (
                  <li
                    key={m.id}
                    className={`material-item ${low ? 'is-low' : ''}`}
                  >
                    <div className="material-info">
                      <p className="material-name">
                        {m.name}
                        {m.color ? (
                          <span className="material-color"> · {m.color}</span>
                        ) : null}
                      </p>
                      <p className="material-meta">
                        мин. {m.minQuantity} {m.unit}
                        {low && <span className="low-tag"> мало</span>}
                      </p>
                      <div className="stock-track" aria-hidden>
                        <div
                          className={`stock-fill ${low ? 'low' : ''}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <div className="qty-controls">
                      <button
                        type="button"
                        aria-label="Минус"
                        onClick={() => adjustMaterial(m.id, -1)}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        value={m.quantity}
                        aria-label={`Количество, ${m.unit}`}
                        onChange={(e) =>
                          setMaterialQuantity(m.id, Number(e.target.value) || 0)
                        }
                      />
                      <button
                        type="button"
                        aria-label="Плюс"
                        onClick={() => adjustMaterial(m.id, 1)}
                      >
                        +
                      </button>
                      <span className="qty-unit">{m.unit}</span>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        ))
      )}

      <button type="button" className="ghost-btn reset-demo" onClick={resetDemo}>
        Сбросить демо-данные
      </button>
    </div>
  )
}
