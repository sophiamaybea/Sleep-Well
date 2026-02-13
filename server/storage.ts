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
  type TableTopic, tableTopics, type TableReply, tableReplies,
  type WorkshopExercise, workshopExercises, type WorkshopResponse, workshopResponses,
  type SwapRequest, swapRequests, type SwapFeedbackEntry, swapFeedback,
  type GreenhouseEntry, greenhouseEntries,
  type PublishRequest, publishRequests,
  type RequestMessage, requestMessages,
  type Issue, issues, type IssuePiece, issuePieces,
  type EditorNote, editorNotes,
  type CircleIntention, circleIntentions,
  type CircleCelebration, circleCelebrations,
  type CircleShare, circleShares,
  type RejectionWallEntry, rejectionWallEntries,
  type Opportunity, opportunities,
  type OpportunityNote, opportunityNotes,
  type PromptPotluckItem, promptPotluckItems,
  type IdeaDrop, ideaDrops,
  type QuietRead, quietReads,
  type WritingSnapshot, writingSnapshots,
} from "@shared/schema";
import { users, type User } from "@shared/models/auth";
import { db } from "./db";
import { eq, and, desc, ilike, or, sql, count } from "drizzle-orm";

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

  // Tables (community discussions)
  getTableTopics(category?: string): Promise<(TableTopic & { authorName: string | null; replyCount: number })[]>;
  getTableTopic(id: string): Promise<(TableTopic & { authorName: string | null }) | undefined>;
  createTableTopic(authorId: string, data: { title: string; body: string; category?: string }): Promise<TableTopic>;
  getTableReplies(topicId: string): Promise<(TableReply & { authorName: string | null })[]>;
  createTableReply(authorId: string, data: { topicId: string; content: string; parentId?: string }): Promise<TableReply>;

  // Workshop (exercises & responses)
  getWorkshopExercises(category?: string): Promise<(WorkshopExercise & { authorName: string | null; responseCount: number })[]>;
  createWorkshopExercise(userId: string, data: { title: string; prompt: string; category?: string; durationMinutes?: number }): Promise<WorkshopExercise>;
  getWorkshopResponses(exerciseId: string): Promise<(WorkshopResponse & { authorName: string | null })[]>;
  createWorkshopResponse(userId: string, data: { exerciseId: string; content: string }): Promise<WorkshopResponse>;
  getPromptOfDay(): Promise<(WorkshopExercise & { authorName: string | null; responseCount: number }) | undefined>;

  // Swap (beta reading exchange)
  getSwapRequests(status?: string): Promise<(SwapRequest & { requesterName: string | null; writingTitle: string; matchedName: string | null })[]>;
  createSwapRequest(userId: string, data: { writingId: string; genre?: string; note?: string }): Promise<SwapRequest>;
  matchSwap(requestId: string, userId: string, writingId: string): Promise<SwapRequest | undefined>;
  getSwapFeedback(swapId: string): Promise<SwapFeedbackEntry[]>;
  createSwapFeedback(userId: string, data: { swapId: string; toUserId: string; strengths: string; suggestions: string; favoriteLines?: string }): Promise<SwapFeedbackEntry>;

  // Writer Profile
  getWriterProfile(userId: string): Promise<{ user: User; writings: (Writing & { resonanceCount: number })[]; tenderCount: number; tendingCount: number } | null>;
  updateBio(userId: string, bio: string): Promise<void>;

  // Publishing (editorial)
  getEditorialPieces(): Promise<(Writing & { authorName: string | null })[]>;
  publishWritingByEditor(writingId: string, editorNote?: string): Promise<Writing | undefined>;

  // Editor Studio
  isEditor(userId: string): Promise<boolean>;
  setEditorRole(userId: string, role: string): Promise<void>;
  getEditorOverview(editorId: string): Promise<{ newPieces: number; editorialAvailable: number; pendingRequests: number; draftIssues: number }>;
  getEditorGardenStream(filters?: { genre?: string; readiness?: string; form?: string; search?: string; newSinceDate?: Date; quiet?: boolean }): Promise<(Writing & { authorName: string | null; authorImage: string | null; resonanceCount: number })[]>;
  getGreenhouseEntries(editorId: string): Promise<(GreenhouseEntry & { writingTitle: string; authorName: string | null; authorId: string })[]>;
  addToGreenhouse(editorId: string, data: { writingId: string; issueId?: string; themeFolder?: string; priority?: string; internalNote?: string }): Promise<GreenhouseEntry>;
  updateGreenhouseEntry(editorId: string, id: string, data: { issueId?: string; themeFolder?: string; priority?: string; internalNote?: string; stage?: string }): Promise<GreenhouseEntry | undefined>;
  removeFromGreenhouse(editorId: string, id: string): Promise<boolean>;
  getPublishRequests(filters?: { editorId?: string; status?: string }): Promise<(PublishRequest & { writingTitle: string; authorName: string | null; editorName: string | null })[]>;
  getAuthorPublishRequests(authorId: string): Promise<(PublishRequest & { writingTitle: string; editorName: string | null })[]>;
  createPublishRequest(editorId: string, data: { writingId: string; authorId: string; issueId?: string; editorNote?: string; proposedDate?: string; rightsDuration?: string; payment?: string }): Promise<PublishRequest>;
  respondToPublishRequest(authorId: string, id: string, status: "accepted" | "declined"): Promise<PublishRequest | undefined>;
  getRequestMessages(requestId: string): Promise<(RequestMessage & { senderName: string | null })[]>;
  createRequestMessage(senderId: string, data: { requestId: string; content: string }): Promise<RequestMessage>;
  getIssues(): Promise<(Issue & { pieceCount: number; creatorName: string | null })[]>;
  getIssue(id: string): Promise<(Issue & { creatorName: string | null }) | undefined>;
  createIssue(userId: string, data: { title: string; subtitle?: string; themeNote?: string; publishDate?: Date }): Promise<Issue>;
  updateIssue(id: string, data: { title?: string; subtitle?: string; themeNote?: string; publishDate?: Date; status?: string }): Promise<Issue | undefined>;
  getIssuePieces(issueId: string): Promise<(IssuePiece & { writingTitle: string; authorName: string | null; writingContent: string })[]>;
  addPieceToIssue(data: { issueId: string; writingId: string; sortOrder?: number }): Promise<IssuePiece>;
  updateIssuePiece(id: string, data: { sortOrder?: number; workflowState?: string; editorialNotes?: string }): Promise<IssuePiece | undefined>;
  removePieceFromIssue(id: string): Promise<boolean>;
  publishIssue(id: string): Promise<Issue | undefined>;
  getEditorNotes(writingId: string): Promise<(EditorNote & { editorName: string | null })[]>;
  createEditorNote(editorId: string, data: { writingId: string; content: string }): Promise<EditorNote>;
  deleteEditorNote(editorId: string, id: string): Promise<boolean>;

  // Circle Intentions
  getCircleIntentions(circleId: string): Promise<(CircleIntention & { userName: string | null })[]>;
  createCircleIntention(userId: string, data: { circleId: string; content: string; weekOf: string }): Promise<CircleIntention>;
  deleteCircleIntention(userId: string, id: string): Promise<boolean>;

  // Circle Celebrations
  getCircleCelebrations(circleId: string): Promise<(CircleCelebration & { userName: string | null })[]>;
  createCircleCelebration(userId: string, data: { circleId: string; type: string; message?: string; value?: number }): Promise<CircleCelebration>;

  // Circle Shares
  getCircleShares(circleId: string): Promise<(CircleShare & { userName: string | null; writingTitle: string | null })[]>;
  createCircleShare(userId: string, data: { circleId: string; writingId?: string; weekOf: string }): Promise<CircleShare>;
  getCircleMembers(circleId: string): Promise<(CircleMember & { userName: string | null })[]>;
  getCircleMemberCount(circleId: string): Promise<number>;
  getCurrentSharer(circleId: string): Promise<{ userId: string; userName: string | null } | null>;

  // Rejection Wall
  getRejectionWallEntries(): Promise<(RejectionWallEntry & { userName: string | null })[]>;
  createRejectionWallEntry(userId: string, data: { outlet: string; pieceTitle?: string; result: string; context?: string; silver_lining?: string }): Promise<RejectionWallEntry>;
  deleteRejectionWallEntry(userId: string, id: string): Promise<boolean>;

  // Opportunities
  getOpportunities(): Promise<(Opportunity & { userName: string | null; noteCount: number })[]>;
  getOpportunity(id: string): Promise<(Opportunity & { userName: string | null }) | undefined>;
  createOpportunity(userId: string, data: { title: string; link?: string; outlet?: string; deadline?: string; payRate?: string; responseTime?: string; vibe?: string; genres?: string[]; notes?: string }): Promise<Opportunity>;
  deleteOpportunity(userId: string, id: string): Promise<boolean>;
  getOpportunityNotes(opportunityId: string): Promise<(OpportunityNote & { userName: string | null })[]>;
  createOpportunityNote(userId: string, data: { opportunityId: string; note: string }): Promise<OpportunityNote>;

  // Curated Opportunities
  getCuratedOpportunities(): Promise<Opportunity[]>;
  createCuratedOpportunity(editorId: string, data: { title: string; link?: string; outlet?: string; deadline?: string; payRate?: string; genres?: string[]; notes?: string }): Promise<Opportunity>;
  deleteCuratedOpportunity(id: string): Promise<boolean>;

  // Prompt Potluck
  getPromptPotluckItems(circleId: string): Promise<(PromptPotluckItem & { userName: string | null })[]>;
  createPromptPotluckItem(userId: string, data: { circleId: string; type: string; content: string }): Promise<PromptPotluckItem>;
  deletePromptPotluckItem(userId: string, id: string): Promise<boolean>;
  getRandomPotluckItem(circleId: string): Promise<(PromptPotluckItem & { userName: string | null }) | undefined>;

  // Idea Drops
  getIdeaDrops(): Promise<(IdeaDrop & { userName: string | null; adopterName: string | null })[]>;
  createIdeaDrop(userId: string, data: { content: string }): Promise<IdeaDrop>;
  adoptIdeaDrop(userId: string, id: string): Promise<IdeaDrop | undefined>;
  deleteIdeaDrop(userId: string, id: string): Promise<boolean>;

  // Quiet Reads
  hasQuietRead(readerId: string, writingId: string): Promise<boolean>;
  addQuietRead(readerId: string, writingId: string): Promise<QuietRead>;
  hasBeenQuietlyRead(writingId: string): Promise<boolean>;

  // Version Snapshots
  getSnapshots(writingId: string): Promise<WritingSnapshot[]>;
  createSnapshot(data: { writingId: string; title: string; content: string; readiness: string; wordCount: number }): Promise<WritingSnapshot>;
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

  // === TABLES (COMMUNITY DISCUSSIONS) ===
  async getTableTopics(category?: string): Promise<(TableTopic & { authorName: string | null; replyCount: number })[]> {
    const conditions: any[] = [];
    if (category) conditions.push(eq(tableTopics.category, category));

    const topics = await db.select({
      id: tableTopics.id, authorId: tableTopics.authorId, title: tableTopics.title,
      body: tableTopics.body, category: tableTopics.category, isPinned: tableTopics.isPinned,
      createdAt: tableTopics.createdAt, updatedAt: tableTopics.updatedAt,
      authorName: users.firstName,
    }).from(tableTopics)
      .leftJoin(users, eq(tableTopics.authorId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(tableTopics.isPinned), desc(tableTopics.createdAt));

    const result: (TableTopic & { authorName: string | null; replyCount: number })[] = [];
    for (const topic of topics) {
      const replies = await db.select({ cnt: count() }).from(tableReplies).where(eq(tableReplies.topicId, topic.id));
      result.push({ ...topic, replyCount: replies[0]?.cnt ?? 0 });
    }
    return result;
  }

  async getTableTopic(id: string): Promise<(TableTopic & { authorName: string | null }) | undefined> {
    const [topic] = await db.select({
      id: tableTopics.id, authorId: tableTopics.authorId, title: tableTopics.title,
      body: tableTopics.body, category: tableTopics.category, isPinned: tableTopics.isPinned,
      createdAt: tableTopics.createdAt, updatedAt: tableTopics.updatedAt,
      authorName: users.firstName,
    }).from(tableTopics)
      .leftJoin(users, eq(tableTopics.authorId, users.id))
      .where(eq(tableTopics.id, id));
    return topic || undefined;
  }

  async createTableTopic(authorId: string, data: { title: string; body: string; category?: string }): Promise<TableTopic> {
    const [topic] = await db.insert(tableTopics).values({ authorId, ...data }).returning();
    return topic;
  }

  async getTableReplies(topicId: string): Promise<(TableReply & { authorName: string | null })[]> {
    return await db.select({
      id: tableReplies.id, topicId: tableReplies.topicId, authorId: tableReplies.authorId,
      content: tableReplies.content, parentId: tableReplies.parentId,
      createdAt: tableReplies.createdAt, authorName: users.firstName,
    }).from(tableReplies)
      .leftJoin(users, eq(tableReplies.authorId, users.id))
      .where(eq(tableReplies.topicId, topicId))
      .orderBy(tableReplies.createdAt);
  }

  async createTableReply(authorId: string, data: { topicId: string; content: string; parentId?: string }): Promise<TableReply> {
    const [reply] = await db.insert(tableReplies).values({ authorId, ...data }).returning();
    return reply;
  }

  // === WORKSHOP (EXERCISES & RESPONSES) ===
  async getWorkshopExercises(category?: string): Promise<(WorkshopExercise & { authorName: string | null; responseCount: number })[]> {
    const conditions: any[] = [];
    if (category) conditions.push(eq(workshopExercises.category, category));

    const exercises = await db.select({
      id: workshopExercises.id, createdById: workshopExercises.createdById, title: workshopExercises.title,
      prompt: workshopExercises.prompt, category: workshopExercises.category,
      durationMinutes: workshopExercises.durationMinutes, isPublic: workshopExercises.isPublic,
      createdAt: workshopExercises.createdAt, authorName: users.firstName,
    }).from(workshopExercises)
      .leftJoin(users, eq(workshopExercises.createdById, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(workshopExercises.createdAt));

    const result: (WorkshopExercise & { authorName: string | null; responseCount: number })[] = [];
    for (const exercise of exercises) {
      const responses = await db.select({ cnt: count() }).from(workshopResponses).where(eq(workshopResponses.exerciseId, exercise.id));
      result.push({ ...exercise, responseCount: responses[0]?.cnt ?? 0 });
    }
    return result;
  }

  async createWorkshopExercise(userId: string, data: { title: string; prompt: string; category?: string; durationMinutes?: number }): Promise<WorkshopExercise> {
    const [exercise] = await db.insert(workshopExercises).values({ createdById: userId, ...data }).returning();
    return exercise;
  }

  async getWorkshopResponses(exerciseId: string): Promise<(WorkshopResponse & { authorName: string | null })[]> {
    return await db.select({
      id: workshopResponses.id, exerciseId: workshopResponses.exerciseId, authorId: workshopResponses.authorId,
      content: workshopResponses.content, createdAt: workshopResponses.createdAt,
      authorName: users.firstName,
    }).from(workshopResponses)
      .leftJoin(users, eq(workshopResponses.authorId, users.id))
      .where(eq(workshopResponses.exerciseId, exerciseId))
      .orderBy(desc(workshopResponses.createdAt));
  }

  async createWorkshopResponse(userId: string, data: { exerciseId: string; content: string }): Promise<WorkshopResponse> {
    const [response] = await db.insert(workshopResponses).values({ authorId: userId, ...data }).returning();
    return response;
  }

  async getPromptOfDay(): Promise<(WorkshopExercise & { authorName: string | null; responseCount: number }) | undefined> {
    const allExercises = await db.select({
      id: workshopExercises.id, createdById: workshopExercises.createdById, title: workshopExercises.title,
      prompt: workshopExercises.prompt, category: workshopExercises.category,
      durationMinutes: workshopExercises.durationMinutes, isPublic: workshopExercises.isPublic,
      createdAt: workshopExercises.createdAt, authorName: users.firstName,
    }).from(workshopExercises)
      .leftJoin(users, eq(workshopExercises.createdById, users.id))
      .orderBy(workshopExercises.createdAt);

    if (allExercises.length === 0) return undefined;

    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    const index = dayOfYear % allExercises.length;
    const exercise = allExercises[index];

    const responses = await db.select({ cnt: count() }).from(workshopResponses).where(eq(workshopResponses.exerciseId, exercise.id));
    return { ...exercise, responseCount: responses[0]?.cnt ?? 0 };
  }

  // === SWAP (BETA READING EXCHANGE) ===
  async getSwapRequests(status?: string): Promise<(SwapRequest & { requesterName: string | null; writingTitle: string; matchedName: string | null })[]> {
    const conditions: any[] = [];
    if (status) conditions.push(eq(swapRequests.status, status));

    const results = await db.select({
      id: swapRequests.id, requesterId: swapRequests.requesterId, writingId: swapRequests.writingId,
      genre: swapRequests.genre, note: swapRequests.note, status: swapRequests.status,
      matchedWithId: swapRequests.matchedWithId, matchedWritingId: swapRequests.matchedWritingId,
      createdAt: swapRequests.createdAt,
      requesterName: users.firstName,
      writingTitle: writings.title,
    }).from(swapRequests)
      .innerJoin(writings, eq(swapRequests.writingId, writings.id))
      .leftJoin(users, eq(swapRequests.requesterId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(swapRequests.createdAt));

    const enriched: (SwapRequest & { requesterName: string | null; writingTitle: string; matchedName: string | null })[] = [];
    for (const r of results) {
      let matchedName: string | null = null;
      if (r.matchedWithId) {
        const [matched] = await db.select({ firstName: users.firstName }).from(users).where(eq(users.id, r.matchedWithId));
        matchedName = matched?.firstName ?? null;
      }
      enriched.push({ ...r, matchedName });
    }
    return enriched;
  }

  async createSwapRequest(userId: string, data: { writingId: string; genre?: string; note?: string }): Promise<SwapRequest> {
    const [request] = await db.insert(swapRequests).values({ requesterId: userId, ...data }).returning();
    return request;
  }

  async matchSwap(requestId: string, userId: string, writingId: string): Promise<SwapRequest | undefined> {
    const [updated] = await db.update(swapRequests).set({
      matchedWithId: userId, matchedWritingId: writingId, status: "matched",
    }).where(and(eq(swapRequests.id, requestId), eq(swapRequests.status, "open"))).returning();
    return updated || undefined;
  }

  async getSwapFeedback(swapId: string): Promise<SwapFeedbackEntry[]> {
    return await db.select().from(swapFeedback).where(eq(swapFeedback.swapId, swapId)).orderBy(desc(swapFeedback.createdAt));
  }

  async createSwapFeedback(userId: string, data: { swapId: string; toUserId: string; strengths: string; suggestions: string; favoriteLines?: string }): Promise<SwapFeedbackEntry> {
    const [feedback] = await db.insert(swapFeedback).values({ fromUserId: userId, ...data }).returning();
    return feedback;
  }

  // === WRITER PROFILE ===
  async getWriterProfile(userId: string): Promise<{ user: User; writings: (Writing & { resonanceCount: number })[]; tenderCount: number; tendingCount: number } | null> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return null;

    const gardenWritings = await db.select().from(writings)
      .where(and(eq(writings.authorId, userId), eq(writings.visibility, "garden")))
      .orderBy(desc(writings.updatedAt));

    const writingsWithResonance: (Writing & { resonanceCount: number })[] = [];
    for (const w of gardenWritings) {
      const [res] = await db.select({ cnt: count() }).from(resonances).where(eq(resonances.writingId, w.id));
      writingsWithResonance.push({ ...w, resonanceCount: res?.cnt ?? 0 });
    }

    const [tenderResult] = await db.select({ cnt: count() }).from(tending).where(eq(tending.gardenerId, userId));
    const [tendingResult] = await db.select({ cnt: count() }).from(tending).where(eq(tending.tenderId, userId));

    return {
      user,
      writings: writingsWithResonance,
      tenderCount: tenderResult?.cnt ?? 0,
      tendingCount: tendingResult?.cnt ?? 0,
    };
  }

  async updateBio(userId: string, bio: string): Promise<void> {
    await db.update(users).set({ bio, updatedAt: new Date() }).where(eq(users.id, userId));
  }

  // === PUBLISHING (EDITORIAL) ===
  async getEditorialPieces(): Promise<(Writing & { authorName: string | null })[]> {
    return await db.select({
      ...this.writingSelectFields(),
      authorName: users.firstName,
    }).from(writings)
      .leftJoin(users, eq(writings.authorId, users.id))
      .where(and(
        eq(writings.editorialAvailable, true),
        eq(writings.readiness, "ready_to_show"),
        eq(writings.visibility, "garden"),
        eq(writings.isPublished, false),
      ))
      .orderBy(desc(writings.updatedAt));
  }

  async publishWritingByEditor(writingId: string, editorNote?: string): Promise<Writing | undefined> {
    const [updated] = await db.update(writings)
      .set({ isPublished: true, publishedAt: new Date(), updatedAt: new Date() })
      .where(eq(writings.id, writingId)).returning();
    if (!updated) return undefined;

    await this.createNotification(updated.authorId, {
      type: "published",
      message: editorNote
        ? `Your writing "${updated.title}" has been published! Editor note: ${editorNote}`
        : `Your writing "${updated.title}" has been published!`,
      writingId: updated.id,
    });

    return updated;
  }

  // === EDITOR STUDIO ===
  async isEditor(userId: string): Promise<boolean> {
    const [user] = await db.select({ role: users.role }).from(users).where(eq(users.id, userId));
    return user?.role === "editor";
  }

  async setEditorRole(userId: string, role: string): Promise<void> {
    await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, userId));
  }

  async getEditorOverview(editorId: string): Promise<{ newPieces: number; editorialAvailable: number; pendingRequests: number; draftIssues: number }> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newPiecesResult = await db.select({ cnt: count() }).from(writings)
      .where(and(eq(writings.visibility, "garden"), sql`${writings.createdAt} >= ${sevenDaysAgo}`));
    const editorialResult = await db.select({ cnt: count() }).from(writings)
      .where(eq(writings.editorialAvailable, true));
    const pendingResult = await db.select({ cnt: count() }).from(publishRequests)
      .where(and(eq(publishRequests.editorId, editorId), eq(publishRequests.status, "draft")));
    const draftIssuesResult = await db.select({ cnt: count() }).from(issues)
      .where(eq(issues.status, "draft"));
    return {
      newPieces: newPiecesResult[0]?.cnt ?? 0,
      editorialAvailable: editorialResult[0]?.cnt ?? 0,
      pendingRequests: pendingResult[0]?.cnt ?? 0,
      draftIssues: draftIssuesResult[0]?.cnt ?? 0,
    };
  }

  async getEditorGardenStream(filters?: { genre?: string; readiness?: string; form?: string; search?: string; newSinceDate?: Date; quiet?: boolean }): Promise<(Writing & { authorName: string | null; authorImage: string | null; resonanceCount: number })[]> {
    const conditions: any[] = [or(eq(writings.visibility, "garden"), eq(writings.editorialAvailable, true))];
    if (filters?.genre) conditions.push(eq(writings.genre, filters.genre));
    if (filters?.readiness) conditions.push(eq(writings.readiness, filters.readiness));
    if (filters?.search) conditions.push(or(ilike(writings.title, `%${filters.search}%`), ilike(writings.content, `%${filters.search}%`)));
    if (filters?.newSinceDate) conditions.push(sql`${writings.createdAt} >= ${filters.newSinceDate}`);

    const results = await db.select({
      id: writings.id, authorId: writings.authorId, title: writings.title, content: writings.content,
      stage: writings.stage, genre: writings.genre, visibility: writings.visibility,
      readiness: writings.readiness, editorialAvailable: writings.editorialAvailable,
      isPublished: writings.isPublished, isPinned: writings.isPinned, isArchived: writings.isArchived,
      tags: writings.tags, publishedAt: writings.publishedAt,
      createdAt: writings.createdAt, updatedAt: writings.updatedAt,
      authorName: users.firstName,
      authorImage: users.profileImageUrl,
    }).from(writings)
      .leftJoin(users, eq(writings.authorId, users.id))
      .where(and(...conditions))
      .orderBy(desc(writings.updatedAt));

    const enriched: (Writing & { authorName: string | null; authorImage: string | null; resonanceCount: number })[] = [];
    for (const r of results) {
      const [res] = await db.select({ cnt: count() }).from(resonances).where(eq(resonances.writingId, r.id));
      const resonanceCount = res?.cnt ?? 0;
      if (filters?.quiet && resonanceCount > 0) continue;
      enriched.push({ ...r, resonanceCount });
    }
    return enriched;
  }

  async getGreenhouseEntries(editorId: string): Promise<(GreenhouseEntry & { writingTitle: string; authorName: string | null; authorId: string })[]> {
    return await db.select({
      id: greenhouseEntries.id, writingId: greenhouseEntries.writingId, editorId: greenhouseEntries.editorId,
      issueId: greenhouseEntries.issueId, themeFolder: greenhouseEntries.themeFolder,
      priority: greenhouseEntries.priority, internalNote: greenhouseEntries.internalNote,
      stage: greenhouseEntries.stage, createdAt: greenhouseEntries.createdAt,
      writingTitle: writings.title, authorName: users.firstName, authorId: writings.authorId,
    }).from(greenhouseEntries)
      .innerJoin(writings, eq(greenhouseEntries.writingId, writings.id))
      .leftJoin(users, eq(writings.authorId, users.id))
      .where(eq(greenhouseEntries.editorId, editorId))
      .orderBy(desc(greenhouseEntries.createdAt));
  }

  async addToGreenhouse(editorId: string, data: { writingId: string; issueId?: string; themeFolder?: string; priority?: string; internalNote?: string }): Promise<GreenhouseEntry> {
    const [entry] = await db.insert(greenhouseEntries).values({ editorId, ...data }).returning();
    return entry;
  }

  async updateGreenhouseEntry(editorId: string, id: string, data: { issueId?: string; themeFolder?: string; priority?: string; internalNote?: string; stage?: string }): Promise<GreenhouseEntry | undefined> {
    const [updated] = await db.update(greenhouseEntries).set(data)
      .where(and(eq(greenhouseEntries.id, id), eq(greenhouseEntries.editorId, editorId))).returning();
    return updated || undefined;
  }

  async removeFromGreenhouse(editorId: string, id: string): Promise<boolean> {
    const result = await db.delete(greenhouseEntries)
      .where(and(eq(greenhouseEntries.id, id), eq(greenhouseEntries.editorId, editorId))).returning();
    return result.length > 0;
  }

  async getPublishRequests(filters?: { editorId?: string; status?: string }): Promise<(PublishRequest & { writingTitle: string; authorName: string | null; editorName: string | null })[]> {
    const conditions: any[] = [];
    if (filters?.editorId) conditions.push(eq(publishRequests.editorId, filters.editorId));
    if (filters?.status) conditions.push(eq(publishRequests.status, filters.status));

    const authorAlias = users;
    const results = await db.select({
      id: publishRequests.id, writingId: publishRequests.writingId,
      authorId: publishRequests.authorId, editorId: publishRequests.editorId,
      issueId: publishRequests.issueId, status: publishRequests.status,
      editorNote: publishRequests.editorNote, proposedDate: publishRequests.proposedDate,
      rightsDuration: publishRequests.rightsDuration, payment: publishRequests.payment,
      createdAt: publishRequests.createdAt, respondedAt: publishRequests.respondedAt,
      writingTitle: writings.title, authorName: authorAlias.firstName,
    }).from(publishRequests)
      .innerJoin(writings, eq(publishRequests.writingId, writings.id))
      .leftJoin(authorAlias, eq(publishRequests.authorId, authorAlias.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(publishRequests.createdAt));

    const enriched: (PublishRequest & { writingTitle: string; authorName: string | null; editorName: string | null })[] = [];
    for (const r of results) {
      let editorName: string | null = null;
      const [editor] = await db.select({ firstName: users.firstName }).from(users).where(eq(users.id, r.editorId));
      editorName = editor?.firstName ?? null;
      enriched.push({ ...r, editorName });
    }
    return enriched;
  }

  async getAuthorPublishRequests(authorId: string): Promise<(PublishRequest & { writingTitle: string; editorName: string | null })[]> {
    const results = await db.select({
      id: publishRequests.id, writingId: publishRequests.writingId,
      authorId: publishRequests.authorId, editorId: publishRequests.editorId,
      issueId: publishRequests.issueId, status: publishRequests.status,
      editorNote: publishRequests.editorNote, proposedDate: publishRequests.proposedDate,
      rightsDuration: publishRequests.rightsDuration, payment: publishRequests.payment,
      createdAt: publishRequests.createdAt, respondedAt: publishRequests.respondedAt,
      writingTitle: writings.title,
    }).from(publishRequests)
      .innerJoin(writings, eq(publishRequests.writingId, writings.id))
      .where(eq(publishRequests.authorId, authorId))
      .orderBy(desc(publishRequests.createdAt));

    const enriched: (PublishRequest & { writingTitle: string; editorName: string | null })[] = [];
    for (const r of results) {
      const [editor] = await db.select({ firstName: users.firstName }).from(users).where(eq(users.id, r.editorId));
      enriched.push({ ...r, editorName: editor?.firstName ?? null });
    }
    return enriched;
  }

  async createPublishRequest(editorId: string, data: { writingId: string; authorId: string; issueId?: string; editorNote?: string; proposedDate?: string; rightsDuration?: string; payment?: string }): Promise<PublishRequest> {
    const [request] = await db.insert(publishRequests).values({ editorId, ...data }).returning();
    const writing = await this.getWriting(data.writingId);
    await this.createNotification(data.authorId, {
      type: "publish_request",
      actorId: editorId,
      writingId: data.writingId,
      message: `An editor would like to publish "${writing?.title || "your writing"}"`,
    });
    return request;
  }

  async respondToPublishRequest(authorId: string, id: string, status: "accepted" | "declined"): Promise<PublishRequest | undefined> {
    const [updated] = await db.update(publishRequests).set({ status, respondedAt: new Date() })
      .where(and(eq(publishRequests.id, id), eq(publishRequests.authorId, authorId))).returning();
    if (!updated) return undefined;

    await this.createNotification(updated.editorId, {
      type: "publish_response",
      actorId: authorId,
      writingId: updated.writingId,
      message: `Author ${status} your publish request`,
    });

    if (status === "accepted") {
      await db.update(greenhouseEntries).set({ stage: "accepted" })
        .where(and(eq(greenhouseEntries.writingId, updated.writingId), eq(greenhouseEntries.editorId, updated.editorId)));
    }
    return updated;
  }

  async getRequestMessages(requestId: string): Promise<(RequestMessage & { senderName: string | null })[]> {
    return await db.select({
      id: requestMessages.id, requestId: requestMessages.requestId,
      senderId: requestMessages.senderId, content: requestMessages.content,
      createdAt: requestMessages.createdAt, senderName: users.firstName,
    }).from(requestMessages)
      .leftJoin(users, eq(requestMessages.senderId, users.id))
      .where(eq(requestMessages.requestId, requestId))
      .orderBy(requestMessages.createdAt);
  }

  async createRequestMessage(senderId: string, data: { requestId: string; content: string }): Promise<RequestMessage> {
    const [msg] = await db.insert(requestMessages).values({ senderId, ...data }).returning();
    const [request] = await db.select().from(publishRequests).where(eq(publishRequests.id, data.requestId));
    if (request) {
      const recipientId = senderId === request.editorId ? request.authorId : request.editorId;
      await this.createNotification(recipientId, {
        type: "request_message",
        actorId: senderId,
        writingId: request.writingId,
        message: "sent you a message about a publish request",
      });
    }
    return msg;
  }

  async getIssues(): Promise<(Issue & { pieceCount: number; creatorName: string | null })[]> {
    const allIssues = await db.select({
      id: issues.id, title: issues.title, subtitle: issues.subtitle,
      themeNote: issues.themeNote, publishDate: issues.publishDate,
      status: issues.status, createdById: issues.createdById,
      createdAt: issues.createdAt, updatedAt: issues.updatedAt,
      creatorName: users.firstName,
    }).from(issues)
      .leftJoin(users, eq(issues.createdById, users.id))
      .orderBy(desc(issues.createdAt));

    const result: (Issue & { pieceCount: number; creatorName: string | null })[] = [];
    for (const issue of allIssues) {
      const [cnt] = await db.select({ cnt: count() }).from(issuePieces).where(eq(issuePieces.issueId, issue.id));
      result.push({ ...issue, pieceCount: cnt?.cnt ?? 0 });
    }
    return result;
  }

  async getIssue(id: string): Promise<(Issue & { creatorName: string | null }) | undefined> {
    const [issue] = await db.select({
      id: issues.id, title: issues.title, subtitle: issues.subtitle,
      themeNote: issues.themeNote, publishDate: issues.publishDate,
      status: issues.status, createdById: issues.createdById,
      createdAt: issues.createdAt, updatedAt: issues.updatedAt,
      creatorName: users.firstName,
    }).from(issues)
      .leftJoin(users, eq(issues.createdById, users.id))
      .where(eq(issues.id, id));
    return issue || undefined;
  }

  async createIssue(userId: string, data: { title: string; subtitle?: string; themeNote?: string; publishDate?: Date }): Promise<Issue> {
    const [issue] = await db.insert(issues).values({ createdById: userId, ...data }).returning();
    return issue;
  }

  async updateIssue(id: string, data: { title?: string; subtitle?: string; themeNote?: string; publishDate?: Date; status?: string }): Promise<Issue | undefined> {
    const [updated] = await db.update(issues).set({ ...data, updatedAt: new Date() })
      .where(eq(issues.id, id)).returning();
    return updated || undefined;
  }

  async getIssuePieces(issueId: string): Promise<(IssuePiece & { writingTitle: string; authorName: string | null; writingContent: string })[]> {
    return await db.select({
      id: issuePieces.id, issueId: issuePieces.issueId, writingId: issuePieces.writingId,
      sortOrder: issuePieces.sortOrder, workflowState: issuePieces.workflowState,
      editorialNotes: issuePieces.editorialNotes, createdAt: issuePieces.createdAt,
      writingTitle: writings.title, authorName: users.firstName, writingContent: writings.content,
    }).from(issuePieces)
      .innerJoin(writings, eq(issuePieces.writingId, writings.id))
      .leftJoin(users, eq(writings.authorId, users.id))
      .where(eq(issuePieces.issueId, issueId))
      .orderBy(issuePieces.sortOrder);
  }

  async addPieceToIssue(data: { issueId: string; writingId: string; sortOrder?: number }): Promise<IssuePiece> {
    const [piece] = await db.insert(issuePieces).values(data).returning();
    return piece;
  }

  async updateIssuePiece(id: string, data: { sortOrder?: number; workflowState?: string; editorialNotes?: string }): Promise<IssuePiece | undefined> {
    const [updated] = await db.update(issuePieces).set(data).where(eq(issuePieces.id, id)).returning();
    return updated || undefined;
  }

  async removePieceFromIssue(id: string): Promise<boolean> {
    const result = await db.delete(issuePieces).where(eq(issuePieces.id, id)).returning();
    return result.length > 0;
  }

  async publishIssue(id: string): Promise<Issue | undefined> {
    const [updated] = await db.update(issues).set({ status: "published", updatedAt: new Date() })
      .where(eq(issues.id, id)).returning();
    if (!updated) return undefined;

    const pieces = await db.select({
      writingId: issuePieces.writingId,
      authorId: writings.authorId,
      writingTitle: writings.title,
    }).from(issuePieces)
      .innerJoin(writings, eq(issuePieces.writingId, writings.id))
      .where(eq(issuePieces.issueId, id));

    for (const piece of pieces) {
      await this.publishWriting(piece.writingId);
      await this.createNotification(piece.authorId, {
        type: "issue_published",
        writingId: piece.writingId,
        message: `Your writing "${piece.writingTitle}" has been published in "${updated.title}"`,
      });
    }
    return updated;
  }

  async getEditorNotes(writingId: string): Promise<(EditorNote & { editorName: string | null })[]> {
    return await db.select({
      id: editorNotes.id, writingId: editorNotes.writingId, editorId: editorNotes.editorId,
      content: editorNotes.content, createdAt: editorNotes.createdAt,
      editorName: users.firstName,
    }).from(editorNotes)
      .leftJoin(users, eq(editorNotes.editorId, users.id))
      .where(eq(editorNotes.writingId, writingId))
      .orderBy(desc(editorNotes.createdAt));
  }

  async createEditorNote(editorId: string, data: { writingId: string; content: string }): Promise<EditorNote> {
    const [note] = await db.insert(editorNotes).values({ editorId, ...data }).returning();
    return note;
  }

  async deleteEditorNote(editorId: string, id: string): Promise<boolean> {
    const result = await db.delete(editorNotes)
      .where(and(eq(editorNotes.id, id), eq(editorNotes.editorId, editorId))).returning();
    return result.length > 0;
  }

  // === CIRCLE INTENTIONS ===
  async getCircleIntentions(circleId: string): Promise<(CircleIntention & { userName: string | null })[]> {
    return await db.select({
      id: circleIntentions.id, circleId: circleIntentions.circleId, userId: circleIntentions.userId,
      content: circleIntentions.content, weekOf: circleIntentions.weekOf, createdAt: circleIntentions.createdAt,
      userName: users.firstName,
    }).from(circleIntentions)
      .leftJoin(users, eq(circleIntentions.userId, users.id))
      .where(eq(circleIntentions.circleId, circleId))
      .orderBy(desc(circleIntentions.createdAt));
  }

  async createCircleIntention(userId: string, data: { circleId: string; content: string; weekOf: string }): Promise<CircleIntention> {
    const [item] = await db.insert(circleIntentions).values({ userId, ...data }).returning();
    return item;
  }

  async deleteCircleIntention(userId: string, id: string): Promise<boolean> {
    const result = await db.delete(circleIntentions)
      .where(and(eq(circleIntentions.id, id), eq(circleIntentions.userId, userId))).returning();
    return result.length > 0;
  }

  // === CIRCLE CELEBRATIONS ===
  async getCircleCelebrations(circleId: string): Promise<(CircleCelebration & { userName: string | null })[]> {
    return await db.select({
      id: circleCelebrations.id, circleId: circleCelebrations.circleId, userId: circleCelebrations.userId,
      type: circleCelebrations.type, message: circleCelebrations.message, value: circleCelebrations.value,
      createdAt: circleCelebrations.createdAt, userName: users.firstName,
    }).from(circleCelebrations)
      .leftJoin(users, eq(circleCelebrations.userId, users.id))
      .where(eq(circleCelebrations.circleId, circleId))
      .orderBy(desc(circleCelebrations.createdAt));
  }

  async createCircleCelebration(userId: string, data: { circleId: string; type: string; message?: string; value?: number }): Promise<CircleCelebration> {
    const [item] = await db.insert(circleCelebrations).values({ userId, ...data }).returning();
    return item;
  }

  // === CIRCLE SHARES ===
  async getCircleShares(circleId: string): Promise<(CircleShare & { userName: string | null; writingTitle: string | null })[]> {
    return await db.select({
      id: circleShares.id, circleId: circleShares.circleId, userId: circleShares.userId,
      writingId: circleShares.writingId, weekOf: circleShares.weekOf, createdAt: circleShares.createdAt,
      userName: users.firstName, writingTitle: writings.title,
    }).from(circleShares)
      .leftJoin(users, eq(circleShares.userId, users.id))
      .leftJoin(writings, eq(circleShares.writingId, writings.id))
      .where(eq(circleShares.circleId, circleId))
      .orderBy(desc(circleShares.createdAt));
  }

  async createCircleShare(userId: string, data: { circleId: string; writingId?: string; weekOf: string }): Promise<CircleShare> {
    const [item] = await db.insert(circleShares).values({ userId, ...data }).returning();
    return item;
  }

  async getCircleMembers(circleId: string): Promise<(CircleMember & { userName: string | null })[]> {
    return await db.select({
      id: circleMembers.id, circleId: circleMembers.circleId, userId: circleMembers.userId,
      joinedAt: circleMembers.joinedAt, userName: users.firstName,
    }).from(circleMembers)
      .leftJoin(users, eq(circleMembers.userId, users.id))
      .where(eq(circleMembers.circleId, circleId))
      .orderBy(circleMembers.joinedAt);
  }

  async getCircleMemberCount(circleId: string): Promise<number> {
    const [result] = await db.select({ cnt: count() }).from(circleMembers).where(eq(circleMembers.circleId, circleId));
    return result?.cnt ?? 0;
  }

  async getCurrentSharer(circleId: string): Promise<{ userId: string; userName: string | null } | null> {
    const members = await this.getCircleMembers(circleId);
    if (members.length === 0) return null;
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (86400000));
    const weekNumber = Math.floor(dayOfYear / 7);
    const index = weekNumber % members.length;
    const current = members[index];
    return { userId: current.userId, userName: current.userName };
  }

  // === REJECTION WALL ===
  async getRejectionWallEntries(): Promise<(RejectionWallEntry & { userName: string | null })[]> {
    return await db.select({
      id: rejectionWallEntries.id, userId: rejectionWallEntries.userId,
      outlet: rejectionWallEntries.outlet, pieceTitle: rejectionWallEntries.pieceTitle,
      result: rejectionWallEntries.result, context: rejectionWallEntries.context,
      silver_lining: rejectionWallEntries.silver_lining, createdAt: rejectionWallEntries.createdAt,
      userName: users.firstName,
    }).from(rejectionWallEntries)
      .leftJoin(users, eq(rejectionWallEntries.userId, users.id))
      .orderBy(desc(rejectionWallEntries.createdAt));
  }

  async createRejectionWallEntry(userId: string, data: { outlet: string; pieceTitle?: string; result: string; context?: string; silver_lining?: string }): Promise<RejectionWallEntry> {
    const [item] = await db.insert(rejectionWallEntries).values({ userId, ...data }).returning();
    return item;
  }

  async deleteRejectionWallEntry(userId: string, id: string): Promise<boolean> {
    const result = await db.delete(rejectionWallEntries)
      .where(and(eq(rejectionWallEntries.id, id), eq(rejectionWallEntries.userId, userId))).returning();
    return result.length > 0;
  }

  // === OPPORTUNITIES ===
  async getOpportunities(): Promise<(Opportunity & { userName: string | null; noteCount: number })[]> {
    const results = await db.select({
      id: opportunities.id, userId: opportunities.userId, title: opportunities.title,
      link: opportunities.link, outlet: opportunities.outlet, deadline: opportunities.deadline,
      payRate: opportunities.payRate, responseTime: opportunities.responseTime,
      vibe: opportunities.vibe, genres: opportunities.genres, notes: opportunities.notes,
      isCurated: opportunities.isCurated,
      createdAt: opportunities.createdAt, userName: users.firstName,
      noteCount: sql<number>`(SELECT count(*) FROM opportunity_notes WHERE opportunity_id = ${opportunities.id})::int`,
    }).from(opportunities)
      .leftJoin(users, eq(opportunities.userId, users.id))
      .orderBy(desc(opportunities.createdAt));
    return results;
  }

  async getOpportunity(id: string): Promise<(Opportunity & { userName: string | null }) | undefined> {
    const [item] = await db.select({
      id: opportunities.id, userId: opportunities.userId, title: opportunities.title,
      link: opportunities.link, outlet: opportunities.outlet, deadline: opportunities.deadline,
      payRate: opportunities.payRate, responseTime: opportunities.responseTime,
      vibe: opportunities.vibe, genres: opportunities.genres, notes: opportunities.notes,
      isCurated: opportunities.isCurated,
      createdAt: opportunities.createdAt, userName: users.firstName,
    }).from(opportunities)
      .leftJoin(users, eq(opportunities.userId, users.id))
      .where(eq(opportunities.id, id));
    return item || undefined;
  }

  async createOpportunity(userId: string, data: { title: string; link?: string; outlet?: string; deadline?: string; payRate?: string; responseTime?: string; vibe?: string; genres?: string[]; notes?: string }): Promise<Opportunity> {
    const [item] = await db.insert(opportunities).values({ userId, ...data }).returning();
    return item;
  }

  async deleteOpportunity(userId: string, id: string): Promise<boolean> {
    const result = await db.delete(opportunities)
      .where(and(eq(opportunities.id, id), eq(opportunities.userId, userId))).returning();
    return result.length > 0;
  }

  async getOpportunityNotes(opportunityId: string): Promise<(OpportunityNote & { userName: string | null })[]> {
    return await db.select({
      id: opportunityNotes.id, opportunityId: opportunityNotes.opportunityId,
      userId: opportunityNotes.userId, note: opportunityNotes.note,
      createdAt: opportunityNotes.createdAt, userName: users.firstName,
    }).from(opportunityNotes)
      .leftJoin(users, eq(opportunityNotes.userId, users.id))
      .where(eq(opportunityNotes.opportunityId, opportunityId))
      .orderBy(desc(opportunityNotes.createdAt));
  }

  async createOpportunityNote(userId: string, data: { opportunityId: string; note: string }): Promise<OpportunityNote> {
    const [item] = await db.insert(opportunityNotes).values({ userId, ...data }).returning();
    return item;
  }

  // === CURATED OPPORTUNITIES ===
  async getCuratedOpportunities(): Promise<Opportunity[]> {
    return await db.select().from(opportunities)
      .where(eq(opportunities.isCurated, true))
      .orderBy(opportunities.deadline);
  }

  async createCuratedOpportunity(editorId: string, data: { title: string; link?: string; outlet?: string; deadline?: string; payRate?: string; genres?: string[]; notes?: string }): Promise<Opportunity> {
    const [item] = await db.insert(opportunities).values({ userId: editorId, isCurated: true, ...data }).returning();
    return item;
  }

  async deleteCuratedOpportunity(id: string): Promise<boolean> {
    const result = await db.delete(opportunities)
      .where(and(eq(opportunities.id, id), eq(opportunities.isCurated, true))).returning();
    return result.length > 0;
  }

  // === PROMPT POTLUCK ===
  async getPromptPotluckItems(circleId: string): Promise<(PromptPotluckItem & { userName: string | null })[]> {
    return await db.select({
      id: promptPotluckItems.id, circleId: promptPotluckItems.circleId,
      userId: promptPotluckItems.userId, type: promptPotluckItems.type,
      content: promptPotluckItems.content, createdAt: promptPotluckItems.createdAt,
      userName: users.firstName,
    }).from(promptPotluckItems)
      .leftJoin(users, eq(promptPotluckItems.userId, users.id))
      .where(eq(promptPotluckItems.circleId, circleId))
      .orderBy(desc(promptPotluckItems.createdAt));
  }

  async createPromptPotluckItem(userId: string, data: { circleId: string; type: string; content: string }): Promise<PromptPotluckItem> {
    const [item] = await db.insert(promptPotluckItems).values({ userId, ...data }).returning();
    return item;
  }

  async deletePromptPotluckItem(userId: string, id: string): Promise<boolean> {
    const result = await db.delete(promptPotluckItems)
      .where(and(eq(promptPotluckItems.id, id), eq(promptPotluckItems.userId, userId))).returning();
    return result.length > 0;
  }

  async getRandomPotluckItem(circleId: string): Promise<(PromptPotluckItem & { userName: string | null }) | undefined> {
    const items = await db.select({
      id: promptPotluckItems.id, circleId: promptPotluckItems.circleId,
      userId: promptPotluckItems.userId, type: promptPotluckItems.type,
      content: promptPotluckItems.content, createdAt: promptPotluckItems.createdAt,
      userName: users.firstName,
    }).from(promptPotluckItems)
      .leftJoin(users, eq(promptPotluckItems.userId, users.id))
      .where(eq(promptPotluckItems.circleId, circleId))
      .orderBy(sql`RANDOM()`)
      .limit(1);
    return items[0] || undefined;
  }

  // === IDEA DROPS ===
  async getIdeaDrops(): Promise<(IdeaDrop & { userName: string | null; adopterName: string | null })[]> {
    const adopters = db.select({ id: users.id, firstName: users.firstName }).from(users).as("adopters");
    return await db.select({
      id: ideaDrops.id, userId: ideaDrops.userId, content: ideaDrops.content,
      status: ideaDrops.status, adoptedById: ideaDrops.adoptedById,
      createdAt: ideaDrops.createdAt, userName: users.firstName,
      adopterName: adopters.firstName,
    }).from(ideaDrops)
      .leftJoin(users, eq(ideaDrops.userId, users.id))
      .leftJoin(adopters, eq(ideaDrops.adoptedById, adopters.id))
      .orderBy(desc(ideaDrops.createdAt));
  }

  async createIdeaDrop(userId: string, data: { content: string }): Promise<IdeaDrop> {
    const [item] = await db.insert(ideaDrops).values({ userId, ...data }).returning();
    return item;
  }

  async adoptIdeaDrop(userId: string, id: string): Promise<IdeaDrop | undefined> {
    const [item] = await db.update(ideaDrops)
      .set({ adoptedById: userId, status: "adopted" })
      .where(and(eq(ideaDrops.id, id), eq(ideaDrops.status, "open"))).returning();
    return item || undefined;
  }

  async deleteIdeaDrop(userId: string, id: string): Promise<boolean> {
    const result = await db.delete(ideaDrops)
      .where(and(eq(ideaDrops.id, id), eq(ideaDrops.userId, userId))).returning();
    return result.length > 0;
  }

  // === QUIET READS ===
  async hasQuietRead(readerId: string, writingId: string): Promise<boolean> {
    const [existing] = await db.select({ id: quietReads.id }).from(quietReads)
      .where(and(eq(quietReads.readerId, readerId), eq(quietReads.writingId, writingId)));
    return !!existing;
  }

  async addQuietRead(readerId: string, writingId: string): Promise<QuietRead> {
    const existing = await this.hasQuietRead(readerId, writingId);
    if (existing) {
      const [found] = await db.select().from(quietReads)
        .where(and(eq(quietReads.readerId, readerId), eq(quietReads.writingId, writingId)));
      return found;
    }
    const [created] = await db.insert(quietReads).values({ readerId, writingId }).returning();
    return created;
  }

  async hasBeenQuietlyRead(writingId: string): Promise<boolean> {
    const [existing] = await db.select({ id: quietReads.id }).from(quietReads)
      .where(eq(quietReads.writingId, writingId)).limit(1);
    return !!existing;
  }

  // === VERSION SNAPSHOTS ===
  async getSnapshots(writingId: string): Promise<WritingSnapshot[]> {
    return await db.select().from(writingSnapshots)
      .where(eq(writingSnapshots.writingId, writingId))
      .orderBy(desc(writingSnapshots.createdAt));
  }

  async createSnapshot(data: { writingId: string; title: string; content: string; readiness: string; wordCount: number }): Promise<WritingSnapshot> {
    const [snapshot] = await db.insert(writingSnapshots).values(data).returning();
    return snapshot;
  }
}

export const storage = new DatabaseStorage();
