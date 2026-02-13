import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-transparent text-primary py-24 px-6 md:px-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-12">
        <div className="space-y-8 max-w-2xl">
          <h2 className="text-4xl md:text-6xl font-display font-light leading-tight italic">
            You tend your Garden.<br/>We tend our attention.
          </h2>
          <div className="flex flex-wrap gap-4">
            <Link href="/garden" className="px-8 py-4 bg-primary text-background font-mono text-sm uppercase tracking-widest hover:bg-secondary transition-colors" data-testid="footer-enter-garden">
              Enter The Garden
            </Link>
            <Link href="/gallery" className="px-8 py-4 border border-white/20 text-primary font-mono text-sm uppercase tracking-widest hover:bg-white/5 transition-colors" data-testid="footer-read-gallery">
              Read The Gallery
            </Link>
          </div>
        </div>

        <div className="text-right space-y-4">
          <Link href="/about" className="block font-mono text-xs uppercase tracking-widest text-white/40 hover:text-white/70 transition-colors" data-testid="footer-about">
            Our Philosophy
          </Link>
          <div className="space-y-2 opacity-50 font-mono text-xs uppercase tracking-widest">
            <p>The Page Gallery Journal © 2026</p>
            <p>Curated by Attention</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
