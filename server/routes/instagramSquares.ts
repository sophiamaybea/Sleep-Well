import { type Express } from "express";
import { db } from "../db";
import { instagramSquareExports } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export function registerInstagramSquaresRoutes(app: Express) {
    // POST /api/instagram-squares/log — log a completed download
  app.post("/api/instagram-squares/log", async (req, res) => {
        if (!req.isAuthenticated || !req.isAuthenticated()) {
                return res.status(401).json({ message: "Unauthorised" });
              }
        try {
                const userId = (req.user as { id: string }).id;
                const { writingId, title, contentSnippet, theme, fontChoice } = req.body;
                const [record] = await db
                  .insert(instagramSquareExports)
                  .values({ userId, writingId, title, contentSnippet, theme, fontChoice })
                  .returning();
                return res.status(201).json(record);
              } catch (err) {
                console.error("instagram-squares/log error:", err);
                return res.status(500).json({ message: "Failed to log download" });
              }
      });

  // GET /api/instagram-squares/history — user's own download history
  app.get("/api/instagram-squares/history", async (req, res) => {
        if (!req.isAuthenticated || !req.isAuthenticated()) {
                return res.status(401).json({ message: "Unauthorised" });
              }
        try {
                const userId = (req.user as { id: string }).id;
                const rows = await db
                  .select()
                  .from(instagramSquareExports)
                  .where(eq(instagramSquareExports.userId, userId))
                  .orderBy(desc(instagramSquareExports.downloadedAt))
                  .limit(50);
                return res.json(rows);
              } catch (err) {
                console.error("instagram-squares/history error:", err);
                return res.status(500).json({ message: "Failed to fetch history" });
              }
      });
  }
