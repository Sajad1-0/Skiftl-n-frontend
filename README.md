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

## Setup (local)

```bash
pnpm install
cp .env.example .env.local
```

### Environment

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend base URL (local: `http://localhost:3001`) |

Optional:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | Public app URL (metadata / Open Graph) |

`NEXT_PUBLIC_*` values are inlined at **build** time. Local `.env` / `.env.local` is gitignored and is **not** uploaded to Vercel automatically.

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

UI mirrors backend gates (`user.isPremium`, `premiumSource`, `premiumBetaEndsAt`). Enforcement is always on the API — never trust the client alone.

During an active **Premium beta** (`PREMIUM_BETA_ENDS_AT` on the API), the shell shows a banner with the end date and `isPremium` is true for everyone until that instant.

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

## Deployment (Vercel)

Production layout:

| Piece | Host |
|-------|------|
| Frontend | **Vercel** (this repo) |
| API + Postgres | **Railway** ([Skiftl-n-backend](https://github.com/Sajad1-0/Skiftl-n-backend)) |

Do **not** deploy the Express API on Vercel — it is a long-running Node server with Postgres/Stripe webhooks and belongs on Railway.

### Vercel environment variables

Project → **Settings → Environment Variables** (set **before** build / redeploy):

| Name | Example | Notes |
|------|---------|--------|
| `NEXT_PUBLIC_API_URL` | `https://….up.railway.app` | Railway API public URL, **no** trailing slash. Required — build fails without it. |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Optional but recommended |

After changing `NEXT_PUBLIC_*`, **Redeploy** so the build picks them up.

### Wire frontend ↔ backend

1. Deploy API on Railway and confirm `GET /health` → `database: connected`.
2. Set Vercel `NEXT_PUBLIC_API_URL` to that API origin.
3. On Railway API, set `FRONTEND_URL` to the Vercel origin (Stripe redirects / portal return).
4. Configure Stripe webhook to `https://<api-domain>/billing/webhook` with signing secret `whsec_…` on Railway.

### Custom domain (optional)

Vercel `*.vercel.app` is enough for early testing. When you buy a domain (Loopia, Cloudflare, etc.):

1. Add the domain in Vercel → Domains.
2. Update `NEXT_PUBLIC_APP_URL` (and redeploy).
3. Update Railway `FRONTEND_URL` to the same origin.
4. Optionally add `api.yourdomain.com` on Railway later; then update `NEXT_PUBLIC_API_URL` and the Stripe webhook URL.

## License

Private project.
