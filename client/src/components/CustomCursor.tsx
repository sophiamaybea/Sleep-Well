import { useEffect, useState, useCallback, useRef } from "react";

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const rafId = useRef<number>(0);

  useEffect(() => {
    const updateRing = () => {
      const lerp = 0.35;
      ringPos.current.x += (pos.current.x - ringPos.current.x) * lerp;
      ringPos.current.y += (pos.current.y - ringPos.current.y) * lerp;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }

      rafId.current = requestAnimationFrame(updateRing);
    };
    rafId.current = requestAnimationFrame(updateRing);
    return () => cancelAnimationFrame(rafId.current);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    pos.current.x = e.clientX;
    pos.current.y = e.clientY;

    if (dotRef.current) {
      dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    }

    if (!isVisible) setIsVisible(true);
  }, [isVisible]);

  const handleMouseOver = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const interactive = target.closest("button, a, [role='button'], input, textarea, select, [data-cursor-hover]");
    setIsHovering(!!interactive);
  }, []);

  useEffect(() => {
    const onDown = () => setIsPressed(true);
    const onUp = () => setIsPressed(false);
    const onLeave = () => setIsVisible(false);
    const onEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseover", handleMouseOver, { passive: true });
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

  return (
    <>
      {isVisible && (
        <style>{`
          @media (pointer: fine) and (min-width: 768px) {
            * { cursor: none !important; }
          }
        `}</style>
      )}

      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] hidden md:block"
        style={{
          width: ringSize,
          height: ringSize,
          marginLeft: -ringSize / 2,
          marginTop: -ringSize / 2,
          opacity: isVisible ? 1 : 0,
          transform: `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`,
          transition: "width 0.2s, height 0.2s, margin 0.2s, opacity 0.15s",
          willChange: "transform",
        }}
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            borderStyle: "solid",
            borderWidth: isHovering ? 1.5 : 1,
            borderColor: isHovering ? "rgba(255, 255, 255, 0.35)" : "rgba(255, 255, 255, 0.2)",
            backgroundColor: isHovering ? "rgba(255, 255, 255, 0.08)" : "transparent",
            transition: "border-color 0.2s, border-width 0.2s, background-color 0.2s",
          }}
        />
      </div>

      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-[10000] hidden md:block rounded-full"
        style={{
          width: 6,
          height: 6,
          marginLeft: -3,
          marginTop: -3,
          opacity: isVisible ? 1 : 0,
          backgroundColor: "rgba(255, 255, 255, 0.85)",
          transform: `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`,
          scale: isHovering ? "0.5" : isPressed ? "0.7" : "1",
          transition: "opacity 0.15s, scale 0.15s",
          willChange: "transform",
        }}
      />
    </>
  );
}
