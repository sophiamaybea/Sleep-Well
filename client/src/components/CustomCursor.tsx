import { useEffect, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hoverText, setHoverText] = useState<string | null>(null);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const dotSpring = { damping: 40, stiffness: 900, mass: 0.2 };
  const dotX = useSpring(cursorX, dotSpring);
  const dotY = useSpring(cursorY, dotSpring);

  const ringSpring = { damping: 20, stiffness: 200, mass: 0.5 };
  const ringX = useSpring(cursorX, ringSpring);
  const ringY = useSpring(cursorY, ringSpring);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    cursorX.set(e.clientX);
    cursorY.set(e.clientY);
    if (!isVisible) setIsVisible(true);
  }, [isVisible]);

  const handleMouseOver = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const interactive = target.closest("button, a, [role='button'], input, textarea, select, [data-cursor-hover]");
    if (interactive) {
      setIsHovering(true);
      const label = interactive.getAttribute("data-cursor-text");
      setHoverText(label || null);
    } else {
      setIsHovering(false);
      setHoverText(null);
    }
  }, []);

  useEffect(() => {
    const onDown = () => setIsPressed(true);
    const onUp = () => setIsPressed(false);
    const onLeave = () => setIsVisible(false);
    const onEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
    };
  }, [handleMouseMove, handleMouseOver]);

  const ringSize = isHovering ? 64 : 36;
  const dotSize = 6;

  return (
    <>
      <style>{`
        @media (pointer: fine) {
          * { cursor: none !important; }
        }
      `}</style>

      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] hidden md:block"
        style={{
          x: ringX,
          y: ringY,
          width: ringSize,
          height: ringSize,
          marginLeft: -ringSize / 2,
          marginTop: -ringSize / 2,
        }}
        animate={{
          width: ringSize,
          height: ringSize,
          marginLeft: -ringSize / 2,
          marginTop: -ringSize / 2,
          opacity: isVisible ? 1 : 0,
          scale: isPressed ? 0.85 : 1,
        }}
        transition={{
          width: { type: "spring", stiffness: 300, damping: 25 },
          height: { type: "spring", stiffness: 300, damping: 25 },
          marginLeft: { type: "spring", stiffness: 300, damping: 25 },
          marginTop: { type: "spring", stiffness: 300, damping: 25 },
          opacity: { duration: 0.15 },
          scale: { type: "spring", stiffness: 400, damping: 20 },
        }}
      >
        <motion.div
          className="w-full h-full rounded-full flex items-center justify-center"
          animate={{
            backgroundColor: isHovering
              ? "rgba(255, 255, 255, 0.08)"
              : "rgba(255, 255, 255, 0)",
            borderWidth: isHovering ? 1.5 : 1,
            borderColor: isHovering
              ? "rgba(255, 255, 255, 0.35)"
              : "rgba(255, 255, 255, 0.2)",
          }}
          transition={{ duration: 0.25 }}
          style={{
            borderStyle: "solid",
            backdropFilter: isHovering ? "blur(4px)" : "none",
          }}
        >
          {hoverText && (
            <motion.span
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              className="text-[8px] font-mono text-white/70 uppercase tracking-[0.2em] whitespace-nowrap select-none"
            >
              {hoverText}
            </motion.span>
          )}
        </motion.div>
      </motion.div>

      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[10000] hidden md:block rounded-full"
        style={{
          x: dotX,
          y: dotY,
          width: dotSize,
          height: dotSize,
          marginLeft: -dotSize / 2,
          marginTop: -dotSize / 2,
        }}
        animate={{
          opacity: isVisible ? 1 : 0,
          scale: isHovering ? 0.5 : isPressed ? 0.7 : 1,
          backgroundColor: isHovering
            ? "rgba(255, 255, 255, 0.9)"
            : "rgba(255, 255, 255, 0.8)",
        }}
        transition={{
          opacity: { duration: 0.15 },
          scale: { type: "spring", stiffness: 500, damping: 25 },
        }}
      />
    </>
  );
}
