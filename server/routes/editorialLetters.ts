import { Router } from "express";
import { db } from "../db";
import { eq, desc } from "drizzle-orm";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  next();
}

function requireEditor(req: any, res: any, next: any) {
  if (!req.user || !(["editor", "admin", "editor_in_chief"] as string[]).includes(req.user.role)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
}

// GET all editorial letters (published)
router.get("/", async (req: any, res: any) => {
  try {
    const results = await db.query.editorialLetters.findMany({
      orderBy: (l: any) => [desc(l.publishedAt)],
    });
    res.json(results);
  } catch (error: any) {
    console.error("Error fetching editorial letters:", error);
    res.status(500).json({ error: "Failed to fetch editorial letters" });
  }
});

// GET single letter by ID
router.get("/:id", async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const result = await db.query.editorialLetters.findFirst({
      where: (l: any, { eq: eqOp }: any) => eqOp(l.id, id),
    });
    if (!result) return res.status(404).json({ error: "Letter not found" });
    res.json(result);
  } catch (error: any) {
    console.error("Error fetching letter:", error);
    res.status(500).json({ error: "Failed to fetch letter" });
  }
});

// POST create new editorial letter (editor only)
router.post("/", requireAuth, requireEditor, async (req: any, res: any) => {
  try {
    const { title, content, summary, season } = req.body;
    if (!title || !content) return res.status(400).json({ error: "Title and content are required" });
    const schema = await import("@shared/schema");
    const [letter] = await db.insert(schema.editorialLetters).values({
      authorId: req.user.id,
      title,
      content,
      summary: summary || "",
      season: season || "general",
      publishedAt: new Date(),
    }).returning();
    res.status(201).json(letter);
  } catch (error: any) {
    console.error("Error creating letter:", error);
    res.status(500).json({ error: "Failed to create letter" });
  }
});

// PUT update editorial letter (editor only)
router.put("/:id", requireAuth, requireEditor, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { title, content, summary, season } = req.body;
    const schema = await import("@shared/schema");
    const [updated] = await db.update(schema.editorialLetters)
      .set({ title, content, summary, season, updatedAt: new Date() })
      .where(eq(schema.editorialLetters.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Letter not found" });
    res.json(updated);
  } catch (error: any) {
    console.error("Error updating letter:", error);
    res.status(500).json({ error: "Failed to update letter" });
  }
});

// DELETE editorial letter (editor only)
router.delete("/:id", requireAuth, requireEditor, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const schema = await import("@shared/schema");
    await db.delete(schema.editorialLetters).where(eq(schema.editorialLetters.id, id));
    res.status(204).send();
  } catch (error: any) {
    console.error("Error deleting letter:", error);
    res.status(500).json({ error: "Failed to delete letter" });
  }
});

export default router;
