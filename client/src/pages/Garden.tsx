import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Save, ChevronLeft, Sprout, Flower2, TreePine, Feather } from "lucide-react";
import Navigation from "@/components/Navigation";
import StarBackground from "@/components/StarBackground";
import type { Writing } from "@shared/schema";

const stageIcons: Record<string, React.ReactNode> = {
  seed: <Sprout size={16} />,
  sprout: <Flower2 size={16} />,
  bloom: <TreePine size={16} />,
};

const stageLabels: Record<string, string> = {
  seed: "Seed",
  sprout: "Sprout",
  bloom: "Bloom",
};

const genreOptions = ["poetry", "fiction", "essay", "fragment", "other"];

export default function Garden() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [activeWriting, setActiveWriting] = useState<Writing | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editGenre, setEditGenre] = useState("poetry");
  const [editStage, setEditStage] = useState("seed");
  const [saving, setSaving] = useState(false);

  const { data: writings = [], isLoading } = useQuery<Writing[]>({
    queryKey: ["/api/writings"],
    queryFn: async () => {
      const res = await fetch("/api/writings", { credentials: "include" });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/writings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: "Untitled", content: "", genre: "poetry", stage: "seed" }),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: (data: Writing) => {
      queryClient.invalidateQueries({ queryKey: ["/api/writings"] });
      openWriting(data);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; title: string; content: string; genre: string; stage: string }) => {
      const res = await fetch(`/api/writings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/writings"] });
      setSaving(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/writings/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/writings"] });
      setActiveWriting(null);
    },
  });

  function openWriting(w: Writing) {
    setActiveWriting(w);
    setEditTitle(w.title);
    setEditContent(w.content);
    setEditGenre(w.genre);
    setEditStage(w.stage);
  }

  function handleSave() {
    if (!activeWriting) return;
    setSaving(true);
    updateMutation.mutate({
      id: activeWriting.id,
      title: editTitle,
      content: editContent,
      genre: editGenre,
      stage: editStage,
    });
  }

  if (!authLoading && !isAuthenticated) {
    window.location.href = "/api/login";
    return null;
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground relative">
        <StarBackground />
        <Navigation />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="font-mono text-xs tracking-widest opacity-40 animate-pulse uppercase">
            Opening your Garden...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <StarBackground />
      <Navigation />

      <div className="relative z-10 pt-32 pb-24 px-6 md:px-12 max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          {activeWriting ? (
            <motion.div
              key="editor"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={() => setActiveWriting(null)}
                  className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors"
                  data-testid="button-back"
                >
                  <ChevronLeft size={16} />
                  Back to Garden
                </button>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => deleteMutation.mutate(activeWriting.id)}
                    className="p-2 text-white/30 hover:text-red-400 transition-colors"
                    data-testid="button-delete"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 border border-white/10 rounded-full font-mono text-xs uppercase tracking-widest text-white/70 hover:text-white hover:border-white/30 transition-all disabled:opacity-40"
                    data-testid="button-save"
                  >
                    <Save size={14} />
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Title..."
                  className="w-full bg-transparent text-4xl md:text-5xl font-display font-light tracking-tight text-white placeholder:text-white/20 focus:outline-none border-none"
                  data-testid="input-title"
                />

                <div className="flex items-center gap-6 border-b border-white/5 pb-6">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-white/30">Stage</span>
                    <div className="flex gap-1">
                      {(["seed", "sprout", "bloom"] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => setEditStage(s)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-widest transition-all ${
                            editStage === s
                              ? "bg-white/10 text-white border border-white/20"
                              : "text-white/30 hover:text-white/60"
                          }`}
                          data-testid={`button-stage-${s}`}
                        >
                          {stageIcons[s]}
                          {stageLabels[s]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <span className="w-[1px] h-4 bg-white/10" />
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-white/30">Genre</span>
                    <select
                      value={editGenre}
                      onChange={(e) => setEditGenre(e.target.value)}
                      className="bg-transparent text-white/60 font-mono text-xs uppercase tracking-widest border border-white/10 rounded-full px-3 py-1.5 focus:outline-none focus:border-white/20"
                      data-testid="select-genre"
                    >
                      {genreOptions.map((g) => (
                        <option key={g} value={g} className="bg-[#0b101a]">
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Begin writing..."
                  className="w-full min-h-[60vh] bg-transparent text-lg font-serif leading-relaxed text-white/80 placeholder:text-white/15 focus:outline-none resize-none border-none"
                  data-testid="textarea-content"
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-12"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Feather size={20} className="text-white/40" />
                  <span className="font-mono text-xs tracking-[0.3em] opacity-40 uppercase">
                    Your Garden
                  </span>
                </div>
                <div className="flex items-end justify-between gap-8">
                  <div>
                    <h1 className="text-5xl md:text-6xl font-display font-light tracking-tight italic">
                      {user?.firstName ? `${user.firstName}'s Garden` : "Your Garden"}
                    </h1>
                    <p className="mt-4 text-lg font-serif text-white/50 max-w-xl">
                      A private space for your words. Write freely — seeds grow into sprouts, sprouts into blooms.
                    </p>
                  </div>
                  <button
                    onClick={() => createMutation.mutate()}
                    disabled={createMutation.isPending}
                    className="flex-shrink-0 flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-full font-mono text-xs uppercase tracking-widest text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
                    data-testid="button-new-writing"
                  >
                    <Plus size={16} />
                    New Writing
                  </button>
                </div>
              </div>

              {writings.length === 0 ? (
                <div className="border border-white/5 rounded-xl p-16 text-center space-y-6">
                  <div className="w-16 h-16 mx-auto border border-white/10 rounded-full flex items-center justify-center">
                    <Sprout size={24} className="text-white/30" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-light mb-2">Your garden is empty</h3>
                    <p className="font-serif text-white/40 max-w-md mx-auto">
                      Plant your first seed. Write a line, a fragment, a whole draft — whatever wants to come out.
                    </p>
                  </div>
                  <button
                    onClick={() => createMutation.mutate()}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-full font-mono text-xs uppercase tracking-widest text-white/70 hover:text-white hover:bg-white/10 transition-all"
                    data-testid="button-plant-seed"
                  >
                    <Plus size={16} />
                    Plant a Seed
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {writings.map((w, i) => (
                    <motion.button
                      key={w.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => openWriting(w)}
                      className="w-full text-left group p-6 md:p-8 border border-white/5 rounded-xl hover:border-white/10 hover:bg-white/[0.02] transition-all"
                      data-testid={`card-writing-${w.id}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2 flex-grow min-w-0">
                          <div className="flex items-center gap-3">
                            <span className="text-white/30">{stageIcons[w.stage] || stageIcons.seed}</span>
                            <h3 className="text-xl font-display font-light truncate group-hover:text-white transition-colors">
                              {w.title || "Untitled"}
                            </h3>
                          </div>
                          {w.content && (
                            <p className="text-sm font-serif text-white/30 line-clamp-2 pl-8">
                              {w.content.slice(0, 200)}
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0 flex items-center gap-3">
                          <span className="font-mono text-[10px] uppercase tracking-widest text-white/20">
                            {w.genre}
                          </span>
                          <span className="font-mono text-[10px] text-white/15">
                            {w.updatedAt ? new Date(w.updatedAt).toLocaleDateString() : ""}
                          </span>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
