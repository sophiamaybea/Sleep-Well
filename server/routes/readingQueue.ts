import { Router } from "express";
import { db } from "../db";
import { eq, desc } from "drizzle-orm";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  next();
}

// GET reading queue for current user
router.get("/", requireAuth, async (req: any, res: any) => {
  try {
    const results = await db.query.readingQueue.findMany({
      where: (r: any, { eq: eqOp }: any) => eqOp(r.userId, req.user.id),
      orderBy: (r: any) => [desc(r.addedAt)],
    });
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch reading queue" });
  }
});

// POST add to reading queue
router.post("/", requireAuth, async (req: any, res: any) => {
  try {
    const { writingId, priority, notes } = req.body;
    if (!writingId) return res.status(400).json({ error: "writingId required" });
    const schema = await import("@shared/schema");
    const [item] = await db.insert(schema.readingQueue).values({
      userId: req.user.id,
      writingId,
      priority: priority || "normal",
      notes: notes || "",
      isRead: false,
    }).returning();
    res.status(201).json(item);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to add to reading queue" });
  }
});

// PUT mark as read / update
router.put("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const existing = await db.query.readingQueue.findFirst({
      where: (r: any, { eq: eqOp }: any) => eqOp(r.id, id),
    });
    if (!existing) return res.status(404).json({ error: "Item not found" });
    if (existing.userId !== req.user.id) return res.status(403).json({ error: "Forbidden" });
    const { isRead, priority, notes } = req.body;
    const schema = await import("@shared/schema");
    const [updated] = await db.update(schema.readingQueue)
      .set({ isRead, priority, notes, updatedAt: new Date() })
      .where(eq(schema.readingQueue.id, id))
      .returning();
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update reading queue item" });
  }
});

// DELETE from reading queue
router.delete("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const existing = await db.query.readingQueue.findFirst({
      where: (r: any, { eq: eqOp }: any) => eqOp(r.id, id),
    });
    if (!existing) return res.status(404).json({ error: "Item not found" });
    if (existing.userId !== req.user.id) return res.status(403).json({ error: "Forbidden" });
    const schema = await import("@shared/schema");
    await db.delete(schema.readingQueue).where(eq(schema.readingQueue.id, id));
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: "Failed to remove from reading queue" });
  }
});

export default router;
