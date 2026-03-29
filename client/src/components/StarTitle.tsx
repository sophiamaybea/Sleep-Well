import { useRef, useEffect, useMemo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { gsap, ScrollTrigger } from "@/lib/gsap-init";
import ill1 from "@/assets/upload 1.png";
import ill2 from "@/assets/upload 2.png";
import ill3 from "@/assets/upload 3.png";
import ill4 from "@/assets/upload 4.png";
import ill5 from "@/assets/upload 5.png";
import ill6 from "@/assets/upload 6.png";
import ill7 from "@/assets/upload 7.png";
import ill8 from "@/assets/upload 8.png";

const BACKGROUNDS = [ill1, ill2, ill3, ill4, ill5, ill6, ill7, ill8];

export default function StarTitle() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  // Pick a random background image per page load
  const bgSrc = useMemo(() => BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)], []);

  // Framer-motion: logo scale/fade/lift on scroll
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

  // Star particle canvas — subtle, reduced count
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
        x: number; y: number; r: number;
        speed: number; phase: number; alpha: number; drift: number;
      }
      const particles: Particle[] = [];
      const count = 80; // reduced from 200
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * cvs.width,
          y: Math.random() * cvs.height,
          r: 0.2 + Math.random() * 1.2,
          speed: 0.3 + Math.random() * 1.2,
          phase: Math.random() * Math.PI * 2,
          alpha: 0.08 + Math.random() * 0.3, // dimmer
          drift: (Math.random() - 0.5) * 0.2,
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
          if (p.r > 1.0) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r * 2.5 * dpr, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(237,233,227,${a * 0.05})`;
            ctx.fill();
          }
          p.y += p.drift * 0.15;
          p.x += Math.sin(t * 0.2 + p.phase) * 0.06;
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

  // GSAP ScrollTrigger: 3D parallax depth
  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        bgGlowRef.current,
        { opacity: 0, scale: 0.85 },
        { opacity: 1, scale: 1, duration: 2.4, ease: "power2.out" }
      );
      gsap.fromTo(
        midGlowRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 3, ease: "power1.out", delay: 0.6 }
      );
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "bottom top",
        scrub: 1.6,
        onUpdate: (self) => {
          const p = self.progress;
          gsap.set(bgGlowRef.current, {
            y: p * 100,
            scale: 1 + p * 0.05,
          });
          gsap.set(midGlowRef.current, {
            y: p * 60,
            opacity: 1 - p * 1.4,
          });
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
      {/* Depth Layer -1: uploaded background image — behind everything */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <img
          src={bgSrc}
          alt=""
          className="w-full h-full object-cover"
          style={{ opacity: 0.55 }}
        />
      </div>

      {/* Star particle canvas — subtle, above background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-[5]"
      />

      {/* Depth Layer 0: far background teal/indigo glow */}
      <div
        ref={bgGlowRef}
        className="pointer-events-none absolute inset-0 z-[6]"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% 40%, rgba(42,107,110,0.15) 0%, rgba(13,30,45,0) 65%), radial-gradient(ellipse 60% 50% at 30% 80%, rgba(25,60,90,0.10) 0%, transparent 60%)",
          transformOrigin: "50% 50%",
          willChange: "transform",
        }}
      />

      {/* Depth Layer 1: mid gold ambient glow */}
      <div
        ref={midGlowRef}
        className="pointer-events-none absolute inset-0 z-[6]"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 50% 60% at 68% 55%, rgba(196,162,77,0.07) 0%, transparent 60%)",
          willChange: "transform, opacity",
        }}
      />

      {/* Logo — 3D, centered, IN FRONT of stars */}
      <motion.div
        style={{
          scale: logoScale,
          opacity: logoOpacity,
          y: logoY,
          transformStyle: "preserve-3d",
        }}
        initial={{ opacity: 0, scale: 1.08, rotateX: 6 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 z-[15] flex items-center justify-center pointer-events-none"
      >
        <img
          src="/logo%20(2).png"
          alt="The Page Gallery"
          className="object-contain"
          style={{
            width: "min(85vw, 700px)",
            height: "auto",
            filter: "drop-shadow(0 0 80px rgba(255,255,255,0.2)) drop-shadow(0 20px 60px rgba(0,0,0,0.5))",
            transform: "translateZ(60px)",
          }}
        />
      </motion.div>

      {/* Scroll cue */}
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
