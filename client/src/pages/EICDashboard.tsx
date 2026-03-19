import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

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

type Tab = "overview" | "writings" | "users" | "team";

export default function EICDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState("");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

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
      return res.json();
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

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-[#0d1e2d] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#c4a24d]/40 border-t-[#c4a24d] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0d1e2d] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-[#f0eeea]/60 font-['Lora',serif] text-lg">Please sign in to continue.</p>
          <button onClick={() => navigate("/sign-in")} className="inline-block px-6 py-3 bg-[#c4a24d]/20 border border-[#c4a24d]/30 text-[#c4a24d] font-['Cormorant_Garamond',serif] text-lg rounded hover:bg-[#c4a24d]/30 transition-colors" data-testid="link-login">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (roleData?.role !== "editor_in_chief") {
    return (
      <div className="min-h-screen bg-[#0d1e2d] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-[#f0eeea]/60 font-['Lora',serif] text-lg">You do not have access to this page.</p>
          <button onClick={() => navigate("/")} className="px-6 py-3 bg-[#c4a24d]/20 border border-[#c4a24d]/30 text-[#c4a24d] font-['Cormorant_Garamond',serif] text-lg rounded hover:bg-[#c4a24d]/30 transition-colors" data-testid="button-go-home">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const getInvitationLink = (token: string) => {
    return `${window.location.origin}/editor-onboarding?token=${token}`;
  };

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
    { key: "users", label: "All Users" },
    { key: "team", label: "Editorial Team" },
  ];

  return (
    <div className="min-h-screen bg-[#0d1e2d]">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }}>
          <button onClick={() => navigate("/")} className="text-[#f0eeea]/40 hover:text-[#f0eeea]/70 font-['Lora',serif] text-sm mb-8 block transition-colors" data-testid="link-back-home">
            ← Back to Home
          </button>
          <h1 className="font-['Cormorant_Garamond',serif] text-4xl md:text-5xl text-[#f0eeea] font-light tracking-wide mb-2" data-testid="text-eic-title">
            Editor-in-Chief Dashboard
          </h1>
          <p className="text-[#f0eeea]/50 font-['Lora',serif] text-sm mb-8">
            Comprehensive overview of The Page Gallery Journal
          </p>

          {/* Tab Navigation */}
          <div className="flex gap-1 mb-12 border-b border-[#f0eeea]/10 pb-px">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-3 font-['Cormorant_Garamond',serif] text-lg transition-colors border-b-2 -mb-px ${
                  activeTab === tab.key
                    ? "border-[#c4a24d] text-[#c4a24d]"
                    : "border-transparent text-[#f0eeea]/40 hover:text-[#f0eeea]/70"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            {statsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                {[1,2,3,4].map((i) => <div key={i} className="h-24 bg-[#f0eeea]/5 rounded animate-pulse" />)}
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
                    <h3 className="font-['Cormorant_Garamond',serif] text-xl text-[#f0eeea]/80 font-light mb-4">Readiness Breakdown</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(stats.readinessBreakdown).map(([key, val]) => (
                        <div key={key} className="px-4 py-3 bg-[#f0eeea]/[0.03] border border-[#f0eeea]/[0.06] rounded">
                          <div className="text-[#c4a24d] font-['Space_Mono',monospace] text-lg">{val}</div>
                          <div className="text-[#f0eeea]/40 font-['Lora',serif] text-xs mt-1">{key.replace(/_/g, " ")}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {stats.genreBreakdown && Object.keys(stats.genreBreakdown).length > 0 && (
                  <div className="mb-12">
                    <h3 className="font-['Cormorant_Garamond',serif] text-xl text-[#f0eeea]/80 font-light mb-4">Genre Breakdown</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(stats.genreBreakdown).map(([key, val]) => (
                        <div key={key} className="px-4 py-3 bg-[#f0eeea]/[0.03] border border-[#f0eeea]/[0.06] rounded">
                          <div className="text-[#5eb5a0] font-['Space_Mono',monospace] text-lg">{val}</div>
                          <div className="text-[#f0eeea]/40 font-['Lora',serif] text-xs mt-1">{key}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-[#f0eeea]/40 font-['Lora',serif] text-sm">Failed to load dashboard stats.</p>
            )}
          </motion.div>
        )}

        {/* Writings Tab */}
        {activeTab === "writings" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <h2 className="font-['Cormorant_Garamond',serif] text-2xl text-[#f0eeea]/90 font-light mb-6">All Writings</h2>
            {writingsLoading ? (
              <div className="space-y-3">{[1,2,3,4,5].map((i) => <div key={i} className="h-16 bg-[#f0eeea]/5 rounded animate-pulse" />)}</div>
            ) : allWritings.length === 0 ? (
              <p className="text-[#f0eeea]/40 font-['Lora',serif] text-sm italic">No writings found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#f0eeea]/10">
                      <th className="pb-3 text-[#f0eeea]/50 font-['Space_Mono',monospace] text-xs uppercase tracking-wider">Title</th>
                      <th className="pb-3 text-[#f0eeea]/50 font-['Space_Mono',monospace] text-xs uppercase tracking-wider">Author</th>
                      <th className="pb-3 text-[#f0eeea]/50 font-['Space_Mono',monospace] text-xs uppercase tracking-wider">Genre</th>
                      <th className="pb-3 text-[#f0eeea]/50 font-['Space_Mono',monospace] text-xs uppercase tracking-wider">Readiness</th>
                      <th className="pb-3 text-[#f0eeea]/50 font-['Space_Mono',monospace] text-xs uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allWritings.map((w) => (
                      <tr key={w.id} className="border-b border-[#f0eeea]/[0.04] hover:bg-[#f0eeea]/[0.02] transition-colors">
                        <td className="py-3 pr-4 text-[#f0eeea]/80 font-['Lora',serif] text-sm max-w-[200px] truncate">{w.title}</td>
                        <td className="py-3 pr-4 text-[#f0eeea]/60 font-['Lora',serif] text-sm">{w.authorFirstName || ""} {w.authorLastName || ""}</td>
                        <td className="py-3 pr-4 text-[#f0eeea]/50 font-['Space_Mono',monospace] text-xs">{w.genre}</td>
                        <td className="py-3 pr-4 text-[#c4a24d]/70 font-['Space_Mono',monospace] text-xs">{w.readiness.replace(/_/g, " ")}</td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            {w.isPublished && <span className="px-2 py-0.5 bg-[#5eb5a0]/10 text-[#5eb5a0] text-[10px] font-['Space_Mono',monospace] rounded">published</span>}
                            {w.editorialAvailable && <span className="px-2 py-0.5 bg-[#c4a24d]/10 text-[#c4a24d] text-[10px] font-['Space_Mono',monospace] rounded">editorial</span>}
                            {w.galleryOptIn && <span className="px-2 py-0.5 bg-[#f0eeea]/5 text-[#f0eeea]/40 text-[10px] font-['Space_Mono',monospace] rounded">gallery</span>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-[#f0eeea]/30 font-['Lora',serif] text-xs mt-4">{allWritings.length} total writings</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <h2 className="font-['Cormorant_Garamond',serif] text-2xl text-[#f0eeea]/90 font-light mb-6">All Users</h2>
            {usersLoading ? (
              <div className="space-y-3">{[1,2,3,4].map((i) => <div key={i} className="h-16 bg-[#f0eeea]/5 rounded animate-pulse" />)}</div>
            ) : allUsers.length === 0 ? (
              <p className="text-[#f0eeea]/40 font-['Lora',serif] text-sm italic">No users found.</p>
            ) : (
              <div className="space-y-2">
                {allUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between px-5 py-4 bg-[#f0eeea]/[0.03] border border-[#f0eeea]/[0.06] rounded">
                    <div>
                      <span className="text-[#f0eeea]/90 font-['Cormorant_Garamond',serif] text-lg">
                        {u.firstName || "—"} {u.lastName || ""}
                      </span>
                      {u.email && <span className="text-[#f0eeea]/40 font-['Lora',serif] text-xs ml-3">{u.email}</span>}
                    </div>
                    <span className={`text-xs font-['Space_Mono',monospace] uppercase tracking-wider ${
                      u.role === "editor_in_chief" ? "text-[#c4a24d]" :
                      u.role === "editor" ? "text-[#5eb5a0]" :
                      "text-[#f0eeea]/30"
                    }`}>
                      {u.role || "writer"}
                    </span>
                  </div>
                ))}
                <p className="text-[#f0eeea]/30 font-['Lora',serif] text-xs mt-4">{allUsers.length} total users</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Team Tab */}
        {activeTab === "team" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <section className="mb-16">
              <h2 className="font-['Cormorant_Garamond',serif] text-2xl text-[#f0eeea]/90 font-light mb-6">Invite an Editor</h2>
              <div className="flex gap-3">
                <input
                  type="email"
                  placeholder="editor@email.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1 bg-[#f0eeea]/5 border border-[#f0eeea]/10 rounded px-4 py-3 text-[#f0eeea] font-['Lora',serif] text-sm placeholder:text-[#f0eeea]/30 focus:outline-none focus:border-[#c4a24d]/40 transition-colors"
                  data-testid="input-invite-email"
                  onKeyDown={(e) => { if (e.key === "Enter" && inviteEmail.trim()) inviteMutation.mutate(inviteEmail.trim()); }}
                />
                <button
                  onClick={() => inviteEmail.trim() && inviteMutation.mutate(inviteEmail.trim())}
                  disabled={inviteMutation.isPending || !inviteEmail.trim()}
                  className="px-6 py-3 bg-[#c4a24d]/20 border border-[#c4a24d]/30 text-[#c4a24d] font-['Cormorant_Garamond',serif] text-lg rounded hover:bg-[#c4a24d]/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  data-testid="button-send-invitation"
                >
                  {inviteMutation.isPending ? "Sending..." : "Send Invitation"}
                </button>
              </div>
              {inviteMutation.isError && <p className="text-red-400/80 text-sm mt-2 font-['Lora',serif]">Failed to send invitation.</p>}
            </section>

            <section className="mb-16">
              <h2 className="font-['Cormorant_Garamond',serif] text-2xl text-[#f0eeea]/90 font-light mb-6">Current Editors</h2>
              {editorsLoading ? (
                <div className="space-y-3">{[1,2].map((i) => <div key={i} className="h-16 bg-[#f0eeea]/5 rounded animate-pulse" />)}</div>
              ) : editors.length === 0 ? (
                <p className="text-[#f0eeea]/40 font-['Lora',serif] text-sm italic">No editors yet.</p>
              ) : (
                <div className="space-y-2">
                  {editors.map((editor) => (
                    <div key={editor.id} className="flex items-center justify-between px-5 py-4 bg-[#f0eeea]/[0.03] border border-[#f0eeea]/[0.06] rounded" data-testid={`editor-row-${editor.id}`}>
                      <div>
                        <span className="text-[#f0eeea]/90 font-['Cormorant_Garamond',serif] text-lg">{editor.firstName || "—"} {editor.lastName || ""}</span>
                        {editor.email && <span className="text-[#f0eeea]/40 font-['Lora',serif] text-xs ml-3">{editor.email}</span>}
                      </div>
                      <span className={`text-xs font-['Space_Mono',monospace] uppercase tracking-wider ${editor.role === "editor_in_chief" ? "text-[#c4a24d]" : "text-[#5eb5a0]"}`}>
                        {editor.role === "editor_in_chief" ? "Editor-in-Chief" : "Editor"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="font-['Cormorant_Garamond',serif] text-2xl text-[#f0eeea]/90 font-light mb-6">Invitations</h2>
              {invLoading ? (
                <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-20 bg-[#f0eeea]/5 rounded animate-pulse" />)}</div>
              ) : invitations.length === 0 ? (
                <p className="text-[#f0eeea]/40 font-['Lora',serif] text-sm italic">No invitations sent yet.</p>
              ) : (
                <div className="space-y-6">
                  {pendingInvitations.length > 0 && (
                    <div>
                      <h3 className="text-[#c4a24d]/70 font-['Space_Mono',monospace] text-xs uppercase tracking-widest mb-3">Pending</h3>
                      <div className="space-y-2">{pendingInvitations.map((inv) => <InvitationCard key={inv.id} invitation={inv} onCopy={copyLink} copiedToken={copiedToken} getLink={getInvitationLink} />)}</div>
                    </div>
                  )}
                  {acceptedInvitations.length > 0 && (
                    <div>
                      <h3 className="text-[#5eb5a0]/70 font-['Space_Mono',monospace] text-xs uppercase tracking-widest mb-3">Accepted</h3>
                      <div className="space-y-2">{acceptedInvitations.map((inv) => <InvitationCard key={inv.id} invitation={inv} onCopy={copyLink} copiedToken={copiedToken} getLink={getInvitationLink} />)}</div>
                    </div>
                  )}
                  {expiredInvitations.length > 0 && (
                    <div>
                      <h3 className="text-[#f0eeea]/30 font-['Space_Mono',monospace] text-xs uppercase tracking-widest mb-3">Expired</h3>
                      <div className="space-y-2">{expiredInvitations.map((inv) => <InvitationCard key={inv.id} invitation={inv} onCopy={copyLink} copiedToken={copiedToken} getLink={getInvitationLink} />)}</div>
                    </div>
                  )}
                </div>
              )}
            </section>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="px-5 py-4 bg-[#f0eeea]/[0.03] border border-[#f0eeea]/[0.06] rounded">
      <div className={`font-['Space_Mono',monospace] text-2xl ${accent ? "text-[#c4a24d]" : "text-[#f0eeea]/80"}`}>{value}</div>
      <div className="text-[#f0eeea]/40 font-['Lora',serif] text-xs mt-1">{label}</div>
    </div>
  );
}

function InvitationCard({
  invitation,
  onCopy,
  copiedToken,
  getLink,
}: {
  invitation: EditorInvitation;
  onCopy: (token: string) => void;
  copiedToken: string | null;
  getLink: (token: string) => string;
}) {
  const isExpired = invitation.status === "pending" && new Date(invitation.expiresAt) <= new Date();
  const isAccepted = invitation.status === "accepted";
  const isPending = invitation.status === "pending" && !isExpired;

  return (
    <div className={`px-5 py-4 rounded border transition-colors ${
      isAccepted ? "bg-[#5eb5a0]/[0.05] border-[#5eb5a0]/10" :
      isPending ? "bg-[#c4a24d]/[0.04] border-[#c4a24d]/10" :
      "bg-[#f0eeea]/[0.02] border-[#f0eeea]/[0.04] opacity-60"
    }`} data-testid={`invitation-card-${invitation.id}`}>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[#f0eeea]/80 font-['Lora',serif] text-sm">{invitation.email}</span>
          <span className="text-[#f0eeea]/30 font-['Lora',serif] text-xs ml-3">
            {new Date(invitation.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {isAccepted && invitation.acceptedAt && (
            <span className="text-[#5eb5a0]/60 font-['Lora',serif] text-xs">
              Accepted {new Date(invitation.acceptedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          )}
          {isPending && (
            <button
              onClick={() => onCopy(invitation.token)}
              className="px-3 py-1.5 bg-[#f0eeea]/5 border border-[#f0eeea]/10 text-[#f0eeea]/60 font-['Space_Mono',monospace] text-xs rounded hover:bg-[#f0eeea]/10 transition-colors"
              data-testid={`button-copy-link-${invitation.id}`}
            >
              {copiedToken === invitation.token ? "Copied!" : "Copy Link"}
            </button>
          )}
          {isExpired && <span className="text-[#f0eeea]/30 font-['Space_Mono',monospace] text-xs">Expired</span>}
        </div>
      </div>
      {isPending && (
        <div className="mt-2">
          <code className="text-[#f0eeea]/20 font-['Space_Mono',monospace] text-[10px] break-all select-all">{getLink(invitation.token)}</code>
        </div>
      )}
    </div>
  );
}
