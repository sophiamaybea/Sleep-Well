import { Router } from "express";
import { db } from "../db";
import { eq, desc } from "drizzle-orm";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  next();
}

// GET all inner weather entries for current user
router.get("/", requireAuth, async (req: any, res: any) => {
  try {
    const results = await db.query.innerWeather.findMany({
      where: (w: any, { eq: eqOp }: any) => eqOp(w.userId, req.user.id),
      orderBy: (w: any) => [desc(w.recordedAt)],
    });
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch weather entries" });
  }
});

// GET latest weather entry
router.get("/latest", requireAuth, async (req: any, res: any) => {
  try {
    const result = await db.query.innerWeather.findFirst({
      where: (w: any, { eq: eqOp }: any) => eqOp(w.userId, req.user.id),
      orderBy: (w: any) => [desc(w.recordedAt)],
    });
    res.json(result || null);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch latest weather" });
  }
});

// POST record new inner weather
router.post("/", requireAuth, async (req: any, res: any) => {
  try {
    const { mood, energy, creativity, clarity, notes, weatherIcon } = req.body;
    if (!mood) return res.status(400).json({ error: "Mood is required" });
    const schema = await import("@shared/schema");
    const [entry] = await db.insert(schema.innerWeather).values({
      userId: req.user.id,
      mood,
      energy: energy || 5,
      creativity: creativity || 5,
      clarity: clarity || 5,
      notes: notes || "",
      weatherIcon: weatherIcon || "partly-cloudy",
      recordedAt: new Date(),
    }).returning();
    res.status(201).json(entry);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to record weather" });
  }
});

// DELETE weather entry
router.delete("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const existing = await db.query.innerWeather.findFirst({
      where: (w: any, { eq: eqOp }: any) => eqOp(w.id, req.params.id),
    });
    if (!existing) return res.status(404).json({ error: "Not found" });
    if (existing.userId !== req.user.id) return res.status(403).json({ error: "Forbidden" });
    const schema = await import("@shared/schema");
    await db.delete(schema.innerWeather).where(eq(schema.innerWeather.id, req.params.id));
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete weather entry" });
  }
});

export default router;
