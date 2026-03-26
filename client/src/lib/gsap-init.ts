// client/src/lib/gsap-init.ts
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// T36: detect prefers-reduced-motion at module level
export const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// T36: global GSAP matchMedia — disables all scrub/tween animations
// when the user prefers reduced motion
if (typeof window !== "undefined") {
  gsap.matchMedia().add("(prefers-reduced-motion: reduce)", () => {
    gsap.globalTimeline.timeScale(0);
    ScrollTrigger.getAll().forEach((st) => st.kill());
  });
}

export { gsap, ScrollTrigger };
