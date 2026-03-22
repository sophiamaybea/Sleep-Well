import type { Express } from "express";
import { isAuthenticated } from "../replit_integrations/auth";
import { randomUUID } from "crypto";

export function registerEditorialRoomRoutes(app: Express) {

  // ─── THREADS ──────────────────────────────────────────────────────────

  // GET /api/editorial/threads
  app.get("/api/editorial/threads", isAuthenticated, async (req: any, res) => {
    try {
      const { pool } = await import("../db");
      const { rows } = await pool.query(
        `SELECT * FROM editorial_threads ORDER BY updated_at DESC`
      );
      res.json(rows);
    } catch (err) {
      console.error("[editorialRooms] GET /threads error:", err);
      res.status(500).json({ error: "Failed to fetch threads" });
    }
  });

  // POST /api/editorial/threads
  app.post("/api/editorial/threads", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      const { subject, writingId } = req.body;
      if (!subject?.trim()) {
        return res.status(400).json({ error: "subject is required" });
      }
      const { pool } = await import("../db");
      const { rows } = await pool.query(
        `INSERT INTO editorial_threads (id, subject, writing_id, created_by_editor_id)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [randomUUID(), subject.trim(), writingId ?? null, userId]
      );
      res.status(201).json(rows[0]);
    } catch (err) {
      console.error("[editorialRooms] POST /threads error:", err);
      res.status(500).json({ error: "Failed to create thread" });
    }
  });

  // GET /api/editorial/threads/:id/messages
  app.get("/api/editorial/threads/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const { pool } = await import("../db");
      const { rows } = await pool.query(
        `SELECT * FROM editorial_thread_messages WHERE thread_id = $1 ORDER BY created_at ASC`,
        [req.params.id]
      );
      res.json(rows);
    } catch (err) {
      console.error("[editorialRooms] GET /threads/:id/messages error:", err);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // POST /api/editorial/threads/:id/messages
  app.post("/api/editorial/threads/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      const { body } = req.body;
      if (!body?.trim()) {
        return res.status(400).json({ error: "body is required" });
      }
      const { pool } = await import("../db");
      const { rows } = await pool.query(
        `INSERT INTO editorial_thread_messages (id, thread_id, author_id, body)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [randomUUID(), req.params.id, userId, body.trim()]
      );
      await pool.query(
        `UPDATE editorial_threads SET updated_at = NOW() WHERE id = $1`,
        [req.params.id]
      );
      res.status(201).json(rows[0]);
    } catch (err) {
      console.error("[editorialRooms] POST /threads/:id/messages error:", err);
      res.status(500).json({ error: "Failed to post message" });
    }
  });

  // ─── TASKS ────────────────────────────────────────────────────────────

  // GET /api/editorial/tasks
  app.get("/api/editorial/tasks", isAuthenticated, async (req: any, res) => {
    try {
      const { pool } = await import("../db");
      const { rows } = await pool.query(
        `SELECT * FROM editorial_tasks ORDER BY sort_order ASC, created_at DESC`
      );
      res.json(rows);
    } catch (err) {
      console.error("[editorialRooms] GET /tasks error:", err);
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  // POST /api/editorial/tasks
  app.post("/api/editorial/tasks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      const { title, description, assignedEditorId, status, dueDate,
              issueId, writingId, taskType, boardColumn, priority } = req.body;
      if (!title?.trim()) {
        return res.status(400).json({ error: "title is required" });
      }
      const { pool } = await import("../db");
      const { rows } = await pool.query(
        `INSERT INTO editorial_tasks
           (id, title, description, assigned_editor_id, created_by_editor_id,
            status, due_date, issue_id, writing_id, task_type, board_column, priority)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         RETURNING *`,
        [
          randomUUID(),
          title.trim(),
          description ?? null,
          assignedEditorId ?? null,
          userId,
          status ?? "open",
          dueDate ? new Date(dueDate) : null,
          issueId ?? null,
          writingId ?? null,
          taskType ?? "ops",
          boardColumn ?? "inbox",
          priority ?? "medium",
        ]
      );
      res.status(201).json(rows[0]);
    } catch (err) {
      console.error("[editorialRooms] POST /tasks error:", err);
      res.status(500).json({ error: "Failed to create task" });
    }
  });

  // PATCH /api/editorial/tasks/:id
  app.patch("/api/editorial/tasks/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { pool } = await import("../db");
      const fields: string[] = [];
      const vals: any[] = [];
      let i = 1;
      const map: Record<string, string> = {
        title: "title", description: "description",
        assignedEditorId: "assigned_editor_id", status: "status",
        dueDate: "due_date", issueId: "issue_id", writingId: "writing_id",
        taskType: "task_type", boardColumn: "board_column",
        priority: "priority", sortOrder: "sort_order", completedAt: "completed_at",
      };
      for (const [key, col] of Object.entries(map)) {
        if (key in req.body) {
          fields.push(`${col} = $${i++}`);
          vals.push(key === "dueDate" && req.body[key] ? new Date(req.body[key]) : req.body[key]);
        }
      }
      if (req.body.status === "done" && !("completedAt" in req.body)) {
        fields.push(`completed_at = $${i++}`);
        vals.push(new Date());
      }
      fields.push(`updated_at = $${i++}`);
      vals.push(new Date());
      vals.push(req.params.id);
      const { rows } = await pool.query(
        `UPDATE editorial_tasks SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`,
        vals
      );
      if (!rows[0]) return res.status(404).json({ error: "Task not found" });
      res.json(rows[0]);
    } catch (err) {
      console.error("[editorialRooms] PATCH /tasks/:id error:", err);
      res.status(500).json({ error: "Failed to update task" });
    }
  });

  // DELETE /api/editorial/tasks/:id
  app.delete("/api/editorial/tasks/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { pool } = await import("../db");
      await pool.query(`DELETE FROM editorial_tasks WHERE id = $1`, [req.params.id]);
      res.json({ success: true });
    } catch (err) {
      console.error("[editorialRooms] DELETE /tasks/:id error:", err);
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  // GET /api/editorial/tasks/:id/comments
  app.get("/api/editorial/tasks/:id/comments", isAuthenticated, async (req: any, res) => {
    try {
      const { pool } = await import("../db");
      const { rows } = await pool.query(
        `SELECT * FROM editor_task_comments WHERE task_id = $1 ORDER BY created_at ASC`,
        [req.params.id]
      );
      res.json(rows);
    } catch (err) {
      console.error("[editorialRooms] GET /tasks/:id/comments error:", err);
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  // POST /api/editorial/tasks/:id/comments
  app.post("/api/editorial/tasks/:id/comments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      const { content } = req.body;
      if (!content?.trim()) {
        return res.status(400).json({ error: "content is required" });
      }
      const { pool } = await import("../db");
      const { rows } = await pool.query(
        `INSERT INTO editor_task_comments (id, task_id, author_id, content)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [randomUUID(), req.params.id, userId, content.trim()]
      );
      res.status(201).json(rows[0]);
    } catch (err) {
      console.error("[editorialRooms] POST /tasks/:id/comments error:", err);
      res.status(500).json({ error: "Failed to post comment" });
    }
  });
}
