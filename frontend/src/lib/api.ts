import { COURSE, SALES_SCRIPTS, STARTER_GROUPS, STARTER_LEADS } from '../data/content'
import type {
  AuthConfig,
  AuthResult,
  CabinetPayload,
  CrmOverview,
  Group,
  Lead,
  LeadDraft,
  LeadStatus,
  Payment,
  PaymentKind,
  PaymentStatus,
  PublicUser,
  StudentCard,
  TelegramAuthPayload,
} from './types'

const TOKEN_KEY = 'nailcraft-token'
const LOCAL_KEY = 'nailcraft-v3'
const DEMO_TEACHER_ID = 1
const DEMO_STUDENT = {
  id: 900001,
  first_name: 'Мария',
  last_name: 'Иванова',
  username: 'maria_nails',
}

export function apiBase(): string | null {
  const configured = import.meta.env.VITE_API_URL?.trim()
  if (configured) return configured.replace(/\/$/, '')
  if (import.meta.env.DEV) return ''
  return null
}

export function getToken(): string {
  return localStorage.getItem(TOKEN_KEY) ?? ''
}

export function setToken(token: string) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const base = apiBase()
  if (base === null) throw new Error('local_mode')
  const headers = new Headers(init.headers)
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json')
  }
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const res = await fetch(`${base}${path}`, { ...init, headers })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `http_${res.status}`)
  }
  return res.json() as Promise<T>
}

export const remote = {
  health: () => request<{ ok: boolean }>('/api/health'),
  config: () => request<AuthConfig>('/api/auth/config'),
  telegram: (payload: TelegramAuthPayload) =>
    request<AuthResult>('/api/auth/telegram', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  dev: (kind: 'student' | 'teacher') =>
    request<AuthResult>('/api/auth/dev', {
      method: 'POST',
      body: JSON.stringify({ kind }),
    }),
  me: () => request<{ user: PublicUser }>('/api/me'),
  lead: (draft: LeadDraft) =>
    request<{ lead: Lead }>('/api/leads', {
      method: 'POST',
      body: JSON.stringify(draft),
    }),
  testPay: () => request<{ user: PublicUser; enrolled: boolean }>('/api/pay/test', { method: 'POST' }),
  cabinet: () => request<CabinetPayload>('/api/cabinet'),
  book: (groupId: string) =>
    request<{ group: Group; cabinet: CabinetPayload }>(`/api/groups/${groupId}/book`, {
      method: 'POST',
    }),
  crm: () => request<CrmOverview>('/api/crm/overview'),
  patchLead: (id: string, patch: Partial<Lead>) =>
    request<{ lead: Lead }>(`/api/crm/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    }),
  patchStudent: (id: string, patch: Partial<PublicUser> & { notes?: string }) =>
    request<{ student: StudentCard }>(`/api/crm/students/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    }),
  createGroup: (input: { date: string; time: string; topic: string }) =>
    request<{ group: Group }>('/api/crm/groups', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  assign: (groupId: string, studentId: string) =>
    request<{ group: Group }>(`/api/crm/groups/${groupId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ studentId }),
    }),
  removeSeat: (groupId: string, studentId: string) =>
    request<{ group: Group }>(`/api/crm/groups/${groupId}/remove`, {
      method: 'POST',
      body: JSON.stringify({ studentId }),
    }),
  addPayment: (input: {
    studentId: string
    amount?: number
    kind?: PaymentKind
    status?: PaymentStatus
    note?: string
  }) =>
    request<{ payment: Payment }>('/api/crm/payments', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
}

interface LocalUser extends PublicUser {
  notes: string
  createdAt: string
}

interface LocalDb {
  users: LocalUser[]
  leads: Lead[]
  groups: Group[]
  payments: Payment[]
}

function teacherIds(): number[] {
  const fromEnv = (import.meta.env.VITE_TELEGRAM_TEACHER_IDS ?? '')
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((id) => Number.isFinite(id) && id > 0)
  return fromEnv.length > 0 ? fromEnv : [DEMO_TEACHER_ID]
}

function emptyGroup(partial: Omit<Group, 'seatsLeft' | 'students' | 'status'> & { status?: Group['status'] }): Group {
  const studentIds = partial.studentIds ?? []
  return {
    ...partial,
    seats: 2,
    studentIds,
    status: studentIds.length >= 2 ? 'full' : (partial.status ?? 'open'),
    seatsLeft: Math.max(0, 2 - studentIds.length),
    students: [],
  }
}

function defaultLocal(): LocalDb {
  return {
    users: [],
    leads: STARTER_LEADS.map((lead) => ({ ...lead })),
    groups: STARTER_GROUPS.map((group) => emptyGroup({ ...group })),
    payments: [],
  }
}

function loadLocal(): LocalDb {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    if (raw) {
      const parsed = { ...defaultLocal(), ...JSON.parse(raw) } as LocalDb
      parsed.groups = parsed.groups.map((group) => hydrateGroup(group, parsed.users))
      return parsed
    }
  } catch {
    /* ignore */
  }
  return defaultLocal()
}

let localDb = loadLocal()

function saveLocal() {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(localDb))
}

function displayName(user: PublicUser) {
  return [user.firstName, user.lastName].filter(Boolean).join(' ')
}

function hydrateGroup(group: Group, users: LocalUser[]): Group {
  const studentIds = group.studentIds ?? []
  return {
    ...group,
    seats: 2,
    studentIds,
    seatsLeft: Math.max(0, 2 - studentIds.length),
    status: group.status === 'done' ? 'done' : studentIds.length >= 2 ? 'full' : 'open',
    students: studentIds.map((id) => {
      const user = users.find((item) => item.id === id)
      return user
        ? {
            id: user.id,
            name: displayName(user),
            username: user.username,
            photoUrl: user.photoUrl,
          }
        : { id, name: 'Ученица', username: '', photoUrl: '' }
    }),
  }
}

function localUserFromTelegram(payload: TelegramAuthPayload): LocalUser {
  const telegramId = Number(payload.id)
  const role = teacherIds().includes(telegramId) ? 'teacher' : 'student'
  const existing = localDb.users.find((user) => user.telegramId === telegramId)
  if (existing) {
    existing.firstName = payload.first_name || existing.firstName
    existing.lastName = payload.last_name ?? existing.lastName
    existing.username = payload.username ?? existing.username
    existing.photoUrl = payload.photo_url ?? existing.photoUrl
    existing.role = role
    saveLocal()
    return existing
  }
  const user: LocalUser = {
    id: `u_${telegramId}`,
    telegramId,
    firstName: payload.first_name,
    lastName: payload.last_name ?? '',
    username: payload.username ?? '',
    photoUrl: payload.photo_url ?? '',
    role,
    phone: '',
    experience: '',
    pains: '',
    enrolled: role === 'teacher',
    notes: '',
    createdAt: new Date().toISOString(),
  }
  localDb.users.push(user)
  saveLocal()
  return user
}

function publicOf(user: LocalUser): PublicUser {
  const { notes: _notes, createdAt: _createdAt, ...rest } = user
  void _notes
  void _createdAt
  return rest
}

function cabinetOf(user: LocalUser): CabinetPayload {
  const groups = localDb.groups.map((group) => hydrateGroup(group, localDb.users))
  return {
    user: publicOf(user),
    enrolled: user.enrolled || user.role === 'teacher',
    bookings: groups.filter((group) => group.studentIds.includes(user.id)),
    groups,
    payments: localDb.payments.filter((item) => item.studentId === user.id),
    progress: {
      lessonsTotal: 0,
      lessonsDone: 0,
      hint: 'Уроки появятся таблицами. Пока — каркас дня.',
    },
  }
}

function studentCard(user: LocalUser): StudentCard {
  return {
    ...publicOf(user),
    notes: user.notes,
    createdAt: user.createdAt,
    payments: localDb.payments.filter((item) => item.studentId === user.id),
    groups: localDb.groups
      .filter((group) => group.studentIds.includes(user.id))
      .map((group) => hydrateGroup(group, localDb.users)),
  }
}

function currentLocalUser(): LocalUser | null {
  const token = getToken()
  if (!token.startsWith('local:')) return null
  return localDb.users.find((user) => user.id === token.slice(6)) ?? null
}

function requireLocal(): LocalUser {
  const user = currentLocalUser()
  if (!user) throw new Error('unauthorized')
  return user
}

export const local = {
  config(): AuthConfig {
    const botUsername = (import.meta.env.VITE_TELEGRAM_BOT_USERNAME ?? '').replace(/^@/, '')
    return {
      botUsername,
      widgetEnabled: false,
      allowDevLogin: true,
      teacherConfigured: true,
    }
  },
  telegram(payload: TelegramAuthPayload): AuthResult {
    const user = localUserFromTelegram(payload)
    const token = `local:${user.id}`
    setToken(token)
    return { token, user: publicOf(user) }
  },
  dev(kind: 'student' | 'teacher'): AuthResult {
    if (kind === 'teacher') {
      return local.telegram({
        id: teacherIds()[0] ?? DEMO_TEACHER_ID,
        first_name: 'Анастасия',
        last_name: 'Захватова',
        username: 'nailcraft',
        auth_date: Math.floor(Date.now() / 1000),
        hash: 'local',
      })
    }
    return local.telegram({
      ...DEMO_STUDENT,
      auth_date: Math.floor(Date.now() / 1000),
      hash: 'local',
    })
  },
  me(): { user: PublicUser } {
    return { user: publicOf(requireLocal()) }
  },
  lead(draft: LeadDraft): { lead: Lead } {
    const lead: Lead = {
      id: `lead_${crypto.randomUUID().slice(0, 8)}`,
      name: draft.name.trim(),
      contact: draft.contact.trim(),
      interest: draft.interest?.trim() || COURSE.title,
      experience: draft.experience?.trim() || '',
      struggle: draft.struggle?.trim() || '',
      preferredDate: draft.preferredDate?.trim() || '',
      status: 'new',
      source: draft.source === 'magnet' ? 'magnet' : 'landing',
      notes: '',
      studentId: '',
      createdAt: new Date().toISOString(),
    }
    localDb.leads.unshift(lead)
    saveLocal()
    return { lead }
  },
  testPay(): { user: PublicUser; enrolled: boolean } {
    const user = requireLocal()
    user.enrolled = true
    localDb.payments.unshift({
      id: `pay_${crypto.randomUUID().slice(0, 8)}`,
      studentId: user.id,
      amount: COURSE.price,
      kind: 'course',
      status: 'test',
      note: 'Тест · без эквайринга',
      createdAt: new Date().toISOString(),
    })
    saveLocal()
    return { user: publicOf(user), enrolled: true }
  },
  cabinet(): CabinetPayload {
    return cabinetOf(requireLocal())
  },
  book(groupId: string): { group: Group; cabinet: CabinetPayload } {
    const user = requireLocal()
    if (!user.enrolled && user.role !== 'teacher') throw new Error('not_enrolled')
    const group = localDb.groups.find((item) => item.id === groupId)
    if (!group) throw new Error('group_not_found')
    if (!group.studentIds.includes(user.id)) {
      if (group.studentIds.length >= 2) throw new Error('group_full')
      group.studentIds.push(user.id)
    }
    localDb.groups = localDb.groups.map((item) => hydrateGroup(item, localDb.users))
    saveLocal()
    const next = localDb.groups.find((item) => item.id === groupId)!
    return { group: next, cabinet: cabinetOf(user) }
  },
  crm(): CrmOverview {
    const user = requireLocal()
    if (user.role !== 'teacher') throw new Error('teacher_only')
    return {
      leads: localDb.leads,
      students: localDb.users.filter((item) => item.role === 'student').map(studentCard),
      groups: localDb.groups.map((group) => hydrateGroup(group, localDb.users)),
      payments: localDb.payments,
      scripts: SALES_SCRIPTS.map((script) => ({ ...script })),
    }
  },
  patchLead(id: string, patch: Partial<Lead>): { lead: Lead } {
    requireLocal()
    const lead = localDb.leads.find((item) => item.id === id)
    if (!lead) throw new Error('lead_not_found')
    if (patch.status) lead.status = patch.status
    if (typeof patch.notes === 'string') lead.notes = patch.notes
    saveLocal()
    return { lead }
  },
  patchStudent(id: string, patch: Partial<PublicUser> & { notes?: string }): { student: StudentCard } {
    requireLocal()
    const user = localDb.users.find((item) => item.id === id)
    if (!user) throw new Error('student_not_found')
    if (typeof patch.notes === 'string') user.notes = patch.notes
    if (typeof patch.experience === 'string') user.experience = patch.experience
    if (typeof patch.pains === 'string') user.pains = patch.pains
    if (typeof patch.phone === 'string') user.phone = patch.phone
    if (typeof patch.enrolled === 'boolean') user.enrolled = patch.enrolled
    saveLocal()
    return { student: studentCard(user) }
  },
  createGroup(input: { date: string; time: string; topic: string }): { group: Group } {
    requireLocal()
    const group = emptyGroup({
      id: `g_${crypto.randomUUID().slice(0, 8)}`,
      date: input.date,
      time: input.time,
      topic: input.topic || COURSE.title,
      seats: 2,
      studentIds: [],
    })
    localDb.groups.unshift(group)
    saveLocal()
    return { group }
  },
  assign(groupId: string, studentId: string): { group: Group } {
    requireLocal()
    const group = localDb.groups.find((item) => item.id === groupId)
    const student = localDb.users.find((item) => item.id === studentId)
    if (!group || !student) throw new Error('not_found')
    if (!group.studentIds.includes(studentId) && group.studentIds.length < 2) {
      group.studentIds.push(studentId)
      student.enrolled = true
    }
    const next = hydrateGroup(group, localDb.users)
    Object.assign(group, next)
    saveLocal()
    return { group: next }
  },
  removeSeat(groupId: string, studentId: string): { group: Group } {
    requireLocal()
    const group = localDb.groups.find((item) => item.id === groupId)
    if (!group) throw new Error('group_not_found')
    group.studentIds = group.studentIds.filter((id) => id !== studentId)
    const next = hydrateGroup(group, localDb.users)
    Object.assign(group, next)
    saveLocal()
    return { group: next }
  },
  addPayment(input: {
    studentId: string
    amount?: number
    kind?: PaymentKind
    status?: PaymentStatus
    note?: string
  }): { payment: Payment } {
    requireLocal()
    const student = localDb.users.find((item) => item.id === input.studentId)
    if (!student) throw new Error('student_not_found')
    const kind = input.kind === 'internship' ? 'internship' : 'course'
    const status = input.status === 'pending' || input.status === 'test' ? input.status : 'paid'
    const payment: Payment = {
      id: `pay_${crypto.randomUUID().slice(0, 8)}`,
      studentId: student.id,
      amount: input.amount || (kind === 'internship' ? COURSE.internship : COURSE.price),
      kind,
      status,
      note: input.note ?? '',
      createdAt: new Date().toISOString(),
    }
    localDb.payments.unshift(payment)
    if (status === 'paid' || status === 'test') student.enrolled = true
    saveLocal()
    return { payment }
  },
}

export type ApiMode = 'remote' | 'local'

let mode: ApiMode = apiBase() === null ? 'local' : 'remote'

export function apiMode(): ApiMode {
  return mode
}

export async function detectApiMode(): Promise<ApiMode> {
  if (apiBase() === null) {
    mode = 'local'
    return mode
  }
  try {
    await remote.health()
    mode = 'remote'
  } catch {
    mode = 'local'
  }
  return mode
}

function isRemote() {
  return mode === 'remote'
}

export const api = {
  async config(): Promise<AuthConfig> {
    if (isRemote()) {
      try {
        return await remote.config()
      } catch {
        mode = 'local'
      }
    }
    return local.config()
  },
  async telegram(payload: TelegramAuthPayload): Promise<AuthResult> {
    if (isRemote()) {
      const result = await remote.telegram(payload)
      setToken(result.token)
      return result
    }
    return local.telegram(payload)
  },
  async dev(kind: 'student' | 'teacher'): Promise<AuthResult> {
    if (isRemote()) {
      const result = await remote.dev(kind)
      setToken(result.token)
      return result
    }
    return local.dev(kind)
  },
  async me(): Promise<{ user: PublicUser }> {
    return isRemote() ? remote.me() : local.me()
  },
  async lead(draft: LeadDraft) {
    return isRemote() ? remote.lead(draft) : local.lead(draft)
  },
  async testPay() {
    return isRemote() ? remote.testPay() : local.testPay()
  },
  async cabinet() {
    return isRemote() ? remote.cabinet() : local.cabinet()
  },
  async book(groupId: string) {
    return isRemote() ? remote.book(groupId) : local.book(groupId)
  },
  async crm() {
    return isRemote() ? remote.crm() : local.crm()
  },
  async patchLead(id: string, patch: Partial<Lead>) {
    return isRemote() ? remote.patchLead(id, patch) : local.patchLead(id, patch)
  },
  async patchStudent(id: string, patch: Partial<PublicUser> & { notes?: string }) {
    return isRemote() ? remote.patchStudent(id, patch) : local.patchStudent(id, patch)
  },
  async createGroup(input: { date: string; time: string; topic: string }) {
    return isRemote() ? remote.createGroup(input) : local.createGroup(input)
  },
  async assign(groupId: string, studentId: string) {
    return isRemote() ? remote.assign(groupId, studentId) : local.assign(groupId, studentId)
  },
  async removeSeat(groupId: string, studentId: string) {
    return isRemote() ? remote.removeSeat(groupId, studentId) : local.removeSeat(groupId, studentId)
  },
  async addPayment(input: {
    studentId: string
    amount?: number
    kind?: PaymentKind
    status?: PaymentStatus
    note?: string
  }) {
    return isRemote() ? remote.addPayment(input) : local.addPayment(input)
  },
}

export function leadStatusLabel(status: LeadStatus): string {
  return {
    new: 'Новая',
    contacted: 'Написали',
    booked: 'Бронь',
    paid: 'Оплачено',
    lost: 'Отказ',
  }[status]
}
