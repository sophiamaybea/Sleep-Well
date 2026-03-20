import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-6 relative z-10">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="font-display text-6xl md:text-8xl font-light text-white/20 italic">
          404
        </h1>
        <p className="font-serif text-xl md:text-2xl italic text-white/60">
          This page has wandered off.
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/30">
          The path you followed doesn't lead anywhere — yet.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
          <Link
            href="/"
            className="px-8 py-3 bg-white/[0.06] border border-white/20 backdrop-blur-sm font-mono text-[10px] uppercase tracking-[0.2em] text-white/70 hover:bg-white/10 hover:text-white transition-all duration-300 rounded-full"
          >
            Return Home
          </Link>
          <Link
            href="/in-bloom"
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors border-b border-transparent hover:border-white/20 pb-1"
          >
            Read the Journal
          </Link>
        </div>
      </div>
    </div>
  );
}
