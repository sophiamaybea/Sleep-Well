import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, ChevronLeft, Feather } from "lucide-react";
import Navigation from "@/components/Navigation";
import StarBackground from "@/components/StarBackground";
import type { Writing } from "@shared/schema";

const stageColors: Record<string, string> = {
  seed: "border-amber-500/30 text-amber-400/80",
  sprout: "border-emerald-500/30 text-emerald-400/80",
  bloom: "border-pink-500/30 text-pink-400/80",
};

const stageAccent: Record<string, string> = {
  seed: "bg-amber-500/10",
  sprout: "bg-emerald-500/10",
  bloom: "bg-pink-500/10",
};

const stageDot: Record<string, string> = {
  seed: "bg-amber-400",
  sprout: "bg-emerald-400",
  bloom: "bg-pink-400",
};

const genreOptions = ["poetry", "fiction", "essay", "fragment", "other"];

function SeedIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M12 22 Q12 20 12 14" />
      <path d="M12 15 Q8 9 9 5 Q10 2 12 3 Q14 2 15 5 Q16 9 12 15Z" />
      <path d="M10 3 Q9 1 10 0 Q12 -0.5 14 0 Q15 1 14 3" />
    </svg>
  );
}

function SproutIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M12 22 Q12 20 12 12" />
      <path d="M12 16 Q7 11 6 9 Q5 7 7 6 Q9 5 11 9 L12 12Z" />
      <path d="M12 12 Q17 7 18 5 Q19 3 21 4 Q23 6 19 8 L12 12Z" />
      <path d="M12 10 Q11 5 12 2 Q13 0 14 2 Q15 5 13 9Z" />
    </svg>
  );
}

function BloomIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M12 22 Q12 20 12 14" />
      <path d="M12 12 Q8 6 5 5 Q3 4.5 4 7 Q5 9 10 12Z" />
      <path d="M12 12 Q16 6 19 5 Q21 4.5 20 7 Q19 9 14 12Z" />
      <path d="M12 12 Q12 4 11 2 Q10 0 12 0 Q14 0 13 2 Q12 4 12 12Z" />
      <path d="M12 12 Q6 10 3 11 Q1 12 3 13 Q5 14 12 12Z" />
      <path d="M12 12 Q18 10 21 11 Q23 12 21 13 Q19 14 12 12Z" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <path d="M9 18 Q8 16 6 17" />
    </svg>
  );
}

const stageIcons: Record<string, React.ReactNode> = {
  seed: <SeedIcon className="w-4 h-4" />,
  sprout: <SproutIcon className="w-4 h-4" />,
  bloom: <BloomIcon className="w-4 h-4" />,
};

function wordCount(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

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

export default function Garden() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  useLocation();
  const queryClient = useQueryClient();
  const [activeWriting, setActiveWriting] = useState<Writing | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editGenre, setEditGenre] = useState("poetry");
  const [editStage, setEditStage] = useState("seed");
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      setLastSaved(new Date());
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
      setShowDeleteConfirm(false);
    },
  });

  function openWriting(w: Writing) {
    setActiveWriting(w);
    setEditTitle(w.title);
    setEditContent(w.content);
    setEditGenre(w.genre);
    setEditStage(w.stage);
    setLastSaved(null);
    setShowDeleteConfirm(false);
  }

  const doSave = useCallback(() => {
    if (!activeWriting) return;
    setSaving(true);
    updateMutation.mutate({
      id: activeWriting.id,
      title: editTitle,
      content: editContent,
      genre: editGenre,
      stage: editStage,
    });
  }, [activeWriting, editTitle, editContent, editGenre, editStage]);

  function handleContentChange(value: string) {
    setEditContent(value);
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => doSave(), 2000);
  }

  function handleTitleChange(value: string) {
    setEditTitle(value);
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => doSave(), 2000);
  }

  useEffect(() => {
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [activeWriting]);

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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-4"
          >
            <div className="w-12 h-12 mx-auto border border-white/10 rounded-full flex items-center justify-center">
              <Feather size={20} className="text-white/30 animate-pulse" />
            </div>
            <p className="font-mono text-xs tracking-widest opacity-40 uppercase">
              Opening your garden...
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  const seedCount = writings.filter(w => w.stage === "seed").length;
  const sproutCount = writings.filter(w => w.stage === "sprout").length;
  const bloomCount = writings.filter(w => w.stage === "bloom").length;

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <StarBackground />
      <Navigation />

      <div className="relative z-10 pt-28 pb-24">
        <AnimatePresence mode="wait">
          {activeWriting ? (
            <motion.div
              key="editor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-3xl mx-auto px-6"
            >
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={() => { doSave(); setActiveWriting(null); }}
                  className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-white/40 hover:text-white transition-colors group"
                  data-testid="button-back"
                >
                  <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                  Garden
                </button>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] tracking-widest text-white/20">
                    {saving ? "saving..." : lastSaved ? `saved ${timeAgo(lastSaved)}` : ""}
                  </span>
                  <span className="font-mono text-[10px] tracking-widest text-white/20">
                    {wordCount(editContent)} words
                  </span>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2 text-white/20 hover:text-red-400/80 transition-colors"
                    data-testid="button-delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {showDeleteConfirm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 overflow-hidden"
                  >
                    <div className="border border-red-500/20 bg-red-500/5 rounded-lg p-4 flex items-center justify-between">
                      <p className="font-serif text-sm text-red-300/70">Delete this writing permanently?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                          data-testid="button-cancel-delete"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(activeWriting.id)}
                          className="px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest bg-red-500/20 text-red-300 rounded-full hover:bg-red-500/30 transition-colors"
                          data-testid="button-confirm-delete"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-6">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Title..."
                  className="w-full bg-transparent text-3xl md:text-4xl font-display font-light tracking-tight text-white/90 placeholder:text-white/15 focus:outline-none border-none italic"
                  data-testid="input-title"
                />

                <div className="flex items-center gap-4 pb-6 border-b border-white/5">
                  <div className="flex gap-1">
                    {(["seed", "sprout", "bloom"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => { setEditStage(s); setTimeout(doSave, 100); }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-widest transition-all border ${
                          editStage === s
                            ? `${stageColors[s]} ${stageAccent[s]}`
                            : "border-transparent text-white/25 hover:text-white/50"
                        }`}
                        data-testid={`button-stage-${s}`}
                      >
                        {stageIcons[s]}
                        {s}
                      </button>
                    ))}
                  </div>
                  <span className="w-[1px] h-4 bg-white/5" />
                  <select
                    value={editGenre}
                    onChange={(e) => { setEditGenre(e.target.value); setTimeout(doSave, 100); }}
                    className="bg-transparent text-white/40 font-mono text-[10px] uppercase tracking-widest border border-white/5 rounded-full px-3 py-1.5 focus:outline-none focus:border-white/15 hover:border-white/15 transition-colors cursor-pointer"
                    data-testid="select-genre"
                  >
                    {genreOptions.map((g) => (
                      <option key={g} value={g} className="bg-[#0b101a]">
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <textarea
                  ref={textareaRef}
                  value={editContent}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="Begin writing..."
                  className="w-full min-h-[65vh] bg-transparent text-lg font-serif leading-[2] text-white/75 placeholder:text-white/10 focus:outline-none resize-none border-none tracking-wide"
                  data-testid="textarea-content"
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-5xl mx-auto px-6"
            >
              <div className="mb-16">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 text-white/30">
                    <Feather size={16} />
                    <span className="font-mono text-[10px] tracking-[0.3em] uppercase">
                      Private Writing Space
                    </span>
                  </div>

                  <div className="flex items-end justify-between gap-8 flex-wrap">
                    <div>
                      <h1 className="text-4xl md:text-6xl font-display font-light tracking-tight italic text-white/90" data-testid="heading-garden">
                        {user?.firstName ? `${user.firstName}'s Garden` : "Your Garden"}
                      </h1>
                      <p className="mt-3 text-base font-serif text-white/35 max-w-lg leading-relaxed">
                        Plant seeds, nurture drafts, and let your words bloom in their own time.
                      </p>
                    </div>
                    <button
                      onClick={() => createMutation.mutate()}
                      disabled={createMutation.isPending}
                      className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 border border-white/10 rounded-full font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all group"
                      data-testid="button-new-writing"
                    >
                      <Plus size={14} className="group-hover:rotate-90 transition-transform duration-300" />
                      New Writing
                    </button>
                  </div>
                </motion.div>

                {writings.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-6 mt-8 pt-6 border-t border-white/5"
                  >
                    {[
                      { label: "Seeds", count: seedCount, color: "text-amber-400/60", dot: stageDot.seed },
                      { label: "Sprouts", count: sproutCount, color: "text-emerald-400/60", dot: stageDot.sprout },
                      { label: "Blooms", count: bloomCount, color: "text-pink-400/60", dot: stageDot.bloom },
                    ].map((stat) => (
                      <div key={stat.label} className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${stat.dot} opacity-60`} />
                        <span className="font-mono text-[10px] tracking-widest text-white/25 uppercase">
                          {stat.count} {stat.label}
                        </span>
                      </div>
                    ))}
                    <span className="font-mono text-[10px] tracking-widest text-white/15 ml-auto">
                      {writings.length} total
                    </span>
                  </motion.div>
                )}
              </div>

              {writings.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="border border-dashed border-white/10 rounded-2xl p-20 text-center space-y-8"
                  data-testid="empty-garden"
                >
                  <div className="space-y-2">
                    <SeedIcon className="w-12 h-12 mx-auto text-white/15" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-display font-light italic text-white/60">Your garden is empty</h3>
                    <p className="font-serif text-white/30 max-w-md mx-auto leading-relaxed text-sm">
                      Plant your first seed. A line, a fragment, a whole draft — whatever wants to come out.
                    </p>
                  </div>
                  <button
                    onClick={() => createMutation.mutate()}
                    className="inline-flex items-center gap-2 px-6 py-3 border border-white/10 rounded-full font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all"
                    data-testid="button-plant-seed"
                  >
                    <Plus size={14} />
                    Plant a Seed
                  </button>
                </motion.div>
              ) : (
                <div className="grid gap-3">
                  {writings.map((w, i) => (
                    <motion.button
                      key={w.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.4 }}
                      onClick={() => openWriting(w)}
                      className="w-full text-left group relative"
                      data-testid={`card-writing-${w.id}`}
                    >
                      <div className="relative p-5 md:p-6 rounded-xl border border-white/[0.04] hover:border-white/10 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-300">
                        <div className="flex items-start gap-4">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center mt-0.5 ${stageColors[w.stage]} ${stageAccent[w.stage]}`}>
                            {stageIcons[w.stage] || stageIcons.seed}
                          </div>
                          <div className="flex-grow min-w-0 space-y-1.5">
                            <div className="flex items-center justify-between gap-4">
                              <h3 className="text-lg font-display font-light truncate text-white/70 group-hover:text-white/90 transition-colors italic">
                                {w.title || "Untitled"}
                              </h3>
                              <div className="flex items-center gap-3 flex-shrink-0">
                                <span className="font-mono text-[9px] uppercase tracking-widest text-white/15">
                                  {w.genre}
                                </span>
                                <span className="font-mono text-[9px] text-white/10">
                                  {timeAgo(w.updatedAt)}
                                </span>
                              </div>
                            </div>
                            {w.content && (
                              <p className="text-sm font-serif text-white/25 line-clamp-1 group-hover:text-white/35 transition-colors">
                                {w.content.slice(0, 150)}
                              </p>
                            )}
                          </div>
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
