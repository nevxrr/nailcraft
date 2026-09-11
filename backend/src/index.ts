import cors from 'cors'
import express from 'express'
import { config } from './config.ts'
import { initDb } from './db.ts'
import { createRouter } from './routes.ts'

await initDb()

const app = express()
app.disable('x-powered-by')
app.use(
  cors({
    origin: config.origins,
    credentials: true,
  }),
)
app.use(express.json({ limit: '200kb' }))
app.use('/api', createRouter())

app.get('/', (_req, res) => {
  res.json({
    service: 'nailcraft-api',
    health: '/api/health',
    auth: '/api/auth/telegram',
  })
})

app.listen(config.port, () => {
  console.log(`[nailcraft-api] http://127.0.0.1:${config.port}`)
  console.log(
    `[nailcraft-api] widget=${Boolean(config.botToken && config.botUsername)} devLogin=${config.allowDevLogin} teachers=${config.teacherIds.length}`,
  )
})
