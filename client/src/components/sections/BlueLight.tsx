import { Section } from "@/components/ui/section";
import { content } from "@/data";
import { motion } from "framer-motion";

export default function BlueLight() {
  return (
    <Section id="section-5" className="bg-[#000033] text-blue-200">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent opacity-50 blur-3xl pointer-events-none" />
      
      <div className="max-w-5xl mx-auto text-center space-y-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-4"
        >
          <span className="font-mono text-xs tracking-[0.2em] text-blue-400 block">
            {(content as any).blueLight.eyebrow}
          </span>
          <h2 className="text-4xl md:text-6xl font-display font-bold text-white drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            {(content as any).blueLight.title}
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 text-left">
          <div className="space-y-6 border-l border-blue-500/30 pl-8">
            <h3 className="text-lg font-mono text-blue-400 uppercase tracking-widest">
              {(content as any).blueLight.subtitle}
            </h3>
            <p className="text-xl leading-relaxed text-blue-100/80">
              {(content as any).blueLight.text}
            </p>
          </div>
          
          <div className="flex items-center justify-center">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="relative p-8 border border-blue-500/20 bg-blue-900/10 backdrop-blur-md rounded-2xl"
            >
              <p className="font-display text-3xl md:text-4xl italic font-light text-center">
                {(content as any).blueLight.quote}
              </p>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-20 -z-10" />
            </motion.div>
          </div>
        </div>
      </div>
    </Section>
  );
}
