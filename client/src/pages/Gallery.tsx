import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Search, BookOpen, X, ChevronRight, ChevronLeft, Sun, Moon, Users } from "lucide-react";
import { ContentRenderer, stripHtml } from "@/components/garden/RichEditor";
import StarBackground from "@/components/StarBackground";

const frameImg = "/images/gold-frame.png";

interface GalleryItem {
  id: string;
  title: string;
  content: string;
  genre: string;
  authorName: string | null;
  authorBio: string | null;
  publishedAt: string | null;
  authorId?: string;
}

const genreFilters = ["all", "poetry", "fiction", "essay", "fragment", "other"];

function getReadingTime(content: string): number {
  const text = stripHtml(content);
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  return Math.max(1, Math.ceil(wordCount / 200));
}

type ViewMode = "pieces" | "contributors";

export default function Gallery() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGenre, setActiveGenre] = useState("all");
  const [selectedPiece, setSelectedPiece] = useState<GalleryItem | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("pieces");
  const [selectedContributor, setSelectedContributor] = useState<string | null>(null);
  const [lightMode, setLightMode] = useState(() => {
    try {
      return localStorage.getItem("gallery-reading-mode") === "light";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("gallery-reading-mode", lightMode ? "light" : "dark");
    } catch {}
  }, [lightMode]);

  const { data: gallery = [], isLoading } = useQuery<GalleryItem[]>({
    queryKey: ["/api/gallery", searchQuery, activeGenre],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (activeGenre !== "all") params.set("genre", activeGenre);
      const url = params.toString() ? `/api/gallery?${params}` : "/api/gallery";
      const res = await fetch(url);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: allGallery = [] } = useQuery<GalleryItem[]>({
    queryKey: ["/api/gallery"],
    queryFn: async () => {
      const res = await fetch("/api/gallery");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const contributors = useMemo(() => {
    const map = new Map<string, { name: string; bio: string | null; authorId: string; pieceCount: number; genres: Set<string> }>();
    for (const item of allGallery) {
      if (!item.authorId || !item.authorName) continue;
      const existing = map.get(item.authorId);
      if (existing) {
        existing.pieceCount++;
        if (item.genre) existing.genres.add(item.genre);
      } else {
        const genres = new Set<string>();
        if (item.genre) genres.add(item.genre);
        map.set(item.authorId, { name: item.authorName, bio: item.authorBio, authorId: item.authorId, pieceCount: 1, genres });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [allGallery]);

  const displayedGallery = selectedContributor
    ? allGallery.filter(item => item.authorId === selectedContributor)
    : gallery;

  const selectedIndex = selectedPiece ? displayedGallery.findIndex(g => g.id === selectedPiece.id) : -1;
  const prevPiece = selectedIndex > 0 ? displayedGallery[selectedIndex - 1] : null;
  const nextPiece = selectedIndex >= 0 && selectedIndex < displayedGallery.length - 1 ? displayedGallery[selectedIndex + 1] : null;

  const selectedContributorData = selectedContributor ? contributors.find(c => c.authorId === selectedContributor) : null;

  return (
    <div className="min-h-screen bg-[#0b101a] text-white selection:bg-secondary selection:text-background relative">
      <StarBackground />

      <div className="relative z-10">
        <header className="pt-8 pb-4 px-6 md:px-12 max-w-6xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors font-mono text-xs uppercase tracking-widest group" data-testid="link-back-home">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back
          </Link>
        </header>

        <div className="max-w-5xl mx-auto px-6 pt-12 pb-32 space-y-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-6"
          >
            <span className="font-mono text-[10px] tracking-[0.4em] text-amber-200/25 block uppercase">
              The Page Gallery Journal
            </span>
            <h1 className="text-5xl md:text-7xl font-display font-light tracking-tight italic">
              The Gallery
            </h1>
            <p className="text-lg font-serif italic text-white/45 max-w-xl mx-auto leading-relaxed">
              Found in the Gardens. Chosen because they wouldn't let go.
            </p>
            <div className="flex items-center justify-center gap-4 pt-2">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-600/20" />
              <div className="w-1.5 h-1.5 rotate-45 border border-amber-600/20" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-600/20" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex justify-center"
          >
            <div className="inline-flex items-center border border-white/[0.08] rounded-full p-0.5">
              <button
                onClick={() => { setViewMode("pieces"); setSelectedContributor(null); }}
                className={`px-5 py-2 rounded-full font-mono text-[10px] uppercase tracking-widest transition-all ${
                  viewMode === "pieces"
                    ? "bg-white/[0.08] text-white/80"
                    : "text-white/35 hover:text-white/55"
                }`}
                data-testid="button-view-pieces"
              >
                Pieces
              </button>
              <button
                onClick={() => { setViewMode("contributors"); setSelectedContributor(null); }}
                className={`px-5 py-2 rounded-full font-mono text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${
                  viewMode === "contributors"
                    ? "bg-white/[0.08] text-white/80"
                    : "text-white/35 hover:text-white/55"
                }`}
                data-testid="button-view-contributors"
              >
                <Users size={12} />
                Contributors
              </button>
            </div>
          </motion.div>

          {viewMode === "pieces" && !selectedContributor && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-center gap-4 justify-center"
            >
              <div className="relative w-full sm:w-80">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                <input
                  type="text"
                  placeholder="Search the gallery..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-full font-serif text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:border-amber-600/30 transition-colors"
                  data-testid="input-gallery-search"
                />
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveGenre("all")}
                  className={`px-4 py-2 rounded-full font-mono text-[10px] uppercase tracking-widest whitespace-nowrap transition-all flex-shrink-0 ${
                    activeGenre === "all"
                      ? "bg-amber-600/15 border border-amber-600/30 text-amber-200/80"
                      : "border border-white/[0.06] text-white/35 hover:text-white/55 hover:border-white/15"
                  }`}
                  data-testid="button-genre-all"
                >
                  all
                </button>
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
                  {genreFilters.filter(g => g !== "all").map((g) => (
                    <button
                      key={g}
                      onClick={() => setActiveGenre(g)}
                      className={`px-4 py-2 rounded-full font-mono text-[10px] uppercase tracking-widest whitespace-nowrap transition-all ${
                        activeGenre === g
                          ? "bg-amber-600/15 border border-amber-600/30 text-amber-200/80"
                          : "border border-white/[0.06] text-white/35 hover:text-white/55 hover:border-white/15"
                      }`}
                      data-testid={`button-genre-${g}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {selectedContributor && selectedContributorData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto"
            >
              <button
                onClick={() => setSelectedContributor(null)}
                className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors font-mono text-xs uppercase tracking-widest group mb-8"
                data-testid="button-back-contributors"
              >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                All Contributors
              </button>
              <div className="space-y-4 pb-8 border-b border-white/[0.06]">
                <h2 className="text-3xl md:text-4xl font-display font-light italic text-white/90">
                  {selectedContributorData.name}
                </h2>
                {selectedContributorData.bio && (
                  <p className="font-serif text-sm leading-relaxed text-white/50 max-w-2xl">
                    {selectedContributorData.bio}
                  </p>
                )}
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-amber-200/30">
                    {selectedContributorData.pieceCount} {selectedContributorData.pieceCount === 1 ? "piece" : "pieces"} published
                  </span>
                  <Link
                    href={`/writer/${selectedContributorData.authorId}`}
                    className="font-mono text-[9px] uppercase tracking-widest text-white/25 hover:text-white/50 transition-colors"
                    data-testid="link-contributor-profile"
                  >
                    View Full Profile
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {viewMode === "contributors" && !selectedContributor ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto"
            >
              {contributors.length > 0 ? (
                <div className="border-t border-white/[0.06]">
                  {contributors.map((contributor, i) => (
                    <motion.button
                      key={contributor.authorId}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.5 }}
                      viewport={{ once: true }}
                      onClick={() => { setSelectedContributor(contributor.authorId); setViewMode("pieces"); }}
                      className="w-full text-left py-7 border-b border-white/[0.06] group cursor-pointer hover:bg-white/[0.02] transition-colors px-4 -mx-4 rounded"
                      data-testid={`button-contributor-${contributor.authorId}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2 min-w-0 flex-1">
                          <h3 className="text-2xl md:text-3xl font-display font-light tracking-tight text-white/75 group-hover:text-white transition-colors duration-300 italic">
                            {contributor.name}
                          </h3>
                          <div className="flex items-center gap-4 flex-wrap">
                            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-amber-200/30">
                              {contributor.pieceCount} {contributor.pieceCount === 1 ? "piece" : "pieces"}
                            </span>
                            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/20">
                              {Array.from(contributor.genres).join(" · ")}
                            </span>
                          </div>
                          {contributor.bio && (
                            <p className="font-serif text-[12px] leading-relaxed text-white/30 line-clamp-2 max-w-xl">
                              {contributor.bio}
                            </p>
                          )}
                        </div>
                        <ChevronRight size={18} className="text-white/15 group-hover:text-amber-200/50 group-hover:translate-x-1 transition-all duration-300 mt-2 flex-shrink-0" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 space-y-6">
                  <Users size={32} className="mx-auto text-amber-200/20" />
                  <h3 className="text-3xl font-display font-light text-white/70">No Contributors Yet</h3>
                  <p className="text-white/40 font-serif italic">Writers will appear here once their work is published.</p>
                </div>
              )}
            </motion.div>
          ) : isLoading ? (
            <div className="max-w-3xl mx-auto space-y-0">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="py-6 border-b border-white/[0.04] animate-pulse">
                  <div className="h-7 w-64 bg-white/[0.04] rounded mb-2" />
                  <div className="flex gap-4">
                    <div className="h-3 w-16 bg-white/[0.03] rounded" />
                    <div className="h-3 w-20 bg-white/[0.03] rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayedGallery.length > 0 ? (
            <div className="max-w-3xl mx-auto">
              <div className="border-t border-white/[0.06]">
                {displayedGallery.map((item, i) => {
                  const readingTime = getReadingTime(item.content);
                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.5 }}
                      viewport={{ once: true }}
                      onClick={() => setSelectedPiece(item)}
                      className="w-full text-left py-7 border-b border-white/[0.06] group cursor-pointer hover:bg-white/[0.02] transition-colors px-4 -mx-4 rounded"
                      data-testid={`button-piece-${item.id}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2 min-w-0">
                          <h3 className="text-2xl md:text-3xl font-display font-light tracking-tight text-white/75 group-hover:text-white transition-colors duration-300 italic truncate">
                            {item.title}
                          </h3>
                          <div className="flex items-center gap-4">
                            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-amber-200/25">
                              {item.genre}
                            </span>
                            {item.authorName && (
                              <span className="font-serif text-[12px] italic text-white/25">
                                {item.authorName}
                              </span>
                            )}
                            <span className="font-mono text-[9px] text-white/20" data-testid={`text-reading-time-${item.id}`}>
                              {readingTime} min read
                            </span>
                            {item.publishedAt && (
                              <span className="font-mono text-[8px] text-white/15 uppercase tracking-widest hidden sm:inline">
                                {new Date(item.publishedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-white/15 group-hover:text-amber-200/50 group-hover:translate-x-1 transition-all duration-300 mt-2 flex-shrink-0" />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto text-center py-20 space-y-6">
              <BookOpen size={32} className="mx-auto text-amber-200/20" />
              <span className="inline-block px-4 py-1.5 border border-amber-200/10 font-mono text-[9px] uppercase tracking-[0.3em] text-amber-200/30">
                Awaiting First Exhibition
              </span>
              <h3 className="text-3xl md:text-4xl font-display font-light tracking-wide text-white/70">
                The Gallery is Preparing
              </h3>
              <p className="max-w-lg mx-auto text-white/40 leading-relaxed font-serif italic text-lg">
                Editors are reading the Gardens. When a piece stops them, they'll publish it here.
              </p>
            </div>
          )}
        </div>

        <footer className="border-t border-white/[0.04] py-12 text-center">
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/20">
            The Page Gallery Journal
          </p>
        </footer>
      </div>

      <AnimatePresence>
        {selectedPiece && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className={`fixed inset-0 z-50 overflow-y-auto ${lightMode ? "bg-[#f0eeea]" : "bg-black"}`}
            data-lenis-prevent
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <div className="relative">
              <div className={`sticky top-0 z-10 backdrop-blur-sm flex items-center justify-between px-6 md:px-12 py-6 ${lightMode ? "bg-[#f0eeea]/80" : "bg-black/80"}`}>
                <button
                  onClick={() => setSelectedPiece(null)}
                  className={`flex items-center gap-2 transition-colors font-mono text-xs uppercase tracking-widest group ${lightMode ? "text-stone-400 hover:text-stone-600" : "text-white/30 hover:text-white/60"}`}
                  data-testid="button-close-piece"
                >
                  <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                  Back to Gallery
                </button>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setLightMode(!lightMode)}
                    className={`p-2 rounded-full transition-colors ${lightMode ? "text-stone-500 hover:text-stone-700 hover:bg-stone-200/50" : "text-white/30 hover:text-white/60 hover:bg-white/10"}`}
                    data-testid="button-reading-mode-toggle"
                    title={lightMode ? "Switch to dark mode" : "Switch to light mode"}
                  >
                    {lightMode ? <Moon size={16} /> : <Sun size={16} />}
                  </button>
                  <span className={`font-mono text-[9px] uppercase tracking-[0.25em] ${lightMode ? "text-stone-400" : "text-white/15"}`}>
                    {selectedPiece.genre}
                  </span>
                  {selectedPiece.publishedAt && (
                    <span className={`font-mono text-[8px] uppercase tracking-widest hidden sm:inline ${lightMode ? "text-stone-300" : "text-white/10"}`}>
                      {new Date(selectedPiece.publishedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-center px-6 md:px-12 pb-24 pt-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
                  className="w-full max-w-2xl"
                >
                  <div className="mb-16 space-y-6">
                    <motion.h1
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.7 }}
                      className={`text-4xl md:text-6xl font-display font-light tracking-tight italic leading-tight ${lightMode ? "text-stone-800" : "text-white/90"}`}
                    >
                      {selectedPiece.title}
                    </motion.h1>
                    {selectedPiece.authorName && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                      >
                        <Link
                          href={selectedPiece.authorId ? `/writer/${selectedPiece.authorId}` : "#"}
                          className={`font-serif text-sm italic transition-colors ${lightMode ? "text-stone-400 hover:text-stone-600" : "text-white/25 hover:text-white/45"}`}
                          data-testid="link-piece-author"
                        >
                          by {selectedPiece.authorName}
                        </Link>
                      </motion.div>
                    )}
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.6, duration: 0.8 }}
                      className={`h-px w-24 bg-gradient-to-r origin-left ${lightMode ? "from-stone-300 to-transparent" : "from-white/15 to-transparent"}`}
                    />
                  </div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.8 }}
                    className={`font-serif text-[18px] md:text-[20px] leading-[2.4] ${lightMode ? "text-stone-600" : "text-white/60"}`}
                  >
                    <ContentRenderer content={selectedPiece.content} />
                  </motion.div>

                  {selectedPiece.authorBio && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.9, duration: 0.6 }}
                      className={`mt-20 pt-8 border-t ${lightMode ? "border-stone-200" : "border-white/[0.06]"}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${lightMode ? "bg-stone-200 text-stone-500" : "bg-white/[0.06] text-white/25"}`}>
                          <span className="font-display text-sm italic">
                            {selectedPiece.authorName?.charAt(0) || "?"}
                          </span>
                        </div>
                        <div className="space-y-2 min-w-0">
                          <div className="flex items-center gap-3">
                            <span className={`font-display text-sm italic ${lightMode ? "text-stone-700" : "text-white/60"}`}>
                              {selectedPiece.authorName}
                            </span>
                            {selectedPiece.authorId && (
                              <Link
                                href={`/writer/${selectedPiece.authorId}`}
                                className={`font-mono text-[8px] uppercase tracking-widest transition-colors ${lightMode ? "text-stone-400 hover:text-stone-600" : "text-white/20 hover:text-white/40"}`}
                                data-testid="link-author-profile-from-bio"
                              >
                                View Profile
                              </Link>
                            )}
                          </div>
                          <p className={`font-serif text-[13px] leading-relaxed ${lightMode ? "text-stone-500" : "text-white/35"}`}>
                            {selectedPiece.authorBio}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.6 }}
                    className={`mt-12 pt-8 border-t flex items-center justify-between ${lightMode ? "border-stone-200" : "border-white/[0.04]"}`}
                  >
                    <p className={`font-serif text-[11px] italic ${lightMode ? "text-stone-400" : "text-white/15"}`}>
                      This piece grew in The Garden.
                    </p>
                    {selectedPiece.authorId && (
                      <Link
                        href={`/writer/${selectedPiece.authorId}`}
                        className={`font-mono text-[9px] uppercase tracking-widest transition-colors ${lightMode ? "text-stone-400 hover:text-stone-600" : "text-white/15 hover:text-white/40"}`}
                        data-testid="link-piece-writer-profile"
                      >
                        Visit Writer
                      </Link>
                    )}
                  </motion.div>

                  <div className={`mt-12 pt-8 border-t flex items-center justify-between gap-4 ${lightMode ? "border-stone-200" : "border-white/[0.04]"}`}>
                    {prevPiece ? (
                      <button
                        onClick={() => setSelectedPiece(prevPiece)}
                        className={`flex items-center gap-3 group text-left max-w-[45%] transition-colors ${lightMode ? "text-stone-400 hover:text-stone-700" : "text-white/25 hover:text-white/60"}`}
                        data-testid="button-prev-piece"
                      >
                        <ChevronLeft size={16} className="flex-shrink-0 group-hover:-translate-x-1 transition-transform" />
                        <div className="min-w-0">
                          <span className="font-mono text-[8px] uppercase tracking-widest block mb-1">Previous</span>
                          <span className="font-display text-sm italic truncate block">{prevPiece.title}</span>
                        </div>
                      </button>
                    ) : (
                      <div />
                    )}
                    {nextPiece ? (
                      <button
                        onClick={() => setSelectedPiece(nextPiece)}
                        className={`flex items-center gap-3 group text-right max-w-[45%] transition-colors ${lightMode ? "text-stone-400 hover:text-stone-700" : "text-white/25 hover:text-white/60"}`}
                        data-testid="button-next-piece"
                      >
                        <div className="min-w-0">
                          <span className="font-mono text-[8px] uppercase tracking-widest block mb-1">Next</span>
                          <span className="font-display text-sm italic truncate block">{nextPiece.title}</span>
                        </div>
                        <ChevronRight size={16} className="flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                      </button>
                    ) : (
                      <div />
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
