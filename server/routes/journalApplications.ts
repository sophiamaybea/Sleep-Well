import { type Express } from "express";
import { db } from "../db";
import { journalApplications, insertJournalApplicationSchema } from "@shared/schema";
import { desc } from "drizzle-orm";

export function registerJournalApplicationRoutes(app: Express) {
  // POST /api/journal-applications — public, no auth required
  app.post("/api/journal-applications", async (req: any, res) => {
    try {
      const parsed = insertJournalApplicationSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid application data", details: parsed.error.flatten() });
      }

      const [application] = await db
        .insert(journalApplications)
        .values(parsed.data)
        .returning();

      console.log(`[JournalApplications] New application from: ${application.journalName} <${application.email}>`);
      return res.status(201).json({ success: true, id: application.id });
    } catch (err: any) {
      console.error("[JournalApplications] Error:", err);
      return res.status(500).json({ error: "Failed to submit application" });
    }
  });

  // GET /api/journal-applications — editors only
  app.get("/api/journal-applications", async (req: any, res) => {
    try {
      if (!req.user || (req.user.role !== "editor" && req.user.role !== "admin")) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const applications = await db
        .select()
        .from(journalApplications)
        .orderBy(desc(journalApplications.createdAt));
      return res.json(applications);
    } catch (err: any) {
      console.error("[JournalApplications] GET error:", err);
      return res.status(500).json({ error: "Failed to fetch applications" });
    }
  });

  // PATCH /api/journal-applications/:id — editors only
  app.patch("/api/journal-applications/:id", async (req: any, res) => {
    try {
      if (!req.user || (req.user.role !== "editor" && req.user.role !== "admin")) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const { id } = req.params;
      const { status, editorNote } = req.body;
      const { eq } = await import("drizzle-orm");
      const [updated] = await db
        .update(journalApplications)
        .set({ status, editorNote, reviewedAt: new Date(), updatedAt: new Date() })
        .where(eq(journalApplications.id, id))
        .returning();
      return res.json(updated);
    } catch (err: any) {
      console.error("[JournalApplications] PATCH error:", err);
      return res.status(500).json({ error: "Failed to update application" });
    }
  });
}
