// client/src/lib/gsap-init.ts
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Wire GSAP ScrollTrigger to Lenis smooth scroll.
 * Call this once, after Lenis is initialised in your app root.
 */
export function initGSAPWithLenis(lenis: {
  on: (event: string, cb: (e: { scroll: number }) => void) => void;
}) {
  lenis.on("scroll", () => {
    ScrollTrigger.update();
  });

  gsap.ticker.lagSmoothing(0);
}

export { gsap, ScrollTrigger };
