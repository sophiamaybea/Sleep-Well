import { Section } from "@/components/ui/section";
import { content } from "@/data";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";

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
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const liftY = useSpring(0, { stiffness: 200, damping: 20 });

  const shineX = useTransform(mouseX, [0, 1], ["-100%", "200%"]);
  const shineOpacity = useTransform(liftY, [-6, 0], [1, 0]);

  function handleEnter() { liftY.set(-6); }
  function handleLeave() { liftY.set(0); mouseX.set(0.5); mouseY.set(0.5); }
  function handleMove(e: React.MouseEvent) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  }

  return (
    <motion.article
      ref={ref}
      style={{ y: liftY }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onMouseMove={handleMove}
      className={className}
      data-testid={testId}
    >
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden"
        style={{ opacity: shineOpacity }}
      >
        <motion.div
          className="absolute inset-y-0 w-[60px] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent"
          style={{ left: shineX }}
        />
      </motion.div>
      {children}
    </motion.article>
  );
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

        {gallery.length > 0 ? (
          <div className="grid gap-8">
            {gallery.map((item, i) => (
              <ShineCard
                key={item.id}
                testId={`card-gallery-${item.id}`}
                className="group relative border border-white/5 rounded-xl p-8 md:p-12 hover:border-white/15 hover:bg-white/[0.02] transition-all duration-500 cursor-default"
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
                      whileHover={{ scale: 1.05, borderColor: "rgba(255,255,255,0.2)" }}
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
                  <div className="font-serif text-lg leading-relaxed text-white/60 max-w-3xl whitespace-pre-wrap group-hover:text-white/70 transition-colors duration-300">
                    {item.content.length > 500
                      ? item.content.slice(0, 500) + "..."
                      : item.content}
                  </div>
                </motion.div>
              </ShineCard>
            ))}
          </div>
        ) : (
          <div className="relative w-full aspect-[16/9] md:aspect-[21/9] border border-white/10 bg-white/[0.02] backdrop-blur-sm overflow-hidden flex flex-col items-center justify-center p-12 text-center group hover:border-white/15 transition-colors duration-500">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <motion.div
              className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent shadow-[0_0_15px_rgba(255,255,255,0.2)]"
              animate={{ top: ["0%", "100%"], opacity: [0, 1, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
            <div className="relative z-10 space-y-6">
              <motion.span
                className="inline-block px-4 py-1 border border-white/10 rounded-full font-mono text-[10px] uppercase tracking-widest opacity-50 mb-4"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
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
            <div className="absolute top-4 left-4 w-2 h-2 border-t border-l border-white/20" />
            <div className="absolute top-4 right-4 w-2 h-2 border-t border-r border-white/20" />
            <div className="absolute bottom-4 left-4 w-2 h-2 border-b border-l border-white/20" />
            <div className="absolute bottom-4 right-4 w-2 h-2 border-b border-r border-white/20" />
          </div>
        )}
      </div>
    </Section>
  );
}
