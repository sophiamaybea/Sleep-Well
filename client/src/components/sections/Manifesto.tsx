import { Section } from "@/components/ui/section";
import { content } from "@/data";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

function WordReveal({ text, delay = 0 }: { text: string; delay?: number }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + i * 0.03, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="inline-block mr-[0.3em]"
        >
          {word}
        </motion.span>
      ))}
    </>
  );
}

export default function Manifesto() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const bgTextOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 0.02, 0.02, 0]);

  return (
    <Section id="manifesto" className="bg-transparent text-primary relative overflow-hidden py-40">
      <motion.div
        style={{ y, opacity: bgTextOpacity }}
        className="absolute top-0 left-0 w-full h-[120%] pointer-events-none select-none font-display text-[12vw] leading-none break-all mix-blend-overlay text-center"
      >
        WRITING WRITING WRITING WRITING WRITING WRITING
      </motion.div>

      <div ref={containerRef} className="max-w-5xl mx-auto w-full px-6 relative z-10 space-y-24">
        <motion.div
          className="space-y-8 border-l-2 border-white/10 pl-8 md:pl-16 py-4 hover:border-white/20 transition-colors duration-500"
          whileHover={{ paddingLeft: "4.5rem" }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <span className="font-mono text-xs tracking-[0.3em] opacity-40 block uppercase">
            04 — Philosophy
          </span>
          <h2 className="text-5xl md:text-7xl font-display italic font-light leading-[1.1]">
            <WordReveal text={content.manifesto.title} />
          </h2>
          <p className="text-xl md:text-3xl font-serif opacity-80 leading-relaxed font-light text-white/90">
            <WordReveal text={content.manifesto.subtitle} delay={0.3} />
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-16 md:gap-24 text-lg md:text-xl font-serif leading-loose opacity-70 font-light">
          <div className="space-y-12">
            {content.manifesto.text.slice(0, 3).map((paragraph, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ opacity: 1, x: 4 }}
                className="hover:text-white/90 transition-colors duration-300 cursor-default"
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
                transition={{ delay: (i + 3) * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ opacity: 1, x: 4 }}
                className="hover:text-white/90 transition-colors duration-300 cursor-default"
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
