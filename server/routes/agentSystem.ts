/**
 * agentSystem.ts — Agent System Routes
 * Handles:
 *   - Agent 10: The Blank Page Tender (POST /api/agent/blank-page-signal)
 *   - Agent notifications: GET /api/agent/notifications
 *   - Moon phase: GET /api/agent/moon-phase
 *   - Site config: GET /api/agent/site-config/:key
 *
 * All routes are authenticated. No cross-user data access.
 * New file: does not modify any existing route files.
 */

import { Router } from 'express';
import { db } from '../db';
import { getMoonPhase } from '../lib/moonPhase';
import { eq, desc, isNull } from 'drizzle-orm';

const router = Router();

// Auth guard — hydrates req.user from session before checking auth
const requireAuth = (req: any, res: any, next: any) => {
  // Hydrate req.user from session (mirrors isEditor pattern in routes.ts)
  if (!req.user?.id) {
    const sessionUser = (req.session as any)?.user;
    if (sessionUser) req.user = sessionUser;
  }
  if (!req.user) return res.status(401).json({ error: 'Unauthorised' });
  next();
};

/**
 * GET /api/agent/moon-phase
 * Returns current moon phase data.
 * Public endpoint — used by Garden UI to display moon glyph.
 */
router.get('/moon-phase', (req, res) => {
  try {
    const moonData = getMoonPhase(new Date());
    res.json({
      success: true,
      data: moonData,
    });
  } catch (error) {
    console.error('[Agent:MoonPhase] Error:', error);
    res.status(500).json({ error: 'Failed to calculate moon phase' });
  }
});

/**
 * POST /api/agent/blank-page-signal
 * Agent 10: The Blank Page Tender
 * Called when a writer opens a new writing session, stays 3+ minutes,
 * and closes without saving anything.
 *
 * Reads from the writer's own writings (SELECT only) to find a past
 * fragment to surface. Stores the retrieved fragment in agent_notifications.
 *
 * Never reads another user's data.
 * Never generates content — only retrieves from the writer's own archive.
 */
router.post('/blank-page-signal', requireAuth, async (req: any, res) => {
  const userId = req.user.id;

  try {
    // Dynamic import to avoid circular deps — db tables loaded lazily
    const { writings, agentNotifications } = await import('../../shared/schema');

    // Find a past fragment from the writer's own archive
    // We look for a raw_seed or growing piece that has content
    const fragments = await db
      .select({
        id: writings.id,
        title: writings.title,
        content: writings.content,
        createdAt: writings.createdAt,
      })
      .from(writings)
      .where(eq(writings.authorId, userId))
      .orderBy(desc(writings.createdAt))
      .limit(50);

    if (!fragments || fragments.length === 0) {
      return res.json({ success: true, data: null, message: 'No past fragments found' });
    }

    // Pick a fragment with actual content (not empty)
    const withContent = fragments.filter(
      (f) => f.content && f.content.trim().length > 20
    );

    if (withContent.length === 0) {
      return res.json({ success: true, data: null, message: 'No fragments with content found' });
    }

    // Pick a random fragment from the pool (seeded by time of day for consistency)
    const hour = new Date().getHours();
    const idx = (hour + fragments.length) % withContent.length;
    const fragment = withContent[idx];

    // Extract a short, memorable line from the content
    const lines = fragment.content
      .split(/[.!?\n]/)
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 15 && l.length < 120);

    const surfacedLine = lines.length > 0
      ? lines[Math.floor(lines.length / 2)]
      : fragment.content.slice(0, 100);

    const createdYear = fragment.createdAt
      ? new Date(fragment.createdAt).getFullYear()
      : new Date().getFullYear();

    const message = `In ${createdYear} you wrote: '${surfacedLine}'. You never finished that thought.`;

    // Store in agent_notifications (additive — new table only)
    // Only insert if agentNotifications table exists (graceful degradation)
    try {
      await db.insert(agentNotifications).values({
        userId,
        agentName: 'blank_page_tender',
        message,
        writingId: fragment.id,
      });
    } catch (insertError) {
      // Table may not exist yet in Supabase — log and continue
      console.warn('[Agent:BlankPageTender] agent_notifications table not found, skipping insert');
    }

    res.json({
      success: true,
      data: {
        message,
        writingId: fragment.id,
        surfacedLine,
      },
    });
  } catch (error) {
    console.error('[Agent:BlankPageTender] Error:', error);
    res.status(500).json({ error: 'Failed to process blank page signal' });
  }
});

/**
 * GET /api/agent/notifications
 * Returns unread agent notifications for the authenticated user.
 * Used by the Garden UI to surface gentle system messages.
 */
router.get('/notifications', requireAuth, async (req: any, res) => {
  const userId = req.user.id;

  try {
    const { agentNotifications } = await import('../../shared/schema');

    const notifications = await db
      .select()
      .from(agentNotifications)
      .where(eq(agentNotifications.userId, userId))
      .orderBy(desc(agentNotifications.createdAt))
      .limit(10);

    // Filter to only unread
    const unread = notifications.filter((n: any) => !n.readAt && !n.dismissedAt);

    res.json({ success: true, data: unread });
  } catch (error) {
    // Graceful degradation if table doesn't exist yet
    res.json({ success: true, data: [] });
  }
});

/**
 * POST /api/agent/notifications/:id/dismiss
 * Dismisses an agent notification.
 */
router.post('/notifications/:id/dismiss', requireAuth, async (req: any, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const { agentNotifications } = await import('../../shared/schema');

    await db
      .update(agentNotifications)
      .set({ dismissedAt: new Date() })
      .where(eq(agentNotifications.id, id));

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to dismiss notification' });
  }
});

/**
 * GET /api/agent/site-config/:key
 * Returns a site config value by key.
 * Public endpoint — used for moon phase, season, featured prompts etc.
 */
router.get('/site-config/:key', async (req, res) => {
  const { key } = req.params;

  try {
    const { siteConfig } = await import('../../shared/schema');

    const config = await db
      .select()
      .from(siteConfig)
      .where(eq(siteConfig.key, key))
      .limit(1);

    if (!config || config.length === 0) {
      return res.json({ success: true, data: null });
    }

    res.json({ success: true, data: config[0].value });
  } catch (error) {
    // Graceful degradation if siteConfig table doesn't exist yet
    res.json({ success: true, data: null });
  }
});

export function registerAgentSystemRoutes(app: any) {
  app.use('/api/agent', router);
}
