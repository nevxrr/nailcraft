# NailCraft API

Отдельный сервис кабинета и CRM. Секреты только здесь, не во фронте.

## Переменные

Скопируйте `.env.example`. Не придумывайте токен бота — возьмите его у [@BotFather](https://t.me/BotFather).

| Переменная | Зачем |
| --- | --- |
| `TELEGRAM_BOT_TOKEN` | Проверка подписи Login Widget |
| `TELEGRAM_BOT_USERNAME` | Имя бота для виджета на фронте |
| `TELEGRAM_TEACHER_IDS` | Telegram id учителя (через запятую). Эти аккаунты видят CRM |
| `JWT_SECRET` | Подпись сессии. В проде обязателен |
| `FRONTEND_ORIGIN` | CORS, через запятую |
| `ALLOW_DEV_LOGIN` | Демо-вход без виджета. По умолчанию включён, пока нет токена |

В BotFather: `/setdomain` на домен фронта (для Pages — `nevxrr.github.io`).

## Запуск

```bash
cp .env.example .env
# заполните TELEGRAM_* когда будут реальные значения
TELEGRAM_TEACHER_IDS=1 ALLOW_DEV_LOGIN=true npm run dev
```

API: `http://127.0.0.1:8787/api/health`

`POST /api/auth/telegram` принимает объект виджета и проверяет HMAC-SHA256 от токена бота.
`POST /api/auth/dev` выдаёт сессию ученицы или учителя только при `ALLOW_DEV_LOGIN`.
