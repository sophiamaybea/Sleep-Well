import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";
import { users } from "./models/auth";

export const writings = pgTable("writings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorId: varchar("author_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  stage: text("stage").notNull().default("seed"),
  genre: text("genre").notNull().default("poetry"),
  visibility: text("visibility").notNull().default("personal"),
  readiness: text("readiness").notNull().default("raw_seed"),
  editorialAvailable: boolean("editorial_available").notNull().default(false),
  isPublished: boolean("is_published").notNull().default(false),
  isPinned: boolean("is_pinned").notNull().default(false),
  isArchived: boolean("is_archived").notNull().default(false),
  isPublicGarden: boolean("is_public_garden").notNull().default(false),
  tags: text("tags").array().default(sql`'{}'::text[]`),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const writingSnapshots = pgTable("writing_snapshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  writingId: varchar("writing_id").notNull().references(() => writings.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  readiness: text("readiness").notNull(),
  wordCount: integer("word_count").notNull().default(0),
  snapshotNote: text("snapshot_note"),
  isManual: boolean("is_manual").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const readingQueue = pgTable("reading_queue", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  writingId: varchar("writing_id").notNull().references(() => writings.id),
  isRead: boolean("is_read").notNull().default(false),
  addedAt: timestamp("added_at").defaultNow(),
});

export const savedPieces = pgTable("saved_pieces", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  writingId: varchar("writing_id").notNull().references(() => writings.id),
  savedAt: timestamp("saved_at").defaultNow(),
});

export const pollinations = pgTable("pollinations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromUserId: varchar("from_user_id").notNull().references(() => users.id),
  writingId: varchar("writing_id").notNull().references(() => writings.id),
  highlightText: text("highlight_text"),
  affirmation: text("affirmation").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const prompts = pgTable("prompts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  text: text("text").notNull(),
  category: text("category").notNull().default("freewrite"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const ritualSessions = pgTable("ritual_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  promptId: varchar("prompt_id").references(() => prompts.id),
  durationMinutes: integer("duration_minutes").notNull().default(10),
  output: text("output").notNull().default(""),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const compostEntries = pgTable("compost_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  sourceWritingId: varchar("source_writing_id").references(() => writings.id),
  isRecycled: boolean("is_recycled").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const growthJournalEntries = pgTable("growth_journal_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  linkedWritingId: varchar("linked_writing_id").references(() => writings.id),
  entry: text("entry").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const innerWeather = pgTable("inner_weather", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  mood: text("mood").notNull(),
  energy: integer("energy").notNull().default(5),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reflections = pgTable("reflections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  topic: text("topic").notNull(),
  body: text("body").notNull(),
  linkedWritingId: varchar("linked_writing_id").references(() => writings.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const circles = pgTable("circles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  theme: text("theme"),
  maxMembers: integer("max_members").notNull().default(5),
  createdById: varchar("created_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const circleMembers = pgTable("circle_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  circleId: varchar("circle_id").notNull().references(() => circles.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const circleMessages = pgTable("circle_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  circleId: varchar("circle_id").notNull().references(() => circles.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  writingId: varchar("writing_id").references(() => writings.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const moonlitReadings = pgTable("moonlit_readings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  hostId: varchar("host_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  scheduledAt: timestamp("scheduled_at"),
  isOpen: boolean("is_open").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const readingParticipants = pgTable("reading_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  readingId: varchar("reading_id").notNull().references(() => moonlitReadings.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  writingId: varchar("writing_id").references(() => writings.id),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const replantRequests = pgTable("replant_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  writingId: varchar("writing_id").notNull().references(() => writings.id),
  authorId: varchar("author_id").notNull().references(() => users.id),
  editorNote: text("editor_note").notNull().default(""),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
});

export const rootInfluences = pgTable("root_influences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  category: text("category").notNull().default("writer"),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === PRESENCE ===

export const gardenPresence = pgTable("garden_presence", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  lastSeen: timestamp("last_seen").defaultNow(),
});

// === COMMUNITY ROOMS ===

export const tableTopics = pgTable("table_topics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorId: varchar("author_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  body: text("body").notNull(),
  category: text("category").notNull().default("general"),
  isPinned: boolean("is_pinned").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tableReplies = pgTable("table_replies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  topicId: varchar("topic_id").notNull().references(() => tableTopics.id),
  authorId: varchar("author_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  parentId: varchar("parent_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workshopExercises = pgTable("workshop_exercises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  createdById: varchar("created_by_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  prompt: text("prompt").notNull(),
  category: text("category").notNull().default("freewrite"),
  durationMinutes: integer("duration_minutes"),
  isPublic: boolean("is_public").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workshopResponses = pgTable("workshop_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  exerciseId: varchar("exercise_id").notNull().references(() => workshopExercises.id),
  authorId: varchar("author_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const swapRequests = pgTable("swap_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requesterId: varchar("requester_id").notNull().references(() => users.id),
  writingId: varchar("writing_id").notNull().references(() => writings.id),
  genre: text("genre").notNull().default("any"),
  note: text("note"),
  preferredLength: text("preferred_length"),
  feedbackStyle: text("feedback_style"),
  status: text("status").notNull().default("open"),
  matchedWithId: varchar("matched_with_id").references(() => users.id),
  matchedWritingId: varchar("matched_writing_id").references(() => writings.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const swapFeedback = pgTable("swap_feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  swapId: varchar("swap_id").notNull().references(() => swapRequests.id),
  fromUserId: varchar("from_user_id").notNull().references(() => users.id),
  toUserId: varchar("to_user_id").notNull().references(() => users.id),
  strengths: text("strengths").notNull(),
  suggestions: text("suggestions").notNull(),
  favoriteLines: text("favorite_lines"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const microSwaps = pgTable("micro_swaps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  fragment: text("fragment").notNull(),
  genre: text("genre"),
  matchedWithId: varchar("matched_with_id"),
  response: text("response"),
  partnerResponse: text("partner_response"),
  status: text("status").notNull().default("waiting"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === EDITOR STUDIO ===

export const greenhouseEntries = pgTable("greenhouse_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  writingId: varchar("writing_id").notNull().references(() => writings.id),
  editorId: varchar("editor_id").notNull().references(() => users.id),
  issueId: varchar("issue_id"),
  themeFolder: text("theme_folder"),
  priority: text("priority").notNull().default("medium"),
  internalNote: text("internal_note"),
  stage: text("stage").notNull().default("uncontacted"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const publishRequests = pgTable("publish_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  writingId: varchar("writing_id").notNull().references(() => writings.id),
  authorId: varchar("author_id").notNull().references(() => users.id),
  editorId: varchar("editor_id").notNull().references(() => users.id),
  issueId: varchar("issue_id"),
  status: text("status").notNull().default("draft"),
  editorNote: text("editor_note"),
  proposedDate: text("proposed_date"),
  rightsDuration: text("rights_duration"),
  payment: text("payment"),
  createdAt: timestamp("created_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
});

export const requestMessages = pgTable("request_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requestId: varchar("request_id").notNull().references(() => publishRequests.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const issues = pgTable("issues", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  themeNote: text("theme_note"),
  publishDate: timestamp("publish_date"),
  status: text("status").notNull().default("draft"),
  createdById: varchar("created_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const issuePieces = pgTable("issue_pieces", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  issueId: varchar("issue_id").notNull().references(() => issues.id),
  writingId: varchar("writing_id").notNull().references(() => writings.id),
  sortOrder: integer("sort_order").notNull().default(0),
  workflowState: text("workflow_state").notNull().default("draft_received"),
  editorialNotes: text("editorial_notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const editorNotes = pgTable("editor_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  writingId: varchar("writing_id").notNull().references(() => writings.id),
  editorId: varchar("editor_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// === SOCIAL FEATURES ===

export const tending = pgTable("tending", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenderId: varchar("tender_id").notNull().references(() => users.id),
  gardenerId: varchar("gardener_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const resonances = pgTable("resonances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  writingId: varchar("writing_id").notNull().references(() => writings.id),
  type: text("type").notNull().default("glow"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const marginalia = pgTable("marginalia", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  writingId: varchar("writing_id").notNull().references(() => writings.id),
  parentId: varchar("parent_id"),
  content: text("content").notNull(),
  highlightText: text("highlight_text"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quietReads = pgTable("quiet_reads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  readerId: varchar("reader_id").notNull().references(() => users.id),
  writingId: varchar("writing_id").notNull().references(() => writings.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  actorId: varchar("actor_id").references(() => users.id),
  writingId: varchar("writing_id").references(() => writings.id),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  writings: many(writings),
  readingQueue: many(readingQueue),
  savedPieces: many(savedPieces),
  ritualSessions: many(ritualSessions),
  compostEntries: many(compostEntries),
  growthJournalEntries: many(growthJournalEntries),
  innerWeather: many(innerWeather),
  reflections: many(reflections),
  rootInfluences: many(rootInfluences),
}));

export const writingsRelations = relations(writings, ({ one, many }) => ({
  author: one(users, { fields: [writings.authorId], references: [users.id] }),
  pollinations: many(pollinations),
}));

// Collaborative accountability features

export const circleIntentions = pgTable("circle_intentions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  circleId: varchar("circle_id").notNull().references(() => circles.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  weekOf: text("week_of").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const circleCelebrations = pgTable("circle_celebrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  circleId: varchar("circle_id").notNull().references(() => circles.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  message: text("message").notNull().default(""),
  value: integer("value"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rejectionWallEntries = pgTable("rejection_wall_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  outlet: text("outlet").notNull(),
  pieceTitle: text("piece_title").notNull().default(""),
  result: text("result").notNull(),
  context: text("context").notNull().default(""),
  silver_lining: text("silver_lining").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow(),
});

export const opportunities = pgTable("opportunities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  link: text("link").notNull().default(""),
  outlet: text("outlet").notNull().default(""),
  deadline: text("deadline").notNull().default(""),
  payRate: text("pay_rate").notNull().default(""),
  responseTime: text("response_time").notNull().default(""),
  vibe: text("vibe").notNull().default(""),
  genres: text("genres").array().default(sql`'{}'::text[]`),
  notes: text("notes").notNull().default(""),
  isCurated: boolean("is_curated").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const opportunityNotes = pgTable("opportunity_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  opportunityId: varchar("opportunity_id").notNull().references(() => opportunities.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  note: text("note").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const circleShares = pgTable("circle_shares", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  circleId: varchar("circle_id").notNull().references(() => circles.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  writingId: varchar("writing_id").references(() => writings.id),
  weekOf: text("week_of").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const promptPotluckItems = pgTable("prompt_potluck_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  circleId: varchar("circle_id").notNull().references(() => circles.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const ideaDrops = pgTable("idea_drops", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  status: text("status").notNull().default("open"),
  adoptedById: varchar("adopted_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// === FIRST READER ===
export const firstReaderDrops = pgTable("first_reader_drops", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorId: varchar("author_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  genre: text("genre").notNull().default("poetry"),
  status: text("status").notNull().default("waiting"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const firstReaderResponses = pgTable("first_reader_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dropId: varchar("drop_id").notNull().references(() => firstReaderDrops.id),
  readerId: varchar("reader_id").notNull().references(() => users.id),
  aliveSignal: text("alive_signal").notNull(),
  strikingLine: text("striking_line"),
  oneSuggestion: text("one_suggestion"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === READING SHELF ===
export const readingShelfEntries = pgTable("reading_shelf_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  bookTitle: text("book_title").notNull(),
  author: text("author"),
  reaction: text("reaction").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const editorialFlags = pgTable("editorial_flags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  writingId: varchar("writing_id").notNull().references(() => writings.id),
  authorId: varchar("author_id").notNull().references(() => users.id),
  status: text("status").notNull().default("flagged"),
  isPaidFlag: boolean("is_paid_flag").notNull().default(false),
  seenByEditorId: varchar("seen_by_editor_id").references(() => users.id),
  seenAt: timestamp("seen_at"),
  editorResponse: text("editor_response"),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const editorsWalks = pgTable("editors_walks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  startsAt: timestamp("starts_at").notNull(),
  endsAt: timestamp("ends_at").notNull(),
  flagLimit: integer("flag_limit").notNull().default(3),
  createdById: varchar("created_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertWritingSchema = createInsertSchema(writings).omit({
  id: true, authorId: true, isPublished: true, publishedAt: true, createdAt: true, updatedAt: true,
}).extend({
  visibility: z.enum(["personal", "circle", "garden"]).optional(),
  readiness: z.enum(["raw_seed", "growing", "ready_to_show", "dormant"]).optional(),
  editorialAvailable: z.boolean().optional(),
  isPublicGarden: z.boolean().optional(),
});
export const updateWritingSchema = insertWritingSchema.partial();

export const insertReadingQueueSchema = createInsertSchema(readingQueue).omit({ id: true, userId: true, addedAt: true });
export const insertSavedPieceSchema = createInsertSchema(savedPieces).omit({ id: true, userId: true, savedAt: true });
export const insertPollinationSchema = createInsertSchema(pollinations).omit({ id: true, fromUserId: true, createdAt: true });
export const insertRitualSessionSchema = createInsertSchema(ritualSessions).omit({ id: true, userId: true, completedAt: true });
export const insertCompostSchema = createInsertSchema(compostEntries).omit({ id: true, userId: true, isRecycled: true, createdAt: true });
export const insertGrowthJournalSchema = createInsertSchema(growthJournalEntries).omit({ id: true, userId: true, createdAt: true });
export const insertInnerWeatherSchema = createInsertSchema(innerWeather).omit({ id: true, userId: true, createdAt: true });
export const insertReflectionSchema = createInsertSchema(reflections).omit({ id: true, userId: true, createdAt: true });
export const insertCircleSchema = createInsertSchema(circles).omit({ id: true, createdById: true, createdAt: true });
export const insertCircleMessageSchema = createInsertSchema(circleMessages).omit({ id: true, userId: true, createdAt: true });
export const insertMoonlitReadingSchema = createInsertSchema(moonlitReadings).omit({ id: true, hostId: true, createdAt: true });
export const insertReplantRequestSchema = createInsertSchema(replantRequests).omit({ id: true, authorId: true, createdAt: true, respondedAt: true });
export const insertRootInfluenceSchema = createInsertSchema(rootInfluences).omit({ id: true, userId: true, createdAt: true });
export const insertResonanceSchema = createInsertSchema(resonances).omit({ id: true, userId: true, createdAt: true });
export const insertMarginaliaSchema = createInsertSchema(marginalia).omit({ id: true, userId: true, createdAt: true });
export const insertTableTopicSchema = createInsertSchema(tableTopics).omit({ id: true, authorId: true, isPinned: true, createdAt: true, updatedAt: true });
export const insertTableReplySchema = createInsertSchema(tableReplies).omit({ id: true, authorId: true, createdAt: true });
export const insertWorkshopExerciseSchema = createInsertSchema(workshopExercises).omit({ id: true, createdById: true, createdAt: true });
export const insertWorkshopResponseSchema = createInsertSchema(workshopResponses).omit({ id: true, authorId: true, createdAt: true });
export const insertSwapRequestSchema = createInsertSchema(swapRequests).omit({ id: true, requesterId: true, status: true, matchedWithId: true, matchedWritingId: true, createdAt: true }).extend({
  preferredLength: z.enum(["short", "medium", "long", "any"]).optional(),
  feedbackStyle: z.enum(["line_level", "big_picture", "gentle", "any"]).optional(),
});
export const insertSwapFeedbackSchema = createInsertSchema(swapFeedback).omit({ id: true, fromUserId: true, createdAt: true });
export const insertMicroSwapSchema = createInsertSchema(microSwaps).omit({ id: true, userId: true, matchedWithId: true, response: true, partnerResponse: true, status: true, createdAt: true });
export const insertGreenhouseEntrySchema = createInsertSchema(greenhouseEntries).omit({ id: true, editorId: true, stage: true, createdAt: true });
export const insertPublishRequestSchema = createInsertSchema(publishRequests).omit({ id: true, editorId: true, authorId: true, status: true, createdAt: true, respondedAt: true });
export const insertRequestMessageSchema = createInsertSchema(requestMessages).omit({ id: true, senderId: true, createdAt: true });
export const insertIssueSchema = createInsertSchema(issues).omit({ id: true, createdById: true, status: true, createdAt: true, updatedAt: true });
export const insertIssuePieceSchema = createInsertSchema(issuePieces).omit({ id: true, createdAt: true });
export const insertEditorNoteSchema = createInsertSchema(editorNotes).omit({ id: true, editorId: true, createdAt: true });
export const insertCircleIntentionSchema = createInsertSchema(circleIntentions).omit({ id: true, userId: true, createdAt: true });
export const insertCircleCelebrationSchema = createInsertSchema(circleCelebrations).omit({ id: true, userId: true, createdAt: true });
export const insertRejectionWallSchema = createInsertSchema(rejectionWallEntries).omit({ id: true, userId: true, createdAt: true });
export const insertOpportunitySchema = createInsertSchema(opportunities).omit({ id: true, userId: true, createdAt: true });
export const insertOpportunityNoteSchema = createInsertSchema(opportunityNotes).omit({ id: true, userId: true, createdAt: true });
export const insertPromptPotluckSchema = createInsertSchema(promptPotluckItems).omit({ id: true, userId: true, createdAt: true });
export const insertCircleShareSchema = createInsertSchema(circleShares).omit({ id: true, userId: true, createdAt: true });
export const insertIdeaDropSchema = createInsertSchema(ideaDrops).omit({ id: true, userId: true, status: true, adoptedById: true, createdAt: true });
export const insertFirstReaderDropSchema = createInsertSchema(firstReaderDrops).omit({ id: true, authorId: true, status: true, createdAt: true });
export const insertFirstReaderResponseSchema = createInsertSchema(firstReaderResponses).omit({ id: true, readerId: true, createdAt: true });
export const insertReadingShelfSchema = createInsertSchema(readingShelfEntries).omit({ id: true, userId: true, createdAt: true });
export const insertEditorialFlagSchema = createInsertSchema(editorialFlags).omit({ id: true, authorId: true, status: true, seenByEditorId: true, seenAt: true, editorResponse: true, respondedAt: true, createdAt: true });
export const insertEditorsWalkSchema = createInsertSchema(editorsWalks).omit({ id: true, createdById: true, createdAt: true });
export const insertQuietReadSchema = createInsertSchema(quietReads).omit({ id: true, readerId: true, createdAt: true });
export const insertWritingSnapshotSchema = createInsertSchema(writingSnapshots).omit({ id: true, createdAt: true });

// === CIRCLE MICRO-PROMPTS ===

export const circleMicroPrompts = pgTable("circle_micro_prompts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  circleId: varchar("circle_id").notNull().references(() => circles.id),
  prompt: text("prompt").notNull(),
  weekOf: text("week_of").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const circleMicroResponses = pgTable("circle_micro_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  promptId: varchar("prompt_id").notNull().references(() => circleMicroPrompts.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCircleMicroResponseSchema = createInsertSchema(circleMicroResponses).omit({ id: true, userId: true, createdAt: true });

// === CAFÉ ===

export const cafeQuestions = pgTable("cafe_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  question: text("question").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cafeResponses = pgTable("cafe_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  questionId: varchar("question_id").notNull().references(() => cafeQuestions.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCafeQuestionSchema = createInsertSchema(cafeQuestions).omit({ id: true, createdAt: true });
export const insertCafeResponseSchema = createInsertSchema(cafeResponses).omit({ id: true, userId: true, createdAt: true });

// Types
export type InsertWriting = z.infer<typeof insertWritingSchema>;
export type UpdateWriting = z.infer<typeof updateWritingSchema>;
export type Writing = typeof writings.$inferSelect;
export type ReadingQueueItem = typeof readingQueue.$inferSelect;
export type SavedPiece = typeof savedPieces.$inferSelect;
export type Pollination = typeof pollinations.$inferSelect;
export type Prompt = typeof prompts.$inferSelect;
export type RitualSession = typeof ritualSessions.$inferSelect;
export type CompostEntry = typeof compostEntries.$inferSelect;
export type GrowthJournalEntry = typeof growthJournalEntries.$inferSelect;
export type InnerWeatherEntry = typeof innerWeather.$inferSelect;
export type Reflection = typeof reflections.$inferSelect;
export type Circle = typeof circles.$inferSelect;
export type CircleMember = typeof circleMembers.$inferSelect;
export type CircleMessage = typeof circleMessages.$inferSelect;
export type MoonlitReading = typeof moonlitReadings.$inferSelect;
export type ReadingParticipant = typeof readingParticipants.$inferSelect;
export type ReplantRequest = typeof replantRequests.$inferSelect;
export type RootInfluence = typeof rootInfluences.$inferSelect;
export type Tending = typeof tending.$inferSelect;
export type Resonance = typeof resonances.$inferSelect;
export type Marginalia = typeof marginalia.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type TableTopic = typeof tableTopics.$inferSelect;
export type TableReply = typeof tableReplies.$inferSelect;
export type WorkshopExercise = typeof workshopExercises.$inferSelect;
export type WorkshopResponse = typeof workshopResponses.$inferSelect;
export type SwapRequest = typeof swapRequests.$inferSelect;
export type SwapFeedbackEntry = typeof swapFeedback.$inferSelect;
export type MicroSwap = typeof microSwaps.$inferSelect;
export type GreenhouseEntry = typeof greenhouseEntries.$inferSelect;
export type PublishRequest = typeof publishRequests.$inferSelect;
export type RequestMessage = typeof requestMessages.$inferSelect;
export type Issue = typeof issues.$inferSelect;
export type IssuePiece = typeof issuePieces.$inferSelect;
export type EditorNote = typeof editorNotes.$inferSelect;
export type CircleIntention = typeof circleIntentions.$inferSelect;
export type CircleCelebration = typeof circleCelebrations.$inferSelect;
export type RejectionWallEntry = typeof rejectionWallEntries.$inferSelect;
export type Opportunity = typeof opportunities.$inferSelect;
export type OpportunityNote = typeof opportunityNotes.$inferSelect;
export type CircleShare = typeof circleShares.$inferSelect;
export type PromptPotluckItem = typeof promptPotluckItems.$inferSelect;
export type IdeaDrop = typeof ideaDrops.$inferSelect;
export type QuietRead = typeof quietReads.$inferSelect;
export type WritingSnapshot = typeof writingSnapshots.$inferSelect;
export type CafeQuestion = typeof cafeQuestions.$inferSelect;
export type CafeResponse = typeof cafeResponses.$inferSelect;
export type CircleMicroPrompt = typeof circleMicroPrompts.$inferSelect;
export type CircleMicroResponse = typeof circleMicroResponses.$inferSelect;
export type EditorialFlag = typeof editorialFlags.$inferSelect;
export type EditorsWalk = typeof editorsWalks.$inferSelect;
export type FirstReaderDrop = typeof firstReaderDrops.$inferSelect;
export type FirstReaderResponse = typeof firstReaderResponses.$inferSelect;
export type ReadingShelfEntry = typeof readingShelfEntries.$inferSelect;

// === SUBMISSION TRACKER ===

export const submissions = pgTable("submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  writingId: varchar("writing_id").references(() => writings.id),
  journalName: text("journal_name").notNull(),
  journalUrl: text("journal_url"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  status: text("status").notNull().default("pending"),
  responseDeadline: timestamp("response_deadline"),
  respondedAt: timestamp("responded_at"),
  simultaneousSub: boolean("simultaneous_sub").notNull().default(true),
  notes: text("notes"),
  coverLetter: text("cover_letter"),
  genre: text("genre"),
  pieceTitle: text("piece_title"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const publicationCredits = pgTable("publication_credits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  writingId: varchar("writing_id").references(() => writings.id),
  submissionId: varchar("submission_id").references(() => submissions.id),
  journalName: text("journal_name").notNull(),
  pieceTitle: text("piece_title").notNull(),
  genre: text("genre"),
  publishedAt: timestamp("published_at"),
  rightsType: text("rights_type").default("first_serial"),
  rightsDuration: text("rights_duration"),
  rightsRevertDate: timestamp("rights_revert_date"),
  rightsReverted: boolean("rights_reverted").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  prestige: integer("prestige").notNull().default(3),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const coverLetterTemplates = pgTable("cover_letter_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull().default("Default"),
  template: text("template").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const writerBios = pgTable("writer_bios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  shortBio: text("short_bio"),
  fullBio: text("full_bio"),
  oneLiner: text("one_liner"),
  publicationCreditsText: text("publication_credits_text"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSubmissionSchema = createInsertSchema(submissions).omit({ id: true, userId: true, createdAt: true, updatedAt: true });
export const insertPublicationCreditSchema = createInsertSchema(publicationCredits).omit({ id: true, userId: true, createdAt: true });
export const insertCoverLetterTemplateSchema = createInsertSchema(coverLetterTemplates).omit({ id: true, userId: true, createdAt: true, updatedAt: true });
export const insertWriterBioSchema = createInsertSchema(writerBios).omit({ id: true, userId: true, createdAt: true, updatedAt: true });

export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type PublicationCredit = typeof publicationCredits.$inferSelect;
export type InsertPublicationCredit = z.infer<typeof insertPublicationCreditSchema>;
export type CoverLetterTemplate = typeof coverLetterTemplates.$inferSelect;
export type WriterBio = typeof writerBios.$inferSelect;

// === COURSES ===

export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  instructor: text("instructor").notNull(),
  genre: text("genre").notNull().default("craft"),
  price: integer("price").notNull().default(0),
  includedInCultivator: boolean("included_in_cultivator").notNull().default(true),
  isPublished: boolean("is_published").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const courseLessons = pgTable("course_lessons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull().references(() => courses.id),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  writingPrompt: text("writing_prompt"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userCourseAccess = pgTable("user_course_access", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  courseId: varchar("course_id").notNull().references(() => courses.id),
  accessType: text("access_type").notNull().default("purchased"),
  grantedAt: timestamp("granted_at").defaultNow(),
});

export const lessonProgress = pgTable("lesson_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  lessonId: varchar("lesson_id").notNull().references(() => courseLessons.id),
  courseId: varchar("course_id").notNull().references(() => courses.id),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const courseRatings = pgTable("course_ratings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull().references(() => courses.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  review: text("review"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const courseExerciseResponses = pgTable("course_exercise_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull().references(() => courses.id),
  lessonId: varchar("lesson_id").notNull().references(() => courseLessons.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull().default(""),
  savedToGarden: boolean("saved_to_garden").notNull().default(false),
  gardenWritingId: varchar("garden_writing_id").references(() => writings.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCourseSchema = createInsertSchema(courses).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCourseLessonSchema = createInsertSchema(courseLessons).omit({ id: true, createdAt: true });
export const insertCourseRatingSchema = createInsertSchema(courseRatings).omit({ id: true, createdAt: true, updatedAt: true });
export const insertExerciseResponseSchema = createInsertSchema(courseExerciseResponses).omit({ id: true, createdAt: true, updatedAt: true });

export type Course = typeof courses.$inferSelect;
export type CourseLesson = typeof courseLessons.$inferSelect;
export type UserCourseAccess = typeof userCourseAccess.$inferSelect;
export type LessonProgress = typeof lessonProgress.$inferSelect;
export type CourseRating = typeof courseRatings.$inferSelect;
export type CourseExerciseResponse = typeof courseExerciseResponses.$inferSelect;

export const challenges = pgTable("challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  prompt: text("prompt").notNull(),
  genre: text("genre"),
  wordLimit: integer("word_limit"),
  status: text("status").notNull().default("upcoming"),
  startsAt: timestamp("starts_at").notNull(),
  endsAt: timestamp("ends_at").notNull(),
  votingEndsAt: timestamp("voting_ends_at"),
  createdBy: varchar("created_by").references(() => users.id),
  prize: text("prize"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const challengeEntries = pgTable("challenge_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  challengeId: varchar("challenge_id").notNull().references(() => challenges.id),
  authorId: varchar("author_id").notNull().references(() => users.id),
  writingId: varchar("writing_id").references(() => writings.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow(),
  status: text("status").notNull().default("submitted"),
});

export const challengeVotes = pgTable("challenge_votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  challengeId: varchar("challenge_id").notNull().references(() => challenges.id),
  entryId: varchar("entry_id").notNull().references(() => challengeEntries.id),
  voterId: varchar("voter_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertChallengeSchema = createInsertSchema(challenges).omit({ id: true, createdAt: true });
export const insertChallengeEntrySchema = createInsertSchema(challengeEntries).omit({ id: true, submittedAt: true, status: true });

export type Challenge = typeof challenges.$inferSelect;
export type ChallengeEntry = typeof challengeEntries.$inferSelect;
export type ChallengeVote = typeof challengeVotes.$inferSelect;
