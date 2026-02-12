import Navigation from "@/components/Navigation";
import Hero from "@/components/sections/Hero";
import TwoDoors from "@/components/sections/TwoDoors";
import Featured from "@/components/sections/Featured";
import HowItWorks from "@/components/sections/HowItWorks";
import Manifesto from "@/components/sections/Manifesto";
import Footer from "@/components/Footer";
import StarBackground from "@/components/StarBackground";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-secondary selection:text-background relative">
      <StarBackground />
      <Navigation />
      
      <main className="relative z-10">
        <Hero />
        <div className="bg-background/80 backdrop-blur-[2px]">
          <TwoDoors />
          <Featured />
          <HowItWorks />
          <Manifesto />
        </div>
      </main>

      <div className="relative z-10 bg-background/90">
        <Footer />
      </div>
    </div>
  );
}
