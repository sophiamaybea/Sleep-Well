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

export default function EICDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState("");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const { data: roleData, isLoading: roleLoading } = useQuery<{ role: string; tier: string }>({
    queryKey: ["/api/user/role"],
    queryFn: async () => {
      const res = await fetch("/api/user/role", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch role");
      return res.json();
    },
    enabled: !!user,
  });

  const { data: invitations = [], isLoading: invLoading } = useQuery<EditorInvitation[]>({
    queryKey: ["/api/eic/invitations"],
    queryFn: async () => {
      const res = await fetch("/api/eic/invitations", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch invitations");
      return res.json();
    },
    enabled: roleData?.role === "editor_in_chief",
  });

  const { data: editors = [], isLoading: editorsLoading } = useQuery<EditorUser[]>({
    queryKey: ["/api/eic/editors"],
    queryFn: async () => {
      const res = await fetch("/api/eic/editors", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch editors");
      return res.json();
    },
    enabled: roleData?.role === "editor_in_chief",
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
          <a href="/api/login" className="inline-block px-6 py-3 bg-[#c4a24d]/20 border border-[#c4a24d]/30 text-[#c4a24d] font-['Cormorant_Garamond',serif] text-lg rounded hover:bg-[#c4a24d]/30 transition-colors" data-testid="link-login">
            Sign In
          </a>
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

  return (
    <div className="min-h-screen bg-[#0d1e2d]">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }}>
          <button onClick={() => navigate("/")} className="text-[#f0eeea]/40 hover:text-[#f0eeea]/70 font-['Lora',serif] text-sm mb-8 block transition-colors" data-testid="link-back-home">
            &larr; Back to Home
          </button>

          <h1 className="font-['Cormorant_Garamond',serif] text-4xl md:text-5xl text-[#f0eeea] font-light tracking-wide mb-2" data-testid="text-eic-title">
            Editor-in-Chief
          </h1>
          <p className="text-[#f0eeea]/50 font-['Lora',serif] text-sm mb-12">
            Manage your editorial team
          </p>
        </motion.div>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 0.1 }} className="mb-16">
          <h2 className="font-['Cormorant_Garamond',serif] text-2xl text-[#f0eeea]/90 font-light mb-6">
            Invite an Editor
          </h2>
          <div className="flex gap-3">
            <input
              type="email"
              placeholder="editor@email.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1 bg-[#f0eeea]/5 border border-[#f0eeea]/10 rounded px-4 py-3 text-[#f0eeea] font-['Lora',serif] text-sm placeholder:text-[#f0eeea]/30 focus:outline-none focus:border-[#c4a24d]/40 transition-colors"
              data-testid="input-invite-email"
              onKeyDown={(e) => {
                if (e.key === "Enter" && inviteEmail.trim()) {
                  inviteMutation.mutate(inviteEmail.trim());
                }
              }}
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
          {inviteMutation.isError && (
            <p className="text-red-400/80 text-sm mt-2 font-['Lora',serif]">Failed to send invitation. Please try again.</p>
          )}
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 0.2 }} className="mb-16">
          <h2 className="font-['Cormorant_Garamond',serif] text-2xl text-[#f0eeea]/90 font-light mb-6">
            Current Editors
          </h2>
          {editorsLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 bg-[#f0eeea]/5 rounded animate-pulse" />
              ))}
            </div>
          ) : editors.length === 0 ? (
            <p className="text-[#f0eeea]/40 font-['Lora',serif] text-sm italic">No editors yet. Send your first invitation above.</p>
          ) : (
            <div className="space-y-2">
              {editors.map((editor) => (
                <div key={editor.id} className="flex items-center justify-between px-5 py-4 bg-[#f0eeea]/[0.03] border border-[#f0eeea]/[0.06] rounded" data-testid={`editor-row-${editor.id}`}>
                  <div>
                    <span className="text-[#f0eeea]/90 font-['Cormorant_Garamond',serif] text-lg">
                      {editor.firstName || "—"} {editor.lastName || ""}
                    </span>
                    {editor.email && (
                      <span className="text-[#f0eeea]/40 font-['Lora',serif] text-xs ml-3">{editor.email}</span>
                    )}
                  </div>
                  <span className={`text-xs font-['Space_Mono',monospace] uppercase tracking-wider ${editor.role === "editor_in_chief" ? "text-[#c4a24d]" : "text-[#5eb5a0]"}`}>
                    {editor.role === "editor_in_chief" ? "Editor-in-Chief" : "Editor"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 0.3 }}>
          <h2 className="font-['Cormorant_Garamond',serif] text-2xl text-[#f0eeea]/90 font-light mb-6">
            Invitations
          </h2>
          {invLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-[#f0eeea]/5 rounded animate-pulse" />
              ))}
            </div>
          ) : invitations.length === 0 ? (
            <p className="text-[#f0eeea]/40 font-['Lora',serif] text-sm italic">No invitations sent yet.</p>
          ) : (
            <div className="space-y-6">
              {pendingInvitations.length > 0 && (
                <div>
                  <h3 className="text-[#c4a24d]/70 font-['Space_Mono',monospace] text-xs uppercase tracking-widest mb-3">Pending</h3>
                  <div className="space-y-2">
                    {pendingInvitations.map((inv) => (
                      <InvitationCard key={inv.id} invitation={inv} onCopy={copyLink} copiedToken={copiedToken} getLink={getInvitationLink} />
                    ))}
                  </div>
                </div>
              )}
              {acceptedInvitations.length > 0 && (
                <div>
                  <h3 className="text-[#5eb5a0]/70 font-['Space_Mono',monospace] text-xs uppercase tracking-widest mb-3">Accepted</h3>
                  <div className="space-y-2">
                    {acceptedInvitations.map((inv) => (
                      <InvitationCard key={inv.id} invitation={inv} onCopy={copyLink} copiedToken={copiedToken} getLink={getInvitationLink} />
                    ))}
                  </div>
                </div>
              )}
              {expiredInvitations.length > 0 && (
                <div>
                  <h3 className="text-[#f0eeea]/30 font-['Space_Mono',monospace] text-xs uppercase tracking-widest mb-3">Expired</h3>
                  <div className="space-y-2">
                    {expiredInvitations.map((inv) => (
                      <InvitationCard key={inv.id} invitation={inv} onCopy={copyLink} copiedToken={copiedToken} getLink={getInvitationLink} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.section>
      </div>
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
          {isExpired && (
            <span className="text-[#f0eeea]/30 font-['Space_Mono',monospace] text-xs">Expired</span>
          )}
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
