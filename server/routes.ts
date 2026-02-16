import type { Express } from "express";
import { createServer, type Server } from "http";
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, BorderStyle } from "docx";
import { randomUUID } from "crypto";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import {
  insertWritingSchema, updateWritingSchema,
  insertReadingQueueSchema, insertSavedPieceSchema, insertPollinationSchema,
  insertRitualSessionSchema, insertCompostSchema, insertGrowthJournalSchema,
  insertInnerWeatherSchema, insertReflectionSchema, insertCircleSchema,
  insertCircleMessageSchema, insertMoonlitReadingSchema, insertRootInfluenceSchema,
  insertResonanceSchema, insertMarginaliaSchema,
  insertTableTopicSchema, insertTableReplySchema,
  insertWorkshopExerciseSchema, insertWorkshopResponseSchema,
  insertSwapRequestSchema, insertSwapFeedbackSchema, insertMicroSwapSchema,
  insertGreenhouseEntrySchema, insertPublishRequestSchema,
  insertRequestMessageSchema, insertIssueSchema, insertIssuePieceSchema,
  insertEditorNoteSchema,
  insertCircleIntentionSchema, insertCircleCelebrationSchema,
  insertRejectionWallSchema, insertOpportunitySchema, insertOpportunityNoteSchema,
  insertPromptPotluckSchema, insertCircleShareSchema, insertIdeaDropSchema,
  insertCircleMicroResponseSchema,
  insertEditorialFlagSchema, insertEditorsWalkSchema,
  insertFirstReaderDropSchema, insertFirstReaderResponseSchema,
  insertReadingShelfSchema,
  courses, courseLessons,
  insertExhibitResponseSchema, insertExhibitReflectionSchema,
} from "@shared/schema";
import { z } from "zod";

const joinMoonlitReadingSchema = z.object({
  writingId: z.string().optional(),
});

const publishRequestResponseSchema = z.object({
  status: z.enum(["accepted", "declined"]),
});

async function isEditor(req: any, res: any, next: any) {
    // Populate req.user from session for non-Replit auth
  if (!req.user?.claims?.sub) {
    const sessionUser = (req.session as any)?.user;
    if (sessionUser) { (req as any).user = sessionUser; }
  }
  if (!req.user?.claims?.sub) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  const editor = await storage.isEditor(req.user.claims.sub);
  if (!editor) {
    return res.status(403).json({ message: "Editor access required" });
  }
  next();
}

async function isEditorInChief(req: any, res: any, next: any) {
    // Populate req.user from session for non-Replit auth
  if (!req.user?.claims?.sub) {
    const sessionUser = (req.session as any)?.user;
    if (sessionUser) { (req as any).user = sessionUser; }
  }
  if (!req.user?.claims?.sub) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  const eic = await storage.isEditorInChief(req.user.claims.sub);
  if (!eic) {
    return res.status(403).json({ message: "Editor-in-Chief access required" });
  }
  next();
}

const replantResponseSchema = z.object({
  status: z.enum(["accepted", "declined"]),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  // === WRITINGS ===
  app.get("/api/writings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const writings = await storage.getWritingsByAuthor(userId);
      res.json(writings);
    } catch (error) {
      console.error("Error fetching writings:", error);
      res.status(500).json({ message: "Failed to fetch writings" });
    }
  });

  app.post("/api/writings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = insertWritingSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid writing data", errors: parsed.error.flatten() });
      const writing = await storage.createWriting(userId, parsed.data);
      res.status(201).json(writing);
    } catch (error) {
      console.error("Error creating writing:", error);
      res.status(500).json({ message: "Failed to create writing" });
    }
  });

  app.patch("/api/writings/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = updateWritingSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid update data", errors: parsed.error.flatten() });

      if (parsed.data.readiness) {
        const current = await storage.getWriting(req.params.id);
        if (current && current.authorId === userId && current.readiness !== parsed.data.readiness) {
          const plainText = current.content.replace(/<[^>]*>/g, "");
          const wc = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
          await storage.createSnapshot({
            writingId: current.id,
            title: current.title,
            content: current.content,
            readiness: current.readiness,
            wordCount: wc,
          });
        }
      }

      const writing = await storage.updateWriting(req.params.id, userId, parsed.data);
      if (!writing) return res.status(404).json({ message: "Writing not found" });
      res.json(writing);
    } catch (error) {
      console.error("Error updating writing:", error);
      res.status(500).json({ message: "Failed to update writing" });
    }
  });

  app.get("/api/writings/:id/snapshots", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const writing = await storage.getWriting(req.params.id);
      if (!writing || writing.authorId !== userId) return res.status(404).json({ message: "Writing not found" });
      const snapshots = await storage.getSnapshots(req.params.id);
      res.json(snapshots);
    } catch (error) {
      console.error("Error fetching snapshots:", error);
      res.status(500).json({ message: "Failed to fetch snapshots" });
    }
  });

  app.delete("/api/writings/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const deleted = await storage.deleteWriting(req.params.id, userId);
      if (!deleted) return res.status(404).json({ message: "Writing not found" });
      res.json({ message: "Writing deleted" });
    } catch (error) {
      console.error("Error deleting writing:", error);
      res.status(500).json({ message: "Failed to delete writing" });
    }
  });

  app.delete("/api/writings/bulk/empty", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const count = await storage.deleteEmptyWritings(userId);
      res.json({ deleted: count });
    } catch (error) {
      console.error("Error cleaning up empty drafts:", error);
      res.status(500).json({ message: "Failed to clean up drafts" });
    }
  });

  // === GALLERY ===
  app.get("/api/gallery", async (req, res) => {
    try {
      const { q, genre } = req.query;
      if (q) {
        const results = await storage.searchPublishedWritings(q as string, genre as string | undefined);
        return res.json(results);
      }
      const published = await storage.getPublishedWritings();
      if (genre && typeof genre === "string") {
        const filtered = published.filter(
          (p: any) => p.genre && p.genre.toLowerCase() === genre.toLowerCase()
        );
        return res.json(filtered);
      }
      res.json(published);
    } catch (error) {
      console.error("Error fetching gallery:", error);
      res.status(500).json({ message: "Failed to fetch gallery" });
    }
  });

  // === DAILY LETTER ===
  app.get("/api/daily-letter", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const letter = await storage.getDailyLetter(userId);
      if (!letter) return res.json(null);
      res.json(letter);
    } catch (error) {
      console.error("Error fetching daily letter:", error);
      res.status(500).json({ message: "Failed to fetch daily letter" });
    }
  });

  // === GARDEN FEED (members-only) ===
  app.get("/api/garden-feed", isAuthenticated, async (req: any, res) => {
    try {
      const { readiness, genre, editorial } = req.query;
      const filters: { readiness?: string; genre?: string; editorialOnly?: boolean } = {};
      if (readiness && readiness !== "all") filters.readiness = readiness as string;
      if (genre && genre !== "all") filters.genre = genre as string;
      if (editorial === "true") filters.editorialOnly = true;
      const feed = await storage.getGardenFeed(filters);
      res.json(feed);
    } catch (error) {
      console.error("Error fetching garden feed:", error);
      res.status(500).json({ message: "Failed to fetch garden feed" });
    }
  });

  // === PROFILE GARDEN ===
  app.get("/api/garden-profile/:userId", isAuthenticated, async (req: any, res) => {
    try {
      const writings = await storage.getProfileGarden(req.params.userId);
      res.json(writings);
    } catch (error) {
      console.error("Error fetching profile garden:", error);
      res.status(500).json({ message: "Failed to fetch profile garden" });
    }
  });

  // === CIRCLE FEED ===
  app.get("/api/circle-feed", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const feed = await storage.getCircleFeed(userId);
      res.json(feed);
    } catch (error) {
      console.error("Error fetching circle feed:", error);
      res.status(500).json({ message: "Failed to fetch circle feed" });
    }
  });

  // === READING QUEUE ===
  app.get("/api/reading-queue", isAuthenticated, async (req: any, res) => {
    try {
      const items = await storage.getReadingQueue(req.user.claims.sub);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reading queue" });
    }
  });

  app.post("/api/reading-queue", isAuthenticated, async (req: any, res) => {
    try {
      const parsed = insertReadingQueueSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
      const item = await storage.addToReadingQueue(req.user.claims.sub, parsed.data.writingId);
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to add to reading queue" });
    }
  });

  app.delete("/api/reading-queue/:id", isAuthenticated, async (req: any, res) => {
    try {
      const deleted = await storage.removeFromReadingQueue(req.user.claims.sub, req.params.id);
      if (!deleted) return res.status(404).json({ message: "Not found" });
      res.json({ message: "Removed" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove" });
    }
  });

  app.patch("/api/reading-queue/:id/read", isAuthenticated, async (req: any, res) => {
    try {
      const item = await storage.markQueueItemRead(req.user.claims.sub, req.params.id);
      if (!item) return res.status(404).json({ message: "Not found" });
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to update" });
    }
  });

  // === SAVED PIECES ===
  app.get("/api/saved", isAuthenticated, async (req: any, res) => {
    try {
      const items = await storage.getSavedPieces(req.user.claims.sub);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch saved pieces" });
    }
  });

  app.post("/api/saved", isAuthenticated, async (req: any, res) => {
    try {
      const parsed = insertSavedPieceSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
      const item = await storage.savePiece(req.user.claims.sub, parsed.data.writingId);
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to save piece" });
    }
  });

  app.delete("/api/saved/:id", isAuthenticated, async (req: any, res) => {
    try {
      const deleted = await storage.unsavePiece(req.user.claims.sub, req.params.id);
      if (!deleted) return res.status(404).json({ message: "Not found" });
      res.json({ message: "Removed" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove" });
    }
  });

  // === POLLINATION ===
  app.get("/api/pollinations/received", isAuthenticated, async (req: any, res) => {
    try {
      const items = await storage.getPollinationsReceived(req.user.claims.sub);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pollinations" });
    }
  });

  app.get("/api/pollinations/:writingId", async (req, res) => {
    try {
      const items = await storage.getPollinationsForWriting(req.params.writingId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pollinations" });
    }
  });

  app.post("/api/pollinations", isAuthenticated, async (req: any, res) => {
    try {
      const parsed = insertPollinationSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
      const item = await storage.createPollination(req.user.claims.sub, { writingId: parsed.data.writingId, affirmation: parsed.data.affirmation, highlightText: parsed.data.highlightText ?? undefined });
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to create pollination" });
    }
  });

  // === PROMPTS & RITUALS ===
  app.get("/api/prompts", async (req, res) => {
    try {
      const { category } = req.query;
      const items = await storage.getPrompts(category as string | undefined);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch prompts" });
    }
  });

  app.get("/api/prompts/random", async (req, res) => {
    try {
      const { category } = req.query;
      const prompt = await storage.getRandomPrompt(category as string | undefined);
      if (!prompt) return res.status(404).json({ message: "No prompts found" });
      res.json(prompt);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch random prompt" });
    }
  });

  app.get("/api/rituals", isAuthenticated, async (req: any, res) => {
    try {
      const items = await storage.getRitualSessions(req.user.claims.sub);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ritual sessions" });
    }
  });

  app.post("/api/rituals", isAuthenticated, async (req: any, res) => {
    try {
      const parsed = insertRitualSessionSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
      const session = await storage.createRitualSession(req.user.claims.sub, { output: parsed.data.output || "", durationMinutes: parsed.data.durationMinutes || 10, promptId: parsed.data.promptId ?? undefined });
      res.status(201).json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to create ritual session" });
    }
  });

  // === COMPOST ===
  app.get("/api/compost", isAuthenticated, async (req: any, res) => {
    try {
      const items = await storage.getCompostEntries(req.user.claims.sub);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch compost" });
    }
  });

  app.post("/api/compost", isAuthenticated, async (req: any, res) => {
    try {
      const parsed = insertCompostSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
      const entry = await storage.createCompostEntry(req.user.claims.sub, { content: parsed.data.content, sourceWritingId: parsed.data.sourceWritingId ?? undefined });
      res.status(201).json(entry);
    } catch (error) {
      res.status(500).json({ message: "Failed to create compost entry" });
    }
  });

  app.patch("/api/compost/:id/recycle", isAuthenticated, async (req: any, res) => {
    try {
      const entry = await storage.recycleCompostEntry(req.user.claims.sub, req.params.id);
      if (!entry) return res.status(404).json({ message: "Not found" });
      res.json(entry);
    } catch (error) {
      res.status(500).json({ message: "Failed to recycle" });
    }
  });

  app.delete("/api/compost/:id", isAuthenticated, async (req: any, res) => {
    try {
      const deleted = await storage.deleteCompostEntry(req.user.claims.sub, req.params.id);
      if (!deleted) return res.status(404).json({ message: "Not found" });
      res.json({ message: "Deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete" });
    }
  });

  // === GROWTH JOURNAL ===
  app.get("/api/growth-journal", isAuthenticated, async (req: any, res) => {
    try {
      const items = await storage.getGrowthJournalEntries(req.user.claims.sub);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch journal entries" });
    }
  });

  app.post("/api/growth-journal", isAuthenticated, async (req: any, res) => {
    try {
      const parsed = insertGrowthJournalSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
      const item = await storage.createGrowthJournalEntry(req.user.claims.sub, { entry: parsed.data.entry, linkedWritingId: parsed.data.linkedWritingId ?? undefined });
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to create journal entry" });
    }
  });

  app.delete("/api/growth-journal/:id", isAuthenticated, async (req: any, res) => {
    try {
      const deleted = await storage.deleteGrowthJournalEntry(req.user.claims.sub, req.params.id);
      if (!deleted) return res.status(404).json({ message: "Not found" });
      res.json({ message: "Deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete" });
    }
  });

  app.get("/api/submissions", isAuthenticated, async (req: any, res) => {
    try {
      const subs = await storage.getSubmissions(req.user.claims.sub);
      res.json(subs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  app.get("/api/submissions/stats", isAuthenticated, async (req: any, res) => {
    try {
      const stats = await storage.getSubmissionStats(req.user.claims.sub);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch submission stats" });
    }
  });

  app.get("/api/submissions/by-writing/:writingId", isAuthenticated, async (req: any, res) => {
    try {
      const subs = await storage.getSubmissionsByWriting(req.user.claims.sub, req.params.writingId);
      res.json(subs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  app.post("/api/submissions", isAuthenticated, async (req: any, res) => {
    try {
      const sub = await storage.createSubmission(req.user.claims.sub, req.body);
      res.json(sub);
    } catch (error) {
      res.status(500).json({ message: "Failed to create submission" });
    }
  });

  app.patch("/api/submissions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const sub = await storage.updateSubmission(req.params.id, req.user.claims.sub, req.body);
      if (!sub) return res.status(404).json({ message: "Submission not found" });
      res.json(sub);
    } catch (error) {
      res.status(500).json({ message: "Failed to update submission" });
    }
  });

  app.delete("/api/submissions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const deleted = await storage.deleteSubmission(req.params.id, req.user.claims.sub);
      if (!deleted) return res.status(404).json({ message: "Submission not found" });
      res.json({ ok: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete submission" });
    }
  });

  app.post("/api/submissions/:id/accept", isAuthenticated, async (req: any, res) => {
    try {
      const sub = await storage.updateSubmission(req.params.id, req.user.claims.sub, {
        status: "accepted",
        respondedAt: new Date(),
      });
      if (!sub) return res.status(404).json({ message: "Submission not found" });
      const otherSubs = sub.writingId
        ? await storage.getSubmissionsByWriting(req.user.claims.sub, sub.writingId)
        : [];
      const pendingElsewhere = otherSubs.filter(s => s.id !== sub.id && s.status === "pending");
      res.json({ submission: sub, pendingElsewhere });
    } catch (error) {
      res.status(500).json({ message: "Failed to accept submission" });
    }
  });

  app.post("/api/submissions/bulk-withdraw", isAuthenticated, async (req: any, res) => {
    try {
      const { submissionIds } = req.body;
      if (!Array.isArray(submissionIds)) return res.status(400).json({ message: "submissionIds array required" });
      const results = await Promise.all(
        submissionIds.map((id: string) =>
          storage.updateSubmission(id, req.user.claims.sub, { status: "withdrawn", respondedAt: new Date() })
        )
      );
      res.json({ updated: results.filter(Boolean).length });
    } catch (error) {
      res.status(500).json({ message: "Failed to bulk withdraw" });
    }
  });

  // === INNER WEATHER ===
  app.get("/api/inner-weather", isAuthenticated, async (req: any, res) => {
    try {
      const items = await storage.getInnerWeatherEntries(req.user.claims.sub);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch weather entries" });
    }
  });

  app.post("/api/inner-weather", isAuthenticated, async (req: any, res) => {
    try {
      const parsed = insertInnerWeatherSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
      const entry = await storage.createInnerWeatherEntry(req.user.claims.sub, { mood: parsed.data.mood, energy: parsed.data.energy ?? 5, note: parsed.data.note ?? undefined });
      res.status(201).json(entry);
    } catch (error) {
      res.status(500).json({ message: "Failed to create weather entry" });
    }
  });

  // === REFLECTIONS ===
  app.get("/api/reflections", isAuthenticated, async (req: any, res) => {
    try {
      const items = await storage.getReflections(req.user.claims.sub);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reflections" });
    }
  });

  app.post("/api/reflections", isAuthenticated, async (req: any, res) => {
    try {
      const parsed = insertReflectionSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
      const entry = await storage.createReflection(req.user.claims.sub, { topic: parsed.data.topic, body: parsed.data.body, linkedWritingId: parsed.data.linkedWritingId ?? undefined });
      res.status(201).json(entry);
    } catch (error) {
      res.status(500).json({ message: "Failed to create reflection" });
    }
  });

  app.delete("/api/reflections/:id", isAuthenticated, async (req: any, res) => {
    try {
      const deleted = await storage.deleteReflection(req.user.claims.sub, req.params.id);
      if (!deleted) return res.status(404).json({ message: "Not found" });
      res.json({ message: "Deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete" });
    }
  });

  // === SEASONAL REVIEW ===
  app.get("/api/seasonal-review", isAuthenticated, async (req: any, res) => {
    try {
      const stats = await storage.getSeasonalStats(req.user.claims.sub);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch seasonal review" });
    }
  });

  // === ROOT SYSTEM ===
  app.get("/api/root-influences", isAuthenticated, async (req: any, res) => {
    try {
      const items = await storage.getRootInfluences(req.user.claims.sub);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch influences" });
    }
  });

  app.post("/api/root-influences", isAuthenticated, async (req: any, res) => {
    try {
      const parsed = insertRootInfluenceSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
      const influence = await storage.createRootInfluence(req.user.claims.sub, { name: parsed.data.name, category: parsed.data.category ?? undefined, note: parsed.data.note ?? undefined });
      res.status(201).json(influence);
    } catch (error) {
      res.status(500).json({ message: "Failed to create influence" });
    }
  });

  app.delete("/api/root-influences/:id", isAuthenticated, async (req: any, res) => {
    try {
      const deleted = await storage.deleteRootInfluence(req.user.claims.sub, req.params.id);
      if (!deleted) return res.status(404).json({ message: "Not found" });
      res.json({ message: "Deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete" });
    }
  });

  // === CIRCLES ===
  app.get("/api/circles", isAuthenticated, async (req: any, res) => {
    try {
      const items = await storage.getCircles(req.user.claims.sub);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch circles" });
    }
  });

  app.post("/api/circles", isAuthenticated, async (req: any, res) => {
    try {
      const parsed = insertCircleSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
      const circle = await storage.createCircle(req.user.claims.sub, parsed.data);
      res.status(201).json(circle);
    } catch (error) {
      res.status(500).json({ message: "Failed to create circle" });
    }
  });

  app.post("/api/circles/:id/join", isAuthenticated, async (req: any, res) => {
    try {
      const circle = await storage.getCircle(req.params.id);
      if (!circle) return res.status(404).json({ message: "Circle not found" });
      const memberCount = await storage.getCircleMemberCount(req.params.id);
      if (memberCount >= circle.maxMembers) {
        return res.status(400).json({ message: "This circle is full" });
      }
      const member = await storage.joinCircle(req.user.claims.sub, req.params.id);
      res.status(201).json(member);
    } catch (error) {
      res.status(500).json({ message: "Failed to join circle" });
    }
  });

  app.delete("/api/circles/:id/leave", isAuthenticated, async (req: any, res) => {
    try {
      const left = await storage.leaveCircle(req.user.claims.sub, req.params.id);
      if (!left) return res.status(404).json({ message: "Not found" });
      res.json({ message: "Left circle" });
    } catch (error) {
      res.status(500).json({ message: "Failed to leave circle" });
    }
  });

  app.get("/api/circles/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const messages = await storage.getCircleMessages(req.params.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/circles/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const parsed = insertCircleMessageSchema.safeParse({ ...req.body, circleId: req.params.id });
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
      const msg = await storage.createCircleMessage(req.user.claims.sub, { circleId: parsed.data.circleId, content: parsed.data.content, writingId: parsed.data.writingId ?? undefined });
      res.status(201).json(msg);
    } catch (error) {
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // === CIRCLE SHARES ===
  app.get("/api/circles/:id/shares", isAuthenticated, async (req: any, res) => {
    try {
      const shares = await storage.getCircleShares(req.params.id);
      res.json(shares);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch shares" });
    }
  });

  app.post("/api/circles/:id/shares", isAuthenticated, async (req: any, res) => {
    try {
      const parsed = insertCircleShareSchema.safeParse({ ...req.body, circleId: req.params.id });
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
      const share = await storage.createCircleShare(req.user.claims.sub, { circleId: parsed.data.circleId, writingId: parsed.data.writingId ?? undefined, weekOf: parsed.data.weekOf });
      res.status(201).json(share);
    } catch (error) {
      res.status(500).json({ message: "Failed to create share" });
    }
  });

  app.get("/api/circles/:id/current-sharer", isAuthenticated, async (req: any, res) => {
    try {
      const sharer = await storage.getCurrentSharer(req.params.id);
      res.json(sharer);
    } catch (error) {
      res.status(500).json({ message: "Failed to get current sharer" });
    }
  });

  app.get("/api/circles/:id/members", isAuthenticated, async (req: any, res) => {
    try {
      const members = await storage.getCircleMembers(req.params.id);
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch members" });
    }
  });

  // === CIRCLE MICRO-PROMPTS ===
  app.get("/api/circles/:id/micro-prompt", isAuthenticated, async (req: any, res) => {
    try {
      const members = await storage.getCircleMembers(req.params.id);
      const isMember = members.some((m: any) => m.userId === req.user.claims.sub);
      if (!isMember) return res.status(403).json({ message: "Not a member of this circle" });
      const prompt = await storage.getCircleWeeklyPrompt(req.params.id);
      res.json(prompt);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch micro-prompt" });
    }
  });

  app.post("/api/circles/:id/micro-prompt/respond", isAuthenticated, async (req: any, res) => {
    try {
      const members = await storage.getCircleMembers(req.params.id);
      const isMember = members.some((m: any) => m.userId === req.user.claims.sub);
      if (!isMember) return res.status(403).json({ message: "Not a member of this circle" });
      const parsed = insertCircleMicroResponseSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
      const response = await storage.respondToCircleMicroPrompt(req.user.claims.sub, parsed.data);
      res.status(201).json(response);
    } catch (error) {
      res.status(500).json({ message: "Failed to submit response" });
    }
  });

  // === MOONLIT READINGS ===
  app.get("/api/moonlit-readings", isAuthenticated, async (req: any, res) => {
    try {
      const items = await storage.getMoonlitReadings();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch readings" });
    }
  });

  app.post("/api/moonlit-readings", isAuthenticated, async (req: any, res) => {
    try {
      const parsed = insertMoonlitReadingSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
      const reading = await storage.createMoonlitReading(req.user.claims.sub, {
        ...parsed.data, scheduledAt: parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : undefined,
      });
      res.status(201).json(reading);
    } catch (error) {
      res.status(500).json({ message: "Failed to create reading" });
    }
  });

  app.post("/api/moonlit-readings/:id/join", isAuthenticated, async (req: any, res) => {
    try {
      const parsed = joinMoonlitReadingSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
      const participant = await storage.joinMoonlitReading(req.user.claims.sub, req.params.id, parsed.data.writingId);
      res.status(201).json(participant);
    } catch (error) {
      res.status(500).json({ message: "Failed to join reading" });
    }
  });

  app.delete("/api/moonlit-readings/:id/leave", isAuthenticated, async (req: any, res) => {
    try {
      const left = await storage.leaveMoonlitReading(req.user.claims.sub, req.params.id);
      if (!left) return res.status(404).json({ message: "Not found" });
      res.json({ message: "Left reading" });
    } catch (error) {
      res.status(500).json({ message: "Failed to leave reading" });
    }
  });

  // === REPLANT REQUESTS ===
  app.get("/api/replant-requests", isAuthenticated, async (req: any, res) => {
    try {
      const items = await storage.getReplantRequests(req.user.claims.sub);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch replant requests" });
    }
  });

  app.patch("/api/replant-requests/:id", isAuthenticated, async (req: any, res) => {
    try {
      const parsed = replantResponseSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
      const request = await storage.respondToReplantRequest(req.user.claims.sub, req.params.id, parsed.data.status);
      if (!request) return res.status(404).json({ message: "Not found" });
      res.json(request);
    } catch (error) {
      res.status(500).json({ message: "Failed to respond" });
    }
  });

  // === TENDING (FOLLOWS) ===
  app.post("/api/tending/:gardenerId", isAuthenticated, async (req: any, res) => {
    try {
      const tenderId = req.user.claims.sub;
      const { gardenerId } = req.params;
      if (tenderId === gardenerId) return res.status(400).json({ message: "Cannot tend your own garden" });
      const result = await storage.tendGarden(tenderId, gardenerId);
      await storage.createNotification(gardenerId, {
        type: "new_tender",
        actorId: tenderId,
        message: "started tending your garden",
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to tend garden" });
    }
  });

  app.delete("/api/tending/:gardenerId", isAuthenticated, async (req: any, res) => {
    try {
      const result = await storage.untendGarden(req.user.claims.sub, req.params.gardenerId);
      if (!result) return res.status(404).json({ message: "Not found" });
      res.json({ message: "Untended garden" });
    } catch (error) {
      res.status(500).json({ message: "Failed to untend" });
    }
  });

  app.get("/api/tending", isAuthenticated, async (req: any, res) => {
    try {
      const gardens = await storage.getTending(req.user.claims.sub);
      res.json(gardens);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tending" });
    }
  });

  app.get("/api/tenders", isAuthenticated, async (req: any, res) => {
    try {
      const tenders = await storage.getTenders(req.user.claims.sub);
      res.json(tenders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tenders" });
    }
  });

  app.get("/api/tending/check/:gardenerId", isAuthenticated, async (req: any, res) => {
    try {
      const isTending = await storage.isTending(req.user.claims.sub, req.params.gardenerId);
      res.json({ isTending });
    } catch (error) {
      res.status(500).json({ message: "Failed to check tending" });
    }
  });

  app.get("/api/tending-feed", isAuthenticated, async (req: any, res) => {
    try {
      const feed = await storage.getTendingFeed(req.user.claims.sub);
      res.json(feed);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tending feed" });
    }
  });

  app.get("/api/tending-count/:userId", isAuthenticated, async (req: any, res) => {
    try {
      const count = await storage.getTendingCount(req.params.userId);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch count" });
    }
  });

  // === RESONANCES (REACTIONS) ===
  app.post("/api/resonances", isAuthenticated, async (req: any, res) => {
    try {
      const { writingId, type } = req.body;
      if (!writingId || !type) return res.status(400).json({ message: "writingId and type are required" });
      const validTypes = ["glow", "pressed_flower", "dewdrop", "firefly", "roots"];
      if (!validTypes.includes(type)) return res.status(400).json({ message: "Invalid resonance type" });
      const writing = await storage.getWriting(writingId);
      if (!writing) return res.status(404).json({ message: "Writing not found" });
      if (writing.authorId === req.user.claims.sub) return res.status(400).json({ message: "Cannot resonate with your own work" });
      const result = await storage.addResonance(req.user.claims.sub, writingId, type);
      const authorId = writing.authorId;
      await storage.createNotification(authorId, {
        type: "resonance",
        actorId: req.user.claims.sub,
        writingId,
        message: `left a ${type.replace("_", " ")} on "${writing.title || "Untitled"}"`,
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to add resonance" });
    }
  });

  app.delete("/api/resonances", isAuthenticated, async (req: any, res) => {
    try {
      const { writingId, type } = req.body;
      if (!writingId || !type) return res.status(400).json({ message: "writingId and type are required" });
      const result = await storage.removeResonance(req.user.claims.sub, writingId, type);
      res.json({ removed: result });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove resonance" });
    }
  });

  app.get("/api/resonances/:writingId", isAuthenticated, async (req: any, res) => {
    try {
      const resonances = await storage.getResonancesForWriting(req.params.writingId);
      const userResonances = await storage.getUserResonances(req.user.claims.sub, req.params.writingId);
      res.json({ resonances, userResonances });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch resonances" });
    }
  });

  // === MARGINALIA (COMMENTS) ===
  app.get("/api/marginalia/:writingId", isAuthenticated, async (req: any, res) => {
    try {
      const items = await storage.getMarginaliaForWriting(req.params.writingId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch marginalia" });
    }
  });

  app.post("/api/marginalia", isAuthenticated, async (req: any, res) => {
    try {
      const { writingId, content, parentId, highlightText } = req.body;
      if (!writingId || !content) return res.status(400).json({ message: "writingId and content are required" });
      const result = await storage.createMarginalia(req.user.claims.sub, { writingId, content, parentId, highlightText });
      const writing = await storage.getWriting(writingId);
      if (writing && writing.authorId !== req.user.claims.sub) {
        await storage.createNotification(writing.authorId, {
          type: "marginalia",
          actorId: req.user.claims.sub,
          writingId,
          message: `left a note on "${writing.title || "Untitled"}"`,
        });
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to create marginalia" });
    }
  });

  app.delete("/api/marginalia/:id", isAuthenticated, async (req: any, res) => {
    try {
      const result = await storage.deleteMarginalia(req.user.claims.sub, req.params.id);
      if (!result) return res.status(404).json({ message: "Not found" });
      res.json({ message: "Deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete" });
    }
  });

  // === NOTIFICATIONS ===
  app.get("/api/notifications", isAuthenticated, async (req: any, res) => {
    try {
      const unreadOnly = req.query.unread === "true";
      const items = await storage.getNotifications(req.user.claims.sub, unreadOnly);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get("/api/notifications/unread-count", isAuthenticated, async (req: any, res) => {
    try {
      const count = await storage.getUnreadNotificationCount(req.user.claims.sub);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch count" });
    }
  });

  app.patch("/api/notifications/:id/read", isAuthenticated, async (req: any, res) => {
    try {
      const result = await storage.markNotificationRead(req.user.claims.sub, req.params.id);
      res.json({ success: result });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark read" });
    }
  });

  app.patch("/api/notifications/read-all", isAuthenticated, async (req: any, res) => {
    try {
      await storage.markAllNotificationsRead(req.user.claims.sub);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark all read" });
    }
  });

  // === TABLES (DISCUSSION THREADS) ===
  app.get("/api/tables", async (req, res) => {
    try {
      const { category } = req.query;
      const topics = await storage.getTableTopics(category as string | undefined);
      res.json(topics);
    } catch (error) {
      console.error("Error fetching table topics:", error);
      res.status(500).json({ message: "Failed to fetch table topics" });
    }
  });

  app.get("/api/tables/:id", async (req, res) => {
    try {
      const topic = await storage.getTableTopic(req.params.id);
      if (!topic) return res.status(404).json({ message: "Topic not found" });
      res.json(topic);
    } catch (error) {
      console.error("Error fetching table topic:", error);
      res.status(500).json({ message: "Failed to fetch table topic" });
    }
  });

  app.post("/api/tables", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = insertTableTopicSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
      const topic = await storage.createTableTopic(userId, parsed.data);
      res.status(201).json(topic);
    } catch (error) {
      console.error("Error creating table topic:", error);
      res.status(500).json({ message: "Failed to create table topic" });
    }
  });

  app.get("/api/tables/:id/replies", async (req, res) => {
    try {
      const replies = await storage.getTableReplies(req.params.id);
      res.json(replies);
    } catch (error) {
      console.error("Error fetching table replies:", error);
      res.status(500).json({ message: "Failed to fetch table replies" });
    }
  });

  app.post("/api/tables/:id/replies", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = insertTableReplySchema.safeParse({ ...req.body, topicId: req.params.id });
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
      const reply = await storage.createTableReply(userId, { topicId: req.params.id, content: parsed.data.content, parentId: parsed.data.parentId ?? undefined });
      res.status(201).json(reply);
    } catch (error) {
      console.error("Error creating table reply:", error);
      res.status(500).json({ message: "Failed to create table reply" });
    }
  });

  // === CAFÉ ===
  app.get("/api/cafe/today", async (req, res) => {
    try {
      const question = await storage.getTodayCafeQuestion();
      res.json(question);
    } catch (error) {
      console.error("Error fetching today's café question:", error);
      res.status(500).json({ message: "Failed to fetch today's question" });
    }
  });

  app.get("/api/cafe/questions/:id/responses", async (req, res) => {
    try {
      const responses = await storage.getCafeResponses(req.params.id);
      res.json(responses);
    } catch (error) {
      console.error("Error fetching café responses:", error);
      res.status(500).json({ message: "Failed to fetch responses" });
    }
  });

  app.post("/api/cafe/questions/:id/responses", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const content = req.body.content?.trim();
      if (!content) return res.status(400).json({ message: "Content is required" });
      const response = await storage.createCafeResponse(userId, { questionId: req.params.id, content });
      res.status(201).json(response);
    } catch (error) {
      console.error("Error creating café response:", error);
      res.status(500).json({ message: "Failed to create response" });
    }
  });

  app.get("/api/cafe/past", async (req, res) => {
    try {
      const questions = await storage.getPastCafeQuestions();
      res.json(questions);
    } catch (error) {
      console.error("Error fetching past café questions:", error);
      res.status(500).json({ message: "Failed to fetch past questions" });
    }
  });

  // === WORKSHOP (EXERCISES & RESPONSES) ===
  app.get("/api/workshop/prompt-of-day", async (req, res) => {
    try {
      const prompt = await storage.getPromptOfDay();
      if (!prompt) return res.status(404).json({ message: "No exercises available" });
      res.json(prompt);
    } catch (error) {
      console.error("Error fetching prompt of the day:", error);
      res.status(500).json({ message: "Failed to fetch prompt of the day" });
    }
  });

  app.get("/api/workshop/exercises/:id/responses", async (req, res) => {
    try {
      const responses = await storage.getWorkshopResponses(req.params.id);
      res.json(responses);
    } catch (error) {
      console.error("Error fetching exercise responses:", error);
      res.status(500).json({ message: "Failed to fetch exercise responses" });
    }
  });

  app.get("/api/workshop", async (req, res) => {
    try {
      const { category } = req.query;
      const exercises = await storage.getWorkshopExercises(category as string | undefined);
      res.json(exercises);
    } catch (error) {
      console.error("Error fetching workshop exercises:", error);
      res.status(500).json({ message: "Failed to fetch workshop exercises" });
    }
  });

  app.post("/api/workshop", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = insertWorkshopExerciseSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
      const exercise = await storage.createWorkshopExercise(userId, { title: parsed.data.title, prompt: parsed.data.prompt, category: parsed.data.category, durationMinutes: parsed.data.durationMinutes ?? undefined });
      res.status(201).json(exercise);
    } catch (error) {
      console.error("Error creating workshop exercise:", error);
      res.status(500).json({ message: "Failed to create workshop exercise" });
    }
  });

  app.get("/api/workshop/:id/responses", async (req, res) => {
    try {
      const responses = await storage.getWorkshopResponses(req.params.id);
      res.json(responses);
    } catch (error) {
      console.error("Error fetching workshop responses:", error);
      res.status(500).json({ message: "Failed to fetch workshop responses" });
    }
  });

  app.post("/api/workshop/:id/responses", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = insertWorkshopResponseSchema.safeParse({ ...req.body, exerciseId: req.params.id });
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
      const response = await storage.createWorkshopResponse(userId, { exerciseId: req.params.id, content: parsed.data.content });
      res.status(201).json(response);
    } catch (error) {
      console.error("Error creating workshop response:", error);
      res.status(500).json({ message: "Failed to create workshop response" });
    }
  });

  // === SWAP (BETA READING EXCHANGE) ===
  app.get("/api/swaps", async (req, res) => {
    try {
      const { status } = req.query;
      const swaps = await storage.getSwapRequests(status as string | undefined);
      res.json(swaps);
    } catch (error) {
      console.error("Error fetching swap requests:", error);
      res.status(500).json({ message: "Failed to fetch swap requests" });
    }
  });

  app.post("/api/swaps", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = insertSwapRequestSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
      const swap = await storage.createSwapRequest(userId, {
        writingId: parsed.data.writingId,
        genre: parsed.data.genre,
        note: parsed.data.note ?? undefined,
        preferredLength: parsed.data.preferredLength ?? undefined,
        feedbackStyle: parsed.data.feedbackStyle ?? undefined,
      });
      res.status(201).json(swap);
    } catch (error) {
      console.error("Error creating swap request:", error);
      res.status(500).json({ message: "Failed to create swap request" });
    }
  });

  app.post("/api/swaps/:id/match", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { writingId } = req.body;
      if (!writingId) return res.status(400).json({ message: "writingId is required" });
      const swap = await storage.matchSwap(req.params.id, userId, writingId);
      if (!swap) return res.status(404).json({ message: "Swap request not found" });
      res.json(swap);
    } catch (error) {
      console.error("Error matching swap:", error);
      res.status(500).json({ message: "Failed to match swap" });
    }
  });

  app.get("/api/swaps/:id/feedback", async (req, res) => {
    try {
      const feedback = await storage.getSwapFeedback(req.params.id);
      res.json(feedback);
    } catch (error) {
      console.error("Error fetching swap feedback:", error);
      res.status(500).json({ message: "Failed to fetch swap feedback" });
    }
  });

  app.post("/api/swaps/:id/feedback", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = insertSwapFeedbackSchema.safeParse({ ...req.body, swapId: req.params.id });
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
      const feedback = await storage.createSwapFeedback(userId, { swapId: parsed.data.swapId, toUserId: parsed.data.toUserId, strengths: parsed.data.strengths, suggestions: parsed.data.suggestions, favoriteLines: parsed.data.favoriteLines ?? undefined });
      res.status(201).json(feedback);
    } catch (error) {
      console.error("Error creating swap feedback:", error);
      res.status(500).json({ message: "Failed to create swap feedback" });
    }
  });

  // === MICRO-SWAP ===
  app.post("/api/micro-swaps", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = insertMicroSwapSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
      const swap = await storage.createMicroSwap(userId, { fragment: parsed.data.fragment, genre: parsed.data.genre ?? undefined });
      res.status(201).json(swap);
    } catch (error) {
      console.error("Error creating micro-swap:", error);
      res.status(500).json({ message: "Failed to create micro-swap" });
    }
  });

  app.get("/api/micro-swaps", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const swaps = await storage.getMyMicroSwaps(userId);
      res.json(swaps);
    } catch (error) {
      console.error("Error fetching micro-swaps:", error);
      res.status(500).json({ message: "Failed to fetch micro-swaps" });
    }
  });

  app.post("/api/micro-swaps/:id/respond", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { response } = req.body;
      if (!response || typeof response !== "string") return res.status(400).json({ message: "Response is required" });
      const swap = await storage.respondToMicroSwap(req.params.id, userId, response);
      if (!swap) return res.status(404).json({ message: "Micro-swap not found" });
      res.json(swap);
    } catch (error) {
      console.error("Error responding to micro-swap:", error);
      res.status(500).json({ message: "Failed to respond to micro-swap" });
    }
  });

  // === WRITER PROFILE ===
  app.get("/api/writer/:id", async (req, res) => {
    try {
      const profile = await storage.getWriterProfile(req.params.id);
      if (!profile) return res.status(404).json({ message: "Writer not found" });
      res.json(profile);
    } catch (error) {
      console.error("Error fetching writer profile:", error);
      res.status(500).json({ message: "Failed to fetch writer profile" });
    }
  });

  app.patch("/api/profile/bio", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { bio } = req.body;
      if (typeof bio !== "string") return res.status(400).json({ message: "bio must be a string" });
      const result = await storage.updateBio(userId, bio);
      res.json(result);
    } catch (error) {
      console.error("Error updating bio:", error);
      res.status(500).json({ message: "Failed to update bio" });
    }
  });

  // === EDITORIAL / PUBLISHING ===
  app.get("/api/editorial/pieces", isAuthenticated, async (req: any, res) => {
    try {
      const pieces = await storage.getEditorialPieces();
      res.json(pieces);
    } catch (error) {
      console.error("Error fetching editorial pieces:", error);
      res.status(500).json({ message: "Failed to fetch editorial pieces" });
    }
  });

  app.post("/api/editorial/publish/:writingId", isAuthenticated, async (req: any, res) => {
    try {
      const result = await storage.publishWritingByEditor(req.params.writingId);
      if (!result) return res.status(404).json({ message: "Writing not found" });
      res.json(result);
    } catch (error) {
      console.error("Error publishing writing:", error);
      res.status(500).json({ message: "Failed to publish writing" });
    }
  });

  // === EDITOR STUDIO ===

  app.get("/api/editor/check", isAuthenticated, async (req: any, res) => {
    try {
      const editorStatus = await storage.isEditor(req.user.claims.sub);
      res.json({ isEditor: editorStatus });
    } catch (error) {
      res.status(500).json({ message: "Failed to check editor status" });
    }
  });

  app.get("/api/editor/overview", isAuthenticated, isEditor, async (req: any, res) => {
    try {
      const overview = await storage.getEditorOverview(req.user.claims.sub);
      res.json(overview);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch editor overview" });
    }
  });

  app.get("/api/editor/garden-stream", isAuthenticated, isEditor, async (req: any, res) => {
    try {
      const { genre, readiness, search, quiet } = req.query;
      const filters: any = {};
      if (genre && genre !== "all") filters.genre = genre;
      if (readiness && readiness !== "all") filters.readiness = readiness;
      if (search) filters.search = search;
      if (quiet === "true") filters.quiet = true;
      const stream = await storage.getEditorGardenStream(filters);
      res.json(stream);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch garden stream" });
    }
  });

  app.get("/api/editor/greenhouse", isAuthenticated, isEditor, async (req: any, res) => {
    try {
      const entries = await storage.getGreenhouseEntries(req.user.claims.sub);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch greenhouse entries" });
    }
  });

  app.post("/api/editor/greenhouse", isAuthenticated, isEditor, async (req: any, res) => {
    try {
      const parsed = insertGreenhouseEntrySchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
      const entry = await storage.addToGreenhouse(req.user.claims.sub, {
        writingId: parsed.data.writingId,
        issueId: parsed.data.issueId ?? undefined,
        themeFolder: parsed.data.themeFolder ?? undefined,
        priority: parsed.data.priority ?? undefined,
        internalNote: parsed.data.internalNote ?? undefined,
      });
      res.status(201).json(entry);
    } catch (error) {
      res.status(500).json({ message: "Failed to add to greenhouse" });
    }
  });

  app.patch("/api/editor/greenhouse/:id", isAuthenticated, isEditor, async (req: any, res) => {
    try {
      const entry = await storage.updateGreenhouseEntry(req.user.claims.sub, req.params.id, req.body);
      if (!entry) return res.status(404).json({ message: "Not found" });
      res.json(entry);
    } catch (error) {
      res.status(500).json({ message: "Failed to update greenhouse entry" });
    }
  });

  app.delete("/api/editor/greenhouse/:id", isAuthenticated, isEditor, async (req: any, res) => {
    try {
      const removed = await storage.removeFromGreenhouse(req.user.claims.sub, req.params.id);
      if (!removed) return res.status(404).json({ message: "Not found" });
      res.json({ message: "Removed from greenhouse" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove from greenhouse" });
    }
  });

  app.get("/api/editor/requests", isAuthenticated, isEditor, async (req: any, res) => {
    try {
      const { status } = req.query;
      const filters: any = { editorId: req.user.claims.sub };
      if (status) filters.status = status;
      const requests = await storage.getPublishRequests(filters);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch publish requests" });
    }
  });

  app.get("/api/author/requests", isAuthenticated, async (req: any, res) => {
    try {
      const requests = await storage.getAuthorPublishRequests(req.user.claims.sub);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch author requests" });
    }
  });

  app.post("/api/editor/requests", isAuthenticated, isEditor, async (req: any, res) => {
    try {
      const parsed = insertPublishRequestSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
      const request = await storage.createPublishRequest(req.user.claims.sub, {
        writingId: parsed.data.writingId,
        authorId: req.body.authorId,
        issueId: parsed.data.issueId ?? undefined,
        editorNote: parsed.data.editorNote ?? undefined,
        proposedDate: parsed.data.proposedDate ?? undefined,
        rightsDuration: parsed.data.rightsDuration ?? undefined,
        payment: parsed.data.payment ?? undefined,
      });
      res.status(201).json(request);
    } catch (error) {
      res.status(500).json({ message: "Failed to create publish request" });
    }
  });

  app.patch("/api/author/requests/:id", isAuthenticated, async (req: any, res) => {
    try {
      const parsed = publishRequestResponseSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
      const request = await storage.respondToPublishRequest(req.user.claims.sub, req.params.id, parsed.data.status);
      if (!request) return res.status(404).json({ message: "Not found" });
      res.json(request);
    } catch (error) {
      res.status(500).json({ message: "Failed to respond to publish request" });
    }
  });

  app.get("/api/editor/requests/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const messages = await storage.getRequestMessages(req.params.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/editor/requests/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const parsed = insertRequestMessageSchema.safeParse({ ...req.body, requestId: req.params.id });
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
      const message = await storage.createRequestMessage(req.user.claims.sub, { requestId: req.params.id, content: parsed.data.content });
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.get("/api/editor/issues", isAuthenticated, isEditor, async (req: any, res) => {
    try {
      const allIssues = await storage.getIssues();
      res.json(allIssues);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch issues" });
    }
  });

  app.get("/api/editor/issues/:id", isAuthenticated, isEditor, async (req: any, res) => {
    try {
      const issue = await storage.getIssue(req.params.id);
      if (!issue) return res.status(404).json({ message: "Issue not found" });
      res.json(issue);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch issue" });
    }
  });

  app.post("/api/editor/issues", isAuthenticated, isEditor, async (req: any, res) => {
    try {
      const parsed = insertIssueSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
      const issue = await storage.createIssue(req.user.claims.sub, {
        title: parsed.data.title,
        subtitle: parsed.data.subtitle ?? undefined,
        themeNote: parsed.data.themeNote ?? undefined,
        publishDate: parsed.data.publishDate ? new Date(parsed.data.publishDate) : undefined,
      });
      res.status(201).json(issue);
    } catch (error) {
      res.status(500).json({ message: "Failed to create issue" });
    }
  });

  app.patch("/api/editor/issues/:id", isAuthenticated, isEditor, async (req: any, res) => {
    try {
      const data: any = { ...req.body };
      if (data.publishDate) data.publishDate = new Date(data.publishDate);
      const issue = await storage.updateIssue(req.params.id, data);
      if (!issue) return res.status(404).json({ message: "Issue not found" });
      res.json(issue);
    } catch (error) {
      res.status(500).json({ message: "Failed to update issue" });
    }
  });

  app.get("/api/editor/issues/:id/pieces", isAuthenticated, isEditor, async (req: any, res) => {
    try {
      const pieces = await storage.getIssuePieces(req.params.id);
      res.json(pieces);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch issue pieces" });
    }
  });

  app.post("/api/editor/issues/:id/pieces", isAuthenticated, isEditor, async (req: any, res) => {
    try {
      const parsed = insertIssuePieceSchema.safeParse({ ...req.body, issueId: req.params.id });
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
      const piece = await storage.addPieceToIssue({
        issueId: req.params.id,
        writingId: parsed.data.writingId,
        sortOrder: parsed.data.sortOrder ?? undefined,
      });
      res.status(201).json(piece);
    } catch (error) {
      res.status(500).json({ message: "Failed to add piece to issue" });
    }
  });

  app.patch("/api/editor/issues/:id/pieces/:pieceId", isAuthenticated, isEditor, async (req: any, res) => {
    try {
      const piece = await storage.updateIssuePiece(req.params.pieceId, req.body);
      if (!piece) return res.status(404).json({ message: "Piece not found" });
      res.json(piece);
    } catch (error) {
      res.status(500).json({ message: "Failed to update piece" });
    }
  });

  app.delete("/api/editor/issues/:id/pieces/:pieceId", isAuthenticated, isEditor, async (req: any, res) => {
    try {
      const removed = await storage.removePieceFromIssue(req.params.pieceId);
      if (!removed) return res.status(404).json({ message: "Piece not found" });
      res.json({ message: "Removed from issue" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove piece" });
    }
  });

  app.post("/api/editor/issues/:id/publish", isAuthenticated, isEditor, async (req: any, res) => {
    try {
      const issue = await storage.publishIssue(req.params.id);
      if (!issue) return res.status(404).json({ message: "Issue not found" });
      res.json(issue);
    } catch (error) {
      res.status(500).json({ message: "Failed to publish issue" });
    }
  });

  app.get("/api/editor/notes/:writingId", isAuthenticated, isEditor, async (req: any, res) => {
    try {
      const notes = await storage.getEditorNotes(req.params.writingId);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch editor notes" });
    }
  });

  app.post("/api/editor/notes", isAuthenticated, isEditor, async (req: any, res) => {
    try {
      const parsed = insertEditorNoteSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
      const note = await storage.createEditorNote(req.user.claims.sub, parsed.data);
      res.status(201).json(note);
    } catch (error) {
      res.status(500).json({ message: "Failed to create editor note" });
    }
  });

  app.delete("/api/editor/notes/:id", isAuthenticated, isEditor, async (req: any, res) => {
    try {
      const deleted = await storage.deleteEditorNote(req.user.claims.sub, req.params.id);
      if (!deleted) return res.status(404).json({ message: "Not found" });
      res.json({ message: "Deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete editor note" });
    }
  });

  app.post("/api/editor/promote", isAuthenticated, isEditor, async (req: any, res) => {
    try {
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ message: "userId is required" });
      await storage.setEditorRole(userId, "editor");
      res.json({ message: "User promoted to editor" });
    } catch (error) {
      res.status(500).json({ message: "Failed to promote user" });
    }
  });

  // === CURATED OPPORTUNITIES ===
  app.get("/api/curated-opportunities", async (req, res) => {
    try {
      const items = await storage.getCuratedOpportunities();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to get curated opportunities" });
    }
  });

  app.post("/api/editor/opportunities", isAuthenticated, isEditor, async (req: any, res) => {
    try {
      const { title, link, outlet, deadline, payRate, genres, notes } = req.body;
      if (!title) return res.status(400).json({ message: "Title is required" });
      const item = await storage.createCuratedOpportunity(req.user.claims.sub, {
        title, link, outlet, deadline, payRate, genres, notes,
      });
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to create curated opportunity" });
    }
  });

  app.delete("/api/editor/opportunities/:id", isAuthenticated, isEditor, async (req: any, res) => {
    try {
      const deleted = await storage.deleteCuratedOpportunity(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Not found" });
      res.json({ message: "Deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete curated opportunity" });
    }
  });

  // === CIRCLE INTENTIONS ===
  app.get("/api/circles/:circleId/intentions", isAuthenticated, async (req: any, res) => {
    try {
      const items = await storage.getCircleIntentions(req.params.circleId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to get intentions" });
    }
  });

  app.post("/api/circles/:circleId/intentions", isAuthenticated, async (req: any, res) => {
    try {
      const parsed = insertCircleIntentionSchema.safeParse({ ...req.body, circleId: req.params.circleId });
      if (!parsed.success) return res.status(400).json({ message: "Invalid data" });
      const item = await storage.createCircleIntention(req.user.claims.sub, parsed.data);
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to create intention" });
    }
  });

  app.delete("/api/circle-intentions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const deleted = await storage.deleteCircleIntention(req.user.claims.sub, req.params.id);
      if (!deleted) return res.status(404).json({ message: "Not found" });
      res.json({ message: "Deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete intention" });
    }
  });

  // === CIRCLE CELEBRATIONS ===
  app.get("/api/circles/:circleId/celebrations", isAuthenticated, async (req: any, res) => {
    try {
      const items = await storage.getCircleCelebrations(req.params.circleId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to get celebrations" });
    }
  });

  app.post("/api/circles/:circleId/celebrations", isAuthenticated, async (req: any, res) => {
    try {
      const parsed = insertCircleCelebrationSchema.safeParse({ ...req.body, circleId: req.params.circleId });
      if (!parsed.success) return res.status(400).json({ message: "Invalid data" });
      const item = await storage.createCircleCelebration(req.user.claims.sub, {
        circleId: parsed.data.circleId,
        type: parsed.data.type,
        message: parsed.data.message ?? undefined,
        value: parsed.data.value ?? undefined,
      });
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to create celebration" });
    }
  });

  // === REJECTION WALL ===
  app.get("/api/rejection-wall", isAuthenticated, async (req: any, res) => {
    try {
      const items = await storage.getRejectionWallEntries();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to get rejection wall entries" });
    }
  });

  app.post("/api/rejection-wall", isAuthenticated, async (req: any, res) => {
    try {
      const parsed = insertRejectionWallSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data" });
      const item = await storage.createRejectionWallEntry(req.user.claims.sub, parsed.data);
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to create rejection wall entry" });
    }
  });

  app.delete("/api/rejection-wall/:id", isAuthenticated, async (req: any, res) => {
    try {
      const deleted = await storage.deleteRejectionWallEntry(req.user.claims.sub, req.params.id);
      if (!deleted) return res.status(404).json({ message: "Not found" });
      res.json({ message: "Deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete rejection wall entry" });
    }
  });

  // === OPPORTUNITIES ===
  app.get("/api/opportunities", isAuthenticated, async (req: any, res) => {
    try {
      const items = await storage.getOpportunities();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to get opportunities" });
    }
  });

  app.post("/api/opportunities", isAuthenticated, async (req: any, res) => {
    try {
      const parsed = insertOpportunitySchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data" });
      const item = await storage.createOpportunity(req.user.claims.sub, {
        title: parsed.data.title,
        link: parsed.data.link ?? undefined,
        outlet: parsed.data.outlet ?? undefined,
        deadline: parsed.data.deadline ?? undefined,
        payRate: parsed.data.payRate ?? undefined,
        responseTime: parsed.data.responseTime ?? undefined,
        vibe: parsed.data.vibe ?? undefined,
        genres: parsed.data.genres ?? undefined,
        notes: parsed.data.notes ?? undefined,
      });
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to create opportunity" });
    }
  });

  app.delete("/api/opportunities/:id", isAuthenticated, async (req: any, res) => {
    try {
      const deleted = await storage.deleteOpportunity(req.user.claims.sub, req.params.id);
      if (!deleted) return res.status(404).json({ message: "Not found" });
      res.json({ message: "Deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete opportunity" });
    }
  });

  app.get("/api/opportunities/:id/notes", isAuthenticated, async (req: any, res) => {
    try {
      const notes = await storage.getOpportunityNotes(req.params.id);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Failed to get notes" });
    }
  });

  app.post("/api/opportunities/:id/notes", isAuthenticated, async (req: any, res) => {
    try {
      const parsed = insertOpportunityNoteSchema.safeParse({ ...req.body, opportunityId: req.params.id });
      if (!parsed.success) return res.status(400).json({ message: "Invalid data" });
      const note = await storage.createOpportunityNote(req.user.claims.sub, parsed.data);
      res.status(201).json(note);
    } catch (error) {
      res.status(500).json({ message: "Failed to create note" });
    }
  });

  // === PROMPT POTLUCK ===
  app.get("/api/circles/:circleId/potluck", isAuthenticated, async (req: any, res) => {
    try {
      const items = await storage.getPromptPotluckItems(req.params.circleId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to get potluck items" });
    }
  });

  app.post("/api/circles/:circleId/potluck", isAuthenticated, async (req: any, res) => {
    try {
      const parsed = insertPromptPotluckSchema.safeParse({ ...req.body, circleId: req.params.circleId });
      if (!parsed.success) return res.status(400).json({ message: "Invalid data" });
      const item = await storage.createPromptPotluckItem(req.user.claims.sub, parsed.data);
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to create potluck item" });
    }
  });

  app.delete("/api/potluck/:id", isAuthenticated, async (req: any, res) => {
    try {
      const deleted = await storage.deletePromptPotluckItem(req.user.claims.sub, req.params.id);
      if (!deleted) return res.status(404).json({ message: "Not found" });
      res.json({ message: "Deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete potluck item" });
    }
  });

  app.get("/api/circles/:circleId/potluck/random", isAuthenticated, async (req: any, res) => {
    try {
      const item = await storage.getRandomPotluckItem(req.params.circleId);
      if (!item) return res.status(404).json({ message: "No items in potluck" });
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to get random potluck item" });
    }
  });

  // === QUIET READS ===
  app.get("/api/quiet-read/:writingId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const hasRead = await storage.hasQuietRead(userId, req.params.writingId);
      res.json({ hasRead });
    } catch (error) {
      res.status(500).json({ message: "Failed to check quiet read" });
    }
  });

  app.post("/api/quiet-read/:writingId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = await storage.addQuietRead(userId, req.params.writingId);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to add quiet read" });
    }
  });

  app.get("/api/writings/:id/whispers", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const writing = await storage.getWriting(req.params.id);
      if (!writing) return res.status(404).json({ message: "Writing not found" });
      if (writing.authorId !== userId) return res.status(403).json({ message: "Not authorized" });
      const whispers = await storage.getQuietReadWhispers(req.params.id);
      res.json(whispers);
    } catch (error) {
      console.error("Error fetching whispers:", error);
      res.status(500).json({ message: "Failed to fetch whispers" });
    }
  });

  app.get("/api/quietly-read/:writingId", isAuthenticated, async (req: any, res) => {
    try {
      const hasBeenRead = await storage.hasBeenQuietlyRead(req.params.writingId);
      res.json({ hasBeenRead });
    } catch (error) {
      res.status(500).json({ message: "Failed to check quiet read status" });
    }
  });

  // === IDEA DROPS ===
  app.get("/api/idea-drops", isAuthenticated, async (req: any, res) => {
    try {
      const items = await storage.getIdeaDrops();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to get idea drops" });
    }
  });

  app.post("/api/idea-drops", isAuthenticated, async (req: any, res) => {
    try {
      const parsed = insertIdeaDropSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data" });
      const item = await storage.createIdeaDrop(req.user.claims.sub, parsed.data);
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to create idea drop" });
    }
  });

  app.post("/api/idea-drops/:id/adopt", isAuthenticated, async (req: any, res) => {
    try {
      const item = await storage.adoptIdeaDrop(req.user.claims.sub, req.params.id);
      if (!item) return res.status(404).json({ message: "Not found or already adopted" });
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to adopt idea drop" });
    }
  });

  app.delete("/api/idea-drops/:id", isAuthenticated, async (req: any, res) => {
    try {
      const deleted = await storage.deleteIdeaDrop(req.user.claims.sub, req.params.id);
      if (!deleted) return res.status(404).json({ message: "Not found" });
      res.json({ message: "Deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete idea drop" });
    }
  });

  app.get("/api/writings/:id/export-docx", isAuthenticated, async (req: any, res) => {
    try {
      const writing = await storage.getWriting(req.params.id);
      if (!writing) return res.status(404).json({ message: "Writing not found" });
      if (writing.authorId !== req.user.claims.sub) return res.status(403).json({ message: "Forbidden" });

      const user = await storage.getUser(req.user.claims.sub);
      const authorName = user?.firstName || "Author";
      const plainContent = (writing.content || "")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
        .trim();
      const words = plainContent.split(/\s+/).filter(Boolean);
      const wordCount = words.length;
      const roundedCount = Math.round(wordCount / 100) * 100 || wordCount;
      const paragraphs = plainContent.split(/\n{2,}/).filter(Boolean);

      const headerParagraphs: Paragraph[] = [
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { after: 0 },
          children: [new TextRun({ text: authorName, font: "Courier New", size: 24 })],
        }),
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { after: 0 },
          children: [new TextRun({ text: `Approx. ${roundedCount} words`, font: "Courier New", size: 24 })],
        }),
        ...Array(4).fill(null).map(() => new Paragraph({ spacing: { after: 0 }, children: [] })),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          children: [new TextRun({ text: writing.title || "Untitled", font: "Courier New", size: 24, bold: false })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          children: [new TextRun({ text: `by ${authorName}`, font: "Courier New", size: 24 })],
        }),
        new Paragraph({ spacing: { after: 0 }, children: [] }),
      ];

      const bodyParagraphs = paragraphs.map((p, i) => new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { line: 480, after: 0 },
        indent: i > 0 ? { firstLine: 720 } : undefined,
        children: [new TextRun({ text: p.replace(/\n/g, " ").trim(), font: "Courier New", size: 24 })],
      }));

      const doc = new Document({
        sections: [{
          properties: {
            page: {
              margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
            },
          },
          children: [...headerParagraphs, ...bodyParagraphs],
        }],
      });

      const buffer = await Packer.toBuffer(doc);
      const filename = (writing.title || "untitled").toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 60);
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}.docx"`);
      res.send(buffer);
    } catch (error) {
      res.status(500).json({ message: "Failed to export" });
    }
  });

  // === PRESENCE ===
  app.post("/api/presence", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.updatePresence(userId);
      res.json({ ok: true });
    } catch (error) {
      console.error("Error updating presence:", error);
      res.status(500).json({ message: "Failed to update presence" });
    }
  });

  app.get("/api/garden-pulse", isAuthenticated, async (req: any, res) => {
    try {
      const activeCount = await storage.getActiveWriterCount();
      const summary = await storage.getGardenSummary();
      res.json({ ...summary, activeWriters: activeCount });
    } catch (error) {
      console.error("Error fetching garden pulse:", error);
      res.status(500).json({ message: "Failed to fetch garden pulse" });
    }
  });

  // === PUBLIC GARDEN ===
  app.get("/api/public-garden/:userId", async (req, res) => {
    try {
      const profile = await storage.getPublicGarden(req.params.userId);
      if (!profile) return res.status(404).json({ message: "Writer not found" });
      res.json(profile);
    } catch (error) {
      console.error("Error fetching public garden:", error);
      res.status(500).json({ message: "Failed to fetch public garden" });
    }
  });

  // === EDITORIAL FLAGS ===
  app.post("/api/editorial-flags", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { writingId } = req.body;
      if (!writingId) return res.status(400).json({ message: "writingId is required" });

      const walk = await storage.getActiveEditorsWalk();
      const flagLimit = walk ? walk.flagLimit : 1;
      const activeCount = await storage.getActiveFlagCount(userId);
      if (activeCount >= flagLimit) {
        return res.status(400).json({ message: walk ? `You can flag up to ${flagLimit} pieces during the Editors Walk` : "You can only flag one piece at a time" });
      }

      const tier = await storage.getUserTier(userId);
      const isPaidFlag = tier === "paid";
      const flag = await storage.createEditorialFlag(userId, writingId, isPaidFlag);
      res.status(201).json(flag);
    } catch (error) {
      console.error("Error creating editorial flag:", error);
      res.status(500).json({ message: "Failed to create flag" });
    }
  });

  app.get("/api/editorial-flags/mine", isAuthenticated, async (req: any, res) => {
    try {
      const flags = await storage.getMyFlags(req.user.claims.sub);
      res.json(flags);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch flags" });
    }
  });

  app.get("/api/editor/flagged-queue", isAuthenticated, isEditor, async (req: any, res) => {
    try {
      const queue = await storage.getFlaggedQueue();
      res.json(queue);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch flagged queue" });
    }
  });

  app.post("/api/editor/flags/:id/seen", isAuthenticated, isEditor, async (req: any, res) => {
    try {
      const flag = await storage.markFlagSeen(req.params.id, req.user.claims.sub);
      if (!flag) return res.status(404).json({ message: "Flag not found" });
      await storage.createNotification(flag.authorId, {
        type: "editor_paused",
        actorId: req.user.claims.sub,
        message: "An editor paused on your piece",
        writingId: flag.writingId,
      });
      res.json(flag);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark flag as seen" });
    }
  });

  app.post("/api/editor/flags/:id/respond", isAuthenticated, isEditor, async (req: any, res) => {
    try {
      const { response } = req.body;
      if (!response || typeof response !== "string") return res.status(400).json({ message: "response is required" });
      const flag = await storage.respondToFlag(req.params.id, req.user.claims.sub, response);
      if (!flag) return res.status(404).json({ message: "Flag not found" });
      await storage.createNotification(flag.authorId, {
        type: "flag_response",
        actorId: req.user.claims.sub,
        message: response,
        writingId: flag.writingId,
      });
      res.json(flag);
    } catch (error) {
      res.status(500).json({ message: "Failed to respond to flag" });
    }
  });

  // === EDITORS WALK ===
  app.get("/api/editors-walk/active", async (req, res) => {
    try {
      const walk = await storage.getActiveEditorsWalk();
      res.json(walk);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active walk" });
    }
  });

  app.get("/api/editors-walk", isAuthenticated, isEditor, async (req: any, res) => {
    try {
      const walks = await storage.getEditorsWalks();
      res.json(walks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch walks" });
    }
  });

  app.post("/api/editors-walk", isAuthenticated, isEditor, async (req: any, res) => {
    try {
      const { title, description, startsAt, endsAt, flagLimit } = req.body;
      if (!title || !startsAt || !endsAt) return res.status(400).json({ message: "title, startsAt, and endsAt are required" });
      const walk = await storage.createEditorsWalk(req.user.claims.sub, {
        title,
        description,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        flagLimit: flagLimit || 3,
      });
      res.status(201).json(walk);
    } catch (error) {
      res.status(500).json({ message: "Failed to create walk" });
    }
  });

  // === TIER MANAGEMENT ===
  app.get("/api/user/tier", isAuthenticated, async (req: any, res) => {
    try {
      const tier = await storage.getUserTier(req.user.claims.sub);
      res.json({ tier });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tier" });
    }
  });

  // === MANUAL SNAPSHOTS ===
  app.post("/api/writings/:id/snapshot", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tier = await storage.getUserTier(userId);
      if (tier !== "paid") return res.status(403).json({ message: "Manual snapshots are a Cultivator feature" });
      const writing = await storage.getWriting(req.params.id);
      if (!writing) return res.status(404).json({ message: "Writing not found" });
      if (writing.authorId !== userId) return res.status(403).json({ message: "Forbidden" });

      const { note } = req.body;
      const wordCount = (writing.content || "").replace(/<[^>]+>/g, "").trim().split(/\s+/).filter(Boolean).length;
      const snapshot = await storage.createSnapshot({
        writingId: writing.id,
        title: writing.title,
        content: writing.content,
        readiness: writing.readiness,
        wordCount,
        snapshotNote: note || undefined,
        isManual: true,
      });
      res.status(201).json(snapshot);
    } catch (error) {
      console.error("Error creating manual snapshot:", error);
      res.status(500).json({ message: "Failed to create snapshot" });
    }
  });

  // === SMART SWAP MATCHING ===
  app.post("/api/swaps/:id/smart-match", isAuthenticated, async (req: any, res) => {
    try {
      const tier = await storage.getUserTier(req.user.claims.sub);
      if (tier !== "paid") return res.status(403).json({ message: "Smart matching is a Cultivator feature" });
      const match = await storage.findSmartSwapMatch(req.params.id);
      if (!match) return res.json({ match: null, message: "No compatible matches found yet" });

      const writing = await storage.getWriting(match.writingId);
      res.json({ match, writingTitle: writing?.title });
    } catch (error) {
      console.error("Error finding smart match:", error);
      res.status(500).json({ message: "Failed to find match" });
    }
  });

  // === FIRST READER ===
  app.post("/api/first-reader", isAuthenticated, async (req: any, res) => {
    try {
      const parsed = insertFirstReaderDropSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data" });
      const drop = await storage.createFirstReaderDrop(req.user.claims.sub, {
        content: parsed.data.content,
        genre: parsed.data.genre ?? undefined,
      });
      res.status(201).json(drop);
    } catch (error) {
      res.status(500).json({ message: "Failed to create drop" });
    }
  });

  app.get("/api/first-reader", isAuthenticated, async (req: any, res) => {
    try {
      const genre = req.query.genre as string | undefined;
      const drops = await storage.getFirstReaderDrops(genre);
      const userId = req.user.claims.sub;
      res.json(drops.filter((d: any) => d.authorId !== userId));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch drops" });
    }
  });

  app.get("/api/first-reader/mine", isAuthenticated, async (req: any, res) => {
    try {
      const drops = await storage.getMyFirstReaderDrops(req.user.claims.sub);
      res.json(drops);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch my drops" });
    }
  });

  app.post("/api/first-reader/:id/respond", isAuthenticated, async (req: any, res) => {
    try {
      const parsed = insertFirstReaderResponseSchema.safeParse({ ...req.body, dropId: req.params.id });
      if (!parsed.success) return res.status(400).json({ message: "Invalid data" });
      const response = await storage.createFirstReaderResponse(req.user.claims.sub, {
        dropId: parsed.data.dropId,
        aliveSignal: parsed.data.aliveSignal,
        strikingLine: parsed.data.strikingLine ?? undefined,
        oneSuggestion: parsed.data.oneSuggestion ?? undefined,
      });
      res.status(201).json(response);
    } catch (error) {
      res.status(500).json({ message: "Failed to respond" });
    }
  });

  // === READING SHELF ===
  app.get("/api/reading-shelf", isAuthenticated, async (req, res) => {
    try {
      const entries = await storage.getReadingShelf();
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reading shelf" });
    }
  });

  app.post("/api/reading-shelf", isAuthenticated, async (req: any, res) => {
    try {
      const parsed = insertReadingShelfSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data" });
      const entry = await storage.addToReadingShelf(req.user.claims.sub, {
        bookTitle: parsed.data.bookTitle,
        author: parsed.data.author ?? undefined,
        reaction: parsed.data.reaction,
      });
      res.status(201).json(entry);
    } catch (error) {
      res.status(500).json({ message: "Failed to add to reading shelf" });
    }
  });

  // === STRUGGLE SIGNALS ===
  app.get("/api/struggle-signals", isAuthenticated, async (req, res) => {
    try {
      const signals = await storage.getStruggleSignals();
      res.json(signals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch signals" });
    }
  });

  app.get("/api/editor/writer-profile/:authorId", isAuthenticated, isEditor, async (req: any, res) => {
    try {
      const writings = await storage.getWriterProfileForEditor(req.params.authorId);
      const user = await storage.getUser(req.params.authorId);
      res.json({ 
        writer: user ? { id: user.id, firstName: user.firstName, lastName: user.lastName, bio: user.bio, profileImageUrl: user.profileImageUrl } : null,
        writings 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch writer profile" });
    }
  });

  app.post("/api/editor/handoff", isAuthenticated, isEditor, async (req: any, res) => {
    try {
      const { writingId, targetEditorId, note } = req.body;
      if (!writingId || !targetEditorId) return res.status(400).json({ message: "writingId and targetEditorId required" });
      await storage.createNotification(targetEditorId, {
        type: "editor_handoff",
        actorId: req.user.claims.sub,
        message: note || "An editor wants you to look at this piece",
        writingId,
      });
      res.json({ ok: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to create handoff" });
    }
  });

  app.get("/api/editor/editors-list", isAuthenticated, isEditor, async (req: any, res) => {
    try {
      const editors = await storage.getEditors();
      res.json(editors.filter((e: any) => e.id !== req.user.claims.sub));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch editors" });
    }
  });

  app.get("/api/editor/greenhouse/all", isAuthenticated, isEditor, async (req: any, res) => {
    try {
      const entries = await storage.getAllGreenhouseEntries();
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch all greenhouse entries" });
    }
  });

  app.get("/api/editors-walk/:id/queue", isAuthenticated, isEditor, async (req: any, res) => {
    try {
      const walk = await storage.getEditorsWalkById(req.params.id);
      if (!walk) return res.status(404).json({ message: "Walk not found" });
      const stream = await storage.getEditorGardenStream({ readiness: "ready_to_show" });
      const flags = await storage.getFlaggedQueue();
      res.json({ walk, stream, flags });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch walk queue" });
    }
  });

  app.get("/api/credits", isAuthenticated, async (req: any, res) => {
    try {
      const credits = await storage.getPublicationCredits(req.user.claims.sub);
      res.json(credits);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch credits" });
    }
  });

  app.get("/api/credits/reversions", isAuthenticated, async (req: any, res) => {
    try {
      const reversions = await storage.getUpcomingReversions(req.user.claims.sub);
      res.json(reversions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reversions" });
    }
  });

  app.post("/api/credits", isAuthenticated, async (req: any, res) => {
    try {
      const credit = await storage.createPublicationCredit(req.user.claims.sub, req.body);
      res.json(credit);
    } catch (error) {
      res.status(500).json({ message: "Failed to create credit" });
    }
  });

  app.patch("/api/credits/:id", isAuthenticated, async (req: any, res) => {
    try {
      const credit = await storage.updatePublicationCredit(req.params.id, req.user.claims.sub, req.body);
      if (!credit) return res.status(404).json({ message: "Credit not found" });
      res.json(credit);
    } catch (error) {
      res.status(500).json({ message: "Failed to update credit" });
    }
  });

  app.delete("/api/credits/:id", isAuthenticated, async (req: any, res) => {
    try {
      const deleted = await storage.deletePublicationCredit(req.params.id, req.user.claims.sub);
      if (!deleted) return res.status(404).json({ message: "Credit not found" });
      res.json({ ok: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete credit" });
    }
  });

  app.get("/api/cover-letters", isAuthenticated, async (req: any, res) => {
    try {
      const templates = await storage.getCoverLetterTemplates(req.user.claims.sub);
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cover letter templates" });
    }
  });

  app.post("/api/cover-letters", isAuthenticated, async (req: any, res) => {
    try {
      const template = await storage.createCoverLetterTemplate(req.user.claims.sub, req.body);
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to create cover letter template" });
    }
  });

  app.patch("/api/cover-letters/:id", isAuthenticated, async (req: any, res) => {
    try {
      const template = await storage.updateCoverLetterTemplate(req.params.id, req.user.claims.sub, req.body);
      if (!template) return res.status(404).json({ message: "Template not found" });
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to update cover letter template" });
    }
  });

  app.delete("/api/cover-letters/:id", isAuthenticated, async (req: any, res) => {
    try {
      const deleted = await storage.deleteCoverLetterTemplate(req.params.id, req.user.claims.sub);
      if (!deleted) return res.status(404).json({ message: "Template not found" });
      res.json({ ok: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete cover letter template" });
    }
  });

  app.get("/api/writer-bio", isAuthenticated, async (req: any, res) => {
    try {
      const bio = await storage.getWriterBio(req.user.claims.sub);
      res.json(bio);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch writer bio" });
    }
  });

  app.put("/api/writer-bio", isAuthenticated, async (req: any, res) => {
    try {
      const bio = await storage.upsertWriterBio(req.user.claims.sub, req.body);
      res.json(bio);
    } catch (error) {
      res.status(500).json({ message: "Failed to update writer bio" });
    }
  });

  app.get("/api/writing-analytics", isAuthenticated, async (req: any, res) => {
    try {
      const analytics = await storage.getWritingAnalytics(req.user.claims.sub);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch writing analytics" });
    }
  });

  // === COURSES ===

  app.get("/api/courses", async (req: any, res) => {
    try {
      const allCourses = await storage.getCourses();
      const userId = req.user?.claims?.sub;
      let accesses: string[] = [];
      let tier = "free";
      if (userId) {
        const userAccesses = await storage.getUserCourseAccesses(userId);
        accesses = userAccesses.map(a => a.courseId);
        tier = await storage.getUserTier(userId);
      }
      const result = allCourses.map(c => ({
        ...c,
        hasAccess: tier === "cultivator" && c.includedInCultivator ? true : accesses.includes(c.id),
        accessReason: tier === "cultivator" && c.includedInCultivator ? "cultivator" : accesses.includes(c.id) ? "purchased" : null,
      }));
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get("/api/courses/:id", async (req: any, res) => {
    try {
      const course = await storage.getCourse(req.params.id);
      if (!course) return res.status(404).json({ message: "Course not found" });
      const lessons = await storage.getCourseLessons(req.params.id);
      const userId = req.user?.claims?.sub;
      let hasAccess = false;
      let accessReason: string | null = null;
      let progress: any[] = [];
      if (userId) {
        const tier = await storage.getUserTier(userId);
        const purchased = await storage.hasUserCourseAccess(userId, course.id);
        hasAccess = (tier === "cultivator" && course.includedInCultivator) || purchased;
        accessReason = tier === "cultivator" && course.includedInCultivator ? "cultivator" : purchased ? "purchased" : null;
        if (hasAccess) {
          progress = await storage.getLessonProgress(userId, course.id);
        }
      }
      res.json({
        ...course,
        hasAccess,
        accessReason,
        lessons: lessons.map(l => ({
          id: l.id,
          title: l.title,
          sortOrder: l.sortOrder,
          hasWritingPrompt: !!l.writingPrompt,
          completed: progress.some(p => p.lessonId === l.id),
        })),
        completedCount: progress.length,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  app.get("/api/courses/:courseId/lessons/:lessonId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const course = await storage.getCourse(req.params.courseId);
      if (!course) return res.status(404).json({ message: "Course not found" });
      const tier = await storage.getUserTier(userId);
      const purchased = await storage.hasUserCourseAccess(userId, course.id);
      const hasAccess = (tier === "cultivator" && course.includedInCultivator) || purchased;
      if (!hasAccess) return res.status(403).json({ message: "You don't have access to this course" });
      const lesson = await storage.getCourseLesson(req.params.lessonId);
      if (!lesson || lesson.courseId !== course.id) return res.status(404).json({ message: "Lesson not found" });
      const progress = await storage.getLessonProgress(userId, course.id);
      const allLessons = await storage.getCourseLessons(course.id);
      const currentIndex = allLessons.findIndex(l => l.id === lesson.id);
      res.json({
        ...lesson,
        completed: progress.some(p => p.lessonId === lesson.id),
        prevLessonId: currentIndex > 0 ? allLessons[currentIndex - 1].id : null,
        nextLessonId: currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1].id : null,
        totalLessons: allLessons.length,
        currentIndex: currentIndex + 1,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lesson" });
    }
  });

  app.post("/api/courses/:courseId/purchase", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const course = await storage.getCourse(req.params.courseId);
      if (!course) return res.status(404).json({ message: "Course not found" });
      const access = await storage.grantCourseAccess(userId, course.id, "purchased");
      res.json({ ok: true, access });
    } catch (error) {
      res.status(500).json({ message: "Failed to purchase course" });
    }
  });

  app.post("/api/courses/:courseId/lessons/:lessonId/complete", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const p = await storage.markLessonComplete(userId, req.params.lessonId, req.params.courseId);
      res.json(p);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark lesson complete" });
    }
  });

  app.delete("/api/courses/:courseId/lessons/:lessonId/complete", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.unmarkLessonComplete(userId, req.params.lessonId);
      res.json({ ok: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to unmark lesson" });
    }
  });

  app.post("/api/courses/seed", async (_req: any, res) => {
    try {
      const existing = await storage.getCourses();
      if (existing.length > 0) return res.json({ message: "Courses already seeded", count: existing.length });

      const { db: dbInst } = await import("./db");

      const [c1] = await dbInst.insert(courses).values({
        title: "The Architecture of a Poem",
        description: "Explore how poems are built from the ground up. This course covers line breaks, stanza structure, rhythm, and how form shapes meaning. Ideal for poets who want to move beyond free verse or deepen their understanding of why poems look and sound the way they do.",
        instructor: "The Page Gallery",
        genre: "poetry",
        price: 12,
        includedInCultivator: true,
        isPublished: true,
        sortOrder: 1,
      }).returning();

      const [c2] = await dbInst.insert(courses).values({
        title: "Writing the Lyric Essay",
        description: "The lyric essay lives at the intersection of poetry and prose. Learn to write essays that privilege image, rhythm, and associative leaps over linear argument. We'll study published examples and practice braiding, fragmentation, and the art of meaningful white space.",
        instructor: "The Page Gallery",
        genre: "essay",
        price: 15,
        includedInCultivator: true,
        isPublished: true,
        sortOrder: 2,
      }).returning();

      const [c3] = await dbInst.insert(courses).values({
        title: "Revision as Discovery",
        description: "Revision isn't just fixing mistakes — it's a creative act. This course teaches you to see revision as a way to discover what your piece is really about. Through practical exercises and a structured revision process, you'll learn to transform rough drafts into polished work.",
        instructor: "The Page Gallery",
        genre: "craft",
        price: 10,
        includedInCultivator: true,
        isPublished: true,
        sortOrder: 3,
      }).returning();

      const poemLessons = [
        { courseId: c1.id, title: "Why Form Matters", content: "<h2>Why Form Matters</h2><p>Every poem has a form, even if that form is \"free.\" In this opening lesson, we explore the relationship between a poem's shape on the page and the experience of reading it.</p><p>Consider how a single word on a line creates emphasis. How a long, breathless sentence without line breaks creates urgency. How white space creates silence.</p><p>Form is not decoration — it is meaning. The way you break a line changes what a reader sees, hears, and feels.</p><h3>Key Concepts</h3><ul><li><strong>Line breaks</strong> control pacing and emphasis</li><li><strong>Stanza breaks</strong> create pauses and shifts</li><li><strong>Visual shape</strong> signals tone before a single word is read</li></ul><p>As you read poems this week, pay attention not just to <em>what</em> they say, but to <em>how they look</em> on the page. That shape is part of the poem's meaning.</p>", writingPrompt: "Take a paragraph you've written recently — any paragraph — and break it into lines. Try three different arrangements. How does each version change the feeling?", sortOrder: 1 },
        { courseId: c1.id, title: "The Line Break as Instrument", content: "<h2>The Line Break as Instrument</h2><p>The line break is the most powerful tool unique to poetry. Prose has sentences and paragraphs. Poetry has <em>lines</em>.</p><p>A line break can:</p><ul><li>Create suspense by splitting a phrase across two lines</li><li>Produce double meanings through enjambment</li><li>Control the reader's breath and rhythm</li><li>Emphasize the last word of a line (the \"end-word\")</li></ul><h3>Enjambment vs. End-Stop</h3><p>An <strong>end-stopped line</strong> completes a thought at the line break: <em>\"The door was closed.\"</em></p><p>An <strong>enjambed line</strong> carries the thought across: <em>\"The door was closed / but not locked.\"</em> Here, \"closed\" lands with finality — then the next line reverses it.</p><p>Master poets use this tension deliberately. Every line break is a tiny decision about meaning.</p>", writingPrompt: "Write a 10-line poem where every line break creates a small surprise or shift in meaning. Read each line alone before reading it with the next.", sortOrder: 2 },
        { courseId: c1.id, title: "Stanza and Breath", content: "<h2>Stanza and Breath</h2><p>The word \"stanza\" comes from the Italian for \"room.\" Each stanza is a room in your poem — a contained space with its own atmosphere.</p><p>Stanza breaks create silence on the page. They tell the reader: pause here. Let what you just read settle.</p><h3>Common Stanza Forms</h3><ul><li><strong>Couplets</strong> (2 lines): Intimate, paired, conversational</li><li><strong>Tercets</strong> (3 lines): Dynamic, restless, forward-moving</li><li><strong>Quatrains</strong> (4 lines): Balanced, stable, traditional</li><li><strong>Irregular stanzas</strong>: Organic, following the poem's natural breath</li></ul><p>There are no rules about which to use. But your choice should be deliberate. A poem in couplets feels different from the same poem in one block — even if the words are identical.</p>", writingPrompt: "Take a poem you've written and restructure it into couplets, then tercets, then one continuous block. Which version serves the poem best? Write a brief note about why.", sortOrder: 3 },
        { courseId: c1.id, title: "Sound and Rhythm", content: "<h2>Sound and Rhythm</h2><p>Poetry is an oral art. Even when read silently, poems activate the reader's inner voice. Sound is not separate from meaning — it <em>is</em> meaning.</p><h3>Tools of Sound</h3><ul><li><strong>Alliteration</strong>: Repeated initial consonants (<em>\"the slow, soft sound\"</em>)</li><li><strong>Assonance</strong>: Repeated vowel sounds (<em>\"the low moan of the old road\"</em>)</li><li><strong>Consonance</strong>: Repeated consonant sounds (<em>\"the click of the clock\"</em>)</li><li><strong>Internal rhyme</strong>: Rhyme within a line, not just at the end</li></ul><p>Rhythm emerges from the interplay of stressed and unstressed syllables. You don't need to write in strict meter, but you should <em>hear</em> the rhythm of your lines.</p><p>Read your poems aloud. Always. Your ear will catch what your eye misses.</p>", writingPrompt: "Write a short poem (8-12 lines) that uses sound as its primary organizing principle. Choose a dominant sound — a vowel or consonant — and let it recur throughout. Don't force rhyme; let the sound guide you.", sortOrder: 4 },
        { courseId: c1.id, title: "Putting It All Together", content: "<h2>Putting It All Together</h2><p>You now have four tools: line breaks, stanza structure, sound, and rhythm. The art of poetry is knowing when and how to use each one.</p><p>Great poems don't use every tool at once. They make choices. A spare, quiet poem might rely on line breaks and white space. A musical poem might prioritize sound and rhythm. A narrative poem might use stanzas like paragraphs.</p><h3>Your Process</h3><ol><li>Write the first draft without worrying about form</li><li>Read it aloud and listen for its natural rhythm</li><li>Experiment with line breaks — where does the poem want to pause?</li><li>Try different stanza structures</li><li>Polish the sounds — remove any that clash with the poem's tone</li></ol><p>Form is not a cage. It is a garden trellis — something for the poem to grow on.</p>", writingPrompt: "Write a poem of 16-20 lines that consciously uses at least three of the tools from this course. After writing, annotate it: mark where you made deliberate choices about line breaks, stanza structure, sound, or rhythm.", sortOrder: 5 },
      ];

      const essayLessons = [
        { courseId: c2.id, title: "What Is a Lyric Essay?", content: "<h2>What Is a Lyric Essay?</h2><p>The lyric essay is a hybrid form — it borrows from poetry's attention to language and image while maintaining prose's capacity for exploration and argument.</p><p>Unlike a traditional essay, the lyric essay doesn't follow a linear path from thesis to evidence to conclusion. Instead, it moves by association, circling its subject, approaching from multiple angles.</p><h3>Characteristics</h3><ul><li>Emphasis on <strong>image</strong> over argument</li><li><strong>White space</strong> as structural element</li><li><strong>Fragmentation</strong> — sections that don't connect obviously but resonate</li><li><strong>Braiding</strong> — weaving multiple threads</li><li>A willingness to <strong>not know</strong> the answer</li></ul><p>The lyric essay trusts the reader to make connections. It is generous in its ambiguity.</p>", writingPrompt: "Write a one-page piece about a place that matters to you. Don't explain why it matters. Instead, describe it in precise, sensory detail. Let the images carry the emotion.", sortOrder: 1 },
        { courseId: c2.id, title: "The Art of Braiding", content: "<h2>The Art of Braiding</h2><p>Braiding is the technique of weaving two or more seemingly unrelated threads through an essay, allowing them to illuminate each other through proximity.</p><p>For example, an essay might alternate between:</p><ul><li>A memory of learning to swim</li><li>Research about the physics of buoyancy</li><li>A meditation on trust</li></ul><p>No thread explains the others. But together, they create a meaning that none could achieve alone.</p><h3>How to Braid</h3><ol><li>Identify 2-3 threads that feel connected to you, even if you can't explain why</li><li>Write each thread separately first</li><li>Cut each thread into fragments</li><li>Arrange the fragments, alternating threads</li><li>Let the juxtapositions create new meaning</li></ol>", writingPrompt: "Choose two subjects that seem unrelated (e.g., your grandmother's kitchen and the migration patterns of birds). Write about each for 10 minutes. Then weave them together, alternating paragraphs. What emerges in the space between them?", sortOrder: 2 },
        { courseId: c2.id, title: "Fragment and White Space", content: "<h2>Fragment and White Space</h2><p>In the lyric essay, what you leave out is as important as what you include. White space — the gaps between sections — is not emptiness. It is silence, breath, invitation.</p><p>Fragmentation is the art of breaking a continuous narrative into pieces and trusting the reader to assemble meaning from the arrangement.</p><h3>Types of Fragmentation</h3><ul><li><strong>Numbered sections</strong>: Creates a sense of accumulation</li><li><strong>Titled sections</strong>: Each fragment becomes a small room</li><li><strong>Untitled breaks</strong>: The most open, most ambiguous</li><li><strong>Single-sentence sections</strong>: Maximum emphasis</li></ul><p>White space asks the reader to participate. It says: <em>something happened here that I cannot or will not say. Fill it with your own understanding.</em></p>", writingPrompt: "Write about a difficult experience in exactly 7 numbered fragments. Each fragment should be no more than 3 sentences. Let the white space between fragments do the emotional work.", sortOrder: 3 },
        { courseId: c2.id, title: "Image as Argument", content: "<h2>Image as Argument</h2><p>In a lyric essay, you don't argue with logic. You argue with images. A precisely rendered image can carry more conviction than any thesis statement.</p><p>This is the poet's gift to the essayist: the understanding that a well-chosen detail can stand for an entire worldview.</p><h3>The Objective Correlative</h3><p>T.S. Eliot called this the \"objective correlative\" — an object or image that evokes a specific emotion without naming it.</p><p>Instead of writing \"I was lonely,\" you write: \"The kitchen table had four chairs but only one placemat.\"</p><p>The image does the work. The reader feels the loneliness without being told to.</p>", writingPrompt: "Write a 500-word essay about an emotion without ever naming the emotion. Use only images, objects, and sensory details. See if a reader can identify the feeling from the images alone.", sortOrder: 4 },
      ];

      const revisionLessons = [
        { courseId: c3.id, title: "Seeing Your Draft Freshly", content: "<h2>Seeing Your Draft Freshly</h2><p>The hardest part of revision is seeing what's actually on the page instead of what you intended to put there. Your brain fills in gaps, smooths over rough transitions, and hears rhythms that aren't there yet.</p><h3>Techniques for Fresh Eyes</h3><ul><li><strong>Time</strong>: Put the draft away for at least 24 hours</li><li><strong>Format change</strong>: Print it, change the font, or read it on your phone</li><li><strong>Read aloud</strong>: Your ear catches what your eye skips</li><li><strong>Read backward</strong>: Start from the last paragraph and work up</li><li><strong>Ask someone else</strong>: A reader who doesn't know your intentions</li></ul><p>Revision begins with honest seeing. Before you can improve a piece, you must understand what it actually is — not what you hoped it would be.</p>", writingPrompt: "Take a piece you wrote at least a week ago. Read it aloud and mark every place where you stumble, pause, or feel uncertain. Those marks are your revision map.", sortOrder: 1 },
        { courseId: c3.id, title: "Finding the Real Subject", content: "<h2>Finding the Real Subject</h2><p>Most first drafts are about finding out what you want to say. The real subject often appears in the last paragraph — the place where you finally arrived at what matters.</p><h3>The Iceberg Principle</h3><p>Hemingway said that if a writer knows something well enough, they can omit it and the reader will still feel it. Your first draft is the research. Your revision is the iceberg — finding what to keep above water and what to submerge.</p><p>Look for:</p><ul><li>The sentence that surprises you</li><li>The image that keeps returning</li><li>The question you're circling but haven't asked directly</li><li>The place where the energy shifts</li></ul><p>Often, the real piece begins where the draft gets uncomfortable or unexpected.</p>", writingPrompt: "Read through a draft and highlight the three sentences that feel most alive, surprising, or true. Now write a new draft that starts from one of those sentences. Let the discovery lead.", sortOrder: 2 },
        { courseId: c3.id, title: "Structural Revision", content: "<h2>Structural Revision</h2><p>Before polishing sentences, look at the larger architecture. Does the piece move in the right direction? Does it earn its ending?</p><h3>Questions for Structure</h3><ul><li>What is the <strong>first line</strong> doing? Does it earn the reader's attention?</li><li>Where does the piece <strong>sag</strong>? Mark any section where your attention drifts</li><li>Is the <strong>ending</strong> where the piece arrives, or where you ran out of things to say?</li><li>Could any section be <strong>cut entirely</strong> without losing meaning?</li><li>What happens if you <strong>rearrange</strong> the sections?</li></ul><p>Be ruthless about cutting. Every word should earn its place. A shorter, tighter piece is almost always stronger than a longer, looser one.</p>", writingPrompt: "Take a piece and outline it — one sentence per paragraph or section. Now rearrange the outline into a different order. Try at least two arrangements. Which one creates the most tension or surprise?", sortOrder: 3 },
        { courseId: c3.id, title: "Sentence-Level Craft", content: "<h2>Sentence-Level Craft</h2><p>Once the structure is solid, turn to the sentences themselves. Good prose is built one sentence at a time.</p><h3>What to Look For</h3><ul><li><strong>Verb strength</strong>: Replace \"was\" + adjective with a specific verb. \"She was angry\" → \"She slammed the door.\"</li><li><strong>Unnecessary words</strong>: Cut \"very,\" \"really,\" \"just,\" \"that\" (when possible)</li><li><strong>Sentence variety</strong>: Mix short and long. A short sentence after a long one creates emphasis.</li><li><strong>Specificity</strong>: \"Bird\" → \"starling.\" \"Tree\" → \"silver birch.\" \"Said\" → sometimes just \"said\" is best.</li><li><strong>Sound</strong>: Read aloud. Does the prose have rhythm?</li></ul><p>Don't edit for style before you've edited for truth. Make it honest first, then make it beautiful.</p>", writingPrompt: "Choose a paragraph from your work and revise it three times: once for verbs (make every verb as specific as possible), once for cuts (remove every unnecessary word), and once for sound (read aloud and adjust for rhythm).", sortOrder: 4 },
      ];

      await dbInst.insert(courseLessons).values([...poemLessons, ...essayLessons, ...revisionLessons]);

      res.json({ message: "Courses seeded successfully", count: 3 });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to seed courses", error: error.message });
    }
  });

  // === COURSE RATINGS ===
  app.get("/api/courses/:courseId/ratings", async (req: any, res) => {
    try {
      const ratings = await storage.getCourseRatings(req.params.courseId);
      const avg = await storage.getCourseAverageRating(req.params.courseId);
      res.json({ ratings, average: avg.average, count: avg.count });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ratings" });
    }
  });

  app.get("/api/courses/:courseId/my-rating", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const rating = await storage.getUserCourseRating(userId, req.params.courseId);
      res.json(rating);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch your rating" });
    }
  });

  app.post("/api/courses/:courseId/ratings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { rating, review } = req.body;
      if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: "Rating must be between 1 and 5" });
      const hasAccess = await storage.hasUserCourseAccess(userId, req.params.courseId);
      const user = await storage.getUser(userId);
      const isCultivator = user?.tier === "cultivator";
      const course = await storage.getCourse(req.params.courseId);
      if (!course) return res.status(404).json({ message: "Course not found" });
      if (!hasAccess && !(isCultivator && course.includedInCultivator)) {
        return res.status(403).json({ message: "You must have access to the course to rate it" });
      }
      const result = await storage.upsertCourseRating(userId, req.params.courseId, rating, review);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to save rating" });
    }
  });

  // === EXERCISE RESPONSES ===
  async function verifyCourseAccess(userId: string, courseId: string, lessonId: string): Promise<{ ok: boolean; message?: string }> {
    const course = await storage.getCourse(courseId);
    if (!course) return { ok: false, message: "Course not found" };
    const lesson = await storage.getCourseLesson(lessonId);
    if (!lesson || lesson.courseId !== courseId) return { ok: false, message: "Lesson not found in this course" };
    const purchased = await storage.hasUserCourseAccess(userId, courseId);
    const user = await storage.getUser(userId);
    const isCultivator = user?.tier === "cultivator";
    if (!purchased && !(isCultivator && course.includedInCultivator)) {
      return { ok: false, message: "You don't have access to this course" };
    }
    return { ok: true };
  }

  app.get("/api/courses/:courseId/lessons/:lessonId/exercise", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const access = await verifyCourseAccess(userId, req.params.courseId, req.params.lessonId);
      if (!access.ok) return res.status(403).json({ message: access.message });
      const response = await storage.getExerciseResponse(userId, req.params.lessonId);
      res.json(response);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercise response" });
    }
  });

  app.post("/api/courses/:courseId/lessons/:lessonId/exercise", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const access = await verifyCourseAccess(userId, req.params.courseId, req.params.lessonId);
      if (!access.ok) return res.status(403).json({ message: access.message });
      const { content } = req.body;
      if (typeof content !== "string") return res.status(400).json({ message: "Content is required" });
      const result = await storage.saveExerciseResponse(userId, req.params.courseId, req.params.lessonId, content);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to save exercise response" });
    }
  });

  app.post("/api/courses/:courseId/lessons/:lessonId/save-to-garden", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const access = await verifyCourseAccess(userId, req.params.courseId, req.params.lessonId);
      if (!access.ok) return res.status(403).json({ message: access.message });
      const { title } = req.body;
      if (!title || typeof title !== "string") return res.status(400).json({ message: "Title is required" });
      const result = await storage.saveExerciseToGarden(userId, req.params.courseId, req.params.lessonId, title);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to save to garden" });
    }
  });

  // === CHALLENGES ===
  app.get("/api/challenges", async (_req, res) => {
    try {
      const allChallenges = await storage.getChallenges();
      const now = new Date();
      const withStatus = allChallenges.map(c => {
        let computedStatus = c.status;
        if (now < c.startsAt) computedStatus = "upcoming";
        else if (now >= c.startsAt && now <= c.endsAt) computedStatus = "open";
        else if (c.votingEndsAt && now > c.endsAt && now <= c.votingEndsAt) computedStatus = "voting";
        else computedStatus = "closed";
        return { ...c, status: computedStatus };
      });
      res.json(withStatus);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/challenges/:id", async (req, res) => {
    try {
      const challenge = await storage.getChallenge(req.params.id);
      if (!challenge) return res.status(404).json({ message: "Challenge not found" });
      const now = new Date();
      let computedStatus = challenge.status;
      if (now < challenge.startsAt) computedStatus = "upcoming";
      else if (now >= challenge.startsAt && now <= challenge.endsAt) computedStatus = "open";
      else if (challenge.votingEndsAt && now > challenge.endsAt && now <= challenge.votingEndsAt) computedStatus = "voting";
      else computedStatus = "closed";
      res.json({ ...challenge, status: computedStatus });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/challenges/:id/entries", async (req, res) => {
    try {
      const entries = await storage.getChallengeEntries(req.params.id);
      res.json(entries);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/challenges/:id/entries", async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });
    try {
      const challenge = await storage.getChallenge(req.params.id);
      if (!challenge) return res.status(404).json({ message: "Challenge not found" });
      const now = new Date();
      if (now < challenge.startsAt || now > challenge.endsAt) {
        return res.status(400).json({ message: "This challenge is not currently accepting entries" });
      }
      const { title, content, writingId } = req.body;
      if (!title || !content) return res.status(400).json({ message: "Title and content are required" });
      if (challenge.wordLimit) {
        const wordCount = content.trim().split(/\s+/).length;
        if (wordCount > challenge.wordLimit) {
          return res.status(400).json({ message: `Entry exceeds word limit of ${challenge.wordLimit} words` });
        }
      }
      const entry = await storage.submitChallengeEntry(req.user.claims.sub, {
        challengeId: req.params.id,
        title,
        content,
        writingId,
      });
      res.json(entry);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/challenges/:id/entries/:entryId", async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });
    try {
      await storage.withdrawChallengeEntry(req.user.claims.sub, req.params.entryId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/challenges/:id/my-entry", async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });
    try {
      const entry = await storage.getUserChallengeEntry(req.user.claims.sub, req.params.id);
      res.json(entry);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/challenges/:id/votes", async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });
    try {
      const challenge = await storage.getChallenge(req.params.id);
      if (!challenge) return res.status(404).json({ message: "Challenge not found" });
      const now = new Date();
      const isVotingOpen = (challenge.votingEndsAt && now > challenge.endsAt && now <= challenge.votingEndsAt) ||
        (now >= challenge.startsAt && now <= challenge.endsAt);
      if (!isVotingOpen) return res.status(400).json({ message: "Voting is not open for this challenge" });
      const { entryId } = req.body;
      if (!entryId) return res.status(400).json({ message: "Entry ID is required" });
      const vote = await storage.voteChallengeEntry(req.user.claims.sub, req.params.id, entryId);
      res.json(vote);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/challenges/:id/votes/:entryId", async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });
    try {
      await storage.unvoteChallengeEntry(req.user.claims.sub, req.params.id, req.params.entryId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/challenges/:id/my-votes", async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });
    try {
      const votes = await storage.getUserChallengeVotes(req.user.claims.sub, req.params.id);
      res.json(votes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // === PAUSE STONES ===
  app.post("/api/writings/:id/pause-stone", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stone = await storage.addPauseStone(req.params.id, userId);
      res.status(201).json(stone);
    } catch (error) {
      console.error("Error adding pause stone:", error);
      res.status(500).json({ message: "Failed to add pause stone" });
    }
  });

  app.get("/api/writings/:id/pause-stones", async (req: any, res) => {
    try {
      const count = await storage.getPauseStoneCount(req.params.id);
      const hasPlaced = req.user?.claims?.sub ? await storage.hasUserPausedStone(req.params.id, req.user.claims.sub) : false;
      res.json({ count, hasPlaced });
    } catch (error) {
      console.error("Error fetching pause stones:", error);
      res.status(500).json({ message: "Failed to fetch pause stones" });
    }
  });

  app.post("/api/writings/pause-stone-counts", async (req, res) => {
    try {
      const { writingIds } = req.body;
      if (!Array.isArray(writingIds)) return res.status(400).json({ message: "writingIds array required" });
      const counts = await storage.getPauseStoneCounts(writingIds);
      res.json(counts);
    } catch (error) {
      console.error("Error fetching pause stone counts:", error);
      res.status(500).json({ message: "Failed to fetch pause stone counts" });
    }
  });

  // === COMPOST ENHANCEMENTS ===
  app.post("/api/writings/:id/compost", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entries = await storage.compostWriting(req.params.id, userId);
      res.json({ fragments: entries.length, entries });
    } catch (error: any) {
      console.error("Error composting writing:", error);
      res.status(400).json({ message: error.message || "Failed to compost writing" });
    }
  });

  app.get("/api/compost/pile", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const pile = await storage.getCompostPile(limit);
      res.json(pile);
    } catch (error) {
      console.error("Error fetching compost pile:", error);
      res.status(500).json({ message: "Failed to fetch compost pile" });
    }
  });

  app.get("/api/compost/stats", async (req, res) => {
    try {
      const stats = await storage.getCompostStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching compost stats:", error);
      res.status(500).json({ message: "Failed to fetch compost stats" });
    }
  });

  app.post("/api/compost/:id/recycle", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entry = await storage.recycleCompostEntry(userId, req.params.id);
      if (!entry) return res.status(404).json({ message: "Not found" });
      res.json(entry);
    } catch (error) {
      console.error("Error recycling compost entry:", error);
      res.status(500).json({ message: "Failed to recycle compost entry" });
    }
  });

  // === GARDEN PRESENCE ===
  app.post("/api/garden/presence", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const zone = req.body.zone || "desk";
      await storage.updatePresenceWithZone(userId, zone);
      res.json({ ok: true });
    } catch (error) {
      console.error("Error updating garden presence:", error);
      res.status(500).json({ message: "Failed to update presence" });
    }
  });

  app.get("/api/garden/presence", async (req, res) => {
    try {
      const total = await storage.getActivePresence();
      const byZone = await storage.getActivePresenceByZone();
      res.json({ total, byZone });
    } catch (error) {
      console.error("Error fetching garden presence:", error);
      res.status(500).json({ message: "Failed to fetch presence" });
    }
  });

  // === GARDEN SEASONS ===
  app.get("/api/garden/season", async (req, res) => {
    try {
      const season = await storage.getCurrentSeason();
      res.json(season);
    } catch (error) {
      console.error("Error fetching current season:", error);
      res.status(500).json({ message: "Failed to fetch current season" });
    }
  });

  // === LIVE PROMPT COUNTS ===
  app.get("/api/community/live-counts", async (req, res) => {
    try {
      const counts = await storage.getLivePromptCounts();
      res.json(counts);
    } catch (error) {
      console.error("Error fetching live counts:", error);
      res.status(500).json({ message: "Failed to fetch live counts" });
    }
  });

  // === EDITOR-IN-CHIEF (EIC) ===
  app.post("/api/eic/invite-editor", isEditorInChief, async (req: any, res) => {
    try {
      const { email } = req.body;
      if (!email || typeof email !== "string") return res.status(400).json({ message: "Email is required" });
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) return res.status(400).json({ message: "Please enter a valid email address" });
      const existing = await storage.getEditorInvitations();
      const duplicate = existing.find((inv) => inv.email === email.trim() && inv.status === "pending" && new Date(inv.expiresAt) > new Date());
      if (duplicate) return res.status(400).json({ message: "An active invitation already exists for this email" });
      const token = randomUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const invitation = await storage.createEditorInvitation({
        email: email.trim(),
        token,
        invitedBy: req.user.claims.sub,
        expiresAt,
      });
      res.json(invitation);
    } catch (error) {
      console.error("Error creating editor invitation:", error);
      res.status(500).json({ message: "Failed to create invitation" });
    }
  });

  app.get("/api/eic/invitations", isEditorInChief, async (req: any, res) => {
    try {
      const invitations = await storage.getEditorInvitations();
      res.json(invitations);
    } catch (error) {
      console.error("Error fetching invitations:", error);
      res.status(500).json({ message: "Failed to fetch invitations" });
    }
  });

  app.get("/api/eic/editors", isEditorInChief, async (req: any, res) => {
    try {
      const editors = await storage.getEditors();
      res.json(editors);
    } catch (error) {
      console.error("Error fetching editors:", error);
      res.status(500).json({ message: "Failed to fetch editors" });
    }
  });

  app.get("/api/editor-onboarding/validate", async (req, res) => {
    try {
      const token = req.query.token as string;
      if (!token) return res.status(400).json({ message: "Token is required" });
      const invitation = await storage.getEditorInvitationByToken(token);
      if (!invitation) return res.json({ valid: false, reason: "Invalid invitation token" });
      if (invitation.status === "accepted") return res.json({ valid: false, reason: "This invitation has already been used" });
      if (new Date() > invitation.expiresAt) return res.json({ valid: false, reason: "This invitation has expired" });
      res.json({ valid: true, email: invitation.email });
    } catch (error) {
      console.error("Error validating token:", error);
      res.status(500).json({ message: "Failed to validate token" });
    }
  });

  app.post("/api/editor-onboarding/accept", isAuthenticated, async (req: any, res) => {
    try {
      const { token } = req.body;
      if (!token) return res.status(400).json({ message: "Token is required" });
      const invitation = await storage.getEditorInvitationByToken(token);
      if (!invitation) return res.status(404).json({ message: "Invalid invitation token" });
      if (invitation.status === "accepted") return res.status(400).json({ message: "This invitation has already been used" });
      if (new Date() > invitation.expiresAt) return res.status(400).json({ message: "This invitation has expired" });
      const userId = req.user.claims.sub;
      await storage.acceptEditorInvitation(token, userId);
      res.json({ success: true, message: "Welcome to the Editorial Studio!" });
    } catch (error) {
      console.error("Error accepting invitation:", error);
      res.status(500).json({ message: "Failed to accept invitation" });
    }
  });

  // === EXHIBITS ===
  app.get("/api/exhibits", async (req: any, res) => {
    try {
      const allExhibits = await storage.getExhibits();
      const userId = req.user?.claims?.sub;
      if (userId) {
        const withStatus = await Promise.all(allExhibits.map(async (exhibit) => {
          const purchased = await storage.hasExhibitPurchase(userId, exhibit.id);
          const progress = await storage.getExhibitProgress(userId, exhibit.id);
          let status: "locked" | "available" | "in_progress" | "completed" = exhibit.price > 0 && !purchased ? "locked" : "available";
          if (progress) {
            status = progress.completedAt ? "completed" : "in_progress";
          }
          return { ...exhibit, purchased, status, currentScreen: progress?.currentScreen || null };
        }));
        return res.json(withStatus);
      }
      res.json(allExhibits.map(e => ({ ...e, purchased: false, status: e.price > 0 ? "locked" : "available", currentScreen: null })));
    } catch (error) {
      console.error("Error fetching exhibits:", error);
      res.status(500).json({ message: "Failed to fetch exhibits" });
    }
  });

  app.get("/api/exhibits/:slug", async (req: any, res) => {
    try {
      const exhibit = await storage.getExhibitBySlug(req.params.slug);
      if (!exhibit || !exhibit.isPublished) return res.status(404).json({ message: "Exhibit not found" });
      const userId = req.user?.claims?.sub;
      const purchased = userId ? await storage.hasExhibitPurchase(userId, exhibit.id) : false;
      res.json({ ...exhibit, purchased });
    } catch (error) {
      console.error("Error fetching exhibit:", error);
      res.status(500).json({ message: "Failed to fetch exhibit" });
    }
  });

  app.post("/api/exhibits/:slug/purchase", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const exhibit = await storage.getExhibitBySlug(req.params.slug);
      if (!exhibit) return res.status(404).json({ message: "Exhibit not found" });
      const alreadyPurchased = await storage.hasExhibitPurchase(userId, exhibit.id);
      if (alreadyPurchased) return res.json({ message: "Already purchased", purchased: true });
      const purchase = await storage.createExhibitPurchase(userId, exhibit.id);
      res.status(201).json(purchase);
    } catch (error) {
      console.error("Error purchasing exhibit:", error);
      res.status(500).json({ message: "Failed to purchase exhibit" });
    }
  });

  app.get("/api/exhibits/:slug/progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const exhibit = await storage.getExhibitBySlug(req.params.slug);
      if (!exhibit || !exhibit.isPublished) return res.status(404).json({ message: "Exhibit not found" });
      if (exhibit.price > 0) {
        const purchased = await storage.hasExhibitPurchase(userId, exhibit.id);
        if (!purchased) return res.status(403).json({ message: "Purchase required" });
      }
      const progress = await storage.getExhibitProgress(userId, exhibit.id);
      res.json(progress || { currentScreen: 1, completedExercises: [], completedAt: null });
    } catch (error) {
      console.error("Error fetching exhibit progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  app.post("/api/exhibits/:slug/progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const exhibit = await storage.getExhibitBySlug(req.params.slug);
      if (!exhibit || !exhibit.isPublished) return res.status(404).json({ message: "Exhibit not found" });
      if (exhibit.price > 0) {
        const purchased = await storage.hasExhibitPurchase(userId, exhibit.id);
        if (!purchased) return res.status(403).json({ message: "Purchase required" });
      }
      const { currentScreen, completedExercises, completedAt } = req.body;
      const progressSchema = z.object({
        currentScreen: z.number().int().min(1).optional(),
        completedExercises: z.array(z.string()).optional(),
        completedAt: z.string().nullable().optional(),
      });
      const parsed = progressSchema.safeParse({ currentScreen, completedExercises, completedAt });
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
      const progress = await storage.upsertExhibitProgress(userId, exhibit.id, {
        currentScreen: parsed.data.currentScreen,
        completedExercises: parsed.data.completedExercises,
        completedAt: parsed.data.completedAt ? new Date(parsed.data.completedAt) : undefined,
      });
      res.json(progress);
    } catch (error) {
      console.error("Error updating exhibit progress:", error);
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  app.post("/api/exhibits/:slug/responses", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const exhibit = await storage.getExhibitBySlug(req.params.slug);
      if (!exhibit || !exhibit.isPublished) return res.status(404).json({ message: "Exhibit not found" });
      if (exhibit.price > 0) {
        const purchased = await storage.hasExhibitPurchase(userId, exhibit.id);
        if (!purchased) return res.status(403).json({ message: "Purchase required" });
      }
      const parsed = insertExhibitResponseSchema.safeParse({ ...req.body, exhibitId: exhibit.id });
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
      const response = await storage.saveExhibitResponse(userId, parsed.data);
      res.status(201).json(response);
    } catch (error) {
      console.error("Error saving exhibit response:", error);
      res.status(500).json({ message: "Failed to save response" });
    }
  });

  app.get("/api/exhibits/:slug/responses", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const exhibit = await storage.getExhibitBySlug(req.params.slug);
      if (!exhibit || !exhibit.isPublished) return res.status(404).json({ message: "Exhibit not found" });
      const responses = await storage.getExhibitResponses(userId, exhibit.id);
      res.json(responses);
    } catch (error) {
      console.error("Error fetching exhibit responses:", error);
      res.status(500).json({ message: "Failed to fetch responses" });
    }
  });

  app.post("/api/exhibits/:slug/reflections", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const exhibit = await storage.getExhibitBySlug(req.params.slug);
      if (!exhibit || !exhibit.isPublished) return res.status(404).json({ message: "Exhibit not found" });
      if (exhibit.price > 0) {
        const purchased = await storage.hasExhibitPurchase(userId, exhibit.id);
        if (!purchased) return res.status(403).json({ message: "Purchase required" });
      }
      const parsed = insertExhibitReflectionSchema.safeParse({ ...req.body, exhibitId: exhibit.id });
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
      const reflection = await storage.saveExhibitReflection(userId, parsed.data);
      res.status(201).json(reflection);
    } catch (error) {
      console.error("Error saving exhibit reflection:", error);
      res.status(500).json({ message: "Failed to save reflection" });
    }
  });

  app.get("/api/user/role", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json({ role: user.role, tier: user.tier });
    } catch (error) {
      console.error("Error fetching user role:", error);
      res.status(500).json({ message: "Failed to fetch user role" });
    }
  });

  return httpServer;
}
