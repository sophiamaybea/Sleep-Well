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
 */
import { Router } from "express";
import { db } from "../db";
import {
  agentNotifications,
  agentPatternInsights,
  copySnapshots,
  editorialBriefs,
  promptFloats,
} from "../../shared/schema";
import { desc, count } from "drizzle-orm";

const router = Router();

/** EIC / admin guard — uses Passport's req.isAuthenticated() correctly */
const requireEditor = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorised" });
  }
  const allowed = ["admin", "editor_in_chief"];
  if (!allowed.includes(req.user?.role)) {
    return res.status(403).json({ error: "Forbidden — Editor in Chief access only" });
  }
  next();
};

router.get("/summary", requireEditor, async (_req, res) => {
  try {
    const [notifCount] = await db.select({ total: count() }).from(agentNotifications);
    const [insightCount] = await db.select({ total: count() }).from(agentPatternInsights);
    const [copySnapshotCount] = await db.select({ total: count() }).from(copySnapshots);
    const [editorialBriefCount] = await db.select({ total: count() }).from(editorialBriefs);
    const [promptFloatCount] = await db.select({ total: count() }).from(promptFloats);

    const copySnapshotsByStatus = await db
      .select({ status: copySnapshots.status, total: count() })
      .from(copySnapshots)
      .groupBy(copySnapshots.status);

    const editorialBriefsByStatus = await db
      .select({ status: editorialBriefs.status, total: count() })
      .from(editorialBriefs)
      .groupBy(editorialBriefs.status);

    const notifsByAgent = await db
      .select({ agentName: agentNotifications.agentName, total: count() })
      .from(agentNotifications)
      .groupBy(agentNotifications.agentName);

    const insightsByType = await db
      .select({ insightType: agentPatternInsights.insightType, total: count() })
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
        breakdowns: { notifsByAgent, insightsByType, copySnapshotsByStatus, editorialBriefsByStatus },
      },
    });
  } catch (error) {
    console.error("[AgentDashboard] GET /summary error:", error);
    res.status(500).json({ error: "Failed to fetch agent activity summary" });
  }
});

router.get("/notifications", requireEditor, async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const rows = await db.select().from(agentNotifications).orderBy(desc(agentNotifications.createdAt)).limit(limit);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("[AgentDashboard] GET /notifications error:", error);
    res.status(500).json({ error: "Failed to fetch agent notifications" });
  }
});

router.get("/pattern-insights", requireEditor, async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const rows = await db.select().from(agentPatternInsights).orderBy(desc(agentPatternInsights.createdAt)).limit(limit);
    const statusFilter = req.query.status as string | undefined;
    const filtered = statusFilter ? rows.filter((r) => r.status === statusFilter) : rows;
    res.json({ success: true, data: filtered });
  } catch (error) {
    console.error("[AgentDashboard] GET /pattern-insights error:", error);
    res.status(500).json({ error: "Failed to fetch agent pattern insights" });
  }
});

router.get("/copy-snapshots", requireEditor, async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const rows = await db.select().from(copySnapshots).orderBy(desc(copySnapshots.createdAt)).limit(limit);
    const statusFilter = req.query.status as string | undefined;
    const filtered = statusFilter ? rows.filter((r) => r.status === statusFilter) : rows;
    res.json({ success: true, data: filtered });
  } catch (error) {
    console.error("[AgentDashboard] GET /copy-snapshots error:", error);
    res.status(500).json({ error: "Failed to fetch copy snapshots" });
  }
});

router.get("/editorial-briefs", requireEditor, async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const rows = await db.select().from(editorialBriefs).orderBy(desc(editorialBriefs.createdAt)).limit(limit);
    const statusFilter = req.query.status as string | undefined;
    const filtered = statusFilter ? rows.filter((r) => r.status === statusFilter) : rows;
    res.json({ success: true, data: filtered });
  } catch (error) {
    console.error("[AgentDashboard] GET /editorial-briefs error:", error);
    res.status(500).json({ error: "Failed to fetch editorial briefs" });
  }
});

router.get("/prompt-floats", requireEditor, async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const rows = await db.select().from(promptFloats).orderBy(desc(promptFloats.surfacedAt)).limit(limit);
    const dismissed = rows.filter((r) => r.dismissed).length;
    const active = rows.filter((r) => !r.dismissed).length;
    res.json({ success: true, data: { stats: { surfaced: rows.length, dismissed, active }, recent: rows } });
  } catch (error) {
    console.error("[AgentDashboard] GET /prompt-floats error:", error);
    res.status(500).json({ error: "Failed to fetch prompt floats" });
  }
});

export function registerAgentActivityDashboardRoutes(app: any) {
  app.use("/api/agent-dashboard", router);
}
