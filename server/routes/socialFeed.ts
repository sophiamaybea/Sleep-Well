import { Router } from "express";
import { db } from "../db";
import { feedEvents, tending, resonances, quietReads, writings, users } from "../../shared/schema";
import { eq, desc, and, inArray } from "drizzle-orm";

const router = Router();

const requireAuth = (req: any, res: any, next: any) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorised" });
  next();
};

// GET feed events for the current user (their circle of tended gardeners)
router.get("/feed", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    // Find everyone this user tends
    const tendedRows = await db.select()
      .from(tending)
      .where(eq(tending.tenderId, userId));
    const tendedIds = tendedRows.map((t: any) => t.gardenerId);

    if (tendedIds.length === 0) {
      return res.json([]);
    }

    // Get feed events where actor is someone they tend, most recent first
    const events = await db.select()
      .from(feedEvents)
      .where(and(
        eq(feedEvents.userId, userId),
        inArray(feedEvents.actorId, tendedIds)
      ))
      .orderBy(desc(feedEvents.createdAt))
      .limit(50);

    return res.json(events);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch feed" });
  }
});

// POST create a feed event (internal — called by other routes after writes)
router.post("/feed/events", requireAuth, async (req, res) => {
  try {
    const { userId, actorId, eventType, writingId, metadata } = req.body;
    if (!userId || !actorId || !eventType)
      return res.status(400).json({ error: "userId, actorId, eventType required" });
    const [row] = await db.insert(feedEvents).values({
      userId,
      actorId,
      eventType,
      writingId: writingId ?? null,
      metadata: metadata ?? {},
    }).returning();
    return res.status(201).json(row);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to create feed event" });
  }
});

// PATCH mark a feed event as read
router.patch("/feed/events/:id/read", requireAuth, async (req, res) => {
  try {
    const [row] = await db.update(feedEvents)
      .set({ isRead: true })
      .where(and(
        eq(feedEvents.id, req.params.id),
        eq(feedEvents.userId, req.user.id)
      ))
      .returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    return res.json(row);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to mark as read" });
  }
});

// PATCH mark all feed events as read
router.patch("/feed/read-all", requireAuth, async (req, res) => {
  try {
    await db.update(feedEvents)
      .set({ isRead: true })
      .where(eq(feedEvents.userId, req.user.id));
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to mark all as read" });
  }
});

// GET unread feed count
router.get("/feed/unread-count", requireAuth, async (req, res) => {
  try {
    const rows = await db.select()
      .from(feedEvents)
      .where(and(
        eq(feedEvents.userId, req.user.id),
        eq(feedEvents.isRead, false)
      ));
    return res.json({ count: rows.length });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch unread count" });
  }
});

export function registerSocialFeedRoutes(app: any) {
  app.use("/api", router);
}
