import type { Express } from "express";
import { db } from "../db";
import { isAuthenticated } from "../replit_integrations/auth";
import {
  editorialThreads,
  editorialThreadMessages,
  editorialTasks,
  editorTaskComments,
} from "@shared/schema";
import { eq, desc, asc } from "drizzle-orm";
import { randomUUID } from "crypto";

export function registerEditorialRoomRoutes(app: Express) {

  // ─── THREADS ──────────────────────────────────────────────────────────────

  // GET /api/editorial/threads
  app.get("/api/editorial/threads", isAuthenticated, async (req, res) => {
    try {
      const threads = await db
        .select()
        .from(editorialThreads)
        .orderBy(desc(editorialThreads.updatedAt));
      res.json(threads);
    } catch (err) {
      console.error("[editorialRooms] GET /threads error:", err);
      res.status(500).json({ error: "Failed to fetch threads" });
    }
  });

  // POST /api/editorial/threads
  app.post("/api/editorial/threads", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as { id: string };
      const { subject, writingId } = req.body;
      if (!subject?.trim()) {
        return res.status(400).json({ error: "subject is required" });
      }
      const [thread] = await db
        .insert(editorialThreads)
        .values({
          id: randomUUID(),
          subject: subject.trim(),
          writingId: writingId ?? null,
          createdByEditorId: user.id,
        })
        .returning();
      res.status(201).json(thread);
    } catch (err) {
      console.error("[editorialRooms] POST /threads error:", err);
      res.status(500).json({ error: "Failed to create thread" });
    }
  });

  // GET /api/editorial/threads/:id/messages
  app.get("/api/editorial/threads/:id/messages", isAuthenticated, async (req, res) => {
    try {
      const messages = await db
        .select()
        .from(editorialThreadMessages)
        .where(eq(editorialThreadMessages.threadId, req.params.id))
        .orderBy(asc(editorialThreadMessages.createdAt));
      res.json(messages);
    } catch (err) {
      console.error("[editorialRooms] GET /threads/:id/messages error:", err);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // POST /api/editorial/threads/:id/messages
  app.post("/api/editorial/threads/:id/messages", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as { id: string };
      const { body } = req.body;
      if (!body?.trim()) {
        return res.status(400).json({ error: "body is required" });
      }
      const [message] = await db
        .insert(editorialThreadMessages)
        .values({
          id: randomUUID(),
          threadId: req.params.id,
          authorId: user.id,
          body: body.trim(),
        })
        .returning();
      // bump thread updatedAt
      await db
        .update(editorialThreads)
        .set({ updatedAt: new Date() })
        .where(eq(editorialThreads.id, req.params.id));
      res.status(201).json(message);
    } catch (err) {
      console.error("[editorialRooms] POST /threads/:id/messages error:", err);
      res.status(500).json({ error: "Failed to post message" });
    }
  });

  // ─── TASKS ────────────────────────────────────────────────────────────────

  // GET /api/editorial/tasks
  app.get("/api/editorial/tasks", isAuthenticated, async (req, res) => {
    try {
      const tasks = await db
        .select()
        .from(editorialTasks)
        .orderBy(asc(editorialTasks.sortOrder), desc(editorialTasks.createdAt));
      res.json(tasks);
    } catch (err) {
      console.error("[editorialRooms] GET /tasks error:", err);
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  // POST /api/editorial/tasks
  app.post("/api/editorial/tasks", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as { id: string };
      const {
        title,
        description,
        assignedEditorId,
        status,
        dueDate,
        issueId,
        writingId,
        taskType,
        boardColumn,
        priority,
      } = req.body;
      if (!title?.trim()) {
        return res.status(400).json({ error: "title is required" });
      }
      const [task] = await db
        .insert(editorialTasks)
        .values({
          id: randomUUID(),
          title: title.trim(),
          description: description ?? null,
          assignedEditorId: assignedEditorId ?? null,
          createdByEditorId: user.id,
          status: status ?? "open",
          dueDate: dueDate ? new Date(dueDate) : null,
          issueId: issueId ?? null,
          writingId: writingId ?? null,
          taskType: taskType ?? "ops",
          boardColumn: boardColumn ?? "inbox",
          priority: priority ?? "medium",
        })
        .returning();
      res.status(201).json(task);
    } catch (err) {
      console.error("[editorialRooms] POST /tasks error:", err);
      res.status(500).json({ error: "Failed to create task" });
    }
  });

  // PATCH /api/editorial/tasks/:id
  app.patch("/api/editorial/tasks/:id", isAuthenticated, async (req, res) => {
    try {
      const updates: Record<string, unknown> = { updatedAt: new Date() };
      const allowed = [
        "title", "description", "assignedEditorId", "status",
        "dueDate", "issueId", "writingId", "taskType",
        "boardColumn", "priority", "sortOrder", "completedAt",
      ];
      for (const key of allowed) {
        if (key in req.body) {
          updates[key] = key === "dueDate" && req.body[key]
            ? new Date(req.body[key])
            : req.body[key];
        }
      }
      if (req.body.status === "done" && !("completedAt" in req.body)) {
        updates.completedAt = new Date();
      }
      const [task] = await db
        .update(editorialTasks)
        .set(updates)
        .where(eq(editorialTasks.id, req.params.id))
        .returning();
      if (!task) return res.status(404).json({ error: "Task not found" });
      res.json(task);
    } catch (err) {
      console.error("[editorialRooms] PATCH /tasks/:id error:", err);
      res.status(500).json({ error: "Failed to update task" });
    }
  });

  // DELETE /api/editorial/tasks/:id
  app.delete("/api/editorial/tasks/:id", isAuthenticated, async (req, res) => {
    try {
      await db
        .delete(editorialTasks)
        .where(eq(editorialTasks.id, req.params.id));
      res.json({ success: true });
    } catch (err) {
      console.error("[editorialRooms] DELETE /tasks/:id error:", err);
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  // GET /api/editorial/tasks/:id/comments
  app.get("/api/editorial/tasks/:id/comments", isAuthenticated, async (req, res) => {
    try {
      const comments = await db
        .select()
        .from(editorTaskComments)
        .where(eq(editorTaskComments.taskId, req.params.id))
        .orderBy(asc(editorTaskComments.createdAt));
      res.json(comments);
    } catch (err) {
      console.error("[editorialRooms] GET /tasks/:id/comments error:", err);
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  // POST /api/editorial/tasks/:id/comments
  app.post("/api/editorial/tasks/:id/comments", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as { id: string };
      const { content } = req.body;
      if (!content?.trim()) {
        return res.status(400).json({ error: "content is required" });
      }
      const [comment] = await db
        .insert(editorTaskComments)
        .values({
          id: randomUUID(),
          taskId: req.params.id,
          authorId: user.id,
          content: content.trim(),
        })
        .returning();
      res.status(201).json(comment);
    } catch (err) {
      console.error("[editorialRooms] POST /tasks/:id/comments error:", err);
      res.status(500).json({ error: "Failed to post comment" });
    }
  });
}
