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
    const { writingId } = req.query;
    if (!writingId) return res.status(400).json({ error: "writingId is required" });
    const results = await db.query.writingSnapshots.findMany({
      where: (s: any, { eq: eqOp }: any) => eqOp(s.writingId, writingId),
      orderBy: (s: any) => [desc(s.createdAt)],
    });
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch snapshots" });
  }
});

router.get("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const result = await db.query.writingSnapshots.findFirst({
      where: (s: any, { eq: eqOp }: any) => eqOp(s.id, req.params.id),
    });
    if (!result) return res.status(404).json({ error: "Snapshot not found" });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch snapshot" });
  }
});

router.post("/", requireAuth, async (req: any, res: any) => {
  try {
    const { writingId, title, content, readiness, snapshotNote, isManual } = req.body;
    if (!writingId || !content) return res.status(400).json({ error: "writingId and content required" });
    const schema = await import("@shared/schema");
    const [snapshot] = await db.insert(schema.writingSnapshots).values({
      writingId,
      title: title || "",
      content,
      readiness: readiness || "raw_seed",
      snapshotNote: snapshotNote || null,
      isManual: isManual ?? false,
    }).returning();
    res.status(201).json(snapshot);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to create snapshot" });
  }
});

router.delete("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const existing = await db.query.writingSnapshots.findFirst({
      where: (s: any, { eq: eqOp }: any) => eqOp(s.id, req.params.id),
    });
    if (!existing) return res.status(404).json({ error: "Not found" });
    const schema = await import("@shared/schema");
    await db.delete(schema.writingSnapshots).where(eq(schema.writingSnapshots.id, req.params.id));
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete snapshot" });
  }
});

export default router;
