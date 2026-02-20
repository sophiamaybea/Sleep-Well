import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { User, ChevronDown, ChevronLeft, Feather } from "lucide-react";
import type { Writing } from "@shared/schema";
import { VisibilityBadge } from "./PlantingFlow";
import { ResonanceBar, MarginaliaSection, TendButton } from "./SocialFeatures";
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

function wordCount(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

type ProfileWriting = Writing & { authorName: string | null };

export default function ProfileGarden({ userId, onBack }: { userId: string; onBack: () => void }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: writings = [], isLoading } = useQuery<ProfileWriting[]>({
    queryKey: ["/api/garden-profile", userId],
    queryFn: async () => {
      const res = await fetch(`/api/garden-profile/${userId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
  });

  const { data: tendingData } = useQuery<{ count: number }>({
    queryKey: ["/api/tending-count", userId],
    queryFn: async () => {
      const res = await fetch(`/api/tending-count/${userId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch count");
      return res.json();
    },
  });

  const authorName = writings[0]?.authorName || "A Writer";
  const totalWords = writings.reduce((acc, w) => acc + wordCount(w.content), 0);
  const tenderCount = tendingData?.count || 0;

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10"
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors mb-6 group"
          data-testid="button-back-from-profile"
        >
          <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Gallery
        </button>

        <div className="flex items-center gap-5 mb-8">
          <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/30">
            <User size={28} />
          </div>
          <div className="flex-grow">
            <h1 className="text-3xl md:text-4xl font-display font-light tracking-tight italic text-white/85" data-testid="heading-profile-name">
              {authorName}'s Garden
            </h1>
            <p className="font-serif text-white/30 mt-1">
              {writings.length} shared {writings.length === 1 ? "piece" : "pieces"} · {totalWords.toLocaleString()} words
              {tenderCount > 0 && <span> · {tenderCount} {tenderCount === 1 ? "tender" : "tenders"}</span>}
            </p>
          </div>
          <TendButton gardenerId={userId} gardenerName={authorName} />
        </div>
      </motion.div>

      {isLoading && (
        <div className="text-center py-20">
          <Feather size={24} className="mx-auto text-white/20 animate-pulse mb-4" />
          <p className="font-mono text-xs text-white/25 tracking-widest uppercase">Loading garden...</p>
        </div>
      )}

      {!isLoading && writings.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border border-dashed border-white/10 rounded-2xl p-16 text-center space-y-4"
        >
          <User size={40} className="mx-auto text-white/10" />
          <h3 className="text-xl font-display font-light italic text-white/50">This garden is private</h3>
          <p className="font-serif text-white/25 max-w-md mx-auto">
            This writer hasn't shared any pieces to the Garden Gallery or their circles yet.
          </p>
        </motion.div>
      )}

      <div className="space-y-3">
        {writings.map((piece, i) => {
          const isExpanded = expandedId === piece.id;
          const readiness = piece.readiness || "raw_seed";
          return (
            <motion.div
              key={piece.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              data-testid={`profile-piece-${piece.id}`}
            >
              <motion.div
                whileHover={{ scale: isExpanded ? 1 : 1.005 }}
                className={`rounded-xl border overflow-hidden transition-all duration-300 ${
                  isExpanded
                    ? "border-white/15 bg-white/[0.03]"
                    : "border-white/[0.04] hover:border-white/10 bg-white/[0.01]"
                }`}
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : piece.id)}
                  className="w-full text-left p-5"
                  data-testid={`button-expand-profile-${piece.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 space-y-1">
                      <h3 className="text-lg font-display font-light text-white/75 italic">
                        {piece.title || "Untitled"}
                      </h3>
                      {!isExpanded && piece.content && (
                        <ContentRenderer content={piece.content} maxLength={150} className="text-sm font-serif text-white/25 line-clamp-1" />
                      )}
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[9px] uppercase tracking-widest text-white/15">{piece.genre}</span>
                        <VisibilityBadge visibility={piece.visibility || "garden"} readiness={readiness} compact />
                        <span className="font-mono text-[9px] text-white/10">{timeAgo(piece.updatedAt)}</span>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      className="text-white/15 flex-shrink-0 mt-1"
                    >
                      <ChevronDown size={14} />
                    </motion.div>
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
                      <div className="px-5 pb-5 space-y-3 border-t border-white/[0.04] pt-4">
                        <ContentRenderer content={piece.content} maxLength={1500} className="text-base font-serif text-white/45 leading-[1.9]" />
                        <div className="flex items-center gap-4">
                          <span className="font-mono text-[9px] text-white/20 tracking-widest">
                            {wordCount(piece.content)} words
                          </span>
                          <VisibilityBadge visibility={piece.visibility || "garden"} readiness={readiness} editorialAvailable={piece.editorialAvailable} />
                        </div>
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
