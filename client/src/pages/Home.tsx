import Navigation from "@/components/Navigation";
import Hero from "@/components/sections/Hero";
import TwoDoors from "@/components/sections/TwoDoors";
import Featured from "@/components/sections/Featured";
import HowItWorks from "@/components/sections/HowItWorks";
import Manifesto from "@/components/sections/Manifesto";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-secondary selection:text-background">
      <Navigation />
      
      <main>
        <Hero />
        <TwoDoors />
        <Featured />
        <HowItWorks />
        <Manifesto />
      </main>

      <Footer />
    </div>
  );
}
