# The Page Gallery Journal

## Overview
A literary journal platform with an immersive, space-themed design. Writers create accounts to write in private "Gardens," editors discover and select work organically (no submissions), and selected pieces are published to the "Gallery."

## Recent Changes
- 2026-02-13: Complete Garden redesign — sidebar navigation with 5 section groups, 3-step interactive landing, My Garden with search/filters/expandable cards, dedicated Write editor, Coming Soon pages for future features
- 2026-02-13: Enhanced landing page interactivity: 3D tilt cards (TwoDoors), word-by-word text reveals (Hero, Manifesto), magnetic cursor buttons, shine sweep cards (Featured), interactive grow cards (GardenIntro), animated timeline (HowItWorks)
- 2026-02-12: Added GardenIntro section with crayon flower doodles (CrayonFlower, CrayonDaisy, CrayonTulip, SmallSprout SVGs)
- 2026-02-12: Changed star title font to "Special Elite" (messy typewriter)
- 2026-02-12: Set up Replit Auth integration (OAuth with Google, GitHub, email)
- 2026-02-12: Built Garden page (writing interface for authenticated users)
- 2026-02-12: Connected Featured section to real gallery API
- 2026-02-12: Fixed BookAnimation useMotionTemplate hook error
- 2026-02-12: Fixed nested `<a>` tag warning in Navigation

## Project Architecture

### Stack
- Frontend: React + Vite + TailwindCSS + Framer Motion
- Backend: Express.js + TypeScript
- Database: PostgreSQL with Drizzle ORM
- Auth: Replit Auth (OpenID Connect)
- 3D: Three.js / React Three Fiber for star background

### Key Design Decisions
- Space-themed immersive design with 3D star background
- Typography: Cormorant Garamond (display), Lora (body), Space Mono (mono)
- Color palette: deep blue/cream (#0b101a background)
- Opening book animation with scroll-triggered reveal
- Garden metaphor: writings go through stages (seed → sprout → bloom)

### Pages
- `/` - Landing page with hero, star title, garden intro (crayon doodles), two doors, featured, how it works, manifesto
- `/garden` - Authenticated Garden with sidebar navigation, 5 section groups (Create/Discover/Practice/Reflect/Community), landing page, My Garden dashboard (search, filters, expandable cards), Write editor, and Coming Soon placeholder pages

### API Routes
- `GET /api/gallery` - Public: list published writings
- `GET /api/writings` - Auth: list user's writings
- `POST /api/writings` - Auth: create a writing
- `PATCH /api/writings/:id` - Auth: update a writing
- `DELETE /api/writings/:id` - Auth: delete a writing
- Auth routes: `/api/login`, `/api/logout`, `/api/callback`, `/api/auth/user`

### Database Tables
- `users` - Replit Auth user profiles
- `sessions` - Session storage for auth
- `writings` - User writings (title, content, stage, genre, isPublished)

## User Preferences
- "Super immersive" star background with warp-speed effect
- Inky scribble of closed book that opens on scroll
- Elegant literary typography and design
