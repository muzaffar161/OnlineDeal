# Online Deal — Mobile

Mobile client for the **Online Deal** escrow platform.

This directory (`mobile/`) is a standalone mobile web application (PWA).  
The web product lives alongside it in `deal-flow/` and evolves independently.

---

## Repository

Project repository:

```text
git@github.com:muzaffar161/OnlineDeal.git
```

> **Status:** this mobile client is the current content of [OnlineDeal](https://github.com/muzaffar161/OnlineDeal). Web (`deal-flow/`) and API (`server/`) will be merged into the same monorepo next.

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

- Authentication / registration
- Deal list and deal details
- Deal creation and Stripe checkout
- Deal chat
- Profile and notifications
- Mobile-first UI (safe areas, bottom navigation)
- PWA: install to home screen

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

If `VITE_API_BASE_URL` is empty, the client resolves the API as:

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

After `build` / `preview`, the app can be installed:

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

- [x] Publish mobile client to [OnlineDeal](https://github.com/muzaffar161/OnlineDeal)
- [ ] Align CI, env examples, and shared API contracts with `server/`
- [ ] Polish PWA install flow and offline caching
- [ ] Merge `deal-flow/` and `server/` into the monorepo

### Next major step — React Native

The current `mobile/` app is a **temporary mobile web / PWA layer**.

A migration to **React Native** (Expo) is planned soon to unlock:

- native iOS / Android builds
- App Store / Google Play distribution
- native push notifications and device APIs
- UX closer to true native apps

During migration we will keep:

- the same backend (`server/`)
- the same domain flows (deals, chat, payments)
- as much reusable business logic / API layer as possible

PWA remains the transitional solution until a stable React Native release.

---

## Contributing notes

1. Do not mix web (`deal-flow`) and mobile (`mobile`) changes in the same PR unless necessary.
2. Change API contracts via `server/` and sync both clients.
3. Before opening a PR: `npm run lint && npm test && npm run build`.

---

## License

Private — Online Deal project.
