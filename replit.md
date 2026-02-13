# The Page Gallery Journal

## Overview
A literary journal platform with an immersive, space-themed design. Writers create accounts to write in private "Gardens," editors discover and select work organically (no submissions), and selected pieces are published to the "Gallery."

## Recent Changes
- 2026-02-13: Complete Garden redesign — replaced sidebar+16-page structure with 3-zone architecture (Your Desk / Reading Room / Greenhouse), floating pill nav, Rooms strip for future spaces (Tables, Workshop, Desk, Swap, Retreats, Press), calm reading-room aesthetic
- 2026-02-13: Social features — Tending (follow system), Resonance (5 reaction types: glow/pressed_flower/dewdrop/firefly/roots), Marginalia (annotation-style comments), Notifications ("Whispers")
- 2026-02-13: Planting flow & visibility layers — three-tier visibility (personal/circle/garden), readiness stages (raw_seed/growing/ready_to_show), editorial availability flags, PlantingFlow modal
- 2026-02-13: Built greenhouse tools — Rituals, Compost, Growth Journal, Inner Weather, Reflections, Circles
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

### Garden Architecture (3-Zone Design)
The Garden (`/garden`) uses a 3-zone architecture with floating pill navigation:
- **Your Desk** — Personal writing space: piece cards by stage, inline expand, distraction-free editor with autosave
- **Reading Room** — Curated social feed merging tended gardens + garden feed, letter-like layout, ambient resonances, inline marginalia, "more letters" pagination
- **Greenhouse** — Private creative tools as card grid: Growth Journal, Inner Weather, Rituals, Compost, Reflections, Circles

Navigation: Sticky header with zone pill tabs + Rooms strip (Tables, Workshop, Desk, Swap, Retreats, Press — placeholders for future rooms). Whispers bell + profile menu in header.

Supporting components in `client/src/components/garden/`:
- `PlantingFlow.tsx` - 3-step modal for visibility/readiness/editorial
- `SocialFeatures.tsx` - ResonanceBar, MarginaliaSection, TendButton
- `NotificationPanel.tsx` - Notification center ("Whispers")

### Pages
- `/` - Landing page with hero, star title, garden intro (crayon doodles), two doors, featured, how it works, manifesto
- `/garden` - Authenticated Garden with 3-zone architecture (Desk / Reading Room / Greenhouse), floating nav, Rooms strip

### API Routes
- `GET /api/gallery` - Public: list published writings (supports ?q= search and ?genre= filter)
- `GET /api/writings` - Auth: list user's writings
- `POST /api/writings` - Auth: create a writing
- `PATCH /api/writings/:id` - Auth: update a writing
- `DELETE /api/writings/:id` - Auth: delete a writing
- `GET /api/garden-feed` - Auth: garden-visible pieces (?readiness=, ?genre= filters)
- `GET /api/garden-profile/:userId` - Auth: a member's garden-visible pieces
- `GET /api/circle-feed` - Auth: circle-visible pieces from user's circles
- `POST/DELETE /api/tending/:gardenerId` - Auth: tend/untend a garden
- `GET /api/tending` - Auth: list gardens user is tending
- `GET /api/tenders` - Auth: list who is tending user's garden
- `GET /api/tending/check/:gardenerId` - Auth: check if tending
- `GET /api/tending-feed` - Auth: feed from tended gardens
- `GET /api/tending-count/:userId` - Auth: tender count
- `POST/DELETE /api/resonances` - Auth: add/remove reaction (glow/pressed_flower/dewdrop/firefly/roots)
- `GET /api/resonances/:writingId` - Auth: get resonances for piece
- `GET/POST/DELETE /api/marginalia` - Auth: manage margin notes
- `GET /api/marginalia/:writingId` - Auth: get notes for piece
- `GET /api/notifications` - Auth: list notifications (?unread=true)
- `GET /api/notifications/unread-count` - Auth: unread count
- `PATCH /api/notifications/:id/read` - Auth: mark notification read
- `PATCH /api/notifications/read-all` - Auth: mark all read
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
- `writings` - User writings (title, content, genre, isPublished, visibility [personal/circle/garden], readiness [raw_seed/growing/ready_to_show], editorialAvailable)
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
- `tending` - Follow relationships (tenderId → gardenerId)
- `resonances` - Reactions on writings (glow, pressed_flower, dewdrop, firefly, roots)
- `marginalia` - Annotation-style comments on writings (threaded via parentId)
- `notifications` - User notifications (type, actor, message, read status)

## User Preferences
- "Super immersive" star background with warp-speed effect
- Inky scribble of closed book that opens on scroll
- Elegant literary typography and design
