import { Section } from "@/components/ui/section";
import { content } from "@/data";
import { motion } from "framer-motion";

export default function Pills() {
  return (
    <Section id="section-2" className="bg-primary text-primary-foreground">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <div className="space-y-6">
          <span className="font-mono text-xs tracking-[0.2em] uppercase opacity-60">
            {content.pills.eyebrow}
          </span>
          <h2 className="text-5xl md:text-7xl font-display font-bold leading-none tracking-tight">
            PILLS <br/>
            <span className="text-stroke text-transparent">THE SHORTCUT</span><br/>
            TRAP
          </h2>
        </div>
        
        <div className="space-y-8">
          <p className="text-xl md:text-2xl font-light leading-relaxed">
            {content.pills.text}
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-background text-primary rounded-full font-mono text-sm uppercase tracking-widest hover:bg-secondary transition-colors"
          >
            {content.pills.cta}
          </motion.button>
        </div>
      </div>
    </Section>
  );
}
