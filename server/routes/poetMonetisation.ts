/**
 * poetMonetisation.ts — Poet Monetisation routes
 *
 * Routes for poet monetisation features:
 *   GET  /api/poet-monetisation/settings        — get monetisation settings for a writer
 *   POST /api/poet-monetisation/settings        — update monetisation settings
 *   GET  /api/poet-monetisation/earnings        — get earnings summary
 *   GET  /api/poet-monetisation/earnings/history — get earnings history
 */
import type { Express } from "express";
import { isAuthenticated } from "../replit_integrations/auth";
import { pool } from "../db";

export function registerPoetMonetisationRoutes(app: Express) {
  /** GET /api/poet-monetisation/settings */
  app.get("/api/poet-monetisation/settings", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });

      const { rows } = await pool.query(
        `SELECT id, monetisation_enabled, tip_enabled, subscription_enabled
           FROM users WHERE id = $1`,
        [userId]
      );

      if (!rows.length) return res.status(404).json({ error: "User not found" });
      res.json(rows[0]);
    } catch (err) {
      console.error("[poetMonetisation] GET /settings error:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  /** POST /api/poet-monetisation/settings */
  app.post("/api/poet-monetisation/settings", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });

      const { monetisation_enabled, tip_enabled, subscription_enabled } = req.body;

      await pool.query(
        `UPDATE users
            SET monetisation_enabled   = COALESCE($2, monetisation_enabled),
                tip_enabled            = COALESCE($3, tip_enabled),
                subscription_enabled   = COALESCE($4, subscription_enabled)
          WHERE id = $1`,
        [userId, monetisation_enabled, tip_enabled, subscription_enabled]
      );

      res.json({ success: true });
    } catch (err) {
      console.error("[poetMonetisation] POST /settings error:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  /** GET /api/poet-monetisation/earnings */
  app.get("/api/poet-monetisation/earnings", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });

      // Sum tips received by this user
      const { rows } = await pool.query(
        `SELECT COALESCE(SUM(amount), 0) AS total_tips,
                COUNT(*) AS tip_count
           FROM tip_transactions
          WHERE recipient_id = $1`,
        [userId]
      );

      res.json(rows[0] ?? { total_tips: 0, tip_count: 0 });
    } catch (err) {
      console.error("[poetMonetisation] GET /earnings error:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  /** GET /api/poet-monetisation/earnings/history */
  app.get("/api/poet-monetisation/earnings/history", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });

      const { rows } = await pool.query(
        `SELECT id, amount, created_at, sender_id
           FROM tip_transactions
          WHERE recipient_id = $1
          ORDER BY created_at DESC
          LIMIT 50`,
        [userId]
      );

      res.json(rows);
    } catch (err) {
      console.error("[poetMonetisation] GET /earnings/history error:", err);
      res.status(500).json({ error: "Server error" });
    }
  });
}
