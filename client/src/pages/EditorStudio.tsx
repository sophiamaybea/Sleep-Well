import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Search, Plus, Send, BookOpen,
  Inbox, FileText, Layers, Eye, Leaf, MessageCircle,
  ChevronDown, ChevronRight, Trash2, Edit3, Clock,
  CheckCircle, XCircle, GripVertical, X
} from "lucide-react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

type Tab = "overview" | "garden-stream" | "greenhouse" | "requests" | "issues";

function stripHtmlForExcerpt(html: string): string {
  return html.replace(/<[^>]*>/g, "").slice(0, 200);
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

const statusColors: Record<string, string> = {
  draft: "bg-white/10 text-white/60",
  sent: "bg-amber-500/20 text-amber-300",
  pending: "bg-amber-500/20 text-amber-300",
  accepted: "bg-emerald-500/20 text-emerald-300",
  declined: "bg-rose-500/20 text-rose-300",
  in_production: "bg-blue-500/20 text-blue-300",
  locked: "bg-blue-500/20 text-blue-300",
  published: "bg-emerald-500/20 text-emerald-300",
};

const priorityColors: Record<string, string> = {
  high: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  medium: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  low: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
};

const readinessColors: Record<string, string> = {
  raw_seed: "bg-amber-500/15 text-amber-300 border-amber-500/20",
  growing: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
  ready_to_show: "bg-pink-500/15 text-pink-300 border-pink-500/20",
};

const stageLabels: Record<string, string> = {
  uncontacted: "Uncontacted",
  request_sent: "Request Sent",
  accepted: "Accepted",
  declined: "Declined",
};

const workflowLabels: Record<string, string> = {
  draft_received: "Draft Received",
  edited_approved: "Edited & Approved",
  design_in_progress: "Design In Progress",
  design_approved: "Design Approved",
  ready_to_publish: "Ready to Publish",
};

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Overview", icon: <Layers size={15} /> },
  { id: "garden-stream", label: "Garden Stream", icon: <Leaf size={15} /> },
  { id: "greenhouse", label: "Greenhouse", icon: <BookOpen size={15} /> },
  { id: "requests", label: "Requests", icon: <Inbox size={15} /> },
  { id: "issues", label: "Issues", icon: <FileText size={15} /> },
];

function OverviewTab() {
  const { data: overview, isLoading } = useQuery<any>({
    queryKey: ["/api/editor/overview"],
  });

  const cards = [
    { key: "new", testId: "card-overview-new", label: "New to Garden", value: overview?.newPieces ?? 0, icon: <Leaf size={20} className="text-emerald-400/70" /> },
    { key: "editorial", testId: "card-overview-editorial", label: "Available for Editorial", value: overview?.editorialAvailable ?? 0, icon: <Eye size={20} className="text-amber-400/70" /> },
    { key: "pending", testId: "card-overview-pending", label: "Pending Requests", value: overview?.pendingRequests ?? 0, icon: <Clock size={20} className="text-blue-400/70" /> },
    { key: "issues", testId: "card-overview-issues", label: "Draft Issues", value: overview?.draftIssues ?? 0, icon: <FileText size={20} className="text-violet-400/70" /> },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6 animate-pulse">
            <div className="h-4 w-24 bg-white/10 rounded mb-4" />
            <div className="h-8 w-16 bg-white/10 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {cards.map((card) => (
        <div
          key={card.key}
          data-testid={card.testId}
          className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="font-serif text-sm text-amber-100/60">{card.label}</span>
            {card.icon}
          </div>
          <p className="font-display text-3xl font-light text-amber-200 italic">{card.value}</p>
        </div>
      ))}
    </motion.div>
  );
}

function GardenStreamTab() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("any");
  const [readiness, setReadiness] = useState("all");
  const [quiet, setQuiet] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState<string | null>(null);
  const [ghFolder, setGhFolder] = useState("");
  const [ghPriority, setGhPriority] = useState("medium");
  const [ghNote, setGhNote] = useState("");

  const { data: stream = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/editor/garden-stream", genre, readiness, search, quiet],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (genre !== "any") params.set("genre", genre);
      if (readiness !== "all") params.set("readiness", readiness);
      if (search) params.set("search", search);
      if (quiet) params.set("quiet", "true");
      const res = await fetch(`/api/editor/garden-stream?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  });

  const addToGreenhouse = useMutation({
    mutationFn: async (data: { writingId: string; themeFolder?: string; priority: string; internalNote?: string }) => {
      const res = await apiRequest("POST", "/api/editor/greenhouse", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/editor/greenhouse"] });
      queryClient.invalidateQueries({ queryKey: ["/api/editor/overview"] });
      setShowAddModal(null);
      setGhFolder("");
      setGhPriority("medium");
      setGhNote("");
    },
  });

  const genres = ["any", "poetry", "fiction", "essay", "hybrid"];
  const readinesses = ["all", "raw_seed", "growing", "ready_to_show"];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search the garden stream..."
          className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-serif text-amber-100/80 placeholder:text-white/30 focus:outline-none focus:border-amber-500/30 transition-colors"
          data-testid="input-search-stream"
        />
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {genres.map(g => (
          <button
            key={g}
            onClick={() => setGenre(g)}
            className={`px-3 py-1.5 rounded-full font-mono text-[9px] uppercase tracking-widest border transition-all ${
              genre === g ? "border-amber-500/30 bg-amber-500/10 text-amber-300" : "border-white/10 text-white/40 hover:text-white/60"
            }`}
          >
            {g}
          </button>
        ))}
        <span className="w-px h-5 bg-white/10" />
        {readinesses.map(r => (
          <button
            key={r}
            onClick={() => setReadiness(r)}
            className={`px-3 py-1.5 rounded-full font-mono text-[9px] uppercase tracking-widest border transition-all ${
              readiness === r ? "border-amber-500/30 bg-amber-500/10 text-amber-300" : "border-white/10 text-white/40 hover:text-white/60"
            }`}
          >
            {r === "all" ? "All" : r.replace(/_/g, " ")}
          </button>
        ))}
        <span className="w-px h-5 bg-white/10" />
        <button
          onClick={() => setQuiet(!quiet)}
          className={`px-3 py-1.5 rounded-full font-mono text-[9px] uppercase tracking-widest border transition-all ${
            quiet ? "border-violet-500/30 bg-violet-500/10 text-violet-300" : "border-white/10 text-white/40 hover:text-white/60"
          }`}
        >
          Quiet pieces
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5 animate-pulse space-y-3">
              <div className="h-4 w-48 bg-white/10 rounded" />
              <div className="h-3 w-full bg-white/[0.06] rounded" />
              <div className="h-3 w-2/3 bg-white/[0.06] rounded" />
            </div>
          ))}
        </div>
      ) : stream.length === 0 ? (
        <p className="text-center py-12 font-serif text-white/40 text-sm">No pieces found matching your filters.</p>
      ) : (
        <div className="space-y-3">
          {stream.map((piece: any) => (
            <div key={piece.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden transition-all">
              <button
                onClick={() => setExpandedId(expandedId === piece.id ? null : piece.id)}
                className="w-full text-left p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-grow">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-display text-base font-light italic text-amber-200/90">{piece.title || "Untitled"}</h3>
                      <span className={`px-2 py-0.5 rounded-full font-mono text-[8px] uppercase tracking-widest border ${readinessColors[piece.readiness] || "border-white/10 text-white/40"}`}>
                        {(piece.readiness || "raw_seed").replace(/_/g, " ")}
                      </span>
                      <span className="px-2 py-0.5 rounded-full font-mono text-[8px] uppercase tracking-widest border border-white/10 text-white/40">
                        {piece.genre}
                      </span>
                    </div>
                    <p className="text-xs font-serif text-white/40 mb-2">
                      by {piece.authorName || piece.author?.username || "Unknown"} · {timeAgo(piece.createdAt)}
                    </p>
                    {(piece.tags || []).length > 0 && (
                      <div className="flex gap-1 mb-2">
                        {piece.tags.map((tag: string) => (
                          <span key={tag} className="font-mono text-[7px] uppercase tracking-widest text-violet-400/40 bg-violet-500/[0.06] px-1.5 py-0.5 rounded-full">{tag}</span>
                        ))}
                      </div>
                    )}
                    {!expandedId && piece.content && (
                      <p className="text-sm font-serif text-white/40 line-clamp-2">{stripHtmlForExcerpt(piece.content)}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <ChevronDown size={14} className={`text-white/30 transition-transform ${expandedId === piece.id ? "rotate-180" : ""}`} />
                  </div>
                </div>
              </button>

              <AnimatePresence>
                {expandedId === piece.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 border-t border-white/5 pt-4">
                      <div className="font-serif text-sm text-amber-100/70 leading-relaxed mb-4 max-h-64 overflow-y-auto" dangerouslySetInnerHTML={{ __html: piece.content }} />
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); setShowAddModal(piece.id); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[9px] uppercase tracking-widest border border-amber-500/20 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-all"
                          data-testid="btn-add-greenhouse"
                        >
                          <Plus size={12} /> Add to Greenhouse
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {showAddModal === piece.id && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(null)}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#0f1520] border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4"
                    onClick={e => e.stopPropagation()}
                  >
                    <h3 className="font-display text-lg text-amber-200 italic mb-4">Add to Greenhouse</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block font-mono text-[9px] uppercase tracking-widest text-white/40 mb-1">Theme Folder</label>
                        <input
                          value={ghFolder}
                          onChange={e => setGhFolder(e.target.value)}
                          placeholder="e.g., Spring Issue, Memory..."
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-serif text-amber-100/80 placeholder:text-white/25 focus:outline-none focus:border-amber-500/30"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-[9px] uppercase tracking-widest text-white/40 mb-1">Priority</label>
                        <select
                          value={ghPriority}
                          onChange={e => setGhPriority(e.target.value)}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-serif text-amber-100/80 focus:outline-none focus:border-amber-500/30"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-mono text-[9px] uppercase tracking-widest text-white/40 mb-1">Internal Note</label>
                        <textarea
                          value={ghNote}
                          onChange={e => setGhNote(e.target.value)}
                          placeholder="Notes for yourself..."
                          rows={3}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-serif text-amber-100/80 placeholder:text-white/25 focus:outline-none focus:border-amber-500/30 resize-none"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => setShowAddModal(null)}
                          className="flex-1 px-3 py-2 rounded-lg font-mono text-[9px] uppercase tracking-widest border border-white/10 text-white/40 hover:text-white/60 transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => addToGreenhouse.mutate({
                            writingId: piece.id,
                            themeFolder: ghFolder || undefined,
                            priority: ghPriority,
                            internalNote: ghNote || undefined,
                          })}
                          disabled={addToGreenhouse.isPending}
                          className="flex-1 px-3 py-2 rounded-lg font-mono text-[9px] uppercase tracking-widest border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-all disabled:opacity-50"
                        >
                          {addToGreenhouse.isPending ? "Adding..." : "Add"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function GreenhouseTab() {
  const queryClient = useQueryClient();
  const { data: entries = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/editor/greenhouse"],
  });

  const [sendRequestFor, setSendRequestFor] = useState<any | null>(null);
  const [reqIssueId, setReqIssueId] = useState("");
  const [reqDate, setReqDate] = useState("");
  const [reqNote, setReqNote] = useState("");
  const [reqRights, setReqRights] = useState("");

  const { data: issuesList = [] } = useQuery<any[]>({
    queryKey: ["/api/editor/issues"],
  });

  const removeFromGreenhouse = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/editor/greenhouse/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/editor/greenhouse"] });
      queryClient.invalidateQueries({ queryKey: ["/api/editor/overview"] });
    },
  });

  const updateEntry = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PATCH", `/api/editor/greenhouse/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/editor/greenhouse"] });
    },
  });

  const createRequest = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/editor/requests", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/editor/requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/editor/greenhouse"] });
      queryClient.invalidateQueries({ queryKey: ["/api/editor/overview"] });
      setSendRequestFor(null);
      setReqIssueId("");
      setReqDate("");
      setReqNote("");
      setReqRights("");
    },
  });

  const grouped = (entries as any[]).reduce((acc: Record<string, any[]>, entry) => {
    const folder = entry.themeFolder || "Unsorted";
    if (!acc[folder]) acc[folder] = [];
    acc[folder].push(entry);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5 animate-pulse space-y-3">
            <div className="h-4 w-32 bg-white/10 rounded" />
            <div className="h-3 w-48 bg-white/[0.06] rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {entries.length === 0 ? (
        <p className="text-center py-12 font-serif text-white/40 text-sm">No pieces in the greenhouse yet. Add pieces from the Garden Stream.</p>
      ) : (
        Object.entries(grouped).map(([folder, items]) => (
          <div key={folder}>
            <h3 className="font-display text-sm text-amber-200/70 italic mb-3 flex items-center gap-2">
              <BookOpen size={14} className="text-amber-400/40" />
              {folder}
              <span className="font-mono text-[8px] text-white/30 uppercase tracking-widest not-italic">({(items as any[]).length})</span>
            </h3>
            <div className="space-y-2">
              {(items as any[]).map((entry) => (
                <div key={entry.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-grow">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="font-display text-sm font-light italic text-amber-200/90">{entry.writingTitle || entry.writing?.title || "Untitled"}</h4>
                        <span className={`px-2 py-0.5 rounded-full font-mono text-[7px] uppercase tracking-widest border ${priorityColors[entry.priority] || priorityColors.medium}`}>
                          {entry.priority}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full font-mono text-[7px] uppercase tracking-widest ${statusColors[entry.stage] || statusColors.draft}`}>
                          {stageLabels[entry.stage] || entry.stage}
                        </span>
                      </div>
                      <p className="text-xs font-serif text-white/40">by {entry.authorName || entry.writing?.authorName || "Unknown"}</p>
                      {entry.internalNote && (
                        <p className="text-xs font-serif text-white/30 mt-1 italic">"{entry.internalNote}"</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <select
                        value={entry.priority}
                        onChange={e => updateEntry.mutate({ id: entry.id, data: { priority: e.target.value } })}
                        className="bg-transparent border border-white/10 rounded px-1 py-0.5 font-mono text-[8px] text-white/40 focus:outline-none"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                      <button
                        onClick={() => setSendRequestFor(entry)}
                        className="p-1.5 rounded-lg border border-amber-500/20 text-amber-300/60 hover:text-amber-300 hover:bg-amber-500/10 transition-all"
                        title="Send Request"
                        data-testid="btn-send-request"
                      >
                        <Send size={12} />
                      </button>
                      <button
                        onClick={() => removeFromGreenhouse.mutate(entry.id)}
                        className="p-1.5 rounded-lg border border-white/10 text-white/30 hover:text-rose-300 hover:border-rose-500/20 transition-all"
                        title="Remove"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {sendRequestFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setSendRequestFor(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0f1520] border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-display text-lg text-amber-200 italic mb-1">Send Publish Request</h3>
            <p className="text-xs font-serif text-white/40 mb-4">for "{sendRequestFor.writingTitle || sendRequestFor.writing?.title}"</p>
            <div className="space-y-3">
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-widest text-white/40 mb-1">Issue</label>
                <select
                  value={reqIssueId}
                  onChange={e => setReqIssueId(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-serif text-amber-100/80 focus:outline-none focus:border-amber-500/30"
                >
                  <option value="">No issue selected</option>
                  {issuesList.map((issue: any) => (
                    <option key={issue.id} value={issue.id}>{issue.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-widest text-white/40 mb-1">Proposed Date</label>
                <input
                  type="date"
                  value={reqDate}
                  onChange={e => setReqDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-serif text-amber-100/80 focus:outline-none focus:border-amber-500/30"
                />
              </div>
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-widest text-white/40 mb-1">Editor Note</label>
                <textarea
                  value={reqNote}
                  onChange={e => setReqNote(e.target.value)}
                  placeholder="Message to the writer..."
                  rows={3}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-serif text-amber-100/80 placeholder:text-white/25 focus:outline-none focus:border-amber-500/30 resize-none"
                />
              </div>
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-widest text-white/40 mb-1">Rights / Terms</label>
                <input
                  value={reqRights}
                  onChange={e => setReqRights(e.target.value)}
                  placeholder="e.g., First publication rights, 6 months..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-serif text-amber-100/80 placeholder:text-white/25 focus:outline-none focus:border-amber-500/30"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setSendRequestFor(null)}
                  className="flex-1 px-3 py-2 rounded-lg font-mono text-[9px] uppercase tracking-widest border border-white/10 text-white/40 hover:text-white/60 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => createRequest.mutate({
                    writingId: sendRequestFor.writingId,
                    issueId: reqIssueId || undefined,
                    proposedDate: reqDate || undefined,
                    editorNote: reqNote || undefined,
                    rightsDuration: reqRights || undefined,
                  })}
                  disabled={createRequest.isPending}
                  className="flex-1 px-3 py-2 rounded-lg font-mono text-[9px] uppercase tracking-widest border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-all disabled:opacity-50"
                >
                  {createRequest.isPending ? "Sending..." : "Send Request"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

function RequestsTab() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");

  const { data: requests = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/editor/requests", statusFilter],
    queryFn: async () => {
      const params = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const res = await fetch(`/api/editor/requests${params}`, { credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  });

  const { data: messages = [] } = useQuery<any[]>({
    queryKey: ["/api/editor/requests", expandedId, "messages"],
    queryFn: async () => {
      if (!expandedId) return [];
      const res = await fetch(`/api/editor/requests/${expandedId}/messages`, { credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    enabled: !!expandedId,
  });

  const sendMessage = useMutation({
    mutationFn: async ({ requestId, content }: { requestId: string; content: string }) => {
      const res = await apiRequest("POST", `/api/editor/requests/${requestId}/messages`, { content });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/editor/requests", expandedId, "messages"] });
      setNewMessage("");
    },
  });

  const statuses = ["all", "draft", "sent", "accepted", "declined", "in_production"];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5 animate-pulse space-y-3">
            <div className="h-4 w-40 bg-white/10 rounded" />
            <div className="h-3 w-64 bg-white/[0.06] rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-2 flex-wrap">
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full font-mono text-[9px] uppercase tracking-widest border transition-all ${
              statusFilter === s ? "border-amber-500/30 bg-amber-500/10 text-amber-300" : "border-white/10 text-white/40 hover:text-white/60"
            }`}
          >
            {s === "all" ? "All" : s.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {requests.length === 0 ? (
        <p className="text-center py-12 font-serif text-white/40 text-sm">No publish requests found.</p>
      ) : (
        <div className="space-y-2">
          {requests.map((req: any) => (
            <div key={req.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                className="w-full text-left p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-grow">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-display text-sm font-light italic text-amber-200/90">{req.writingTitle || req.writing?.title || "Untitled"}</h4>
                      <span className={`px-2 py-0.5 rounded-full font-mono text-[7px] uppercase tracking-widest ${statusColors[req.status] || statusColors.draft}`}>
                        {req.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="text-xs font-serif text-white/40 mt-0.5">
                      by {req.authorName || req.author?.username || "Unknown"} · {timeAgo(req.respondedAt || req.createdAt)}
                    </p>
                  </div>
                  <ChevronRight size={14} className={`text-white/30 transition-transform ${expandedId === req.id ? "rotate-90" : ""}`} />
                </div>
              </button>

              <AnimatePresence>
                {expandedId === req.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-3">
                      {req.editorNote && (
                        <div>
                          <span className="font-mono text-[8px] uppercase tracking-widest text-white/30">Editor Note</span>
                          <p className="text-sm font-serif text-amber-100/60 mt-0.5">{req.editorNote}</p>
                        </div>
                      )}
                      {req.proposedDate && (
                        <p className="text-xs font-serif text-white/30">Proposed: {req.proposedDate}</p>
                      )}
                      {req.rightsDuration && (
                        <p className="text-xs font-serif text-white/30">Rights: {req.rightsDuration}</p>
                      )}

                      <div className="border-t border-white/5 pt-3">
                        <span className="font-mono text-[8px] uppercase tracking-widest text-white/30 flex items-center gap-1 mb-2">
                          <MessageCircle size={10} /> Messages
                        </span>
                        {messages.length === 0 ? (
                          <p className="text-xs font-serif text-white/25 italic">No messages yet.</p>
                        ) : (
                          <div className="space-y-2 max-h-48 overflow-y-auto mb-2">
                            {messages.map((msg: any) => (
                              <div key={msg.id} className="bg-white/[0.03] rounded-lg p-2.5">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-mono text-[8px] text-white/40">{msg.senderName || "Editor"}</span>
                                  <span className="font-mono text-[8px] text-white/25">{timeAgo(msg.createdAt)}</span>
                                </div>
                                <p className="text-xs font-serif text-amber-100/60">{msg.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <input
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            placeholder="Write a message..."
                            className="flex-grow px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-serif text-amber-100/80 placeholder:text-white/25 focus:outline-none focus:border-amber-500/30"
                            onKeyDown={e => {
                              if (e.key === "Enter" && newMessage.trim()) {
                                sendMessage.mutate({ requestId: req.id, content: newMessage.trim() });
                              }
                            }}
                          />
                          <button
                            onClick={() => {
                              if (newMessage.trim()) sendMessage.mutate({ requestId: req.id, content: newMessage.trim() });
                            }}
                            disabled={!newMessage.trim() || sendMessage.isPending}
                            className="px-3 py-1.5 rounded-lg border border-amber-500/20 text-amber-300/60 hover:text-amber-300 hover:bg-amber-500/10 transition-all disabled:opacity-30"
                          >
                            <Send size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function IssuesTab() {
  const queryClient = useQueryClient();
  const [showNewIssue, setShowNewIssue] = useState(false);
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [newTheme, setNewTheme] = useState("");
  const [newDate, setNewDate] = useState("");
  const [showAddPiece, setShowAddPiece] = useState(false);
  const [addPieceWritingId, setAddPieceWritingId] = useState("");

  const { data: issuesList = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/editor/issues"],
  });

  const { data: issuePieces = [] } = useQuery<any[]>({
    queryKey: ["/api/editor/issues", expandedIssue, "pieces"],
    queryFn: async () => {
      if (!expandedIssue) return [];
      const res = await fetch(`/api/editor/issues/${expandedIssue}/pieces`, { credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    enabled: !!expandedIssue,
  });

  const { data: greenhouse = [] } = useQuery<any[]>({
    queryKey: ["/api/editor/greenhouse"],
  });

  const createIssue = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/editor/issues", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/editor/issues"] });
      queryClient.invalidateQueries({ queryKey: ["/api/editor/overview"] });
      setShowNewIssue(false);
      setNewTitle("");
      setNewSubtitle("");
      setNewTheme("");
      setNewDate("");
    },
  });

  const publishIssue = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/editor/issues/${id}/publish`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/editor/issues"] });
      queryClient.invalidateQueries({ queryKey: ["/api/editor/overview"] });
    },
  });

  const addPiece = useMutation({
    mutationFn: async ({ issueId, writingId }: { issueId: string; writingId: string }) => {
      const res = await apiRequest("POST", `/api/editor/issues/${issueId}/pieces`, {
        writingId,
        sortOrder: issuePieces.length,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/editor/issues", expandedIssue, "pieces"] });
      queryClient.invalidateQueries({ queryKey: ["/api/editor/issues"] });
      setShowAddPiece(false);
      setAddPieceWritingId("");
    },
  });

  const updatePiece = useMutation({
    mutationFn: async ({ issueId, pieceId, data }: { issueId: string; pieceId: string; data: any }) => {
      const res = await apiRequest("PATCH", `/api/editor/issues/${issueId}/pieces/${pieceId}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/editor/issues", expandedIssue, "pieces"] });
    },
  });

  const removePiece = useMutation({
    mutationFn: async ({ issueId, pieceId }: { issueId: string; pieceId: string }) => {
      await apiRequest("DELETE", `/api/editor/issues/${issueId}/pieces/${pieceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/editor/issues", expandedIssue, "pieces"] });
      queryClient.invalidateQueries({ queryKey: ["/api/editor/issues"] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5 animate-pulse space-y-3">
            <div className="h-5 w-40 bg-white/10 rounded" />
            <div className="h-3 w-24 bg-white/[0.06] rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm text-amber-200/70 italic">Journal Issues</h3>
        <button
          onClick={() => setShowNewIssue(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[9px] uppercase tracking-widest border border-amber-500/20 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-all"
          data-testid="btn-new-issue"
        >
          <Plus size={12} /> New Issue
        </button>
      </div>

      {issuesList.length === 0 ? (
        <p className="text-center py-12 font-serif text-white/40 text-sm">No issues created yet.</p>
      ) : (
        <div className="space-y-3">
          {issuesList.map((issue: any) => (
            <div key={issue.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedIssue(expandedIssue === issue.id ? null : issue.id)}
                className="w-full text-left p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-display text-base font-light italic text-amber-200/90">{issue.title}</h4>
                      <span className={`px-2 py-0.5 rounded-full font-mono text-[7px] uppercase tracking-widest ${statusColors[issue.status] || statusColors.draft}`}>
                        {issue.status}
                      </span>
                    </div>
                    {issue.subtitle && <p className="text-xs font-serif text-white/40 mt-0.5">{issue.subtitle}</p>}
                    <p className="text-xs font-serif text-white/30 mt-0.5">
                      {issue.pieceCount !== undefined ? `${issue.pieceCount} pieces` : ""} 
                      {issue.publishDate ? ` · ${new Date(issue.publishDate).toLocaleDateString()}` : ""}
                    </p>
                  </div>
                  <ChevronRight size={14} className={`text-white/30 transition-transform flex-shrink-0 ${expandedIssue === issue.id ? "rotate-90" : ""}`} />
                </div>
              </button>

              <AnimatePresence>
                {expandedIssue === issue.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 border-t border-white/5 pt-3">
                      {issue.themeNote && (
                        <p className="text-xs font-serif text-white/30 italic mb-3">Theme: {issue.themeNote}</p>
                      )}

                      <div className="space-y-2 mb-3">
                        {issuePieces.length === 0 ? (
                          <p className="text-xs font-serif text-white/25 italic">No pieces added to this issue yet.</p>
                        ) : (
                          issuePieces.map((piece: any, idx: number) => (
                            <div key={piece.id} className="flex items-center gap-3 bg-white/[0.03] rounded-lg p-3">
                              <GripVertical size={14} className="text-white/15 flex-shrink-0 cursor-grab" />
                              <span className="font-mono text-[9px] text-white/25 w-5">{idx + 1}</span>
                              <div className="min-w-0 flex-grow">
                                <h5 className="font-display text-sm font-light italic text-amber-200/80 truncate">{piece.writingTitle || piece.writing?.title || "Untitled"}</h5>
                                <p className="text-[10px] font-serif text-white/30">{piece.authorName || piece.writing?.authorName || ""}</p>
                              </div>
                              <select
                                value={piece.workflowState}
                                onChange={e => updatePiece.mutate({ issueId: issue.id, pieceId: piece.id, data: { workflowState: e.target.value } })}
                                className="bg-transparent border border-white/10 rounded px-1.5 py-1 font-mono text-[8px] text-white/40 focus:outline-none max-w-[120px]"
                              >
                                {Object.entries(workflowLabels).map(([k, v]) => (
                                  <option key={k} value={k}>{v}</option>
                                ))}
                              </select>
                              <button
                                onClick={() => removePiece.mutate({ issueId: issue.id, pieceId: piece.id })}
                                className="p-1 text-white/20 hover:text-rose-300 transition-colors"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowAddPiece(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[9px] uppercase tracking-widest border border-white/10 text-white/40 hover:text-white/60 hover:border-white/20 transition-all"
                        >
                          <Plus size={12} /> Add Piece
                        </button>
                        {issue.status !== "published" && (
                          <button
                            onClick={() => publishIssue.mutate(issue.id)}
                            disabled={publishIssue.isPending}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[9px] uppercase tracking-widest border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                            data-testid="btn-publish-issue"
                          >
                            <CheckCircle size={12} /> {publishIssue.isPending ? "Publishing..." : "Publish Issue"}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}

      {showNewIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowNewIssue(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0f1520] border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-display text-lg text-amber-200 italic mb-4">New Issue</h3>
            <div className="space-y-3">
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-widest text-white/40 mb-1">Title</label>
                <input
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Issue title..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-serif text-amber-100/80 placeholder:text-white/25 focus:outline-none focus:border-amber-500/30"
                />
              </div>
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-widest text-white/40 mb-1">Subtitle</label>
                <input
                  value={newSubtitle}
                  onChange={e => setNewSubtitle(e.target.value)}
                  placeholder="Optional subtitle..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-serif text-amber-100/80 placeholder:text-white/25 focus:outline-none focus:border-amber-500/30"
                />
              </div>
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-widest text-white/40 mb-1">Theme Note</label>
                <textarea
                  value={newTheme}
                  onChange={e => setNewTheme(e.target.value)}
                  placeholder="Guiding theme for this issue..."
                  rows={2}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-serif text-amber-100/80 placeholder:text-white/25 focus:outline-none focus:border-amber-500/30 resize-none"
                />
              </div>
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-widest text-white/40 mb-1">Publish Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-serif text-amber-100/80 focus:outline-none focus:border-amber-500/30"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowNewIssue(false)}
                  className="flex-1 px-3 py-2 rounded-lg font-mono text-[9px] uppercase tracking-widest border border-white/10 text-white/40 hover:text-white/60 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!newTitle.trim()) return;
                    createIssue.mutate({
                      title: newTitle.trim(),
                      subtitle: newSubtitle || undefined,
                      themeNote: newTheme || undefined,
                      publishDate: newDate || undefined,
                    });
                  }}
                  disabled={!newTitle.trim() || createIssue.isPending}
                  className="flex-1 px-3 py-2 rounded-lg font-mono text-[9px] uppercase tracking-widest border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-all disabled:opacity-50"
                >
                  {createIssue.isPending ? "Creating..." : "Create Issue"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {showAddPiece && expandedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowAddPiece(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0f1520] border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-display text-lg text-amber-200 italic mb-4">Add Piece to Issue</h3>
            <div className="space-y-3">
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-widest text-white/40 mb-1">Select Piece</label>
                <select
                  value={addPieceWritingId}
                  onChange={e => setAddPieceWritingId(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-serif text-amber-100/80 focus:outline-none focus:border-amber-500/30"
                >
                  <option value="">Choose a piece...</option>
                  {(greenhouse as any[]).map((entry) => (
                    <option key={entry.id} value={entry.writingId}>
                      {entry.writingTitle || entry.writing?.title || "Untitled"}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowAddPiece(false)}
                  className="flex-1 px-3 py-2 rounded-lg font-mono text-[9px] uppercase tracking-widest border border-white/10 text-white/40 hover:text-white/60 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!addPieceWritingId) return;
                    addPiece.mutate({ issueId: expandedIssue, writingId: addPieceWritingId });
                  }}
                  disabled={!addPieceWritingId || addPiece.isPending}
                  className="flex-1 px-3 py-2 rounded-lg font-mono text-[9px] uppercase tracking-widest border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-all disabled:opacity-50"
                >
                  {addPiece.isPending ? "Adding..." : "Add Piece"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

export default function EditorStudio() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const { data: user, isLoading: userLoading } = useQuery<any>({
    queryKey: ["/api/auth/user"],
  });

  const { data: editorCheck, isLoading: editorLoading } = useQuery<{ isEditor: boolean }>({
    queryKey: ["/api/editor/check"],
    enabled: !!user,
  });

  if (userLoading || editorLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-4 text-center">
          <div className="h-6 w-40 bg-white/10 rounded mx-auto" />
          <div className="h-4 w-24 bg-white/[0.06] rounded mx-auto" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <p className="font-serif text-sm text-white/50">Please log in to access the Editor Studio.</p>
          <button
            onClick={() => navigate("/garden")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-[9px] uppercase tracking-widest border border-white/10 text-white/40 hover:text-white/60 transition-all"
          >
            <ArrowLeft size={14} /> Back to Garden
          </button>
        </div>
      </div>
    );
  }

  if (!editorCheck?.isEditor) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-12 h-12 mx-auto rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
            <XCircle size={20} className="text-white/30" />
          </div>
          <p className="font-serif text-sm text-amber-100/60 leading-relaxed">
            The Editor Studio is available to editors. Contact an administrator for access.
          </p>
          <button
            onClick={() => navigate("/garden")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-[9px] uppercase tracking-widest border border-white/10 text-white/40 hover:text-white/60 transition-all"
          >
            <ArrowLeft size={14} /> Back to Garden
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate("/garden")}
          className="p-2 rounded-lg border border-white/10 text-white/40 hover:text-white/60 hover:border-white/20 transition-all"
        >
          <ArrowLeft size={16} />
        </button>
        <h1 className="font-display text-2xl font-light italic text-amber-200">Editor Studio</h1>
      </div>

      <div className="flex gap-1 mb-8 overflow-x-auto scrollbar-hide border-b border-white/5 pb-px">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            data-testid={`tab-${tab.id}`}
            className={`flex items-center gap-1.5 px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest whitespace-nowrap transition-all border-b-2 -mb-px ${
              activeTab === tab.id
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-white/40 hover:text-white/60"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "garden-stream" && <GardenStreamTab />}
          {activeTab === "greenhouse" && <GreenhouseTab />}
          {activeTab === "requests" && <RequestsTab />}
          {activeTab === "issues" && <IssuesTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}