import type { AppState, Order, Material } from '../types'
import { createEmptyChecklist } from '../types'

function daysFromNow(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function daysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

const checklistDone = (
  stages: Array<{ id: 'cutting' | 'stitching' | 'hardware'; done: boolean; photo?: boolean }>,
) => {
  const base = createEmptyChecklist()
  return base.map((s) => {
    const match = stages.find((x) => x.id === s.id)
    if (!match) return s
    return {
      ...s,
      done: match.done,
      doneAt: match.done ? daysAgo(1) : undefined,
      photoDataUrl: match.photo
        ? placeholderPhoto(s.label)
        : undefined,
    }
  })
}

/** Tiny SVG placeholder as data URL for demo photos */
function placeholderPhoto(label: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#3F6B4A"/>
        <stop offset="100%" stop-color="#1C2418"/>
      </linearGradient>
    </defs>
    <rect width="400" height="300" fill="url(#g)"/>
    <rect x="40" y="40" width="320" height="220" rx="8" fill="none" stroke="#C4A574" stroke-width="2" stroke-dasharray="8 6"/>
    <text x="200" y="150" text-anchor="middle" fill="#F7F9F5" font-family="sans-serif" font-size="22" font-weight="600">${label}</text>
    <text x="200" y="180" text-anchor="middle" fill="#C4A574" font-family="sans-serif" font-size="14">фотофиксация</text>
  </svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export const seedOrders: Order[] = [
  {
    id: 'ord-1',
    number: 'ОШ-1042',
    collarType: 'Классический',
    size: 'M',
    material: 'Биотан',
    color: 'Олива',
    deadline: daysFromNow(1),
    assignee: 'Иван',
    status: 'in_progress',
    notes: 'Клиент просил двойную строчку у пряжки',
    createdAt: daysAgo(2),
    checklist: checklistDone([
      { id: 'cutting', done: true, photo: true },
      { id: 'stitching', done: true },
      { id: 'hardware', done: false },
    ]),
  },
  {
    id: 'ord-2',
    number: 'ОШ-1043',
    collarType: 'Мартингейл',
    size: 'L',
    material: 'Нейлоновая стропа',
    color: 'Чёрный',
    deadline: daysFromNow(3),
    assignee: 'Мария',
    status: 'accepted',
    notes: '',
    createdAt: daysAgo(1),
    checklist: createEmptyChecklist(),
  },
  {
    id: 'ord-3',
    number: 'ОШ-1040',
    collarType: 'С ручкой',
    size: 'XL',
    material: 'Кожа',
    color: 'Коричневый',
    deadline: daysFromNow(0),
    assignee: 'Алексей',
    status: 'ready',
    notes: 'Готов, ждёт самовывоз',
    createdAt: daysAgo(5),
    checklist: checklistDone([
      { id: 'cutting', done: true, photo: true },
      { id: 'stitching', done: true, photo: true },
      { id: 'hardware', done: true, photo: true },
    ]),
  },
  {
    id: 'ord-4',
    number: 'ОШ-1038',
    collarType: 'Биотановый',
    size: 'S',
    material: 'Биотан',
    color: 'Синий',
    deadline: daysFromNow(-1),
    assignee: 'Отец',
    status: 'shipped',
    notes: '',
    createdAt: daysAgo(7),
    checklist: checklistDone([
      { id: 'cutting', done: true, photo: true },
      { id: 'stitching', done: true, photo: true },
      { id: 'hardware', done: true, photo: true },
    ]),
  },
  {
    id: 'ord-5',
    number: 'ОШ-1044',
    collarType: 'Полуудавка',
    size: 'M',
    material: 'Паракорд',
    color: 'Хаки',
    deadline: daysFromNow(2),
    assignee: 'Иван',
    status: 'accepted',
    notes: 'С гравировкой клички — Рекс',
    createdAt: daysAgo(0),
    checklist: createEmptyChecklist(),
  },
  {
    id: 'ord-6',
    number: 'ОШ-1041',
    collarType: 'Классический',
    size: 'L',
    material: 'Биотан',
    color: 'Чёрный',
    deadline: daysFromNow(1),
    assignee: 'Мария',
    status: 'in_progress',
    notes: '',
    createdAt: daysAgo(3),
    checklist: checklistDone([
      { id: 'cutting', done: true, photo: true },
      { id: 'stitching', done: false },
      { id: 'hardware', done: false },
    ]),
  },
]

export const seedMaterials: Material[] = [
  {
    id: 'mat-1',
    name: 'Стропа биотан 25 мм',
    category: 'strap',
    unit: 'м',
    quantity: 42,
    minQuantity: 15,
    color: 'Чёрный',
  },
  {
    id: 'mat-2',
    name: 'Стропа биотан 25 мм',
    category: 'strap',
    unit: 'м',
    quantity: 8,
    minQuantity: 15,
    color: 'Олива',
  },
  {
    id: 'mat-3',
    name: 'Стропа нейлон 20 мм',
    category: 'strap',
    unit: 'м',
    quantity: 55,
    minQuantity: 20,
    color: 'Чёрный',
  },
  {
    id: 'mat-4',
    name: 'Пряжка металлическая 25 мм',
    category: 'buckle',
    unit: 'шт',
    quantity: 34,
    minQuantity: 20,
  },
  {
    id: 'mat-5',
    name: 'Пряжка пластиковая 25 мм',
    category: 'buckle',
    unit: 'шт',
    quantity: 12,
    minQuantity: 25,
  },
  {
    id: 'mat-6',
    name: 'Карабин пружинный',
    category: 'carabiner',
    unit: 'шт',
    quantity: 6,
    minQuantity: 15,
  },
  {
    id: 'mat-7',
    name: 'Карабин винтовой',
    category: 'carabiner',
    unit: 'шт',
    quantity: 28,
    minQuantity: 10,
  },
  {
    id: 'mat-8',
    name: 'Полукольцо сварное 25 мм',
    category: 'other',
    unit: 'шт',
    quantity: 40,
    minQuantity: 20,
  },
]

export const seedEmployees = ['Отец', 'Иван', 'Мария', 'Алексей']

export const seedState: AppState = {
  orders: seedOrders,
  materials: seedMaterials,
  employees: seedEmployees,
}
