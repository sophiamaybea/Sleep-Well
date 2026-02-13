import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Search, BookOpen, Bookmark, Heart, MessageCircle, Plus, Trash2, Check, ChevronDown, Sparkles } from "lucide-react";

type GalleryWriting = {
  id: string;
  title: string;
  content: string;
  genre: string;
  stage: string;
  authorId: string;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type QueueItem = {
  id: string;
  userId: string;
  writingId: string;
  isRead: boolean;
  addedAt: string;
  writing?: GalleryWriting;
};

type SavedItem = {
  id: string;
  userId: string;
  writingId: string;
  savedAt: string;
  writing?: GalleryWriting;
};

type PollinationItem = {
  id: string;
  fromUserId: string;
  writingId: string;
  highlightText: string | null;
  affirmation: string;
  createdAt: string;
  writing?: GalleryWriting;
};

const genreFilters = ["all", "poetry", "fiction", "essay", "fragment"] as const;

async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, { credentials: "include", ...options });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

function timeAgo(date: string | null | undefined) {
  if (!date) return "";
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function GalleryPage() {
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState<string>("all");
  const queryClient = useQueryClient();

  const { data: writings = [], isLoading } = useQuery<GalleryWriting[]>({
    queryKey: ["gallery", search, genre],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (genre !== "all") params.set("genre", genre);
      const qs = params.toString();
      return apiFetch(`/api/gallery${qs ? `?${qs}` : ""}`);
    },
  });

  const addToQueue = useMutation({
    mutationFn: (writingId: string) =>
      apiFetch("/api/reading-queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ writingId }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reading-queue"] }),
  });

  const savePiece = useMutation({
    mutationFn: (writingId: string) =>
      apiFetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ writingId }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["saved"] }),
  });

  return (
    <div className="max-w-5xl mx-auto" data-testid="gallery-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h1 className="text-3xl md:text-5xl font-display font-light tracking-tight italic text-white/90 mb-2" data-testid="heading-gallery">
          Gallery
        </h1>
        <p className="font-serif text-white/30 mb-8">Published works from the community</p>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-grow">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search writings..."
              className="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm font-serif text-white/70 placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors"
              data-testid="input-gallery-search"
            />
          </div>
          <div className="flex gap-1 p-1 bg-white/[0.02] rounded-xl border border-white/[0.06]">
            {genreFilters.map((f) => (
              <button
                key={f}
                onClick={() => setGenre(f)}
                className={`px-3 py-2 rounded-lg font-mono text-[10px] uppercase tracking-widest transition-all ${
                  genre === f ? "bg-white/[0.08] text-white/80" : "text-white/30 hover:text-white/50"
                }`}
                data-testid={`filter-genre-${f}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {isLoading && (
        <div className="text-center py-16">
          <Sparkles size={20} className="mx-auto text-white/20 animate-pulse" />
        </div>
      )}

      {!isLoading && writings.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16" data-testid="gallery-empty">
          <BookOpen size={32} className="mx-auto text-white/15 mb-4" />
          <p className="font-serif text-white/30">No published writings found.</p>
        </motion.div>
      )}

      <div className="grid gap-3">
        <AnimatePresence mode="popLayout">
          {writings.map((w, i) => (
            <motion.div
              key={w.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: i * 0.04, duration: 0.4 }}
              data-testid={`card-gallery-${w.id}`}
            >
              <div className="rounded-xl border border-white/[0.04] hover:border-white/10 bg-white/[0.01] hover:bg-white/[0.03] p-5 md:p-6 transition-all">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="min-w-0">
                    <h3 className="text-lg font-display font-light italic text-white/70 truncate">{w.title || "Untitled"}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-white/20">{w.genre}</span>
                      <span className="font-mono text-[9px] text-white/10">{timeAgo(w.publishedAt || w.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm font-serif text-white/30 line-clamp-2 mb-4">{w.content?.slice(0, 200)}</p>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addToQueue.mutate(w.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-white/[0.06] rounded-full font-mono text-[9px] uppercase tracking-widest text-white/40 hover:text-white/70 hover:border-white/15 transition-all"
                    data-testid={`button-queue-${w.id}`}
                  >
                    <Plus size={12} />
                    Add to Queue
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => savePiece.mutate(w.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-white/[0.06] rounded-full font-mono text-[9px] uppercase tracking-widest text-white/40 hover:text-amber-400/70 hover:border-amber-500/20 transition-all"
                    data-testid={`button-save-${w.id}`}
                  >
                    <Bookmark size={12} />
                    Save
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function ReadingQueuePage() {
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery<QueueItem[]>({
    queryKey: ["reading-queue"],
    queryFn: () => apiFetch("/api/reading-queue"),
  });

  const markRead = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/reading-queue/${id}/read`, { method: "PATCH" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reading-queue"] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/reading-queue/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reading-queue"] }),
  });

  return (
    <div className="max-w-4xl mx-auto" data-testid="reading-queue-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h1 className="text-3xl md:text-5xl font-display font-light tracking-tight italic text-white/90 mb-2" data-testid="heading-reading-queue">
          Reading Queue
        </h1>
        <p className="font-serif text-white/30 mb-8">{items.length} {items.length === 1 ? "piece" : "pieces"} queued</p>
      </motion.div>

      {isLoading && (
        <div className="text-center py-16">
          <Sparkles size={20} className="mx-auto text-white/20 animate-pulse" />
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16" data-testid="queue-empty">
          <BookOpen size={32} className="mx-auto text-white/15 mb-4" />
          <p className="font-serif text-white/30">Your reading queue is empty.</p>
          <p className="font-serif text-white/20 text-sm mt-1">Browse the Gallery to add pieces.</p>
        </motion.div>
      )}

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: i * 0.04, duration: 0.4 }}
              data-testid={`card-queue-${item.id}`}
            >
              <div className={`rounded-xl border p-5 transition-all ${
                item.isRead
                  ? "border-emerald-500/10 bg-emerald-500/[0.02]"
                  : "border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10"
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      {item.isRead && <Check size={14} className="text-emerald-400/60 flex-shrink-0" />}
                      <h3 className={`text-lg font-display font-light italic truncate ${item.isRead ? "text-white/40" : "text-white/70"}`}>
                        {item.writing?.title || "Untitled"}
                      </h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-white/20">{item.writing?.genre}</span>
                      <span className="font-mono text-[9px] text-white/10">{timeAgo(item.addedAt)}</span>
                      <span className={`font-mono text-[9px] uppercase tracking-widest ${item.isRead ? "text-emerald-400/40" : "text-amber-400/40"}`}>
                        {item.isRead ? "read" : "unread"}
                      </span>
                    </div>
                    {item.writing?.content && (
                      <p className="text-sm font-serif text-white/25 line-clamp-1 mt-2">{item.writing.content.slice(0, 150)}</p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {!item.isRead && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => markRead.mutate(item.id)}
                        className="p-2 rounded-lg border border-white/[0.06] text-white/30 hover:text-emerald-400/70 hover:border-emerald-500/20 transition-all"
                        title="Mark as read"
                        data-testid={`button-mark-read-${item.id}`}
                      >
                        <Check size={14} />
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => remove.mutate(item.id)}
                      className="p-2 rounded-lg border border-white/[0.06] text-white/30 hover:text-pink-400/70 hover:border-pink-500/20 transition-all"
                      title="Remove"
                      data-testid={`button-remove-queue-${item.id}`}
                    >
                      <Trash2 size={14} />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function ExplorePage() {
  const { data: writings = [], isLoading } = useQuery<GalleryWriting[]>({
    queryKey: ["gallery"],
    queryFn: () => apiFetch("/api/gallery"),
  });

  const grouped = writings.reduce<Record<string, GalleryWriting[]>>((acc, w) => {
    const g = w.genre || "other";
    if (!acc[g]) acc[g] = [];
    acc[g].push(w);
    return acc;
  }, {});

  const shelfOrder = ["poetry", "fiction", "essay", "fragment", "other"];
  const shelves = shelfOrder.filter((g) => grouped[g]?.length);

  return (
    <div className="max-w-6xl mx-auto" data-testid="explore-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h1 className="text-3xl md:text-5xl font-display font-light tracking-tight italic text-white/90 mb-2" data-testid="heading-explore">
          Explore
        </h1>
        <p className="font-serif text-white/30 mb-10">Browse by genre</p>
      </motion.div>

      {isLoading && (
        <div className="text-center py-16">
          <Sparkles size={20} className="mx-auto text-white/20 animate-pulse" />
        </div>
      )}

      {!isLoading && shelves.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16" data-testid="explore-empty">
          <BookOpen size={32} className="mx-auto text-white/15 mb-4" />
          <p className="font-serif text-white/30">No published writings to explore yet.</p>
        </motion.div>
      )}

      <div className="space-y-10">
        {shelves.map((genre, si) => (
          <motion.div
            key={genre}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.1, duration: 0.5 }}
            data-testid={`shelf-${genre}`}
          >
            <h2 className="text-xl font-display font-light italic text-white/60 mb-4 capitalize">{genre}</h2>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
              {grouped[genre].map((w) => (
                <motion.div
                  key={w.id}
                  whileHover={{ scale: 1.03, y: -4 }}
                  className="flex-shrink-0 w-64 rounded-xl border border-white/[0.04] hover:border-white/10 bg-white/[0.01] hover:bg-white/[0.03] p-5 transition-all cursor-default"
                  data-testid={`card-explore-${w.id}`}
                >
                  <h3 className="text-base font-display font-light italic text-white/70 truncate mb-2">{w.title || "Untitled"}</h3>
                  <p className="text-xs font-serif text-white/25 line-clamp-3 mb-3">{w.content?.slice(0, 120)}</p>
                  <span className="font-mono text-[9px] text-white/15">{timeAgo(w.publishedAt || w.createdAt)}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function SavedPage() {
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery<SavedItem[]>({
    queryKey: ["saved"],
    queryFn: () => apiFetch("/api/saved"),
  });

  const unsave = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/saved/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["saved"] }),
  });

  return (
    <div className="max-w-5xl mx-auto" data-testid="saved-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h1 className="text-3xl md:text-5xl font-display font-light tracking-tight italic text-white/90 mb-2" data-testid="heading-saved">
          Saved
        </h1>
        <p className="font-serif text-white/30 mb-8">{items.length} saved {items.length === 1 ? "piece" : "pieces"}</p>
      </motion.div>

      {isLoading && (
        <div className="text-center py-16">
          <Sparkles size={20} className="mx-auto text-white/20 animate-pulse" />
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16" data-testid="saved-empty">
          <Bookmark size={32} className="mx-auto text-white/15 mb-4" />
          <p className="font-serif text-white/30">No saved pieces yet.</p>
          <p className="font-serif text-white/20 text-sm mt-1">Save writings from the Gallery to revisit later.</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <AnimatePresence mode="popLayout">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.04, duration: 0.4 }}
              data-testid={`card-saved-${item.id}`}
            >
              <div className="rounded-xl border border-white/[0.04] hover:border-white/10 bg-white/[0.01] hover:bg-white/[0.03] p-5 transition-all h-full flex flex-col">
                <div className="flex-grow">
                  <h3 className="text-base font-display font-light italic text-white/70 truncate mb-1">{item.writing?.title || "Untitled"}</h3>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-white/20">{item.writing?.genre}</span>
                    <span className="font-mono text-[9px] text-white/10">{timeAgo(item.savedAt)}</span>
                  </div>
                  <p className="text-xs font-serif text-white/25 line-clamp-3">{item.writing?.content?.slice(0, 150)}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/[0.04]">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => unsave.mutate(item.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-white/[0.06] rounded-full font-mono text-[9px] uppercase tracking-widest text-white/30 hover:text-pink-400/70 hover:border-pink-500/20 transition-all"
                    data-testid={`button-unsave-${item.id}`}
                  >
                    <Trash2 size={11} />
                    Unsave
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function PollinationPage() {
  const [tab, setTab] = useState<"give" | "received">("give");
  const [selectedWritingId, setSelectedWritingId] = useState("");
  const [affirmation, setAffirmation] = useState("");
  const [highlightText, setHighlightText] = useState("");
  const queryClient = useQueryClient();

  const { data: gallery = [] } = useQuery<GalleryWriting[]>({
    queryKey: ["gallery"],
    queryFn: () => apiFetch("/api/gallery"),
  });

  const { data: received = [], isLoading: loadingReceived } = useQuery<PollinationItem[]>({
    queryKey: ["pollinations-received"],
    queryFn: () => apiFetch("/api/pollinations/received"),
    enabled: tab === "received",
  });

  const sendPollination = useMutation({
    mutationFn: () =>
      apiFetch("/api/pollinations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          writingId: selectedWritingId,
          affirmation,
          highlightText: highlightText || undefined,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pollinations-received"] });
      setSelectedWritingId("");
      setAffirmation("");
      setHighlightText("");
    },
  });

  return (
    <div className="max-w-4xl mx-auto" data-testid="pollination-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h1 className="text-3xl md:text-5xl font-display font-light tracking-tight italic text-white/90 mb-2" data-testid="heading-pollination">
          Pollination
        </h1>
        <p className="font-serif text-white/30 mb-8">Share affirmations on writings you love</p>

        <div className="flex gap-1 p-1 bg-white/[0.02] rounded-xl border border-white/[0.06] w-fit mb-8">
          {(["give", "received"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg font-mono text-[10px] uppercase tracking-widest transition-all ${
                tab === t ? "bg-white/[0.08] text-white/80" : "text-white/30 hover:text-white/50"
              }`}
              data-testid={`tab-pollination-${t}`}
            >
              {t === "give" ? "Give" : "Received"}
            </button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {tab === "give" && (
          <motion.div
            key="give"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
            data-testid="pollination-give-form"
          >
            <div>
              <label className="font-mono text-[9px] uppercase tracking-widest text-white/20 block mb-2">Select a piece</label>
              <div className="relative">
                <select
                  value={selectedWritingId}
                  onChange={(e) => setSelectedWritingId(e.target.value)}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm font-serif text-white/70 focus:outline-none focus:border-white/15 transition-colors appearance-none cursor-pointer"
                  data-testid="select-writing"
                >
                  <option value="" className="bg-neutral-900">Choose a writing...</option>
                  {gallery.map((w) => (
                    <option key={w.id} value={w.id} className="bg-neutral-900">
                      {w.title || "Untitled"} — {w.genre}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="font-mono text-[9px] uppercase tracking-widest text-white/20 block mb-2">Highlight text (optional)</label>
              <input
                type="text"
                value={highlightText}
                onChange={(e) => setHighlightText(e.target.value)}
                placeholder="A line or phrase that resonated..."
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm font-serif text-white/70 placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors"
                data-testid="input-highlight"
              />
            </div>

            <div>
              <label className="font-mono text-[9px] uppercase tracking-widest text-white/20 block mb-2">Your affirmation</label>
              <textarea
                value={affirmation}
                onChange={(e) => setAffirmation(e.target.value)}
                placeholder="What moved you about this piece..."
                rows={4}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm font-serif text-white/70 placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors resize-none"
                data-testid="input-affirmation"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => sendPollination.mutate()}
              disabled={!selectedWritingId || !affirmation.trim() || sendPollination.isPending}
              className="flex items-center gap-2 px-6 py-3 bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 hover:border-pink-500/30 rounded-full font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              data-testid="button-send-pollination"
            >
              <Heart size={14} />
              {sendPollination.isPending ? "Sending..." : "Send Affirmation"}
            </motion.button>
          </motion.div>
        )}

        {tab === "received" && (
          <motion.div
            key="received"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {loadingReceived && (
              <div className="text-center py-16">
                <Sparkles size={20} className="mx-auto text-white/20 animate-pulse" />
              </div>
            )}

            {!loadingReceived && received.length === 0 && (
              <div className="text-center py-16" data-testid="pollination-received-empty">
                <Heart size={32} className="mx-auto text-white/15 mb-4" />
                <p className="font-serif text-white/30">No affirmations received yet.</p>
                <p className="font-serif text-white/20 text-sm mt-1">When someone resonates with your work, it'll appear here.</p>
              </div>
            )}

            <div className="space-y-3">
              {received.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  className="rounded-xl border border-pink-500/10 bg-pink-500/[0.02] p-5"
                  data-testid={`card-pollination-${p.id}`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Heart size={14} className="text-pink-400/50" />
                    <span className="font-mono text-[9px] uppercase tracking-widest text-pink-400/40">Affirmation</span>
                    <span className="font-mono text-[9px] text-white/10 ml-auto">{timeAgo(p.createdAt)}</span>
                  </div>
                  {p.highlightText && (
                    <div className="border-l-2 border-pink-500/20 pl-4 mb-3">
                      <p className="text-sm font-serif italic text-white/40">"{p.highlightText}"</p>
                    </div>
                  )}
                  <p className="text-sm font-serif text-white/60 leading-relaxed">{p.affirmation}</p>
                  {p.writing && (
                    <div className="mt-3 pt-3 border-t border-white/[0.04]">
                      <span className="font-mono text-[9px] text-white/15">on "{p.writing.title || "Untitled"}"</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
