import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { api, apiMode, detectApiMode, getToken, setToken } from '../lib/api'
import type {
  AuthConfig,
  CabinetPayload,
  CrmOverview,
  Lead,
  LeadDraft,
  LeadStatus,
  PublicUser,
  TelegramAuthPayload,
} from '../lib/types'

interface StoreApi {
  ready: boolean
  mode: 'remote' | 'local'
  config: AuthConfig
  user: PublicUser | null
  enrolled: boolean
  cabinet: CabinetPayload | null
  crm: CrmOverview | null
  error: string
  loginTelegram: (payload: TelegramAuthPayload) => Promise<PublicUser>
  loginDev: (kind: 'student' | 'teacher') => Promise<PublicUser>
  logout: () => void
  testPay: () => Promise<void>
  submitLead: (draft: LeadDraft) => Promise<void>
  bookGroup: (groupId: string) => Promise<void>
  refreshCabinet: () => Promise<void>
  refreshCrm: () => Promise<void>
  setLeadStatus: (id: string, status: LeadStatus) => Promise<void>
  saveLeadNotes: (id: string, notes: string) => Promise<void>
  saveStudentNotes: (id: string, notes: string) => Promise<void>
  assignStudent: (groupId: string, studentId: string) => Promise<void>
  removeSeat: (groupId: string, studentId: string) => Promise<void>
  createGroup: (input: { date: string; time: string; topic: string }) => Promise<void>
  markPaid: (studentId: string) => Promise<void>
}

const defaultConfig: AuthConfig = {
  botUsername: '',
  widgetEnabled: false,
  allowDevLogin: true,
  teacherConfigured: false,
}

const Ctx = createContext<StoreApi | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [mode, setMode] = useState<'remote' | 'local'>('local')
  const [config, setConfig] = useState<AuthConfig>(defaultConfig)
  const [user, setUser] = useState<PublicUser | null>(null)
  const [cabinet, setCabinet] = useState<CabinetPayload | null>(null)
  const [crm, setCrm] = useState<CrmOverview | null>(null)
  const [error, setError] = useState('')

  const refreshCabinet = useCallback(async () => {
    if (!getToken()) {
      setCabinet(null)
      return
    }
    const next = await api.cabinet()
    setCabinet(next)
    setUser(next.user)
  }, [])

  const refreshCrm = useCallback(async () => {
    if (!getToken()) {
      setCrm(null)
      return
    }
    try {
      setCrm(await api.crm())
    } catch {
      setCrm(null)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const detected = await detectApiMode()
      if (cancelled) return
      setMode(detected)
      const nextConfig = await api.config()
      if (cancelled) return
      setConfig(nextConfig)
      if (getToken()) {
        try {
          const me = await api.me()
          if (cancelled) return
          setUser(me.user)
          await refreshCabinet()
          if (me.user.role === 'teacher') await refreshCrm()
        } catch {
          setToken('')
          setUser(null)
        }
      }
      if (!cancelled) setReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [refreshCabinet, refreshCrm])

  const afterLogin = useCallback(
    async (next: PublicUser) => {
      setUser(next)
      setError('')
      await refreshCabinet()
      if (next.role === 'teacher') await refreshCrm()
      else setCrm(null)
    },
    [refreshCabinet, refreshCrm],
  )

  const loginTelegram = useCallback(
    async (payload: TelegramAuthPayload) => {
      const result = await api.telegram(payload)
      await afterLogin(result.user)
      return result.user
    },
    [afterLogin],
  )

  const loginDev = useCallback(
    async (kind: 'student' | 'teacher') => {
      const result = await api.dev(kind)
      await afterLogin(result.user)
      return result.user
    },
    [afterLogin],
  )

  const logout = useCallback(() => {
    setToken('')
    setUser(null)
    setCabinet(null)
    setCrm(null)
  }, [])

  const testPay = useCallback(async () => {
    const result = await api.testPay()
    setUser(result.user)
    await refreshCabinet()
    if (result.user.role === 'teacher') await refreshCrm()
  }, [refreshCabinet, refreshCrm])

  const submitLead = useCallback(async (draft: LeadDraft) => {
    await api.lead(draft)
    if (user?.role === 'teacher') await refreshCrm()
  }, [refreshCrm, user?.role])

  const bookGroup = useCallback(async (groupId: string) => {
    await api.book(groupId)
    await refreshCabinet()
    if (user?.role === 'teacher') await refreshCrm()
  }, [refreshCabinet, refreshCrm, user?.role])

  const setLeadStatus = useCallback(
    async (id: string, status: LeadStatus) => {
      const { lead } = await api.patchLead(id, { status })
      setCrm((prev) =>
        prev
          ? { ...prev, leads: prev.leads.map((item) => (item.id === id ? lead : item)) }
          : prev,
      )
    },
    [],
  )

  const saveLeadNotes = useCallback(async (id: string, notes: string) => {
    const { lead } = await api.patchLead(id, { notes })
    setCrm((prev) =>
      prev
        ? { ...prev, leads: prev.leads.map((item) => (item.id === id ? lead : item)) }
        : prev,
    )
  }, [])

  const saveStudentNotes = useCallback(async (id: string, notes: string) => {
    const { student } = await api.patchStudent(id, { notes })
    setCrm((prev) =>
      prev
        ? { ...prev, students: prev.students.map((item) => (item.id === id ? student : item)) }
        : prev,
    )
  }, [])

  const assignStudent = useCallback(
    async (groupId: string, studentId: string) => {
      await api.assign(groupId, studentId)
      await refreshCrm()
      await refreshCabinet()
    },
    [refreshCabinet, refreshCrm],
  )

  const removeSeat = useCallback(
    async (groupId: string, studentId: string) => {
      await api.removeSeat(groupId, studentId)
      await refreshCrm()
      await refreshCabinet()
    },
    [refreshCabinet, refreshCrm],
  )

  const createGroup = useCallback(
    async (input: { date: string; time: string; topic: string }) => {
      await api.createGroup(input)
      await refreshCrm()
    },
    [refreshCrm],
  )

  const markPaid = useCallback(
    async (studentId: string) => {
      await api.addPayment({ studentId, status: 'paid' })
      await refreshCrm()
      await refreshCabinet()
    },
    [refreshCabinet, refreshCrm],
  )

  const apiValue = useMemo<StoreApi>(
    () => ({
      ready,
      mode: mode || apiMode(),
      config,
      user,
      enrolled: Boolean(user?.enrolled || cabinet?.enrolled),
      cabinet,
      crm,
      error,
      loginTelegram,
      loginDev,
      logout,
      testPay,
      submitLead,
      bookGroup,
      refreshCabinet,
      refreshCrm,
      setLeadStatus,
      saveLeadNotes,
      saveStudentNotes,
      assignStudent,
      removeSeat,
      createGroup,
      markPaid,
    }),
    [
      ready,
      mode,
      config,
      user,
      cabinet,
      crm,
      error,
      loginTelegram,
      loginDev,
      logout,
      testPay,
      submitLead,
      bookGroup,
      refreshCabinet,
      refreshCrm,
      setLeadStatus,
      saveLeadNotes,
      saveStudentNotes,
      assignStudent,
      removeSeat,
      createGroup,
      markPaid,
    ],
  )

  return <Ctx.Provider value={apiValue}>{children}</Ctx.Provider>
}

export function useStore() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore outside provider')
  return ctx
}

export function displayName(user: Pick<PublicUser, 'firstName' | 'lastName'> | null) {
  if (!user) return 'Гость'
  return [user.firstName, user.lastName].filter(Boolean).join(' ')
}

export function telegramHref(user: Pick<PublicUser, 'username'> | Lead | { username?: string; contact?: string }) {
  if ('username' in user && user.username) return `https://t.me/${user.username.replace(/^@/, '')}`
  if ('contact' in user && user.contact?.startsWith('@')) {
    return `https://t.me/${user.contact.slice(1)}`
  }
  return 'https://t.me/'
}
