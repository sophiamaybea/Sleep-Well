import { Router } from "express";
import { db } from "../db";
import { eq, desc } from "drizzle-orm";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  next();
}

// GET tips received by a writer
router.get("/received", requireAuth, async (req: any, res: any) => {
  try {
    const results = await db.query.tips.findMany({
      where: (t: any, { eq: eqOp }: any) => eqOp(t.recipientId, req.user.id),
      orderBy: (t: any) => [desc(t.createdAt)],
    });
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch received tips" });
  }
});

// GET tips sent by current user
router.get("/sent", requireAuth, async (req: any, res: any) => {
  try {
    const results = await db.query.tips.findMany({
      where: (t: any, { eq: eqOp }: any) => eqOp(t.senderId, req.user.id),
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
    const { recipientId, writingId, amount, message } = req.body;
    if (!recipientId || !amount) return res.status(400).json({ error: "recipientId and amount required" });
    if (amount <= 0) return res.status(400).json({ error: "Amount must be positive" });
    const schema = await import("@shared/schema");
    const [tip] = await db.insert(schema.tips).values({
      senderId: req.user.id,
      recipientId,
      writingId: writingId || null,
      amount,
      message: message || "",
      status: "completed",
    }).returning();
    res.status(201).json(tip);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to send tip" });
  }
});

export default router;
