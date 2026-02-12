import { Section } from "@/components/ui/section";
import { content } from "@/data";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Layers() {
  return (
    <Section id="section-6" className="bg-background text-primary">
      <div className="max-w-6xl mx-auto w-full space-y-16">
        <div className="text-center space-y-4">
          <span className="font-mono text-xs tracking-[0.2em] opacity-60 block">
            {content.layers.eyebrow}
          </span>
          <h2 className="text-4xl md:text-6xl font-display font-bold">
            {content.layers.title}
          </h2>
        </div>

        <div className="grid gap-4">
          {content.layers.steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden"
            >
              <div className={cn(
                "p-8 md:p-12 border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors rounded-lg",
                "flex flex-col md:flex-row md:items-center gap-6 md:gap-12"
              )}>
                <div className="flex-shrink-0 w-16 h-16 md:w-24 md:h-24 rounded-full border border-primary/30 flex items-center justify-center font-display text-2xl md:text-3xl font-bold bg-background text-primary group-hover:scale-110 transition-transform">
                  0{index + 1}
                </div>
                
                <div className="space-y-2 flex-grow">
                  <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4">
                    <h3 className="text-2xl md:text-3xl font-display font-bold uppercase">
                      {step.title}
                    </h3>
                    <span className="font-mono text-sm text-secondary uppercase tracking-widest">
                      {step.subtitle}
                    </span>
                  </div>
                  <p className="text-lg opacity-80 max-w-2xl">
                    {step.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}
