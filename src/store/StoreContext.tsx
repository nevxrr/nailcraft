import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

const STORAGE_KEY = 'nailcraft-v1'

interface Booking {
  slotId: string
  name: string
  phone: string
  createdAt: string
}

interface AppState {
  userName: string
  enrolledCourseIds: string[]
  bookings: Booking[]
  lessonProgress: Record<string, boolean>
}

interface StoreApi {
  state: AppState
  isLoggedIn: boolean
  hasAccess: boolean
  login: (name: string) => void
  logout: () => void
  enroll: (courseId: string) => void
  isEnrolled: (courseId: string) => boolean
  bookSlot: (slotId: string, name: string, phone: string) => void
  hasBooking: (slotId: string) => boolean
  toggleLesson: (lessonId: string) => void
}

const defaultState: AppState = {
  userName: '',
  enrolledCourseIds: [],
  bookings: [],
  lessonProgress: {},
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...defaultState, ...JSON.parse(raw) }
  } catch {
    /* ignore */
  }
  return { ...defaultState }
}

const Ctx = createContext<StoreApi | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(load)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const login = useCallback((name: string) => {
    setState((s) => ({ ...s, userName: name.trim() || 'Ученица' }))
  }, [])

  const logout = useCallback(() => {
    setState(defaultState)
  }, [])

  const enroll = useCallback((courseId: string) => {
    setState((s) => ({
      ...s,
      userName: s.userName || 'Ученица',
      enrolledCourseIds: s.enrolledCourseIds.includes(courseId)
        ? s.enrolledCourseIds
        : [...s.enrolledCourseIds, courseId],
    }))
  }, [])

  const isEnrolled = useCallback(
    (courseId: string) => state.enrolledCourseIds.includes(courseId),
    [state.enrolledCourseIds],
  )

  const bookSlot = useCallback((slotId: string, name: string, phone: string) => {
    setState((s) => {
      if (s.bookings.some((b) => b.slotId === slotId)) return s
      return {
        ...s,
        bookings: [
          ...s.bookings,
          { slotId, name, phone, createdAt: new Date().toISOString() },
        ],
      }
    })
  }, [])

  const hasBooking = useCallback(
    (slotId: string) => state.bookings.some((b) => b.slotId === slotId),
    [state.bookings],
  )

  const toggleLesson = useCallback((lessonId: string) => {
    setState((s) => ({
      ...s,
      lessonProgress: {
        ...s.lessonProgress,
        [lessonId]: !s.lessonProgress[lessonId],
      },
    }))
  }, [])

  const api = useMemo<StoreApi>(
    () => ({
      state,
      isLoggedIn: Boolean(state.userName),
      hasAccess: state.enrolledCourseIds.length > 0,
      login,
      logout,
      enroll,
      isEnrolled,
      bookSlot,
      hasBooking,
      toggleLesson,
    }),
    [
      state,
      login,
      logout,
      enroll,
      isEnrolled,
      bookSlot,
      hasBooking,
      toggleLesson,
    ],
  )

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export function useStore() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore outside provider')
  return ctx
}
