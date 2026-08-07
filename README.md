# Online Deal — Mobile

Мобильный клиент платформы **Online Deal** для безопасных сделок с эскроу.

Этот каталог (`mobile/`) — отдельное мобильное веб-приложение (PWA).  
Веб-версия живёт рядом в `deal-flow/` и развивается независимо.

---

## Repository

Целевой репозиторий проекта:

```text
git@github.com:muzaffar161/OnlineDeal.git
```

> **Статус:** локальная разработка. В ближайшее время `mobile/` будет подключён и влит в общий репозиторий `OnlineDeal` вместе с веб-клиентом и API.

### Planned monorepo layout

```text
OnlineDeal/
├── deal-flow/   # Web client
├── mobile/      # Mobile client (current PWA → React Native)
└── server/      # Backend API
```

---

## Stack

| Layer | Technology |
|---|---|
| UI | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui |
| Data | TanStack Query |
| Payments | Stripe |
| Installable | Progressive Web App (PWA) |

---

## Features

- Авторизация / регистрация
- Список и детали сделок
- Создание сделки и checkout (Stripe)
- Чат по сделке
- Профиль и уведомления
- Mobile-first UI (safe-area, bottom navigation)
- PWA: установка на домашний экран

---

## Getting started

### Requirements

- Node.js 20+
- npm
- Running Online Deal API (`server/`, default port `5038`)

### Install

```sh
cd mobile
npm install
```

### Environment

Copy `.env.example` → `.env`:

```env
# Leave empty to auto-use current host (useful for phone testing on LAN)
VITE_API_BASE_URL=

VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

If `VITE_API_BASE_URL` is empty, the client resolves API as:

```text
http://<current-hostname>:5038
```

### Development

```sh
npm run dev
```

- Local: [http://localhost:8090](http://localhost:8090)
- On device (same Wi‑Fi): `http://<your-lan-ip>:8090`

### Production build

```sh
npm run build
npm run preview
```

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Dev server on port `8090` |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Vitest) |

---

## PWA

После `build` / `preview` приложение можно установить:

- **iOS Safari** → Share → Add to Home Screen  
- **Android Chrome** → Install app / Add to Home screen  

Assets:

- Favicon: `public/favicon.png`
- App icons: `public/icons/icon-192.png`, `public/icons/icon-512.png`

---

## Relationship to web

| App | Path | Port | Purpose |
|---|---|---|---|
| Web | `../deal-flow` | `8080` | Desktop / browser product |
| Mobile | `./` (this app) | `8090` | Phone-first client + PWA |

Session storage keys are scoped separately (`onlinedeal_mobile_*`), so web and mobile sessions do not collide in the same browser.

---

## Roadmap

### Near term

- [ ] Push `mobile/` into [OnlineDeal](https://github.com/muzaffar161/OnlineDeal) monorepo
- [ ] Align CI, env examples, and shared API contracts with `server/`
- [ ] Polish PWA install flow and offline caching

### Next major step — React Native

Текущий `mobile/` — **временный mobile web / PWA слой**.

В скором времени планируется перенос на **React Native** (Expo), чтобы получить:

- нативные билды под iOS / Android
- доступ к store (App Store / Google Play)
- нативные push-уведомления и device APIs
- единый UX ближе к native apps

При миграции сохраним:

- тот же backend (`server/`)
- те же доменные сценарии (сделки, чат, оплата)
- максимум переиспользуемой бизнес-логики / API-слоя

PWA останется переходным решением до стабильного React Native релиза.

---

## Contributing notes

1. Не смешивать изменения web (`deal-flow`) и mobile (`mobile`) в одном PR без необходимости.
2. API-контракты менять через `server/` + синхронизацию клиентов.
3. Перед PR: `npm run lint && npm test && npm run build`.

---

## License

Private — Online Deal project.
