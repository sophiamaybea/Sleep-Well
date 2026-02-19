# The Page Gallery Journal

## Overview
The Page Gallery Journal is a literary journal platform designed to be an immersive, space-themed digital experience. It allows writers to cultivate their work in private "Gardens," provides editors with an organic method to discover and select literary pieces without traditional submissions, and ultimately publishes selected works to a public "Gallery." The project aims to blend creative writing with a unique digital aesthetic, fostering a community around literary expression and discovery.

## User Preferences
- "Super immersive" star background with warp-speed effect
- Inky scribble of closed book that opens on scroll
- Elegant literary typography and design

## System Architecture

### Stack
- **Frontend:** React + Vite + TailwindCSS + Framer Motion
- **Backend:** Express.js + TypeScript
- **Database:** PostgreSQL with Drizzle ORM
- **Auth:** Replit Auth (OpenID Connect)
- **3D Graphics:** Three.js / React Three Fiber for the star background

### Key Design Decisions
The platform features a distinctive immersive design with dual-theme support:
- **Dark mode ("Teal-Indigo Watercolor Night"):** Inspired by bioluminescent watercolor illustration — deep teal-indigo background (#0d1e2d), gold-leaf firefly accents (#c4a24d), teal-cyan plant silhouettes, and a moonlit atmosphere with cyan glow. Replaces the original flat navy/emerald palette.
- **Light mode ("Frozen Garden"):** Inspired by pen-and-ink botanical illustration on cold winter paper — cool off-white (#f0eeea), graphite text hierarchy (#2d2d2d → #a8a8a8), nearly monochrome UI with a single warm russet accent (#a0522d) for primary actions and active states.
Typography utilizes `Cormorant Garamond` for display, `Lora` for body text, and `Space Mono` for monospaced elements. Interactive elements include an opening book animation triggered by scroll, and a central "Garden" metaphor where writings progress through stages (seed → sprout → bloom).

**UI/UX and Features:**
- **Authentic Typewriter Experience:** Integrates Web Audio API for mechanical key clicks and a "Special Elite" font with an amber cursor for an immersive writing environment.
- **Museum-style Gallery:** Uses CSS `border-image` with an ornate gold-frame asset and `MuseumFrame` component for published works, creating a gallery wall aesthetic.
- **Garden Architecture (4-Zone Design):** The `/garden` area is structured into four zones with collapsible sidebar navigation:
    - **Seeding ("Your first words into the soil"):** Garden Home, Write, My Garden — the foundational private workspace for drafts, fragments, and new writing.
    - **Sunlight ("Where your words are seen"):** Explore, Garden Feed, Gardens I Tend, Reading Queue, Bookmarks — discovery and reading features.
    - **Nutrients ("The space for nurturing your voice"):** Writing Rituals, Growth Journal, Inner Weather, Reflections, Circles — practice and community support tools.
    - **Greenhouse ("Growth under optimal conditions"):** Courses, Submissions, Paid Feedback — structured learning, submission tracking, and editorial feedback.
- **Social Features:** Includes Tending (follow system), Resonance (five reaction types: glow, pressed_flower, dewdrop, firefly, roots), Marginalia (annotation-style comments), Notifications ("Wind Chimes"), quiet read whispers (anonymized reader details like "a poet lingered here yesterday"), and ambient garden presence ("3 writers in the garden right now" with monthly summary).
- **Editorial Studio:** A dedicated `/editor-studio` page with six tabs (Overview, Garden Stream, Greenhouse, Requests & Contracts, Issue Builder, Flagged Queue) for a comprehensive editorial workflow, including role-based permissions, publish request management, issue assembly, and editorial flag response queue with paid-flag priority sorting. Enhanced with: private editorial notes on any piece, writer profile modals (view full body of work from Stream), multi-action menu in Stream (Greenhouse/Notes/Writer/Whisper), shared Greenhouse view across editors, editor-to-editor handoff, flag close/decline with writer notification, and Editors Walk reading queue with piece counts.
- **Community Rooms:** Accessible via a "Discover" dropdown. Includes Tables (redesigned as "The Café" with daily rotating questions and quick responses), Workshop (writing exercises with rotating daily "Prompt of the Day" and community responses), Swap (beta-reading exchange with 1:1 matching, micro-swaps for quick fragment exchanges, and smart matching by genre/length/feedback style for paid users), and The Desk (communal writing).
- **Collaborative Circle Tools:** Circles enhanced with 4-tab interface (Messages, Intentions for weekly goals, Celebrations for milestones, Prompt Potluck with random draw), 3-5 member cap, rotating weekly share rhythm with turn indicators, and weekly micro-prompts (automatic one-sentence prompts everyone responds to).
- **Accessibility Features:** Optional toggles (Reduce Motion, High Contrast, Larger Text, Dyslexia Font via Atkinson Hyperlegible, Wider Spacing, Focus Mode) accessible from profile menu, persisted via localStorage, applied globally via CSS classes on html root with pre-hydration inline script.
- **Writer Profiles:** Public `/writer/:id` pages displaying bios, published works, tending connections, and resonance counts.
- **Content Management:** Implements rich text editing via TipTap, piece organization with custom tags, pinning/unpinning, and archiving.
- **Export Functionality:** Allows downloading writings in `.txt`, `.md`, PDF, or `.docx` (Shunn manuscript format with Courier New, double-spaced, proper headers) formats.
- **Loading States:** Uses animated skeleton placeholders for enhanced user experience during content loading.
- **Landing Page Interactivity:** Features 3D tilt cards, word-by-word text reveals, magnetic cursor buttons, and animated sections.

- **Tier System ("Cultivator"):** Free/paid tier model. Free tier includes all writing, social, and community features. Paid "Cultivator" tier adds: smart Swap matching (by genre, length, feedback style), editorial flag with guaranteed read + response (3-step visual pipeline tracker: Flagged → Seen → Responded), priority visibility in editor queue (paid flags sorted first with "Guaranteed read" badge and Crown icon), manual version snapshots with restore capability and word-count diffs, enhanced writing analytics (acceptance rate with ring indicator, writing streak with flame icon, personal records for longest piece/fastest growth, total word count, weekly word-count goal progress bar). Career zone upgrade gate shows 6 feature highlight cards with staggered animations. Tier stored on user record, displayed as amber "Cultivator" badge in garden profile.
- **Self-Publishing (Open Garden):** Writers toggle pieces public independently of Gallery via per-piece "Public" toggle. Public pieces appear on `/public-garden/:userId` pages with shareable URLs. Separates writer-controlled publishing from editorial curation.
- **Editorial Flags & Editors Walk:** Writers flag pieces "Ready for eyes" for editor attention (1 active flag normally, up to 3 during Editors Walk seasonal windows). Editors see flagged queue with paid-flag priority sorting. Editors Walk configurable periods managed from Editor Studio Overview tab.

### Pages
- `/`: Landing page (StarTitle → Hero with "The Page Gallery Journal" title, two CTAs → Footer).
- `/about`: About page with Journal editorial identity, Garden section, editorial model steps, and "Why a Garden?" section.
- `/in-bloom` (alias `/gallery`): "In Bloom" — bloomed works selected by editors, with contributor view and reading mode.
- `/publications`: Print editions page with Available Now (current issues), Our Friends (literary presses), and Archive sections.
- `/seasons` (alias `/challenges`): "Seasons" — time-bound creative prompts on a regular cycle.
- `/greenhouse` (alias `/nursery`): "The Greenhouse" — 4-tab page: Courses, Editorial Feedback (paid tiers), Submissions tracker, Portfolio builder.
- `/how-it-works`: 3-part structure: intro paragraphs (Mission/Who/What), Garden vs Journal comparison, feature walkthrough (Seeding/Sunlight/Nutrients/Greenhouse).
- `/garden`: Authenticated user garden with 4-zone sidebar (Seeding, Sunlight, Nutrients, Greenhouse).
- `/opportunities`: Curated Opportunities page with 3 tabs.
- `/commons`: The Commons - communal shared garden.
- `/field-guide`: FAQ/reference page with botanical-themed accordion sections.
- `/public-garden/:userId`: Public garden page with writer's self-published pieces.
- `/writer/:id`: Public writer profile.
- `/editor-studio`: Editor-only dashboard with 6 tabs.
- `/eic-dashboard`: Editor-in-Chief admin panel.
- `/editor-onboarding`: Public onboarding page for invited editors.

### Navigation (6 main items)
Home, In Bloom, Publications, Seasons, About, How It Works

### Role System
- `writer` (default) — can access Garden only
- `editor` — can access Editorial Studio + Garden
- `editor_in_chief` — can access everything including EIC Dashboard
- Roles are stored in `users.role` field. Editor invitations use the `editor_invitations` table with crypto-secure UUID tokens, 7-day expiry, and status tracking (pending/accepted/expired).

## External Dependencies
- **Replit Auth:** Used for user authentication (OpenID Connect).
- **Three.js / React Three Fiber:** Integrated for 3D rendering of the star background.
- **Vite, TailwindCSS, Framer Motion, Express.js, TypeScript, PostgreSQL, Drizzle ORM, TipTap, Web Audio API, DOMPurify, docx:** Core technologies and libraries used in the development stack.