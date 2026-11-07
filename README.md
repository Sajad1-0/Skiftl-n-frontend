# Shiftkit Web

Frontend for **Shiftkit** — a Swedish shift-pay toolkit: log shifts, OB, tax estimates, monthly summaries, and Premium (Stripe).

Companion API: [Skiftl-n-backend](https://github.com/Sajad1-0/Skiftl-n-backend).

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4** + **shadcn/ui**
- JWT stored in `localStorage`; API calls via `lib/api.ts`

## Requirements

- Node.js 22+
- pnpm 11+
- Running Shiftkit API (default `http://localhost:3001`)

## Setup

```bash
pnpm install
cp .env.example .env.local
```

### Environment

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend base URL (`http://localhost:3001`) |

Optional:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | Public app URL (metadata / Open Graph) |

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Dev server on [http://localhost:3000](http://localhost:3000) |
| `pnpm build` | Production build |
| `pnpm start` | Serve production build |
| `pnpm lint` | ESLint |

## App routes

| Path | Description |
|------|-------------|
| `/` | Landing |
| `/login`, `/register` | Auth |
| `/dashboard` | Overview |
| `/job-profiles` | Job profiles |
| `/shifts`, `/shifts/new`, `/shifts/bulk`, `/shifts/[id]/edit` | Shift logging |
| `/summary`, `/summary/compare` | Monthly summary / compare |
| `/tax-settings` | Tax table settings (Premium) |
| `/sick-leave` | Sick leave (Premium) |
| `/salary-goal` | Salary goal (Premium) |
| `/premium` | Upgrade / billing |

## Project layout

```
app/                 # Next.js App Router pages
components/          # UI (layout, brand, shifts, history, shadcn)
hooks/               # useAuthUser, useJobProfiles, month stats/summary
lib/                 # API client, types, money, month bounds, brand
public/brand/        # Logo / favicon assets
```

## Design

Modern SaaS (Notion/Linear-inspired): clean surfaces, blue accent, shadcn primitives. Prefer Server Components where possible; client components for forms and authenticated data fetching.

## Free vs Premium

UI mirrors backend gates (`user.isPremium`). Enforcement is always on the API — never trust the client alone.

| Feature | Free | Premium |
|---------|------|---------|
| History | Current month | 6 months + compare |
| Job profiles | 1 | Up to 5 |
| Bulk log / exact breaks | — | Yes |
| Tax table / sick leave / PDF / goal | — | Yes |
| OB | Included | Included |

## Local development

1. Start Postgres + backend (`pnpm dev` in the API repo).
2. Seed tax tables / agreements on the backend if needed.
3. In this repo: `pnpm dev`.
4. Open [http://localhost:3000](http://localhost:3000).

## License

Private project.
