import { useRef, useState } from 'react'
import type { ChecklistStage, ChecklistStageId } from '../types'
import { compressImage, formatDateTime } from '../lib/utils'

interface Props {
  stages: ChecklistStage[]
  onToggle: (id: ChecklistStageId) => void
  onPhoto: (id: ChecklistStageId, dataUrl: string | undefined) => void
  readOnly?: boolean
}

export function Checklist({ stages, onToggle, onPhoto, readOnly }: Props) {
  const [busy, setBusy] = useState<string | null>(null)
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  async function handleFile(stageId: ChecklistStageId, file: File | undefined) {
    if (!file) return
    setBusy(stageId)
    try {
      const dataUrl = await compressImage(file)
      onPhoto(stageId, dataUrl)
      if (!stages.find((s) => s.id === stageId)?.done) {
        onToggle(stageId)
      }
    } finally {
      setBusy(null)
    }
  }

  return (
    <ul className="checklist">
      {stages.map((stage, index) => (
        <li key={stage.id} className={`checklist-item ${stage.done ? 'done' : ''}`}>
          <div className="checklist-head">
            <button
              type="button"
              className="check-btn"
              onClick={() => !readOnly && onToggle(stage.id)}
              disabled={readOnly}
              aria-pressed={stage.done}
              aria-label={`${stage.label}: ${stage.done ? 'выполнено' : 'не выполнено'}`}
            >
              <span className="check-index">{index + 1}</span>
              {stage.done && (
                <svg viewBox="0 0 24 24" className="check-mark" aria-hidden>
                  <path
                    d="M5 12.5 10 17l9-10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
            <div className="checklist-copy">
              <p className="checklist-label">{stage.label}</p>
              {stage.done && stage.doneAt ? (
                <p className="checklist-time">{formatDateTime(stage.doneAt)}</p>
              ) : (
                <p className="checklist-time">ожидает</p>
              )}
            </div>
          </div>

          <div className="photo-block">
            {stage.photoDataUrl ? (
              <div className="photo-preview">
                <img src={stage.photoDataUrl} alt={`Фото: ${stage.label}`} />
                {!readOnly && (
                  <button
                    type="button"
                    className="photo-remove"
                    onClick={() => onPhoto(stage.id, undefined)}
                  >
                    Удалить фото
                  </button>
                )}
              </div>
            ) : (
              !readOnly && (
                <button
                  type="button"
                  className="photo-add"
                  disabled={busy === stage.id}
                  onClick={() => inputRefs.current[stage.id]?.click()}
                >
                  {busy === stage.id ? 'Загрузка…' : 'Сделать / приложить фото'}
                </button>
              )
            )}
            <input
              ref={(el) => {
                inputRefs.current[stage.id] = el
              }}
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              onChange={(e) => {
                void handleFile(stage.id, e.target.files?.[0])
                e.target.value = ''
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
