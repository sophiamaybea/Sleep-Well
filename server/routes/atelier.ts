import { Router } from "express";
import { db } from "../db";
import {
  atelierSeries,
  atelierExercises,
  atelierResponses,
  insertAtelierSeriesSchema,
  insertAtelierExerciseSchema,
  insertAtelierResponseSchema,
} from "@shared/schema";
import { eq, and, asc } from "drizzle-orm";

const router = Router();

const FREE_EXERCISE_LIMIT = 2;

// Guard helpers
function requireAuth(req: any, res: any, next: any) {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  next();
}

function requireEditor(req: any, res: any, next: any) {
  if (!req.user || !((["editor", "admin", "editor_in_chief"] as string[]).includes(req.user.role))) {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
}

function isCultivatorOrEditor(user: any): boolean {
  return (
    user?.tier === "cultivator" ||
    user?.role === "editor" ||
    user?.role === "admin" || user?.role === "editor_in_chief"
  );
}

// GET /api/atelier/series — list published series
router.get("/series", requireAuth, async (req, res) => {
  try {
    const series = await db
      .select()
      .from(atelierSeries)
      .where(eq(atelierSeries.isPublished, true))
      .orderBy(asc(atelierSeries.sortOrder));
    res.json(series);
  } catch (err) {
    console.error("[atelier] GET /series", err);
    res.status(500).json({ error: "Failed to load series" });
  }
});

// GET /api/atelier/series/:id — single series with gated exercises
router.get("/series/:id", requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const cultivator = isCultivatorOrEditor(user);

    const [series] = await db
      .select()
      .from(atelierSeries)
      .where(
        and(
          eq(atelierSeries.id, req.params.id),
          eq(atelierSeries.isPublished, true)
        )
      );

    if (!series) return res.status(404).json({ error: "Series not found" });

    const allExercises = await db
      .select()
      .from(atelierExercises)
      .where(eq(atelierExercises.seriesId, series.id))
      .orderBy(asc(atelierExercises.sortOrder));

    const limit = cultivator ? allExercises.length : FREE_EXERCISE_LIMIT;
    const visibleExercises = allExercises.slice(0, limit);
    const gated = !cultivator && allExercises.length > FREE_EXERCISE_LIMIT;

    const myResponses = await db
      .select()
      .from(atelierResponses)
      .where(
        and(
          eq(atelierResponses.seriesId, series.id),
          eq(atelierResponses.userId, user.id)
        )
      );

    const responseMap: Record<string, any> = {};
    for (const r of myResponses) responseMap[r.exerciseId] = r;

    const exercisesWithResponses = visibleExercises.map((ex) => ({
      ...ex,
      myResponse: responseMap[ex.id] ?? null,
    }));

    res.json({
      series,
      exercises: exercisesWithResponses,
      gated,
      total: allExercises.length,
      isCultivator: cultivator,
    });
  } catch (err) {
    console.error("[atelier] GET /series/:id", err);
    res.status(500).json({ error: "Failed to load series" });
  }
});

// POST /api/atelier/series/:id/respond — save or update a response
router.post("/series/:id/respond", requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const cultivator = isCultivatorOrEditor(user);
    const { exerciseId, content } = req.body;

    if (!exerciseId || typeof content !== "string") {
      return res.status(400).json({ error: "exerciseId and content required" });
    }

    const [exercise] = await db
      .select()
      .from(atelierExercises)
      .where(
        and(
          eq(atelierExercises.id, exerciseId),
          eq(atelierExercises.seriesId, req.params.id)
        )
      );
    if (!exercise) return res.status(404).json({ error: "Exercise not found" });

    // Enforce paywall server-side
    if (!cultivator) {
      const allExercises = await db
        .select({ id: atelierExercises.id })
        .from(atelierExercises)
        .where(eq(atelierExercises.seriesId, req.params.id))
        .orderBy(asc(atelierExercises.sortOrder));
      const position = allExercises.findIndex((e) => e.id === exerciseId);
      if (position >= FREE_EXERCISE_LIMIT) {
        return res.status(403).json({ error: "Upgrade to Cultivator to continue" });
      }
    }

    // Upsert
    const existing = await db
      .select()
      .from(atelierResponses)
      .where(
        and(
          eq(atelierResponses.exerciseId, exerciseId),
          eq(atelierResponses.userId, user.id)
        )
      );

    if (existing.length > 0) {
      await db
        .update(atelierResponses)
        .set({ content, updatedAt: new Date() })
        .where(eq(atelierResponses.id, existing[0].id));
      return res.json({ ...existing[0], content });
    }

    const parsed = insertAtelierResponseSchema.parse({
      exerciseId,
      seriesId: req.params.id,
      content,
    });
    const [created] = await db
      .insert(atelierResponses)
      .values({ ...parsed, userId: user.id })
      .returning();
    res.status(201).json(created);
  } catch (err) {
    console.error("[atelier] POST /series/:id/respond", err);
    res.status(500).json({ error: "Failed to save response" });
  }
});

// POST /api/atelier/series/:seriesId/save-to-garden
router.post(
  "/series/:seriesId/save-to-garden",
  requireAuth,
  async (req, res) => {
    try {
      const user = req.user as any;
      if (!isCultivatorOrEditor(user)) {
        return res.status(403).json({ error: "Cultivator membership required" });
      }

      const [response] = await db
        .select()
        .from(atelierResponses)
        .where(
          and(
            eq(atelierResponses.id, req.body.responseId),
            eq(atelierResponses.userId, user.id)
          )
        );
      if (!response) return res.status(404).json({ error: "Response not found" });
      if (!response.content.trim()) return res.status(400).json({ error: "Nothing to save" });

      const [exercise] = await db
        .select()
        .from(atelierExercises)
        .where(eq(atelierExercises.id, response.exerciseId));

      // Insert into writings table using only safe enum values
      const { writings } = await import("../../shared/schema");
      const [writing] = await db
        .insert(writings)
        .values({
          authorId: user.id,
          title: exercise?.title ?? "Atelier piece",
          content: response.content,
          stage: "seed",
          genre: "poetry",
          visibility: "personal",
          readiness: "raw_seed",
        })
        .returning();

      await db
        .update(atelierResponses)
        .set({ savedToGarden: true, gardenWritingId: writing.id })
        .where(eq(atelierResponses.id, response.id));

      res.json({ writing });
    } catch (err) {
      console.error("[atelier] save-to-garden", err);
      res.status(500).json({ error: "Failed to save to garden" });
    }
  }
);

// Editor-only admin routes

// GET /api/atelier/admin/series — all series incl. unpublished
router.get("/admin/series", requireEditor, async (req, res) => {
  try {
    const series = await db
      .select()
      .from(atelierSeries)
      .orderBy(asc(atelierSeries.sortOrder));
    res.json(series);
  } catch (err) {
    res.status(500).json({ error: "Failed to load series" });
  }
});

// POST /api/atelier/admin/series — create series
router.post("/admin/series", requireEditor, async (req, res) => {
  try {
    const user = req.user as any;
    const parsed = insertAtelierSeriesSchema.parse(req.body);
    const [series] = await db
      .insert(atelierSeries)
      .values({ ...parsed, createdById: user.id })
      .returning();
    res.status(201).json(series);
  } catch (err) {
    console.error("[atelier] POST /admin/series", err);
    res.status(500).json({ error: "Failed to create series" });
  }
});

// PATCH /api/atelier/admin/series/:id — publish/update series
router.patch("/admin/series/:id", requireEditor, async (req, res) => {
  try {
    const [updated] = await db
      .update(atelierSeries)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(atelierSeries.id, req.params.id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Series not found" });
    res.json(updated);
  } catch (err) {
    console.error("[atelier] PATCH /admin/series/:id", err);
    res.status(500).json({ error: "Failed to update series" });
  }
});

// POST /api/atelier/admin/series/:id/exercises — add exercise
router.post("/admin/series/:id/exercises", requireEditor, async (req, res) => {
  try {
    const parsed = insertAtelierExerciseSchema.parse({ ...req.body, seriesId: req.params.id });
    const [exercise] = await db.insert(atelierExercises).values(parsed).returning();

    const count = await db
      .select()
      .from(atelierExercises)
      .where(eq(atelierExercises.seriesId, req.params.id));
    await db
      .update(atelierSeries)
      .set({ totalExercises: count.length, updatedAt: new Date() })
      .where(eq(atelierSeries.id, req.params.id));

    res.status(201).json(exercise);
  } catch (err) {
    console.error("[atelier] POST /admin/series/:id/exercises", err);
    res.status(500).json({ error: "Failed to add exercise" });
  }
});

export default router;
