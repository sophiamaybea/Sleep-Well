import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { CloudSun, Brain, CalendarRange, Network, Plus, Trash2, Sun, Cloud, CloudRain, CloudLightning, CloudFog, Moon, Sparkles, PenLine } from "lucide-react";

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
  return <>{count.toLocaleString()}</>;
}

const moods = ["sunny", "cloudy", "rainy", "stormy", "foggy", "starlit", "aurora"] as const;

const moodIcons: Record<string, React.ReactNode> = {
  sunny: <Sun size={20} />,
  cloudy: <Cloud size={20} />,
  rainy: <CloudRain size={20} />,
  stormy: <CloudLightning size={20} />,
  foggy: <CloudFog size={20} />,
  starlit: <Moon size={20} />,
  aurora: <Sparkles size={20} />,
};

const moodColors: Record<string, string> = {
  sunny: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  cloudy: "text-slate-300 border-slate-400/30 bg-slate-400/10",
  rainy: "text-blue-400 border-blue-500/30 bg-blue-500/10",
  stormy: "text-violet-400 border-violet-500/30 bg-violet-500/10",
  foggy: "text-gray-400 border-gray-400/30 bg-gray-400/10",
  starlit: "text-indigo-300 border-indigo-400/30 bg-indigo-400/10",
  aurora: "text-emerald-300 border-emerald-400/30 bg-emerald-400/10",
};

const moodDotColors: Record<string, string> = {
  sunny: "bg-amber-400",
  cloudy: "bg-slate-400",
  rainy: "bg-blue-400",
  stormy: "bg-violet-400",
  foggy: "bg-gray-400",
  starlit: "bg-indigo-400",
  aurora: "bg-emerald-400",
};

export function InnerWeatherPage() {
  const queryClient = useQueryClient();
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [energy, setEnergy] = useState(5);
  const [note, setNote] = useState("");

  const { data: entries = [] } = useQuery<any[]>({
    queryKey: ["inner-weather"],
    queryFn: async () => {
      const res = await fetch("/api/inner-weather", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { mood: string; energy: number; note?: string }) => {
      const res = await fetch("/api/inner-weather", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to log mood");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inner-weather"] });
      setSelectedMood("");
      setEnergy(5);
      setNote("");
    },
  });

  const handleSubmit = () => {
    if (!selectedMood) return;
    createMutation.mutate({ mood: selectedMood, energy, note: note.trim() || undefined });
  };

  const last7 = entries.slice(0, 7);

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex items-center gap-3 mb-2">
          <CloudSun size={16} className="text-white/25" />
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/25">Inner Weather</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-display font-light tracking-tight italic text-white/90 mb-3" data-testid="heading-inner-weather">
          How's Your Sky?
        </h1>
        <p className="text-base font-serif text-white/30 mb-10">Track the weather inside. No judgment, just observation.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 md:p-8 mb-10"
        data-testid="form-inner-weather"
      >
        <p className="font-mono text-[10px] tracking-widest uppercase text-white/25 mb-4">Select your mood</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {moods.map((m) => (
            <motion.button
              key={m}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedMood(m)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all font-mono text-[11px] capitalize ${
                selectedMood === m ? moodColors[m] : "border-white/[0.06] text-white/30 hover:text-white/50 hover:border-white/15"
              }`}
              data-testid={`mood-${m}`}
            >
              {moodIcons[m]}
              {m}
            </motion.button>
          ))}
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] tracking-widest uppercase text-white/25">Energy Level</span>
            <span className="font-mono text-sm text-white/50">{energy}/10</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={energy}
            onChange={(e) => setEnergy(Number(e.target.value))}
            className="w-full accent-white/50 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
            data-testid="slider-energy"
          />
          <div className="flex justify-between mt-1">
            <span className="font-mono text-[9px] text-white/15">Low</span>
            <span className="font-mono text-[9px] text-white/15">High</span>
          </div>
        </div>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Any notes about how you're feeling... (optional)"
          rows={2}
          className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm font-serif text-white/70 placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors mb-4 resize-none"
          data-testid="input-weather-note"
        />

        <motion.button
          onClick={handleSubmit}
          disabled={!selectedMood || createMutation.isPending}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-6 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 rounded-full font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          data-testid="button-log-weather"
        >
          <Plus size={14} />
          Log Weather
        </motion.button>
      </motion.div>

      {last7.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="mb-10"
        >
          <p className="font-mono text-[10px] tracking-widest uppercase text-white/25 mb-4">Your last 7 entries</p>
          <div className="flex items-center gap-2 mb-6">
            {last7.map((entry: any, i: number) => (
              <motion.div
                key={entry.id || i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.06 }}
                className={`w-4 h-4 rounded-full ${moodDotColors[entry.mood] || "bg-white/20"}`}
                title={`${entry.mood} - Energy: ${entry.energy}`}
                data-testid={`mood-dot-${i}`}
              />
            ))}
          </div>
        </motion.div>
      )}

      <div className="space-y-3">
        <AnimatePresence>
          {entries.map((entry: any, i: number) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: i * 0.04, duration: 0.4 }}
              className="rounded-xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] p-5 transition-all"
              data-testid={`card-weather-${entry.id}`}
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full border flex items-center justify-center ${moodColors[entry.mood] || "text-white/30 border-white/10"}`}>
                  {moodIcons[entry.mood] || <CloudSun size={18} />}
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <span className="font-display text-lg font-light italic text-white/70 capitalize">{entry.mood}</span>
                    <span className="font-mono text-[9px] text-white/15">{timeAgo(entry.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-white/25">Energy: {entry.energy}/10</span>
                  </div>
                  {entry.note && <p className="text-sm font-serif text-white/40 mt-2 leading-relaxed">{entry.note}</p>}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function ReflectionsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [topic, setTopic] = useState("");
  const [body, setBody] = useState("");
  const [linkedWritingId, setLinkedWritingId] = useState("");

  const { data: reflections = [] } = useQuery<any[]>({
    queryKey: ["reflections"],
    queryFn: async () => {
      const res = await fetch("/api/reflections", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: writings = [] } = useQuery<any[]>({
    queryKey: ["writings"],
    queryFn: async () => {
      const res = await fetch("/api/writings", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { topic: string; body: string; linkedWritingId?: string }) => {
      const res = await fetch("/api/reflections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reflections"] });
      setTopic("");
      setBody("");
      setLinkedWritingId("");
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/reflections/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reflections"] }),
  });

  const handleSubmit = () => {
    if (!topic.trim() || !body.trim()) return;
    createMutation.mutate({ topic: topic.trim(), body: body.trim(), linkedWritingId: linkedWritingId || undefined });
  };

  const getLinkedTitle = (writingId: string | null) => {
    if (!writingId) return null;
    const w = writings.find((w: any) => w.id === writingId);
    return w?.title || "Untitled";
  };

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex items-center gap-3 mb-2">
          <Brain size={16} className="text-white/25" />
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/25">Reflections</span>
        </div>
        <div className="flex items-end justify-between gap-4 flex-wrap mb-10">
          <div>
            <h1 className="text-3xl md:text-5xl font-display font-light tracking-tight italic text-white/90 mb-3" data-testid="heading-reflections">
              Reflect on Your Craft
            </h1>
            <p className="text-base font-serif text-white/30">Notes on process, growth, and the work behind the work.</p>
          </div>
          <motion.button
            onClick={() => setShowForm(!showForm)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-full font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white transition-all"
            data-testid="button-new-reflection"
          >
            <Plus size={14} />
            New Reflection
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden mb-8"
          >
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 md:p-8 space-y-4" data-testid="form-reflection">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Topic — what are you reflecting on?"
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm font-serif text-white/70 placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors"
                data-testid="input-reflection-topic"
              />
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Your reflection..."
                rows={5}
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm font-serif text-white/70 placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors resize-none"
                data-testid="input-reflection-body"
              />
              <div>
                <label className="font-mono text-[10px] tracking-widest uppercase text-white/25 block mb-2">Link to a writing (optional)</label>
                <select
                  value={linkedWritingId}
                  onChange={(e) => setLinkedWritingId(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm font-serif text-white/70 focus:outline-none focus:border-white/15 transition-colors"
                  data-testid="select-linked-writing"
                >
                  <option value="">None</option>
                  {writings.map((w: any) => (
                    <option key={w.id} value={w.id}>{w.title || "Untitled"}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <motion.button
                  onClick={handleSubmit}
                  disabled={!topic.trim() || !body.trim() || createMutation.isPending}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-6 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 rounded-full font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  data-testid="button-save-reflection"
                >
                  <PenLine size={14} />
                  Save Reflection
                </motion.button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-white/30 hover:text-white/50 transition-colors"
                  data-testid="button-cancel-reflection"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        <AnimatePresence>
          {reflections.map((r: any, i: number) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: i * 0.04, duration: 0.4 }}
              className="group rounded-xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] p-5 md:p-6 transition-all"
              data-testid={`card-reflection-${r.id}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-grow min-w-0">
                  <h3 className="text-lg font-display font-light italic text-white/70 mb-2">{r.topic}</h3>
                  <p className="text-sm font-serif text-white/40 leading-relaxed line-clamp-3 mb-3">{r.body}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    {r.linkedWritingId && (
                      <span className="inline-flex items-center gap-1.5 font-mono text-[9px] tracking-widest text-emerald-400/50 bg-emerald-500/5 border border-emerald-500/10 px-2.5 py-1 rounded-full">
                        <PenLine size={10} />
                        {getLinkedTitle(r.linkedWritingId)}
                      </span>
                    )}
                    <span className="font-mono text-[9px] text-white/15">{timeAgo(r.createdAt)}</span>
                  </div>
                </div>
                <motion.button
                  onClick={() => deleteMutation.mutate(r.id)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-white/15 hover:text-red-400/60 transition-all p-1"
                  data-testid={`button-delete-reflection-${r.id}`}
                >
                  <Trash2 size={14} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {reflections.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="border border-dashed border-white/10 rounded-2xl p-16 text-center"
          >
            <Brain size={32} className="mx-auto mb-4 text-white/10" />
            <h3 className="text-xl font-display font-light italic text-white/40 mb-2">No reflections yet</h3>
            <p className="font-serif text-sm text-white/20">Start documenting your creative process and insights.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export function SeasonalReviewPage() {
  const { data: stats } = useQuery<any>({
    queryKey: ["seasonal-review"],
    queryFn: async () => {
      const res = await fetch("/api/seasonal-review", { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
  });

  const statCards = stats ? [
    { label: "Total Writings", value: stats.totalWritings || 0, icon: <PenLine size={20} />, color: "text-white/50", delay: 0 },
    { label: "Total Words", value: stats.totalWords || 0, icon: <Sparkles size={20} />, color: "text-amber-400/50", delay: 0.1 },
    { label: "Seeds", value: stats.seedCount || 0, icon: <CloudSun size={20} />, color: "text-amber-400/50", delay: 0.2 },
    { label: "Sprouts", value: stats.sproutCount || 0, icon: <Brain size={20} />, color: "text-emerald-400/50", delay: 0.3 },
    { label: "Blooms", value: stats.bloomCount || 0, icon: <Sparkles size={20} />, color: "text-pink-400/50", delay: 0.4 },
    { label: "Mood Entries", value: stats.moodEntries || 0, icon: <CloudSun size={20} />, color: "text-blue-400/50", delay: 0.5 },
    { label: "Ritual Sessions", value: stats.ritualSessions || 0, icon: <CalendarRange size={20} />, color: "text-violet-400/50", delay: 0.6 },
    { label: "Journal Entries", value: stats.journalEntries || 0, icon: <Brain size={20} />, color: "text-indigo-400/50", delay: 0.7 },
  ] : [];

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex items-center gap-3 mb-2">
          <CalendarRange size={16} className="text-white/25" />
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/25">Seasonal Review</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-display font-light tracking-tight italic text-white/90 mb-3" data-testid="heading-seasonal-review">
          Your Season in Numbers
        </h1>
        <p className="text-base font-serif text-white/30 mb-12">A quiet summary of your creative rhythm this quarter.</p>
      </motion.div>

      {!stats ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border border-dashed border-white/10 rounded-2xl p-16 text-center"
        >
          <CalendarRange size={32} className="mx-auto mb-4 text-white/10" />
          <h3 className="text-xl font-display font-light italic text-white/40 mb-2">Loading your season...</h3>
          <p className="font-serif text-sm text-white/20">Gathering your creative data.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: card.delay, duration: 0.5 }}
              whileHover={{ scale: 1.04, y: -4 }}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 text-center hover:border-white/15 transition-all cursor-default"
              data-testid={`stat-${card.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <div className={`inline-flex mb-3 ${card.color}`}>
                {card.icon}
              </div>
              <div className="text-3xl md:text-4xl font-display font-light text-white/80 mb-1">
                <AnimatedCounter target={card.value} delay={0.3 + card.delay} />
              </div>
              <span className="font-mono text-[9px] tracking-widest text-white/25 uppercase">{card.label}</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

const categoryColors: Record<string, { text: string; border: string; bg: string; dot: string }> = {
  writer: { text: "text-amber-400", border: "border-amber-500/20", bg: "bg-amber-500/5", dot: "bg-amber-400" },
  book: { text: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/5", dot: "bg-emerald-400" },
  place: { text: "text-blue-400", border: "border-blue-500/20", bg: "bg-blue-500/5", dot: "bg-blue-400" },
  idea: { text: "text-purple-400", border: "border-purple-500/20", bg: "bg-purple-500/5", dot: "bg-purple-400" },
  theme: { text: "text-pink-400", border: "border-pink-500/20", bg: "bg-pink-500/5", dot: "bg-pink-400" },
  other: { text: "text-white/50", border: "border-white/10", bg: "bg-white/[0.03]", dot: "bg-white/50" },
};

const influenceCategories = ["writer", "book", "place", "idea", "theme", "other"] as const;

export function RootSystemPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("writer");
  const [influenceNote, setInfluenceNote] = useState("");

  const { data: influences = [] } = useQuery<any[]>({
    queryKey: ["root-influences"],
    queryFn: async () => {
      const res = await fetch("/api/root-influences", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; category: string; note?: string }) => {
      const res = await fetch("/api/root-influences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to add influence");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["root-influences"] });
      setName("");
      setCategory("writer");
      setInfluenceNote("");
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/root-influences/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["root-influences"] }),
  });

  const handleSubmit = () => {
    if (!name.trim()) return;
    createMutation.mutate({ name: name.trim(), category, note: influenceNote.trim() || undefined });
  };

  const grouped = influenceCategories.reduce((acc, cat) => {
    const items = influences.filter((inf: any) => inf.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex items-center gap-3 mb-2">
          <Network size={16} className="text-white/25" />
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/25">Root System</span>
        </div>
        <div className="flex items-end justify-between gap-4 flex-wrap mb-10">
          <div>
            <h1 className="text-3xl md:text-5xl font-display font-light tracking-tight italic text-white/90 mb-3" data-testid="heading-root-system">
              Your Roots
            </h1>
            <p className="text-base font-serif text-white/30">Map the influences and connections that feed your work.</p>
          </div>
          <motion.button
            onClick={() => setShowForm(!showForm)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-full font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white transition-all"
            data-testid="button-add-influence"
          >
            <Plus size={14} />
            Add Influence
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden mb-8"
          >
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 md:p-8 space-y-4" data-testid="form-influence">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name — who or what influences you?"
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm font-serif text-white/70 placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors"
                data-testid="input-influence-name"
              />
              <div>
                <label className="font-mono text-[10px] tracking-widest uppercase text-white/25 block mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {influenceCategories.map((cat) => {
                    const colors = categoryColors[cat];
                    return (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`px-3 py-1.5 rounded-full border font-mono text-[10px] capitalize transition-all ${
                          category === cat
                            ? `${colors.text} ${colors.border} ${colors.bg}`
                            : "border-white/[0.06] text-white/30 hover:text-white/50"
                        }`}
                        data-testid={`category-${cat}`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>
              <textarea
                value={influenceNote}
                onChange={(e) => setInfluenceNote(e.target.value)}
                placeholder="Why does this matter to your work? (optional)"
                rows={2}
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm font-serif text-white/70 placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors resize-none"
                data-testid="input-influence-note"
              />
              <div className="flex gap-3">
                <motion.button
                  onClick={handleSubmit}
                  disabled={!name.trim() || createMutation.isPending}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-6 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 rounded-full font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  data-testid="button-save-influence"
                >
                  <Plus size={14} />
                  Add Root
                </motion.button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-white/30 hover:text-white/50 transition-colors"
                  data-testid="button-cancel-influence"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {Object.keys(grouped).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(grouped).map(([cat, items], gi) => {
            const colors = categoryColors[cat];
            return (
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: gi * 0.1, duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                  <span className={`font-mono text-[10px] tracking-widest uppercase ${colors.text} opacity-60`}>{cat}</span>
                  <span className="font-mono text-[9px] text-white/15">{items.length}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {items.map((inf: any, i: number) => (
                    <motion.div
                      key={inf.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: gi * 0.1 + i * 0.05 }}
                      whileHover={{ scale: 1.03, y: -3 }}
                      className={`group relative rounded-xl border ${colors.border} ${colors.bg} p-4 transition-all`}
                      data-testid={`card-influence-${inf.id}`}
                    >
                      <motion.button
                        onClick={() => deleteMutation.mutate(inf.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-white/15 hover:text-red-400/60 transition-all p-1"
                        data-testid={`button-delete-influence-${inf.id}`}
                      >
                        <Trash2 size={12} />
                      </motion.button>
                      <h4 className={`font-display text-base font-light italic ${colors.text} mb-1`}>{inf.name}</h4>
                      {inf.note && <p className="text-xs font-serif text-white/30 leading-relaxed line-clamp-2">{inf.note}</p>}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="border border-dashed border-white/10 rounded-2xl p-16 text-center"
        >
          <Network size={32} className="mx-auto mb-4 text-white/10" />
          <h3 className="text-xl font-display font-light italic text-white/40 mb-2">No roots yet</h3>
          <p className="font-serif text-sm text-white/20">Map the writers, books, places, and ideas that shape your work.</p>
        </motion.div>
      )}
    </div>
  );
}