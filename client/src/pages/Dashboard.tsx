import V2Layout from "@/components/V2Layout";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { PenLine, BookOpen, Compass, Users, FileCheck, Wind, ArrowRight } from "lucide-react";
import type { Writing, SubmissionCall } from "@shared/schema";


// ── helpers ──────────────────────────────────────────────────────────────────

function timeAgo(date: string | Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function stageMark(stage: string): { symbol: string; label: string; color: string } {
  switch (stage) {
    case "sprout": return { symbol: "\u2728", label: "Sprout", color: "text-emerald-400/70" };
    case "bloom":  return { symbol: "\u273f", label: "Bloom",  color: "text-amber-400/70" };
    default:       return { symbol: "\u2022", label: "Seed",   color: "text-white/25" };
  }
}

function topTags(writings: Writing[], limit = 5): string[] {
  const counts: Record<string, number> = {};
  for (const w of writings) {
    for (const tag of (w.tags ?? [])) {
      counts[tag] = (counts[tag] ?? 0) + 1;
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag);
}

function greetingForHour(): string {
  const hour = new Date().getHours();
  if (hour < 5)  return "Still awake";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

// ── component ─────────────────────────────────────────────────────────────────

export default function V2Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

    const { data: openCalls = [] } = useQuery<SubmissionCall[]>({
    queryKey: ["/api/submission-calls/open"],
    enabled: !!user,
  });
  const { data: writings = [] } = useQuery<Writing[]>({
    queryKey: ["/api/writings"],
    enabled: !!user,
  });

  // Three most recently touched pieces (not archived)
  const recentPieces = [...writings]
    .filter((w) => !w.isArchived)
    .sort((a, b) => new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime())
    .slice(0, 3);

  const tags = topTags(writings);

  const totalPieces = writings.filter((w) => !w.isArchived).length;
  const greeting = greetingForHour();
    const firstName = user?.firstName || user?.displayName || "";

  return (
    <V2Layout activeTab="garden">
      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* ── greeting ──────────────────────────────────────────────────── */}
        <div className="mb-14">
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/20 mb-3">
            {greeting}
          </p>
          <h1 className="font-serif text-3xl text-white/80 leading-snug">
            {firstName ? `${firstName}.` : "Your garden."}
          </h1>
          <p className="mt-2 text-sm text-white/30 font-serif italic">
            {totalPieces > 0
              ? `${totalPieces} piece${totalPieces === 1 ? "" : "s"} in the ground.`
              : "Nothing planted yet. That changes now."}
          </p>
        </div>

        {/* ── recent pieces ─────────────────────────────────────────────── */}
        <div className="mb-14">
          <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-white/20 mb-5">
            Recently tended
          </p>

          {recentPieces.length === 0 ? (
            <button
              onClick={() => navigate("/garden")}
              className="w-full border border-dashed border-white/10 rounded-lg p-6 text-center hover:border-white/20 transition-colors group"
            >
              <p className="font-serif text-sm text-white/30 group-hover:text-white/50 transition-colors">
                Plant your first seed.
              </p>
            </button>
          ) : (
            <div className="space-y-2">
              {recentPieces.map((piece) => {
                const mark = stageMark(piece.stage);
                const titleDisplay = piece.title?.trim() || "Untitled";
                return (
                  <button
                    key={piece.id}
                    onClick={() => navigate("/garden?pieceId=" + piece.id)}
                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-lg border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all text-left group"
                  >
                    <span className={`text-[10px] shrink-0 ${mark.color}`} title={mark.label}>
                      {mark.symbol}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-serif text-sm text-white/70 group-hover:text-white/90 transition-colors truncate">
                        {titleDisplay}
                      </p>
                      <p className="font-mono text-[9px] text-white/20 mt-0.5 uppercase tracking-widest">
                        {piece.genre} &middot; {timeAgo(piece.updatedAt ?? piece.createdAt ?? new Date())}
                      </p>
                    </div>
                    <ArrowRight size={12} className="shrink-0 text-white/10 group-hover:text-white/30 transition-colors" />
                  </button>
                );
              })}
            </div>
          )}

          {writings.length > 3 && (
            <button
              onClick={() => navigate("/garden")}
              className="mt-3 w-full text-center font-mono text-[9px] tracking-[0.25em] uppercase text-white/20 hover:text-white/40 transition-colors py-2"
            >
              Open full garden &rarr;
            </button>
          )}
        </div>
      {/* ── submission strip ────────────────────────────────────────────── */}
      {openCalls.length > 0 && (
        <div className="mb-6 rounded-lg border border-amber-500/15 bg-amber-500/[0.04] px-4 py-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-amber-300/60 mb-1">
            Open for submissions
          </p>
          <p className="font-serif text-xs text-white/60">
            {openCalls[0].title}
            {openCalls[0].endsAt
              ? " — closes " + new Date(openCalls[0].endsAt).toLocaleDateString("en-GB", { day: "numeric", month: "long" })
              : ""}
          </p>
        </div>
      )}

        {/* ── write invitation ──────────────────────────────────────────── */}
        <div className="mb-14">
          <button
            onClick={() => navigate("/garden")}
            className="w-full flex items-center justify-between px-5 py-4 rounded-lg border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] hover:border-amber-500/20 transition-all group"
          >
            <div className="flex items-center gap-3">
              <PenLine size={15} className="text-amber-500/60 group-hover:text-amber-500/90 transition-colors" />
              <span className="font-serif text-sm text-white/50 group-hover:text-white/80 transition-colors">
                Write something
              </span>
            </div>
            <ArrowRight size={12} className="text-white/10 group-hover:text-amber-500/40 transition-colors" />
          </button>
        </div>

        {/* ── tag clusters (reflective mirror, no counts) ────────────────── */}
        {tags.length > 0 && (
          <div className="mb-14">
            <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-white/20 mb-4">
              What you keep returning to
            </p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-[10px] tracking-wide text-white/25 px-2.5 py-1 border border-white/[0.06] rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── quick rooms ──────────────────────────────────────────────── */}
        <div>
          <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-white/20 mb-5">
            Rooms
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {([
              { label: "Explore",    icon: <Compass size={14} />,  href: "/garden" },
              { label: "Reading",    icon: <BookOpen size={14} />, href: "/v2/reading-room" },
              { label: "Circles",   icon: <Users size={14} />,    href: "/garden" },
              { label: "Submit",    icon: <FileCheck size={14} />, href: "/garden" },
            ] as const).map((room) => (
              <Link key={room.label} href={room.href}>
                <div className="flex flex-col items-center gap-2 px-3 py-4 rounded-lg border border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.05] hover:border-white/10 transition-all cursor-pointer">
                  <span className="text-white/25">{room.icon}</span>
                  <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/30">{room.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </V2Layout>
  );
}
