import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const gardenPhrases = [
  "Preparing the soil...",
  "Watering the seeds...",
  "Opening the gate...",
  "Letting the light in...",
  "Tending the garden...",
  "Unfurling the leaves...",
];

// detect user's motion preference once at module level (T36)
const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Palette tokens per variant
// dark  — Garden / app-shell context (deep teal bg, white text)
// light — Piece / InBloom context    (paper bg #faf8f5, warm brown text)
const palette = {
  dark: {
    bg:       "bg-transparent",
    wordmark: "text-white/60",
    journal:  "text-white/30",
    phrase:   "text-white/35",
    dot:      "bg-emerald-500/30",
    ground:   "bg-emerald-700/30",
    seed:     "bg-amber-700/40 border-amber-600/30",
    stem:     "bg-emerald-600/50",
    leaf:     "bg-emerald-500/40 border-emerald-500/30",
    bloom:    "bg-amber-400/30 border-amber-400/40",
  },
  light: {
    bg:       "bg-[#faf8f5]",
    wordmark: "text-[#4a3728]/70",
    journal:  "text-[#8B7355]/60",
    phrase:   "text-[#8B7355]/60",
    dot:      "bg-[#8B7355]/30",
    ground:   "bg-[#8B7355]/30",
    seed:     "bg-[#b09070]/40 border-[#8B7355]/30",
    stem:     "bg-[#6b8c5a]/50",
    leaf:     "bg-[#6b8c5a]/40 border-[#6b8c5a]/30",
    bloom:    "bg-[#c4a24d]/30 border-[#c4a24d]/40",
  },
} as const;

type Variant = "dark" | "light";

export default function LoadingScreen({ variant = "dark" }: { variant?: Variant }) {
  const p = palette[variant];

  const [phraseIndex, setPhraseIndex] = useState(() =>
    Math.floor(Math.random() * gardenPhrases.length)
  );
  // T36: if reduced-motion, skip growth animation — jump straight to final stage
  const [growthStage, setGrowthStage] = useState(
    prefersReducedMotion ? 3 : 0
  );

  useEffect(() => {
    const phraseTimer = setInterval(() => {
      setPhraseIndex((i) => (i + 1) % gardenPhrases.length);
    }, 1800);

    let growthTimer: ReturnType<typeof setInterval> | undefined;
    if (!prefersReducedMotion) {
      growthTimer = setInterval(() => {
        setGrowthStage((s) => Math.min(s + 1, 3));
      }, 600);
    }

    return () => {
      clearInterval(phraseTimer);
      if (growthTimer !== undefined) clearInterval(growthTimer);
    };
  }, []);

  return (
    <div className={`min-h-screen ${p.bg} relative flex items-center justify-center`}>
      <div className="text-center space-y-8">
        {/* Seed sprouting animation */}
        <div className="relative w-20 h-20 mx-auto">
          {/* Ground line */}
          <motion.div
            className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-px ${p.ground}`}
            initial={{ scaleX: prefersReducedMotion ? 1 : 0 }}
            animate={{ scaleX: 1 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5 }}
          />
          {/* Seed */}
          <motion.div
            className="absolute bottom-0 left-1/2 -translate-x-1/2"
            initial={{ opacity: prefersReducedMotion ? 1 : 0 }}
            animate={{ opacity: growthStage >= 0 ? 1 : 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
          >
            <div className={`w-3 h-4 rounded-full border ${p.seed}`} />
          </motion.div>
          {/* Stem */}
          <AnimatePresence>
            {growthStage >= 1 && (
              <motion.div
                className={`absolute bottom-3 left-1/2 -translate-x-1/2 w-0.5 ${p.stem} origin-bottom`}
                initial={{ height: prefersReducedMotion ? 36 : 0 }}
                animate={{ height: 36 }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, ease: "easeOut" }}
              />
            )}
          </AnimatePresence>
          {/* Left leaf */}
          <AnimatePresence>
            {growthStage >= 2 && (
              <motion.div
                className="absolute left-1/2 -translate-x-full"
                style={{ bottom: 26 }}
                initial={prefersReducedMotion ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4, ease: "backOut" }}
              >
                <div className={`w-5 h-3 rounded-full border ${p.leaf} -rotate-12`} />
              </motion.div>
            )}
          </AnimatePresence>
          {/* Right leaf */}
          <AnimatePresence>
            {growthStage >= 2 && (
              <motion.div
                className="absolute left-1/2"
                style={{ bottom: 26 }}
                initial={prefersReducedMotion ? { scale: 1, rotate: 0 } : { scale: 0, rotate: 30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4, ease: "backOut", delay: 0.1 }}
              >
                <div className={`w-5 h-3 rounded-full border ${p.leaf} rotate-12`} />
              </motion.div>
            )}
          </AnimatePresence>
          {/* Bloom */}
          <AnimatePresence>
            {growthStage >= 3 && (
              <motion.div
                className="absolute left-1/2 -translate-x-1/2"
                style={{ bottom: 38 }}
                initial={prefersReducedMotion ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, type: "spring", stiffness: 200, damping: 10 }}
              >
                <div className={`w-4 h-4 rounded-full border ${p.bloom}`} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Logo / wordmark */}
        <div className="space-y-1">
          <p className={`font-display text-xl font-light italic ${p.wordmark}`}>
            The Page Gallery
          </p>
          <p className={`font-mono text-[9px] uppercase tracking-[0.3em] ${p.journal}`}>
            Journal
          </p>
        </div>

        {/* Rotating phrase */}
        <div className="h-5">
          {prefersReducedMotion ? (
            <p className={`font-mono text-[10px] uppercase tracking-[0.25em] ${p.phrase}`}>
              {gardenPhrases[phraseIndex]}
            </p>
          ) : (
            <AnimatePresence mode="wait">
              <motion.p
                key={phraseIndex}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3 }}
                className={`font-mono text-[10px] uppercase tracking-[0.25em] ${p.phrase}`}
              >
                {gardenPhrases[phraseIndex]}
              </motion.p>
            </AnimatePresence>
          )}
        </div>

        {/* Subtle progress dots */}
        <div className="flex items-center justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={`w-1 h-1 rounded-full ${p.dot}`}
              animate={prefersReducedMotion ? { opacity: 0.6 } : { opacity: [0.3, 0.8, 0.3] }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
