import { Router } from "express";
import { db } from "../db";
import { editorialBriefs, issues } from "../../shared/schema";
import { eq } from "drizzle-orm";

const router = Router();

const requireEditor = (req: any, res: any, next: any) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorised" });
  if (req.user.role !== "editor" && req.user.role !== "admin")
    return res.status(403).json({ error: "Forbidden" });
  next();
};

// GET editorial brief for an issue (editor only)
router.get("/editorial-briefs/:issueId", requireEditor, async (req, res) => {
  try {
    const rows = await db.select()
      .from(editorialBriefs)
      .where(eq(editorialBriefs.issueId, req.params.issueId));
    return res.json(rows[0] ?? null);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch editorial brief" });
  }
});

// GET all editorial briefs (editor only)
router.get("/editorial-briefs", requireEditor, async (req, res) => {
  try {
    const rows = await db.select().from(editorialBriefs);
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch editorial briefs" });
  }
});

// POST create or update editorial brief for an issue (editor only)
router.post("/editorial-briefs", requireEditor, async (req, res) => {
  try {
    const { issueId, displayIntro, seoExcerpt, draftByAgent } = req.body;
    if (!issueId) return res.status(400).json({ error: "issueId required" });

    const existing = await db.select()
      .from(editorialBriefs)
      .where(eq(editorialBriefs.issueId, issueId));

    let row;
    if (existing.length > 0) {
      [row] = await db.update(editorialBriefs)
        .set({
          displayIntro: displayIntro ?? existing[0].displayIntro,
          seoExcerpt: seoExcerpt ?? existing[0].seoExcerpt,
          draftByAgent: draftByAgent ?? existing[0].draftByAgent,
          updatedAt: new Date(),
        })
        .where(eq(editorialBriefs.issueId, issueId))
        .returning();
    } else {
      [row] = await db.insert(editorialBriefs).values({
        issueId,
        displayIntro: displayIntro ?? "",
        seoExcerpt: seoExcerpt ?? "",
        draftByAgent: draftByAgent ?? null,
        status: "draft",
      }).returning();
    }
    return res.status(201).json(row);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to save editorial brief" });
  }
});

// PATCH approve editorial brief (editor only)
router.patch("/editorial-briefs/:id/approve", requireEditor, async (req, res) => {
  try {
    const [row] = await db.update(editorialBriefs)
      .set({
        status: "approved",
        approvedById: req.user.id,
        approvedAt: new Date(),
      })
      .where(eq(editorialBriefs.id, req.params.id))
      .returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    return res.json(row);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to approve editorial brief" });
  }
});

export function registerEditorialBriefRoutes(app: any) {
  app.use("/api", router);
}
