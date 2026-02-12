import { type Writing, type InsertWriting, type UpdateWriting, writings } from "@shared/schema";
import { users } from "@shared/models/auth";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  getWritingsByAuthor(authorId: string): Promise<Writing[]>;
  getWriting(id: string): Promise<Writing | undefined>;
  createWriting(authorId: string, writing: InsertWriting): Promise<Writing>;
  updateWriting(id: string, authorId: string, writing: UpdateWriting): Promise<Writing | undefined>;
  deleteWriting(id: string, authorId: string): Promise<boolean>;
  getPublishedWritings(): Promise<(Writing & { authorName: string | null })[]>;
  publishWriting(id: string): Promise<Writing | undefined>;
  unpublishWriting(id: string): Promise<Writing | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getWritingsByAuthor(authorId: string): Promise<Writing[]> {
    return await db.select().from(writings).where(eq(writings.authorId, authorId)).orderBy(desc(writings.updatedAt));
  }

  async getWriting(id: string): Promise<Writing | undefined> {
    const [writing] = await db.select().from(writings).where(eq(writings.id, id));
    return writing || undefined;
  }

  async createWriting(authorId: string, writing: InsertWriting): Promise<Writing> {
    const [created] = await db
      .insert(writings)
      .values({ ...writing, authorId })
      .returning();
    return created;
  }

  async updateWriting(id: string, authorId: string, writing: UpdateWriting): Promise<Writing | undefined> {
    const [updated] = await db
      .update(writings)
      .set({ ...writing, updatedAt: new Date() })
      .where(and(eq(writings.id, id), eq(writings.authorId, authorId)))
      .returning();
    return updated || undefined;
  }

  async deleteWriting(id: string, authorId: string): Promise<boolean> {
    const result = await db
      .delete(writings)
      .where(and(eq(writings.id, id), eq(writings.authorId, authorId)))
      .returning();
    return result.length > 0;
  }

  async getPublishedWritings(): Promise<(Writing & { authorName: string | null })[]> {
    const results = await db
      .select({
        id: writings.id,
        authorId: writings.authorId,
        title: writings.title,
        content: writings.content,
        stage: writings.stage,
        genre: writings.genre,
        isPublished: writings.isPublished,
        publishedAt: writings.publishedAt,
        createdAt: writings.createdAt,
        updatedAt: writings.updatedAt,
        authorName: users.firstName,
      })
      .from(writings)
      .leftJoin(users, eq(writings.authorId, users.id))
      .where(eq(writings.isPublished, true))
      .orderBy(desc(writings.publishedAt));
    return results;
  }

  async publishWriting(id: string): Promise<Writing | undefined> {
    const [updated] = await db
      .update(writings)
      .set({ isPublished: true, publishedAt: new Date(), updatedAt: new Date() })
      .where(eq(writings.id, id))
      .returning();
    return updated || undefined;
  }

  async unpublishWriting(id: string): Promise<Writing | undefined> {
    const [updated] = await db
      .update(writings)
      .set({ isPublished: false, publishedAt: null, updatedAt: new Date() })
      .where(eq(writings.id, id))
      .returning();
    return updated || undefined;
  }
}

export const storage = new DatabaseStorage();
