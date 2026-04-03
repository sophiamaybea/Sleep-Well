/**
 * openCalls.ts — Open Calls (Submission Calls) routes
 * EIC can create/manage open calls; editors can view submissions.
 *
 * Routes:
 *   GET  /api/open-calls              — list all calls (EIC/editor)
 *   POST /api/open-calls              — create a call (EIC only)
 *   GET  /api/open-calls/:id          — get a single call with submissions
 *   PATCH /api/open-calls/:id         — update call (EIC only)
 *   DELETE /api/open-calls/:id        — delete call (EIC only)
 *   GET  /api/open-calls/:id/submissions — list submissions for a call
 *   PATCH /api/open-calls/:id/submissions/:subId — update submission status
 */
import type { Express } from "express";
import { isAuthenticated } from "../replit_integrations/auth";
import { pool } from "../db";

/** Guard: editor_in_chief only */
async function isEIC(req: any, res: any, next: any) {
  try {
    const userId =
      req.user?.claims?.sub ||
      req.user?.id ||
      req.session?.userId;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });
    const { rows } = await pool.query(
      `SELECT role FROM users WHERE id = $1`,
      [userId]
    );
    if (!rows[0] || rows[0].role !== "editor_in_chief") {
      return res.status(403).json({ error: "EIC access only" });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: "Auth check failed" });
  }
}

/** Guard: any editor role */
async function isEditor(req: any, res: any, next: any) {
  try {
    const userId =
      req.user?.claims?.sub ||
      req.user?.id ||
      req.session?.userId;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });
    const { rows } = await pool.query(
      `SELECT role FROM users WHERE id = $1`,
      [userId]
    );
    if (!rows[0] || !['editor_in_chief', 'editor'].includes(rows[0].role)) {
      return res.status(403).json({ error: "Editor access only" });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: "Auth check failed" });
  }
}

export function registerOpenCallsRoutes(app: Express) {
  // ─── LIST all open calls (editors + EIC) ────────────────────────────────────
  app.get("/api/open-calls", isAuthenticated, isEditor, async (req, res) => {
    try {
      const { rows } = await pool.query(`
        SELECT
          sc.*,
          u.first_name AS created_by_first_name,
          u.last_name  AS created_by_last_name,
          COUNT(scr.id)::int AS submission_count
        FROM submission_calls sc
        LEFT JOIN users u ON u.id = sc.created_by_id
        LEFT JOIN submission_call_responses scr ON scr.call_id = sc.id
        GROUP BY sc.id, u.first_name, u.last_name
        ORDER BY sc.created_at DESC
      `);
      res.json(rows);
    } catch (err) {
      console.error("[openCalls] GET /api/open-calls error:", err);
      res.status(500).json({ error: "Failed to fetch open calls" });
    }
  });

  // ─── CREATE a new open call (EIC only) ──────────────────────────────────────
  app.post("/api/open-calls", isAuthenticated, isEIC, async (req, res) => {
    try {
      const userId =
        (req.user as any)?.claims?.sub ||
        (req.user as any)?.id ||
        (req.session as any)?.userId;
      const { title, description, theme, prompt, startsAt, endsAt, flagLimit } = req.body;
      if (!title || !startsAt || !endsAt) {
        return res.status(400).json({ error: "title, startsAt and endsAt are required" });
      }
      const { rows } = await pool.query(`
        INSERT INTO submission_calls
          (title, description, theme, prompt, starts_at, ends_at, flag_limit, created_by_id, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'open')
        RETURNING *
      `, [title, description ?? null, theme ?? null, prompt ?? null, startsAt, endsAt, flagLimit ?? 3, userId]);
      res.status(201).json(rows[0]);
    } catch (err) {
      console.error("[openCalls] POST /api/open-calls error:", err);
      res.status(500).json({ error: "Failed to create open call" });
    }
  });

  // ─── GET single call with submissions ───────────────────────────────────────
  app.get("/api/open-calls/:id", isAuthenticated, isEditor, async (req, res) => {
    try {
      const { id } = req.params;
      const { rows: callRows } = await pool.query(
        `SELECT sc.*, u.first_name AS created_by_first_name, u.last_name AS created_by_last_name
         FROM submission_calls sc
         LEFT JOIN users u ON u.id = sc.created_by_id
         WHERE sc.id = $1`,
        [id]
      );
      if (!callRows[0]) return res.status(404).json({ error: "Not found" });

      const { rows: subRows } = await pool.query(`
        SELECT
          scr.*,
          w.title        AS writing_title,
          w.content      AS writing_content,
          w.genre        AS writing_genre,
          w.readiness    AS writing_readiness,
          u.first_name   AS writer_first_name,
          u.last_name    AS writer_last_name,
          u.email        AS writer_email
        FROM submission_call_responses scr
        LEFT JOIN writings w ON w.id = scr.writing_id
        LEFT JOIN users u ON u.id = scr.writer_id
        WHERE scr.call_id = $1
        ORDER BY scr.created_at ASC
      `, [id]);

      res.json({ call: callRows[0], submissions: subRows });
    } catch (err) {
      console.error("[openCalls] GET /api/open-calls/:id error:", err);
      res.status(500).json({ error: "Failed to fetch call" });
    }
  });

  // ─── UPDATE a call (EIC only) ────────────────────────────────────────────────
  app.patch("/api/open-calls/:id", isAuthenticated, isEIC, async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, theme, prompt, startsAt, endsAt, status, flagLimit } = req.body;
      const { rows } = await pool.query(`
        UPDATE submission_calls SET
          title       = COALESCE($1, title),
          description = COALESCE($2, description),
          theme       = COALESCE($3, theme),
          prompt      = COALESCE($4, prompt),
          starts_at   = COALESCE($5, starts_at),
          ends_at     = COALESCE($6, ends_at),
          status      = COALESCE($7, status),
          flag_limit  = COALESCE($8, flag_limit)
        WHERE id = $9
        RETURNING *
      `, [title, description, theme, prompt, startsAt, endsAt, status, flagLimit, id]);
      if (!rows[0]) return res.status(404).json({ error: "Not found" });
      res.json(rows[0]);
    } catch (err) {
      console.error("[openCalls] PATCH /api/open-calls/:id error:", err);
      res.status(500).json({ error: "Failed to update call" });
    }
  });

  // ─── DELETE a call (EIC only) ────────────────────────────────────────────────
  app.delete("/api/open-calls/:id", isAuthenticated, isEIC, async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query(`DELETE FROM submission_call_responses WHERE call_id = $1`, [id]);
      await pool.query(`DELETE FROM submission_calls WHERE id = $1`, [id]);
      res.json({ ok: true });
    } catch (err) {
      console.error("[openCalls] DELETE /api/open-calls/:id error:", err);
      res.status(500).json({ error: "Failed to delete call" });
    }
  });

  // ─── UPDATE a submission status (editor review) ──────────────────────────────
  app.patch("/api/open-calls/:id/submissions/:subId", isAuthenticated, isEditor, async (req, res) => {
    try {
      const { subId } = req.params;
      const { status } = req.body; // 'submitted' | 'reviewing' | 'accepted' | 'declined'
      if (!status) return res.status(400).json({ error: "status is required" });
      const { rows } = await pool.query(
        `UPDATE submission_call_responses SET status = $1 WHERE id = $2 RETURNING *`,
        [status, subId]
      );
      if (!rows[0]) return res.status(404).json({ error: "Not found" });
      res.json(rows[0]);
    } catch (err) {
      console.error("[openCalls] PATCH submission status error:", err);
      res.status(500).json({ error: "Failed to update submission" });
    }
  });
}
