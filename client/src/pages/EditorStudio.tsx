import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Search, Plus, Send, BookOpen,
  Inbox, FileText, Layers, Eye, Leaf, MessageCircle,
  ChevronDown, ChevronRight, Trash2, Edit3, Clock,
  CheckCircle, XCircle, GripVertical, X, Sparkles, Flag, Crown, Users
} from "lucide-react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import AuthorEditorConversation from "@/components/AuthorEditorConversation";

type Tab = "overview" | "garden-stream" | "greenhouse" | "requests" | "issues" | "flagged" | "editorial-inbox" | "threads" | "garden-walk" | "walkthrough" | "tasks";

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
  dormant: "bg-violet-500/15 text-violet-300 border-violet-500/20",
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
  { id: "flagged", label: "Flagged", icon: <Flag size={15} /> },
  { id: "editorial-inbox", label: "Inbox", icon: <Inbox size={15} /> },
  { id: "threads", label: "Threads", icon: <MessageCircle size={15} /> },
  { id: "garden-walk", label: "Garden Walk", icon: <Leaf size={15} /> },
  { id: "walkthrough", label: "Guide", icon: <BookOpen size={15} /> },
  { id: "tasks", label: "Tasks", icon: <CheckCircle size={15} /> },
];

function CuratedOpportunitiesSection() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ title: "", outlet: "", link: "", deadline: "", payRate: "", genres: "", notes: "" });

  const { data: curatedOpps = [] } = useQuery<any[]>({
    queryKey: ["/api/curated-opportunities"],
  });

  const createOpp = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/editor/opportunities", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/curated-opportunities"] });
      setShowAddModal(false);
      setForm({ title: "", outlet: "", link: "", deadline: "", payRate: "", genres: "", notes: "" });
    },
  });

  const deleteOpp = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/editor/opportunities/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/curated-opportunities"] });
    },
  });

  const handleSubmit = () => {
    const genres = form.genres ? form.genres.split(",").map(g => g.trim()).filter(Boolean) : undefined;
    createOpp.mutate({
      title: form.title,
      outlet: form.outlet || undefined,
      link: form.link || undefined,
      deadline: form.deadline || undefined,
      payRate: form.payRate || undefined,
      genres,
      notes: form.notes || undefined,
    });
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.25em] text-amber-400/60 flex items-center gap-2">
          <Sparkles size={14} className="text-amber-400/50" />
          Curated Opportunities
        </h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[9px] uppercase tracking-widest border border-amber-500/20 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-all"
          data-testid="btn-add-curated-opportunity"
        >
          <Plus size={12} /> Add
        </button>
      </div>

      {curatedOpps.length === 0 ? (
        <p className="font-serif text-sm text-white/30 italic py-4">No curated opportunities yet.</p>
      ) : (
        <div className="space-y-2">
          {curatedOpps.map((opp: any) => (
            <div key={opp.id} data-testid={`curated-opp-${opp.id}`} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h4 className="font-display text-sm font-light italic text-amber-200/90">{opp.title}</h4>
                  {opp.outlet && (
                    <span className="px-2 py-0.5 rounded-full font-mono text-[8px] uppercase tracking-widest border border-white/10 text-white/40">{opp.outlet}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs font-serif text-white/40">
                  {opp.deadline && <span className="flex items-center gap-1"><Clock size={10} /> {opp.deadline}</span>}
                  {opp.payRate && <span>{opp.payRate}</span>}
                  {opp.link && <a href={opp.link} target="_blank" rel="noopener noreferrer" className="text-amber-300/50 hover:text-amber-300 underline underline-offset-2">link</a>}
                </div>
                {opp.notes && <p className="text-xs font-serif text-white/30 mt-1">{opp.notes}</p>}
              </div>
              <button
                onClick={() => deleteOpp.mutate(opp.id)}
                className="p-1.5 rounded-lg border border-white/10 text-white/30 hover:text-rose-300 hover:border-rose-500/20 transition-all flex-shrink-0"
                data-testid={`btn-delete-opp-${opp.id}`}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0f1520] border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-display text-lg text-amber-200 italic mb-4">Add Curated Opportunity</h3>
              <div className="space-y-3">
                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-widest text-white/40 mb-1">Title *</label>
                  <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g., Poetry submission call" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-serif text-amber-100/80 placeholder:text-white/25 focus:outline-none focus:border-amber-500/30" data-testid="input-opp-title" />
                </div>
                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-widest text-white/40 mb-1">Outlet / Source</label>
                  <input value={form.outlet} onChange={e => setForm({ ...form, outlet: e.target.value })} placeholder="e.g., The Paris Review" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-serif text-amber-100/80 placeholder:text-white/25 focus:outline-none focus:border-amber-500/30" data-testid="input-opp-outlet" />
                </div>
                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-widest text-white/40 mb-1">Link</label>
                  <input value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} placeholder="https://..." className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-serif text-amber-100/80 placeholder:text-white/25 focus:outline-none focus:border-amber-500/30" data-testid="input-opp-link" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[9px] uppercase tracking-widest text-white/40 mb-1">Deadline</label>
                    <input value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} placeholder="e.g., March 15, 2026" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-serif text-amber-100/80 placeholder:text-white/25 focus:outline-none focus:border-amber-500/30" data-testid="input-opp-deadline" />
                  </div>
                  <div>
                    <label className="block font-mono text-[9px] uppercase tracking-widest text-white/40 mb-1">Pay Rate</label>
                    <input value={form.payRate} onChange={e => setForm({ ...form, payRate: e.target.value })} placeholder="e.g., $100/poem" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-serif text-amber-100/80 placeholder:text-white/25 focus:outline-none focus:border-amber-500/30" data-testid="input-opp-payrate" />
                  </div>
                </div>
                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-widest text-white/40 mb-1">Genres (comma-separated)</label>
                  <input value={form.genres} onChange={e => setForm({ ...form, genres: e.target.value })} placeholder="e.g., poetry, fiction, essay" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-serif text-amber-100/80 placeholder:text-white/25 focus:outline-none focus:border-amber-500/30" data-testid="input-opp-genres" />
                </div>
                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-widest text-white/40 mb-1">Notes</label>
                  <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any additional details..." rows={2} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-serif text-amber-100/80 placeholder:text-white/25 focus:outline-none focus:border-amber-500/30 resize-none" data-testid="input-opp-notes" />
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setShowAddModal(false)} className="flex-1 px-3 py-2 rounded-lg font-mono text-[9px] uppercase tracking-widest border border-white/10 text-white/40 hover:text-white/60 transition-all">Cancel</button>
                  <button onClick={handleSubmit} disabled={!form.title.trim() || createOpp.isPending} className="flex-1 px-3 py-2 rounded-lg font-mono text-[9px] uppercase tracking-widest border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-all disabled:opacity-50" data-testid="btn-submit-opp">{createOpp.isPending ? "Adding..." : "Add Opportunity"}</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FlaggedTab() {
  const queryClient = useQueryClient();
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");
  const [respondMode, setRespondMode] = useState<"respond" | "close">("respond");
  const [showFlagWriter, setShowFlagWriter] = useState<string | null>(null);

  const { data: flaggedQueue = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/editor/flagged-queue"],
    queryFn: async () => {
      const res = await fetch("/api/editor/flagged-queue", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const markSeen = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("POST", `/api/editor/flags/${id}/seen`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/editor/flagged-queue"] });
    },
  });

  const respond = useMutation({
    mutationFn: async ({ id, response }: { id: string; response: string }) => {
      await apiRequest("POST", `/api/editor/flags/${id}/respond`, { response });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/editor/flagged-queue"] });
      setRespondingId(null);
      setResponseText("");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5 animate-pulse space-y-3">
            <div className="h-4 w-48 bg-white/10 rounded" />
            <div className="h-3 w-full bg-white/[0.06] rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {flaggedQueue.length === 0 ? (
        <div className="text-center py-16">
          <Flag size={24} className="mx-auto mb-3 text-violet-400/30" />
          <p className="font-serif text-sm text-white/40">No flagged pieces waiting. Writers haven't raised any flags yet.</p>
        </div>
      ) : (
        [...flaggedQueue].sort((a: any, b: any) => {
          if (a.isPaidFlag && !b.isPaidFlag) return -1;
          if (!a.isPaidFlag && b.isPaidFlag) return 1;
          return 0;
        }).map((item: any) => (
          <div
            key={item.id}
            data-testid={`flagged-card-${item.id}`}
            className="bg-white/5 border border-violet-500/15 rounded-xl p-5 transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-grow">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <button onClick={() => setShowFlagWriter(item.authorId)} className="font-serif text-xs text-amber-300/50 hover:text-amber-300/80 underline decoration-dotted underline-offset-2 transition-colors">{item.authorName || "Unknown"}</button>
                  <span className="px-2 py-0.5 rounded-full font-mono text-[8px] uppercase tracking-widest border border-violet-500/20 text-violet-300">
                    {item.genre || "untagged"}
                  </span>
                  {item.isPaidFlag && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                      <Crown size={9} className="text-amber-300/60" />
                      <span className="font-mono text-[7px] uppercase tracking-widest text-amber-300/60">Guaranteed read</span>
                    </div>
                  )}
                </div>
                <h3 className="font-display text-base font-light italic text-amber-200/90 mb-1">{item.writingTitle || "Untitled"}</h3>
                <p className="font-mono text-[9px] text-violet-300/50">
                  <Flag size={10} className="inline mr-1" />
                  Flagged {timeAgo(item.createdAt)}
                </p>
                {item.isPaidFlag && !item.editorResponse && (
                  <p className="font-mono text-[7px] text-amber-300/40 mt-1">This writer's cultivator membership includes a guaranteed response</p>
                )}
                {item.editorResponse && (
                  <p className="font-serif text-xs text-white/40 italic mt-2 pl-3 border-l-2 border-violet-500/20">
                    {item.editorResponse}
                  </p>
                )}
                <NotesPanel writingId={item.writingId} />
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!item.seenAt && (
                  <button
                    onClick={() => markSeen.mutate(item.id)}
                    disabled={markSeen.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[9px] uppercase tracking-widest border border-violet-500/20 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 transition-all disabled:opacity-50"
                    data-testid={`button-mark-seen-${item.id}`}
                  >
                    <Eye size={12} /> Seen
                  </button>
                )}
                {!item.editorResponse && (
                  <button
                    onClick={() => setRespondingId(respondingId === item.id ? null : item.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[9px] uppercase tracking-widest border border-white/10 text-white/40 hover:text-white/60 hover:border-white/20 transition-all"
                    data-testid={`button-respond-${item.id}`}
                  >
                    <MessageCircle size={12} /> Respond
                  </button>
                )}
              </div>
            </div>
            <AnimatePresence>
              {respondingId === item.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
                    <div className="flex gap-1">
                      <button onClick={() => setRespondMode("respond")}
                        className={`px-2.5 py-1 rounded font-mono text-[8px] uppercase tracking-widest transition-all ${respondMode === "respond" ? "bg-violet-500/15 text-violet-300 border border-violet-500/20" : "text-white/30 border border-transparent hover:text-white/50"}`}>
                        Respond
                      </button>
                      <button onClick={() => setRespondMode("close")}
                        className={`px-2.5 py-1 rounded font-mono text-[8px] uppercase tracking-widest transition-all ${respondMode === "close" ? "bg-rose-500/15 text-rose-300 border border-rose-500/20" : "text-white/30 border border-transparent hover:text-white/50"}`}>
                        Close Flag
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={responseText}
                        onChange={e => setResponseText(e.target.value)}
                        placeholder={respondMode === "close" ? "Read it. Not for this season, but keep writing..." : "This stayed with me... / Keep tending this one..."}
                        className="flex-grow px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-serif text-amber-100/80 placeholder:text-white/25 focus:outline-none focus:border-violet-500/30 transition-colors"
                        data-testid={`input-respond-${item.id}`}
                      />
                      <button
                        onClick={() => {
                          if (!responseText.trim()) return;
                          respond.mutate({ id: item.id, response: (respondMode === "close" ? "[Closed] " : "") + responseText.trim() });
                        }}
                        disabled={!responseText.trim() || respond.isPending}
                        className={`px-3 py-2 rounded-lg font-mono text-[9px] uppercase tracking-widest border transition-all disabled:opacity-50 ${respondMode === "close" ? "border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20" : "border-violet-500/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20"}`}
                      >
                        <Send size={12} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))
      )}
      {showFlagWriter && <WriterProfileModal authorId={showFlagWriter} onClose={() => setShowFlagWriter(null)} />}
    </motion.div>
  );
}

function OverviewTab({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const queryClient = useQueryClient();
  const [showWalkForm, setShowWalkForm] = useState(false);
  const [showWalkQueue, setShowWalkQueue] = useState(false);
  const [walkTitle, setWalkTitle] = useState("");
  const [walkDesc, setWalkDesc] = useState("");
  const [walkStart, setWalkStart] = useState("");
  const [walkEnd, setWalkEnd] = useState("");
  const [walkFlagLimit, setWalkFlagLimit] = useState(3);

  const { data: overview, isLoading } = useQuery<any>({
    queryKey: ["/api/editor/overview"],
  });

  const { data: activeWalk } = useQuery({
    queryKey: ["/api/editors-walk/active"],
    queryFn: async () => {
      const res = await fetch("/api/editors-walk/active", { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
  });

  const { data: walkQueue } = useQuery<{ walk: any; stream: any[]; flags: any[] }>({
    queryKey: ["/api/editors-walk", activeWalk?.id, "queue"],
    queryFn: async () => {
      if (!activeWalk?.id) return { walk: null, stream: [], flags: [] };
      const res = await fetch(`/api/editors-walk/${activeWalk.id}/queue`, { credentials: "include" });
      if (!res.ok) return { walk: null, stream: [], flags: [] };
      return res.json();
    },
    enabled: !!activeWalk?.id && showWalkQueue,
  });

  const cards = [
    { key: "new", testId: "card-overview-new", tabTarget: "garden-stream" as Tab, label: "New to Garden", value: overview?.newPieces ?? 0, icon: <Leaf size={20} className="text-emerald-400/70" /> },
    { key: "editorial", testId: "card-overview-editorial", tabTarget: "garden-stream" as Tab, label: "Available for Editorial", value: overview?.editorialAvailable ?? 0, icon: <Eye size={20} className="text-amber-400/70" /> },
    { key: "pending", testId: "card-overview-pending", tabTarget: "requests" as Tab, label: "Pending Requests", value: overview?.pendingRequests ?? 0, icon: <Clock size={20} className="text-blue-400/70" /> },
    { key: "issues", testId: "card-overview-issues", tabTarget: "issues" as Tab, label: "Draft Issues", value: overview?.draftIssues ?? 0, icon: <FileText size={20} className="text-violet-400/70" /> },
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
    >
                {/* Today in the Garden */}
          <div className="mb-6">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.3em] text-amber-400/70 mb-1">Today in the Garden</h2>
            <p className="font-serif text-sm text-white/30 italic">A glance at what needs your attention</p>
          </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.key}
            data-testid={card.testId}
            onClick={() => onNavigate(card.tabTarget)} className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur cursor-pointer hover:bg-white/[0.08] hover:border-amber-500/20 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-serif text-sm text-amber-100/60">{card.label}</span>
              {card.icon}
            </div>
            <p className="font-display text-3xl font-light text-amber-200 italic">{card.value}</p>
          </div>
        ))}
      </div>

                {/* Recent Activity */}
          <div className="mt-8 pt-6 border-t border-white/[0.06]">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.25em] text-amber-400/60 flex items-center gap-2 mb-4">
              <Clock size={14} className="text-amber-400/50" />
              Recent Activity
            </h3>
            <div className="space-y-2">
              {overview?.newPieces > 0 && (
                <p className="text-xs font-serif text-white/40">
                  <span className="text-emerald-300/60">{overview.newPieces} new piece{overview.newPieces !== 1 ? 's' : ''}</span>{' '}
                  arrived in the garden this week
                </p>
              )}
              {overview?.editorialAvailable > 0 && (
                <p className="text-xs font-serif text-white/40">
                  <span className="text-amber-300/60">{overview.editorialAvailable} piece{overview.editorialAvailable !== 1 ? 's' : ''}</span>{' '}
                  ready for editorial attention
                </p>
              )}
              {overview?.pendingRequests > 0 && (
                <p className="text-xs font-serif text-white/40">
                  <span className="text-blue-300/60">{overview.pendingRequests} request{overview.pendingRequests !== 1 ? 's' : ''}</span>{' '}
                  awaiting writer response
                </p>
              )}
              {overview?.draftIssues > 0 && (
                <p className="text-xs font-serif text-white/40">
                  <span className="text-violet-300/60">{overview.draftIssues} issue{overview.draftIssues !== 1 ? 's' : ''}</span>{' '}
                  in draft
                </p>
              )}
              {(!overview?.newPieces && !overview?.editorialAvailable && !overview?.pendingRequests && !overview?.draftIssues) && (
                <p className="font-serif text-sm text-white/30 italic">The garden is quiet. No recent changes.</p>
              )}
            </div>
          </div>
      <CuratedOpportunitiesSection />
      <div className="mt-8 pt-6 border-t border-white/[0.06]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.3em] text-violet-300/60">Editors Walk</h3>
          <button
            onClick={() => setShowWalkForm(!showWalkForm)}
            className="font-mono text-[9px] uppercase tracking-widest text-violet-300/50 hover:text-violet-300/80 transition-colors"
            data-testid="button-new-walk"
          >
            + Schedule Walk
          </button>
        </div>
        {activeWalk && (
          <div className="rounded-xl border border-violet-500/15 bg-violet-950/[0.06] p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-violet-400/60 animate-pulse" />
                <span className="font-mono text-[9px] uppercase tracking-widest text-violet-300/60">Active Walk</span>
              </div>
              <button
                onClick={() => setShowWalkQueue(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[9px] uppercase tracking-widest border border-violet-500/20 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 transition-all"
                data-testid="button-start-reading"
              >
                <BookOpen size={12} /> Reading Queue
              </button>
            </div>
            <p className="font-serif text-sm text-white/70">{activeWalk.title}</p>
            {activeWalk.description && <p className="font-serif text-xs text-white/35 mt-1">{activeWalk.description}</p>}
            <div className="flex items-center gap-4 mt-2">
              <p className="font-mono text-[8px] text-white/35">
                {new Date(activeWalk.startsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {new Date(activeWalk.endsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              <p className="font-mono text-[8px] text-violet-300/40">
                Flag limit: {activeWalk.flagLimit} per writer
              </p>
            </div>
          </div>
        )}
        {showWalkForm && (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
            <input type="text" placeholder="Walk title (e.g. 'Spring Open Garden')" value={walkTitle} onChange={e => setWalkTitle(e.target.value)}
              className="w-full bg-transparent border border-white/[0.08] rounded-lg px-3 py-2 font-serif text-sm text-white/70 placeholder:text-white/25 focus:border-violet-500/30 focus:outline-none" />
            <textarea placeholder="Brief description (optional)" value={walkDesc} onChange={e => setWalkDesc(e.target.value)}
              className="w-full bg-transparent border border-white/[0.08] rounded-lg px-3 py-2 font-serif text-sm text-white/70 placeholder:text-white/25 focus:border-violet-500/30 focus:outline-none resize-none h-16" />
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="font-mono text-[8px] text-white/35 uppercase tracking-widest">Starts</label>
                <input type="date" value={walkStart} onChange={e => setWalkStart(e.target.value)}
                  className="w-full bg-transparent border border-white/[0.08] rounded-lg px-3 py-2 font-mono text-xs text-white/60 focus:border-violet-500/30 focus:outline-none" />
              </div>
              <div className="flex-1">
                <label className="font-mono text-[8px] text-white/35 uppercase tracking-widest">Ends</label>
                <input type="date" value={walkEnd} onChange={e => setWalkEnd(e.target.value)}
                  className="w-full bg-transparent border border-white/[0.08] rounded-lg px-3 py-2 font-mono text-xs text-white/60 focus:border-violet-500/30 focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="font-mono text-[8px] text-white/35 uppercase tracking-widest">Flag Limit Per Writer</label>
              <select value={walkFlagLimit} onChange={e => setWalkFlagLimit(parseInt(e.target.value))}
                className="w-full bg-transparent border border-white/[0.08] rounded-lg px-3 py-2 font-mono text-xs text-white/60 focus:border-violet-500/30 focus:outline-none">
                <option value="1">1 flag</option>
                <option value="2">2 flags</option>
                <option value="3">3 flags (default)</option>
                <option value="5">5 flags</option>
              </select>
            </div>
            <button
              onClick={async () => {
                if (!walkTitle || !walkStart || !walkEnd) return;
                await fetch("/api/editors-walk", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  credentials: "include",
                  body: JSON.stringify({ title: walkTitle, description: walkDesc, startsAt: new Date(walkStart).toISOString(), endsAt: new Date(walkEnd).toISOString(), flagLimit: walkFlagLimit }),
                });
                setShowWalkForm(false);
                setWalkTitle(""); setWalkDesc(""); setWalkStart(""); setWalkEnd(""); setWalkFlagLimit(3);
                queryClient.invalidateQueries({ queryKey: ["/api/editors-walk/active"] });
              }}
              className="w-full py-2 rounded-lg font-mono text-[9px] uppercase tracking-widest bg-violet-500/10 border border-violet-500/20 text-violet-300/70 hover:bg-violet-500/15 transition-all"
              data-testid="button-create-walk"
            >
              Schedule Walk
            </button>
          </div>
        )}
      </div>
      {showWalkQueue && activeWalk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowWalkQueue(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0f1520] border border-violet-500/15 rounded-2xl p-6 w-full max-w-3xl mx-4 max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display text-lg text-violet-200 italic">{activeWalk.title}</h3>
                <p className="font-mono text-[9px] text-violet-300/40 uppercase tracking-widest mt-1">Reading Queue</p>
              </div>
              <button onClick={() => setShowWalkQueue(false)} className="p-2 text-white/30 hover:text-white/60">
                <X size={16} />
              </button>
            </div>

            {walkQueue?.flags && walkQueue.flags.length > 0 && (
              <div className="mb-6">
                <h4 className="font-mono text-[9px] uppercase tracking-widest text-amber-300/50 mb-3 flex items-center gap-2">
                  <Flag size={12} /> Flagged Pieces ({walkQueue.flags.length})
                </h4>
                <div className="space-y-2">
                  {walkQueue.flags.map((item: any) => (
                    <div key={item.id} className="bg-white/[0.03] border border-violet-500/10 rounded-lg p-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="font-display text-sm font-light italic text-amber-200/80">{item.writingTitle || "Untitled"}</span>
                          {item.isPaidFlag && (
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                              <Crown size={8} className="text-amber-300/60" />
                              <span className="font-mono text-[6px] uppercase tracking-widest text-amber-300/60">Priority</span>
                            </span>
                          )}
                        </div>
                        <p className="font-serif text-[11px] text-white/35">{item.authorName || "Unknown"} · {item.genre}</p>
                      </div>
                      {item.seenAt ? (
                        <span className="font-mono text-[7px] text-emerald-300/40">Read</span>
                      ) : (
                        <span className="font-mono text-[7px] text-amber-300/40">Unread</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-mono text-[9px] uppercase tracking-widest text-emerald-300/50 mb-3 flex items-center gap-2">
                <Leaf size={12} /> Ready Pieces ({walkQueue?.stream?.length || 0})
              </h4>
              {walkQueue?.stream && walkQueue.stream.length > 0 ? (
                <div className="space-y-2">
                  {walkQueue.stream.map((piece: any) => (
                    <div key={piece.id} className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="font-display text-sm font-light italic text-amber-200/80">{piece.title || "Untitled"}</span>
                        <span className="px-1.5 py-0.5 rounded-full font-mono text-[7px] uppercase tracking-widest border border-white/10 text-white/30">{piece.genre}</span>
                      </div>
                      <p className="font-serif text-[11px] text-white/35">{piece.authorName || "Unknown"}</p>
                      {piece.content && <p className="text-[11px] font-serif text-white/25 line-clamp-1 mt-1">{stripHtmlForExcerpt(piece.content)}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-6 font-serif text-xs text-white/25">No ready pieces in the garden right now.</p>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06] text-center">
              <p className="font-mono text-[8px] text-white/20">
                {(walkQueue?.stream?.length || 0) + (walkQueue?.flags?.length || 0)} pieces to read · Walk ends {new Date(activeWalk.endsAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

function NotesPanel({ writingId }: { writingId: string }) {
  const queryClient = useQueryClient();
  const [noteText, setNoteText] = useState("");
  
  const { data: notes = [] } = useQuery<any[]>({
    queryKey: ["/api/editor/notes", writingId],
    queryFn: async () => {
      const res = await fetch(`/api/editor/notes/${writingId}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const createNote = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/editor/notes", { writingId, content });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/editor/notes", writingId] });
      setNoteText("");
    },
  });

  const deleteNote = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/editor/notes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/editor/notes", writingId] });
    },
  });

  return (
    <div className="mt-3 pt-3 border-t border-white/5 space-y-2" data-testid={`notes-panel-${writingId}`}>
      <span className="font-mono text-[8px] uppercase tracking-widest text-white/30">Editorial Notes</span>
      {notes.map((note: any) => (
        <div key={note.id} className="flex items-start gap-2 bg-white/[0.03] rounded-lg p-2.5 group">
          <div className="flex-grow">
            <p className="text-xs font-serif text-amber-100/60">{note.content}</p>
            <p className="font-mono text-[7px] text-white/20 mt-1">{note.editorName || "You"} · {timeAgo(note.createdAt)}</p>
          </div>
          <button onClick={() => deleteNote.mutate(note.id)} className="p-1 text-white/10 hover:text-rose-300 opacity-0 group-hover:opacity-100 transition-all">
            <X size={10} />
          </button>
        </div>
      ))}
      <div className="flex gap-2">
        <input
          type="text"
          value={noteText}
          onChange={e => setNoteText(e.target.value)}
          placeholder="Leave a note... (Strong opening, watch this writer...)"
          className="flex-grow px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-serif text-amber-100/80 placeholder:text-white/20 focus:outline-none focus:border-amber-500/30"
          onKeyDown={e => { if (e.key === "Enter" && noteText.trim()) createNote.mutate(noteText.trim()); }}
          data-testid={`input-note-${writingId}`}
        />
        <button
          onClick={() => { if (noteText.trim()) createNote.mutate(noteText.trim()); }}
          disabled={!noteText.trim()}
          className="px-2.5 py-1.5 rounded-lg border border-amber-500/20 text-amber-300/60 hover:text-amber-300 hover:bg-amber-500/10 transition-all disabled:opacity-30"
          data-testid={`btn-add-note-${writingId}`}
        >
          <Plus size={12} />
        </button>
      </div>
    </div>
  );
}

function WriterProfileModal({ authorId, onClose }: { authorId: string; onClose: () => void }) {
  const { data: profile } = useQuery<{ writer: any; writings: any[] }>({
    queryKey: ["/api/editor/writer-profile", authorId],
    queryFn: async () => {
      const res = await fetch(`/api/editor/writer-profile/${authorId}`, { credentials: "include" });
      if (!res.ok) return { writer: null, writings: [] };
      return res.json();
    },
    enabled: !!authorId,
  });

  const stageOrder: Record<string, number> = { bloom: 0, ready_to_show: 1, growing: 2, seed: 3, raw_seed: 4, dormant: 5 };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0f1520] border border-white/10 rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-lg text-amber-200 italic">
              {profile?.writer ? `${profile.writer.firstName || ""} ${profile.writer.lastName || ""}`.trim() || "Writer" : "Loading..."}
            </h3>
            {profile?.writer?.bio && <p className="text-xs font-serif text-white/40 mt-1">{profile.writer.bio}</p>}
          </div>
          <button onClick={onClose} className="p-2 text-white/30 hover:text-white/60">
            <X size={16} />
          </button>
        </div>
        <div className="space-y-2">
          {profile?.writings
            ?.sort((a: any, b: any) => (stageOrder[a.readiness] ?? 99) - (stageOrder[b.readiness] ?? 99))
            .map((w: any) => (
            <div key={w.id} className="bg-white/[0.03] rounded-lg p-3" data-testid={`writer-piece-${w.id}`}>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h4 className="font-display text-sm font-light italic text-amber-200/80">{w.title || "Untitled"}</h4>
                <span className={`px-2 py-0.5 rounded-full font-mono text-[7px] uppercase tracking-widest border ${
                  w.readiness === "ready_to_show" ? "border-pink-500/20 text-pink-300" :
                  w.readiness === "growing" ? "border-emerald-500/20 text-emerald-300" :
                  w.readiness === "dormant" ? "border-violet-500/20 text-violet-300" :
                  "border-white/10 text-white/40"
                }`}>
                  {(w.readiness || "raw_seed").replace(/_/g, " ")}
                </span>
                <span className="font-mono text-[7px] text-white/25">{w.genre}</span>
              </div>
              {w.content && <p className="text-xs font-serif text-white/35 line-clamp-2">{stripHtmlForExcerpt(w.content)}</p>}
              <p className="font-mono text-[7px] text-white/15 mt-1">{timeAgo(w.updatedAt)}</p>
            </div>
          ))}
          {(!profile?.writings || profile.writings.length === 0) && (
            <p className="text-center py-8 font-serif text-sm text-white/25">No writings found.</p>
          )}
        </div>
      </motion.div>
    </div>
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
  const [showNotes, setShowNotes] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [showWriterProfile, setShowWriterProfile] = useState<string | null>(null);
    const [convEntry, setConvEntry] = useState<any | null>(null);

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

  const sendWhisper = useMutation({
    mutationFn: async (writingId: string) => {
      await apiRequest("POST", `/api/editor/flags/${writingId}/seen`);
    },
  });

    const publishToGallery = useMutation({
      mutationFn: async (writingId: string) => {
        const res = await apiRequest("POST", `/api/editorial/publish/${writingId}`);
        return res.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
        queryClient.invalidateQueries({ queryKey: ["/api/editor/overview"] });
        queryClient.invalidateQueries({ queryKey: ["/api/editorial/pieces"] });
      },
    });

  const genres = ["any", "poetry", "fiction", "essay", "hybrid"];
  const readinesses = ["all", "raw_seed", "growing", "ready_to_show", "dormant"];

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
      ) : stream.filter((p: any) => readiness !== "all" || p.readiness !== "dormant").length === 0 ? (
        <p className="text-center py-12 font-serif text-white/40 text-sm">No pieces found matching your filters.</p>
      ) : (
        <div className="space-y-3">
          {stream.filter((p: any) => readiness !== "all" || p.readiness !== "dormant").map((piece: any) => (
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
                      by <span role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); setShowWriterProfile(piece.authorId || (piece as any).author_id); }} className="text-amber-300/50 hover:text-amber-300/80 underline decoration-dotted underline-offset-2 transition-colors cursor-pointer" data-testid={`link-author-${piece.id}`}>{piece.authorName || piece.author?.username || "Unknown"}</span> · {timeAgo(piece.createdAt)}
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
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={(e) => { e.stopPropagation(); setShowAddModal(piece.id); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[9px] uppercase tracking-widest border border-amber-500/20 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-all"
                          data-testid="btn-add-greenhouse"
                        >
                          <Plus size={12} /> Greenhouse
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setShowNotes(showNotes === piece.id ? null : piece.id); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[9px] uppercase tracking-widest border border-white/10 text-white/40 hover:text-white/60 transition-all"
                          data-testid={`btn-notes-${piece.id}`}
                        >
                          <Edit3 size={12} /> Notes
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setShowWriterProfile(piece.authorId || (piece as any).author_id); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[9px] uppercase tracking-widest border border-white/10 text-white/40 hover:text-white/60 transition-all"
                          data-testid={`btn-writer-${piece.id}`}
                        >
                          <Eye size={12} /> Writer
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); sendWhisper.mutate(piece.id); }}
                          disabled={sendWhisper.isPending}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[9px] uppercase tracking-widest border border-violet-500/15 text-violet-300/50 hover:text-violet-300/80 transition-all"
                          data-testid={`btn-whisper-${piece.id}`}
                        >
                          <Sparkles size={12} /> Whisper
                        </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); publishToGallery.mutate(piece.id); }}
                      disabled={publishToGallery.isPending || piece.isPublished}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[9px] uppercase tracking-widest border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 hover:text-emerald-200 transition-all disabled:opacity-50"
                      data-testid={`btn-publish-gallery-${piece.id}`}
                    >
                      <BookOpen size={12} /> {publishToGallery.isPending ? "Publishing..." : piece.isPublished ? "Published" : "Publish to Gallery"}
                    </button>
                      </div>
                      {showNotes === piece.id && (
                        <NotesPanel writingId={piece.id} />
                      )}
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
      {showWriterProfile && (
        <WriterProfileModal authorId={showWriterProfile} onClose={() => setShowWriterProfile(null)} />
      )}
            {convEntry && (
              <AuthorEditorConversation
                          writingId={convEntry.writingId}
                          writingTitle={convEntry.writingTitle}
                          peerId={convEntry.authorId}
                          peerName={convEntry.authorName}
                          isOpen={!!convEntry}
                          onClose={() => setConvEntry(null)}
                        />
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
  const [viewMode, setViewMode] = useState<"mine" | "all">("mine");
  const [showHandoff, setShowHandoff] = useState<string | null>(null);
  const [handoffEditorId, setHandoffEditorId] = useState("");
  const [handoffNote, setHandoffNote] = useState("");
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null);

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

  const { data: allEntries = [] } = useQuery<any[]>({
    queryKey: ["/api/editor/greenhouse/all"],
    queryFn: async () => {
      const res = await fetch("/api/editor/greenhouse/all", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: viewMode === "all",
  });

  const { data: editorsList = [] } = useQuery<any[]>({
    queryKey: ["/api/editor/editors-list"],
    queryFn: async () => {
      const res = await fetch("/api/editor/editors-list", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const handoff = useMutation({
    mutationFn: async ({ writingId, targetEditorId, note }: { writingId: string; targetEditorId: string; note?: string }) => {
      await apiRequest("POST", "/api/editor/handoff", { writingId, targetEditorId, note });
    },
    onSuccess: () => {
      setShowHandoff(null);
      setHandoffEditorId("");
      setHandoffNote("");
    },
  });

  const displayEntries = viewMode === "all" ? allEntries : entries;
  const grouped = (displayEntries as any[]).reduce((acc: Record<string, any[]>, entry) => {
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
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setViewMode("mine")}
          className={`px-3 py-1.5 rounded-full font-mono text-[9px] uppercase tracking-widest border transition-all ${viewMode === "mine" ? "border-amber-500/30 bg-amber-500/10 text-amber-300" : "border-white/10 text-white/40 hover:text-white/60"}`}>
          My Greenhouse
        </button>
        <button onClick={() => setViewMode("all")}
          className={`px-3 py-1.5 rounded-full font-mono text-[9px] uppercase tracking-widest border transition-all ${viewMode === "all" ? "border-amber-500/30 bg-amber-500/10 text-amber-300" : "border-white/10 text-white/40 hover:text-white/60"}`}>
          All Editors
        </button>
      </div>
      {displayEntries.length === 0 ? (
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
                      <p className="text-xs font-serif text-white/40">by {entry.authorName || entry.writing?.authorName || "Unknown"}
                        {viewMode === "all" && entry.editorName && (
                          <span className="font-mono text-[7px] text-violet-300/40 ml-2">saved by {entry.editorName}</span>
                        )}
                      </p>
                      {entry.internalNote && (
                        <p className="text-xs font-serif text-white/30 mt-1 italic">"{entry.internalNote}"</p>
                      )}
                      <button onClick={() => setExpandedNotes(expandedNotes === entry.writingId ? null : entry.writingId)}
                        className="font-mono text-[7px] text-white/25 hover:text-amber-300/50 transition-colors mt-1 flex items-center gap-1">
                        <Edit3 size={8} /> {expandedNotes === entry.writingId ? "hide notes" : "notes"}
                      </button>
                      {expandedNotes === entry.writingId && <NotesPanel writingId={entry.writingId} />}
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
                      <button
                        onClick={() => setShowHandoff(entry.id)}
                        className="p-1.5 rounded-lg border border-white/10 text-white/30 hover:text-violet-300 hover:border-violet-500/20 transition-all"
                        title="Show to another editor"
                      >
                        <Send size={12} className="rotate-45" />
                      </button>
                              <button
                                          onClick={() => setConvEntry(entry)}
                                          className="p-1.5 rounded-lg border border-white/10 text-white/30 hover:text-teal-300 hover:border-teal-500/30 transition-colors"
                                          title="Message author"
                                          data-testid="btn-message-author"
                                        >
                                          <MessageCircle size={12} />
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
      {showHandoff && (() => {
        const entry = displayEntries.find((e: any) => e.id === showHandoff);
        if (!entry) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowHandoff(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#0f1520] border border-white/10 rounded-2xl p-6 w-full max-w-sm mx-4"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-display text-base text-amber-200 italic mb-3">Show to another editor</h3>
              <p className="text-xs font-serif text-white/40 mb-4">"{entry.writingTitle || "Untitled"}"</p>
              <div className="space-y-3">
                <select value={handoffEditorId} onChange={e => setHandoffEditorId(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-serif text-amber-100/80 focus:outline-none focus:border-amber-500/30">
                  <option value="">Select editor...</option>
                  {editorsList.map((ed: any) => (
                    <option key={ed.id} value={ed.id}>{ed.firstName || ""} {ed.lastName || ""}</option>
                  ))}
                </select>
                <input value={handoffNote} onChange={e => setHandoffNote(e.target.value)}
                  placeholder="Quick note (optional)"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-serif text-amber-100/80 placeholder:text-white/20 focus:outline-none focus:border-amber-500/30" />
                <div className="flex gap-2">
                  <button onClick={() => setShowHandoff(null)}
                    className="flex-1 px-3 py-2 rounded-lg font-mono text-[9px] uppercase tracking-widest border border-white/10 text-white/40 hover:text-white/60 transition-all">
                    Cancel
                  </button>
                  <button onClick={() => { if (handoffEditorId) handoff.mutate({ writingId: entry.writingId, targetEditorId: handoffEditorId, note: handoffNote || undefined }); }}
                    disabled={!handoffEditorId || handoff.isPending}
                    className="flex-1 px-3 py-2 rounded-lg font-mono text-[9px] uppercase tracking-widest border border-violet-500/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 transition-all disabled:opacity-50">
                    {handoff.isPending ? "Sending..." : "Send"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        );
      })()}
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

function EditorialInboxTab() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("all");
  const { data: inboxItems = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/editorial/inbox", filter],
    queryFn: async () => {
      const params = filter !== "all" ? `?state=${filter}` : "";
      const res = await fetch(`/api/editorial/inbox${params}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });
  const updateState = useMutation({
    mutationFn: async ({ id, state, decisionNote }: { id: string; state: string; decisionNote?: string }) => {
      const res = await apiRequest("PATCH", `/api/editorial/inbox/${id}`, { state, decisionNote });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/editorial/inbox"] });
    },
  });
  const states = ["all", "unread", "in_review", "accepted", "declined"];
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5 animate-pulse space-y-3">
            <div className="h-4 w-48 bg-white/10 rounded" />
            <div className="h-3 w-full bg-white/[0.06] rounded" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-2 flex-wrap">
        {states.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full font-mono text-[9px] uppercase tracking-widest border transition-all ${
              filter === s ? "border-amber-500/30 bg-amber-500/10 text-amber-300" : "border-white/10 text-white/40 hover:text-white/60"
            }`}
          >
            {s === "all" ? "All" : s.replace(/_/g, " ")}
          </button>
        ))}
      </div>
      {inboxItems.length === 0 ? (
        <div className="text-center py-16">
          <Inbox size={24} className="mx-auto mb-3 text-amber-400/30" />
          <p className="font-serif text-sm text-white/40">No items in the editorial inbox.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {inboxItems.map((item: any) => (
            <div key={item.id} className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-grow">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-display text-base font-light italic text-amber-200/90">{item.writingTitle || "Untitled"}</h3>
                    <span className={`px-2 py-0.5 rounded-full font-mono text-[8px] uppercase tracking-widest ${
                      item.state === "accepted" ? "bg-emerald-500/20 text-emerald-300" :
                      item.state === "declined" ? "bg-rose-500/20 text-rose-300" :
                      item.state === "in_review" ? "bg-blue-500/20 text-blue-300" :
                      "bg-white/10 text-white/60"
                    }`}>
                      {(item.state || "unread").replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="text-xs font-serif text-white/40">
                    by {item.authorName || "Unknown"} · {timeAgo(item.createdAt)}
                  </p>
                  {item.decisionNote && (
                    <p className="text-xs font-serif text-white/30 italic mt-2 pl-3 border-l-2 border-amber-500/20">{item.decisionNote}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <select
                    value={item.state || "unread"}
                    onChange={e => updateState.mutate({ id: item.id, state: e.target.value })}
                    className="bg-transparent border border-white/10 rounded px-1.5 py-1 font-mono text-[8px] text-white/40 focus:outline-none"
                  >
                    <option value="unread">Unread</option>
                    <option value="in_review">In Review</option>
                    <option value="accepted">Accepted</option>
                    <option value="declined">Declined</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
function ThreadsTab() {
  const queryClient = useQueryClient();
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [newSubject, setNewSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [showNewThread, setShowNewThread] = useState(false);
  const { data: threads = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/editorial/threads"],
    queryFn: async () => {
      const res = await fetch("/api/editorial/threads", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });
  const { data: messages = [] } = useQuery<any[]>({
    queryKey: ["/api/editorial/threads", selectedThread, "messages"],
    queryFn: async () => {
      if (!selectedThread) return [];
      const res = await fetch(`/api/editorial/threads/${selectedThread}/messages`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!selectedThread,
  });
  const createThread = useMutation({
    mutationFn: async (data: { subject: string }) => {
      const res = await apiRequest("POST", "/api/editorial/threads", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/editorial/threads"] });
      setShowNewThread(false);
      setNewSubject("");
    },
  });
  const sendMessage = useMutation({
    mutationFn: async ({ threadId, content }: { threadId: string; content: string }) => {
      const res = await apiRequest("POST", `/api/editorial/threads/${threadId}/messages`, { content });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/editorial/threads", selectedThread, "messages"] });
      setNewMessage("");
    },
  });
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5 animate-pulse space-y-3">
            <div className="h-4 w-48 bg-white/10 rounded" />
            <div className="h-3 w-full bg-white/[0.06] rounded" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm text-amber-200/70 italic">Editorial Threads</h3>
        <button
          onClick={() => setShowNewThread(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[9px] uppercase tracking-widest border border-amber-500/20 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-all"
        >
          <Plus size={12} /> New Thread
        </button>
      </div>
      {showNewThread && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
          <input
            value={newSubject}
            onChange={e => setNewSubject(e.target.value)}
            placeholder="Thread subject..."
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-serif text-amber-100/80 placeholder:text-white/25 focus:outline-none focus:border-amber-500/30"
          />
          <div className="flex gap-2">
            <button onClick={() => setShowNewThread(false)} className="px-3 py-1.5 rounded-lg font-mono text-[9px] uppercase tracking-widest border border-white/10 text-white/40 hover:text-white/60 transition-all">Cancel</button>
            <button
              onClick={() => { if (newSubject.trim()) createThread.mutate({ subject: newSubject.trim() }); }}
              disabled={!newSubject.trim() || createThread.isPending}
              className="px-3 py-1.5 rounded-lg font-mono text-[9px] uppercase tracking-widest border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-all disabled:opacity-50"
            >
              {createThread.isPending ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          {threads.length === 0 ? (
            <p className="text-center py-8 font-serif text-xs text-white/30">No threads yet.</p>
          ) : (
            threads.map((thread: any) => (
              <button
                key={thread.id}
                onClick={() => setSelectedThread(thread.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selectedThread === thread.id
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-200"
                    : "bg-white/5 border-white/10 text-white/60 hover:bg-white/[0.08]"
                }`}
              >
                <h4 className="font-display text-sm font-light italic truncate">{thread.subject}</h4>
                <p className="font-mono text-[8px] text-white/30 mt-1">{timeAgo(thread.updatedAt || thread.createdAt)}</p>
              </button>
            ))
          )}
        </div>
        <div className="lg:col-span-2">
          {selectedThread ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {messages.length === 0 ? (
                  <p className="text-center py-8 font-serif text-xs text-white/25">No messages yet. Start the conversation.</p>
                ) : (
                  messages.map((msg: any) => (
                    <div key={msg.id} className="bg-white/[0.03] rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[8px] text-white/40">{msg.senderName || "Editor"}</span>
                        <span className="font-mono text-[8px] text-white/25">{timeAgo(msg.createdAt)}</span>
                      </div>
                      <p className="text-xs font-serif text-amber-100/60">{msg.content}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2 pt-2 border-t border-white/5">
                <input
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Write a message..."
                  className="flex-grow px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-serif text-amber-100/80 placeholder:text-white/25 focus:outline-none focus:border-amber-500/30"
                  onKeyDown={e => { if (e.key === "Enter" && newMessage.trim()) sendMessage.mutate({ threadId: selectedThread, content: newMessage.trim() }); }}
                />
                <button
                  onClick={() => { if (newMessage.trim()) sendMessage.mutate({ threadId: selectedThread, content: newMessage.trim() }); }}
                  disabled={!newMessage.trim() || sendMessage.isPending}
                  className="px-3 py-2 rounded-lg border border-amber-500/20 text-amber-300/60 hover:text-amber-300 hover:bg-amber-500/10 transition-all disabled:opacity-30"
                >
                  <Send size={12} />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <MessageCircle size={24} className="mx-auto mb-3 text-white/15" />
              <p className="font-serif text-sm text-white/30">Select a thread to view messages</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
function WalkthroughTab() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h3 className="font-display text-lg text-amber-200 italic">Garden & Gallery Walkthrough</h3>
      <p className="font-serif text-sm text-white/70">This guide is your quick orientation within the Editorial Studio for how writing moves through our ecosystem, from writer gardens to public gallery exhibitions.</p>
      <div className="space-y-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h4 className="font-mono text-xs uppercase tracking-widest text-emerald-300 mb-2">1. Explore the Garden Stream</h4>
          <p className="font-serif text-sm text-white/60">Start with the <strong>Garden Stream</strong> tab to review new writer entries, view readiness status (raw seed / growing / ready to show / dormant), and make notes. This is the first stage in the editorial journey.</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h4 className="font-mono text-xs uppercase tracking-widest text-emerald-300 mb-2">2. Curate in Greenhouse</h4>
          <p className="font-serif text-sm text-white/60">Move promising pieces into <strong>Greenhouse</strong> for focused tracking, editorial notes, and issue alignment. Set stage, priority, and request steps from here.</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h4 className="font-mono text-xs uppercase tracking-widest text-emerald-300 mb-2">3. Publish to the Gallery</h4>
          <p className="font-serif text-sm text-white/60">When a piece is ready, use the “Publish to Gallery” action in the Garden Stream or Greenhouse. This moves it into the public <strong>Gallery</strong> and completes the editorial lifecycle.</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h4 className="font-mono text-xs uppercase tracking-widest text-emerald-300 mb-2">4. Use Editor Walks</h4>
          <p className="font-serif text-sm text-white/60">Schedule or join <strong>Editors Walk</strong> from the Overview tab. This helps you and other editors collaboratively read and flag work as a group.</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <button onClick={() => window.location.href = "/garden"} className="px-4 py-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition-all text-sm">Go to Garden</button>
        <button onClick={() => window.location.href = "/gallery"} className="px-4 py-2 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-all text-sm">Go to Gallery</button>
      </div>
    </motion.div>
  );
}

function GardenWalkTab() {
  const queryClient = useQueryClient();
    const { user } = useAuth();
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [submitTitle, setSubmitTitle] = useState("");
  const [submitExcerpt, setSubmitExcerpt] = useState("");
  const [submitGenre, setSubmitGenre] = useState("poetry");
  const { data: submissions = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/garden-walk"],
    queryFn: async () => {
      const res = await fetch("/api/garden-walk", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });
  const { data: messages = [] } = useQuery<any[]>({
    queryKey: ["/api/garden-walk", selectedSubmission, "messages"],
    queryFn: async () => {
      if (!selectedSubmission) return [];
      const res = await fetch(`/api/garden-walk/${selectedSubmission}/messages`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!selectedSubmission,
  });
  const createSubmission = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/garden-walk", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/garden-walk"] });
      setShowSubmitForm(false);
      setSubmitTitle(""); setSubmitExcerpt(""); setSubmitGenre("poetry");
    },
  });
  const sendMessage = useMutation({
    mutationFn: async ({ submissionId, content, messageType }: { submissionId: string; content: string; messageType?: string }) => {
      const res = await apiRequest("POST", `/api/garden-walk/${submissionId}/messages`, { content, messageType });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/garden-walk", selectedSubmission, "messages"] });
      setNewMessage("");
    },
  });
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/garden-walk/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/garden-walk"] });
    },
  });
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5 animate-pulse space-y-3">
            <div className="h-4 w-48 bg-white/10 rounded" />
            <div className="h-3 w-full bg-white/[0.06] rounded" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-sm text-amber-200/70 italic">Garden Walk</h3>
          <p className="font-serif text-xs text-white/30 mt-0.5">Writers submit work for the walk. Editors leave feedback and messages.</p>
        </div>
        {user?.role === 'writer' && (
        <button
          onClick={() => setShowSubmitForm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[9px] uppercase tracking-widest border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition-all"
        >
          <Plus size={12} /> Submit Work
        </button>
                )}
      </div>
      {showSubmitForm && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
          <input value={submitTitle} onChange={e => setSubmitTitle(e.target.value)} placeholder="Title of your piece..." className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-serif text-amber-100/80 placeholder:text-white/25 focus:outline-none focus:border-amber-500/30" />
          <textarea value={submitExcerpt} onChange={e => setSubmitExcerpt(e.target.value)} placeholder="Paste an excerpt or describe what you're submitting..." rows={4} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-serif text-amber-100/80 placeholder:text-white/25 focus:outline-none focus:border-amber-500/30 resize-none" />
          <div className="flex items-center gap-3">
            <select value={submitGenre} onChange={e => setSubmitGenre(e.target.value)} className="px-2 py-1 bg-white/5 border border-white/10 rounded font-mono text-[9px] text-white/50 focus:outline-none">
              <option value="poetry">Poetry</option>
              <option value="fiction">Fiction</option>
              <option value="essay">Essay</option>
              <option value="hybrid">Hybrid</option>
            </select>
            <div className="flex gap-2 ml-auto">
              <button onClick={() => setShowSubmitForm(false)} className="px-3 py-1.5 rounded-lg font-mono text-[9px] uppercase tracking-widest border border-white/10 text-white/40 hover:text-white/60 transition-all">Cancel</button>
              <button onClick={() => { if (submitTitle.trim()) createSubmission.mutate({ title: submitTitle.trim(), excerpt: submitExcerpt || undefined, genre: submitGenre }); }} disabled={!submitTitle.trim() || createSubmission.isPending} className="px-3 py-1.5 rounded-lg font-mono text-[9px] uppercase tracking-widest border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition-all disabled:opacity-50">
                {createSubmission.isPending ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          {submissions.length === 0 ? (
            <div className="text-center py-12">
              <Leaf size={24} className="mx-auto mb-3 text-emerald-400/20" />
              <p className="font-serif text-sm text-white/30">No submissions to the walk yet.</p>
            </div>
          ) : (
            submissions.map((sub: any) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubmission(sub.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selectedSubmission === sub.id
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-200"
                    : "bg-white/5 border-white/10 text-white/60 hover:bg-white/[0.08]"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-display text-sm font-light italic truncate">{sub.title}</h4>
                  <span className={`px-1.5 py-0.5 rounded-full font-mono text-[7px] uppercase tracking-widest ${
                    sub.status === "reviewed" ? "bg-emerald-500/20 text-emerald-300" :
                    sub.status === "in_review" ? "bg-blue-500/20 text-blue-300" :
                    "bg-white/10 text-white/40"
                  }`}>{(sub.status || "pending").replace(/_/g, " ")}</span>
                </div>
                <p className="font-mono text-[8px] text-white/25">{sub.sender_name || "Writer"} · {sub.genre} · {timeAgo(sub.created_at)}</p>
              </button>
            ))
          )}
        </div>
        <div className="lg:col-span-2">
          {selectedSubmission ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
              {(() => {
                const sub = submissions.find((s: any) => s.id === selectedSubmission);
                if (!sub) return null;
                return (
                  <>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-display text-base font-light italic text-amber-200/90">{sub.title}</h3>
                        <p className="text-xs font-serif text-white/40 mt-0.5">{sub.sender_name || "Writer"} · {sub.genre}</p>
                      </div>
                      <select value={sub.status || "pending"} onChange={e => updateStatus.mutate({ id: sub.id, status: e.target.value })} className="bg-transparent border border-white/10 rounded px-1.5 py-1 font-mono text-[8px] text-white/40 focus:outline-none">
                        <option value="pending">Pending</option>
                        <option value="in_review">In Review</option>
                        <option value="reviewed">Reviewed</option>
                      </select>
                    </div>
                    {sub.excerpt && <p className="text-sm font-serif text-amber-100/50 leading-relaxed border-l-2 border-emerald-500/20 pl-3">{sub.excerpt}</p>}
                  </>
                );
              })()}
              <div className="border-t border-white/5 pt-3">
                <span className="font-mono text-[8px] uppercase tracking-widest text-white/30 flex items-center gap-1 mb-3">
                  <MessageCircle size={10} /> Messages
                </span>
                <div className="space-y-2 max-h-64 overflow-y-auto mb-3">
                  {messages.length === 0 ? (
                    <p className="text-xs font-serif text-white/25 italic">No messages yet. Start the conversation.</p>
                  ) : (
                    messages.map((msg: any) => (
                      <div key={msg.id} className={`rounded-lg p-2.5 ${
                        msg.message_type === "feedback" ? "bg-emerald-500/5 border border-emerald-500/10" : "bg-white/[0.03]"
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-[8px] text-white/40">{msg.sender_name || "Editor"}</span>
                          <div className="flex items-center gap-2">
                            {msg.message_type === "feedback" && <span className="font-mono text-[6px] uppercase tracking-widest text-emerald-300/40">Feedback</span>}
                            <span className="font-mono text-[8px] text-white/25">{timeAgo(msg.created_at)}</span>
                          </div>
                        </div>
                        <p className="text-xs font-serif text-amber-100/60">{msg.content}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Write a message or feedback..." className="flex-grow px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-serif text-amber-100/80 placeholder:text-white/25 focus:outline-none focus:border-emerald-500/30" onKeyDown={e => { if (e.key === "Enter" && newMessage.trim()) sendMessage.mutate({ submissionId: selectedSubmission, content: newMessage.trim(), messageType: "feedback" }); }} />
                  <button onClick={() => { if (newMessage.trim()) sendMessage.mutate({ submissionId: selectedSubmission, content: newMessage.trim(), messageType: "feedback" }); }} disabled={!newMessage.trim() || sendMessage.isPending} className="px-3 py-2 rounded-lg border border-emerald-500/20 text-emerald-300/60 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all disabled:opacity-30">
                    <Send size={12} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <Leaf size={24} className="mx-auto mb-3 text-emerald-400/15" />
              <p className="font-serif text-sm text-white/30">Select a submission to view details and leave feedback</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
function TasksTab() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [showNewTask, setShowNewTask] = useState(false);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("medium");
  const [newComment, setNewComment] = useState("");
  const { data: tasks = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/editorial/tasks", statusFilter],
    queryFn: async () => {
      const params = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const res = await fetch(`/api/editorial/tasks${params}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });
  const { data: comments = [] } = useQuery<any[]>({
    queryKey: ["/api/editorial/tasks", expandedTask, "comments"],
    queryFn: async () => {
      if (!expandedTask) return [];
      const res = await fetch(`/api/editorial/tasks/${expandedTask}/comments`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!expandedTask,
  });
  const createTask = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/editorial/tasks", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/editorial/tasks"] });
      setShowNewTask(false);
      setNewTaskTitle("");
      setNewTaskDesc("");
      setNewTaskPriority("medium");
    },
  });
  const updateTask = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PATCH", `/api/editorial/tasks/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/editorial/tasks"] });
    },
  });
  const addComment = useMutation({
    mutationFn: async ({ taskId, content }: { taskId: string; content: string }) => {
      const res = await apiRequest("POST", `/api/editorial/tasks/${taskId}/comments`, { content });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/editorial/tasks", expandedTask, "comments"] });
      setNewComment("");
    },
  });
  const taskStatuses = ["all", "open", "in_progress", "done"];
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5 animate-pulse space-y-3">
            <div className="h-4 w-48 bg-white/10 rounded" />
            <div className="h-3 w-full bg-white/[0.06] rounded" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {taskStatuses.map(s => (
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
        <button
          onClick={() => setShowNewTask(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[9px] uppercase tracking-widest border border-amber-500/20 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-all"
        >
          <Plus size={12} /> New Task
        </button>
      </div>
      {showNewTask && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
          <input
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            placeholder="Task title..."
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-serif text-amber-100/80 placeholder:text-white/25 focus:outline-none focus:border-amber-500/30"
          />
          <textarea
            value={newTaskDesc}
            onChange={e => setNewTaskDesc(e.target.value)}
            placeholder="Description (optional)..."
            rows={2}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-serif text-amber-100/80 placeholder:text-white/25 focus:outline-none focus:border-amber-500/30 resize-none"
          />
          <div className="flex items-center gap-3">
            <select
              value={newTaskPriority}
              onChange={e => setNewTaskPriority(e.target.value)}
              className="px-2 py-1 bg-white/5 border border-white/10 rounded font-mono text-[9px] text-white/50 focus:outline-none"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <div className="flex gap-2 ml-auto">
              <button onClick={() => setShowNewTask(false)} className="px-3 py-1.5 rounded-lg font-mono text-[9px] uppercase tracking-widest border border-white/10 text-white/40 hover:text-white/60 transition-all">Cancel</button>
              <button
                onClick={() => { if (newTaskTitle.trim()) createTask.mutate({ title: newTaskTitle.trim(), description: newTaskDesc || undefined, priority: newTaskPriority }); }}
                disabled={!newTaskTitle.trim() || createTask.isPending}
                className="px-3 py-1.5 rounded-lg font-mono text-[9px] uppercase tracking-widest border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-all disabled:opacity-50"
              >
                {createTask.isPending ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
      {tasks.length === 0 ? (
        <div className="text-center py-16">
          <CheckCircle size={24} className="mx-auto mb-3 text-white/15" />
          <p className="font-serif text-sm text-white/40">No tasks found.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task: any) => (
            <div key={task.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                className="w-full text-left p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-grow">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="font-display text-sm font-light italic text-amber-200/90">{task.title}</h4>
                      <span className={`px-2 py-0.5 rounded-full font-mono text-[7px] uppercase tracking-widest border ${priorityColors[task.priority] || priorityColors.medium}`}>
                        {task.priority}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full font-mono text-[7px] uppercase tracking-widest ${
                        task.status === "done" ? "bg-emerald-500/20 text-emerald-300" :
                        task.status === "in_progress" ? "bg-blue-500/20 text-blue-300" :
                        "bg-white/10 text-white/50"
                      }`}>
                        {(task.status || "open").replace(/_/g, " ")}
                      </span>
                    </div>
                    {task.description && <p className="text-xs font-serif text-white/35">{task.description}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <select
                      value={task.status || "open"}
                      onChange={e => { e.stopPropagation(); updateTask.mutate({ id: task.id, data: { status: e.target.value } }); }}
                      onClick={e => e.stopPropagation()}
                      className="bg-transparent border border-white/10 rounded px-1.5 py-1 font-mono text-[8px] text-white/40 focus:outline-none"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                    <ChevronDown size={14} className={`text-white/30 transition-transform ${expandedTask === task.id ? "rotate-180" : ""}`} />
                  </div>
                </div>
              </button>
              <AnimatePresence>
                {expandedTask === task.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-3">
                      <span className="font-mono text-[8px] uppercase tracking-widest text-white/30 flex items-center gap-1">
                        <MessageCircle size={10} /> Comments
                      </span>
                      {comments.length === 0 ? (
                        <p className="text-xs font-serif text-white/25 italic">No comments yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {comments.map((c: any) => (
                            <div key={c.id} className="bg-white/[0.03] rounded-lg p-2.5">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-mono text-[8px] text-white/40">{c.authorName || "Editor"}</span>
                                <span className="font-mono text-[8px] text-white/25">{timeAgo(c.createdAt)}</span>
                              </div>
                              <p className="text-xs font-serif text-amber-100/60">{c.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <input
                          value={newComment}
                          onChange={e => setNewComment(e.target.value)}
                          placeholder="Add a comment..."
                          className="flex-grow px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-serif text-amber-100/80 placeholder:text-white/20 focus:outline-none focus:border-amber-500/30"
                          onKeyDown={e => { if (e.key === "Enter" && newComment.trim()) addComment.mutate({ taskId: task.id, content: newComment.trim() }); }}
                        />
                        <button
                          onClick={() => { if (newComment.trim()) addComment.mutate({ taskId: task.id, content: newComment.trim() }); }}
                          disabled={!newComment.trim() || addComment.isPending}
                          className="px-2.5 py-1.5 rounded-lg border border-amber-500/20 text-amber-300/60 hover:text-amber-300 hover:bg-amber-500/10 transition-all disabled:opacity-30"
                        >
                          <Plus size={12} />
                        </button>
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
function QuickActionPanel({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  return (
    <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
      <button onClick={() => onNavigate("overview")} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-sm text-white/70 hover:border-amber-500/20 hover:text-white transition-all">
        Overview<br/><span className="text-xs text-white/40">Dashboard summary + Walk settings</span>
      </button>
      <button onClick={() => onNavigate("garden-stream")} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-sm text-white/70 hover:border-amber-500/20 hover:text-white transition-all">
        Garden Stream<br/><span className="text-xs text-white/40">New submissions & quick review</span>
      </button>
      <button onClick={() => onNavigate("greenhouse")} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-sm text-white/70 hover:border-amber-500/20 hover:text-white transition-all">
        Greenhouse<br/><span className="text-xs text-white/40">Track and curate active pieces</span>
      </button>
      <button onClick={() => onNavigate("walkthrough")} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-sm text-white/70 hover:border-amber-500/20 hover:text-white transition-all">
        Editor Guide<br/><span className="text-xs text-white/40">Step-by-step wayfinding</span>
      </button>
    </div>
  );
}

export default function EditorStudio() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    if (typeof window === "undefined") return "overview";
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    const validTabs: Tab[] = ["overview", "garden-stream", "greenhouse", "requests", "issues", "flagged", "editorial-inbox", "threads", "garden-walk", "walkthrough", "tasks"];
    if (tabParam && validTabs.includes(tabParam as Tab)) return tabParam as Tab;
    const stored = window.localStorage.getItem("editor-studio-active-tab") as Tab | null;
    if (stored && validTabs.includes(stored)) return stored;
    return "overview";
  });

  useEffect(() => {
    window.localStorage.setItem("editor-studio-active-tab", activeTab);
    const params = new URLSearchParams(window.location.search);
    params.set("tab", activeTab);
    const newURL = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", newURL);
  }, [activeTab]);

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
            onClick={() => navigate("/sign-in")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-[9px] uppercase tracking-widest border border-white/10 text-white/40 hover:text-white/60 transition-all"
          >
                      <ArrowLeft size={14} /> Go to Sign In
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
                      onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-[9px] uppercase tracking-widest border border-white/10 text-white/40 hover:text-white/60 transition-all"
          >
                      <ArrowLeft size={14} /> Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
        <div className="min-h-screen relative z-10 px-4 sm:px-6 lg:px-8 py-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <button
                    onClick={() => navigate("/")}
          className="p-2 rounded-lg border border-white/10 text-white/40 hover:text-white/60 hover:border-white/20 transition-all"
        >
          <ArrowLeft size={16} />
        </button>
        <h1 className="font-display text-2xl font-light italic text-amber-200">Editor Studio</h1>
                {user?.role === "editor_in_chief" && (
          <button
            onClick={() => navigate("/eic-dashboard")}
            className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-lg font-mono text-[9px] uppercase tracking-widest border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-all"
          >
            <Crown size={14} /> EIC Dashboard
          </button>
        )}
      </div>

      <div className="flex gap-1 mb-8 overflow-x-auto scrollbar-hide border-b border-white/5 pb-px">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            data-testid={`tab-${tab.id}`}
            className={`flex flex-shrink-0 whitespace-nowrap items-center gap-1.5 px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest whitespace-nowrap transition-all border-b-2 -mb-px ${
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
          {activeTab === "overview" && <OverviewTab onNavigate={setActiveTab} />}
          {activeTab === "garden-stream" && <GardenStreamTab />}
          {activeTab === "greenhouse" && <GreenhouseTab />}
          {activeTab === "requests" && <RequestsTab />}
          {activeTab === "issues" && <IssuesTab />}
          {activeTab === "flagged" && <FlaggedTab />}
          {activeTab === "editorial-inbox" && <EditorialInboxTab />}
          {activeTab === "threads" && <ThreadsTab />}
          {activeTab === "garden-walk" && <GardenWalkTab />}
          {activeTab === "walkthrough" && <WalkthroughTab />}
          {activeTab === "tasks" && <TasksTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
    
