import jwt from 'jsonwebtoken'
import type { Request, Response, NextFunction } from 'express'
import { config, isTeacherId } from './config.ts'
import { findUser, findUserByTelegram, mutate, nowIso, publicUser, uid } from './db.ts'
import type { Role, TelegramAuthPayload, User } from './types.ts'

export interface AuthedRequest extends Request {
  user?: User
}

interface TokenBody {
  sub: string
  role: Role
}

export function signToken(user: User): string {
  return jwt.sign({ sub: user.id, role: user.role } satisfies TokenBody, config.jwtSecret, {
    expiresIn: '30d',
  })
}

export function upsertFromTelegram(payload: TelegramAuthPayload): User {
  const telegramId = Number(payload.id)
  const role: Role = isTeacherId(telegramId) ? 'teacher' : 'student'
  return mutate((db) => {
    const existing = findUserByTelegram(telegramId)
    if (existing) {
      existing.firstName = payload.first_name || existing.firstName
      existing.lastName = payload.last_name ?? existing.lastName
      existing.username = payload.username ?? existing.username
      existing.photoUrl = payload.photo_url ?? existing.photoUrl
      existing.role = role
      return existing
    }
    const user: User = {
      id: uid('u'),
      telegramId,
      firstName: payload.first_name,
      lastName: payload.last_name ?? '',
      username: payload.username ?? '',
      photoUrl: payload.photo_url ?? '',
      role,
      phone: '',
      experience: '',
      pains: '',
      notes: '',
      enrolled: role === 'teacher',
      createdAt: nowIso(),
    }
    db.users.push(user)
    return user
  })
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) {
    res.status(401).json({ error: 'unauthorized' })
    return
  }
  try {
    const body = jwt.verify(token, config.jwtSecret) as TokenBody
    const user = findUser(body.sub)
    if (!user) {
      res.status(401).json({ error: 'unauthorized' })
      return
    }
    user.role = isTeacherId(user.telegramId) ? 'teacher' : 'student'
    req.user = user
    next()
  } catch {
    res.status(401).json({ error: 'unauthorized' })
  }
}

export function requireTeacher(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'teacher') {
    res.status(403).json({ error: 'teacher_only' })
    return
  }
  next()
}

export function authPayload(user: User) {
  return { token: signToken(user), user: publicUser(user) }
}
