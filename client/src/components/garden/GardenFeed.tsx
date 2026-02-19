import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Filter, ChevronDown, User, Eye, Sparkles, BookOpen, Feather } from "lucide-react";
import type { Writing } from "@shared/schema";
import { VisibilityBadge } from "./PlantingFlow";
import { ResonanceBar, MarginaliaSection, TendButton } from "./SocialFeatures";

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

function wordCount(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

type FeedWriting = Writing & { authorName: string | null };

const genreOptions = ["all", "poetry", "fiction", "essay", "fragment", "other"];
const readinessOptions = [
  { id: "all", label: "All Stages" },
  { id: "raw_seed", label: "Raw Seeds" },
  { id: "growing", label: "Growing" },
  { id: "ready_to_show", label: "Ready to Show" },
];

const readinessColors: Record<string, string> = {
  raw_seed: "text-amber-400/70",
  growing: "text-emerald-400/70",
  ready_to_show: "text-pink-400/70",
  dormant: "text-violet-400/70",
};

export default function GardenFeed({ onViewProfile }: { onViewProfile?: (userId: string) => void }) {
  const [readinessFilter, setReadinessFilter] = useState("all");
  const [genreFilter, setGenreFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const queryParams = new URLSearchParams();
  if (readinessFilter !== "all") queryParams.set("readiness", readinessFilter);
  if (genreFilter !== "all") queryParams.set("genre", genreFilter);

  const { data: feed = [], isLoading } = useQuery<FeedWriting[]>({
    queryKey: ["/api/garden-feed", readinessFilter, genreFilter],
    queryFn: async () => {
      const res = await fetch(`/api/garden-feed?${queryParams.toString()}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch feed");
      return res.json();
    },
  });

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10"
      >
        <div className="flex items-end justify-between gap-6 flex-wrap mb-6">
          <div>
            <div className="flex items-center gap-2 text-white/25 mb-2">
              <Globe size={14} />
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase">Members Only</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-light tracking-tight italic text-white/90" data-testid="heading-garden-feed">
              The Garden Gallery
            </h1>
            <p className="text-base font-serif text-white/30 mt-2">
              Pieces shared by Garden members — browse, discover, resonate.
            </p>
          </div>
          <motion.button
            onClick={() => setShowFilters(!showFilters)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-full font-mono text-[10px] uppercase tracking-widest transition-all ${
              showFilters ? "border-white/20 text-white/70 bg-white/[0.06]" : "border-white/10 text-white/40 bg-white/[0.02]"
            }`}
            data-testid="button-toggle-filters"
          >
            <Filter size={12} />
            Filters
            <ChevronDown size={12} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </motion.button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mb-6"
            >
              <div className="flex flex-wrap gap-4 p-5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <div>
                  <p className="font-mono text-[9px] tracking-widest text-white/25 uppercase mb-2">Readiness</p>
                  <div className="flex gap-1 flex-wrap">
                    {readinessOptions.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => setReadinessFilter(r.id)}
                        className={`px-3 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-widest transition-all border ${
                          readinessFilter === r.id
                            ? "bg-white/[0.08] text-white/80 border-white/15"
                            : "text-white/30 hover:text-white/50 border-transparent"
                        }`}
                        data-testid={`feed-filter-readiness-${r.id}`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-mono text-[9px] tracking-widest text-white/25 uppercase mb-2">Genre</p>
                  <div className="flex gap-1 flex-wrap">
                    {genreOptions.map((g) => (
                      <button
                        key={g}
                        onClick={() => setGenreFilter(g)}
                        className={`px-3 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-widest transition-all border ${
                          genreFilter === g
                            ? "bg-white/[0.08] text-white/80 border-white/15"
                            : "text-white/30 hover:text-white/50 border-transparent"
                        }`}
                        data-testid={`feed-filter-genre-${g}`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {isLoading && (
        <div className="text-center py-20">
          <Feather size={24} className="mx-auto text-white/20 animate-pulse mb-4" />
          <p className="font-mono text-xs text-white/25 tracking-widest uppercase">Loading the garden...</p>
        </div>
      )}

      {!isLoading && feed.filter(p => p.readiness !== "dormant").length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-dashed border-white/10 rounded-2xl p-16 text-center space-y-6"
        >
          <Globe size={40} className="mx-auto text-white/10" />
          <div className="space-y-2">
            <h3 className="text-2xl font-display font-light italic text-white/50">
              The Gallery is quiet
            </h3>
            <p className="font-serif text-white/25 max-w-md mx-auto leading-relaxed">
              No pieces have been shared to the Garden Gallery yet. When members share their work here, you'll find it in this space.
            </p>
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        {feed.filter(p => p.readiness !== "dormant").map((piece, i) => {
          const isExpanded = expandedId === piece.id;
          const readiness = piece.readiness || "raw_seed";
          return (
            <motion.div
              key={piece.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              data-testid={`feed-piece-${piece.id}`}
            >
              <motion.div
                whileHover={{ y: -2 }}
                className={`relative rounded-2xl border overflow-hidden transition-all duration-500 ${
                  isExpanded
                    ? "border-white/20 bg-white/[0.04] shadow-2xl shadow-black/40"
                    : "border-white/[0.06] hover:border-white/15 bg-white/[0.015] hover:bg-white/[0.03] shadow-sm"
                }`}
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : piece.id)}
                  className="w-full text-left p-5 md:p-6"
                  data-testid={`button-expand-feed-${piece.id}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-grow min-w-0 space-y-2">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); onViewProfile?.(piece.authorId); }}
                          className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors group"
                          data-testid={`link-author-${piece.id}`}
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-white/10 flex items-center justify-center text-white/70 font-mono text-xs uppercase group-hover:border-white/30 transition-all shadow-lg shadow-black/20">
                            {piece.authorName?.[0] || "?"}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-serif text-sm font-medium text-white/80 group-hover:text-white transition-colors">{piece.authorName || "Anonymous"}</span>
                            <span className="font-mono text-[9px] text-white/20 uppercase tracking-tighter">{timeAgo(piece.updatedAt)}</span>
                          </div>
                        </button>
                        <span className="font-mono text-[9px] text-white/15">{timeAgo(piece.updatedAt)}</span>
                      </div>

                      <h3 className="text-xl font-display font-medium text-white/90 leading-tight">
                        {piece.title || "Untitled"}
                      </h3>

                      <div className="prose-content">
                        <p className={`text-base font-serif text-white/60 leading-relaxed ${!isExpanded ? "line-clamp-3" : ""}`}>
                          {isExpanded ? piece.content : piece.content.slice(0, 240)}
                          {!isExpanded && piece.content.length > 240 && "..."}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <span className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.05] font-mono text-[8px] uppercase tracking-widest text-white/30">{piece.genre}</span>
                        <VisibilityBadge visibility="garden" readiness={readiness} editorialAvailable={piece.editorialAvailable} compact />
                      </div>
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="px-6 pb-6 space-y-6"
                    >
                      <div className="flex items-center justify-between pt-4 border-t border-white/[0.05]">
                        <div className="flex items-center gap-6">
                          <span className="font-mono text-[10px] text-white/20 tracking-widest uppercase">
                            {wordCount(piece.content)} words
                          </span>
                          <TendButton gardenerId={piece.authorId} size="sm" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <ResonanceBar writingId={piece.id} />
                        <MarginaliaSection writingId={piece.id} authorId={piece.authorId} />
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
