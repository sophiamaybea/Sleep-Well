import { Brain, Sparkles, Zap, Activity, MessageSquare, Terminal, Bell, BarChart3, Search, ShieldCheck, Send, RotateCcw, ChevronDown, X, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import LoadingScreen from "@/components/garden/LoadingScreen";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const ease = [0.22, 1, 0.36, 1] as const;

interface EditorInvitation {
  id: string;
  email: string;
  token: string;
  invitedBy: string;
  status: string;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
}

interface EditorUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  role: string | null;
}

interface DashboardStats {
  totalUsers: number;
  totalWritings: number;
  publishedWritings: number;
  editorialAvailableWritings: number;
  readinessBreakdown: Record<string, number>;
  genreBreakdown: Record<string, number>;
  recentWritings7d: number;
  recentWritings30d: number;
  activeGardenUsers: number;
}

interface EICWriting {
  id: string;
  authorId: string;
  title: string;
  content?: string;
  stage: string;
  genre: string;
  readiness: string;
  editorialAvailable: boolean;
  isPublished: boolean;
  isPublicGarden: boolean;
  galleryOptIn: boolean;
  visibility: string;
  createdAt: string;
  updatedAt: string;
  authorFirstName: string | null;
  authorLastName: string | null;
  authorEmail: string | null;
}

interface EICUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  bio: string | null;
  role: string | null;
}

interface UserActivity {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  createdAt: string;
  totalWritings: number;
  publishedWritings: number;
  rawSeeds: number;
  editorialAvailable: number;
  ritualSessions: number;
  innerWeatherEntries: number;
  reflections: number;
  journalEntries: number;
  pollinations: number;
  savedPieces: number;
  lastActivity: string;
}

interface ActivityFeed {
  recentWritings: Array<{
    id: string;
    title: string;
    readiness: string;
    isPublished: boolean;
    editorialAvailable: boolean;
    createdAt: string;
    updatedAt: string;
    authorFirstName: string | null;
    authorLastName: string | null;
    authorEmail: string | null;
  }>;
  recentRituals: Array<{
    id: string;
    durationMinutes: number;
    completedAt: string;
    userFirstName: string | null;
    userLastName: string | null;
    userEmail: string | null;
  }>;
  recentWeather: Array<{
    id: string;
    mood: string;
    energy: number;
    createdAt: string;
    userFirstName: string | null;
    userLastName: string | null;
  }>;
}

interface AgentSummary {
  totals: Record<string, number>;
  breakdowns: {
    notifsByAgent: Array<{ agentName: string; total: number }>;
    insightsByType: Array<{ insightType: string; total: number }>;
    copySnapshotsByStatus: Array<{ status: string; total: number }>;
    editorialBriefsByStatus: Array<{ status: string; total: number }>;
  };
}

interface AgentNotification {
  id: string;
  userId: string;
  agentName: string;
  message: string;
  createdAt: string;
  readAt: string | null;
  dismissedAt: string | null;
}

type AgentType = "design" | "writers" | "exhibitions" | "monetisation" | "caleb_studio" | "giove_studio";

const AGENTS: Array<{ key: AgentType; label: string; emoji: string; colour: string; description: string }> = [
  { key: "design", label: "Design", emoji: "✦", colour: "var(--color-agent-lavender)", description: "Visual identity, CSS, animations, typography" },
  { key: "writers", label: "Writers", emoji: "✿", colour: "var(--color-garden-bloom)", description: "Garden.tsx, writer profiles, seed-to-bloom stages" },
  { key: "exhibitions", label: "Exhibitions", emoji: "◈", colour: "var(--color-accent-ornament)", description: "Poetry gallery, GSAP scroll, mood detection, illustrations" },
  { key: "monetisation", label: "Monetisation", emoji: "◇", colour: "var(--color-foreground)", description: "Stripe, PayPal, pricing, checkout flows, MRR" },
  { key: "caleb_studio", label: "Caleb's Studio", emoji: "⌘", colour: "var(--color-garden-bloom)", description: "Features and tools for Caleb's editorial workflow" },
  { key: "giove_studio", label: "Giove's Studio", emoji: "⌘", colour: "var(--color-agent-lavender)", description: "Features and tools for Giove's editorial workflow" },
];

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  agentType?: AgentType;
  agentLabel?: string;
  agentColour?: string;
  timestamp: number;
}

type Tab = "overview" | "writings" | "users" | "team" | "raw-seeds" | "unsaved" | "activity" | "feed" | "enquiries" | "silent-agents" | "open-calls";

export default function EICDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState("");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [selectedWriting, setSelectedWriting] = useState<string | null>(null);

  // Agent chat state
  const [selectedAgent, setSelectedAgent] = useState<AgentType | "collaborative">("design");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [chatSheetOpen, setChatSheetOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (chatSheetOpen) {
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
    }
  }, [chatMessages, chatSheetOpen]);

  const { data: roleData, isLoading: roleLoading } = useQuery<{ role: string; tier: string }>({
    queryKey: ["/api/user/role"],
    queryFn: async () => {
      const res = await fetch("/api/user/role", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch role");
      return res.json();
    },
    enabled: !!user,
  });

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/eic/dashboard-stats"],
    queryFn: async () => {
      const res = await fetch("/api/eic/dashboard-stats", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      return {
        totalUsers: data.users?.total ?? 0,
        totalWritings: data.writings?.total ?? 0,
        publishedWritings: data.writings?.published ?? 0,
        editorialAvailableWritings: data.writings?.editorialAvailable ?? 0,
        readinessBreakdown: { raw_seed: data.writings?.seeds ?? 0, growing: data.writings?.growing ?? 0, ready_to_show: data.writings?.readyToShow ?? 0 },
        genreBreakdown: {},
        recentWritings7d: data.writings?.thisWeek ?? 0,
        recentWritings30d: data.writings?.thisMonth ?? 0,
        activeGardenUsers: data.users?.activeInGarden ?? 0,
      };
    },
    enabled: roleData?.role === "editor_in_chief",
  });

  const { data: allWritings = [], isLoading: writingsLoading } = useQuery<EICWriting[]>({
    queryKey: ["/api/eic/all-writings"],
    queryFn: async () => {
      const res = await fetch("/api/eic/all-writings", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch writings");
      return res.json();
    },
    enabled: roleData?.role === "editor_in_chief" && activeTab === "writings",
  });

  const { data: allUsers = [], isLoading: usersLoading } = useQuery<EICUser[]>({
    queryKey: ["/api/eic/all-users"],
    queryFn: async () => {
      const res = await fetch("/api/eic/all-users", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
    enabled: roleData?.role === "editor_in_chief" && activeTab === "users",
  });

  const { data: invitations = [], isLoading: invLoading } = useQuery<EditorInvitation[]>({
    queryKey: ["/api/eic/invitations"],
    queryFn: async () => {
      const res = await fetch("/api/eic/invitations", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch invitations");
      return res.json();
    },
    enabled: roleData?.role === "editor_in_chief" && activeTab === "team",
  });

  const { data: editors = [], isLoading: editorsLoading } = useQuery<EditorUser[]>({
    queryKey: ["/api/eic/editors"],
    queryFn: async () => {
      const res = await fetch("/api/eic/editors", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch editors");
      return res.json();
    },
    enabled: roleData?.role === "editor_in_chief" && activeTab === "team",
  });

  const { data: rawSeeds = [], isLoading: rawSeedsLoading } = useQuery<EICWriting[]>({
    queryKey: ["/api/eic/raw-seeds"],
    queryFn: async () => {
      const res = await fetch("/api/eic/raw-seeds", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch raw seeds");
      return res.json();
    },
    enabled: roleData?.role === "editor_in_chief" && activeTab === "raw-seeds",
  });

  const { data: unsavedDrafts = [], isLoading: unsavedLoading } = useQuery<EICWriting[]>({
    queryKey: ["/api/eic/unsaved-drafts"],
    queryFn: async () => {
      const res = await fetch("/api/eic/unsaved-drafts", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch unsaved drafts");
      return res.json();
    },
    enabled: roleData?.role === "editor_in_chief" && activeTab === "unsaved",
  });

  const { data: userActivity = [], isLoading: activityLoading } = useQuery<UserActivity[]>({
    queryKey: ["/api/eic/user-activity"],
    queryFn: async () => {
      const res = await fetch("/api/eic/user-activity", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch user activity");
      return res.json();
    },
    enabled: roleData?.role === "editor_in_chief" && activeTab === "activity",
  });

  const { data: serviceEnquiries = [], isLoading: enquiriesLoading } = useQuery<Array<{id: string; name: string; email: string; serviceType: string; message: string; createdAt: string}>>({
    queryKey: ["/api/services/inquiries"],
    queryFn: async () => {
      const res = await fetch("/api/services/inquiries", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch enquiries");
      return res.json();
    },
    enabled: roleData?.role === "editor_in_chief" && activeTab === "enquiries",
  });

  const { data: activityFeed, isLoading: feedLoading } = useQuery<ActivityFeed>({
    queryKey: ["/api/eic/activity-feed"],
    queryFn: async () => {
      const res = await fetch("/api/eic/activity-feed", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch activity feed");
      return res.json();
    },
    enabled: roleData?.role === "editor_in_chief" && activeTab === "feed",
  });

  const { data: agentSummary, isLoading: agentSummaryLoading } = useQuery<AgentSummary>({
    queryKey: ["/api/agent-dashboard/summary"],
    queryFn: async () => {
      const res = await fetch("/api/agent-dashboard/summary", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch agent summary");
      const json = await res.json();
      return json.data;
    },
    enabled: roleData?.role === "editor_in_chief" && activeTab === "silent-agents",
  });

  const { data: agentNotifs = [], isLoading: agentNotifsLoading } = useQuery<AgentNotification[]>({
    queryKey: ["/api/agent-dashboard/notifications"],
    queryFn: async () => {
      const res = await fetch("/api/agent-dashboard/notifications", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch agent notifications");
      const json = await res.json();
      return json.data;
    },
    enabled: roleData?.role === "editor_in_chief" && activeTab === "silent-agents",
  });

  const { data: previewWriting } = useQuery<EICWriting>({
    queryKey: ["/api/eic/writing", selectedWriting],
    queryFn: async () => {
      const res = await fetch(`/api/eic/writing/${selectedWriting}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch writing");
      return res.json();
    },
    enabled: !!selectedWriting && roleData?.role === "editor_in_chief",
  });

  const inviteMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await fetch("/api/eic/invite-editor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Failed to send invitation");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/eic/invitations"] });
      setInviteEmail("");
    },
  });

  // ─── Agent chat send handler ────────────────────────────────────────────────
  const sendMessage = async () => {
    const text = chatInput.trim();
    if (!text || isSending) return;
    setChatInput("");
    setIsSending(true);

    const userMsg: ChatMessage = { role: "user", content: text, timestamp: Date.now() };
    setChatMessages((prev) => [...prev, userMsg]);

    const historyForApi = chatMessages
      .filter((m) => selectedAgent === "collaborative" ? true : m.agentType === selectedAgent || m.role === "user")
      .map((m) => ({ role: m.role, content: m.content }));

    if (selectedAgent === "collaborative") {
      // Fan out to all six agents in parallel
      const agentsToCall = AGENTS;
      try {
        const results = await Promise.allSettled(
          agentsToCall.map((agent) =>
            fetch("/api/eic/command-centre/agent/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                agentType: agent.key,
                userMessage: text,
                conversationHistory: historyForApi,
              }),
            }).then((r) => r.json())
          )
        );
        const replies: ChatMessage[] = results.map((result, i) => {
          const agent = agentsToCall[i];
          if (result.status === "fulfilled" && result.value?.reply) {
            return {
              role: "assistant" as const,
              content: result.value.reply,
              agentType: agent.key,
              agentLabel: agent.label,
              agentColour: agent.colour,
              timestamp: Date.now() + i,
            };
          }
          return {
            role: "assistant" as const,
            content: `${agent.label} agent encountered an error.`,
            agentType: agent.key,
            agentLabel: agent.label,
            agentColour: agent.colour,
            timestamp: Date.now() + i,
          };
        });
        setChatMessages((prev) => [...prev, ...replies]);
      } catch {
        setChatMessages((prev) => [...prev, { role: "assistant", content: "The agents could not be reached. Check the server logs.", timestamp: Date.now() }]);
      }
    } else {
      // Single agent
      const agentMeta = AGENTS.find((a) => a.key === selectedAgent)!;
      try {
        const res = await fetch("/api/eic/command-centre/agent/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            agentType: selectedAgent,
            userMessage: text,
            conversationHistory: historyForApi,
          }),
        });
        const data = await res.json();
        setChatMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.reply ?? "No response from agent.",
            agentType: agentMeta.key,
            agentLabel: agentMeta.label,
            agentColour: agentMeta.colour,
            timestamp: Date.now(),
          },
        ]);
      } catch {
        setChatMessages((prev) => [...prev, { role: "assistant", content: "Agent unreachable. Check the server and your API key.", timestamp: Date.now() }]);
      }
    }
    setIsSending(false);
    setTimeout(() => inputRef.current?.focus(), 80);
  };

  if (authLoading || roleLoading) return <LoadingScreen />;

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-foreground/60 font-serif text-lg">Please sign in to continue.</p>
          <button onClick={() => navigate("/sign-in")} className="inline-block px-6 py-3 bg-accent-ornament/20 border border-accent-ornament/30 text-accent-ornament font-display text-lg rounded hover:bg-accent-ornament/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ornament">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (roleData?.role !== "editor_in_chief") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-foreground/60 font-serif text-lg">You do not have access to this page.</p>
          <button onClick={() => navigate("/")} className="px-6 py-3 bg-accent-ornament/20 border border-accent-ornament/30 text-accent-ornament font-display text-lg rounded hover:bg-accent-ornament/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ornament">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const getInvitationLink = (token: string) => `${window.location.origin}/editor-onboarding?token=${token}`;
  const copyLink = (token: string) => {
    navigator.clipboard.writeText(getInvitationLink(token));
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const pendingInvitations = invitations.filter((i) => i.status === "pending" && new Date(i.expiresAt) > new Date());
  const acceptedInvitations = invitations.filter((i) => i.status === "accepted");
  const expiredInvitations = invitations.filter((i) => i.status === "pending" && new Date(i.expiresAt) <= new Date());

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "writings", label: "All Writings" },
    { key: "raw-seeds", label: "Raw Seeds" },
    { key: "unsaved", label: "Private Drafts" },
    { key: "activity", label: "User Activity" },
    { key: "feed", label: "Live Feed" },
    { key: "users", label: "All Users" },
    { key: "team", label: "Editorial Team" },
    { key: "enquiries", label: "Enquiries" },
    { key: "silent-agents", label: "Silent AI Agents" },   { key: "open-calls", label: "Open Calls" },
    ];

  const timeAgo = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const activeAgentMeta = AGENTS.find((a) => a.key === selectedAgent);

  return (
    <div className="min-h-screen bg-background relative z-10">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }}>
          <button onClick={() => navigate("/")} className="text-foreground/40 hover:text-foreground/70 font-serif text-sm mb-8 block transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ornament rounded">
            ← Back to Home
          </button>
          <h1 className="font-display text-4xl md:text-5xl text-foreground font-light tracking-wide mb-2">
            Editor-in-Chief Studio
          </h1>
          <p className="text-foreground/50 font-serif text-sm mb-8">
            Complete oversight of The Page Gallery Journal — every seed, every draft, every heartbeat
          </p>

          <div className="flex flex-wrap gap-1 mb-12 border-b border-foreground/10 pb-px">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); window.scrollTo(0, 0); setSelectedWriting(null); }}
                className={`px-4 py-3 font-display text-base transition-colors border-b-2 -mb-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ornament rounded-t ${
                  activeTab === tab.key
                    ? "border-accent-ornament text-accent-ornament"
                    : "border-transparent text-foreground/40 hover:text-foreground/70"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {selectedWriting && previewWriting && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6" onClick={() => setSelectedWriting(null)}>
            <div className="bg-background border border-foreground/10 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="font-display text-2xl text-foreground">{previewWriting.title}</h2>
                  <p className="text-foreground/40 font-serif text-xs mt-1">
                    by {previewWriting.authorFirstName || ""} {previewWriting.authorLastName || ""} · {previewWriting.authorEmail}
                  </p>
                </div>
                <button onClick={() => setSelectedWriting(null)} className="text-foreground/40 hover:text-foreground text-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ornament rounded" aria-label="Close preview">×</button>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2 py-0.5 bg-accent-ornament/10 text-accent-ornament text-[10px] font-mono rounded">{previewWriting.readiness.replace(/_/g, " ")}</span>
                <span className="px-2 py-0.5 bg-foreground/5 text-foreground/40 text-[10px] font-mono rounded">{previewWriting.genre}</span>
                <span className="px-2 py-0.5 bg-foreground/5 text-foreground/40 text-[10px] font-mono rounded">{previewWriting.stage}</span>
                {previewWriting.isPublished && <span className="px-2 py-0.5 bg-garden-bloom/10 text-garden-bloom text-[10px] font-mono rounded">published</span>}
                {previewWriting.editorialAvailable && <span className="px-2 py-0.5 bg-accent-ornament/10 text-accent-ornament text-[10px] font-mono rounded">editorial</span>}
              </div>
              <div className="text-foreground/70 font-serif text-sm leading-relaxed whitespace-pre-wrap border-t border-foreground/10 pt-4 mt-4">
                {previewWriting.content || <span className="italic text-foreground/30">No content yet</span>}
              </div>
              <div className="text-foreground/20 font-mono text-[10px] mt-6 pt-4 border-t border-foreground/[0.06]">
                Created {new Date(previewWriting.createdAt).toLocaleString()} · Updated {new Date(previewWriting.updatedAt).toLocaleString()}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            {statsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                {[1,2,3,4].map((i) => <div key={i} className="h-24 bg-foreground/5 rounded animate-pulse" />)}
              </div>
            ) : stats ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                  <StatCard label="Total Users" value={stats.totalUsers} />
                  <StatCard label="Total Writings" value={stats.totalWritings} />
                  <StatCard label="Published" value={stats.publishedWritings} accent />
                  <StatCard label="Editorial Available" value={stats.editorialAvailableWritings} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
                  <StatCard label="New (7 days)" value={stats.recentWritings7d} />
                  <StatCard label="New (30 days)" value={stats.recentWritings30d} />
                  <StatCard label="Active in Garden" value={stats.activeGardenUsers} accent />
                </div>
                {stats.readinessBreakdown && Object.keys(stats.readinessBreakdown).length > 0 && (
                  <div className="mb-12">
                    <h3 className="font-display text-xl text-foreground/80 font-light mb-4">Readiness Breakdown</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(stats.readinessBreakdown).map(([key, val]) => (
                        <div key={key} className="px-4 py-3 bg-foreground/[0.03] border border-foreground/[0.06] rounded">
                          <div className="text-accent-ornament font-mono text-lg">{val}</div>
                          <div className="text-foreground/40 font-serif text-xs mt-1">{key.replace(/_/g, " ")}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-foreground/40 font-serif text-sm">Failed to load dashboard stats.</p>
            )}
          </motion.div>
        )}

        {activeTab === "writings" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <h2 className="font-display text-2xl text-foreground/90 font-light mb-6">All Writings</h2>
            <WritingsTable writings={allWritings} loading={writingsLoading} onPreview={setSelectedWriting} timeAgo={timeAgo} />
          </motion.div>
        )}

        {activeTab === "raw-seeds" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <h2 className="font-display text-2xl text-foreground/90 font-light mb-2">Raw Seeds</h2>
            <p className="text-foreground/40 font-serif text-xs mb-6">Writings at the raw_seed readiness stage — the earliest ideas people are nurturing</p>
            <WritingsTable writings={rawSeeds} loading={rawSeedsLoading} onPreview={setSelectedWriting} timeAgo={timeAgo} />
          </motion.div>
        )}

        {activeTab === "unsaved" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <h2 className="font-display text-2xl text-foreground/90 font-light mb-2">Private Drafts</h2>
            <p className="text-foreground/40 font-serif text-xs mb-6">Writings that haven't been published, aren't editorial-available, and aren't in the public garden</p>
            <WritingsTable writings={unsavedDrafts} loading={unsavedLoading} onPreview={setSelectedWriting} timeAgo={timeAgo} />
          </motion.div>
        )}

        {activeTab === "activity" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <h2 className="font-display text-2xl text-foreground/90 font-light mb-2">User Activity & Engagement</h2>
            <p className="text-foreground/40 font-serif text-xs mb-6">See exactly how much each person is using the platform</p>
            {activityLoading ? (
              <div className="space-y-3">{[1,2,3,4].map((i) => <div key={i} className="h-20 bg-foreground/5 rounded animate-pulse" />)}</div>
            ) : userActivity.length === 0 ? (
              <p className="text-foreground/40 font-serif text-sm italic">No users found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-foreground/10">
                      <th className="pb-3 text-foreground/50 font-mono text-xs uppercase tracking-wider">User</th>
                      <th className="pb-3 text-foreground/50 font-mono text-xs uppercase tracking-wider">Writings</th>
                      <th className="pb-3 text-foreground/50 font-mono text-xs uppercase tracking-wider">Published</th>
                      <th className="pb-3 text-foreground/50 font-mono text-xs uppercase tracking-wider">Raw Seeds</th>
                      <th className="pb-3 text-foreground/50 font-mono text-xs uppercase tracking-wider">Rituals</th>
                      <th className="pb-3 text-foreground/50 font-mono text-xs uppercase tracking-wider">Weather</th>
                      <th className="pb-3 text-foreground/50 font-mono text-xs uppercase tracking-wider">Reflect</th>
                      <th className="pb-3 text-foreground/50 font-mono text-xs uppercase tracking-wider">Last Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userActivity.map((u) => (
                      <tr key={u.id} className="border-b border-foreground/[0.04] hover:bg-foreground/[0.02] transition-colors">
                        <td className="py-3 pr-4">
                          <div className="text-foreground/80 font-serif text-sm">{u.firstName || "—"} {u.lastName || ""}</div>
                          <div className="text-foreground/30 font-mono text-[10px]">{u.email}</div>
                        </td>
                        <td className="py-3 pr-4 text-foreground/70 font-mono text-sm">{u.totalWritings}</td>
                        <td className="py-3 pr-4 text-garden-bloom font-mono text-sm">{u.publishedWritings}</td>
                        <td className="py-3 pr-4 text-accent-ornament/70 font-mono text-sm">{u.rawSeeds}</td>
                        <td className="py-3 pr-4 text-foreground/50 font-mono text-sm">{u.ritualSessions}</td>
                        <td className="py-3 pr-4 text-foreground/50 font-mono text-sm">{u.innerWeatherEntries}</td>
                        <td className="py-3 pr-4 text-foreground/50 font-mono text-sm">{u.reflections}</td>
                        <td className="py-3 text-foreground/30 font-mono text-xs">{u.lastActivity ? timeAgo(u.lastActivity) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-foreground/30 font-serif text-xs mt-4">{userActivity.length} total users tracked</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "feed" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <h2 className="font-display text-2xl text-foreground/90 font-light mb-2">Live Activity Feed</h2>
            <p className="text-foreground/40 font-serif text-xs mb-6">The most recent actions across the entire platform</p>
            {feedLoading ? (
              <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-16 bg-foreground/5 rounded animate-pulse" />)}</div>
            ) : activityFeed ? (
              <div className="space-y-8">
                <div>
                  <h3 className="text-accent-ornament/70 font-mono text-xs uppercase tracking-widest mb-3">Recent Writings</h3>
                  <div className="space-y-2">
                    {activityFeed.recentWritings.slice(0, 20).map((w) => (
                      <div key={w.id} className="flex items-center justify-between px-4 py-3 bg-foreground/[0.03] border border-foreground/[0.06] rounded cursor-pointer hover:bg-foreground/[0.05] transition-colors" onClick={() => setSelectedWriting(w.id)}>
                        <div>
                          <span className="text-foreground/80 font-serif text-sm">{w.title}</span>
                          <span className="text-foreground/30 font-serif text-xs ml-2">by {w.authorFirstName || ""} {w.authorLastName || ""}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-accent-ornament/50 font-mono text-[10px]">{w.readiness.replace(/_/g, " ")}</span>
                          <span className="text-foreground/20 font-mono text-[10px]">{timeAgo(w.updatedAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-garden-bloom/70 font-mono text-xs uppercase tracking-widest mb-3">Recent Rituals</h3>
                  <div className="space-y-2">
                    {activityFeed.recentRituals.map((r) => (
                      <div key={r.id} className="px-4 py-3 bg-foreground/[0.03] border border-foreground/[0.06] rounded">
                        <span className="text-foreground/70 font-serif text-sm">{r.userFirstName || ""} {r.userLastName || ""}</span>
                        <span className="text-foreground/30 font-serif text-xs ml-2">completed a {r.durationMinutes}min ritual</span>
                        <span className="text-foreground/20 font-mono text-[10px] ml-2">{r.completedAt ? timeAgo(r.completedAt) : ""}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-agent-lavender/70 font-mono text-xs uppercase tracking-widest mb-3">Recent Inner Weather</h3>
                  <div className="space-y-2">
                    {activityFeed.recentWeather.map((w) => (
                      <div key={w.id} className="px-4 py-3 bg-foreground/[0.03] border border-foreground/[0.06] rounded">
                        <span className="text-foreground/70 font-serif text-sm">{w.userFirstName || ""} {w.userLastName || ""}</span>
                        <span className="text-foreground/30 font-serif text-xs ml-2">mood: {w.mood} · energy: {w.energy}/10</span>
                        <span className="text-foreground/20 font-mono text-[10px] ml-2">{timeAgo(w.createdAt)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-foreground/40 font-serif text-sm">Failed to load activity feed.</p>
            )}
          </motion.div>
        )}

        {activeTab === "users" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <h2 className="font-display text-2xl text-foreground/90 font-light mb-6">All Users</h2>
            {usersLoading ? (
              <div className="space-y-3">{[1,2,3,4].map((i) => <div key={i} className="h-16 bg-foreground/5 rounded animate-pulse" />)}</div>
            ) : allUsers.length === 0 ? (
              <p className="text-foreground/40 font-serif text-sm italic">No users found.</p>
            ) : (
              <div className="space-y-2">
                {allUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between px-5 py-4 bg-foreground/[0.03] border border-foreground/[0.06] rounded">
                    <div>
                      <span className="text-foreground/90 font-display text-lg">{u.firstName || "—"} {u.lastName || ""}</span>
                      {u.email && <span className="text-foreground/40 font-serif text-xs ml-3">{u.email}</span>}
                    </div>
                    <span className={`text-xs font-mono uppercase tracking-wider ${u.role === "editor_in_chief" ? "text-accent-ornament" : u.role === "editor" ? "text-garden-bloom" : "text-foreground/30"}`}>
                      {u.role || "writer"}
                    </span>
                  </div>
                ))}
                <p className="text-foreground/30 font-serif text-xs mt-4">{allUsers.length} total users</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "enquiries" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <h2 className="font-display text-2xl text-foreground/90 font-light mb-2">Service Enquiries</h2>
            <p className="text-foreground/40 font-serif text-xs mb-6">All service enquiry submissions from the public contact form</p>
            {enquiriesLoading ? (
              <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-20 bg-foreground/5 rounded animate-pulse" />)}</div>
            ) : serviceEnquiries.length === 0 ? (
              <p className="text-foreground/40 font-serif text-sm italic">No enquiries yet.</p>
            ) : (
              <div className="space-y-3">
                {serviceEnquiries.map((enq) => (
                  <div key={enq.id} className="px-5 py-4 bg-foreground/[0.03] border border-foreground/[0.06] rounded">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-foreground/90 font-display text-lg">{enq.name}</span>
                          <span className="text-foreground/30 font-serif text-xs">{enq.email}</span>
                          <span className="px-2 py-0.5 bg-accent-ornament/10 text-accent-ornament text-[10px] font-mono rounded">{enq.serviceType}</span>
                        </div>
                        <p className="text-foreground/60 font-serif text-sm leading-relaxed">{enq.message}</p>
                      </div>
                      <span className="text-foreground/20 font-mono text-[10px] whitespace-nowrap">{new Date(enq.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                  </div>
                ))}
                <p className="text-foreground/30 font-serif text-xs mt-4">{serviceEnquiries.length} total enquiries</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "team" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <section className="mb-16">
              <h2 className="font-display text-2xl text-foreground/90 font-light mb-6">Invite an Editor</h2>
              <div className="flex gap-3">
                <input type="email" placeholder="editor@email.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="flex-1 bg-foreground/5 border border-foreground/10 rounded px-4 py-3 text-foreground font-serif text-sm placeholder:text-foreground/30 focus:outline-none focus:border-accent-ornament/40 transition-colors" onKeyDown={(e) => { if (e.key === "Enter" && inviteEmail.trim()) inviteMutation.mutate(inviteEmail.trim()); }} />
                <button onClick={() => inviteEmail.trim() && inviteMutation.mutate(inviteEmail.trim())} disabled={inviteMutation.isPending || !inviteEmail.trim()} className="px-6 py-3 bg-accent-ornament/20 border border-accent-ornament/30 text-accent-ornament font-display text-lg rounded hover:bg-accent-ornament/30 transition-colors disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ornament">
                  {inviteMutation.isPending ? "Sending..." : "Send Invitation"}
                </button>
              </div>
              {inviteMutation.isError && <p className="text-red-400/80 text-sm mt-2 font-serif">Failed to send invitation.</p>}
            </section>
            <section className="mb-16">
              <h2 className="font-display text-2xl text-foreground/90 font-light mb-6">Current Editors</h2>
              {editorsLoading ? (
                <div className="space-y-3">{[1,2].map((i) => <div key={i} className="h-16 bg-foreground/5 rounded animate-pulse" />)}</div>
              ) : editors.length === 0 ? (
                <p className="text-foreground/40 font-serif text-sm italic">No editors yet.</p>
              ) : (
                <div className="space-y-2">
                  {editors.map((editor) => (
                    <div key={editor.id} className="flex items-center justify-between px-5 py-4 bg-foreground/[0.03] border border-foreground/[0.06] rounded">
                      <div>
                        <span className="text-foreground/90 font-display text-lg">{editor.firstName || "—"} {editor.lastName || ""}</span>
                        {editor.email && <span className="text-foreground/40 font-serif text-xs ml-3">{editor.email}</span>}
                      </div>
                      <span className={`text-xs font-mono uppercase tracking-wider ${editor.role === "editor_in_chief" ? "text-accent-ornament" : "text-garden-bloom"}`}>
                        {editor.role === "editor_in_chief" ? "Editor-in-Chief" : "Editor"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
            <section>
              <h2 className="font-display text-2xl text-foreground/90 font-light mb-6">Invitations</h2>
              {invLoading ? (
                <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-20 bg-foreground/5 rounded animate-pulse" />)}</div>
              ) : invitations.length === 0 ? (
                <p className="text-foreground/40 font-serif text-sm italic">No invitations sent yet.</p>
              ) : (
                <div className="space-y-6">
                  {pendingInvitations.length > 0 && (
                    <div>
                      <h3 className="text-accent-ornament/70 font-mono text-xs uppercase tracking-widest mb-3">Pending</h3>
                      <div className="space-y-2">{pendingInvitations.map((inv) => <InvitationCard key={inv.id} invitation={inv} onCopy={copyLink} copiedToken={copiedToken} getLink={getInvitationLink} />)}</div>
                    </div>
                  )}
                  {acceptedInvitations.length > 0 && (
                    <div>
                      <h3 className="text-garden-bloom/70 font-mono text-xs uppercase tracking-widest mb-3">Accepted</h3>
                      <div className="space-y-2">{acceptedInvitations.map((inv) => <InvitationCard key={inv.id} invitation={inv} onCopy={copyLink} copiedToken={copiedToken} getLink={getInvitationLink} />)}</div>
                    </div>
                  )}
                  {expiredInvitations.length > 0 && (
                    <div>
                      <h3 className="text-foreground/30 font-mono text-xs uppercase tracking-widest mb-3">Expired</h3>
                      <div className="space-y-2">{expiredInvitations.map((inv) => <InvitationCard key={inv.id} invitation={inv} onCopy={copyLink} copiedToken={copiedToken} getLink={getInvitationLink} />)}</div>
                    </div>
                  )}
                </div>
              )}
            </section>
          </motion.div>
        )}

        {activeTab === "silent-agents" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <h2 className="font-display text-2xl text-foreground/90 font-light mb-2">Silent AI Agents</h2>
            <p className="text-foreground/40 font-serif text-xs mb-8">Live activity across all autonomous background agents — click any agent to open a chat</p>

            {/* Agent card grid with status indicators and chat trigger */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10">
              {AGENTS.map((agent) => {
                const agentNotifCount = agentNotifs.filter((n) => n.agentName === agent.key || n.agentName === agent.label.toLowerCase().replace(/ /g, "_")).length;
                const lastNotif = agentNotifs.find((n) => n.agentName === agent.key || n.agentName === agent.label.toLowerCase().replace(/ /g, "_"));
                const isActive = isSending && selectedAgent === agent.key;
                return (
                  <button
                    key={agent.key}
                    onClick={() => { setSelectedAgent(agent.key); setChatSheetOpen(true); }}
                    className="group relative flex flex-col gap-2 p-5 bg-foreground/[0.03] border border-foreground/[0.06] rounded-lg text-left hover:bg-foreground/[0.06] hover:border-foreground/[0.12] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ornament"
                    aria-label={`Chat with ${agent.label} agent`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl" style={{ color: agent.colour }}>{agent.emoji}</span>
                      <span className="font-display text-base text-foreground/90">{agent.label}</span>
                      {/* State indicator */}
                      <span className="ml-auto">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent-ornament/10 text-accent-ornament font-mono text-[9px] uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-ornament animate-pulse" />
                            Thinking
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-foreground/[0.04] text-foreground/30 font-mono text-[9px] uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-foreground/20" />
                            Idle
                          </span>
                        )}
                      </span>
                    </div>
                    <p className="font-serif text-xs text-foreground/40 leading-snug">{agent.description}</p>
                    {lastNotif && (
                      <p className="font-mono text-[10px] text-foreground/25 italic truncate">{lastNotif.message}</p>
                    )}
                    {agentNotifCount > 0 && (
                      <span className="absolute top-3 right-3 flex items-center justify-center w-5 h-5 rounded-full bg-accent-ornament/20 text-accent-ornament font-mono text-[9px]">{agentNotifCount}</span>
                    )}
                  </button>
                );
              })}
              {/* Collaborative mode card */}
              <button
                onClick={() => { setSelectedAgent("collaborative"); setChatSheetOpen(true); }}
                className="flex flex-col gap-2 p-5 bg-foreground/[0.03] border border-foreground/[0.06] rounded-lg text-left hover:bg-foreground/[0.06] hover:border-foreground/[0.12] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ornament"
                aria-label="Open collaborative chat with all agents"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl text-accent-ornament">✦✿◈</span>
                  <span className="font-display text-base text-foreground/90">Collaborative</span>
                </div>
                <p className="font-serif text-xs text-foreground/40 leading-snug">Fan out to all six agents simultaneously and see every perspective at once</p>
              </button>
            </div>

            {/* Agent chat Sheet */}
            <Sheet open={chatSheetOpen} onOpenChange={setChatSheetOpen}>
              <SheetContent side="right" className="w-full sm:max-w-lg bg-background border-foreground/10 flex flex-col p-0">
                <SheetHeader className="px-6 pt-6 pb-4 border-b border-foreground/[0.06]">
                  <SheetTitle className="font-display text-foreground/90 font-light flex items-center gap-3">
                    {selectedAgent === "collaborative" ? (
                      <><span className="text-accent-ornament">✦✿◈</span> Collaborative Chat</>
                    ) : (
                      <>
                        <span style={{ color: AGENTS.find(a => a.key === selectedAgent)?.colour }}>{AGENTS.find(a => a.key === selectedAgent)?.emoji}</span>
                        {AGENTS.find(a => a.key === selectedAgent)?.label} Agent
                      </>
                    )}
                  </SheetTitle>
                  <div className="flex items-center gap-2 mt-1">
                    {AGENTS.map((a) => (
                      <button
                        key={a.key}
                        onClick={() => setSelectedAgent(a.key)}
                        className={`px-2 py-1 font-mono text-[9px] uppercase tracking-widest rounded transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-ornament ${selectedAgent === a.key ? "bg-accent-ornament/15 text-accent-ornament" : "text-foreground/30 hover:text-foreground/60"}`}
                        title={a.label}
                      >
                        {a.emoji}
                      </button>
                    ))}
                    <button
                      onClick={() => setSelectedAgent("collaborative")}
                      className={`px-2 py-1 font-mono text-[9px] uppercase tracking-widest rounded transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-ornament ${selectedAgent === "collaborative" ? "bg-accent-ornament/15 text-accent-ornament" : "text-foreground/30 hover:text-foreground/60"}`}
                      title="All agents"
                    >
                      All
                    </button>
                    {chatMessages.length > 0 && (
                      <button
                        onClick={() => setChatMessages([])}
                        className="ml-auto p-1.5 rounded text-foreground/30 hover:text-foreground/60 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-ornament"
                        aria-label="Clear chat history"
                        title="Clear history"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </SheetHeader>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0">
                  {chatMessages.length === 0 && (
                    <p className="text-foreground/25 font-serif text-sm italic text-center py-12">
                      Ask the {selectedAgent === "collaborative" ? "agents" : (AGENTS.find(a => a.key === selectedAgent)?.label ?? selectedAgent)} agent anything about the journal…
                    </p>
                  )}
                  {chatMessages
                    .filter((m) => selectedAgent === "collaborative" ? true : m.agentType === selectedAgent || m.role === "user")
                    .map((msg, i) => (
                      <div key={i} className={`flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                        {msg.role === "assistant" && msg.agentLabel && (
                          <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: msg.agentColour }}>{msg.agentLabel}</span>
                        )}
                        <div className={`max-w-[85%] px-4 py-3 rounded-xl text-sm font-serif leading-relaxed ${msg.role === "user" ? "bg-accent-ornament/15 text-foreground/90" : "bg-foreground/[0.05] text-foreground/80"}`}>
                          {msg.content}
                        </div>
                        <span className="font-mono text-[9px] text-foreground/20">{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    ))}
                  {isSending && (
                    <div className="flex items-center gap-2 text-foreground/30 font-mono text-xs">
                      <span className="inline-flex gap-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-ornament/50 animate-bounce [animation-delay:0ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-ornament/50 animate-bounce [animation-delay:150ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-ornament/50 animate-bounce [animation-delay:300ms]" />
                      </span>
                      Thinking…
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <div className="px-6 pb-6 pt-4 border-t border-foreground/[0.06]">
                  <div className="flex gap-2 items-end">
                    <textarea
                      ref={inputRef}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                      placeholder="Ask the agent…"
                      rows={2}
                      className="flex-1 bg-foreground/5 border border-foreground/10 rounded-lg px-4 py-3 text-foreground font-serif text-sm placeholder:text-foreground/25 focus:outline-none focus:border-accent-ornament/40 resize-none transition-colors"
                      aria-label="Agent chat input"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!chatInput.trim() || isSending}
                      className="px-4 py-3 bg-accent-ornament/20 border border-accent-ornament/30 text-accent-ornament rounded-lg hover:bg-accent-ornament/30 transition-colors disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ornament"
                      aria-label="Send message"
                    >
                      <Send size={15} />
                    </button>
                  </div>
                  <p className="font-mono text-[9px] text-foreground/20 mt-2">Enter to send · Shift+Enter for newline</p>
                </div>
              </SheetContent>
            </Sheet>

            {/* Summary stats */}
            {agentSummaryLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
                {[1,2,3,4,5].map((i) => <div key={i} className="h-20 bg-foreground/5 rounded animate-pulse" />)}
              </div>
            ) : agentSummary ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
                {Object.entries(agentSummary.totals).map(([key, val]) => (
                  <div key={key} className="px-4 py-3 bg-foreground/[0.03] border border-foreground/[0.06] rounded">
                    <div className="text-accent-ornament font-mono text-2xl">{String(val)}</div>
                    <div className="text-foreground/40 font-serif text-xs mt-1">{key.replace(/([A-Z])/g, " $1").toLowerCase()}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-foreground/40 font-serif text-sm mb-8">Failed to load agent summary. Check that the backend is running and your role is correct.</p>
            )}
            {agentSummary?.breakdowns?.notifsByAgent && agentSummary.breakdowns.notifsByAgent.length > 0 && (
              <div className="mb-10">
                <h3 className="text-accent-ornament/70 font-mono text-xs uppercase tracking-widest mb-3">Activity by Agent</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {agentSummary.breakdowns.notifsByAgent.map((a) => (
                    <div key={a.agentName} className="px-4 py-3 bg-foreground/[0.03] border border-foreground/[0.06] rounded">
                      <div className="text-garden-bloom font-mono text-lg">{a.total}</div>
                      <div className="text-foreground/40 font-serif text-xs mt-1">{a.agentName.replace(/_/g, " ")}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <h3 className="text-garden-bloom/70 font-mono text-xs uppercase tracking-widest mb-3">Recent Agent Activity</h3>
              {agentNotifsLoading ? (
                <div className="space-y-2">{[1,2,3].map((i) => <div key={i} className="h-14 bg-foreground/5 rounded animate-pulse" />)}</div>
              ) : agentNotifs.length === 0 ? (
                <p className="text-foreground/30 font-serif text-sm italic">No agent activity yet — agents will surface here as they run.</p>
              ) : (
                <div className="space-y-2">
                  {agentNotifs.slice(0, 30).map((n) => (
                    <div key={n.id} className="px-4 py-3 bg-foreground/[0.03] border border-foreground/[0.06] rounded flex items-start justify-between gap-4">
                      <div>
                        <span className="text-accent-ornament/70 font-mono text-[10px] uppercase tracking-wider">{n.agentName.replace(/_/g, " ")}</span>
                        <p className="text-foreground/70 font-serif text-sm mt-1 leading-snug">{n.message}</p>
                      </div>
                      <span className="text-foreground/20 font-mono text-[10px] whitespace-nowrap">{timeAgo(n.createdAt)}</span>
                    </div>
                  ))}
                  <p className="text-foreground/20 font-serif text-xs mt-3">{agentNotifs.length} total agent events</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      {activeTab === "open-calls" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <OpenCallsPanel isEIC={roleData?.role === "editor_in_chief"} />
        </motion.div>
      )}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="px-5 py-4 bg-foreground/[0.03] border border-foreground/[0.06] rounded">
      <div className={`font-mono text-2xl ${accent ? "text-accent-ornament" : "text-foreground/80"}`}>{value}</div>
      <div className="text-foreground/40 font-serif text-xs mt-1">{label}</div>
    </div>
  );
}

function WritingsTable({ writings, loading, onPreview, timeAgo }: { writings: EICWriting[]; loading: boolean; onPreview: (id: string) => void; timeAgo: (d: string) => string }) {
  if (loading) return <div className="space-y-3">{[1,2,3,4,5].map((i) => <div key={i} className="h-16 bg-foreground/5 rounded animate-pulse" />)}</div>;
  if (writings.length === 0) return <p className="text-foreground/40 font-serif text-sm italic">No writings found.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-foreground/10">
            <th className="pb-3 text-foreground/50 font-mono text-xs uppercase tracking-wider">Title</th>
            <th className="pb-3 text-foreground/50 font-mono text-xs uppercase tracking-wider">Author</th>
            <th className="pb-3 text-foreground/50 font-mono text-xs uppercase tracking-wider">Genre</th>
            <th className="pb-3 text-foreground/50 font-mono text-xs uppercase tracking-wider">Readiness</th>
            <th className="pb-3 text-foreground/50 font-mono text-xs uppercase tracking-wider">Status</th>
            <th className="pb-3 text-foreground/50 font-mono text-xs uppercase tracking-wider">Updated</th>
          </tr>
        </thead>
        <tbody>
          {writings.map((w) => (
            <tr key={w.id} className="border-b border-foreground/[0.04] hover:bg-foreground/[0.02] transition-colors cursor-pointer" onClick={() => onPreview(w.id)}>
              <td className="py-3 pr-4 text-foreground/80 font-serif text-sm max-w-[200px] truncate">{w.title}</td>
              <td className="py-3 pr-4">
                <div className="text-foreground/60 font-serif text-sm">{w.authorFirstName || ""} {w.authorLastName || ""}</div>
                <div className="text-foreground/20 font-mono text-[10px]">{w.authorEmail}</div>
              </td>
              <td className="py-3 pr-4 text-foreground/50 font-mono text-xs">{w.genre}</td>
              <td className="py-3 pr-4 text-accent-ornament/70 font-mono text-xs">{w.readiness.replace(/_/g, " ")}</td>
              <td className="py-3">
                <div className="flex gap-1 flex-wrap">
                  {w.isPublished && <span className="px-2 py-0.5 bg-garden-bloom/10 text-garden-bloom text-[10px] font-mono rounded">published</span>}
                  {w.editorialAvailable && <span className="px-2 py-0.5 bg-accent-ornament/10 text-accent-ornament text-[10px] font-mono rounded">editorial</span>}
                  {w.galleryOptIn && <span className="px-2 py-0.5 bg-foreground/5 text-foreground/40 text-[10px] font-mono rounded">gallery</span>}
                  {!w.isPublished && !w.editorialAvailable && <span className="px-2 py-0.5 bg-foreground/5 text-foreground/20 text-[10px] font-mono rounded">private</span>}
                </div>
              </td>
              <td className="py-3 text-foreground/30 font-mono text-xs">{timeAgo(w.updatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-foreground/30 font-serif text-xs mt-4">{writings.length} total writings</p>
    </div>
  );
}

function InvitationCard({ invitation, onCopy, copiedToken, getLink }: { invitation: EditorInvitation; onCopy: (token: string) => void; copiedToken: string | null; getLink: (token: string) => string }) {
  const isExpired = invitation.status === "pending" && new Date(invitation.expiresAt) <= new Date();
  const isAccepted = invitation.status === "accepted";
  const isPending = invitation.status === "pending" && !isExpired;
  return (
    <div className={`px-5 py-4 rounded border transition-colors ${isAccepted ? "bg-garden-bloom/[0.05] border-garden-bloom/10" : isPending ? "bg-accent-ornament/[0.04] border-accent-ornament/10" : "bg-foreground/[0.02] border-foreground/[0.04] opacity-60"}`}>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-foreground/80 font-serif text-sm">{invitation.email}</span>
          <span className="text-foreground/30 font-serif text-xs ml-3">{new Date(invitation.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
        </div>
        <div className="flex items-center gap-3">
          {isAccepted && invitation.acceptedAt && <span className="text-garden-bloom/60 font-serif text-xs">Accepted {new Date(invitation.acceptedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}
          {isPending && <button onClick={() => onCopy(invitation.token)} className="px-3 py-1.5 bg-foreground/5 border border-foreground/10 text-foreground/60 font-mono text-xs rounded hover:bg-foreground/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ornament">{copiedToken === invitation.token ? "Copied!" : "Copy Link"}</button>}
          {isExpired && <span className="text-foreground/30 font-mono text-xs">Expired</span>}
        </div>
      </div>
      {isPending && <div className="mt-2"><code className="text-foreground/20 font-mono text-[10px] break-all select-all">{getLink(invitation.token)}</code></div>}
    </div>
  );
}

function OpenCallsPanel({ isEIC }: { isEIC: boolean }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [selectedCall, setSelectedCall] = useState<string | null>(null);

  const { data: openCalls = [], isLoading } = useQuery<Array<{id: string; title: string; description: string; deadline: string; createdAt: string}>>({ queryKey: ["/api/open-calls"], queryFn: async () => { const res = await fetch("/api/open-calls", { credentials: "include" }); if (!res.ok) throw new Error("Failed to fetch open calls"); return res.json(); } });

  const { data: submissions = [] } = useQuery<Array<{id: string; callId: string; respondentName: string; respondentEmail: string; content: string; status: string; createdAt: string}>>({ queryKey: ["/api/open-calls/submissions"], queryFn: async () => { const res = await fetch("/api/open-calls/submissions", { credentials: "include" }); if (!res.ok) throw new Error("Failed to fetch submissions"); return res.json(); }, enabled: !!selectedCall });

  const createMutation = useMutation({ mutationFn: async (data: { title: string; description: string; deadline: string }) => { const res = await fetch("/api/open-calls", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(data) }); if (!res.ok) throw new Error("Failed to create call"); return res.json(); }, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/open-calls"] }); setTitle(""); setDescription(""); setDeadline(""); } });

  const reviewMutation = useMutation({ mutationFn: async ({ submissionId, status }: { submissionId: string; status: string }) => { const res = await fetch(`/api/open-calls/submissions/${submissionId}/review`, { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ status }) }); if (!res.ok) throw new Error("Failed to review"); return res.json(); }, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/open-calls/submissions"] }); } });

  return (
    <div>
      <h2 className="font-display text-2xl text-foreground/90 font-light mb-2">Open Calls for Submissions</h2>
      <p className="text-foreground/40 font-serif text-xs mb-8">{isEIC ? "Create and manage open calls for submissions from writers and the public" : "View open calls and review submissions"}</p>
      
      {isEIC && (
        <div className="mb-8 p-6 bg-foreground/[0.03] border border-foreground/[0.06] rounded">
          <h3 className="font-display text-xl text-foreground/80 font-light mb-4">Create New Call</h3>
          <div className="space-y-3">
            <input type="text" placeholder="Call Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-foreground/5 border border-foreground/10 rounded px-4 py-3 text-foreground font-serif text-sm placeholder:text-foreground/30 focus:outline-none focus:border-accent-ornament/40 transition-colors" />
            <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full bg-foreground/5 border border-foreground/10 rounded px-4 py-3 text-foreground font-serif text-sm placeholder:text-foreground/30 focus:outline-none focus:border-accent-ornament/40 transition-colors" />
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full bg-foreground/5 border border-foreground/10 rounded px-4 py-3 text-foreground font-serif text-sm placeholder:text-foreground/30 focus:outline-none focus:border-accent-ornament/40 transition-colors" />
            <button onClick={() => title.trim() && description.trim() && deadline && createMutation.mutate({ title, description, deadline })} disabled={createMutation.isPending || !title.trim() || !description.trim() || !deadline} className="px-6 py-3 bg-accent-ornament/20 border border-accent-ornament/30 text-accent-ornament font-display text-lg rounded hover:bg-accent-ornament/30 transition-colors disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ornament">{createMutation.isPending ? "Creating..." : "Create Call"}</button>
          </div>
        </div>
      )}
      
      <div>
        <h3 className="font-display text-xl text-foreground/80 font-light mb-4">Active Calls</h3>
        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-20 bg-foreground/5 rounded animate-pulse" />)}</div>
        ) : openCalls.length === 0 ? (
          <p className="text-foreground/40 font-serif text-sm italic">No open calls yet.</p>
        ) : (
          <div className="space-y-3">
            {openCalls.map((call) => (
              <div key={call.id} className="px-5 py-4 bg-foreground/[0.03] border border-foreground/[0.06] rounded cursor-pointer hover:bg-foreground/[0.05] transition-colors" onClick={() => setSelectedCall(call.id)}>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-display text-lg text-foreground/90">{call.title}</h4>
                    <p className="text-foreground/60 font-serif text-sm mt-1">{call.description}</p>
                    <span className="text-accent-ornament/70 font-mono text-xs mt-2 inline-block">Deadline: {new Date(call.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {selectedCall && submissions.length > 0 && (
        <div className="mt-8">
          <h3 className="font-display text-xl text-foreground/80 font-light mb-4">Submissions</h3>
          <div className="space-y-3">
            {submissions.filter((s) => s.callId === selectedCall).map((sub) => (
              <div key={sub.id} className="px-5 py-4 bg-foreground/[0.03] border border-foreground/[0.06] rounded">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-foreground/90 font-display text-lg">{sub.respondentName}</span>
                      <span className="text-foreground/30 font-serif text-xs">{sub.respondentEmail}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-mono rounded ${sub.status === "approved" ? "bg-garden-bloom/10 text-garden-bloom" : sub.status === "rejected" ? "bg-red-400/10 text-red-400" : "bg-foreground/5 text-foreground/40"}`}>{sub.status}</span>
                    </div>
                    <p className="text-foreground/60 font-serif text-sm">{sub.content}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button onClick={() => reviewMutation.mutate({ submissionId: sub.id, status: "approved" })} disabled={reviewMutation.isPending} className="px-3 py-1.5 bg-garden-bloom/10 border border-garden-bloom/20 text-garden-bloom font-mono text-xs rounded hover:bg-garden-bloom/20 transition-colors disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-garden-bloom">Approve</button>
                    <button onClick={() => reviewMutation.mutate({ submissionId: sub.id, status: "rejected" })} disabled={reviewMutation.isPending} className="px-3 py-1.5 bg-red-400/10 border border-red-400/20 text-red-400 font-mono text-xs rounded hover:bg-red-400/20 transition-colors disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400">Reject</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
