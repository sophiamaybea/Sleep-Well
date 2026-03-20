import { Section } from "@/components/ui/section";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowRight, BookOpen } from "lucide-react";

const frameImg = "/images/gold-frame.png";

interface GalleryItem {
  id: string;
  title: string;
  genre: string;
  authorName: string | null;
}

export default function Featured() {
  const { data: gallery = [] } = useQuery<GalleryItem[]>({
    queryKey: ["/api/gallery"],
    queryFn: async () => {
      const res = await fetch("/api/gallery");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const genres = [...new Set(gallery.map((item) => item.genre).filter(Boolean))];

  return (
    <Section id="featured" className="bg-transparent text-primary py-40 relative">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 60%, rgba(196,162,77,0.04) 0%, transparent 55%)" }} />
      <div className="max-w-4xl mx-auto w-full px-6 space-y-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
          className="text-center space-y-6"
        >
          <motion.span
            className="font-mono text-[10px] tracking-[0.4em] text-amber-200 block uppercase"
            initial={{ opacity: 0, letterSpacing: "0.2em" }}
            whileInView={{ opacity: 1, letterSpacing: "0.4em" }}
            transition={{ duration: 1.2 }}
            viewport={{ once: true }}
          >
            Latest
          </motion.span>
          <h2 className="text-5xl md:text-6xl font-display font-light tracking-normal">
            From the Journal
          </h2>
          <p className="font-serif text-[13px] text-white tracking-wide mt-2">
            Published stories and poems, selected by our editors
          </p>

          <motion.div
            className="flex items-center justify-center gap-4 pt-2"
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-600/40" />
            <div className="w-1.5 h-1.5 rotate-45 border border-amber-600/40" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-600/40" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Link href="/in-bloom" data-testid="link-read-journal">
            <div className="relative group cursor-pointer">
              <div className="hidden" />
              <div className="relative relative">
                <div
                  className="relative"
                  style={{
                    /* removed */
                    borderWidth: "0px",
                    borderStyle: "solid",
                  }}
                >
                  <div className="relative py-16 px-8 md:px-16">
                    <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "none" }} />
                    <div className="relative z-10 text-center space-y-8">
                      <BookOpen size={36} className="mx-auto text-amber-200/90 group-hover:text-amber-200 transition-colors duration-500" />

                      {gallery.length > 0 ? (
                        <>
                          <div className="space-y-3">
                            <p className="font-display text-2xl md:text-3xl font-light text-white group-hover:text-white transition-colors duration-500 italic">
                              Now Reading
                            </p>
                            <p className="font-serif text-white text-sm">
                              Poetry, fiction, essays, and fragments — each one discovered in a writer's garden
                            </p>
                          </div>

                          {genres.length > 0 && (
                            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                              {genres.slice(0, 4).map((genre) => (
                                <span
                                  key={genre}
                                  className="font-mono text-[8px] uppercase tracking-[0.2em] text-amber-200 px-3 py-1.5 border border-amber-200/20 bg-amber-200/[0.04]"
                                >
                                  {genre}
                                </span>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="space-y-3">
                          <p className="font-display text-2xl md:text-3xl font-light text-white italic">
                            Awaiting First Bloom
                          </p>
                          <p className="font-serif text-white text-sm max-w-md mx-auto">
                            Editors are reading the Gardens. When a piece blooms, it will appear here.
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-center gap-3 pt-4">
                        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber-200 group-hover:text-amber-200/90 transition-colors duration-500">
                          Read Published Work
                        </span>
                        <ArrowRight size={16} className="text-amber-200 group-hover:text-amber-200/80 group-hover:translate-x-1 transition-all duration-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </Section>
  );
}
