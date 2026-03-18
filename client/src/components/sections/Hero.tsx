import { useRef } from "react";
import { motion, useMotionValue, useTransform, useScroll } from "framer-motion";
import StarTitle from "@/components/StarTitle";
import { Link } from "wouter";

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
                <h2 className="text-4xl md:text-5xl lg:text-7xl font-display font-light leading-[1.1] tracking-normal text-white drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]">
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
                className="max-w-xl text-xl md:text-2xl leading-relaxed font-serif italic text-white"
                data-testid="text-hero-hook"
              >
                A literary journal for writing that lingers.
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
                  className="px-8 py-4 bg-white/[0.06] border border-white/20 backdrop-blur-sm font-mono text-sm uppercase tracking-widest text-white hover:bg-white/12 hover:text-white transition-all duration-300 rounded-full"
                  data-testid="cta-start-writing"
                >
                  Start Writing
                </Link>
                <Link
                  href="/about"
                  className="font-mono text-[10px] uppercase tracking-[0.3em] text-white hover:text-white transition-colors border-b border-transparent hover:border-white/20 pb-1 ml-2"
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
