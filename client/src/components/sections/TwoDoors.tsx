import { Section } from "@/components/ui/section";
import { content } from "@/data";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function TwoDoors() {
  return (
    <Section id="two-doors" className="bg-transparent text-primary py-32">
      <div className="space-y-24 max-w-7xl w-full mx-auto px-6">
        <div className="text-center space-y-6">
          <span className="font-mono text-xs tracking-[0.3em] opacity-40 block uppercase">
            01 — Choose Your Path
          </span>
          <h2 className="text-5xl md:text-7xl font-display italic font-light tracking-tight">
            {content.twoDoors.title}
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 relative">
          {/* Central Divider */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent hidden lg:block" />

          {content.twoDoors.doors.map((door, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.8 }}
              viewport={{ once: true }}
              className="group relative"
            >
              {/* Card Container */}
              <div className="relative h-full flex flex-col p-8 md:p-12 transition-all duration-500 group-hover:-translate-y-2">
                
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-xl" />
                
                {/* Border Frame */}
                <div className="absolute inset-0 border border-white/5 rounded-xl transition-colors duration-500 group-hover:border-white/10" />

                <div className="relative z-10 space-y-8 flex-grow">
                  <div className="space-y-4">
                    <span className="font-mono text-xs tracking-widest text-secondary/60 uppercase block">
                      {door.subtitle}
                    </span>
                    <h3 className="text-4xl md:text-5xl font-display font-light group-hover:text-white transition-colors">
                      {door.title}
                    </h3>
                  </div>

                  <p className="text-lg md:text-xl opacity-70 leading-relaxed font-serif font-light">
                    {door.description}
                  </p>

                  <ul className="space-y-4 pt-4 border-t border-white/5">
                    {door.points.map((point, i) => (
                      <li key={i} className="flex gap-4 items-start text-sm font-mono opacity-60 group-hover:opacity-80 transition-opacity">
                        <span className="text-secondary opacity-40">✦</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                <a 
                  href={door.href}
                  className="relative z-10 flex items-center gap-4 mt-12 py-4 group/btn"
                >
                  <span className="font-mono text-xs uppercase tracking-widest opacity-60 group-hover/btn:opacity-100 transition-opacity">
                    {door.cta}
                  </span>
                  <span className="p-2 border border-white/10 rounded-full group-hover/btn:bg-white group-hover/btn:text-background transition-all duration-300">
                    <ArrowRight size={16} />
                  </span>
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}
