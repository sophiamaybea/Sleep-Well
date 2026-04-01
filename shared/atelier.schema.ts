// === THE ATELIER — Workshop Room Schema ===
// Additive declarations — paste into bottom of shared/schema.ts
// Do NOT modify existing table definitions.

import { sql } from "drizzle-orm";
import { pgTable, varchar, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// A curated series of writing exercises (editor-created)
export const atelierSeries = pgTable("atelier_series", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  theme: text("theme"),
  description: text("description").notNull().default(""),
  facilitator: text("facilitator").notNull().default("The Editors"),
  genre: text("genre").notNull().default("any"),
  totalExercises: integer("total_exercises").notNull().default(0),
  freeExerciseLimit: integer("free_exercise_limit").notNull().default(2),
  isPublished: boolean("is_published").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdById: varchar("created_by_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Individual exercises within a series
export const atelierExercises = pgTable("atelier_exercises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  seriesId: varchar("series_id").notNull(),
  title: text("title").notNull(),
  prompt: text("prompt").notNull(),
  craftNote: text("craft_note"),
  exampleLine: text("example_line"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Writer responses to exercises (stored per user)
export const atelierResponses = pgTable("atelier_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  exerciseId: varchar("exercise_id").notNull(),
  seriesId: varchar("series_id").notNull(),
  userId: varchar("user_id").notNull(),
  content: text("content").notNull().default(""),
  savedToGarden: boolean("saved_to_garden").notNull().default(false),
  gardenWritingId: varchar("garden_writing_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertAtelierSeriesSchema = createInsertSchema(atelierSeries).omit({
  id: true,
  createdById: true,
  totalExercises: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAtelierExerciseSchema = createInsertSchema(atelierExercises).omit({
  id: true,
  createdAt: true,
});

export const insertAtelierResponseSchema = createInsertSchema(atelierResponses).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export type AtelierSeries = typeof atelierSeries.$inferSelect;
export type InsertAtelierSeries = z.infer<typeof insertAtelierSeriesSchema>;
export type AtelierExercise = typeof atelierExercises.$inferSelect;
export type InsertAtelierExercise = z.infer<typeof insertAtelierExerciseSchema>;
export type AtelierResponse = typeof atelierResponses.$inferSelect;
export type InsertAtelierResponse = z.infer<typeof insertAtelierResponseSchema>;
