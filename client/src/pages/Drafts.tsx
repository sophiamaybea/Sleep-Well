import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { NotebookPen } from "lucide-react";
import type { Writing } from "@shared/schema";

export default function Drafts() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const { data: writings = [], isLoading } = useQuery<Writing[]>({
    queryKey: ["/api/writings"],
    queryFn: async () => {
      const res = await fetch("/api/writings", { credentials: "include" });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
    enabled: isAuthenticated,
  });

  if (!authLoading && !isAuthenticated) {
    setLocation("/sign-in");
    return null;
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#060d06] text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto border border-white/20 rounded-full flex items-center justify-center">
            <NotebookPen size={20} className="text-white/60 animate-pulse" />
          </div>
          <p className="font-mono text-[10px] tracking-widest text-white/40 uppercase">Loading your drafts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060d06] text-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <NotebookPen size={20} className="text-amber-400/60" />
            <h1 className="font-display text-2xl font-light italic text-white/85">Your Drafts</h1>
          </div>
          <p className="font-serif text-sm text-white/45 ml-8">All your writings in one place</p>
        </div>

        {writings.length === 0 ? (
          <div className="border border-dashed border-white/10 rounded-2xl p-16 text-center space-y-4">
            <NotebookPen size={32} className="mx-auto text-white/20" />
            <h3 className="text-lg font-display font-light italic text-white/50">No drafts yet</h3>
            <p className="font-serif text-sm text-white/30 max-w-sm mx-auto leading-relaxed">
              Visit the Garden to start writing your first piece.
            </p>
            <a
              href="/garden"
              className="inline-flex items-center gap-2 px-6 py-3 border border-emerald-600/20 hover:border-emerald-500/30 rounded-full font-mono text-[10px] uppercase tracking-widest text-emerald-200/60 hover:text-emerald-100/80 bg-emerald-900/15 hover:bg-emerald-900/25 transition-all"
            >
              Go to Garden
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {writings.map((w) => (
              <a
                key={w.id}
                href={`/garden?pieceId=${w.id}`}
                className="block p-5 border border-white/[0.08] hover:border-white/15 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-all group"
              >
                <h3 className="font-display text-lg font-light text-white/75 group-hover:text-white/90 italic transition-colors">
                  {w.title || "Untitled"}</h3>
                <div className="flex items-center gap-3 mt-2">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-white/40">{w.genre}</span>
                  <span className="w-px h-3 bg-white/10" />
                  <span className="font-mono text-[9px] text-white/40">
                    {new Date(w.updatedAt || w.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
