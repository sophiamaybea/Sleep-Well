import { Section } from "@/components/ui/section";
import { content } from "@/data";
import { motion } from "framer-motion";

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
          {/* Timeline Line */}
          <div className="absolute left-[28px] top-0 bottom-0 w-[1px] bg-white/5 hidden md:block" />

          <div className="space-y-24">
            {content.howItWorks.steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true, margin: "-100px" }}
                className="flex flex-col md:flex-row gap-12 relative group"
              >
                {/* Node */}
                <div className="flex-shrink-0 relative">
                  <div className="w-14 h-14 rounded-full border border-white/10 bg-[#0b101a] flex items-center justify-center font-mono text-sm relative z-10 group-hover:border-white/40 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-500">
                    {step.number}
                  </div>
                  {/* Active glow dot */}
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-full blur-md transition-opacity duration-500" />
                </div>

                <div className="space-y-4 pt-2 max-w-2xl">
                  <h3 className="text-3xl md:text-4xl font-display font-light group-hover:text-white transition-colors duration-300">
                    {step.title}
                  </h3>
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
