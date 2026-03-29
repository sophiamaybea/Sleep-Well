/**
 * studio.ts — Writers' Studio Routes
 * New file — does not modify any existing route files.
 *
 * GET  /api/studio/courses          — list published courses with user access state
 * GET  /api/studio/courses/:id      — single course with lessons + user progress
 * GET  /api/studio/products         — list published studio products
 * POST /api/studio/enroll/:courseId — grant cultivator access (free enroll)
 * GET  /api/studio/my-courses       — courses the authenticated user has access to
 */
import { Router } from 'express';
import { db } from '../db';
import { eq, and, desc } from 'drizzle-orm';

const router = Router();

const requireAuth = (req: any, res: any, next: any) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorised' });
  next();
};

/**
 * GET /api/studio/courses
 * Returns all published courses.
 * Includes whether the authenticated user has access (purchased or enrolled).
 */
router.get('/courses', requireAuth, async (req: any, res) => {
  const userId = req.user.id;
  try {
    const {
      courses,
      userCourseAccess,
      studioEnrollments,
      lessonProgress,
      courseLessons,
    } = await import('../../shared/schema');

    const allCourses = await db
      .select()
      .from(courses)
      .where(eq(courses.isPublished, true))
      .orderBy(courses.sortOrder);

    // Get user's purchased access
    const purchased = await db
      .select()
      .from(userCourseAccess)
      .where(eq(userCourseAccess.userId, userId));

    // Get user's cultivator enrollments
    let enrolled: any[] = [];
    try {
      enrolled = await db
        .select()
        .from(studioEnrollments)
        .where(eq(studioEnrollments.userId, userId));
    } catch (_) {
      // table may not exist in older deployments
    }

    const purchasedIds = new Set(purchased.map((p: any) => p.courseId));
    const enrolledIds = new Set(enrolled.map((e: any) => e.courseId));

    // Get lesson counts per course
    const lessons = await db.select().from(courseLessons);
    const lessonCounts: Record<string, number> = {};
    for (const l of lessons) {
      lessonCounts[l.courseId] = (lessonCounts[l.courseId] || 0) + 1;
    }

    // Get completed lessons for this user
    const completed = await db
      .select()
      .from(lessonProgress)
      .where(eq(lessonProgress.userId, userId));
    const completedByCourseCounts: Record<string, number> = {};
    for (const c of completed) {
      completedByCourseCounts[c.courseId] =
        (completedByCourseCounts[c.courseId] || 0) + 1;
    }

    const result = allCourses.map((course: any) => ({
      ...course,
      hasAccess: purchasedIds.has(course.id) || enrolledIds.has(course.id) || course.includedInCultivator,
      lessonCount: lessonCounts[course.id] || 0,
      completedLessons: completedByCourseCounts[course.id] || 0,
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[Studio:courses] Error:', error);
    res.status(500).json({ error: 'Failed to load courses' });
  }
});

/**
 * GET /api/studio/courses/:id
 * Returns a single course with its lessons.
 * Requires the user to have access.
 */
router.get('/courses/:id', requireAuth, async (req: any, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  try {
    const {
      courses,
      courseLessons,
      userCourseAccess,
      studioEnrollments,
      lessonProgress,
      courseExerciseResponses,
    } = await import('../../shared/schema');

    const course = await db
      .select()
      .from(courses)
      .where(and(eq(courses.id, id), eq(courses.isPublished, true)))
      .limit(1);

    if (!course || course.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check access
    const purchased = await db
      .select()
      .from(userCourseAccess)
      .where(and(eq(userCourseAccess.userId, userId), eq(userCourseAccess.courseId, id)))
      .limit(1);

    let enrolled: any[] = [];
    try {
      enrolled = await db
        .select()
        .from(studioEnrollments)
        .where(and(eq(studioEnrollments.userId, userId), eq(studioEnrollments.courseId, id)))
        .limit(1);
    } catch (_) {}

    const hasAccess =
      purchased.length > 0 ||
      enrolled.length > 0 ||
      course[0].includedInCultivator;

    const lessons = await db
      .select()
      .from(courseLessons)
      .where(eq(courseLessons.courseId, id))
      .orderBy(courseLessons.sortOrder);

    const progress = await db
      .select()
      .from(lessonProgress)
      .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.courseId, id)));

    const completedLessonIds = new Set(progress.map((p: any) => p.lessonId));

    const responses = await db
      .select()
      .from(courseExerciseResponses)
      .where(and(eq(courseExerciseResponses.userId, userId), eq(courseExerciseResponses.courseId, id)));

    const responseByLesson: Record<string, any> = {};
    for (const r of responses) {
      responseByLesson[r.lessonId] = r;
    }

    const lessonsWithState = lessons.map((l: any) => ({
      ...l,
      // Only reveal content if user has access
      content: hasAccess ? l.content : null,
      writingPrompt: hasAccess ? l.writingPrompt : null,
      isCompleted: completedLessonIds.has(l.id),
      myResponse: hasAccess ? (responseByLesson[l.id] || null) : null,
    }));

    res.json({
      success: true,
      data: {
        ...course[0],
        hasAccess,
        lessons: lessonsWithState,
        completedCount: progress.length,
      },
    });
  } catch (error) {
    console.error('[Studio:course] Error:', error);
    res.status(500).json({ error: 'Failed to load course' });
  }
});

/**
 * POST /api/studio/lessons/:lessonId/complete
 * Marks a lesson as complete for the authenticated user.
 */
router.post('/lessons/:lessonId/complete', requireAuth, async (req: any, res) => {
  const userId = req.user.id;
  const { lessonId } = req.params;
  const { courseId } = req.body;
  if (!courseId) return res.status(400).json({ error: 'courseId required' });
  try {
    const { lessonProgress } = await import('../../shared/schema');
    // Idempotent — check if already completed
    const existing = await db
      .select()
      .from(lessonProgress)
      .where(
        and(
          eq(lessonProgress.userId, userId),
          eq(lessonProgress.lessonId, lessonId)
        )
      )
      .limit(1);
    if (existing.length === 0) {
      await db.insert(lessonProgress).values({ userId, lessonId, courseId });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('[Studio:complete] Error:', error);
    res.status(500).json({ error: 'Failed to mark lesson complete' });
  }
});

/**
 * POST /api/studio/lessons/:lessonId/response
 * Saves or updates a user's exercise response for a lesson.
 * Also optionally saves to Garden (savedToGarden flag).
 */
router.post('/lessons/:lessonId/response', requireAuth, async (req: any, res) => {
  const userId = req.user.id;
  const { lessonId } = req.params;
  const { courseId, content, savedToGarden, gardenWritingId } = req.body;
  if (!courseId) return res.status(400).json({ error: 'courseId required' });
  try {
    const { courseExerciseResponses } = await import('../../shared/schema');
    const existing = await db
      .select()
      .from(courseExerciseResponses)
      .where(
        and(
          eq(courseExerciseResponses.userId, userId),
          eq(courseExerciseResponses.lessonId, lessonId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(courseExerciseResponses)
        .set({
          content: content ?? existing[0].content,
          savedToGarden: savedToGarden ?? existing[0].savedToGarden,
          gardenWritingId: gardenWritingId ?? existing[0].gardenWritingId,
          updatedAt: new Date(),
        })
        .where(eq(courseExerciseResponses.id, existing[0].id));
    } else {
      await db.insert(courseExerciseResponses).values({
        userId,
        lessonId,
        courseId,
        content: content || '',
        savedToGarden: savedToGarden || false,
        gardenWritingId: gardenWritingId || null,
      });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('[Studio:response] Error:', error);
    res.status(500).json({ error: 'Failed to save response' });
  }
});

/**
 * GET /api/studio/products
 * Returns all published studio products.
 * Public-ish — only requires auth to check purchase state.
 */
router.get('/products', requireAuth, async (req: any, res) => {
  const userId = req.user.id;
  try {
    const { studioProducts, studioPurchases } = await import('../../shared/schema');
    const products = await db
      .select()
      .from(studioProducts)
      .where(eq(studioProducts.isPublished, true))
      .orderBy(studioProducts.sortOrder);

    const purchases = await db
      .select()
      .from(studioPurchases)
      .where(eq(studioPurchases.userId, userId));

    const purchasedIds = new Set(purchases.map((p: any) => p.productId));

    const result = products.map((p: any) => ({
      ...p,
      hasPurchased: purchasedIds.has(p.id),
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[Studio:products] Error:', error);
    res.status(500).json({ error: 'Failed to load products' });
  }
});

export function registerStudioRoutes(app: any) {
  app.use('/api/studio', router);
}
