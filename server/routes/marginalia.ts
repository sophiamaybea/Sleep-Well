import { Router } from "express";
import { db } from "../db";
import { eq, desc } from "drizzle-orm";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  next();
}

// GET all marginalia notes for current user
router.get("/", requireAuth, async (req: any, res: any) => {
  try {
    const results = await db.query.marginalia.findMany({
      where: (m: any, { eq: eqOp }: any) => eqOp(m.userId, req.user.id),
      orderBy: (m: any) => [desc(m.createdAt)],
    });
    res.json(results);
  } catch (error: any) {
    console.error("Error fetching marginalia:", error);
    res.status(500).json({ error: "Failed to fetch marginalia" });
  }
});

// GET marginalia for a specific writing
router.get("/writing/:writingId", requireAuth, async (req: any, res: any) => {
  try {
    const { writingId } = req.params;
    const results = await db.query.marginalia.findMany({
      where: (m: any, { eq: eqOp, and: andOp }: any) =>
        andOp(eqOp(m.writingId, writingId), eqOp(m.userId, req.user.id)),
      orderBy: (m: any) => [desc(m.createdAt)],
    });
    res.json(results);
  } catch (error: any) {
    console.error("Error fetching marginalia for writing:", error);
    res.status(500).json({ error: "Failed to fetch marginalia" });
  }
});

// POST create new marginalia note
router.post("/", requireAuth, async (req: any, res: any) => {
  try {
    const { writingId, content, highlightText } = req.body;
    if (!writingId || !content) return res.status(400).json({ error: "writingId and content required" });
    const schema = await import("@shared/schema");
    const [note] = await db.insert(schema.marginalia).values({
      userId: req.user.id,
      writingId,
      content,
      highlightText: highlightText || "",
    }).returning();
    res.status(201).json(note);
  } catch (error: any) {
    console.error("Error creating marginalia:", error);
    res.status(500).json({ error: "Failed to create marginalia" });
  }
});

// PUT update marginalia note
router.put("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const existing = await db.query.marginalia.findFirst({
      where: (m: any, { eq: eqOp }: any) => eqOp(m.id, id),
    });
    if (!existing) return res.status(404).json({ error: "Note not found" });
    if (existing.userId !== req.user.id) return res.status(403).json({ error: "Forbidden" });
    const { content, highlightText } = req.body;
    const schema = await import("@shared/schema");
    const [updated] = await db.update(schema.marginalia)
      .set({ content, highlightText })
      .where(eq(schema.marginalia.id, id))
      .returning();
    res.json(updated);
  } catch (error: any) {
    console.error("Error updating marginalia:", error);
    res.status(500).json({ error: "Failed to update marginalia" });
  }
});

// DELETE marginalia note
router.delete("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const existing = await db.query.marginalia.findFirst({
      where: (m: any, { eq: eqOp }: any) => eqOp(m.id, id),
    });
    if (!existing) return res.status(404).json({ error: "Note not found" });
    if (existing.userId !== req.user.id) return res.status(403).json({ error: "Forbidden" });
    const schema = await import("@shared/schema");
    await db.delete(schema.marginalia).where(eq(schema.marginalia.id, id));
    res.status(204).send();
  } catch (error: any) {
    console.error("Error deleting marginalia:", error);
    res.status(500).json({ error: "Failed to delete marginalia" });
  }
});

export default router;
