import { content } from "@/data";

export default function Footer() {
  return (
    <footer className="bg-background text-primary py-24 px-6 md:px-12 border-t border-primary/10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-12">
        <div className="space-y-8 max-w-2xl">
          <h2 className="text-4xl md:text-6xl font-display font-bold leading-tight">
            NOW IT'S TIME TO APPLY
          </h2>
          <p className="text-xl opacity-80 leading-relaxed font-light">
            Make it part of your routine, not a challenge. Turn off the noise, slow down, and let your mind breathe. Tomorrow’s creativity starts with tonight’s calm.
          </p>
          <button className="px-8 py-4 bg-primary text-background rounded-full font-mono text-sm uppercase tracking-widest hover:bg-secondary hover:text-white transition-colors">
            Go Reboot Yourself
          </button>
        </div>

        <div className="text-right space-y-2 opacity-50 font-mono text-xs uppercase tracking-widest">
          <p>Sleep Well Creatives © 2026</p>
          <p>Design Engineering Experiment</p>
        </div>
      </div>
    </footer>
  );
}
