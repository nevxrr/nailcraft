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

export interface User {
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
  notes: string
  enrolled: boolean
  createdAt: string
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

export interface Group {
  id: string
  date: string
  time: string
  topic: string
  seats: 2
  studentIds: string[]
  status: 'open' | 'full' | 'done'
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

export interface Database {
  users: User[]
  leads: Lead[]
  groups: Group[]
  payments: Payment[]
  scripts: Script[]
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
