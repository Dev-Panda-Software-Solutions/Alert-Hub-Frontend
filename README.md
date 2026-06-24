# AlertHub — Frontend

React 19 + Vite 7 + TypeScript + Tailwind CSS v4 frontend for AlertHub, a smart payment & reminder management SaaS.

## Tech Stack

- **React 19** — UI framework
- **Vite 7** — build tool & dev server
- **TypeScript** — type safety
- **Tailwind CSS v4** — styling (`bg-linear-to-br`, class-based dark mode)
- **Axios** — API client with JWT interceptor
- **react-icons/lu** — Lucide SVG icon set
- **Web Push API** — background push notifications via Service Worker

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/login` | LoginPage | JWT login + sandbox demo mode |
| `/signup` | SignupPage | Registration with password strength meter |
| `/dashboard` | DashboardPage | KPI cards, today's reminders, overdue list |
| `/reminders` | RemindersPage | Full CRUD, filters, bulk delete |
| `/calendar` | CalendarPage | Month grid with module colour-coded dots |
| `/insights` | InsightsPage | AI insights, cashflow chart, AI chat |
| `/pricing` | PricingPage | Plan comparison (FREE & PERSONAL active) |
| `/profile` | ProfilePage | Account settings, push/email notification test |

## Local Development

```bash
npm install
npm run dev        # http://localhost:5174
npm run build      # production build → dist/
```

## Key Structure

```
src/
├── config/api.config.ts      # Backend base URL
├── context/
│   ├── AuthContext.tsx        # Login, signup, sandbox, JWT storage
│   ├── ThemeContext.tsx       # Dark/light mode, persisted in localStorage
│   └── LayoutContext.tsx      # Sidebar collapsed/mobile open state
├── services/
│   ├── api.ts                 # All Axios API calls + 401 interceptor
│   └── push.ts                # Web Push subscription + test helper
├── utils/currency.ts          # Country → symbol/code map, India-priority sort
└── public/sw.js               # Service Worker — background push handler
```

## Environment

No `.env` needed for local dev — API defaults to `http://localhost:3005/api`.

For production, create `frontend/.env`:
```
VITE_API_URL=http://YOUR_VPS_IP:3005/api
```

## Features

- Dark mode — class-based toggle, persisted in localStorage
- Responsive sidebar — collapsible on desktop, hamburger drawer on mobile
- Country/currency selector — 30+ countries, India-priority order, shows ₹/$/£ symbol
- Push notifications — full VAPID setup with step-by-step status checker in Profile
- Email test — send a live test email from Profile page
- Password strength — real-time bar on signup, correctness hint on login
- Business upgrade prompt — clear message instead of generic error when plan too low
- Pricing lock — FAMILY & BUSINESS plans show Coming Soon ribbon
- Sandbox mode — full demo with pre-seeded data, no account required
- AI Chat — 22 rotating questions with fade animation
