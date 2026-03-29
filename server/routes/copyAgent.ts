import { Router } from "express";
import { db } from "../db";
import { copySnapshots, seoMeta, writings } from "../../shared/schema";
import { eq } from "drizzle-orm";

const router = Router();

const requireEditor = (req: any, res: any, next: any) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorised" });
  if (req.user.role !== "editor" && req.user.role !== "admin")
    return res.status(403).json({ error: "Forbidden" });
  next();
};

const requireAuth = (req: any, res: any, next: any) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorised" });
  next();
};

// GET all copy snapshots for a page (editor only)
router.get("/copy-snapshots", requireEditor, async (req, res) => {
  try {
    const { pageKey } = req.query;
    const query = db.select().from(copySnapshots);
    const results = pageKey
      ? await db.select().from(copySnapshots).where(eq(copySnapshots.pageKey, String(pageKey)))
      : await query;
    return res.json(results);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch copy snapshots" });
  }
});

// POST create a new copy snapshot draft (editor only)
router.post("/copy-snapshots", requireEditor, async (req, res) => {
  try {
    const { pageKey, sectionKey, draftCopy } = req.body;
    if (!pageKey || !sectionKey || !draftCopy)
      return res.status(400).json({ error: "pageKey, sectionKey, draftCopy required" });
    const [row] = await db.insert(copySnapshots).values({
      pageKey,
      sectionKey,
      draftCopy,
      generatedBy: "agent",
      status: "draft",
    }).returning();
    return res.status(201).json(row);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to create copy snapshot" });
  }
});

// PATCH approve a copy snapshot (editor only)
router.patch("/copy-snapshots/:id/approve", requireEditor, async (req, res) => {
  try {
    const { approvedCopy } = req.body;
    const [row] = await db.update(copySnapshots)
      .set({
        approvedCopy: approvedCopy ?? undefined,
        status: "approved",
        approvedById: req.user.id,
        approvedAt: new Date(),
      })
      .where(eq(copySnapshots.id, req.params.id))
      .returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    return res.json(row);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to approve copy snapshot" });
  }
});

// GET seo meta for a writing (public)
router.get("/seo-meta/:writingId", async (req, res) => {
  try {
    const rows = await db.select().from(seoMeta).where(eq(seoMeta.writingId, req.params.writingId));
    return res.json(rows[0] ?? null);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch seo meta" });
  }
});

// POST upsert seo meta for a writing (editor only)
router.post("/seo-meta", requireEditor, async (req, res) => {
  try {
    const { writingId, seoTitle, seoDescription, ogTitle, ogDescription, displayStandfirst } = req.body;
    if (!writingId) return res.status(400).json({ error: "writingId required" });
    const existing = await db.select().from(seoMeta).where(eq(seoMeta.writingId, writingId));
    let row;
    if (existing.length > 0) {
      [row] = await db.update(seoMeta)
        .set({ seoTitle, seoDescription, ogTitle, ogDescription, displayStandfirst, updatedAt: new Date() })
        .where(eq(seoMeta.writingId, writingId))
        .returning();
    } else {
      [row] = await db.insert(seoMeta).values({
        writingId, seoTitle: seoTitle ?? "", seoDescription: seoDescription ?? "",
        ogTitle: ogTitle ?? "", ogDescription: ogDescription ?? "",
        displayStandfirst: displayStandfirst ?? "", status: "draft",
      }).returning();
    }
    return res.status(201).json(row);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to upsert seo meta" });
  }
});

// PATCH approve seo meta (editor only)
router.patch("/seo-meta/:id/approve", requireEditor, async (req, res) => {
  try {
    const [row] = await db.update(seoMeta)
      .set({ status: "approved", approvedById: req.user.id, approvedAt: new Date() })
      .where(eq(seoMeta.id, req.params.id))
      .returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    return res.json(row);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to approve seo meta" });
  }
});

export function registerCopyAgentRoutes(app: any) {
  app.use("/api", router);
}
