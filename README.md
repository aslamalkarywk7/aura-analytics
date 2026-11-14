# Aura Analytics · لوحة التحليلات

**Live analytics dashboard for the ISLAM AL-NASHAR perfume store.**

A dark, bilingual (Arabic RTL / English LTR) admin dashboard that reads real commerce
data from the store's API — revenue, orders, best sellers, fragrance-family performance,
payment split, stock health and coupon usage — rendered with Recharts.

---

## Overview

This dashboard is the operations cockpit for the [islam-alnashar-perfumes](https://github.com/aslamalkarywk7/islam-alnashar-perfumes)
platform. It authenticates against the store API as an **admin** (JWT), then consumes a single
analytics endpoint that aggregates the SQLite order history server-side:

```
POST /api/auth/login          → JWT (admin only)
GET  /api/admin/analytics     → KPIs + 14-day series + breakdowns
```

No hardcoded numbers: every chart is derived from live orders, so the dashboard stays correct
as the store sells.

## What it shows

| Block | Source |
| --- | --- |
| Net revenue · orders · AOV · cancelled | `kpis` (paid-status aggregation) |
| Revenue — last 14 days (area chart) | `daily` (zero-filled via recursive CTE) |
| Payment method split (donut) | `payment_split` |
| Revenue by fragrance family (bars) | `family_revenue` (join orders → items → products → categories) |
| Best sellers (progress list) | `top_products` |
| Orders by status | `status_breakdown` |
| Stock health · coupons | `stock_health`, `coupons` |

## Tech

- React 19 + TypeScript (strict), Vite 6, Tailwind CSS 4
- Recharts 3 for visualisation
- lucide-react icons, Cairo + Inter self-hosted fonts
- JWT stored in `localStorage`, 401 responses force re-login

## Run

The dashboard proxies `/api` to the store API on `:3001`.

```bash
# 1) start the store (from the islam-alnashar-perfumes repo)
npm run dev            # or: npm start  → http://localhost:3001

# 2) start the dashboard
npm install
npm run dev            # → http://localhost:5174
```

Sign in with the admin account: **admin@aura.com / Admin@123**

> The store seeds 26 demo orders spread over the last 14 days, so the dashboard is
> populated immediately after `npm run db:reset` in the store repo.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Vite dev server on :5174 with API proxy |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Strict TypeScript check |

## Structure

```
src/
├── App.tsx          # Login + dashboard (KPIs, four charts, breakdowns)
├── lib/api.ts       # Fetch wrapper with JWT + typed errors
├── index.css        # Dark luxury theme (ink / gold tokens)
└── main.tsx         # Entry, self-hosted fonts
```

## Roadmap

- [ ] Date-range picker and CSV export
- [ ] Per-product drill-down (views, conversion)
- [ ] WebSocket live updates on new orders
- [ ] Role scoping (read-only analyst accounts)
