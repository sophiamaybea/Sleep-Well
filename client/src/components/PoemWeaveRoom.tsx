import { useState } from "react";
import {
  useWeave,
  useAddStanza,
  useHarvestWeave,
  useInviteToWeave,
  useRespondToInvitation,
} from "@/hooks/use-poem-weaving";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface Props {
  weaveId: string;
}

const FORM_LABELS: Record<string, string> = {
  free: "Free verse",
  renga: "Renga",
  call_and_response: "Call & Response",
  cento: "Cento",
};

const API = "/api";

function useCloseWeave(weaveId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API}/weaves/${weaveId}/close`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to close weave");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["weave", weaveId] }),
  });
}

export function PoemWeaveRoom({ weaveId }: Props) {
  const { data, isPending } = useWeave(weaveId);
    const { user } = useAuth();
  const addStanza = useAddStanza(weaveId);
  const harvestWeave = useHarvestWeave(weaveId);
  const invitePoet = useInviteToWeave(weaveId);
  const respondToInvite = useRespondToInvitation();
  const closeWeave = useCloseWeave(weaveId);

  const [draft, setDraft] = useState("");
  const [inviteeId, setInviteeId] = useState("");
  const [showInviteForm, setShowInviteForm] = useState(false);

  if (isPending)
    return (
      <div className="text-sm text-muted-foreground py-12 text-center">
        Loading weave…
      </div>
    );
  if (!data) return null;

  const { weave, stanzas, invitations } = data as any;
  const isInitiator = weave.initiatorId === user?.id;
  const isOpen = weave.status === "open";
  const isClosed = weave.status === "closed";
  const isPublished = weave.status === "published";
  const myInvite = invitations?.find((i: any) => i.userId === user?.id);
  const pendingInvites = invitations?.filter(
    (i: any) => i.userId === user?.id && i.status === "pending"
  );
  const canContribute = isOpen && myInvite?.status === "accepted";
  const contributorCount = new Set(stanzas?.map((s: any) => s.authorId)).size;

  const handleAddStanza = async () => {
    if (!draft.trim()) return;
    await addStanza.mutateAsync(draft);
    setDraft("");
  };

  const handleInvite = async () => {
    if (!inviteeId.trim()) return;
    await invitePoet.mutateAsync(inviteeId.trim());
    setInviteeId("");
    setShowInviteForm(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif">{weave.title}</h1>
        {weave.prompt && (
          <p className="text-sm text-muted-foreground italic mt-1">
            {weave.prompt}
          </p>
        )}
        <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
          <span>{FORM_LABELS[weave.form] ?? weave.form}</span>
          <span>·</span>
          <span
            className={
              isOpen
                ? "text-green-600"
                : isPublished
                  ? "text-blue-600"
                  : "text-muted-foreground"
            }
          >
            {weave.status}
          </span>
          <span>·</span>
          <span>{stanzas?.length ?? 0} stanzas</span>
          <span>·</span>
          <span>{contributorCount} poet{contributorCount !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Pending invitation banner for current user */}
      {pendingInvites?.length > 0 &&
        pendingInvites.map((inv: any) => (
          <div
            key={inv.id}
            className="p-4 border border-border rounded-lg bg-muted/30 flex items-center justify-between gap-4"
          >
            <p className="text-sm font-serif">
              You’ve been invited to collaborate on this weave.
            </p>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() =>
                  respondToInvite.mutate({
                    invitationId: inv.id,
                    status: "accepted",
                  })
                }
                className="px-3 py-1.5 bg-foreground text-background text-xs rounded-md"
              >
                Accept
              </button>
              <button
                onClick={() =>
                  respondToInvite.mutate({
                    invitationId: inv.id,
                    status: "declined",
                  })
                }
                className="px-3 py-1.5 border text-xs rounded-md"
              >
                Decline
              </button>
            </div>
          </div>
        ))}

      {/* Stanzas */}
      <div className="space-y-6 border-l-2 border-border pl-5">
        {stanzas?.length === 0 && (
          <p className="text-sm text-muted-foreground italic">
            The poem is waiting for its first voice…
          </p>
        )}
        {stanzas?.map((stanza: any) => (
          <div key={stanza.id} className="group">
            <p className="font-serif text-base leading-relaxed whitespace-pre-wrap">
              {stanza.content}
            </p>
            <p className="text-xs text-muted-foreground mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {stanza.authorId === user?.id ? "— you" : "— a co-weaver"} · verse{" "}
              {stanza.turnOrder}
            </p>
          </div>
        ))}
      </div>

      {/* Stanza input */}
      {canContribute && (
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-muted-foreground">
            Add your stanza
          </label>
          <textarea
            className="w-full min-h-[120px] p-3 border rounded-md font-serif text-sm resize-none focus:outline-none focus:ring-1 focus:ring-foreground"
            placeholder="Continue the poem…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <button
            onClick={handleAddStanza}
            disabled={addStanza.isPending || !draft.trim()}
            className="px-4 py-2 bg-foreground text-background text-sm rounded-md disabled:opacity-40 transition-opacity"
          >
            {addStanza.isPending ? "Planting…" : "Add to weave"}
          </button>
        </div>
      )}

      {/* Initiator controls */}
      {isInitiator && isOpen && (
        <div className="pt-4 border-t space-y-4">
          {/* Invite a poet */}
          <div>
            {!showInviteForm ? (
              <button
                onClick={() => setShowInviteForm(true)}
                className="text-sm underline underline-offset-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                + Invite a poet
              </button>
            ) : (
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Poet’s user ID
                </label>
                <input
                  type="text"
                  value={inviteeId}
                  onChange={(e) => setInviteeId(e.target.value)}
                  placeholder="user-id…"
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleInvite}
                    disabled={invitePoet.isPending || !inviteeId.trim()}
                    className="px-4 py-2 bg-foreground text-background text-sm rounded-md disabled:opacity-40"
                  >
                    {invitePoet.isPending ? "Sending…" : "Send invitation"}
                  </button>
                  <button
                    onClick={() => {
                      setShowInviteForm(false);
                      setInviteeId("");
                    }}
                    className="px-4 py-2 border text-sm rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Close the weave */}
          <button
            onClick={() => closeWeave.mutate()}
            disabled={closeWeave.isPending}
            className="text-sm text-muted-foreground border border-border rounded-md px-3 py-1.5 hover:text-foreground transition-colors disabled:opacity-40"
          >
            {closeWeave.isPending ? "Closing…" : "Close weave to new stanzas"}
          </button>
        </div>
      )}

      {/* Harvest controls */}
      {isInitiator && isClosed && !weave.writingId && (
        <div className="pt-4 border-t space-y-3">
          <p className="text-sm text-muted-foreground">
            The weave is closed. Harvest it to bring it into your Garden as a
            collaborative poem.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => harvestWeave.mutate("circle")}
              disabled={harvestWeave.isPending}
              className="px-4 py-2 border text-sm rounded-md disabled:opacity-40"
            >
              Harvest to Circle
            </button>
            <button
              onClick={() => harvestWeave.mutate("garden")}
              disabled={harvestWeave.isPending}
              className="px-4 py-2 bg-foreground text-background text-sm rounded-md disabled:opacity-40"
            >
              {harvestWeave.isPending ? "Harvesting…" : "Harvest to Garden"}
            </button>
          </div>
        </div>
      )}

      {/* Published state */}
      {isPublished && weave.writingId && (
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            This weave has been harvested and lives in the Garden.{" "}
            <a
              href={`/piece/${weave.writingId}`}
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              Read the full poem →
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
