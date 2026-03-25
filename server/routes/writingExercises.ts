import type { Express } from "express";
import { isAuthenticated } from "../replit_integrations/auth";
import { pool } from "../db";

function editorOnly(req: any, res: any, next: () => void) {
    if (req.user?.role !== "editor" && req.user?.role !== "editor_in_chief") {
    return res.status(403).json({ error: "Editor access required" });
  }
  next();
}

export function registerWritingExerciseRoutes(app: Express) {
  // GET all exercises
  app.get("/api/exercises", isAuthenticated, async (req: any, res) => {
    try {
            const isEditor = req.user?.role === "editor" || req.user?.role === "editor_in_chief";
      const result = await pool.query(
        isEditor
          ? `SELECT we.*, u.first_name || ' ' || u.last_name AS creator_name
             FROM writing_exercises we
             JOIN users u ON u.id = we.created_by_id
             ORDER BY we.created_at DESC`
          : `SELECT we.*, u.first_name || ' ' || u.last_name AS creator_name
             FROM writing_exercises we
             JOIN users u ON u.id = we.created_by_id
             WHERE we.is_active = true
               AND (we.closes_at IS NULL OR we.closes_at > NOW())
             ORDER BY we.created_at DESC`
      );
      res.json(result.rows);
    } catch (err) {
      console.error("[exercises] GET /api/exercises error:", err);
      res.status(500).json({ error: "Failed to fetch exercises" });
    }
  });

  // GET single exercise
  app.get("/api/exercises/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        `SELECT we.*, u.first_name || ' ' || u.last_name AS creator_name
         FROM writing_exercises we
         JOIN users u ON u.id = we.created_by_id
         WHERE we.id = $1`,
        [id]
      );
      if (!result.rows.length) return res.status(404).json({ error: "Not found" });
      res.json(result.rows[0]);
    } catch (err) {
      console.error("[exercises] GET /api/exercises/:id error:", err);
      res.status(500).json({ error: "Failed to fetch exercise" });
    }
  });

  // POST create exercise (editor only)
  app.post("/api/exercises", isAuthenticated, editorOnly, async (req: any, res) => {
    try {
      const { title, prompt, guidanceNote, genre, wordLimit, closesAt } = req.body;
      if (!title?.trim() || !prompt?.trim()) {
        return res.status(400).json({ error: "title and prompt are required" });
      }
      const editorId = req.user?.claims?.sub || req.user?.id;
      const result = await pool.query(
        `INSERT INTO writing_exercises
           (created_by_id, title, prompt, guidance_note, genre, word_limit, closes_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         RETURNING *`,
        [editorId, title.trim(), prompt.trim(), guidanceNote?.trim() || null, genre || "any", wordLimit || null, closesAt || null]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("[exercises] POST /api/exercises error:", err);
      res.status(500).json({ error: "Failed to create exercise" });
    }
  });

  // PATCH update exercise (editor only)
  app.patch("/api/exercises/:id", isAuthenticated, editorOnly, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { title, prompt, guidanceNote, genre, wordLimit, closesAt, isActive } = req.body;
      const result = await pool.query(
        `UPDATE writing_exercises
         SET title         = COALESCE($1, title),
             prompt        = COALESCE($2, prompt),
             guidance_note = COALESCE($3, guidance_note),
             genre         = COALESCE($4, genre),
             word_limit    = COALESCE($5, word_limit),
             closes_at     = COALESCE($6, closes_at),
             is_active     = COALESCE($7, is_active),
             updated_at    = NOW()
         WHERE id = $8
         RETURNING *`,
        [title || null, prompt || null, guidanceNote || null, genre || null, wordLimit || null, closesAt || null, isActive !== undefined ? isActive : null, id]
      );
      if (!result.rows.length) return res.status(404).json({ error: "Not found" });
      res.json(result.rows[0]);
    } catch (err) {
      console.error("[exercises] PATCH error:", err);
      res.status(500).json({ error: "Failed to update exercise" });
    }
  });

  // DELETE exercise (editor only)
  app.delete("/api/exercises/:id", isAuthenticated, editorOnly, async (req: any, res) => {
    try {
      const { id } = req.params;
      await pool.query(`DELETE FROM exercise_submissions WHERE exercise_id = $1`, [id]);
      await pool.query(`DELETE FROM writing_exercises WHERE id = $1`, [id]);
      res.json({ success: true });
    } catch (err) {
      console.error("[exercises] DELETE error:", err);
      res.status(500).json({ error: "Failed to delete exercise" });
    }
  });

  // GET my submission for an exercise
  app.get("/api/exercises/:id/my-submission", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.claims?.sub || req.user?.id;
      const result = await pool.query(
        `SELECT * FROM exercise_submissions WHERE exercise_id=$1 AND author_id=$2 LIMIT 1`,
        [id, userId]
      );
      res.json(result.rows[0] || null);
    } catch (err) {
      console.error("[exercises] GET my-submission error:", err);
      res.status(500).json({ error: "Failed to fetch submission" });
    }
  });

  // POST / upsert submission
  app.post("/api/exercises/:id/submit", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.claims?.sub || req.user?.id;
      const { content, status } = req.body;
      if (!content?.trim()) return res.status(400).json({ error: "content is required" });

      const existing = await pool.query(
        `SELECT id FROM exercise_submissions WHERE exercise_id=$1 AND author_id=$2`,
        [id, userId]
      );

      let result;
      if (existing.rows.length) {
        result = await pool.query(
          `UPDATE exercise_submissions
           SET content=$1, status=COALESCE($2,status), updated_at=NOW()
           WHERE exercise_id=$3 AND author_id=$4
           RETURNING *`,
          [content.trim(), status || null, id, userId]
        );
      } else {
        result = await pool.query(
          `INSERT INTO exercise_submissions (exercise_id, author_id, content, status)
           VALUES ($1,$2,$3,$4)
           RETURNING *`,
          [id, userId, content.trim(), status || "submitted"]
        );
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error("[exercises] POST submit error:", err);
      res.status(500).json({ error: "Failed to save submission" });
    }
  });

  // GET all submissions for an exercise (editor only)
  app.get("/api/exercises/:id/submissions", isAuthenticated, editorOnly, async (req: any, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        `SELECT es.*, u.first_name || ' ' || u.last_name AS author_name, u.username
         FROM exercise_submissions es
         JOIN users u ON u.id = es.author_id
         WHERE es.exercise_id=$1
         ORDER BY es.created_at DESC`,
        [id]
      );
      res.json(result.rows);
    } catch (err) {
      console.error("[exercises] GET submissions error:", err);
      res.status(500).json({ error: "Failed to fetch submissions" });
    }
  });

  // PATCH add editor note to a submission (editor only)
  app.patch("/api/exercise-submissions/:subId/note", isAuthenticated, editorOnly, async (req: any, res) => {
    try {
      const { subId } = req.params;
      const { editorNote } = req.body;
      const result = await pool.query(
        `UPDATE exercise_submissions SET editor_note=$1, status='noted', updated_at=NOW()
         WHERE id=$2 RETURNING *`,
        [editorNote || "", subId]
      );
      if (!result.rows.length) return res.status(404).json({ error: "Not found" });
      res.json(result.rows[0]);
    } catch (err) {
      console.error("[exercises] PATCH note error:", err);
      res.status(500).json({ error: "Failed to save note" });
    }
  });

  // POST AI prompt adaptation — generates a personalised nudge based on exercise + user's draft
  app.post("/api/exercises/:id/ai-nudge", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { draft } = req.body;

      // Fetch the exercise
      const exResult = await pool.query(
        `SELECT title, prompt, guidance_note, genre FROM writing_exercises WHERE id=$1`,
        [id]
      );
      if (!exResult.rows.length) return res.status(404).json({ error: "Exercise not found" });
      const ex = exResult.rows[0];

      // Build a prompt for the AI nudge
      const systemPrompt = `You are a warm, encouraging literary editor at The Page Gallery Journal — a beautiful literary journal and writing garden. You give brief, specific, craft-focused writing nudges. Be poetic but precise. Maximum 3 sentences.`;

      const userMessage = `Exercise: "${ex.title}"
Prompt: ${ex.prompt}${ex.guidance_note ? `\nGuidance: ${ex.guidance_note}` : ""}\nGenre: ${ex.genre}\n\nWriter's current draft:\n${draft || "(nothing yet)"}

Give a short, specific nudge to help them deepen or develop this piece. Do not rewrite their work.`;

      // Use the OpenAI API if available, otherwise return a graceful fallback
      let nudge = "Trust what you've written. Read it aloud and notice where your voice rises — follow that.";

      try {
        const OpenAI = (await import("openai")).default;
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          max_tokens: 120,
          temperature: 0.85,
        });
        nudge = completion.choices[0]?.message?.content?.trim() || nudge;
      } catch (aiErr) {
        // AI unavailable — return graceful fallback, don't crash
        console.warn("[exercises] AI nudge unavailable, using fallback");
      }

      res.json({ nudge });
    } catch (err) {
      console.error("[exercises] AI nudge error:", err);
      res.status(500).json({ error: "Failed to generate nudge" });
    }
  });
}
