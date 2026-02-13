import { Section } from "@/components/ui/section";
import { content } from "@/data";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef } from "react";

function HoverNode({ number }: { number: string }) {
  const scale = useSpring(1, { stiffness: 300, damping: 15 });
  const glow = useSpring(0, { stiffness: 200, damping: 20 });

  return (
    <div
      className="flex-shrink-0 relative cursor-default"
      onMouseEnter={() => { scale.set(1.15); glow.set(1); }}
      onMouseLeave={() => { scale.set(1); glow.set(0); }}
    >
      <motion.div
        style={{ scale }}
        className="w-14 h-14 rounded-full border border-white/10 bg-background/60 backdrop-blur-sm flex items-center justify-center font-mono text-sm relative z-10 group-hover:border-white/40 transition-all duration-500"
      >
        {number}
      </motion.div>
      <motion.div
        style={{ opacity: glow }}
        className="absolute inset-0 bg-white rounded-full blur-md"
      />
    </div>
  );
}

function AnimatedLine() {
  return (
    <div className="absolute left-[28px] top-0 bottom-0 w-[1px] hidden md:block overflow-hidden">
      <div className="w-full h-full bg-white/5" />
      <motion.div
        className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent"
        animate={{ top: ["-10%", "110%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
      />
    </div>
  );
}

export default function HowItWorks() {
  return (
    <Section id="how-it-works" className="bg-transparent text-primary py-32">
      <div className="max-w-5xl mx-auto w-full px-6 space-y-32">
        <div className="text-center space-y-6">
          <span className="font-mono text-xs tracking-[0.3em] opacity-40 block uppercase">
            03 — Process
          </span>
          <h2 className="text-5xl md:text-7xl font-display font-light tracking-tight">
            {content.howItWorks.title}
          </h2>
          <p className="text-lg font-mono text-secondary uppercase tracking-widest opacity-50">
            {content.howItWorks.subtitle}
          </p>
        </div>

        <div className="relative">
          <AnimatedLine />

          <div className="space-y-24">
            {content.howItWorks.steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                viewport={{ once: true, margin: "-100px" }}
                className="flex flex-col md:flex-row gap-12 relative group"
              >
                <HoverNode number={step.number} />

                <div className="space-y-4 pt-2 max-w-2xl">
                  <motion.h3
                    className="text-3xl md:text-4xl font-display font-light group-hover:text-white transition-colors duration-300"
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {step.title}
                  </motion.h3>
                  <p className="text-lg opacity-60 leading-relaxed font-serif font-light group-hover:opacity-80 transition-opacity duration-300">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
