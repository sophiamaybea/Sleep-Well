import { Section } from "@/components/ui/section";
import { content } from "@/data";
import { motion } from "framer-motion";

export default function Overclock() {
  return (
    <Section id="section-4" className="bg-destructive text-destructive-foreground">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="order-2 lg:order-1 relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-destructive/50 via-transparent to-transparent opacity-50 blur-3xl" />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            className="border border-white/20 p-8 rounded-lg bg-black/20 backdrop-blur-sm"
          >
            <div className="grid grid-cols-2 gap-4 font-mono text-xs opacity-70">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="flex justify-between border-b border-white/10 pb-2">
                  <span>SYSTEM_CHECK_{i + 10}</span>
                  <span className={i > 8 ? "text-red-500 font-bold" : "text-green-400"}>
                    {i > 8 ? "OVERHEAT" : "OK"}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="order-1 lg:order-2 space-y-8">
          <span className="font-mono text-xs tracking-[0.2em] opacity-60 block">
            {content.overclock.eyebrow}
          </span>
          <h2 className="text-5xl md:text-7xl font-display font-bold leading-none tracking-tight">
            BE ON THE <br/>
            <span className="text-stroke text-transparent">CLOCK</span>
          </h2>
          <h3 className="text-xl font-mono uppercase tracking-widest border-l-4 border-white pl-4">
            {content.overclock.subtitle}
          </h3>
          <p className="text-xl leading-relaxed opacity-90">
            {content.overclock.text}
          </p>
          <div className="inline-block bg-white text-destructive font-bold px-4 py-2 uppercase tracking-widest text-sm animate-pulse">
            {content.overclock.warning}
          </div>
        </div>
      </div>
    </Section>
  );
}
