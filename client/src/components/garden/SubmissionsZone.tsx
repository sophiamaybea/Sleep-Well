import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Plus, Trash2, Edit3, Check, X, Copy, Diamond,
  Clock, FileText, Award, BarChart3, BookOpen,
  ChevronDown, ExternalLink, AlertCircle, Sparkles,
  Lock, TrendingUp, Calendar, User
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

type SubTab = "tracker" | "credits" | "bio" | "letters" | "analytics";

type Submission = {
  id: string;
  pieceTitle: string;
  writingId?: string;
  journalName: string;
  journalUrl?: string;
  submittedDate: string;
  responseDeadline?: string;
  status: string;
  simultaneousSubmission: boolean;
  genre: string;
  notes?: string;
  createdAt: string;
};

type SubmissionStats = {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  withdrawn: number;
};

type Credit = {
  id: string;
  journalName: string;
  pieceTitle: string;
  genre: string;
  publishedDate: string;
  rightsType: string;
  rightsDuration?: string;
  rightsRevertDate?: string;
  prestige: number;
  notes?: string;
  createdAt: string;
};

type WriterBio = {
  id?: string;
  oneLiner: string;
  shortBio: string;
  fullBio: string;
};

type CoverLetter = {
  id: string;
  name: string;
  template: string;
  createdAt: string;
};

type WritingPiece = {
  id: string;
  title: string;
  genre: string;
  content: string;
};

type AnalyticsData = {
  totalPieces: number;
  avgDaysToReady: number | null;
  dormantPieces: number;
  recentActivity: number;
  writingFrequency: { month: string; count: number }[];
  byStage: Record<string, number>;
  byGenre: Record<string, number>;
};

const STATUS_COLORS: Record<string, string> = {
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-400/90",
  accepted: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400/90",
  rejected: "border-white/[0.12] bg-white/[0.04] text-white/50",
  withdrawn: "border-white/[0.08] bg-white/[0.03] text-white/40",
};

const RIGHTS_TYPES = [
  { value: "first_serial", label: "First Serial" },
  { value: "one_time", label: "One-Time" },
  { value: "exclusive", label: "Exclusive" },
  { value: "non_exclusive", label: "Non-Exclusive" },
];

const GENRE_OPTIONS = ["poetry", "fiction", "essay", "fragment", "other"];

const DEFAULT_TEMPLATE = `Dear {{journalName}} Editors,

I am writing to submit my {{genre}} piece, "{{pieceTitle}}" ({{wordCount}} words), for your consideration.

{{credits}}

Thank you for your time and consideration.

Sincerely,
{{name}}`;

function formatDate(d: string | undefined | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function daysWaiting(submittedDate: string) {
  const diff = Date.now() - new Date(submittedDate).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
  toast({ title: "Copied to clipboard" });
}

function UpgradeGate({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="filter blur-[6px] pointer-events-none select-none opacity-50">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center px-8 py-10 rounded-2xl border border-amber-500/20 bg-[#0b101a]/90 backdrop-blur-xl"
          style={{ boxShadow: "0 0 60px rgba(245, 158, 11, 0.08), 0 0 120px rgba(245, 158, 11, 0.04)" }}
        >
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <Lock size={20} className="text-amber-400/70" />
          </div>
          <h3 className="font-display text-xl italic text-white/85 mb-2" data-testid="text-upgrade-title">
            Unlock your Writer's Career Tools
          </h3>
          <p className="font-serif text-sm text-white/50 max-w-xs mx-auto mb-6">
            Track submissions, manage credits, generate cover letters, and see your writing analytics.
          </p>
          <button
            className="px-6 py-2.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 hover:border-amber-500/40 font-mono text-[10px] uppercase tracking-[0.2em] text-amber-300/90 hover:text-amber-200 transition-all"
            data-testid="button-upgrade"
          >
            Upgrade to Paid
          </button>
        </motion.div>
      </div>
    </div>
  );
}

function TabNav({ active, onChange }: { active: SubTab; onChange: (t: SubTab) => void }) {
  const tabs: { id: SubTab; label: string; icon: React.ReactNode }[] = [
    { id: "tracker", label: "Tracker", icon: <Send size={12} /> },
    { id: "credits", label: "Credits", icon: <Award size={12} /> },
    { id: "bio", label: "Bio", icon: <User size={12} /> },
    { id: "letters", label: "Letters", icon: <FileText size={12} /> },
    { id: "analytics", label: "Analytics", icon: <BarChart3 size={12} /> },
  ];

  return (
    <div className="flex justify-center mb-8">
      <div className="inline-flex gap-1 p-1.5 rounded-full border border-amber-800/15 bg-amber-950/15 backdrop-blur-xl">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`relative flex items-center gap-1.5 px-4 py-2 rounded-full font-mono text-[9px] uppercase tracking-[0.18em] transition-all ${
              active === t.id ? "text-white/90" : "text-white/40 hover:text-white/60"
            }`}
            data-testid={`subtab-${t.id}`}
          >
            {active === t.id && (
              <motion.div
                layoutId="activeSubTab"
                className="absolute inset-0 rounded-full border border-amber-600/20 bg-amber-900/20"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function TrackerTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingElsewhere, setPendingElsewhere] = useState<{ submissionId: string; others: Submission[] } | null>(null);

  const [formData, setFormData] = useState({
    pieceTitle: "", writingId: "", journalName: "", journalUrl: "",
    submittedDate: new Date().toISOString().split("T")[0],
    responseDeadline: "", simultaneousSubmission: false, genre: "poetry", notes: "",
  });

  const { data: submissions = [], isLoading } = useQuery<Submission[]>({
    queryKey: ["/api/submissions"],
    queryFn: async () => {
      const res = await fetch("/api/submissions", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch submissions");
      return res.json();
    },
  });

  const { data: stats } = useQuery<SubmissionStats>({
    queryKey: ["/api/submissions/stats"],
    queryFn: async () => {
      const res = await fetch("/api/submissions/stats", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  const { data: writings = [] } = useQuery<WritingPiece[]>({
    queryKey: ["/api/writings"],
    queryFn: async () => {
      const res = await fetch("/api/writings", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create submission");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/submissions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/submissions/stats"] });
      setShowForm(false);
      resetForm();
      toast({ title: "Submission logged" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      const res = await fetch(`/api/submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update submission");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/submissions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/submissions/stats"] });
      setEditingId(null);
      toast({ title: "Submission updated" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/submissions/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete submission");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/submissions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/submissions/stats"] });
      toast({ title: "Submission deleted" });
    },
  });

  const acceptMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/submissions/${id}/accept`, { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error("Failed to accept");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/submissions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/submissions/stats"] });
      if (data.pendingElsewhere && data.pendingElsewhere.length > 0) {
        setPendingElsewhere({ submissionId: data.submission.id, others: data.pendingElsewhere });
      } else {
        toast({ title: "Marked as accepted!" });
      }
    },
  });

  const bulkWithdrawMutation = useMutation({
    mutationFn: async (submissionIds: string[]) => {
      const res = await fetch("/api/submissions/bulk-withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ submissionIds }),
      });
      if (!res.ok) throw new Error("Failed to bulk withdraw");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/submissions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/submissions/stats"] });
      setPendingElsewhere(null);
      toast({ title: "Other submissions withdrawn" });
    },
  });

  const resetForm = () => {
    setFormData({
      pieceTitle: "", writingId: "", journalName: "", journalUrl: "",
      submittedDate: new Date().toISOString().split("T")[0],
      responseDeadline: "", simultaneousSubmission: false, genre: "poetry", notes: "",
    });
  };

  const handleSubmit = () => {
    if (!formData.pieceTitle && !formData.writingId) return;
    if (!formData.journalName) return;
    const payload = { ...formData };
    if (payload.writingId) {
      const w = writings.find((w) => w.id === payload.writingId);
      if (w) payload.pieceTitle = w.title;
    }
    createMutation.mutate(payload);
  };

  const handleStatusChange = (id: string, status: string) => {
    if (status === "accepted") {
      acceptMutation.mutate(id);
    } else {
      updateMutation.mutate({ id, data: { status } as any });
    }
    setExpandedId(null);
  };

  const statCards = [
    { label: "Pending", value: stats?.pending || 0, color: "text-amber-400/80 border-amber-500/20 bg-amber-500/[0.06]" },
    { label: "Accepted", value: stats?.accepted || 0, color: "text-emerald-400/80 border-emerald-500/20 bg-emerald-500/[0.06]" },
    { label: "Rejected", value: stats?.rejected || 0, color: "text-white/50 border-white/[0.08] bg-white/[0.03]" },
    { label: "Withdrawn", value: stats?.withdrawn || 0, color: "text-white/40 border-white/[0.06] bg-white/[0.02]" },
  ];

  const grouped = {
    pending: submissions.filter((s) => s.status === "pending").sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime()),
    accepted: submissions.filter((s) => s.status === "accepted"),
    rejected: submissions.filter((s) => s.status === "rejected"),
    withdrawn: submissions.filter((s) => s.status === "withdrawn"),
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {statCards.map((s) => (
          <div key={s.label} className={`rounded-xl border p-3 text-center ${s.color}`} data-testid={`stat-${s.label.toLowerCase()}`}>
            <div className="font-display text-2xl font-light">{s.value}</div>
            <div className="font-mono text-[8px] uppercase tracking-[0.2em] mt-1 opacity-70">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <motion.button
          onClick={() => setShowForm(!showForm)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 hover:border-amber-500/30 font-mono text-[9px] uppercase tracking-[0.2em] text-amber-300/80 hover:text-amber-200 transition-all"
          data-testid="button-log-submission"
        >
          <Plus size={13} />
          Log Submission
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.03] p-5 space-y-4">
              <h3 className="font-mono text-[9px] uppercase tracking-[0.3em] text-amber-400/60 mb-3">New Submission</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/40 mb-1 block">Piece</label>
                  {writings.length > 0 ? (
                    <select
                      value={formData.writingId}
                      onChange={(e) => setFormData({ ...formData, writingId: e.target.value, pieceTitle: "" })}
                      className="w-full bg-white/[0.04] border border-white/[0.12] rounded-lg px-3 py-2 text-sm font-serif text-white/75 focus:outline-none focus:border-amber-500/30 transition-colors"
                      data-testid="select-piece"
                    >
                      <option value="">Type a title instead...</option>
                      {writings.map((w) => (
                        <option key={w.id} value={w.id}>{w.title}</option>
                      ))}
                    </select>
                  ) : null}
                  {(!formData.writingId || writings.length === 0) && (
                    <input
                      type="text"
                      value={formData.pieceTitle}
                      onChange={(e) => setFormData({ ...formData, pieceTitle: e.target.value })}
                      placeholder="Piece title"
                      className="w-full bg-white/[0.04] border border-white/[0.12] rounded-lg px-3 py-2 text-sm font-serif text-white/75 placeholder:text-white/35 focus:outline-none focus:border-amber-500/30 transition-colors mt-1.5"
                      data-testid="input-piece-title"
                    />
                  )}
                </div>
                <div>
                  <label className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/40 mb-1 block">Journal Name</label>
                  <input
                    type="text"
                    value={formData.journalName}
                    onChange={(e) => setFormData({ ...formData, journalName: e.target.value })}
                    placeholder="e.g. The Paris Review"
                    className="w-full bg-white/[0.04] border border-white/[0.12] rounded-lg px-3 py-2 text-sm font-serif text-white/75 placeholder:text-white/35 focus:outline-none focus:border-amber-500/30 transition-colors"
                    data-testid="input-journal-name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/40 mb-1 block">Journal URL</label>
                  <input
                    type="url"
                    value={formData.journalUrl}
                    onChange={(e) => setFormData({ ...formData, journalUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-white/[0.04] border border-white/[0.12] rounded-lg px-3 py-2 text-sm font-serif text-white/75 placeholder:text-white/35 focus:outline-none focus:border-amber-500/30 transition-colors"
                    data-testid="input-journal-url"
                  />
                </div>
                <div>
                  <label className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/40 mb-1 block">Submitted</label>
                  <input
                    type="date"
                    value={formData.submittedDate}
                    onChange={(e) => setFormData({ ...formData, submittedDate: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/[0.12] rounded-lg px-3 py-2 text-sm font-mono text-white/75 focus:outline-none focus:border-amber-500/30 transition-colors"
                    data-testid="input-submitted-date"
                  />
                </div>
                <div>
                  <label className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/40 mb-1 block">Deadline</label>
                  <input
                    type="date"
                    value={formData.responseDeadline}
                    onChange={(e) => setFormData({ ...formData, responseDeadline: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/[0.12] rounded-lg px-3 py-2 text-sm font-mono text-white/75 focus:outline-none focus:border-amber-500/30 transition-colors"
                    data-testid="input-response-deadline"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/40 mb-1 block">Genre</label>
                  <select
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/[0.12] rounded-lg px-3 py-2 text-sm font-serif text-white/75 focus:outline-none focus:border-amber-500/30 transition-colors"
                    data-testid="select-genre"
                  >
                    {GENRE_OPTIONS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.simultaneousSubmission}
                      onChange={(e) => setFormData({ ...formData, simultaneousSubmission: e.target.checked })}
                      className="accent-amber-500"
                      data-testid="toggle-simultaneous"
                    />
                    <span className="font-mono text-[9px] uppercase tracking-widest text-white/50">Simultaneous Submission</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/40 mb-1 block">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  placeholder="Any notes about this submission..."
                  className="w-full bg-white/[0.04] border border-white/[0.12] rounded-lg px-3 py-2 text-sm font-serif text-white/75 placeholder:text-white/35 focus:outline-none focus:border-amber-500/30 transition-colors resize-none"
                  data-testid="input-notes"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => { setShowForm(false); resetForm(); }}
                  className="px-4 py-2 rounded-lg font-mono text-[9px] uppercase tracking-widest text-white/40 hover:text-white/60 transition-colors"
                  data-testid="button-cancel-submission"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleSubmit}
                  disabled={(!formData.pieceTitle && !formData.writingId) || !formData.journalName || createMutation.isPending}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-5 py-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/25 font-mono text-[9px] uppercase tracking-widest text-amber-300/80 hover:text-amber-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  data-testid="button-submit-submission"
                >
                  Log
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pendingElsewhere && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5"
          >
            <div className="flex items-start gap-3">
              <AlertCircle size={16} className="text-emerald-400/70 mt-0.5 flex-shrink-0" />
              <div className="flex-grow">
                <p className="font-serif text-sm text-white/75 mb-2">This piece is also pending at:</p>
                <ul className="space-y-1 mb-4">
                  {pendingElsewhere.others.map((s) => (
                    <li key={s.id} className="font-serif text-sm text-white/60">· {s.journalName}</li>
                  ))}
                </ul>
                <div className="flex gap-2">
                  <button
                    onClick={() => bulkWithdrawMutation.mutate(pendingElsewhere.others.map((s) => s.id))}
                    disabled={bulkWithdrawMutation.isPending}
                    className="px-4 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/25 font-mono text-[9px] uppercase tracking-widest text-amber-300/80 hover:text-amber-200 transition-all disabled:opacity-30"
                    data-testid="button-withdraw-all-others"
                  >
                    Withdraw All Others
                  </button>
                  <button
                    onClick={() => setPendingElsewhere(null)}
                    className="px-4 py-1.5 rounded-lg font-mono text-[9px] uppercase tracking-widest text-white/40 hover:text-white/60 transition-colors"
                    data-testid="button-dismiss-pending"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-white/[0.06] rounded-xl p-4 space-y-2">
              <div className="h-4 w-48 bg-white/[0.06] rounded-lg" />
              <div className="h-3 w-32 bg-white/[0.06] rounded-lg" />
            </div>
          ))}
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-16">
          <Send size={28} className="text-white/15 mx-auto mb-4" />
          <p className="font-serif text-sm text-white/40 italic">No submissions yet — log your first one above.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {(["pending", "accepted", "rejected", "withdrawn"] as const).map((status) => {
            const items = grouped[status];
            if (items.length === 0) return null;
            return (
              <div key={status}>
                <h4 className="font-mono text-[8px] uppercase tracking-[0.3em] text-white/30 mb-3 flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${status === "pending" ? "bg-amber-400/60" : status === "accepted" ? "bg-emerald-400/60" : status === "rejected" ? "bg-white/25" : "bg-white/15"}`} />
                  {status} ({items.length})
                </h4>
                <div className="space-y-2">
                  {items.map((sub, i) => {
                    const isExpanded = expandedId === sub.id;
                    return (
                      <motion.div
                        key={sub.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        data-testid={`submission-${sub.id}`}
                      >
                        <div
                          className={`rounded-xl border transition-all cursor-pointer ${
                            isExpanded ? "border-white/15 bg-white/[0.04]" : "border-white/[0.06] hover:border-white/[0.12] bg-white/[0.02]"
                          }`}
                          onClick={() => status === "pending" && setExpandedId(isExpanded ? null : sub.id)}
                        >
                          <div className="p-4 flex items-center gap-3">
                            <div className="flex-grow min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-display text-sm text-white/80 truncate italic">{sub.pieceTitle}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-mono uppercase tracking-widest border ${STATUS_COLORS[sub.status]}`}>
                                  {sub.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-white/40">
                                <span className="font-serif text-xs">{sub.journalName}</span>
                                <span className="font-mono text-[9px]">{formatDate(sub.submittedDate)}</span>
                                {sub.status === "pending" && (
                                  <span className="font-mono text-[9px] text-amber-400/50">{daysWaiting(sub.submittedDate)}d waiting</span>
                                )}
                                {sub.responseDeadline && (
                                  <span className="font-mono text-[9px] text-white/30 flex items-center gap-1">
                                    <Clock size={9} />
                                    {formatDate(sub.responseDeadline)}
                                  </span>
                                )}
                              </div>
                            </div>
                            {sub.journalUrl && (
                              <a
                                href={sub.journalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-white/25 hover:text-white/50 transition-colors"
                                data-testid={`link-journal-${sub.id}`}
                              >
                                <ExternalLink size={13} />
                              </a>
                            )}
                            {status === "pending" && (
                              <ChevronDown size={14} className={`text-white/25 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                            )}
                          </div>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-4 border-t border-white/[0.06] pt-3 space-y-3">
                                  {sub.notes && (
                                    <p className="font-serif text-xs text-white/50 italic">{sub.notes}</p>
                                  )}
                                  <div className="flex flex-wrap gap-2">
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleStatusChange(sub.id, "accepted"); }}
                                      className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/25 font-mono text-[9px] uppercase tracking-widest text-emerald-400/80 hover:bg-emerald-500/25 transition-all"
                                      data-testid={`button-accept-${sub.id}`}
                                    >
                                      <Check size={10} className="inline mr-1" />
                                      Accepted
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleStatusChange(sub.id, "rejected"); }}
                                      className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.12] font-mono text-[9px] uppercase tracking-widest text-white/50 hover:bg-white/[0.08] transition-all"
                                      data-testid={`button-reject-${sub.id}`}
                                    >
                                      Rejected
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleStatusChange(sub.id, "withdrawn"); }}
                                      className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] font-mono text-[9px] uppercase tracking-widest text-white/40 hover:bg-white/[0.06] transition-all"
                                      data-testid={`button-withdraw-${sub.id}`}
                                    >
                                      Withdrawn
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(sub.id); }}
                                      className="px-3 py-1.5 rounded-lg font-mono text-[9px] uppercase tracking-widest text-rose-400/50 hover:text-rose-400/70 transition-colors ml-auto"
                                      data-testid={`button-delete-${sub.id}`}
                                    >
                                      <Trash2 size={11} />
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CreditsTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [sortBy, setSortBy] = useState<"date" | "journal">("date");

  const [formData, setFormData] = useState({
    journalName: "", pieceTitle: "", genre: "poetry", publishedDate: "",
    rightsType: "first_serial", rightsDuration: "", rightsRevertDate: "",
    prestige: 3, notes: "",
  });

  const { data: credits = [], isLoading } = useQuery<Credit[]>({
    queryKey: ["/api/credits"],
    queryFn: async () => {
      const res = await fetch("/api/credits", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch credits");
      return res.json();
    },
  });

  const { data: reversions = [] } = useQuery<Credit[]>({
    queryKey: ["/api/credits/reversions"],
    queryFn: async () => {
      const res = await fetch("/api/credits/reversions", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch("/api/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create credit");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/credits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/credits/reversions"] });
      setShowForm(false);
      setFormData({ journalName: "", pieceTitle: "", genre: "poetry", publishedDate: "", rightsType: "first_serial", rightsDuration: "", rightsRevertDate: "", prestige: 3, notes: "" });
      toast({ title: "Credit added" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/credits/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/credits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/credits/reversions"] });
      toast({ title: "Credit removed" });
    },
  });

  const sorted = [...credits].sort((a, b) => {
    if (sortBy === "journal") return a.journalName.localeCompare(b.journalName);
    return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
  });

  const isReverted = (c: Credit) => c.rightsRevertDate && new Date(c.rightsRevertDate) <= new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy("date")}
            className={`px-3 py-1 rounded-full font-mono text-[8px] uppercase tracking-widest border transition-all ${
              sortBy === "date" ? "border-white/20 bg-white/[0.06] text-white/70" : "border-white/[0.08] text-white/35 hover:text-white/50"
            }`}
            data-testid="sort-date"
          >
            By Date
          </button>
          <button
            onClick={() => setSortBy("journal")}
            className={`px-3 py-1 rounded-full font-mono text-[8px] uppercase tracking-widest border transition-all ${
              sortBy === "journal" ? "border-white/20 bg-white/[0.06] text-white/70" : "border-white/[0.08] text-white/35 hover:text-white/50"
            }`}
            data-testid="sort-journal"
          >
            By Journal
          </button>
        </div>
        <motion.button
          onClick={() => setShowForm(!showForm)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 font-mono text-[9px] uppercase tracking-[0.2em] text-amber-300/80 hover:text-amber-200 transition-all"
          data-testid="button-add-credit"
        >
          <Plus size={13} />
          Add Credit
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.03] p-5 space-y-4">
              <h3 className="font-mono text-[9px] uppercase tracking-[0.3em] text-amber-400/60 mb-3">New Credit</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/40 mb-1 block">Journal Name</label>
                  <input type="text" value={formData.journalName} onChange={(e) => setFormData({ ...formData, journalName: e.target.value })} placeholder="e.g. Ploughshares" className="w-full bg-white/[0.04] border border-white/[0.12] rounded-lg px-3 py-2 text-sm font-serif text-white/75 placeholder:text-white/35 focus:outline-none focus:border-amber-500/30 transition-colors" data-testid="input-credit-journal" />
                </div>
                <div>
                  <label className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/40 mb-1 block">Piece Title</label>
                  <input type="text" value={formData.pieceTitle} onChange={(e) => setFormData({ ...formData, pieceTitle: e.target.value })} placeholder="Title of piece" className="w-full bg-white/[0.04] border border-white/[0.12] rounded-lg px-3 py-2 text-sm font-serif text-white/75 placeholder:text-white/35 focus:outline-none focus:border-amber-500/30 transition-colors" data-testid="input-credit-piece" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/40 mb-1 block">Genre</label>
                  <select value={formData.genre} onChange={(e) => setFormData({ ...formData, genre: e.target.value })} className="w-full bg-white/[0.04] border border-white/[0.12] rounded-lg px-3 py-2 text-sm font-serif text-white/75 focus:outline-none focus:border-amber-500/30 transition-colors" data-testid="select-credit-genre">
                    {GENRE_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/40 mb-1 block">Published Date</label>
                  <input type="date" value={formData.publishedDate} onChange={(e) => setFormData({ ...formData, publishedDate: e.target.value })} className="w-full bg-white/[0.04] border border-white/[0.12] rounded-lg px-3 py-2 text-sm font-mono text-white/75 focus:outline-none focus:border-amber-500/30 transition-colors" data-testid="input-credit-date" />
                </div>
                <div>
                  <label className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/40 mb-1 block">Rights Type</label>
                  <select value={formData.rightsType} onChange={(e) => setFormData({ ...formData, rightsType: e.target.value })} className="w-full bg-white/[0.04] border border-white/[0.12] rounded-lg px-3 py-2 text-sm font-serif text-white/75 focus:outline-none focus:border-amber-500/30 transition-colors" data-testid="select-rights-type">
                    {RIGHTS_TYPES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/40 mb-1 block">Rights Duration</label>
                  <input type="text" value={formData.rightsDuration} onChange={(e) => setFormData({ ...formData, rightsDuration: e.target.value })} placeholder="e.g. 6 months" className="w-full bg-white/[0.04] border border-white/[0.12] rounded-lg px-3 py-2 text-sm font-serif text-white/75 placeholder:text-white/35 focus:outline-none focus:border-amber-500/30 transition-colors" data-testid="input-rights-duration" />
                </div>
                <div>
                  <label className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/40 mb-1 block">Revert Date</label>
                  <input type="date" value={formData.rightsRevertDate} onChange={(e) => setFormData({ ...formData, rightsRevertDate: e.target.value })} className="w-full bg-white/[0.04] border border-white/[0.12] rounded-lg px-3 py-2 text-sm font-mono text-white/75 focus:outline-none focus:border-amber-500/30 transition-colors" data-testid="input-revert-date" />
                </div>
                <div>
                  <label className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/40 mb-1 block">Prestige (1–5)</label>
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} onClick={() => setFormData({ ...formData, prestige: n })} className="p-1 transition-colors" data-testid={`star-${n}`}>
                        <Diamond size={16} className={n <= formData.prestige ? "text-amber-400/80 fill-amber-400/80" : "text-white/15"} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/40 mb-1 block">Notes</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} placeholder="Additional notes..." className="w-full bg-white/[0.04] border border-white/[0.12] rounded-lg px-3 py-2 text-sm font-serif text-white/75 placeholder:text-white/35 focus:outline-none focus:border-amber-500/30 transition-colors resize-none" data-testid="input-credit-notes" />
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg font-mono text-[9px] uppercase tracking-widest text-white/40 hover:text-white/60 transition-colors" data-testid="button-cancel-credit">Cancel</button>
                <motion.button onClick={() => createMutation.mutate(formData)} disabled={!formData.journalName || !formData.pieceTitle || createMutation.isPending} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="px-5 py-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/25 font-mono text-[9px] uppercase tracking-widest text-amber-300/80 hover:text-amber-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed" data-testid="button-save-credit">
                  Save
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {reversions.length > 0 && (
        <div>
          <h4 className="font-mono text-[8px] uppercase tracking-[0.3em] text-amber-400/50 mb-3 flex items-center gap-2">
            <Calendar size={11} />
            Upcoming Reversions
          </h4>
          <div className="space-y-2">
            {reversions.map((r) => (
              <div key={r.id} className="rounded-lg border border-amber-500/10 bg-amber-500/[0.02] px-4 py-2.5 flex items-center justify-between" data-testid={`reversion-${r.id}`}>
                <div>
                  <span className="font-display text-sm italic text-white/70">{r.pieceTitle}</span>
                  <span className="font-serif text-xs text-white/40 ml-2">at {r.journalName}</span>
                </div>
                <span className="font-mono text-[9px] text-amber-400/50">{formatDate(r.rightsRevertDate)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-white/[0.06] rounded-xl p-4 space-y-2">
              <div className="h-4 w-40 bg-white/[0.06] rounded-lg" />
              <div className="h-3 w-24 bg-white/[0.06] rounded-lg" />
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-16">
          <Award size={28} className="text-white/15 mx-auto mb-4" />
          <p className="font-serif text-sm text-white/40 italic">No credits yet — add your first publication.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-xl border border-white/[0.06] hover:border-white/[0.12] bg-white/[0.02] p-4 transition-all group"
              data-testid={`credit-${c.id}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-display text-sm italic text-white/80 truncate">{c.pieceTitle}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[7px] font-mono uppercase tracking-widest border ${
                      isReverted(c) ? "border-white/[0.08] text-white/35 bg-white/[0.02]" : "border-emerald-500/20 text-emerald-400/60 bg-emerald-500/[0.05]"
                    }`}>
                      {isReverted(c) ? "Reverted" : "Active"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-white/40">
                    <span className="font-serif text-xs">{c.journalName}</span>
                    <span className="font-mono text-[9px]">{formatDate(c.publishedDate)}</span>
                    <span className="font-mono text-[9px] text-white/30">
                      {RIGHTS_TYPES.find((r) => r.value === c.rightsType)?.label || c.rightsType}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Diamond key={n} size={10} className={n <= c.prestige ? "text-amber-400/60 fill-amber-400/60" : "text-white/10"} />
                    ))}
                  </div>
                  <button
                    onClick={() => deleteMutation.mutate(c.id)}
                    className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-rose-400/50 transition-all p-1"
                    data-testid={`button-delete-credit-${c.id}`}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function BioTab() {
  const queryClient = useQueryClient();

  const { data: bio, isLoading } = useQuery<WriterBio>({
    queryKey: ["/api/writer-bio"],
    queryFn: async () => {
      const res = await fetch("/api/writer-bio", { credentials: "include" });
      if (!res.ok) return { oneLiner: "", shortBio: "", fullBio: "" };
      return res.json();
    },
  });

  const { data: credits = [] } = useQuery<Credit[]>({
    queryKey: ["/api/credits"],
    queryFn: async () => {
      const res = await fetch("/api/credits", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const [oneLiner, setOneLiner] = useState("");
  const [shortBio, setShortBio] = useState("");
  const [fullBio, setFullBio] = useState("");
  const [initialized, setInitialized] = useState(false);

  if (bio && !initialized) {
    setOneLiner(bio.oneLiner || "");
    setShortBio(bio.shortBio || "");
    setFullBio(bio.fullBio || "");
    setInitialized(true);
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/writer-bio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ oneLiner, shortBio, fullBio }),
      });
      if (!res.ok) throw new Error("Failed to save bio");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/writer-bio"] });
      toast({ title: "Bio saved" });
    },
  });

  const creditsText = credits.length > 0
    ? `Work has appeared in ${credits.map((c) => c.journalName).filter((v, i, a) => a.indexOf(v) === i).join(", ")}.`
    : "";

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-white/[0.06] rounded-lg" />
        <div className="h-20 bg-white/[0.06] rounded-lg" />
        <div className="h-32 bg-white/[0.06] rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/40">One-Liner</label>
          <button onClick={() => copyToClipboard(oneLiner)} className="text-white/25 hover:text-white/50 transition-colors" data-testid="copy-oneliner">
            <Copy size={12} />
          </button>
        </div>
        <input
          type="text"
          value={oneLiner}
          onChange={(e) => setOneLiner(e.target.value)}
          placeholder="A poet from the Pacific Northwest."
          className="w-full bg-white/[0.04] border border-white/[0.12] rounded-lg px-4 py-2.5 text-sm font-serif text-white/75 placeholder:text-white/30 focus:outline-none focus:border-amber-500/30 transition-colors"
          data-testid="input-oneliner"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/40">Short Bio</label>
          <button onClick={() => copyToClipboard(shortBio)} className="text-white/25 hover:text-white/50 transition-colors" data-testid="copy-shortbio">
            <Copy size={12} />
          </button>
        </div>
        <textarea
          value={shortBio}
          onChange={(e) => setShortBio(e.target.value)}
          rows={3}
          placeholder="A few sentences about yourself and your work..."
          className="w-full bg-white/[0.04] border border-white/[0.12] rounded-lg px-4 py-3 text-sm font-serif text-white/75 placeholder:text-white/30 focus:outline-none focus:border-amber-500/30 transition-colors resize-none"
          data-testid="input-shortbio"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/40">Full Bio</label>
          <button onClick={() => copyToClipboard(fullBio)} className="text-white/25 hover:text-white/50 transition-colors" data-testid="copy-fullbio">
            <Copy size={12} />
          </button>
        </div>
        <textarea
          value={fullBio}
          onChange={(e) => setFullBio(e.target.value)}
          rows={6}
          placeholder="Your complete biographical statement..."
          className="w-full bg-white/[0.04] border border-white/[0.12] rounded-lg px-4 py-3 text-sm font-serif text-white/75 placeholder:text-white/30 focus:outline-none focus:border-amber-500/30 transition-colors resize-none"
          data-testid="input-fullbio"
        />
      </div>

      {creditsText && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/40">Auto-Generated Credits Line</label>
            <button onClick={() => copyToClipboard(creditsText)} className="text-white/25 hover:text-white/50 transition-colors" data-testid="copy-credits-line">
              <Copy size={12} />
            </button>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-3">
            <p className="font-serif text-sm text-white/60 italic" data-testid="text-credits-line">{creditsText}</p>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <motion.button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="px-5 py-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/25 font-mono text-[9px] uppercase tracking-widest text-amber-300/80 hover:text-amber-200 transition-all disabled:opacity-30"
          data-testid="button-save-bio"
        >
          Save Bio
        </motion.button>
      </div>

      <div className="border-t border-white/[0.06] pt-6">
        <h4 className="font-mono text-[8px] uppercase tracking-[0.3em] text-white/30 mb-4">Cover Letter Preview</h4>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
          <p className="font-serif text-sm text-white/60 leading-relaxed">
            {shortBio || oneLiner || "Your bio will appear here..."} {creditsText && <span className="text-white/50">{creditsText}</span>}
          </p>
        </div>
      </div>
    </div>
  );
}

function LettersTab() {
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState("");
  const [newName, setNewName] = useState("");
  const [newTemplate, setNewTemplate] = useState(DEFAULT_TEMPLATE);
  const [generatePieceId, setGeneratePieceId] = useState("");
  const [generateJournalName, setGenerateJournalName] = useState("");
  const [generatedLetter, setGeneratedLetter] = useState("");

  const { data: letters = [], isLoading } = useQuery<CoverLetter[]>({
    queryKey: ["/api/cover-letters"],
    queryFn: async () => {
      const res = await fetch("/api/cover-letters", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: writings = [] } = useQuery<WritingPiece[]>({
    queryKey: ["/api/writings"],
    queryFn: async () => {
      const res = await fetch("/api/writings", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: credits = [] } = useQuery<Credit[]>({
    queryKey: ["/api/credits"],
    queryFn: async () => {
      const res = await fetch("/api/credits", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: bio } = useQuery<WriterBio>({
    queryKey: ["/api/writer-bio"],
    queryFn: async () => {
      const res = await fetch("/api/writer-bio", { credentials: "include" });
      if (!res.ok) return { oneLiner: "", shortBio: "", fullBio: "" };
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async ({ name, template }: { name: string; template: string }) => {
      const res = await fetch("/api/cover-letters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, template }),
      });
      if (!res.ok) throw new Error("Failed to create template");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cover-letters"] });
      setShowCreateForm(false);
      setNewName("");
      setNewTemplate(DEFAULT_TEMPLATE);
      toast({ title: "Template created" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, template }: { id: string; template: string }) => {
      const res = await fetch(`/api/cover-letters/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ template }),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cover-letters"] });
      toast({ title: "Template saved" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/cover-letters/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cover-letters"] });
      setSelectedTemplateId(null);
      toast({ title: "Template deleted" });
    },
  });

  const generateLetter = () => {
    const template = selectedTemplateId
      ? letters.find((l) => l.id === selectedTemplateId)?.template || DEFAULT_TEMPLATE
      : DEFAULT_TEMPLATE;

    const piece = writings.find((w) => w.id === generatePieceId);
    const wordCount = piece ? piece.content.replace(/<[^>]*>/g, "").trim().split(/\s+/).length : 0;
    const creditsLine = credits.length > 0
      ? `Work has appeared in ${credits.map((c) => c.journalName).filter((v, i, a) => a.indexOf(v) === i).join(", ")}.`
      : "";

    const filled = template
      .replace(/\{\{name\}\}/g, bio?.oneLiner ? bio.oneLiner.split(" ").slice(0, 2).join(" ") : "")
      .replace(/\{\{pieceTitle\}\}/g, piece?.title || "")
      .replace(/\{\{wordCount\}\}/g, String(wordCount))
      .replace(/\{\{genre\}\}/g, piece?.genre || "")
      .replace(/\{\{journalName\}\}/g, generateJournalName)
      .replace(/\{\{credits\}\}/g, creditsLine);

    setGeneratedLetter(filled);
  };

  const selected = letters.find((l) => l.id === selectedTemplateId);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h4 className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">Templates</h4>
        <motion.button
          onClick={() => setShowCreateForm(!showCreateForm)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 font-mono text-[9px] uppercase tracking-[0.2em] text-amber-300/80 hover:text-amber-200 transition-all"
          data-testid="button-new-template"
        >
          <Plus size={13} />
          New Template
        </motion.button>
      </div>

      <AnimatePresence>
        {showCreateForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.03] p-5 space-y-3">
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Template name" className="w-full bg-white/[0.04] border border-white/[0.12] rounded-lg px-3 py-2 text-sm font-serif text-white/75 placeholder:text-white/35 focus:outline-none focus:border-amber-500/30 transition-colors" data-testid="input-template-name" />
              <textarea value={newTemplate} onChange={(e) => setNewTemplate(e.target.value)} rows={8} className="w-full bg-white/[0.04] border border-white/[0.12] rounded-lg px-4 py-3 text-sm font-mono text-white/65 focus:outline-none focus:border-amber-500/30 transition-colors resize-none leading-relaxed" data-testid="input-template-body" />
              <p className="font-mono text-[8px] text-white/30">
                Variables: {"{{name}}, {{pieceTitle}}, {{wordCount}}, {{genre}}, {{journalName}}, {{credits}}"}
              </p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowCreateForm(false)} className="px-4 py-2 rounded-lg font-mono text-[9px] uppercase tracking-widest text-white/40 hover:text-white/60 transition-colors" data-testid="button-cancel-template">Cancel</button>
                <motion.button onClick={() => createMutation.mutate({ name: newName || "Untitled", template: newTemplate })} disabled={createMutation.isPending} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="px-5 py-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/25 font-mono text-[9px] uppercase tracking-widest text-amber-300/80 transition-all disabled:opacity-30" data-testid="button-save-template">Save</motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="animate-pulse space-y-2">
          {[1, 2].map((i) => <div key={i} className="h-12 bg-white/[0.04] rounded-lg" />)}
        </div>
      ) : letters.length === 0 ? (
        <div className="text-center py-8">
          <FileText size={24} className="text-white/15 mx-auto mb-3" />
          <p className="font-serif text-sm text-white/40 italic">No templates yet — create one to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {letters.map((l) => (
            <div
              key={l.id}
              onClick={() => { setSelectedTemplateId(l.id === selectedTemplateId ? null : l.id); setEditingTemplate(l.template); }}
              className={`rounded-xl border p-3 cursor-pointer transition-all group ${
                selectedTemplateId === l.id ? "border-white/15 bg-white/[0.04]" : "border-white/[0.06] hover:border-white/[0.12] bg-white/[0.02]"
              }`}
              data-testid={`template-${l.id}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-sm italic text-white/70">{l.name}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[8px] text-white/25">{formatDate(l.createdAt)}</span>
                  <button onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(l.id); }} className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-rose-400/50 transition-all p-1" data-testid={`button-delete-template-${l.id}`}>
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <h4 className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/35">Edit Template</h4>
          <textarea value={editingTemplate} onChange={(e) => setEditingTemplate(e.target.value)} rows={8} className="w-full bg-white/[0.04] border border-white/[0.12] rounded-lg px-4 py-3 text-sm font-mono text-white/65 focus:outline-none focus:border-amber-500/30 transition-colors resize-none leading-relaxed" data-testid="input-edit-template" />
          <div className="flex justify-end">
            <button onClick={() => updateMutation.mutate({ id: selected.id, template: editingTemplate })} className="px-4 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 font-mono text-[9px] uppercase tracking-widest text-amber-300/70 hover:text-amber-200 transition-all" data-testid="button-update-template">
              Save Changes
            </button>
          </div>
        </motion.div>
      )}

      <div className="border-t border-white/[0.06] pt-6 space-y-4">
        <h4 className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
          <Sparkles size={12} className="text-amber-400/40" />
          Generate Letter
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/40 mb-1 block">Select Piece</label>
            <select value={generatePieceId} onChange={(e) => setGeneratePieceId(e.target.value)} className="w-full bg-white/[0.04] border border-white/[0.12] rounded-lg px-3 py-2 text-sm font-serif text-white/75 focus:outline-none focus:border-amber-500/30 transition-colors" data-testid="select-generate-piece">
              <option value="">Choose a piece...</option>
              {writings.map((w) => <option key={w.id} value={w.id}>{w.title}</option>)}
            </select>
          </div>
          <div>
            <label className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/40 mb-1 block">Journal Name</label>
            <input type="text" value={generateJournalName} onChange={(e) => setGenerateJournalName(e.target.value)} placeholder="e.g. Tin House" className="w-full bg-white/[0.04] border border-white/[0.12] rounded-lg px-3 py-2 text-sm font-serif text-white/75 placeholder:text-white/35 focus:outline-none focus:border-amber-500/30 transition-colors" data-testid="input-generate-journal" />
          </div>
        </div>
        <div className="flex justify-end">
          <motion.button
            onClick={generateLetter}
            disabled={!generatePieceId || !generateJournalName}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-5 py-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/25 font-mono text-[9px] uppercase tracking-widest text-amber-300/80 hover:text-amber-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            data-testid="button-generate-letter"
          >
            Generate
          </motion.button>
        </div>

        {generatedLetter && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/35">Generated Letter</h4>
              <button onClick={() => copyToClipboard(generatedLetter)} className="flex items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors font-mono text-[9px] uppercase tracking-widest" data-testid="button-copy-letter">
                <Copy size={12} />
                Copy
              </button>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6">
              <p className="font-serif text-sm text-white/65 leading-relaxed whitespace-pre-wrap" data-testid="text-generated-letter">{generatedLetter}</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function AnalyticsTab() {
  const [quarterly, setQuarterly] = useState(false);

  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/writing-analytics"],
    queryFn: async () => {
      const res = await fetch("/api/writing-analytics", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 bg-white/[0.04] rounded-xl" />)}
        </div>
        <div className="h-48 bg-white/[0.04] rounded-xl" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-16">
        <BarChart3 size={28} className="text-white/15 mx-auto mb-4" />
        <p className="font-serif text-sm text-white/40 italic">No analytics data yet — start writing to see your stats.</p>
      </div>
    );
  }

  const maxFreq = Math.max(...(analytics.writingFrequency || []).map((m) => m.count), 1);
  const stageEntries = Object.entries(analytics.byStage || {});
  const genreEntries = Object.entries(analytics.byGenre || {});
  const maxStage = Math.max(...stageEntries.map(([, c]) => c), 1);
  const maxGenre = Math.max(...genreEntries.map(([, c]) => c), 1);

  const stageColorMap: Record<string, string> = {
    raw_seed: "bg-amber-400/60",
    growing: "bg-emerald-400/60",
    ready_to_show: "bg-pink-400/60",
    dormant: "bg-violet-400/60",
  };

  const genreColorMap: Record<string, string> = {
    poetry: "bg-teal-400/60",
    fiction: "bg-blue-400/60",
    essay: "bg-amber-400/60",
    fragment: "bg-rose-400/60",
    other: "bg-white/30",
  };

  const statCards = [
    { label: "Total Pieces", value: analytics.totalPieces, icon: <BookOpen size={14} className="text-white/25" /> },
    { label: "Avg Days Seed→Ready", value: analytics.avgDaysToReady ?? "—", icon: <TrendingUp size={14} className="text-white/25" /> },
    { label: "Dormant", value: analytics.dormantPieces, icon: <Clock size={14} className="text-white/25" /> },
    { label: "Active (7d)", value: analytics.recentActivity, icon: <Sparkles size={14} className="text-amber-400/30" /> },
  ];

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center" data-testid={`analytics-stat-${s.label.toLowerCase().replace(/\s+/g, "-")}`}>
            <div className="flex justify-center mb-1.5">{s.icon}</div>
            <div className="font-display text-xl font-light text-white/80">{s.value}</div>
            <div className="font-mono text-[7px] uppercase tracking-[0.2em] text-white/30 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-mono text-[8px] uppercase tracking-[0.3em] text-white/30">Writing Frequency</h4>
          <button
            onClick={() => setQuarterly(!quarterly)}
            className={`px-3 py-1 rounded-full font-mono text-[8px] uppercase tracking-widest border transition-all ${
              quarterly ? "border-white/20 bg-white/[0.06] text-white/60" : "border-white/[0.08] text-white/30 hover:text-white/50"
            }`}
            data-testid="toggle-quarterly"
          >
            {quarterly ? "Quarterly" : "Monthly"}
          </button>
        </div>
        <div className="flex items-end gap-1 h-32">
          {(analytics.writingFrequency || []).map((m, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(m.count / maxFreq) * 100}%` }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="w-full rounded-t bg-amber-400/30 hover:bg-amber-400/50 transition-colors min-h-[2px] relative group"
                data-testid={`freq-bar-${i}`}
              >
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 font-mono text-[8px] text-white/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  {m.count}
                </div>
              </motion.div>
              <span className="font-mono text-[7px] text-white/25 mt-1.5 truncate w-full text-center">{m.month}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <h4 className="font-mono text-[8px] uppercase tracking-[0.3em] text-white/30 mb-4">By Stage</h4>
          <div className="space-y-2">
            {stageEntries.map(([stage, count]) => (
              <div key={stage} className="flex items-center gap-3" data-testid={`stage-bar-${stage}`}>
                <span className="font-mono text-[8px] text-white/40 w-20 truncate capitalize">{stage.replace(/_/g, " ")}</span>
                <div className="flex-grow h-4 bg-white/[0.03] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / maxStage) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    className={`h-full rounded-full ${stageColorMap[stage] || "bg-white/20"}`}
                  />
                </div>
                <span className="font-mono text-[9px] text-white/40 w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-mono text-[8px] uppercase tracking-[0.3em] text-white/30 mb-4">By Genre</h4>
          <div className="space-y-2">
            {genreEntries.map(([genre, count]) => (
              <div key={genre} className="flex items-center gap-3" data-testid={`genre-bar-${genre}`}>
                <span className="font-mono text-[8px] text-white/40 w-20 truncate capitalize">{genre}</span>
                <div className="flex-grow h-4 bg-white/[0.03] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / maxGenre) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    className={`h-full rounded-full ${genreColorMap[genre] || "bg-white/20"}`}
                  />
                </div>
                <span className="font-mono text-[9px] text-white/40 w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubmissionsZone({ userTier }: { userTier: "free" | "paid" }) {
  const [activeTab, setActiveTab] = useState<SubTab>("tracker");

  const renderContent = () => {
    switch (activeTab) {
      case "tracker": return <TrackerTab />;
      case "credits": return <CreditsTab />;
      case "bio": return <BioTab />;
      case "letters": return <LettersTab />;
      case "analytics": return <AnalyticsTab />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto" data-testid="submissions-zone">
      <div className="text-center mb-6">
        <h2 className="font-display text-xl font-light italic text-white/80 mb-1">Career Tools</h2>
        <p className="font-serif text-xs text-white/40">Track submissions, manage credits, and stay organized.</p>
      </div>

      <TabNav active={activeTab} onChange={setActiveTab} />

      {false ? (
        <UpgradeGate>{renderContent()}</UpgradeGate>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
