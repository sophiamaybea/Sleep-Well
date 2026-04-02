import { Router } from "express";
import { db } from "../db";
import { eq, desc } from "drizzle-orm";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  next();
}

// GET all cross-pollinations for current user
router.get("/", requireAuth, async (req: any, res: any) => {
  try {
    const results = await db.query.pollinations.findMany({
      where: (p: any, { eq: eqOp }: any) => eqOp(p.userId, req.user.id),
      orderBy: (p: any) => [desc(p.createdAt)],
    });
    res.json(results);
  } catch (error: any) {
    console.error("Error fetching pollinations:", error);
    res.status(500).json({ error: "Failed to fetch pollinations" });
  }
});

// GET single pollination
router.get("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const result = await db.query.pollinations.findFirst({
      where: (p: any, { eq: eqOp }: any) => eqOp(p.id, id),
    });
    if (!result) return res.status(404).json({ error: "Pollination not found" });
    res.json(result);
  } catch (error: any) {
    console.error("Error fetching pollination:", error);
    res.status(500).json({ error: "Failed to fetch pollination" });
  }
});

// POST create new pollination (cross-reference between writings)
router.post("/", requireAuth, async (req: any, res: any) => {
  try {
    const { sourceWritingId, targetWritingId, connectionType, notes } = req.body;
    if (!sourceWritingId || !targetWritingId) {
      return res.status(400).json({ error: "Source and target writing IDs required" });
    }
    const schema = await import("@shared/schema");
    const [pollination] = await db.insert(schema.pollinations).values({
      userId: req.user.id,
      sourceWritingId,
      targetWritingId,
      connectionType: connectionType || "thematic",
      notes: notes || "",
    }).returning();
    res.status(201).json(pollination);
  } catch (error: any) {
    console.error("Error creating pollination:", error);
    res.status(500).json({ error: "Failed to create pollination" });
  }
});

// DELETE pollination
router.delete("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const existing = await db.query.pollinations.findFirst({
      where: (p: any, { eq: eqOp }: any) => eqOp(p.id, id),
    });
    if (!existing) return res.status(404).json({ error: "Pollination not found" });
    if (existing.userId !== req.user.id) return res.status(403).json({ error: "Forbidden" });
    const schema = await import("@shared/schema");
    await db.delete(schema.pollinations).where(eq(schema.pollinations.id, id));
    res.status(204).send();
  } catch (error: any) {
    console.error("Error deleting pollination:", error);
    res.status(500).json({ error: "Failed to delete pollination" });
  }
});

export default router;
