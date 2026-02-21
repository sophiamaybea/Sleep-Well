import { useState, useEffect, useRef } from "react";
import { content } from "@/data";
import { motion, useMotionValue, useTransform, useSpring, useScroll } from "framer-motion";
import StarTitle from "@/components/StarTitle";
import collageSheet from "@assets/Untitled_design_(26)_1771134509762.png";
import { Link } from "wouter";

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
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

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

      <section id="hero-content" className="relative z-10 min-h-[50vh] pt-[60vh] pb-12 px-6 md:px-12 lg:px-24">
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
                <h2 className="text-4xl md:text-5xl lg:text-7xl font-display font-light leading-[1.1] tracking-normal text-white/90 drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                  <motion.span
                    initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                    whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    viewport={{ once: true }}
                    className="block italic"
                    data-testid="text-hero-title"
                  >
                    The Page Gallery Journal
                  </motion.span>
                </h2>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                viewport={{ once: true }}
                className="max-w-xl text-xl md:text-2xl leading-relaxed font-serif italic text-white/60"
                data-testid="text-hero-hook"
              >
                We are a journal, and we tend to a garden.
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.8 }}
                viewport={{ once: true }}
                className="flex flex-wrap items-center gap-6 pt-4"
              >
                <Link
                  href="/in-bloom"
                  className="px-10 py-5 bg-white text-[#0d1e2d] font-mono text-sm uppercase tracking-[0.2em] hover:bg-white/90 transition-all duration-300 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.1)] font-bold"
                  data-testid="cta-read-journal"
                >
                  Read the Journal
                </Link>
                <Link
                  href="/garden"
                  className="px-8 py-4 bg-white/[0.06] border border-white/20 backdrop-blur-sm font-mono text-sm uppercase tracking-widest text-white/80 hover:bg-white/12 hover:text-white transition-all duration-300 rounded-full"
                  data-testid="cta-start-writing"
                >
                  Start Writing
                </Link>
                <Link
                  href="/about"
                  className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40 hover:text-white/70 transition-colors border-b border-transparent hover:border-white/20 pb-1 ml-2"
                  data-testid="cta-about-us"
                >
                  About Us
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
