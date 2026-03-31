import { type Express } from 'express';

/**
 * agentSystem.ts — Agent System Routes
 *
 * All routes previously in this file (moon-phase, blank-page-signal,
 * notifications, site-config) were confirmed dead in the 2026-03-30
 * dead route audit: no client calls any of these endpoints.
 * Removed 2026-03-31 to reduce unused surface area.
 *
 * The /api/agent-dashboard/notifications endpoint used by EICDashboard
 * is served by agentActivityDashboard.ts, not this file.
 */
export function registerAgentSystemRoutes(_app: Express) {
  // No active routes — all dead routes removed per audit #15
}
