import { Router } from "express";
import { db } from "../db";
import { eq, desc } from "drizzle-orm";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  next();
}

router.get("/", requireAuth, async (req: any, res: any) => {
  try {
    const results = await db.query.savedPieces.findMany({
      where: (s: any, { eq: eqOp }: any) => eqOp(s.userId, req.user.id),
      orderBy: (s: any) => [desc(s.savedAt)],
    });
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch saved pieces" });
  }
});

router.post("/", requireAuth, async (req: any, res: any) => {
  try {
    const { writingId } = req.body;
    if (!writingId) return res.status(400).json({ error: "writingId required" });
    const schema = await import("@shared/schema");
    const [saved] = await db.insert(schema.savedPieces).values({
      userId: req.user.id,
      writingId,
    }).returning();
    res.status(201).json(saved);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to save piece" });
  }
});

router.delete("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const existing = await db.query.savedPieces.findFirst({
      where: (s: any, { eq: eqOp }: any) => eqOp(s.id, id),
    });
    if (!existing) return res.status(404).json({ error: "Not found" });
    if (existing.userId !== req.user.id) return res.status(403).json({ error: "Forbidden" });
    const schema = await import("@shared/schema");
    await db.delete(schema.savedPieces).where(eq(schema.savedPieces.id, id));
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: "Failed to remove saved piece" });
  }
});

export default router;
