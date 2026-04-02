import { Router } from "express";
import { db } from "../db";
import { eq, desc } from "drizzle-orm";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  next();
}

// GET all ritual sessions for current user
router.get("/", requireAuth, async (req: any, res: any) => {
  try {
    const results = await db.query.ritualSessions.findMany({
      where: (r: any, { eq: eqOp }: any) => eqOp(r.userId, req.user.id),
      orderBy: (r: any) => [desc(r.completedAt)],
    });
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch rituals" });
  }
});

// GET single ritual session
router.get("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const result = await db.query.ritualSessions.findFirst({
      where: (r: any, { eq: eqOp }: any) => eqOp(r.id, id),
    });
    if (!result) return res.status(404).json({ error: "Ritual not found" });
    if (result.userId !== req.user.id) return res.status(403).json({ error: "Forbidden" });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch ritual" });
  }
});

// POST create new ritual session
router.post("/", requireAuth, async (req: any, res: any) => {
  try {
    const { promptId, durationMinutes, output } = req.body;
    const schema = await import("@shared/schema");
    const [session] = await db.insert(schema.ritualSessions).values({
      userId: req.user.id,
      promptId: promptId || null,
      durationMinutes: durationMinutes || 10,
      output: output || "",
    }).returning();
    res.status(201).json(session);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to create ritual session" });
  }
});

// PUT update ritual session
router.put("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const existing = await db.query.ritualSessions.findFirst({
      where: (r: any, { eq: eqOp }: any) => eqOp(r.id, id),
    });
    if (!existing) return res.status(404).json({ error: "Ritual not found" });
    if (existing.userId !== req.user.id) return res.status(403).json({ error: "Forbidden" });
    const { promptId, durationMinutes, output } = req.body;
    const schema = await import("@shared/schema");
    const [updated] = await db.update(schema.ritualSessions)
      .set({ promptId, durationMinutes, output })
      .where(eq(schema.ritualSessions.id, id))
      .returning();
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update ritual session" });
  }
});

// DELETE ritual session
router.delete("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const existing = await db.query.ritualSessions.findFirst({
      where: (r: any, { eq: eqOp }: any) => eqOp(r.id, id),
    });
    if (!existing) return res.status(404).json({ error: "Ritual not found" });
    if (existing.userId !== req.user.id) return res.status(403).json({ error: "Forbidden" });
    const schema = await import("@shared/schema");
    await db.delete(schema.ritualSessions).where(eq(schema.ritualSessions.id, id));
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete ritual session" });
  }
});

export default router;
