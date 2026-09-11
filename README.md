# NailCraft

Школа Анастасии Захватовой: лендинг, вход через Telegram, кабинет ученицы и CRM учителя.

Фронт и бэк — разные папки, потом два сервера. Сейчас фронт собирается на GitHub Pages.

**Витрина:** https://nevxrr.github.io/nailcraft/

## Папки

```
frontend/   Vite + React, GitHub Pages
backend/    API: Telegram Login, кабинет, CRM
```

## Фронт

```bash
cd frontend
npm install
npm run dev
```

Открыть http://localhost:5173/nailcraft/

На Pages API нет — кабинет и CRM работают в браузере (localStorage). Когда бэкенд будет на своём сервере, задайте `VITE_API_URL`.

Виджет входа: `VITE_TELEGRAM_BOT_USERNAME`. Токен бота на фронт не кладём.

## Бэк

```bash
cd backend
cp .env.example .env
# TELEGRAM_BOT_TOKEN, TELEGRAM_BOT_USERNAME, TELEGRAM_TEACHER_IDS — с BotFather, не выдумывать
npm install
npm run dev
```

`POST /api/auth/telegram` проверяет HMAC-SHA256 виджета токеном бота. Роль `teacher` — только id из `TELEGRAM_TEACHER_IDS`.

Пока токена нет, `ALLOW_DEV_LOGIN` включает демо-вход (ученица / учитель) для проверки экранов.

В BotFather: `/setdomain` на домен фронта (`nevxrr.github.io` для Pages).

## Тест-оплата

Кнопка на лендинге не ходит в эквайринг: после входа открывает каркас курса и пишет платёж со статусом `test`.
