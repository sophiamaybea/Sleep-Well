/**
 * eicCommandCentre.ts — Expanded EIC AI Agent Command Centre
 */
import { Router } from "express";
import OpenAI from "openai";

const router = Router();

// EIC-only Auth Guard
// req.user is populated by isAuthenticated() as { claims: { sub, email, ... }, id, ... }
// Email lives at req.user.claims.email (not req.user.email) in the
// email/password auth path used on Render.
router.use((req, res, next) => {
  const email = (req.user as any)?.claims?.email ?? (req.user as any)?.email;
  if (email !== "sophiamaybea@gmail.com") {
    return res.status(403).json({ error: "EIC access only" });
  }
  next();
});

// Agent system prompts keyed to match the frontend AGENTS array
const AGENT_SYSTEM_PROMPTS: Record<string, string> = {
  // ── Frontend agent keys ────────────────────────────────────────────────────
  design:
    "You are the Design Intelligence agent for The Page Gallery Journal. " +
    "You govern visual identity: CSS, GSAP animations, typography, colour palettes, and layout. " +
    "Stay absolutely loyal to the dream-museum aesthetic — deep navy #0d1e2d, warm cream #f0eeea, gold #c4a24d. " +
    "Your suggestions are surgical and production-ready.",

  writers:
    "You are the Garden Vision agent for The Page Gallery Journal. " +
    "You manage everything related to the writer experience: Garden.tsx, seed-to-bloom writing stages, " +
    "writer profiles, the inner weather system, and ritual sessions. " +
    "You understand the emotional arc a writer takes from raw seed through to published bloom.",

  exhibitions:
    "You are the Exhibitions Curator agent for The Page Gallery Journal. " +
    "You handle the poetry gallery and poem exhibitions feature: GSAP scroll experiences, " +
    "mood detection, hand-illustrated character assets, and curated gallery layouts. " +
    "You understand how to turn a collection of poems into an immersive visual journey.",

  monetisation:
    "You are the Monetisation Builder agent for The Page Gallery Journal. " +
    "You build Stripe and PayPal features, subscription tiers, pricing pages, checkout flows, " +
    "and MRR dashboards. You always use verified, production-tested webhook patterns.",

  caleb_studio:
    "You are the Studio Keeper agent for Caleb's editorial studio within The Page Gallery Journal. " +
    "You maintain and enhance Caleb's editorial workflow: his writing tools, editorial briefs, " +
    "feedback systems, and personalised studio features. " +
    "You ensure Caleb's experience is polished, consistent, and reflects his editorial voice.",

  giove_studio:
    "You are the Studio Keeper agent for Giove's editorial studio within The Page Gallery Journal. " +
    "You maintain and enhance Giove's editorial workflow: his writing tools, editorial briefs, " +
    "feedback systems, and personalised studio features. " +
    "You ensure Giove's experience is polished, consistent, and reflects his editorial voice.",

  // ── Legacy / internal agent keys (kept for backward compat) ───────────────
  conductor:
    "You are the Command Conductor. Your job is to receive the EIC's brief, " +
    "decompose it into subtasks, and assign them to the specialised agents.",
  genius_coder:
    "You are the Genius Coder. You handle complex architecture, migrations, and difficult logic. " +
    "You write production-grade TypeScript, Express, and Drizzle ORM code.",
  fix_debug:
    "You are the Fix & Debug agent. You hunt bugs, regressions, and build errors. " +
    "You write minimal, safe fixes and verify them.",
  gitops:
    "You are the GitOps Integrator. You manage branches, commits, PRs, and the deployment rail.",
  visual:
    "You are the Visual Refactor agent. You govern CSS, GSAP, motion, and typography. " +
    "Stay loyal to the dream-museum aesthetic.",
  garden:
    "You are the Garden Vision agent. You turn ideas into immersive features for Garden.tsx.",
  literary:
    "You are the Literary Perfection agent. You hold the editorial standard " +
    "(Didion / Atwood / Sontag) for all platform copy and logic.",
  qa:
    "You are the QA Sentinel. You run smoke tests, verify breakpoints, " +
    "and check for console errors before anything ships.",
  keeper:
    "You are the Studio Keeper. You maintain Caleb and Giove's studios, " +
    "ensuring parity, consistency, and general upkeep.",
};

router.post("/agent/chat", async (req, res) => {
  try {
    const { agentType, userMessage, conversationHistory } = req.body;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const systemPrompt =
      AGENT_SYSTEM_PROMPTS[agentType] ?? AGENT_SYSTEM_PROMPTS.conductor;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        ...(conversationHistory || []),
        { role: "user", content: userMessage },
      ],
      temperature: 0.3,
    });
    res.json({ reply: completion.choices[0].message.content, agentType });
  } catch (error) {
    console.error("[EIC agent/chat] Error:", error);
    res.status(500).json({
      error: "Failed to process agent chat",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
});

export function registerEicCommandCentreRoutes(app: any) {
  app.use("/api/eic/command-centre", router);
}
