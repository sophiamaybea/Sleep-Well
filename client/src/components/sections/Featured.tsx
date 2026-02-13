import { Section } from "@/components/ui/section";
import { content } from "@/data";
import { ContentRenderer } from "@/components/garden/RichEditor";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";

interface GalleryItem {
  id: string;
  title: string;
  content: string;
  genre: string;
  authorName: string | null;
  publishedAt: string | null;
}

function ShineCard({ children, className, testId }: { children: React.ReactNode; className?: string; testId?: string }) {
  const ref = useRef<HTMLElement>(null);
  const [hovered, setHovered] = useState(false);
  const mouseX = useMotionValue(0.5);

  const shineX = useTransform(mouseX, [0, 1], ["-20%", "120%"]);

  function handleMove(e: React.MouseEvent) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width);
  }

  return (
    <motion.article
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); mouseX.set(0.5); }}
      onMouseMove={handleMove}
      whileHover={{ y: -10, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className={className}
      data-testid={testId}
    >
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="absolute inset-y-0 w-[100px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent blur-sm"
          style={{ left: shineX }}
        />
      </motion.div>
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-xl"
        animate={{
          boxShadow: hovered
            ? "0 20px 60px rgba(255,255,255,0.05), 0 0 30px rgba(255,255,255,0.03)"
            : "0 0 0 rgba(0,0,0,0)"
        }}
        transition={{ duration: 0.4 }}
      />
      {children}
    </motion.article>
  );
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

  return (
    <Section id="featured" className="bg-transparent text-primary py-32">
      <div className="max-w-6xl mx-auto w-full px-6 space-y-20">
        <div className="grid md:grid-cols-2 gap-12 items-end border-b border-white/5 pb-12">
          <div className="space-y-4">
            <span className="font-mono text-xs tracking-[0.3em] opacity-40 block uppercase">
              02 — Current Exhibition
            </span>
            <h2 className="text-5xl md:text-6xl font-display font-light tracking-tight">
              {content.featured.title}
            </h2>
          </div>
          <p className="text-xl font-serif italic opacity-60 pb-2 md:text-right">
            {content.featured.subtitle}
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-8 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="border border-white/[0.05] rounded-xl p-8 md:p-12 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-5 w-16 bg-white/[0.06] rounded-full" />
                  <div className="h-4 w-24 bg-white/[0.04] rounded" />
                </div>
                <div className="h-8 w-72 bg-white/[0.06] rounded-lg" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-white/[0.04] rounded" />
                  <div className="h-4 w-full bg-white/[0.04] rounded" />
                  <div className="h-4 w-2/3 bg-white/[0.04] rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : gallery.length > 0 ? (
          <div className="grid gap-8">
            {gallery.map((item, i) => (
              <ShineCard
                key={item.id}
                testId={`card-gallery-${item.id}`}
                className="group relative border border-white/5 rounded-xl p-8 md:p-12 hover:border-white/25 hover:bg-white/[0.03] transition-all duration-300 cursor-default"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <motion.span
                      className="font-mono text-[10px] uppercase tracking-widest text-white/30 px-3 py-1 border border-white/10 rounded-full"
                      whileHover={{ scale: 1.1, borderColor: "rgba(255,255,255,0.3)", color: "rgba(255,255,255,0.6)" }}
                    >
                      {item.genre}
                    </motion.span>
                    {item.authorName && (
                      <span className="font-mono text-[10px] text-white/20">
                        by {item.authorName}
                      </span>
                    )}
                  </div>
                  <h3 className="text-3xl md:text-4xl font-display font-light tracking-tight mb-6 group-hover:text-white transition-colors duration-300">
                    {item.title}
                  </h3>
                  <div className="font-serif text-lg leading-relaxed text-white/60 max-w-3xl group-hover:text-white/80 transition-colors duration-300">
                    <ContentRenderer content={item.content} maxLength={500} />
                  </div>
                </motion.div>
              </ShineCard>
            ))}
          </div>
        ) : (
          <motion.div
            className="relative w-full aspect-[16/9] md:aspect-[21/9] border border-white/10 bg-white/[0.02] backdrop-blur-sm overflow-hidden flex flex-col items-center justify-center p-12 text-center group cursor-default"
            whileHover={{ borderColor: "rgba(255,255,255,0.2)", scale: 1.005 }}
            transition={{ duration: 0.4 }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <motion.div
              className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              animate={{ top: ["0%", "100%"], opacity: [0, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            <div className="relative z-10 space-y-6">
              <motion.span
                className="inline-block px-4 py-1 border border-white/10 rounded-full font-mono text-[10px] uppercase tracking-widest mb-4"
                animate={{ opacity: [0.3, 0.7, 0.3], borderColor: ["rgba(255,255,255,0.1)", "rgba(255,255,255,0.25)", "rgba(255,255,255,0.1)"] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                Coming Soon
              </motion.span>
              <h3 className="text-3xl md:text-4xl font-display font-light tracking-wide opacity-80">
                {content.featured.emptyState.title}
              </h3>
              <p className="max-w-lg mx-auto opacity-50 leading-relaxed font-serif">
                {content.featured.emptyState.description}
              </p>
            </div>
            <div className="absolute top-4 left-4 w-3 h-3 border-t border-l border-white/20 group-hover:border-white/40 group-hover:w-5 group-hover:h-5 transition-all duration-500" />
            <div className="absolute top-4 right-4 w-3 h-3 border-t border-r border-white/20 group-hover:border-white/40 group-hover:w-5 group-hover:h-5 transition-all duration-500" />
            <div className="absolute bottom-4 left-4 w-3 h-3 border-b border-l border-white/20 group-hover:border-white/40 group-hover:w-5 group-hover:h-5 transition-all duration-500" />
            <div className="absolute bottom-4 right-4 w-3 h-3 border-b border-r border-white/20 group-hover:border-white/40 group-hover:w-5 group-hover:h-5 transition-all duration-500" />
          </motion.div>
        )}
      </div>
    </Section>
  );
}
