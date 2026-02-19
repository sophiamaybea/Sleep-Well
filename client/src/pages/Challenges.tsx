import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import DOMPurify from "dompurify";
import {
  ArrowLeft, Trophy, Clock, Users, Flame, ChevronRight,
  PenLine, Heart, Send, Trash2, Calendar, BookOpen, Award, Star
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ChallengeListItem {
  id: string;
  title: string;
  description: string;
  prompt: string;
  genre: string | null;
  wordLimit: number | null;
  status: string;
  startsAt: string;
  endsAt: string;
  votingEndsAt: string | null;
  prize: string | null;
  entryCount: number;
  creatorName: string | null;
}

interface ChallengeDetail extends ChallengeListItem {}

interface ChallengeEntryItem {
  id: string;
  challengeId: string;
  authorId: string;
  title: string;
  content: string;
  submittedAt: string;
  authorName: string | null;
  authorImage: string | null;
  voteCount: number;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function timeRemaining(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return "ended";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h left`;
  return `${hours}h left`;
}

const statusColors: Record<string, string> = {
  open: "bg-emerald-900/20 border-emerald-600/20 text-emerald-400/80",
  upcoming: "bg-blue-900/20 border-blue-600/20 text-blue-400/80",
  voting: "bg-amber-900/20 border-amber-600/20 text-amber-400/80",
  closed: "bg-white/[0.04] border-white/[0.08] text-white/40",
};

const statusIcons: Record<string, React.ReactNode> = {
  open: <Flame size={10} />,
  upcoming: <Clock size={10} />,
  voting: <Star size={10} />,
  closed: <Trophy size={10} />,
};

function ChallengeList({ onSelect }: { onSelect: (id: string) => void }) {
  const { data: challenges, isLoading } = useQuery<ChallengeListItem[]>({
    queryKey: ["/api/challenges"],
  });

  const [filter, setFilter] = useState<string>("all");

  const filtered = challenges?.filter(c => filter === "all" || c.status === filter) || [];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Trophy size={18} className="text-amber-400/60" />
          <h1 className="font-display text-2xl text-white/90">Seasons</h1>
        </div>
        <p className="text-white/45 font-body text-sm max-w-lg mx-auto italic">
          Time-bound creative prompts on a regular cycle.
        </p>
      </div>

      <div className="flex items-center justify-center gap-2">
        {["all", "open", "upcoming", "voting", "closed"].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider transition-all border ${
              filter === s
                ? "bg-white/[0.08] border-white/[0.15] text-white/70"
                : "border-transparent text-white/30 hover:text-white/50"
            }`}
            data-testid={`button-filter-${s}`}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse h-32 bg-white/[0.03] rounded-xl border border-white/[0.06]" />
          ))}
        </div>
      )}

      <div className="space-y-4">
        {filtered.map((challenge, i) => (
          <motion.button
            key={challenge.id}
            onClick={() => onSelect(challenge.id)}
            className="w-full text-left rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 sm:p-6 hover:bg-white/[0.06] hover:border-white/[0.14] transition-all group relative overflow-hidden"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.35 }}
            whileHover={{ y: -2 }}
            data-testid={`card-challenge-${challenge.id}`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.02] via-transparent to-emerald-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative">
              <div className="flex items-start justify-between mb-3">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-mono uppercase tracking-wider ${statusColors[challenge.status] || statusColors.closed}`}>
                  {statusIcons[challenge.status]}
                  {challenge.status}
                </span>
                {challenge.prize && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-900/15 border border-amber-800/15 text-amber-400/60 text-[10px] font-mono">
                    <Award size={10} />
                    {challenge.prize}
                  </span>
                )}
              </div>

              <h3 className="font-display text-lg text-white/85 mb-2 group-hover:text-white/95 transition-colors leading-tight" data-testid={`text-challenge-title-${challenge.id}`}>
                {challenge.title}
              </h3>

              <p className="text-white/40 text-sm font-body leading-relaxed line-clamp-2 mb-4">
                {challenge.description}
              </p>

              <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-wider text-white/30">
                <span className="flex items-center gap-1">
                  <Users size={10} />
                  {challenge.entryCount} {challenge.entryCount === 1 ? "entry" : "entries"}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={10} />
                  {challenge.status === "open" ? timeRemaining(challenge.endsAt) :
                   challenge.status === "voting" && challenge.votingEndsAt ? timeRemaining(challenge.votingEndsAt) :
                   challenge.status === "upcoming" ? `Opens ${formatDate(challenge.startsAt)}` :
                   `Ended ${formatDate(challenge.endsAt)}`}
                </span>
                {challenge.genre && (
                  <span className="flex items-center gap-1">
                    <BookOpen size={10} />
                    {challenge.genre}
                  </span>
                )}
                {challenge.wordLimit && (
                  <span>{challenge.wordLimit} word max</span>
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-16 text-white/30">
          <Trophy size={32} className="mx-auto mb-3 opacity-30" />
          <p className="font-body text-sm">
            {filter === "all" ? "No seasons yet. Check back soon." : `No ${filter} seasons right now.`}
          </p>
        </div>
      )}
    </div>
  );
}

function ChallengeDetailView({ challengeId, onBack }: { challengeId: string; onBack: () => void }) {
  const queryClient = useQueryClient();
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [submitTitle, setSubmitTitle] = useState("");
  const [submitContent, setSubmitContent] = useState("");
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  const { data: challenge } = useQuery<ChallengeDetail>({
    queryKey: [`/api/challenges/${challengeId}`],
  });

  const { data: entries } = useQuery<ChallengeEntryItem[]>({
    queryKey: [`/api/challenges/${challengeId}/entries`],
  });

  const { data: myEntry } = useQuery<ChallengeEntryItem | null>({
    queryKey: [`/api/challenges/${challengeId}/my-entry`],
  });

  const { data: myVotes } = useQuery<string[]>({
    queryKey: [`/api/challenges/${challengeId}/my-votes`],
  });

  const submitMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/challenges/${challengeId}/entries`, { title: submitTitle, content: submitContent }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/challenges/${challengeId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/challenges/${challengeId}/entries`] });
      queryClient.invalidateQueries({ queryKey: [`/api/challenges/${challengeId}/my-entry`] });
      setShowSubmitForm(false);
      setSubmitTitle("");
      setSubmitContent("");
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: (entryId: string) => apiRequest("DELETE", `/api/challenges/${challengeId}/entries/${entryId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/challenges/${challengeId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/challenges/${challengeId}/entries`] });
      queryClient.invalidateQueries({ queryKey: [`/api/challenges/${challengeId}/my-entry`] });
    },
  });

  const voteMutation = useMutation({
    mutationFn: (entryId: string) => apiRequest("POST", `/api/challenges/${challengeId}/votes`, { entryId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/challenges/${challengeId}/entries`] });
      queryClient.invalidateQueries({ queryKey: [`/api/challenges/${challengeId}/my-votes`] });
    },
  });

  const unvoteMutation = useMutation({
    mutationFn: (entryId: string) => apiRequest("DELETE", `/api/challenges/${challengeId}/votes/${entryId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/challenges/${challengeId}/entries`] });
      queryClient.invalidateQueries({ queryKey: [`/api/challenges/${challengeId}/my-votes`] });
    },
  });

  if (!challenge) {
    return (
      <div className="space-y-6">
        <button onClick={onBack} className="flex items-center gap-1 text-white/40 hover:text-white/60 text-sm font-mono">
          <ArrowLeft size={14} /> Back to seasons
        </button>
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-2/3 bg-white/10 rounded" />
          <div className="h-4 w-full bg-white/5 rounded" />
        </div>
      </div>
    );
  }

  const isOpen = challenge.status === "open";
  const isVoting = challenge.status === "voting" || challenge.status === "open";
  const canSubmit = isOpen && !myEntry;
  const wordCount = submitContent.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-white/40 hover:text-white/60 text-sm font-mono transition-colors"
        data-testid="button-back-challenges"
      >
        <ArrowLeft size={14} /> Back to seasons
      </button>

      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 sm:p-8">
        <div className="flex items-start justify-between mb-4">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-mono uppercase tracking-wider ${statusColors[challenge.status] || statusColors.closed}`}>
            {statusIcons[challenge.status]}
            {challenge.status}
          </span>
          {challenge.prize && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-900/15 border border-amber-800/15 text-amber-400/60 text-[10px] font-mono">
              <Award size={10} />
              {challenge.prize}
            </span>
          )}
        </div>

        <h2 className="font-display text-2xl sm:text-3xl text-white/90 mb-3" data-testid="text-challenge-detail-title">
          {challenge.title}
        </h2>

        <p className="text-white/50 font-body text-sm leading-relaxed mb-4">
          {challenge.description}
        </p>

        <div className="rounded-lg border border-emerald-800/15 bg-emerald-900/10 p-4 mb-5">
          <p className="text-[10px] font-mono uppercase tracking-wider text-emerald-400/50 mb-2">The Prompt</p>
          <p className="text-white/70 font-body text-sm leading-relaxed italic">
            {challenge.prompt}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono uppercase tracking-wider text-white/30">
          <span className="flex items-center gap-1">
            <Calendar size={10} />
            {formatDate(challenge.startsAt)} — {formatDate(challenge.endsAt)}
          </span>
          <span className="flex items-center gap-1">
            <Users size={10} />
            {challenge.entryCount} entries
          </span>
          {challenge.genre && (
            <span className="flex items-center gap-1">
              <BookOpen size={10} />
              {challenge.genre}
            </span>
          )}
          {challenge.wordLimit && (
            <span>{challenge.wordLimit} word limit</span>
          )}
          {challenge.votingEndsAt && (
            <span>Voting ends {formatDate(challenge.votingEndsAt)}</span>
          )}
        </div>
      </div>

      {myEntry && (
        <div className="rounded-lg border border-emerald-800/20 bg-emerald-900/10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-emerald-400/50 mb-1">Your Entry</p>
              <p className="text-white/70 font-body text-sm">{myEntry.title}</p>
            </div>
            {isOpen && (
              <button
                onClick={() => withdrawMutation.mutate(myEntry.id)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-800/20 text-red-400/60 hover:bg-red-900/10 transition-all font-mono text-[10px] uppercase tracking-wider"
                data-testid="button-withdraw-entry"
              >
                <Trash2 size={11} /> Withdraw
              </button>
            )}
          </div>
        </div>
      )}

      {canSubmit && !showSubmitForm && (
        <motion.button
          onClick={() => setShowSubmitForm(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-emerald-600/20 bg-emerald-900/10 text-emerald-300/70 hover:bg-emerald-900/20 hover:border-emerald-600/30 transition-all font-mono text-xs uppercase tracking-wider"
          whileHover={{ scale: 1.01 }}
          data-testid="button-show-submit"
        >
          <PenLine size={14} />
          Submit Your Entry
        </motion.button>
      )}

      <AnimatePresence>
        {showSubmitForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 space-y-4">
              <h3 className="font-display text-base text-white/80">Submit Your Entry</h3>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40 mb-1.5">Title</label>
                <input
                  type="text"
                  value={submitTitle}
                  onChange={e => setSubmitTitle(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white/80 text-sm font-body placeholder-white/20 focus:outline-none focus:border-emerald-600/30"
                  placeholder="Give your piece a title..."
                  data-testid="input-entry-title"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-white/40">Content</label>
                  <span className={`text-[10px] font-mono ${challenge.wordLimit && wordCount > challenge.wordLimit ? "text-red-400/70" : "text-white/30"}`}>
                    {wordCount} words{challenge.wordLimit ? ` / ${challenge.wordLimit} max` : ""}
                  </span>
                </div>
                <textarea
                  value={submitContent}
                  onChange={e => setSubmitContent(e.target.value)}
                  rows={12}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white/80 text-sm font-body placeholder-white/20 focus:outline-none focus:border-emerald-600/30 resize-y"
                  placeholder="Write or paste your piece here..."
                  data-testid="textarea-entry-content"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => submitMutation.mutate()}
                  disabled={!submitTitle.trim() || !submitContent.trim() || submitMutation.isPending || (!!challenge.wordLimit && wordCount > challenge.wordLimit)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600/20 border border-emerald-600/25 text-emerald-300/80 hover:bg-emerald-600/30 transition-all font-mono text-xs uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed"
                  data-testid="button-submit-entry"
                >
                  <Send size={13} />
                  {submitMutation.isPending ? "Submitting..." : "Submit Entry"}
                </button>
                <button
                  onClick={() => { setShowSubmitForm(false); setSubmitTitle(""); setSubmitContent(""); }}
                  className="px-4 py-2 rounded-lg border border-white/[0.06] text-white/40 hover:text-white/60 font-mono text-xs uppercase tracking-wider transition-all"
                  data-testid="button-cancel-submit"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        <h3 className="font-mono text-[10px] uppercase tracking-wider text-white/30 px-1">
          Entries {entries ? `(${entries.length})` : ""}
        </h3>

        {entries?.map((entry, i) => {
          const isExpanded = expandedEntry === entry.id;
          const hasVoted = myVotes?.includes(entry.id);

          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
              data-testid={`card-entry-${entry.id}`}
            >
              <button
                onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}
                className="w-full text-left p-4 flex items-center gap-3 hover:bg-white/[0.02] transition-all"
                data-testid={`button-expand-entry-${entry.id}`}
              >
                {entry.authorImage ? (
                  <img src={entry.authorImage} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                    <PenLine size={12} className="text-white/30" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-body text-white/75 truncate">{entry.title}</p>
                  <p className="text-[10px] font-mono text-white/30 mt-0.5">
                    by {entry.authorName || "Anonymous"} · {formatDate(entry.submittedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="flex items-center gap-1 text-[10px] font-mono text-white/30">
                    <Heart size={11} className={hasVoted ? "fill-amber-400/60 text-amber-400/60" : ""} />
                    {entry.voteCount}
                  </span>
                  <ChevronRight size={14} className={`text-white/20 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-1 border-t border-white/[0.04]">
                      <div className="text-white/60 font-body text-sm leading-relaxed whitespace-pre-wrap mt-3">
                        {entry.content}
                      </div>
                      {isVoting && (
                        <div className="mt-4 pt-3 border-t border-white/[0.04]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              hasVoted ? unvoteMutation.mutate(entry.id) : voteMutation.mutate(entry.id);
                            }}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all font-mono text-[10px] uppercase tracking-wider ${
                              hasVoted
                                ? "border-amber-600/25 bg-amber-900/15 text-amber-300/80"
                                : "border-white/[0.08] text-white/40 hover:border-amber-600/20 hover:text-amber-300/60"
                            }`}
                            data-testid={`button-vote-${entry.id}`}
                          >
                            <Heart size={12} className={hasVoted ? "fill-current" : ""} />
                            {hasVoted ? "Voted" : "Vote"}
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {entries?.length === 0 && (
          <div className="text-center py-10 text-white/25">
            <PenLine size={24} className="mx-auto mb-2 opacity-30" />
            <p className="font-body text-sm">No entries yet. Be the first to submit!</p>
          </div>
        )}
      </div>
    </div>
  );
}

type ChallengesView = "list" | "detail";

export default function Challenges() {
  const [, setLocation] = useLocation();
  const [view, setView] = useState<ChallengesView>("list");
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);
  const [isLightMode, setIsLightMode] = useState(false);

  const handleSelect = (id: string) => {
    setSelectedChallengeId(id);
    setView("detail");
  };

  const handleBack = () => {
    setView("list");
    setSelectedChallengeId(null);
  };

  return (
    <div className={`min-h-screen garden-bg ${isLightMode ? "garden-light" : ""}`}>
      <div className="night-garden-atmosphere" />
      <div className="moonlight-glow" />

      <header className="sticky top-0 z-50 garden-header-bg backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLocation("/garden")}
              className="text-white/40 hover:text-white/60 transition-colors"
              data-testid="button-back-garden"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-2">
              <Trophy size={16} className="text-amber-400/60" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">Seasons</span>
            </div>
          </div>

          <button
            onClick={() => setIsLightMode(!isLightMode)}
            className="px-2 py-1 rounded-full border border-white/[0.06] text-white/30 hover:text-white/50 font-mono text-[9px] uppercase tracking-wider transition-all"
            data-testid="button-toggle-theme"
          >
            {isLightMode ? "Dark" : "Light"}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait">
          {view === "list" && (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <ChallengeList onSelect={handleSelect} />
            </motion.div>
          )}
          {view === "detail" && selectedChallengeId && (
            <motion.div
              key={`detail-${selectedChallengeId}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <ChallengeDetailView challengeId={selectedChallengeId} onBack={handleBack} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
