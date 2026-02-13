import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Search, BookOpen, X, ChevronRight } from "lucide-react";
import { ContentRenderer } from "@/components/garden/RichEditor";
import StarBackground from "@/components/StarBackground";

const frameImg = "/images/gold-frame.png";

interface GalleryItem {
  id: string;
  title: string;
  content: string;
  genre: string;
  authorName: string | null;
  publishedAt: string | null;
  authorId?: string;
}

const genreFilters = ["all", "poetry", "fiction", "essay", "fragment", "other"];

export default function Gallery() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGenre, setActiveGenre] = useState("all");
  const [selectedPiece, setSelectedPiece] = useState<GalleryItem | null>(null);

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
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
              {genreFilters.map((g) => (
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
          </motion.div>

          {isLoading ? (
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
          ) : gallery.length > 0 ? (
            <div className="max-w-3xl mx-auto">
              <div className="border-t border-white/[0.06]">
                {gallery.map((item, i) => (
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
                ))}
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
            className="fixed inset-0 z-50 bg-black overflow-y-auto"
          >
            <div className="min-h-screen flex flex-col">
              <div className="flex items-center justify-between px-6 md:px-12 py-6">
                <button
                  onClick={() => setSelectedPiece(null)}
                  className="flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors font-mono text-xs uppercase tracking-widest group"
                  data-testid="button-close-piece"
                >
                  <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                  Back to Gallery
                </button>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/15">
                    {selectedPiece.genre}
                  </span>
                  {selectedPiece.publishedAt && (
                    <span className="font-mono text-[8px] text-white/10 uppercase tracking-widest hidden sm:inline">
                      {new Date(selectedPiece.publishedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex-1 flex items-start justify-center px-6 md:px-12 pb-24">
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
                      className="text-4xl md:text-6xl font-display font-light tracking-tight text-white/90 italic leading-tight"
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
                          className="font-serif text-sm italic text-white/25 hover:text-white/45 transition-colors"
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
                      className="h-px w-24 bg-gradient-to-r from-white/15 to-transparent origin-left"
                    />
                  </div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.8 }}
                    className="font-serif text-[18px] md:text-[20px] leading-[2.4] text-white/60"
                  >
                    <ContentRenderer content={selectedPiece.content} />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.6 }}
                    className="mt-20 pt-8 border-t border-white/[0.04] flex items-center justify-between"
                  >
                    <p className="font-serif text-[11px] italic text-white/15">
                      This piece grew in The Garden.
                    </p>
                    {selectedPiece.authorId && (
                      <Link
                        href={`/writer/${selectedPiece.authorId}`}
                        className="font-mono text-[9px] uppercase tracking-widest text-white/15 hover:text-white/40 transition-colors"
                        data-testid="link-piece-writer-profile"
                      >
                        Visit Writer
                      </Link>
                    )}
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
