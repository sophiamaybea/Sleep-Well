import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Archive, NotebookPen, FileCheck, Plus, Trash2, RotateCcw, Timer, Play, Square, ChevronDown, Sparkles, PenLine } from "lucide-react";
import { timeAgo, GlassCard, PageHeader, ActionButton, EmptyState, FormField, inputClass, textareaClass, Badge, ProgressRing } from "./GardenUI";

const categories = ["freewrite", "memory", "poetry", "fiction", "reflection", "weather", "fragment"] as const;
const durations = [5, 10, 15, 20] as const;

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export function RitualsPage() {
  const queryClient = useQueryClient();
  const [category, setCategory] = useState<string>("freewrite");
  const [selectedDuration, setSelectedDuration] = useState<number>(10);
  const [isRunning, setIsRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [output, setOutput] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: prompt, refetch: refetchPrompt } = useQuery({
    queryKey: ["prompt", category],
    queryFn: async () => {
      const res = await fetch(`/api/prompts/random?category=${category}`, { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["rituals"],
    queryFn: async () => {
      const res = await fetch("/api/rituals", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: { promptId?: string; durationMinutes: number; output: string }) => {
      const res = await fetch("/api/rituals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rituals"] });
      setOutput("");
      setIsRunning(false);
      setSecondsLeft(0);
    },
  });

  useEffect(() => {
    if (isRunning && secondsLeft > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
      return () => clearInterval(intervalRef.current!);
    }
    if (isRunning && secondsLeft === 0 && output.trim()) {
      saveMutation.mutate({ promptId: prompt?.id, durationMinutes: selectedDuration, output });
    }
  }, [isRunning, secondsLeft]);

  const startSession = () => {
    setSecondsLeft(selectedDuration * 60);
    setIsRunning(true);
    setOutput("");
    refetchPrompt();
  };

  const stopSession = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (output.trim()) {
      saveMutation.mutate({ promptId: prompt?.id, durationMinutes: selectedDuration, output });
    } else {
      setIsRunning(false);
      setSecondsLeft(0);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const totalSeconds = selectedDuration * 60;
  const progress = totalSeconds > 0 ? 1 - secondsLeft / totalSeconds : 0;

  return (
    <div className="max-w-3xl mx-auto" data-testid="rituals-page">
      <PageHeader
        icon={<Flame size={20} />}
        label="Practice"
        title="Writing Rituals"
        subtitle="Guided prompts and timed sessions to cultivate your practice."
        accentColor="amber"
        data-testid="heading-rituals"
      />

      <AnimatePresence mode="wait">
        {!isRunning && (
          <motion.div
            key="setup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: 0.2 }}
            className="space-y-8 mb-12"
          >
            <div>
              <span className="font-mono text-[9px] tracking-widest text-white/25 uppercase block mb-3">Category</span>
              <div className="flex flex-wrap gap-1.5" data-testid="category-tabs">
                {categories.map((c) => (
                  <motion.button
                    key={c}
                    onClick={() => { setCategory(c); }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative px-3.5 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-widest transition-all duration-300 ${
                      category === c
                        ? "text-amber-300/90 border border-amber-500/30"
                        : "text-white/30 hover:text-white/50 border border-transparent hover:border-white/[0.08]"
                    }`}
                    style={category === c ? {
                      background: "linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(245,158,11,0.04) 100%)",
                      boxShadow: "0 0 20px rgba(245,158,11,0.08), inset 0 1px 0 rgba(245,158,11,0.1)",
                    } : {}}
                    data-testid={`tab-category-${c}`}
                  >
                    {category === c && (
                      <motion.div
                        layoutId="categoryGlow"
                        className="absolute inset-0 rounded-lg"
                        style={{ boxShadow: "0 0 15px rgba(245,158,11,0.15)" }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{c}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {prompt && (
              <motion.div
                key={prompt.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <GlassCard className="p-6" hoverGlow="rgba(245,158,11,0.06)">
                  <div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{
                      background: "linear-gradient(135deg, rgba(245,158,11,0.05) 0%, rgba(217,119,6,0.02) 50%, transparent 100%)",
                    }}
                  />
                  <div className="relative z-10">
                    <span className="font-mono text-[9px] tracking-widest text-amber-400/30 uppercase block mb-3">Prompt</span>
                    <p className="font-serif text-white/70 text-lg italic leading-relaxed" data-testid="text-prompt">{prompt.text}</p>
                    <motion.button
                      onClick={() => refetchPrompt()}
                      whileHover={{ scale: 1.05, x: 2 }}
                      whileTap={{ scale: 0.95 }}
                      className="mt-4 font-mono text-[10px] tracking-widest text-amber-400/30 hover:text-amber-400/60 uppercase transition-colors"
                      data-testid="button-new-prompt"
                    >
                      ↻ New prompt
                    </motion.button>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            <div>
              <span className="font-mono text-[9px] tracking-widest text-white/25 uppercase block mb-3">Duration</span>
              <div className="flex gap-2" data-testid="duration-options">
                {durations.map((d) => (
                  <motion.button
                    key={d}
                    onClick={() => setSelectedDuration(d)}
                    whileHover={{ scale: 1.08, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-5 py-2.5 rounded-xl font-mono text-xs transition-all duration-300 ${
                      selectedDuration === d
                        ? "text-amber-300/90 border border-amber-500/25"
                        : "text-white/30 hover:text-white/50 border border-white/[0.06] hover:border-white/[0.12]"
                    }`}
                    style={selectedDuration === d ? {
                      background: "linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(245,158,11,0.03) 100%)",
                      boxShadow: "0 0 16px rgba(245,158,11,0.06)",
                    } : {}}
                    data-testid={`button-duration-${d}`}
                  >
                    {d} min
                  </motion.button>
                ))}
              </div>
            </div>

            <ActionButton
              onClick={startSession}
              variant="accent"
              icon={<Play size={14} />}
              data-testid="button-start-session"
            >
              Start Session
            </ActionButton>
          </motion.div>
        )}

        {isRunning && (
          <motion.div
            key="active"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="space-y-6 mb-12"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <ProgressRing
                    progress={progress}
                    size={80}
                    strokeWidth={3}
                    color="rgba(245,158,11,0.6)"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-mono text-sm text-amber-300/80 tracking-wider" data-testid="text-timer">{formatTime(secondsLeft)}</span>
                  </div>
                </div>
                <div>
                  <span className="font-mono text-[9px] tracking-widest text-white/20 uppercase block mb-1">Session Active</span>
                  <span className="font-mono text-[10px] text-amber-400/40">{selectedDuration} min · {category}</span>
                </div>
              </div>
              <ActionButton
                onClick={stopSession}
                variant="ghost"
                size="sm"
                icon={<Square size={12} />}
                data-testid="button-stop-session"
              >
                End
              </ActionButton>
            </div>

            {prompt && (
              <motion.p
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-serif text-white/40 italic text-sm border-l-2 border-amber-500/20 pl-4"
                data-testid="text-active-prompt"
              >
                {prompt.text}
              </motion.p>
            )}

            <div className="relative group">
              <div
                className="absolute -inset-[1px] rounded-xl opacity-60 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: "linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(217,119,6,0.1) 50%, rgba(245,158,11,0.05) 100%)",
                }}
              />
              <textarea
                value={output}
                onChange={(e) => setOutput(e.target.value)}
                placeholder="Begin writing..."
                autoFocus
                className="relative w-full h-64 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-xl p-5 font-serif text-white/70 placeholder:text-white/15 focus:outline-none focus:border-amber-500/20 resize-none transition-all duration-300"
                data-testid="textarea-writing"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {sessions.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <span className="font-mono text-[9px] tracking-widest text-white/20 uppercase block mb-4">Past Sessions</span>
          <motion.div
            className="space-y-3"
            data-testid="list-sessions"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {sessions.map((s: any, i: number) => (
              <motion.div key={s.id} variants={staggerItem}>
                <GlassCard
                  className="p-5 hover:border-amber-500/10"
                  hoverGlow="rgba(245,158,11,0.04)"
                  data-testid={`card-session-${s.id}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge color="amber">{s.durationMinutes} min</Badge>
                    <span className="font-mono text-[9px] text-white/15">{timeAgo(s.completedAt)}</span>
                  </div>
                  <p className="font-serif text-white/50 text-sm line-clamp-2 leading-relaxed">{s.output}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

type CompostFilter = "all" | "active" | "recycled";

export function CompostPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<CompostFilter>("all");
  const [newContent, setNewContent] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { data: entries = [] } = useQuery({
    queryKey: ["compost"],
    queryFn: async () => {
      const res = await fetch("/api/compost", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const addMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch("/api/compost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to add");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compost"] });
      setNewContent("");
      setShowForm(false);
    },
  });

  const recycleMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/compost/${id}/recycle`, { method: "PATCH", credentials: "include" });
      if (!res.ok) throw new Error("Failed to recycle");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["compost"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/compost/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["compost"] }),
  });

  const filtered = entries.filter((e: any) => {
    if (filter === "active") return !e.isRecycled;
    if (filter === "recycled") return e.isRecycled;
    return true;
  });

  const filters: { id: CompostFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "active", label: "Active" },
    { id: "recycled", label: "Recycled" },
  ];

  return (
    <div className="max-w-3xl mx-auto" data-testid="compost-page">
      <PageHeader
        icon={<Archive size={20} />}
        label="Practice"
        title="Compost Heap"
        subtitle="Archive for fragments, outtakes, and lines that may bloom again."
        accentColor="emerald"
        data-testid="heading-compost"
        action={
          <ActionButton
            onClick={() => setShowForm(!showForm)}
            variant="default"
            icon={<Plus size={14} />}
            data-testid="button-add-fragment"
          >
            Add Fragment
          </ActionButton>
        }
      />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-8">
        <div className="inline-flex gap-1 p-1 rounded-xl border border-white/[0.06]" style={{ background: "rgba(255,255,255,0.015)" }}>
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`relative px-4 py-2 rounded-lg font-mono text-[10px] uppercase tracking-widest transition-all ${
                filter === f.id ? "text-white/85" : "text-white/30 hover:text-white/55"
              }`}
              data-testid={`filter-compost-${f.id}`}
            >
              {filter === f.id && (
                <motion.div
                  layoutId="compostFilter"
                  className="absolute inset-0 rounded-lg border border-emerald-500/15"
                  style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.02) 100%)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{f.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.98 }}
            animate={{ opacity: 1, height: "auto", scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="overflow-hidden mb-8"
          >
            <GlassCard className="p-6">
              <FormField label="New Fragment">
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="A fragment, a line, a passing thought..."
                  className={`${textareaClass} h-28`}
                  data-testid="textarea-fragment"
                />
              </FormField>
              <div className="flex justify-end gap-2 mt-4">
                <ActionButton onClick={() => setShowForm(false)} variant="ghost" size="sm" data-testid="button-cancel-fragment">
                  Cancel
                </ActionButton>
                <ActionButton
                  onClick={() => newContent.trim() && addMutation.mutate(newContent.trim())}
                  disabled={!newContent.trim() || addMutation.isPending}
                  variant="accent"
                  size="sm"
                  data-testid="button-save-fragment"
                >
                  Save
                </ActionButton>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {filtered.length === 0 && (
        <EmptyState
          icon={<Archive size={40} />}
          title="Nothing here yet"
          description="Add a fragment to start composting. Every discarded line holds a seed."
        />
      )}

      <motion.div
        className="space-y-3"
        data-testid="list-compost"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {filtered.map((entry: any) => (
          <motion.div key={entry.id} variants={staggerItem}>
            <div
              className={`relative rounded-2xl border backdrop-blur-sm p-5 transition-all duration-300 hover:border-white/[0.12] overflow-hidden ${
                entry.isRecycled
                  ? "border-emerald-500/10"
                  : "border-white/[0.06] hover:border-white/10"
              }`}
              style={{
                background: entry.isRecycled
                  ? "linear-gradient(135deg, rgba(16,185,129,0.04) 0%, rgba(255,255,255,0.01) 100%)"
                  : "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
              }}
              data-testid={`card-compost-${entry.id}`}
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl"
                style={{
                  background: entry.isRecycled
                    ? "linear-gradient(to bottom, rgba(16,185,129,0.5), rgba(16,185,129,0.1))"
                    : "linear-gradient(to bottom, rgba(255,255,255,0.12), rgba(255,255,255,0.03))",
                }}
              />
              <p className="font-serif text-white/60 text-sm leading-relaxed mb-3 pl-2" data-testid={`text-compost-content-${entry.id}`}>{entry.content}</p>
              <div className="flex items-center justify-between pl-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[9px] text-white/15">{timeAgo(entry.createdAt)}</span>
                  {entry.isRecycled && (
                    <span
                      className="inline-flex items-center gap-1 font-mono text-[9px] tracking-widest text-emerald-400/60 uppercase"
                      style={{ textShadow: "0 0 10px rgba(16,185,129,0.3)" }}
                      data-testid={`badge-recycled-${entry.id}`}
                    >
                      <RotateCcw size={10} />
                      recycled
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {!entry.isRecycled && (
                    <motion.button
                      onClick={() => recycleMutation.mutate(entry.id)}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 rounded-lg text-white/15 hover:text-emerald-400/60 hover:bg-emerald-500/[0.06] transition-all duration-200"
                      title="Recycle"
                      data-testid={`button-recycle-${entry.id}`}
                    >
                      <RotateCcw size={14} />
                    </motion.button>
                  )}
                  <motion.button
                    onClick={() => deleteMutation.mutate(entry.id)}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg text-white/15 hover:text-red-400/60 hover:bg-red-500/[0.06] transition-all duration-200"
                    title="Delete"
                    data-testid={`button-delete-compost-${entry.id}`}
                  >
                    <Trash2 size={14} />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export function GrowthJournalPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [entryText, setEntryText] = useState("");
  const [linkedWritingId, setLinkedWritingId] = useState<string>("");
  const [formFocused, setFormFocused] = useState(false);

  const { data: entries = [] } = useQuery({
    queryKey: ["growth-journal"],
    queryFn: async () => {
      const res = await fetch("/api/growth-journal", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: writings = [] } = useQuery({
    queryKey: ["writings"],
    queryFn: async () => {
      const res = await fetch("/api/writings", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const addMutation = useMutation({
    mutationFn: async (data: { linkedWritingId?: string; entry: string }) => {
      const res = await fetch("/api/growth-journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to add");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["growth-journal"] });
      setEntryText("");
      setLinkedWritingId("");
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/growth-journal/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["growth-journal"] }),
  });

  const getWritingTitle = (id: string | null) => {
    if (!id) return null;
    const w = writings.find((w: any) => w.id === id);
    return w ? w.title : null;
  };

  const handleSubmit = () => {
    if (!entryText.trim()) return;
    const data: { linkedWritingId?: string; entry: string } = { entry: entryText.trim() };
    if (linkedWritingId) data.linkedWritingId = linkedWritingId;
    addMutation.mutate(data);
  };

  return (
    <div className="max-w-3xl mx-auto" data-testid="growth-journal-page">
      <PageHeader
        icon={<NotebookPen size={20} />}
        label="Practice"
        title="Growth Journal"
        subtitle="Private reflections on your writing journey, linked to your pieces."
        accentColor="purple"
        data-testid="heading-growth-journal"
        action={
          <ActionButton
            onClick={() => setShowForm(!showForm)}
            variant="default"
            icon={<PenLine size={14} />}
            data-testid="button-add-journal"
          >
            New Entry
          </ActionButton>
        }
      />

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.98 }}
            animate={{ opacity: 1, height: "auto", scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="overflow-hidden mb-8"
          >
            <div
              className="relative rounded-2xl p-[1px] overflow-hidden"
              onFocus={() => setFormFocused(true)}
              onBlur={() => setFormFocused(false)}
            >
              <div
                className="absolute inset-0 rounded-2xl transition-opacity duration-500 pointer-events-none"
                style={{
                  background: "linear-gradient(135deg, rgba(168,85,247,0.3) 0%, rgba(139,92,246,0.1) 50%, rgba(168,85,247,0.2) 100%)",
                  opacity: formFocused ? 1 : 0,
                }}
              />
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
                  opacity: formFocused ? 0 : 1,
                }}
              />
              <div className="relative rounded-2xl border border-transparent bg-[#0a0a0f] p-6 space-y-4" style={{
                background: "linear-gradient(135deg, rgba(10,10,15,0.98) 0%, rgba(15,15,22,0.98) 100%)",
              }}>
                <FormField label="Link to a piece (optional)">
                  <div className="relative">
                    <select
                      value={linkedWritingId}
                      onChange={(e) => setLinkedWritingId(e.target.value)}
                      className={`${inputClass} appearance-none cursor-pointer pr-10`}
                      data-testid="select-linked-writing"
                    >
                      <option value="">No linked piece</option>
                      {writings.map((w: any) => (
                        <option key={w.id} value={w.id}>{w.title || "Untitled"}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
                  </div>
                </FormField>
                <FormField label="Journal Entry">
                  <textarea
                    value={entryText}
                    onChange={(e) => setEntryText(e.target.value)}
                    placeholder="Reflect on your process, breakthroughs, struggles..."
                    className={`${textareaClass} h-32`}
                    data-testid="textarea-journal-entry"
                  />
                </FormField>
                <div className="flex justify-end gap-2">
                  <ActionButton onClick={() => setShowForm(false)} variant="ghost" size="sm" data-testid="button-cancel-journal">
                    Cancel
                  </ActionButton>
                  <ActionButton
                    onClick={handleSubmit}
                    disabled={!entryText.trim() || addMutation.isPending}
                    variant="accent"
                    size="sm"
                    data-testid="button-save-journal"
                  >
                    Save
                  </ActionButton>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {entries.length === 0 && (
        <EmptyState
          icon={
            <motion.div
              animate={{ y: [0, -8, 0], rotate: [0, 3, -3, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <NotebookPen size={40} />
            </motion.div>
          }
          title="Your journal awaits"
          description="Start reflecting on your creative journey. Every insight becomes a compass for growth."
        />
      )}

      <motion.div
        className="space-y-3"
        data-testid="list-journal"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {entries.map((entry: any) => {
          const linkedTitle = getWritingTitle(entry.linkedWritingId);
          return (
            <motion.div key={entry.id} variants={staggerItem}>
              <GlassCard
                className="p-5"
                hoverGlow="rgba(168,85,247,0.04)"
                data-testid={`card-journal-${entry.id}`}
              >
                {linkedTitle && (
                  <div className="flex items-center gap-2 mb-3">
                    <Badge color="purple">
                      <PenLine size={10} />
                      <span data-testid={`text-linked-writing-${entry.id}`}>{linkedTitle}</span>
                    </Badge>
                  </div>
                )}
                <p className="font-serif text-white/60 text-sm leading-relaxed mb-3" data-testid={`text-journal-content-${entry.id}`}>{entry.entry}</p>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] text-white/15">{timeAgo(entry.createdAt)}</span>
                  <motion.button
                    onClick={() => deleteMutation.mutate(entry.id)}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg text-white/15 hover:text-red-400/60 hover:bg-red-500/[0.06] transition-all duration-200"
                    title="Delete"
                    data-testid={`button-delete-journal-${entry.id}`}
                  >
                    <Trash2 size={14} />
                  </motion.button>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

const statusConfig: Record<string, { border: string; glow: string; badge: string; text: string }> = {
  pending: {
    border: "linear-gradient(to bottom, rgba(245,158,11,0.4), rgba(245,158,11,0.08))",
    glow: "rgba(245,158,11,0.05)",
    badge: "border-amber-500/25 bg-amber-500/10 text-amber-400/80",
    text: "pending",
  },
  accepted: {
    border: "linear-gradient(to bottom, rgba(16,185,129,0.5), rgba(16,185,129,0.1))",
    glow: "rgba(16,185,129,0.05)",
    badge: "border-emerald-500/25 bg-emerald-500/10 text-emerald-400/80",
    text: "accepted",
  },
  declined: {
    border: "linear-gradient(to bottom, rgba(239,68,68,0.4), rgba(239,68,68,0.08))",
    glow: "rgba(239,68,68,0.04)",
    badge: "border-red-500/25 bg-red-500/10 text-red-400/80",
    text: "declined",
  },
};

export function SubmissionsPage() {
  const { data: submissions = [] } = useQuery({
    queryKey: ["submissions"],
    queryFn: async () => {
      const res = await fetch("/api/submissions", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  return (
    <div className="max-w-3xl mx-auto" data-testid="submissions-page">
      <PageHeader
        icon={<FileCheck size={20} />}
        label="Practice"
        title="Submissions"
        subtitle="Track your editorial journey — replant requests from the editors."
        accentColor="sky"
        data-testid="heading-submissions"
      />

      {submissions.length === 0 && (
        <EmptyState
          icon={
            <div className="relative">
              <Sparkles size={40} />
              <motion.div
                className="absolute -top-2 -right-2"
                animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5], rotate: [0, 180, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles size={16} className="text-sky-400/30" />
              </motion.div>
              <motion.div
                className="absolute -bottom-1 -left-3"
                animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <Sparkles size={12} className="text-amber-400/20" />
              </motion.div>
            </div>
          }
          title="No replant requests yet"
          description="Keep growing your pieces in the Garden. When editors discover writing that moves them, they'll send a gentle knock."
          data-testid="text-empty-submissions"
        />
      )}

      {submissions.length > 0 && (
        <motion.div
          className="space-y-3"
          data-testid="list-submissions"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {submissions.map((s: any) => {
            const config = statusConfig[s.status] || statusConfig.pending;
            return (
              <motion.div key={s.id} variants={staggerItem}>
                <div
                  className="relative rounded-2xl border border-white/[0.06] backdrop-blur-sm p-5 transition-all duration-300 hover:border-white/[0.12] overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${config.glow} 0%, rgba(255,255,255,0.01) 100%)`,
                  }}
                  data-testid={`card-submission-${s.id}`}
                >
                  <div
                    className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl"
                    style={{ background: config.border }}
                  />
                  <div className="flex items-start justify-between gap-4 mb-3 pl-2">
                    <div className="flex-grow min-w-0">
                      <span className="font-mono text-[9px] tracking-widest text-white/20 uppercase block mb-1.5">Replant Request</span>
                      <p className="font-serif text-white/60 text-sm leading-relaxed">{s.editorNote || "An editor is interested in your piece."}</p>
                    </div>
                    <span
                      className={`flex-shrink-0 px-3 py-1.5 rounded-full font-mono text-[9px] uppercase tracking-widest border ${config.badge}`}
                      style={{ boxShadow: `0 0 12px ${config.glow}` }}
                      data-testid={`badge-status-${s.id}`}
                    >
                      {s.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 pl-2">
                    <span className="font-mono text-[9px] text-white/15">{timeAgo(s.createdAt)}</span>
                    {s.respondedAt && (
                      <span className="font-mono text-[9px] text-white/10">responded {timeAgo(s.respondedAt)}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
