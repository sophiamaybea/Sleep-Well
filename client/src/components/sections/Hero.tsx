import { motion } from "framer-motion";
import { Section } from "@/components/ui/section";
import { content } from "@/data";
import tunnelTexture from "@/assets/tunnel-texture.png";

export default function Hero() {
  return (
    <Section id="section-1" className="bg-background text-primary">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <img 
          src={tunnelTexture} 
          alt="" 
          className="w-full h-full object-cover mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      </div>

      <div className="grid lg:grid-cols-12 gap-12 items-center relative z-10">
        <div className="lg:col-span-8 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="font-mono text-sm tracking-[0.2em] text-secondary-foreground mb-4 block">
              {content.hero.eyebrow}
            </span>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-bold leading-[0.85] tracking-tighter uppercase">
              Sleep<br/>
              <span className="text-secondary">Isn't</span><br/>
              A Luxury
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="max-w-xl font-mono text-lg md:text-xl leading-relaxed opacity-80"
          >
            {content.hero.subtitle}
          </motion.div>
        </div>

        <div className="lg:col-span-4 flex flex-col justify-end h-full pt-12 lg:pt-0">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="border-l-2 border-secondary pl-6 space-y-4"
          >
            <p className="font-display text-2xl md:text-3xl font-medium leading-tight">
              {content.hero.quote}
            </p>
            <p className="text-sm opacity-60 font-mono">
              REBOOTING THE SYSTEM
            </p>
          </motion.div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce"
      >
        <span className="font-mono text-xs uppercase tracking-widest opacity-50">Scroll to Explore</span>
      </motion.div>
    </Section>
  );
}
