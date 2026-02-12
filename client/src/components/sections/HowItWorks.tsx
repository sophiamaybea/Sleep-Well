import { Section } from "@/components/ui/section";
import { content } from "@/data";
import { motion } from "framer-motion";

export default function HowItWorks() {
  return (
    <Section id="how-it-works" className="bg-background text-primary">
      <div className="max-w-6xl mx-auto w-full space-y-24">
        <div className="text-center space-y-6">
          <span className="font-mono text-xs tracking-[0.2em] opacity-60 block uppercase">
            03 — Process
          </span>
          <h2 className="text-4xl md:text-6xl font-display font-light">
            {content.howItWorks.title}
          </h2>
          <p className="text-xl font-mono text-secondary uppercase tracking-widest opacity-70">
            {content.howItWorks.subtitle}
          </p>
        </div>

        <div className="grid gap-12 md:gap-24 relative">
          {/* Connecting Line */}
          <div className="absolute left-[27px] top-8 bottom-8 w-[1px] bg-white/10 hidden md:block" />

          {content.howItWorks.steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row gap-8 md:gap-16 relative"
            >
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-full border border-white/20 bg-background flex items-center justify-center font-mono text-sm relative z-10">
                  {step.number}
                </div>
              </div>

              <div className="space-y-4 pt-2 max-w-2xl">
                <h3 className="text-2xl md:text-3xl font-display font-light">
                  {step.title}
                </h3>
                <p className="text-lg opacity-70 leading-relaxed font-serif">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}
