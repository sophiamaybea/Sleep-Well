import { useState } from "react";
import { useWeave, useAddStanza, useHarvestWeave } from "@/hooks/usePoemWeaving";
import { useAuth } from "@/hooks/use-auth";

interface Props {
  weaveId: string;
}

export function PoemWeaveRoom({ weaveId }: Props) {
  const { data, isPending } = useWeave(weaveId);
  const { data: user } = useAuth();
  const addStanza = useAddStanza(weaveId);
  const harvestWeave = useHarvestWeave(weaveId);
  const [draft, setDraft] = useState("");

  if (isPending) return <div className="text-sm text-muted-foreground">Loading weave…</div>;
  if (!data) return null;

  const { weave, stanzas, invitations } = data as any;
  const isInitiator = weave.initiatorId === user?.id;
  const isOpen = weave.status === "open";
  const myInvite = invitations?.find((i: any) => i.userId === user?.id);
  const canContribute = isOpen && myInvite?.status === "accepted";

  const handleAddStanza = async () => {
    if (!draft.trim()) return;
    await addStanza.mutateAsync(draft);
    setDraft("");
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-8">
      <div>
        <h1 className="text-2xl font-serif">{weave.title}</h1>
        {weave.prompt && <p className="text-sm text-muted-foreground italic mt-1">{weave.prompt}</p>}
        <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
          <span>Form: {weave.form}</span>
          <span>·</span>
          <span>Status: {weave.status}</span>
          <span>·</span>
          <span>{stanzas?.length ?? 0} stanzas</span>
        </div>
      </div>

      <div className="space-y-4 border-l-2 border-border pl-4">
        {stanzas?.length === 0 && (
          <p className="text-sm text-muted-foreground italic">The poem is waiting for its first voice…</p>
        )}
        {stanzas?.map((stanza: any) => (
          <div key={stanza.id} className="group">
            <p className="font-serif text-base leading-relaxed whitespace-pre-wrap">{stanza.content}</p>
            <p className="text-xs text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {stanza.authorId === user?.id ? "— you" : "— a co-weaver"} · verse {stanza.turnOrder}
            </p>
          </div>
        ))}
      </div>

      {canContribute && (
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Add your stanza</label>
          <textarea
            className="w-full min-h-[120px] p-3 border rounded-md font-serif text-sm resize-none"
            placeholder="Continue the poem…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <button
            onClick={handleAddStanza}
            disabled={addStanza.isPending || !draft.trim()}
            className="px-4 py-2 bg-foreground text-background text-sm rounded-md disabled:opacity-40"
          >
            {addStanza.isPending ? "Planting…" : "Add to weave"}
          </button>
        </div>
      )}

      {isInitiator && weave.status === "closed" && !weave.writingId && (
        <div className="pt-4 border-t space-y-2">
          <p className="text-sm text-muted-foreground">
            The weave is closed. Harvest it to bring it into your Garden as a collaborative poem.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => harvestWeave.mutate("circle")}
              className="px-4 py-2 border text-sm rounded-md"
            >
              Harvest to Circle
            </button>
            <button
              onClick={() => harvestWeave.mutate("garden")}
              className="px-4 py-2 bg-foreground text-background text-sm rounded-md"
            >
              Harvest to Garden
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
