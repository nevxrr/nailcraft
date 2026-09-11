import { Router } from 'express'
import { config } from './config.ts'
import {
  authPayload,
  requireAuth,
  requireTeacher,
  upsertFromTelegram,
  type AuthedRequest,
} from './auth.ts'
import {
  COURSE,
  findUser,
  getDb,
  mutate,
  nowIso,
  paymentsOf,
  publicUser,
  syncGroupStatus,
  uid,
} from './db.ts'
import { verifyTelegramAuth } from './telegram.ts'
import type { Group, Lead, LeadSource, LeadStatus, Payment, PaymentKind, PaymentStatus, TelegramAuthPayload, User } from './types.ts'

const DEV_STUDENT = {
  id: 900001,
  first_name: 'Мария',
  last_name: 'Иванова',
  username: 'maria_nails',
  auth_date: 0,
  hash: 'dev',
} satisfies TelegramAuthPayload

export function createRouter() {
  const router = Router()

  router.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'nailcraft-api' })
  })

  router.get('/auth/config', (_req, res) => {
    res.json({
      botUsername: config.botUsername,
      widgetEnabled: Boolean(config.botToken && config.botUsername),
      allowDevLogin: config.allowDevLogin,
      teacherConfigured: config.teacherIds.length > 0,
    })
  })

  router.post('/auth/telegram', (req, res) => {
    const payload = req.body as TelegramAuthPayload
    const check = verifyTelegramAuth(payload, config.botToken)
    if (!check.ok) {
      res.status(401).json({ error: check.error })
      return
    }
    const user = upsertFromTelegram(payload)
    res.json(authPayload(user))
  })

  router.post('/auth/dev', (req, res) => {
    if (!config.allowDevLogin) {
      res.status(403).json({ error: 'dev_login_disabled' })
      return
    }
    const kind = req.body?.kind === 'teacher' ? 'teacher' : 'student'
    if (kind === 'teacher') {
      const telegramId = config.teacherIds[0]
      if (!telegramId) {
        res.status(400).json({ error: 'teacher_ids_not_configured' })
        return
      }
      const user = upsertFromTelegram({
        id: telegramId,
        first_name: 'Анастасия',
        last_name: 'Захватова',
        username: 'nailcraft',
        auth_date: Math.floor(Date.now() / 1000),
        hash: 'dev',
      })
      res.json(authPayload(user))
      return
    }
    const user = upsertFromTelegram({
      ...DEV_STUDENT,
      auth_date: Math.floor(Date.now() / 1000),
    })
    res.json(authPayload(user))
  })

  router.get('/me', requireAuth, (req: AuthedRequest, res) => {
    res.json({ user: publicUser(req.user!) })
  })

  router.post('/leads', (req, res) => {
    const body = req.body ?? {}
    const name = String(body.name ?? '').trim()
    const contact = String(body.contact ?? '').trim()
    if (!name || !contact) {
      res.status(400).json({ error: 'name_and_contact_required' })
      return
    }
    const source: LeadSource = body.source === 'magnet' ? 'magnet' : 'landing'
    const lead = mutate((db) => {
      const item: Lead = {
        id: uid('lead'),
        name,
        contact,
        interest: String(body.interest ?? COURSE.title).trim(),
        experience: String(body.experience ?? '').trim(),
        struggle: String(body.struggle ?? '').trim(),
        preferredDate: String(body.preferredDate ?? '').trim(),
        status: 'new',
        source,
        notes: '',
        studentId: '',
        createdAt: nowIso(),
      }
      db.leads.unshift(item)
      return item
    })
    res.status(201).json({ lead })
  })

  router.post('/pay/test', requireAuth, (req: AuthedRequest, res) => {
    const user = req.user!
    mutate((db) => {
      user.enrolled = true
      db.payments.unshift({
        id: uid('pay'),
        studentId: user.id,
        amount: COURSE.price,
        kind: 'course',
        status: 'test',
        note: 'Тест · без эквайринга',
        createdAt: nowIso(),
      })
    })
    res.json({ user: publicUser(user), enrolled: true })
  })

  router.get('/cabinet', requireAuth, (req: AuthedRequest, res) => {
    res.json(cabinetPayload(req.user!))
  })

  router.get('/groups', requireAuth, (_req, res) => {
    res.json({ groups: getDb().groups.map(viewGroup) })
  })

  router.post('/groups/:id/book', requireAuth, (req: AuthedRequest, res) => {
    const user = req.user!
    if (!user.enrolled && user.role !== 'teacher') {
      res.status(403).json({ error: 'not_enrolled' })
      return
    }
    const group = mutate((db) => {
      const found = db.groups.find((item) => item.id === req.params.id)
      if (!found) return null
      if (found.studentIds.includes(user.id)) return found
      if (found.studentIds.length >= found.seats) return found
      found.studentIds.push(user.id)
      syncGroupStatus(found)
      return found
    })
    if (!group) {
      res.status(404).json({ error: 'group_not_found' })
      return
    }
    if (!group.studentIds.includes(user.id)) {
      res.status(409).json({ error: 'group_full' })
      return
    }
    res.json({ group: viewGroup(group), cabinet: cabinetPayload(user) })
  })

  router.get('/crm/overview', requireAuth, requireTeacher, (_req, res) => {
    const db = getDb()
    res.json({
      leads: db.leads,
      students: db.users.filter((user) => user.role === 'student').map(studentCard),
      groups: db.groups.map(viewGroup),
      payments: db.payments,
      scripts: db.scripts,
    })
  })

  router.patch('/crm/leads/:id', requireAuth, requireTeacher, (req, res) => {
    const lead = mutate((db) => {
      const found = db.leads.find((item) => item.id === req.params.id)
      if (!found) return null
      const status = req.body?.status as LeadStatus | undefined
      if (status && ['new', 'contacted', 'booked', 'paid', 'lost'].includes(status)) {
        found.status = status
      }
      if (typeof req.body?.notes === 'string') found.notes = req.body.notes
      if (typeof req.body?.studentId === 'string') found.studentId = req.body.studentId
      return found
    })
    if (!lead) {
      res.status(404).json({ error: 'lead_not_found' })
      return
    }
    res.json({ lead })
  })

  router.patch('/crm/students/:id', requireAuth, requireTeacher, (req, res) => {
    const user = mutate((db) => {
      const found = db.users.find((item) => item.id === req.params.id)
      if (!found) return null
      for (const key of ['notes', 'experience', 'pains', 'phone'] as const) {
        if (typeof req.body?.[key] === 'string') found[key] = req.body[key]
      }
      if (typeof req.body?.enrolled === 'boolean') found.enrolled = req.body.enrolled
      return found
    })
    if (!user) {
      res.status(404).json({ error: 'student_not_found' })
      return
    }
    res.json({ student: studentCard(user) })
  })

  router.post('/crm/groups', requireAuth, requireTeacher, (req, res) => {
    const date = String(req.body?.date ?? '').trim()
    const time = String(req.body?.time ?? '').trim()
    const topic = String(req.body?.topic ?? COURSE.title).trim()
    if (!date || !time) {
      res.status(400).json({ error: 'date_and_time_required' })
      return
    }
    const group = mutate((db) => {
      const item: Group = {
        id: uid('g'),
        date,
        time,
        topic,
        seats: 2,
        studentIds: [],
        status: 'open',
      }
      db.groups.unshift(item)
      return item
    })
    res.status(201).json({ group: viewGroup(group) })
  })

  router.post('/crm/groups/:id/assign', requireAuth, requireTeacher, (req, res) => {
    const studentId = String(req.body?.studentId ?? '')
    const student = findUser(studentId)
    if (!student) {
      res.status(404).json({ error: 'student_not_found' })
      return
    }
    const group = mutate((db) => {
      const found = db.groups.find((item) => item.id === req.params.id)
      if (!found) return null
      if (!found.studentIds.includes(studentId) && found.studentIds.length < found.seats) {
        found.studentIds.push(studentId)
        student.enrolled = true
      }
      syncGroupStatus(found)
      return found
    })
    if (!group) {
      res.status(404).json({ error: 'group_not_found' })
      return
    }
    res.json({ group: viewGroup(group) })
  })

  router.post('/crm/groups/:id/remove', requireAuth, requireTeacher, (req, res) => {
    const studentId = String(req.body?.studentId ?? '')
    const group = mutate((db) => {
      const found = db.groups.find((item) => item.id === req.params.id)
      if (!found) return null
      found.studentIds = found.studentIds.filter((id) => id !== studentId)
      syncGroupStatus(found)
      return found
    })
    if (!group) {
      res.status(404).json({ error: 'group_not_found' })
      return
    }
    res.json({ group: viewGroup(group) })
  })

  router.post('/crm/payments', requireAuth, requireTeacher, (req, res) => {
    const studentId = String(req.body?.studentId ?? '')
    const student = findUser(studentId)
    if (!student) {
      res.status(404).json({ error: 'student_not_found' })
      return
    }
    const kind: PaymentKind = req.body?.kind === 'internship' ? 'internship' : 'course'
    const status: PaymentStatus =
      req.body?.status === 'pending' || req.body?.status === 'test' ? req.body.status : 'paid'
    const amount = Number(req.body?.amount) || (kind === 'internship' ? COURSE.internship : COURSE.price)
    const payment = mutate((db) => {
      const item: Payment = {
        id: uid('pay'),
        studentId,
        amount,
        kind,
        status,
        note: String(req.body?.note ?? ''),
        createdAt: nowIso(),
      }
      db.payments.unshift(item)
      if (status === 'paid' || status === 'test') student.enrolled = true
      return item
    })
    res.status(201).json({ payment })
  })

  return router
}

function viewGroup(group: Group) {
  const users = getDb().users
  return {
    ...group,
    seatsLeft: Math.max(0, group.seats - group.studentIds.length),
    students: group.studentIds.map((id) => {
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

function studentCard(user: User) {
  return {
    ...publicUser(user),
    notes: user.notes,
    createdAt: user.createdAt,
    payments: paymentsOf(user.id),
    groups: getDb()
      .groups.filter((group) => group.studentIds.includes(user.id))
      .map(viewGroup),
  }
}

function cabinetPayload(user: User) {
  const groups = getDb().groups.map(viewGroup)
  return {
    user: publicUser(user),
    enrolled: user.enrolled || user.role === 'teacher',
    bookings: groups.filter((group) => group.studentIds.includes(user.id)),
    groups,
    payments: paymentsOf(user.id),
    progress: {
      lessonsTotal: 0,
      lessonsDone: 0,
      hint: 'Уроки появятся таблицами. Пока — каркас дня.',
    },
  }
}

function displayName(user: User) {
  return [user.firstName, user.lastName].filter(Boolean).join(' ')
}
