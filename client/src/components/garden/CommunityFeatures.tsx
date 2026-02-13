import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Mic, Mail, Plus, Trash2, Send, ArrowLeft, Moon, Star, Check, X, UserPlus, LogOut as Leave } from "lucide-react";

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

async function apiFetch(url: string, opts?: RequestInit) {
  const res = await fetch(url, { credentials: "include", ...opts, headers: { "Content-Type": "application/json", ...opts?.headers } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <button
            onClick={() => setActiveCircleId(null)}
            className="flex items-center gap-2 text-white/30 hover:text-white/60 font-mono text-xs uppercase tracking-widest mb-6 transition-colors"
            data-testid="button-back-circles"
          >
            <ArrowLeft size={14} /> Back to Circles
          </button>

          <h2 className="text-2xl md:text-3xl font-display font-light italic text-white/90 mb-6" data-testid="heading-circle-name">
            {circle?.name || "Circle"}
          </h2>

          <div className="space-y-3 mb-8 max-h-[50vh] overflow-y-auto pr-2">
            <AnimatePresence>
              {messages.map((msg: any, i: number) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
                  data-testid={`message-${msg.id}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] tracking-widest text-white/50 uppercase">{msg.userName || "Anonymous"}</span>
                    <span className="font-mono text-[9px] text-white/20">{timeAgo(msg.createdAt)}</span>
                  </div>
                  <p className="font-serif text-sm text-white/70 leading-relaxed">{msg.content}</p>
                </motion.div>
              ))}
            </AnimatePresence>
            {messages.length === 0 && (
              <p className="text-center font-serif text-white/25 py-8">No messages yet — start the conversation.</p>
            )}
          </div>

          <div className="flex gap-3">
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Share something with the circle..."
              className="flex-grow bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-sm font-serif text-white/70 placeholder:text-white/20 focus:outline-none focus:border-white/15 resize-none min-h-[80px] transition-colors"
              data-testid="input-circle-message"
            />
            <motion.button
              onClick={() => messageText.trim() && sendMessage.mutate()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!messageText.trim() || sendMessage.isPending}
              className="self-end px-4 py-3 rounded-xl border border-white/[0.06] bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white/80 transition-all disabled:opacity-30"
              data-testid="button-send-message"
            >
              <Send size={16} />
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto" data-testid="circles-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex items-center gap-3 text-white/25 mb-4">
          <Users size={14} />
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase">Community</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-display font-light tracking-tight italic text-white/90 mb-3" data-testid="heading-circles">
          Circles
        </h1>
        <p className="font-serif text-base text-white/30 mb-10 max-w-xl">
          Small group spaces for accountability and private sharing.
        </p>

        <div className="flex justify-end mb-6">
          <motion.button
            onClick={() => setShowCreate(!showCreate)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-5 py-2.5 border border-white/10 hover:border-white/20 rounded-full font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] transition-all"
            data-testid="button-toggle-create-circle"
          >
            <Plus size={14} /> New Circle
          </motion.button>
        </div>

        <AnimatePresence>
          {showCreate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 space-y-4" data-testid="form-create-circle">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Circle name"
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm font-serif text-white/70 placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors"
                  data-testid="input-circle-name"
                />
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description"
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm font-serif text-white/70 placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors"
                  data-testid="input-circle-description"
                />
                <motion.button
                  onClick={() => name.trim() && createCircle.mutate()}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={!name.trim() || createCircle.isPending}
                  className="px-6 py-2.5 rounded-full border border-white/10 hover:border-emerald-500/30 bg-white/[0.04] hover:bg-white/[0.08] font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white transition-all disabled:opacity-30"
                  data-testid="button-create-circle"
                >
                  Create Circle
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading && <p className="text-center font-serif text-white/25 py-12">Loading circles...</p>}

        <div className="space-y-3">
          {circles.map((circle: any, i: number) => (
            <motion.div
              key={circle.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              whileHover={{ scale: 1.008, x: 4 }}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 p-5 cursor-pointer transition-all"
              onClick={() => setActiveCircleId(circle.id)}
              data-testid={`card-circle-${circle.id}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-grow min-w-0">
                  <h3 className="text-lg font-display font-light italic text-white/80 mb-1">{circle.name}</h3>
                  <p className="text-sm font-serif text-white/30 line-clamp-2">{circle.description}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="font-mono text-[9px] tracking-widest text-white/20 uppercase flex items-center gap-1">
                      <Users size={10} /> {circle.memberCount ?? 0} members
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <motion.button
                    onClick={() => joinCircle.mutate(circle.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-emerald-500/10 hover:border-emerald-500/20 text-white/30 hover:text-emerald-400 transition-all"
                    data-testid={`button-join-circle-${circle.id}`}
                    title="Join"
                  >
                    <UserPlus size={14} />
                  </motion.button>
                  <motion.button
                    onClick={() => leaveCircle.mutate(circle.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-red-500/10 hover:border-red-500/20 text-white/30 hover:text-red-400 transition-all"
                    data-testid={`button-leave-circle-${circle.id}`}
                    title="Leave"
                  >
                    <Leave size={14} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {!isLoading && circles.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 border border-dashed border-white/10 rounded-2xl">
            <Users size={32} className="mx-auto text-white/10 mb-4" />
            <p className="font-serif text-white/30">No circles yet — create one to gather your people.</p>
          </motion.div>
        )}
      </motion.div>
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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex items-center gap-3 text-white/25 mb-4">
          <Moon size={14} />
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase">Under the Stars</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-display font-light tracking-tight italic text-white/90 mb-3" data-testid="heading-moonlit-readings">
          Moonlit Readings
        </h1>
        <p className="font-serif text-base text-white/30 mb-10 max-w-xl">
          Live or asynchronous readings under the stars. Share your voice, hear others.
        </p>

        <div className="flex justify-end mb-6">
          <motion.button
            onClick={() => setShowCreate(!showCreate)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-5 py-2.5 border border-white/10 hover:border-white/20 rounded-full font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] transition-all"
            data-testid="button-toggle-create-reading"
          >
            <Plus size={14} /> Host a Reading
          </motion.button>
        </div>

        <AnimatePresence>
          {showCreate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 space-y-4" data-testid="form-create-reading">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Reading title"
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm font-serif text-white/70 placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors"
                  data-testid="input-reading-title"
                />
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description"
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm font-serif text-white/70 placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors"
                  data-testid="input-reading-description"
                />
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm font-mono text-white/50 focus:outline-none focus:border-white/15 transition-colors [color-scheme:dark]"
                  data-testid="input-reading-scheduled"
                />
                <motion.button
                  onClick={() => title.trim() && createReading.mutate()}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={!title.trim() || createReading.isPending}
                  className="px-6 py-2.5 rounded-full border border-white/10 hover:border-purple-500/30 bg-white/[0.04] hover:bg-white/[0.08] font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white transition-all disabled:opacity-30"
                  data-testid="button-create-reading"
                >
                  Create Reading
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading && <p className="text-center font-serif text-white/25 py-12">Loading readings...</p>}

        <div className="space-y-3">
          {readings.map((reading: any, i: number) => (
            <motion.div
              key={reading.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              whileHover={{ scale: 1.008, x: 4 }}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 p-5 transition-all"
              data-testid={`card-reading-${reading.id}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Star size={12} className="text-amber-400/40" />
                    <h3 className="text-lg font-display font-light italic text-white/80">{reading.title}</h3>
                  </div>
                  <p className="text-sm font-serif text-white/30 line-clamp-2 mb-3">{reading.description}</p>
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="font-mono text-[9px] tracking-widest text-white/20 uppercase flex items-center gap-1">
                      <Mic size={10} /> {reading.hostName || "Host"}
                    </span>
                    <span className="font-mono text-[9px] tracking-widest text-white/20 uppercase flex items-center gap-1">
                      <Users size={10} /> {reading.participantCount ?? 0} joined
                    </span>
                    {reading.scheduledAt && (
                      <span className="font-mono text-[9px] tracking-widest text-purple-400/50 uppercase flex items-center gap-1">
                        <Moon size={10} /> {new Date(reading.scheduledAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <motion.button
                    onClick={() => joinReading.mutate(reading.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-purple-500/10 hover:border-purple-500/20 text-white/30 hover:text-purple-400 transition-all"
                    data-testid={`button-join-reading-${reading.id}`}
                    title="Join"
                  >
                    <UserPlus size={14} />
                  </motion.button>
                  <motion.button
                    onClick={() => leaveReading.mutate(reading.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-red-500/10 hover:border-red-500/20 text-white/30 hover:text-red-400 transition-all"
                    data-testid={`button-leave-reading-${reading.id}`}
                    title="Leave"
                  >
                    <Leave size={14} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {!isLoading && readings.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 border border-dashed border-white/10 rounded-2xl">
            <Moon size={32} className="mx-auto text-white/10 mb-4" />
            <p className="font-serif text-white/30">No readings yet — host one under the moonlight.</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

// ─── ReplantRequestsPage ─────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-400/80",
  accepted: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400/80",
  declined: "border-red-500/30 bg-red-500/10 text-red-400/80",
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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex items-center gap-3 text-white/25 mb-4">
          <Mail size={14} />
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase">Editorial</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-display font-light tracking-tight italic text-white/90 mb-3" data-testid="heading-replant-requests">
          Replant Requests
        </h1>
        <p className="font-serif text-base text-white/30 mb-10 max-w-xl">
          When editors want to feature your work, you'll find their invitations here.
        </p>

        {isLoading && <p className="text-center font-serif text-white/25 py-12">Loading requests...</p>}

        <div className="space-y-3">
          {requests.map((req: any, i: number) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              whileHover={{ scale: 1.008, x: 4 }}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 p-5 transition-all"
              data-testid={`card-request-${req.id}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-display font-light italic text-white/80">
                      {req.writingTitle || "Untitled Piece"}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-widest border ${statusColors[req.status] || statusColors.pending}`} data-testid={`badge-status-${req.id}`}>
                      {req.status}
                    </span>
                  </div>
                  {req.editorNote && (
                    <p className="text-sm font-serif text-white/40 italic mb-2">"{req.editorNote}"</p>
                  )}
                  <span className="font-mono text-[9px] text-white/15">{timeAgo(req.createdAt)}</span>
                </div>

                {req.status === "pending" && (
                  <div className="flex gap-2 flex-shrink-0">
                    <motion.button
                      onClick={() => respond.mutate({ id: req.id, status: "accepted" })}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      disabled={respond.isPending}
                      className="p-2 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-emerald-500/10 hover:border-emerald-500/20 text-white/30 hover:text-emerald-400 transition-all"
                      data-testid={`button-accept-${req.id}`}
                      title="Accept"
                    >
                      <Check size={14} />
                    </motion.button>
                    <motion.button
                      onClick={() => respond.mutate({ id: req.id, status: "declined" })}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      disabled={respond.isPending}
                      className="p-2 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-red-500/10 hover:border-red-500/20 text-white/30 hover:text-red-400 transition-all"
                      data-testid={`button-decline-${req.id}`}
                      title="Decline"
                    >
                      <X size={14} />
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {!isLoading && requests.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 border border-dashed border-white/10 rounded-2xl" data-testid="empty-replant-requests">
            <Mail size={32} className="mx-auto text-white/10 mb-4" />
            <p className="font-serif text-white/30">No replant requests yet — keep growing your garden.</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
