import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import {
  insertWritingSchema, updateWritingSchema,
  insertReadingQueueSchema, insertSavedPieceSchema, insertPollinationSchema,
  insertRitualSessionSchema, insertCompostSchema, insertGrowthJournalSchema,
  insertInnerWeatherSchema, insertReflectionSchema, insertCircleSchema,
  insertCircleMessageSchema, insertMoonlitReadingSchema, insertRootInfluenceSchema,
  insertResonanceSchema, insertMarginaliaSchema,
} from "@shared/schema";
import { z } from "zod";

const joinMoonlitReadingSchema = z.object({
  writingId: z.string().optional(),
});

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
      const writing = await storage.updateWriting(req.params.id, userId, parsed.data);
      if (!writing) return res.status(404).json({ message: "Writing not found" });
      res.json(writing);
    } catch (error) {
      console.error("Error updating writing:", error);
      res.status(500).json({ message: "Failed to update writing" });
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

  // === GALLERY ===
  app.get("/api/gallery", async (req, res) => {
    try {
      const { q, genre } = req.query;
      if (q) {
        const results = await storage.searchPublishedWritings(q as string, genre as string | undefined);
        return res.json(results);
      }
      const published = await storage.getPublishedWritings();
      res.json(published);
    } catch (error) {
      console.error("Error fetching gallery:", error);
      res.status(500).json({ message: "Failed to fetch gallery" });
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

  // === SUBMISSIONS (READ-ONLY view from replant requests) ===
  app.get("/api/submissions", isAuthenticated, async (req: any, res) => {
    try {
      const items = await storage.getReplantRequests(req.user.claims.sub);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch submissions" });
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

  return httpServer;
}
