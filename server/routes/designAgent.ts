import { Router, Request, Response } from "express";
import { isAuthenticated } from "../replit_integrations/auth";
import { db } from "../db";
import { storage } from "../storage";

const router = Router();

// ── Design Intelligence Agent ─────────────────────────────────────────────────
// Background agent that analyses page composition and suggests layout
// refinements, colour palette swaps, and typographic rhythm adjustments.
// Runs silently on the server; the client sees only polished suggestions.

/**
 * POST /api/design/palette
 * Accepts a seed colour hex and a content mood, returns a harmonious palette.
 */
router.post("/api/design/palette", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { seedColor = "#2d4a3e", mood = "calm", count = 5 } = req.body;

    // Derive palette via perceptual hue rotation — no external call needed.
    const base = parseInt(seedColor.replace("#", ""), 16);
    const r = (base >> 16) & 0xff;
    const g = (base >> 8) & 0xff;
    const b = base & 0xff;

    const moodShift: Record<string, number> = {
      calm: 30,
      energetic: 60,
      luxe: 15,
      earthy: 45,
      airy: 20,
    };
    const shift = moodShift[mood] ?? 30;

    const palette = Array.from({ length: Number(count) }, (_, i) => {
      const angle = (shift * i) % 360;
      const rad = (angle * Math.PI) / 180;
      const nr = Math.min(255, Math.round(r * Math.abs(Math.cos(rad)) + g * 0.15));
      const ng = Math.min(255, Math.round(g * Math.abs(Math.sin(rad)) + b * 0.15));
      const nb = Math.min(255, Math.round(b * Math.abs(Math.cos(rad + 1)) + r * 0.1));
      return `#${nr.toString(16).padStart(2, "0")}${ng.toString(16).padStart(2, "0")}${nb.toString(16).padStart(2, "0")}`;
    });

    res.json({ palette, mood, seedColor });
  } catch (err) {
    console.error("[designAgent] palette error:", err);
    res.status(500).json({ error: "Could not generate palette" });
  }
});

/**
 * POST /api/design/layout-score
 * Scores a layout description and returns actionable balance tips.
 */
router.post("/api/design/layout-score", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { columns = 1, imageRatio = 0.5, textBlocks = 1, hasHero = false } = req.body;

    let score = 70;
    const tips: string[] = [];

    if (columns === 2 || columns === 3) score += 10;
    if (columns > 4) { score -= 10; tips.push("Reduce column count for readability on mobile."); }
    if (imageRatio > 0.7) { score -= 5; tips.push("Balance imagery with breathing room — try a 60/40 split."); }
    if (imageRatio < 0.2) { score -= 5; tips.push("A stronger visual anchor increases engagement."); }
    if (hasHero) score += 10;
    if (textBlocks > 6) { score -= 5; tips.push("Break long text into shorter, scannable sections."); }
    if (tips.length === 0) tips.push("Layout proportions look strong — refine typography next.");

    res.json({ score: Math.max(0, Math.min(100, score)), tips });
  } catch (err) {
    console.error("[designAgent] layout-score error:", err);
    res.status(500).json({ error: "Could not score layout" });
  }
});

/**
 * POST /api/design/typography
 * Given a brand voice and font pairing preferences, suggests type scale & weights.
 */
router.post("/api/design/typography", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { voice = "editorial", baseSize = 16 } = req.body;
    const base = Number(baseSize);

    const scales: Record<string, number> = {
      editorial: 1.333,
      minimal: 1.25,
      bold: 1.5,
      playful: 1.414,
    };
    const ratio = scales[voice] ?? 1.333;

    const pairings: Record<string, { heading: string; body: string }> = {
      editorial: { heading: "Playfair Display", body: "Source Serif 4" },
      minimal: { heading: "DM Sans", body: "Inter" },
      bold: { heading: "Space Grotesk", body: "Manrope" },
      playful: { heading: "Nunito", body: "Lato" },
    };
    const fonts = pairings[voice] ?? pairings.editorial;

    const scale = {
      xs: Math.round(base / ratio),
      sm: base,
      md: Math.round(base * ratio),
      lg: Math.round(base * ratio * ratio),
      xl: Math.round(base * ratio ** 3),
      xxl: Math.round(base * ratio ** 4),
    };

    res.json({ fonts, scale, voice, ratio });
  } catch (err) {
    console.error("[designAgent] typography error:", err);
    res.status(500).json({ error: "Could not generate typography" });
  }
});

/**
 * GET /api/design/gallery-refresh
 * Looks at existing gallery entries and suggests a seasonal refresh theme.
 */
router.get("/api/design/gallery-refresh", isAuthenticated, async (_req: Request, res: Response) => {
  try {
    const month = new Date().getMonth(); // 0-indexed
    const seasons = [
      { name: "winter", months: [11, 0, 1], palette: ["#dde8f0", "#a8c4d4", "#4a7fa5", "#1b3a52"], mood: "serene" },
      { name: "spring", months: [2, 3, 4], palette: ["#f5f0e8", "#d4e8c2", "#8ab87a", "#3d6b3f"], mood: "fresh" },
      { name: "summer", months: [5, 6, 7], palette: ["#fef9ec", "#f7e07a", "#e89c3f", "#c05e2e"], mood: "vibrant" },
      { name: "autumn", months: [8, 9, 10], palette: ["#faf3e0", "#e8c27a", "#c07840", "#7a3e1e"], mood: "warm" },
    ];

    const current = seasons.find((s) => s.months.includes(month)) ?? seasons[0];
    const tips = [
      `Lean into ${current.mood} tones for the ${current.name} edit.`,
      "Update hero imagery to reflect the seasonal mood board.",
      "Rotate featured collections to align with subscriber search trends.",
      "Consider a limited-palette flash sale banner for urgency.",
    ];

    res.json({ season: current.name, palette: current.palette, mood: current.mood, tips });
  } catch (err) {
    console.error("[designAgent] gallery-refresh error:", err);
    res.status(500).json({ error: "Could not generate refresh suggestion" });
  }
});

/**
 * POST /api/design/accessibility-check
 * Checks contrast ratio between two hex colours and rates WCAG compliance.
 */
router.post("/api/design/accessibility-check", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { foreground = "#000000", background = "#ffffff" } = req.body;

    const relativeLuminance = (hex: string): number => {
      const rgb = parseInt(hex.replace("#", ""), 16);
      const channels = [(rgb >> 16) & 0xff, (rgb >> 8) & 0xff, rgb & 0xff].map((c) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
    };

    const l1 = relativeLuminance(foreground);
    const l2 = relativeLuminance(background);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    const ratioFixed = Math.round(ratio * 100) / 100;

    const wcag = {
      AA_normal: ratio >= 4.5,
      AA_large: ratio >= 3,
      AAA_normal: ratio >= 7,
      AAA_large: ratio >= 4.5,
    };

    const suggestion = ratio < 3
      ? "Very low contrast — increase the difference between foreground and background."
      : ratio < 4.5
      ? "Passes for large text only — darken or lighten one colour for body copy."
      : "Good contrast — meets WCAG AA for body text.";

    res.json({ ratio: ratioFixed, wcag, suggestion });
  } catch (err) {
    console.error("[designAgent] accessibility-check error:", err);
    res.status(500).json({ error: "Could not check accessibility" });
  }
});

export function registerDesignAgentRoutes(app: any) {
  app.use(router);
}
