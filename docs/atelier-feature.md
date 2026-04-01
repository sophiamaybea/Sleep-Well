# The Atelier — Integration Guide

**Route:** `/atelier`
**Branch:** `feat/atelier-room`
**Status:** Ready to integrate — run migration first

---

## What It Is

The Atelier is an asynchronous, self-paced library of writing exercise series, separate from WorkshopRoom. Each series is a curated arc of prompts that moves through a technique, form, or question. Free members get the first 2 exercises of any series; Cultivators get everything and can save directly to the Garden.

## Access Tiers

| Tier | Access |
|------|--------|
| Free | Browse all series · Complete exercises 1–2 of any series |
| Cultivator | All exercises · Save responses to Garden |
| Editor / Admin | Full access + editor admin routes |

Paywall placement: in-context after exercise 2, when the writer is already invested — highest conversion moment.

---

## Step 1: Run Migration in Supabase SQL Editor

File: `server/migrations/atelier_tables.sql`

Run it. Verify:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_name IN ('atelier_series', 'atelier_exercises', 'atelier_responses')
ORDER BY table_name;
-- Expected: 3 rows
```

Spot-check existing tables are unchanged:
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'writings' ORDER BY column_name;
-- Should be identical to your baseline list
```

---

## Step 2: Register the Route in server/index.ts

Add exactly two lines in `server/index.ts`:

```ts
// Import (top of file with other route imports)
import atelierRouter from "./routes/atelier";

// Registration (after other app.use("/api/...") lines)
app.use("/api/atelier", atelierRouter);
```

Do not edit any other content in `server/index.ts`.

---

## Step 3: Add the Route in client/src/App.tsx

```tsx
import { lazy } from "react";
const Atelier = lazy(() => import("@/pages/Atelier"));

// Inside your <Switch> or <Routes>:
<Route path="/atelier" component={Atelier} />
```

(Or use the non-lazy version if App.tsx does not use Suspense for other pages.)

---

## New Files (zero changes to existing files except the 2 lines above)

| File | Purpose |
|------|---------|
| `shared/atelier.schema.ts` | Drizzle table declarations |
| `server/routes/atelier.ts` | Express router — 8 endpoints |
| `client/src/hooks/useAtelier.ts` | TanStack Query hooks (4 hooks) |
| `client/src/pages/Atelier.tsx` | Page component |
| `server/migrations/atelier_tables.sql` | Migration SQL |

---

## API Reference

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/atelier/series` | auth | Published series only |
| GET | `/api/atelier/series/:id` | auth | Exercises gated at position 2 for free tier |
| POST | `/api/atelier/series/:id/respond` | auth | Paywall enforced server-side |
| POST | `/api/atelier/series/:id/respond/:responseId/save-to-garden` | auth + cultivator | Plants writing with `stage=seed, visibility=personal, readiness=raw_seed` |
| GET | `/api/atelier/admin/series` | editor | All series incl. unpublished |
| POST | `/api/atelier/admin/series` | editor | Create series |
| PATCH | `/api/atelier/admin/series/:id` | editor | Update / publish |
| POST | `/api/atelier/admin/series/:id/exercises` | editor | Add exercise |

---

## Seeding Your First Series (editor only, via curl or Insomnia)

```bash
# 1. Create a series
curl -X POST https://your-app.railway.app/api/atelier/admin/series \
  -H 'Content-Type: application/json' \
  -H 'Cookie: [your session cookie]' \
  -d '{"title": "The Threshold", "subtitle": "Six exercises on beginning", "theme": "beginnings", "facilitator": "The Editors", "genre": "poetry", "description": "Six exercises that take the problem of the first line seriously.", "isPublished": false}'

# 2. Add exercises (repeat for each)
curl -X POST https://your-app.railway.app/api/atelier/admin/series/[SERIES_ID]/exercises \
  -H 'Content-Type: application/json' \
  -H 'Cookie: [your session cookie]' \
  -d '{"title": "The borrowed first line", "prompt": "Take the first line of a poem you love. Write it down. Now write the poem it should have been the opening of. Do not use the borrowed line in your final piece.", "craftNote": "First lines are permissions. This exercise lets you steal one while forcing you to earn your own.", "sortOrder": 1}'

# 3. Publish when ready
curl -X PATCH https://your-app.railway.app/api/atelier/admin/series/[SERIES_ID] \
  -H 'Content-Type: application/json' \
  -H 'Cookie: [your session cookie]' \
  -d '{"isPublished": true}'
```

---

## Test Checklist

**Schema & data**
- [ ] 3 new tables in Supabase (`atelier_series`, `atelier_exercises`, `atelier_responses`)
- [ ] Spot-check: `writings`, `circles`, `submissions` columns unchanged
- [ ] Insert a test series and exercise via admin endpoint; confirm rows appear in Supabase

**Server**
- [ ] GET `/api/atelier/series` returns 401 without session cookie
- [ ] Free user: POST to exercise 3 returns 403 (`"Upgrade to Cultivator to continue"`)
- [ ] Cultivator: POST to exercise 3 returns 201
- [ ] Editor admin routes return 403 for writer role
- [ ] Zero new console errors in server logs
- [ ] Three existing endpoints tested and passing (e.g. `/api/writings`, `/api/workshop/sessions`, `/api/user`)

**Frontend**
- [ ] `/atelier` renders at 375px, 768px, 1440px with zero console errors
- [ ] Free member sees paywall sentinel after exercise 2
- [ ] Cultivator sees all exercises and “Save to Garden” button
- [ ] Save to Garden: new writing appears in Garden with `stage=seed`
- [ ] Loading state displays while series fetches
- [ ] Error state displays if series fetch fails

**Regressions**
- [ ] Garden write still works
- [ ] Editorial flag still works
- [ ] Community post still works
- [ ] Existing WorkshopRoom unaffected

---

## Absolute Constraints Respected

- `shared/schema.ts` not modified (new file only)
- `writings` enum values untouched: `['personal','circle','garden']` / `['raw_seed','growing','ready_to_show','dormant']`
- Role-reset block in `server/index.ts` not touched
- No third-party npm packages added
- No existing TanStack Query cache keys renamed or removed
- Paywall enforced server-side (not client-only)
- `/api/debug/db` not referenced anywhere in new code
