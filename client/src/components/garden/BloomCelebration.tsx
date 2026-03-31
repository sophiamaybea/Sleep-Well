import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Flower2 } from "lucide-react";

export function BloomCelebration({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const petalColors = [
      "rgba(244, 114, 182, 0.8)",
      "rgba(251, 191, 36, 0.7)",
      "rgba(167, 139, 250, 0.7)",
      "rgba(52, 211, 153, 0.6)",
      "rgba(248, 113, 113, 0.6)",
      "rgba(196, 162, 77, 0.8)",
      "rgba(253, 224, 71, 0.5)",
      "rgba(147, 197, 253, 0.5)",
    ];
    type Petal = {
      x: number; y: number; vx: number; vy: number;
      rotation: number; rotSpeed: number; size: number;
      color: string; opacity: number; shape: "petal" | "leaf" | "dot";
      drift: number; driftSpeed: number;
    };
    const petals: Petal[] = Array.from({ length: 60 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      const shape = Math.random() < 0.5 ? "petal" : Math.random() < 0.7 ? "leaf" : "dot";
      return {
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height / 2 + (Math.random() - 0.5) * 100,
        vx: Math.cos(angle) * speed * 1.5,
        vy: Math.sin(angle) * speed - 2 - Math.random() * 3,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.08,
        size: 4 + Math.random() * 10,
        color: petalColors[Math.floor(Math.random() * petalColors.length)],
        opacity: 0.8 + Math.random() * 0.2,
        shape,
        drift: Math.random() * Math.PI * 2,
        driftSpeed: 0.01 + Math.random() * 0.02,
      };
    });
    let frame = 0;
    const maxFrames = 180;
    let animId: number;
    const drawPetal = (p: Petal) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;
      if (p.shape === "petal") {
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.bezierCurveTo(p.size * 0.6, -p.size * 0.6, p.size * 0.4, p.size * 0.3, 0, p.size * 0.5);
        ctx.bezierCurveTo(-p.size * 0.4, p.size * 0.3, -p.size * 0.6, -p.size * 0.6, 0, -p.size);
        ctx.fillStyle = p.color;
        ctx.fill();
      } else if (p.shape === "leaf") {
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 0.3, p.size, 0, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }
      ctx.restore();
    };
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;
      const fadeStart = maxFrames - 40;
      petals.forEach((p) => {
        p.x += p.vx + Math.sin(p.drift) * 0.3;
        p.y += p.vy;
        p.vy += 0.03;
        p.vx *= 0.995;
        p.rotation += p.rotSpeed;
        p.drift += p.driftSpeed;
        if (frame > fadeStart) p.opacity *= 0.96;
        drawPetal(p);
      });
      if (frame < maxFrames) animId = requestAnimationFrame(animate);
      else onComplete();
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [onComplete]);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] pointer-events-none"
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 15 }}
            className="text-5xl mb-3"
          >
            <Flower2 size={48} className="text-amber-300/80 mx-auto" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="font-display text-2xl text-white/80 italic"
          >
            Your piece has bloomed
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/90 mt-2"
          >
            Ready to show the world
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  );
}
