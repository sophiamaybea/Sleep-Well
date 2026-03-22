import { Section } from "@/components/ui/section";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

interface GalleryItem {
  id: string;
  title: string;
  genre: string;
  authorName: string | null;
  content: string | null;
}

function getExcerpt(content: string | null, maxLen = 120): string {
  if (!content) return "";
  const plain = content.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  return plain.length > maxLen ? plain.slice(0, maxLen).trimEnd() + "\u2026" : plain;
}

export default function Featured() {
  const { data: gallery = [], isLoading } = useQuery<GalleryItem[]>({
    queryKey: ["/api/gallery"],
    queryFn: async () => {
      const res = await fetch("/api/gallery");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const featured = gallery.slice(0, 3);

  return (
    <Section id="featured" className="bg-transparent text-primary py-32 relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 60%, rgba(196,162,77,0.04) 0%, transparent 55%)" }}
      />
      <div className="max-w-4xl mx-auto w-full px-6 space-y-16 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 40, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
          className="text-center space-y-6"
        >
          <motion.span
            className="font-sans text-[length:var(--text-label)] tracking-[0.06em] text-amber-200 block uppercase"
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
          <p className="font-sans text-[length:var(--text-small)] text-white/70 tracking-wide mt-2">
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

        {/* Piece cards */}
        {isLoading ? (
          <div className="space-y-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="animate-pulse border border-white/5 rounded-sm p-6 space-y-3">
                <div className="h-3 w-20 bg-white/10 rounded" />
                <div className="h-6 w-2/3 bg-white/10 rounded" />
                <div className="h-4 w-full bg-white/5 rounded" />
                <div className="h-3 w-24 bg-white/10 rounded" />
              </div>
            ))}
          </div>
        ) : featured.length === 0 ? null : (
          <div className="space-y-px">
            {featured.map((piece, i) => (
              <motion.div
                key={piece.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
              >
                <Link href={`/piece/${piece.id}`}>
                  <div className="group border-t border-white/8 py-7 px-2 flex flex-col md:flex-row md:items-start gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors">
                    {/* Genre + index */}
                    <div className="flex-shrink-0 w-28">
                      <span className="font-sans text-[length:var(--text-label)] tracking-[0.06em] text-amber-300/60 uppercase">
                        {piece.genre || "Piece"}
                      </span>
                    </div>
                    {/* Title + excerpt */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <h3 className="font-display text-xl md:text-2xl font-light text-white group-hover:text-amber-100 transition-colors leading-snug">
                        {piece.title}
                      </h3>
                      {piece.content && (
                        <p className="font-sans text-[length:var(--text-small)] text-white/40 leading-relaxed line-clamp-2">
                          {getExcerpt(piece.content, 140)}
                        </p>
                      )}
                    </div>
                    {/* Author + arrow */}
                    <div className="flex-shrink-0 flex items-center gap-3 md:pt-1">
                      {piece.authorName && (
                        <span className="font-sans text-[length:var(--text-label)] text-white/30 tracking-wide">
                          {piece.authorName}
                        </span>
                      )}
                      <ArrowRight className="w-3.5 h-3.5 text-amber-600/40 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
            <div className="border-t border-white/8" />
          </div>
        )}

        {/* Read all CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="flex justify-center pt-4"
        >
          <Link href="/in-bloom">
            <button className="flex items-center gap-2 font-sans text-[length:var(--text-label)] tracking-[0.3em] text-amber-200/70 hover:text-amber-200 transition-colors uppercase border border-amber-600/20 hover:border-amber-600/50 px-6 py-3 rounded-sm">
              Read Published Work
              <ArrowRight className="w-3 h-3" />
            </button>
          </Link>
        </motion.div>
      </div>
    </Section>
  );
}
