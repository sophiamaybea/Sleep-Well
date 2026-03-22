import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Feather, ChevronDown, Home, Sparkles } from "lucide-react";
import StarBackground from "@/components/StarBackground";
import { TendButton } from "@/components/garden/SocialFeatures";
import { ContentRenderer, stripHtml } from "@/components/garden/RichEditor"; import { usePageMeta } from "@/hooks/usePageMeta";

type WriterWriting = {
  id: string;
  title: string;
  content: string;
  genre: string;
  readiness: string;
  createdAt: string;
  updatedAt: string;
  resonanceCount: number;
};

type WriterProfile = {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    bio: string | null;
    profileImageUrl: string | null;
    createdAt: string;
  };
  writings: WriterWriting[];
  tenderCount: number;
  tendingCount: number;
};

function wordCount(text: string) {
  const plain = text.includes("<") ? stripHtml(text) : text;
  return plain.trim() ? plain.trim().split(/\s+/).length : 0;
}

export default function WriterProfile() {
  const { id } = useParams<{ id: string }>();
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery<WriterProfile>({
    queryKey: ["/api/writer", id],
    queryFn: async () => {
      const res = await fetch(`/api/writer/${id}`, { credentials: "include" });
      if (res.status === 404) throw new Error("not_found");
      if (!res.ok) throw new Error("Failed to fetch writer profile");
      return res.json();
    },
    enabled: !!id,
    retry: false,
  });
    usePageMeta({ title: data ? [data.user.firstName, data.user.lastName].filter(Boolean).join(' ') : 'Writer' });

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
        <div className="text-center space-y-6 relative z-10" data-testid="writer-not-found">
          <Feather size={28} className="text-white/30 mx-auto" />
          <h1 className="text-2xl font-display font-light italic text-white/60">
            Writer not found
          </h1>
          <p className="font-serif text-sm text-white/55">
            This writer's garden doesn't exist — they may have moved on, or the link might be incorrect.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/50 hover:text-white/75 transition-colors"
            data-testid="link-home"
          >
            <Home size={13} />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const { user, writings, tenderCount, tendingCount } = data;
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Anonymous";
  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#0b101a] relative">
      <StarBackground />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-16 md:py-24">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white/75 transition-colors mb-12 group"
          data-testid="link-home"
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
                data-testid="img-avatar"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-full border border-white/[0.20] bg-white/[0.03] flex items-center justify-center flex-shrink-0"
                data-testid="img-avatar"
              >
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
                <p className="font-serif text-sm text-white/50 italic mt-3">
                  This writer hasn't added a bio yet.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mb-5">
            <p
              className="font-mono text-[10px] tracking-widest text-white/60 uppercase"
              data-testid="text-stats"
            >
              {tenderCount} tender{tenderCount !== 1 ? "s" : ""} ·{" "}
              {tendingCount} tending ·{" "}
              {writings.length} piece{writings.length !== 1 ? "s" : ""}
            </p>
            <span className="w-px h-3 bg-white/[0.06]" />
            <p
              className="font-mono text-[10px] tracking-widest text-white/50 uppercase"
              data-testid="text-member-since"
            >
              Since {memberSince}
            </p>
          </div>

          <TendButton gardenerId={user.id} gardenerName={fullName} />
        </header>

        <div className="border-t border-white/[0.15] pt-8 mb-8">
          <p className="font-serif text-xs text-white/50 leading-relaxed max-w-lg">
            This is {fullName.split(' ')[0]}'s public garden — a space where their published writings live. Tend their garden to follow along as they share new work.
          </p>
        </div>

        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/55">
              Published Work
            </h2>
            <div className="flex-grow h-px bg-white/[0.04]" />
            <span className="font-mono text-[9px] text-white/50">
              {writings.length} piece{writings.length !== 1 ? "s" : ""}
            </span>
          </div>
          {writings.length > 0 && (
            <p className="font-serif text-xs text-white/50 mb-4">
              Click any piece to read a preview. Resonances show how readers have responded.
            </p>
          )}

          {writings.length === 0 && (
            <div
              className="border border-dashed border-white/[0.20] rounded-2xl p-12 text-center space-y-3"
              data-testid="empty-writings"
            >
              <Sparkles size={20} className="text-white/30 mx-auto mb-3" />
              <h3 className="font-display text-lg font-light italic text-white/50">
                No published writings yet
              </h3>
              <p className="font-serif text-sm text-white/50 max-w-sm mx-auto leading-relaxed">
                This writer's garden is still growing. When they share their work with the community, it will appear here.
              </p>
            </div>
          )}

          <div className="space-y-2">
            {writings.map((w, i) => {
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
                          <span className="font-mono text-[9px]">{words > 0 ? `~${Math.ceil(words / 200)} min read` : 'short read'}</span>
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
