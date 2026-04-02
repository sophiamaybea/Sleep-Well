import { Router } from "express";
import { db } from "../db";
import { eq, desc } from "drizzle-orm";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  next();
}

// GET all rituals for current user
router.get("/", requireAuth, async (req: any, res: any) => {
  try {
    const results = await db.query.rituals.findMany({
      where: (r: any, { eq: eqOp }: any) => eqOp(r.userId, req.user.id),
      orderBy: (r: any) => [desc(r.createdAt)],
    });
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch rituals" });
  }
});

// GET single ritual
router.get("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const result = await db.query.rituals.findFirst({
      where: (r: any, { eq: eqOp }: any) => eqOp(r.id, id),
    });
    if (!result) return res.status(404).json({ error: "Ritual not found" });
    if (result.userId !== req.user.id) return res.status(403).json({ error: "Forbidden" });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch ritual" });
  }
});

// POST create new writing ritual
router.post("/", requireAuth, async (req: any, res: any) => {
  try {
    const { name, description, frequency, timeOfDay, duration, steps } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    const schema = await import("@shared/schema");
    const [ritual] = await db.insert(schema.rituals).values({
      userId: req.user.id,
      name,
      description: description || "",
      frequency: frequency || "daily",
      timeOfDay: timeOfDay || "morning",
      duration: duration || 30,
      steps: steps || [],
      isActive: true,
    }).returning();
    res.status(201).json(ritual);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to create ritual" });
  }
});

// PUT update ritual
router.put("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const existing = await db.query.rituals.findFirst({
      where: (r: any, { eq: eqOp }: any) => eqOp(r.id, id),
    });
    if (!existing) return res.status(404).json({ error: "Ritual not found" });
    if (existing.userId !== req.user.id) return res.status(403).json({ error: "Forbidden" });
    const { name, description, frequency, timeOfDay, duration, steps, isActive } = req.body;
    const schema = await import("@shared/schema");
    const [updated] = await db.update(schema.rituals)
      .set({ name, description, frequency, timeOfDay, duration, steps, isActive, updatedAt: new Date() })
      .where(eq(schema.rituals.id, id))
      .returning();
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update ritual" });
  }
});

// DELETE ritual
router.delete("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const existing = await db.query.rituals.findFirst({
      where: (r: any, { eq: eqOp }: any) => eqOp(r.id, id),
    });
    if (!existing) return res.status(404).json({ error: "Ritual not found" });
    if (existing.userId !== req.user.id) return res.status(403).json({ error: "Forbidden" });
    const schema = await import("@shared/schema");
    await db.delete(schema.rituals).where(eq(schema.rituals.id, id));
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete ritual" });
  }
});

export default router;
