import { content } from "@/data";

export default function Footer() {
  return (
    <footer className="bg-background text-primary py-24 px-6 md:px-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-12">
        <div className="space-y-8 max-w-2xl">
          <h2 className="text-4xl md:text-6xl font-display font-light leading-tight italic">
            You tend your Garden.<br/>We tend our attention.
          </h2>
          <div className="flex flex-wrap gap-4">
            <button className="px-8 py-4 bg-primary text-background font-mono text-sm uppercase tracking-widest hover:bg-secondary transition-colors">
              Enter The Garden
            </button>
            <button className="px-8 py-4 border border-white/20 text-primary font-mono text-sm uppercase tracking-widest hover:bg-white/5 transition-colors">
              Read The Gallery
            </button>
          </div>
        </div>

        <div className="text-right space-y-2 opacity-50 font-mono text-xs uppercase tracking-widest">
          <p>The Page Gallery Journal © 2026</p>
          <p>Curated by Attention</p>
        </div>
      </div>
    </footer>
  );
}
