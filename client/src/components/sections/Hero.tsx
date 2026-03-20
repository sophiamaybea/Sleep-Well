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
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  viewport={{ once: true }}
                  className="mt-6"
                >
                  <p className="font-serif italic text-xl md:text-2xl text-white/50 leading-relaxed max-w-xl">
                    A literary journal for writing that lingers.
                  </p>
                </motion.div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 1.0 }}
                viewport={{ once: true }}
                className="max-w-lg text-sm md:text-base leading-relaxed font-mono tracking-wide text-white/40"
                data-testid="text-hero-garden-proposition"
              >
                You don't submit. You don't query. You just write.
                <span className="hidden md:inline">{" "}Every writer gets a Garden — a private space to draft, revise, and bloom.</span>
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.8 }}
                viewport={{ once: true }}
                className="flex items-center gap-12 pt-8"
              >
                <Link
                  href="/in-bloom"
                  className="group flex items-center gap-3"
                  data-testid="cta-read-journal"
                >
                  <span className="font-serif italic text-lg text-white/70 group-hover:text-white transition-colors duration-500">Read the Journal</span>
                  <span className="text-white/30 group-hover:text-white/70 group-hover:translate-x-1 transition-all duration-500">&rarr;</span>
                </Link>
                <Link
                  href="/garden"
                  className="group flex items-center gap-3"
                  data-testid="cta-start-writing"
                >
                  <span className="font-serif italic text-lg text-white/40 group-hover:text-white/80 transition-colors duration-500">Start Writing</span>
                  <span className="text-white/20 group-hover:text-white/50 group-hover:translate-x-1 transition-all duration-500">&rarr;</span>
                </Link>
                <Link
                  href="/about"
                  className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/25 hover:text-white/50 transition-colors duration-500 border-b border-transparent hover:border-white/20 pb-1"
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
