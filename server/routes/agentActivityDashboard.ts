/**
 * agentActivityDashboard.ts — Agent Activity Dashboard Routes
 * Handles:
 *   - GET /api/agent-dashboard/summary  — aggregated stats across all agents (EIC only)
 *   - GET /api/agent-dashboard/notifications — recent agent_notifications across all users (EIC only)
 *   - GET /api/agent-dashboard/pattern-insights — recent agentPatternInsights across all users (EIC only)
 *   - GET /api/agent-dashboard/copy-snapshots  — recent copySnapshots with status breakdown (EIC only)
 *   - GET /api/agent-dashboard/editorial-briefs — recent editorialBriefs with status (EIC only)
 *   - GET /api/agent-dashboard/prompt-floats   — prompt float surface stats (EIC only)
 *
 * ALL routes are Editor-in-Chief / admin only.
 * New file — does not modify any existing route files.
 */
import { Router } from "express";
import { db } from "../db";
import {
  agentNotifications,
  agentPatternInsights,
  copySnapshots,
  editorialBriefs,
  promptFloats,
  writings,
} from "../../shared/schema";
import { desc, sql, count } from "drizzle-orm";

const router = Router();

/** EIC / admin guard — hydrates req.user from session before checking role */
const requireEditor = (req: any, res: any, next: any) => {
  // Hydrate req.user from session (mirrors isEditor pattern in routes.ts)
  if (!req.user?.id) {
    const sessionUser = (req.session as any)?.user;
    if (sessionUser) req.user = sessionUser;
  }
  if (!req.user) return res.status(401).json({ error: "Unauthorised" });
  const allowed = ["editor", "admin", "editor_in_chief"];
  if (!allowed.includes(req.user.role))
    return res.status(403).json({ error: "Forbidden — Editor in Chief access only" });
  next();
};

/**
 * GET /api/agent-dashboard/summary
 * Returns high-level counts across all agent tables for the EIC overview panel.
 */
router.get("/summary", requireEditor, async (_req, res) => {
  try {
    const [notifCount] = await db
      .select({ total: count() })
      .from(agentNotifications);

    const [insightCount] = await db
      .select({ total: count() })
      .from(agentPatternInsights);

    const [copySnapshotCount] = await db
      .select({ total: count() })
      .from(copySnapshots);

    const [editorialBriefCount] = await db
      .select({ total: count() })
      .from(editorialBriefs);

    const [promptFloatCount] = await db
      .select({ total: count() })
      .from(promptFloats);

    // Copy snapshots broken down by status
    const copySnapshotsByStatus = await db
      .select({
        status: copySnapshots.status,
        total: count(),
      })
      .from(copySnapshots)
      .groupBy(copySnapshots.status);

    // Editorial briefs broken down by status
    const editorialBriefsByStatus = await db
      .select({
        status: editorialBriefs.status,
        total: count(),
      })
      .from(editorialBriefs)
      .groupBy(editorialBriefs.status);

    // Agent notifications broken down by agent_name
    const notifsByAgent = await db
      .select({
        agentName: agentNotifications.agentName,
        total: count(),
      })
      .from(agentNotifications)
      .groupBy(agentNotifications.agentName);

    // Pattern insights broken down by insight_type
    const insightsByType = await db
      .select({
        insightType: agentPatternInsights.insightType,
        total: count(),
      })
      .from(agentPatternInsights)
      .groupBy(agentPatternInsights.insightType);

    res.json({
      success: true,
      data: {
        totals: {
          agentNotifications: notifCount?.total ?? 0,
          agentPatternInsights: insightCount?.total ?? 0,
          copySnapshots: copySnapshotCount?.total ?? 0,
          editorialBriefs: editorialBriefCount?.total ?? 0,
          promptFloats: promptFloatCount?.total ?? 0,
        },
        breakdowns: {
          notifsByAgent,
          insightsByType,
          copySnapshotsByStatus,
          editorialBriefsByStatus,
        },
      },
    });
  } catch (error) {
    console.error("[AgentDashboard] GET /summary error:", error);
    res.status(500).json({ error: "Failed to fetch agent activity summary" });
  }
});

/**
 * GET /api/agent-dashboard/notifications
 * Returns the 50 most recent agent_notifications across all users.
 * Intended for the EIC to monitor Blank Page Tender and other agent activity.
 */
router.get("/notifications", requireEditor, async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);

    const rows = await db
      .select()
      .from(agentNotifications)
      .orderBy(desc(agentNotifications.createdAt))
      .limit(limit);

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("[AgentDashboard] GET /notifications error:", error);
    res.status(500).json({ error: "Failed to fetch agent notifications" });
  }
});

/**
 * GET /api/agent-dashboard/pattern-insights
 * Returns the 50 most recent agentPatternInsights across all users.
 */
router.get("/pattern-insights", requireEditor, async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const statusFilter = req.query.status as string | undefined;

    let query = db
      .select()
      .from(agentPatternInsights)
      .orderBy(desc(agentPatternInsights.createdAt))
      .limit(limit);

    const rows = await query;

    const filtered = statusFilter
      ? rows.filter((r) => r.status === statusFilter)
      : rows;

    res.json({ success: true, data: filtered });
  } catch (error) {
    console.error("[AgentDashboard] GET /pattern-insights error:", error);
    res.status(500).json({ error: "Failed to fetch agent pattern insights" });
  }
});

/**
 * GET /api/agent-dashboard/copy-snapshots
 * Returns the 50 most recent copy snapshots with optional status filter.
 */
router.get("/copy-snapshots", requireEditor, async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const statusFilter = req.query.status as string | undefined;

    const rows = await db
      .select()
      .from(copySnapshots)
      .orderBy(desc(copySnapshots.createdAt))
      .limit(limit);

    const filtered = statusFilter
      ? rows.filter((r) => r.status === statusFilter)
      : rows;

    res.json({ success: true, data: filtered });
  } catch (error) {
    console.error("[AgentDashboard] GET /copy-snapshots error:", error);
    res.status(500).json({ error: "Failed to fetch copy snapshots" });
  }
});

/**
 * GET /api/agent-dashboard/editorial-briefs
 * Returns the 50 most recent editorial briefs with optional status filter.
 */
router.get("/editorial-briefs", requireEditor, async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const statusFilter = req.query.status as string | undefined;

    const rows = await db
      .select()
      .from(editorialBriefs)
      .orderBy(desc(editorialBriefs.createdAt))
      .limit(limit);

    const filtered = statusFilter
      ? rows.filter((r) => r.status === statusFilter)
      : rows;

    res.json({ success: true, data: filtered });
  } catch (error) {
    console.error("[AgentDashboard] GET /editorial-briefs error:", error);
    res.status(500).json({ error: "Failed to fetch editorial briefs" });
  }
});

/**
 * GET /api/agent-dashboard/prompt-floats
 * Returns prompt float activity — how many prompts have been surfaced,
 * dismissed, and the most recent floats.
 */
router.get("/prompt-floats", requireEditor, async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);

    const rows = await db
      .select()
      .from(promptFloats)
      .orderBy(desc(promptFloats.surfacedAt))
      .limit(limit);

    const dismissed = rows.filter((r) => r.dismissed).length;
    const active = rows.filter((r) => !r.dismissed).length;

    res.json({
      success: true,
      data: {
        stats: { surfaced: rows.length, dismissed, active },
        recent: rows,
      },
    });
  } catch (error) {
    console.error("[AgentDashboard] GET /prompt-floats error:", error);
    res.status(500).json({ error: "Failed to fetch prompt floats" });
  }
});

export function registerAgentActivityDashboardRoutes(app: any) {
  app.use("/api/agent-dashboard", router);
}
