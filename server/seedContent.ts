import { db } from "./db";
import { siteContent, notifications, users } from "@shared/schema";
import { sql, eq } from "drizzle-orm";

interface SeedRow {
  pageKey: string;
  sectionKey: string;
  content: string;
  contentType?: string;
  label: string;
  groupLabel?: string;
  sortOrder?: number;
}

function r(pageKey: string, sectionKey: string, label: string, content: string, groupLabel?: string, sortOrder = 0, contentType = "text"): SeedRow {
  return { pageKey, sectionKey, label, content, groupLabel, sortOrder, contentType };
}

const seeds: SeedRow[] = [
  // === HOME / HERO ===
  r("home", "hero-title", "Hero Title", "The Page Gallery Journal", "Hero", 0),
  r("home", "hero-subheading", "Hero Subheading", "Plant a page. Watch it bloom.", "Hero", 1),
  r("home", "hero-cta-journal", "Read the Journal Button", "Read the Journal", "Hero", 2),
  r("home", "hero-cta-write", "Start Writing Button", "Start Writing", "Hero", 3),
  r("home", "hero-cta-about", "About Us Button", "About Us", "Hero", 4),

  // === HOME / GARDEN INTRO ===
  r("home", "garden-intro-overline", "Garden Intro Overline", "Your Private Space", "Garden Intro", 10),
  r("home", "garden-intro-title", "Garden Intro Title", "The Garden", "Garden Intro", 11),
  r("home", "garden-intro-description", "Garden Intro Description", "Every writer gets a private garden — a quiet place to plant ideas, tend to drafts, and let your words grow at their own pace. No deadlines. No pressure. Just soil, sun, and your imagination.", "Garden Intro", 12),
  r("home", "garden-stage-seed-title", "Seed Stage Title", "Seed (Private Draft)", "Garden Intro", 13),
  r("home", "garden-stage-seed-desc", "Seed Stage Description", "Write your first ideas here. This is private. No one else can see this until you are ready.", "Garden Intro", 15),
  r("home", "garden-stage-sprout-title", "Sprout Stage Title", "Sprout (Editing)", "Garden Intro", 16),
  r("home", "garden-stage-sprout-desc", "Sprout Stage Description", "Keep writing and making it better. It is still private and safe in your personal workspace.", "Garden Intro", 18),
  r("home", "garden-stage-bloom-title", "Bloom Stage Title", "Bloom (Public)", "Garden Intro", 19),
  r("home", "garden-stage-bloom-desc", "Bloom Stage Description", "When you are happy with it, you can share it with others. Our editors also look here for stories to publish.", "Garden Intro", 21),
  r("home", "garden-intro-cta", "Garden Intro CTA", "Go to Your Writing Space", "Garden Intro", 22),

  // === ABOUT ===
  r("about", "title", "Page Title", "About the Journal", "Header", 0),
  r("about", "paragraph-1", "Paragraph 1", "I got sick and the world shrank to the square foot around my bed. In that slowed-down space, small things gained weight: the way people spoke when they weren't performing, the accidental sentences that slipped out between tasks. I began to collect those fragments.", "Narrative", 1),
  r("about", "paragraph-2", "Paragraph 2", "I made a vow: to build a place that would treat people's words as exhibits, because that is what they are—evidence of a mind insisting on being heard. Not decoration. Not draft material. Exhibits.", "Narrative", 2),
  r("about", "paragraph-3", "Paragraph 3", "I built The Page Gallery as a way of keeping that promise. The calls are written in plain language. The edits explain instead of exclude. The invitations don't depend on the right credentials. And the fragments themselves are not apologised for—they are the form.", "Narrative", 3),
  r("about", "paragraph-4", "Paragraph 4", "The Gallery is not an archive of polish; it is a body in motion. It shifts like weather. Step inside and you are briefly inside someone else's thinking: their private weather system, their running joke, their hesitation. Nothing here is manicured to impress. It is presented to be witnessed. The smudge, the strike-through, the tangent: each is proof that a life was here, demanding to be noticed.", "Narrative", 4),
  r("about", "paragraph-5", "Paragraph 5", "I believe anyone who can write can change what the world pays attention to. Change does not mean utopia. It means a door opens, a silence cracks, a perspective shifts. The Page Gallery listens hard enough to make that possible, carrying voices into spaces they have not been allowed to reach.", "Narrative", 5),
  r("about", "founder-name", "Founder Name", "Sophia Sharkey, Founder", "Attribution", 6),
  r("about", "founder-org", "Founder Organization", "The Page Gallery, 2025.", "Attribution", 7),
  r("about", "diary-quote", "Diary Quote", "\"If this kills me, or if I live to be 90, the when is not my concern anymore. The point is this: I will not leave without finding a way for no more people to die unheard. I will build a world that refuses the gates. A place where voice isn't weighed by credentials, where language belongs to lungs that need it, where no life disappears without its record.\"", "Diary", 8),
  r("about", "diary-attribution", "Diary Attribution", "—Sophia's hospital diary", "Diary", 9),
  r("about", "editors-title", "Editors Section Title", "Your Editors", "Editors", 10),

  // === HOW IT WORKS ===
  r("how-it-works", "hero-title", "Hero Title", "Why a Garden?", "Hero", 0),
  r("how-it-works", "hero-subtitle", "Hero Subtitle", "Because writing is cultivation, not manufacturing.", "Hero", 1),
  r("how-it-works", "attention-title", "Attention Section Title", "Attention Over Engagement", "Philosophy", 2),
  r("how-it-works", "attention-desc", "Attention Section Description", "Most platforms are designed to capture your attention. We built one designed to protect it.", "Philosophy", 3),
  r("how-it-works", "garden-metaphor", "Garden Metaphor", "The difference matters. Engagement asks: how do we keep you here longer? Attention asks: how do we help you go deeper? Every decision we've made — from the absence of algorithms to the presence of silence — follows from that distinction.", "Philosophy", 4),
  r("how-it-works", "features-title", "Features Section Title", "Features as Philosophy", "Features", 5),
  r("how-it-works", "soil-title", "The Soil Title", "The Soil", "Features", 6),
  r("how-it-works", "soil-subtitle", "The Soil Subtitle", "Private drafts. The locked door.", "Features", 7),
  r("how-it-works", "soil-desc", "The Soil Description", "Your private writing space. No one else can see it. No one is counting your words or tracking your streaks. This is where you write your first ideas, your messy drafts, the sentences you're not sure about yet. They can stay here as long as they need to. Some may never leave, and that's not failure — that's the work.", "Features", 8),
  r("how-it-works", "sunlight-title", "Sunlight Title", "Sunlight", "Features", 9),
  r("how-it-works", "sunlight-subtitle", "Sunlight Subtitle", "Shared reading. Discovery by theme, not algorithm.", "Features", 10),
  r("how-it-works", "sunlight-desc", "Sunlight Description", "When you're ready to share a piece, it enters the light. Other writers can find it — not through an algorithm, but through shared themes and tags. You discover writing by others who are thinking about the same things you are. There is no trending page. No popularity contest. Just the quiet act of one writer finding another.", "Features", 11),
  r("how-it-works", "nutrients-title", "Nutrients Title", "Nutrients", "Features", 12),
  r("how-it-works", "nutrients-subtitle", "Nutrients Subtitle", "Practice, reflection, community.", "Features", 13),
  r("how-it-works", "nutrients-desc", "Nutrients Description", "Prompts, rituals, small circles of writers who meet regularly. Not to perform productivity, but to cultivate the habit of paying attention. The growth journal is a mirror, not a scoreboard. Circles are intimate, not competitive. Everything here is designed to make the practice sustainable, not impressive.", "Features", 14),
  r("how-it-works", "greenhouse-title", "The Greenhouse Title", "The Greenhouse", "Features", 15),
  r("how-it-works", "greenhouse-subtitle", "The Greenhouse Subtitle", "Deepening your practice.", "Features", 16),
  r("how-it-works", "greenhouse-desc", "The Greenhouse Description", "Guided courses and editorial feedback from writers who understand that the work is never really finished — only released. The Greenhouse is where you go to deepen what you've started. Not to be corrected, but to be read carefully. To have someone sit with your work the way you sat with it.", "Features", 17),
  r("how-it-works", "quiet-title", "Quiet Parts Title", "The Quiet Parts", "Quiet Parts", 18),
  r("how-it-works", "cta-title", "CTA Title", "Ready to plant?", "CTA", 19),

  // === GARDEN INFO ===
  r("garden-info", "title", "Page Title", "The Garden", "Header", 0),
  r("garden-info", "subtitle", "Page Subtitle", "A writing space for the life before the work is finished.", "Header", 1),
  r("garden-info", "submitting-title", "Submitting Title", "Submitting", "Submitting", 2),
  r("garden-info", "submitting-desc", "Submitting Description", "There is no submission form. When you write in The Garden, you are already submitting. Our editors move through the same space you do, reading as the work grows. If something jumps out — a fragment, a draft, a sentence that refuses to sit still — it may be invited for publication in The Page Gallery. You don't need to prepare anything or flag anything. Just write.", "Submitting", 3),
  r("garden-info", "about-title", "About The Garden Title", "About The Garden", "About", 4),
  r("garden-info", "about-desc", "About The Garden Description", "There is a specific gesture that every literary platform performs and nobody mentions. The gesture is this: a text field, a word count, a submit button. Sometimes there is a cover letter box. Sometimes a dropdown menu for genre. The infrastructure communicates, with the plain efficiency of a customs desk, that writing is a thing you produce elsewhere and then deposit here. The platform receives. The writer delivers. Between those two actions — the making and the handing over — is the entire creative life, and no platform has ever been interested in it. They want the parcel. They have no use for the hands.", "About", 5),
  r("garden-info", "garden-gallery-title", "Garden vs Gallery Title", "The Garden and The Page Gallery", "Relationship", 6),
  r("garden-info", "garden-gallery-desc", "Garden vs Gallery Description", "The Garden and The Page Gallery are two separate worlds with a door between them.", "Relationship", 7),
  r("garden-info", "digital-title", "Digital Gardening Title", "Digital Gardening", "Digital", 8),
  r("garden-info", "digital-desc", "Digital Gardening Description", "Digital gardening, as Maggie Appleton has documented it, is the practice of maintaining a collection of evolving, interlinked notes that refuses the time-stamp logic of the feed. Where the stream shows you only the zeitgeist of the last twenty-four hours and is not designed to accumulate knowledge or mature over time, the garden grows slowly, connects by association, and treats the unfinished as a feature rather than a defect.", "Digital", 9),
  r("garden-info", "how-title", "How It Works Title", "How It Works", "Mechanics", 10),
  r("garden-info", "metric-title", "The Only Metric Title", "The Only Metric", "Metric", 11),
  r("garden-info", "metric-desc", "The Only Metric Description", "The Garden draws one line: is this generative for the person making it?", "Metric", 12),
  r("garden-info", "what-for-title", "What The Garden Is For Title", "What The Garden Is For", "Purpose", 13),
  r("garden-info", "manifesto", "Concluding Manifesto", "This is a bet that the most important part of a creative life is the part no one sees. The years of fragments. The ideas that never became pieces. The daily rotation through mediocrity, the dogged returning, the slow accumulation of connections only you could have made because only you were paying that particular quality of attention to that particular set of obsessions for that particular duration of time. That is not the preamble to the work. That is the work.", "Purpose", 14),

  // === CHALLENGES ===
  r("challenges", "title", "Page Title", "Seasons", "Header", 0),
  r("challenges", "description", "Page Description", "Writing challenges with deadlines — enter a prompt, share your work, get featured.", "Header", 1),
  r("challenges", "subtitle", "Page Subtitle", "Each season is a themed challenge. Write to the prompt, share before the deadline, and the best pieces are selected for the journal.", "Header", 2),

  // === OPPORTUNITIES ===
  r("opportunities", "eyebrow", "Eyebrow Text", "For Writers Who Share", "Header", 0),
  r("opportunities", "title", "Page Title", "Curated Opportunities", "Header", 1),
  r("opportunities", "subtitle", "Page Subtitle", "Open calls, residencies, and places that honour the craft. Gathered with care, tracked with intention.", "Header", 2),
  r("opportunities", "tracker-title", "Tracker Title", "Growing Season", "Tracker", 3),
  r("opportunities", "tracker-eyebrow", "Tracker Eyebrow", "Your Offerings Tracker", "Tracker", 4),
  r("opportunities", "tracker-subtitle", "Tracker Subtitle", "Save, plant, and track your offerings.", "Tracker", 5),

  // === PUBLICATIONS ===
  r("publications", "eyebrow", "Eyebrow Text", "The Page Gallery & Garden", "Header", 0),
  r("publications", "title", "Page Title", "Publications", "Header", 1),
  r("publications", "subtitle", "Page Subtitle", "Print editions, chapbooks, and the presses we love.", "Header", 2),
  r("publications", "current-eyebrow", "Current Issues Eyebrow", "Available Now", "Current Issues", 3),
  r("publications", "current-title", "Current Issues Title", "Current Issues", "Current Issues", 4),
  r("publications", "friends-eyebrow", "Friends Eyebrow", "Our Friends", "Friends", 5),
  r("publications", "friends-title", "Friends Title", "Publications & Presses We Love", "Friends", 6),
  r("publications", "friends-desc", "Friends Description", "The literary ecosystem thrives on interconnection. These are the journals, presses, and publications whose work we admire and whose values align with ours.", "Friends", 7),
  r("publications", "past-eyebrow", "Past Issues Eyebrow", "Archive", "Past Issues", 8),
  r("publications", "past-title", "Past Issues Title", "Past Issues", "Past Issues", 9),
  r("publications", "cta-title", "CTA Title", "Want to be in our pages?", "CTA", 10),
  r("publications", "cta-desc", "CTA Description", "Beyond our open calls, our editors also discover work in the Garden. Plant your words, and they might just find you.", "CTA", 11),

  // === NURSERY (GREENHOUSE) ===
  r("nursery", "hero-label", "Hero Label", "Growth Under Optimal Conditions", "Hero", 0),
  r("nursery", "hero-title", "Hero Title", "The Greenhouse", "Hero", 1),
  r("nursery", "hero-desc", "Hero Description", "Courses and editorial feedback to deepen your writing practice.", "Hero", 2),
  r("nursery", "courses-title", "Courses Title", "Courses", "Courses", 3),
  r("nursery", "courses-desc", "Courses Description", "Small-group writing courses led by published writers. Each course includes weekly assignments, peer feedback, and one-on-one mentorship.", "Courses", 4),
  r("nursery", "editorial-title", "Editorial Feedback Title", "Editorial Feedback", "Editorial", 5),
  r("nursery", "editorial-desc", "Editorial Feedback Description", "Offer a piece for thoughtful editorial feedback. Our editors provide line-level notes, structural suggestions, and a written editorial letter to help you see your work more clearly.", "Editorial", 6),
  r("nursery", "editorial-footer", "Editorial Footer Note", "All editorial feedback is provided by our team of published writers and editors. Feedback is private — only you see it. We never share your work without consent.", "Editorial", 7),

  // === FIELD GUIDE ===
  r("field-guide", "hero-label", "Hero Label", "Reference & FAQ", "Hero", 0),
  r("field-guide", "hero-title", "Hero Title", "Field Guide", "Hero", 1),
  r("field-guide", "hero-desc", "Hero Description", "Everything you need to know about cultivating your writing life at The Page Gallery & Garden.", "Hero", 2),
  r("field-guide", "craft-label", "Craft Notes Label", "Cultivate Your Craft", "Craft Notes", 3),
  r("field-guide", "craft-title", "Craft Notes Title", "Craft Notes", "Craft Notes", 4),
  r("field-guide", "craft-desc", "Craft Notes Description", "Seeds of wisdom for your writing practice — brief, actionable guidance to help your work grow.", "Craft Notes", 5),
  r("field-guide", "cta-title", "CTA Title", "Still have questions?", "CTA", 6),
  r("field-guide", "cta-desc", "CTA Description", "The best way to understand The Page Gallery Journal is to experience it. Create your Garden and start writing — the rest will grow from there.", "CTA", 7),
  r("field-guide", "cta-button", "CTA Button Text", "Create Your Garden", "CTA", 8),

  // === COMMONS ===
  r("commons", "eyebrow", "Eyebrow Text", "Peer-to-Peer Writing Space", "Header", 0),
  r("commons", "title", "Page Title", "The Commons", "Header", 1),
  r("commons", "subtitle", "Page Subtitle", "A communal garden where writers share work with peers", "Header", 2),
  r("commons", "garden-empty-title", "Garden Empty Title", "The Garden Awaits Its First Seeds", "Empty States", 3),
  r("commons", "garden-empty-desc", "Garden Empty Description", "No writings have been shared to the commons yet. When writers share their work, it will bloom here for all to read.", "Empty States", 4),
  r("commons", "bouquets-empty-title", "Bouquets Empty Title", "No Bouquets Arranged Yet", "Empty States", 5),
  r("commons", "bouquets-empty-desc", "Bouquets Empty Description", "Reading bouquets are curated collections of writing, gathered like wildflowers into themed arrangements. The first bouquet is waiting to be composed.", "Empty States", 6),
  r("commons", "moodboards-empty-title", "Moodboards Empty Title", "No Moodboards Shared Yet", "Empty States", 7),
  r("commons", "moodboards-empty-desc", "Moodboards Empty Description", "Moodboards are visual and textual collages — fragments of inspiration gathered from private gardens. When writers share theirs, they'll appear here like pressed flowers in a notebook.", "Empty States", 8),
  r("commons", "moodboard-detail-empty", "Moodboard Detail Empty", "This moodboard is empty — a blank canvas waiting for inspiration.", "Empty States", 9),

  // === PRIVACY ===
  r("privacy", "title", "Page Title", "Privacy Policy", "Header", 0),
  r("privacy", "section-1-title", "Section 1 Title", "1. Information We Collect", "Sections", 1),
  r("privacy", "section-1-text", "Section 1 Text", "The Page Gallery & Garden collects information you provide when creating an account, including your name, email address, and profile information. We also collect content you share, such as written pieces, editorial notes, and comments.", "Sections", 2),
  r("privacy", "section-2-title", "Section 2 Title", "2. How We Use Your Information", "Sections", 3),
  r("privacy", "section-2-text", "Section 2 Text", "We use your information to operate and improve The Page Gallery & Garden, including managing your account, displaying your published works, facilitating editorial workflows, and communicating important updates about the platform.", "Sections", 4),
  r("privacy", "section-3-title", "Section 3 Title", "3. Content & Publishing", "Sections", 5),
  r("privacy", "section-3-text", "Section 3 Text", "Content you share may be reviewed by editors. Published pieces appear in our public gallery. You retain ownership of your original works. We display your author name and bio alongside published pieces.", "Sections", 6),
  r("privacy", "section-4-title", "Section 4 Title", "4. Data Security", "Sections", 7),
  r("privacy", "section-4-text", "Section 4 Text", "We implement appropriate security measures to protect your personal information. Authentication is handled through secure protocols. However, no method of electronic transmission is 100% secure.", "Sections", 8),
  r("privacy", "section-5-title", "Section 5 Title", "5. Cookies & Analytics", "Sections", 9),
  r("privacy", "section-5-text", "Section 5 Text", "We use essential cookies to maintain your session and preferences. We may use analytics to understand how our platform is used and to improve the experience for our writers and readers.", "Sections", 10),
  r("privacy", "section-6-title", "Section 6 Title", "6. Your Rights", "Sections", 11),
  r("privacy", "section-6-text", "Section 6 Text", "You may request access to, correction of, or deletion of your personal data at any time. You may also request export of your submitted works. Contact us at the email below for any privacy-related requests.", "Sections", 12),
  r("privacy", "section-7-title", "Section 7 Title", "7. Contact", "Sections", 13),
  r("privacy", "section-7-text", "Section 7 Text", "For privacy inquiries, please contact us at privacy@thepagegalleryandgarden.com.", "Sections", 14),
  r("privacy", "footer-link", "Footer Link Text", "Terms of Service", "Footer", 15),

  // === TERMS ===
  r("terms", "title", "Page Title", "Terms of Service", "Header", 0),
  r("terms", "effective-date", "Effective Date", "Effective Date: February 2025", "Header", 1),
  r("terms", "section-1-title", "Section 1 Title", "1. Acceptance of Terms", "Sections", 2),
  r("terms", "section-1-text", "Section 1 Text", "By accessing or using The Page Gallery & Garden, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform.", "Sections", 3),
  r("terms", "section-2-title", "Section 2 Title", "2. User Accounts", "Sections", 4),
  r("terms", "section-2-text", "Section 2 Text", "You are responsible for maintaining the confidentiality of your account. You must provide accurate information when registering. One person may not maintain multiple accounts. We reserve the right to suspend accounts that violate these terms.", "Sections", 5),
  r("terms", "section-3-title", "Section 3 Title", "3. Content Ownership", "Sections", 6),
  r("terms", "section-3-text", "Section 3 Text", "You retain full ownership of all original works you share with The Page Gallery & Garden. By sharing content, you grant us a non-exclusive license to display, publish, and distribute your work within our platform and associated publications.", "Sections", 7),
  r("terms", "section-4-title", "Section 4 Title", "4. Editorial Process", "Sections", 8),
  r("terms", "section-4-text", "Section 4 Text", "Shared works may be reviewed by our editorial team. Editors may suggest revisions but will not alter your work without consent. The Editor-in-Chief has final authority over publication decisions.", "Sections", 9),
  r("terms", "section-5-title", "Section 5 Title", "5. Prohibited Conduct", "Sections", 10),
  r("terms", "section-5-text", "Section 5 Text", "You may not share plagiarized content, harass other users, attempt to access unauthorized areas of the platform, or use the service for any unlawful purpose. Violation may result in immediate account termination.", "Sections", 11),
  r("terms", "section-6-title", "Section 6 Title", "6. Termination", "Sections", 12),
  r("terms", "section-6-text", "Section 6 Text", "We may terminate or suspend your account at our discretion. Upon termination, you may request export of your original content. We will make reasonable efforts to accommodate such requests.", "Sections", 13),
  r("terms", "section-7-title", "Section 7 Title", "7. Changes to Terms", "Sections", 14),
  r("terms", "section-7-text", "Section 7 Text", "We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance of the updated terms. We will notify users of material changes via email or platform notification.", "Sections", 15),
  r("terms", "footer-link", "Footer Link Text", "Privacy Policy", "Footer", 16),

  // === SIGN IN ===
  r("signin", "hero-line-1", "Hero Line 1", "Enter the", "Hero", 0),
  r("signin", "hero-line-2", "Hero Line 2", "Garden", "Hero", 1),
  r("signin", "enter-button", "Enter Button Text", "Enter the Garden", "Auth", 2),
  r("signin", "enter-subtitle", "Enter Subtitle", "Your private writing space awaits", "Auth", 3),
  r("signin", "signin-active", "Sign In Button Active", "Enter the Garden", "Auth", 4),
  r("signin", "signin-loading", "Sign In Button Loading", "Entering...", "Auth", 5),
  r("signin", "register-active", "Register Button Active", "Plant Your First Seed", "Auth", 6),
  r("signin", "register-loading", "Register Button Loading", "Planting seeds...", "Auth", 7),
  r("signin", "register-subtitle", "Register Subtitle", "Every garden begins with a single seed", "Auth", 8),
  r("signin", "step-1", "Step 1 Label", "Plant seeds", "Steps", 9),
  r("signin", "step-2", "Step 2 Label", "Tend your garden", "Steps", 10),
  r("signin", "step-3", "Step 3 Label", "Watch them bloom", "Steps", 11),

  // === EXHIBITS ===
  r("exhibits", "title", "Page Title", "The Exhibits", "Header", 0),
  r("exhibits", "subtitle", "Page Subtitle", "Each exhibit is a self-contained journey. Enter at your own pace. Leave changed.", "Header", 1),
  r("exhibits", "empty-title", "Empty State Title", "No exhibits are currently on display.", "Empty", 2),
  r("exhibits", "empty-subtitle", "Empty State Subtitle", "New exhibits open throughout the season.", "Empty", 3),

  // === GALLERY (IN BLOOM) ===
  r("gallery", "eyebrow", "Eyebrow Text", "The Page Gallery Journal", "Header", 0),
  r("gallery", "title", "Page Title", "The Journal", "Header", 1),
  r("gallery", "edition-label", "Edition Label", "New Writing", "Header", 2),
  r("gallery", "search-placeholder", "Search Placeholder", "Search published works...", "Search", 3),
  r("gallery", "no-results-badge", "No Results Badge", "Waiting to bloom...", "Empty States", 4),
  r("gallery", "no-results-title", "No Results Title", "Nothing Has Bloomed Yet", "Empty States", 5),
  r("gallery", "no-results-desc", "No Results Description", "Editors are reading the Gardens. When a piece flowers, it will appear here.", "Empty States", 6),
  r("gallery", "no-contributors-title", "No Contributors Title", "No Contributors Yet", "Empty States", 7),
  r("gallery", "no-contributors-desc", "No Contributors Description", "Writers will appear here once their work blooms.", "Empty States", 8),
  r("gallery", "editions-title", "Editions Title", "Digital Editions", "Editions", 9),
  r("gallery", "editions-desc", "Editions Description", "Every piece in this journal was first planted in a writer's garden. These issues gather the finest harvests.", "Editions", 10),
  r("gallery", "current-eyebrow", "Current Issues Eyebrow", "Available Now", "Editions", 11),
  r("gallery", "current-title", "Current Issues Title", "Current Issues", "Editions", 12),
  r("gallery", "quarterly-eyebrow", "Quarterly Eyebrow", "Quarterly", "Quarterly", 13),
  r("gallery", "quarterly-title", "Quarterly Title", "Shared Ground", "Quarterly", 14),
  r("gallery", "quarterly-desc", "Quarterly Description", "A seasonal gathering of voices around a common theme. Each quarter, we invite writers to explore one idea from many angles.", "Quarterly", 15),
  r("gallery", "quarterly-coming", "Quarterly Coming Soon", "Our first quarterly is being cultivated. Watch this space.", "Quarterly", 16),
  r("gallery", "friends-eyebrow", "Friends Eyebrow", "Friends", "Friends", 17),
  r("gallery", "friends-title", "Friends Title", "Publications We Admire", "Friends", 18),
  r("gallery", "friends-coming", "Friends Coming Soon", "We're gathering our list of journals and presses we love. Check back soon.", "Friends", 19),
  r("gallery", "archive-eyebrow", "Archive Eyebrow", "Archive", "Archive", 20),
  r("gallery", "archive-title", "Archive Title", "Things We Found in the Dark", "Archive", 21),
  r("gallery", "archive-subtitle", "Archive Subtitle", "These editions are now out of print.", "Archive", 22),
  r("gallery", "cta-title", "CTA Title", "Want to be in our pages?", "CTA", 23),
  r("gallery", "cta-desc", "CTA Description", "We don't accept traditional applications. Instead, our editors discover work through the Garden. Plant your words, and let them find you.", "CTA", 24),
  r("gallery", "cta-button", "CTA Button Text", "Enter the Garden", "CTA", 25),
  r("gallery", "footer-text", "Footer Text", "The Page Gallery Journal", "Footer", 26),

  // === GARDEN GUIDE ===
  r("garden-guide", "header-title", "Header Title", "Garden Guide", "Header", 0),
  r("garden-guide", "ch1-title", "Chapter 1 Title", "Welcome", "Chapters", 1),
  r("garden-guide", "ch2-title", "Chapter 2 Title", "Finding Your Way Around", "Chapters", 2),
  r("garden-guide", "ch3-title", "Chapter 3 Title", "Your Garden — The Five Rooms", "Chapters", 3),
  r("garden-guide", "ch4-title", "Chapter 4 Title", "Understanding the Botanical Language", "Chapters", 4),
  r("garden-guide", "ch5-title", "Chapter 5 Title", "Writing Your First Piece", "Chapters", 5),
  r("garden-guide", "ch6-title", "Chapter 6 Title", "Exploring and Reading", "Chapters", 6),
  r("garden-guide", "ch7-title", "Chapter 7 Title", "Daily Prompts and Practice", "Chapters", 7),
  r("garden-guide", "ch8-title", "Chapter 8 Title", "Quick Reference Card", "Chapters", 8),
  r("garden-guide", "ch1-p1", "Ch1 Paragraph 1", "Welcome to The Page Gallery Journal. We're glad you're here.", "Ch1 Welcome", 10),
  r("garden-guide", "ch1-p2", "Ch1 Paragraph 2", "This is a place where your writing can grow at its own pace — like a garden. You plant something small, you tend to it, and when it's ready, you share it with others. There's no rush, no pressure, and no one looking over your shoulder.", "Ch1 Welcome", 11),
  r("garden-guide", "ch1-p3", "Ch1 Paragraph 3", "This guide will walk you through everything, step by step. You can come back to it any time — it will remember where you left off.", "Ch1 Welcome", 12),
  r("garden-guide", "ch1-worry", "Ch1 Don't Worry Box", "Nothing you write here is public until you decide. Your words are yours. You choose when — and whether — anyone else gets to read them. If you're not sure about something, just leave it as it is. You can always come back later.", "Ch1 Welcome", 13),
  r("garden-guide", "ch2-intro", "Ch2 Intro", "At the very top of every page, you'll see a menu bar. Here's what each item does:", "Ch2 Navigation", 20),
  r("garden-guide", "ch2-home", "Ch2 Home Menu", "Takes you back to the front page of the site. You can always click this to start over.", "Ch2 Navigation", 21),
  r("garden-guide", "ch2-journal", "Ch2 Journal Menu", "This is where published work lives — the writing that editors have chosen to feature. Think of it like a magazine. You can read poetry, fiction, essays, and more here.", "Ch2 Navigation", 22),
  r("garden-guide", "ch2-garden", "Ch2 Garden Menu", "Your private workspace. This is where you write, practice, read others' work, and manage everything you've created. More on this in the next chapter.", "Ch2 Navigation", 23),
  r("garden-guide", "ch2-studio", "Ch2 Studio Menu", "This is for editors only — you don't need to worry about it. If you don't see it in your menu, that's perfectly normal.", "Ch2 Navigation", 24),
  r("garden-guide", "ch2-about", "Ch2 About Menu", "Information about The Page Gallery Journal — who we are and what we're doing here.", "Ch2 Navigation", 25),
  r("garden-guide", "ch2-user-menu", "Ch2 User Menu", "In the top-right corner, you'll see your name or a small icon. Click it to find your profile, your settings, and the button to sign out.", "Ch2 Navigation", 26),
  r("garden-guide", "ch2-light-dark", "Ch2 Light/Dark Mode", "There's a small toggle that lets you switch between a dark background and a light one. Use whichever is easier on your eyes.", "Ch2 Navigation", 27),
  r("garden-guide", "ch2-accessibility", "Ch2 Accessibility", "Look for the \"Customise Accessibility\" button — this lets you adjust text sizes, contrast, and other settings to make the site more comfortable for you.", "Ch2 Navigation", 28),
  r("garden-guide", "ch3-intro", "Ch3 Intro", "When you click MY GARDEN in the menu at the top, you'll arrive at your personal workspace. It's organised into five tabs — think of them as five rooms in your garden, each with a different purpose.", "Ch3 Rooms", 30),
  r("garden-guide", "ch3-room-soil-name", "Ch3 Soil Name", "The Soil", "Ch3 Rooms", 31),
  r("garden-guide", "ch3-room-soil-plain", "Ch3 Soil Plain", "your private writing desk", "Ch3 Rooms", 32),
  r("garden-guide", "ch3-room-soil-desc", "Ch3 Soil Description", "This is where you write. Only you can see what's here. Think of it as your notebook — open it, write something, close it, and come back whenever you like.", "Ch3 Rooms", 33),
  r("garden-guide", "ch3-room-reading-room-name", "Ch3 Reading Room Name", "Reading Room", "Ch3 Rooms", 34),
  r("garden-guide", "ch3-room-reading-room-plain", "Ch3 Reading Room Plain", "a place to read and be inspired", "Ch3 Rooms", 35),
  r("garden-guide", "ch3-room-reading-room-desc", "Ch3 Reading Room Description", "Here you'll find writing shared by other writers in the community. You'll also find daily nudges and letters to keep you inspired.", "Ch3 Rooms", 36),
  r("garden-guide", "ch3-room-nutrients-name", "Ch3 Nutrients Name", "Nutrients", "Ch3 Rooms", 37),
  r("garden-guide", "ch3-room-nutrients-plain", "Ch3 Nutrients Plain", "practice tools to help you grow", "Ch3 Rooms", 38),
  r("garden-guide", "ch3-room-nutrients-desc", "Ch3 Nutrients Description", "This room is full of ways to practise your craft. You'll find Freewrite (a timed writing exercise), the Growth Journal (a place to reflect on your progress), Circles (writing groups you can join), and The Compost Pile (a collection of abandoned fragments that other writers have shared — you might find something inspiring there).", "Ch3 Rooms", 39),
  r("garden-guide", "ch3-room-noticing-name", "Ch3 Noticing Name", "Noticing", "Ch3 Rooms", 40),
  r("garden-guide", "ch3-room-noticing-plain", "Ch3 Noticing Plain", "100 creative prompts", "Ch3 Rooms", 41),
  r("garden-guide", "ch3-room-noticing-desc", "Ch3 Noticing Description", "One hundred writing prompts, arranged in groups of 25. You can browse them, pick one that speaks to you, and write directly into it. No pressure to use them all — even one is a great start.", "Ch3 Rooms", 42),
  r("garden-guide", "ch3-room-greenhouse-name", "Ch3 Greenhouse Name", "Greenhouse", "Ch3 Rooms", 43),
  r("garden-guide", "ch3-room-greenhouse-plain", "Ch3 Greenhouse Plain", "courses and editorial feedback", "Ch3 Rooms", 44),
  r("garden-guide", "ch3-room-greenhouse-desc", "Ch3 Greenhouse Description", "This is where you'll find structured courses and the opportunity to receive feedback from experienced editors. Think of it as a gentle classroom where your writing can grow stronger.", "Ch3 Rooms", 45),
  r("garden-guide", "ch4-intro", "Ch4 Intro", "We use two sets of words to describe your writing on this site. Don't worry — once you see them explained, they'll make perfect sense.", "Ch4 Botanical", 50),
  r("garden-guide", "ch4-stages-title", "Ch4 Growth Stages Title", "Growth Stages", "Ch4 Botanical", 51),
  r("garden-guide", "ch4-stages-intro", "Ch4 Growth Stages Intro", "These describe how finished your piece is — like the life cycle of a plant.", "Ch4 Botanical", 52),
  r("garden-guide", "ch4-stage-Seed", "Ch4 Seed Stage", "Your idea has just been put on the page. It's completely private — no one else can see it.", "Ch4 Botanical", 53),
  r("garden-guide", "ch4-stage-Sprout", "Ch4 Sprout Stage", "You're working on it, shaping it, making it better. Still private — still just for you.", "Ch4 Botanical", 54),
  r("garden-guide", "ch4-stage-Bloom", "Ch4 Bloom Stage", "You've decided to let others read it. Community members can now find it and enjoy your work.", "Ch4 Botanical", 55),
  r("garden-guide", "ch4-stage-Dormant", "Ch4 Dormant Stage", "You've archived this piece. It's not gone — it's just resting. You can wake it up any time.", "Ch4 Botanical", 56),
  r("garden-guide", "ch4-layers-title", "Ch4 Creative Layers Title", "Creative Layers", "Ch4 Botanical", 57),
  r("garden-guide", "ch4-layers-intro", "Ch4 Creative Layers Intro", "These describe where your writing lives — like different areas of a real garden.", "Ch4 Botanical", 58),
  r("garden-guide", "ch4-layer-Soil", "Ch4 Soil Layer", "No one sees this but you. It's where you do your writing.", "Ch4 Botanical", 59),
  r("garden-guide", "ch4-layer-Garden", "Ch4 Garden Layer", "When you bloom a piece, it appears here for other writers to read and appreciate.", "Ch4 Botanical", 60),
  r("garden-guide", "ch4-layer-Commons", "Ch4 Commons Layer", "Open areas where the whole community gathers — prompts, discussions, shared resources.", "Ch4 Botanical", 61),
  r("garden-guide", "ch4-layer-Gallery", "Ch4 Gallery Layer", "This is The Journal itself. Editors choose work from the Garden and publish it here for everyone to read.", "Ch4 Botanical", 62),
  r("garden-guide", "ch4-layer-Nursery", "Ch4 Nursery Layer", "A sheltered space for learning, with courses and feedback to help your writing grow stronger.", "Ch4 Botanical", 63),
  r("garden-guide", "ch4-worry", "Ch4 Don't Worry Box", "Moving a piece from Seed to Bloom does not automatically publish it in The Journal. Editors discover work in the Garden, but only select pieces make it to the Gallery. You are always in control of what you share.", "Ch4 Botanical", 64),
  r("garden-guide", "ch5-intro", "Ch5 Intro", "Here's exactly what to do when you want to write something new.", "Ch5 Writing", 70),
  r("garden-guide", "ch5-step-1", "Ch5 Step 1", "Click MY GARDEN in the menu at the top of the page.", "Ch5 Writing", 71),
  r("garden-guide", "ch5-step-2", "Ch5 Step 2", "You'll land on The Soil tab — your private writing desk.", "Ch5 Writing", 72),
  r("garden-guide", "ch5-step-3", "Ch5 Step 3", "Click the button that says START WRITING (or look for the + button).", "Ch5 Writing", 73),
  r("garden-guide", "ch5-step-4", "Ch5 Step 4", "Choose what kind of writing this is: Poetry, Fiction, Essay, Fragment, or Other. Pick whichever feels right — you can change it later.", "Ch5 Writing", 74),
  r("garden-guide", "ch5-step-5", "Ch5 Step 5", "Start writing. Your work saves automatically as you type, so you don't need to worry about losing anything.", "Ch5 Writing", 75),
  r("garden-guide", "ch5-step-6", "Ch5 Step 6", "Your piece starts as a Seed (a private draft). No one else can see it.", "Ch5 Writing", 76),
  r("garden-guide", "ch5-step-7", "Ch5 Step 7", "When you're happy with it, you can change its stage to Sprout (still private, but you're signalling to yourself that it's growing). When you're ready for others to read it, change it to Bloom.", "Ch5 Writing", 77),
  r("garden-guide", "ch5-worry", "Ch5 Don't Worry Box", "You cannot accidentally publish anything. Changing to Bloom means community members can read your work, but it takes an editor to put it in The Journal. Your writing only appears in the published magazine if an editor specifically selects it.", "Ch5 Writing", 78),
  r("garden-guide", "ch6-intro", "Ch6 Intro", "There are a few different places to read on this site. Here's the difference between them:", "Ch6 Reading", 80),
  r("garden-guide", "ch6-reading-room", "Ch6 Reading Room", "This is a curated space with letters, daily nudges, and writing shared by other community members. Think of it as a cosy corner where the community gathers.", "Ch6 Reading", 81),
  r("garden-guide", "ch6-journal", "Ch6 The Journal", "This is the published magazine. Work here has been selected by editors. You can browse by type — Poetry, Fiction, Essay, Fragment, or Other — and search for specific pieces. You can also filter by length if you only have a few minutes to read.", "Ch6 Reading", 82),
  r("garden-guide", "ch7-intro", "Ch7 Intro", "Sometimes the hardest part is knowing where to start. We've built a few tools to help with that.", "Ch7 Prompts", 90),
  r("garden-guide", "ch7-today-title", "Ch7 Today's Prompt Title", "Today's Prompt", "Ch7 Prompts", 91),
  r("garden-guide", "ch7-today-desc", "Ch7 Today's Prompt Description", "Every day, a new writing prompt appears on your Soil page. Look for the WRITE FROM THIS PROMPT button to jump straight in. If you'd like to see what came before, click Previous Prompts to browse the archive.", "Ch7 Prompts", 92),
  r("garden-guide", "ch7-noticing-title", "Ch7 Noticing Title", "Noticing", "Ch7 Prompts", 93),
  r("garden-guide", "ch7-noticing-desc", "Ch7 Noticing Description", "One hundred creative prompts, arranged in groups of 25. These aren't ordinary prompts — they're invitations to notice the world around you. Pick one, sit with it, and see what comes. You can write directly into any prompt.", "Ch7 Prompts", 94),
  r("garden-guide", "ch7-calls-title", "Ch7 Open Calls Title", "Open Calls", "Ch7 Prompts", 95),
  r("garden-guide", "ch7-calls-desc", "Ch7 Open Calls Description", "From time to time, editors put out themed calls for submissions. These have a specific topic and a deadline. It's a lovely way to challenge yourself and to see your writing alongside others who responded to the same idea.", "Ch7 Prompts", 96),
  r("garden-guide", "ch8-intro", "Ch8 Intro", "Keep this card handy. You can print it using the button below.", "Ch8 Reference", 100),
  r("garden-guide", "ch8-where-title", "Ch8 Where Things Are Title", "Where Things Are", "Ch8 Reference", 101),
  r("garden-guide", "ch8-glossary-title", "Ch8 Glossary Title", "Glossary", "Ch8 Reference", 102),
  r("garden-guide", "ch8-click-title", "Ch8 What Do I Click Title", "What Do I Click To...", "Ch8 Reference", 103),
  r("garden-guide", "footer-text", "Footer Text", "The Page Gallery Journal", "Footer", 110),

  // === GARDEN ONBOARDING ===
  r("garden-onboarding", "card-desk-title", "Desk Card Title", "The Soil — Your Private Desk", "Welcome Cards", 0),
  r("garden-onboarding", "card-desk-detail", "Desk Card Detail", "This is where your drafts live. Everything here is private — only you can see it. Write anything: a poem, a fragment, a whole essay. Nothing is judged, nothing is public.", "Welcome Cards", 1),
  r("garden-onboarding", "card-tabs-title", "Tabs Card Title", "What the Tabs Do", "Welcome Cards", 2),
  r("garden-onboarding", "card-tabs-detail", "Tabs Card Detail", "The Soil is your workspace. The Reading Room lets you read what others have shared. Nutrients has writing exercises and tools. Noticing offers 100 prompts to sharpen your eye. The Greenhouse (for editors) handles courses and editorial work.", "Welcome Cards", 3),
  r("garden-onboarding", "card-stages-title", "Stages Card Title", "How Work Moves Toward the Gallery", "Welcome Cards", 4),
  r("garden-onboarding", "card-stages-detail", "Stages Card Detail", "Every piece starts as a Seed (private draft). As you develop it, move it to Growing. When it\u2019s ready, mark it Ready \u2014 our editors read the Garden and may invite strong work for publication in The Page Gallery. You never need to \u201Csubmit.\u201D", "Welcome Cards", 5),
  r("garden-onboarding", "card-tips-title", "Tips Card Title", "A Few Things Worth Knowing", "Welcome Cards", 6),
  r("garden-onboarding", "card-tips-detail", "Tips Card Detail", "Your work saves automatically as you type. You can tag pieces for your own reference. The bell icon shows whispers \u2014 quiet notifications when someone interacts with your work. And there\u2019s no rush. Seeds can sit for months.", "Welcome Cards", 7),

  // === SUBMISSION PATH MODAL ===
  r("submission-path", "step-1-title", "Step 1 Title", "Your piece enters the editors' view", "Steps", 0),
  r("submission-path", "step-1-body", "Step 1 Body", "When you mark a piece 'Ready to Show' and send it to editors, it quietly enters the reading queue. Nothing is published — your work simply becomes visible to the editorial team. Think of it as placing a manuscript on a desk, not on a stage.", "Steps", 1),
  r("submission-path", "step-2-title", "Step 2 Title", "Editors read and reflect", "Steps", 2),
  r("submission-path", "step-2-body", "Step 2 Body", "Our editors read carefully and without hurry. If your piece resonates, they may leave a brief note — not a critique, but a response. You'll see the status change from 'Sent' to 'An editor is reading' in your Garden.", "Steps", 3),
  r("submission-path", "step-3-title", "Step 3 Title", "Selection is curated, not algorithmic", "Steps", 4),
  r("submission-path", "step-3-body", "Step 3 Body", "There is no formula. Editors choose work that speaks to a particular issue, theme, or moment in the journal's life. Not every piece is selected, and that's not a judgment — it means the timing wasn't right, not that the work wasn't good.", "Steps", 5),
  r("submission-path", "step-4-title", "Step 4 Title", "Most pieces are read within two weeks", "Steps", 6),
  r("submission-path", "step-4-body", "Step 4 Body", "We try to give every piece the attention it deserves. Most submissions are read within a fortnight. If an editor responds, you'll receive a quiet notification — a whisper, not a verdict.", "Steps", 7),
  r("submission-path", "step-5-title", "Step 5 Title", "Where your work could live", "Steps", 8),
  r("submission-path", "step-5-body", "Step 5 Body", "Selected pieces may appear in the Reading Room for fellow writers, in the Gallery for a wider audience, or in an upcoming print Issue of The Page Gallery Journal. Each is a different kind of visibility — and you're always asked first.", "Steps", 9),
];

export async function seedSiteContent() {
  try {
    for (const seed of seeds) {
      await db.insert(siteContent).values({
        pageKey: seed.pageKey,
        sectionKey: seed.sectionKey,
        content: seed.content,
        contentType: seed.contentType || "text",
        label: seed.label,
        groupLabel: seed.groupLabel || null,
        sortOrder: seed.sortOrder ?? 0,
      }).onConflictDoNothing();
    }
    console.log(`[CMS] Seeded ${seeds.length} site content entries (skipped existing)`);
  } catch (err) {
    console.error("[CMS] Error seeding site content:", err);
  }
}

export async function reseedSiteContent() {
  try {
    await db.delete(siteContent);
    await seedSiteContent();
    console.log("[CMS] Re-seeded all site content");
  } catch (err) {
    console.error("[CMS] Error re-seeding site content:", err);
  }
}

export async function seedWelcomeNotifications() {
  try {
    const allUsers = await db.select({ id: users.id }).from(users);
    let seeded = 0;
    for (const user of allUsers) {
      const existing = await db.select({ id: notifications.id }).from(notifications).where(eq(notifications.userId, user.id)).limit(1);
      if (existing.length === 0) {
        await db.insert(notifications).values({
          userId: user.id,
          type: "general",
          message: "Welcome to The Garden \u2014 your private writing space. This is where your words live and grow. Start by planting your first seed.",
          isRead: false,
        });
        seeded++;
      }
    }
    if (seeded > 0) {
      console.log(`[Notifications] Seeded welcome notifications for ${seeded} users`);
    }
  } catch (err) {
    console.error("[Notifications] Error seeding welcome notifications:", err);
  }
}
