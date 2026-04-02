import { Router } from "express";
import { db } from "../db";
import { eq, desc } from "drizzle-orm";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  next();
}

// GET all idea drops for current user
router.get("/", requireAuth, async (req: any, res: any) => {
  try {
    const results = await db.query.ideaDrops.findMany({
      where: (d: any, { eq: eqOp }: any) => eqOp(d.userId, req.user.id),
      orderBy: (d: any) => [desc(d.createdAt)],
    });
    res.json(results);
  } catch (error: any) {
    console.error("Error fetching idea drops:", error);
    res.status(500).json({ error: "Failed to fetch idea drops" });
  }
});

// GET single idea drop
router.get("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const result = await db.query.ideaDrops.findFirst({
      where: (d: any, { eq: eqOp }: any) => eqOp(d.id, id),
    });
    if (!result) return res.status(404).json({ error: "Idea drop not found" });
    if (result.userId !== req.user.id) return res.status(403).json({ error: "Forbidden" });
    res.json(result);
  } catch (error: any) {
    console.error("Error fetching idea drop:", error);
    res.status(500).json({ error: "Failed to fetch idea drop" });
  }
});

// POST create new idea drop
router.post("/", requireAuth, async (req: any, res: any) => {
  try {
    const { content, status } = req.body;
    if (!content) return res.status(400).json({ error: "Content is required" });
    const schema = await import("@shared/schema");
    const [drop] = await db.insert(schema.ideaDrops).values({
      userId: req.user.id,
      content,
      status: status || "open",
    }).returning();
    res.status(201).json(drop);
  } catch (error: any) {
    console.error("Error creating idea drop:", error);
    res.status(500).json({ error: "Failed to create idea drop" });
  }
});

// PUT update idea drop
router.put("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const existing = await db.query.ideaDrops.findFirst({
      where: (d: any, { eq: eqOp }: any) => eqOp(d.id, id),
    });
    if (!existing) return res.status(404).json({ error: "Idea drop not found" });
    if (existing.userId !== req.user.id) return res.status(403).json({ error: "Forbidden" });
    const { content, status } = req.body;
    const schema = await import("@shared/schema");
    const [updated] = await db.update(schema.ideaDrops)
      .set({ content, status })
      .where(eq(schema.ideaDrops.id, id))
      .returning();
    res.json(updated);
  } catch (error: any) {
    console.error("Error updating idea drop:", error);
    res.status(500).json({ error: "Failed to update idea drop" });
  }
});

// DELETE idea drop
router.delete("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const existing = await db.query.ideaDrops.findFirst({
      where: (d: any, { eq: eqOp }: any) => eqOp(d.id, id),
    });
    if (!existing) return res.status(404).json({ error: "Idea drop not found" });
    if (existing.userId !== req.user.id) return res.status(403).json({ error: "Forbidden" });
    const schema = await import("@shared/schema");
    await db.delete(schema.ideaDrops).where(eq(schema.ideaDrops.id, id));
    res.status(204).send();
  } catch (error: any) {
    console.error("Error deleting idea drop:", error);
    res.status(500).json({ error: "Failed to delete idea drop" });
  }
});

export default router;
