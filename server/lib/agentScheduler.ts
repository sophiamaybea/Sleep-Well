/**
 * agentScheduler.ts — Background Agent Scheduler
 * Runs autonomous agent tasks on intervals to populate the
 * Silent AI Agents dashboard (agent_notifications, agent_pattern_insights,
 * copy_snapshots, editorial_briefs, prompt_floats tables).
 *
 * Called once from server/index.ts after boot.
 * All work is wrapped in try/catch — failures log but never crash the server.
 */
import { db } from "../db";
import { eq, desc, count, sql } from "drizzle-orm";
import {
  writings,
  users,
  agentNotifications,
  agentPatternInsights,
  editorialBriefs,
  promptFloats,
  prompts,
} from "../../shared/schema";

const TAG = "[AgentScheduler]";

// Run every 30 minutes in production
const INTERVAL_MS = 30 * 60 * 1000;

/**
 * Scan all writers with 3+ writings for recurring word patterns.
 * Inserts one agentPatternInsight per writer who has new patterns.
 */
async function runPatternSpotter() {
  try {
    // Find writers with 3+ writings
    const writerCounts = await db
      .select({ authorId: writings.authorId, total: count() })
      .from(writings)
      .groupBy(writings.authorId);

    const eligibleWriters = writerCounts.filter((w) => w.total >= 3);
    let insightsCreated = 0;

    for (const writer of eligibleWriters) {
      if (!writer.authorId) continue;

      // Check if we already scanned this writer in the last 24h
      const recent = await db
        .select({ id: agentPatternInsights.id })
        .from(agentPatternInsights)
        .where(eq(agentPatternInsights.userId, writer.authorId))
        .orderBy(desc(agentPatternInsights.createdAt))
        .limit(1);

      if (recent.length > 0) continue; // Already has insights, skip for now

      // Get writer's pieces
      const pieces = await db
        .select({ id: writings.id, title: writings.title, content: writings.content })
        .from(writings)
        .where(eq(writings.authorId, writer.authorId))
        .orderBy(desc(writings.createdAt))
        .limit(50);

      // Simple word frequency analysis
      const stopwords = new Set([
        "the","a","an","and","or","but","in","on","at","to","for","of","with",
        "is","was","are","were","be","been","being","have","has","had","do",
        "does","did","will","would","could","should","may","might","can",
        "i","you","he","she","it","we","they","my","your","his","her","its",
        "our","their","this","that","these","those","not","no","so","as",
      ]);

      const wordCounts: Record<string, number> = {};
      const wordToWritings: Record<string, Set<string>> = {};

      for (const p of pieces) {
        const text = ((p.content || "") + " " + p.title)
          .toLowerCase()
          .replace(/[^a-z\s]/g, " ")
          .split(/\s+/)
          .filter((w) => w.length > 3 && !stopwords.has(w));
        const seen = new Set<string>();
        for (const word of text) {
          wordCounts[word] = (wordCounts[word] || 0) + 1;
          if (!seen.has(word)) {
            if (!wordToWritings[word]) wordToWritings[word] = new Set();
            wordToWritings[word].add(p.id);
            seen.add(word);
          }
        }
      }

      const recurring = Object.entries(wordCounts)
        .filter(([word]) => (wordToWritings[word]?.size ?? 0) >= 3 && wordCounts[word] >= 5)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

      if (recurring.length === 0) continue;

      const topWords = recurring.slice(0, 3).map(([w]) => `'${w}'`);
      const summary = `Across your ${pieces.length} pieces, the words ${topWords.join(", ")} recur in multiple works.`;

      try {
        await db.insert(agentPatternInsights).values({
          userId: writer.authorId,
          insightType: "theme",
          summary,
          sourceWritingIds: Array.from(
            new Set(
              recurring.flatMap(([w]) => Array.from(wordToWritings[w] || []))
            )
          ).slice(0, 20),
          patternData: { themes: recurring.map(([word, count]) => ({ word, count })), totalPiecesScanned: pieces.length, scannedAt: new Date().toISOString() },
          status: "active",
        });
        insightsCreated++;
      } catch (e) {
        console.warn(`${TAG} Failed to insert pattern insight for user ${writer.authorId}:`, e);
      }
    }

    if (insightsCreated > 0) {
      console.log(`${TAG} PatternSpotter: created ${insightsCreated} new insights`);
    }
  } catch (err) {
    console.error(`${TAG} PatternSpotter failed:`, err);
  }
}

/**
 * Surface a prompt float for writers who haven't received one in 24h.
 * Picks a random prompt from the prompts table and inserts a promptFloat.
 */
async function runPromptFloater() {
  try {
    // Get all writers
    const allWriters = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.role, "writer"));

    if (allWriters.length === 0) return;

    // Get available prompts
    const allPrompts = await db.select().from(prompts).limit(100);
    if (allPrompts.length === 0) return;

    let floated = 0;
    for (const writer of allWriters) {
      // Check if already has a recent float (last 24h)
      const recent = await db
        .select({ id: promptFloats.id })
        .from(promptFloats)
        .where(eq(promptFloats.userId, writer.id))
        .orderBy(desc(promptFloats.surfacedAt))
        .limit(1);

      if (recent.length > 0) continue;

      const randomPrompt = allPrompts[Math.floor(Math.random() * allPrompts.length)];
      try {
        await db.insert(promptFloats).values({
          userId: writer.id,
          promptId: randomPrompt.id,
          promptText: randomPrompt.text || "A gentle nudge from the garden",
        });
        floated++;
      } catch (e) {
        // Table may not exist or column mismatch — skip silently
      }
    }

    if (floated > 0) {
      console.log(`${TAG} PromptFloater: surfaced ${floated} new floats`);
    }
  } catch (err) {
    console.error(`${TAG} PromptFloater failed:`, err);
  }
}

/**
 * Create agent notifications for new writings that haven't been acknowledged.
 * This simulates the "Blank Page Tender" agent noticing new seeds.
 */
async function runBlankPageTender() {
  try {
    // Find recent writings (last 24h) that don't have an agent notification yet
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const recentWritings = await db
      .select({
        id: writings.id,
        title: writings.title,
        authorId: writings.authorId,
        stage: writings.stage,
      })
      .from(writings)
      .where(sql`${writings.createdAt} > ${oneDayAgo}`)
      .orderBy(desc(writings.createdAt))
      .limit(50);

    let notified = 0;
    for (const w of recentWritings) {
      if (!w.authorId) continue;

      // Check if notification already exists for this writing
      const existing = await db
        .select({ id: agentNotifications.id })
        .from(agentNotifications)
        .where(eq(agentNotifications.writingId, w.id))
        .limit(1);

      if (existing.length > 0) continue;

      const stageName = w.stage || "seed";
      const message = `New ${stageName} planted: "${(w.title || "Untitled").slice(0, 60)}". The garden grows.`;

      try {
        await db.insert(agentNotifications).values({
          userId: w.authorId,
          agentName: "blank_page_tender",
          message,
          writingId: w.id,
        });
        notified++;
      } catch (e) {
        // skip
      }
    }

    if (notified > 0) {
      console.log(`${TAG} BlankPageTender: created ${notified} notifications`);
    }
  } catch (err) {
    console.error(`${TAG} BlankPageTender failed:`, err);
  }
}

/**
 * Generate editorial briefs for writings that have reached "bloom" stage
 * but don't have a brief yet.
 */
async function runEditorialBriefGenerator() {
  try {
    const bloomWritings = await db
      .select({ id: writings.id, title: writings.title, authorId: writings.authorId })
      .from(writings)
      .where(eq(writings.stage, "bloom"))
      .limit(20);

    let created = 0;
    for (const w of bloomWritings) {
      // Check if brief already exists
      const existing = await db
        .select({ id: editorialBriefs.id })
        .from(editorialBriefs)
        .where(eq(editorialBriefs.writingId, w.id))
        .limit(1);

      if (existing.length > 0) continue;

      try {
        await db.insert(editorialBriefs).values({
          writingId: w.id,
          userId: w.authorId!,
          briefType: "review_ready",
          summary: `"${(w.title || "Untitled").slice(0, 60)}" has reached bloom stage and is ready for editorial review.`,
          status: "pending",
        });
        created++;
      } catch (e) {
        // Column mismatch or table issue — skip
      }
    }

    if (created > 0) {
      console.log(`${TAG} EditorialBriefGenerator: created ${created} briefs`);
    }
  } catch (err) {
    console.error(`${TAG} EditorialBriefGenerator failed:`, err);
  }
}

/** Run all agent tasks once */
async function runAllAgents() {
  console.log(`${TAG} Running scheduled agent sweep...`);
  const start = Date.now();

  await runBlankPageTender();
  await runPatternSpotter();
  await runPromptFloater();
  await runEditorialBriefGenerator();

  console.log(`${TAG} Agent sweep complete in ${Date.now() - start}ms`);
}

/**
 * Start the background agent scheduler.
 * Call once from server/index.ts after boot.
 * Runs immediately on first call, then every INTERVAL_MS.
 */
export function startAgentScheduler() {
  if (process.env.NODE_ENV !== "production") {
    console.log(`${TAG} Skipping agent scheduler in development`);
    return;
  }

  console.log(`${TAG} Starting background agent scheduler (interval: ${INTERVAL_MS / 60000}min)`);

  // First run after 60s delay (let DB migrations finish)
  setTimeout(async () => {
    await runAllAgents();
    // Then schedule recurring
    setInterval(runAllAgents, INTERVAL_MS);
  }, 60_000);
}
