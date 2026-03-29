import { Section } from "@/components/ui/section";
import { content } from "@/data";
import { motion, useSpring } from "framer-motion";
import { useState } from "react";
function HoverNode({ number }: { number: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="flex-shrink-0 relative cursor-default"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        animate={{
          scale: hovered ? 1.25 : 1,
          borderColor: hovered ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.1)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className="w-14 h-14 rounded-full border bg-background/60 backdrop-blur-sm flex items-center justify-center font-mono text-sm relative z-10"
      >
        {number}
      </motion.div>
      <motion.div
        animate={{
          opacity: hovered ? 0.2 : 0,
          scale: hovered ? 1.8 : 1,
        }}
        transition={{ duration: 0.4 }}
        className="absolute inset-0 bg-white rounded-full blur-lg"
      />
    </div>
  );
}
function AnimatedLine() {
  return (
    <div className="absolute left-[28px] top-0 bottom-0 w-[1px] hidden md:block overflow-hidden">
      <div className="w-full h-full bg-white/5" />
      <motion.div
        className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-transparent via-white/30 to-transparent"
        animate={{ top: ["-10%", "110%"] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "linear", repeatDelay: 0.5 }}
      />
    </div>
  );
}
export default function HowItWorks() {
  return (
    <Section id="how-it-works" className="bg-transparent text-primary py-32">
      <div className="max-w-5xl mx-auto w-full px-6 space-y-32">
        <div className="text-center space-y-6">
          <span className="font-mono text-xs tracking-[0.3em] opacity-70 block uppercase">
            03 — Process
          </span>
          <h2 className="text-5xl md:text-7xl font-display font-light tracking-normal">
            {content.howItWorks.title}
          </h2>
          <p className="text-lg font-mono text-secondary uppercase tracking-widest opacity-80">
            {content.howItWorks.subtitle}
          </p>
        </div>
        <div className="relative">
          <AnimatedLine />
          <div className="space-y-24">
            {content.howItWorks.steps.map((step: { number: string; title: string; description: string }, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                viewport={{ once: true, margin: "-100px" }}
                className="flex flex-col md:flex-row gap-12 relative group"
              >
                <HoverNode number={step.number} />
                <motion.div
                  className="space-y-4 pt-2 max-w-2xl"
                  whileHover={{ x: 8 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <h3 className="text-3xl md:text-4xl font-display font-light group-hover:text-white transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-lg opacity-80 leading-relaxed font-serif font-light group-hover:opacity-100 transition-opacity duration-300">
                    {step.description}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
