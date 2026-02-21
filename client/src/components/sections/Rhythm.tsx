import { Section } from "@/components/ui/section";
import { content } from "@/data";
import { Activity } from "lucide-react";

export default function Rhythm() {
  return (
    <Section id="section-3" className="bg-background text-primary">
      <div className="flex flex-col items-center text-center space-y-12 max-w-4xl mx-auto">
        <div className="space-y-4">
          <span className="font-mono text-xs tracking-[0.2em] opacity-60 block">
            {content.rhythm.eyebrow}
          </span>
          <h2 className="text-4xl md:text-6xl font-display font-bold">
            {content.rhythm.title}
          </h2>
          <h3 className="text-xl font-mono text-secondary uppercase tracking-widest">
            {content.rhythm.subtitle}
          </h3>
        </div>

        <div className="relative py-12 w-full flex justify-center">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <Activity size={400} strokeWidth={0.5} />
          </div>
          <p className="text-xl md:text-2xl leading-relaxed relative z-10 max-w-2xl">
            {content.rhythm.text}
          </p>
        </div>

        <div className="border border-secondary/30 bg-secondary/10 px-8 py-4 rounded-full backdrop-blur-sm">
          <p className="font-mono text-lg md:text-xl font-bold tracking-normaler text-secondary">
            {content.rhythm.stat}
          </p>
        </div>
      </div>
    </Section>
  );
}
