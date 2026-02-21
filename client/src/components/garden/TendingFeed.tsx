import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Sprout, Feather } from "lucide-react";
import { VisibilityBadge } from "./PlantingFlow";
import { ResonanceBar } from "./SocialFeatures";
import { ContentRenderer } from "./RichEditor";

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

type TendingFeedPiece = {
  id: string;
  authorId: string;
  authorName: string | null;
  authorImage: string | null;
  title: string | null;
  content: string;
  genre: string;
  readiness: string;
  visibility: string;
  editorialAvailable: boolean;
  updatedAt: string;
  createdAt: string;
};

type TendedGarden = {
  gardenerId: string;
  gardenerName: string | null;
  gardenerImage: string | null;
  createdAt: string;
};

const readinessColors: Record<string, string> = {
  raw_seed: "text-amber-400/70",
  growing: "text-emerald-400/70",
  ready_to_show: "text-pink-400/70",
};

export default function TendingFeed({ onViewProfile }: { onViewProfile?: (userId: string) => void }) {
  const { data: feed = [], isLoading: feedLoading } = useQuery<TendingFeedPiece[]>({
    queryKey: ["/api/tending-feed"],
    queryFn: async () => {
      const res = await fetch("/api/tending-feed", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch tending feed");
      return res.json();
    },
  });

  const { data: tended = [], isLoading: tendedLoading } = useQuery<TendedGarden[]>({
    queryKey: ["/api/tending"],
    queryFn: async () => {
      const res = await fetch("/api/tending", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch tended gardens");
      return res.json();
    },
  });

  const isLoading = feedLoading || tendedLoading;

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10"
      >
        <div className="flex items-center gap-2 text-white/25 mb-2">
          <Sprout size={14} />
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase">Following</span>
        </div>
        <h1
          className="text-3xl md:text-5xl font-display font-light tracking-normal italic text-white/90"
          data-testid="heading-tending-feed"
        >
          Gardens I Tend
        </h1>
        <p className="text-base font-serif text-white/30 mt-2">
          New work from writers you tend
        </p>
      </motion.div>

      {!tendedLoading && tended.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide" data-testid="tended-gardens-row">
            {tended.map((g) => (
              <motion.button
                key={g.gardenerId}
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onViewProfile?.(g.gardenerId)}
                className="flex flex-col items-center gap-1.5 flex-shrink-0"
                data-testid={`tended-avatar-${g.gardenerId}`}
              >
                <div className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/40 font-mono text-xs uppercase hover:border-white/20 transition-colors">
                  {g.gardenerName?.[0] || "?"}
                </div>
                <span className="font-mono text-[9px] text-white/25 tracking-wide max-w-[60px] truncate">
                  {g.gardenerName || "Anonymous"}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {isLoading && (
        <div className="text-center py-20">
          <Feather size={24} className="mx-auto text-white/20 animate-pulse mb-4" />
          <p className="font-mono text-xs text-white/25 tracking-widest uppercase">Loading the garden...</p>
        </div>
      )}

      {!isLoading && tended.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-dashed border-white/10 rounded-2xl p-16 text-center space-y-6"
        >
          <Sprout size={40} className="mx-auto text-white/10" />
          <div className="space-y-2">
            <h3 className="text-2xl font-display font-light italic text-white/50">
              No gardens tended yet
            </h3>
            <p className="font-serif text-white/25 max-w-md mx-auto leading-relaxed">
              You're not tending any gardens yet. Discover writers in the Garden Gallery and tend their gardens to see their work here.
            </p>
          </div>
        </motion.div>
      )}

      {!isLoading && tended.length > 0 && feed.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-dashed border-white/10 rounded-2xl p-16 text-center space-y-6"
        >
          <Feather size={40} className="mx-auto text-white/10" />
          <div className="space-y-2">
            <h3 className="text-2xl font-display font-light italic text-white/50">
              Waiting for new growth
            </h3>
            <p className="font-serif text-white/25 max-w-md mx-auto leading-relaxed">
              The writers you tend haven't shared anything new yet. Check back soon.
            </p>
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        <AnimatePresence>
          {feed.map((piece, i) => {
            const readiness = piece.readiness || "raw_seed";
            return (
              <motion.div
                key={piece.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                data-testid={`tending-piece-${piece.id}`}
              >
                <div className="relative rounded-xl border border-white/[0.04] hover:border-white/10 bg-white/[0.01] hover:bg-white/[0.025] overflow-hidden transition-all duration-300 p-5 md:p-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onViewProfile?.(piece.authorId)}
                        className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors group"
                        data-testid={`link-tending-author-${piece.id}`}
                      >
                        <div className="w-6 h-6 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/40 font-mono text-[9px] uppercase group-hover:border-white/20 transition-colors">
                          {piece.authorName?.[0] || "?"}
                        </div>
                        <span className="font-serif text-sm">{piece.authorName || "Anonymous"}</span>
                      </button>
                      <span className="font-mono text-[9px] text-white/15">{timeAgo(piece.updatedAt)}</span>
                    </div>

                    <h3 className="text-lg font-display font-light text-white/75 italic">
                      {piece.title || "Untitled"}
                    </h3>

                    {piece.content && (
                      <ContentRenderer content={piece.content} maxLength={200} className="text-sm font-serif text-white/30 line-clamp-2 leading-relaxed" />
                    )}

                    <div className="flex items-center gap-3 pt-1">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-white/15">{piece.genre}</span>
                      <VisibilityBadge visibility={piece.visibility || "garden"} readiness={readiness} editorialAvailable={piece.editorialAvailable} compact />
                      <span className={`font-mono text-[9px] uppercase tracking-widest ${readinessColors[readiness] || "text-white/25"}`}>
                        {readiness === "raw_seed" ? "seed" : readiness === "ready_to_show" ? "ready" : readiness}
                      </span>
                    </div>

                    <div className="pt-1">
                      <ResonanceBar writingId={piece.id} compact />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
