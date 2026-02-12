import { Section } from "@/components/ui/section";
import { content } from "@/data";
import { motion, useScroll, useTransform, useMotionValue } from "framer-motion";

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
      id="hero" 
      className="bg-transparent text-primary cursor-none relative z-10"
    >
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
              <div className="flex items-center gap-4 mb-6">
                 <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                 <span className="font-mono text-xs tracking-[0.2em] text-secondary opacity-70 uppercase">
                  Open For Submissions
                </span>
              </div>
             
              <h1 className="text-5xl md:text-7xl lg:text-9xl font-display font-light leading-[0.9] tracking-tight text-white mix-blend-difference drop-shadow-2xl">
                A Room<br/>
                <span className="italic font-normal text-white/80">for</span><br/>
                Writing
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="max-w-xl text-lg md:text-2xl leading-relaxed font-serif opacity-80 backdrop-blur-sm p-6 border-l border-white/10 bg-white/5"
            >
              {content.hero.subtitle}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="flex gap-6 pt-4 pointer-events-auto"
            >
              {content.hero.links.map((link, i) => (
                <a 
                  key={i}
                  href={link.href}
                  className="font-mono text-sm uppercase tracking-widest border-b border-transparent hover:border-primary transition-all pb-1 hover:text-white"
                >
                  {link.text}
                </a>
              ))}
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
        <span className="font-mono text-[10px] uppercase tracking-widest opacity-50">Scroll to Enter</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-primary to-transparent" />
      </motion.div>
    </Section>
  );
}
