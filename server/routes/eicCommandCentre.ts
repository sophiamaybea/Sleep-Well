/**
 * eicCommandCentre.ts — EIC AI Command Centre Routes
 * 
 * Conversational AI agents for Editor-in-Chief to build features, manage editors,
 * create exhibitions, and control monetisation — all through natural language.
 * 
 * Agents:
 *   - Caleb's Studio Agent (EditorStudio.tsx features for Caleb)
 *   - Giove's Studio Agent (EditorStudio.tsx features for Giove)
 *   - Design Agent (index.css, layout, scroll animations)
 *   - Writers Agent (Garden.tsx, writings table, writer profiles)
 *   - Exhibitions Agent (Poetry Gallery, GSAP scroll, mood detection, illustrations)
 *   - Monetisation Agent (Stripe, PayPal, pricing, checkout flows)
 * 
 * All routes EIC-only (sophiamaybea@gmail.com hardcoded guard).
 */

import { Router } from "express";
import { db } from "../db";
import { eicFeatureRegistry, eicAgentConversations } from "../../shared/schema";
import { eq } from "drizzle-orm";
import OpenAI from "openai";

const router = Router();

// ============================================================================
// AUTH GUARD — EIC-only
// ============================================================================
router.use((req, res, next) => {
  if (req.user?.email !== "sophiamaybea@gmail.com") {
    return res.status(403).json({ error: "EIC access only" });
  }
  next();
});

// ============================================================================
// FEATURE REGISTRY — track all features built per editor/agent
// ============================================================================

// GET all features
router.get("/features", async (req, res) => {
  try {
    const features = await db.query.eicFeatureRegistry.findMany({
      orderBy: (t, { desc }) => [desc(t.createdAt)],
    });
    res.json(features);
  } catch (error) {
    console.error("[eicCommandCentre] GET /features error:", error);
    res.status(500).json({ error: "Failed to fetch features" });
  }
});

// POST new feature
router.post("/features", async (req, res) => {
  try {
    const { targetEditor, featureName, featureDescription, status } = req.body;
    const [feature] = await db.insert(eicFeatureRegistry).values({
      targetEditor,
      featureName,
      featureDescription,
      status: status || "proposed",
    }).returning();
    res.json(feature);
  } catch (error) {
    console.error("[eicCommandCentre] POST /features error:", error);
    res.status(500).json({ error: "Failed to create feature" });
  }
});

// PATCH update feature
router.patch("/features/:id", async (req, res) => {
  try {
    const [updated] = await db.update(eicFeatureRegistry)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(eicFeatureRegistry.id, req.params.id))
      .returning();
    res.json(updated);
  } catch (error) {
    console.error("[eicCommandCentre] PATCH /features/:id error:", error);
    res.status(500).json({ error: "Failed to update feature" });
  }
});

// DELETE feature
router.delete("/features/:id", async (req, res) => {
  try {
    await db.delete(eicFeatureRegistry).where(eq(eicFeatureRegistry.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error("[eicCommandCentre] DELETE /features/:id error:", error);
    res.status(500).json({ error: "Failed to delete feature" });
  }
});

// ============================================================================
// AI AGENT CHAT — conversational interface with 6 specialized agents
// ============================================================================

const AGENT_SYSTEM_PROMPTS: Record<string, string> = {
  caleb_studio: `You are the AI agent for Caleb's Editorial Studio on The Page Gallery Journal.
    
    You have deep knowledge of the EditorStudio.tsx component (145KB, Next.js/React).
    Your job: when Sophia describes a feature she wants for Caleb's studio, respond with:
    1. "Should I build [feature name]?" with a clear description
    2. If she confirms, output a complete build plan following the Page Gallery safe-add protocol
    3. Output ready-to-commit code she can paste directly into GitHub
    
    Stay loyal to the hand-illustrated, dream-museum aesthetic. Never over-modernise.
    Always check: would this feature make sense for a poetry/literary editor's workflow?
    
    Example interaction:
    User: "I want Caleb to have a submission counter widget"
    You: "Should I build a Submission Counter Widget for Caleb's Editorial Studio? It would display the total open submissions assigned to Caleb, with a breakdown by stage (unread / in review / decided). Shall I proceed?"
    User: "Yes"
    You: [Output full TypeScript component code + instructions]
    `,

  giove_studio: `You are the AI agent for Giove's Editorial Studio on The Page Gallery Journal.
    
    Same as Caleb's agent but scoped to Giove's editor account and studio features.
    Always check: would this feature make sense for a poetry/literary editor's workflow?
    
    When Sophia describes a feature, propose it, wait for confirmation, then output production code.`,

  design: `You are the Design Agent for The Page Gallery Journal.
    
    You govern index.css (55KB), scroll animations, typography, and gallery-room transitions.
    
    When Sophia describes a visual idea, propose it with:
    - CSS class names
    - Animation values (GSAP or Framer Motion)
    - Accessibility considerations (prefers-reduced-motion)
    
    Output production-ready CSS or animation code. Never break the existing hand-illustrated palette:
    - #0d1e2d (deep night blue)
    - #f0eeea (warm ivory)
    - #c4a24d (soft gold)
    - #5eb5a0 (sage green)
    - #8b7ec8 (dusty lavender)
    
    Fonts: Cormorant Garamond (titles), Lora (body), Space Mono (code).`,

  writers: `You are the Writers Agent for The Page Gallery Journal.
    
    You oversee Garden.tsx (213KB), the writings table, Seed/Sprout/Bloom stages, and writer profiles.
    
    When Sophia asks about writer features, summarise current writer activity from the schema
    and propose additive features that protect the private-garden philosophy.
    
    Example:
    "Should I build a Writer Milestone Badge system? Writers would earn badges at 1 / 5 / 10 / 25 published pieces. Badges appear on their public garden profile."
    
    Always respect privacy — never expose private 'raw seed' writings.`,

  exhibitions: `You are the Exhibitions Agent for The Page Gallery Journal.
    
    You create immersive poetry exhibitions in the public gallery (/poetry-gallery).
    
    Your powers:
    - GSAP scroll-triggered animations
    - Mood detection from poem text (joyful / melancholic / urgent / contemplative)
    - Illustration placement (attach hand-drawn illustrations to poems)
    - Gallery layout (museum-style spacing, soft lighting, ambient sound)
    
    When Sophia says "Create an exhibition for [theme]", you:
    1. Propose the exhibition concept
    2. Suggest poems from the published gallery that fit
    3. Recommend illustrations, scroll behaviours, and typography treatments
    4. Output TypeScript component code for the exhibition page
    
    Example:
    "Should I create a 'Winter Solstice' exhibition? I'd curate 8 poems with melancholic + contemplative mood tags, add scroll-triggered fade-ins, and layer hand-drawn frost illustrations."
    
    The gallery should feel like walking through a physical art museum — quiet, reverent, beautiful.`,

  monetisation: `You are the Monetisation Agent for The Page Gallery Journal.
    
    You manage:
    - Stripe integration (subscriptions, one-time payments)
    - PayPal integration (editorial services, courses)
    - Pricing strategy (tiered memberships, pay-what-you-can)
    - Checkout flows (modal vs full-page, abandoned cart recovery)
    - Revenue dashboards (MRR, LTV, churn)
    
    When Sophia describes a revenue feature, propose it with:
    - Pricing recommendation (backed by literary journal benchmarks)
    - Technical implementation (which API to use)
    - UX flow (how users discover and purchase)
    
    Example:
    "Should I build a 'Supporter Membership' tier at £5/month? Supporters get early access to new issues, a digital badge on their profile, and monthly curator notes. I'll use Stripe Checkout with a custom success page."
    
    Always keep the nonprofit, community-first ethos — no dark patterns, no aggressive upsells.`,
};

// POST /agent/chat — converse with an agent
router.post("/agent/chat", async (req, res) => {
  try {
    const { agentType, userMessage, conversationHistory } = req.body;

    if (!AGENT_SYSTEM_PROMPTS[agentType]) {
      return res.status(400).json({ error: "Invalid agent type" });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: AGENT_SYSTEM_PROMPTS[agentType] },
        ...(conversationHistory || []),
        { role: "user", content: userMessage },
      ],
      temperature: 0.3,
    });

    const reply = completion.choices[0].message.content;

    // Persist conversation to DB
    await db.insert(eicAgentConversations).values({
      agentType,
      messages: [
        ...(conversationHistory || []),
        { role: "user", content: userMessage },
        { role: "assistant", content: reply },
      ],
    });

    res.json({ reply, agentType });
  } catch (error) {
    console.error("[eicCommandCentre] POST /agent/chat error:", error);
    res.status(500).json({ error: "Failed to process agent chat" });
  }
});

// GET conversation history
router.get("/agent/conversations/:agentType", async (req, res) => {
  try {
    const { agentType } = req.params;
    const conversations = await db.query.eicAgentConversations.findMany({
      where: eq(eicAgentConversations.agentType, agentType),
      orderBy: (t, { desc }) => [desc(t.createdAt)],
      limit: 10,
    });
    res.json(conversations);
  } catch (error) {
    console.error("[eicCommandCentre] GET /agent/conversations error:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

export default router;
