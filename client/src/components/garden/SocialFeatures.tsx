import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Flower2, Droplets, Zap, Leaf, Sprout, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

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

const REACTION_TYPES = [
  { type: "glow", icon: Sparkles, label: "This glows", color: "text-amber-400" },
  { type: "pressed_flower", icon: Flower2, label: "Pressing this flower", color: "text-pink-400" },
  { type: "dewdrop", icon: Droplets, label: "A dewdrop", color: "text-sky-400" },
  { type: "firefly", icon: Zap, label: "Fireflies here", color: "text-yellow-300" },
  { type: "roots", icon: Leaf, label: "Deep roots", color: "text-emerald-400" },
] as const;

type ResonanceData = {
  resonances: { type: string; count: number; users: string[] }[];
  userResonances: string[];
};

export function ResonanceBar({ writingId, compact }: { writingId: string; compact?: boolean }) {
  const queryClient = useQueryClient();

  const { data } = useQuery<ResonanceData>({
    queryKey: ["/api/resonances", writingId],
    queryFn: async () => {
      const res = await fetch(`/api/resonances/${writingId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch resonances");
      return res.json();
    },
  });

  const addMutation = useMutation({
    mutationFn: async (type: string) => {
      const res = await fetch("/api/resonances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ writingId, type }),
      });
      if (!res.ok) throw new Error("Failed to add resonance");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resonances", writingId] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (type: string) => {
      const res = await fetch("/api/resonances", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ writingId, type }),
      });
      if (!res.ok) throw new Error("Failed to remove resonance");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resonances", writingId] });
    },
  });

  const resonances = data?.resonances || [];
  const userResonances = data?.userResonances || [];

  const getCount = (type: string) => {
    const r = resonances.find((r) => r.type === type);
    return r?.count || 0;
  };

  const isActive = (type: string) => userResonances.includes(type);

  const handleClick = (type: string) => {
    if (isActive(type)) {
      removeMutation.mutate(type);
    } else {
      addMutation.mutate(type);
    }
  };

  const visibleReactions = compact
    ? REACTION_TYPES.filter((r) => getCount(r.type) > 0)
    : REACTION_TYPES;

  return (
    <div className="flex items-center gap-1" data-testid={`resonance-bar-${writingId}`}>
      {visibleReactions.map((reaction) => {
        const Icon = reaction.icon;
        const count = getCount(reaction.type);
        const active = isActive(reaction.type);
        return (
          <motion.button
            key={reaction.type}
            onClick={() => handleClick(reaction.type)}
            whileTap={{ scale: 1.3 }}
            whileHover={{ scale: 1.1 }}
            className={`flex items-center gap-1 rounded-full border transition-all ${
              compact ? "px-1.5 py-0.5" : "px-2 py-1"
            } ${
              active
                ? `border-white/15 bg-white/[0.08] ${reaction.color}`
                : "border-white/[0.04] bg-transparent text-white/30 hover:text-white/50 hover:border-white/10"
            }`}
            title={reaction.label}
            data-testid={`resonance-${reaction.type}-${writingId}`}
          >
            <Icon size={compact ? 10 : 13} />
            {count > 0 && (
              <span className={`font-mono ${compact ? "text-[8px]" : "text-[9px]"} ${active ? "text-white/70" : "text-white/30"}`}>
                {count}
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

type MarginaliaNote = {
  id: string;
  userId: string;
  content: string;
  parentId: string | null;
  highlightText: string | null;
  createdAt: string;
  userName: string | null;
  userImage: string | null;
};

export function MarginaliaSection({ writingId, authorId }: { writingId: string; authorId: string }) {
  const [newNote, setNewNote] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notes = [] } = useQuery<MarginaliaNote[]>({
    queryKey: ["/api/marginalia", writingId],
    queryFn: async () => {
      const res = await fetch(`/api/marginalia/${writingId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch marginalia");
      return res.json();
    },
  });

  const addMutation = useMutation({
    mutationFn: async ({ content, parentId }: { content: string; parentId?: string }) => {
      const res = await fetch("/api/marginalia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ writingId, content, parentId }),
      });
      if (!res.ok) throw new Error("Failed to add note");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marginalia", writingId] });
      setNewNote("");
      setReplyTo(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/marginalia/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete note");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marginalia", writingId] });
    },
  });

  const handleSubmit = () => {
    const trimmed = newNote.trim();
    if (!trimmed) return;
    addMutation.mutate({ content: trimmed, parentId: replyTo || undefined });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const topLevelNotes = notes.filter((n) => !n.parentId);
  const getReplies = (parentId: string) => notes.filter((n) => n.parentId === parentId);

  const renderNote = (note: MarginaliaNote, isReply = false) => (
    <motion.div
      key={note.id}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`${isReply ? "ml-8 border-l border-white/[0.06] pl-4" : ""}`}
      data-testid={`marginalia-note-${note.id}`}
    >
      <div className="flex items-start gap-3 py-3">
        <div className="w-7 h-7 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/40 font-mono text-[9px] uppercase flex-shrink-0">
          {note.userName?.[0] || "?"}
        </div>
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] text-white/40 tracking-wide">
              {note.userName || "Anonymous"}
            </span>
            <span className="font-mono text-[9px] text-white/15">
              {timeAgo(note.createdAt)}
            </span>
          </div>
          {note.highlightText && (
            <div className="border-l-2 border-white/10 pl-3 mb-2">
              <p className="font-serif text-xs text-white/20 italic leading-relaxed">
                "{note.highlightText}"
              </p>
            </div>
          )}
          <p className="font-serif text-sm text-white/50 leading-relaxed">
            {note.content}
          </p>
          <div className="flex items-center gap-3 mt-1.5">
            <button
              onClick={() => setReplyTo(replyTo === note.id ? null : note.id)}
              className="font-mono text-[9px] text-white/20 hover:text-white/40 transition-colors tracking-widest uppercase"
              data-testid={`button-reply-${note.id}`}
            >
              {replyTo === note.id ? "Cancel" : "Reply"}
            </button>
            {user && note.userId === user.id && (
              <button
                onClick={() => deleteMutation.mutate(note.id)}
                className="text-white/15 hover:text-red-400/60 transition-colors"
                data-testid={`button-delete-note-${note.id}`}
              >
                <Trash2 size={10} />
              </button>
            )}
          </div>
          <AnimatePresence>
            {replyTo === note.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-2"
              >
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Reply..."
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-sm font-serif text-white/60 placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors"
                  data-testid={`input-reply-${note.id}`}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {getReplies(note.id).map((reply) => renderNote(reply, true))}
    </motion.div>
  );

  return (
    <div className="border-t border-white/[0.04] pt-4 mt-4" data-testid={`marginalia-section-${writingId}`}>
      <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-white/20 mb-3">
        Marginalia
      </p>

      <div className="space-y-0 divide-y divide-white/[0.03]">
        {topLevelNotes.map((note) => renderNote(note))}
      </div>

      {notes.length === 0 && (
        <p className="font-serif text-sm text-white/15 italic py-4">
          No notes yet — be the first to leave a mark.
        </p>
      )}

      {!replyTo && (
        <div className="mt-4">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Leave a note in the margins..."
            className="w-full bg-white/[0.02] border border-white/[0.06] rounded-lg px-4 py-3 text-sm font-serif text-white/60 placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors"
            data-testid={`input-marginalia-${writingId}`}
          />
        </div>
      )}
    </div>
  );
}

export function TendButton({
  gardenerId,
  gardenerName,
  size = "md",
}: {
  gardenerId: string;
  gardenerName?: string;
  size?: "sm" | "md";
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data } = useQuery<{ isTending: boolean }>({
    queryKey: ["/api/tending/check", gardenerId],
    queryFn: async () => {
      const res = await fetch(`/api/tending/check/${gardenerId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to check tending");
      return res.json();
    },
    enabled: !!user && user.id !== gardenerId,
  });

  const tendMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/tending/${gardenerId}`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to tend");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tending/check", gardenerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/tending-count", gardenerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/tending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tending-feed"] });
    },
  });

  const untendMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/tending/${gardenerId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to untend");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tending/check", gardenerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/tending-count", gardenerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/tending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tending-feed"] });
    },
  });

  if (!user || user.id === gardenerId) return null;

  const isTending = data?.isTending || false;

  const handleClick = () => {
    if (isTending) {
      untendMutation.mutate();
    } else {
      tendMutation.mutate();
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      whileTap={{ scale: 1.15 }}
      whileHover={{ scale: 1.05 }}
      className={`inline-flex items-center gap-2 rounded-full border font-mono uppercase tracking-widest transition-all ${
        size === "sm" ? "px-3 py-1.5 text-[9px]" : "px-4 py-2 text-[10px]"
      } ${
        isTending
          ? "border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-400/80 shadow-[0_0_12px_rgba(16,185,129,0.1)]"
          : "border-white/10 bg-transparent text-white/40 hover:border-white/20 hover:text-white/60"
      }`}
      data-testid={`button-tend-${gardenerId}`}
    >
      <Sprout size={size === "sm" ? 12 : 14} />
      {isTending ? "Tending ✓" : "Tend this Garden"}
    </motion.button>
  );
}