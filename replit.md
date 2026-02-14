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
The platform features a distinctive space-themed immersive design, characterized by a 3D star background and a consistent aesthetic. Typography utilizes `Cormorant Garamond` for display, `Lora` for body text, and `Space Mono` for monospaced elements. The color palette centers on a deep blue/cream (`#0b101a` for background). Interactive elements include an opening book animation triggered by scroll, and a central "Garden" metaphor where writings progress through stages (seed → sprout → bloom).

**UI/UX and Features:**
- **Authentic Typewriter Experience:** Integrates Web Audio API for mechanical key clicks and a "Special Elite" font with an amber cursor for an immersive writing environment.
- **Museum-style Gallery:** Uses CSS `border-image` with an ornate gold-frame asset and `MuseumFrame` component for published works, creating a gallery wall aesthetic.
- **Garden Architecture (4-Zone Design):** The `/garden` area is structured into four zones with floating pill navigation:
    - **Your Desk:** Personal writing space with piece cards, inline expansion, a distraction-free editor with autosave, version snapshots (auto-saved on stage changes + manual "Save this state" with timeline view showing notes), 4-stage readiness (seed → growing → ready → dormant), "Open Garden" public toggle per piece, and "Ready for eyes" editorial flag button.
    - **Reading Room:** A curated social feed combining tended gardens and general garden activity, presented in a letter-like layout with ambient resonances, inline marginalia, sort/filter controls (Recent/Quiet/Tended + genre filters), quiet read signals, editor-curated opportunities banner, and a "Daily Letter" — one featured piece each morning presented like a letter from the garden.
    - **Greenhouse:** A streamlined suite of creative tools: Freewrite (with built-in timer), Growth Journal (with Reflections prompts tab), and Circles.
    - **Career:** Submission tracker and career tools (paid tier anchor). 5 sub-tabs: Tracker (submission log with status pipeline), Credits (publication credit management with rights tracking), Bio (writer bio management with copy buttons), Letters (cover letter templates with variable substitution), Analytics (writing practice dashboard with frequency charts and stage/genre breakdowns). Free tier sees blurred preview with upgrade prompt.
- **Social Features:** Includes Tending (follow system), Resonance (five reaction types: glow, pressed_flower, dewdrop, firefly, roots), Marginalia (annotation-style comments), Notifications ("Whispers"), quiet read whispers (anonymized reader details like "a poet lingered here yesterday"), and ambient garden presence ("3 writers in the garden right now" with monthly summary).
- **Editorial Studio:** A dedicated `/editor-studio` page with six tabs (Overview, Garden Stream, Greenhouse, Requests & Contracts, Issue Builder, Flagged Queue) for a comprehensive editorial workflow, including role-based permissions, publish request management, issue assembly, and editorial flag response queue with paid-flag priority sorting. Enhanced with: private editorial notes on any piece, writer profile modals (view full body of work from Stream), multi-action menu in Stream (Greenhouse/Notes/Writer/Whisper), shared Greenhouse view across editors, editor-to-editor handoff, flag close/decline with writer notification, and Editors Walk reading queue with piece counts.
- **Community Rooms:** Accessible via a "Discover" dropdown. Includes Tables (redesigned as "The Café" with daily rotating questions and quick responses), Workshop (writing exercises with rotating daily "Prompt of the Day" and community responses), Swap (beta-reading exchange with 1:1 matching, micro-swaps for quick fragment exchanges, and smart matching by genre/length/feedback style for paid users), and The Desk (communal writing).
- **Collaborative Circle Tools:** Circles enhanced with 4-tab interface (Messages, Intentions for weekly goals, Celebrations for milestones, Prompt Potluck with random draw), 3-5 member cap, rotating weekly share rhythm with turn indicators, and weekly micro-prompts (automatic one-sentence prompts everyone responds to).
- **Accessibility Features:** Optional toggles (Reduce Motion, High Contrast, Larger Text, Dyslexia Font via Atkinson Hyperlegible, Wider Spacing, Focus Mode) accessible from profile menu, persisted via localStorage, applied globally via CSS classes on html root with pre-hydration inline script.
- **Writer Profiles:** Public `/writer/:id` pages displaying bios, published works, tending connections, and resonance counts.
- **Content Management:** Implements rich text editing via TipTap, piece organization with custom tags, pinning/unpinning, and archiving.
- **Export Functionality:** Allows downloading writings in `.txt`, `.md`, PDF, or `.docx` (Shunn manuscript format with Courier New, double-spaced, proper headers) formats.
- **Loading States:** Uses animated skeleton placeholders for enhanced user experience during content loading.
- **Landing Page Interactivity:** Features 3D tilt cards, word-by-word text reveals, magnetic cursor buttons, and animated sections.

- **Tier System ("Cultivator"):** Free/paid tier model. Free tier includes all writing, social, and community features. Paid "Cultivator" tier adds: smart Swap matching (by genre, length, feedback style), editorial flag with guaranteed read + response, priority visibility in editor queue (paid flags sorted first with "Guaranteed read" badge), manual version snapshots. Tier stored on user record, displayed as amber "Cultivator" badge in garden profile.
- **Self-Publishing (Open Garden):** Writers toggle pieces public independently of Gallery via per-piece "Public" toggle. Public pieces appear on `/public-garden/:userId` pages with shareable URLs. Separates writer-controlled publishing from editorial curation.
- **Editorial Flags & Editors Walk:** Writers flag pieces "Ready for eyes" for editor attention (1 active flag normally, up to 3 during Editors Walk seasonal windows). Editors see flagged queue with paid-flag priority sorting. Editors Walk configurable periods managed from Editor Studio Overview tab.

### Pages
- `/`: Landing page (condensed: StarTitle → GardenIntro → Featured → Footer).
- `/about`: Philosophy page with TwoDoors and Manifesto sections.
- `/gallery`: Public gallery page with museum-framed published works, search, and genre filters.
- `/garden`: Authenticated user garden with 3-zone architecture.
- `/public-garden/:userId`: Public garden page with writer's self-published pieces and shareable URL.
- `/writer/:id`: Public writer profile.
- `/editor-studio`: Editor-only dashboard with 6 tabs.

## External Dependencies
- **Replit Auth:** Used for user authentication (OpenID Connect).
- **Three.js / React Three Fiber:** Integrated for 3D rendering of the star background.
- **Vite, TailwindCSS, Framer Motion, Express.js, TypeScript, PostgreSQL, Drizzle ORM, TipTap, Web Audio API, DOMPurify, docx:** Core technologies and libraries used in the development stack.