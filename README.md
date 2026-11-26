# 💡 LuminaTrack — Streetlight Fault Reporting System · PRJ-118

> **Category:** Public Service Grievance Systems · **Domain:** Public Service · **Focus:** Backend logic, workflow & analytics
> **Student:** Sudharshan Y PDKV · Reg 411623149042 · Dept. Cyber (individual project)

Tracks every streetlight complaint **from submission to closure** — citizen reporting, ward/department
tagging, a guarded status workflow, photo proof upload, and a public analytics dashboard.

** Everybody can deploy this in 2 minutes: no database, no API keys, no `.env`. Data persists in the
browser via `localStorage` (offline-first), with CSV export + JSON backup for availability.**

---

## ✨ Live modules (3 core + 1 dashboard, per 3-week scope tip)

| Module | Route | What it does |
|---|---|---|
| 🏠 Home + live feed | `/` | Hero, live KPIs, 5-step flow, masked public feed, CIA badges |
| 📝 Citizen reporting | `/report` | Validated form + ward/zone tagging + **smart triage** (priority/dept/SLA) + photo-proof upload |
| 🔍 Tracking | `/track` | Search by ticket ID or mobile · progress bar · audit timeline · rating · **reopen** |
| 🛠 Control room (1 admin role + engineer) | `/dashboard` | Login gate · filters/sort · guarded transitions · crew assign · resolve-with-proof · CSV/JSON |
| 📊 Analytics report | `/analytics` | Resolution %, SLA, status/priority donuts, 10-day trend, ward heat, viva summary |
| 📚 Docs & viva | `/docs` | Setup, GitHub+Vercel guide, **14 live self-tests**, demo script, viva Q&A, CIA analysis |

**Demo logins** — Administrator: `admin@lumina.city / admin123` · Field Engineer: `engineer@lumina.city / field123`

## 🧠 Smart triage (the “one smart helper” from Week 2)

Rule-based, explainable scoring over issue-type + description keywords:

- safety words (`spark`, `wire`, `school`, `hospital`…) → **Critical · Safety · Emergency · 12h SLA**
- whole-street outage → **High · Contractor · Night Patrol · 24h**
- flicker/dim → **Medium · 48h** · day-burning/timer → **Low · 72h**

Reasons render live beside the form — evaluators love this.

## 🔄 Status workflow (integrity-guarded)

```
submitted → acknowledged → assigned → in_progress → resolved → closed
                 ↘ rejected                        ↘ reopened → acknowledged/assigned
closed → reopened · rejected → reopened
```

Illegal jumps (e.g. `submitted → resolved`) are **blocked in code** via the `TRANSITIONS` map.
Every change appends `{ status, at, by, note }` to an audit timeline + refreshes a checksum.

## 🛡 CIA triad (as implemented, not just claimed)

- **Confidentiality** — role-gated control room, public feed masks phones (`••••••2345`) & emails, no secrets in code.
- **Integrity** — strict validation, transition guard, audit trail, per-ticket checksum, faithful exports.
- **Availability** — 100% stateless: works offline, survives refresh, JSON backup/restore, CSV anytime, Vercel static-ready.

## ⚙ Setup (local)

```bash
git clone <your-repo-url>
cd luminatrack-prj118
npm install
npm run dev        # http://localhost:3000
```

Validate exactly like the platform does:

```bash
npx next typegen
npm exec tsc -- --noEmit
npm run build
```

Health check: `GET /api/health` → `{ "ok": true, "mode": "stateless-local" }`

## 🐙 GitHub — regular commits (10 marks)

Suggested history (spread across 3 weeks):

```bash
git commit -m "feat: scaffold LuminaTrack PRJ-118"
git commit -m "feat: citizen report form + smart triage"
git commit -m "feat: tracking page with timeline + reopen"
git commit -m "feat: control room with guarded workflow"
git commit -m "feat: analytics dashboard + CSV export"
git commit -m "test: 14 self-tests + docs page"
git commit -m "docs: README + demo script + viva prep"
```

## ▲ Vercel hosting (5 marks)

1. Push to a **public** GitHub repo.
2. `vercel.com → Add New → Project → Import` the repo (framework auto-detected, **no env vars**).
3. Deploy → copy the `https://….vercel.app` link into this README, your report and video description.
4. Prove it: file one ticket on the live link, export one CSV, record the video against the live URL.

## 🧪 Testing & validation (15 marks)

- Open `/docs#tests` → **Run all 14 tests** → screenshot the green `14/14 passed` bar.
- Manual plans per week are listed on the same page (CRUD/forms, triage/errors, end-to-end).
- `SELF_TESTS` live in `src/lib/lumina.ts` — they exercise the real production functions.

## 🎬 2–3 min video + screenshots

Full word-for-word script lives at `/docs#demo`. Capture: home KPIs, triage flip, ticket ID,
tracking timeline, control-room transition, analytics + CSV, green self-tests.

## 🗂 File map (explain this in viva)

```
src/
  app/
    page.tsx          home + live feed + CIA
    report/page.tsx   citizen submission + triage + proof upload
    track/page.tsx    tracking + timeline + rating + reopen
    dashboard/page.tsx  login gate + filters + workflow + export
    analytics/page.tsx  public report/dashboard
    docs/page.tsx     setup + tests + demo + viva + CIA
    api/health/route.ts  stateless healthcheck
  lib/
    lumina.ts         types · triage · validation · seed · analytics · CSV · SELF_TESTS
    store.tsx         single localStorage write-layer (swap for Postgres later)
  components/
    chrome.tsx        navbar + footer + logo
    ui.tsx            badges + stat cards
    charts.tsx        zero-dep SVG donut/bars/trend/heat
```

> Sample/dummy data only. No real citizen PII. Secrets: none — there is nothing to leak.
