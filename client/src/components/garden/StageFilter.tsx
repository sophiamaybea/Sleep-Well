import { motion, AnimatePresence } from "framer-motion";
import { Sprout, Flower2, Moon, Search, X } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type StageFilterValue = "all" | "raw_seed" | "growing" | "ready_to_show" | "dormant";

export interface StageCounts {
  all: number;
  raw_seed: number;
  growing: number;
  ready_to_show: number;
  dormant: number;
}

export interface StageFilterProps {
  /** Currently active stage filter */
  activeStage: StageFilterValue;
  /** Called when user selects a different stage */
  onStageChange: (stage: StageFilterValue) => void;
  /** Piece counts per stage — drives the count badges */
  stageCounts: StageCounts;
  /** Controlled search query value */
  searchQuery?: string;
  /** Called when search input changes */
  onSearchChange?: (q: string) => void;
  /** Whether to render the search bar (default: true) */
  showSearch?: boolean;
}

// ─── Inline SVG stage icons (identical to Garden.tsx originals) ──────────────

function SeedIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round">
      <path d="M12 22 Q12 20 12 14" />
      <path d="M12 15 Q8 9 9 5 Q10 2 12 3 Q14 2 15 5 Q16 9 12 15Z" />
    </svg>
  );
}

function BloomIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round">
      <path d="M12 22 Q12 20 12 14" />
      <path d="M12 12 Q8 6 5 5 Q3 4.5 4 7 Q5 9 10 12Z" />
      <path d="M12 12 Q16 6 19 5 Q21 4.5 20 7 Q19 9 14 12Z" />
      <path d="M12 12 Q12 4 11 2 Q10 0 12 0 Q14 0 13 2 Q12 4 12 12Z" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

// ─── Stage metadata ───────────────────────────────────────────────────────────

interface StageOption {
  id: StageFilterValue;
  label: string;
  tip: string;
  icon: React.ReactNode;
  /** Tailwind classes applied to the pill when active */
  activeColor: string;
  emptyHeading: string;
  emptyCopy: string;
}

const STAGE_OPTIONS: StageOption[] = [
  {
    id: "all",
    label: "All",
    tip: "Every piece in your garden",
    icon: null,
    activeColor: "border-white/20 bg-white/[0.07] text-white/90",
    emptyHeading: "Your garden awaits its first seed",
    emptyCopy: "A line, a fragment, a whole draft — whatever wants to come out.",
  },
  {
    id: "raw_seed",
    label: "Seeds",
    tip: "Early ideas and fragments — just planted",
    icon: <SeedIcon className="w-[14px] h-[14px]" />,
    activeColor: "border-amber-500/30 bg-amber-500/10 text-amber-300/90",
    emptyHeading: "No seeds yet",
    emptyCopy: "Seeds are where everything begins — a word, a line, a feeling you can't quite name yet. Plant one.",
  },
  {
    id: "growing",
    label: "Growing",
    tip: "Works in progress — actively developing",
    icon: <Sprout className="w-[14px] h-[14px]" />,
    activeColor: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300/90",
    emptyHeading: "Nothing growing just yet",
    emptyCopy: "When a seed starts to find its shape, move it here. Growth is slow. That’s the point.",
  },
  {
    id: "ready_to_show",
    label: "Ready",
    tip: "Polished and ready to share — editors browse here",
    icon: <BloomIcon className="w-[14px] h-[14px]" />,
    activeColor: "border-pink-500/30 bg-pink-500/10 text-pink-300/90",
    emptyHeading: "Nothing in bloom yet",
    emptyCopy: "When a piece feels finished — or finished enough — bring it here. Editors browse this stage.",
  },
  {
    id: "dormant",
    label: "Dormant",
    tip: "Not abandoned — just resting",
    icon: <Moon className="w-[14px] h-[14px]" />,
    activeColor: "border-violet-500/30 bg-violet-500/10 text-violet-300/90",
    emptyHeading: "No dormant pieces",
    emptyCopy: "Some writing needs to rest. Dormant pieces sleep here — not abandoned, just waiting.",
  },
];

// ─── Stage empty state (exported — drop-in wherever the list is empty) ────────

export function StageEmptyState({ stage }: { stage: StageFilterValue }) {
  const meta = STAGE_OPTIONS.find((s) => s.id === stage) ?? STAGE_OPTIONS[0];
  return (
    <motion.div
      key={stage}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="py-14 text-center space-y-3"
      data-testid={`empty-state-${stage}`}
    >
      {meta.icon && (
        <div className="flex justify-center mb-2 opacity-25">
          <span className="w-8 h-8">{meta.icon}</span>
        </div>
      )}
      <p className="font-display text-lg font-light italic text-white/50">
        {meta.emptyHeading}
      </p>
      <p className="font-serif text-sm text-white/30 max-w-xs mx-auto leading-relaxed">
        {meta.emptyCopy}
      </p>
    </motion.div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * StageFilter — drop-in filter bar for the Garden Desk zone.
 *
 * Wiring in Garden.tsx DeskZone:
 *
 *   import StageFilter, { StageEmptyState } from "@/components/garden/StageFilter";
 *
 *   // 1. Before the piece list (replace the hidden filter div):
 *   <StageFilter
 *     activeStage={activeFilter}
 *     onStageChange={setActiveFilter}
 *     stageCounts={{
 *       all: searchAndTagFiltered.length,
 *       raw_seed: seedCount,
 *       growing: growingCount,
 *       ready_to_show: readyCount,
 *       dormant: dormantCount,
 *     }}
 *     searchQuery={searchQuery}
 *     onSearchChange={setSearchQuery}
 *   />
 *
 *   // 2. Replace the "No pieces match" fallback:
 *   {filteredWritings.length === 0 && writings.length > 0 && (
 *     <StageEmptyState stage={activeFilter} />
 *   )}
 */
export default function StageFilter({
  activeStage,
  onStageChange,
  stageCounts,
  searchQuery = "",
  onSearchChange,
  showSearch = true,
}: StageFilterProps) {
  return (
    <div className="space-y-3 mb-6" data-testid="stage-filter-bar">

      {/* ── Stage pill buttons ── */}
      <div
        className="flex flex-wrap gap-1.5 p-1.5 rounded-2xl border border-emerald-800/15 bg-emerald-950/10"
        role="tablist"
        aria-label="Filter by stage"
      >
        {STAGE_OPTIONS.map((opt) => {
          const count = stageCounts[opt.id];
          const isActive = activeStage === opt.id;
          return (
            <button
              key={opt.id}
              role="tab"
              aria-selected={isActive}
              title={opt.tip}
              onClick={() => onStageChange(opt.id)}
              data-testid={`stage-filter-${opt.id}`}
              className={`
                relative flex items-center gap-1.5 px-3 py-2 rounded-xl
                font-mono text-[9px] uppercase tracking-[0.18em]
                border transition-all duration-200
                ${isActive
                  ? opt.activeColor
                  : "border-transparent text-white/40 hover:text-white/65 hover:bg-white/[0.03]"}
              `}
            >
              {/* Shared layout animation for the active fill */}
              {isActive && (
                <motion.span
                  layoutId="stageFilterActive"
                  className="absolute inset-0 rounded-xl"
                  transition={{ type: "spring", stiffness: 480, damping: 36 }}
                />
              )}

              <span className="relative z-10 flex items-center gap-1.5">
                {opt.icon && (
                  <span className={isActive ? "" : "opacity-40"}>
                    {opt.icon}
                  </span>
                )}
                {opt.label}
                {/* Count badge */}
                <span
                  className={`
                    font-mono text-[8px] tabular-nums px-1 py-0.5 rounded-full transition-colors
                    ${isActive ? "bg-white/10 text-white/70" : count === 0 ? "text-white/20" : "text-white/35"}
                  `}
                  data-testid={`stage-count-${opt.id}`}
                >
                  {count}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Contextual description (mirrors ZoneNav behaviour) ── */}
      <AnimatePresence mode="wait">
        <motion.p
          key={activeStage}
          initial={{ opacity: 0, y: -3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 3 }}
          transition={{ duration: 0.15 }}
          className="font-serif text-[11px] italic text-white/25 text-center"
          data-testid="stage-filter-tip"
        >
          {STAGE_OPTIONS.find((s) => s.id === activeStage)?.tip}
        </motion.p>
      </AnimatePresence>

      {/* ── Optional search bar ── */}
      <AnimatePresence>
        {showSearch && onSearchChange && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="relative overflow-hidden"
          >
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search pieces by title, content, or tag…"
              className="
                w-full pl-10 pr-9 py-2.5
                bg-emerald-950/15 border border-emerald-800/15 rounded-2xl
                font-serif text-sm text-white/70 placeholder:text-white/25
                focus:outline-none focus:border-emerald-700/30 transition-colors
              "
              data-testid="stage-filter-search"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                data-testid="stage-filter-search-clear"
              >
                <X size={13} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export type { StageOption };
