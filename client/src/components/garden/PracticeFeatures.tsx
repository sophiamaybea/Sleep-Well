import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Archive, NotebookPen, FileCheck, Plus, Trash2, RotateCcw, Timer, Play, Square, ChevronDown, Sparkles, PenLine } from "lucide-react";

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

const categories = ["freewrite", "memory", "poetry", "fiction", "reflection", "weather", "fragment"] as const;
const durations = [5, 10, 15, 20] as const;

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

  return (
    <div className="max-w-3xl mx-auto" data-testid="rituals-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex items-center gap-3 mb-2">
          <Flame size={20} className="text-amber-400/60" />
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/25">Practice</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-display font-light tracking-tight italic text-white/90 mb-3" data-testid="heading-rituals">
          Writing Rituals
        </h1>
        <p className="font-serif text-white/30 mb-10">Guided prompts and timed sessions to cultivate your practice.</p>
      </motion.div>

      {!isRunning && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-6 mb-12">
          <div>
            <span className="font-mono text-[9px] tracking-widest text-white/25 uppercase block mb-3">Category</span>
            <div className="flex flex-wrap gap-1.5" data-testid="category-tabs">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => { setCategory(c); }}
                  className={`px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-widest transition-all ${category === c ? "bg-white/[0.08] text-white/80 border border-white/15" : "text-white/30 hover:text-white/50 border border-transparent"}`}
                  data-testid={`tab-category-${c}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {prompt && (
            <motion.div key={prompt.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
              <span className="font-mono text-[9px] tracking-widest text-white/20 uppercase block mb-2">Prompt</span>
              <p className="font-serif text-white/70 text-lg italic leading-relaxed" data-testid="text-prompt">{prompt.text}</p>
              <button onClick={() => refetchPrompt()} className="mt-3 font-mono text-[10px] tracking-widest text-white/25 hover:text-white/50 uppercase transition-colors" data-testid="button-new-prompt">
                ↻ New prompt
              </button>
            </motion.div>
          )}

          <div>
            <span className="font-mono text-[9px] tracking-widest text-white/25 uppercase block mb-3">Duration</span>
            <div className="flex gap-2" data-testid="duration-options">
              {durations.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDuration(d)}
                  className={`px-4 py-2 rounded-lg font-mono text-xs transition-all ${selectedDuration === d ? "bg-white/[0.08] text-white/80 border border-white/15" : "text-white/30 hover:text-white/50 border border-white/[0.06]"}`}
                  data-testid={`button-duration-${d}`}
                >
                  {d} min
                </button>
              ))}
            </div>
          </div>

          <motion.button
            onClick={startSession}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-6 py-3 bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 hover:border-amber-500/30 rounded-full font-mono text-xs uppercase tracking-widest text-white/60 hover:text-white transition-all"
            data-testid="button-start-session"
          >
            <Play size={14} />
            Start Session
          </motion.button>
        </motion.div>
      )}

      {isRunning && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 mb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Timer size={18} className="text-amber-400/60" />
              <span className="font-mono text-2xl text-white/80 tracking-wider" data-testid="text-timer">{formatTime(secondsLeft)}</span>
            </div>
            <motion.button
              onClick={stopSession}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-full font-mono text-[10px] uppercase tracking-widest text-white/40 hover:text-white/70 transition-all"
              data-testid="button-stop-session"
            >
              <Square size={12} />
              End
            </motion.button>
          </div>

          {prompt && (
            <p className="font-serif text-white/40 italic text-sm border-l-2 border-white/[0.06] pl-4" data-testid="text-active-prompt">{prompt.text}</p>
          )}

          <textarea
            value={output}
            onChange={(e) => setOutput(e.target.value)}
            placeholder="Begin writing..."
            autoFocus
            className="w-full h-64 bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 font-serif text-white/70 placeholder:text-white/15 focus:outline-none focus:border-white/15 resize-none transition-colors"
            data-testid="textarea-writing"
          />
        </motion.div>
      )}

      {sessions.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <span className="font-mono text-[9px] tracking-widest text-white/20 uppercase block mb-4">Past Sessions</span>
          <div className="space-y-3" data-testid="list-sessions">
            {sessions.map((s: any) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-4 hover:border-white/10 transition-all"
                data-testid={`card-session-${s.id}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[9px] tracking-widest text-white/20 uppercase">{s.durationMinutes} min</span>
                  <span className="font-mono text-[9px] text-white/15">{timeAgo(s.completedAt)}</span>
                </div>
                <p className="font-serif text-white/50 text-sm line-clamp-2">{s.output}</p>
              </motion.div>
            ))}
          </div>
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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex items-center gap-3 mb-2">
          <Archive size={20} className="text-emerald-400/60" />
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/25">Practice</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-display font-light tracking-tight italic text-white/90 mb-3" data-testid="heading-compost">
          Compost Heap
        </h1>
        <p className="font-serif text-white/30 mb-8">Archive for fragments, outtakes, and lines that may bloom again.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex gap-1 p-1 bg-white/[0.02] rounded-xl border border-white/[0.06]">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-2 rounded-lg font-mono text-[10px] uppercase tracking-widest transition-all ${filter === f.id ? "bg-white/[0.08] text-white/80" : "text-white/30 hover:text-white/50"}`}
              data-testid={`filter-compost-${f.id}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <motion.button
          onClick={() => setShowForm(!showForm)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-full font-mono text-[10px] uppercase tracking-widest text-white/50 hover:text-white transition-all"
          data-testid="button-add-fragment"
        >
          <Plus size={14} />
          Add Fragment
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="A fragment, a line, a passing thought..."
                className="w-full h-28 bg-transparent border border-white/[0.06] rounded-lg p-4 font-serif text-white/70 placeholder:text-white/15 focus:outline-none focus:border-white/15 resize-none transition-colors"
                data-testid="textarea-fragment"
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowForm(false)} className="px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-white/30 hover:text-white/50 transition-colors" data-testid="button-cancel-fragment">Cancel</button>
                <motion.button
                  onClick={() => newContent.trim() && addMutation.mutate(newContent.trim())}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={!newContent.trim() || addMutation.isPending}
                  className="px-5 py-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 rounded-full font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white transition-all disabled:opacity-30"
                  data-testid="button-save-fragment"
                >
                  Save
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {filtered.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 border border-dashed border-white/10 rounded-2xl">
          <Archive size={32} className="mx-auto text-white/10 mb-4" />
          <p className="font-serif text-white/30">Nothing here yet. Add a fragment to start composting.</p>
        </motion.div>
      )}

      <div className="space-y-3" data-testid="list-compost">
        {filtered.map((entry: any) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl border p-5 transition-all ${entry.isRecycled ? "border-emerald-500/10 bg-emerald-500/[0.02]" : "border-white/[0.04] bg-white/[0.01] hover:border-white/10"}`}
            data-testid={`card-compost-${entry.id}`}
          >
            <p className="font-serif text-white/60 text-sm leading-relaxed mb-3" data-testid={`text-compost-content-${entry.id}`}>{entry.content}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[9px] text-white/15">{timeAgo(entry.createdAt)}</span>
                {entry.isRecycled && (
                  <span className="font-mono text-[9px] tracking-widest text-emerald-400/50 uppercase" data-testid={`badge-recycled-${entry.id}`}>recycled</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!entry.isRecycled && (
                  <button
                    onClick={() => recycleMutation.mutate(entry.id)}
                    className="p-1.5 text-white/15 hover:text-emerald-400/60 transition-colors"
                    title="Recycle"
                    data-testid={`button-recycle-${entry.id}`}
                  >
                    <RotateCcw size={14} />
                  </button>
                )}
                <button
                  onClick={() => deleteMutation.mutate(entry.id)}
                  className="p-1.5 text-white/15 hover:text-red-400/60 transition-colors"
                  title="Delete"
                  data-testid={`button-delete-compost-${entry.id}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function GrowthJournalPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [entryText, setEntryText] = useState("");
  const [linkedWritingId, setLinkedWritingId] = useState<string>("");

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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex items-center gap-3 mb-2">
          <NotebookPen size={20} className="text-purple-400/60" />
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/25">Practice</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-display font-light tracking-tight italic text-white/90 mb-3" data-testid="heading-growth-journal">
          Growth Journal
        </h1>
        <p className="font-serif text-white/30 mb-8">Private reflections on your writing journey, linked to your pieces.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex justify-end mb-6">
        <motion.button
          onClick={() => setShowForm(!showForm)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-full font-mono text-[10px] uppercase tracking-widest text-white/50 hover:text-white transition-all"
          data-testid="button-add-journal"
        >
          <PenLine size={14} />
          New Entry
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
              <div>
                <span className="font-mono text-[9px] tracking-widest text-white/25 uppercase block mb-2">Link to a piece (optional)</span>
                <div className="relative">
                  <select
                    value={linkedWritingId}
                    onChange={(e) => setLinkedWritingId(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-2.5 font-serif text-sm text-white/60 focus:outline-none focus:border-white/15 appearance-none cursor-pointer transition-colors"
                    data-testid="select-linked-writing"
                  >
                    <option value="">No linked piece</option>
                    {writings.map((w: any) => (
                      <option key={w.id} value={w.id}>{w.title || "Untitled"}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
                </div>
              </div>
              <textarea
                value={entryText}
                onChange={(e) => setEntryText(e.target.value)}
                placeholder="Reflect on your process, breakthroughs, struggles..."
                className="w-full h-32 bg-transparent border border-white/[0.06] rounded-lg p-4 font-serif text-white/70 placeholder:text-white/15 focus:outline-none focus:border-white/15 resize-none transition-colors"
                data-testid="textarea-journal-entry"
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowForm(false)} className="px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-white/30 hover:text-white/50 transition-colors" data-testid="button-cancel-journal">Cancel</button>
                <motion.button
                  onClick={handleSubmit}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={!entryText.trim() || addMutation.isPending}
                  className="px-5 py-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 rounded-full font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white transition-all disabled:opacity-30"
                  data-testid="button-save-journal"
                >
                  Save
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {entries.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 border border-dashed border-white/10 rounded-2xl">
          <NotebookPen size={32} className="mx-auto text-white/10 mb-4" />
          <p className="font-serif text-white/30">Your journal is empty. Start reflecting on your creative journey.</p>
        </motion.div>
      )}

      <div className="space-y-3" data-testid="list-journal">
        {entries.map((entry: any) => {
          const linkedTitle = getWritingTitle(entry.linkedWritingId);
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-5 hover:border-white/10 transition-all"
              data-testid={`card-journal-${entry.id}`}
            >
              {linkedTitle && (
                <div className="flex items-center gap-2 mb-2">
                  <PenLine size={12} className="text-purple-400/40" />
                  <span className="font-mono text-[9px] tracking-widest text-purple-400/50 uppercase" data-testid={`text-linked-writing-${entry.id}`}>{linkedTitle}</span>
                </div>
              )}
              <p className="font-serif text-white/60 text-sm leading-relaxed mb-3" data-testid={`text-journal-content-${entry.id}`}>{entry.entry}</p>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] text-white/15">{timeAgo(entry.createdAt)}</span>
                <button
                  onClick={() => deleteMutation.mutate(entry.id)}
                  className="p-1.5 text-white/15 hover:text-red-400/60 transition-colors"
                  title="Delete"
                  data-testid={`button-delete-journal-${entry.id}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

const statusColors: Record<string, string> = {
  pending: "border-amber-500/30 text-amber-400/80 bg-amber-500/10",
  accepted: "border-emerald-500/30 text-emerald-400/80 bg-emerald-500/10",
  declined: "border-red-500/30 text-red-400/80 bg-red-500/10",
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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex items-center gap-3 mb-2">
          <FileCheck size={20} className="text-sky-400/60" />
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/25">Practice</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-display font-light tracking-tight italic text-white/90 mb-3" data-testid="heading-submissions">
          Submissions
        </h1>
        <p className="font-serif text-white/30 mb-10">Track your editorial journey — replant requests from the editors.</p>
      </motion.div>

      {submissions.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
          <Sparkles size={32} className="mx-auto text-white/10 mb-4" />
          <h3 className="text-xl font-display font-light italic text-white/40 mb-2" data-testid="text-empty-submissions">No replant requests yet</h3>
          <p className="font-serif text-white/25 max-w-md mx-auto leading-relaxed">
            Keep growing your pieces in the Garden. When editors discover writing that moves them, they'll send a gentle knock.
          </p>
        </motion.div>
      )}

      {submissions.length > 0 && (
        <div className="space-y-3" data-testid="list-submissions">
          {submissions.map((s: any) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-5 hover:border-white/10 transition-all"
              data-testid={`card-submission-${s.id}`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-grow min-w-0">
                  <span className="font-mono text-[9px] tracking-widest text-white/20 uppercase block mb-1">Replant Request</span>
                  <p className="font-serif text-white/60 text-sm">{s.editorNote || "An editor is interested in your piece."}</p>
                </div>
                <span
                  className={`flex-shrink-0 px-3 py-1 rounded-full font-mono text-[9px] uppercase tracking-widest border ${statusColors[s.status] || statusColors.pending}`}
                  data-testid={`badge-status-${s.id}`}
                >
                  {s.status}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[9px] text-white/15">{timeAgo(s.createdAt)}</span>
                {s.respondedAt && (
                  <span className="font-mono text-[9px] text-white/10">responded {timeAgo(s.respondedAt)}</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}