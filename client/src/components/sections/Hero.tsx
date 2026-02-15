import { useState, useEffect, useRef } from "react";
import { content } from "@/data";
import { motion, useMotionValue, useTransform, useSpring, useScroll } from "framer-motion";
import StarTitle from "@/components/StarTitle";
import collageSheet from "@assets/Untitled_design_(26)_1771134509762.png";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning, writer.";
  if (hour >= 12 && hour < 17) return "Good afternoon, writer.";
  if (hour >= 17 && hour < 21) return "Good evening, writer.";
  return "The night is yours, writer.";
}

function MagneticLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useSpring(0, { stiffness: 200, damping: 15 });
  const y = useSpring(0, { stiffness: 200, damping: 15 });

  function handleMove(e: React.MouseEvent) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.25);
    y.set((e.clientY - cy) * 0.25);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.a
      ref={ref}
      href={href}
      style={{ x, y }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={className}
    >
      {children}
    </motion.a>
  );
}

function WordReveal({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: delay + i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="inline-block mr-[0.3em]"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

const creatures = [
  { name: "frog", bgPos: "80% 5%", bgSize: "260%", size: 120, pos: "right-[5%] top-[5%]", rotate: 8, delay: 0.8, drift: [0, -30] as [number, number] },
  { name: "ladybug", bgPos: "5% 50%", bgSize: "300%", size: 110, pos: "left-[3%] top-[45%]", rotate: -10, delay: 1.1, drift: [0, -45] as [number, number] },
  { name: "mushroom", bgPos: "35% 30%", bgSize: "300%", size: 100, pos: "right-[10%] bottom-[25%]", rotate: 6, delay: 1.4, drift: [0, -25] as [number, number] },
  { name: "bee", bgPos: "65% 52%", bgSize: "280%", size: 120, pos: "left-[8%] bottom-[12%]", rotate: 12, delay: 1.0, drift: [0, -50] as [number, number] },
  { name: "apple", bgPos: "85% 88%", bgSize: "400%", size: 80, pos: "right-[18%] top-[40%]", rotate: -5, delay: 1.3, drift: [0, -35] as [number, number] },
  { name: "smallmush", bgPos: "3% 78%", bgSize: "500%", size: 55, pos: "left-[15%] top-[12%]", rotate: -14, delay: 1.6, drift: [0, -20] as [number, number] },
  { name: "splatters", bgPos: "15% 5%", bgSize: "350%", size: 70, pos: "left-[25%] top-[3%]", rotate: 0, delay: 0.9, drift: [0, -40] as [number, number] },
];

function FloatingCreature({ c, scrollYProgress }: { c: typeof creatures[0]; scrollYProgress: any }) {
  const y = useTransform(scrollYProgress, [0, 1], c.drift);
  return (
    <motion.div
      className={`absolute ${c.pos}`}
      initial={{ opacity: 0, scale: 0.4, rotate: c.rotate + 30 }}
      animate={{ opacity: 1, scale: 1, rotate: c.rotate }}
      transition={{ duration: 1.6, delay: c.delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ y, width: c.size, height: c.size }}
    >
      <div
        className="w-full h-full"
        style={{
          backgroundImage: `url(${collageSheet})`,
          backgroundPosition: c.bgPos,
          backgroundSize: c.bgSize,
          backgroundRepeat: "no-repeat",
          mixBlendMode: "screen",
        }}
      />
    </motion.div>
  );
}

export default function Hero() {
  const [greeting, setGreeting] = useState(getGreeting);
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  useEffect(() => {
    const interval = setInterval(() => setGreeting(getGreeting()), 60000);
    return () => clearInterval(interval);
  }, []);

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
    <div ref={heroRef} className="relative">
      <StarTitle />

      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[15]">
        {creatures.map((c) => (
          <FloatingCreature key={c.name} c={c} scrollYProgress={scrollYProgress} />
        ))}
      </div>

      <section id="hero-content" className="relative z-10 min-h-[50vh] pt-16 pb-12 px-6 md:px-12 lg:px-24">
        <div
          className="max-w-7xl mx-auto relative z-10"
          onMouseMove={handleMouseMove}
        >
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-8 space-y-8">
              <motion.div
                style={{ x: textX, y: textY }}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true, margin: "-50px" }}
              >
                <motion.div
                  className="flex items-center gap-4 mb-6"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                  <span className="font-mono text-xs tracking-[0.2em] text-secondary opacity-70 uppercase" data-testid="text-greeting">
                    {greeting}
                  </span>
                </motion.div>

                <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-light leading-[1.1] tracking-tight text-white/90 drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                  <WordReveal text="You don't submit." delay={0.1} />
                  <br />
                  <WordReveal text="You don't query." delay={0.4} />
                  <br />
                  <span className="italic font-medium text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]">
                    <WordReveal text="You just write." delay={0.7} />
                  </span>
                </h2>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0, duration: 0.8 }}
                viewport={{ once: true }}
                className="max-w-xl text-lg leading-relaxed font-serif opacity-80 backdrop-blur-sm p-6 bg-white/5 hover:bg-white/[0.07] transition-all duration-500"
              >
                {content.hero.subtitle}
              </motion.div>

              
            </div>
          </div>
        </div>
      </section>

      
    </div>
  );
}
