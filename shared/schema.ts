import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
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
  isPublished: boolean("is_published").notNull().default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  writings: many(writings),
}));

export const writingsRelations = relations(writings, ({ one }) => ({
  author: one(users, {
    fields: [writings.authorId],
    references: [users.id],
  }),
}));

export const insertWritingSchema = createInsertSchema(writings).omit({
  id: true,
  authorId: true,
  isPublished: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const updateWritingSchema = insertWritingSchema.partial();

export type InsertWriting = z.infer<typeof insertWritingSchema>;
export type UpdateWriting = z.infer<typeof updateWritingSchema>;
export type Writing = typeof writings.$inferSelect;
