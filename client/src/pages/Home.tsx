import Navigation from "@/components/Navigation";
import Hero from "@/components/sections/Hero";
import GardenIntro from "@/components/sections/GardenIntro";
import Featured from "@/components/sections/Featured";
import Footer from "@/components/Footer";
import SocialCTA from "@/components/sections/SocialCTA";
import NewsletterSignup from "@/components/ui/NewsletterSignup";
import { useEffect, useState } from "react";

function ScrollAtmosphere() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0) {
        setScrollProgress(window.scrollY / maxScroll);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fogOpacity = Math.min(scrollProgress * 2, 0.6);
  const warmShift = Math.min(scrollProgress * 1.5, 1);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 100%, rgba(196,162,77,0.08) 0%, transparent 60%)`,
          opacity: warmShift,
        }}
      />
      <div
        className="absolute top-0 left-0 right-0 h-[30vh]"
        style={{
          opacity: Math.max(0, 1 - scrollProgress * 3),
          background: "radial-gradient(ellipse at 50% 0%, rgba(13,30,45,0.6) 0%, transparent 70%)",
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
