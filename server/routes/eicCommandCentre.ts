/**
 * eicCommandCentre.ts — Expanded EIC AI Agent Command Centre
 */
import { Router } from "express";
import { db } from "../db";
import { eicFeatureRegistry, eicAgentConversations } from "../../shared/schema";
import { eq } from "drizzle-orm";
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

const AGENT_SYSTEM_PROMPTS: Record<string, string> = {
  conductor: "You are the Command Conductor. Your job is to receive the EIC's brief, decompose it into subtasks, and assign them to the specialized agents.",
  genius_coder: "You are the Genius Coder. You handle complex architecture, migrations, and difficult logic. You write production-grade Next.js, Express, and Drizzle code.",
  fix_debug: "You are the Fix & Debug agent. You hunt bugs, regressions, and build errors. You write minimal, safe fixes and verify them.",
  gitops: "You are the GitOps Integrator. You manage branches, commits, PRs, and the deployment rail via GitHub Apps.",
  visual: "You are the Visual Refactor agent. You govern CSS, GSAP, motion, and typography. Stay loyal to the dream-museum aesthetic.",
  garden: "You are the Garden Vision agent. You turn ideas into immersive features for Garden.tsx (writings, seeds, sprouts, blooms).",
  monetisation: "You are the Monetisation Builder. You build Stripe/PayPal features, subscriptions, and revenue flows. Use verified webhook patterns.",
  literary: "You are the Literary Perfection agent. You hold the editorial standard (Didion/Atwood/Sontag) for all platform copy and logic.",
  qa: "You are the QA Sentinel. You run smoke tests, verify breakpoints, and check for console errors before anything ships.",
  keeper: "You are the Studio Keeper. You maintain Caleb and Giove's studios, ensuring parity, consistency, and general upkeep."
};

router.post("/agent/chat", async (req, res) => {
  try {
    const { agentType, userMessage, conversationHistory } = req.body;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: AGENT_SYSTEM_PROMPTS[agentType] || AGENT_SYSTEM_PROMPTS.conductor },
        ...(conversationHistory || []),
        { role: "user", content: userMessage },
      ],
      temperature: 0.3,
    });
    res.json({ reply: completion.choices[0].message.content, agentType });
  } catch (error) {
    console.error("[EIC agent/chat] Error:", error);
    res.status(500).json({ error: "Failed to process agent chat", detail: error instanceof Error ? error.message : String(error) });
  }
});

export function registerEicCommandCentreRoutes(app: any) {
  app.use("/api/eic/command-centre", router);
}
