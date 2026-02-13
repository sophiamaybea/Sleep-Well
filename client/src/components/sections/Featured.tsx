import { Section } from "@/components/ui/section";
import { content } from "@/data";
import { ContentRenderer } from "@/components/garden/RichEditor";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
const frameImg = "/images/gold-frame.png";

interface GalleryItem {
  id: string;
  title: string;
  content: string;
  genre: string;
  authorName: string | null;
  publishedAt: string | null;
}

function MuseumFrame({ children, index }: { children: React.ReactNode; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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
            <motion.div
              animate={{
                boxShadow: hovered
                  ? "inset 0 0 80px rgba(180, 140, 60, 0.04), inset 0 0 20px rgba(0,0,0,0.3)"
                  : "inset 0 0 40px rgba(0,0,0,0.4)"
              }}
              className="absolute inset-0 pointer-events-none"
              transition={{ duration: 0.6 }}
            />
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </div>
      </div>

      <motion.div
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        animate={hovered ? { y: [2, 0] } : {}}
      >
        <div className="h-px w-20 bg-gradient-to-r from-transparent via-amber-600/30 to-transparent" />
      </motion.div>
    </motion.div>
  );
}

function MuseumLabel({ genre, authorName, publishedAt }: { genre: string; authorName?: string | null; publishedAt?: string | null }) {
  const date = publishedAt ? new Date(publishedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : null;
  return (
    <div className="flex items-center gap-4 mb-8">
      <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-amber-200/30 px-3 py-1.5 border border-amber-200/10 bg-amber-200/[0.02]">
        {genre}
      </span>
      {authorName && (
        <span className="font-serif text-[11px] italic text-white/25">
          {authorName}
        </span>
      )}
      {date && (
        <span className="font-mono text-[8px] text-white/15 ml-auto uppercase tracking-widest">
          {date}
        </span>
      )}
    </div>
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
      <div className="max-w-5xl mx-auto w-full px-6 space-y-24">
        <div className="text-center space-y-6">
          <span className="font-mono text-[10px] tracking-[0.4em] text-amber-200/25 block uppercase">
            The Gallery
          </span>
          <h2 className="text-5xl md:text-6xl font-display font-light tracking-tight">
            {content.featured.title}
          </h2>
          <p className="text-lg font-serif italic text-white/40 max-w-xl mx-auto">
            {content.featured.subtitle}
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-600/20" />
            <div className="w-1.5 h-1.5 rotate-45 border border-amber-600/20" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-600/20" />
          </div>
        </div>

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
                  <MuseumLabel genre={item.genre} authorName={item.authorName} publishedAt={item.publishedAt} />
                  <h3 className="text-3xl md:text-4xl font-display font-light tracking-tight mb-8 text-white/90 group-hover:text-white transition-colors duration-500">
                    {item.title}
                  </h3>
                  <div className="font-serif text-lg leading-[2] text-white/55 max-w-3xl group-hover:text-white/70 transition-colors duration-500">
                    <ContentRenderer content={item.content} maxLength={600} />
                  </div>
                </div>
              </MuseumFrame>
            ))}
          </div>
        ) : (
          <MuseumFrame index={0}>
            <div className="text-center py-12 space-y-6">
              <span className="inline-block px-4 py-1.5 border border-amber-200/10 font-mono text-[9px] uppercase tracking-[0.3em] text-amber-200/30">
                Awaiting First Exhibition
              </span>
              <h3 className="text-3xl md:text-4xl font-display font-light tracking-wide text-white/70">
                {content.featured.emptyState.title}
              </h3>
              <p className="max-w-lg mx-auto text-white/40 leading-relaxed font-serif italic">
                {content.featured.emptyState.description}
              </p>
            </div>
          </MuseumFrame>
        )}
      </div>
    </Section>
  );
}
