import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Mic, Mail, Plus, Trash2, Send, ArrowLeft, Moon, Star, Check, X, UserPlus, LogOut as Leave } from "lucide-react";
import { timeAgo, GlassCard, PageHeader, ActionButton, LoadingSkeleton, EmptyState, FormField, inputClass, textareaClass, Badge } from "./GardenUI";

async function apiFetch(url: string, opts?: RequestInit) {
  const res = await fetch(url, { credentials: "include", ...opts, headers: { "Content-Type": "application/json", ...opts?.headers } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

// ─── CirclesPage ─────────────────────────────────────────────────────────────

export function CirclesPage() {
  const queryClient = useQueryClient();
  const [activeCircleId, setActiveCircleId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [messageText, setMessageText] = useState("");

  const { data: circles = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/circles"], queryFn: () => apiFetch("/api/circles") });

  const createCircle = useMutation({
    mutationFn: () => apiFetch("/api/circles", { method: "POST", body: JSON.stringify({ name, description }) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/circles"] }); setName(""); setDescription(""); setShowCreate(false); },
  });

  const joinCircle = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/circles/${id}/join`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/circles"] }),
  });

  const leaveCircle = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/circles/${id}/leave`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/circles"] }),
  });

  const { data: messages = [] } = useQuery<any[]>({
    queryKey: ["/api/circles", activeCircleId, "messages"],
    queryFn: () => apiFetch(`/api/circles/${activeCircleId}/messages`),
    enabled: !!activeCircleId,
  });

  const sendMessage = useMutation({
    mutationFn: () => apiFetch(`/api/circles/${activeCircleId}/messages`, { method: "POST", body: JSON.stringify({ content: messageText }) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/circles", activeCircleId, "messages"] }); setMessageText(""); },
  });

  if (activeCircleId) {
    const circle = circles.find((c: any) => c.id === activeCircleId);
    return (
      <div className="max-w-3xl mx-auto" data-testid="circle-messages-view">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
          <motion.button
            onClick={() => setActiveCircleId(null)}
            whileHover={{ x: -4 }}
            className="flex items-center gap-2 text-white/30 hover:text-white/60 font-mono text-xs uppercase tracking-widest mb-8 transition-colors group"
            data-testid="button-back-circles"
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" /> Back to Circles
          </motion.button>

          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-emerald-500/20" style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))" }}>
              <Users size={18} className="text-emerald-400/60" />
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-light italic text-white/90" data-testid="heading-circle-name">
              {circle?.name || "Circle"}
            </h2>
          </div>

          <div className="space-y-2 mb-8 max-h-[50vh] overflow-y-auto pr-2 scrollbar-thin">
            <AnimatePresence>
              {messages.map((msg: any, i: number) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, type: "spring", stiffness: 300, damping: 24 }}
                  className={`rounded-2xl border border-white/[0.06] p-4 backdrop-blur-sm transition-all hover:border-white/[0.1] ${
                    i % 2 === 0
                      ? "bg-white/[0.02]"
                      : "bg-white/[0.035]"
                  }`}
                  style={{
                    background: i % 2 === 0
                      ? "linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.005))"
                      : "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))",
                  }}
                  data-testid={`message-${msg.id}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] tracking-widest text-emerald-400/50 uppercase">{msg.userName || "Anonymous"}</span>
                    <span className="font-mono text-[9px] text-white/20">{timeAgo(msg.createdAt)}</span>
                  </div>
                  <p className="font-serif text-sm text-white/70 leading-relaxed">{msg.content}</p>
                </motion.div>
              ))}
            </AnimatePresence>
            {messages.length === 0 && (
              <div className="text-center py-12">
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                  <Send size={24} className="mx-auto text-white/10 mb-3" />
                </motion.div>
                <p className="font-serif text-white/25">No messages yet — start the conversation.</p>
              </div>
            )}
          </div>

          <div className="relative rounded-2xl p-[1px]" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(16,185,129,0.15), rgba(255,255,255,0.06))" }}>
            <div className="flex gap-3 rounded-2xl p-3" style={{ background: "linear-gradient(135deg, rgba(10,10,20,0.95), rgba(10,10,20,0.98))" }}>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Share something with the circle..."
                className="flex-grow bg-transparent border-0 text-sm font-serif text-white/70 placeholder:text-white/20 focus:outline-none resize-none min-h-[80px] transition-colors"
                data-testid="input-circle-message"
              />
              <motion.button
                onClick={() => messageText.trim() && sendMessage.mutate()}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                disabled={!messageText.trim() || sendMessage.isPending}
                className="self-end p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400/60 hover:text-emerald-400 transition-all disabled:opacity-30 disabled:hover:bg-emerald-500/10"
                data-testid="button-send-message"
              >
                <Send size={16} />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto" data-testid="circles-page">
      <PageHeader
        icon={<Users size={16} />}
        label="Community"
        title="Circles"
        subtitle="Small group spaces for accountability and private sharing."
        data-testid="heading-circles"
        action={
          <ActionButton
            onClick={() => setShowCreate(!showCreate)}
            icon={<Plus size={14} />}
            variant="accent"
            data-testid="button-toggle-create-circle"
          >
            New Circle
          </ActionButton>
        }
      />

      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="overflow-hidden mb-8"
          >
            <GlassCard className="p-6" data-testid="form-create-circle">
              <div className="space-y-4">
                <FormField label="Circle Name">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="A name for your gathering..."
                    className={inputClass}
                    data-testid="input-circle-name"
                  />
                </FormField>
                <FormField label="Description">
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What is this circle about?"
                    className={inputClass}
                    data-testid="input-circle-description"
                  />
                </FormField>
                <ActionButton
                  onClick={() => name.trim() && createCircle.mutate()}
                  disabled={!name.trim() || createCircle.isPending}
                  variant="accent"
                  data-testid="button-create-circle"
                >
                  Create Circle
                </ActionButton>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading && <LoadingSkeleton count={3} />}

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {circles.map((circle: any) => (
          <motion.div key={circle.id} variants={staggerItem}>
            <GlassCard
              className="p-5 cursor-pointer group"
              hoverGlow="rgba(16,185,129,0.06)"
              onClick={() => setActiveCircleId(circle.id)}
              data-testid={`card-circle-${circle.id}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-grow min-w-0">
                  <h3 className="text-lg font-display font-light italic text-white/80 mb-1 group-hover:text-white/95 transition-colors">{circle.name}</h3>
                  <p className="text-sm font-serif text-white/30 line-clamp-2">{circle.description}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <Badge color="emerald">
                      <Users size={10} /> {circle.memberCount ?? 0} members
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <motion.button
                    onClick={() => joinCircle.mutate(circle.id)}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2.5 rounded-xl border border-white/[0.06] backdrop-blur-sm hover:bg-emerald-500/15 hover:border-emerald-500/30 text-white/30 hover:text-emerald-400 transition-all hover:shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                    style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))" }}
                    data-testid={`button-join-circle-${circle.id}`}
                    title="Join"
                  >
                    <UserPlus size={14} />
                  </motion.button>
                  <motion.button
                    onClick={() => leaveCircle.mutate(circle.id)}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2.5 rounded-xl border border-white/[0.06] backdrop-blur-sm hover:bg-red-500/15 hover:border-red-500/30 text-white/30 hover:text-red-400 transition-all hover:shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                    style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))" }}
                    data-testid={`button-leave-circle-${circle.id}`}
                    title="Leave"
                  >
                    <Leave size={14} />
                  </motion.button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      {!isLoading && circles.length === 0 && (
        <EmptyState
          icon={<Users size={40} />}
          title="No circles yet"
          description="Create one to gather your people — small spaces for accountability and shared growth."
          action={
            <ActionButton onClick={() => setShowCreate(true)} icon={<Plus size={14} />} variant="accent" data-testid="button-create-first-circle">
              Create Your First Circle
            </ActionButton>
          }
        />
      )}
    </div>
  );
}

// ─── MoonlitReadingsPage ─────────────────────────────────────────────────────

export function MoonlitReadingsPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");

  const { data: readings = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/moonlit-readings"], queryFn: () => apiFetch("/api/moonlit-readings") });

  const createReading = useMutation({
    mutationFn: () => apiFetch("/api/moonlit-readings", {
      method: "POST",
      body: JSON.stringify({ title, description, scheduledAt: scheduledAt || undefined }),
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/moonlit-readings"] }); setTitle(""); setDescription(""); setScheduledAt(""); setShowCreate(false); },
  });

  const joinReading = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/moonlit-readings/${id}/join`, { method: "POST", body: JSON.stringify({}) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/moonlit-readings"] }),
  });

  const leaveReading = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/moonlit-readings/${id}/leave`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/moonlit-readings"] }),
  });

  return (
    <div className="max-w-3xl mx-auto" data-testid="moonlit-readings-page">
      <PageHeader
        icon={<Moon size={16} />}
        label="Under the Stars"
        title="Moonlit Readings"
        subtitle="Live or asynchronous readings under the stars. Share your voice, hear others."
        accentColor="purple"
        data-testid="heading-moonlit-readings"
        action={
          <ActionButton
            onClick={() => setShowCreate(!showCreate)}
            icon={<Plus size={14} />}
            variant="accent"
            data-testid="button-toggle-create-reading"
          >
            Host a Reading
          </ActionButton>
        }
      />

      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="overflow-hidden mb-8"
          >
            <GlassCard className="p-6" hoverGlow="rgba(168,85,247,0.05)" data-testid="form-create-reading">
              <div className="space-y-4">
                <FormField label="Reading Title">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What will you read tonight?"
                    className={inputClass}
                    data-testid="input-reading-title"
                  />
                </FormField>
                <FormField label="Description">
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Set the mood for your reading..."
                    className={inputClass}
                    data-testid="input-reading-description"
                  />
                </FormField>
                <FormField label="Schedule">
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className={`${inputClass} font-mono [color-scheme:dark]`}
                    data-testid="input-reading-scheduled"
                  />
                </FormField>
                <ActionButton
                  onClick={() => title.trim() && createReading.mutate()}
                  disabled={!title.trim() || createReading.isPending}
                  variant="accent"
                  data-testid="button-create-reading"
                >
                  Create Reading
                </ActionButton>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading && <LoadingSkeleton count={3} />}

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {readings.map((reading: any) => (
          <motion.div key={reading.id} variants={staggerItem}>
            <GlassCard
              className="p-5 relative overflow-hidden"
              hoverGlow="rgba(168,85,247,0.06)"
              data-testid={`card-reading-${reading.id}`}
            >
              <div className="absolute top-3 right-4 opacity-[0.04] pointer-events-none">
                <Star size={60} />
              </div>
              <div className="absolute top-8 right-20 w-1 h-1 rounded-full bg-purple-400/20 pointer-events-none" />
              <div className="absolute top-4 right-28 w-0.5 h-0.5 rounded-full bg-white/15 pointer-events-none" />
              <div className="absolute bottom-6 right-12 w-0.5 h-0.5 rounded-full bg-purple-300/15 pointer-events-none" />

              <div className="flex items-start justify-between gap-4 relative z-10">
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Star size={12} className="text-amber-400/50" />
                    <h3 className="text-lg font-display font-light italic text-white/80">{reading.title}</h3>
                  </div>
                  <p className="text-sm font-serif text-white/30 line-clamp-2 mb-3">{reading.description}</p>

                  {reading.scheduledAt && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-purple-500/20 mb-3" style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.1), rgba(168,85,247,0.03))" }}>
                      <Moon size={12} className="text-purple-400/70" />
                      <span className="font-mono text-[10px] tracking-widest text-purple-300/80 uppercase">
                        {new Date(reading.scheduledAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-4 flex-wrap">
                    <Badge color="purple">
                      <Mic size={10} /> {reading.hostName || "Host"}
                    </Badge>
                    <Badge>
                      <Users size={10} /> {reading.participantCount ?? 0} joined
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <motion.button
                    onClick={() => joinReading.mutate(reading.id)}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2.5 rounded-xl border border-white/[0.06] backdrop-blur-sm hover:bg-purple-500/15 hover:border-purple-500/30 text-white/30 hover:text-purple-400 transition-all hover:shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                    style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))" }}
                    data-testid={`button-join-reading-${reading.id}`}
                    title="Join"
                  >
                    <UserPlus size={14} />
                  </motion.button>
                  <motion.button
                    onClick={() => leaveReading.mutate(reading.id)}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2.5 rounded-xl border border-white/[0.06] backdrop-blur-sm hover:bg-red-500/15 hover:border-red-500/30 text-white/30 hover:text-red-400 transition-all hover:shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                    style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))" }}
                    data-testid={`button-leave-reading-${reading.id}`}
                    title="Leave"
                  >
                    <Leave size={14} />
                  </motion.button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      {!isLoading && readings.length === 0 && (
        <EmptyState
          icon={<Moon size={40} />}
          title="The night awaits"
          description="No readings yet — host one under the moonlight and share your voice with the garden."
          action={
            <ActionButton onClick={() => setShowCreate(true)} icon={<Plus size={14} />} variant="accent" data-testid="button-create-first-reading">
              Host Your First Reading
            </ActionButton>
          }
        />
      )}
    </div>
  );
}

// ─── ReplantRequestsPage ─────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-400/80",
  accepted: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400/80",
  declined: "border-red-500/30 bg-red-500/10 text-red-400/80",
};

const statusBadgeColor: Record<string, string> = {
  pending: "amber",
  accepted: "emerald",
  declined: "red",
};

const statusLeftBorder: Record<string, string> = {
  pending: "border-l-amber-500/40",
  accepted: "border-l-emerald-500/40",
  declined: "border-l-red-500/40",
};

const statusGlow: Record<string, string> = {
  pending: "rgba(245,158,11,0.06)",
  accepted: "rgba(16,185,129,0.06)",
  declined: "rgba(239,68,68,0.06)",
};

export function ReplantRequestsPage() {
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/replant-requests"], queryFn: () => apiFetch("/api/replant-requests") });

  const respond = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "accepted" | "declined" }) =>
      apiFetch(`/api/replant-requests/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/replant-requests"] }),
  });

  return (
    <div className="max-w-3xl mx-auto" data-testid="replant-requests-page">
      <PageHeader
        icon={<Mail size={16} />}
        label="Editorial"
        title="Replant Requests"
        subtitle="When editors want to feature your work, you'll find their invitations here."
        data-testid="heading-replant-requests"
      />

      {isLoading && <LoadingSkeleton count={3} />}

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {requests.map((req: any) => (
          <motion.div key={req.id} variants={staggerItem}>
            <GlassCard
              className={`p-5 border-l-[3px] ${statusLeftBorder[req.status] || statusLeftBorder.pending}`}
              hoverGlow={statusGlow[req.status] || statusGlow.pending}
              data-testid={`card-request-${req.id}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-lg font-display font-light italic text-white/80">
                      {req.writingTitle || "Untitled Piece"}
                    </h3>
                    <Badge color={statusBadgeColor[req.status] || "amber"} data-testid={`badge-status-${req.id}`}>
                      {req.status === "pending" && <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 animate-pulse" />}
                      {req.status === "accepted" && <Check size={9} />}
                      {req.status === "declined" && <X size={9} />}
                      {req.status}
                    </Badge>
                  </div>
                  {req.editorNote && (
                    <div className="relative pl-4 mb-3 border-l-2 border-white/[0.08]">
                      <p className="text-sm font-serif text-white/40 italic leading-relaxed">"{req.editorNote}"</p>
                    </div>
                  )}
                  <span className="font-mono text-[9px] text-white/20 tracking-widest">{timeAgo(req.createdAt)}</span>
                </div>

                {req.status === "pending" && (
                  <div className="flex gap-2 flex-shrink-0">
                    <motion.button
                      onClick={() => respond.mutate({ id: req.id, status: "accepted" })}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      disabled={respond.isPending}
                      className="p-2.5 rounded-xl border border-white/[0.06] backdrop-blur-sm hover:bg-emerald-500/15 hover:border-emerald-500/30 text-white/30 hover:text-emerald-400 transition-all hover:shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                      style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))" }}
                      data-testid={`button-accept-${req.id}`}
                      title="Accept"
                    >
                      <Check size={14} />
                    </motion.button>
                    <motion.button
                      onClick={() => respond.mutate({ id: req.id, status: "declined" })}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      disabled={respond.isPending}
                      className="p-2.5 rounded-xl border border-white/[0.06] backdrop-blur-sm hover:bg-red-500/15 hover:border-red-500/30 text-white/30 hover:text-red-400 transition-all hover:shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                      style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))" }}
                      data-testid={`button-decline-${req.id}`}
                      title="Decline"
                    >
                      <X size={14} />
                    </motion.button>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      {!isLoading && requests.length === 0 && (
        <EmptyState
          icon={<Mail size={40} />}
          title="Your inbox is clear"
          description="No replant requests yet — keep growing your garden and editors will find you."
          data-testid="empty-replant-requests"
        />
      )}
    </div>
  );
}
