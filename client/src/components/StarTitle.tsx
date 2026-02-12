import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

interface Star {
  x: number;
  y: number;
  tx: number;
  ty: number;
  ox: number;
  oy: number;
  r: number;
  alpha: number;
  speed: number;
  phase: number;
  delay: number;
}

export default function StarTitle() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const rafRef = useRef(0);
  const progressRef = useRef(0);

  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end start"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 40, damping: 18 });
  const hintOpacity = useTransform(smooth, [0, 0.08], [1, 0]);

  useEffect(() => smooth.on("change", (v) => { progressRef.current = v; }), [smooth]);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;

    let cancelled = false;

    async function init() {
      try { await document.fonts.load('400 80px "Special Elite"'); } catch {}

      if (cancelled || !cvs) return;
      const rect = cvs.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const dpr = window.devicePixelRatio || 1;
      cvs.width = rect.width * dpr;
      cvs.height = rect.height * dpr;

      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      const fontSize = Math.min(Math.round(w / 7.5), 130);

      const off = document.createElement("canvas");
      off.width = w;
      off.height = h;
      const oc = off.getContext("2d")!;
      oc.fillStyle = "#000";
      oc.fillRect(0, 0, w, h);
      oc.font = `400 ${fontSize}px "Special Elite", "Courier New", monospace`;
      oc.fillStyle = "#fff";
      oc.textAlign = "center";
      oc.textBaseline = "middle";

      const lines = ["THE PAGE", "GALLERY", "JOURNAL"];
      const gap = fontSize * 1.25;
      const top = h / 2 - ((lines.length - 1) * gap) / 2;
      lines.forEach((l, i) => oc.fillText(l, w / 2, top + i * gap));

      const img = oc.getImageData(0, 0, w, h);
      const pts: { x: number; y: number }[] = [];
      const step = 3;
      for (let py = 0; py < h; py += step) {
        for (let px = 0; px < w; px += step) {
          if (img.data[(py * w + px) * 4] > 100) pts.push({ x: px, y: py });
        }
      }

      if (pts.length === 0) {
        const fallbackPts = generateFallbackPoints(w, h, fontSize);
        pts.push(...fallbackPts);
      }

      const stars: Star[] = pts.map((p) => {
        const a = Math.random() * Math.PI * 2;
        const d = 400 + Math.random() * 800;
        return {
          x: 0, y: 0,
          tx: p.x, ty: p.y,
          ox: w / 2 + Math.cos(a) * d,
          oy: h / 2 + Math.sin(a) * d,
          r: 0.6 + Math.random() * 2,
          alpha: 0.3 + Math.random() * 0.7,
          speed: 1 + Math.random() * 3,
          phase: Math.random() * Math.PI * 2,
          delay: Math.random() * 0.35,
        };
      });

      starsRef.current = stars;

      const ctx = cvs!.getContext("2d")!;
      const cvsLocal = cvs!;

      function frame() {
        if (cancelled) return;
        const cw = cvsLocal.width;
        const ch = cvsLocal.height;
        ctx.clearRect(0, 0, cw, ch);

        const p = progressRef.current;
        const form = Math.max(0, Math.min(1, (p - 0.02) / 0.5));
        const t = performance.now() / 1000;

        for (const s of starsRef.current) {
          const raw = Math.max(0, Math.min(1, (form - s.delay) / (1 - s.delay)));
          const e = raw < 0.5 ? 4 * raw ** 3 : 1 - (-2 * raw + 2) ** 3 / 2;

          const sx = s.ox + (s.tx - s.ox) * e;
          const sy = s.oy + (s.ty - s.oy) * e;

          const twinkle = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
          const vis = Math.min(1, form * 4);
          const a = s.alpha * twinkle * Math.max(0.15, vis);

          ctx.beginPath();
          ctx.arc(sx * dpr, sy * dpr, s.r * dpr, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(237,233,227,${a})`;
          ctx.fill();

          if (s.r > 1.3 && e > 0.85) {
            ctx.beginPath();
            ctx.arc(sx * dpr, sy * dpr, s.r * 3 * dpr, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(237,233,227,${a * 0.12 * ((e - 0.85) / 0.15)})`;
            ctx.fill();
          }
        }

        rafRef.current = requestAnimationFrame(frame);
      }

      rafRef.current = requestAnimationFrame(frame);
    }

    const timer = setTimeout(init, 200);

    const onResize = () => { clearTimeout(timer); setTimeout(init, 100); };
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div ref={wrapRef} className="h-[220vh] w-full relative mb-[-20vh]">
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden pointer-events-none">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        <motion.div
          style={{ opacity: hintOpacity }}
          className="absolute bottom-20 font-mono text-[10px] tracking-[0.3em] text-white/40 animate-pulse"
        >
          SCROLL TO REVEAL
        </motion.div>
      </div>
    </div>
  );
}

function generateFallbackPoints(w: number, h: number, fontSize: number): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  const lines = ["THE PAGE", "GALLERY", "JOURNAL"];
  const gap = fontSize * 1.25;
  const top = h / 2 - ((lines.length - 1) * gap) / 2;

  lines.forEach((line, li) => {
    const cy = top + li * gap;
    const charW = fontSize * 0.55;
    const lineW = line.length * charW;
    const startX = w / 2 - lineW / 2;

    for (let ci = 0; ci < line.length; ci++) {
      if (line[ci] === " ") continue;
      const cx = startX + ci * charW + charW / 2;
      for (let i = 0; i < 25; i++) {
        pts.push({
          x: cx + (Math.random() - 0.5) * charW * 0.8,
          y: cy + (Math.random() - 0.5) * fontSize * 0.7,
        });
      }
    }
  });

  return pts;
}
