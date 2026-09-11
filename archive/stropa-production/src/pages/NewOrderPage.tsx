import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import {
  COLLAR_TYPES,
  COLORS,
  MATERIALS_OPTIONS,
  SIZES,
} from '../types'

function defaultDeadline(): string {
  const d = new Date()
  d.setDate(d.getDate() + 3)
  return d.toISOString().slice(0, 10)
}

export function NewOrderPage() {
  const { state, addOrder } = useStore()
  const navigate = useNavigate()

  const [collarType, setCollarType] = useState(COLLAR_TYPES[0])
  const [size, setSize] = useState('M')
  const [material, setMaterial] = useState(MATERIALS_OPTIONS[0])
  const [color, setColor] = useState(COLORS[0])
  const [deadline, setDeadline] = useState(defaultDeadline)
  const [assignee, setAssignee] = useState(state.employees[0] ?? 'Отец')
  const [notes, setNotes] = useState('')

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const order = addOrder({
      collarType,
      size,
      material,
      color,
      deadline,
      assignee,
      notes,
    })
    navigate(`/orders/${order.id}`, { replace: true })
  }

  return (
    <div className="form-page">
      <section className="page-intro">
        <h1>Новый заказ</h1>
        <p>Карточка сразу появится в работе у ответственного.</p>
      </section>

      <form className="order-form" onSubmit={onSubmit}>
        <label>
          Тип ошейника
          <select
            value={collarType}
            onChange={(e) => setCollarType(e.target.value)}
          >
            {COLLAR_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>

        <div className="form-row">
          <label>
            Размер
            <select value={size} onChange={(e) => setSize(e.target.value)}>
              {SIZES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            Цвет
            <select value={color} onChange={(e) => setColor(e.target.value)}>
              {COLORS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>

        <label>
          Материал
          <select
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
          >
            {MATERIALS_OPTIONS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>

        <label>
          Срок готовности
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />
        </label>

        <label>
          Ответственный сотрудник
          <select
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
          >
            {state.employees.map((emp) => (
              <option key={emp}>{emp}</option>
            ))}
          </select>
        </label>

        <label>
          Заметка
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Особые пожелания, гравировка, срочность…"
          />
        </label>

        <button type="submit" className="primary-btn">
          Создать заказ
        </button>
      </form>
    </div>
  )
}
