import {
  type Writing, type InsertWriting, type UpdateWriting, writings,
  type ReadingQueueItem, readingQueue,
  type SavedPiece, savedPieces,
  type Pollination, pollinations,
  type Prompt, prompts,
  type RitualSession, ritualSessions,
  type CompostEntry, compostEntries,
  type GrowthJournalEntry, growthJournalEntries,
  type InnerWeatherEntry, innerWeather,
  type Reflection, reflections,
  type Circle, circles, type CircleMember, circleMembers, type CircleMessage, circleMessages,
  type MoonlitReading, moonlitReadings, type ReadingParticipant, readingParticipants,
  type ReplantRequest, replantRequests,
  type RootInfluence, rootInfluences,
  type Tending, tending,
  type Resonance, resonances,
  type Marginalia, marginalia,
  type Notification, notifications,
} from "@shared/schema";
import { users } from "@shared/models/auth";
import { db } from "./db";
import { eq, and, desc, ilike, or, sql } from "drizzle-orm";

export interface IStorage {
  // Writings
  getWritingsByAuthor(authorId: string): Promise<Writing[]>;
  getWriting(id: string): Promise<Writing | undefined>;
  createWriting(authorId: string, writing: InsertWriting): Promise<Writing>;
  updateWriting(id: string, authorId: string, writing: UpdateWriting): Promise<Writing | undefined>;
  deleteWriting(id: string, authorId: string): Promise<boolean>;
  getPublishedWritings(): Promise<(Writing & { authorName: string | null })[]>;
  publishWriting(id: string): Promise<Writing | undefined>;
  unpublishWriting(id: string): Promise<Writing | undefined>;
  searchPublishedWritings(query: string, genre?: string): Promise<(Writing & { authorName: string | null })[]>;
  getGardenFeed(filters?: { readiness?: string; genre?: string; editorialOnly?: boolean }): Promise<(Writing & { authorName: string | null })[]>;
  getProfileGarden(userId: string): Promise<(Writing & { authorName: string | null })[]>;
  getCircleFeed(userId: string): Promise<(Writing & { authorName: string | null })[]>;

  // Reading Queue
  getReadingQueue(userId: string): Promise<(ReadingQueueItem & { writing: Writing; authorName: string | null })[]>;
  addToReadingQueue(userId: string, writingId: string): Promise<ReadingQueueItem>;
  removeFromReadingQueue(userId: string, id: string): Promise<boolean>;
  markQueueItemRead(userId: string, id: string): Promise<ReadingQueueItem | undefined>;

  // Saved Pieces
  getSavedPieces(userId: string): Promise<(SavedPiece & { writing: Writing; authorName: string | null })[]>;
  savePiece(userId: string, writingId: string): Promise<SavedPiece>;
  unsavePiece(userId: string, id: string): Promise<boolean>;

  // Pollination
  getPollinationsForWriting(writingId: string): Promise<(Pollination & { fromUserName: string | null })[]>;
  getPollinationsReceived(userId: string): Promise<(Pollination & { fromUserName: string | null; writingTitle: string })[]>;
  createPollination(fromUserId: string, data: { writingId: string; highlightText?: string; affirmation: string }): Promise<Pollination>;

  // Prompts & Rituals
  getPrompts(category?: string): Promise<Prompt[]>;
  getRandomPrompt(category?: string): Promise<Prompt | undefined>;
  getRitualSessions(userId: string): Promise<RitualSession[]>;
  createRitualSession(userId: string, data: { promptId?: string; durationMinutes: number; output: string }): Promise<RitualSession>;

  // Compost
  getCompostEntries(userId: string): Promise<CompostEntry[]>;
  createCompostEntry(userId: string, data: { content: string; sourceWritingId?: string }): Promise<CompostEntry>;
  recycleCompostEntry(userId: string, id: string): Promise<CompostEntry | undefined>;
  deleteCompostEntry(userId: string, id: string): Promise<boolean>;

  // Growth Journal
  getGrowthJournalEntries(userId: string): Promise<(GrowthJournalEntry & { writingTitle?: string })[]>;
  createGrowthJournalEntry(userId: string, data: { linkedWritingId?: string; entry: string }): Promise<GrowthJournalEntry>;
  deleteGrowthJournalEntry(userId: string, id: string): Promise<boolean>;

  // Inner Weather
  getInnerWeatherEntries(userId: string): Promise<InnerWeatherEntry[]>;
  createInnerWeatherEntry(userId: string, data: { mood: string; energy: number; note?: string }): Promise<InnerWeatherEntry>;

  // Reflections
  getReflections(userId: string): Promise<Reflection[]>;
  createReflection(userId: string, data: { topic: string; body: string; linkedWritingId?: string }): Promise<Reflection>;
  deleteReflection(userId: string, id: string): Promise<boolean>;

  // Circles
  getCircles(userId: string): Promise<(Circle & { memberCount: number })[]>;
  getCircle(id: string): Promise<Circle | undefined>;
  createCircle(userId: string, data: { name: string; description?: string }): Promise<Circle>;
  joinCircle(userId: string, circleId: string): Promise<CircleMember>;
  leaveCircle(userId: string, circleId: string): Promise<boolean>;
  getCircleMessages(circleId: string): Promise<(CircleMessage & { userName: string | null })[]>;
  createCircleMessage(userId: string, data: { circleId: string; content: string; writingId?: string }): Promise<CircleMessage>;

  // Moonlit Readings
  getMoonlitReadings(): Promise<(MoonlitReading & { hostName: string | null; participantCount: number })[]>;
  createMoonlitReading(hostId: string, data: { title: string; description?: string; scheduledAt?: Date }): Promise<MoonlitReading>;
  joinMoonlitReading(userId: string, readingId: string, writingId?: string): Promise<ReadingParticipant>;
  leaveMoonlitReading(userId: string, readingId: string): Promise<boolean>;

  // Replant Requests
  getReplantRequests(userId: string): Promise<(ReplantRequest & { writingTitle: string })[]>;
  respondToReplantRequest(userId: string, id: string, status: string): Promise<ReplantRequest | undefined>;

  // Root System
  getRootInfluences(userId: string): Promise<RootInfluence[]>;
  createRootInfluence(userId: string, data: { name: string; category?: string; note?: string }): Promise<RootInfluence>;
  deleteRootInfluence(userId: string, id: string): Promise<boolean>;

  // Tending (follows)
  tendGarden(tenderId: string, gardenerId: string): Promise<Tending>;
  untendGarden(tenderId: string, gardenerId: string): Promise<boolean>;
  getTending(tenderId: string): Promise<{ gardenerId: string; gardenerName: string | null; gardenerImage: string | null; createdAt: Date | null }[]>;
  getTenders(gardenerId: string): Promise<{ tenderId: string; tenderName: string | null; tenderImage: string | null; createdAt: Date | null }[]>;
  isTending(tenderId: string, gardenerId: string): Promise<boolean>;
  getTendingFeed(userId: string): Promise<(Writing & { authorName: string | null; authorImage: string | null })[]>;
  getTendingCount(gardenerId: string): Promise<number>;

  // Resonances (reactions)
  addResonance(userId: string, writingId: string, type: string): Promise<Resonance>;
  removeResonance(userId: string, writingId: string, type: string): Promise<boolean>;
  getResonancesForWriting(writingId: string): Promise<{ type: string; count: number; users: { id: string; name: string | null }[] }[]>;
  getUserResonances(userId: string, writingId: string): Promise<string[]>;

  // Marginalia (comments)
  getMarginaliaForWriting(writingId: string): Promise<(Marginalia & { userName: string | null; userImage: string | null })[]>;
  createMarginalia(userId: string, data: { writingId: string; content: string; parentId?: string; highlightText?: string }): Promise<Marginalia>;
  deleteMarginalia(userId: string, id: string): Promise<boolean>;

  // Notifications
  getNotifications(userId: string, unreadOnly?: boolean): Promise<(Notification & { actorName: string | null })[]>;
  createNotification(userId: string, data: { type: string; actorId?: string; writingId?: string; message: string }): Promise<Notification>;
  markNotificationRead(userId: string, id: string): Promise<boolean>;
  markAllNotificationsRead(userId: string): Promise<boolean>;
  getUnreadNotificationCount(userId: string): Promise<number>;

  // Seasonal Review
  getSeasonalStats(userId: string): Promise<{
    totalWritings: number;
    totalWords: number;
    seeds: number;
    sprouts: number;
    blooms: number;
    moodEntries: number;
    ritualCount: number;
    journalEntries: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // === WRITINGS ===
  async getWritingsByAuthor(authorId: string): Promise<Writing[]> {
    return await db.select().from(writings).where(eq(writings.authorId, authorId)).orderBy(desc(writings.updatedAt));
  }

  async getWriting(id: string): Promise<Writing | undefined> {
    const [writing] = await db.select().from(writings).where(eq(writings.id, id));
    return writing || undefined;
  }

  async createWriting(authorId: string, writing: InsertWriting): Promise<Writing> {
    const [created] = await db.insert(writings).values({ ...writing, authorId }).returning();
    return created;
  }

  async updateWriting(id: string, authorId: string, writing: UpdateWriting): Promise<Writing | undefined> {
    const [updated] = await db.update(writings).set({ ...writing, updatedAt: new Date() })
      .where(and(eq(writings.id, id), eq(writings.authorId, authorId))).returning();
    return updated || undefined;
  }

  async deleteWriting(id: string, authorId: string): Promise<boolean> {
    const result = await db.delete(writings).where(and(eq(writings.id, id), eq(writings.authorId, authorId))).returning();
    return result.length > 0;
  }

  private writingSelectFields() {
    return {
      id: writings.id, authorId: writings.authorId, title: writings.title, content: writings.content,
      stage: writings.stage, genre: writings.genre, visibility: writings.visibility,
      readiness: writings.readiness, editorialAvailable: writings.editorialAvailable,
      isPublished: writings.isPublished, publishedAt: writings.publishedAt,
      createdAt: writings.createdAt, updatedAt: writings.updatedAt,
    };
  }

  async getPublishedWritings(): Promise<(Writing & { authorName: string | null })[]> {
    const results = await db.select({
      ...this.writingSelectFields(),
      authorName: users.firstName,
    }).from(writings).leftJoin(users, eq(writings.authorId, users.id))
      .where(eq(writings.isPublished, true)).orderBy(desc(writings.publishedAt));
    return results;
  }

  async searchPublishedWritings(query: string, genre?: string): Promise<(Writing & { authorName: string | null })[]> {
    const conditions = [eq(writings.isPublished, true)];
    if (genre) conditions.push(eq(writings.genre, genre));
    const results = await db.select({
      ...this.writingSelectFields(),
      authorName: users.firstName,
    }).from(writings).leftJoin(users, eq(writings.authorId, users.id))
      .where(and(...conditions, or(ilike(writings.title, `%${query}%`), ilike(writings.content, `%${query}%`))))
      .orderBy(desc(writings.publishedAt));
    return results;
  }

  async getGardenFeed(filters?: { readiness?: string; genre?: string; editorialOnly?: boolean }): Promise<(Writing & { authorName: string | null })[]> {
    const conditions: any[] = [eq(writings.visibility, "garden")];
    if (filters?.readiness) conditions.push(eq(writings.readiness, filters.readiness));
    if (filters?.genre) conditions.push(eq(writings.genre, filters.genre));
    if (filters?.editorialOnly) conditions.push(eq(writings.editorialAvailable, true));
    const results = await db.select({
      ...this.writingSelectFields(),
      authorName: users.firstName,
    }).from(writings).leftJoin(users, eq(writings.authorId, users.id))
      .where(and(...conditions))
      .orderBy(desc(writings.updatedAt));
    return results;
  }

  async getProfileGarden(userId: string): Promise<(Writing & { authorName: string | null })[]> {
    const results = await db.select({
      ...this.writingSelectFields(),
      authorName: users.firstName,
    }).from(writings).leftJoin(users, eq(writings.authorId, users.id))
      .where(and(
        eq(writings.authorId, userId),
        eq(writings.visibility, "garden")
      ))
      .orderBy(desc(writings.updatedAt));
    return results;
  }

  async getCircleFeed(userId: string): Promise<(Writing & { authorName: string | null })[]> {
    const memberCircles = db.select({ circleId: circleMembers.circleId })
      .from(circleMembers).where(eq(circleMembers.userId, userId));
    const circleUserIds = db.select({ userId: circleMembers.userId })
      .from(circleMembers).where(sql`${circleMembers.circleId} IN (${memberCircles})`);
    const results = await db.select({
      ...this.writingSelectFields(),
      authorName: users.firstName,
    }).from(writings).leftJoin(users, eq(writings.authorId, users.id))
      .where(and(
        or(eq(writings.visibility, "circle"), eq(writings.visibility, "garden")),
        sql`${writings.authorId} IN (${circleUserIds})`,
        sql`${writings.authorId} != ${userId}`
      ))
      .orderBy(desc(writings.updatedAt));
    return results;
  }

  async publishWriting(id: string): Promise<Writing | undefined> {
    const [updated] = await db.update(writings)
      .set({ isPublished: true, publishedAt: new Date(), updatedAt: new Date() })
      .where(eq(writings.id, id)).returning();
    return updated || undefined;
  }

  async unpublishWriting(id: string): Promise<Writing | undefined> {
    const [updated] = await db.update(writings)
      .set({ isPublished: false, publishedAt: null, updatedAt: new Date() })
      .where(eq(writings.id, id)).returning();
    return updated || undefined;
  }

  // === READING QUEUE ===
  async getReadingQueue(userId: string): Promise<(ReadingQueueItem & { writing: Writing; authorName: string | null })[]> {
    const results = await db.select({
      id: readingQueue.id, userId: readingQueue.userId, writingId: readingQueue.writingId,
      isRead: readingQueue.isRead, addedAt: readingQueue.addedAt,
      writing: writings, authorName: users.firstName,
    }).from(readingQueue)
      .innerJoin(writings, eq(readingQueue.writingId, writings.id))
      .leftJoin(users, eq(writings.authorId, users.id))
      .where(eq(readingQueue.userId, userId))
      .orderBy(desc(readingQueue.addedAt));
    return results.map(r => ({ ...r, writing: r.writing }));
  }

  async addToReadingQueue(userId: string, writingId: string): Promise<ReadingQueueItem> {
    const [item] = await db.insert(readingQueue).values({ userId, writingId }).returning();
    return item;
  }

  async removeFromReadingQueue(userId: string, id: string): Promise<boolean> {
    const result = await db.delete(readingQueue).where(and(eq(readingQueue.id, id), eq(readingQueue.userId, userId))).returning();
    return result.length > 0;
  }

  async markQueueItemRead(userId: string, id: string): Promise<ReadingQueueItem | undefined> {
    const [updated] = await db.update(readingQueue).set({ isRead: true })
      .where(and(eq(readingQueue.id, id), eq(readingQueue.userId, userId))).returning();
    return updated || undefined;
  }

  // === SAVED PIECES ===
  async getSavedPieces(userId: string): Promise<(SavedPiece & { writing: Writing; authorName: string | null })[]> {
    const results = await db.select({
      id: savedPieces.id, userId: savedPieces.userId, writingId: savedPieces.writingId,
      savedAt: savedPieces.savedAt, writing: writings, authorName: users.firstName,
    }).from(savedPieces)
      .innerJoin(writings, eq(savedPieces.writingId, writings.id))
      .leftJoin(users, eq(writings.authorId, users.id))
      .where(eq(savedPieces.userId, userId))
      .orderBy(desc(savedPieces.savedAt));
    return results.map(r => ({ ...r, writing: r.writing }));
  }

  async savePiece(userId: string, writingId: string): Promise<SavedPiece> {
    const [item] = await db.insert(savedPieces).values({ userId, writingId }).returning();
    return item;
  }

  async unsavePiece(userId: string, id: string): Promise<boolean> {
    const result = await db.delete(savedPieces).where(and(eq(savedPieces.id, id), eq(savedPieces.userId, userId))).returning();
    return result.length > 0;
  }

  // === POLLINATION ===
  async getPollinationsForWriting(writingId: string): Promise<(Pollination & { fromUserName: string | null })[]> {
    const results = await db.select({
      id: pollinations.id, fromUserId: pollinations.fromUserId, writingId: pollinations.writingId,
      highlightText: pollinations.highlightText, affirmation: pollinations.affirmation,
      createdAt: pollinations.createdAt, fromUserName: users.firstName,
    }).from(pollinations)
      .leftJoin(users, eq(pollinations.fromUserId, users.id))
      .where(eq(pollinations.writingId, writingId))
      .orderBy(desc(pollinations.createdAt));
    return results;
  }

  async getPollinationsReceived(userId: string): Promise<(Pollination & { fromUserName: string | null; writingTitle: string })[]> {
    const results = await db.select({
      id: pollinations.id, fromUserId: pollinations.fromUserId, writingId: pollinations.writingId,
      highlightText: pollinations.highlightText, affirmation: pollinations.affirmation,
      createdAt: pollinations.createdAt, fromUserName: users.firstName, writingTitle: writings.title,
    }).from(pollinations)
      .innerJoin(writings, eq(pollinations.writingId, writings.id))
      .leftJoin(users, eq(pollinations.fromUserId, users.id))
      .where(eq(writings.authorId, userId))
      .orderBy(desc(pollinations.createdAt));
    return results;
  }

  async createPollination(fromUserId: string, data: { writingId: string; highlightText?: string; affirmation: string }): Promise<Pollination> {
    const [item] = await db.insert(pollinations).values({ fromUserId, ...data }).returning();
    return item;
  }

  // === PROMPTS & RITUALS ===
  async getPrompts(category?: string): Promise<Prompt[]> {
    if (category) return await db.select().from(prompts).where(eq(prompts.category, category));
    return await db.select().from(prompts);
  }

  async getRandomPrompt(category?: string): Promise<Prompt | undefined> {
    const query = category
      ? db.select().from(prompts).where(eq(prompts.category, category)).orderBy(sql`RANDOM()`).limit(1)
      : db.select().from(prompts).orderBy(sql`RANDOM()`).limit(1);
    const [prompt] = await query;
    return prompt || undefined;
  }

  async getRitualSessions(userId: string): Promise<RitualSession[]> {
    return await db.select().from(ritualSessions).where(eq(ritualSessions.userId, userId)).orderBy(desc(ritualSessions.completedAt));
  }

  async createRitualSession(userId: string, data: { promptId?: string; durationMinutes: number; output: string }): Promise<RitualSession> {
    const [session] = await db.insert(ritualSessions).values({ userId, ...data }).returning();
    return session;
  }

  // === COMPOST ===
  async getCompostEntries(userId: string): Promise<CompostEntry[]> {
    return await db.select().from(compostEntries).where(eq(compostEntries.userId, userId)).orderBy(desc(compostEntries.createdAt));
  }

  async createCompostEntry(userId: string, data: { content: string; sourceWritingId?: string }): Promise<CompostEntry> {
    const [entry] = await db.insert(compostEntries).values({ userId, ...data }).returning();
    return entry;
  }

  async recycleCompostEntry(userId: string, id: string): Promise<CompostEntry | undefined> {
    const [updated] = await db.update(compostEntries).set({ isRecycled: true })
      .where(and(eq(compostEntries.id, id), eq(compostEntries.userId, userId))).returning();
    return updated || undefined;
  }

  async deleteCompostEntry(userId: string, id: string): Promise<boolean> {
    const result = await db.delete(compostEntries).where(and(eq(compostEntries.id, id), eq(compostEntries.userId, userId))).returning();
    return result.length > 0;
  }

  // === GROWTH JOURNAL ===
  async getGrowthJournalEntries(userId: string): Promise<(GrowthJournalEntry & { writingTitle?: string })[]> {
    const results = await db.select({
      id: growthJournalEntries.id, userId: growthJournalEntries.userId,
      linkedWritingId: growthJournalEntries.linkedWritingId, entry: growthJournalEntries.entry,
      createdAt: growthJournalEntries.createdAt, writingTitle: writings.title,
    }).from(growthJournalEntries)
      .leftJoin(writings, eq(growthJournalEntries.linkedWritingId, writings.id))
      .where(eq(growthJournalEntries.userId, userId))
      .orderBy(desc(growthJournalEntries.createdAt));
    return results.map(r => ({ ...r, writingTitle: r.writingTitle || undefined }));
  }

  async createGrowthJournalEntry(userId: string, data: { linkedWritingId?: string; entry: string }): Promise<GrowthJournalEntry> {
    const [entry] = await db.insert(growthJournalEntries).values({ userId, ...data }).returning();
    return entry;
  }

  async deleteGrowthJournalEntry(userId: string, id: string): Promise<boolean> {
    const result = await db.delete(growthJournalEntries).where(and(eq(growthJournalEntries.id, id), eq(growthJournalEntries.userId, userId))).returning();
    return result.length > 0;
  }

  // === INNER WEATHER ===
  async getInnerWeatherEntries(userId: string): Promise<InnerWeatherEntry[]> {
    return await db.select().from(innerWeather).where(eq(innerWeather.userId, userId)).orderBy(desc(innerWeather.createdAt));
  }

  async createInnerWeatherEntry(userId: string, data: { mood: string; energy: number; note?: string }): Promise<InnerWeatherEntry> {
    const [entry] = await db.insert(innerWeather).values({ userId, ...data }).returning();
    return entry;
  }

  // === REFLECTIONS ===
  async getReflections(userId: string): Promise<Reflection[]> {
    return await db.select().from(reflections).where(eq(reflections.userId, userId)).orderBy(desc(reflections.createdAt));
  }

  async createReflection(userId: string, data: { topic: string; body: string; linkedWritingId?: string }): Promise<Reflection> {
    const [entry] = await db.insert(reflections).values({ userId, ...data }).returning();
    return entry;
  }

  async deleteReflection(userId: string, id: string): Promise<boolean> {
    const result = await db.delete(reflections).where(and(eq(reflections.id, id), eq(reflections.userId, userId))).returning();
    return result.length > 0;
  }

  // === CIRCLES ===
  async getCircles(userId: string): Promise<(Circle & { memberCount: number })[]> {
    const allCircles = await db.select().from(circles).orderBy(desc(circles.createdAt));
    const result: (Circle & { memberCount: number })[] = [];
    for (const circle of allCircles) {
      const members = await db.select().from(circleMembers).where(eq(circleMembers.circleId, circle.id));
      result.push({ ...circle, memberCount: members.length });
    }
    return result;
  }

  async getCircle(id: string): Promise<Circle | undefined> {
    const [circle] = await db.select().from(circles).where(eq(circles.id, id));
    return circle || undefined;
  }

  async createCircle(userId: string, data: { name: string; description?: string }): Promise<Circle> {
    const [circle] = await db.insert(circles).values({ createdById: userId, ...data }).returning();
    await db.insert(circleMembers).values({ circleId: circle.id, userId });
    return circle;
  }

  async joinCircle(userId: string, circleId: string): Promise<CircleMember> {
    const [member] = await db.insert(circleMembers).values({ circleId, userId }).returning();
    return member;
  }

  async leaveCircle(userId: string, circleId: string): Promise<boolean> {
    const result = await db.delete(circleMembers).where(and(eq(circleMembers.circleId, circleId), eq(circleMembers.userId, userId))).returning();
    return result.length > 0;
  }

  async getCircleMessages(circleId: string): Promise<(CircleMessage & { userName: string | null })[]> {
    const results = await db.select({
      id: circleMessages.id, circleId: circleMessages.circleId, userId: circleMessages.userId,
      content: circleMessages.content, writingId: circleMessages.writingId,
      createdAt: circleMessages.createdAt, userName: users.firstName,
    }).from(circleMessages)
      .leftJoin(users, eq(circleMessages.userId, users.id))
      .where(eq(circleMessages.circleId, circleId))
      .orderBy(desc(circleMessages.createdAt));
    return results;
  }

  async createCircleMessage(userId: string, data: { circleId: string; content: string; writingId?: string }): Promise<CircleMessage> {
    const [msg] = await db.insert(circleMessages).values({ userId, ...data }).returning();
    return msg;
  }

  // === MOONLIT READINGS ===
  async getMoonlitReadings(): Promise<(MoonlitReading & { hostName: string | null; participantCount: number })[]> {
    const allReadings = await db.select({
      id: moonlitReadings.id, hostId: moonlitReadings.hostId, title: moonlitReadings.title,
      description: moonlitReadings.description, scheduledAt: moonlitReadings.scheduledAt,
      isOpen: moonlitReadings.isOpen, createdAt: moonlitReadings.createdAt,
      hostName: users.firstName,
    }).from(moonlitReadings)
      .leftJoin(users, eq(moonlitReadings.hostId, users.id))
      .orderBy(desc(moonlitReadings.createdAt));

    const result: (MoonlitReading & { hostName: string | null; participantCount: number })[] = [];
    for (const reading of allReadings) {
      const participants = await db.select().from(readingParticipants).where(eq(readingParticipants.readingId, reading.id));
      result.push({ ...reading, participantCount: participants.length });
    }
    return result;
  }

  async createMoonlitReading(hostId: string, data: { title: string; description?: string; scheduledAt?: Date }): Promise<MoonlitReading> {
    const [reading] = await db.insert(moonlitReadings).values({ hostId, ...data }).returning();
    return reading;
  }

  async joinMoonlitReading(userId: string, readingId: string, writingId?: string): Promise<ReadingParticipant> {
    const [participant] = await db.insert(readingParticipants).values({ readingId, userId, writingId }).returning();
    return participant;
  }

  async leaveMoonlitReading(userId: string, readingId: string): Promise<boolean> {
    const result = await db.delete(readingParticipants)
      .where(and(eq(readingParticipants.readingId, readingId), eq(readingParticipants.userId, userId))).returning();
    return result.length > 0;
  }

  // === REPLANT REQUESTS ===
  async getReplantRequests(userId: string): Promise<(ReplantRequest & { writingTitle: string })[]> {
    const results = await db.select({
      id: replantRequests.id, writingId: replantRequests.writingId, authorId: replantRequests.authorId,
      editorNote: replantRequests.editorNote, status: replantRequests.status,
      createdAt: replantRequests.createdAt, respondedAt: replantRequests.respondedAt,
      writingTitle: writings.title,
    }).from(replantRequests)
      .innerJoin(writings, eq(replantRequests.writingId, writings.id))
      .where(eq(replantRequests.authorId, userId))
      .orderBy(desc(replantRequests.createdAt));
    return results;
  }

  async respondToReplantRequest(userId: string, id: string, status: string): Promise<ReplantRequest | undefined> {
    const [updated] = await db.update(replantRequests).set({ status, respondedAt: new Date() })
      .where(and(eq(replantRequests.id, id), eq(replantRequests.authorId, userId))).returning();
    return updated || undefined;
  }

  // === ROOT SYSTEM ===
  async getRootInfluences(userId: string): Promise<RootInfluence[]> {
    return await db.select().from(rootInfluences).where(eq(rootInfluences.userId, userId)).orderBy(desc(rootInfluences.createdAt));
  }

  async createRootInfluence(userId: string, data: { name: string; category?: string; note?: string }): Promise<RootInfluence> {
    const [influence] = await db.insert(rootInfluences).values({ userId, ...data }).returning();
    return influence;
  }

  async deleteRootInfluence(userId: string, id: string): Promise<boolean> {
    const result = await db.delete(rootInfluences).where(and(eq(rootInfluences.id, id), eq(rootInfluences.userId, userId))).returning();
    return result.length > 0;
  }

  // === TENDING (FOLLOWS) ===
  async tendGarden(tenderId: string, gardenerId: string): Promise<Tending> {
    const existing = await db.select().from(tending)
      .where(and(eq(tending.tenderId, tenderId), eq(tending.gardenerId, gardenerId)));
    if (existing.length > 0) return existing[0];
    const [result] = await db.insert(tending).values({ tenderId, gardenerId }).returning();
    return result;
  }

  async untendGarden(tenderId: string, gardenerId: string): Promise<boolean> {
    const result = await db.delete(tending)
      .where(and(eq(tending.tenderId, tenderId), eq(tending.gardenerId, gardenerId))).returning();
    return result.length > 0;
  }

  async getTending(tenderId: string): Promise<{ gardenerId: string; gardenerName: string | null; gardenerImage: string | null; createdAt: Date | null }[]> {
    return await db.select({
      gardenerId: tending.gardenerId,
      gardenerName: users.firstName,
      gardenerImage: users.profileImageUrl,
      createdAt: tending.createdAt,
    }).from(tending).innerJoin(users, eq(tending.gardenerId, users.id))
      .where(eq(tending.tenderId, tenderId)).orderBy(desc(tending.createdAt));
  }

  async getTenders(gardenerId: string): Promise<{ tenderId: string; tenderName: string | null; tenderImage: string | null; createdAt: Date | null }[]> {
    return await db.select({
      tenderId: tending.tenderId,
      tenderName: users.firstName,
      tenderImage: users.profileImageUrl,
      createdAt: tending.createdAt,
    }).from(tending).innerJoin(users, eq(tending.tenderId, users.id))
      .where(eq(tending.gardenerId, gardenerId)).orderBy(desc(tending.createdAt));
  }

  async isTending(tenderId: string, gardenerId: string): Promise<boolean> {
    const result = await db.select().from(tending)
      .where(and(eq(tending.tenderId, tenderId), eq(tending.gardenerId, gardenerId)));
    return result.length > 0;
  }

  async getTendingFeed(userId: string): Promise<(Writing & { authorName: string | null; authorImage: string | null })[]> {
    const tendedGardeners = db.select({ gardenerId: tending.gardenerId })
      .from(tending).where(eq(tending.tenderId, userId));
    return await db.select({
      ...this.writingSelectFields(),
      authorName: users.firstName,
      authorImage: users.profileImageUrl,
    }).from(writings).leftJoin(users, eq(writings.authorId, users.id))
      .where(and(
        sql`${writings.authorId} IN (${tendedGardeners})`,
        or(eq(writings.visibility, "garden"), eq(writings.visibility, "circle"))
      ))
      .orderBy(desc(writings.updatedAt));
  }

  async getTendingCount(gardenerId: string): Promise<number> {
    const result = await db.select().from(tending).where(eq(tending.gardenerId, gardenerId));
    return result.length;
  }

  // === RESONANCES (REACTIONS) ===
  async addResonance(userId: string, writingId: string, type: string): Promise<Resonance> {
    const existing = await db.select().from(resonances)
      .where(and(eq(resonances.userId, userId), eq(resonances.writingId, writingId), eq(resonances.type, type)));
    if (existing.length > 0) return existing[0];
    const [result] = await db.insert(resonances).values({ userId, writingId, type }).returning();
    return result;
  }

  async removeResonance(userId: string, writingId: string, type: string): Promise<boolean> {
    const result = await db.delete(resonances)
      .where(and(eq(resonances.userId, userId), eq(resonances.writingId, writingId), eq(resonances.type, type))).returning();
    return result.length > 0;
  }

  async getResonancesForWriting(writingId: string): Promise<{ type: string; count: number; users: { id: string; name: string | null }[] }[]> {
    const all = await db.select({
      type: resonances.type,
      userId: resonances.userId,
      userName: users.firstName,
    }).from(resonances).leftJoin(users, eq(resonances.userId, users.id))
      .where(eq(resonances.writingId, writingId));

    const grouped: Record<string, { count: number; users: { id: string; name: string | null }[] }> = {};
    for (const r of all) {
      if (!grouped[r.type]) grouped[r.type] = { count: 0, users: [] };
      grouped[r.type].count++;
      grouped[r.type].users.push({ id: r.userId, name: r.userName });
    }
    return Object.entries(grouped).map(([type, data]) => ({ type, ...data }));
  }

  async getUserResonances(userId: string, writingId: string): Promise<string[]> {
    const result = await db.select({ type: resonances.type }).from(resonances)
      .where(and(eq(resonances.userId, userId), eq(resonances.writingId, writingId)));
    return result.map(r => r.type);
  }

  // === MARGINALIA (COMMENTS) ===
  async getMarginaliaForWriting(writingId: string): Promise<(Marginalia & { userName: string | null; userImage: string | null })[]> {
    return await db.select({
      id: marginalia.id,
      userId: marginalia.userId,
      writingId: marginalia.writingId,
      parentId: marginalia.parentId,
      content: marginalia.content,
      highlightText: marginalia.highlightText,
      createdAt: marginalia.createdAt,
      userName: users.firstName,
      userImage: users.profileImageUrl,
    }).from(marginalia).leftJoin(users, eq(marginalia.userId, users.id))
      .where(eq(marginalia.writingId, writingId))
      .orderBy(marginalia.createdAt);
  }

  async createMarginalia(userId: string, data: { writingId: string; content: string; parentId?: string; highlightText?: string }): Promise<Marginalia> {
    const [result] = await db.insert(marginalia).values({ userId, ...data }).returning();
    return result;
  }

  async deleteMarginalia(userId: string, id: string): Promise<boolean> {
    const result = await db.delete(marginalia)
      .where(and(eq(marginalia.id, id), eq(marginalia.userId, userId))).returning();
    return result.length > 0;
  }

  // === NOTIFICATIONS ===
  async getNotifications(userId: string, unreadOnly?: boolean): Promise<(Notification & { actorName: string | null })[]> {
    const conditions = [eq(notifications.userId, userId)];
    if (unreadOnly) conditions.push(eq(notifications.isRead, false));
    const actorAlias = users;
    return await db.select({
      id: notifications.id,
      userId: notifications.userId,
      type: notifications.type,
      actorId: notifications.actorId,
      writingId: notifications.writingId,
      message: notifications.message,
      isRead: notifications.isRead,
      createdAt: notifications.createdAt,
      actorName: actorAlias.firstName,
    }).from(notifications).leftJoin(actorAlias, eq(notifications.actorId, actorAlias.id))
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  }

  async createNotification(userId: string, data: { type: string; actorId?: string; writingId?: string; message: string }): Promise<Notification> {
    if (data.actorId === userId) return {} as Notification;
    const [result] = await db.insert(notifications).values({ userId, ...data }).returning();
    return result;
  }

  async markNotificationRead(userId: string, id: string): Promise<boolean> {
    const result = await db.update(notifications).set({ isRead: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId))).returning();
    return result.length > 0;
  }

  async markAllNotificationsRead(userId: string): Promise<boolean> {
    await db.update(notifications).set({ isRead: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return true;
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const result = await db.select().from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return result.length;
  }

  // === SEASONAL REVIEW ===
  async getSeasonalStats(userId: string): Promise<{
    totalWritings: number; totalWords: number; seeds: number; sprouts: number; blooms: number;
    moodEntries: number; ritualCount: number; journalEntries: number;
  }> {
    const userWritings = await db.select().from(writings).where(eq(writings.authorId, userId));
    const moods = await db.select().from(innerWeather).where(eq(innerWeather.userId, userId));
    const rituals = await db.select().from(ritualSessions).where(eq(ritualSessions.userId, userId));
    const journals = await db.select().from(growthJournalEntries).where(eq(growthJournalEntries.userId, userId));

    const totalWords = userWritings.reduce((acc, w) => acc + (w.content.trim() ? w.content.trim().split(/\s+/).length : 0), 0);
    return {
      totalWritings: userWritings.length,
      totalWords,
      seeds: userWritings.filter(w => w.stage === "seed").length,
      sprouts: userWritings.filter(w => w.stage === "sprout").length,
      blooms: userWritings.filter(w => w.stage === "bloom").length,
      moodEntries: moods.length,
      ritualCount: rituals.length,
      journalEntries: journals.length,
    };
  }
}

export const storage = new DatabaseStorage();
