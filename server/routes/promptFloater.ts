import { Router } from "express";
import { db } from "../db";
import { promptFloats, prompts } from "../../shared/schema";
import { eq, and, desc } from "drizzle-orm";

const router = Router();

const requireAuth = (req: any, res: any, next: any) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorised" });
  next();
};

// GET a prompt to surface in the editor for the current user
// Logic: pick from prompts table, avoid recently shown ones
router.get("/prompt-float", requireAuth, async (req, res) => {
  try {
    const { writingId } = req.query;
    const userId = req.user.id;

    // Get the last 10 prompts shown to avoid repeating
    const recentFloats = await db.select()
      .from(promptFloats)
      .where(eq(promptFloats.userId, userId))
      .orderBy(desc(promptFloats.surfacedAt))
      .limit(10);
    const recentPromptIds = recentFloats
      .map((f: any) => f.promptId)
      .filter(Boolean);

    // Get all prompts
    const allPrompts = await db.select().from(prompts);
    if (allPrompts.length === 0) {
      return res.json(null);
    }

    // Filter out recently shown, or fall back to all if all shown
    const candidates = allPrompts.filter(
      (p: any) => !recentPromptIds.includes(p.id)
    );
    const pool = candidates.length > 0 ? candidates : allPrompts;

    // Pick a random one
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    return res.json(chosen);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch prompt" });
  }
});

// POST log that a prompt was surfaced (called by frontend after showing)
router.post("/prompt-float/log", requireAuth, async (req, res) => {
  try {
    const { writingId, promptId, promptText } = req.body;
    if (!promptText)
      return res.status(400).json({ error: "promptText required" });
    const [row] = await db.insert(promptFloats).values({
      userId: req.user.id,
      writingId: writingId ?? null,
      promptId: promptId ?? null,
      promptText,
      dismissed: false,
    }).returning();
    return res.status(201).json(row);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to log prompt float" });
  }
});

// PATCH mark a prompt float as dismissed
router.patch("/prompt-float/:id/dismiss", requireAuth, async (req, res) => {
  try {
    const [row] = await db.update(promptFloats)
      .set({ dismissed: true })
      .where(and(
        eq(promptFloats.id, req.params.id),
        eq(promptFloats.userId, req.user.id)
      ))
      .returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    return res.json(row);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to dismiss prompt" });
  }
});

export function registerPromptFloaterRoutes(app: any) {
  app.use("/api", router);
}
