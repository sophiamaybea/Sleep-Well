import { Router } from "express";
import { db } from "../db";
import { eq, desc } from "drizzle-orm";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  next();
}

// GET all writing circles
router.get("/", requireAuth, async (req: any, res: any) => {
  try {
    const results = await db.query.writingCircles.findMany({
      orderBy: (c: any) => [desc(c.createdAt)],
    });
    res.json(results);
  } catch (error: any) {
    console.error("Error fetching circles:", error);
    res.status(500).json({ error: "Failed to fetch circles" });
  }
});

// GET single circle by ID
router.get("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const result = await db.query.writingCircles.findFirst({
      where: (c: any, { eq: eqOp }: any) => eqOp(c.id, id),
    });
    if (!result) return res.status(404).json({ error: "Circle not found" });
    res.json(result);
  } catch (error: any) {
    console.error("Error fetching circle:", error);
    res.status(500).json({ error: "Failed to fetch circle" });
  }
});

// POST create new circle
router.post("/", requireAuth, async (req: any, res: any) => {
  try {
    const { name, description, isPrivate, maxMembers } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    const schema = await import("@shared/schema");
    const [circle] = await db.insert(schema.writingCircles).values({
      creatorId: req.user.id,
      name,
      description: description || "",
      isPrivate: isPrivate || false,
      maxMembers: maxMembers || 10,
    }).returning();
    res.status(201).json(circle);
  } catch (error: any) {
    console.error("Error creating circle:", error);
    res.status(500).json({ error: "Failed to create circle" });
  }
});

// POST join a circle
router.post("/:id/join", requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const circle = await db.query.writingCircles.findFirst({
      where: (c: any, { eq: eqOp }: any) => eqOp(c.id, id),
    });
    if (!circle) return res.status(404).json({ error: "Circle not found" });
    const schema = await import("@shared/schema");
    const [membership] = await db.insert(schema.circleMembers).values({
      circleId: id,
      userId: req.user.id,
    }).returning();
    res.status(201).json(membership);
  } catch (error: any) {
    console.error("Error joining circle:", error);
    res.status(500).json({ error: "Failed to join circle" });
  }
});

// PUT update circle
router.put("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const existing = await db.query.writingCircles.findFirst({
      where: (c: any, { eq: eqOp }: any) => eqOp(c.id, id),
    });
    if (!existing) return res.status(404).json({ error: "Circle not found" });
    if (existing.creatorId !== req.user.id) return res.status(403).json({ error: "Forbidden" });
    const { name, description, isPrivate, maxMembers } = req.body;
    const schema = await import("@shared/schema");
    const [updated] = await db.update(schema.writingCircles)
      .set({ name, description, isPrivate, maxMembers, updatedAt: new Date() })
      .where(eq(schema.writingCircles.id, id))
      .returning();
    res.json(updated);
  } catch (error: any) {
    console.error("Error updating circle:", error);
    res.status(500).json({ error: "Failed to update circle" });
  }
});

// DELETE circle
router.delete("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const existing = await db.query.writingCircles.findFirst({
      where: (c: any, { eq: eqOp }: any) => eqOp(c.id, id),
    });
    if (!existing) return res.status(404).json({ error: "Circle not found" });
    if (existing.creatorId !== req.user.id) return res.status(403).json({ error: "Forbidden" });
    const schema = await import("@shared/schema");
    await db.delete(schema.writingCircles).where(eq(schema.writingCircles.id, id));
    res.status(204).send();
  } catch (error: any) {
    console.error("Error deleting circle:", error);
    res.status(500).json({ error: "Failed to delete circle" });
  }
});

export default router;
