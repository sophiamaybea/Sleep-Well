import type { Express } from "express";
import { isAuthenticated } from "../replit_integrations/auth";
import { randomUUID } from "crypto";
import { pool } from "../db";

/**
 * CENTRALISED AUTHOR ↔ EDITOR CONVERSATIONS
 *
 * These routes power the shared messaging layer between authors and editors.
 * Both parties can see the same conversation; unread badges are tracked per message.
 *
 * Author-facing: visible from the writer's Garden dashboard.
 * Editor-facing: visible from EditorStudio, linked to any submission/piece.
 *
 * API shape:
 *   GET    /api/author-editor/conversations           — list convos for current user
 *   POST   /api/author-editor/conversations           — start a new convo (author or editor)
 *   GET    /api/author-editor/conversations/:id       — single convo metadata
 *   GET    /api/author-editor/conversations/:id/messages  — all messages in thread
 *   POST   /api/author-editor/conversations/:id/messages  — send a message
 *   PATCH  /api/author-editor/conversations/:id/read  — mark all as read for current user
 *   PATCH  /api/author-editor/conversations/:id/status — resolve / archive (editor only)
 */
export function registerAuthorEditorConversationRoutes(app: Express) {

  // ─── LIST CONVERSATIONS ───────────────────────────────────────────────────
  // Writers see only their own conversations.
  // Editors see all conversations.
  app.get("/api/author-editor/conversations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      const role   = req.user?.role || req.user?.claims?.role || "writer";
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

  // ─── START A NEW CONVERSATION ─────────────────────────────────────────────
  app.post("/api/author-editor/conversations", isAuthenticated, async (req: any, res) => {
    try {
      const userId  = req.user?.claims?.sub || req.user?.id;
      const role    = req.user?.role || req.user?.claims?.role || "writer";
      const isEditor = ["editor", "editor_in_chief"].includes(role);

      const { subject, writingId, authorId, firstMessage } = req.body;

      // If the requester is an editor, they specify the authorId.
      // If the requester is a writer, authorId === their own id.
      const resolvedAuthorId = isEditor ? (authorId || userId) : userId;

      if (!firstMessage?.trim()) {
        return res.status(400).json({ error: "firstMessage is required" });
      }

      const convId = randomUUID();

      await pool.query(
        `INSERT INTO author_editor_conversations
          (id, author_id, writing_id, subject, status, last_sender_id, last_message_at)
         VALUES ($1, $2, $3, $4, 'open', $5, NOW())`,
        [convId, resolvedAuthorId, writingId || null, (subject || "General").trim(), userId]
      );

      await pool.query(
        `INSERT INTO author_editor_messages
          (id, conversation_id, sender_id, sender_role, body)
         VALUES ($1, $2, $3, $4, $5)`,
        [randomUUID(), convId, userId, role, firstMessage.trim()]
      );

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

  // ─── SINGLE CONVERSATION METADATA ────────────────────────────────────────
  app.get("/api/author-editor/conversations/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      const role   = req.user?.role || req.user?.claims?.role || "writer";
      const isEditor = ["editor", "editor_in_chief"].includes(role);

      const { rows } = await pool.query(
        `SELECT
          c.*,
          w.title AS writing_title,
          au.first_name || ' ' || au.last_name AS author_name
        FROM author_editor_conversations c
        LEFT JOIN writings w ON c.writing_id = w.id
        LEFT JOIN users au ON c.author_id = au.id
        WHERE c.id = $1
          AND ($2 OR c.author_id = $3)`,
        [req.params.id, isEditor, userId]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      res.json(rows[0]);
    } catch (err) {
      console.error("[authorEditorConversations] GET /conversations/:id error:", err);
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  // ─── LIST MESSAGES ────────────────────────────────────────────────────────
  app.get("/api/author-editor/conversations/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId   = req.user?.claims?.sub || req.user?.id;
      const role     = req.user?.role || req.user?.claims?.role || "writer";
      const isEditor = ["editor", "editor_in_chief"].includes(role);

      // Access guard: writers can only see their own conversations
      if (!isEditor) {
        const { rows: guard } = await pool.query(
          `SELECT id FROM author_editor_conversations WHERE id = $1 AND author_id = $2`,
          [req.params.id, userId]
        );
        if (guard.length === 0) {
          return res.status(403).json({ error: "Forbidden" });
        }
      }

      const { rows } = await pool.query(
        `SELECT
          m.*,
          u.first_name || ' ' || u.last_name AS sender_name
        FROM author_editor_messages m
        LEFT JOIN users u ON m.sender_id = u.id
        WHERE m.conversation_id = $1
        ORDER BY m.created_at ASC`,
        [req.params.id]
      );
      res.json(rows);
    } catch (err) {
      console.error("[authorEditorConversations] GET /messages error:", err);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // ─── SEND A MESSAGE ───────────────────────────────────────────────────────
  app.post("/api/author-editor/conversations/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId   = req.user?.claims?.sub || req.user?.id;
      const role     = req.user?.role || req.user?.claims?.role || "writer";
      const isEditor = ["editor", "editor_in_chief"].includes(role);
      const { body } = req.body;

      if (!body?.trim()) {
        return res.status(400).json({ error: "body is required" });
      }

      // Access guard
      if (!isEditor) {
        const { rows: guard } = await pool.query(
          `SELECT id FROM author_editor_conversations WHERE id = $1 AND author_id = $2`,
          [req.params.id, userId]
        );
        if (guard.length === 0) {
          return res.status(403).json({ error: "Forbidden" });
        }
      }

      const msgId = randomUUID();
      await pool.query(
        `INSERT INTO author_editor_messages
          (id, conversation_id, sender_id, sender_role, body)
         VALUES ($1, $2, $3, $4, $5)`,
        [msgId, req.params.id, userId, role, body.trim()]
      );

      // Update conversation timestamp & last sender
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
      console.error("[authorEditorConversations] POST /messages error:", err);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // ─── MARK CONVERSATION AS READ ────────────────────────────────────────────
  // Marks all messages NOT sent by the current user as read.
  app.patch("/api/author-editor/conversations/:id/read", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      await pool.query(
        `UPDATE author_editor_messages
         SET is_read = true
         WHERE conversation_id = $1
           AND sender_id != $2
           AND is_read = false`,
        [req.params.id, userId]
      );
      res.json({ success: true });
    } catch (err) {
      console.error("[authorEditorConversations] PATCH /read error:", err);
      res.status(500).json({ error: "Failed to mark as read" });
    }
  });

  // ─── UPDATE STATUS (editor only) ──────────────────────────────────────────
  app.patch("/api/author-editor/conversations/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      const role     = req.user?.role || req.user?.claims?.role || "writer";
      const isEditor = ["editor", "editor_in_chief"].includes(role);
      if (!isEditor) {
        return res.status(403).json({ error: "Editors only" });
      }

      const { status } = req.body; // 'open' | 'resolved' | 'archived'
      if (!["open", "resolved", "archived"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const { rows } = await pool.query(
        `UPDATE author_editor_conversations
         SET status = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [status, req.params.id]
      );

      if (rows.length === 0) return res.status(404).json({ error: "Conversation not found" });
      res.json(rows[0]);
    } catch (err) {
      console.error("[authorEditorConversations] PATCH /status error:", err);
      res.status(500).json({ error: "Failed to update status" });
    }
  });

  // ─── UNREAD COUNT (for nav badges) ────────────────────────────────────────
  app.get("/api/author-editor/unread-count", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      const { rows } = await pool.query(
        `SELECT COUNT(*) AS count
         FROM author_editor_messages m
         JOIN author_editor_conversations c ON m.conversation_id = c.id
         WHERE m.is_read = false
           AND m.sender_id != $1
           AND (c.author_id = $1 OR $2)`,
        [userId, false]  // writers only see their own; isEditor handled at list level
      );
      res.json({ count: parseInt(rows[0].count, 10) });
    } catch (err) {
      console.error("[authorEditorConversations] GET /unread-count error:", err);
      res.status(500).json({ error: "Failed to fetch unread count" });
    }
  });
}
