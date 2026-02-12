import { Section } from "@/components/ui/section";
import { content } from "@/data";
import { motion, useScroll, useTransform, useMotionTemplate, useMotionValue } from "framer-motion";
import tunnelTexture from "@/assets/tunnel-texture.png";
import { useEffect } from "react";

export default function Hero() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = (clientX - left) / width - 0.5;
    const y = (clientY - top) / height - 0.5;
    
    mouseX.set(x);
    mouseY.set(y);
  }

  const bgX = useTransform(mouseX, [-0.5, 0.5], ["-5%", "5%"]);
  const bgY = useTransform(mouseY, [-0.5, 0.5], ["-5%", "5%"]);
  const textX = useTransform(mouseX, [-0.5, 0.5], ["2%", "-2%"]);
  const textY = useTransform(mouseY, [-0.5, 0.5], ["2%", "-2%"]);

  return (
    <Section 
      id="section-1" 
      className="bg-background text-primary cursor-none"
    >
      <div 
        className="absolute inset-0 z-0 overflow-hidden" 
        onMouseMove={handleMouseMove}
      >
        <motion.div 
          style={{ x: bgX, y: bgY, scale: 1.1 }}
          className="absolute inset-0 opacity-30 pointer-events-none"
        >
          <img 
            src={tunnelTexture} 
            alt="" 
            className="w-full h-full object-cover mix-blend-screen"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-12 gap-12 items-center relative z-10 pointer-events-none">
        <div className="lg:col-span-8 space-y-8">
          <motion.div 
            style={{ x: textX, y: textY }}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-4 mb-4">
               <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
               <span className="font-mono text-sm tracking-[0.2em] text-secondary-foreground">
                SYSTEM ONLINE
              </span>
            </div>
           
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-bold leading-[0.85] tracking-tighter uppercase mix-blend-difference">
              Sleep<br/>
              <span className="text-secondary italic">Isn't</span><br/>
              A Luxury
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="max-w-xl font-mono text-lg md:text-xl leading-relaxed opacity-80 backdrop-blur-sm p-4 border-l border-primary/20"
          >
            {content.hero.subtitle}
          </motion.div>
        </div>

        <div className="lg:col-span-4 flex flex-col justify-end h-full pt-12 lg:pt-0">
          <motion.div
            style={{ x: useTransform(mouseX, [-0.5, 0.5], ["-5%", "5%"]) }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="border-l-2 border-secondary pl-6 space-y-4"
          >
            <p className="font-display text-2xl md:text-3xl font-medium leading-tight">
              {content.hero.quote}
            </p>
            <div className="flex items-center gap-2 text-sm opacity-60 font-mono">
              <span className="animate-spin text-secondary">☼</span>
              REBOOTING THE SYSTEM
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="font-mono text-[10px] uppercase tracking-widest opacity-50">Scroll to Initialize</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-primary to-transparent" />
      </motion.div>
    </Section>
  );
}
