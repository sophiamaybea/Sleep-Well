import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { NotebookPen, PenLine, Trash2, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Writing } from "@shared/schema";

function timeAgo(date: string | Date | null | undefined) {
  if (!date) return "";
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function wordCount(content: string) {
  const plain = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return plain ? plain.split(" ").length : 0;
}

const stageLabel: Record<string, string> = {
  raw_seed: "Seed",
  growing: "Growing",
  ready_to_show: "Ready",
  dormant: "Dormant",
};

const stagePill: Record<string, string> = {
  raw_seed: "border-amber-500/30 text-amber-400/70",
  growing: "border-emerald-500/30 text-emerald-400/70",
  ready_to_show: "border-pink-500/30 text-pink-400/70",
  dormant: "border-violet-500/30 text-violet-400/70",
};

export default function Drafts() {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { data: writings = [], isLoading } = useQuery<Writing[]>({
    queryKey: ["writings", "drafts"],
    queryFn: async () => {
      const res = await fetch("/api/writings/drafts", { credentials: "include" });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/writings/${id}`);
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["writings", "drafts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/writings"] });
      toast({ title: "Draft deleted" });
      setConfirmDelete(null);
    },
    onError: () => {
      toast({ title: "Couldn't delete draft", variant: "destructive" });
    },
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
          <p className="font-serif text-sm text-white/45 ml-8">Unpublished pieces — visible only to you</p>
        </div>

        {writings.length === 0 ? (
          <div className="border border-dashed border-white/10 rounded-2xl p-16 text-center space-y-4">
            <NotebookPen size={32} className="mx-auto text-white/20" />
            <h3 className="text-lg font-display font-light italic text-white/50">No unpublished drafts</h3>
            <p className="font-serif text-sm text-white/30 max-w-sm mx-auto leading-relaxed">
              All your writing has been published, or visit the Garden to start something new.
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
            {writings.map((w) => {
              const readiness = w.readiness || "raw_seed";
              const isConfirming = confirmDelete === w.id;
              return (
                <div
                  key={w.id}
                  className="relative border border-white/[0.08] hover:border-white/15 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-all group"
                  data-testid={`draft-card-${w.id}`}
                >
                  {/* Delete confirm overlay */}
                  {isConfirming && (
                    <div className="absolute inset-0 z-10 flex items-center justify-between gap-4 px-5 rounded-xl bg-[#060d06]/95 border border-red-500/20">
                      <p className="font-serif text-sm text-red-300/70">Delete this draft permanently?</p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="p-1.5 text-white/40 hover:text-white/70 transition-colors"
                          data-testid={`btn-cancel-delete-${w.id}`}
                        >
                          <X size={14} />
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(w.id)}
                          disabled={deleteMutation.isPending}
                          className="px-4 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 font-mono text-[9px] uppercase tracking-widest transition-all"
                          data-testid={`btn-confirm-delete-${w.id}`}
                        >
                          {deleteMutation.isPending ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display text-lg font-light text-white/75 group-hover:text-white/90 italic transition-colors truncate">
                          {w.title || "Untitled"}
                        </h3>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          <span
                            className={`font-mono text-[8px] uppercase tracking-widest border rounded-full px-2 py-0.5 ${stagePill[readiness] || stagePill.raw_seed}`}
                          >
                            {stageLabel[readiness] || "Seed"}
                          </span>
                          <span className="font-mono text-[9px] uppercase tracking-widest text-white/40">{w.genre}</span>
                          <span className="w-px h-3 bg-white/10" />
                          <span className="font-mono text-[9px] text-white/40">
                            {wordCount(w.content).toLocaleString()} words
                          </span>
                          <span className="w-px h-3 bg-white/10" />
                          <span className="font-mono text-[9px] text-white/40">
                            {timeAgo(w.updatedAt || w.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a
                          href={`/garden?pieceId=${w.id}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:border-emerald-500/30 bg-white/[0.03] hover:bg-emerald-900/20 text-white/50 hover:text-emerald-200/80 font-mono text-[9px] uppercase tracking-widest transition-all"
                          data-testid={`btn-edit-${w.id}`}
                        >
                          <PenLine size={11} />
                          Edit
                        </a>
                        <button
                          onClick={() => setConfirmDelete(isConfirming ? null : w.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:border-red-500/20 bg-white/[0.03] hover:bg-red-950/20 text-white/40 hover:text-red-400/70 font-mono text-[9px] uppercase tracking-widest transition-all"
                          data-testid={`btn-delete-${w.id}`}
                        >
                          <Trash2 size={11} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
