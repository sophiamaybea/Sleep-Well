import { useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform, useScroll } from "framer-motion";
import StarTitle from "@/components/StarTitle";
import { Link } from "wouter";
import { gsap } from "@/lib/gsap-init";

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  // Framer-motion mouse tilt (original)
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

  // GSAP: stagger entrance of hero text elements when section scrolls into view
  useEffect(() => {
    if (!textRef.current) return;
    const children = Array.from(textRef.current.children);
    gsap.fromTo(
      children,
      { opacity: 0, y: 36, filter: "blur(4px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 1.1,
        stagger: 0.18,
        ease: "power3.out",
        scrollTrigger: {
          trigger: textRef.current,
          start: "top 82%",
          toggleActions: "play none none reverse",
        },
      }
    );
  }, []);

  return (
    <div ref={heroRef} className="relative">
      {/* StarTitle: full-height illustrated splash with GSAP depth layers */}
      <StarTitle />

      {/* Hero text content: below the splash */}
      <section
        id="hero-content"
        className="relative z-10 min-h-[50vh] pt-16 pb-12 px-6 md:px-12 lg:px-24"
      >
        <div
          className="max-w-7xl mx-auto relative z-10"
          onMouseMove={handleMouseMove}
        >
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div ref={textRef} className="lg:col-span-8 space-y-8">
              <div>
                <motion.p
                  style={{ x: textX, y: textY }}
                  className="font-mono text-[10px] tracking-[0.4em] text-amber-200/60 uppercase mb-6 block"
                >
                  A Literary Journal &amp; Digital Writing Garden
                </motion.p>
                <h1 className="font-display text-[clamp(2.5rem,8vw,6rem)] font-light leading-[0.95] tracking-tight text-white">
                  Writing that lingers.
                </h1>
              </div>

              <p
                className="max-w-lg text-sm md:text-base leading-relaxed font-mono text-white/60"
                data-testid="text-hero-garden-proposition"
              >
                No slush pile. No query letters. No waiting rooms.{" "}
                Every writer gets a Garden — a private space for drafts,
                fragments, and work that isn't ready yet.
              </p>

              <div className="flex items-center gap-12 pt-8">
                <Link
                  href="/in-bloom"
                  className="group flex items-center gap-3"
                  data-testid="cta-read-journal"
                >
                  <span className="font-serif italic text-lg text-white group-hover:text-amber-100 transition-colors">
                    Read the Journal
                  </span>
                  <span className="text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all">
                    →
                  </span>
                </Link>
                <Link
                  href="/garden"
                  className="group flex items-center gap-3"
                  data-testid="cta-start-writing"
                >
                  <span className="font-serif italic text-lg text-white/80 group-hover:text-white transition-colors">
                    Start Writing
                  </span>
                  <span className="text-white/40 group-hover:text-white/70 group-hover:translate-x-1 transition-all">
                    →
                  </span>
                </Link>
                <Link
                  href="/about"
                  className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40 hover:text-white/70 transition-colors"
                  data-testid="cta-about-us"
                >
                  About Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
