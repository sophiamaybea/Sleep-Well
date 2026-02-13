import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import {
  Plus, Trash2, ChevronLeft, Feather, Sparkles, PenLine,
  Search, Filter, ChevronDown, ArrowRight, BookOpen, Lock
} from "lucide-react";
import StarBackground from "@/components/StarBackground";
import GardenSidebar from "@/components/GardenSidebar";
import type { GardenView } from "@/components/GardenSidebar";
import type { Writing } from "@shared/schema";

const stageColors: Record<string, string> = {
  seed: "border-amber-500/30 text-amber-400/80",
  sprout: "border-emerald-500/30 text-emerald-400/80",
  bloom: "border-pink-500/30 text-pink-400/80",
};

const stageAccent: Record<string, string> = {
  seed: "bg-amber-500/10",
  sprout: "bg-emerald-500/10",
  bloom: "bg-pink-500/10",
};

const stageGlow: Record<string, string> = {
  seed: "rgba(245, 158, 11, 0.2)",
  sprout: "rgba(16, 185, 129, 0.2)",
  bloom: "rgba(236, 72, 153, 0.2)",
};

const genreOptions = ["poetry", "fiction", "essay", "fragment", "other"];

function SeedIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M12 22 Q12 20 12 14" />
      <path d="M12 15 Q8 9 9 5 Q10 2 12 3 Q14 2 15 5 Q16 9 12 15Z" />
      <path d="M10 3 Q9 1 10 0 Q12 -0.5 14 0 Q15 1 14 3" />
    </svg>
  );
}

function SproutIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M12 22 Q12 20 12 12" />
      <path d="M12 16 Q7 11 6 9 Q5 7 7 6 Q9 5 11 9 L12 12Z" />
      <path d="M12 12 Q17 7 18 5 Q19 3 21 4 Q23 6 19 8 L12 12Z" />
      <path d="M12 10 Q11 5 12 2 Q13 0 14 2 Q15 5 13 9Z" />
    </svg>
  );
}

function BloomIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M12 22 Q12 20 12 14" />
      <path d="M12 12 Q8 6 5 5 Q3 4.5 4 7 Q5 9 10 12Z" />
      <path d="M12 12 Q16 6 19 5 Q21 4.5 20 7 Q19 9 14 12Z" />
      <path d="M12 12 Q12 4 11 2 Q10 0 12 0 Q14 0 13 2 Q12 4 12 12Z" />
      <path d="M12 12 Q6 10 3 11 Q1 12 3 13 Q5 14 12 12Z" />
      <path d="M12 12 Q18 10 21 11 Q23 12 21 13 Q19 14 12 12Z" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <path d="M9 18 Q8 16 6 17" />
    </svg>
  );
}

const stageIcons: Record<string, React.ReactNode> = {
  seed: <SeedIcon className="w-4 h-4" />,
  sprout: <SproutIcon className="w-4 h-4" />,
  bloom: <BloomIcon className="w-4 h-4" />,
};

function wordCount(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function timeAgo(date: string | Date | null | undefined) {
  if (!date) return "";
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function AnimatedCounter({ target, duration = 1.5, delay = 0 }: { target: number; duration?: number; delay?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const timer = setTimeout(() => {
      let start = 0;
      const step = Math.max(1, Math.ceil(target / (duration * 60)));
      const interval = setInterval(() => {
        start += step;
        if (start >= target) {
          setCount(target);
          clearInterval(interval);
        } else {
          setCount(start);
        }
      }, 1000 / 60);
      return () => clearInterval(interval);
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [target, duration, delay]);
  return <>{count.toLocaleString()}</>;
}

function GardenLanding({ onNavigate }: { onNavigate: (view: GardenView) => void }) {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const steps = [
    {
      number: "01",
      title: "Plant",
      subtitle: "Open your Garden and write anything",
      description: "A line, a fragment, a whole draft — whatever wants to come out. There are no deadlines, no due dates, no pressure. Just plant your seed and let it sit. Come back when you're ready. Your Garden is yours alone.",
      icon: <SeedIcon className="w-8 h-8" />,
      color: "amber",
      glow: stageGlow.seed,
    },
    {
      number: "02",
      title: "Editors Walk Through",
      subtitle: "Our editorial team browses Gardens like a bookshop",
      description: "Slowly, carefully, the editorial team walks through the Gardens of writers who've opened their doors. No algorithms, no submissions. Just people reading — marking the pieces that make them stop, the lines that stay with them.",
      icon: <SproutIcon className="w-8 h-8" />,
      color: "emerald",
      glow: stageGlow.sprout,
    },
    {
      number: "03",
      title: "A Knock on the Door",
      subtitle: "When editors want to feature your piece",
      description: "If a piece speaks to the editors, you receive a Replant Request — a gentle invitation. You can accept it as-is, revise it first, or decline entirely. Accepted pieces bloom into the public Gallery and are paid. Your work, your terms.",
      icon: <BloomIcon className="w-8 h-8" />,
      color: "pink",
      glow: stageGlow.bloom,
    },
  ];

  const colorMap: Record<string, { border: string; text: string; bg: string; borderActive: string }> = {
    amber: { border: "border-amber-500/10", text: "text-amber-400", bg: "bg-amber-500/5", borderActive: "border-amber-500/30" },
    emerald: { border: "border-emerald-500/10", text: "text-emerald-400", bg: "bg-emerald-500/5", borderActive: "border-emerald-500/30" },
    pink: { border: "border-pink-500/10", text: "text-pink-400", bg: "bg-pink-500/5", borderActive: "border-pink-500/30" },
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="mb-16 text-center"
      >
        <motion.div
          className="inline-flex items-center gap-2 text-white/25 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Feather size={14} />
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase">How It Works</span>
        </motion.div>
        <h1 className="text-4xl md:text-6xl font-display font-light tracking-tight italic text-white/90 mb-6" data-testid="heading-garden-landing">
          Your Garden, Your Pace
        </h1>
        <p className="text-lg font-serif text-white/35 max-w-2xl mx-auto leading-relaxed">
          No submissions. No deadlines. Just a quiet space to grow your words, and editors who come to you.
        </p>
      </motion.div>

      <div className="space-y-4 mb-16">
        {steps.map((step, i) => {
          const isExpanded = expandedStep === i;
          const colors = colorMap[step.color];

          return (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}
            >
              <motion.button
                onClick={() => setExpandedStep(isExpanded ? null : i)}
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.995 }}
                className={`w-full text-left rounded-xl border transition-all duration-500 overflow-hidden group ${
                  isExpanded ? `${colors.borderActive} ${colors.bg}` : `${colors.border} bg-white/[0.01] hover:bg-white/[0.03]`
                }`}
                data-testid={`step-card-${i}`}
              >
                <div className="p-6 md:p-8">
                  <div className="flex items-start gap-5">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full border ${colors.border} flex items-center justify-center ${colors.text} opacity-50 group-hover:opacity-80 transition-opacity`}>
                      {step.icon}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <span className={`font-mono text-[10px] tracking-widest ${colors.text} opacity-60 uppercase block mb-1`}>
                            Step {step.number}
                          </span>
                          <h3 className="text-xl md:text-2xl font-display font-light italic text-white/80 group-hover:text-white/95 transition-colors">
                            {step.title}
                          </h3>
                        </div>
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                          className="text-white/20"
                        >
                          <ChevronDown size={20} />
                        </motion.div>
                      </div>
                      <p className="text-sm font-serif text-white/30 mt-1">{step.subtitle}</p>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="pt-6 pl-[68px]">
                          <p className="text-base font-serif text-white/50 leading-relaxed max-w-xl">
                            {step.description}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="text-center space-y-4"
      >
        <motion.button
          onClick={() => onNavigate("my-garden")}
          whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(245, 158, 11, 0.12)" }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-3 px-10 py-4 bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 hover:border-amber-500/30 rounded-full font-mono text-xs uppercase tracking-widest text-white/70 hover:text-white transition-all group"
          data-testid="button-enter-garden"
        >
          <Sparkles size={14} className="group-hover:text-amber-400 transition-colors" />
          Enter Your Garden
          <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </motion.button>
      </motion.div>
    </div>
  );
}

type StageFilter = "all" | "seed" | "sprout" | "bloom";

function MyGarden({ writings, onOpenWriting, onCreateNew, isCreating }: {
  writings: Writing[];
  onOpenWriting: (w: Writing) => void;
  onCreateNew: () => void;
  isCreating: boolean;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<StageFilter>("all");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const seedCount = writings.filter(w => w.stage === "seed").length;
  const sproutCount = writings.filter(w => w.stage === "sprout").length;
  const bloomCount = writings.filter(w => w.stage === "bloom").length;
  const totalWords = writings.reduce((acc, w) => acc + wordCount(w.content), 0);

  const filteredWritings = writings
    .filter(w => activeFilter === "all" || w.stage === activeFilter)
    .filter(w => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return w.title.toLowerCase().includes(q) || w.content.toLowerCase().includes(q);
    })
    .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());

  const filters: { id: StageFilter; label: string; count: number; color?: string }[] = [
    { id: "all", label: "All", count: writings.length },
    { id: "seed", label: "Seeds", count: seedCount, color: "amber" },
    { id: "sprout", label: "Sprouts", count: sproutCount, color: "emerald" },
    { id: "bloom", label: "Blooms", count: bloomCount, color: "pink" },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10"
      >
        <div className="flex items-end justify-between gap-6 flex-wrap mb-8">
          <div>
            <h1 className="text-3xl md:text-5xl font-display font-light tracking-tight italic text-white/90" data-testid="heading-my-garden">
              My Garden
            </h1>
            <p className="text-base font-serif text-white/30 mt-2">
              {writings.length} {writings.length === 1 ? "piece" : "pieces"} · {totalWords.toLocaleString()} words
            </p>
          </div>
          <motion.button
            onClick={onCreateNew}
            disabled={isCreating}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-5 py-2.5 border border-white/10 hover:border-amber-500/30 rounded-full font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] transition-all group"
            data-testid="button-new-piece"
          >
            <Plus size={14} className="group-hover:rotate-90 transition-transform duration-300" />
            New Piece
          </motion.button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Total", count: writings.length, icon: <BookOpen size={16} />, color: "white" },
            { label: "Seeds", count: seedCount, icon: <SeedIcon className="w-4 h-4" />, color: "amber" },
            { label: "Sprouts", count: sproutCount, icon: <SproutIcon className="w-4 h-4" />, color: "emerald" },
            { label: "Blooms", count: bloomCount, icon: <BloomIcon className="w-4 h-4" />, color: "pink" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              whileHover={{ scale: 1.03, y: -2 }}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center hover:border-white/15 transition-all cursor-default"
              data-testid={`counter-${stat.label.toLowerCase()}`}
            >
              <div className={`inline-flex mb-2 ${stat.color === "amber" ? "text-amber-400/50" : stat.color === "emerald" ? "text-emerald-400/50" : stat.color === "pink" ? "text-pink-400/50" : "text-white/30"}`}>
                {stat.icon}
              </div>
              <div className="text-2xl font-display font-light text-white/80">
                <AnimatedCounter target={stat.count} delay={0.2 + i * 0.1} />
              </div>
              <span className="font-mono text-[9px] tracking-widest text-white/25 uppercase">{stat.label}</span>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 mb-6"
        >
          <div className="relative flex-grow">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pieces..."
              className="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm font-serif text-white/70 placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors"
              data-testid="input-search"
            />
          </div>

          <div className="flex gap-1 p-1 bg-white/[0.02] rounded-xl border border-white/[0.06]">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-mono text-[10px] uppercase tracking-widest transition-all ${
                  activeFilter === f.id
                    ? "bg-white/[0.08] text-white/80"
                    : "text-white/30 hover:text-white/50"
                }`}
                data-testid={`filter-${f.id}`}
              >
                {f.label}
                <span className={`text-[9px] ${activeFilter === f.id ? "text-white/50" : "text-white/15"}`}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {filteredWritings.length === 0 && writings.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <p className="font-serif text-white/30 text-base">No pieces match your search or filter.</p>
        </motion.div>
      )}

      {writings.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="border border-dashed border-white/10 rounded-2xl p-16 md:p-20 text-center space-y-8"
          data-testid="empty-garden"
        >
          <div className="flex items-center justify-center gap-8">
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}>
              <SeedIcon className="w-10 h-10 text-amber-400/20" />
            </motion.div>
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 1, delay: 0.3 }}>
              <SproutIcon className="w-12 h-12 text-emerald-400/20" />
            </motion.div>
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 1, delay: 0.6 }}>
              <BloomIcon className="w-10 h-10 text-pink-400/20" />
            </motion.div>
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl md:text-3xl font-display font-light italic text-white/60">
              Your garden awaits its first seed
            </h3>
            <p className="font-serif text-white/30 max-w-md mx-auto leading-relaxed">
              A line, a fragment, a whole draft — whatever wants to come out. Plant it and watch it grow.
            </p>
          </div>
          <motion.button
            onClick={onCreateNew}
            whileHover={{ scale: 1.08, boxShadow: "0 0 40px rgba(245, 158, 11, 0.15)" }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-3 px-8 py-3.5 bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 hover:border-amber-500/30 rounded-full font-mono text-xs uppercase tracking-widest text-white/60 hover:text-white transition-all group"
            data-testid="button-plant-seed"
          >
            <Sparkles size={14} className="group-hover:text-amber-400 transition-colors" />
            Plant Your First Seed
          </motion.button>
        </motion.div>
      )}

      <div className="grid gap-3">
        {filteredWritings.map((w, i) => {
          const isExpanded = expandedCard === w.id;
          return (
            <motion.div
              key={w.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.4 }}
              data-testid={`card-piece-${w.id}`}
            >
              <motion.div
                whileHover={{ scale: isExpanded ? 1 : 1.008, x: isExpanded ? 0 : 4 }}
                className={`relative rounded-xl border overflow-hidden transition-all duration-300 ${
                  isExpanded
                    ? `${stageColors[w.stage].split(" ")[0]} bg-white/[0.03]`
                    : "border-white/[0.04] hover:border-white/10 bg-white/[0.01] hover:bg-white/[0.03]"
                }`}
              >
                {isExpanded && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      background: `linear-gradient(135deg, ${stageGlow[w.stage]} 0%, transparent 50%)`,
                    }}
                  />
                )}

                <button
                  onClick={() => setExpandedCard(isExpanded ? null : w.id)}
                  className="w-full text-left p-5 md:p-6 relative z-10"
                  data-testid={`button-expand-${w.id}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center mt-0.5 ${stageColors[w.stage]} ${stageAccent[w.stage]}`}>
                      {stageIcons[w.stage] || stageIcons.seed}
                    </div>
                    <div className="flex-grow min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="text-lg font-display font-light truncate text-white/70 italic">
                          {w.title || "Untitled"}
                        </h3>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="font-mono text-[9px] uppercase tracking-widest text-white/15">{w.genre}</span>
                          <span className="font-mono text-[9px] text-white/10">{timeAgo(w.updatedAt)}</span>
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-white/15"
                          >
                            <ChevronDown size={14} />
                          </motion.div>
                        </div>
                      </div>
                      {!isExpanded && w.content && (
                        <p className="text-sm font-serif text-white/25 line-clamp-1">
                          {w.content.slice(0, 150)}
                        </p>
                      )}
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 md:px-6 pb-5 md:pb-6 pl-[52px] md:pl-[60px] space-y-4 relative z-10">
                        {w.content && (
                          <p className="text-sm font-serif text-white/40 leading-relaxed line-clamp-4">
                            {w.content.slice(0, 400)}
                          </p>
                        )}
                        <div className="flex items-center gap-4 pt-2">
                          <span className="font-mono text-[9px] text-white/20 tracking-widest">
                            {wordCount(w.content)} words
                          </span>
                          <span className={`font-mono text-[9px] tracking-widest uppercase ${stageColors[w.stage].split(" ")[1]}`}>
                            {w.stage}
                          </span>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <motion.button
                            onClick={(e) => { e.stopPropagation(); onOpenWriting(w); }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 hover:border-white/20 rounded-lg font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white transition-all"
                            data-testid={`button-edit-${w.id}`}
                          >
                            <PenLine size={12} />
                            Open & Edit
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function WriteEditor({ writing, onBack, onSave, onDelete }: {
  writing: Writing;
  onBack: () => void;
  onSave: (data: { title: string; content: string; genre: string; stage: string }) => void;
  onDelete: () => void;
}) {
  const [editTitle, setEditTitle] = useState(writing.title);
  const [editContent, setEditContent] = useState(writing.content);
  const [editGenre, setEditGenre] = useState(writing.genre);
  const [editStage, setEditStage] = useState(writing.stage);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSave = useCallback(() => {
    setSaving(true);
    onSave({ title: editTitle, content: editContent, genre: editGenre, stage: editStage });
    setTimeout(() => {
      setSaving(false);
      setLastSaved(new Date());
    }, 500);
  }, [editTitle, editContent, editGenre, editStage, onSave]);

  function handleContentChange(value: string) {
    setEditContent(value);
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => doSave(), 2000);
  }

  function handleTitleChange(value: string) {
    setEditTitle(value);
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => doSave(), 2000);
  }

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.focus();
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-3xl mx-auto"
    >
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => { doSave(); onBack(); }}
          className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-white/40 hover:text-white transition-colors group"
          data-testid="button-back"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          My Garden
        </button>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] tracking-widest text-white/20">
            {saving ? "saving..." : lastSaved ? `saved ${timeAgo(lastSaved)}` : ""}
          </span>
          <span className="font-mono text-[10px] tracking-widest text-white/20">
            {wordCount(editContent)} words
          </span>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-white/20 hover:text-red-400/80 transition-colors"
            data-testid="button-delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="border border-red-500/20 bg-red-500/5 rounded-lg p-4 flex items-center justify-between">
              <p className="font-serif text-sm text-red-300/70">Delete this writing permanently?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                  data-testid="button-cancel-delete"
                >
                  Cancel
                </button>
                <button
                  onClick={onDelete}
                  className="px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest bg-red-500/20 text-red-300 rounded-full hover:bg-red-500/30 transition-colors"
                  data-testid="button-confirm-delete"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        <input
          type="text"
          value={editTitle}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Title..."
          className="w-full bg-transparent text-3xl md:text-4xl font-display font-light tracking-tight text-white/90 placeholder:text-white/15 focus:outline-none border-none italic"
          data-testid="input-title"
        />

        <div className="flex items-center gap-4 pb-6 border-b border-white/5">
          <div className="flex gap-1">
            {(["seed", "sprout", "bloom"] as const).map((s) => (
              <button
                key={s}
                onClick={() => { setEditStage(s); setTimeout(doSave, 100); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-widest transition-all border ${
                  editStage === s
                    ? `${stageColors[s]} ${stageAccent[s]}`
                    : "border-transparent text-white/25 hover:text-white/50"
                }`}
                data-testid={`button-stage-${s}`}
              >
                {stageIcons[s]}
                {s}
              </button>
            ))}
          </div>
          <span className="w-[1px] h-4 bg-white/5" />
          <select
            value={editGenre}
            onChange={(e) => { setEditGenre(e.target.value); setTimeout(doSave, 100); }}
            className="bg-transparent text-white/40 font-mono text-[10px] uppercase tracking-widest border border-white/5 rounded-full px-3 py-1.5 focus:outline-none focus:border-white/15 hover:border-white/15 transition-colors cursor-pointer"
            data-testid="select-genre"
          >
            {genreOptions.map((g) => (
              <option key={g} value={g} className="bg-[#0b101a]">{g}</option>
            ))}
          </select>
        </div>

        <textarea
          ref={textareaRef}
          value={editContent}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Begin writing..."
          className="w-full min-h-[65vh] bg-transparent text-lg font-serif leading-[2] text-white/75 placeholder:text-white/10 focus:outline-none resize-none border-none tracking-wide"
          data-testid="textarea-content"
        />
      </div>
    </motion.div>
  );
}

function ComingSoonPage({ title, description }: { title: string; description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto text-center py-20"
    >
      <motion.div
        className="w-16 h-16 mx-auto mb-6 rounded-full border border-white/10 flex items-center justify-center text-white/20"
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <Lock size={24} />
      </motion.div>
      <h2 className="text-3xl md:text-4xl font-display font-light italic text-white/70 mb-4">{title}</h2>
      <p className="font-serif text-white/30 leading-relaxed max-w-lg mx-auto">{description}</p>
      <div className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 border border-white/[0.06] rounded-full">
        <Sparkles size={12} className="text-white/20" />
        <span className="font-mono text-[10px] tracking-widest text-white/20 uppercase">Coming Soon</span>
      </div>
    </motion.div>
  );
}

const comingSoonPages: Record<string, { title: string; description: string }> = {
  gallery: { title: "Gallery", description: "A public collection of featured pieces that have bloomed — curated by editors, celebrated by the community." },
  queue: { title: "Reading Queue", description: "Your personal reading list. Save pieces to read later, mark them as read, and keep your literary journey organized." },
  explore: { title: "Explore", description: "Discover new voices, curated shelves, and hidden seeds. Browse by mood, form, or theme." },
  saved: { title: "Saved", description: "Your bookmarked favorites — pieces that resonated, lines that stayed with you." },
  pollination: { title: "Pollination", description: "A gentle feedback space. Highlight lines you love, leave short affirmations, and share resonance." },
  rituals: { title: "Writing Rituals", description: "Guided prompts and timed sessions to nurture your writing habit. Outputs go straight to your Garden." },
  compost: { title: "Compost", description: "An archive for fragments that aren't working yet. Nothing is wasted — everything can be recycled." },
  "growth-journal": { title: "Growth Journal", description: "A private space to reflect on your writing process, linked to specific pieces over time." },
  submissions: { title: "Submissions", description: "Track your editorial journey — pieces under review, accepted works, and your publishing history." },
  "inner-weather": { title: "Inner Weather", description: "Check in with your creative mood. Track patterns between your emotional weather and your writing." },
  reflections: { title: "Reflections", description: "Structured reflections on craft, voice, and process. See how your creative practice evolves." },
  "seasonal-review": { title: "Seasonal Review", description: "A quarterly summary of your practice — pieces started, finished, replanted. See your growth season by season." },
  "root-system": { title: "Root System", description: "Map your influences and connections. Favorite writers, sources, and themes that feed your roots." },
  circles: { title: "Circles", description: "Small group spaces for accountability and private sharing, wrapped in the gentle Garden aesthetic." },
  "moonlit-readings": { title: "Moonlit Readings", description: "Live or asynchronous readings under the stars. Gather, listen, and share your words aloud." },
  "replant-requests": { title: "Replant Requests", description: "Your inbox for editorial invitations. Accept, revise, or decline — your work, your terms." },
};

export default function Garden() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [currentView, setCurrentView] = useState<GardenView>("landing");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeWriting, setActiveWriting] = useState<Writing | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const { data: writings = [], isLoading } = useQuery<Writing[]>({
    queryKey: ["/api/writings"],
    queryFn: async () => {
      const res = await fetch("/api/writings", { credentials: "include" });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/writings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: "Untitled", content: "", genre: "poetry", stage: "seed" }),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: (data: Writing) => {
      queryClient.invalidateQueries({ queryKey: ["/api/writings"] });
      setActiveWriting(data);
      setIsEditing(true);
      setCurrentView("write");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; title: string; content: string; genre: string; stage: string }) => {
      const res = await fetch(`/api/writings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/writings"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/writings/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/writings"] });
      setActiveWriting(null);
      setIsEditing(false);
      setCurrentView("my-garden");
    },
  });

  function openWriting(w: Writing) {
    setActiveWriting(w);
    setIsEditing(true);
    setCurrentView("write");
  }

  function handleNavigate(view: GardenView) {
    setCurrentView(view);
    setIsEditing(false);
    setActiveWriting(null);
    setSidebarOpen(false);
  }

  if (!authLoading && !isAuthenticated) {
    window.location.href = "/api/login";
    return null;
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground relative">
        <StarBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto border border-white/10 rounded-full flex items-center justify-center">
              <Feather size={20} className="text-white/30 animate-pulse" />
            </div>
            <p className="font-mono text-xs tracking-widest opacity-40 uppercase">Opening your garden...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  function renderView() {
    if (isEditing && activeWriting) {
      return (
        <WriteEditor
          key={activeWriting.id}
          writing={activeWriting}
          onBack={() => { setIsEditing(false); setActiveWriting(null); setCurrentView("my-garden"); }}
          onSave={(data) => updateMutation.mutate({ id: activeWriting.id, ...data })}
          onDelete={() => deleteMutation.mutate(activeWriting.id)}
        />
      );
    }

    switch (currentView) {
      case "landing":
        return <GardenLanding onNavigate={handleNavigate} />;
      case "my-garden":
        return (
          <MyGarden
            writings={writings}
            onOpenWriting={openWriting}
            onCreateNew={() => createMutation.mutate()}
            isCreating={createMutation.isPending}
          />
        );
      case "write":
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto text-center py-20">
            <PenLine size={32} className="mx-auto mb-6 text-white/20" />
            <h2 className="text-2xl font-display font-light italic text-white/60 mb-4">Start Writing</h2>
            <p className="font-serif text-white/30 mb-8">Create a new piece or select one from your Garden.</p>
            <div className="flex justify-center gap-3">
              <motion.button
                onClick={() => createMutation.mutate()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-6 py-3 bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 hover:border-amber-500/30 rounded-full font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white transition-all"
                data-testid="button-new-piece-write"
              >
                <Plus size={14} />
                New Piece
              </motion.button>
              <motion.button
                onClick={() => setCurrentView("my-garden")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-6 py-3 border border-white/[0.06] hover:border-white/15 rounded-full font-mono text-[10px] uppercase tracking-widest text-white/40 hover:text-white/70 transition-all"
                data-testid="button-browse-garden"
              >
                <BookOpen size={14} />
                Browse Garden
              </motion.button>
            </div>
          </motion.div>
        );
      default: {
        const page = comingSoonPages[currentView];
        if (page) return <ComingSoonPage title={page.title} description={page.description} />;
        return <ComingSoonPage title="Coming Soon" description="This feature is being cultivated." />;
      }
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <StarBackground />
      <GardenSidebar
        currentView={isEditing ? "write" : currentView}
        onNavigate={handleNavigate}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className={`relative z-10 pt-20 pb-24 px-6 transition-all duration-300 ${sidebarOpen ? "lg:ml-[260px]" : ""}`}>
        <AnimatePresence mode="wait">
          <motion.div key={isEditing ? `editor-${activeWriting?.id}` : currentView}>
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
