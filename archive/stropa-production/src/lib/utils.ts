import type { OrderStatus } from '../types'

export function formatDate(iso: string): string {
  const d = new Date(iso.includes('T') ? iso : `${iso}T12:00:00`)
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  })
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function deadlineMeta(deadline: string): {
  label: string
  tone: 'ok' | 'soon' | 'overdue'
} {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(`${deadline}T12:00:00`)
  due.setHours(0, 0, 0, 0)
  const diff = Math.round((due.getTime() - today.getTime()) / 86400000)

  if (diff < 0) {
    return {
      label: `просрочен на ${Math.abs(diff)} дн.`,
      tone: 'overdue',
    }
  }
  if (diff === 0) return { label: 'сегодня', tone: 'soon' }
  if (diff === 1) return { label: 'завтра', tone: 'soon' }
  if (diff <= 3) return { label: `через ${diff} дн.`, tone: 'soon' }
  return { label: formatDate(deadline), tone: 'ok' }
}

export function progressOf(order: {
  checklist: Array<{ done: boolean }>
}): number {
  if (!order.checklist.length) return 0
  const done = order.checklist.filter((s) => s.done).length
  return Math.round((done / order.checklist.length) * 100)
}

export async function compressImage(
  file: File,
  maxSide = 960,
  quality = 0.72,
): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * scale)
  const h = Math.round(bitmap.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas unsupported')
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close()
  return canvas.toDataURL('image/jpeg', quality)
}

export function statusTone(status: OrderStatus): string {
  return `status-${status}`
}
