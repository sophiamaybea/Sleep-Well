import Navigation from "@/components/Navigation";
import Hero from "@/components/sections/Hero";
import GardenIntro from "@/components/sections/GardenIntro";
import Featured from "@/components/sections/Featured";
import Footer from "@/components/Footer";
import SocialCTA from "@/components/sections/SocialCTA";
import NewsletterSignup from "@/components/ui/NewsletterSignup";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-init";

/**
 * GSAP-powered atmosphere layer — replaces the old useState scroll tracker.
 * Drives depth glow and warm-shift purely through ScrollTrigger progress.
 */
function ScrollAtmosphere() {
  const warmRef = useRef<HTMLDivElement>(null);
  const coolRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Warm gold glow rises from bottom as user scrolls
      ScrollTrigger.create({
        start: "top top",
        end: "bottom bottom",
        scrub: 1.8,
        onUpdate: (self) => {
          const p = self.progress;
          gsap.set(warmRef.current, { opacity: Math.min(p * 2, 0.6) });
          gsap.set(coolRef.current, { opacity: Math.max(0, 1 - p * 3) });
        },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
      {/* Warm gold ambient — grows on scroll */}
      <div
        ref={warmRef}
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(196,162,77,0.08) 0%, transparent 60%)",
          opacity: 0,
        }}
      />
      {/* Cool top vignette — fades on scroll */}
      <div
        ref={coolRef}
        className="absolute top-0 left-0 right-0 h-[30vh]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(13,30,45,0.6) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}

export default function Home() {
  return (
    <div
      className="min-h-screen bg-transparent text-foreground selection:bg-secondary selection:text-secondary-foreground"
      style={{ perspective: "1200px", perspectiveOrigin: "50% 40%" }}
    >
      <ScrollAtmosphere />
      <Navigation />
      <main style={{ transformStyle: "preserve-3d" }}>
        <Hero />
        <Featured />
        <GardenIntro />
        <NewsletterSignup />
        <SocialCTA />
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
