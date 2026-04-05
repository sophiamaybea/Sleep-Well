# Sleep-Well — Repo Guide

> **This README is your map.** If you ever wonder "where is X?" or "what does Y do?" — start here.

---

## What is this project?

Sleep-Well is a full-stack TypeScript web app (React frontend + Node/Express backend). It deploys via Render.

---

## Folder Map — Where to Find Things

| Folder | What lives here | When to go here |
|---|---|---|
| `client/src/pages/` | Every **page** of the website (one file = one page) | Editing page content or layout |
| `client/src/components/` | Reusable **UI bits** (buttons, cards, modals, nav) | Changing how something looks |
| `client/src/hooks/` | Custom React logic hooks | Fixing broken data fetching |
| `client/src/data/` | Static/hardcoded data used by the frontend | Editing text, lists, copy |
| `client/src/assets/` | Images, fonts, icons used client-side | Swapping images |
| `client/src/lib/` | Utility functions (helpers, formatters) | Adding a helper function |
| `client/index.html` | The HTML shell the app loads into | Changing tab title, meta tags |
| `server/routes/` | API endpoints — what the server exposes | Adding/editing API routes |
| `server/index.ts` | **Server entry point** — starts everything | Server config, middleware |
| `server/routes.ts` | Registers all routes together | Wiring up a new route file |
| `server/db.ts` | Database connection setup | DB connection issues |
| `server/migrations/` | Database schema changes (run in order) | Changing DB structure |
| `server/lib/` | Server-side utility/helper functions | Backend logic helpers |
| `server/types/` | TypeScript types specific to the server | Type errors on the server |
| `server/seedContent.ts` | Seeds initial data into the DB | Resetting/populating DB |
| `shared/` | Types & schema shared between client AND server | Adding a new DB table or type |
| `public/` | Static files served as-is (robots.txt, sitemap) | SEO, public static files |
| `docs/` | Integration guides, test checklists | Understanding a feature |
| `script/` | One-off utility scripts | Running manual tasks |
| `attached_assets/` | Design assets / reference images | Checking original designs |
| `.github/` | GitHub Actions workflows, Copilot config | CI/CD, automation |

---

## Key Files at the Root

| File | What it does |
|---|---|
| `package.json` | Lists all dependencies; defines `npm run` commands |
| `vite.config.ts` | Frontend build config (Vite bundler) |
| `tsconfig.json` | TypeScript settings |
| `drizzle.config.ts` | Database ORM config (Drizzle + Supabase/Postgres) |
| `nixpacks.toml` | Tells Render how to build the app (Node 20) |
| `DEPLOYMENT.md` | Step-by-step deploy instructions for Render |
| `.gitignore` | Files Git ignores (env vars, node_modules, etc.) |

---

## Quick "Where is..." Cheatsheet

- **Change text/copy on the site** → `client/src/pages/` or `client/src/data/`
- **Change how a component looks** → `client/src/components/`
- **Add a new page** → `client/src/pages/` + register it in `client/src/App.tsx`
- **Add a new API endpoint** → `server/routes/` + register in `server/routes.ts`
- **Change the database structure** → `shared/` (schema) + add a file in `server/migrations/`
- **Add a new npm package** → `npm install ` then check `package.json`
- **Fix a broken build** → check `vite.config.ts`, `tsconfig.json`, `nixpacks.toml`
- **Fix a deploy issue** → read `DEPLOYMENT.md`
- **Edit environment variables** → NOT in the code — set them in Render dashboard

---

## GitHub Tips for This Repo

- **Find a file fast** → press `T` anywhere on the repo to open the file finder and type what you're looking for
- **Search code** → press `/` and type to search, or use `Code` tab → search bar at the top
- **See what changed** → click `History` on any folder/file to see past changes
- **See what's broken** → check the `Actions` tab for red X workflows
- **Open pull requests** → `Pull requests` tab (currently 3 open)
- **Open issues / tasks** → `Issues` tab (currently 4 open)

---

## Branch Naming Convention

| Pattern | Meaning |
|---|---|
| `main` | Live/production code — be careful here |
| `feat/thing-name` | A new feature being built |
| `fix/thing-name` | A bug fix |
| `repo-organisation-*` | Admin/housekeeping branch |

---

## Tech Stack at a Glance

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL via Supabase, managed with Drizzle ORM
- **Auth:** Session-based auth
- **Hosting:** Render
- **CI/CD:** GitHub Actions (see `.github/` folder)
