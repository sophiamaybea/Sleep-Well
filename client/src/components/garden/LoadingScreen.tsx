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

// T36: detect user's motion preference once at module level
const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function LoadingScreen() {
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

    // T36: only run growth interval when motion is allowed
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

  // T36: static variants — instant visibility, no transforms
  const staticVariant = { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 }, transition: { duration: 0 } };

  return (
    <div className="min-h-screen bg-transparent text-foreground relative flex items-center justify-center">
      <div className="text-center space-y-8">
        {/* Seed sprouting animation */}
        <div className="relative w-20 h-20 mx-auto">
          {/* Ground */}
          <motion.div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-px bg-emerald-700/30"
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
            <div className="w-3 h-4 rounded-full bg-amber-700/40 border border-amber-600/30" />
          </motion.div>
          {/* Stem */}
          <AnimatePresence>
            {growthStage >= 1 && (
              <motion.div
                className="absolute bottom-3 left-1/2 -translate-x-1/2 w-0.5 bg-emerald-600/50 origin-bottom"
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
                <div className="w-5 h-3 rounded-full bg-emerald-500/40 border border-emerald-500/30 -rotate-12" />
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
                <div className="w-5 h-3 rounded-full bg-emerald-500/40 border border-emerald-500/30 rotate-12" />
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
                <div className="w-4 h-4 rounded-full bg-amber-400/30 border border-amber-400/40" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Logo / wordmark */}
        <div className="space-y-1">
          <p className="font-display text-xl font-light italic text-white/60">
            The Page Gallery
          </p>
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/30">
            Journal
          </p>
        </div>

        {/* Rotating phrase — static text if reduced motion */}
        <div className="h-5">
          {prefersReducedMotion ? (
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/35">
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
                className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/35"
              >
                {gardenPhrases[phraseIndex]}
              </motion.p>
            </AnimatePresence>
          )}
        </div>

        {/* Subtle progress dots — static opacity if reduced motion */}
        <div className="flex items-center justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1 h-1 rounded-full bg-emerald-500/30"
              animate={prefersReducedMotion ? { opacity: 0.6 } : { opacity: [0.3, 0.8, 0.3] }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
