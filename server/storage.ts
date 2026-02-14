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
  type MicroSwap, microSwaps,
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
  type CafeQuestion, cafeQuestions,
  type CafeResponse, cafeResponses,
  type CircleMicroPrompt, circleMicroPrompts,
  type CircleMicroResponse, circleMicroResponses,
  gardenPresence,
  type EditorialFlag, editorialFlags,
  type EditorsWalk, editorsWalks,
  type FirstReaderDrop, firstReaderDrops,
  type FirstReaderResponse, firstReaderResponses,
  type ReadingShelfEntry, readingShelfEntries,
  submissions, publicationCredits, coverLetterTemplates, writerBios,
  type Submission, type PublicationCredit, type CoverLetterTemplate, type WriterBio,
  type InsertSubmission, type InsertPublicationCredit,
  courses, courseLessons, userCourseAccess, lessonProgress,
  type Course, type CourseLesson, type UserCourseAccess, type LessonProgress,
} from "@shared/schema";
import { users, type User } from "@shared/models/auth";
import { db } from "./db";
import { eq, and, desc, ilike, or, sql, count, ne, inArray, asc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;

  // Writings
  getWritingsByAuthor(authorId: string): Promise<Writing[]>;
  getWriting(id: string): Promise<Writing | undefined>;
  createWriting(authorId: string, writing: InsertWriting): Promise<Writing>;
  updateWriting(id: string, authorId: string, writing: UpdateWriting): Promise<Writing | undefined>;
  deleteWriting(id: string, authorId: string): Promise<boolean>;
  deleteEmptyWritings(authorId: string): Promise<number>;
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
  createSwapRequest(userId: string, data: { writingId: string; genre?: string; note?: string; preferredLength?: string; feedbackStyle?: string }): Promise<SwapRequest>;
  findSmartSwapMatch(requestId: string): Promise<SwapRequest | null>;
  matchSwap(requestId: string, userId: string, writingId: string): Promise<SwapRequest | undefined>;
  getSwapFeedback(swapId: string): Promise<SwapFeedbackEntry[]>;
  createSwapFeedback(userId: string, data: { swapId: string; toUserId: string; strengths: string; suggestions: string; favoriteLines?: string }): Promise<SwapFeedbackEntry>;

  // Micro-swap
  createMicroSwap(userId: string, data: { fragment: string; genre?: string }): Promise<MicroSwap>;
  getMyMicroSwaps(userId: string): Promise<(MicroSwap & { partnerFragment?: string; partnerName?: string })[]>;
  respondToMicroSwap(swapId: string, userId: string, response: string): Promise<MicroSwap | null>;
  findWaitingMicroSwap(excludeUserId: string): Promise<MicroSwap | null>;

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
  getQuietReadWhispers(writingId: string): Promise<{ whisper: string; createdAt: Date | null }[]>;

  // Version Snapshots
  getSnapshots(writingId: string): Promise<WritingSnapshot[]>;
  createSnapshot(data: { writingId: string; title: string; content: string; readiness: string; wordCount: number; snapshotNote?: string; isManual?: boolean }): Promise<WritingSnapshot>;
  getUserTier(userId: string): Promise<string>;
  setUserTier(userId: string, tier: string): Promise<void>;

  // Daily Letter
  getDailyLetter(userId: string): Promise<(Writing & { authorName: string | null; authorImage: string | null }) | null>;

  // Café
  getTodayCafeQuestion(): Promise<(CafeQuestion & { responseCount: number }) | null>;
  getCafeResponses(questionId: string): Promise<(CafeResponse & { userName: string | null })[]>;
  createCafeResponse(userId: string, data: { questionId: string; content: string }): Promise<CafeResponse>;
  getPastCafeQuestions(limit?: number): Promise<(CafeQuestion & { responseCount: number })[]>;

  // Circle Micro-Prompts
  getCircleWeeklyPrompt(circleId: string): Promise<(CircleMicroPrompt & { responses: (CircleMicroResponse & { userName: string | null })[] }) | null>;
  respondToCircleMicroPrompt(userId: string, data: { promptId: string; content: string }): Promise<CircleMicroResponse>;

  // Presence
  updatePresence(userId: string): Promise<void>;
  getActiveWriterCount(): Promise<number>;
  getGardenSummary(): Promise<{ activeWriters: number; newSeeds: number; bloomedPieces: number; totalWriters: number }>;

  // Public Garden
  getPublicGarden(userId: string): Promise<{ user: User; writings: (Writing & { resonanceCount: number })[]; tenderCount: number; tendingCount: number; lastPublicAt: Date | null } | null>;

  // Editorial Flags
  createEditorialFlag(authorId: string, writingId: string, isPaidFlag?: boolean): Promise<EditorialFlag>;
  getActiveFlag(authorId: string): Promise<EditorialFlag | null>;
  getActiveFlagCount(authorId: string): Promise<number>;
  getFlaggedQueue(): Promise<(EditorialFlag & { writingTitle: string; authorName: string | null; genre: string })[]>;
  markFlagSeen(flagId: string, editorId: string): Promise<EditorialFlag | null>;
  respondToFlag(flagId: string, editorId: string, response: string): Promise<EditorialFlag | null>;
  getMyFlags(authorId: string): Promise<(EditorialFlag & { writingTitle: string })[]>;

  // Writer Profile for Editor
  getWriterProfileForEditor(authorId: string): Promise<Writing[]>;

  // Editors List
  getEditors(): Promise<{ id: string; firstName: string | null; lastName: string | null }[]>;

  // All Greenhouse
  getAllGreenhouseEntries(): Promise<(GreenhouseEntry & { writingTitle: string; authorName: string | null; authorId: string; editorName: string | null })[]>;

  // Editors Walk
  getActiveEditorsWalk(): Promise<EditorsWalk | null>;
  getEditorsWalks(): Promise<EditorsWalk[]>;
  createEditorsWalk(editorId: string, data: { title: string; description?: string; startsAt: Date; endsAt: Date; flagLimit?: number }): Promise<EditorsWalk>;
  getEditorsWalkById(id: string): Promise<EditorsWalk | null>;

  // First Reader
  createFirstReaderDrop(authorId: string, data: { content: string; genre?: string }): Promise<FirstReaderDrop>;
  getFirstReaderDrops(genre?: string): Promise<(FirstReaderDrop & { authorName: string | null; responseCount: number })[]>;
  getMyFirstReaderDrops(authorId: string): Promise<(FirstReaderDrop & { responses: FirstReaderResponse[] })[]>;
  createFirstReaderResponse(readerId: string, data: { dropId: string; aliveSignal: string; strikingLine?: string; oneSuggestion?: string }): Promise<FirstReaderResponse>;

  // Reading Shelf
  getReadingShelf(): Promise<(ReadingShelfEntry & { userName: string | null })[]>;
  addToReadingShelf(userId: string, data: { bookTitle: string; author?: string; reaction: string }): Promise<ReadingShelfEntry>;

  // Struggle Signals
  getStruggleSignals(): Promise<{ dormantThisWeek: number; movedBackward: number; revisitedSeeds: number }>;

  getSubmissions(userId: string): Promise<Submission[]>;
  getSubmissionsByWriting(userId: string, writingId: string): Promise<Submission[]>;
  createSubmission(userId: string, data: InsertSubmission): Promise<Submission>;
  updateSubmission(id: string, userId: string, data: Partial<Submission>): Promise<Submission | null>;
  deleteSubmission(id: string, userId: string): Promise<boolean>;
  getSubmissionStats(userId: string): Promise<{ total: number; pending: number; accepted: number; rejected: number; withdrawn: number }>;

  getPublicationCredits(userId: string): Promise<PublicationCredit[]>;
  createPublicationCredit(userId: string, data: InsertPublicationCredit): Promise<PublicationCredit>;
  updatePublicationCredit(id: string, userId: string, data: Partial<PublicationCredit>): Promise<PublicationCredit | null>;
  deletePublicationCredit(id: string, userId: string): Promise<boolean>;
  getUpcomingReversions(userId: string): Promise<PublicationCredit[]>;

  getCoverLetterTemplates(userId: string): Promise<CoverLetterTemplate[]>;
  createCoverLetterTemplate(userId: string, data: { name: string; template: string; isDefault?: boolean }): Promise<CoverLetterTemplate>;
  updateCoverLetterTemplate(id: string, userId: string, data: Partial<CoverLetterTemplate>): Promise<CoverLetterTemplate | null>;
  deleteCoverLetterTemplate(id: string, userId: string): Promise<boolean>;

  getWriterBio(userId: string): Promise<WriterBio | null>;
  upsertWriterBio(userId: string, data: Partial<WriterBio>): Promise<WriterBio>;

  getWritingAnalytics(userId: string): Promise<{
    totalPieces: number;
    byStage: Record<string, number>;
    byGenre: Record<string, number>;
    writingFrequency: { month: string; count: number }[];
    avgDaysToReady: number | null;
    dormantPieces: number;
    recentActivity: number;
    acceptanceRate: number | null;
    writingStreak: number;
    longestPiece: { title: string; wordCount: number } | null;
    fastestGrowth: { title: string; days: number } | null;
    totalWordCount: number;
    weeklyGoalProgress: { current: number; target: number } | null;
  }>;

  // Courses
  getCourses(): Promise<(Course & { lessonCount: number })[]>;
  getCourse(id: string): Promise<(Course & { lessonCount: number }) | undefined>;
  getCourseLessons(courseId: string): Promise<CourseLesson[]>;
  getCourseLesson(lessonId: string): Promise<CourseLesson | undefined>;
  hasUserCourseAccess(userId: string, courseId: string): Promise<boolean>;
  grantCourseAccess(userId: string, courseId: string, accessType?: string): Promise<UserCourseAccess>;
  getUserCourseAccesses(userId: string): Promise<UserCourseAccess[]>;
  markLessonComplete(userId: string, lessonId: string, courseId: string): Promise<LessonProgress>;
  unmarkLessonComplete(userId: string, lessonId: string): Promise<boolean>;
  getLessonProgress(userId: string, courseId: string): Promise<LessonProgress[]>;
}

export class DatabaseStorage implements IStorage {
  // === USERS ===
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

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

  async deleteEmptyWritings(authorId: string): Promise<number> {
    const allWritings = await db.select().from(writings).where(eq(writings.authorId, authorId));
    const emptyIds = allWritings
      .filter(w => {
        const title = (w.title || "").trim();
        const content = (w.content || "").replace(/<[^>]*>/g, "").trim();
        const isUntitled = title === "" || title.toLowerCase() === "untitled";
        return isUntitled && content === "";
      })
      .map(w => w.id);
    if (emptyIds.length === 0) return 0;
    for (const id of emptyIds) {
      await db.delete(writings).where(and(eq(writings.id, id), eq(writings.authorId, authorId)));
    }
    return emptyIds.length;
  }

  private writingSelectFields() {
    return {
      id: writings.id, authorId: writings.authorId, title: writings.title, content: writings.content,
      stage: writings.stage, genre: writings.genre, visibility: writings.visibility,
      readiness: writings.readiness, editorialAvailable: writings.editorialAvailable,
      isPublished: writings.isPublished, publishedAt: writings.publishedAt,
      isPinned: writings.isPinned, isArchived: writings.isArchived,
      isPublicGarden: writings.isPublicGarden, tags: writings.tags,
      createdAt: writings.createdAt, updatedAt: writings.updatedAt,
    };
  }

  async getPublishedWritings(): Promise<(Writing & { authorName: string | null })[]> {
    const results = await db.select({
      ...this.writingSelectFields(),
      authorName: sql<string>`TRIM(CONCAT(${users.firstName}, ' ', COALESCE(${users.lastName}, '')))`.as("authorName"),
    }).from(writings).leftJoin(users, eq(writings.authorId, users.id))
      .where(eq(writings.isPublished, true)).orderBy(desc(writings.publishedAt));
    return results;
  }

  async searchPublishedWritings(query: string, genre?: string): Promise<(Writing & { authorName: string | null })[]> {
    const conditions = [eq(writings.isPublished, true)];
    if (genre) conditions.push(eq(writings.genre, genre));
    const results = await db.select({
      ...this.writingSelectFields(),
      authorName: sql<string>`TRIM(CONCAT(${users.firstName}, ' ', COALESCE(${users.lastName}, '')))`.as("authorName"),
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
      preferredLength: swapRequests.preferredLength, feedbackStyle: swapRequests.feedbackStyle,
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

  async createSwapRequest(userId: string, data: { writingId: string; genre?: string; note?: string; preferredLength?: string; feedbackStyle?: string }): Promise<SwapRequest> {
    const [request] = await db.insert(swapRequests).values({ requesterId: userId, ...data }).returning();
    return request;
  }

  async findSmartSwapMatch(requestId: string): Promise<SwapRequest | null> {
    const [request] = await db.select().from(swapRequests).where(eq(swapRequests.id, requestId));
    if (!request) return null;

    let conditions = [
      eq(swapRequests.status, "open"),
      sql`${swapRequests.requesterId} != ${request.requesterId}`,
      sql`${swapRequests.id} != ${requestId}`,
    ];

    if (request.genre && request.genre !== "any") {
      conditions.push(
        or(eq(swapRequests.genre, request.genre), eq(swapRequests.genre, "any"))!
      );
    }
    if (request.preferredLength && request.preferredLength !== "any") {
      conditions.push(
        or(
          eq(swapRequests.preferredLength, request.preferredLength),
          sql`${swapRequests.preferredLength} IS NULL`,
          eq(swapRequests.preferredLength, "any")
        )!
      );
    }
    if (request.feedbackStyle && request.feedbackStyle !== "any") {
      conditions.push(
        or(
          eq(swapRequests.feedbackStyle, request.feedbackStyle),
          sql`${swapRequests.feedbackStyle} IS NULL`,
          eq(swapRequests.feedbackStyle, "any")
        )!
      );
    }

    const matches = await db.select().from(swapRequests)
      .where(and(...conditions))
      .orderBy(swapRequests.createdAt)
      .limit(1);

    return matches[0] || null;
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

  // === MICRO-SWAP ===
  async findWaitingMicroSwap(excludeUserId: string): Promise<MicroSwap | null> {
    const [found] = await db.select().from(microSwaps)
      .where(and(eq(microSwaps.status, "waiting"), ne(microSwaps.userId, excludeUserId)))
      .orderBy(asc(microSwaps.createdAt))
      .limit(1);
    return found || null;
  }

  async createMicroSwap(userId: string, data: { fragment: string; genre?: string }): Promise<MicroSwap> {
    const [created] = await db.insert(microSwaps).values({ userId, ...data }).returning();

    const waiting = await this.findWaitingMicroSwap(userId);
    if (waiting) {
      await db.update(microSwaps).set({ matchedWithId: waiting.id, status: "matched" }).where(eq(microSwaps.id, created.id));
      await db.update(microSwaps).set({ matchedWithId: created.id, status: "matched" }).where(eq(microSwaps.id, waiting.id));
      const [updated] = await db.select().from(microSwaps).where(eq(microSwaps.id, created.id));
      return updated;
    }
    return created;
  }

  async getMyMicroSwaps(userId: string): Promise<(MicroSwap & { partnerFragment?: string; partnerName?: string })[]> {
    const mySwaps = await db.select().from(microSwaps)
      .where(eq(microSwaps.userId, userId))
      .orderBy(desc(microSwaps.createdAt));

    const enriched: (MicroSwap & { partnerFragment?: string; partnerName?: string })[] = [];
    for (const s of mySwaps) {
      let partnerFragment: string | undefined;
      let partnerName: string | undefined;
      if (s.matchedWithId) {
        const [partner] = await db.select({
          fragment: microSwaps.fragment,
          userName: users.firstName,
        }).from(microSwaps)
          .leftJoin(users, eq(microSwaps.userId, users.id))
          .where(eq(microSwaps.id, s.matchedWithId));
        if (partner) {
          partnerFragment = partner.fragment;
          partnerName = partner.userName ?? undefined;
        }
      }
      enriched.push({ ...s, partnerFragment, partnerName });
    }
    return enriched;
  }

  async respondToMicroSwap(swapId: string, userId: string, response: string): Promise<MicroSwap | null> {
    const [swap] = await db.select().from(microSwaps)
      .where(and(eq(microSwaps.id, swapId), eq(microSwaps.userId, userId)));
    if (!swap || !swap.matchedWithId) return null;

    await db.update(microSwaps).set({ response }).where(eq(microSwaps.id, swapId));

    await db.update(microSwaps).set({ partnerResponse: response }).where(eq(microSwaps.id, swap.matchedWithId));

    const [partner] = await db.select().from(microSwaps).where(eq(microSwaps.id, swap.matchedWithId));
    if (partner?.response) {
      await db.update(microSwaps).set({ status: "completed" }).where(eq(microSwaps.id, swapId));
      await db.update(microSwaps).set({ status: "completed" }).where(eq(microSwaps.id, swap.matchedWithId));
    }

    const [updated] = await db.select().from(microSwaps).where(eq(microSwaps.id, swapId));
    return updated || null;
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
      enriched.push({ ...r, resonanceCount } as any);
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

  async getQuietReadWhispers(writingId: string): Promise<{ whisper: string; createdAt: Date | null }[]> {
    const reads = await db.select({
      readerId: quietReads.readerId,
      createdAt: quietReads.createdAt,
    }).from(quietReads)
      .where(eq(quietReads.writingId, writingId))
      .orderBy(desc(quietReads.createdAt))
      .limit(5);

    const whispers: { whisper: string; createdAt: Date | null }[] = [];

    for (const read of reads) {
      const genreResult = await db.select({
        genre: writings.genre,
        cnt: count(),
      }).from(writings)
        .where(eq(writings.authorId, read.readerId))
        .groupBy(writings.genre)
        .orderBy(desc(count()))
        .limit(1);

      const primaryGenre = genreResult.length > 0 ? genreResult[0].genre : null;

      const verbs = ["lingered here", "visited", "spent time here", "passed through"];
      const verb = verbs[Math.floor(Math.random() * verbs.length)];

      let descriptor: string;
      if (primaryGenre === "poetry") {
        descriptor = "a poet";
      } else if (primaryGenre === "fiction") {
        descriptor = "someone who writes fiction";
      } else if (primaryGenre === "essay") {
        descriptor = "someone who writes essays";
      } else if (primaryGenre === "fragment") {
        descriptor = "a collector of fragments";
      } else {
        descriptor = "a writer";
      }

      let timeContext = "";
      if (read.createdAt) {
        const now = new Date();
        const readDate = new Date(read.createdAt);
        const hour = readDate.getHours();
        const isLateNight = hour >= 22 || hour < 5;

        const diffMs = now.getTime() - readDate.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const isToday = readDate.toDateString() === now.toDateString();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const isYesterday = readDate.toDateString() === yesterday.toDateString();

        if (isLateNight) {
          if (isToday) timeContext = " in the small hours";
          else if (isYesterday) timeContext = " late last night";
          else timeContext = ` ${diffDays} days ago, late at night`;
        } else {
          if (isToday) timeContext = " today";
          else if (isYesterday) timeContext = " yesterday";
          else if (diffDays < 7) timeContext = ` ${diffDays} days ago`;
          else timeContext = ` ${Math.floor(diffDays / 7)} weeks ago`;
        }
      }

      whispers.push({
        whisper: `${descriptor} ${verb}${timeContext}`,
        createdAt: read.createdAt,
      });
    }

    return whispers;
  }

  // === VERSION SNAPSHOTS ===
  async getSnapshots(writingId: string): Promise<WritingSnapshot[]> {
    return await db.select().from(writingSnapshots)
      .where(eq(writingSnapshots.writingId, writingId))
      .orderBy(desc(writingSnapshots.createdAt));
  }

  async createSnapshot(data: { writingId: string; title: string; content: string; readiness: string; wordCount: number; snapshotNote?: string; isManual?: boolean }): Promise<WritingSnapshot> {
    const [snapshot] = await db.insert(writingSnapshots).values(data).returning();
    return snapshot;
  }

  async getUserTier(userId: string): Promise<string> {
    const user = await this.getUser(userId);
    return user?.tier || "free";
  }

  async setUserTier(userId: string, tier: string): Promise<void> {
    await db.update(users).set({ tier, updatedAt: new Date() }).where(eq(users.id, userId));
  }

  // === DAILY LETTER ===
  async getDailyLetter(userId: string): Promise<(Writing & { authorName: string | null; authorImage: string | null }) | null> {
    const allPieces = await db.select({
      ...this.writingSelectFields(),
      authorName: users.firstName,
      authorImage: users.profileImageUrl,
    }).from(writings).leftJoin(users, eq(writings.authorId, users.id))
      .where(and(
        or(eq(writings.visibility, "garden"), eq(writings.isPublished, true)),
        ne(writings.readiness, "dormant")
      ))
      .orderBy(asc(writings.createdAt));

    if (allPieces.length === 0) return null;

    const tendedRows = await db.select({ gardenerId: tending.gardenerId })
      .from(tending).where(eq(tending.tenderId, userId));
    const tendedIds = new Set(tendedRows.map(r => r.gardenerId));

    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

    const tendedPieces = allPieces.filter(p => tendedIds.has(p.authorId));
    if (tendedPieces.length > 0) {
      const index = dayOfYear % tendedPieces.length;
      return tendedPieces[index];
    }

    const index = dayOfYear % allPieces.length;
    return allPieces[index];
  }

  // === CAFÉ ===
  private static CAFE_QUESTIONS = [
    "What's the last sentence you wrote today?",
    "What are you avoiding writing?",
    "Describe the room you write in, in one sentence.",
    "What word have you been turning over in your mind?",
    "What did you read this week that stayed with you?",
    "What's the hardest thing about what you're working on right now?",
    "If your current piece were weather, what would it be?",
    "What's one line from your writing you're secretly proud of?",
    "What made you want to write today?",
    "What's a word you've never used in your writing but want to?",
    "What does your writing desk look like right now?",
    "What's the first thing you do before you start writing?",
    "What sound helps you write?",
    "What are you reading right now, and why?",
    "What's a sentence you deleted today that you kind of miss?",
    "If you could write anywhere in the world right now, where?",
    "What's a writing habit you're trying to build?",
    "What's the most honest thing you've written recently?",
    "What time of day do you write best?",
    "What's a piece of writing advice you keep coming back to?",
    "What emotion are you writing toward today?",
    "What's the last thing that made you stop and take a note?",
    "What character or image keeps showing up in your work?",
    "What are you learning about your own writing lately?",
    "What's a book that changed how you write?",
    "What does 'done' look like for the piece you're working on?",
    "What's the strangest thing you've researched for your writing?",
    "What would your writing sound like if it were music?",
    "What's one thing you want to try in your next piece?",
    "What part of the writing process do you secretly enjoy most?",
  ];

  async getTodayCafeQuestion(): Promise<(CafeQuestion & { responseCount: number }) | null> {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    const questionText = DatabaseStorage.CAFE_QUESTIONS[dayOfYear % DatabaseStorage.CAFE_QUESTIONS.length];

    const [existing] = await db.select().from(cafeQuestions).where(eq(cafeQuestions.question, questionText));

    let question: CafeQuestion;
    if (existing) {
      question = existing;
    } else {
      const [created] = await db.insert(cafeQuestions).values({ question: questionText }).returning();
      question = created;
    }

    const [responseCountResult] = await db.select({ count: count() }).from(cafeResponses).where(eq(cafeResponses.questionId, question.id));
    return { ...question, responseCount: responseCountResult?.count || 0 };
  }

  async getCafeResponses(questionId: string): Promise<(CafeResponse & { userName: string | null })[]> {
    return await db.select({
      id: cafeResponses.id,
      questionId: cafeResponses.questionId,
      userId: cafeResponses.userId,
      content: cafeResponses.content,
      createdAt: cafeResponses.createdAt,
      userName: users.firstName,
    }).from(cafeResponses)
      .leftJoin(users, eq(cafeResponses.userId, users.id))
      .where(eq(cafeResponses.questionId, questionId))
      .orderBy(asc(cafeResponses.createdAt));
  }

  async createCafeResponse(userId: string, data: { questionId: string; content: string }): Promise<CafeResponse> {
    const [created] = await db.insert(cafeResponses).values({
      questionId: data.questionId,
      userId,
      content: data.content,
    }).returning();
    return created;
  }

  async getPastCafeQuestions(limit: number = 7): Promise<(CafeQuestion & { responseCount: number })[]> {
    const today = await this.getTodayCafeQuestion();
    const todayId = today?.id;

    const questions = await db.select({
      id: cafeQuestions.id,
      question: cafeQuestions.question,
      createdAt: cafeQuestions.createdAt,
      responseCount: count(cafeResponses.id),
    }).from(cafeQuestions)
      .leftJoin(cafeResponses, eq(cafeQuestions.id, cafeResponses.questionId))
      .where(todayId ? ne(cafeQuestions.id, todayId) : sql`true`)
      .groupBy(cafeQuestions.id, cafeQuestions.question, cafeQuestions.createdAt)
      .orderBy(desc(cafeQuestions.createdAt))
      .limit(limit);

    return questions;
  }

  // === CIRCLE MICRO-PROMPTS ===
  private microPromptsList = [
    "What's one sentence you wrote this week?",
    "What are you reading right now?",
    "Share a line you almost deleted.",
    "What's the weather like in your writing today?",
    "Describe your writing mood in three words.",
    "What's a question your current piece is asking?",
    "What's the smallest thing you noticed today?",
    "Name something you want to write but haven't yet.",
    "What word keeps finding its way into your writing?",
    "What surprised you about your writing this week?",
    "What sound is in the background of your writing right now?",
    "What's one thing you're avoiding putting on the page?",
    "Describe the color of your last piece.",
    "What did you learn from a failed draft?",
    "What's a line from someone else that's stuck with you?",
    "If your writing had a season right now, what would it be?",
    "What's the last thing that made you want to write?",
    "Share one word you discovered recently.",
    "What are you writing toward?",
    "What would your writing say to you if it could talk?",
  ];

  private getISOWeek(): string {
    const now = new Date();
    const jan4 = new Date(now.getFullYear(), 0, 4);
    const dayOfYear = Math.floor((now.getTime() - jan4.getTime()) / 86400000) + jan4.getDay();
    const weekNum = Math.ceil((dayOfYear + 1) / 7);
    return `${now.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
  }

  async getCircleWeeklyPrompt(circleId: string): Promise<(CircleMicroPrompt & { responses: (CircleMicroResponse & { userName: string | null })[] }) | null> {
    const weekOf = this.getISOWeek();

    let [existing] = await db.select().from(circleMicroPrompts)
      .where(and(eq(circleMicroPrompts.circleId, circleId), eq(circleMicroPrompts.weekOf, weekOf)));

    if (!existing) {
      const weekNum = parseInt(weekOf.split("-W")[1], 10);
      const promptText = this.microPromptsList[weekNum % this.microPromptsList.length];
      const [created] = await db.insert(circleMicroPrompts).values({
        circleId,
        prompt: promptText,
        weekOf,
      }).returning();
      existing = created;
    }

    const responses = await db.select({
      id: circleMicroResponses.id,
      promptId: circleMicroResponses.promptId,
      userId: circleMicroResponses.userId,
      content: circleMicroResponses.content,
      createdAt: circleMicroResponses.createdAt,
      userName: users.firstName,
    }).from(circleMicroResponses)
      .leftJoin(users, eq(circleMicroResponses.userId, users.id))
      .where(eq(circleMicroResponses.promptId, existing.id))
      .orderBy(asc(circleMicroResponses.createdAt));

    return { ...existing, responses };
  }

  async respondToCircleMicroPrompt(userId: string, data: { promptId: string; content: string }): Promise<CircleMicroResponse> {
    const [created] = await db.insert(circleMicroResponses).values({
      promptId: data.promptId,
      userId,
      content: data.content,
    }).returning();
    return created;
  }

  // === PRESENCE ===
  async updatePresence(userId: string): Promise<void> {
    const [existing] = await db.select().from(gardenPresence).where(eq(gardenPresence.userId, userId));
    if (existing) {
      await db.update(gardenPresence).set({ lastSeen: new Date() }).where(eq(gardenPresence.userId, userId));
    } else {
      await db.insert(gardenPresence).values({ userId, lastSeen: new Date() });
    }
  }

  async getActiveWriterCount(): Promise<number> {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const [result] = await db.select({ count: count() }).from(gardenPresence)
      .where(sql`${gardenPresence.lastSeen} > ${fifteenMinutesAgo}`);
    return result?.count || 0;
  }

  async getGardenSummary(): Promise<{ activeWriters: number; newSeeds: number; bloomedPieces: number; totalWriters: number }> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [activeResult] = await db.select({ count: sql<number>`count(distinct ${gardenPresence.userId})` })
      .from(gardenPresence)
      .where(sql`${gardenPresence.lastSeen} > ${thirtyDaysAgo}`);

    const [seedResult] = await db.select({ count: count() }).from(writings)
      .where(sql`${writings.createdAt} > ${thirtyDaysAgo}`);

    const [bloomResult] = await db.select({ count: count() }).from(writings)
      .where(and(
        eq(writings.isPublished, true),
        sql`${writings.publishedAt} > ${thirtyDaysAgo}`
      ));

    const [totalResult] = await db.select({ count: count() }).from(users);

    return {
      activeWriters: Number(activeResult?.count) || 0,
      newSeeds: seedResult?.count || 0,
      bloomedPieces: bloomResult?.count || 0,
      totalWriters: totalResult?.count || 0,
    };
  }

  // === PUBLIC GARDEN ===
  async getPublicGarden(userId: string) {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return null;

    const publicWritings = await db.select().from(writings)
      .where(and(eq(writings.authorId, userId), or(eq(writings.isPublicGarden, true), eq(writings.isPublished, true))))
      .orderBy(desc(writings.updatedAt));

    const writingsWithResonance: (Writing & { resonanceCount: number })[] = [];
    for (const w of publicWritings) {
      const [res] = await db.select({ cnt: count() }).from(resonances).where(eq(resonances.writingId, w.id));
      writingsWithResonance.push({ ...w, resonanceCount: Number(res?.cnt || 0) });
    }

    const [tenderRes] = await db.select({ cnt: count() }).from(tending).where(eq(tending.gardenerId, userId));
    const [tendingRes] = await db.select({ cnt: count() }).from(tending).where(eq(tending.tenderId, userId));

    const lastPublicAt = publicWritings.length > 0 ? publicWritings[0].updatedAt : null;

    return {
      user,
      writings: writingsWithResonance,
      tenderCount: Number(tenderRes?.cnt || 0),
      tendingCount: Number(tendingRes?.cnt || 0),
      lastPublicAt,
    };
  }

  // === EDITORIAL FLAGS ===
  async createEditorialFlag(authorId: string, writingId: string, isPaidFlag: boolean = false): Promise<EditorialFlag> {
    const [flag] = await db.insert(editorialFlags).values({ writingId, authorId, isPaidFlag }).returning();
    return flag;
  }

  async getActiveFlag(authorId: string): Promise<EditorialFlag | null> {
    const [flag] = await db.select().from(editorialFlags)
      .where(and(eq(editorialFlags.authorId, authorId), eq(editorialFlags.status, "flagged")));
    return flag || null;
  }

  async getActiveFlagCount(authorId: string): Promise<number> {
    const [result] = await db.select({ cnt: count() }).from(editorialFlags)
      .where(and(eq(editorialFlags.authorId, authorId), eq(editorialFlags.status, "flagged")));
    return Number(result?.cnt || 0);
  }

  async getFlaggedQueue(): Promise<(EditorialFlag & { writingTitle: string; authorName: string | null; genre: string })[]> {
    const results = await db.select({
      id: editorialFlags.id,
      writingId: editorialFlags.writingId,
      authorId: editorialFlags.authorId,
      status: editorialFlags.status,
      isPaidFlag: editorialFlags.isPaidFlag,
      seenByEditorId: editorialFlags.seenByEditorId,
      seenAt: editorialFlags.seenAt,
      editorResponse: editorialFlags.editorResponse,
      respondedAt: editorialFlags.respondedAt,
      createdAt: editorialFlags.createdAt,
      writingTitle: writings.title,
      authorName: users.firstName,
      genre: writings.genre,
    }).from(editorialFlags)
      .leftJoin(writings, eq(editorialFlags.writingId, writings.id))
      .leftJoin(users, eq(editorialFlags.authorId, users.id))
      .where(eq(editorialFlags.status, "flagged"))
      .orderBy(asc(editorialFlags.createdAt));
    return results.map(r => ({ ...r, writingTitle: r.writingTitle || "Untitled", genre: r.genre || "poetry" }));
  }

  async markFlagSeen(flagId: string, editorId: string): Promise<EditorialFlag | null> {
    const [updated] = await db.update(editorialFlags)
      .set({ seenByEditorId: editorId, seenAt: new Date(), status: "seen" })
      .where(eq(editorialFlags.id, flagId)).returning();
    return updated || null;
  }

  async respondToFlag(flagId: string, editorId: string, response: string): Promise<EditorialFlag | null> {
    const [updated] = await db.update(editorialFlags)
      .set({
        seenByEditorId: editorId,
        editorResponse: response,
        respondedAt: new Date(),
        status: "responded",
        seenAt: new Date(),
      })
      .where(eq(editorialFlags.id, flagId)).returning();

    if (updated) {
      const [writing] = await db.select({ title: writings.title }).from(writings).where(eq(writings.id, updated.writingId));
      await db.insert(notifications).values({
        userId: updated.authorId,
        type: "editor_response",
        actorId: editorId,
        writingId: updated.writingId,
        message: `An editor responded to your flagged piece "${writing?.title || 'Untitled'}": "${response}"`,
      });
    }

    return updated || null;
  }

  async getMyFlags(authorId: string): Promise<(EditorialFlag & { writingTitle: string })[]> {
    const results = await db.select({
      id: editorialFlags.id,
      writingId: editorialFlags.writingId,
      authorId: editorialFlags.authorId,
      status: editorialFlags.status,
      isPaidFlag: editorialFlags.isPaidFlag,
      seenByEditorId: editorialFlags.seenByEditorId,
      seenAt: editorialFlags.seenAt,
      editorResponse: editorialFlags.editorResponse,
      respondedAt: editorialFlags.respondedAt,
      createdAt: editorialFlags.createdAt,
      writingTitle: writings.title,
    }).from(editorialFlags)
      .leftJoin(writings, eq(editorialFlags.writingId, writings.id))
      .where(eq(editorialFlags.authorId, authorId))
      .orderBy(desc(editorialFlags.createdAt));
    return results.map(r => ({ ...r, writingTitle: r.writingTitle || "Untitled" }));
  }

  // === EDITORS WALK ===
  async getActiveEditorsWalk(): Promise<EditorsWalk | null> {
    const now = new Date();
    const [walk] = await db.select().from(editorsWalks)
      .where(and(
        sql`${editorsWalks.startsAt} <= ${now}`,
        sql`${editorsWalks.endsAt} >= ${now}`,
      ));
    return walk || null;
  }

  async getEditorsWalks(): Promise<EditorsWalk[]> {
    return await db.select().from(editorsWalks).orderBy(desc(editorsWalks.startsAt));
  }

  async createEditorsWalk(editorId: string, data: { title: string; description?: string; startsAt: Date; endsAt: Date; flagLimit?: number }): Promise<EditorsWalk> {
    const [walk] = await db.insert(editorsWalks).values({
      title: data.title,
      description: data.description,
      startsAt: data.startsAt,
      endsAt: data.endsAt,
      flagLimit: data.flagLimit || 3,
      createdById: editorId,
    }).returning();
    return walk;
  }

  // === FIRST READER ===
  async createFirstReaderDrop(authorId: string, data: { content: string; genre?: string }): Promise<FirstReaderDrop> {
    const [drop] = await db.insert(firstReaderDrops).values({ authorId, ...data }).returning();
    return drop;
  }

  async getFirstReaderDrops(genre?: string): Promise<(FirstReaderDrop & { authorName: string | null; responseCount: number })[]> {
    let conditions: any[] = [eq(firstReaderDrops.status, "waiting")];
    if (genre && genre !== "any") conditions.push(eq(firstReaderDrops.genre, genre));

    const results = await db.select({
      id: firstReaderDrops.id,
      authorId: firstReaderDrops.authorId,
      content: firstReaderDrops.content,
      genre: firstReaderDrops.genre,
      status: firstReaderDrops.status,
      createdAt: firstReaderDrops.createdAt,
      authorName: users.firstName,
    }).from(firstReaderDrops)
      .leftJoin(users, eq(firstReaderDrops.authorId, users.id))
      .where(and(...conditions))
      .orderBy(desc(firstReaderDrops.createdAt));

    const enriched: (FirstReaderDrop & { authorName: string | null; responseCount: number })[] = [];
    for (const r of results) {
      const [res] = await db.select({ cnt: count() }).from(firstReaderResponses).where(eq(firstReaderResponses.dropId, r.id));
      enriched.push({ ...r, responseCount: res?.cnt ?? 0 } as any);
    }
    return enriched;
  }

  async getMyFirstReaderDrops(authorId: string): Promise<(FirstReaderDrop & { responses: FirstReaderResponse[] })[]> {
    const drops = await db.select().from(firstReaderDrops)
      .where(eq(firstReaderDrops.authorId, authorId))
      .orderBy(desc(firstReaderDrops.createdAt));

    const enriched: (FirstReaderDrop & { responses: FirstReaderResponse[] })[] = [];
    for (const d of drops) {
      const responses = await db.select().from(firstReaderResponses)
        .where(eq(firstReaderResponses.dropId, d.id))
        .orderBy(desc(firstReaderResponses.createdAt));
      enriched.push({ ...d, responses });
    }
    return enriched;
  }

  async createFirstReaderResponse(readerId: string, data: { dropId: string; aliveSignal: string; strikingLine?: string; oneSuggestion?: string }): Promise<FirstReaderResponse> {
    const [response] = await db.insert(firstReaderResponses).values({ readerId, ...data }).returning();
    return response;
  }

  // === READING SHELF ===
  async getReadingShelf(): Promise<(ReadingShelfEntry & { userName: string | null })[]> {
    return await db.select({
      id: readingShelfEntries.id,
      userId: readingShelfEntries.userId,
      bookTitle: readingShelfEntries.bookTitle,
      author: readingShelfEntries.author,
      reaction: readingShelfEntries.reaction,
      createdAt: readingShelfEntries.createdAt,
      userName: users.firstName,
    }).from(readingShelfEntries)
      .leftJoin(users, eq(readingShelfEntries.userId, users.id))
      .orderBy(desc(readingShelfEntries.createdAt))
      .limit(50) as any;
  }

  async addToReadingShelf(userId: string, data: { bookTitle: string; author?: string; reaction: string }): Promise<ReadingShelfEntry> {
    const [entry] = await db.insert(readingShelfEntries).values({ userId, ...data }).returning();
    return entry;
  }

  async getWriterProfileForEditor(authorId: string): Promise<Writing[]> {
    return await db.select().from(writings).where(eq(writings.authorId, authorId)).orderBy(desc(writings.updatedAt));
  }

  async getEditors(): Promise<{ id: string; firstName: string | null; lastName: string | null }[]> {
    return await db.select({ id: users.id, firstName: users.firstName, lastName: users.lastName }).from(users).where(eq(users.role, "editor"));
  }

  async getAllGreenhouseEntries(): Promise<(GreenhouseEntry & { writingTitle: string; authorName: string | null; authorId: string; editorName: string | null })[]> {
    const results = await db
      .select({
        id: greenhouseEntries.id,
        writingId: greenhouseEntries.writingId,
        editorId: greenhouseEntries.editorId,
        issueId: greenhouseEntries.issueId,
        themeFolder: greenhouseEntries.themeFolder,
        priority: greenhouseEntries.priority,
        internalNote: greenhouseEntries.internalNote,
        stage: greenhouseEntries.stage,
        createdAt: greenhouseEntries.createdAt,
        writingTitle: writings.title,
        authorId: writings.authorId,
        authorName: users.firstName,
        editorName: sql<string | null>`(SELECT first_name FROM users WHERE id = ${greenhouseEntries.editorId})`,
      })
      .from(greenhouseEntries)
      .innerJoin(writings, eq(greenhouseEntries.writingId, writings.id))
      .innerJoin(users, eq(writings.authorId, users.id))
      .orderBy(desc(greenhouseEntries.createdAt));
    return results as any;
  }

  async getEditorsWalkById(id: string): Promise<EditorsWalk | null> {
    const [walk] = await db.select().from(editorsWalks).where(eq(editorsWalks.id, id));
    return walk || null;
  }

  // === STRUGGLE SIGNALS ===
  async getStruggleSignals(): Promise<{ dormantThisWeek: number; movedBackward: number; revisitedSeeds: number }> {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [dormant] = await db.select({ cnt: count() }).from(writings)
      .where(and(eq(writings.readiness, "dormant"), sql`${writings.updatedAt} >= ${oneWeekAgo}`));
    const [seeds] = await db.select({ cnt: count() }).from(writings)
      .where(and(eq(writings.readiness, "raw_seed"), sql`${writings.updatedAt} >= ${oneWeekAgo}`, sql`${writings.createdAt} < ${oneWeekAgo}`));
    return {
      dormantThisWeek: dormant?.cnt ?? 0,
      movedBackward: 0,
      revisitedSeeds: seeds?.cnt ?? 0,
    };
  }

  async getSubmissions(userId: string): Promise<Submission[]> {
    return await db.select().from(submissions).where(eq(submissions.userId, userId)).orderBy(desc(submissions.createdAt));
  }

  async getSubmissionsByWriting(userId: string, writingId: string): Promise<Submission[]> {
    return await db.select().from(submissions).where(and(eq(submissions.userId, userId), eq(submissions.writingId, writingId))).orderBy(desc(submissions.createdAt));
  }

  async createSubmission(userId: string, data: InsertSubmission): Promise<Submission> {
    const [created] = await db.insert(submissions).values({ ...data, userId }).returning();
    return created;
  }

  async updateSubmission(id: string, userId: string, data: Partial<Submission>): Promise<Submission | null> {
    const { id: _id, userId: _uid, createdAt: _ca, ...updateData } = data as any;
    const [updated] = await db.update(submissions).set({ ...updateData, updatedAt: new Date() })
      .where(and(eq(submissions.id, id), eq(submissions.userId, userId))).returning();
    return updated || null;
  }

  async deleteSubmission(id: string, userId: string): Promise<boolean> {
    const result = await db.delete(submissions).where(and(eq(submissions.id, id), eq(submissions.userId, userId))).returning();
    return result.length > 0;
  }

  async getSubmissionStats(userId: string): Promise<{ total: number; pending: number; accepted: number; rejected: number; withdrawn: number }> {
    const rows = await db.select({ status: submissions.status, cnt: count() }).from(submissions)
      .where(eq(submissions.userId, userId)).groupBy(submissions.status);
    const stats = { total: 0, pending: 0, accepted: 0, rejected: 0, withdrawn: 0 };
    for (const row of rows) {
      const c = Number(row.cnt);
      stats.total += c;
      if (row.status === "pending") stats.pending = c;
      else if (row.status === "accepted") stats.accepted = c;
      else if (row.status === "rejected") stats.rejected = c;
      else if (row.status === "withdrawn") stats.withdrawn = c;
    }
    return stats;
  }

  async getPublicationCredits(userId: string): Promise<PublicationCredit[]> {
    return await db.select().from(publicationCredits).where(eq(publicationCredits.userId, userId)).orderBy(desc(publicationCredits.createdAt));
  }

  async createPublicationCredit(userId: string, data: InsertPublicationCredit): Promise<PublicationCredit> {
    const [created] = await db.insert(publicationCredits).values({ ...data, userId }).returning();
    return created;
  }

  async updatePublicationCredit(id: string, userId: string, data: Partial<PublicationCredit>): Promise<PublicationCredit | null> {
    const { id: _id, userId: _uid, createdAt: _ca, ...updateData } = data as any;
    const [updated] = await db.update(publicationCredits).set(updateData)
      .where(and(eq(publicationCredits.id, id), eq(publicationCredits.userId, userId))).returning();
    return updated || null;
  }

  async deletePublicationCredit(id: string, userId: string): Promise<boolean> {
    const result = await db.delete(publicationCredits).where(and(eq(publicationCredits.id, id), eq(publicationCredits.userId, userId))).returning();
    return result.length > 0;
  }

  async getUpcomingReversions(userId: string): Promise<PublicationCredit[]> {
    return await db.select().from(publicationCredits)
      .where(and(
        eq(publicationCredits.userId, userId),
        sql`${publicationCredits.rightsRevertDate} IS NOT NULL`,
        eq(publicationCredits.rightsReverted, false),
        sql`${publicationCredits.rightsRevertDate} > NOW()`
      ))
      .orderBy(asc(publicationCredits.rightsRevertDate));
  }

  async getCoverLetterTemplates(userId: string): Promise<CoverLetterTemplate[]> {
    return await db.select().from(coverLetterTemplates).where(eq(coverLetterTemplates.userId, userId)).orderBy(desc(coverLetterTemplates.createdAt));
  }

  async createCoverLetterTemplate(userId: string, data: { name: string; template: string; isDefault?: boolean }): Promise<CoverLetterTemplate> {
    const [created] = await db.insert(coverLetterTemplates).values({ ...data, userId }).returning();
    return created;
  }

  async updateCoverLetterTemplate(id: string, userId: string, data: Partial<CoverLetterTemplate>): Promise<CoverLetterTemplate | null> {
    const { id: _id, userId: _uid, createdAt: _ca, ...updateData } = data as any;
    const [updated] = await db.update(coverLetterTemplates).set({ ...updateData, updatedAt: new Date() })
      .where(and(eq(coverLetterTemplates.id, id), eq(coverLetterTemplates.userId, userId))).returning();
    return updated || null;
  }

  async deleteCoverLetterTemplate(id: string, userId: string): Promise<boolean> {
    const result = await db.delete(coverLetterTemplates).where(and(eq(coverLetterTemplates.id, id), eq(coverLetterTemplates.userId, userId))).returning();
    return result.length > 0;
  }

  async getWriterBio(userId: string): Promise<WriterBio | null> {
    const [bio] = await db.select().from(writerBios).where(eq(writerBios.userId, userId));
    return bio || null;
  }

  async upsertWriterBio(userId: string, data: Partial<WriterBio>): Promise<WriterBio> {
    const existing = await this.getWriterBio(userId);
    if (existing) {
      const { id: _id, userId: _uid, createdAt: _ca, ...updateData } = data as any;
      const [updated] = await db.update(writerBios).set({ ...updateData, updatedAt: new Date() })
        .where(eq(writerBios.userId, userId)).returning();
      return updated;
    }
    const { id: _id, userId: _uid, createdAt: _ca, updatedAt: _ua, ...insertData } = data as any;
    const [created] = await db.insert(writerBios).values({ ...insertData, userId }).returning();
    return created;
  }

  async getWritingAnalytics(userId: string): Promise<{
    totalPieces: number;
    byStage: Record<string, number>;
    byGenre: Record<string, number>;
    writingFrequency: { month: string; count: number }[];
    avgDaysToReady: number | null;
    dormantPieces: number;
    recentActivity: number;
    acceptanceRate: number | null;
    writingStreak: number;
    longestPiece: { title: string; wordCount: number } | null;
    fastestGrowth: { title: string; days: number } | null;
    totalWordCount: number;
    weeklyGoalProgress: { current: number; target: number } | null;
  }> {
    const [totalRow] = await db.select({ cnt: count() }).from(writings).where(eq(writings.authorId, userId));
    const totalPieces = Number(totalRow?.cnt ?? 0);

    const stageRows = await db.select({ stage: writings.stage, cnt: count() }).from(writings)
      .where(eq(writings.authorId, userId)).groupBy(writings.stage);
    const byStage: Record<string, number> = {};
    for (const r of stageRows) byStage[r.stage] = Number(r.cnt);

    const genreRows = await db.select({ genre: writings.genre, cnt: count() }).from(writings)
      .where(eq(writings.authorId, userId)).groupBy(writings.genre);
    const byGenre: Record<string, number> = {};
    for (const r of genreRows) byGenre[r.genre] = Number(r.cnt);

    const freqRows = await db.execute(
      sql`SELECT to_char(created_at, 'YYYY-MM') as month, COUNT(*)::int as count FROM writings WHERE author_id = ${userId} GROUP BY month ORDER BY month DESC LIMIT 12`
    );
    const writingFrequency = (freqRows.rows as any[]).map((r: any) => ({ month: r.month, count: Number(r.count) }));

    const [avgRow] = await db.execute(
      sql`SELECT AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/86400) as avg_days FROM writings WHERE author_id = ${userId} AND readiness = 'ready_to_show'`
    ).then(r => r.rows as any[]);
    const avgDaysToReady = avgRow?.avg_days ? Number(avgRow.avg_days) : null;

    const [dormantRow] = await db.select({ cnt: count() }).from(writings)
      .where(and(eq(writings.authorId, userId), eq(writings.readiness, "dormant")));
    const dormantPieces = Number(dormantRow?.cnt ?? 0);

    const [recentRow] = await db.select({ cnt: count() }).from(writings)
      .where(and(eq(writings.authorId, userId), sql`${writings.updatedAt} > NOW() - INTERVAL '7 days'`));
    const recentActivity = Number(recentRow?.cnt ?? 0);

    const subStats = await db.execute(
      sql`SELECT 
        COUNT(*) FILTER (WHERE status IN ('accepted', 'rejected')) as completed,
        COUNT(*) FILTER (WHERE status = 'accepted') as accepted
      FROM submissions WHERE user_id = ${userId}`
    );
    const subRow = (subStats.rows as any[])[0];
    const completedSubs = Number(subRow?.completed ?? 0);
    const acceptedSubs = Number(subRow?.accepted ?? 0);
    const acceptanceRate = completedSubs > 0 ? Math.round((acceptedSubs / completedSubs) * 100) : null;

    const streakRows = await db.execute(
      sql`SELECT DISTINCT DATE(updated_at) as d FROM writings WHERE author_id = ${userId} ORDER BY d DESC`
    );
    let writingStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dates = (streakRows.rows as any[]).map((r: any) => {
      const dt = new Date(r.d);
      dt.setHours(0, 0, 0, 0);
      return dt.getTime();
    });
    let checkDate = today.getTime();
    for (const d of dates) {
      if (d === checkDate) {
        writingStreak++;
        checkDate -= 86400000;
      } else if (d < checkDate) {
        break;
      }
    }

    const allWritings = await db.select({
      title: writings.title,
      content: writings.content,
      readiness: writings.readiness,
      createdAt: writings.createdAt,
      updatedAt: writings.updatedAt,
    }).from(writings).where(eq(writings.authorId, userId));

    const stripHtml = (html: string) => html.replace(/<[^>]*>/g, "");
    let longestPiece: { title: string; wordCount: number } | null = null;
    let totalWordCount = 0;
    let fastestGrowth: { title: string; days: number } | null = null;

    for (const w of allWritings) {
      const plainText = stripHtml(w.content || "");
      const wc = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
      totalWordCount += wc;

      if (!longestPiece || wc > longestPiece.wordCount) {
        longestPiece = { title: w.title, wordCount: wc };
      }

      if (w.readiness === "ready_to_show" && w.createdAt && w.updatedAt) {
        const days = Math.max(1, Math.round((new Date(w.updatedAt).getTime() - new Date(w.createdAt).getTime()) / 86400000));
        if (!fastestGrowth || days < fastestGrowth.days) {
          fastestGrowth = { title: w.title, days };
        }
      }
    }

    if (longestPiece && longestPiece.wordCount === 0) longestPiece = null;

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    let weeklyWords = 0;
    for (const w of allWritings) {
      if (w.updatedAt && new Date(w.updatedAt).getTime() >= weekStart.getTime()) {
        const plainText = stripHtml(w.content || "");
        const wc = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
        weeklyWords += wc;
      }
    }
    const weeklyGoalProgress = { current: weeklyWords, target: 5000 };

    return { totalPieces, byStage, byGenre, writingFrequency, avgDaysToReady, dormantPieces, recentActivity, acceptanceRate, writingStreak, longestPiece, fastestGrowth, totalWordCount, weeklyGoalProgress };
  }

  // === COURSES ===
  async getCourses(): Promise<(Course & { lessonCount: number })[]> {
    const allCourses = await db.select().from(courses).where(eq(courses.isPublished, true)).orderBy(asc(courses.sortOrder));
    const result: (Course & { lessonCount: number })[] = [];
    for (const c of allCourses) {
      const [lc] = await db.select({ count: count() }).from(courseLessons).where(eq(courseLessons.courseId, c.id));
      result.push({ ...c, lessonCount: lc?.count ?? 0 });
    }
    return result;
  }

  async getCourse(id: string): Promise<(Course & { lessonCount: number }) | undefined> {
    const [c] = await db.select().from(courses).where(eq(courses.id, id));
    if (!c) return undefined;
    const [lc] = await db.select({ count: count() }).from(courseLessons).where(eq(courseLessons.courseId, c.id));
    return { ...c, lessonCount: lc?.count ?? 0 };
  }

  async getCourseLessons(courseId: string): Promise<CourseLesson[]> {
    return await db.select().from(courseLessons).where(eq(courseLessons.courseId, courseId)).orderBy(asc(courseLessons.sortOrder));
  }

  async getCourseLesson(lessonId: string): Promise<CourseLesson | undefined> {
    const [l] = await db.select().from(courseLessons).where(eq(courseLessons.id, lessonId));
    return l || undefined;
  }

  async hasUserCourseAccess(userId: string, courseId: string): Promise<boolean> {
    const [access] = await db.select().from(userCourseAccess).where(and(eq(userCourseAccess.userId, userId), eq(userCourseAccess.courseId, courseId)));
    return !!access;
  }

  async grantCourseAccess(userId: string, courseId: string, accessType: string = "purchased"): Promise<UserCourseAccess> {
    const existing = await this.hasUserCourseAccess(userId, courseId);
    if (existing) {
      const [a] = await db.select().from(userCourseAccess).where(and(eq(userCourseAccess.userId, userId), eq(userCourseAccess.courseId, courseId)));
      return a;
    }
    const [a] = await db.insert(userCourseAccess).values({ userId, courseId, accessType }).returning();
    return a;
  }

  async getUserCourseAccesses(userId: string): Promise<UserCourseAccess[]> {
    return await db.select().from(userCourseAccess).where(eq(userCourseAccess.userId, userId));
  }

  async markLessonComplete(userId: string, lessonId: string, courseId: string): Promise<LessonProgress> {
    const [existing] = await db.select().from(lessonProgress).where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.lessonId, lessonId)));
    if (existing) return existing;
    const [p] = await db.insert(lessonProgress).values({ userId, lessonId, courseId }).returning();
    return p;
  }

  async unmarkLessonComplete(userId: string, lessonId: string): Promise<boolean> {
    const result = await db.delete(lessonProgress).where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.lessonId, lessonId)));
    return true;
  }

  async getLessonProgress(userId: string, courseId: string): Promise<LessonProgress[]> {
    return await db.select().from(lessonProgress).where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.courseId, courseId)));
  }
}

export const storage = new DatabaseStorage();
