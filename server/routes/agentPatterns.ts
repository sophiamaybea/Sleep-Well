/**
 * agentPatterns.ts — AI Pattern Spotter Agent Routes
 * New file — does not modify any existing route files.
 *
 * POST /api/agent/patterns/scan   — scan writer's own writings for patterns
 * GET  /api/agent/patterns        — get active pattern insights for user
 * POST /api/agent/patterns/:id/dismiss — dismiss an insight
 *
 * Privacy guarantee:
 *   - Only reads writings WHERE authorId = req.user.id
 *   - Never surfaces another user's data
 *   - No content is sent externally; all analysis is local string processing
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
 * Local pattern extraction — no external API calls.
 * Counts word frequency across a set of writings to find recurring themes.
 */
function extractThemes(writings: Array<{ id: string; content: string; title: string }>) {
  // Common words to ignore
  const stopwords = new Set([
    'the','a','an','and','or','but','in','on','at','to','for','of','with',
    'is','was','are','were','be','been','being','have','has','had','do',
    'does','did','will','would','could','should','may','might','can',
    'i','you','he','she','it','we','they','my','your','his','her','its',
    'our','their','this','that','these','those','not','no','so','as',
    'by','from','up','about','into','through','during','before','after',
    'above','below','between','each','other','such','than','too','very',
    'just','because','if','then','than','when','where','who','which',
    'all','both','few','more','most','other','some','such','own','same',
  ]);

  const wordCounts: Record<string, number> = {};
  const wordToWritings: Record<string, string[]> = {};

  for (const w of writings) {
    const words = (w.content + ' ' + w.title)
      .toLowerCase()
      .replace(/[^a-z\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 3 && !stopwords.has(word));

    const seen = new Set<string>();
    for (const word of words) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
      if (!seen.has(word)) {
        wordToWritings[word] = wordToWritings[word] || [];
        wordToWritings[word].push(w.id);
        seen.add(word);
      }
    }
  }

  // Find words that appear in 3+ different writings
  const recurring = Object.entries(wordCounts)
    .filter(([word, count]) => {
      const uniqueWritings = new Set(wordToWritings[word] || []).size;
      return uniqueWritings >= 3 && count >= 5;
    })
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  return recurring.map(([word, count]) => ({
    word,
    count,
    writingIds: [...new Set(wordToWritings[word] || [])].slice(0, 10),
  }));
}

/**
 * POST /api/agent/patterns/scan
 * Analyses the writer's own writings for recurring themes.
 * Stores results in agent_pattern_insights.
 * Should be called after a writer has 5+ writings.
 */
router.post('/scan', requireAuth, async (req: any, res) => {
  const userId = req.user.id;
  try {
    const { writings, agentPatternInsights } = await import('../../shared/schema');

    // Only scan the writer's own writings — WHERE authorId = userId
    const writerPieces = await db
      .select({
        id: writings.id,
        title: writings.title,
        content: writings.content,
        genre: writings.genre,
        stage: writings.stage,
        createdAt: writings.createdAt,
      })
      .from(writings)
      .where(eq(writings.authorId, userId))
      .orderBy(desc(writings.createdAt))
      .limit(100);

    if (writerPieces.length < 3) {
      return res.json({
        success: true,
        data: null,
        message: 'Need at least 3 writings for pattern analysis',
      });
    }

    const themes = extractThemes(
      writerPieces.map((w) => ({
        id: w.id,
        content: w.content || '',
        title: w.title,
      }))
    );

    if (themes.length === 0) {
      return res.json({ success: true, data: null, message: 'No strong patterns found yet' });
    }

    // Build a human-readable summary
    const topWords = themes.slice(0, 3).map((t) => `'${t.word}'`);
    const summary =
      `Across your ${writerPieces.length} pieces, the words ${topWords.join(', ')} ` +
      `recur in multiple works. These may be recurring preoccupations worth exploring deliberately.`;

    // Store the insight — additive only, new table
    let insight: any = null;
    try {
      const [inserted] = await db
        .insert(agentPatternInsights)
        .values({
          userId,
          insightType: 'theme',
          summary,
          sourceWritingIds: themes.flatMap((t) => t.writingIds).slice(0, 20),
          patternData: {
            themes,
            totalPiecesScanned: writerPieces.length,
            scannedAt: new Date().toISOString(),
          },
          status: 'active',
        })
        .returning();
      insight = inserted;
    } catch (insertError) {
      // Table may not exist yet in Supabase — return result without persisting
      console.warn('[Agent:PatternSpotter] agent_pattern_insights table not found, returning result without storing');
      insight = { summary, themes, ephemeral: true };
    }

    res.json({
      success: true,
      data: {
        insight,
        themes,
        totalPiecesScanned: writerPieces.length,
      },
    });
  } catch (error) {
    console.error('[Agent:PatternSpotter] Error:', error);
    res.status(500).json({ error: 'Failed to run pattern analysis' });
  }
});

/**
 * GET /api/agent/patterns
 * Returns active (non-dismissed) pattern insights for the authenticated writer.
 */
router.get('/', requireAuth, async (req: any, res) => {
  const userId = req.user.id;
  try {
    const { agentPatternInsights } = await import('../../shared/schema');
    const insights = await db
      .select()
      .from(agentPatternInsights)
      .where(
        and(
          eq(agentPatternInsights.userId, userId),
          eq(agentPatternInsights.status, 'active')
        )
      )
      .orderBy(desc(agentPatternInsights.createdAt))
      .limit(5);
    res.json({ success: true, data: insights });
  } catch (error) {
    // Graceful degradation
    res.json({ success: true, data: [] });
  }
});

/**
 * POST /api/agent/patterns/:id/dismiss
 * Dismisses a pattern insight so it no longer shows in the panel.
 */
router.post('/:id/dismiss', requireAuth, async (req: any, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  try {
    const { agentPatternInsights } = await import('../../shared/schema');
    await db
      .update(agentPatternInsights)
      .set({ status: 'dismissed', dismissedAt: new Date() })
      .where(
        and(
          eq(agentPatternInsights.id, id),
          eq(agentPatternInsights.userId, userId) // users can only dismiss their own
        )
      );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to dismiss insight' });
  }
});

export function registerAgentPatternRoutes(app: any) {
  app.use('/api/agent/patterns', router);
}
