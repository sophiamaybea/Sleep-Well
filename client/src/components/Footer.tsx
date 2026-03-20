import { Link } from "wouter";
import { Instagram, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative py-32 px-6 md:px-12">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, transparent 0%, rgba(6,13,6,0.8) 100%)" }} />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-20">
          {/* Read */}
          <div className="space-y-6">
            <h3 className="font-mono text-[10px] tracking-[0.3em] text-white/25">Read</h3>
            <div className="flex flex-col gap-4">
              <Link href="/in-bloom" className="font-serif italic text-white/50 hover:text-white transition-colors duration-500">The Journal</Link>
              <Link href="/in-bloom" className="font-serif italic text-white/30 hover:text-white/70 transition-colors duration-500">Current Issue</Link>
              <Link href="/publications" className="font-serif italic text-white/30 hover:text-white/70 transition-colors duration-500">Archive</Link>
              <Link href="/publications" className="font-serif italic text-white/30 hover:text-white/70 transition-colors duration-500">Contributors</Link>
            </div>
          </div>
          {/* Write */}
          <div className="space-y-6">
            <h3 className="font-mono text-[10px] tracking-[0.3em] text-white/25">Write</h3>
            <div className="flex flex-col gap-4">
              <Link href="/garden" className="font-serif italic text-white/50 hover:text-white transition-colors duration-500">The Garden</Link>
              <Link href="/how-it-works" className="font-serif italic text-white/30 hover:text-white/70 transition-colors duration-500">How It Works</Link>
              <Link href="/garden-info" className="font-serif italic text-white/30 hover:text-white/70 transition-colors duration-500">Seasons</Link>
              <Link href="/about" className="font-serif italic text-white/30 hover:text-white/70 transition-colors duration-500">About</Link>
            </div>
          </div>
          {/* Connect */}
          <div className="space-y-6">
            <h3 className="font-mono text-[10px] tracking-[0.3em] text-white/25">Connect</h3>
            <div className="flex flex-col gap-4">
              <a
                href="https://instagram.com/pagegalleryjournal"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 font-serif italic text-white/60 hover:text-white transition-colors duration-500 group"
              >
                <Instagram size={14} className="opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                <span>@pagegalleryjournal</span>
              </a>
                      <a href="mailto:submissions@pagegalleryjournal.com"
                <Mail size={14} className="opacity-40 group-hover:opacity-70 transition-opacity duration-500" />
                <span>Contact</span>
              </a>
              <Link href="/privacy" className="font-serif italic text-white/30 hover:text-white/70 transition-colors duration-500">Privacy</Link>
              <Link href="/terms" className="font-serif italic text-white/30 hover:text-white/70 transition-colors duration-500">Terms</Link>
              <Link href="/accessibility" className="font-serif italic text-white/30 hover:text-white/70 transition-colors duration-500">Accessibility</Link>
            </div>
          </div>
        </div>
        <div className="pt-12 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-mono text-[9px] tracking-[0.25em] text-white/15">
            THE PAGE GALLERY JOURNAL &copy; 2026
          </div>
          <div className="font-serif italic text-[11px] text-white/15">
            A journal and a garden
          </div>
        </div>
      </div>
    </footer>
  );
}
