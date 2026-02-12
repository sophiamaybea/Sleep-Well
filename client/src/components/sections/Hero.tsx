import { Section } from "@/components/ui/section";
import { content } from "@/data";
import { motion, useScroll, useTransform, useMotionValue } from "framer-motion";
import StarTunnel from "@/components/StarTunnel";

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

  const textX = useTransform(mouseX, [-0.5, 0.5], ["2%", "-2%"]);
  const textY = useTransform(mouseY, [-0.5, 0.5], ["2%", "-2%"]);

  return (
    <Section 
      id="section-1" 
      className="bg-background text-primary cursor-none"
    >
      {/* 3D Star Tunnel Background */}
      <StarTunnel />
      
      {/* Gradient Overlays for depth */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-background via-transparent to-background opacity-80" />
      <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />

      <div 
        className="absolute inset-0 z-10" 
        onMouseMove={handleMouseMove}
      >
        <div className="grid lg:grid-cols-12 gap-12 items-center relative h-full px-6 md:px-12 lg:px-24">
          <div className="lg:col-span-8 space-y-8 pointer-events-none">
            <motion.div 
              style={{ x: textX, y: textY }}
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center gap-4 mb-4">
                 <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                 <span className="font-mono text-sm tracking-[0.2em] text-secondary-foreground">
                  SYSTEM ONLINE
                </span>
              </div>
             
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-bold leading-[0.85] tracking-tighter uppercase mix-blend-difference drop-shadow-2xl">
                Sleep<br/>
                <span className="text-secondary italic">Isn't</span><br/>
                A Luxury
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="max-w-xl font-mono text-lg md:text-xl leading-relaxed opacity-90 backdrop-blur-sm p-6 border-l-2 border-primary/20 bg-background/20"
            >
              {content.hero.subtitle}
            </motion.div>
          </div>

          <div className="lg:col-span-4 flex flex-col justify-end h-full pt-12 lg:pt-0 pointer-events-none">
            <motion.div
              style={{ x: useTransform(mouseX, [-0.5, 0.5], ["-5%", "5%"]) }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="border-l-2 border-secondary pl-6 space-y-4"
            >
              <p className="font-display text-2xl md:text-3xl font-medium leading-tight text-white/90">
                {content.hero.quote}
              </p>
              <div className="flex items-center gap-2 text-sm opacity-60 font-mono text-secondary">
                <span className="animate-spin">☼</span>
                REBOOTING THE SYSTEM
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20 pointer-events-none"
      >
        <span className="font-mono text-[10px] uppercase tracking-widest opacity-50">Scroll to Initialize</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-primary to-transparent" />
      </motion.div>
    </Section>
  );
}
