import { useEffect, useState, useCallback, useRef } from "react";

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const rafId = useRef<number>(0);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLightMode(!!document.querySelector(".garden-light"));
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
    setIsLightMode(!!document.querySelector(".garden-light"));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateRing = () => {
      const lerp = 0.55;
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

  const ringSize = isHovering ? 48 : 32;

  const dotColor = isLightMode ? "rgba(0, 0, 0, 1)" : "rgba(255, 255, 255, 1)";
  const ringBorder = isLightMode
    ? (isHovering ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.35)")
    : (isHovering ? "rgba(255, 255, 255, 0.5)" : "rgba(255, 255, 255, 0.3)");
  const ringBg = isLightMode
    ? (isHovering ? "rgba(0, 0, 0, 0.06)" : "transparent")
    : (isHovering ? "rgba(255, 255, 255, 0.06)" : "transparent");

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
          transition: "width 0.12s, height 0.12s, margin 0.12s, opacity 0.1s",
          willChange: "transform",
        }}
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            borderStyle: "solid",
            borderWidth: isHovering ? 2 : 1.5,
            borderColor: ringBorder,
            backgroundColor: ringBg,
            transition: "border-color 0.12s, border-width 0.12s, background-color 0.12s",
          }}
        />
      </div>

      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-[10000] hidden md:block rounded-full"
        style={{
          width: 10,
          height: 10,
          marginLeft: -5,
          marginTop: -5,
          opacity: isVisible ? 1 : 0,
          backgroundColor: dotColor,
          transform: `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`,
          scale: isHovering ? "0.6" : isPressed ? "0.8" : "1",
          transition: "opacity 0.1s, scale 0.1s, background-color 0.12s",
          willChange: "transform",
        }}
      />
    </>
  );
}
