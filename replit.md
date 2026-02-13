# The Page Gallery Journal

## Overview
A literary journal platform with an immersive, space-themed design. Writers create accounts to write in private "Gardens," editors discover and select work organically (no submissions), and selected pieces are published to the "Gallery."

## Recent Changes
- 2026-02-13: Built all 16 Garden features — Gallery, Reading Queue, Explore, Saved, Pollination, Rituals, Compost, Growth Journal, Submissions, Inner Weather, Reflections, Seasonal Review, Root System, Circles, Moonlit Readings, Replant Requests
- 2026-02-13: Complete Garden redesign — sidebar navigation with 5 section groups, 3-step interactive landing, My Garden with search/filters/expandable cards, dedicated Write editor
- 2026-02-13: Enhanced landing page interactivity: 3D tilt cards (TwoDoors), word-by-word text reveals (Hero, Manifesto), magnetic cursor buttons, shine sweep cards (Featured), interactive grow cards (GardenIntro), animated timeline (HowItWorks)
- 2026-02-12: Added GardenIntro section with crayon flower doodles (CrayonFlower, CrayonDaisy, CrayonTulip, SmallSprout SVGs)
- 2026-02-12: Changed star title font to "Special Elite" (messy typewriter)
- 2026-02-12: Set up Replit Auth integration (OAuth with Google, GitHub, email)
- 2026-02-12: Built Garden page (writing interface for authenticated users)
- 2026-02-12: Connected Featured section to real gallery API

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

### Garden Feature Architecture
Feature pages are organized in `client/src/components/garden/`:
- `DiscoverFeatures.tsx` - Gallery, ReadingQueue, Explore, Saved, Pollination
- `PracticeFeatures.tsx` - Rituals, Compost, GrowthJournal, Submissions
- `ReflectFeatures.tsx` - InnerWeather, Reflections, SeasonalReview, RootSystem
- `CommunityFeatures.tsx` - Circles, MoonlitReadings, ReplantRequests

### Pages
- `/` - Landing page with hero, star title, garden intro (crayon doodles), two doors, featured, how it works, manifesto
- `/garden` - Authenticated Garden with sidebar navigation, 5 section groups (Create/Discover/Practice/Reflect/Community), all 16+ feature pages fully implemented

### API Routes
- `GET /api/gallery` - Public: list published writings (supports ?q= search and ?genre= filter)
- `GET /api/writings` - Auth: list user's writings
- `POST /api/writings` - Auth: create a writing
- `PATCH /api/writings/:id` - Auth: update a writing
- `DELETE /api/writings/:id` - Auth: delete a writing
- `GET/POST/DELETE /api/reading-queue` - Auth: manage reading queue
- `PATCH /api/reading-queue/:id/read` - Auth: mark as read
- `GET/POST/DELETE /api/saved` - Auth: manage saved pieces
- `GET/POST /api/pollinations` - Auth: give/receive pollination feedback
- `GET /api/prompts` - Public: list writing prompts
- `GET /api/prompts/random` - Public: get random prompt
- `GET/POST /api/rituals` - Auth: manage writing ritual sessions
- `GET/POST/DELETE /api/compost` - Auth: manage compost entries
- `PATCH /api/compost/:id/recycle` - Auth: recycle a compost entry
- `GET/POST/DELETE /api/growth-journal` - Auth: manage growth journal
- `GET /api/submissions` - Auth: view submission status
- `GET/POST /api/inner-weather` - Auth: track creative mood
- `GET/POST/DELETE /api/reflections` - Auth: manage reflections
- `GET /api/seasonal-review` - Auth: seasonal stats summary
- `GET/POST/DELETE /api/root-influences` - Auth: manage influences
- `GET/POST /api/circles` - Auth: manage writing circles
- `POST/DELETE /api/circles/:id/join|leave` - Auth: join/leave circles
- `GET/POST /api/circles/:id/messages` - Auth: circle messaging
- `GET/POST /api/moonlit-readings` - Auth: manage readings events
- `POST/DELETE /api/moonlit-readings/:id/join|leave` - Auth: RSVP
- `GET /api/replant-requests` - Auth: view editorial invitations
- `PATCH /api/replant-requests/:id` - Auth: accept/decline
- Auth routes: `/api/login`, `/api/logout`, `/api/callback`, `/api/auth/user`

### Database Tables
- `users` - Replit Auth user profiles
- `sessions` - Session storage for auth
- `writings` - User writings (title, content, stage, genre, isPublished)
- `reading_queue` - User's reading queue items
- `saved_pieces` - User's bookmarked pieces
- `pollinations` - Feedback/affirmations between users
- `prompts` - Writing prompts by category
- `ritual_sessions` - Timed writing session records
- `compost_entries` - Archived fragments
- `growth_journal_entries` - Private reflections linked to writings
- `inner_weather` - Mood/energy tracking entries
- `reflections` - Structured craft reflections
- `circles` - Writing circle groups
- `circle_members` - Circle membership
- `circle_messages` - Messages within circles
- `moonlit_readings` - Reading events
- `reading_participants` - Reading event RSVPs
- `replant_requests` - Editorial invitations
- `root_influences` - Mapped influences and connections

## User Preferences
- "Super immersive" star background with warp-speed effect
- Inky scribble of closed book that opens on scroll
- Elegant literary typography and design
