import { Router } from "express";
import { db } from "../db";
import { eq, desc } from "drizzle-orm";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  next();
}

// GET all bouquets for current user
router.get("/", requireAuth, async (req: any, res: any) => {
  try {
    const results = await db.query.readingBouquets.findMany({
      where: (b: any, { eq: eqOp }: any) => eqOp(b.curatorId, req.user.id),
      orderBy: (b: any) => [desc(b.createdAt)],
    });
    res.json(results);
  } catch (error: any) {
    console.error("Error fetching bouquets:", error);
    res.status(500).json({ error: "Failed to fetch bouquets" });
  }
});

// GET single bouquet by ID
router.get("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const result = await db.query.readingBouquets.findFirst({
      where: (b: any, { eq: eqOp }: any) => eqOp(b.id, id),
    });
    if (!result) return res.status(404).json({ error: "Bouquet not found" });
    if (result.curatorId !== req.user.id) return res.status(403).json({ error: "Forbidden" });
    res.json(result);
  } catch (error: any) {
    console.error("Error fetching bouquet:", error);
    res.status(500).json({ error: "Failed to fetch bouquet" });
  }
});

// POST create new bouquet
router.post("/", requireAuth, async (req: any, res: any) => {
  try {
    const { title, description, theme, isPublic } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });
    const schema = await import("@shared/schema");
    const [bouquet] = await db.insert(schema.readingBouquets).values({
      curatorId: req.user.id,
      title,
      description: description || "",
      theme: theme || null,
      isPublic: isPublic ?? true,
    }).returning();
    res.status(201).json(bouquet);
  } catch (error: any) {
    console.error("Error creating bouquet:", error);
    res.status(500).json({ error: "Failed to create bouquet" });
  }
});

// PUT update bouquet
router.put("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const existing = await db.query.readingBouquets.findFirst({
      where: (b: any, { eq: eqOp }: any) => eqOp(b.id, id),
    });
    if (!existing) return res.status(404).json({ error: "Bouquet not found" });
    if (existing.curatorId !== req.user.id) return res.status(403).json({ error: "Forbidden" });
    const { title, description, theme, isPublic } = req.body;
    const schema = await import("@shared/schema");
    const [updated] = await db.update(schema.readingBouquets)
      .set({ title, description, theme, isPublic })
      .where(eq(schema.readingBouquets.id, id))
      .returning();
    res.json(updated);
  } catch (error: any) {
    console.error("Error updating bouquet:", error);
    res.status(500).json({ error: "Failed to update bouquet" });
  }
});

// DELETE bouquet
router.delete("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const existing = await db.query.readingBouquets.findFirst({
      where: (b: any, { eq: eqOp }: any) => eqOp(b.id, id),
    });
    if (!existing) return res.status(404).json({ error: "Bouquet not found" });
    if (existing.curatorId !== req.user.id) return res.status(403).json({ error: "Forbidden" });
    const schema = await import("@shared/schema");
    await db.delete(schema.readingBouquets).where(eq(schema.readingBouquets.id, id));
    res.status(204).send();
  } catch (error: any) {
    console.error("Error deleting bouquet:", error);
    res.status(500).json({ error: "Failed to delete bouquet" });
  }
});

export default router;
