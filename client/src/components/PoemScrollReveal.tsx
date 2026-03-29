// client/src/components/PoemScrollReveal.tsx
//
// Scroll-driven poem reveal for The Page Gallery.
// 
// Phase 1 — CINEMATIC: As you scroll, each line materializes one at a time
// Phase 2 — FULL POEM: Once all lines revealed, full poem fades in
//
// No new packages required — gsap ^3.12.7 already installed

import { useEffect, useRef, useState, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, AnimatePresence } from "framer-motion";
import { ContentRenderer, stripHtml } from "@/components/garden/RichEditor";

gsap.registerPlugin(ScrollTrigger);

// ─── Types ───────────────────────────────────────────────────────────────────

type PoemMood = "love" | "loss" | "nature" | "identity" | "time" | "place" | "other";

interface LineRevealConfig {
  from: gsap.TweenVars;
  to: gsap.TweenVars;
  lineClass: string;
}

// ─── Mood detection ──────────────────────────────────────────────────────────

const MOOD_KEYWORDS: Record<PoemMood, string[]> = {
  love:     ["love", "heart", "kiss", "embrace", "longing", "desire", "tender", "beloved", "passion", "ache"],
  loss:     ["grief", "loss", "death", "mourn", "gone", "absence", "memory", "ghost", "grave", "funeral"],
  nature:   ["tree", "river", "mountain", "ocean", "sky", "bird", "forest", "field", "stone", "wind"],
  identity: ["mirror", "self", "name", "body", "skin", "voice", "home", "mother", "father", "belong"],
  time:     ["time", "clock", "year", "age", "old", "young", "past", "future", "moment", "forever"],
  place:    ["city", "town", "country", "road", "street", "house", "room", "window", "door", "wall"],
  other:    [],
};

function detectMood(text: string): PoemMood {
  const lower = text.toLowerCase();
  let best: PoemMood = "other";
  let bestCount = 0;
  for (const [mood, keywords] of Object.entries(MOOD_KEYWORDS) as [PoemMood, string[]][]) {
    const count = keywords.filter((k) => lower.includes(k)).length;
    if (count > bestCount) { bestCount = count; best = mood; }
  }
  return bestCount >= 1 ? best : "other";
}

// ─── Per-mood reveal configs ─────────────────────────────────────────────────

const MOOD_CONFIG: Record<PoemMood, LineRevealConfig> = {
  love: {
    from: { opacity: 0, y: 14, scale: 0.98, filter: "blur(1.5px)" },
    to:   { opacity: 1, y: 0,  scale: 1,    filter: "blur(0px)", duration: 1.1, ease: "power2.out" },
    lineClass: "tracking-wide",
  },
  loss: {
    from: { opacity: 0, x: -18, filter: "blur(2px)" },
    to:   { opacity: 1, x: 0,   filter: "blur(0px)", duration: 1.3, ease: "power3.out" },
    lineClass: "tracking-normal opacity-90",
  },
  nature: {
    from: { opacity: 0, y: 10, scale: 0.99 },
    to:   { opacity: 1, y: 0,  scale: 1,    duration: 1.4, ease: "sine.inOut" },
    lineClass: "tracking-wide",
  },
  identity: {
    from: { opacity: 0, y: 20 },
    to:   { opacity: 1, y: 0,  duration: 0.9, ease: "power2.inOut" },
    lineClass: "tracking-tight font-medium",
  },
  time: {
    from: { opacity: 0, x: 16, filter: "blur(1px)" },
    to:   { opacity: 1, x: 0,  filter: "blur(0px)", duration: 1.1, ease: "expo.out" },
    lineClass: "italic",
  },
  place: {
    from: { opacity: 0, y: 28, scale: 0.97 },
    to:   { opacity: 1, y: 0,  scale: 1,    duration: 1.2, ease: "power3.out" },
    lineClass: "tracking-wide",
  },
  other: {
    from: { opacity: 0, y: 8 },
    to:   { opacity: 1, y: 0, duration: 0.85, ease: "power1.out" },
    lineClass: "",
  },
};

// ─── HTML → line parser ──────────────────────────────────────────────────────

interface ParsedLine {
  text: string;
  html: string;
  stanzaIndex: number;
  isBlank: boolean;
}

function parsePoem(html: string): ParsedLine[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");
  const root = doc.querySelector("div")!;
  const result: ParsedLine[] = [];

  let stanzaIndex = 0;
  for (const node of Array.from(root.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) continue;
    const el = node as HTMLElement;

    if (stanzaIndex > 0) {
      result.push({ text: "", html: "", stanzaIndex, isBlank: true });
    }

    if (el.tagName === "P") {
      const inner = el.innerHTML;
      const parts = inner.split(/<br\s*\/?>/i);
      for (const part of parts) {
        const text = part.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ")
          .replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim();
        result.push({ text, html: part, stanzaIndex, isBlank: false });
      }
    } else {
      const text = el.textContent?.trim() ?? "";
      result.push({ text, html: el.outerHTML, stanzaIndex, isBlank: false });
    }

    stanzaIndex++;
  }

  return result;
}

// ─── Component ───────────────────────────────────────────────────────────────

interface PoemScrollRevealProps {
  content: string;
  theme: "light" | "dark";
  title: string;
}

export default function PoemScrollReveal({ content, theme, title }: PoemScrollRevealProps) {
  const lines = useMemo(() => parsePoem(content), [content]);
  const mood = useMemo(() => detectMood(stripHtml(content)), [content]);
  const config = MOOD_CONFIG[mood];

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const [phase, setPhase] = useState<"cinematic" | "full">(
    prefersReduced ? "full" : "cinematic"
  );
  const [revealedCount, setRevealedCount] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const triggersRef = useRef<ScrollTrigger[]>([]);

  const textBase = theme === "light" ? "text-[#4a3728]" : "text-white/85";
  const textMuted = theme === "light" ? "text-[#8B7355]" : "text-white/50";
  const bg = theme === "light" ? "bg-[#faf8f5]" : "bg-[#0b101a]";
  const moodLabel = {
    love: "Love & Longing",
    loss: "Grief & Memory",
    nature: "The Natural World",
    identity: "Self & Belonging",
    time: "Time & Transience",
    place: "Place & Journey",
    other: "",
  }[mood];

  // Cinematic phase: set up ScrollTrigger
  useEffect(() => {
    if (phase !== "cinematic" || prefersReduced) return;

    const container = containerRef.current;
    if (!container) return;

    triggersRef.current.forEach((t) => t.kill());
    triggersRef.current = [];

    const nonBlankLines = lineRefs.current.filter(Boolean);

    nonBlankLines.forEach((el, i) => {
      if (!el) return;
      gsap.set(el, config.from);

      const trigger = ScrollTrigger.create({
        trigger: el,
        scroller: container,
        start: "top 82%",
        once: true,
        onEnter: () => {
          gsap.to(el, {
            ...config.to,
            onStart: () => setRevealedCount((c) => Math.max(c, i + 1)),
          });
        },
      });

      triggersRef.current.push(trigger);
    });

    ScrollTrigger.refresh();

    return () => {
      triggersRef.current.forEach((t) => t.kill());
      triggersRef.current = [];
    };
  }, [phase, lines, config, prefersReduced]);

  // Transition to full poem when all lines revealed
  useEffect(() => {
    if (phase !== "cinematic") return;
    const substantiveLines = lines.filter((l) => !l.isBlank);
    if (revealedCount >= substantiveLines.length && substantiveLines.length > 0) {
      const t = setTimeout(() => setPhase("full"), 900);
      return () => clearTimeout(t);
    }
  }, [revealedCount, lines, phase]);

  // Full-poem phase: scroll to top
  useEffect(() => {
    if (phase === "full" && containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [phase]);

  const substantiveLineCount = lines.filter((l) => !l.isBlank).length;
  const progress = Math.min(revealedCount / Math.max(substantiveLineCount, 1), 1);

  // Full Poem phase
  if (phase === "full") {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="full-poem"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className={`w-full ${textBase}`}
        >
          <div className="prose prose-lg max-w-none font-serif" style={{ lineHeight: 1.8 }}>
            <ContentRenderer content={content} />
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Cinematic phase
  return (
    <div
      ref={containerRef}
      className={`w-full h-[70vh] overflow-y-auto ${bg} relative`}
      style={{ scrollbarWidth: "thin" }}
    >
      <div className="max-w-2xl mx-auto px-6 py-12">
        {moodLabel && (
          <div className={`${textMuted} text-xs uppercase tracking-[0.3em] mb-8 text-center font-mono`}>
            {moodLabel}
          </div>
        )}
        <div className="space-y-4 font-serif text-lg" style={{ lineHeight: 1.9 }}>
          {lines.map((line, i) => {
            if (line.isBlank) {
              return <div key={`blank-${i}`} className="h-6" />;
            }
            return (
              <div
                key={i}
                ref={(el) => { lineRefs.current[i] = el; }}
                className={`${textBase} ${config.lineClass}`}
                dangerouslySetInnerHTML={{ __html: line.html }}
              />
            );
          })}
          <div className="h-screen" />
        </div>
      </div>

      {/* Progress indicator */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className={`${textMuted} text-xs font-mono tracking-widest`}>
          {Math.round(progress * 100)}%
        </div>
      </div>
    </div>
  );
}
