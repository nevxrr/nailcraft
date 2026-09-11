export type OrderStatus =
  | 'accepted'
  | 'in_progress'
  | 'ready'
  | 'shipped'

export type ChecklistStageId = 'cutting' | 'stitching' | 'hardware'

export interface ChecklistStage {
  id: ChecklistStageId
  label: string
  done: boolean
  doneAt?: string
  photoDataUrl?: string
}

export interface Order {
  id: string
  number: string
  collarType: string
  size: string
  material: string
  color: string
  deadline: string
  assignee: string
  status: OrderStatus
  notes: string
  createdAt: string
  checklist: ChecklistStage[]
}

export interface Material {
  id: string
  name: string
  category: 'strap' | 'buckle' | 'carabiner' | 'other'
  unit: string
  quantity: number
  minQuantity: number
  color?: string
}

export interface AppState {
  orders: Order[]
  materials: Material[]
  employees: string[]
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  accepted: 'Принят',
  in_progress: 'В работе',
  ready: 'Готов к выдаче',
  shipped: 'Отгружен',
}

export const STATUS_ORDER: OrderStatus[] = [
  'accepted',
  'in_progress',
  'ready',
  'shipped',
]

export const COLLAR_TYPES = [
  'Классический',
  'Мартингейл',
  'Полуудавка',
  'Биотановый',
  'С ручкой',
]

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

export const MATERIALS_OPTIONS = [
  'Биотан',
  'Нейлоновая стропа',
  'Кожа',
  'Паракорд',
]

export const COLORS = [
  'Чёрный',
  'Олива',
  'Хаки',
  'Коричневый',
  'Синий',
  'Красный',
  'Бежевый',
]

export function createEmptyChecklist(): ChecklistStage[] {
  return [
    { id: 'cutting', label: 'Нарезка', done: false },
    { id: 'stitching', label: 'Прошивка', done: false },
    { id: 'hardware', label: 'Фурнитура', done: false },
  ]
}
