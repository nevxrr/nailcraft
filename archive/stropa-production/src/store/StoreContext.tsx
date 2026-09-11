import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { seedState } from '../data/seed'
import type {
  AppState,
  ChecklistStageId,
  Material,
  Order,
  OrderStatus,
} from '../types'
import { createEmptyChecklist } from '../types'

const STORAGE_KEY = 'stropa-production-v1'

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AppState
      if (parsed.orders && parsed.materials && parsed.employees) {
        return parsed
      }
    }
  } catch {
    /* ignore */
  }
  return structuredClone(seedState)
}

function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

interface StoreApi {
  state: AppState
  lowStock: Material[]
  activeOrders: Order[]
  getOrder: (id: string) => Order | undefined
  updateOrderStatus: (id: string, status: OrderStatus) => void
  updateAssignee: (id: string, assignee: string) => void
  toggleChecklist: (orderId: string, stageId: ChecklistStageId) => void
  setStagePhoto: (
    orderId: string,
    stageId: ChecklistStageId,
    photoDataUrl: string | undefined,
  ) => void
  addOrder: (input: Omit<Order, 'id' | 'number' | 'createdAt' | 'checklist' | 'status'> & {
    status?: OrderStatus
  }) => Order
  adjustMaterial: (id: string, delta: number) => void
  setMaterialQuantity: (id: string, quantity: number) => void
  resetDemo: () => void
}

const StoreContext = createContext<StoreApi | null>(null)

function nextOrderNumber(orders: Order[]): string {
  const nums = orders.map((o) => {
    const m = o.number.match(/(\d+)$/)
    return m ? Number(m[1]) : 0
  })
  const max = nums.length ? Math.max(...nums) : 1000
  return `ОШ-${max + 1}`
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState)

  useEffect(() => {
    saveState(state)
  }, [state])

  const lowStock = useMemo(
    () => state.materials.filter((m) => m.quantity <= m.minQuantity),
    [state.materials],
  )

  const activeOrders = useMemo(
    () => state.orders.filter((o) => o.status !== 'shipped'),
    [state.orders],
  )

  const getOrder = useCallback(
    (id: string) => state.orders.find((o) => o.id === id),
    [state.orders],
  )

  const updateOrderStatus = useCallback((id: string, status: OrderStatus) => {
    setState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) => (o.id === id ? { ...o, status } : o)),
    }))
  }, [])

  const updateAssignee = useCallback((id: string, assignee: string) => {
    setState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) => (o.id === id ? { ...o, assignee } : o)),
    }))
  }, [])

  const toggleChecklist = useCallback(
    (orderId: string, stageId: ChecklistStageId) => {
      setState((prev) => ({
        ...prev,
        orders: prev.orders.map((o) => {
          if (o.id !== orderId) return o
          return {
            ...o,
            checklist: o.checklist.map((s) => {
              if (s.id !== stageId) return s
              const done = !s.done
              return {
                ...s,
                done,
                doneAt: done ? new Date().toISOString() : undefined,
              }
            }),
            status:
              o.status === 'accepted'
                ? 'in_progress'
                : o.status,
          }
        }),
      }))
    },
    [],
  )

  const setStagePhoto = useCallback(
    (
      orderId: string,
      stageId: ChecklistStageId,
      photoDataUrl: string | undefined,
    ) => {
      setState((prev) => ({
        ...prev,
        orders: prev.orders.map((o) => {
          if (o.id !== orderId) return o
          return {
            ...o,
            checklist: o.checklist.map((s) =>
              s.id === stageId ? { ...s, photoDataUrl } : s,
            ),
          }
        }),
      }))
    },
    [],
  )

  const addOrder = useCallback(
    (
      input: Omit<Order, 'id' | 'number' | 'createdAt' | 'checklist' | 'status'> & {
        status?: OrderStatus
      },
    ) => {
      const order: Order = {
        ...input,
        id: `ord-${Date.now()}`,
        number: nextOrderNumber(state.orders),
        createdAt: new Date().toISOString(),
        checklist: createEmptyChecklist(),
        status: input.status ?? 'accepted',
      }
      setState((prev) => ({
        ...prev,
        orders: [order, ...prev.orders],
      }))
      return order
    },
    [state.orders],
  )

  const adjustMaterial = useCallback((id: string, delta: number) => {
    setState((prev) => ({
      ...prev,
      materials: prev.materials.map((m) =>
        m.id === id
          ? { ...m, quantity: Math.max(0, m.quantity + delta) }
          : m,
      ),
    }))
  }, [])

  const setMaterialQuantity = useCallback((id: string, quantity: number) => {
    setState((prev) => ({
      ...prev,
      materials: prev.materials.map((m) =>
        m.id === id ? { ...m, quantity: Math.max(0, quantity) } : m,
      ),
    }))
  }, [])

  const resetDemo = useCallback(() => {
    const fresh = structuredClone(seedState)
    setState(fresh)
    saveState(fresh)
  }, [])

  const api = useMemo(
    () => ({
      state,
      lowStock,
      activeOrders,
      getOrder,
      updateOrderStatus,
      updateAssignee,
      toggleChecklist,
      setStagePhoto,
      addOrder,
      adjustMaterial,
      setMaterialQuantity,
      resetDemo,
    }),
    [
      state,
      lowStock,
      activeOrders,
      getOrder,
      updateOrderStatus,
      updateAssignee,
      toggleChecklist,
      setStagePhoto,
      addOrder,
      adjustMaterial,
      setMaterialQuantity,
      resetDemo,
    ],
  )

  return (
    <StoreContext.Provider value={api}>{children}</StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
