import Navigation from "@/components/Navigation";
import Hero from "@/components/sections/Hero";
import Pills from "@/components/sections/Pills";
import Rhythm from "@/components/sections/Rhythm";
import Overclock from "@/components/sections/Overclock";
import BlueLight from "@/components/sections/BlueLight";
import Layers from "@/components/sections/Layers";
import Tips from "@/components/sections/Tips";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-secondary selection:text-white">
      <Navigation />
      
      <main>
        <Hero />
        <Pills />
        <Rhythm />
        <Overclock />
        <BlueLight />
        <Layers />
        <Tips />
      </main>

      <Footer />
    </div>
  );
}
