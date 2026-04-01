import { Router } from "express";
import { db } from "../db";
import {
  atelierSeries,
  atelierExercises,
  atelierResponses,
} from "@shared/atelier.schema";
import { eq, and, asc, count } from "drizzle-orm";

const router = Router();

// ── Auth guard helper ───────────────────────────────────────────────
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
  if (
    tier !== "cultivator" &&
    tier !== "patron" &&
    req.user.role !== "editor" &&
    req.user.role !== "editor_in_chief"
  ) {
    return res
      .status(403)
      .json({ error: "cultivator_required", message: "This feature is available on the Cultivator plan." });
  }
  next();
}

// ── GET /api/workshop/sessions ──────────────────────────────────────────
router.get("/sessions", requireAuth, async (_req: any, res) => {
  try {
    const series = await db
      .select()
      .from(atelierSeries)
      .where(eq(atelierSeries.isPublished, true))
      .orderBy(asc(atelierSeries.sortOrder))
      .limit(40);
    res.json(series);
  } catch (err) {
    console.error("[workshopRoom] GET /sessions", err);
    res.status(500).json({ error: "Failed to load sessions" });
  }
});

// ── GET /api/workshop/sessions/:id ───────────────────────────────────────
router.get("/sessions/:id", requireAuth, async (req: any, res) => {
  try {
    const [series] = await db
      .select()
      .from(atelierSeries)
      .where(eq(atelierSeries.id, req.params.id))
      .limit(1);
    if (!series) return res.status(404).json({ error: "Session not found" });

    // Count responses from this user to check if they've "joined"
    const [{ total }] = await db
      .select({ total: count() })
      .from(atelierResponses)
      .where(eq(atelierResponses.userId, req.user.id));

    res.json({ ...series, participantCount: 0, hasJoined: Number(total) > 0 });
  } catch (err) {
    console.error("[workshopRoom] GET /sessions/:id", err);
    res.status(500).json({ error: "Failed to load session" });
  }
});

// ── GET /api/workshop/sessions/:id/exercises ───────────────────────────────
router.get("/sessions/:id/exercises", requireAuth, async (req: any, res) => {
  try {
    const [series] = await db
      .select()
      .from(atelierSeries)
      .where(eq(atelierSeries.id, req.params.id))
      .limit(1);
    if (!series) return res.status(404).json({ error: "Session not found" });

    const isFree =
      req.user.tier === "free" &&
      req.user.role !== "editor" &&
      req.user.role !== "editor_in_chief";

    const exercises = await db
      .select()
      .from(atelierExercises)
      .where(eq(atelierExercises.seriesId, req.params.id))
      .orderBy(asc(atelierExercises.sortOrder));

    const freeLimit = series.freeExerciseLimit ?? 2;

    if (isFree) {
      const preview = exercises.slice(0, freeLimit);
      return res.json({
        exercises: preview,
        total: exercises.length,
        gated: exercises.length > freeLimit,
        tier: "free",
      });
    }

    res.json({ exercises, total: exercises.length, gated: false, tier: req.user.tier });
  } catch (err) {
    console.error("[workshopRoom] GET /sessions/:id/exercises", err);
    res.status(500).json({ error: "Failed to load exercises" });
  }
});

// ── POST /api/workshop/sessions/:id/join ────────────────────────────────────
// Joining is implicit via response submission — just return joined: true.
router.post("/sessions/:id/join", requireAuth, async (req: any, res) => {
  try {
    const [series] = await db
      .select()
      .from(atelierSeries)
      .where(eq(atelierSeries.id, req.params.id))
      .limit(1);
    if (!series) return res.status(404).json({ error: "Session not found" });
    res.json({ joined: true });
  } catch (err) {
    console.error("[workshopRoom] POST /sessions/:id/join", err);
    res.status(500).json({ error: "Failed to join session" });
  }
});

// ── POST /api/workshop/sessions/:id/respond ──────────────────────────────
router.post("/sessions/:id/respond", requireCultivator, async (req: any, res) => {
  try {
    const { exerciseId, content } = req.body;
    if (!exerciseId || !content?.trim()) {
      return res.status(400).json({ error: "exerciseId and content are required" });
    }
    const [response] = await db
      .insert(atelierResponses)
      .values({
        seriesId: req.params.id,
        exerciseId,
        userId: req.user.id,
        content: content.trim(),
      })
      .returning();
    res.json(response);
  } catch (err) {
    console.error("[workshopRoom] POST /sessions/:id/respond", err);
    res.status(500).json({ error: "Failed to save response" });
  }
});

// ── GET /api/workshop/sessions/:id/my-responses ───────────────────────────
router.get("/sessions/:id/my-responses", requireAuth, async (req: any, res) => {
  try {
    const responses = await db
      .select()
      .from(atelierResponses)
      .where(
        and(
          eq(atelierResponses.seriesId, req.params.id),
          eq(atelierResponses.userId, req.user.id)
        )
      );
    res.json(responses);
  } catch (err) {
    res.status(500).json({ error: "Failed to load responses" });
  }
});

export default router;
