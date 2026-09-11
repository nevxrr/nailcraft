export type Role = 'student' | 'teacher'
export type LeadStatus = 'new' | 'contacted' | 'booked' | 'paid' | 'lost'
export type LeadSource = 'landing' | 'magnet' | 'telegram'
export type PaymentKind = 'course' | 'internship'
export type PaymentStatus = 'test' | 'pending' | 'paid'

export interface TelegramAuthPayload {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

export interface PublicUser {
  id: string
  telegramId: number
  firstName: string
  lastName: string
  username: string
  photoUrl: string
  role: Role
  phone: string
  experience: string
  pains: string
  enrolled: boolean
}

export interface AuthConfig {
  botUsername: string
  widgetEnabled: boolean
  allowDevLogin: boolean
  teacherConfigured: boolean
}

export interface Lead {
  id: string
  name: string
  contact: string
  interest: string
  experience: string
  struggle: string
  preferredDate: string
  status: LeadStatus
  source: LeadSource
  notes: string
  studentId: string
  createdAt: string
}

export interface GroupStudent {
  id: string
  name: string
  username: string
  photoUrl: string
}

export interface Group {
  id: string
  date: string
  time: string
  topic: string
  seats: 2
  studentIds: string[]
  status: 'open' | 'full' | 'done'
  seatsLeft: number
  students: GroupStudent[]
}

export interface Payment {
  id: string
  studentId: string
  amount: number
  kind: PaymentKind
  status: PaymentStatus
  note: string
  createdAt: string
}

export interface Script {
  id: string
  title: string
  claim: string
  benefit: string
}

export interface StudentCard extends PublicUser {
  notes: string
  createdAt: string
  payments: Payment[]
  groups: Group[]
}

export interface CabinetPayload {
  user: PublicUser
  enrolled: boolean
  bookings: Group[]
  groups: Group[]
  payments: Payment[]
  progress: { lessonsTotal: number; lessonsDone: number; hint: string }
}

export interface CrmOverview {
  leads: Lead[]
  students: StudentCard[]
  groups: Group[]
  payments: Payment[]
  scripts: Script[]
}

export interface AuthResult {
  token: string
  user: PublicUser
}

export interface LeadDraft {
  name: string
  contact: string
  interest?: string
  experience?: string
  struggle?: string
  preferredDate?: string
  source?: LeadSource
}
