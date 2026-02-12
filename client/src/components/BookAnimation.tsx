import { useRef, useEffect, useCallback, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  originX: number;
  originY: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  delay: number;
}

function sampleTextPositions(
  text: string,
  fontSize: number,
  canvasWidth: number,
  canvasHeight: number,
  lineSpacing: number
): { x: number; y: number }[] {
  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.font = `300 italic ${fontSize}px "Cormorant Garamond", serif`;
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const lines = text.split("\n");
  const totalHeight = lines.length * lineSpacing;
  const startY = (canvasHeight - totalHeight) / 2 + lineSpacing / 2;

  lines.forEach((line, i) => {
    ctx.fillText(line, canvasWidth / 2, startY + i * lineSpacing);
  });

  const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
  const positions: { x: number; y: number }[] = [];
  const step = 3;

  for (let y = 0; y < canvasHeight; y += step) {
    for (let x = 0; x < canvasWidth; x += step) {
      const i = (y * canvasWidth + x) * 4;
      if (imageData.data[i] > 128) {
        positions.push({ x, y });
      }
    }
  }

  return positions;
}

export default function BookAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const scrollProgressRef = useRef(0);
  const [ready, setReady] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const smoothScroll = useSpring(scrollYProgress, { stiffness: 50, damping: 20 });
  const scrollIndicatorOpacity = useTransform(smoothScroll, [0, 0.1], [1, 0]);

  useEffect(() => {
    const unsubscribe = smoothScroll.on("change", (v) => {
      scrollProgressRef.current = v;
    });
    return unsubscribe;
  }, [smoothScroll]);

  const initParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const sampleW = Math.floor(rect.width * 0.8);
    const sampleH = Math.floor(rect.height * 0.6);
    const fontSize = Math.min(Math.floor(rect.width / 8), 120);
    const lineSpacing = fontSize * 1.3;

    const positions = sampleTextPositions(
      "THE PAGE\nGALLERY\nJOURNAL",
      fontSize,
      sampleW,
      sampleH,
      lineSpacing
    );

    const offsetX = (rect.width - sampleW) / 2;
    const offsetY = (rect.height - sampleH) / 2;

    const particles: Particle[] = positions.map((pos, i) => {
      const angle = Math.random() * Math.PI * 2;
      const dist = 300 + Math.random() * 600;
      const originX = rect.width / 2 + Math.cos(angle) * dist;
      const originY = rect.height / 2 + Math.sin(angle) * dist;

      return {
        x: originX,
        y: originY,
        targetX: pos.x + offsetX,
        targetY: pos.y + offsetY,
        originX,
        originY,
        size: 0.8 + Math.random() * 1.8,
        opacity: 0.3 + Math.random() * 0.7,
        twinkleSpeed: 1 + Math.random() * 3,
        twinkleOffset: Math.random() * Math.PI * 2,
        delay: Math.random() * 0.3,
      };
    });

    particlesRef.current = particles;
    setReady(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(initParticles, 100);
    window.addEventListener("resize", initParticles);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", initParticles);
    };
  }, [initParticles]);

  useEffect(() => {
    if (!ready) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const progress = scrollProgressRef.current;
      const formProgress = Math.max(0, Math.min(1, (progress - 0.05) / 0.5));
      const time = performance.now() / 1000;

      particlesRef.current.forEach((p) => {
        const delayed = Math.max(0, Math.min(1, (formProgress - p.delay) / (1 - p.delay)));
        const eased = delayed < 0.5
          ? 4 * delayed * delayed * delayed
          : 1 - Math.pow(-2 * delayed + 2, 3) / 2;

        p.x = p.originX + (p.targetX - p.originX) * eased;
        p.y = p.originY + (p.targetY - p.originY) * eased;

        const twinkle = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(time * p.twinkleSpeed + p.twinkleOffset));
        const fadeIn = Math.min(1, formProgress * 3);
        const alpha = p.opacity * twinkle * fadeIn;

        ctx.beginPath();
        ctx.arc(p.x * dpr, p.y * dpr, p.size * dpr, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(237, 233, 227, ${alpha})`;
        ctx.fill();

        if (p.size > 1.2 && eased > 0.8) {
          ctx.beginPath();
          ctx.arc(p.x * dpr, p.y * dpr, p.size * dpr * 2.5, 0, Math.PI * 2);
          const glowAlpha = alpha * 0.15 * (eased - 0.8) * 5;
          ctx.fillStyle = `rgba(237, 233, 227, ${glowAlpha})`;
          ctx.fill();
        }
      });

      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [ready]);

  return (
    <div ref={containerRef} className="h-[250vh] w-full relative mb-[-30vh]">
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden pointer-events-none">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />
        <motion.div
          style={{ opacity: scrollIndicatorOpacity }}
          className="absolute bottom-24 font-mono text-[10px] tracking-[0.3em] opacity-40 animate-pulse text-white/50"
        >
          SCROLL TO REVEAL
        </motion.div>
      </div>
    </div>
  );
}
