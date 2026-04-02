import { useEffect } from 'react';
import { useLocation } from 'wouter';
import Lenis from 'lenis';
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  useEffect(() => {
    // T36: skip smooth scroll for users who prefer reduced motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;
    // Avoid smooth-scroll library on long-form reading views where native scroll is preferable
    if (location.startsWith('/piece') || location.startsWith('/in-bloom') || location.startsWith('/reading-room')) {
      return;
    }
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => {
      lenis.destroy();
    };
  }, []);
  return <>{children}</>;
}
