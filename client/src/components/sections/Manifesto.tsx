import { Section } from "@/components/ui/section";
import { content } from "@/data";
import { motion } from "framer-motion";

export default function Manifesto() {
  return (
    <Section id="manifesto" className="bg-[#0b101a] text-primary relative overflow-hidden">
      {/* Background typographic texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none font-display text-9xl leading-none break-all mix-blend-overlay">
        WRITINGWRITINGWRITINGWRITINGWRITING
      </div>

      <div className="max-w-4xl mx-auto w-full space-y-16 relative z-10">
        <div className="space-y-6 border-l-2 border-white/10 pl-8 md:pl-12">
          <span className="font-mono text-xs tracking-[0.2em] opacity-60 block uppercase">
            04 — Philosophy
          </span>
          <h2 className="text-4xl md:text-6xl font-display italic font-light">
            {content.manifesto.title}
          </h2>
          <p className="text-xl md:text-2xl font-serif opacity-90 leading-relaxed">
            {content.manifesto.subtitle}
          </p>
        </div>

        <div className="space-y-8 text-lg md:text-xl font-serif leading-loose opacity-80 text-justify columns-1 md:columns-2 gap-12 [column-fill:balance]">
          {content.manifesto.text.map((paragraph, i) => (
            <motion.p 
              key={i} 
              className="mb-8 break-inside-avoid"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              {paragraph}
            </motion.p>
          ))}
        </div>
      </div>
    </Section>
  );
}
