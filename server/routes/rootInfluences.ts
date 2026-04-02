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
    const results = await db.query.rootInfluences.findMany({
      where: (r: any, { eq: eqOp }: any) => eqOp(r.userId, req.user.id),
      orderBy: (r: any) => [desc(r.createdAt)],
    });
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch root influences" });
  }
});

router.post("/", requireAuth, async (req: any, res: any) => {
  try {
    const { name, category, note } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    const schema = await import("@shared/schema");
    const [influence] = await db.insert(schema.rootInfluences).values({
      userId: req.user.id,
      name,
      category: category || "writer",
      note: note || "",
    }).returning();
    res.status(201).json(influence);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to create root influence" });
  }
});

router.put("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const existing = await db.query.rootInfluences.findFirst({
      where: (r: any, { eq: eqOp }: any) => eqOp(r.id, id),
    });
    if (!existing) return res.status(404).json({ error: "Not found" });
    if (existing.userId !== req.user.id) return res.status(403).json({ error: "Forbidden" });
    const { name, category, note } = req.body;
    const schema = await import("@shared/schema");
    const [updated] = await db.update(schema.rootInfluences)
      .set({ name, category, note })
      .where(eq(schema.rootInfluences.id, id))
      .returning();
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update root influence" });
  }
});

router.delete("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const existing = await db.query.rootInfluences.findFirst({
      where: (r: any, { eq: eqOp }: any) => eqOp(r.id, id),
    });
    if (!existing) return res.status(404).json({ error: "Not found" });
    if (existing.userId !== req.user.id) return res.status(403).json({ error: "Forbidden" });
    const schema = await import("@shared/schema");
    await db.delete(schema.rootInfluences).where(eq(schema.rootInfluences.id, id));
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete root influence" });
  }
});

export default router;
