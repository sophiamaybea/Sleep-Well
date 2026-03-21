import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { Plus, BookOpen, Lock, Globe, Link2, ArrowLeft } from "lucide-react";

type Collection = {
  id: string;
  authorId: string;
  title: string;
  description: string;
  coverNote: string | null;
  isPublic: boolean;
  allowTip: boolean;
  tipAmountPence: number;
  paypalLink: string | null;
  shareSlug: string | null;
  createdAt: string;
  updatedAt: string;
  items?: CollectionItem[];
};

type CollectionItem = {
  id: string;
  collectionId: string;
  writingId: string;
  sortOrder: number;
  note: string | null;
  writing?: { id: string; title: string; readiness: string };
};

export default function Collections() {
  const { user } = useAuth();
  const [, params] = useRoute("/garden/collections/:id");
  const collectionId = params?.id;
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const { data: collections = [], isLoading } = useQuery<Collection[]>({
    queryKey: ["/api/collections"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/collections");
      return res.json();
    },
    enabled: !!user,
  });

  const { data: activeCollection } = useQuery<Collection>({
    queryKey: ["/api/collections", collectionId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/collections/${collectionId}`);
      const data = await res.json();
      return data.collection || data;
    },
    enabled: !!collectionId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; isPublic: boolean }) => {
      const res = await apiRequest("POST", "/api/collections", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/collections"] });
      setShowCreate(false);
      setNewTitle("");
      setNewDesc("");
      toast({ title: "Bed planted.", description: "Your collection is ready to gather seeds." });
    },
    onError: () => toast({ title: "Could not create collection.", variant: "destructive" }),
  });

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/collections/${slug}`);
    toast({ title: "Link copied.", description: "Your bed now has a gate." });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center relative z-10">
        <p className="font-mono text-white/40">Sign in to tend your beds.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative z-10">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4 flex items-center gap-4 bg-[#0d0d0d]">
        <Link href="/garden">
          <button className="text-white/50 hover:text-white/80 transition-colors">
            <ArrowLeft size={18} />
          </button>
        </Link>
        <div>
          <h1 className="font-serif text-xl text-white">Collections & Beds</h1>
          <p className="font-mono text-[10px] text-white/40 tracking-widest uppercase mt-0.5">
            Gather your seeds into something that resembles a book
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-emerald-900/40 border border-emerald-800/40 text-emerald-400 font-mono text-xs rounded-lg hover:bg-emerald-900/60 transition-colors"
        >
          <Plus size={14} />
          New bed
        </button>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/10 rounded-xl p-6 w-full max-w-md">
            <h2 className="font-serif text-lg text-white mb-1">Plant a new bed</h2>
            <p className="font-mono text-[10px] text-white/40 mb-4">
              You can start with two poems that seem to look at each other.
            </p>
            <input
              type="text"
              placeholder="Title (required)"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 font-mono text-sm text-white placeholder-white/30 mb-3 outline-none focus:border-emerald-700/50"
            />
            <textarea
              placeholder="What is this bed growing toward? (optional)"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 font-mono text-sm text-white placeholder-white/30 mb-3 outline-none focus:border-emerald-700/50 resize-none"
            />
            <label className="flex items-center gap-2 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={e => setIsPublic(e.target.checked)}
                className="accent-emerald-600"
              />
              <span className="font-mono text-xs text-white/60">Make this bed visible in the Garden</span>
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => createMutation.mutate({ title: newTitle, description: newDesc, isPublic })}
                disabled={!newTitle.trim() || createMutation.isPending}
                className="flex-1 bg-emerald-900/60 border border-emerald-700/40 text-emerald-300 font-mono text-xs py-2 rounded-lg hover:bg-emerald-900/80 disabled:opacity-40 transition-colors"
              >
                {createMutation.isPending ? "Planting..." : "Plant this bed"}
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 text-white/40 font-mono text-xs hover:text-white/70 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="text-center py-16">
            <p className="font-mono text-xs text-white/30">Tending...</p>
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen size={32} className="mx-auto mb-4 text-white/20" />
            <h2 className="font-serif text-lg text-white/60 mb-2">No beds yet.</h2>
            <p className="font-mono text-xs text-white/30 mb-6">
              You can start with two poems that seem to look at each other. Name the space between them.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-6 py-2 bg-emerald-900/30 border border-emerald-800/30 text-emerald-400 font-mono text-xs rounded-lg hover:bg-emerald-900/50 transition-colors"
            >
              Create a collection
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {collections.map((c) => (
              <Link key={c.id} href={`/garden/collections/${c.id}`}>
                <div className="group border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] rounded-xl p-5 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-serif text-white text-base truncate">{c.title}</h3>
                        {c.isPublic ? (
                          <Globe size={12} className="text-emerald-500 shrink-0" />
                        ) : (
                          <Lock size={12} className="text-white/30 shrink-0" />
                        )}
                      </div>
                      {c.description && (
                        <p className="font-mono text-xs text-white/40 line-clamp-1">{c.description}</p>
                      )}
                      <p className="font-mono text-[10px] text-white/20 mt-2">
                        Watered {new Date(c.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    {c.shareSlug && (
                      <button
                        onClick={e => { e.preventDefault(); copyLink(c.shareSlug!); }}
                        className="ml-3 p-2 text-white/30 hover:text-white/60 transition-colors opacity-0 group-hover:opacity-100"
                        title="Copy share link"
                      >
                        <Link2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
