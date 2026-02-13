import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Search, BookOpen } from "lucide-react";
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

function MuseumFrame({ children, index }: { children: React.ReactNode; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12, duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true }}
      className="relative group"
    >
      <div className="absolute -inset-1 bg-gradient-to-b from-amber-900/10 via-transparent to-amber-900/5 rounded-sm blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="relative museum-frame-outer">
        <div
          className="relative"
          style={{
            borderImage: `url("${frameImg}") 120 fill / 50px / 0 stretch`,
            borderWidth: "50px",
            borderStyle: "solid",
          }}
        >
          <div className="relative bg-[#0a0e17] p-8 md:p-12">
            <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 40px rgba(0,0,0,0.4)" }} />
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </div>
      </div>
      <motion.div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="h-px w-20 bg-gradient-to-r from-transparent via-amber-600/30 to-transparent" />
      </motion.div>
    </motion.div>
  );
}

const genreFilters = ["all", "poetry", "fiction", "essay", "fragment", "other"];

export default function Gallery() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGenre, setActiveGenre] = useState("all");

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
            <div className="space-y-16 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="border-[50px] border-amber-900/10 p-8 md:p-12 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-5 w-16 bg-white/[0.04] rounded" />
                    <div className="h-4 w-24 bg-white/[0.03] rounded" />
                  </div>
                  <div className="h-8 w-72 bg-white/[0.04] rounded" />
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-white/[0.03] rounded" />
                    <div className="h-4 w-full bg-white/[0.03] rounded" />
                    <div className="h-4 w-2/3 bg-white/[0.03] rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : gallery.length > 0 ? (
            <div className="space-y-20">
              {gallery.map((item, i) => (
                <MuseumFrame key={item.id} index={i}>
                  <div data-testid={`card-gallery-${item.id}`}>
                    <div className="flex items-center gap-4 mb-8">
                      <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-amber-200/30 px-3 py-1.5 border border-amber-200/10 bg-amber-200/[0.02]">
                        {item.genre}
                      </span>
                      {item.authorName && (
                        <Link
                          href={item.authorId ? `/writer/${item.authorId}` : "#"}
                          className="font-serif text-[11px] italic text-white/30 hover:text-white/50 transition-colors"
                          data-testid={`link-author-${item.id}`}
                        >
                          {item.authorName}
                        </Link>
                      )}
                      {item.publishedAt && (
                        <span className="font-mono text-[8px] text-white/15 ml-auto uppercase tracking-widest">
                          {new Date(item.publishedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                        </span>
                      )}
                    </div>
                    <h3 className="text-3xl md:text-4xl font-display font-light tracking-tight mb-8 text-white/90 group-hover:text-white transition-colors duration-500">
                      {item.title}
                    </h3>
                    <div className="font-serif text-[17px] leading-[2] text-white/60 max-w-3xl group-hover:text-white/75 transition-colors duration-500">
                      <ContentRenderer content={item.content} />
                    </div>
                    <div className="mt-10 pt-5 border-t border-white/[0.06] flex items-center justify-between">
                      <p className="font-serif text-xs italic text-white/25">
                        This piece grew in The Garden.
                      </p>
                      {item.authorId && (
                        <Link
                          href={`/writer/${item.authorId}`}
                          className="font-mono text-[9px] uppercase tracking-widest text-amber-200/30 hover:text-amber-200/60 transition-colors"
                          data-testid={`link-writer-profile-${item.id}`}
                        >
                          Visit Writer
                        </Link>
                      )}
                    </div>
                  </div>
                </MuseumFrame>
              ))}
            </div>
          ) : (
            <MuseumFrame index={0}>
              <div className="text-center py-16 space-y-6">
                <BookOpen size={32} className="mx-auto text-amber-200/20" />
                <span className="inline-block px-4 py-1.5 border border-amber-200/10 font-mono text-[9px] uppercase tracking-[0.3em] text-amber-200/30">
                  Awaiting First Exhibition
                </span>
                <h3 className="text-3xl md:text-4xl font-display font-light tracking-wide text-white/70">
                  The Gallery is Preparing
                </h3>
                <p className="max-w-lg mx-auto text-white/40 leading-relaxed font-serif italic text-lg">
                  Editors are reading the Gardens. When a piece stops them, they'll publish it here. The first works will appear soon.
                </p>
              </div>
            </MuseumFrame>
          )}
        </div>

        <footer className="border-t border-white/[0.04] py-12 text-center">
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/20">
            The Page Gallery Journal
          </p>
        </footer>
      </div>
    </div>
  );
}
