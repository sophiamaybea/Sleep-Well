import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { CloudSun, Brain, CalendarRange, Network, Plus, Trash2, Sun, Cloud, CloudRain, CloudLightning, CloudFog, Moon, Sparkles, PenLine } from "lucide-react";
import { timeAgo, AnimatedCounter, GlassCard, PageHeader, ActionButton, EmptyState, FormField, inputClass, textareaClass, Badge } from "./GardenUI";

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

const moodGlowColors: Record<string, string> = {
  sunny: "rgba(251,191,36,0.15)",
  cloudy: "rgba(148,163,184,0.12)",
  rainy: "rgba(96,165,250,0.15)",
  stormy: "rgba(167,139,250,0.15)",
  foggy: "rgba(156,163,175,0.1)",
  starlit: "rgba(129,140,248,0.15)",
  aurora: "rgba(110,231,183,0.15)",
};

const moodBorderLeft: Record<string, string> = {
  sunny: "border-l-amber-400/50",
  cloudy: "border-l-slate-400/40",
  rainy: "border-l-blue-400/50",
  stormy: "border-l-violet-400/50",
  foggy: "border-l-gray-400/40",
  starlit: "border-l-indigo-400/50",
  aurora: "border-l-emerald-400/50",
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
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
      <PageHeader
        icon={<CloudSun size={18} />}
        label="Inner Weather"
        title="How's Your Sky?"
        subtitle="Track the weather inside. No judgment, just observation."
        accentColor="amber"
        data-testid="heading-inner-weather"
      />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <GlassCard className="p-6 md:p-8 mb-10" data-testid="form-inner-weather">
          <p className="font-mono text-[10px] tracking-widest uppercase text-white/25 mb-4">Select your mood</p>
          <div className="flex flex-wrap gap-2 mb-6">
            {moods.map((m) => (
              <motion.button
                key={m}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedMood(m)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all font-mono text-[11px] capitalize overflow-hidden ${
                  selectedMood === m ? moodColors[m] : "border-white/[0.06] text-white/30 hover:text-white/50 hover:border-white/15"
                }`}
                data-testid={`mood-${m}`}
              >
                {selectedMood === m && (
                  <motion.div
                    layoutId="moodBg"
                    className="absolute inset-0 rounded-full"
                    style={{ background: moodGlowColors[m] }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 transition-all duration-300 ${selectedMood === m ? "drop-shadow-[0_0_6px_currentColor]" : ""}`}>
                  {moodIcons[m]}
                </span>
                <span className="relative z-10">{m}</span>
              </motion.button>
            ))}
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[10px] tracking-widest uppercase text-white/25">Energy Level</span>
              <span className="font-mono text-sm text-white/50 tabular-nums">{energy}/10</span>
            </div>
            <div className="relative">
              <div className="absolute inset-0 h-2 top-1/2 -translate-y-1/2 rounded-full overflow-hidden pointer-events-none">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${(energy / 10) * 100}%`,
                    background: "linear-gradient(90deg, rgba(99,102,241,0.4), rgba(168,85,247,0.5), rgba(236,72,153,0.4))",
                  }}
                />
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={energy}
                onChange={(e) => setEnergy(Number(e.target.value))}
                className="w-full h-2 bg-white/[0.06] rounded-full appearance-none cursor-pointer relative z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white/80 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(168,85,247,0.5)] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-purple-400/50 [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-125"
                data-testid="slider-energy"
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="font-mono text-[9px] text-white/15">Low</span>
              <span className="font-mono text-[9px] text-white/15">High</span>
            </div>
          </div>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Any notes about how you're feeling... (optional)"
            rows={2}
            className={textareaClass + " mb-5"}
            data-testid="input-weather-note"
          />

          <ActionButton
            onClick={handleSubmit}
            disabled={!selectedMood || createMutation.isPending}
            icon={<Plus size={14} />}
            variant="accent"
            data-testid="button-log-weather"
          >
            Log Weather
          </ActionButton>
        </GlassCard>
      </motion.div>

      {last7.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="mb-10"
        >
          <p className="font-mono text-[10px] tracking-widest uppercase text-white/25 mb-5">Your last 7 entries</p>
          <div className="relative flex items-center gap-3 mb-6 px-2">
            {last7.length > 1 && (
              <div className="absolute top-1/2 left-2 right-2 h-px bg-gradient-to-r from-white/[0.04] via-white/[0.08] to-white/[0.04] -translate-y-1/2 pointer-events-none" />
            )}
            {last7.map((entry: any, i: number) => (
              <motion.div
                key={entry.id || i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.08, type: "spring", stiffness: 300, damping: 20 }}
                className="relative flex flex-col items-center gap-1.5"
              >
                <motion.div
                  className={`w-6 h-6 rounded-full ${moodDotColors[entry.mood] || "bg-white/20"} shadow-lg relative z-10`}
                  animate={{ boxShadow: [`0 0 0 0 ${moodGlowColors[entry.mood] || "transparent"}`, `0 0 12px 3px ${moodGlowColors[entry.mood] || "transparent"}`, `0 0 0 0 ${moodGlowColors[entry.mood] || "transparent"}`] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }}
                  title={`${entry.mood} - Energy: ${entry.energy}`}
                  data-testid={`mood-dot-${i}`}
                />
                <span className="font-mono text-[8px] text-white/20 capitalize">{entry.mood}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        className="space-y-3"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          {entries.map((entry: any, i: number) => (
            <motion.div
              key={entry.id}
              variants={staggerItem}
              exit={{ opacity: 0, y: -10 }}
              className={`rounded-xl border border-white/[0.04] border-l-[3px] ${moodBorderLeft[entry.mood] || "border-l-white/10"} backdrop-blur-sm hover:bg-white/[0.03] p-5 transition-all`}
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.005) 100%)",
              }}
              data-testid={`card-weather-${entry.id}`}
            >
              <div className="flex items-start gap-4">
                <motion.div
                  whileHover={{ rotate: 10 }}
                  className={`flex-shrink-0 w-10 h-10 rounded-full border flex items-center justify-center ${moodColors[entry.mood] || "text-white/30 border-white/10"}`}
                >
                  {moodIcons[entry.mood] || <CloudSun size={18} />}
                </motion.div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <span className="font-display text-lg font-light italic text-white/70 capitalize">{entry.mood}</span>
                    <span className="font-mono text-[9px] text-white/15">{timeAgo(entry.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-white/25">Energy: {entry.energy}/10</span>
                    <div className="flex-1 max-w-[80px] h-1 bg-white/[0.06] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(entry.energy / 10) * 100}%` }}
                        transition={{ delay: i * 0.05 + 0.3, duration: 0.6 }}
                        style={{ background: "linear-gradient(90deg, rgba(99,102,241,0.5), rgba(168,85,247,0.6))" }}
                      />
                    </div>
                  </div>
                  {entry.note && <p className="text-sm font-serif text-white/40 mt-2 leading-relaxed">{entry.note}</p>}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
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
      <PageHeader
        icon={<Brain size={18} />}
        label="Reflections"
        title="Reflect on Your Craft"
        subtitle="Notes on process, growth, and the work behind the work."
        accentColor="purple"
        action={
          <ActionButton
            onClick={() => setShowForm(!showForm)}
            icon={<Plus size={14} />}
            data-testid="button-new-reflection"
          >
            New Reflection
          </ActionButton>
        }
        data-testid="heading-reflections"
      />

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            className="overflow-hidden mb-8"
          >
            <GlassCard className="p-6 md:p-8" hoverGlow="rgba(168,85,247,0.06)" data-testid="form-reflection">
              <div className="space-y-4">
                <FormField label="Topic">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Topic — what are you reflecting on?"
                    className={inputClass}
                    data-testid="input-reflection-topic"
                  />
                </FormField>
                <FormField label="Reflection">
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Your reflection..."
                    rows={5}
                    className={textareaClass}
                    data-testid="input-reflection-body"
                  />
                </FormField>
                <FormField label="Link to a writing (optional)">
                  <select
                    value={linkedWritingId}
                    onChange={(e) => setLinkedWritingId(e.target.value)}
                    className={inputClass}
                    data-testid="select-linked-writing"
                  >
                    <option value="">None</option>
                    {writings.map((w: any) => (
                      <option key={w.id} value={w.id}>{w.title || "Untitled"}</option>
                    ))}
                  </select>
                </FormField>
                <div className="flex gap-3 pt-2">
                  <ActionButton
                    onClick={handleSubmit}
                    disabled={!topic.trim() || !body.trim() || createMutation.isPending}
                    icon={<PenLine size={14} />}
                    variant="accent"
                    data-testid="button-save-reflection"
                  >
                    Save Reflection
                  </ActionButton>
                  <ActionButton
                    onClick={() => setShowForm(false)}
                    variant="ghost"
                    data-testid="button-cancel-reflection"
                  >
                    Cancel
                  </ActionButton>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="space-y-3"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          {reflections.map((r: any, i: number) => (
            <motion.div
              key={r.id}
              variants={staggerItem}
              exit={{ opacity: 0, x: -20 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="group rounded-2xl border border-white/[0.06] backdrop-blur-sm p-5 md:p-6 transition-all duration-300 hover:border-white/[0.12]"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.008) 100%)",
              }}
              data-testid={`card-reflection-${r.id}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-grow min-w-0">
                  <h3 className="text-lg font-display font-light italic text-white/70 mb-2">{r.topic}</h3>
                  <p className="text-sm font-serif text-white/40 leading-relaxed line-clamp-3 mb-3">{r.body}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    {r.linkedWritingId && (
                      <Badge color="emerald">
                        <PenLine size={10} />
                        {getLinkedTitle(r.linkedWritingId)}
                      </Badge>
                    )}
                    <span className="font-mono text-[9px] text-white/15">{timeAgo(r.createdAt)}</span>
                  </div>
                </div>
                <motion.button
                  onClick={() => deleteMutation.mutate(r.id)}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-white/15 hover:text-red-400/60 transition-all duration-300 p-1.5 rounded-lg hover:bg-red-500/[0.06]"
                  data-testid={`button-delete-reflection-${r.id}`}
                >
                  <Trash2 size={14} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {reflections.length === 0 && (
          <EmptyState
            icon={<Brain size={36} />}
            title="No reflections yet"
            description="Start documenting your creative process and insights."
          />
        )}
      </motion.div>
    </div>
  );
}

const statColorThemes: Record<string, { glow: string; border: string; iconBg: string }> = {
  "text-white/50": { glow: "rgba(255,255,255,0.03)", border: "border-white/[0.08]", iconBg: "bg-white/[0.06]" },
  "text-amber-400/50": { glow: "rgba(251,191,36,0.04)", border: "border-amber-500/[0.12]", iconBg: "bg-amber-500/[0.08]" },
  "text-emerald-400/50": { glow: "rgba(52,211,153,0.04)", border: "border-emerald-500/[0.12]", iconBg: "bg-emerald-500/[0.08]" },
  "text-pink-400/50": { glow: "rgba(244,114,182,0.04)", border: "border-pink-500/[0.12]", iconBg: "bg-pink-500/[0.08]" },
  "text-blue-400/50": { glow: "rgba(96,165,250,0.04)", border: "border-blue-500/[0.12]", iconBg: "bg-blue-500/[0.08]" },
  "text-violet-400/50": { glow: "rgba(167,139,250,0.04)", border: "border-violet-500/[0.12]", iconBg: "bg-violet-500/[0.08]" },
  "text-indigo-400/50": { glow: "rgba(129,140,248,0.04)", border: "border-indigo-500/[0.12]", iconBg: "bg-indigo-500/[0.08]" },
};

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
      <PageHeader
        icon={<CalendarRange size={18} />}
        label="Seasonal Review"
        title="Your Season in Numbers"
        subtitle="A quiet summary of your creative rhythm this quarter."
        accentColor="violet"
        data-testid="heading-seasonal-review"
      />

      {!stats ? (
        <EmptyState
          icon={<CalendarRange size={36} />}
          title="Loading your season..."
          description="Gathering your creative data."
        />
      ) : (
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {statCards.map((card) => {
            const theme = statColorThemes[card.color] || statColorThemes["text-white/50"];
            return (
              <motion.div
                key={card.label}
                variants={staggerItem}
                whileHover={{ scale: 1.05, y: -6, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                className={`relative rounded-2xl border ${theme.border} backdrop-blur-sm p-6 text-center cursor-default overflow-hidden transition-all duration-300`}
                style={{
                  background: `linear-gradient(160deg, ${theme.glow} 0%, rgba(255,255,255,0.01) 100%)`,
                }}
                data-testid={`stat-${card.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse at 50% 0%, ${theme.glow} 0%, transparent 70%)`,
                  }}
                />
                <div className="relative z-10">
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${theme.iconBg} mb-3 ${card.color}`}>
                    {card.icon}
                  </div>
                  <div className="text-3xl md:text-4xl font-display font-light text-white/80 mb-1 tabular-nums">
                    <AnimatedCounter target={card.value} delay={0.3 + card.delay} />
                  </div>
                  <span className="font-mono text-[9px] tracking-widest text-white/25 uppercase">{card.label}</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
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

const categoryGlows: Record<string, string> = {
  writer: "rgba(251,191,36,0.04)",
  book: "rgba(52,211,153,0.04)",
  place: "rgba(96,165,250,0.04)",
  idea: "rgba(168,85,247,0.04)",
  theme: "rgba(244,114,182,0.04)",
  other: "rgba(255,255,255,0.02)",
};

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
      <PageHeader
        icon={<Network size={18} />}
        label="Root System"
        title="Your Roots"
        subtitle="Map the influences and connections that feed your work."
        accentColor="emerald"
        action={
          <ActionButton
            onClick={() => setShowForm(!showForm)}
            icon={<Plus size={14} />}
            data-testid="button-add-influence"
          >
            Add Influence
          </ActionButton>
        }
        data-testid="heading-root-system"
      />

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            className="overflow-hidden mb-8"
          >
            <GlassCard className="p-6 md:p-8" hoverGlow="rgba(52,211,153,0.05)" data-testid="form-influence">
              <div className="space-y-4">
                <FormField label="Name">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name — who or what influences you?"
                    className={inputClass}
                    data-testid="input-influence-name"
                  />
                </FormField>
                <FormField label="Category">
                  <div className="flex flex-wrap gap-2">
                    {influenceCategories.map((cat) => {
                      const colors = categoryColors[cat];
                      return (
                        <motion.button
                          key={cat}
                          whileHover={{ scale: 1.06 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setCategory(cat)}
                          className={`relative px-3.5 py-1.5 rounded-full border font-mono text-[10px] capitalize transition-all overflow-hidden ${
                            category === cat
                              ? `${colors.text} ${colors.border} ${colors.bg}`
                              : "border-white/[0.06] text-white/30 hover:text-white/50"
                          }`}
                          data-testid={`category-${cat}`}
                        >
                          {category === cat && (
                            <motion.div
                              layoutId="categoryPill"
                              className="absolute inset-0 rounded-full"
                              style={{ background: categoryGlows[cat] }}
                              transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                          )}
                          <span className="relative z-10">{cat}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </FormField>
                <FormField label="Note (optional)">
                  <textarea
                    value={influenceNote}
                    onChange={(e) => setInfluenceNote(e.target.value)}
                    placeholder="Why does this matter to your work?"
                    rows={2}
                    className={textareaClass}
                    data-testid="input-influence-note"
                  />
                </FormField>
                <div className="flex gap-3 pt-2">
                  <ActionButton
                    onClick={handleSubmit}
                    disabled={!name.trim() || createMutation.isPending}
                    icon={<Plus size={14} />}
                    variant="accent"
                    data-testid="button-save-influence"
                  >
                    Add Root
                  </ActionButton>
                  <ActionButton
                    onClick={() => setShowForm(false)}
                    variant="ghost"
                    data-testid="button-cancel-influence"
                  >
                    Cancel
                  </ActionButton>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {Object.keys(grouped).length > 0 ? (
        <motion.div
          className="space-y-10"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {Object.entries(grouped).map(([cat, items], gi) => {
            const colors = categoryColors[cat];
            return (
              <motion.div key={cat} variants={staggerItem}>
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
                  <span className={`font-mono text-[11px] tracking-widest uppercase ${colors.text} opacity-70 font-medium`}>{cat}</span>
                  <span className="font-mono text-[9px] text-white/20 bg-white/[0.04] px-2 py-0.5 rounded-full">{items.length}</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {items.map((inf: any, i: number) => (
                    <motion.div
                      key={inf.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: gi * 0.1 + i * 0.05, type: "spring", stiffness: 300, damping: 25 }}
                      whileHover={{ scale: 1.03, y: -3 }}
                      className={`group relative rounded-xl border-l-[3px] border ${colors.border} backdrop-blur-sm p-4 transition-all duration-300 hover:border-white/[0.12]`}
                      style={{
                        borderLeftColor: colors.dot.includes("amber") ? "rgba(251,191,36,0.5)" :
                          colors.dot.includes("emerald") ? "rgba(52,211,153,0.5)" :
                          colors.dot.includes("blue") ? "rgba(96,165,250,0.5)" :
                          colors.dot.includes("purple") ? "rgba(168,85,247,0.5)" :
                          colors.dot.includes("pink") ? "rgba(244,114,182,0.5)" :
                          "rgba(255,255,255,0.2)",
                        background: `linear-gradient(135deg, ${categoryGlows[cat]} 0%, rgba(255,255,255,0.008) 100%)`,
                      }}
                      data-testid={`card-influence-${inf.id}`}
                    >
                      <motion.button
                        onClick={() => deleteMutation.mutate(inf.id)}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-white/15 hover:text-red-400/60 transition-all duration-300 p-1 rounded-lg hover:bg-red-500/[0.06]"
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
        </motion.div>
      ) : (
        <EmptyState
          icon={<Network size={36} />}
          title="No roots yet"
          description="Map the writers, books, places, and ideas that shape your work."
        />
      )}
    </div>
  );
}
