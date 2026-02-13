import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Plus, Trash2, ChevronLeft, Feather, BookOpen, Sparkles, PenLine, ArrowRight } from "lucide-react";
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

const stageGlow: Record<string, string> = {
  seed: "rgba(245, 158, 11, 0.25)",
  sprout: "rgba(16, 185, 129, 0.25)",
  bloom: "rgba(236, 72, 153, 0.25)",
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

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 21) return "Good evening";
  return "The night is yours";
}

function AnimatedCounter({ target, duration = 1.5, delay = 0 }: { target: number; duration?: number; delay?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const timer = setTimeout(() => {
      let start = 0;
      const step = Math.max(1, Math.ceil(target / (duration * 60)));
      const interval = setInterval(() => {
        start += step;
        if (start >= target) {
          setCount(target);
          clearInterval(interval);
        } else {
          setCount(start);
        }
      }, 1000 / 60);
      return () => clearInterval(interval);
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [target, duration, delay]);
  return <>{count}</>;
}

function TiltCard({ children, className, glowColor, onClick, testId }: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  onClick?: () => void;
  testId?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const rotateX = useTransform(mouseY, [0, 1], [8, -8]);
  const rotateY = useTransform(mouseX, [0, 1], [-8, 8]);
  const springRotateX = useSpring(rotateX, { stiffness: 200, damping: 20 });
  const springRotateY = useSpring(rotateY, { stiffness: 200, damping: 20 });

  const glowX = useTransform(mouseX, [0, 1], [0, 100]);
  const glowY = useTransform(mouseY, [0, 1], [0, 100]);

  const [isHovered, setIsHovered] = useState(false);

  function handleMouseMove(e: React.MouseEvent) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  }

  function handleMouseLeave() {
    mouseX.set(0.5);
    mouseY.set(0.5);
    setIsHovered(false);
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformStyle: "preserve-3d",
        perspective: 800,
      }}
      className={`relative ${onClick ? "cursor-pointer" : "cursor-default"} ${className || ""}`}
      data-testid={testId}
    >
      {isHovered && glowColor && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none z-0"
          style={{
            background: `radial-gradient(300px circle at ${glowX.get()}% ${glowY.get()}%, ${glowColor}, transparent 70%)`,
            opacity: 0.6,
          }}
        />
      )}
      {children}
    </motion.div>
  );
}

function GrowthBar({ seedCount, sproutCount, bloomCount }: { seedCount: number; sproutCount: number; bloomCount: number }) {
  const total = seedCount + sproutCount + bloomCount;
  if (total === 0) return null;
  const seedPct = (seedCount / total) * 100;
  const sproutPct = (sproutCount / total) * 100;
  const bloomPct = (bloomCount / total) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
      style={{ transformOrigin: "left" }}
      className="w-full"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="font-mono text-[10px] tracking-[0.3em] text-white/30 uppercase">Growth Progress</span>
      </div>
      <div className="relative h-2 rounded-full bg-white/[0.04] overflow-hidden">
        <motion.div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-amber-500/60 to-amber-400/60 rounded-l-full"
          initial={{ width: 0 }}
          animate={{ width: `${seedPct}%` }}
          transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
        />
        <motion.div
          className="absolute top-0 h-full bg-gradient-to-r from-emerald-500/60 to-emerald-400/60"
          initial={{ width: 0, left: `${seedPct}%` }}
          animate={{ width: `${sproutPct}%`, left: `${seedPct}%` }}
          transition={{ delay: 1, duration: 1, ease: "easeOut" }}
        />
        <motion.div
          className="absolute top-0 h-full bg-gradient-to-r from-pink-500/60 to-pink-400/60 rounded-r-full"
          initial={{ width: 0, left: `${seedPct + sproutPct}%` }}
          animate={{ width: `${bloomPct}%`, left: `${seedPct + sproutPct}%` }}
          transition={{ delay: 1.2, duration: 1, ease: "easeOut" }}
        />
      </div>
      <div className="flex justify-between mt-2">
        {seedCount > 0 && (
          <span className="font-mono text-[9px] text-amber-400/50">{Math.round(seedPct)}% seeds</span>
        )}
        {sproutCount > 0 && (
          <span className="font-mono text-[9px] text-emerald-400/50">{Math.round(sproutPct)}% sprouts</span>
        )}
        {bloomCount > 0 && (
          <span className="font-mono text-[9px] text-pink-400/50">{Math.round(bloomPct)}% blooms</span>
        )}
      </div>
    </motion.div>
  );
}

type ViewMode = "dashboard" | "writings" | "editor";

export default function Garden() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
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
      setViewMode("dashboard");
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
    setViewMode("editor");
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
    if (textareaRef.current && viewMode === "editor") {
      textareaRef.current.focus();
    }
  }, [activeWriting, viewMode]);

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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto border border-white/10 rounded-full flex items-center justify-center">
              <Feather size={20} className="text-white/30 animate-pulse" />
            </div>
            <p className="font-mono text-xs tracking-widest opacity-40 uppercase">Opening your garden...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  const seedCount = writings.filter(w => w.stage === "seed").length;
  const sproutCount = writings.filter(w => w.stage === "sprout").length;
  const bloomCount = writings.filter(w => w.stage === "bloom").length;
  const totalWords = writings.reduce((acc, w) => acc + wordCount(w.content), 0);
  const recentWritings = [...writings].sort((a, b) =>
    new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
  ).slice(0, 3);

  const greetingText = `${getGreeting()}, ${user?.firstName || "writer"}.`;

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <StarBackground />
      <Navigation />

      <div className="relative z-10 pt-28 pb-24">
        <AnimatePresence mode="wait">
          {viewMode === "editor" && activeWriting ? (
            <motion.div
              key="editor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-3xl mx-auto px-6"
            >
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={() => { doSave(); setViewMode("dashboard"); setActiveWriting(null); }}
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
                      <option key={g} value={g} className="bg-[#0b101a]">{g}</option>
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

          ) : viewMode === "writings" ? (
            <motion.div
              key="writings"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-5xl mx-auto px-6"
            >
              <div className="mb-12">
                <button
                  onClick={() => setViewMode("dashboard")}
                  className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-white/40 hover:text-white transition-colors group mb-8"
                  data-testid="button-back-dashboard"
                >
                  <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                  Dashboard
                </button>

                <div className="flex items-end justify-between gap-8 flex-wrap">
                  <div>
                    <h1 className="text-3xl md:text-5xl font-display font-light tracking-tight italic text-white/90" data-testid="heading-all-writings">
                      All Writings
                    </h1>
                    <div className="flex items-center gap-6 mt-4">
                      {[
                        { label: "Seeds", count: seedCount, dot: stageDot.seed },
                        { label: "Sprouts", count: sproutCount, dot: stageDot.sprout },
                        { label: "Blooms", count: bloomCount, dot: stageDot.bloom },
                      ].map((stat) => (
                        <div key={stat.label} className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${stat.dot} opacity-60`} />
                          <span className="font-mono text-[10px] tracking-widest text-white/25 uppercase">
                            {stat.count} {stat.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => createMutation.mutate()}
                    disabled={createMutation.isPending}
                    className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 border border-white/10 rounded-full font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all group"
                    data-testid="button-new-writing-list"
                  >
                    <Plus size={14} className="group-hover:rotate-90 transition-transform duration-300" />
                    New Writing
                  </button>
                </div>
              </div>

              <div className="grid gap-3">
                {writings.map((w, i) => (
                  <motion.button
                    key={w.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.4 }}
                    onClick={() => openWriting(w)}
                    whileHover={{ scale: 1.01, y: -2 }}
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
                              <span className="font-mono text-[9px] uppercase tracking-widest text-white/15">{w.genre}</span>
                              <span className="font-mono text-[9px] text-white/10">{timeAgo(w.updatedAt)}</span>
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
            </motion.div>

          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-6xl mx-auto px-6"
            >
              {/* Greeting with word-by-word reveal */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="mb-16 space-y-2"
              >
                <motion.div
                  className="flex items-center gap-3 text-white/25 mb-4"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}>
                    <Feather size={16} />
                  </motion.div>
                  <span className="font-mono text-[10px] tracking-[0.3em] uppercase">Your Garden</span>
                </motion.div>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-light tracking-tight italic text-white/90" data-testid="heading-garden">
                  {greetingText.split(" ").map((word, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{ delay: 0.3 + i * 0.12, duration: 0.5 }}
                      className="inline-block mr-[0.3em]"
                    >
                      {word}
                    </motion.span>
                  ))}
                </h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.8 }}
                  className="text-lg font-serif text-white/35 max-w-xl leading-relaxed mt-4"
                >
                  Your quiet space to plant ideas and nurture them into something beautiful.
                </motion.p>
              </motion.div>

              {/* Stats cards with 3D tilt */}
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                {[
                  { label: "Seeds", count: seedCount, icon: <SeedIcon className="w-7 h-7" />, stage: "seed" },
                  { label: "Sprouts", count: sproutCount, icon: <SproutIcon className="w-7 h-7" />, stage: "sprout" },
                  { label: "Blooms", count: bloomCount, icon: <BloomIcon className="w-7 h-7" />, stage: "bloom" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.4 + i * 0.12, duration: 0.5 }}
                  >
                    <TiltCard
                      glowColor={stageGlow[stat.stage]}
                      className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 overflow-hidden hover:border-white/15 transition-all duration-500"
                      testId={`stat-${stat.stage}`}
                    >
                      <div className="relative z-10 flex items-start justify-between">
                        <div className="space-y-3">
                          <span className="font-mono text-[10px] tracking-widest text-white/30 uppercase block">{stat.label}</span>
                          <span className="text-4xl md:text-5xl font-display font-light text-white/80 block">
                            <AnimatedCounter target={stat.count} delay={0.5 + i * 0.15} />
                          </span>
                        </div>
                        <motion.div
                          className={`${stageColors[stat.stage]} opacity-40`}
                          whileHover={{ scale: 1.3, rotate: 15, opacity: 0.9 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          {stat.icon}
                        </motion.div>
                      </div>
                    </TiltCard>
                  </motion.div>
                ))}
              </div>

              {/* Growth progress bar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mb-12 rounded-xl border border-white/[0.06] bg-white/[0.02] p-6"
              >
                {writings.length > 0 ? (
                  <GrowthBar seedCount={seedCount} sproutCount={sproutCount} bloomCount={bloomCount} />
                ) : (
                  <div className="flex items-center gap-3 text-white/20">
                    <Sparkles size={14} />
                    <span className="font-mono text-[10px] tracking-widest uppercase">Plant your first seed to see growth</span>
                  </div>
                )}
              </motion.div>

              {/* Stats row with hover effects */}
              <div className="grid md:grid-cols-2 gap-4 mb-12">
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  whileHover={{ scale: 1.02, y: -3 }}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 flex items-center gap-6 cursor-default group hover:border-white/15 transition-colors"
                  data-testid="stat-words"
                >
                  <motion.div
                    className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/30 group-hover:text-white/60 group-hover:border-white/20 transition-all"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <PenLine size={20} />
                  </motion.div>
                  <div>
                    <span className="font-mono text-[10px] tracking-widest text-white/30 uppercase block mb-1">Total Words</span>
                    <span className="text-3xl font-display font-light text-white/80">
                      <AnimatedCounter target={totalWords} duration={2} delay={0.8} />
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  whileHover={{ scale: 1.02, y: -3 }}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 flex items-center gap-6 cursor-default group hover:border-white/15 transition-colors"
                  data-testid="stat-writings"
                >
                  <motion.div
                    className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/30 group-hover:text-white/60 group-hover:border-white/20 transition-all"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <BookOpen size={20} />
                  </motion.div>
                  <div>
                    <span className="font-mono text-[10px] tracking-widest text-white/30 uppercase block mb-1">Total Writings</span>
                    <span className="text-3xl font-display font-light text-white/80">
                      <AnimatedCounter target={writings.length} delay={0.9} />
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* Action buttons with magnetic effect and glow */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="flex flex-col sm:flex-row gap-3 mb-16"
              >
                <motion.button
                  onClick={() => createMutation.mutate()}
                  disabled={createMutation.isPending}
                  whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(245, 158, 11, 0.15)" }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center justify-center gap-3 px-8 py-4 bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 hover:border-amber-500/30 rounded-xl font-mono text-xs uppercase tracking-widest text-white/70 hover:text-white transition-all group"
                  data-testid="button-new-writing"
                >
                  <motion.span
                    animate={{ rotate: [0, 90, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 5 }}
                    className="inline-flex"
                  >
                    <Plus size={16} />
                  </motion.span>
                  Plant a New Seed
                </motion.button>

                {writings.length > 0 && (
                  <motion.button
                    onClick={() => setViewMode("writings")}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center justify-center gap-3 px-8 py-4 border border-white/[0.06] hover:border-white/15 rounded-xl font-mono text-xs uppercase tracking-widest text-white/40 hover:text-white/70 transition-all group"
                    data-testid="button-view-all"
                  >
                    <BookOpen size={16} />
                    View All Writings
                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </motion.button>
                )}
              </motion.div>

              {/* Recent activity with interactive cards */}
              {recentWritings.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <motion.h2
                      className="font-mono text-[10px] tracking-[0.3em] text-white/30 uppercase"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 }}
                    >
                      Recent Activity
                    </motion.h2>
                    {writings.length > 3 && (
                      <motion.button
                        onClick={() => setViewMode("writings")}
                        whileHover={{ x: 4 }}
                        className="font-mono text-[10px] tracking-widest text-white/20 hover:text-white/50 transition-colors uppercase flex items-center gap-1"
                        data-testid="link-see-all"
                      >
                        See all
                        <ArrowRight size={10} />
                      </motion.button>
                    )}
                  </div>

                  <div className="grid gap-3">
                    {recentWritings.map((w, i) => (
                      <motion.button
                        key={w.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1 + i * 0.08, duration: 0.5 }}
                        onClick={() => openWriting(w)}
                        whileHover={{ scale: 1.015, x: 6 }}
                        whileTap={{ scale: 0.99 }}
                        className="w-full text-left group relative"
                        data-testid={`card-recent-${w.id}`}
                      >
                        <div className="relative p-5 md:p-6 rounded-xl border border-white/[0.04] hover:border-white/10 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-300 overflow-hidden">
                          <motion.div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                            style={{
                              background: `linear-gradient(90deg, ${stageGlow[w.stage] || stageGlow.seed} 0%, transparent 60%)`,
                            }}
                          />
                          <div className="relative z-10 flex items-start gap-4">
                            <motion.div
                              className={`flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center mt-0.5 ${stageColors[w.stage]} ${stageAccent[w.stage]}`}
                              whileHover={{ scale: 1.2, rotate: 10 }}
                            >
                              {stageIcons[w.stage] || stageIcons.seed}
                            </motion.div>
                            <div className="flex-grow min-w-0 space-y-1.5">
                              <div className="flex items-center justify-between gap-4">
                                <h3 className="text-lg font-display font-light truncate text-white/70 group-hover:text-white/90 transition-colors italic">
                                  {w.title || "Untitled"}
                                </h3>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                  <span className="font-mono text-[9px] uppercase tracking-widest text-white/15 group-hover:text-white/30 transition-colors">{w.genre}</span>
                                  <span className="font-mono text-[9px] text-white/10 group-hover:text-white/25 transition-colors">{timeAgo(w.updatedAt)}</span>
                                  <ArrowRight size={12} className="text-white/0 group-hover:text-white/30 transition-all group-hover:translate-x-1" />
                                </div>
                              </div>
                              {w.content && (
                                <p className="text-sm font-serif text-white/25 line-clamp-1 group-hover:text-white/40 transition-colors">
                                  {w.content.slice(0, 150)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Empty state with animated icons */}
              {writings.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="border border-dashed border-white/10 rounded-2xl p-16 md:p-20 text-center space-y-8 hover:border-white/15 transition-colors"
                  data-testid="empty-garden"
                >
                  <div className="flex items-center justify-center gap-8">
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                    >
                      <SeedIcon className="w-10 h-10 text-amber-400/20" />
                    </motion.div>
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 1, delay: 0.3 }}
                    >
                      <SproutIcon className="w-12 h-12 text-emerald-400/20" />
                    </motion.div>
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 1, delay: 0.6 }}
                    >
                      <BloomIcon className="w-10 h-10 text-pink-400/20" />
                    </motion.div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl md:text-3xl font-display font-light italic text-white/60">
                      Your garden awaits its first seed
                    </h3>
                    <p className="font-serif text-white/30 max-w-md mx-auto leading-relaxed text-base">
                      A line, a fragment, a whole draft — whatever wants to come out. Plant it and watch it grow.
                    </p>
                  </div>
                  <motion.button
                    onClick={() => createMutation.mutate()}
                    whileHover={{ scale: 1.08, boxShadow: "0 0 40px rgba(245, 158, 11, 0.15)" }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-3 px-8 py-3.5 bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 hover:border-amber-500/30 rounded-full font-mono text-xs uppercase tracking-widest text-white/60 hover:text-white transition-all group"
                    data-testid="button-plant-seed"
                  >
                    <motion.span
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      <Sparkles size={14} className="group-hover:text-amber-400 transition-colors" />
                    </motion.span>
                    Plant Your First Seed
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
