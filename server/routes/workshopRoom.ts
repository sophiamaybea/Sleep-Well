import { Router } from "express";
import { db } from "../db";
import { workshopSessions, workshopSessionParticipants, workshopSessionResponses, workshopExercises } from "@shared/schema";
import { eq, and, gte, count, sql } from "drizzle-orm";
import { users } from "@shared/schema";

const router = Router();

// ── Auth guard helper ──────────────────────────────────────────────
function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: "Unauthorised" });
  }
  next();
}

function requireCultivator(req: any, res: any, next: any) {
  if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: "Unauthorised" });
  }
  const tier = req.user.tier;
  if (tier !== "cultivator" && tier !== "patron" && req.user.role !== "editor" && req.user.role !== "editor_in_chief") {
    return res.status(403).json({ error: "cultivator_required", message: "This feature is available on the Cultivator plan." });
  }
  next();
}

// ── GET /api/workshop/sessions ────────────────────────────────────
// All authenticated users can see the session list.
router.get("/sessions", requireAuth, async (req: any, res) => {
  try {
    const sessions = await db
      .select({
        id: workshopSessions.id,
        title: workshopSessions.title,
        description: workshopSessions.description,
        theme: workshopSessions.theme,
        status: workshopSessions.status,
        tierRequired: workshopSessions.tierRequired,
        scheduledAt: workshopSessions.scheduledAt,
        hostId: workshopSessions.hostId,
        maxParticipants: workshopSessions.maxParticipants,
        createdAt: workshopSessions.createdAt,
      })
      .from(workshopSessions)
      .orderBy(sql`${workshopSessions.scheduledAt} DESC NULLS LAST`)
      .limit(40);

    res.json(sessions);
  } catch (err) {
    console.error("[workshopRoom] GET /sessions", err);
    res.status(500).json({ error: "Failed to load sessions" });
  }
});

// ── GET /api/workshop/sessions/:id ───────────────────────────────
// All auth users see metadata. Exercises are tier-gated.
router.get("/sessions/:id", requireAuth, async (req: any, res) => {
  try {
    const [session] = await db
      .select()
      .from(workshopSessions)
      .where(eq(workshopSessions.id, req.params.id))
      .limit(1);

    if (!session) return res.status(404).json({ error: "Session not found" });

    // Participant count
    const [{ total }] = await db
      .select({ total: count() })
      .from(workshopSessionParticipants)
      .where(eq(workshopSessionParticipants.sessionId, req.params.id));

    // Has user joined?
    const [existing] = await db
      .select()
      .from(workshopSessionParticipants)
      .where(
        and(
          eq(workshopSessionParticipants.sessionId, req.params.id),
          eq(workshopSessionParticipants.userId, req.user.id)
        )
      )
      .limit(1);

    res.json({ ...session, participantCount: Number(total), hasJoined: !!existing });
  } catch (err) {
    console.error("[workshopRoom] GET /sessions/:id", err);
    res.status(500).json({ error: "Failed to load session" });
  }
});

// ── GET /api/workshop/sessions/:id/exercises ─────────────────────
// Free tier → first 2 exercises. Cultivator+ → all.
router.get("/sessions/:id/exercises", requireAuth, async (req: any, res) => {
  try {
    const [session] = await db
      .select()
      .from(workshopSessions)
      .where(eq(workshopSessions.id, req.params.id))
      .limit(1);
    if (!session) return res.status(404).json({ error: "Session not found" });

    const isFree =
      req.user.tier === "free" &&
      req.user.role !== "editor" &&
      req.user.role !== "editor_in_chief";

    const exercises = await db
      .select()
      .from(workshopExercises)
      .where(eq(workshopExercises.sessionId, req.params.id))
      .orderBy(workshopExercises.sortOrder);

    if (isFree) {
      const preview = exercises.slice(0, 2);
      return res.json({
        exercises: preview,
        total: exercises.length,
        gated: exercises.length > 2,
        tier: "free",
      });
    }

    res.json({ exercises, total: exercises.length, gated: false, tier: req.user.tier });
  } catch (err) {
    console.error("[workshopRoom] GET /sessions/:id/exercises", err);
    res.status(500).json({ error: "Failed to load exercises" });
  }
});

// ── POST /api/workshop/sessions/:id/join ─────────────────────────
// Free tier: max 1 live session join per calendar month.
router.post("/sessions/:id/join", requireAuth, async (req: any, res) => {
  try {
    const [session] = await db
      .select()
      .from(workshopSessions)
      .where(eq(workshopSessions.id, req.params.id))
      .limit(1);
    if (!session) return res.status(404).json({ error: "Session not found" });

    // Already joined?
    const [existing] = await db
      .select()
      .from(workshopSessionParticipants)
      .where(
        and(
          eq(workshopSessionParticipants.sessionId, req.params.id),
          eq(workshopSessionParticipants.userId, req.user.id)
        )
      )
      .limit(1);
    if (existing) return res.json({ joined: true, message: "Already joined" });

    // Free-tier cap: 1 session per month
    const isFree =
      req.user.tier === "free" &&
      req.user.role !== "editor" &&
      req.user.role !== "editor_in_chief";

    if (isFree) {
      const firstOfMonth = new Date();
      firstOfMonth.setDate(1);
      firstOfMonth.setHours(0, 0, 0, 0);

      const [{ monthCount }] = await db
        .select({ monthCount: count() })
        .from(workshopSessionParticipants)
        .where(
          and(
            eq(workshopSessionParticipants.userId, req.user.id),
            gte(workshopSessionParticipants.joinedAt, firstOfMonth)
          )
        );

      if (Number(monthCount) >= 1) {
        return res.status(403).json({
          error: "free_limit_reached",
          message: "Free members can join one workshop session per month. Upgrade to Cultivator for unlimited access.",
        });
      }
    }

    // Cap: max participants
    if (session.maxParticipants) {
      const [{ total }] = await db
        .select({ total: count() })
        .from(workshopSessionParticipants)
        .where(eq(workshopSessionParticipants.sessionId, req.params.id));
      if (Number(total) >= session.maxParticipants) {
        return res.status(409).json({ error: "Session is full" });
      }
    }

    await db.insert(workshopSessionParticipants).values({
      sessionId: req.params.id,
      userId: req.user.id,
    });

    res.json({ joined: true });
  } catch (err) {
    console.error("[workshopRoom] POST /sessions/:id/join", err);
    res.status(500).json({ error: "Failed to join session" });
  }
});

// ── POST /api/workshop/sessions/:id/respond ──────────────────────
// Cultivator+ only. Saves a response; optionally sends to Garden.
router.post("/sessions/:id/respond", requireCultivator, async (req: any, res) => {
  try {
    const { exerciseId, content } = req.body;
    if (!exerciseId || !content?.trim()) {
      return res.status(400).json({ error: "exerciseId and content are required" });
    }

    const [response] = await db
      .insert(workshopSessionResponses)
      .values({
        sessionId: req.params.id,
        exerciseId,
        authorId: req.user.id,
        content: content.trim(),
      })
      .returning();

    res.json(response);
  } catch (err) {
    console.error("[workshopRoom] POST /sessions/:id/respond", err);
    res.status(500).json({ error: "Failed to save response" });
  }
});

// ── GET /api/workshop/sessions/:id/my-responses ──────────────────
router.get("/sessions/:id/my-responses", requireAuth, async (req: any, res) => {
  try {
    const responses = await db
      .select()
      .from(workshopSessionResponses)
      .where(
        and(
          eq(workshopSessionResponses.sessionId, req.params.id),
          eq(workshopSessionResponses.authorId, req.user.id)
        )
      );
    res.json(responses);
  } catch (err) {
    res.status(500).json({ error: "Failed to load responses" });
  }
});

// ── POST /api/workshop/sessions (editor only) ─────────────────────
router.post("/sessions", requireAuth, async (req: any, res) => {
  if (req.user.role !== "editor" && req.user.role !== "editor_in_chief") {
    return res.status(403).json({ error: "Forbidden" });
  }
  try {
    const { title, description, theme, scheduledAt, maxParticipants, tierRequired } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: "title is required" });

    const [session] = await db
      .insert(workshopSessions)
      .values({
        title: title.trim(),
        description: description?.trim() ?? "",
        theme: theme?.trim() ?? null,
        hostId: req.user.id,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        maxParticipants: maxParticipants ?? null,
        tierRequired: tierRequired ?? "free",
        status: "upcoming",
      })
      .returning();

    res.json(session);
  } catch (err) {
    console.error("[workshopRoom] POST /sessions", err);
    res.status(500).json({ error: "Failed to create session" });
  }
});

export default router;
