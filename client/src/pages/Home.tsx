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
 * GSAP-powered atmosphere layer.
 * NOTE: perspective is intentionally NOT on this root div — putting
 * CSS perspective on a scroll container breaks position:fixed children.
 * Perspective lives on individual scene elements instead.
 */
function ScrollAtmosphere() {
  const warmRef = useRef<HTMLDivElement>(null);
  const coolRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
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
      <div
        ref={warmRef}
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(196,162,77,0.08) 0%, transparent 60%)",
          opacity: 0,
        }}
      />
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
    <div className="min-h-screen bg-transparent text-foreground selection:bg-secondary selection:text-secondary-foreground">
      <ScrollAtmosphere />
      <Navigation />
      <main>
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
