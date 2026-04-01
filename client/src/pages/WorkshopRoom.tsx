import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import WorkshopSessionCard from "@/components/WorkshopSessionCard";
import WorkshopPaywall from "@/components/WorkshopPaywall";
import { useAuth } from "@/hooks/useAuth";

export default function WorkshopRoom() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [activeSession, setActiveSession] = useState<string | null>(null);

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["/api/workshop/sessions"],
    queryFn: () => apiRequest("/api/workshop/sessions"),
  });

  const { data: sessionDetail } = useQuery({
    queryKey: ["/api/workshop/sessions", activeSession],
    queryFn: () => apiRequest(`/api/workshop/sessions/${activeSession}`),
    enabled: !!activeSession,
  });

  const { data: exercises } = useQuery({
    queryKey: ["/api/workshop/sessions", activeSession, "exercises"],
    queryFn: () => apiRequest(`/api/workshop/sessions/${activeSession}/exercises`),
    enabled: !!activeSession,
  });

  const joinMutation = useMutation({
    mutationFn: (sessionId: string) =>
      apiRequest(`/api/workshop/sessions/${sessionId}/join`, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/workshop/sessions", activeSession] });
    },
  });

  const isFree = user?.tier === "free";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground text-sm italic">Opening the workshop…</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-serif text-3xl text-foreground mb-2">The Workshop Room</h1>
        <p className="text-muted-foreground text-sm max-w-prose">
          A quiet room for writing together. Each session is led by an editor or guest facilitator —
          a theme, a set of exercises, and time to write.
        </p>
        {isFree && (
          <div className="mt-4 p-3 rounded-md border border-gold/30 bg-gold/5 text-sm text-muted-foreground">
            Free members may join one session per month and preview the first two exercises of any
            session.{" "}
            <a href="/cultivator" className="underline text-foreground">
              Upgrade to Cultivator
            </a>{" "}
            for full access.
          </div>
        )}
      </div>

      {/* Session list */}
      {!activeSession && (
        <div className="space-y-4">
          {sessions.length === 0 && (
            <p className="text-muted-foreground italic text-sm">No sessions scheduled yet. Check back soon.</p>
          )}
          {sessions.map((session: any) => (
            <WorkshopSessionCard
              key={session.id}
              session={session}
              onOpen={() => setActiveSession(session.id)}
            />
          ))}
        </div>
      )}

      {/* Session detail */}
      {activeSession && sessionDetail && (
        <div>
          <button
            onClick={() => setActiveSession(null)}
            className="text-sm text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1"
          >
            ← All sessions
          </button>

          <div className="mb-6">
            <h2 className="font-serif text-2xl mb-1">{sessionDetail.title}</h2>
            {sessionDetail.theme && (
              <p className="text-sm uppercase tracking-widest text-muted-foreground mb-2">
                {sessionDetail.theme}
              </p>
            )}
            <p className="text-sm text-muted-foreground">{sessionDetail.description}</p>
          </div>

          {/* Join / joined status */}
          <div className="mb-8">
            {sessionDetail.hasJoined ? (
              <span className="text-sm text-green-600 italic">You're in this session</span>
            ) : (
              <button
                onClick={() => joinMutation.mutate(activeSession)}
                disabled={joinMutation.isPending}
                className="px-5 py-2 bg-foreground text-background text-sm rounded hover:opacity-80 transition"
              >
                {joinMutation.isPending ? "Joining…" : "Join session"}
              </button>
            )}
            {joinMutation.error && (
              <p className="text-sm text-red-500 mt-2">
                {(joinMutation.error as any)?.message ?? "Something went wrong"}
              </p>
            )}
          </div>

          {/* Exercises */}
          {exercises && (
            <WorkshopExercisePanel
              exercises={exercises.exercises}
              gated={exercises.gated}
              total={exercises.total}
              sessionId={activeSession}
              tier={user?.tier ?? "free"}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ── Exercise panel (inline sub-component) ────────────────────────
function WorkshopExercisePanel({
  exercises,
  gated,
  total,
  sessionId,
  tier,
}: {
  exercises: any[];
  gated: boolean;
  total: number;
  sessionId: string;
  tier: string;
}) {
  const qc = useQueryClient();
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [saved, setSaved] = useState(false);

  const respondMutation = useMutation({
    mutationFn: ({ exerciseId, content }: { exerciseId: string; content: string }) =>
      apiRequest(`/api/workshop/sessions/${sessionId}/respond`, {
        method: "POST",
        body: JSON.stringify({ exerciseId, content }),
      }),
    onSuccess: () => {
      setSaved(true);
      qc.invalidateQueries({ queryKey: ["/api/workshop/sessions", sessionId, "my-responses"] });
    },
  });

  return (
    <div>
      <h3 className="font-serif text-lg mb-4">Exercises</h3>
      <div className="space-y-3">
        {exercises.map((ex: any, i: number) => (
          <div key={ex.id} className="border border-border rounded-md p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  Exercise {i + 1}
                </p>
                <h4 className="font-medium">{ex.title}</h4>
                {activeExercise === ex.id && (
                  <p className="text-sm text-muted-foreground mt-2 max-w-prose">{ex.prompt}</p>
                )}
              </div>
              <button
                onClick={() => {
                  setActiveExercise(activeExercise === ex.id ? null : ex.id);
                  setDraft("");
                  setSaved(false);
                }}
                className="text-xs text-muted-foreground underline ml-4"
              >
                {activeExercise === ex.id ? "Close" : "Open"}
              </button>
            </div>

            {activeExercise === ex.id && (
              <div className="mt-4">
                {tier === "free" ? (
                  <WorkshopPaywall />
                ) : (
                  <>
                    <textarea
                      className="w-full min-h-[160px] bg-background border border-border rounded p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-gold"
                      placeholder="Write here…"
                      value={draft}
                      onChange={(e) => {
                        setDraft(e.target.value);
                        setSaved(false);
                      }}
                    />
                    <div className="flex gap-3 mt-2">
                      <button
                        onClick={() =>
                          respondMutation.mutate({ exerciseId: ex.id, content: draft })
                        }
                        disabled={respondMutation.isPending || !draft.trim()}
                        className="px-4 py-1.5 text-xs bg-foreground text-background rounded hover:opacity-80"
                      >
                        {respondMutation.isPending ? "Saving…" : "Save response"}
                      </button>
                      {saved && (
                        <span className="text-xs text-green-600 self-center">Saved ✓</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Paywall for remaining gated exercises */}
        {gated && (
          <div className="border border-dashed border-gold/40 rounded-md p-6 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              {total - exercises.length} more exercise{total - exercises.length !== 1 ? "s" : ""} in this session
            </p>
            <WorkshopPaywall inline />
          </div>
        )}
      </div>
    </div>
  );
}
