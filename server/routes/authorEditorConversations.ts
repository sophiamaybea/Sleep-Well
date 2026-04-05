import type { Express } from "express";
import { isAuthenticated } from "../replit_integrations/auth";
import { randomUUID } from "crypto";
import { pool } from "../db";

/**
 * CENTRALISED AUTHOR ↔ EDITOR CONVERSATIONS
 */
export function registerAuthorEditorConversationRoutes(app: Express) {
  // ─── LIST CONVERSATIONS ───────────────────────────────────────────────────
  app.get("/api/author-editor-conversations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      const role = req.user?.role || req.user?.claims?.role || "writer";
      const isEditor = ["editor", "editor_in_chief"].includes(role);

      const { rows } = await pool.query(
        `SELECT 
          c.*,
          w.title AS writing_title,
          au.first_name || ' ' || au.last_name AS author_name,
          (
            SELECT COUNT(*)
            FROM author_editor_messages m
            WHERE m.conversation_id = c.id
            AND m.is_read = false
            AND m.sender_id != $1
          ) AS unread_count
        FROM author_editor_conversations c
        LEFT JOIN writings w ON c.writing_id = w.id
        LEFT JOIN users au ON c.author_id = au.id
        WHERE ($2 OR c.author_id = $1)
        ORDER BY c.last_message_at DESC`,
        [userId, isEditor]
      );
      res.json(rows);
    } catch (err) {
      console.error("[authorEditorConversations] GET /conversations error:", err);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  // ─── GET CONVERSATION BY WRITING ID ──────────────────────────────────────
  app.get("/api/author-editor-conversations/writing/:writingId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      const role = req.user?.role || req.user?.claims?.role || "writer";
      const isEditor = ["editor", "editor_in_chief"].includes(role);

      let rows;
      if (isEditor) {
        // Editors can find any conversation for a writing
        const result = await pool.query(
          `SELECT * FROM author_editor_conversations WHERE writing_id = $1 ORDER BY last_message_at DESC LIMIT 1`,
          [req.params.writingId]
        );
        rows = result.rows;
      } else {
        // Writers only see their own conversations
        const result = await pool.query(
          `SELECT * FROM author_editor_conversations WHERE writing_id = $1 AND author_id = $2`,
          [req.params.writingId, userId]
        );
        rows = result.rows;
      }

      if (rows.length === 0) return res.json(null);
      res.json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  // ─── START A NEW CONVERSATION ─────────────────────────────────────────────
  app.post("/api/author-editor-conversations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      const role = req.user?.role || req.user?.claims?.role || "writer";
      const isEditor = ["editor", "editor_in_chief"].includes(role);
      const { subject, writingId, authorId, body } = req.body;
      const resolvedAuthorId = isEditor ? (authorId || userId) : userId;
      const convId = randomUUID();
      await pool.query(
        `INSERT INTO author_editor_conversations
          (id, author_id, writing_id, subject, status, last_sender_id, last_message_at)
          VALUES ($1, $2, $3, $4, 'open', $5, NOW())`,
        [convId, resolvedAuthorId, writingId || null, (subject || "General").trim(), userId]
      );
      if (body?.trim()) {
        await pool.query(
          `INSERT INTO author_editor_messages
            (id, conversation_id, sender_id, sender_role, body)
            VALUES ($1, $2, $3, $4, $5)`,
          [randomUUID(), convId, userId, role, body.trim()]
        );
      }
      const { rows } = await pool.query(
        `SELECT * FROM author_editor_conversations WHERE id = $1`,
        [convId]
      );
      res.status(201).json(rows[0]);
    } catch (err) {
      console.error("[authorEditorConversations] POST /conversations error:", err);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  // ─── LIST MESSAGES ────────────────────────────────────────────────────────
  app.get("/api/author-editor-conversations/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      const role = req.user?.role || req.user?.claims?.role || "writer";
      const isEditor = ["editor", "editor_in_chief"].includes(role);
      if (!isEditor) {
        const { rows: guard } = await pool.query(
          `SELECT id FROM author_editor_conversations WHERE id = $1 AND author_id = $2`,
          [req.params.id, userId]
        );
        if (guard.length === 0) return res.status(403).json({ error: "Forbidden" });
      }
      const { rows } = await pool.query(
        `SELECT m.*, u.first_name || ' ' || u.last_name AS sender_name
        FROM author_editor_messages m
        LEFT JOIN users u ON m.sender_id = u.id
        WHERE m.conversation_id = $1
        ORDER BY m.created_at ASC`,
        [req.params.id]
      );
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // ─── SEND A MESSAGE ───────────────────────────────────────────────────────
  app.post("/api/author-editor-conversations/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      const role = req.user?.role || req.user?.claims?.role || "writer";
      const isEditor = ["editor", "editor_in_chief"].includes(role);
      const { body } = req.body;
      if (!body?.trim()) return res.status(400).json({ error: "body is required" });
      if (!isEditor) {
        const { rows: guard } = await pool.query(
          `SELECT id FROM author_editor_conversations WHERE id = $1 AND author_id = $2`,
          [req.params.id, userId]
        );
        if (guard.length === 0) return res.status(403).json({ error: "Forbidden" });
      }
      const msgId = randomUUID();
      await pool.query(
        `INSERT INTO author_editor_messages
          (id, conversation_id, sender_id, sender_role, body)
          VALUES ($1, $2, $3, $4, $5)`,
        [msgId, req.params.id, userId, role, body.trim()]
      );
      await pool.query(
        `UPDATE author_editor_conversations
        SET last_message_at = NOW(), last_sender_id = $1, updated_at = NOW()
        WHERE id = $2`,
        [userId, req.params.id]
      );
      const { rows } = await pool.query(
        `SELECT m.*, u.first_name || ' ' || u.last_name AS sender_name
        FROM author_editor_messages m
        LEFT JOIN users u ON m.sender_id = u.id
        WHERE m.id = $1`,
        [msgId]
      );
      res.status(201).json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: "Failed to send message" });
    }
  });
}
