import { Section } from "@/components/ui/section";
import { content } from "@/data";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function Tips() {
  return (
    <Section id="section-7" className="bg-primary text-primary-foreground min-h-screen">
      <div className="grid lg:grid-cols-12 gap-12 h-full">
        <div className="lg:col-span-4 space-y-8 sticky top-24 self-start">
          <span className="font-mono text-xs tracking-[0.2em] opacity-60 block">
            {content.tips.eyebrow}
          </span>
          <h2 className="text-5xl md:text-6xl font-display font-bold leading-snug">
            IT'S TIME <br/>TO LEARN
          </h2>
          <p className="text-xl font-mono border-t border-primary-foreground/20 pt-8 opacity-80">
            {content.tips.subtitle}
          </p>
        </div>

        <div className="lg:col-span-8 grid md:grid-cols-2 gap-6">
          {content.tips.list.map((tip, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-8 bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-6">
                <span className="font-mono text-3xl font-bold opacity-30">
                  {tip.number}
                </span>
                <div className="p-2 bg-green-100 text-green-700 rounded-full">
                  <Check size={16} />
                </div>
              </div>
              <h3 className="text-xl font-display font-bold mb-3 uppercase tracking-normal">
                {tip.title}
              </h3>
              <p className="opacity-70 leading-relaxed">
                {tip.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}
