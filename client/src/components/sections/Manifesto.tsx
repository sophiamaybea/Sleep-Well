import { Section } from "@/components/ui/section";
import { content } from "@/data";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function Manifesto() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <Section id="manifesto" className="bg-[#0e141f] text-primary relative overflow-hidden py-40">
      
      {/* Background typographic texture - Parallax */}
      <motion.div 
        style={{ y }}
        className="absolute top-0 left-0 w-full h-[120%] opacity-[0.02] pointer-events-none select-none font-display text-[12vw] leading-none break-all mix-blend-overlay text-center"
      >
        WRITING WRITING WRITING WRITING WRITING WRITING
      </motion.div>

      <div ref={containerRef} className="max-w-5xl mx-auto w-full px-6 relative z-10 space-y-24">
        <div className="space-y-8 border-l border-white/10 pl-8 md:pl-16 py-4">
          <span className="font-mono text-xs tracking-[0.3em] opacity-40 block uppercase">
            04 — Philosophy
          </span>
          <h2 className="text-5xl md:text-7xl font-display italic font-light leading-[1.1]">
            {content.manifesto.title}
          </h2>
          <p className="text-xl md:text-3xl font-serif opacity-80 leading-relaxed font-light text-white/90">
            {content.manifesto.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-16 md:gap-24 text-lg md:text-xl font-serif leading-loose opacity-70 font-light">
          <div className="space-y-12">
            {content.manifesto.text.slice(0, 3).map((paragraph, i) => (
              <motion.p 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                {paragraph}
              </motion.p>
            ))}
          </div>
          <div className="space-y-12 md:pt-24">
            {content.manifesto.text.slice(3).map((paragraph, i) => (
              <motion.p 
                key={i + 3} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: (i + 3) * 0.1 }}
                viewport={{ once: true }}
              >
                {paragraph}
              </motion.p>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
