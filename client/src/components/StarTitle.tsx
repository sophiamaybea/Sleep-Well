import { useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function StarTitle() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const logoScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.6]);
  const logoOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const logoY = useTransform(scrollYProgress, [0, 0.5], ["0%", "20%"]);

  // Star particle field
  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    let cancelled = false;

    const rect = cvs.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    cvs.width = rect.width * dpr;
    cvs.height = rect.height * dpr;
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

        // Glow on larger stars
        if (p.r > 1.2) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 3 * dpr, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(237,233,227,${a * 0.08})`;
          ctx.fill();
        }

        // Slow drift
        p.y += p.drift * 0.2;
        p.x += Math.sin(t * 0.3 + p.phase) * 0.1;

        // Wrap around
        if (p.y < 0) p.y = cvs!.height;
        if (p.y > cvs!.height) p.y = 0;
        if (p.x < 0) p.x = cvs!.width;
        if (p.x > cvs!.width) p.x = 0;
      }

      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);

    const onResize = () => {
      const r = cvs.getBoundingClientRect();
      cvs.width = r.width * dpr;
      cvs.height = r.height * dpr;
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div ref={containerRef} className="h-screen w-full relative overflow-hidden">
      {/* Star particle field */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Logo with scroll parallax */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          style={{
            scale: logoScale,
            opacity: logoOpacity,
            y: logoY,
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <img
            src="/logo%20(2).png"
            alt="The Page Gallery"
            className="w-[320px] md:w-[420px] lg:w-[500px] h-auto drop-shadow-[0_0_60px_rgba(255,255,255,0.15)]"
          />
        </motion.div>
      </div>
    </div>
  );
}
