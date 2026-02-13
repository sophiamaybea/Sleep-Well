import Navigation from "@/components/Navigation";
import TwoDoors from "@/components/sections/TwoDoors";
import Manifesto from "@/components/sections/Manifesto";
import Footer from "@/components/Footer";
import StarBackground from "@/components/StarBackground";

export default function About() {
  return (
    <div className="min-h-screen bg-transparent text-foreground selection:bg-secondary selection:text-background relative">
      <StarBackground />
      <Navigation />
      
      <main className="relative z-10 pt-24">
        <TwoDoors />
        <Manifesto />
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
