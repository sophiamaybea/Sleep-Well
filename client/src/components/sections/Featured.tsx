import { Section } from "@/components/ui/section";
import { content } from "@/data";
import { motion } from "framer-motion";

export default function Featured() {
  return (
    <Section id="featured" className="bg-card/50 text-primary">
      <div className="max-w-5xl mx-auto w-full space-y-16">
        <div className="grid md:grid-cols-2 gap-12 items-end border-b border-white/10 pb-12">
          <div className="space-y-4">
            <span className="font-mono text-xs tracking-[0.2em] opacity-60 block uppercase">
              02 — Current Exhibition
            </span>
            <h2 className="text-4xl md:text-6xl font-display font-light">
              {content.featured.title}
            </h2>
          </div>
          <p className="text-xl font-serif italic opacity-70 pb-2">
            {content.featured.subtitle}
          </p>
        </div>

        <div className="py-24 text-center space-y-8 border border-dashed border-white/10 rounded-lg bg-background/30 backdrop-blur-sm relative overflow-hidden">
          {/* Animated scan line */}
          <motion.div 
            className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ top: ["0%", "100%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />

          <h3 className="text-2xl font-display font-light tracking-wide">
            {content.featured.emptyState.title}
          </h3>
          <p className="max-w-xl mx-auto opacity-60 leading-relaxed font-serif px-6">
            {content.featured.emptyState.description}
          </p>
        </div>
      </div>
    </Section>
  );
}
