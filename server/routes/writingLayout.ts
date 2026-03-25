import { type Express } from "express";
import { db } from "../db";
import { writings } from "@shared/schema";
import { eq, and } from "drizzle-orm";

const VALID_LAYOUTS = ["single", "two-column"] as const;
type Layout = (typeof VALID_LAYOUTS)[number];

export function registerWritingLayoutRoutes(app: Express) {
  // PATCH /api/writings/:id/layout
  // Allows the author to toggle between single and two-column layout
  app.patch("/api/writings/:id/layout", async (req: any, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { layout } = req.body as { layout: Layout };
    if (!layout || !VALID_LAYOUTS.includes(layout)) {
      return res.status(400).json({ error: "Invalid layout. Must be 'single' or 'two-column'." });
    }

    try {
      // Verify writing exists and user is the author
      const [writing] = await db
        .select({ authorId: writings.authorId })
        .from(writings)
        .where(eq(writings.id, req.params.id));

      if (!writing) {
        return res.status(404).json({ error: "Writing not found" });
      }
      if (writing.authorId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden: only the author can change layout" });
      }

      await db
        .update(writings)
        .set({ layout })
        .where(
          and(eq(writings.id, req.params.id), eq(writings.authorId, req.user.id))
        );

      res.json({ success: true, layout });
    } catch (err) {
      console.error("[writing-layout] patch error:", err);
      res.status(500).json({ error: "Could not update layout" });
    }
  });
}
