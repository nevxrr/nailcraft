import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

const STORAGE_KEY = 'nailcraft-v2'

interface AppState {
  enrolled: boolean
}

interface StoreApi {
  enrolled: boolean
  enroll: () => void
  reset: () => void
}

const defaultState: AppState = { enrolled: false }

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

  const enroll = useCallback(() => {
    setState({ enrolled: true })
  }, [])

  const reset = useCallback(() => {
    setState(defaultState)
  }, [])

  const api = useMemo<StoreApi>(
    () => ({
      enrolled: state.enrolled,
      enroll,
      reset,
    }),
    [state.enrolled, enroll, reset],
  )

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export function useStore() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore outside provider')
  return ctx
}
