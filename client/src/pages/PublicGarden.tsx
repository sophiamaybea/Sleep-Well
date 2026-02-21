import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Feather, ChevronDown, Home, Sparkles, Copy, Check, Pin } from "lucide-react";
import StarBackground from "@/components/StarBackground";
import { TendButton } from "@/components/garden/SocialFeatures";
import { ContentRenderer, stripHtml } from "@/components/garden/RichEditor";

type PublicWriting = {
  id: string;
  title: string;
  content: string;
  genre: string;
  readiness: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  resonanceCount: number;
};

type PublicGardenData = {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    bio: string | null;
    profileImageUrl: string | null;
    createdAt: string;
  };
  writings: PublicWriting[];
  tenderCount: number;
  tendingCount: number;
  lastPublicAt: string | null;
};

function timeAgo(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days !== 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? "s" : ""} ago`;
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function wordCount(text: string) {
  const plain = text.includes("<") ? stripHtml(text) : text;
  return plain.trim() ? plain.trim().split(/\s+/).length : 0;
}

export default function PublicGarden() {
  const { userId } = useParams<{ userId: string }>();
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data, isLoading, isError } = useQuery<PublicGardenData>({
    queryKey: ["/api/public-garden", userId],
    queryFn: async () => {
      const res = await fetch(`/api/public-garden/${userId}`);
      if (res.status === 404) throw new Error("not_found");
      if (!res.ok) throw new Error("Failed to fetch public garden");
      return res.json();
    },
    enabled: !!userId,
    retry: false,
  });

  const { data: authData } = useQuery<{ id: string } | null>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const res = await fetch("/api/auth/user", { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    retry: false,
  });

  const isAuthenticated = !!authData;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b101a] relative flex items-center justify-center">
        <StarBackground />
        <motion.div
          animate={{ rotate: [0, 10, -10, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          data-testid="loading-indicator"
        >
          <Feather size={32} className="text-white/50" />
        </motion.div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-[#0b101a] relative flex items-center justify-center">
        <StarBackground />
        <div className="text-center space-y-6 relative z-10">
          <Feather size={28} className="text-white/30 mx-auto" />
          <h1 className="text-2xl font-display font-light italic text-white/60">
            Garden not found
          </h1>
          <p className="font-serif text-sm text-white/55">
            This garden doesn't exist — the writer may have moved on, or the link might be incorrect.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/50 hover:text-white/75 transition-colors"
          >
            <Home size={13} />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const { user, writings, tenderCount, tendingCount, lastPublicAt } = data;
  const featuredWritings = writings.filter(w => w.isPinned);
  const regularWritings = writings.filter(w => !w.isPinned);
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Anonymous";
  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#0b101a] relative" data-testid="public-garden-page">
      <StarBackground />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-16 md:py-24">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white/75 transition-colors mb-12 group"
        >
          <Home size={13} className="group-hover:-translate-x-0.5 transition-transform" />
          Home
        </Link>

        <header className="mb-12">
          <div className="flex items-start gap-5 mb-6">
            {user.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt={fullName}
                className="w-16 h-16 rounded-full border border-white/20 object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-full border border-white/[0.20] bg-white/[0.03] flex items-center justify-center flex-shrink-0">
                <span className="font-display text-2xl text-white/55 italic">
                  {fullName[0]}
                </span>
              </div>
            )}
            <div className="flex-grow min-w-0">
              <h1
                className="text-3xl md:text-4xl font-display font-light italic text-white/90 tracking-normal leading-normal"
                data-testid="text-writer-name"
              >
                {fullName}
              </h1>
              {user.bio ? (
                <p
                  className="font-serif text-sm text-white/55 leading-relaxed mt-3 max-w-xl"
                  data-testid="text-bio"
                >
                  {user.bio}
                </p>
              ) : (
                <p className="font-serif text-sm text-white/50 italic mt-3" data-testid="text-bio">
                  A quiet presence in the garden.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mb-3">
            <p
              className="font-mono text-[10px] tracking-widest text-white/60 uppercase"
              data-testid="text-stats"
            >
              {writings.length} piece{writings.length !== 1 ? "s" : ""} ·{" "}
              {tenderCount} tender{tenderCount !== 1 ? "s" : ""} ·{" "}
              Since {memberSince}
            </p>
          </div>

          {lastPublicAt && (
            <p
              className="font-mono text-[10px] tracking-widest text-white/50 mb-5"
              data-testid="text-last-active"
            >
              Last shared {timeAgo(lastPublicAt)}
            </p>
          )}

          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <TendButton gardenerId={user.id} gardenerName={fullName} />
            )}

            <motion.button
              onClick={handleCopyLink}
              whileTap={{ scale: 1.1 }}
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-transparent text-white/60 hover:text-white/75 hover:border-white/20 px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-all"
              data-testid="button-copy-link"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Share Garden"}
            </motion.button>
          </div>
        </header>

        {featuredWritings.length > 0 && (
          <section className="mb-12" data-testid="featured-works-section">
            <div className="flex items-center gap-3 mb-6">
              <Pin size={13} className="text-amber-400/60" />
              <h2 className="font-mono text-[10px] tracking-[0.3em] uppercase text-amber-300/70">
                Featured Works
              </h2>
              <div className="flex-grow h-px bg-amber-500/[0.08]" />
              <span className="font-mono text-[9px] text-amber-300/40">
                {featuredWritings.length} piece{featuredWritings.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="space-y-3">
              {featuredWritings.map((w, i) => {
                const isExpanded = expandedCard === w.id;
                const words = wordCount(w.content);
                return (
                  <motion.div
                    key={w.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.4 }}
                    data-testid={`card-featured-${w.id}`}
                  >
                    <div
                      className={`rounded-xl border overflow-hidden transition-all duration-300 ${
                        isExpanded
                          ? "border-amber-500/25 bg-amber-500/[0.04]"
                          : "border-amber-500/15 hover:border-amber-500/25 bg-gradient-to-br from-amber-950/10 via-transparent to-transparent"
                      }`}
                    >
                      <button
                        onClick={() => setExpandedCard(isExpanded ? null : w.id)}
                        className="w-full text-left p-4 md:p-5"
                        data-testid={`button-expand-featured-${w.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <Pin size={12} className="text-amber-400/50 flex-shrink-0" />
                          <div className="flex-grow min-w-0">
                            <h3 className="text-base font-display font-light italic text-white/85 truncate">
                              {w.title || "Untitled"}
                            </h3>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0 text-white/50">
                            <span className="font-mono text-[9px] uppercase tracking-widest hidden sm:inline">
                              {w.genre}
                            </span>
                            <span className="font-mono text-[9px]">{words}w</span>
                            {w.resonanceCount > 0 && (
                              <span className="flex items-center gap-1 font-mono text-[9px] text-amber-400/40">
                                <Sparkles size={9} />
                                {w.resonanceCount}
                              </span>
                            )}
                            <ChevronDown
                              size={13}
                              className={`transition-transform duration-200 ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          </div>
                        </div>
                        {!isExpanded && w.content && (
                          <ContentRenderer content={w.content} maxLength={120} className="text-sm font-serif text-white/55 line-clamp-1 mt-1 ml-6" />
                        )}
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 md:px-5 pb-4 md:pb-5 space-y-3">
                              {w.content && (
                                <ContentRenderer content={w.content} maxLength={600} className="text-sm font-serif text-white/55 leading-relaxed" />
                              )}
                              <div className="flex items-center gap-3 text-white/50">
                                <span className="font-mono text-[9px] tracking-widest">
                                  {words} words
                                </span>
                                <span className="font-mono text-[9px] tracking-widest capitalize">
                                  {w.genre}
                                </span>
                                {w.resonanceCount > 0 && (
                                  <span className="flex items-center gap-1 font-mono text-[9px] text-amber-400/30">
                                    <Sparkles size={9} />
                                    {w.resonanceCount} resonance{w.resonanceCount !== 1 ? "s" : ""}
                                  </span>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/55">
              {featuredWritings.length > 0 ? "All Writings" : "Public Writings"}
            </h2>
            <div className="flex-grow h-px bg-white/[0.04]" />
            <span className="font-mono text-[9px] text-white/50">
              {regularWritings.length} piece{regularWritings.length !== 1 ? "s" : ""}
            </span>
          </div>

          {writings.length === 0 && (
            <div className="border border-dashed border-white/[0.20] rounded-2xl p-12 text-center space-y-3">
              <Sparkles size={20} className="text-white/30 mx-auto mb-3" />
              <h3 className="font-display text-lg font-light italic text-white/50">
                This garden is still growing
              </h3>
              <p className="font-serif text-sm text-white/50 max-w-sm mx-auto leading-relaxed">
                When this writer shares their work publicly, it will bloom here.
              </p>
            </div>
          )}

          <div className="space-y-2">
            {regularWritings.map((w, i) => {
              const isExpanded = expandedCard === w.id;
              const words = wordCount(w.content);
              return (
                <motion.div
                  key={w.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  data-testid={`card-writing-${w.id}`}
                >
                  <div
                    className={`rounded-xl border overflow-hidden transition-all duration-300 ${
                      isExpanded
                        ? "border-white/20 bg-white/[0.025]"
                        : "border-white/[0.15] hover:border-white/[0.15] bg-white/[0.04]"
                    }`}
                  >
                    <button
                      onClick={() => setExpandedCard(isExpanded ? null : w.id)}
                      className="w-full text-left p-4 md:p-5"
                      data-testid={`button-expand-${w.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-grow min-w-0">
                          <h3 className="text-base font-display font-light italic text-white/80 truncate">
                            {w.title || "Untitled"}
                          </h3>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0 text-white/50">
                          <span className="font-mono text-[9px] uppercase tracking-widest hidden sm:inline">
                            {w.genre}
                          </span>
                          <span className="font-mono text-[9px]">{words}w</span>
                          {w.resonanceCount > 0 && (
                            <span className="flex items-center gap-1 font-mono text-[9px] text-amber-400/40">
                              <Sparkles size={9} />
                              {w.resonanceCount}
                            </span>
                          )}
                          <ChevronDown
                            size={13}
                            className={`transition-transform duration-200 ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </div>
                      {!isExpanded && w.content && (
                        <ContentRenderer content={w.content} maxLength={120} className="text-sm font-serif text-white/55 line-clamp-1 mt-1" />
                      )}
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 md:px-5 pb-4 md:pb-5 space-y-3">
                            {w.content && (
                              <ContentRenderer content={w.content} maxLength={600} className="text-sm font-serif text-white/55 leading-relaxed" />
                            )}
                            <div className="flex items-center gap-3 text-white/50">
                              <span className="font-mono text-[9px] tracking-widest">
                                {words} words
                              </span>
                              <span className="font-mono text-[9px] tracking-widest capitalize">
                                {w.genre}
                              </span>
                              {w.resonanceCount > 0 && (
                                <span className="flex items-center gap-1 font-mono text-[9px] text-amber-400/30">
                                  <Sparkles size={9} />
                                  {w.resonanceCount} resonance{w.resonanceCount !== 1 ? "s" : ""}
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}