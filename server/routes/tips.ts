import { Router } from "express";
import { db } from "../db";
import { eq, desc } from "drizzle-orm";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  next();
}

// GET tip transactions received (via user's tip jar)
router.get("/received", requireAuth, async (req: any, res: any) => {
  try {
    const schema = await import("@shared/schema");
    // First find user's tip jar
    const tipJar = await db.query.tipJars.findFirst({
      where: (tj: any, { eq: eqOp }: any) => eqOp(tj.authorId, req.user.id),
    });
    if (!tipJar) return res.json([]);
    const results = await db.query.tipTransactions.findMany({
      where: (t: any, { eq: eqOp }: any) => eqOp(t.tipJarId, tipJar.id),
      orderBy: (t: any) => [desc(t.createdAt)],
    });
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch received tips" });
  }
});

// GET tip transactions sent by current user
router.get("/sent", requireAuth, async (req: any, res: any) => {
  try {
    const results = await db.query.tipTransactions.findMany({
      where: (t: any, { eq: eqOp }: any) => eqOp(t.tipperId, req.user.id),
      orderBy: (t: any) => [desc(t.createdAt)],
    });
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch sent tips" });
  }
});

// POST send a tip
router.post("/", requireAuth, async (req: any, res: any) => {
  try {
    const { tipJarId, amountPence } = req.body;
    if (!tipJarId || !amountPence) return res.status(400).json({ error: "tipJarId and amountPence required" });
    if (amountPence <= 0) return res.status(400).json({ error: "Amount must be positive" });
    const schema = await import("@shared/schema");
    const [tip] = await db.insert(schema.tipTransactions).values({
      tipJarId,
      tipperId: req.user.id,
      amountPence,
    }).returning();
    res.status(201).json(tip);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to send tip" });
  }
});

export default router;
