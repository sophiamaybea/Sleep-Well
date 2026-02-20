import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Search, BookOpen, X, ChevronRight, ChevronLeft, Sun, Moon, Users, Flower2, Bookmark, Share2, Check } from "lucide-react";
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
  const [wordCountFilter, setWordCountFilter] = useState("all");
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

  const wordCountFiltered = (selectedContributor
    ? allGallery.filter(item => item.authorId === selectedContributor)
    : gallery
  ).filter(p => {
    if (wordCountFilter === "all") return true;
    const text = stripHtml(p.content || "");
    const wc = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
    if (wordCountFilter === "flash") return wc < 1000;
    if (wordCountFilter === "short") return wc >= 1000 && wc < 5000;
    if (wordCountFilter === "medium") return wc >= 5000 && wc < 15000;
    if (wordCountFilter === "long") return wc >= 15000;
    return true;
  });

  const displayedGallery = wordCountFiltered;

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
            <div className="flex items-center justify-center gap-3">
              <Flower2 size={28} className="text-amber-400/40" />
              <h1 className="text-5xl md:text-7xl font-display font-light tracking-tight italic">
                In Bloom
              </h1>
            </div>
            <p className="text-lg font-serif italic text-white/45 max-w-xl mx-auto leading-relaxed">
              Work that has flowered — selected by the editors, shared with consent.
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
              className="space-y-5"
            >
              <div className="flex flex-wrap items-center justify-center gap-2">
                {genreFilters.map((g) => (
                  <button
                    key={g}
                    onClick={() => setActiveGenre(g)}
                    className={`px-5 py-2.5 rounded-full font-serif text-[13px] italic tracking-wide whitespace-nowrap transition-all duration-300 ${
                      activeGenre === g
                        ? "bg-amber-600/15 border border-amber-500/30 text-amber-200/90 shadow-[0_0_12px_rgba(217,169,56,0.08)]"
                        : "border border-white/[0.07] text-white/40 hover:text-white/65 hover:border-white/15 hover:bg-white/[0.03]"
                    }`}
                    data-testid={`button-genre-${g}`}
                  >
                    {g === "all" ? "All" : g.charAt(0).toUpperCase() + g.slice(1)}
                  </button>
                ))}
              </div>
              <div className="flex justify-center items-center gap-3 flex-wrap">
                <div className="relative w-full sm:w-80">
                  <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                  <input
                    type="text"
                    placeholder="Search bloomed works..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-full font-serif text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:border-amber-600/30 transition-colors"
                    data-testid="input-gallery-search"
                  />
                </div>
                <select
                  value={wordCountFilter}
                  onChange={(e) => setWordCountFilter(e.target.value)}
                  className="bg-transparent text-white/50 font-mono text-[10px] uppercase tracking-widest border border-white/[0.15] rounded-full px-3 py-1.5 focus:outline-none hover:border-white/25 transition-colors cursor-pointer"
                  data-testid="select-wordcount-filter"
                >
                  <option value="all" className="bg-[#0b101a]">All Lengths</option>
                  <option value="flash" className="bg-[#0b101a]">Flash (&lt;1k)</option>
                  <option value="short" className="bg-[#0b101a]">Short (1-5k)</option>
                  <option value="medium" className="bg-[#0b101a]">Medium (5-15k)</option>
                  <option value="long" className="bg-[#0b101a]">Long (15k+)</option>
                </select>
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
                    {selectedContributorData.pieceCount} {selectedContributorData.pieceCount === 1 ? "piece" : "pieces"} in bloom
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
                  <p className="text-white/40 font-serif italic">Writers will appear here once their work blooms.</p>
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
                  const isFeatured = i < 2 && !searchQuery && activeGenre === "all" && !selectedContributor;
                  const excerpt = isFeatured ? stripHtml(item.content).slice(0, 120).trim() : "";

                  if (isFeatured) {
                    return (
                      <motion.button
                        key={item.id}
                        initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
                        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{
                          delay: i * 0.12,
                          duration: 0.9,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        viewport={{ once: true, margin: "-30px" }}
                        onClick={() => setSelectedPiece(item)}
                        className="w-full text-left border-b border-white/[0.06] group cursor-pointer transition-all duration-500 relative"
                        data-testid={`button-piece-${item.id}`}
                      >
                        <div className="py-12 px-8 -mx-8 rounded-sm hover:bg-white/[0.02] transition-all duration-700 relative overflow-hidden">
                          <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-amber-400/0 to-transparent group-hover:via-amber-400/20 transition-all duration-700" />

                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-amber-200/30 group-hover:text-amber-200/50 transition-colors duration-500">
                                {item.genre}
                              </span>
                              <span className="font-mono text-[9px] text-white/15">
                                {readingTime} min
                              </span>
                            </div>

                            <h3 className="text-3xl md:text-5xl font-display font-light tracking-tight text-white/80 group-hover:text-white transition-colors duration-500 italic leading-[1.15]">
                              {item.title}
                            </h3>

                            {excerpt && (
                              <p className="font-serif text-sm leading-relaxed text-white/25 group-hover:text-white/35 transition-colors duration-500 max-w-xl line-clamp-2 italic">
                                {excerpt}{excerpt.length >= 120 ? "..." : ""}
                              </p>
                            )}

                            <div className="flex items-center justify-between pt-2">
                              <div className="flex items-center gap-4">
                                {item.authorName && (
                                  <span className="font-serif text-[13px] italic text-white/30 group-hover:text-white/50 transition-colors duration-500">
                                    {item.authorName}
                                  </span>
                                )}
                                {item.publishedAt && (
                                  <span className="font-mono text-[8px] text-white/15 uppercase tracking-widest hidden sm:inline">
                                    {new Date(item.publishedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                                  </span>
                                )}
                              </div>
                              <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/0 group-hover:text-amber-200/50 transition-all duration-500 translate-x-2 group-hover:translate-x-0" data-testid={`text-reading-time-${item.id}`}>
                                Read
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    );
                  }

                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
                      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{
                        delay: Math.min(i * 0.06, 0.4),
                        duration: 0.7,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      viewport={{ once: true, margin: "-30px" }}
                      onClick={() => setSelectedPiece(item)}
                      className="w-full text-left border-b border-white/[0.06] group cursor-pointer transition-all duration-500 relative"
                      data-testid={`button-piece-${item.id}`}
                    >
                      <div className="py-7 px-6 -mx-6 rounded-sm hover:bg-white/[0.015] transition-all duration-500 relative overflow-hidden">
                        <div className="absolute bottom-0 left-6 w-0 group-hover:w-24 h-px bg-gradient-to-r from-amber-400/30 to-transparent transition-all duration-700 ease-out" />

                        <div className="flex items-center justify-between gap-4">
                          <div className="space-y-2 min-w-0">
                            <h3 className="text-xl md:text-2xl font-display font-light tracking-tight text-white/70 group-hover:text-white/95 transition-colors duration-500 italic truncate group-hover:translate-x-1 transform transition-transform">
                              {item.title}
                            </h3>
                            <div className="flex items-center gap-4">
                              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-amber-200/25 group-hover:text-amber-200/40 transition-colors duration-500">
                                {item.genre}
                              </span>
                              {item.authorName && (
                                <span className="font-serif text-[12px] italic text-white/25 group-hover:text-white/35 transition-colors duration-500">
                                  {item.authorName}
                                </span>
                              )}
                              <span className="font-mono text-[9px] text-white/20" data-testid={`text-reading-time-${item.id}`}>
                                {readingTime} min
                              </span>
                              {item.publishedAt && (
                                <span className="font-mono text-[8px] text-white/15 uppercase tracking-widest hidden sm:inline">
                                  {new Date(item.publishedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/0 group-hover:text-amber-200/40 transition-all duration-500 flex-shrink-0 translate-x-3 group-hover:translate-x-0">
                            Read
                          </span>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto text-center py-20 space-y-6">
              <Flower2 size={32} className="mx-auto text-amber-200/20" />
              <span className="inline-block px-4 py-1.5 border border-amber-200/10 font-mono text-[9px] uppercase tracking-[0.3em] text-amber-200/30">
                Awaiting First Bloom
              </span>
              <h3 className="text-3xl md:text-4xl font-display font-light tracking-wide text-white/70">
                Nothing Has Bloomed Yet
              </h3>
              <p className="max-w-lg mx-auto text-white/40 leading-relaxed font-serif italic text-lg">
                Editors are reading the Gardens. When a piece flowers, it will appear here.
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
          <ReadingView
            piece={selectedPiece}
            lightMode={lightMode}
            setLightMode={setLightMode}
            onClose={() => setSelectedPiece(null)}
            prevPiece={prevPiece}
            nextPiece={nextPiece}
            onNavigate={setSelectedPiece}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ShareButton({ piece }: { piece: any }) {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/in-bloom?piece=${piece.id}`;

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: piece.title,
          text: `Read "${piece.title}" on The Page Gallery Journal`,
          url: shareUrl,
        });
      } catch (e) {
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      onClick={handleShare}
      className="p-2 rounded-full text-white/40 hover:text-white/70 hover:bg-white/[0.05] transition-all"
      title={copied ? "Link copied!" : "Share this piece"}
      data-testid="button-share-piece"
    >
      {copied ? <Check size={16} className="text-emerald-400" /> : <Share2 size={16} />}
    </button>
  );
}

function ReadingView({ piece, lightMode, setLightMode, onClose, prevPiece, nextPiece, onNavigate }: {
  piece: GalleryItem;
  lightMode: boolean;
  setLightMode: (v: boolean) => void;
  onClose: () => void;
  prevPiece: GalleryItem | null;
  nextPiece: GalleryItem | null;
  onNavigate: (p: GalleryItem) => void;
}) {
  const readingTime = getReadingTime(piece.content);
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { scrollYProgress } = useScroll({ container: scrollRef });
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const { data: savedPieces = [] } = useQuery<{ id: string; writingId: string }[]>({
    queryKey: ["/api/saved"],
    queryFn: async () => {
      const res = await fetch("/api/saved", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const isSaved = savedPieces.some((s) => s.writingId === piece.id);
  const savedEntry = savedPieces.find((s) => s.writingId === piece.id);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (isSaved && savedEntry) {
        const res = await fetch(`/api/saved/${savedEntry.id}`, { method: "DELETE", credentials: "include" });
        if (!res.ok) throw new Error("Failed");
      } else {
        const res = await fetch("/api/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ writingId: piece.id }),
        });
        if (!res.ok) throw new Error("Failed");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved"] });
    },
  });

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && prevPiece) onNavigate(prevPiece);
      if (e.key === "ArrowRight" && nextPiece) onNavigate(nextPiece);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, prevPiece, nextPiece, onNavigate]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [piece.id]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100]"
    >
      <div
        className={`absolute inset-0 ${lightMode ? "bg-[#faf8f5]" : "bg-[#0b101a]"} transition-colors duration-500`}
        onClick={onClose}
      />

      <motion.div className="fixed top-0 left-0 right-0 h-[2px] z-[110]" style={{ scaleX, transformOrigin: "0%" }}>
        <div className={`h-full ${lightMode ? "bg-amber-700/30" : "bg-amber-400/20"}`} />
      </motion.div>

      <div className="absolute top-4 left-4 right-4 z-[105] flex items-center justify-between">
        <button
          onClick={onClose}
          className={`p-2 rounded-full transition-colors ${lightMode ? "text-stone-400 hover:text-stone-600 hover:bg-stone-100" : "text-white/30 hover:text-white/70 hover:bg-white/[0.06]"}`}
          data-testid="button-close-reading"
        >
          <X size={20} />
        </button>
        <div className="flex items-center gap-2">
          {prevPiece && (
            <button
              onClick={() => onNavigate(prevPiece)}
              className={`p-2 rounded-full transition-colors ${lightMode ? "text-stone-400 hover:text-stone-600 hover:bg-stone-100" : "text-white/30 hover:text-white/70 hover:bg-white/[0.06]"}`}
              data-testid="button-prev-piece"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          {nextPiece && (
            <button
              onClick={() => onNavigate(nextPiece)}
              className={`p-2 rounded-full transition-colors ${lightMode ? "text-stone-400 hover:text-stone-600 hover:bg-stone-100" : "text-white/30 hover:text-white/70 hover:bg-white/[0.06]"}`}
              data-testid="button-next-piece"
            >
              <ChevronRight size={18} />
            </button>
          )}
          <ShareButton piece={piece} />
          <button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className={`p-2 rounded-full transition-colors ${
              isSaved
                ? lightMode ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50" : "text-amber-400 hover:text-amber-300 hover:bg-amber-400/[0.08]"
                : lightMode ? "text-stone-400 hover:text-stone-600 hover:bg-stone-100" : "text-white/30 hover:text-white/70 hover:bg-white/[0.06]"
            }`}
            data-testid="button-bookmark-piece"
          >
            <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
          </button>
          <button
            onClick={() => setLightMode(!lightMode)}
            className={`p-2 rounded-full transition-colors ${lightMode ? "text-stone-400 hover:text-stone-600 hover:bg-stone-100" : "text-white/30 hover:text-white/70 hover:bg-white/[0.06]"}`}
            data-testid="button-toggle-light"
          >
            {lightMode ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="absolute inset-0 overflow-y-auto pt-16 pb-32"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-2xl mx-auto px-4 md:px-8 lg:px-16 py-12">
          <div className="space-y-8">
            <div className="space-y-4">
              <span className={`font-mono text-[9px] uppercase tracking-[0.3em] ${lightMode ? "text-stone-400" : "text-amber-200/30"}`}>
                {piece.genre} · {readingTime} min read
              </span>
              <h1 className={`text-3xl md:text-5xl font-display font-light italic leading-tight ${lightMode ? "text-stone-800" : "text-white/90"}`}>
                {piece.title}
              </h1>
              <div className="flex items-center gap-4">
                {piece.authorName && (
                  <span className={`font-serif text-sm italic ${lightMode ? "text-stone-500" : "text-white/40"}`}>
                    {piece.authorName}
                  </span>
                )}
                {piece.publishedAt && (
                  <span className={`font-mono text-[9px] uppercase tracking-widest ${lightMode ? "text-stone-400" : "text-white/20"}`}>
                    {new Date(piece.publishedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </span>
                )}
              </div>
            </div>

            <div className={`h-px ${lightMode ? "bg-stone-200" : "bg-white/[0.06]"}`} />

            <div className={`prose max-w-none break-words ${lightMode
              ? "prose-stone prose-p:text-stone-700 prose-p:leading-[1.9] prose-headings:text-stone-800"
              : "prose-invert prose-p:text-white/60 prose-p:leading-[1.9] prose-headings:text-white/80"
            } prose-p:font-serif prose-p:text-base md:prose-p:text-[17px] prose-headings:font-display prose-headings:italic`} style={{ overflowWrap: "anywhere" }}>
              <ContentRenderer content={piece.content} />
            </div>

            <div className={`h-px ${lightMode ? "bg-stone-200" : "bg-white/[0.06]"}`} />

            {piece.authorName && (
              <div className="text-center space-y-3 py-8">
                <p className={`font-serif text-sm italic ${lightMode ? "text-stone-500" : "text-white/40"}`}>
                  by {piece.authorName}
                </p>
                {piece.authorBio && (
                  <p className={`font-serif text-xs leading-relaxed max-w-md mx-auto ${lightMode ? "text-stone-400" : "text-white/30"}`}>
                    {piece.authorBio}
                  </p>
                )}
                {piece.authorId && (
                  <Link
                    href={`/writer/${piece.authorId}`}
                    className={`inline-block font-mono text-[9px] uppercase tracking-widest ${lightMode ? "text-stone-400 hover:text-stone-600" : "text-white/25 hover:text-white/50"} transition-colors`}
                    data-testid="link-author-profile"
                  >
                    View Profile
                  </Link>
                )}
              </div>
            )}

            <GalleryComments writingId={piece.id} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function GalleryComments({ writingId }: { writingId: string }) {
  const [newComment, setNewComment] = useState("");
  const queryClient = useQueryClient();

  const { data: comments = [] } = useQuery<any[]>({
    queryKey: ["/api/gallery-comments", writingId],
    queryFn: async () => {
      const res = await fetch(`/api/gallery-comments/${writingId}`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const addComment = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/gallery-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ writingId, content: newComment }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery-comments", writingId] });
      setNewComment("");
    },
  });

  return (
    <div className="mt-12 pt-8 border-t border-white/[0.08]">
      <h3 className="font-display text-xl text-white/70 italic mb-6" data-testid="text-comments-heading">
        Reflections
      </h3>

      <div className="mb-8">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts on this piece..."
          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 text-white/70 text-sm font-serif placeholder:text-white/25 focus:outline-none focus:border-white/20 transition-colors resize-none min-h-[80px]"
          data-testid="textarea-comment"
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={() => addComment.mutate()}
            disabled={!newComment.trim() || addComment.isPending}
            className="px-4 py-2 rounded-full font-mono text-[10px] uppercase tracking-widest border border-white/[0.15] text-white/60 hover:text-white/80 hover:border-white/25 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            data-testid="button-submit-comment"
          >
            {addComment.isPending ? "Posting..." : "Leave a reflection"}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {comments.map((c: any) => (
          <div key={c.id} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4" data-testid={`comment-${c.id}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-serif text-sm text-white/60">{c.authorName || "Anonymous"}</span>
              <span className="text-white/20">·</span>
              <span className="font-mono text-[9px] text-white/30">
                {c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
              </span>
            </div>
            <p className="font-serif text-sm text-white/50 leading-relaxed">{c.content}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="font-serif text-sm text-white/25 italic text-center py-6" data-testid="text-no-comments">
            No reflections yet. Be the first to share your thoughts.
          </p>
        )}
      </div>
    </div>
  );
}
