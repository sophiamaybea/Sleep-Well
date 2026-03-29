import { useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { gsap, ScrollTrigger } from "@/lib/gsap-init";

export default function StarTitle() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  // Framer-motion: logo scale/fade/lift on scroll (kept from original)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const logoScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.6]);
  const logoOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const logoY = useTransform(scrollYProgress, [0, 0.5], ["0%", "20%"]);

  // GSAP refs for 3D depth layers
  const bgGlowRef = useRef<HTMLDivElement>(null);
  const midGlowRef = useRef<HTMLDivElement>(null);
  const scrollCueRef = useRef<HTMLDivElement>(null);

  // Star particle canvas (original, preserved exactly)
  useEffect(() => {
    const timer = setTimeout(() => {
      const cvs = canvasRef.current;
      if (!cvs) return;
      let cancelled = false;
      const dpr = window.devicePixelRatio || 1;
      function initSize() {
        const rect = cvs!.getBoundingClientRect();
        cvs!.width = rect.width * dpr;
        cvs!.height = rect.height * dpr;
      }
      initSize();
      const ctx = cvs.getContext("2d")!;
      interface Particle {
        x: number;
        y: number;
        r: number;
        speed: number;
        phase: number;
        alpha: number;
        drift: number;
      }
      const particles: Particle[] = [];
      const count = 200;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * cvs.width,
          y: Math.random() * cvs.height,
          r: 0.3 + Math.random() * 1.8,
          speed: 0.5 + Math.random() * 2,
          phase: Math.random() * Math.PI * 2,
          alpha: 0.15 + Math.random() * 0.6,
          drift: (Math.random() - 0.5) * 0.3,
        });
      }
      function frame() {
        if (cancelled) return;
        const t = performance.now() / 1000;
        ctx.clearRect(0, 0, cvs!.width, cvs!.height);
        for (const p of particles) {
          const twinkle = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * p.speed + p.phase));
          const a = p.alpha * twinkle;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * dpr, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(237,233,227,${a})`;
          ctx.fill();
          if (p.r > 1.2) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r * 3 * dpr, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(237,233,227,${a * 0.08})`;
            ctx.fill();
          }
          p.y += p.drift * 0.2;
          p.x += Math.sin(t * 0.3 + p.phase) * 0.1;
          if (p.y < 0) p.y = cvs!.height;
          if (p.y > cvs!.height) p.y = 0;
          if (p.x < 0) p.x = cvs!.width;
          if (p.x > cvs!.width) p.x = 0;
        }
        rafRef.current = requestAnimationFrame(frame);
      }
      rafRef.current = requestAnimationFrame(frame);
      const onResize = () => { initSize(); };
      window.addEventListener("resize", onResize);
      (cvs as any)._cleanup = () => {
        cancelled = true;
        cancelAnimationFrame(rafRef.current);
        window.removeEventListener("resize", onResize);
      };
    }, 0);
    return () => {
      clearTimeout(timer);
      const cvs = canvasRef.current;
      if (cvs && (cvs as any)._cleanup) (cvs as any)._cleanup();
    };
  }, []);

  // GSAP ScrollTrigger: 3D parallax depth on the splash scene
  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {

      // Entrance: bg glow blooms in on load
      gsap.fromTo(
        bgGlowRef.current,
        { opacity: 0, scale: 0.85 },
        { opacity: 1, scale: 1, duration: 2.4, ease: "power2.out" }
      );

      // Mid gold glow pulses in slowly
      gsap.fromTo(
        midGlowRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 3, ease: "power1.out", delay: 0.6 }
      );

      // Scroll: parallax depth — bg moves slowest, mid moves medium
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "bottom top",
        scrub: 1.6,
        onUpdate: (self) => {
          const p = self.progress;
          // Background glow: slowest parallax, slight scale
          gsap.set(bgGlowRef.current, {
            y: p * 100,
            scale: 1 + p * 0.05,
          });
          // Mid gold glow: medium parallax, fades as logo fades
          gsap.set(midGlowRef.current, {
            y: p * 60,
            opacity: 1 - p * 1.4,
          });
          // Scroll cue fades out immediately on scroll
          gsap.set(scrollCueRef.current, {
            opacity: Math.max(0, 1 - p * 8),
          });
        },
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-screen w-full relative overflow-hidden"
      style={{ perspective: "1200px", perspectiveOrigin: "50% 40%" }}
    >
      {/* Depth Layer -1: full-viewport background image — sits behind everything */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <motion.div
          style={{
            scale: logoScale,
            opacity: logoOpacity,
            y: logoY,
          }}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          <img
            src="/logo%20(2).png"
            alt="The Page Gallery"
            className="w-full h-full object-cover"
            style={{ filter: "drop-shadow(0 0 60px rgba(255,255,255,0.15))" }}
          />
        </motion.div>
      </div>

      {/* Star particle canvas — above background image */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* Depth Layer 0: far background teal/indigo glow — slowest parallax */}
      <div
        ref={bgGlowRef}
        className="pointer-events-none absolute inset-0 z-10"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% 40%, rgba(42,107,110,0.22) 0%, rgba(13,30,45,0) 65%), radial-gradient(ellipse 60% 50% at 30% 80%, rgba(25,60,90,0.15) 0%, transparent 60%)",
          transformOrigin: "50% 50%",
          willChange: "transform",
        }}
      />

      {/* Depth Layer 1: mid gold ambient glow — medium parallax */}
      <div
        ref={midGlowRef}
        className="pointer-events-none absolute inset-0 z-10"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 50% 60% at 68% 55%, rgba(196,162,77,0.1) 0%, transparent 60%)",
          willChange: "transform, opacity",
        }}
      />

      {/* Scroll cue — fades out instantly on scroll */}
      <div
        ref={scrollCueRef}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        aria-hidden="true"
      >
        <span className="font-mono text-[9px] uppercase tracking-[0.35em] text-white/30">
          scroll
        </span>
        <div className="scroll-line" />
      </div>
    </div>
  );
}
