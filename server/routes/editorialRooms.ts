import type { Express } from "express";
import { isAuthenticated } from "../replit_integrations/auth";
import { randomUUID } from "crypto";
import { pool } from "../db";

export function registerEditorialRoomRoutes(app: Express) {
  // —— THREADS ————————————————————————————————————————

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
      const editorId = req.user?.claims?.sub || req.user?.id;
      const { subject, writingId } = req.body;
      if (!subject?.trim()) {
        return res.status(400).json({ error: "subject is required" });
      }
      const { rows } = await pool.query(
        `INSERT INTO editorial_threads (id, subject, writing_id, created_by_editor_id)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [randomUUID(), subject.trim(), writingId || null, editorId]
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
        `SELECT
           etm.id,
           etm.thread_id,
           etm.author_id,
           etm.body AS content,
           etm.created_at,
           u.first_name || ' ' || u.last_name AS sender_name
         FROM editorial_thread_messages etm
         LEFT JOIN users u ON etm.author_id = u.id
         WHERE etm.thread_id = $1
         ORDER BY etm.created_at ASC`,
        [req.params.id]
      );
      res.json(rows);
    } catch (err) {
      console.error("[editorialRooms] GET /threads/:id/messages error:", err);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // POST /api/editorial/threads/:id/messages
  // Frontend sends { content }, we store it as body in the DB
  app.post("/api/editorial/threads/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const editorId = req.user?.claims?.sub || req.user?.id;
      // Frontend sends 'content', schema column is 'body'
      const content = req.body.content || req.body.body;
      if (!content?.trim()) {
        return res.status(400).json({ error: "content is required" });
      }
      const { rows } = await pool.query(
        `INSERT INTO editorial_thread_messages (id, thread_id, author_id, body)
         VALUES ($1, $2, $3, $4)
         RETURNING id, thread_id, author_id, body AS content, created_at`,
        [randomUUID(), req.params.id, editorId, content.trim()]
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

  // —— TASKS ————————————————————————————————————————

  // GET /api/editorial/tasks
  app.get("/api/editorial/tasks", isAuthenticated, async (req: any, res) => {
    try {
      const statusFilter = req.query.status;
      let query = `SELECT * FROM editorial_tasks`;
      const params: any[] = [];
      if (statusFilter && statusFilter !== 'all') {
        query += ` WHERE status = $1`;
        params.push(statusFilter);
      }
      query += ` ORDER BY created_at DESC`;
      const { rows } = await pool.query(query, params);
      res.json(rows);
    } catch (err) {
      console.error("[editorialRooms] GET /tasks error:", err);
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  // POST /api/editorial/tasks
  app.post("/api/editorial/tasks", isAuthenticated, async (req: any, res) => {
    try {
      const editorId = req.user?.claims?.sub || req.user?.id;
      const { title, description, assignedEditorId, writingId, priority, taskType } = req.body;
      if (!title?.trim()) {
        return res.status(400).json({ error: "title is required" });
      }
      const { rows } = await pool.query(
        `INSERT INTO editorial_tasks
         (id, title, description, assigned_editor_id, writing_id, priority, task_type, created_by_editor_id, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'open')
         RETURNING *`,
        [
          randomUUID(),
          title.trim(),
          description || null,
          assignedEditorId || null,
          writingId || null,
          priority || 'medium',
          taskType || 'ops',
          editorId
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
      const { status, assignedEditorId, boardColumn } = req.body;
      const { rows } = await pool.query(
        `UPDATE editorial_tasks
         SET
           status = COALESCE($1, status),
           assigned_editor_id = COALESCE($2, assigned_editor_id),
           board_column = COALESCE($3, board_column),
           updated_at = NOW()
         WHERE id = $4
         RETURNING *`,
        [status || null, assignedEditorId || null, boardColumn || null, req.params.id]
      );
      if (rows.length === 0) return res.status(404).json({ error: "Task not found" });
      res.json(rows[0]);
    } catch (err) {
      console.error("[editorialRooms] PATCH /tasks/:id error:", err);
      res.status(500).json({ error: "Failed to update task" });
    }
  });

  // DELETE /api/editorial/tasks/:id
  app.delete("/api/editorial/tasks/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { rowCount } = await pool.query(
        `DELETE FROM editorial_tasks WHERE id = $1`,
        [req.params.id]
      );
      if (rowCount === 0) return res.status(404).json({ error: "Task not found" });
      res.json({ success: true });
    } catch (err) {
      console.error("[editorialRooms] DELETE /tasks/:id error:", err);
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  // GET /api/editorial/tasks/:id/comments
  app.get("/api/editorial/tasks/:id/comments", isAuthenticated, async (req: any, res) => {
    try {
      const { rows } = await pool.query(
        `SELECT etc.*, u.first_name || ' ' || u.last_name AS author_name
         FROM editor_task_comments etc
         LEFT JOIN users u ON etc.author_id = u.id
         WHERE etc.task_id = $1
         ORDER BY etc.created_at ASC`,
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
      const editorId = req.user?.claims?.sub || req.user?.id;
      const { content } = req.body;
      if (!content?.trim()) {
        return res.status(400).json({ error: "content is required" });
      }
      const { rows } = await pool.query(
        `INSERT INTO editor_task_comments (id, task_id, author_id, content)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [randomUUID(), req.params.id, editorId, content.trim()]
      );
      res.status(201).json(rows[0]);
    } catch (err) {
      console.error("[editorialRooms] POST /tasks/:id/comments error:", err);
      res.status(500).json({ error: "Failed to post comment" });
    }
  });

  // —— FLAGS ————————————————————————————————————————

  // GET /api/editorial/flags
  app.get("/api/editorial/flags", isAuthenticated, async (req: any, res) => {
    try {
      const { rows } = await pool.query(
        `SELECT ef.*, w.title as writing_title, w.content as writing_content,
         u.username as author_username
         FROM editorial_flags ef
         LEFT JOIN writings w ON ef.writing_id = w.id
         LEFT JOIN users u ON ef.author_id = u.id
         ORDER BY ef.created_at DESC`
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
      const editorId = req.user?.claims?.sub || req.user?.id;
      const { decision, editorResponse, status } = req.body;
      const { rows } = await pool.query(
        `UPDATE editorial_flags
         SET
           decision = COALESCE($1, decision),
           editor_response = COALESCE($2, editor_response),
           status = COALESCE($3, status),
           seen_by_editor_id = $4,
           seen_at = NOW(),
           responded_at = NOW()
         WHERE id = $5
         RETURNING *`,
        [decision || null, editorResponse || null, status || null, editorId, req.params.id]
      );
      if (rows.length === 0) return res.status(404).json({ error: "Flag not found" });
      res.json(rows[0]);
    } catch (err) {
      console.error("[editorialRooms] PATCH /flags/:id error:", err);
      res.status(500).json({ error: "Failed to update flag" });
    }
  });
}
