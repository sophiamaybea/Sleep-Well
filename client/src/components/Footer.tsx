import { Link } from "wouter";
import { Instagram, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative py-24 px-6 md:px-12 bg-[#EDE7D9] border-t border-[rgba(107,42,42,0.1)]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-20">
          {/* Read */}
          <div className="space-y-6">
            <h3 className="font-mono text-[length:var(--text-label)] tracking-[0.3em] text-[#1C1208]/40 uppercase">Read</h3>
            <div className="flex flex-col gap-4">
              <Link href="/in-bloom" className="font-display italic text-[#1C1208]/70 hover:text-[#6B2A2A] transition-colors duration-400">The Journal</Link>
              <Link href="/in-bloom" className="font-display italic text-[#1C1208]/50 hover:text-[#6B2A2A] transition-colors duration-400">Current Issue</Link>
              <Link href="/publications" className="font-display italic text-[#1C1208]/50 hover:text-[#6B2A2A] transition-colors duration-400">Archive</Link>
              <Link href="/publications" className="font-display italic text-[#1C1208]/50 hover:text-[#6B2A2A] transition-colors duration-400">Contributors</Link>
            </div>
          </div>
          {/* Write */}
          <div className="space-y-6">
            <h3 className="font-mono text-[length:var(--text-label)] tracking-[0.3em] text-[#1C1208]/40 uppercase">Write</h3>
            <div className="flex flex-col gap-4">
              <Link href="/garden" className="font-display italic text-[#1C1208]/70 hover:text-[#6B2A2A] transition-colors duration-400">The Desk</Link>
              <Link href="/how-it-works" className="font-display italic text-[#1C1208]/50 hover:text-[#6B2A2A] transition-colors duration-400">How It Works</Link>
              <Link href="/editions/founding" className="font-display italic text-[#1C1208]/50 hover:text-[#6B2A2A] transition-colors duration-400">Founding Editions</Link>
              <Link href="/about" className="font-display italic text-[#1C1208]/50 hover:text-[#6B2A2A] transition-colors duration-400">About</Link>
            </div>
          </div>
          {/* Connect */}
          <div className="space-y-6">
            <h3 className="font-mono text-[length:var(--text-label)] tracking-[0.3em] text-[#1C1208]/40 uppercase">Connect</h3>
            <div className="flex flex-col gap-4">
              <a
                href="https://instagram.com/pagegalleryjournal"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 font-display italic text-[#1C1208]/60 hover:text-[#6B2A2A] transition-colors duration-400 group"
              >
                <Instagram size={14} className="opacity-60 group-hover:opacity-100 transition-opacity duration-400" />
                <span>@pagegalleryjournal</span>
              </a>
              <a href="mailto:submissions@pagegalleryjournal.com" className="flex items-center gap-2 font-display italic text-[#1C1208]/60 hover:text-[#6B2A2A] transition-colors duration-400 group">
                <Mail size={14} className="opacity-40 group-hover:opacity-70 transition-opacity duration-400" />
                <span>Contact</span>
              </a>
              <Link href="/privacy" className="font-display italic text-[#1C1208]/50 hover:text-[#6B2A2A] transition-colors duration-400">Privacy</Link>
              <Link href="/terms" className="font-display italic text-[#1C1208]/50 hover:text-[#6B2A2A] transition-colors duration-400">Terms</Link>
              <Link href="/accessibility" className="font-display italic text-[#1C1208]/50 hover:text-[#6B2A2A] transition-colors duration-400">Accessibility</Link>
            </div>
          </div>
        </div>
        <div className="studio-section-divider mb-8" />
        <div className="pt-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-mono text-[length:var(--text-label)] tracking-[0.25em] text-[#1C1208]/30 uppercase">
            The Page Gallery Journal &copy; 2026
          </div>
          <div className="font-handwritten text-base text-[#1C1208]/30">
            A journal and a studio
          </div>
        </div>
      </div>
    </footer>
  );
}

