import { useEffect, useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { TelegramLoginWidget } from '../components/TelegramLogin'
import { useStore } from '../store/StoreContext'

export function LoginPage() {
  const { user, config, loginTelegram, loginDev, ready, enrolled, testPay } = useStore()
  const [params] = useSearchParams()
  const [error, setError] = useState('')
  const next = params.get('next') || (user?.role === 'teacher' ? '/crm' : '/cabinet')
  const shouldPay = params.get('pay') === '1'

  useEffect(() => {
    if (!ready || !user || !shouldPay || enrolled) return
    void testPay().catch((err) => setError(err instanceof Error ? err.message : 'Оплата не прошла'))
  }, [ready, user, shouldPay, enrolled, testPay])

  if (ready && user && (!shouldPay || enrolled)) {
    return <Navigate to={next} replace />
  }

  const showWidget = Boolean(config.botUsername)
  const showDev = config.allowDevLogin || !config.widgetEnabled

  return (
    <div className="page">
      <div className="atmosphere" aria-hidden>
        <span className="orb orb-a" />
      </div>
      <div className="shell">
        <div className="login-box glass-strong">
          <Link to="/" className="logo">
            NailCraft
          </Link>
          <h1>Вход через Telegram</h1>
          <p>
            Личный кабинет и CRM открываются тем же Telegram, которым вы пишете
            Анастасии. Почты и пароля нет.
          </p>

          {user && shouldPay ? (
            <p className="muted">Открываем курс без эквайринга…</p>
          ) : (
            <>
              {showWidget && (
                <TelegramLoginWidget
                  botUsername={config.botUsername}
                  onAuth={async (payload) => {
                    try {
                      await loginTelegram(payload)
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Не вошло')
                    }
                  }}
                />
              )}

              {!showWidget && (
                <p className="muted login-note">
                  Виджет появится, когда в окружении зададут{' '}
                  <code>TELEGRAM_BOT_USERNAME</code> и токен бота на API.
                </p>
              )}

              {showDev && (
                <div className="dev-login">
                  <p className="muted">
                    Пока бот не подключён — демо-вход, чтобы проверить кабинет и CRM.
                    Роль учителя = Telegram id из <code>TELEGRAM_TEACHER_IDS</code>.
                  </p>
                  <div className="offer-actions">
                    <button
                      type="button"
                      className="cta-figma"
                      onClick={() =>
                        loginDev('student').catch((err) => setError(String(err.message)))
                      }
                    >
                      Войти как ученица
                    </button>
                    <button
                      type="button"
                      className="cta-ghost"
                      onClick={() =>
                        loginDev('teacher').catch((err) => setError(String(err.message)))
                      }
                    >
                      Войти как учитель
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {error && <p className="form-error">{error}</p>}
          <Link to="/" className="back-home">
            На главную
          </Link>
        </div>
      </div>
    </div>
  )
}
