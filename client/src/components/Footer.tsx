import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="bg-transparent text-primary py-24 px-6 md:px-12 border-t border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(196,162,77,0.03) 0%, transparent 50%)" }} />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16 text-left">
          {/* Column 1 - Read */}
          <div className="space-y-6">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/30">Read</h3>
            <div className="flex flex-col gap-3">
              <Link href="/in-bloom" className="font-serif italic text-white/60 hover:text-white transition-colors">The Journal</Link>
              <Link href="/in-bloom" className="font-serif italic text-white/40 hover:text-white transition-colors">Current Issue</Link>
              <Link href="/in-bloom" className="font-serif italic text-white/40 hover:text-white transition-colors">Archive</Link>
              <Link href="/in-bloom" className="font-serif italic text-white/40 hover:text-white transition-colors">Contributors</Link>
            </div>
          </div>

          {/* Column 2 - Write */}
          <div className="space-y-6">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/30">Write</h3>
            <div className="flex flex-col gap-3">
              <Link href="/garden" className="font-serif italic text-white/60 hover:text-white transition-colors">The Garden</Link>
              <Link href="/how-it-works" className="font-serif italic text-white/40 hover:text-white transition-colors">How It Works</Link>
              <Link href="/garden-info" className="font-serif italic text-white/40 hover:text-white transition-colors">Seasons</Link>
              <Link href="/about" className="font-serif italic text-white/40 hover:text-white transition-colors">About</Link>
            </div>
          </div>

          {/* Column 3 - Connect */}
          <div className="space-y-6">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/30">Connect</h3>
            <div className="flex flex-col gap-3">
              <a href="https://instagram.com/pagegalleryjournal" target="_blank" rel="noopener noreferrer" className="font-serif italic text-white/60 hover:text-white transition-colors">Instagram</a>
              <a href="mailto:hello@thepagegalleryjournal.com" className="font-serif italic text-white/40 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/[0.03] flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/25">
            THE PAGE GALLERY JOURNAL &copy; 2026
          </div>
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/25">
            A JOURNAL AND A GARDEN
          </div>
        </div>
      </div>
    </footer>
  );
}
