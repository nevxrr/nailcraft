import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { config } from './config.ts'
import type { Database, Group, Lead, Payment, Script, User } from './types.ts'

const empty: Database = {
  users: [],
  leads: [],
  groups: [],
  payments: [],
  scripts: [],
}

let db: Database = structuredClone(empty)
let file = ''
let writeChain: Promise<void> = Promise.resolve()

export async function initDb() {
  file = path.resolve(config.dataDir, 'db.json')
  await mkdir(path.dirname(file), { recursive: true })
  try {
    const raw = await readFile(file, 'utf8')
    db = { ...empty, ...JSON.parse(raw) }
  } catch {
    db = seed()
    await persist()
  }
  if (db.scripts.length === 0 || db.groups.length === 0) {
    const seeded = seed()
    if (db.scripts.length === 0) db.scripts = seeded.scripts
    if (db.groups.length === 0) db.groups = seeded.groups
    if (db.leads.length === 0) db.leads = seeded.leads
    await persist()
  }
}

function persist() {
  writeChain = writeChain.then(() =>
    writeFile(file, JSON.stringify(db, null, 2), 'utf8'),
  )
  return writeChain
}

export function getDb(): Database {
  return db
}

export function mutate<T>(fn: (state: Database) => T): T {
  const result = fn(db)
  void persist()
  return result
}

export function uid(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`
}

export function nowIso(): string {
  return new Date().toISOString()
}

export const COURSE = {
  id: 'hardware-gel',
  title: 'Аппаратный маникюр + гелевое укрепление',
  price: 20_000,
  internship: 2_500,
}

export function seed(): Database {
  const scripts: Script[] = [
    {
      id: 'sc-chips',
      title: 'Сколы на третий день',
      claim: 'Покрытие живёт три дня — виноват гель?',
      benefit:
        'Нет. Нет архитектуры. На курсе собираем форму, а не «подмазываем». Носка до коррекции, не до переделки.',
    },
    {
      id: 'sc-base',
      title: 'Гель как база',
      claim: 'Я уже кладу гель — зачем ещё курс?',
      benefit:
        'Гель как база и гель как архитектура — разные жесты. Разберём, где пластина не держит и что менять руками.',
    },
    {
      id: 'sc-fear',
      title: 'Страх аппарата',
      claim: 'Боюсь спилить живое.',
      benefit:
        'Аппарат безопасен, когда фреза и обороты в таблице. Не сила руки. Шпаргалку забираете с собой.',
    },
    {
      id: 'sc-group',
      title: 'Мини-группа из двух',
      claim: 'В потоке меня не увидят.',
      benefit:
        'Два места. Теория, затем две модели. Вижу каждую руку. Не лекция на двадцать человек.',
    },
    {
      id: 'sc-money',
      title: 'Деньги и старт',
      claim: 'С нуля далеко до клиентов.',
      benefit:
        'День собран так, чтобы выйти с двумя работами и таблицей. Стажировка 2 500 ₽ — когда будете готовы к живым клиентам.',
    },
  ]

  const groups: Group[] = [
    {
      id: 'g-sep-20',
      date: '2026-09-20',
      time: '11:00–17:00',
      topic: 'Аппарат + гель · мини-группа',
      seats: 2,
      studentIds: [],
      status: 'open',
    },
    {
      id: 'g-sep-27',
      date: '2026-09-27',
      time: '11:00–17:00',
      topic: 'Аппарат + гель · мини-группа',
      seats: 2,
      studentIds: [],
      status: 'open',
    },
    {
      id: 'g-oct-4',
      date: '2026-10-04',
      time: '12:00–18:00',
      topic: '1:1 или пара',
      seats: 2,
      studentIds: [],
      status: 'open',
    },
  ]

  const leads: Lead[] = [
    {
      id: 'lead-alina',
      name: 'Алина',
      contact: '@alina_nails',
      interest: COURSE.title,
      experience: 'Делаю подругам, гель как база',
      struggle: 'Сколы на третий день',
      preferredDate: '2026-09-20',
      status: 'new',
      source: 'landing',
      notes: '',
      studentId: '',
      createdAt: '2026-09-08T10:00:00.000Z',
    },
    {
      id: 'lead-marina',
      name: 'Марина',
      contact: '+7 999 111-22-33',
      interest: 'Шпаргалка «фрезы и обороты»',
      experience: 'С нуля',
      struggle: 'Страх аппарата',
      preferredDate: '',
      status: 'contacted',
      source: 'magnet',
      notes: 'Забрала каркас таблицы, ждёт PDF.',
      studentId: '',
      createdAt: '2026-09-09T14:20:00.000Z',
    },
  ]

  return {
    users: [],
    leads,
    groups,
    payments: [],
    scripts,
  }
}

export function publicUser(user: User) {
  return {
    id: user.id,
    telegramId: user.telegramId,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    photoUrl: user.photoUrl,
    role: user.role,
    phone: user.phone,
    experience: user.experience,
    pains: user.pains,
    enrolled: user.enrolled,
  }
}

export function syncGroupStatus(group: Group): Group {
  if (group.status === 'done') return group
  group.status = group.studentIds.length >= group.seats ? 'full' : 'open'
  return group
}

export function findUserByTelegram(telegramId: number): User | undefined {
  return db.users.find((user) => user.telegramId === telegramId)
}

export function findUser(id: string): User | undefined {
  return db.users.find((user) => user.id === id)
}

export function paymentsOf(studentId: string): Payment[] {
  return db.payments.filter((item) => item.studentId === studentId)
}
