import type { Express } from "express";
import { isAuthenticated } from "../replit_integrations/auth";
import { randomUUID } from "crypto";
import { pool } from "../db";

export function registerEditorialRoomRoutes(app: Express) {

  // —— THREADS ——————————————————————————————————————————

  // GET /api/editorial/threads
  app.get("/api/editorial/threads", isAuthenticated, async (req: any, res) => {
    try {
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
      const { rows } = await pool.query(
        `INSERT INTO editorial_threads (id, subject, writing_id, created_by, updated_at)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING *`,
        [randomUUID(), subject.trim(), writingId || null, userId]
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
      const { content } = req.body;
      if (!content?.trim()) {
        return res.status(400).json({ error: "content is required" });
      }
      const { rows } = await pool.query(
        `INSERT INTO editorial_thread_messages (id, thread_id, author_id, content)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [randomUUID(), req.params.id, userId, content.trim()]
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

  // —— TASKS ——————————————————————————————————————————

  // GET /api/editorial/tasks
  app.get("/api/editorial/tasks", isAuthenticated, async (req: any, res) => {
    try {
      const { rows } = await pool.query(
        `SELECT * FROM editorial_tasks ORDER BY created_at DESC`
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
      const { title, description, assignedTo, writingId, priority } = req.body;
      if (!title?.trim()) {
        return res.status(400).json({ error: "title is required" });
      }
      const { rows } = await pool.query(
        `INSERT INTO editorial_tasks (id, title, description, assigned_to, writing_id, priority, created_by, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'open')
         RETURNING *`,
        [randomUUID(), title.trim(), description || null, assignedTo || null, writingId || null, priority || 'medium', userId]
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
      const { status, assignedTo } = req.body;
      const { rows } = await pool.query(
        `UPDATE editorial_tasks
         SET status = COALESCE($1, status), assigned_to = COALESCE($2, assigned_to)
         WHERE id = $3
         RETURNING *`,
        [status || null, assignedTo || null, req.params.id]
      );
      if (rows.length === 0) return res.status(404).json({ error: "Task not found" });
      res.json(rows[0]);
    } catch (err) {
      console.error("[editorialRooms] PATCH /tasks/:id error:", err);
      res.status(500).json({ error: "Failed to update task" });
    }
  });

  // GET /api/editorial/tasks/:id/comments
  app.get("/api/editorial/tasks/:id/comments", isAuthenticated, async (req: any, res) => {
    try {
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

  // —— FLAGS ——————————————————————————————————————————

  // GET /api/editorial/flags
  app.get("/api/editorial/flags", isAuthenticated, async (req: any, res) => {
    try {
      const { rows } = await pool.query(
        `SELECT * FROM editorial_flags ORDER BY created_at DESC`
      );
      res.json(rows);
    } catch (err) {
      console.error("[editorialRooms] GET /flags error:", err);
      res.status(500).json({ error: "Failed to fetch flags" });
    }
  });

  // PATCH /api/editorial/flags/:id
  app.patch("/api/editorial/flags/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { status, resolution } = req.body;
      const { rows } = await pool.query(
        `UPDATE editorial_flags
         SET status = COALESCE($1, status), resolution = COALESCE($2, resolution)
         WHERE id = $3
         RETURNING *`,
        [status || null, resolution || null, req.params.id]
      );
      if (rows.length === 0) return res.status(404).json({ error: "Flag not found" });
      res.json(rows[0]);
    } catch (err) {
      console.error("[editorialRooms] PATCH /flags/:id error:", err);
      res.status(500).json({ error: "Failed to update flag" });
    }
  });

}
